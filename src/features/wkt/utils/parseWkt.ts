import { wktToGeoJSON } from "@terraformer/wkt";
import type { ParseResult } from "@/features/wkt/types/wkt";

function isGeometry(geojson: GeoJSON.GeoJsonObject): geojson is GeoJSON.Geometry {
  return (
    geojson.type === "Point" ||
    geojson.type === "MultiPoint" ||
    geojson.type === "LineString" ||
    geojson.type === "MultiLineString" ||
    geojson.type === "Polygon" ||
    geojson.type === "MultiPolygon" ||
    geojson.type === "GeometryCollection"
  );
}

export function parseWkt(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { kind: "idle" };
  try {
    const result = wktToGeoJSON(trimmed);
    if (!isGeometry(result)) {
      return { kind: "invalid", error: "Result is not a valid geometry type" };
    }
    return { kind: "valid", geojson: result, label: result.type };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid WKT string";
    return { kind: "invalid", error: message };
  }
}
