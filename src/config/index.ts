export const MAP_STYLE = import.meta.env.VITE_MAP_STYLE_URL || "/map-style.json";

export const INITIAL_VIEW_STATE = {
  longitude: Number(import.meta.env.VITE_DEFAULT_LNG || "4.4214"),
  latitude: Number(import.meta.env.VITE_DEFAULT_LAT || "51.2307"),
  zoom: Number(import.meta.env.VITE_DEFAULT_ZOOM || "13"),
} as const;
