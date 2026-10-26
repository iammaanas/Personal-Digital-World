import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Place = {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number];
  note: string;
};

const places: Place[] = [
  { id: "mumbai", name: "Mumbai", region: "Asia · India", coordinates: [72.8777, 19.076], note: "A starting point on the map." },
  { id: "thimphu", name: "Thimphu", region: "Asia · Bhutan", coordinates: [89.639, 27.4728], note: "A quiet marker in the Himalayas." },
  { id: "tokyo", name: "Tokyo", region: "Asia · Japan", coordinates: [139.6917, 35.6895], note: "A test marker for exploring the map." },
  { id: "berlin", name: "Berlin", region: "Europe · Germany", coordinates: [13.405, 52.52], note: "A test marker across the continent." },
  { id: "reykjavik", name: "Reykjavík", region: "Europe · Iceland", coordinates: [-21.9426, 64.1466], note: "A northern marker to test long-distance pan." },
];

const W = 1200;
const H = 660;
const world = feature(
  worldData as never,
  (worldData as { objects: { countries: never } }).objects.countries,
) as unknown as { type: "FeatureCollection"; features: Array<{ type: "Feature"; geometry: never }> };

export default function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const introTimer = useRef<number | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  const projection = useMemo<GeoProjection>(
    () => geoNaturalEarth1().fitExtent([[22, 28], [W - 22, H - 28]], world as never),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule().step([30, 30])(), []);

  useEffect(() => {
    const svg = svgRef.current;
    const viewport = viewportRef.current;
    if (!svg || !viewport) return;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 7])
      .translateExtent([[-W, -H], [W * 2, H * 2]])
      .on("zoom", (event) => {
        select(viewport).attr("transform", event.transform.toString());
        setTransform(event.transform);
      });

    zoomBehaviorRef.current = behavior;
    const selection = select(svg);
    selection.call(behavior).on("dblclick.zoom", null);

    return () => {
      selection.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, []);

  const closeIntro = useCallback(() => {
    if (introTimer.current !== null) window.clearTimeout(introTimer.current);
    setIntroLeaving(true);
    introTimer.current = window.setTimeout(() => setIntroVisible(false), 420);
  }, []);

  useEffect(() => () => {
    if (introTimer.current !== null) window.clearTimeout(introTimer.current);
  }, []);

  const reset = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().duration(420).call(zoomBehaviorRef.current.transform, zoomIdentity);
    }
    setSelected(null);
  }, []);

  const goTo = useCallback((place: Place) => {
    setSelected(place);
    const point = projection(place.coordinates);
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!point || !svg || !behavior) return;

    const scale = 2.6;
    const next = zoomIdentity
      .translate(W / 2 - point[0] * scale, H / 2 - point[1] * scale)
      .scale(scale);
    select(svg).transition().duration(650).call(behavior.transform, next);
  }, [projection]);

  const zoomBy = useCallback((amount: number) => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().duration(220).call(zoomBehaviorRef.current.scaleBy, amount);
    }
  }, []);

  return (
    <main className="world-app">
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Personal Digital World home" onClick={(event) => { event.preventDefault(); reset(); }}>
          <span className="wordmark-symbol">P<span>·</span>D<span>·</span>W</span>
          <span className="wordmark-label">PERSONAL DIGITAL WORLD</span>
        </a>
        <div className="topbar-status"><span className="status-dot" /> PROTOTYPE 01 <span className="status-divider">/</span> WORLD MAP</div>
        <button className="text-button" onClick={reset}>RESET VIEW <span aria-hidden="true">↺</span></button>
      </header>

      <section className="map-stage" aria-label="Interactive world map">
        <div className="map-heading">
          <p className="eyebrow">A WORLD, STILL UNFOLDING</p>
          <h1>Everywhere<span className="title-period">.</span></h1>
          <p className="map-subtitle">A personal atlas of places, moments, and meaning.</p>
        </div>

        <svg ref={svgRef} className="world-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interactive world map. Drag to pan, use controls to zoom, and select a red marker.">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0 L0 0 0 60" fill="none" stroke="currentColor" strokeWidth=".55" opacity=".16" />
            </pattern>
            <radialGradient id="map-glow"><stop offset="0%" stopColor="#182126" stopOpacity=".72" /><stop offset="100%" stopColor="#08090b" stopOpacity="0" /></radialGradient>
            <filter id="marker-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width={W} height={H} fill="url(#grid)" className="map-grid" />
          <ellipse cx={W / 2} cy={H / 2} rx="500" ry="300" fill="url(#map-glow)" />

          <g ref={viewportRef} className="map-viewport">
            <g className="countries">
              {world.features.map((country, index) => <path key={index} d={path(country as never) ?? ""} className="country-shape" />)}
            </g>
            <g className="graticule">
              {Array.from({ length: 11 }, (_, index) => -150 + index * 30).map((longitude) => (
                <path key={`lon-${longitude}`} d={path({ type: "LineString", coordinates: [[longitude, -78], [longitude, 78]] } as never) ?? ""} />
              ))}
              {[-60, -30, 0, 30, 60].map((latitude) => (
                <path key={`lat-${latitude}`} d={path({ type: "LineString", coordinates: [[-180, latitude], [180, latitude]] } as never) ?? ""} />
              ))}
            </g>
            {places.map((place) => {
              const point = projection(place.coordinates);
              if (!point) return null;
              const active = selected?.id === place.id;
              return (
                <g key={place.id} className={`map-marker ${active ? "is-selected" : ""}`} transform={`translate(${point[0]},${point[1]})`} role="button" tabIndex={0} aria-label={`Show ${place.name}`} onClick={() => goTo(place)} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); goTo(place); }
                }}>
                  <circle className="marker-halo" r={active ? 13 : 9} />
                  <circle className="marker-core" r={active ? 4.2 : 3.2} filter="url(#marker-glow)" />
                  <text className="marker-label" x="12" y="-11">{place.name.toUpperCase()}</text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="map-coordinates" aria-hidden="true">
          <span>EARTH / 001</span><span>WORLD ATLAS STUDY</span><span>ZOOM {Math.round(transform.k * 100)}%</span>
        </div>
        <div className="map-controls" aria-label="Map controls">
          <button aria-label="Zoom in" onClick={() => zoomBy(1.35)}>+</button><span className="control-rule" />
          <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.35)}>−</button><span className="control-rule" />
          <button aria-label="Reset map" onClick={reset}>⌂</button>
        </div>
        <div className="map-hint"><span className="hint-cross">✳</span> DRAG TO EXPLORE <span className="hint-separator">·</span> SELECT A MARKER</div>

        {selected && (
          <aside className="place-card" aria-live="polite">
            <button className="close-card" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <p className="eyebrow">LOCATION / {String(places.findIndex((place) => place.id === selected.id) + 1).padStart(2, "0")}</p>
            <h2>{selected.name}<span>.</span></h2><p className="place-region">{selected.region}</p><div className="card-rule" />
            <p className="place-note">{selected.note}</p>
            <p className="place-coords">{Math.abs(selected.coordinates[1]).toFixed(4)}° {selected.coordinates[1] >= 0 ? "N" : "S"} <span>/</span> {Math.abs(selected.coordinates[0]).toFixed(4)}° {selected.coordinates[0] >= 0 ? "E" : "W"}</p>
          </aside>
        )}
      </section>

      <footer className="bottombar">
        <div className="footer-left"><span className="footer-mark">PDW</span><span>MADE TO BE EXPLORED.</span></div>
        <div className="footer-center"><span className="footer-light" /> {places.length} TEST LOCATIONS <span className="status-divider">/</span> IN DEVELOPMENT</div>
        <div className="footer-right">DESIGNED FOR CURIOSITY <span>↗</span></div>
      </footer>

      {introVisible && (
        <div className={`intro-overlay ${introLeaving ? "is-leaving" : ""}`}>
          <div className="intro-content">
            <div className="intro-orbit"><span /><i /><b /></div>
            <p className="intro-kicker">AN EXPERIMENT IN PERSONAL SPACE</p>
            <p className="intro-title">The world is<br /><em>not that far.</em></p>
            <p className="intro-copy">A map to begin with. A world to make your own.</p>
            <button className="enter-button" onClick={closeIntro}>ENTER THE MAP <span>↗</span></button>
            <button className="skip-button" onClick={closeIntro}>SKIP INTRO</button>
          </div>
          <span className="intro-index">PDW — 001</span><span className="intro-corner">INTERACTIVE ATLAS / FIRST STUDY</span>
        </div>
      )}
    </main>
  );
}