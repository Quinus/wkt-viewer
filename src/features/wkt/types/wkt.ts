export type ParseResult =
  | { kind: "idle" }
  | { kind: "valid"; geojson: GeoJSON.Geometry; label: string }
  | { kind: "invalid" };

export type ValidResult = { kind: "valid"; geojson: GeoJSON.Geometry; label: string };

export const DEFAULT_VISIBLE = true;

export type WktEntry = {
  id: string;
  label: string;
  value: string;
  result: ParseResult;
  visible: boolean;
};

export type StoredEntry = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
};