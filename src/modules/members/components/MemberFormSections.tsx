import type { Control, FieldErrors } from "react-hook-form";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { MemberFormField } from "./MemberFormField";
import { formatPhone } from "@/modules/members/memberFormSchema";
import type { MemberFormValues } from "@/modules/members/memberFormSchema";

type SectionProps = {
  control: Control<MemberFormValues>;
  errors: FieldErrors<MemberFormValues>;
};

export function FormSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
        {description}
      </Typography>
    </>
  );
}

export function IdentificationSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Identificación" description="Datos necesarios para identificar al socio." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <MemberFormField control={control} errors={errors} name="document_type" label="Tipo de documento" select>
            <MenuItem value="DPI">DPI</MenuItem>
            <MenuItem value="PASSPORT">Pasaporte</MenuItem>
            <MenuItem value="NIT">NIT</MenuItem>
          </MemberFormField>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MemberFormField
            control={control}
            errors={errors}
            name="document_number"
            label="Número de documento"
            helperText="DPI: 13 dígitos · Pasaporte: 6 o 9 · NIT: 8 o 9"
          />
        </Grid>
      </Grid>
    </>
  );
}

export function PersonalInfoSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Información personal" description="Datos de contacto y nacimiento." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="first_name" label="Nombre" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="last_name" label="Apellido" />
        </Grid>
        <Grid item xs={12} sm={5}>
          <MemberFormField control={control} errors={errors} name="gender" label="Género" select>
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Femenino</MenuItem>
            <MenuItem value="OTHER">Otro</MenuItem>
          </MemberFormField>
        </Grid>
        <Grid item xs={12} sm={7}>
          <MemberFormField control={control} errors={errors} name="birth_date" label="Fecha de nacimiento" type="date" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="email" label="Correo electrónico" type="email" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="phone" label="Teléfono" onChange={formatPhone} helperText="Formato: ####-####" />
        </Grid>
        <Grid item xs={12}>
          <MemberFormField control={control} errors={errors} name="address" label="Dirección" />
        </Grid>
      </Grid>
    </>
  );
}

export function EmergencyContactSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Contacto de emergencia" description="Persona a contactar en caso de emergencia." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="emergency_contact_name" label="Nombre completo" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MemberFormField control={control} errors={errors} name="emergency_contact_phone" label="Teléfono" onChange={formatPhone} helperText="Formato: ####-####" />
        </Grid>
      </Grid>
    </>
  );
}

export function NotesSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Notas adicionales" description="Información adicional relevante sobre el socio." />
      <MemberFormField control={control} errors={errors} name="notes" label="Notas" multiline rows={4} />
    </>
  );
}