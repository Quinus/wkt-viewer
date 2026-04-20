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

function collectCoords(geom: GeoJSON.Geometry, out: number[][]) {
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
