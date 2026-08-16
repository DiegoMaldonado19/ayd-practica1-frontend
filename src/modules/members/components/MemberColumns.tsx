import type { ColDef } from "ag-grid-community";
import type { Member } from "@/modules/members/types";
import { MemberStatusChip } from "./MemberStatusChip";

export function buildMembersColumns(): ColDef[] {
  return [
    { field: "member_code", headerName: "Código", width: 130 },
    {
      headerName: "Nombre",
      valueGetter: (p) => p.data?.person.full_name,
      flex: 1,
    },
    {
      headerName: "Documento",
      valueGetter: (p) => `${p.data?.person.document_type} ${p.data?.person.document_number}`,
      width: 180,
    },
    {
      headerName: "Correo",
      valueGetter: (p) => p.data?.person.email ?? "—",
      flex: 1,
    },
    { field: "joined_on", headerName: "Ingreso", width: 130 },
    {
      headerName: "Estado",
      width: 130,
      cellRenderer: (p: { data: Member }) => <MemberStatusChip status={p.data.status} />,
    },
  ];
}