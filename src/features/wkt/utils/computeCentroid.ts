import { collectCoords } from "./collectCoords";

export function computeCentroid(geom: GeoJSON.Geometry): [number, number] | null {
  const coords: number[][] = [];
  collectCoords(geom, coords);
  if (coords.length === 0) return null;

  let sumLng = 0,
    sumLat = 0;
  for (const c of coords) {
    sumLng += c[0];
    sumLat += c[1];
  }
  return [sumLng / coords.length, sumLat / coords.length];
}
