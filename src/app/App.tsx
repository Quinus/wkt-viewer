import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { WktPanel } from "@/features/wkt/components/WktPanel";
import { WktLayers } from "@/features/wkt/components/WktLayers";
import { useMapController } from "@/features/wkt/hooks/useMapController";
import { useKeyboardShortcuts } from "@/features/wkt/hooks/useKeyboardShortcuts";
import { INITIAL_VIEW_STATE, MAP_STYLE } from "@/config";

export default function App() {
  const { mapRef, zoomToEntry, zoomToBbox } = useMapController();
  useKeyboardShortcuts();

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
      >
        <WktLayers />
      </Map>
      <WktPanel onZoom={zoomToEntry} onZoomToBbox={zoomToBbox} />
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
