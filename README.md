# Story Map App V7

An interactive story map application built with React, Leaflet, and Keen Slider. This app displays projects on a map with rich details, artwork galleries, and interactive popups.

**DEMO:** https://adamfehse.github.io/mapappv7/

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

## Local Development

### Quick Start (CDN Version)
Simply open `index.html` in a browser. All dependencies are loaded from CDNs.

```bash
# Using Python
python -m http.server 8000

# Or using Node
npx http-server
```

### Production Build (Vite - Optional)
For optimized bundle sizes and faster load times:

```bash
# Install dependencies (first time only)
npm install

# Run dev server with hot reload
npm run dev

# Build for production (outputs to dist/)
npm run build
```

**Benefits of Vite build:**
- 50% smaller bundle size (~200KB vs ~400KB)
- Code splitting and tree shaking
- Fast dev server with hot module replacement
- Optimized for production deployment

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

## Recent Optimizations

- ✅ **Removed Swiper** - Now uses only Keen Slider (saved ~100KB)
- ✅ **Removed Animate.css** - Unused library (saved ~50KB)
- ✅ **Consolidated Colors** - Single color system for consistency
- ✅ **Production React** - Smaller, faster React builds
- ✅ **URL Routing** - Shareable project links via hash routing
- ✅ **Expanded Search** - Search across all project fields
- ✅ **Result Counter** - See filtered vs total project count

**Total size reduction: ~150KB + faster page loads**

## License

MIT
