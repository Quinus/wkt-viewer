export type ParseResult =
  | { kind: "idle" }
  | { kind: "valid"; geojson: GeoJSON.Geometry; label: string }
  | { kind: "invalid" };

export type ValidResult = { kind: "valid"; geojson: GeoJSON.Geometry; label: string };

export const DEFAULT_VISIBLE = true;

import type { Color } from "@/features/wkt/utils/colors";

export type WktEntry = {
  id: string;
  label: string;
  value: string;
  result: ParseResult;
  visible: boolean;
  color: Color;
  groupId: string | null;
};

export type StoredEntry = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  color: Color;
  groupId: string | null;
};

export type WktGroup = {
  id: string;
  name: string;
  expanded: boolean;
  visible: boolean;
  entryIds: string[];
};
