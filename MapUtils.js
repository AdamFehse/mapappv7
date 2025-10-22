// MapUtils.js - Utilities for creating map markers and popups
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Create engaging popup HTML with quick facts and view details button
    function createPopup(proj, colorGradient) {
        const image = proj.raw?.ImageUrl || proj.image;
        const raw = proj.raw || {};

        return `
            <article class="popup-card" style="background:${colorGradient};">
                ${image ? `<img src="${image}" alt="${proj.name}" class="popup-card__cover"/>` : ''}
                <div class="popup-card__body">
                    <div class="popup-card__title clamp-2">${proj.name || ''}</div>
                    ${raw.ProjectCategory ? `
                        <div class="popup-card__badge">
                            🏷️ ${raw.ProjectCategory}
                        </div>
                    ` : ''}
                    <div class="popup-card__facts">
                        ${raw.Location ? `
                            <div class="popup-card__fact">
                                <span>📍</span>
                                <span class="clamp-2">${raw.Location}</span>
                            </div>
                        ` : ''}
                        ${raw.Year ? `
                            <div class="popup-card__fact">
                                <span>📅</span>
                                <span>${raw.Year}</span>
                            </div>
                        ` : ''}
                        ${raw.Theme ? `
                            <div class="popup-card__fact">
                                <span>🎨</span>
                                <span class="clamp-1">${raw.Theme}</span>
                            </div>
                        ` : ''}
                        ${raw.Product ? `
                            <div class="popup-card__fact">
                                <span>⚙️</span>
                                <span class="clamp-1">${raw.Product}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${raw.DescriptionShort ? `
                        <p class="popup-card__description clamp-3">${raw.DescriptionShort}</p>
                    ` : ''}
                    <button class="popup-card__button popup-view-details-btn" type="button">
                        📖 View Full Details
                    </button>
                </div>
            </article>
        `;
    }

    // Get color from centralized palette (ColorUtils.js)
    function getCategoryColor(category) {
        const colorUtils = window.ColorUtils;
        return colorUtils ? colorUtils.getCategoryColor(category) : { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', border: '#3b82f6', light: '#E0E7FF' };
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

        const lat = proj.raw.Latitude;
        const lng = proj.raw.Longitude;

        const icon = proj.image
            ? L.divIcon({
                html: `
                    <span class="project-marker project-marker--image" style="--marker-border:${borderColor};">
                        <img src="${proj.image}" alt="${proj.name || 'Project marker'}" class="project-marker__image"/>
                    </span>
                `,
                className: 'project-marker-wrapper',
                iconSize: [46, 46],
                iconAnchor: [23, 46],
                popupAnchor: [0, -40]
            })
            : L.divIcon({
                html: `
                    <span class="project-marker project-marker--dot" style="--marker-border:${borderColor};background:${gradientCSS};"></span>
                `,
                className: 'project-marker-wrapper',
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -24]
            });

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(createPopup(proj, gradientCSS));

        // Add click handler to update app state when marker or popup button is clicked
        if (typeof onMarkerClick === 'function') {
            marker.on('click', () => {
                onMarkerClick(proj);
            });

            // Attach handler to popup content when it opens
            marker.on('popupopen', () => {
                const popup = marker.getPopup();
                if (popup) {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        const btn = popup._contentNode?.querySelector('.popup-view-details-btn');
                        if (btn) {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                onMarkerClick(proj);
                            });
                        }
                    }, 0);
                }
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
                html: `<span>${cluster.getChildCount()}</span>`,
                className: 'cluster-icon',
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
