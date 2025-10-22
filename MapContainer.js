// MapContainer.js - Leaflet map with project selection
(function() {
    const { useEffect, useRef } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.MapContainer = function MapContainer({
        projects = [],           // Filtered projects to display
        allProjects = [],        // All projects (for color consistency)
        onMapReady,              // Callback when map is initialized
        onVisibleProjectsChange, // Callback when visible projects change
        onPopupClose,            // Callback when popup/selection closes
        onMarkerClick            // Callback when marker is clicked
    }) {
        // Refs for map elements
        const mapRef = useRef(null);
        const leafletMapRef = useRef(null);
        const markersRef = useRef([]);
        const markersByIdRef = useRef({});  // Map project IDs to markers for efficient diffing
        const lastVisibleProjects = useRef([]);
        const { createMarker } = window.StoryMapComponents.MapUtils;

        // Initialize map
        useEffect(() => {
            if (!mapRef.current || mapRef.current._leaflet_id) return;

            const config = window.mapConfig;
            const map = L.map(mapRef.current).setView(config.center, config.zoom);
            L.tileLayer(config.tileUrl, { attribution: config.attribution }).addTo(map);

            leafletMapRef.current = map;
            setTimeout(() => map.invalidateSize(), 100);

            return () => {
                map.remove();
                leafletMapRef.current = null;
            };
        }, []);

        // Setup map click listener for deselection (separate effect)
        useEffect(() => {
            const map = leafletMapRef.current;
            if (!map || typeof onPopupClose !== 'function') return;

            const handleMapClick = (e) => {
                // Only deselect if clicking the map itself, not a marker
                // Markers will stop event propagation
                onPopupClose();
            };

            map.on('click', handleMapClick);

            return () => {
                map.off('click', handleMapClick);
            };
        }, [onPopupClose]);

        // Setup popup close listener
        useEffect(() => {
            const map = leafletMapRef.current;
            if (!map || typeof onPopupClose !== 'function') return;

            const handlePopupClose = () => {
                // Delay to check if another popup is opening (project switching)
                setTimeout(() => {
                    if (!map._popup) {
                        onPopupClose(); // User manually closed it
                    }
                }, 50);
            };

            map.on('popupclose', handlePopupClose);
            return () => map.off('popupclose', handlePopupClose);
        }, [onPopupClose]);

        // Function to show a project on the map
        const showProject = useRef((project) => {
            const map = leafletMapRef.current;

            if (!map || !project?.raw) return;

            const { Latitude, Longitude } = project.raw;
            if (!Latitude || !Longitude) return;

            // Find the marker
            const TOL = 1e-5;
            const marker = markersRef.current.find(m => {
                const latlng = m.getLatLng && m.getLatLng();
                return latlng && Math.abs(latlng.lat - Latitude) < TOL && Math.abs(latlng.lng - Longitude) < TOL;
            });

            if (!marker) return;

            // Marker is visible - check if it's already in view at a good zoom
            const currentZoom = map.getZoom();
            const markerLatLng = L.latLng(Latitude, Longitude);
            const bounds = map.getBounds();
            const isInView = bounds.contains(markerLatLng);
            const targetZoom = 13;

            // If marker is already visible and zoomed in enough, just open popup
            if (isInView && currentZoom >= targetZoom) {
                marker.openPopup();
                return;
            }

            // Otherwise, pan/zoom to the marker
            map.setView([Latitude, Longitude], Math.max(currentZoom, targetZoom), { animate: true });

            // Open popup after animation completes
            map.once('moveend', () => {
                marker.openPopup();
            });
        });

        // Update markers when projects change (with intelligent diffing)
        useEffect(() => {
            const map = leafletMapRef.current;
            if (!map) return;

            const previousMarkerIds = new Set(Object.keys(markersByIdRef.current));
            const currentProjectIds = new Set(projects.map(p => p.id));

            // Remove markers for projects no longer in the filtered list
            previousMarkerIds.forEach(id => {
                if (!currentProjectIds.has(id)) {
                    const marker = markersByIdRef.current[id];
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                    }
                    delete markersByIdRef.current[id];
                }
            });

            // Add new markers for projects not previously displayed
            projects.forEach((proj) => {
                if (!markersByIdRef.current[proj.id]) {
                    const marker = createMarker(proj, onMarkerClick);
                    if (marker) {
                        markersByIdRef.current[proj.id] = marker;
                        marker.addTo(map);
                    }
                }
            });

            markersRef.current = Object.values(markersByIdRef.current);

            // Initial visible projects
            setTimeout(() => {
                if (map && typeof onVisibleProjectsChange === 'function') {
                    const bounds = map.getBounds();
                    const visible = projects.filter(p => {
                        const lat = p.raw?.Latitude, lng = p.raw?.Longitude;
                        return lat && lng && bounds.contains([lat, lng]);
                    });
                    lastVisibleProjects.current = visible;
                    onVisibleProjectsChange(visible);
                }
            }, 100);

            // Listen for map move events to update visible projects
            if (map && typeof onVisibleProjectsChange === 'function') {
                const updateVisible = () => {
                    const bounds = map.getBounds();
                    const visible = projects.filter(p => {
                        const lat = p.raw?.Latitude, lng = p.raw?.Longitude;
                        return lat && lng && bounds.contains([lat, lng]);
                    });
                    // Use Set comparison instead of JSON.stringify for better performance
                    const lastIds = new Set(lastVisibleProjects.current.map(p => p.id));
                    const visibleIds = new Set(visible.map(p => p.id));
                    const hasChanged = lastIds.size !== visibleIds.size ||
                                     [...lastIds].some(id => !visibleIds.has(id));
                    if (hasChanged) {
                        lastVisibleProjects.current = visible;
                        onVisibleProjectsChange(visible);
                    }
                };
                map.on('moveend', updateVisible);
                map.on('zoomend', updateVisible);
                return () => {
                    map.off('moveend', updateVisible);
                    map.off('zoomend', updateVisible);
                };
            }
        }, [projects]);

        // Notify parent when map is ready - separate effect to avoid re-running
        useEffect(() => {
            if (typeof onMapReady !== 'function') return;
            const mapInstance = leafletMapRef.current;
            if (!mapInstance) return;
            onMapReady({
                showProject: showProject.current,
                invalidateSize: () => {
                    const map = leafletMapRef.current;
                    if (map) {
                        map.invalidateSize({ animate: false });
                    }
                }
            });
        }, [onMapReady, projects.length]);

        return React.createElement('section', { className: 'map-wrapper' },
            React.createElement('div', {
                ref: mapRef,
                className: 'map-frame',
                style: { minHeight: '200px' }
            })
        );
    };
})();
