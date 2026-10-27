# Personal Digital World

An experimental first-person digital environment: part neural universe, part physical architecture. The world map is one destination inside the larger space, not the homepage's central purpose.

## Prototype 02 — The Nexus

- First-person mouse look with pointer lock.
- WASD / arrow-key movement; Shift moves faster.
- Dark atmosphere, floating neural connections, glowing structures, and four region landmarks.
- Click a landmark to enter a simple immersive placeholder region.
- Return to the Nexus using the top-right control, home control, or E while inside a region.
- Toggle the controls panel with H.

The regions are placeholders, not complete content experiences. The Atlas is intentionally a future module; the existing map prototype should be integrated into it later.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
npm run build
```

## Architecture

- `src/App.tsx` — initial world scene, movement, landmarks, and placeholder interiors.
- `src/styles.css` — overlay UI and responsive presentation.
- React Three Fiber / Three.js — browser-based 3D scene and interaction.
- React Three Drei — pointer-lock controls, labels, stars, and particles.

Persistence, content editing, saved discoveries, complete region geometry, audio, proximity-based interaction, and integration of the existing map are future steps.