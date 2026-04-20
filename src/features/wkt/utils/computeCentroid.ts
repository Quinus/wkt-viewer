export function computeCentroid(
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry,
): [number, number] | null {
  const coords: number[][] = [];
  collectCoords(geojson, coords);
  if (coords.length === 0) return null;

  let sumLng = 0;
  let sumLat = 0;
  for (const c of coords) {
    sumLng += c[0];
    sumLat += c[1];
  }
  return [sumLng / coords.length, sumLat / coords.length];
}

function collectCoords(
  geom: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry,
  result: number[][],
): void {
  if (geom.type === "FeatureCollection") {
    for (const feature of geom.features) {
      collectCoords(feature, result);
    }
    return;
  }
  if (geom.type === "Feature") {
    collectCoords(geom.geometry, result);
    return;
  }
  if (geom.type === "Point") {
    result.push(geom.coordinates as number[]);
    return;
  }
  if (geom.type === "MultiPoint" || geom.type === "LineString") {
    for (const coord of geom.coordinates as number[][]) {
      result.push(coord);
    }
    return;
  }
  if (geom.type === "MultiLineString" || geom.type === "Polygon") {
    for (const ring of geom.coordinates as number[][][]) {
      for (const coord of ring) {
        result.push(coord);
      }
    }
    return;
  }
  if (geom.type === "MultiPolygon") {
    for (const polygon of geom.coordinates as number[][][][]) {
      for (const ring of polygon) {
        for (const coord of ring) {
          result.push(coord);
        }
      }
    }
    return;
  }
  if (geom.type === "GeometryCollection") {
    for (const g of geom.geometries) {
      collectCoords(g, result);
    }
  }
}
