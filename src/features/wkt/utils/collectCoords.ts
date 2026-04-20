export function collectCoords(geom: GeoJSON.Geometry, result: number[][]): void {
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
