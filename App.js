// App.js
(function() {
    const { useState, useEffect, useMemo } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.App = function App() {
        const [projects, setProjects] = useState(window.projectData || []);
        const [selected, setSelected] = useState(null);
        const [search, setSearch] = useState('');
        const [loading, setLoading] = useState(!window.projectData?.length);
        const showProjectOnMap = React.useRef(null);

        // Filter projects based on search
        const filtered = useMemo(() => {
            if (!search) return projects;
            const term = search.toLowerCase();
            return projects.filter(p => 
                p.name?.toLowerCase().includes(term) || 
                p.description?.toLowerCase().includes(term)
            );
        }, [projects, search]);

        // Load project data
        useEffect(() => {
            function handleDataLoaded() {
                setProjects(window.projectData || []);
                setLoading(false);
            }
            window.addEventListener('projectDataLoaded', handleDataLoaded);
            return () => window.removeEventListener('projectDataLoaded', handleDataLoaded);
        }, []);

        if (loading) {
            return React.createElement('div', 
                { className: 'flex items-center justify-center h-screen text-xl' },
                'Loading projects...'
            );
        }

        const MapContainer = window.StoryMapComponents.MapContainer;
        const Sidebar = window.StoryMapComponents.Sidebar;

        // Handle project selection - call map function directly
        function handleSelectProject(project) {
            setSelected(project);
            if (showProjectOnMap.current) {
                showProjectOnMap.current(project);
            }
        }

        // Store the map's showProject function
        function handleMapReady(showProjectFn) {
            showProjectOnMap.current = showProjectFn;
        }

        return React.createElement('div', 
            { className: 'flex flex-col lg:flex-row h-screen p-2 sm:p-4 gap-2 sm:gap-4 bg-gray-100' },
            // Map - full width on mobile, 2/3 on desktop
            React.createElement('div', 
                { className: 'w-full lg:w-2/3 h-1/2 lg:h-full' },
                React.createElement(MapContainer, {
                    projects: filtered,
                    onMapReady: handleMapReady
                })
            ),
            // Sidebar - full width on mobile, 1/3 on desktop
            React.createElement('div', 
                { className: 'w-full lg:w-1/3 h-1/2 lg:h-full' },
                React.createElement(Sidebar, {
                    projects: filtered,
                    selected: selected,
                    onSelect: handleSelectProject,
                    onSearch: setSearch
                })
            )
        );
    };
})();
