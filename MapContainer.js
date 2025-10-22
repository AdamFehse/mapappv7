// MapContainer.js - Leaflet map with marker clustering and project selection
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
        const clusterRef = useRef(null);
        const markersRef = useRef([]);
        const lastVisibleProjects = useRef([]);
        const { createMarker, createClusterGroup } = window.StoryMapComponents.MapUtils;

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
            const cluster = clusterRef.current;

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

            // Check if marker is in a cluster
            if (cluster && cluster.hasLayer(marker)) {
                const parentCluster = cluster.getVisibleParent(marker);
                if (parentCluster && parentCluster !== marker) {
                    // Marker is clustered - zoom to show it and open popup
                    cluster.zoomToShowLayer(marker, () => {
                        // After zoom completes, open popup
                        setTimeout(() => {
                            marker.openPopup();
                        }, 100);
                    });
                    return;
                }
            }

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

        // Update markers when projects change
        useEffect(() => {
            const map = leafletMapRef.current;
            if (!map) return;

            // Clear existing markers
            if (clusterRef.current) {
                map.removeLayer(clusterRef.current);
                clusterRef.current = null;
            }
            markersRef.current = [];

            // Create new cluster group and add markers
            const cluster = createClusterGroup();
            if (cluster) {
                projects.forEach((proj) => {
                    const marker = createMarker(proj, allProjects, onMarkerClick);
                    if (marker) {
                        cluster.addLayer(marker);
                        markersRef.current.push(marker);
                    }
                });
                cluster.addTo(map);
                clusterRef.current = cluster;
            } else {
                // Fallback without clustering
                projects.forEach((proj) => {
                    const marker = createMarker(proj, allProjects, onMarkerClick);
                    if (marker) {
                        marker.addTo(map);
                        markersRef.current.push(marker);
                    }
                });
            }

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
                    // Only update if changed
                    if (JSON.stringify(visible.map(p=>p.id)) !== JSON.stringify(lastVisibleProjects.current.map(p=>p.id))) {
                        lastVisibleProjects.current = visible;
                        onVisibleProjectsChange(visible);
                    }
                };
                map.on('moveend zoomend', updateVisible);
                return () => {
                    map.off('moveend zoomend', updateVisible);
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

        return React.createElement('div', {
            className: 'relative w-full h-full'
        },
            // Map container
            React.createElement('div', {
                ref: mapRef,
                className: 'w-full h-full rounded-lg shadow',
                style: { minHeight: '200px' }
            }),

            // Legend overlay
            React.createElement('div', {
                className: 'absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-400'
            },
                React.createElement('div', { className: 'text-xs font-bold text-gray-800 mb-2' }, 'Project Categories'),
                React.createElement('div', { className: 'space-y-1.5' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', {
                            className: 'w-4 h-4 rounded-full',
                            style: { background: '#FF6B6B' }
                        }),
                        React.createElement('span', { className: 'text-xs text-gray-700' }, 'Art-Based')
                    ),
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', {
                            className: 'w-4 h-4 rounded-full',
                            style: { background: '#4ECDC4' }
                        }),
                        React.createElement('span', { className: 'text-xs text-gray-700' }, 'Research')
                    ),
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', {
                            className: 'w-4 h-4 rounded-full',
                            style: { background: '#FFE66D' }
                        }),
                        React.createElement('span', { className: 'text-xs text-gray-700' }, 'Education')
                    )
                )
            )
        );
    };
})();
