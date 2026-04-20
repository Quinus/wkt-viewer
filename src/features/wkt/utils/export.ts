import type { WktEntry } from "@/features/wkt/types/wkt";

interface ExportItem {
  label: string;
  geo: string;
}

export function serializeForExport(entries: WktEntry[]): ExportItem[] {
  return entries
    .filter((e) => e.result.kind === "valid" && e.value.trim())
    .map((e) => ({
      label: e.label || (e.result.kind === "valid" ? e.result.label : ""),
      geo: e.value.trim(),
    }));
}

export function exportAsJson(entries: WktEntry[]): string {
  const items = serializeForExport(entries);
  return JSON.stringify(items, null, 2);
}

export function exportAsUrl(entries: WktEntry[]): string {
  const items = serializeForExport(entries);
  if (items.length === 0) return window.location.href;
  const encoded = btoa(JSON.stringify(items));
  const url = new URL(window.location.href);
  url.hash = `data=${encoded}`;
  return url.toString();
}
