import { parseWkt } from "@/features/wkt/utils/parseWkt";

interface SharedItem {
  label: string;
  value: string;
}

export function loadFromUrlHash(): SharedItem[] | null {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith("#data=")) return null;

  try {
    const encoded = hash.slice("#data=".length);
    const json = atob(encoded);
    const parsed = JSON.parse(json);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    const validItems: SharedItem[] = [];
    for (const item of items) {
      if (item.geo && typeof item.geo === "string") {
        const result = parseWkt(item.geo);
        if (result.kind === "valid") {
          validItems.push({
            label: item.label || item.name || item.id || result.label,
            value: item.geo,
          });
        }
      }
    }

    if (validItems.length === 0) return null;

    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return validItems;
  } catch {
    return null;
  }
}
