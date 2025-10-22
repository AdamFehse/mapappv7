// MapUtils.js - Utilities for creating map markers and popups
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Create popup HTML - minimal preview style
    function createPopup(proj, colorGradient) {
        const image = proj.raw?.ImageUrl || proj.image;

        return `
            <div class="rounded-lg overflow-hidden" style="min-width:220px;max-width:280px;background:${colorGradient};">
                ${image ? `<img src="${image}" alt="${proj.name}" class="w-full h-24 object-cover"/>` : ''}
                <div class="p-2.5 text-white">
                    <div class="font-bold text-sm mb-1.5 line-clamp-2">${proj.name || ''}</div>
                    <div class="space-y-1 text-xs opacity-90">
                        ${proj.raw?.ProjectCategory ? `<div class="inline-block px-2 py-0.5 bg-white/20 rounded-full font-semibold">${proj.raw.ProjectCategory}</div>` : ''}
                        ${proj.raw?.Theme ? `<div class="text-xs opacity-80">${proj.raw.Theme}</div>` : ''}
                        ${proj.raw?.Location ? `<div class="text-xs opacity-75">📍 ${proj.raw.Location}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Get color based on project category
    function getCategoryColor(category) {
        const categoryColors = {
            'Art-Based Projects': { gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)', border: '#FF4444', light: '#FFE5E5' },
            'Research Projects': { gradient: 'linear-gradient(135deg, #4ECDC4 0%, #2DB8AA 100%)', border: '#1DA39F', light: '#E0F7F6' },
            'Education and Community Outreach': { gradient: 'linear-gradient(135deg, #FFE66D 0%, #FDD835 100%)', border: '#FBC02D', light: '#FFFEF0' }
        };
        return categoryColors[category] || { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', border: '#3b82f6', light: '#E0E7FF' };
    }

    // Create a Leaflet marker for a project
    function createMarker(proj, allProjects, onMarkerClick) {
        if (!proj.raw?.Latitude || !proj.raw?.Longitude) return null;

        // Get color based on category (priority) or fallback to index-based gradient
        let borderColor, gradientCSS;
        const category = proj.raw?.ProjectCategory;

        if (category) {
            const categoryStyle = getCategoryColor(category);
            borderColor = categoryStyle.border;
            gradientCSS = categoryStyle.gradient;
        } else {
            // Fallback to index-based coloring if no category
            const projectIndex = allProjects ? allProjects.findIndex(p => p.id === proj.id) : 0;
            const index = projectIndex >= 0 ? projectIndex : 0;
            const colorUtils = window.ColorUtils;
            gradientCSS = colorUtils ? colorUtils.getGradientCSS(index) : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
            borderColor = colorUtils ? colorUtils.getStartColor(index) : '#3b82f6';
        }

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
