# Story Map App V7

An interactive story map application built with React, Leaflet, and Keen Slider. This app displays projects on a map with rich details, artwork galleries, and interactive popups.


## Features

- **Interactive Map**: Leaflet-based map with marker clustering
- **Project Details**: Scrollable interface showing Details, Artworks, Poems, Activities, and Outcomes
- **Image Galleries**: Keen Slider galleries for artworks and project images in popups
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Advanced Search**: Filter projects by name, description, PI, location, category, affiliation, or department
- **Project Carousel**: Swipe through visible projects with color-coded thumbnails
- **URL Routing**: Share direct links to specific projects
- **Result Counter**: See how many projects match your search
- **Consistent Colors**: Projects use the same gradient colors across carousel, map popups, and detail views

## GitHub Pages Deployment

This app is deployed to GitHub Pages at: `https://adamfehse.github.io/mapappv7/`

## Technologies

- **React 18** (Production builds via CDN)
- **Leaflet** with MarkerCluster
- **Keen Slider** (single slider library for all carousels and galleries)
- **Tailwind CSS**
- **ColorUtils** - Centralized color palette system

## Project Structure

```
├── index.html              # Main HTML (CDN version)
├── App.js                  # Main React app with routing
├── MapContainer.js         # Leaflet map component
├── MapUtils.js             # Marker and popup creation utilities
├── Sidebar.js              # Project details sidebar layout
├── SearchBar.js            # Search input with result count
├── ProjectCarousel.js      # Keen Slider thumbnail carousel
├── ProjectDetail.js        # Project detail view component
├── ProjectFilter.js        # Centralized filtering logic
├── ColorUtils.js           # Centralized color gradient system
├── config.js               # Map config and data loading
├── package.json            # NPM dependencies (for Vite build)
└── vite.config.js          # Vite bundler configuration
```

## License

MIT
