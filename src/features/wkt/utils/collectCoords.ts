export function collectCoords(geom: GeoJSON.Geometry, out: number[][]): void {
  if (!geom) return;
  switch (geom.type) {
    case "Point":
      out.push(geom.coordinates as number[]);
      break;
    case "LineString":
    case "MultiPoint":
      out.push(...(geom.coordinates as number[][]));
      break;
    case "Polygon":
    case "MultiLineString":
      for (const ring of geom.coordinates as number[][][]) out.push(...ring);
      break;
    case "MultiPolygon":
      for (const polygon of geom.coordinates as number[][][][])
        for (const ring of polygon) out.push(...ring);
      break;
    case "GeometryCollection":
      for (const g of (geom as GeoJSON.GeometryCollection).geometries) collectCoords(g, out);
      break;
  }
}
