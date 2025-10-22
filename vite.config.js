// NOTE: This project uses CDN-based libraries (React, Leaflet, Embla, etc)
// and does not require a build step. index.html can be served directly.
//
// This config file is kept for reference/future use but is not actively used.
// All dependencies are loaded from CDN in index.html.

import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/mapappv7/',
  server: {
    port: 3000
  }
});
