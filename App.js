// App.js
(function() {
    const { useState, useEffect, useMemo } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.App = function App() {
        const [projects, setProjects] = useState(window.projectData || []);
        const [selected, setSelected] = useState(null);
        // Centralized filter criteria
        const [filterCriteria, setFilterCriteria] = useState({ search: '' });
        const [loading, setLoading] = useState(!window.projectData?.length);
        const [visibleProjects, setVisibleProjects] = useState([]);
        const showProjectOnMap = React.useRef(null);

        // URL routing: Read hash on mount and listen for changes
        useEffect(() => {
            function handleHashChange() {
                const hash = window.location.hash;
                if (hash.startsWith('#project/')) {
                    const projectId = hash.replace('#project/', '');
                    const project = projects.find(p => p.id === projectId);
                    if (project) {
                        setSelected(project);
                        if (showProjectOnMap.current) {
                            showProjectOnMap.current(project);
                        }
                    }
                }
            }

            // Handle on mount
            handleHashChange();

            // Listen for hash changes
            window.addEventListener('hashchange', handleHashChange);
            return () => window.removeEventListener('hashchange', handleHashChange);
        }, [projects]);

        // Centralized filtering using ProjectFilter.js
        const filtered = useMemo(() => {
            return window.ProjectFilter.filter(projects, filterCriteria);
        }, [projects, filterCriteria]);

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

        // Handle project selection - call map function directly and update URL
        function handleSelectProject(project) {
            setSelected(project);
            if (showProjectOnMap.current) {
                showProjectOnMap.current(project);
            }
            // Update URL hash for shareable links
            if (project) {
                window.history.replaceState(null, '', `#project/${project.id}`);
            }
        }

        // Handle deselection - clear everything
        function handleDeselectProject() {
            setSelected(null);
            // Clear URL hash
            window.history.replaceState(null, '', window.location.pathname);
        }

        // Store the map's showProject function
        function handleMapReady(showProjectFn) {
            showProjectOnMap.current = showProjectFn;
        }

        // Handle filter changes (e.g. from SearchBar)
        function handleFilterChange(newCriteria) {
            setFilterCriteria(prev => ({ ...prev, ...newCriteria }));
        }

        return React.createElement('div', 
            { className: 'flex flex-col lg:flex-row h-screen p-2 sm:p-4 gap-2 sm:gap-4 bg-gray-100' },
            // Map - full width on mobile, 2/3 on desktop
            React.createElement('div',
                { className: 'w-full lg:w-2/3 h-1/2 lg:h-full' },
                React.createElement(MapContainer, {
                    projects: filtered,
                    allProjects: projects,
                    onMapReady: handleMapReady,
                    onVisibleProjectsChange: setVisibleProjects,
                    onPopupClose: handleDeselectProject,
                    onMarkerClick: handleSelectProject
                })
            ),
            // Sidebar - full width on mobile, 1/3 on desktop
            React.createElement('div',
                { className: 'w-full lg:w-1/3 h-1/2 lg:h-full' },
                React.createElement(Sidebar, {
                    projects: visibleProjects.length ? visibleProjects : filtered,
                    allProjects: projects, // Pass all projects for color index calculation
                    selected: selected,
                    onSelect: handleSelectProject,
                    onSearch: search => handleFilterChange({ search }),
                    onDeselect: handleDeselectProject
                })
            )
        );
    };
})();
