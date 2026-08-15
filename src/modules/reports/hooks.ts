import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import { downloadReport, getReportRows, triggerBlobDownload } from "./services";
import type { ReportFormat } from "./types";

export function useReportRows<T>(path: string, params: Record<string, unknown>, enabled = true) {
  return useQuery({
    queryKey: ["reports", path, params],
    queryFn: () => getReportRows<T>(path, params),
    enabled,
  });
}

export function useReportDownload() {
  const { enqueueSnackbar } = useSnackbar();
  const [downloadingFormat, setDownloadingFormat] = useState<ReportFormat | null>(null);

  const download = useCallback(
    async (path: string, params: Record<string, unknown>, format: Exclude<ReportFormat, "JSON">) => {
      setDownloadingFormat(format);
      try {
        const { blob, filename } = await downloadReport(path, params, format);
        triggerBlobDownload(blob, filename);
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error, "No se pudo generar el archivo"), { variant: "error" });
      } finally {
        setDownloadingFormat(null);
      }
    },
    [enqueueSnackbar],
  );

  return { download, downloadingFormat };
}
