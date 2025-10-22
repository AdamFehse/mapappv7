# Pico CSS Migration Plan

## Goals
1. Remove Tailwind usage in favor of [Pico CSS](https://picocss.com/) for a lean, semantic-first design system.
2. Unify layout and component styling so everything adheres to Pico conventions.
3. Preserve existing functionality (map interactions, carousel, filters) while simplifying the styling layer.

## Integration Strategy
- **Global Stylesheet**: Replace the Tailwind CDN in `index.html` with Pico CSS. Keep Leaflet, MarkerCluster, and Embla assets intact.
- **Design Tokens**: Favor Pico defaults (spacing, colors, typography). Only add lightweight custom rules when Pico lacks a native solution (e.g., Embla carousel specifics, draggable split layout).
- **Utility Cleanup**: Remove Tailwind class strings from React components. Use semantic HTML and Pico classes like `container`, `grid`, `card`, `button`, `badge`, `form-group`, `form-control`, `dropdown`.
- **Custom CSS Consolidation**: Create a single `styles/pico-overrides.css` (or reuse existing file) to host minimal overrides: split layout, legend positioning, Embla fine tuning, helper utilities (e.g., `muted`, `surface`).

## Component Refactor Outline

### App Shell (`App.js`)
- Wrap root layout in Pico's `.container-fluid` with a flex grid replacement using Pico's grid utilities (`grid`, `col-*`).
- Adjust loading state to use Pico's `grid` + `text-center` style (or inline flex via small custom rule if needed).
- Ensure `DraggableSplit` container integrates cleanly with Pico spacing (`padding`, `gap` adjustments handled via CSS variables or custom classes).

### Split Layout (`SplitLayout.js`)
- Retain JS logic but restyle generated markup with Pico-friendly class names.
- Move inline styles into `pico-overrides.css`: `.split-layout`, `.split-pane`, `.split-handle`.
- Adopt Pico color variables when setting backgrounds/borders for the handle.

### Map Area (`MapContainer.js`)
- Convert wrapper structure to semantic elements (`section`, `aside` for legend).
- Replace Tailwind class lists with Pico equivalents (`card`, `surface`, `grid`).
- Style the legend via `pico-overrides.css` to float over the map with a soft shadow consistent with Pico palettes.

### Sidebar Composition (`Sidebar.js`)
- Use Pico's `card` components for detail, search, carousel sections.
- Replace Tailwind spacing (`gap`, `space-y`) with semantic wrappers (`article`, `ul/li`) and Pico spacing classes.
- Ensure scroll containers use Pico's `overflow` conventions; add a custom helper class if required.

### Project Detail (`ProjectDetail.js`)
- Swap Tailwind typography classes with Pico headings (`h3`, `.contrast`, `.muted`).
- Use Pico's `badge`, `grid`, `table` styles where relevant.
- Update buttons (`onDeselect`) to Pico `button` variants.
- Move gradient / color-specific styles into CSS overrides while respecting category color usage from `ColorUtils`.

### Project Cards & Carousel (`ProjectCard.js`, `ProjectCarousel.js`, `styles/project-carousel.css`)
- Rebuild cards using Pico's `article`, `header`, `footer`, `.card` patterns.
- Simplify the gradient usage so Pico palettes dominate (keep category colors for differentiation).
- Update carousel controls to inherit Pico button styling; retain Embla-specific structure with minimal custom overrides.
- Rename existing stylesheet to `styles/carousel.css` (optional) and ensure it complements Pico rather than conflicting (font sizes, spacing).

### Search & Filters (`SearchBar.js`)
- Rework search input using Pico form markup (`form`, `fieldset`, `.grid`).
- Convert dropdowns into Pico-styled disclosure menus. If Pico lacks multi-select dropdown, craft a minimal custom dropdown styled via overrides.
- Align feedback text (result counts) with Pico's `.muted` text pattern.

### Supporting Utilities (`MapUtils.js`, etc.)
- Update any leftover Tailwind utility strings (e.g., marker popups, icons) with Pico-compatible class names or minimal inline styles.

## Implementation Steps
1. **Bootstrap Pico**: Update `index.html`, add new override stylesheet, verify base typography/spacing.
2. **Reskin Containers**: Tackle `App.js`, `SplitLayout.js`, and global layout CSS to ensure the map/sidebar layout works without Tailwind.
3. **Sidebar Stack**: Refactor `Sidebar.js`, `ProjectDetail.js`, `ProjectCard.js`, `SearchBar.js` to use Pico classes.
4. **Carousel & Extras**: Adapt `ProjectCarousel.js` and associated CSS; ensure buttons and progress bar fit Pico aesthetic.
5. **Map Touchups**: Finish `MapContainer.js`, legend styling, marker popups.
6. **QA Pass**: Load the app, confirm no visual regressions. Verify interactions (drag split, dropdowns, carousel, map popups).
7. **Cleanup**: Remove unused CSS/JS imports, document notable Pico overrides in `NOTES.md` or README if useful.

## Verification Checklist
- [ ] `index.html` references Pico CSS and new overrides file; Tailwind script removed.
- [ ] App renders with Pico base styling (typography, buttons, forms) and no missing assets.
- [ ] Split layout works at desktop and mobile breakpoints.
- [ ] Search filters operate and dropdown styling matches Pico.
- [ ] Carousel controls remain accessible and visually cohesive.
- [ ] Map legend and popups respect Pico design language.
- [ ] No Tailwind class strings remain in the codebase.

