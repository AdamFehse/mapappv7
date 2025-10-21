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
        const mapApiRef = React.useRef({ showProject: null, invalidateSize: null });
        const resizeFrameRef = React.useRef(null);

        // Component references (guaranteed to exist by index.html initialization check)
        const MapContainer = window.StoryMapComponents.MapContainer;
        const Sidebar = window.StoryMapComponents.Sidebar;
        const DraggableSplit = window.StoryMapComponents.DraggableSplit;

        // URL routing: Read hash on mount and listen for changes
        useEffect(() => {
            function handleHashChange() {
                const hash = window.location.hash;
                if (hash.startsWith('#project/')) {
                    const projectId = hash.replace('#project/', '');
                    const project = projects.find(p => p.id === projectId);
                    if (project) {
                        setSelected(project);
                        if (mapApiRef.current?.showProject) {
                            mapApiRef.current.showProject(project);
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

        // Ensure pending resize callbacks are cleared on unmount
        useEffect(() => {
            return () => {
                if (resizeFrameRef.current) {
                    cancelAnimationFrame(resizeFrameRef.current);
                    resizeFrameRef.current = null;
                }
            };
        }, []);

        if (loading) {
            return React.createElement('div',
                { className: 'flex items-center justify-center h-screen text-xl' },
                'Loading projects...'
            );
        }

        // Handle project selection - call map function directly and update URL
        function handleSelectProject(project) {
            setSelected(project);
            if (mapApiRef.current?.showProject) {
                mapApiRef.current.showProject(project);
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
        function handleMapReady(api) {
            mapApiRef.current = api || {};
            if (mapApiRef.current.invalidateSize) {
                mapApiRef.current.invalidateSize();
            }
        }

        // Handle filter changes (e.g. from SearchBar)
        function handleFilterChange(newCriteria) {
            setFilterCriteria(prev => ({ ...prev, ...newCriteria }));
        }

        function handleSplitResize() {
            if (!mapApiRef.current?.invalidateSize) return;
            if (resizeFrameRef.current) return;
            resizeFrameRef.current = requestAnimationFrame(() => {
                resizeFrameRef.current = null;
                mapApiRef.current.invalidateSize();
            });
        }

        return React.createElement('div', 
            { className: 'h-screen p-2 sm:p-4 bg-gray-100' },
            React.createElement(DraggableSplit, {
                className: 'gap-2 sm:gap-4',
                initialPrimary: 0.6,
                onPrimaryResize: handleSplitResize,
                primary: React.createElement('div', { className: 'flex-1 h-full' },
                    React.createElement(MapContainer, {
                        projects: filtered,
                        allProjects: projects,
                        onMapReady: handleMapReady,
                        onVisibleProjectsChange: setVisibleProjects,
                        onPopupClose: handleDeselectProject,
                        onMarkerClick: handleSelectProject
                    })
                ),
                secondary: React.createElement('div', { className: 'flex-1 min-h-0 h-full' },
                    React.createElement(Sidebar, {
                        projects: visibleProjects.length ? visibleProjects : filtered,
                        allProjects: projects, // Pass all projects for color index calculation
                        selected: selected,
                        onSelect: handleSelectProject,
                        onSearch: search => handleFilterChange({ search }),
                        onDeselect: handleDeselectProject
                    })
                )
            })
        );
    };
})();
