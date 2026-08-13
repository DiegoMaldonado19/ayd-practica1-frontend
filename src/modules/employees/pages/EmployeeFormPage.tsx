import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowBack, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  useCreateEmployee,
  useEmployee,
  useUpdateEmployee,
} from "@/modules/employees/hooks";
import type {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  Position,
} from "@/modules/employees/types";
import type { DocumentType, Gender } from "@/modules/members/types";

const schema = yup.object({
  document_type: yup
    .mixed<DocumentType>()
    .oneOf(["DPI", "PASSPORT", "NIT"])
    .required("Selecciona el tipo de documento"),
  document_number: yup.string().required("El número de documento es requerido"),
  first_name: yup.string().required("El nombre es requerido"),
  last_name: yup.string().required("El apellido es requerido"),
  gender: yup.mixed<Gender>().oneOf(["M", "F", "OTHER"]).optional(),
  birth_date: yup.string().optional(),
  email: yup.string().email("Correo inválido").optional(),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  position: yup
    .mixed<Position>()
    .oneOf(["ADMIN", "RECEPTIONIST", "TRAINER"])
    .required("Selecciona el puesto"),
  hired_on: yup.string().required("La fecha de contratación es requerida"),
  max_member_load: yup
    .number()
    .positive("Debe ser un número positivo")
    .typeError("Debe ser un número")
    .when("position", {
      is: "TRAINER",
      then: (s) => s.required("La carga máxima es requerida para un entrenador"),
      otherwise: (s) => s.optional(),
    }),
  bio: yup.string().optional(),
});

type FormValues = yup.InferType<typeof schema>;

const sectionTitleSx = { fontWeight: 600, mb: 0.5 };
const sectionDescriptionSx = { color: "text.secondary", mb: 2.5 };

export function EmployeeFormPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const isEdit = Boolean(employeeId);
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(
    isEdit ? Number(employeeId) : undefined
  );
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(Number(employeeId));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: "DPI",
      document_number: "",
      first_name: "",
      last_name: "",
      gender: "M",
      birth_date: "",
      email: "",
      phone: "",
      address: "",
      position: "RECEPTIONIST",
      hired_on: "",
      max_member_load: 20,
      bio: "",
    },
  });

  // <-- USAMOS useWatch PASÁNDOLE EL CONTROL Y EL NOMBRE DEL CAMPO
  const position = useWatch({
    control,
    name: "position",
  });
  const isTrainer = position === "TRAINER";

  useEffect(() => {
    if (!employee) return;
    reset({
      document_type: employee.person.document_type,
      document_number: employee.person.document_number,
      first_name: employee.person.first_name,
      last_name: employee.person.last_name,
      gender: employee.person.gender,
      birth_date: employee.person.birth_date || "",
      email: employee.person.email || "",
      phone: employee.person.phone || "",
      address: employee.person.address || "",
      position: employee.position,
      hired_on: employee.hired_on,
      max_member_load: 20,
      bio: "",
    });
  }, [employee, reset]);

  const onSubmit = (values: FormValues) => {
    const personPayload = {
      document_type: values.document_type,
      document_number: values.document_number,
      first_name: values.first_name,
      last_name: values.last_name,
      gender: values.gender || undefined,
      birth_date: values.birth_date || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
    };

    if (isEdit) {
      const updatePayload: UpdateEmployeeDTO = {
        person: personPayload,
        hired_on: values.hired_on,
      };
      updateMutation.mutate(updatePayload, {
        onSuccess: () => navigate(`/employees/${employeeId}`),
      });
    } else {
      const createPayload: CreateEmployeeDTO = {
        person: personPayload,
        position: values.position,
        hired_on: values.hired_on,
        ...(isTrainer && {
          max_member_load: values.max_member_load,
          bio: values.bio || undefined,
        }),
      };
      createMutation.mutate(createPayload, {
        onSuccess: (created) => navigate(`/employees/${created.employee_id}`),
      });
    }
  };

  if (isEdit && isLoadingEmployee) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const cancel = () =>
    navigate(isEdit ? `/employees/${employeeId}` : "/employees");

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={cancel} sx={{ mb: 1 }}>
        Volver
      </Button>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? "Editar empleado" : "Registrar nuevo empleado"}
        </Typography>
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Identificación
            </Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>
              Datos necesarios para identificar al empleado.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="document_type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Tipo de documento"
                      fullWidth
                      error={!!errors.document_type}
                      helperText={errors.document_type?.message}
                    >
                      <MenuItem value="DPI">DPI</MenuItem>
                      <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                      <MenuItem value="NIT">NIT</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="document_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número de documento"
                      fullWidth
                      error={!!errors.document_number}
                      helperText={errors.document_number?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={sectionTitleSx}>
              Información personal
            </Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>
              Ingresa los datos de contacto y nacimiento.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Apellido"
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Género"
                      fullWidth
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
                    >
                      <MenuItem value="M">Masculino</MenuItem>
                      <MenuItem value="F">Femenino</MenuItem>
                      <MenuItem value="OTHER">Otro</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha de nacimiento"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birth_date}
                      helperText={errors.birth_date?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Correo electrónico"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Teléfono" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Dirección" fullWidth />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={sectionTitleSx}>
              Información laboral
            </Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>
              Datos del puesto y fecha de contratación.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Puesto"
                      fullWidth
                      error={!!errors.position}
                      helperText={errors.position?.message}
                      disabled={isEdit}
                    >
                      <MenuItem value="ADMIN">Administrador</MenuItem>
                      <MenuItem value="RECEPTIONIST">Recepcionista</MenuItem>
                      <MenuItem value="TRAINER">Entrenador</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="hired_on"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha de contratación"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.hired_on}
                      helperText={errors.hired_on?.message}
                    />
                  )}
                />
              </Grid>

              {isTrainer && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="max_member_load"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Carga máxima de socios"
                          fullWidth
                          error={!!errors.max_member_load}
                          helperText={errors.max_member_load?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Biografía / especialidad general"
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Ej: Especialista en fuerza y acondicionamiento..."
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              p: { xs: 2, sm: 3 },
              bgcolor: "grey.50",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button onClick={cancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              startIcon={<Save />}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}