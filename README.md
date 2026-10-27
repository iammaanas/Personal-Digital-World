# Personal Digital World

**A place for everything that makes you, you.**

Personal Digital World is a scrollable, personal digital environment for projects, ideas, geographical exploration, and resources worth keeping. It combines an editorial website layout with a distinctive atmospheric visual identity, subtle motion, and intuitive navigation.

This fresh direction intentionally replaces the earlier first-person 3D prototype. There is no Three.js scene, pointer lock, WASD movement, or game-style navigation. The site is explored by scrolling and by using the sticky section navigation.

## The destinations

- **The Workshop** — projects, experiments, prototypes, and creations.
- **The Mind** — learning, ideas, notes, and connections. This is a planned knowledge space.
- **The Atlas** — maps, places, travel notes, and geographical exploration; one module within the larger website.
- **The Archives** — references, media, resources, and discoveries worth keeping.

## Experience

- Long-form, scrollable layout with section navigation.
- Responsive desktop and mobile layouts.
- Dark and light themes.
- Abstract, CSS/SVG-based visual motifs; no heavy 3D renderer.
- Reduced-motion preference support.
- Project links and clear labels for sections still in development.

## Stack

- React + TypeScript
- Vite
- CSS, SVG, and browser-native Intersection Observer
- GitHub Pages with the repository subpath configured in `vite.config.ts`

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Current status

The overall page layout, navigation, project examples, visual language, theme toggle, and scroll interactions are implemented as the new foundation. The Mind, Atlas, and Archives sections are presentation-ready placeholders for future real content; they are not yet connected to a persistent content management system.

Repository: https://github.com/iammaanas/Personal-Digital-World  
Live site: https://iammaanas.github.io/Personal-Digital-World/
