// MapContainer.js
(function() {
    const { useEffect, useRef } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.MapContainer = function MapContainer({ projects = [], onMapReady }) {
        const mapRef = useRef(null);
        const leafletMapRef = useRef(null);
        const clusterRef = useRef(null);
        const markersRef = useRef([]);
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

            map.closePopup();

            // If in cluster, use zoomToShowLayer
            if (cluster && cluster.hasLayer(marker)) {
                const parentCluster = cluster.getVisibleParent(marker);
                if (parentCluster && parentCluster !== marker) {
                    // Marker is clustered - zoom to show it and open popup
                    cluster.zoomToShowLayer(marker, () => {
                        marker.openPopup();
                    });
                    return;
                }
            }
            
            // Always setView, always open popup immediately and again on moveend
            const targetZoom = 14;
            map.setView([Latitude, Longitude], targetZoom, { animate: true });
            map.once('moveend', () => {
                marker.openPopup();
            });
            marker.openPopup();
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
                projects.forEach(proj => {
                    const marker = createMarker(proj);
                    if (marker) {
                        cluster.addLayer(marker);
                        markersRef.current.push(marker);
                    }
                });
                cluster.addTo(map);
                clusterRef.current = cluster;
            } else {
                // Fallback without clustering
                projects.forEach(proj => {
                    const marker = createMarker(proj);
                    if (marker) {
                        marker.addTo(map);
                        markersRef.current.push(marker);
                    }
                });
            }

        }, [projects]);

        // Notify parent when map is ready - separate effect to avoid re-running
        useEffect(() => {
            if (onMapReady && markersRef.current.length > 0) {
                onMapReady(showProject.current);
            }
        }, [projects, onMapReady]);

        return React.createElement('div', {
            ref: mapRef,
            className: 'w-full h-full rounded-lg shadow',
            style: { minHeight: '200px' }
        });
    };
})();
