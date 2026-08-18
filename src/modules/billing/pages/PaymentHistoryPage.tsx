import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { usePayments } from "@/modules/billing/hooks";
import { getPaymentReceipt } from "@/modules/billing/services";
import type { Payment, PaymentStatus } from "@/modules/billing/types";
import {
  paymentConceptLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";
import { PaymentsFiltersBar } from "@/modules/billing/components/PaymentsFiltersBar";
import { PaymentsTable } from "@/modules/billing/components/PaymentsTable";
import { ListPagination } from "@/modules/billing/components/ListPagination";
import { ReceiptDialog, type ReceiptData } from "@/modules/billing/components/ReceiptDialog";

const PAGE_SIZE = 12;

export function PaymentHistoryPage() {
  const { data, isLoading, isError } = usePayments({ page: 0, size: 200 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const rows = useMemo(() => data?.content ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((payment) => {
      if (status && payment.status !== status) return false;
      if (!needle) return true;
      const haystack = [
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
  }, [rows, status, search]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openReceipt = async (payment: Payment) => {
    setReceiptPayment(payment);
    setReceiptData(null);
    setReceiptError(null);
    setReceiptOpen(true);
    setReceiptLoading(true);
    try {
      const data = await getPaymentReceipt(payment.payment_id);
      setReceiptData(data);
    } catch {
      setReceiptError("El comprobante aún no está disponible.");
    } finally {
      setReceiptLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Mis pagos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Historial de pagos y comprobantes de tu cuenta.
        </Typography>
      </Box>

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
        placeholder="Concepto, folio..."
      />

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar tu historial de pagos.
        </Typography>
      )}

      <PaymentsTable rows={pageRows} isLoading={isLoading} onViewReceipt={openReceipt} />

      <ListPagination
        countText={`${filtered.length} pago(s) · página ${safePage} de ${totalPages}`}
        page={safePage}
        totalPages={totalPages}
        onChange={setPage}
      />

      <ReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        loading={receiptLoading}
        error={receiptError}
        receiptData={receiptData}
        payment={receiptPayment}
      />
    </Box>
  );
}