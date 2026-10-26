# Personal Digital World

An experimental, map-first interactive world.

This repository begins with **Prototype 01: the world map**. The initial goal is to explore the world through a distinctive visual map with smooth pan and zoom, a small set of test markers, and a restrained intro transition.

## Current scope

- A full-world view on a dark, atmospheric canvas
- Pan and zoom for free exploration
- A small number of test markers
- Marker selection and a simple detail state
- A short intro reveal with a skip option

## Explicitly out of scope for Prototype 01

No travel journal, project catalogue, photo gallery, accounts, backend, or content-management system. These are not part of the first prototype.

## Initial technical direction

- React
- TypeScript
- SVG-based geographic rendering
- D3 Zoom for viewport interaction

This is an initial direction, not a commitment to a complete architecture. Keep the prototype small and easy to change.

## First success criteria

1. The world map feels compelling at global scale.
2. Pan and zoom are intuitive.
3. Interactions remain responsive while moving.
4. Test markers feel integrated into the map.
5. The intro transition is smooth and skippable.

## Development status

**Stage:** Baseline / prototype not yet implemented.

The first milestone is to establish the minimal application scaffold and render the map. Visual polish and additional interactions should follow from testing that baseline.

## Principles

- Map first.
- Small experiments before larger architecture.
- Keep dependencies intentional.
- Make the visual experience responsive and accessible.
- Avoid adding sections or features before the core map works.
