# Prototype 01 — World Map

## Goal

Build and evaluate the map itself before designing anything around it.

## Required in the first working prototype

- Global map composition
- Smooth pan and zoom
- A handful of sample markers
- Marker hover or focus state
- Marker selection with a minimal detail view
- A short intro reveal that can be skipped
- Responsive layout for desktop and smaller screens

## Visual direction

Start with a near-black background, restrained geographic outlines, and carefully used red markers. Prioritize legibility, atmosphere, and motion over decorative UI.

## Not required yet

- Travel journal or destinations database
- Project cards or portfolio sections
- Photo archive
- Authentication or user profiles
- Backend, CMS, or admin tools
- Complete real-world marker dataset
- Final production architecture

## Implementation sequence

1. Create a minimal React + TypeScript app.
2. Render an initial world map.
3. Add pan and zoom.
4. Add a few test markers.
5. Add marker selection and detail state.
6. Add and test the skippable intro.
7. Test responsiveness and tune the motion.

## Acceptance checklist

- [ ] The world is clearly recognizable at initial scale.
- [ ] Users can pan without unexpected page movement.
- [ ] Zooming feels controlled and remains centered around the interaction.
- [ ] Marker positions stay aligned with geography during pan and zoom.
- [ ] Markers are keyboard-focusable and have usable labels.
- [ ] Selection can be dismissed and the global view restored.
- [ ] Intro can be skipped.
- [ ] Layout works on desktop and mobile widths.

## Decision note

SVG geography and D3 Zoom are the current starting direction. Revisit this only if a small prototype demonstrates a concrete limitation.
