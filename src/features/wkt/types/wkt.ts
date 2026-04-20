export type ParseResult =
  | { kind: "idle" }
  | { kind: "valid"; geojson: GeoJSON.Geometry; label: string }
  | { kind: "invalid"; error: string };

export type ValidResult = { kind: "valid"; geojson: GeoJSON.Geometry; label: string };

export const DEFAULT_VISIBLE = true;
export const DEFAULT_OPACITY = 1;

import type { Color } from "@/features/wkt/utils/colors";

export type WktEntry = {
  id: string;
  label: string;
  value: string;
  result: ParseResult;
  visible: boolean;
  color: Color;
  opacity: number;
  groupId: string | null;
};

export type StoredEntry = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  color: Color;
  opacity?: number;
  groupId: string | null;
};

export type WktGroup = {
  id: string;
  name: string;
  visible: boolean;
  entryIds: string[];
};

// Drag and drop types
export type DragItemType = "entry" | "group";

export interface DragData {
  type: DragItemType;
  id: string;
  groupId: string | null;
}
