import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
//import ArrowBackIcon from "@mui/icons-material/ArrowBack";
//import SaveIcon from "@mui/icons-material/Save";
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
  useCreateMember,
  useMember,
  useUpdateMember,
} from "@/modules/members/hooks";
import type { CreateMemberDTO, DocumentType } from "@/modules/members/types";

const schema = yup.object({
  document_type: yup.mixed<DocumentType>().oneOf(["DPI", "PASSPORT", "NIT"]).required("Selecciona el tipo de documento"),
  document_number: yup.string().required("El número de documento es requerido"),
  first_name: yup.string().required("El nombre es requerido"),
  last_name: yup.string().required("El apellido es requerido"),
  gender: yup.string().required("Selecciona el género"),
  birth_date: yup.string().required("La fecha de nacimiento es requerida"),
  email: yup.string().email("Correo inválido").optional(),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  emergency_contact_name: yup.string().optional(),
  emergency_contact_phone: yup.string().optional(),
});

type FormValues = yup.InferType<typeof schema>;


const sectionTitleSx = { fontWeight: 600, mb: 0.5 };
const sectionDescriptionSx = { color: "text.secondary", mb: 2.5 };

export function MemberFormPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isEdit = Boolean(memberId);
  const { data: member, isLoading: isLoadingMember } = useMember(isEdit ? Number(memberId) : undefined);
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember(Number(memberId));
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: "DPI", document_number: "", first_name: "", last_name: "", gender: "",
      birth_date: "", email: "", phone: "", address: "", emergency_contact_name: "", emergency_contact_phone: "",
    },
  });

  useEffect(() => {
    if (!member) return;
    reset({
      document_type: member.person.document_type, document_number: member.person.document_number,
      first_name: member.person.first_name, last_name: member.person.last_name, gender: member.person.gender,
      birth_date: member.person.birth_date ?? "", email: member.person.email ?? "", phone: member.person.phone ?? "",
      address: member.person.address ?? "", emergency_contact_name: member.emergency_contact_name ?? "",
      emergency_contact_phone: member.emergency_contact_phone ?? "",
    });
  }, [member, reset]);

  const onSubmit = (values: FormValues) => {
    const payload: CreateMemberDTO = {
      person: {

        document_type: values.document_type, document_number: values.document_number,
        first_name: values.first_name, last_name: values.last_name, gender: values.gender, birth_date: values.birth_date,
        email: values.email || undefined, phone: values.phone || undefined, address: values.address || undefined,

      },
      emergency_contact_name: values.emergency_contact_name || undefined,
      emergency_contact_phone: values.emergency_contact_phone || undefined,
    };
    if (isEdit) updateMutation.mutate(payload, { onSuccess: () => navigate(`/members/${memberId}`) });
    else createMutation.mutate(payload, { onSuccess: (created) => navigate(`/members/${created.member_id}`) });
  };

  if (isEdit && isLoadingMember) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const cancel = () => navigate(isEdit ? `/members/${memberId}` : "/members");

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button onClick={cancel} sx={{ mb: 1 }}>Volver</Button>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>{isEdit ? "Editar socio" : "Registrar nuevo socio"}</Typography>
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" sx={sectionTitleSx}>Identificación</Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>Datos necesarios para identificar al socio.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}><Controller name="document_type" control={control} render={({ field }) => <TextField {...field} select label="Tipo de documento" fullWidth error={!!errors.document_type} helperText={errors.document_type?.message}><MenuItem value="DPI">DPI</MenuItem><MenuItem value="PASSPORT">Pasaporte</MenuItem><MenuItem value="NIT">NIT</MenuItem></TextField>} /></Grid>
              <Grid item xs={12} sm={8}><Controller name="document_number" control={control} render={({ field }) => <TextField {...field} label="Número de documento" fullWidth error={!!errors.document_number} helperText={errors.document_number?.message} />} /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={sectionTitleSx}>Información personal</Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>Ingresa los datos de contacto y nacimiento.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><Controller name="first_name" control={control} render={({ field }) => <TextField {...field} label="Nombre" fullWidth error={!!errors.first_name} helperText={errors.first_name?.message} />} /></Grid>
              <Grid item xs={12} sm={6}><Controller name="last_name" control={control} render={({ field }) => <TextField {...field} label="Apellido" fullWidth error={!!errors.last_name} helperText={errors.last_name?.message} />} /></Grid>
              <Grid item xs={12} sm={5}><Controller name="gender" control={control} render={({ field }) => <TextField {...field} select label="Género" fullWidth error={!!errors.gender} helperText={errors.gender?.message}><MenuItem value="M">Masculino</MenuItem><MenuItem value="F">Femenino</MenuItem><MenuItem value="OTHER">Otro</MenuItem></TextField>} /></Grid>
              <Grid item xs={12} sm={7}><Controller name="birth_date" control={control} render={({ field }) => <TextField {...field} type="date" label="Fecha de nacimiento" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.birth_date} helperText={errors.birth_date?.message} />} /></Grid>
              <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} type="email" label="Correo electrónico" fullWidth error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
              <Grid item xs={12} sm={6}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Teléfono" fullWidth />} /></Grid>
              <Grid item xs={12}><Controller name="address" control={control} render={({ field }) => <TextField {...field} label="Dirección" fullWidth />} /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={sectionTitleSx}>Contacto de emergencia</Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>Persona a contactar en caso de emergencia.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><Controller name="emergency_contact_name" control={control} render={({ field }) => <TextField {...field} label="Nombre completo" fullWidth />} /></Grid>
              <Grid item xs={12} sm={6}><Controller name="emergency_contact_phone" control={control} render={({ field }) => <TextField {...field} label="Teléfono" fullWidth />} /></Grid>
            </Grid>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, p: { xs: 2, sm: 3 }, bgcolor: "grey.50", borderTop: 1, borderColor: "divider" }}>
            <Button onClick={cancel} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" variant="contained"disabled={isSaving}>  {isSaving ? "Guardando..." : "Guardar cambios"}</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

