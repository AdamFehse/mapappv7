// Configuration for Story Map App
(function() {
    const CONFIG = {
        center: [31.313354, -110.945987],
        zoom: 7,
        dataUrl: 'https://raw.githubusercontent.com/AdamFehse/mapappv7/refs/heads/main/storymapdata_v3.json',
        tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    };

    // Initialize global state
    window.mapConfig = CONFIG;
    window.projectData = [];

    // Load project data from remote source
    fetch(CONFIG.dataUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch project data (${res.status})`);
            }
            return res.json();
        })
        .then(data => {
            window.projectData = data.map((proj) => ({
                id: proj.id,
                name: proj.ProjectName || '',
                description: proj.DescriptionShort || proj.DescriptionLong || '',
                image: proj.ImageUrl || '',
                raw: proj
            }));
            window.dispatchEvent(new Event('projectDataLoaded'));
        })
        .catch(err => {
            console.error('Failed to load project data:', err);
        });
})();
