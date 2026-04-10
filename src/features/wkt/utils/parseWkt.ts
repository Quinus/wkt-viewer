import { wktToGeoJSON } from "@terraformer/wkt";
import type { ParseResult } from "@/features/wkt/types/wkt";

export function parseWkt(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { kind: "idle" };
  try {
    const geojson = wktToGeoJSON(trimmed);
    const geom = geojson as GeoJSON.Geometry;
    return { kind: "valid", geojson: geom, label: geom.type || "Valid" };
  } catch {
    return { kind: "invalid" };
  }
}
