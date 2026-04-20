import { useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { computeBbox } from "@/features/wkt/utils/computeBbox";
import { useWktStore } from "@/features/wkt/store/useWktStore";

export function useMapController() {
  const mapRef = useRef<MapRef>(null);

  const zoomToEntry = (id: string) => {
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

  const zoomToBbox = (bbox: [number, number, number, number]) => {
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

  return {
    mapRef,
    zoomToEntry,
    zoomToBbox,
  };
}
