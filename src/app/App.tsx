import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { WktPanel } from "@/features/wkt/components/WktPanel";
import { useMapController } from "@/features/wkt/hooks/useMapController";
import { useWktStore } from "@/features/wkt/store/useWktStore";
import { COLORS } from "@/features/wkt/utils/colors";
import { computeBbox } from "@/features/wkt/utils/computeBbox";
import { computeCentroid } from "@/features/wkt/utils/computeCentroid";
import { INITIAL_VIEW_STATE, MAP_STYLE } from "@/config";
import type { ValidResult, WktEntry } from "@/types";

export default function App() {
  const entries = useWktStore((s) => s.entries);
  const { mapRef } = useMapController();

  const handleZoom = (id: string) => {
    const entry = entries.find((e) => e.id === id);
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

  const validEntries = entries.filter(
    (e): e is WktEntry & { result: ValidResult } => e.result.kind === "valid" && e.visible,
  );

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
      >
        {validEntries.map((entry, i) => {
          const color = COLORS[i % COLORS.length];
          const centroid = computeCentroid(entry.result.geojson);
          return (
            <>
              <Source key={entry.id} type="geojson" data={entry.result.geojson}>
                <Layer
                  type="fill"
                  filter={["in", "$type", "Polygon"]}
                  paint={{ "fill-color": color, "fill-opacity": 0.15 }}
                />
                <Layer
                  type="line"
                  filter={["in", "$type", "LineString", "Polygon"]}
                  paint={{ "line-color": color, "line-width": 2.5 }}
                />
                <Layer
                  type="circle"
                  filter={["in", "$type", "Point"]}
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
      <WktPanel onZoom={handleZoom} />
      <a
        href="https://github.com/Quinus"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 left-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Made by Quinus
      </a>
    </>
  );
}
