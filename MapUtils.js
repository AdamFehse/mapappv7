// MapUtils.js - Simple Leaflet marker creation with popup content
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    function sanitize(value) {
        if (value === undefined || value === null) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildPopupContent(proj) {
        const raw = proj.raw || {};
        const blocks = [];
        const title = sanitize(raw.ProjectName || proj.name || 'Project');
        blocks.push(`<strong>${title}</strong>`);

        if (raw.DescriptionShort) {
            blocks.push(`<div>${sanitize(raw.DescriptionShort)}</div>`);
        }
        if (raw.ProjectCategory) {
            blocks.push(`<div><em>Category:</em> ${sanitize(raw.ProjectCategory)}</div>`);
        }
        if (raw.Location) {
            blocks.push(`<div><em>Location:</em> ${sanitize(raw.Location)}</div>`);
        }
        if (raw.Year) {
            blocks.push(`<div><em>Year:</em> ${sanitize(raw.Year)}</div>`);
        }

        blocks.push(`<div style="margin-top:0.5rem;"><button type="button" class="popup-view-details-btn" style="background:#3b82f6;color:white;border:none;padding:0.4rem 0.8rem;border-radius:4px;cursor:pointer;font-size:0.85rem;font-weight:600;">View details</button></div>`);
        return blocks.join('');
    }

    function createMarker(proj, onMarkerClick) {
        const lat = proj.raw?.Latitude;
        const lng = proj.raw?.Longitude;
        if (!lat || !lng) return null;

        const marker = L.marker([lat, lng]);
        marker.bindPopup(buildPopupContent(proj), { maxWidth: 320 });

        if (typeof onMarkerClick === 'function') {
            marker.on('click', () => onMarkerClick(proj));
            marker.on('popupopen', () => {
                const popup = marker.getPopup();
                const node = popup && popup._contentNode;
                if (!node) return;

                const handleClick = (event) => {
                    if (event.target?.closest('.popup-view-details-btn')) {
                        event.preventDefault();
                        onMarkerClick(proj);
                    }
                };

                node.addEventListener('click', handleClick);
                marker.once('popupclose', () => node.removeEventListener('click', handleClick));
            });
        }

        return marker;
    }

    window.StoryMapComponents.MapUtils = {
        createMarker
    };
})();
