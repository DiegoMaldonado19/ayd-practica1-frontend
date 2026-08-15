import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useReportDownload, useReportRows } from "../hooks";
import { ReportFilters, type ReportFilterValues } from "../components/ReportFilters";
import { ReportResultsTable } from "../components/ReportResultsTable";
import { REPORT_DEFINITIONS } from "../types";
import type { ReportFormat } from "../types";

const EXPORT_FORMATS: Exclude<ReportFormat, "JSON">[] = ["CSV", "XLSX", "PDF", "PNG"];

export function ReportsPage() {
  const [selectedKey, setSelectedKey] = useState(REPORT_DEFINITIONS[0].key);
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({});

  const definition = REPORT_DEFINITIONS.find((r) => r.key === selectedKey) ?? REPORT_DEFINITIONS[0];
  const requiresMember = definition.filters.includes("member-picker");
  const canRun = !requiresMember || filterValues.member_id != null;

  const params = useMemo(() => {
    const entries = Object.entries(filterValues).filter(([, value]) => value !== undefined && value !== "");
    return Object.fromEntries(entries);
  }, [filterValues]);

  const { data, isLoading, isError } = useReportRows<Record<string, unknown>>(
    definition.path,
    params,
    canRun,
  );

  const { download, downloadingFormat } = useReportDownload();

  const selectReport = (key: string) => {
    setSelectedKey(key);
    setFilterValues({});
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Reportes
      </Typography>

      <TextField
        select
        label="Reporte"
        value={selectedKey}
        onChange={(e) => selectReport(e.target.value)}
        size="small"
        sx={{ minWidth: 260, mb: 2 }}
      >
        {REPORT_DEFINITIONS.map((report) => (
          <MenuItem key={report.key} value={report.key}>
            {report.label}
          </MenuItem>
        ))}
      </TextField>

      <ReportFilters
        fields={definition.filters}
        values={filterValues}
        onChange={(patch) => setFilterValues((current) => ({ ...current, ...patch }))}
      />

      {requiresMember && filterValues.member_id == null && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecciona un socio para generar este reporte.
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {EXPORT_FORMATS.map((format) => (
          <Button
            key={format}
            variant="outlined"
            size="small"
            disabled={!canRun || downloadingFormat !== null}
            onClick={() => download(definition.path, params, format)}
          >
            {downloadingFormat === format ? "Generando..." : `Exportar ${format}`}
          </Button>
        ))}
      </Stack>

      {canRun && <ReportResultsTable rows={data ?? []} isLoading={isLoading} isError={isError} />}
    </Box>
  );
}
