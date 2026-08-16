import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { ArrowBack, Save } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { createUser } from "@/modules/auth/services";
import { useUsers } from "@/modules/auth/hooks";
import { useCreateEmployee, useEmployee, useUpdateEmployee } from "@/modules/employees/hooks";
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from "@/modules/employees/types";
import type { DocumentType, Gender } from "@/modules/members/types";
import {
  employeeFormSchema,
  formatPhone,
  generateAlphanumericPassword,
  type EmployeeFormValues,
} from "@/modules/employees/employeeFormSchema";
import {
  IdentificationSection,
  PersonalInfoSection,
  LaboralSection,
  EmployeeAccountAccessFields,
} from "@/modules/employees/components/EmployeeFormSections";

export function EmployeeFormPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const isEdit = Boolean(employeeId);
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  const { data: employee, isLoading } = useEmployee(isEdit ? Number(employeeId) : undefined);
  const createMut = useCreateEmployee();
  const updateMut = useUpdateEmployee(Number(employeeId));

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const personId = employee?.person.person_id;

  const { data: usersData } = useUsers({ page: 0, size: 100 }, isEdit && isAdmin && Boolean(personId));
  const existingAccount = usersData?.content.find((u) => u.person_id === personId);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: yupResolver(employeeFormSchema),
    defaultValues: {
      document_type: "DPI", document_number: "", first_name: "", last_name: "",
      gender: "M", birth_date: "", email: "", phone: "", address: "",
      position: "RECEPTIONIST", hired_on: "", max_member_load: 20, bio: "",
      username: "", password: "", confirm_password: "",
    },
  });

  const position = useWatch({ control, name: "position" });
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
      phone: formatPhone(employee.person.phone ?? ""),
      address: employee.person.address || "",
      position: employee.position,
      hired_on: employee.hired_on,
      max_member_load: 20,
      bio: "",
      username: "",
      password: "",
      confirm_password: "",
    });
  }, [employee, reset]);

  const handleGeneratePassword = () => {
    const newPass = generateAlphanumericPassword(12);
    setValue("password", newPass, { shouldValidate: true });
    setValue("confirm_password", newPass, { shouldValidate: true });
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    const person = {
      document_type: values.document_type as DocumentType,
      document_number: values.document_number,
      first_name: values.first_name,
      last_name: values.last_name,
      gender: (values.gender as Gender | undefined) || undefined,
      birth_date: values.birth_date || undefined,
      email: values.email || undefined,
      phone: values.phone?.replace(/\D/g, "") || undefined,
      address: values.address || undefined,
    };

    if (isEdit) {
      const p: UpdateEmployeeDTO = { person, hired_on: values.hired_on };
      try {
        const updatedEmployee = await updateMut.mutateAsync(p);

        if (!existingAccount && values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: updatedEmployee.person.person_id,
              username: values.username,
              password: values.password,
              role: values.position,
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userErr: unknown) {
            enqueueSnackbar(
              "Datos actualizados, pero ocurrió un problema al crear la cuenta: " + getErrorMessage(userErr),
              { variant: "warning", persist: true },
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }

        navigate(`/employees/${employeeId}`);
      } catch {
        // El error de actualización ya es mostrado por la mutación.
      }
    } else {
      const p: CreateEmployeeDTO = {
        person,
        position: values.position,
        hired_on: values.hired_on,
        ...(isTrainer && {
          max_member_load: values.max_member_load,
          bio: values.bio || undefined,
        }),
      };

      try {
        const createdEmployee = await createMut.mutateAsync(p);

        if (values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: createdEmployee.person.person_id,
              username: values.username,
              password: values.password,
              role: values.position,
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userErr: unknown) {
            enqueueSnackbar(
              "Empleado creado, pero ocurrió un problema al crear la cuenta: " + getErrorMessage(userErr),
              { variant: "warning", persist: true }
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }
        navigate(`/employees/${createdEmployee.employee_id}`);
      } catch {
        // Error capturado por la mutación de React Query
      }
    }
  };

  if (isEdit && isLoading) {
    return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  }

  const saving = createMut.isPending || updateMut.isPending || isSubmittingAccount;
  const cancel = () => navigate(isEdit ? `/employees/${employeeId}` : "/employees");
  const sectionProps = { control, errors };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={cancel} sx={{ mb: 1 }}>Volver</Button>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? "Editar empleado" : "Registrar nuevo empleado"}
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <IdentificationSection {...sectionProps} />

            <Divider sx={{ my: 2 }} />
            <PersonalInfoSection {...sectionProps} />

            <Divider sx={{ my: 2 }} />
            <EmployeeAccountAccessFields
              {...sectionProps}
              isEdit={isEdit}
              existingAccount={existingAccount}
              onGeneratePassword={handleGeneratePassword}
            />

            <Divider sx={{ my: 2 }} />
            <LaboralSection {...sectionProps} isTrainer={isTrainer} isEdit={isEdit} />
          </Box>

          <Box
            sx={{
              display: "flex", justifyContent: "flex-end", gap: 1.5,
              p: { xs: 2, sm: 3 }, bgcolor: "grey.50", borderTop: 1, borderColor: "divider",
            }}
          >
            <Button onClick={cancel} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving} startIcon={<Save />}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}