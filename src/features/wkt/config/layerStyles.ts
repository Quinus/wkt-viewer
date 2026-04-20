export const LAYER_STYLES = {
  fill: {
    "fill-opacity": 0.15,
  },
  line: {
    "line-width": 6,
    "line-join": "round" as const,
    "line-cap": "round" as const,
  },
  circle: {
    "circle-radius": 6,
    "circle-stroke-color": "#fff",
    "circle-stroke-width": 2,
    "circle-opacity": 0.9,
  },
  symbol: {
    "text-size": 13,
    "text-anchor": "center" as const,
    "text-font": ["Inter Regular"],
    "text-halo-color": "#fff",
    "text-halo-width": 1.5,
  },
} as const;
