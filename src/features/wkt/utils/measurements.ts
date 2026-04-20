import { collectCoords } from "./collectCoords";

export function computeLength(geom: GeoJSON.Geometry): number | null {
  const coords: number[][] = [];
  collectCoords(geom, coords);
  if (coords.length < 2) return null;

  let totalLength = 0;
  for (let i = 1; i < coords.length; i++) {
    totalLength += haversineDistance(coords[i - 1], coords[i]);
  }

  return totalLength;
}

export function computeArea(geom: GeoJSON.Geometry): number | null {
  if (geom.type === "Polygon") {
    const rings = geom.coordinates as number[][][];
    return ringArea(rings);
  }
  if (geom.type === "MultiPolygon") {
    const polygons = geom.coordinates as number[][][][];
    let total = 0;
    for (const polygon of polygons) {
      const a = ringArea(polygon);
      if (a !== null) total += a;
    }
    return total || null;
  }
  return null;
}

export function countVertices(geom: GeoJSON.Geometry): number {
  const coords: number[][] = [];
  collectCoords(geom, coords);
  return coords.length;
}

function haversineDistance(a: number[], b: number[]): number {
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a[1] * Math.PI) / 180) * Math.cos((b[1] * Math.PI) / 180) * sinLng * sinLng;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function ringArea(rings: number[][][]): number | null {
  const outerRing = rings[0];
  if (!outerRing || outerRing.length < 3) return null;
  return Math.abs(sphericalExcess(outerRing)) * 6_371_000 * 6_371_000;
}

function sphericalExcess(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum +=
      (((ring[i + 1][0] - ring[i][0]) * Math.PI) / 180) *
      (((ring[i][1] + ring[i + 1][1]) * Math.PI) / 360);
  }
  return sum;
}
