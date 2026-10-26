import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Point = {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number];
  note: string;
};

const places: Point[] = [
  { id: "mumbai", name: "Mumbai", region: "Asia · India", coordinates: [72.8777, 19.076], note: "A starting point on the map." },
  { id: "thimphu", name: "Thimphu", region: "Asia · Bhutan", coordinates: [89.639, 27.4728], note: "A quiet marker in the Himalayas." },
  { id: "tokyo", name: "Tokyo", region: "Asia · Japan", coordinates: [139.6917, 35.6895], note: "A test marker for exploring the map." },
  { id: "berlin", name: "Berlin", region: "Europe · Germany", coordinates: [13.405, 52.52], note: "A test marker across the continent." },
  { id: "reykjavik", name: "Reykjavík", region: "Europe · Iceland", coordinates: [-21.9426, 64.1466], note: "A northern marker to test long-distance pan." },
];

const WIDTH = 1200;
const HEIGHT = 660;
const world = feature(worldData as never, (worldData as { objects: { countries: never } }).objects.countries) as unknown as {
  type: "FeatureCollection";
  features: Array<{ type: "Feature"; geometry: never; properties?: Record<string, unknown> }>;
};

export default function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<SVGGElement | null>(null);
  const [selected, setSelected] = useState<Point | null>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent([[22, 28], [WIDTH - 22, HEIGHT - 28]], world as never),
    [],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    const svg = svgRef.current;
    const viewport = viewportRef.current;
    if (!svg || !viewport) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 7])
      .translateExtent([[-WIDTH, -HEIGHT], [WIDTH * 2, HEIGHT * 2]])
      .on("zoom", (event) => {
        select(viewport).attr("transform", event.transform.toString());
        setTransform(event.transform);
      });

    const selection = select(svg);
    selection.call(behavior);
    selection.on("dblclick.zoom", null);
    selection.call(behavior.transform, zoomIdentity);
    return () => { selection.on(".zoom", null); };
  }, []);

  const resetView = () => {
    if (svgRef.current) select(svgRef.current).transition().duration(500).call(
      zoom<SVGSVGElement, unknown>().scaleExtent([1, 7]).on("zoom", (event) => {
        if (viewportRef.current) select(viewportRef.current).attr("transform", event.transform.toString());
        setTransform(event.transform);
      }).transform,
      zoomIdentity,
    );
    setSelected(null);
  };

  const goToPoint = (point: Point) => {
    setSelected(point);
    const svg = svgRef.current;
    if (!svg) return;
    const projected = projection(point.coordinates);
    if (!projected) return;
    const scale = 2.6;
    const next = zoomIdentity
      .translate(WIDTH / 2 - projected[0] * scale, HEIGHT / 2 - projected[1] * scale)
      .scale(scale);
    select(svg).transition().duration(700).call(
      zoom<SVGSVGElement, unknown>().scaleExtent([1, 7]).on("zoom", (event) => {
        if (viewportRef.current) select(viewportRef.current).attr("transform", event.transform.toString());
        setTransform(event.transform);
      }).transform,
      next,
    );
  };

  const zoomBy = (amount: number) => {
    if (!svgRef.current) return;
    select(svgRef.current).transition().duration(250).call(
      zoom<SVGSVGElement, unknown>().scaleExtent([1, 7]).on("zoom", (event) => {
        if (viewportRef.current) select(viewportRef.current).attr("transform", event.transform.toString());
        setTransform(event.transform);
      }).scaleBy,
      amount,
    );
  };

  return (
    <main className="world-app">
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Personal Digital World home" onClick={(e) => { e.preventDefault(); resetView(); }}>
          <span className="wordmark-symbol">P<span>·</span>D<span>·</span>W</span>
          <span className="wordmark-label">PERSONAL DIGITAL WORLD</span>
        </a>
        <div className="topbar-status"><span className="status-dot" /> PROTOTYPE 01 <span className="status-divider">/</span> WORLD MAP</div>
        <button className="text-button" onClick={resetView}>RESET VIEW <span aria-hidden="true">↺</span></button>
      </header>

      <section className="map-stage" aria-label="Interactive world map">
        <div className="map-heading">
          <p className="eyebrow">A WORLD, STILL UNFOLDING</p>
          <h1>Everywhere<span className="title-period">.</span></h1>
          <p className="map-subtitle">A personal atlas of places, moments, and meaning.</p>
        </div>

        <svg ref={svgRef} className="world-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Interactive world map. Drag to pan, use the controls to zoom, and select a red marker.">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth=".55" opacity=".16" />
            </pattern>
            <radialGradient id="map-glow">
              <stop offset="0%" stopColor="#182126" stopOpacity=".72" />
              <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
            </radialGradient>
            <filter id="marker-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" className="map-grid" />
          <ellipse cx={WIDTH / 2} cy={HEIGHT / 2} rx="500" ry="300" fill="url(#map-glow)" />
          <g ref={viewportRef} className="map-viewport">
            <g className="countries">
              {world.features.map((country, index) => (
                <path key={index} d={pathGenerator(country as never) ?? ""} className="country-shape" />
              ))}
            </g>
            <g className="graticule">
              {Array.from({ length: 11 }, (_, i) => -150 + i * 30).map((longitude) => (
                <path key={`lon-${longitude}`} d={pathGenerator({ type: "LineString", coordinates: [[longitude, -78], [longitude, 78]] } as never) ?? ""} />
              ))}
              {[-60, -30, 0, 30, 60].map((latitude) => (
                <path key={`lat-${latitude}`} d={pathGenerator({ type: "LineString", coordinates: [[-180, latitude], [180, latitude]] } as never) ?? ""} />
              ))}
            </g>
            {places.map((place) => {
              const coordinate = projection(place.coordinates);
              if (!coordinate) return null;
              const isSelected = selected?.id === place.id;
              return (
                <g key={place.id} className={`map-marker ${isSelected ? "is-selected" : ""}`} transform={`translate(${coordinate[0]}, ${coordinate[1]})`} role="button" tabIndex={0} aria-label={`Show ${place.name}`} onClick={() => goToPoint(place)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); goToPoint(place); } }}>
                  <circle className="marker-halo" r={isSelected ? 13 : 9} />
                  <circle className="marker-core" r={isSelected ? 4.2 : 3.2} filter="url(#marker-glow)" />
                  <text className="marker-label" x="12" y="-11">{place.name.toUpperCase()}</text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="map-coordinates" aria-hidden="true">
          <span>EARTH / 001</span><span>ORTHOGRAPHIC STUDY</span><span>{`ZOOM ${Math.round(transform.k * 100)}%`}</span>
        </div>

        <div className="map-controls" aria-label="Map controls">
          <button aria-label="Zoom in" onClick={() => zoomBy(1.35)}>+</button>
          <span className="control-rule" />
          <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.35)}>−</button>
          <span className="control-rule" />
          <button aria-label="Reset map view" onClick={resetView}>⌂</button>
        </div>

        <div className="map-hint"><span className="hint-cross">✳</span> DRAG TO EXPLORE <span className="hint-separator">·</span> SELECT A MARKER</div>

        {selected && (
          <aside className="place-card" aria-live="polite">
            <button className="close-card" onClick={() => setSelected(null)} aria-label="Close place details">×</button>
            <p className="eyebrow">LOCATION / {String(places.findIndex((p) => p.id === selected.id) + 1).padStart(2, "0")}</p>
            <h2>{selected.name}<span>.</span></h2>
            <p className="place-region">{selected.region}</p>
            <div className="card-rule" />
            <p className="place-note">{selected.note}</p>
            <p className="place-coords">{selected.coordinates[1].toFixed(4)}° {selected.coordinates[1] >= 0 ? "N" : "S"} <span> / </span> {Math.abs(selected.coordinates[0]).toFixed(4)}° {selected.coordinates[0] >= 0 ? "E" : "W"}</p>
          </aside>
        )}
      </section>

      <footer className="bottombar">
        <div className="footer-left"><span className="footer-mark">PDW</span><span>MADE TO BE EXPLORED.</span></div>
        <div className="footer-center"><span className="footer-light" /> {places.length} TEST LOCATIONS <span className="status-divider">/</span> IN DEVELOPMENT</div>
        <div className="footer-right">DESIGNED FOR CURIOSITY <span>↗</span></div>
      </footer>

      {introVisible && (
        <div className="intro-overlay">
          <div className="intro-content">
            <div className="intro-orbit"><span /><i /><b /></div>
            <p className="intro-kicker">AN EXPERIMENT IN PERSONAL SPACE</p>
            <p className="intro-title">The world is<br /><em>not that far.</em></p>
            <p className="intro-copy">A map to begin with. A world to make your own.</p>
            <button className="enter-button" onClick={() => setIntroVisible(false)}>ENTER THE MAP <span>↗</span></button>
            <button className="skip-button" onClick={() => setIntroVisible(false)}>SKIP INTRO</button>
          </div>
          <span className="intro-index">PDW — 001</span>
          <span className="intro-corner">INTERACTIVE ATLAS / FIRST STUDY</span>
        </div>
      )}
    </main>
  );
}