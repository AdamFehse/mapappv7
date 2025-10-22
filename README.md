# Story Map App V7

An interactive story map application built with React, Leaflet, and Embla Carousel. This app displays projects on a map with rich details, filter/search capabilities, and interactive popups.

## Features

- **Interactive Map**: Leaflet-based map with marker clustering
- **Project Details**: Sidebar showing project information with responsive layout
- **Project Carousel**: Embla-based thumbnail carousel with smooth scrolling
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Advanced Search**: Filter projects by name, category, theme, product, and more
- **URL Routing**: Share direct links to specific projects with browser back/forward support
- **Result Counter**: See how many projects match your filters
- **Centralized Color System**: Consistent gradient colors across carousel, map, and detail views

## Getting Started

This app runs entirely in the browser with no build step required. Just open `index.html` in a web server.

## Technologies

- **React 18** (via CDN)
- **Leaflet** with MarkerCluster (via CDN)
- **Embla Carousel** (via CDN)
- **Tailwind CSS** (via CDN)
- **ColorUtils** - Centralized color palette and gradient system

## Data

The app first tries to load `storymapdata_v3.json` from the local bundle and automatically falls back to the published GitHub Pages JSON if the local file is unavailable.

## Project Structure

```
├── index.html              # Main HTML (CDN version)
├── App.js                  # Main React app with routing
├── MapContainer.js         # Leaflet map component
├── MapUtils.js             # Marker and popup creation utilities
├── Sidebar.js              # Project details sidebar layout
├── SearchBar.js            # Search input with result count
├── ProjectCarousel.js      # Embla-based thumbnail carousel
├── ProjectDetail.js        # Project detail view component
├── ProjectFilter.js        # Centralized filtering logic
├── ColorUtils.js           # Centralized color gradient system
├── config.js               # Map config and data loading
├── package.json            # NPM dependencies (for Vite build)
└── vite.config.js          # Vite bundler configuration
```

## License

MIT
