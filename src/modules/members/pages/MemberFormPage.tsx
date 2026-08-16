import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { ArrowBack, Save } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { createUser } from "@/modules/auth/services";
import { useUsers } from "@/modules/auth/hooks";
import { useCreateMember, useMember, useUpdateMember } from "@/modules/members/hooks";
import type { CreateMemberDTO, UpdateMemberDTO } from "@/modules/members/types";
import {
  memberFormSchema,
  formatPhone,
  generateAlphanumericPassword,
  type MemberFormValues,
} from "@/modules/members/memberFormSchema";
import {
  IdentificationSection,
  PersonalInfoSection,
  EmergencyContactSection,
  NotesSection,
} from "@/modules/members/components/MemberFormSections";
import { MemberAccountAccessFields } from "@/modules/members/components/MemberAccountAccessFields";

export function MemberFormPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isEdit = Boolean(memberId);
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const { data: member, isLoading } = useMember(isEdit ? Number(memberId) : undefined);
  const createMut = useCreateMember();
  const updateMut = useUpdateMember(Number(memberId));

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const personId = member?.person.person_id;

  const { data: usersData } = useUsers({ page: 0, size: 100 }, isEdit && isAdmin && Boolean(personId));
  const existingAccount = usersData?.content.find((u) => u.person_id === personId);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<MemberFormValues>({
    resolver: yupResolver(memberFormSchema),
    defaultValues: {
      document_type: "DPI", document_number: "", first_name: "", last_name: "",
      gender: "M", birth_date: "", email: "", phone: "", address: "",
      emergency_contact_name: "", emergency_contact_phone: "", notes: "",
      username: "", password: "", confirm_password: "",
    },
  });

  useEffect(() => {
    if (!member) return;
    reset({
      document_type: member.person.document_type,
      document_number: member.person.document_number,
      first_name: member.person.first_name,
      last_name: member.person.last_name,
      gender: member.person.gender,
      birth_date: member.person.birth_date ?? "",
      email: member.person.email ?? "",
      phone: formatPhone(member.person.phone ?? ""),
      address: member.person.address ?? "",
      emergency_contact_name: member.emergency_contact_name ?? "",
      emergency_contact_phone: formatPhone(member.emergency_contact_phone ?? ""),
      notes: member.notes ?? "",
      username: "",
      password: "",
      confirm_password: "",
    });
  }, [member, reset]);

  const handleGeneratePassword = () => {
    const password = generateAlphanumericPassword();
    setValue("password", password, { shouldValidate: true });
    setValue("confirm_password", password, { shouldValidate: true });
  };

  const onSubmit = async (values: MemberFormValues) => {
    const person = {
      document_type: values.document_type,
      document_number: values.document_number,
      first_name: values.first_name,
      last_name: values.last_name,
      gender: values.gender,
      birth_date: values.birth_date,
      email: values.email || undefined,
      phone: values.phone?.replace(/\D/g, "") || undefined,
      address: values.address || undefined,
    };
    const extra = {
      emergency_contact_name: values.emergency_contact_name || undefined,
      emergency_contact_phone: values.emergency_contact_phone?.replace(/\D/g, "") || undefined,
      notes: values.notes || undefined,
    };
    if (isEdit) {
      const p: UpdateMemberDTO = { person, ...extra };
      try {
        const updatedMember = await updateMut.mutateAsync(p);

        if (!existingAccount && values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: updatedMember.person.person_id,
              username: values.username,
              password: values.password,
              role: "MEMBER",
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userError: unknown) {
            enqueueSnackbar(
              `Datos actualizados, pero ocurrió un problema al crear la cuenta: ${getErrorMessage(userError)}`,
              { variant: "warning", persist: true },
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }

        navigate(`/members/${memberId}`);
      } catch {
        // El error de actualización ya es mostrado por la mutación.
      }
    } else {
      const p: CreateMemberDTO = { person, ...extra };
      try {
        const createdMember = await createMut.mutateAsync(p);

        if (values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: createdMember.person.person_id,
              username: values.username,
              password: values.password,
              role: "MEMBER",
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userError: unknown) {
            enqueueSnackbar(
              `Socio creado, pero ocurrió un problema al crear la cuenta: ${getErrorMessage(userError)}`,
              { variant: "warning", persist: true },
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }

        navigate(`/members/${createdMember.member_id}`);
      } catch {
        // La mutación muestra el error del backend mediante su callback configurado.
      }
    }
  };

  if (isEdit && isLoading) {
    return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  }

  const saving = createMut.isPending || updateMut.isPending || isSubmittingAccount;
  const cancel = () => navigate(isEdit ? `/members/${memberId}` : "/members");
  const sectionProps = { control, errors };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={cancel} sx={{ mb: 1 }}>Volver</Button>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? "Editar socio" : "Registrar nuevo socio"}
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <IdentificationSection {...sectionProps} />

            <Divider sx={{ my: 2 }} />
            <PersonalInfoSection {...sectionProps} />

            <Divider sx={{ my: 2 }} />
            <MemberAccountAccessFields
              {...sectionProps}
              isEdit={isEdit}
              existingAccount={existingAccount}
              onGeneratePassword={handleGeneratePassword}
            />

            <Divider sx={{ my: 2 }} />
            <EmergencyContactSection {...sectionProps} />

            <Divider sx={{ my: 2 }} />
            <NotesSection {...sectionProps} />
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