import { Source, Layer } from "react-map-gl/maplibre";
import { useMemo } from "react";
import { useEntriesInRenderOrder } from "@/features/wkt/hooks/useDnd";
import { computeCentroid } from "@/features/wkt/utils/computeCentroid";
import { LAYER_STYLES } from "@/features/wkt/config";
import type { ValidResult, WktEntry } from "@/types";

export function WktLayers() {
  // Get entries in panel order (top to bottom)
  // Items at the top of the panel are drawn on top (rendered last)
  const entriesInOrder = useEntriesInRenderOrder();

  const validEntries = useMemo(
    () =>
      entriesInOrder.filter(
        (e): e is WktEntry & { result: ValidResult } => e.result.kind === "valid",
      ),
    [entriesInOrder],
  );

  const centroids = useMemo(
    () => new Map(validEntries.map((e) => [e.id, computeCentroid(e.result.geojson)] as const)),
    [validEntries],
  );

  return (
    <>
      {validEntries.map((entry) => {
        const color = entry.color;
        const isVisible = entry.visible;
        return (
          <Source key={entry.id} type="geojson" data={entry.result.geojson}>
            <Layer
              type="fill"
              filter={["in", "$type", "Polygon"]}
              layout={{ visibility: isVisible ? "visible" : "none" }}
              paint={{
                "fill-color": color,
                "fill-opacity": 0.15,
              }}
            />
            <Layer
              type="line"
              filter={["in", "$type", "LineString", "Polygon"]}
              layout={{
                visibility: isVisible ? "visible" : "none",
                "line-join": LAYER_STYLES.line["line-join"],
                "line-cap": LAYER_STYLES.line["line-cap"],
              }}
              paint={{
                "line-color": color,
                "line-width": LAYER_STYLES.line["line-width"],
                "line-opacity": 1,
              }}
            />
            <Layer
              type="circle"
              filter={["in", "$type", "Point"]}
              layout={{ visibility: isVisible ? "visible" : "none" }}
              paint={{
                "circle-radius": LAYER_STYLES.circle["circle-radius"],
                "circle-color": color,
                "circle-stroke-color": LAYER_STYLES.circle["circle-stroke-color"],
                "circle-stroke-width": LAYER_STYLES.circle["circle-stroke-width"],
                "circle-opacity": 0.9,
              }}
            />
          </Source>
        );
      })}
      {validEntries.map((entry) => {
        if (!entry.label) return null;
        const centroid = centroids.get(entry.id);
        if (!centroid) return null;
        const isVisible = entry.visible;
        return (
          <Source
            key={`label-${entry.id}`}
            type="geojson"
            data={{
              type: "Feature",
              geometry: { type: "Point" as const, coordinates: centroid },
              properties: {},
            }}
          >
            <Layer
              type="symbol"
              layout={{
                visibility: isVisible ? "visible" : "none",
                "text-field": entry.label,
                "text-size": LAYER_STYLES.symbol["text-size"],
                "text-anchor": LAYER_STYLES.symbol["text-anchor"],
                "text-font": [...LAYER_STYLES.symbol["text-font"]],
              }}
              paint={{
                "text-color": entry.color,
                "text-halo-color": LAYER_STYLES.symbol["text-halo-color"],
                "text-halo-width": LAYER_STYLES.symbol["text-halo-width"],
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
