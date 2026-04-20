import {
  type Icon,
  MapPinIcon,
  PathIcon,
  PolygonIcon,
  SquareIcon,
  CirclesThreeIcon,
  StackIcon,
} from "@phosphor-icons/react";
import type { ParseResult } from "@/features/wkt/types/wkt";

export type GeometryIconConfig = {
  icon: Icon;
  label: string;
  color: string;
};

export function getGeometryIcon(result: ParseResult): GeometryIconConfig {
  if (result.kind !== "valid") {
    return {
      icon: CirclesThreeIcon,
      label: "Geometry",
      color: "text-zinc-400",
    };
  }

  const type = result.geojson.type;

  switch (type) {
    case "Point":
      return {
        icon: MapPinIcon,
        label: "Point",
        color: "text-blue-500",
      };
    case "MultiPoint":
      return {
        icon: CirclesThreeIcon,
        label: "MultiPoint",
        color: "text-blue-500",
      };
    case "LineString":
      return {
        icon: PathIcon,
        label: "Line",
        color: "text-amber-500",
      };
    case "MultiLineString":
      return {
        icon: StackIcon,
        label: "MultiLine",
        color: "text-amber-500",
      };
    case "Polygon":
      return {
        icon: SquareIcon,
        label: "Polygon",
        color: "text-emerald-500",
      };
    case "MultiPolygon":
      return {
        icon: PolygonIcon,
        label: "MultiPolygon",
        color: "text-emerald-500",
      };
    case "GeometryCollection":
      return {
        icon: StackIcon,
        label: "Collection",
        color: "text-violet-500",
      };
    default:
      return {
        icon: CirclesThreeIcon,
        label: "Geometry",
        color: "text-zinc-400",
      };
  }
}
