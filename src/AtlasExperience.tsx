import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import "./AtlasExperience.css";

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
  (worldData as unknown as { objects: { countries: never } }).objects.countries,
) as unknown as { type: "FeatureCollection"; features: Array<{ type: "Feature"; geometry: never }> };

export default function AtlasExperience({ onExit }: { onExit: () => void }) {
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (introTimer.current !== null) window.clearTimeout(introTimer.current);
    };
  }, [onExit]);

  const closeIntro = useCallback(() => {
    if (introTimer.current !== null) window.clearTimeout(introTimer.current);
    setIntroLeaving(true);
    introTimer.current = window.setTimeout(() => setIntroVisible(false), 420);
  }, []);

  const reset = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      zoomBehaviorRef.current.transform(select(svgRef.current), zoomIdentity);
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
    const startTransform = transform;
    const start = performance.now();
    const duration = 520;
    const selection = select(svg);
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      behavior.transform(selection, zoomIdentity
        .translate(
          startTransform.x + (next.x - startTransform.x) * eased,
          startTransform.y + (next.y - startTransform.y) * eased,
        )
        .scale(startTransform.k + (next.k - startTransform.k) * eased));
      if (progress < 1) window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
  }, [projection, transform]);

  const zoomBy = useCallback((amount: number) => {
    if (svgRef.current && zoomBehaviorRef.current) {
      zoomBehaviorRef.current.scaleBy(select(svgRef.current), amount);
    }
  }, []);

  return (
    <div className="atlas-experience">
      <main className="atlas-world-app">
        <header className="atlas-topbar">
          <div className="atlas-brand">
            <span className="atlas-brand-symbol">P<span>·</span>DW</span>
            <span className="atlas-brand-label">PERSONAL DIGITAL WORLD <i>/</i> ATLAS</span>
          </div>
          <div className="atlas-topbar-status"><span className="atlas-status-dot" /> A WORLD, STILL UNFOLDING</div>
          <button className="atlas-exit-button" onClick={onExit}><span aria-hidden="true">←</span> BACK TO PDW</button>
        </header>

        <section className="atlas-map-stage" aria-label="Interactive world map">
          <div className="atlas-map-heading">
            <p className="atlas-eyebrow">A PERSONAL ATLAS</p>
            <h1>Everywhere<span>.</span></h1>
            <p className="atlas-map-subtitle">A world of places, moments, and meaning.</p>
          </div>

          <svg ref={svgRef} className="atlas-world-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interactive world map. Drag to pan, use controls to zoom, and select a marker.">
            <defs>
              <pattern id="atlas-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0 L0 0 0 60" fill="none" stroke="currentColor" strokeWidth=".55" opacity=".16" />
              </pattern>
              <radialGradient id="atlas-map-glow"><stop offset="0%" stopColor="#182126" stopOpacity=".72" /><stop offset="100%" stopColor="#08090b" stopOpacity="0" /></radialGradient>
              <filter id="atlas-marker-glow" x="-250%" y="-250%" width="600%" height="600%">
                <feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width={W} height={H} fill="url(#atlas-grid)" className="atlas-map-grid" />
            <ellipse cx={W / 2} cy={H / 2} rx="500" ry="300" fill="url(#atlas-map-glow)" />
            <g ref={viewportRef} className="atlas-map-viewport">
              <g className="atlas-countries">
                {world.features.map((country, index) => <path key={index} d={path(country as never) ?? ""} className="atlas-country-shape" />)}
              </g>
              <g className="atlas-graticule">
                {Array.from({ length: 11 }, (_, index) => -150 + index * 30).map(longitude => (
                  <path key={`lon-${longitude}`} d={path({ type: "LineString", coordinates: [[longitude, -78], [longitude, 78]] } as never) ?? ""} />
                ))}
                {[-60, -30, 0, 30, 60].map(latitude => (
                  <path key={`lat-${latitude}`} d={path({ type: "LineString", coordinates: [[-180, latitude], [180, latitude]] } as never) ?? ""} />
                ))}
              </g>
              {places.map(place => {
                const point = projection(place.coordinates);
                if (!point) return null;
                const active = selected?.id === place.id;
                return (
                  <g key={place.id} className={`atlas-map-marker ${active ? "is-selected" : ""}`} transform={`translate(${point[0]},${point[1]})`} role="button" tabIndex={0} aria-label={`Show ${place.name}`} onClick={() => goTo(place)} onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); goTo(place); }
                  }}>
                    <circle className="atlas-marker-halo" r={active ? 13 : 9} />
                    <circle className="atlas-marker-core" r={active ? 4.2 : 3.2} filter="url(#atlas-marker-glow)" />
                    <text className="atlas-marker-label" x="12" y="-11">{place.name.toUpperCase()}</text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="atlas-map-coordinates" aria-hidden="true">
            <span>EARTH / 001</span><span>WORLD ATLAS STUDY</span><span>ZOOM {Math.round(transform.k * 100)}%</span>
          </div>
          <div className="atlas-map-controls" aria-label="Map controls">
            <button aria-label="Zoom in" onClick={() => zoomBy(1.35)}>+</button><span />
            <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.35)}>−</button><span />
            <button aria-label="Reset map" onClick={reset}>⌂</button>
          </div>
          <div className="atlas-map-hint"><b>✳</b> DRAG TO EXPLORE <i>·</i> SELECT A MARKER</div>

          {selected && (
            <aside className="atlas-place-card" aria-live="polite">
              <button className="atlas-close-card" onClick={() => setSelected(null)} aria-label="Close details">×</button>
              <p className="atlas-eyebrow">LOCATION / {String(places.findIndex(place => place.id === selected.id) + 1).padStart(2, "0")}</p>
              <h2>{selected.name}<span>.</span></h2>
              <p className="atlas-place-region">{selected.region}</p>
              <div className="atlas-card-rule" />
              <p className="atlas-place-note">{selected.note}</p>
              <p className="atlas-place-coords">{Math.abs(selected.coordinates[1]).toFixed(4)}° {selected.coordinates[1] >= 0 ? "N" : "S"} <i>/</i> {Math.abs(selected.coordinates[0]).toFixed(4)}° {selected.coordinates[0] >= 0 ? "E" : "W"}</p>
            </aside>
          )}
        </section>

        <footer className="atlas-bottombar">
          <div><b>PDW</b><span>MADE TO BE EXPLORED.</span></div>
          <div><i /> {places.length} SAMPLE LOCATIONS <em>/</em> ATLAS MODULE</div>
          <div>DESIGNED FOR CURIOSITY <b>↗</b></div>
        </footer>

        {introVisible && (
          <div className={`atlas-intro-overlay ${introLeaving ? "is-leaving" : ""}`}>
            <div className="atlas-intro-content">
              <div className="atlas-intro-orbit"><span /><i /><b /></div>
              <p className="atlas-intro-kicker">A SPACE WITHIN YOUR DIGITAL WORLD</p>
              <p className="atlas-intro-title">The world is<br /><em>not that far.</em></p>
              <p className="atlas-intro-copy">A map to begin with. A world to make your own.</p>
              <button className="atlas-enter-button" onClick={closeIntro}>ENTER THE ATLAS <span>↗</span></button>
              <button className="atlas-skip-button" onClick={closeIntro}>SKIP INTRO</button>
            </div>
            <span className="atlas-intro-index">PDW — ATLAS / 001</span>
            <span className="atlas-intro-corner">INTERACTIVE ATLAS / FIRST STUDY</span>
          </div>
        )}
      </main>
    </div>
  );
}
