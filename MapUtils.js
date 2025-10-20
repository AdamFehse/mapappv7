// MapUtils.js - Utilities for creating map markers and popups
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Create popup HTML for a project, with Swiper gallery if multiple images
    function createPopup(proj, colorGradient) {
        // Gather all images: ImageUrl, proj.image, artworks
        const images = [];
        if (proj.raw?.ImageUrl) images.push({ url: proj.raw.ImageUrl, alt: proj.raw.ProjectName || proj.name });
        if (proj.image && proj.image !== proj.raw?.ImageUrl) images.push({ url: proj.image, alt: proj.name });
        if (Array.isArray(proj.raw?.Artworks)) {
            proj.raw.Artworks.forEach(art => {
                if (art.ImageUrl) images.push({ url: art.ImageUrl, alt: art.Title || 'Artwork' });
            });
        }

        let galleryHtml = '';
        if (images.length > 1) {
            const uniqueId = `popup-gallery-${Math.random().toString(36).substr(2, 9)}`;
            galleryHtml = `
                <div id="${uniqueId}" class="relative mb-1 w-full" style="height:90px;overflow:hidden;border-radius:8px;background:rgba(255,255,255,0.1);">
                    <div class="popup-gallery-track" style="display:flex;transition:transform 0.3s ease;width:${images.length * 100}%;">
                        ${images.map(img => `<div class="popup-gallery-slide" style="flex:0 0 ${100 / images.length}%;display:flex;align-items:center;justify-content:center;"><img src="${img.url}" alt="${img.alt}" class="h-20 max-w-full object-contain"/></div>`).join('')}
                    </div>
                    <div class="popup-gallery-dots" style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);display:flex;gap:4px;">
                        ${images.map((_, index) => `<button data-index="${index}" class="w-2 h-2 rounded-full border border-white/70 bg-white/40"></button>`).join('')}
                    </div>
                </div>
                <script>
                    (function() {
                        var root = document.getElementById('${uniqueId}');
                        if (!root) return;
                        var track = root.querySelector('.popup-gallery-track');
                        var dots = root.querySelectorAll('.popup-gallery-dots button');
                        if (!track || !dots.length) return;
                        function setSlide(idx) {
                            track.style.transform = 'translate3d(' + (-idx * 100) + '%, 0, 0)';
                            dots.forEach(function(dot, i) {
                                dot.style.opacity = i === idx ? '1' : '0.5';
                            });
                        }
                        dots.forEach(function(dot) {
                            dot.addEventListener('click', function() {
                                var idx = Number(dot.getAttribute('data-index'));
                                setSlide(idx);
                            });
                        });
                        setSlide(0);
                    })();
                </script>
            `;
        } else if (images.length === 1) {
            galleryHtml = `<img src="${images[0].url}" alt="${images[0].alt}" class="w-full h-20 object-contain rounded mb-1"/>`;
        }

        return `
            <div class="p-2 rounded-lg" style="min-width:200px;max-width:260px;background:${colorGradient};">
                ${galleryHtml}
                <div class="font-bold text-base mb-1 text-white">${proj.name || ''}</div>
                <div class="text-sm text-white opacity-90 mb-1">${proj.description || ''}</div>
                ${proj.raw?.Location ? `<div class="text-xs text-white opacity-75">${proj.raw.Location}</div>` : ''}
            </div>
        `;
    }

    // Create a Leaflet marker for a project
    function createMarker(proj, allProjects, onMarkerClick) {
        if (!proj.raw?.Latitude || !proj.raw?.Longitude) return null;

        // Find the project's index in the FULL allProjects array for consistent coloring
        const projectIndex = allProjects ? allProjects.findIndex(p => p.id === proj.id) : 0;
        const index = projectIndex >= 0 ? projectIndex : 0;

        // Get the color gradient for this project
        const colorUtils = window.ColorUtils;
        const gradientCSS = colorUtils ? colorUtils.getGradientCSS(index) : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
        const borderColor = colorUtils ? colorUtils.getStartColor(index) : '#3b82f6';

        const options = proj.image ? {
            icon: L.icon({
                iconUrl: proj.image,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -36],
                className: `border-2 shadow-lg rounded-full object-contain bg-white`,
                // Use inline style for colored border
                html: `<img src="${proj.image}" class="w-full h-full rounded-full object-cover" style="border:3px solid ${borderColor}"/>`
            })
        } : {};

        const marker = L.marker([proj.raw.Latitude, proj.raw.Longitude], options);
        marker.bindPopup(createPopup(proj, gradientCSS));

        // Add click handler to update app state when marker is clicked
        if (typeof onMarkerClick === 'function') {
            marker.on('click', () => {
                onMarkerClick(proj);
            });
        }

        return marker;
    }

    // Create and configure marker cluster group
    function createClusterGroup() {
        if (!L.markerClusterGroup) return null;

        return L.markerClusterGroup({
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            animate: true,
            animateAddingMarkers: false, // Faster rendering
            disableClusteringAtZoom: 14, // Decluster earlier (was 16)
            maxClusterRadius: 60, // Smaller cluster radius for better separation (was 80)
            spiderfyDistanceMultiplier: 1.5, // More spread when spiderfying
            iconCreateFunction: cluster => L.divIcon({
                html: `<span class='font-bold text-lg text-white'>${cluster.getChildCount()}</span>`,
                className: 'bg-blue-600 flex items-center justify-center rounded-full shadow-lg',
                iconSize: [40, 40]
            })
        });
    }

    // Export utilities
    window.StoryMapComponents.MapUtils = {
        createMarker,
        createClusterGroup
    };
})();
