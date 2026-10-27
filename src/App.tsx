import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, PointerLockControls, Sparkles, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

type Region = "nexus" | "workshop" | "mind" | "atlas" | "archives";
type LandmarkData = {
  id: Exclude<Region, "nexus">;
  title: string;
  note: string;
  position: [number, number, number];
  color: string;
};

const landmarks: LandmarkData[] = [
  { id: "workshop", title: "THE WORKSHOP", note: "Projects · experiments · builds", position: [-7, 0, -7], color: "#ff795f" },
  { id: "mind", title: "THE MIND", note: "Ideas · learning · connections", position: [7, 0, -9], color: "#a98bff" },
  { id: "atlas", title: "THE ATLAS", note: "A world within the world", position: [-10, 0, 5], color: "#69c9d0" },
  { id: "archives", title: "THE ARCHIVES", note: "Resources · collections · discoveries", position: [10, 0, 4], color: "#e5bd72" },
];

const regionInfo: Record<Region, { title: string; label: string; description: string }> = {
  nexus: { title: "The Nexus", label: "ENTRY POINT / 001", description: "Wander toward a structure. Each landmark opens a different part of your digital world." },
  workshop: { title: "The Workshop", label: "REGION / 002", description: "Projects, experiments, code, and things still being built." },
  mind: { title: "The Mind", label: "REGION / 003", description: "Ideas, learning, notes, and unexpected connections." },
  atlas: { title: "The Atlas", label: "REGION / 004", description: "The world map as one module inside a much larger digital world." },
  archives: { title: "The Archives", label: "REGION / 005", description: "References, media, resources, and discoveries worth keeping." },
};

function Player() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const movement = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => { keys.current[event.code] = true; };
    const onUp = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    const onBlur = () => { keys.current = {}; };
    camera.position.set(0, 1.7, 8);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [camera]);

  useFrame((_, delta) => {
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    movement.set(0, 0, 0);
    if (keys.current.KeyW || keys.current.ArrowUp) movement.add(forward);
    if (keys.current.KeyS || keys.current.ArrowDown) movement.sub(forward);
    if (keys.current.KeyD || keys.current.ArrowRight) movement.sub(right);
    if (keys.current.KeyA || keys.current.ArrowLeft) movement.add(right);

    if (movement.lengthSq() > 0) {
      const fast = keys.current.ShiftLeft || keys.current.ShiftRight;
      movement.normalize().multiplyScalar((fast ? 8 : 4.5) * Math.min(delta, 0.05));
      camera.position.add(movement);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -24, 24);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -24, 24);
      camera.position.y = 1.7;
    }
  });
  return null;
}

function Landmark({ item, onEnter }: { item: LandmarkData; onEnter: (region: Region) => void }) {
  const [hovered, setHovered] = useState(false);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = 0.1 + Math.sin(clock.elapsedTime + item.position[0]) * 0.13;
  });

  return (
    <group
      ref={group}
      position={item.position}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      onClick={(event) => { event.stopPropagation(); onEnter(item.id); }}
    >
      <Float speed={1} floatIntensity={0.2} rotationIntensity={0.1}>
        <mesh position={[0, 1.5, 0]} scale={hovered ? 1.15 : 1}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={hovered ? 1.4 : 0.5} wireframe metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={1} />
        </mesh>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.4, 1.48, 48]} />
        <meshBasicMaterial color={item.color} transparent opacity={hovered ? 0.9 : 0.45} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 3, 0]} center distanceFactor={12} style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div className={hovered ? "landmark-label active" : "landmark-label"}>
          <i style={{ background: item.color }} />
          <b>{item.title}</b>
          <small>{item.note}</small>
        </div>
      </Html>
    </group>
  );
}

function NeuralLines() {
  const paths = useMemo(() => landmarks.map((item) => {
    const start = new THREE.Vector3(0, 1.6, -2);
    const end = new THREE.Vector3(item.position[0], 1, item.position[2]);
    const middle = start.clone().lerp(end, 0.5);
    middle.y += 3;
    return new THREE.QuadraticBezierCurve3(start, middle, end).getPoints(36);
  }), []);

  return (
    <>
      {paths.map((points, index) => (
        <line key={landmarks[index].id}>
          <bufferGeometry attach="geometry" onUpdate={(geometry) => geometry.setFromPoints(points)} />
          <lineBasicMaterial color={landmarks[index].color} transparent opacity={0.42} />
        </line>
      ))}
    </>
  );
}

function Scene({ region, onEnter }: { region: Region; onEnter: (region: Region) => void }) {
  const pillars = useMemo(() => Array.from({ length: 26 }, (_, index) => {
    const angle = index / 26 * Math.PI * 2;
    return { x: Math.cos(angle) * (17 + index % 3), z: Math.sin(angle) * (17 + index % 3), height: 2.5 + index % 5 * 1.2 };
  }), []);
  const accent = region === "mind" ? "#a98bff" : region === "atlas" ? "#69c9d0" : region === "archives" ? "#e5bd72" : "#ff795f";

  return (
    <>
      <color attach="background" args={["#05080c"]} />
      <fog attach="fog" args={["#05080c", 18, 43]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#b6d5ff", "#10151a", 0.6]} />
      <pointLight position={[0, 10, 0]} color="#6ed4ce" intensity={28} distance={34} />
      <pointLight position={[-8, 5, -7]} color="#ff795f" intensity={12} distance={20} />
      <pointLight position={[8, 5, -9]} color="#a98bff" intensity={12} distance={20} />
      <Stars radius={80} depth={40} count={1300} factor={3} saturation={0.25} fade speed={0.3} />
      <Sparkles count={180} scale={[42, 12, 42]} size={1.8} speed={0.2} color="#8edbd5" opacity={0.45} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <circleGeometry args={[27, 96]} />
        <meshStandardMaterial color="#0b151a" roughness={0.85} metalness={0.25} />
      </mesh>
      <gridHelper args={[54, 54, "#254047", "#14252b"]} position={[0, -0.04, 0]} />
      {pillars.map((pillar, index) => (
        <group key={index} position={[pillar.x, pillar.height / 2 - 0.08, pillar.z]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.34, pillar.height, 6]} />
            <meshStandardMaterial color="#172a30" metalness={0.65} />
          </mesh>
          <mesh position={[0, pillar.height / 2 + 0.08, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#9be5dc" emissive="#4abfb5" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
      {region === "nexus" ? (
        <>
          {landmarks.map((item) => <Landmark key={item.id} item={item} onEnter={onEnter} />)}
          <NeuralLines />
        </>
      ) : (
        <>
          <gridHelper args={[38, 38, accent, "#17242b"]} position={[0, -0.02, 0]} />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = index / 12 * Math.PI * 2;
            return (
              <Float key={index} speed={0.8} floatIntensity={0.35}>
                <mesh position={[Math.cos(angle) * (5 + index % 3), 1.5 + index % 4 * 0.7, Math.sin(angle) * (5 + index % 3)]}>
                  <octahedronGeometry args={[0.5 + index % 3 * 0.15, 1]} />
                  <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} wireframe={index % 2 === 0} />
                </mesh>
              </Float>
            );
          })}
          <Sparkles count={150} scale={[24, 10, 24]} color={accent} />
        </>
      )}
      <Player />
      <PointerLockControls selector="#world-lock-target" />
    </>
  );
}

export default function App() {
  const [region, setRegion] = useState<Region>("nexus");
  const [help, setHelp] = useState(true);
  const [locked, setLocked] = useState(false);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const updateLock = () => setLocked(document.pointerLockElement !== null);
    document.addEventListener("pointerlockchange", updateLock);
    return () => document.removeEventListener("pointerlockchange", updateLock);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "KeyE" && region !== "nexus") setRegion("nexus");
      if (event.code === "KeyH") setHelp((visible) => !visible);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [region]);

  const startExploration = () => {
    setIntro(false);
    document.getElementById("world-lock-target")?.requestPointerLock?.();
  };

  const enterRegion = (nextRegion: Region) => {
    setRegion(nextRegion);
    if (document.pointerLockElement) document.exitPointerLock();
  };

  const current = regionInfo[region];

  return (
    <main className="world-shell">
      <div className="world-canvas" id="world-lock-target" tabIndex={0}>
        <Canvas camera={{ position: [0, 1.7, 8], fov: 70, near: 0.1, far: 100 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            <Scene region={region} onEnter={enterRegion} />
          </Suspense>
        </Canvas>
      </div>
      <header className="world-topbar">
        <a className="world-brand" href="#" onClick={(event) => { event.preventDefault(); setRegion("nexus"); }}>
          <span className="brand-mark">P<span>·</span>D<span>·</span>W</span>
          <span className="brand-caption">PERSONAL DIGITAL WORLD</span>
        </a>
        <div className="region-indicator"><i /> {current.label}</div>
        <button className="quiet-button" onClick={() => { setRegion("nexus"); setIntro(false); }}>
          RETURN TO NEXUS <span>↗</span>
        </button>
      </header>
      <section className="world-title-block">
        <p className="micro-label">{current.label}</p>
        <h1>{current.title}<span>.</span></h1>
        <p>{current.description}</p>
      </section>
      {region === "nexus" && <div className="world-footnote"><i /> THE WORLD IS A WORK IN PROGRESS</div>}
      <div className="world-interaction-hint">
        {region === "nexus" ? <><span className="keycap">WASD</span> MOVE <b>/</b> <span className="keycap">MOUSE</span> LOOK <b>/</b> CLICK A LANDMARK</> : <><span className="keycap">E</span> RETURN TO NEXUS <b>/</b> EXPLORE THIS SPACE</>}
      </div>
      <div className="world-utility">
        <button onClick={() => setHelp((visible) => !visible)} aria-label="Toggle controls help">?</button>
        <button onClick={() => { setRegion("nexus"); setIntro(false); }} aria-label="Return to Nexus">⌂</button>
      </div>
      {help && (
        <aside className="controls-card">
          <button className="controls-close" onClick={() => setHelp(false)} aria-label="Close controls">×</button>
          <p className="micro-label">FIELD NOTES / CONTROLS</p>
          <div><span className="keycap">W</span><span className="keycap">A</span><span className="keycap">S</span><span className="keycap">D</span><small>Move</small></div>
          <div><span className="keycap wide">MOUSE</span><small>Look around</small></div>
          <div><span className="keycap wide">SHIFT</span><small>Move faster</small></div>
          <div><span className="keycap wide">CLICK</span><small>Enter landmark</small></div>
          <div><span className="keycap wide">ESC</span><small>Release mouse</small></div>
          <p className="controls-foot">Press H to toggle these notes.</p>
        </aside>
      )}
      {!locked && !intro && <button className="relock-prompt" onClick={startExploration}>CLICK TO RESUME EXPLORATION <span>↗</span></button>}
      {intro && (
        <div className="entry-overlay">
          <div className="entry-orbit"><span /><i /><b /></div>
          <p className="micro-label">AN EXPERIMENT IN PERSONAL SPACE</p>
          <h2>A world of<br /><em>your own.</em></h2>
          <p className="entry-copy">Not a website to browse. A place to explore.</p>
          <button className="enter-world-button" onClick={startExploration}>ENTER THE WORLD <span>↗</span></button>
          <button className="entry-skip" onClick={() => setIntro(false)}>LOOK AROUND FIRST</button>
          <div className="entry-footer"><span>PROTOTYPE 02</span><span>MOVE WITH INTENTION.</span></div>
        </div>
      )}
    </main>
  );
}
