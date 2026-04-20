import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import { WktPanel } from "@/features/wkt/components/WktPanel";
import { JsonDialog } from "@/features/wkt/components/JsonDialog";
import { useMapController } from "@/features/wkt/hooks/useMapController";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { computeBbox } from "@/features/wkt/utils/computeBbox";
import { computeCentroid } from "@/features/wkt/utils/computeCentroid";
import { INITIAL_VIEW_STATE, MAP_STYLE } from "@/config";
import type { ValidResult, WktEntry } from "@/types";

export default function App() {
  const entries = useWktStore((s) => s.entries);
  const { mapRef } = useMapController();
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);

  const handleZoom = (id: string) => {
    // Get entry directly from store to ensure we have the latest state
    const entry = useWktStore.getState().getEntryById(id);
    if (!entry || entry.result.kind !== "valid") return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    const bbox = computeBbox(entry.result.geojson);
    if (!bbox) return;

    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 80, maxZoom: 16, duration: 500 },
    );
  };

  const handleZoomToBbox = (bbox: [number, number, number, number]) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 80, maxZoom: 16, duration: 500 },
    );
  };

  const validEntries = entries.filter(
    (e): e is WktEntry & { result: ValidResult } => e.result.kind === "valid",
  );

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
      >
        {validEntries.map((entry) => {
          const color = entry.color;
          const centroid = computeCentroid(entry.result.geojson);
          const isVisible = entry.visible;
          return (
            <>
              <Source key={entry.id} type="geojson" data={entry.result.geojson}>
                <Layer
                  type="fill"
                  filter={["in", "$type", "Polygon"]}
                  layout={{ visibility: isVisible ? "visible" : "none" }}
                  paint={{ "fill-color": color, "fill-opacity": 0.15 }}
                />
                <Layer
                  type="line"
                  filter={["in", "$type", "LineString", "Polygon"]}
                  layout={{
                    visibility: isVisible ? "visible" : "none",
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": color,
                    "line-width": 6,
                  }}
                />
                <Layer
                  type="circle"
                  filter={["in", "$type", "Point"]}
                  layout={{ visibility: isVisible ? "visible" : "none" }}
                  paint={{
                    "circle-radius": 6,
                    "circle-color": color,
                    "circle-stroke-color": "#fff",
                    "circle-stroke-width": 2,
                    "circle-opacity": 0.9,
                  }}
                />
              </Source>
              {entry.label && centroid && (
                <Source
                  key={`label-${entry.id}`}
                  type="geojson"
                  data={{
                    type: "Feature",
                    geometry: { type: "Point", coordinates: centroid },
                    properties: {},
                  }}
                >
                  <Layer
                    type="symbol"
                    layout={{
                      visibility: isVisible ? "visible" : "none",
                      "text-field": entry.label,
                      "text-size": 13,
                      "text-anchor": "center",
                      "text-font": ["Inter Regular"],
                    }}
                    paint={{
                      "text-color": color,
                      "text-halo-color": "#fff",
                      "text-halo-width": 1.5,
                    }}
                  />
                </Source>
              )}
            </>
          );
        })}
      </Map>
      <WktPanel
        onZoom={handleZoom}
        onZoomToBbox={handleZoomToBbox}
        onOpenJsonDialog={() => setJsonDialogOpen(true)}
      />
      <JsonDialog open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} />
      <a
        href="https://github.com/Quinus"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 left-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Made by Quinus
      </a>
    </div>
  );
}
