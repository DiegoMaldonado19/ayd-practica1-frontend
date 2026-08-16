import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { usePayments } from "@/modules/billing/hooks";
import { useMembers } from "@/modules/members/hooks";
import type { PaymentMethod, PaymentStatus } from "@/modules/billing/types";
import {
  paymentConceptLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";
import { PaymentsFiltersBar } from "@/modules/billing/components/PaymentsFiltersBar";
import { PaymentsTable } from "@/modules/billing/components/PaymentsTable";
import { ListPagination } from "@/modules/billing/components/ListPagination";

const PAGE_SIZE = 12;

export function PaymentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePayments({ page: 0, size: 200 });
  const { data: membersData } = useMembers({ page: 0, size: 200 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => data?.content ?? [], [data]);

  const memberNameById = useMemo(() => {
    const map = new Map<number, string>();
    (membersData?.content ?? []).forEach((member) => {
      map.set(member.member_id, member.person.full_name);
    });
    return map;
  }, [membersData]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((payment) => {
      if (status && payment.status !== status) return false;
      if (method && payment.payment_method !== method) return false;
      if (!needle) return true;

      const memberName = payment.member_id
        ? memberNameById.get(payment.member_id) ?? `Socio #${payment.member_id}`
        : "Invitado";
      const haystack = [
        memberName,
        paymentConceptLabel[payment.concept] ?? payment.concept,
        paymentMethodLabel[payment.payment_method] ?? payment.payment_method,
        paymentStatusLabel[payment.status] ?? payment.status,
        payment.receipt_series ?? "",
        payment.receipt_number != null ? String(payment.receipt_number) : "",
        String(payment.payment_id),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, status, method, search, memberNameById]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de pagos y comprobantes del módulo billing.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/payments/new")}>
          Nuevo pago
        </Button>
      </Stack>

      <PaymentsFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        method={method}
        onMethodChange={(value) => {
          setMethod(value);
          setPage(1);
        }}
        placeholder="Socio, concepto, folio..."
      />

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el historial de pagos.
        </Typography>
      )}

      <PaymentsTable rows={pageRows} isLoading={isLoading} memberNameById={memberNameById} />

      <ListPagination
        countText={`${filtered.length} pago(s) · página ${safePage} de ${totalPages}`}
        page={safePage}
        totalPages={totalPages}
        onChange={setPage}
      />
    </Box>
  );
}