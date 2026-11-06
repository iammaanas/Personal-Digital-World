import fs from "node:fs/promises";
import path from "node:path";
import { topology } from "topojson-server";
import { mesh } from "topojson-client";

const requested = process.argv.slice(2).map(value => value.trim().toUpperCase()).filter(Boolean);
const iso3List = [...new Set(requested)];
if (!iso3List.length || iso3List.some(code => !/^[A-Z]{3}$/.test(code))) {
  throw new Error("Usage: node scripts/add-atlas-countries.mjs ISO3 [ISO3 ...]");
}

const base = "https://www.geoboundaries.org/api/current/gbOpen";
const outDir = path.resolve("src/data/boundaries");
await fs.mkdir(outDir, { recursive: true });

for (const iso3 of iso3List) {
  console.log(`Preparing ADM1 boundary data for ${iso3}...`);
  const response = await fetch(`${base}/${iso3}/ADM1/`);
  if (!response.ok) throw new Error(`geoBoundaries API failed for ${iso3}: HTTP ${response.status}`);
  const metadata = await response.json();
  if (!metadata || metadata.boundaryISO !== iso3 || metadata.boundaryType !== "ADM1") {
    throw new Error(`Unexpected ADM1 metadata response for ${iso3}`);
  }
  if (!metadata.gjDownloadURL) throw new Error(`No GeoJSON download URL for ${iso3}`);

  const source = await fetch(metadata.gjDownloadURL);
  if (!source.ok) throw new Error(`GeoJSON download failed for ${iso3}: HTTP ${source.status}`);
  const geojson = await source.json();
  if (geojson?.type !== "FeatureCollection" || !Array.isArray(geojson.features) || geojson.features.length < 2) {
    throw new Error(`Invalid ADM1 GeoJSON for ${iso3}`);
  }

  const topo = topology({ units: geojson });
  const object = topo.objects.units;
  const internalMesh = mesh(topo, object, (a, b) => a !== b);
  if (!internalMesh || !Array.isArray(internalMesh.coordinates) || internalMesh.coordinates.length === 0) {
    throw new Error(`Could not derive internal administrative mesh for ${iso3}`);
  }

  const asset = { type: "Topology", arcs: topo.arcs, transform: topo.transform, objects: { [iso3]: object } };
  const assetPath = path.join(outDir, `${iso3}.topojson`);
  const metaPath = path.join(outDir, `${iso3}.meta.json`);
  await fs.writeFile(assetPath, JSON.stringify(asset));

  const record = {
    country: metadata.boundaryName,
    iso3,
    adminLevel: "ADM1",
    adminUnits: geojson.features.length,
    source: metadata.boundarySource || "geoBoundaries",
    sourceYear: metadata.boundaryYearRepresented || null,
    license: metadata.boundaryLicense || metadata.license || "Not specified by source metadata",
    licenseUrl: metadata.licenseSource || null,
    sourceUrl: metadata.boundarySourceURL || null,
    geoBoundariesRecord: metadata.boundaryID || null,
    geometryUrl: metadata.gjDownloadURL,
    geometryFormat: "GeoJSON converted to TopoJSON; internal shared arcs rendered",
    attribution: metadata.boundarySource || "geoBoundaries",
    generatedAt: new Date().toISOString()
  };
  await fs.writeFile(metaPath, JSON.stringify(record, null, 2) + "\n");
  console.log(JSON.stringify({
    iso3, country: record.country, adminUnits: record.adminUnits,
    license: record.license, assetBytes: Buffer.byteLength(JSON.stringify(asset)),
    internalLineParts: internalMesh.coordinates.length
  }));
}
