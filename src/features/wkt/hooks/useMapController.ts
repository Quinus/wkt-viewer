import { useCallback, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import type { ValidResult } from "@/features/wkt/types/wkt";
import { computeBbox } from "@/features/wkt/utils/computeBbox";

export function useMapController() {
  const mapRef = useRef<MapRef>(null);

  const handleZoom = useCallback((id: string, getEntry: (id: string) => { result: ValidResult } | undefined) => {
    const entry = getEntry(id);
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
  }, []);

  return {
    mapRef,
    handleZoom,
  };
}