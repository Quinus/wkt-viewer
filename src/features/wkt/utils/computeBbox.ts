import { collectCoords } from "./collectCoords";

export function computeBbox(geom: GeoJSON.Geometry): [number, number, number, number] | null {
  const coords: number[][] = [];
  collectCoords(geom, coords);
  if (coords.length === 0) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of coords) {
    const lng = c[0],
      lat = c[1];
    if (lng < minX) minX = lng;
    if (lat < minY) minY = lat;
    if (lng > maxX) maxX = lng;
    if (lat > maxY) maxY = lat;
  }
  return [minX, minY, maxX, maxY];
}
