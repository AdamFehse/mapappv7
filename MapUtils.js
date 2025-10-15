// MapUtils.js - Utilities for creating map markers and popups
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Create popup HTML for a project, with Swiper gallery if multiple images
    function createPopup(proj) {
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
            // Swiper gallery
            galleryHtml = `
                <div class="swiper popup-swiper mb-1" style="width:100%;height:90px;">
                    <div class="swiper-wrapper">
                        ${images.map(img => `<div class="swiper-slide flex items-center justify-center"><img src="${img.url}" alt="${img.alt}" class="h-20 max-w-full object-contain rounded"/></div>`).join('')}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
                <script>
                setTimeout(function() {
                  if (window.Swiper) {
                    new window.Swiper('.popup-swiper', {
                      slidesPerView: 1,
                      pagination: { el: '.popup-swiper .swiper-pagination', clickable: true },
                      loop: true,
                      autoHeight: true
                    });
                  }
                }, 0);
                </script>
            `;
        } else if (images.length === 1) {
            galleryHtml = `<img src="${images[0].url}" alt="${images[0].alt}" class="w-full h-20 object-contain rounded mb-1"/>`;
        }

        return `
            <div class="p-1" style="min-width:180px;max-width:240px;">
                ${galleryHtml}
                <div class="font-bold text-base mb-1">${proj.name || ''}</div>
                <div class="text-xs text-gray-700 mb-1">${proj.description || ''}</div>
                ${proj.raw?.Location ? `<div class="text-xs text-gray-500">${proj.raw.Location}</div>` : ''}
            </div>
        `;
    }

    // Create a Leaflet marker for a project
    function createMarker(proj) {
        if (!proj.raw?.Latitude || !proj.raw?.Longitude) return null;

        const options = proj.image ? {
            icon: L.icon({
                iconUrl: proj.image,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -36],
                className: 'border-2 border-white shadow-lg rounded-full object-contain bg-white'
            })
        } : {};

        const marker = L.marker([proj.raw.Latitude, proj.raw.Longitude], options);
        marker.bindPopup(createPopup(proj));
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
            disableClusteringAtZoom: 16,
            maxClusterRadius: 80,
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
