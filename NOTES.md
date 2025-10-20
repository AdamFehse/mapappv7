# Working Notes – Story Map App

## Recent Updates
- Replaced Keen Slider usage with Embla Carousel for the thumbnail strip, adding wheel/touchpad support and responsive controls.
- Implemented the scale-based Embla variant with custom styling, parallax-to-scale transition, and a progress bar indicator to minimise sidebar real estate.
- Added draggable split layout between map and sidebar, ensuring Leaflet resizes smoothly.
- Cleaned map popups to use a lightweight inline gallery (no external slider dependency).

## Next Steps
1. Differentiate content across surfaces: give map popups a teaser (quote/stat) and use the sidebar header for new context (status, impact tag, timeline).
2. Enrich the sidebar body with engagement modules (related projects, “Why it matters” blurbs, share/bookmark actions).
3. Explore CTAs or interactive affordances that encourage deeper project exploration beyond the carousel (e.g., featured tracks, spotlight callouts).

## Simplify Opportunities
- **App.js**: tighten the hash listener (cache `id → project`, avoid re-adding the handler each time `projects` changes) and short-circuit the `projectDataLoaded` listener when data is already present.
- **MapContainer.js**: stop recreating all markers on every filter change (diff by id), replace `JSON.stringify` comparisons with a `Set`, and call `onMapReady` only once after mount.
- **MapUtils.js**: remove inline `<script>` injection in popups (use delegated events) and switch marker icons to `L.divIcon` so the border HTML shrinks.
- **ProjectCarousel.js**: migrate injected CSS to utilities or a shared stylesheet to drop boilerplate; keep the Embla setup but centralise configuration.
- **Global pattern**: consider moving from IIFEs + globals to ES modules to drop repeated scaffolding once a module loader is available.

_Last updated_: 2024-05-19
