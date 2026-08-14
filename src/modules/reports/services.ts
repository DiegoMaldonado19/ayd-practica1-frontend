import { apiClient } from "@/api/client";
import type { ReportFormat } from "./types";

export async function getReportRows<T>(path: string, params: Record<string, unknown>): Promise<T[]> {
  const { data } = await apiClient.get<T[]>(`/reports/${path}`, {
    params: { ...params, format: "JSON" satisfies ReportFormat },
  });
  return data;
}

function extractFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename="?([^"]+)"?/.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

export async function downloadReport(
  path: string,
  params: Record<string, unknown>,
  format: Exclude<ReportFormat, "JSON">,
): Promise<{ blob: Blob; filename: string }> {
  const extension = format.toLowerCase();
  const response = await apiClient.get(`/reports/${path}`, {
    params: { ...params, format },
    responseType: "blob",
  });

  const filename = extractFilename(response.headers["content-disposition"], `${path}.${extension}`);

  return { blob: response.data as Blob, filename };
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
