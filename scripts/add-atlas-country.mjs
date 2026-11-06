import fs from "node:fs/promises";
import path from "node:path";
import { topology } from "topojson-server";
import { mesh } from "topojson-client";

const [iso3Arg] = process.argv.slice(2);
const iso3 = (iso3Arg || "").trim().toUpperCase();
if (!/^[A-Z]{3}$/.test(iso3)) {
  throw new Error("Usage: node scripts/add-atlas-country.mjs ISO3 (example: JPN)");
}

const base = "https://www.geoboundaries.org/api/current/gbOpen";
const response = await fetch(`${base}/${iso3}/ADM1/`);
if (!response.ok) throw new Error(`geoBoundaries API failed for ${iso3}: HTTP ${response.status}`);
const metadata = await response.json();
if (!metadata || metadata.boundaryISO !== iso3 || metadata.boundaryType !== "ADM1") {
  throw new Error(`Unexpected metadata response for ${iso3}`);
}
if (!metadata.gjDownloadURL) throw new Error(`No GeoJSON download URL for ${iso3}`);

const source = await fetch(metadata.gjDownloadURL);
if (!source.ok) throw new Error(`GeoJSON download failed for ${iso3}: HTTP ${source.status}`);
const geojson = await source.json();
if (!geojson || !["FeatureCollection"].includes(geojson.type) || !Array.isArray(geojson.features) || geojson.features.length < 2) {
  throw new Error(`Invalid ADM1 GeoJSON for ${iso3}`);
}

// TopoJSON builds shared arcs from the individual polygons. Drawing only shared
// arcs (a !== b) avoids retracing country exteriors already drawn by world-atlas.
const topo = topology({ units: geojson });
const object = topo.objects.units;
const internalMesh = mesh(topo, object, (a, b) => a !== b);
if (!internalMesh || internalMesh.type !== "MultiLineString" && internalMesh.type !== "LineString") {
  throw new Error(`Could not derive internal administrative mesh for ${iso3}`);
}

const outDir = path.resolve("src/data/boundaries");
await fs.mkdir(outDir, { recursive: true });
const asset = {
  type: "Topology",
  arcs: topo.arcs,
  transform: topo.transform,
  objects: {
    [iso3]: object
  }
};
await fs.writeFile(path.join(outDir, `${iso3}.topojson`), JSON.stringify(asset));
const sourceLicense = metadata.boundaryLicense || metadata.license || "Not specified by source metadata";
const record = {
  country: metadata.boundaryName,
  iso3,
  adminLevel: "ADM1",
  adminUnits: geojson.features.length,
  source: metadata.boundarySource || "geoBoundaries",
  sourceYear: metadata.boundaryYearRepresented || null,
  license: sourceLicense,
  licenseUrl: metadata.licenseSource || null,
  sourceUrl: metadata.boundarySourceURL || null,
  geoBoundariesRecord: metadata.boundaryID || null,
  geometryUrl: metadata.gjDownloadURL,
  geometryFormat: "GeoJSON converted to TopoJSON; internal shared arcs rendered",
  attribution: metadata.boundarySource || "geoBoundaries",
  generatedAt: new Date().toISOString()
};
await fs.writeFile(path.join(outDir, `${iso3}.meta.json`), JSON.stringify(record, null, 2) + "\n");
console.log(JSON.stringify({
  iso3,
  country: record.country,
  adminUnits: record.adminUnits,
  license: record.license,
  assetBytes: Buffer.byteLength(JSON.stringify(asset)),
  internalLineParts: internalMesh.coordinates.length
}, null, 2));
