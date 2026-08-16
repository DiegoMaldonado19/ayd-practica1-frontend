import Chip from "@mui/material/Chip";
import type { MemberStatus } from "@/modules/members/types";

const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  WITHDRAWN: "Retirado",
};

const MEMBER_STATUS_COLOR: Record<MemberStatus, "success" | "default" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  WITHDRAWN: "error",
};

export function MemberStatusChip({
  status,
  size = "small",
}: {
  status: MemberStatus;
  size?: "small" | "medium";
}) {
  return (
    <Chip label={MEMBER_STATUS_LABEL[status]} color={MEMBER_STATUS_COLOR[status]} size={size} />
  );
}