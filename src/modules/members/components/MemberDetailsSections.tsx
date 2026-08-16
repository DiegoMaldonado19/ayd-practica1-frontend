import Grid from "@mui/material/Grid";
import type { Member } from "@/modules/members/types";
import { MemberInfoField } from "./MemberInfoField";

export function MemberPersonalData({ member }: { member: Member }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <MemberInfoField label="Código de socio" value={member.member_code} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MemberInfoField
          label="Documento"
          value={`${member.person.document_type} ${member.person.document_number}`}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MemberInfoField label="Fecha de ingreso" value={member.joined_on} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MemberInfoField label="Correo" value={member.person.email} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MemberInfoField label="Teléfono" value={member.person.phone} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MemberInfoField label="Fecha de nacimiento" value={member.person.birth_date} />
      </Grid>
      <Grid item xs={12}>
        <MemberInfoField label="Dirección" value={member.person.address} />
      </Grid>
    </Grid>
  );
}

export function MemberEmergencyContact({ member }: { member: Member }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <MemberInfoField label="Nombre" value={member.emergency_contact_name} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <MemberInfoField label="Teléfono" value={member.emergency_contact_phone} />
      </Grid>
    </Grid>
  );
}