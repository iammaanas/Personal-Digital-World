import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Place={id:string;name:string;region:string;coordinates:[number,number];note:string};
const places:Place[]=[
{id:"mumbai",name:"Mumbai",region:"Asia · India",coordinates:[72.8777,19.076],note:"A starting point on the map."},
{id:"thimphu",name:"Thimphu",region:"Asia · Bhutan",coordinates:[89.639,27.4728],note:"A quiet marker in the Himalayas."},
{id:"tokyo",name:"Tokyo",region:"Asia · Japan",coordinates:[139.6917,35.6895],note:"A test marker for exploring the map."},
{id:"berlin",name:"Berlin",region:"Europe · Germany",coordinates:[13.405,52.52],note:"A test marker across the continent."},
{id:"reykjavik",name:"Reykjavík",region:"Europe · Iceland",coordinates:[-21.9426,64.1466],note:"A northern marker to test long-distance pan."}];
const W=1200,H=660;
const world=feature(worldData as never,(worldData as {objects:{countries:never}}).objects.countries) as unknown as {type:"FeatureCollection";features:Array<{type:"Feature";geometry:never}>};
export default function App(){
const svgRef=useRef<SVGSVGElement|null>(null),viewportRef=useRef<SVGGElement|null>(null);
const [selected,setSelected]=useState<Place|null>(null),[introVisible,setIntroVisible]=useState(true),[transform,setTransform]=useState<ZoomTransform>(zoomIdentity);
const projection=useMemo<GeoProjection>(()=>geoNaturalEarth1().fitExtent([[22,28],[W-22,H-28]],world as never),[]);
const path=useMemo(()=>geoPath(projection),[projection]);
const makeZoom=()=>zoom<SVGSVGElement,unknown>().scaleExtent([1,7]).on("zoom",e=>{if(viewportRef.current)select(viewportRef.current).attr("transform",e.transform.toString());setTransform(e.transform);});
useEffect(()=>{const svg=svgRef.current,viewport=viewportRef.current;if(!svg||!viewport)return;const behavior=zoom<SVGSVGElement,unknown>().scaleExtent([1,7]).translateExtent([[-W,-H],[W*2,H*2]]).on("zoom",e=>{select(viewport).attr("transform",e.transform.toString());setTransform(e.transform);});const s=select(svg);s.call(behavior).on("dblclick.zoom",null);return()=>{s.on(".zoom",null);};},[]);
const reset=()=>{if(svgRef.current)select(svgRef.current).transition().duration(420).call(makeZoom().transform,zoomIdentity);setSelected(null);};
const goTo=(p:Place)=>{setSelected(p);const xy=projection(p.coordinates),svg=svgRef.current;if(!xy||!svg)return;const k=2.6;const t=zoomIdentity.translate(W/2-xy[0]*k,H/2-xy[1]*k).scale(k);select(svg).transition().duration(650).call(makeZoom().transform,t);};
const zoomBy=(k:number)=>{if(svgRef.current)select(svgRef.current).transition().duration(220).call(makeZoom().scaleBy,k);};
return <main className="world-app">
<header className="topbar"><a className="wordmark" href="#" onClick={e=>{e.preventDefault();reset();}}><span className="wordmark-symbol">P<span>·</span>D<span>·</span>W</span><span className="wordmark-label">PERSONAL DIGITAL WORLD</span></a><div className="topbar-status"><span className="status-dot"/> PROTOTYPE 01 <span className="status-divider">/</span> WORLD MAP</div><button className="text-button" onClick={reset}>RESET VIEW <span>↺</span></button></header>
<section className="map-stage" aria-label="Interactive world map">
<div className="map-heading"><p className="eyebrow">A WORLD, STILL UNFOLDING</p><h1>Everywhere<span className="title-period">.</span></h1><p className="map-subtitle">A personal atlas of places, moments, and meaning.</p></div>
<svg ref={svgRef} className="world-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interactive world map. Drag to pan, use controls to zoom, and select a red marker.">
<defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="currentColor" strokeWidth=".55" opacity=".16"/></pattern><radialGradient id="map-glow"><stop offset="0%" stopColor="#182126" stopOpacity=".72"/><stop offset="100%" stopColor="#08090b" stopOpacity="0"/></radialGradient><filter id="marker-glow" x="-250%" y="-250%" width="600%" height="600%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width={W} height={H} fill="url(#grid)" className="map-grid"/><ellipse cx={W/2} cy={H/2} rx="500" ry="300" fill="url(#map-glow)"/>
<g ref={viewportRef} className="map-viewport"><g className="countries">{world.features.map((c,i)=><path key={i} d={path(c as never)??""} className="country-shape"/>)}</g>
<g className="graticule">{Array.from({length:11},(_,i)=>-150+i*30).map(lon=><path key={`lon-${lon}`} d={path({type:"LineString",coordinates:[[lon,-78],[lon,78]]} as never)??""}/>)}{[-60,-30,0,30,60].map(lat=><path key={`lat-${lat}`} d={path({type:"LineString",coordinates:[[-180,lat],[180,lat]]} as never)??""}/>)}</g>
{places.map(p=>{const xy=projection(p.coordinates);if(!xy)return null;const active=selected?.id===p.id;return <g key={p.id} className={`map-marker ${active?"is-selected":""}`} transform={`translate(${xy[0]},${xy[1]})`} role="button" tabIndex={0} aria-label={`Show ${p.name}`} onClick={()=>goTo(p)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();goTo(p);}}}><circle className="marker-halo" r={active?13:9}/><circle className="marker-core" r={active?4.2:3.2} filter="url(#marker-glow)"/><text className="marker-label" x="12" y="-11">{p.name.toUpperCase()}</text></g>;})}</g></svg>
<div className="map-coordinates"><span>EARTH / 001</span><span>WORLD ATLAS STUDY</span><span>ZOOM {Math.round(transform.k*100)}%</span></div><div className="map-controls"><button aria-label="Zoom in" onClick={()=>zoomBy(1.35)}>+</button><span className="control-rule"/><button aria-label="Zoom out" onClick={()=>zoomBy(1/1.35)}>−</button><span className="control-rule"/><button aria-label="Reset map" onClick={reset}>⌂</button></div><div className="map-hint"><span className="hint-cross">✳</span> DRAG TO EXPLORE <span className="hint-separator">·</span> SELECT A MARKER</div>
{selected&&<aside className="place-card" aria-live="polite"><button className="close-card" onClick={()=>setSelected(null)} aria-label="Close details">×</button><p className="eyebrow">LOCATION / {String(places.findIndex(p=>p.id===selected.id)+1).padStart(2,"0")}</p><h2>{selected.name}<span>.</span></h2><p className="place-region">{selected.region}</p><div className="card-rule"/><p className="place-note">{selected.note}</p><p className="place-coords">{Math.abs(selected.coordinates[1]).toFixed(4)}° {selected.coordinates[1]>=0?"N":"S"} <span>/</span> {Math.abs(selected.coordinates[0]).toFixed(4)}° {selected.coordinates[0]>=0?"E":"W"}</p></aside>}
</section>
<footer className="bottombar"><div className="footer-left"><span className="footer-mark">PDW</span><span>MADE TO BE EXPLORED.</span></div><div className="footer-center"><span className="footer-light"/> {places.length} TEST LOCATIONS <span className="status-divider">/</span> IN DEVELOPMENT</div><div className="footer-right">DESIGNED FOR CURIOSITY <span>↗</span></div></footer>
{introVisible&&<div className="intro-overlay"><div className="intro-content"><div className="intro-orbit"><span/><i/><b/></div><p className="intro-kicker">AN EXPERIMENT IN PERSONAL SPACE</p><p className="intro-title">The world is<br/><em>not that far.</em></p><p className="intro-copy">A map to begin with. A world to make your own.</p><button className="enter-button" onClick={()=>setIntroVisible(false)}>ENTER THE MAP <span>↗</span></button><button className="skip-button" onClick={()=>setIntroVisible(false)}>SKIP INTRO</button></div><span className="intro-index">PDW — 001</span><span className="intro-corner">INTERACTIVE ATLAS / FIRST STUDY</span></div>}
</main>;
}