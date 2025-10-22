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

        // Utility functions for URL routing
        const urlRouter = useMemo(() => ({
            parseProjectId: () => {
                const match = window.location.hash.match(/^#project\/(.+)$/);
                return match ? match[1] : null;
            },
            navigateToProject: (projectId) => {
                window.history.pushState({ projectId }, '', `#project/${projectId}`);
            },
            navigateHome: () => {
                window.history.pushState(null, '', window.location.pathname);
            }
        }), []);

        // URL routing: Handle hash changes and browser back button
        useEffect(() => {
            function handleHashChange() {
                const projectId = urlRouter.parseProjectId();
                if (projectId) {
                    const project = projects.find(p => p.id === projectId);
                    if (project) {
                        setSelected(project);
                        // Only show on map if map is ready
                        if (mapApiRef.current?.showProject) {
                            mapApiRef.current.showProject(project);
                        }
                    }
                } else {
                    setSelected(null);
                }
            }

            // Handle on mount
            handleHashChange();

            // Listen for hash changes (browser back/forward buttons)
            window.addEventListener('hashchange', handleHashChange);
            return () => window.removeEventListener('hashchange', handleHashChange);
        }, [projects, urlRouter]);

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
            return React.createElement('main',
                { className: 'app-shell app-shell--loading' },
                React.createElement('div', { className: 'loading-card' }, 'Loading projects...')
            );
        }

        // Handle project selection - call map function directly and update URL
        function handleSelectProject(project) {
            setSelected(project);
            if (mapApiRef.current?.showProject) {
                mapApiRef.current.showProject(project);
            }
            urlRouter.navigateToProject(project.id);
        }

        // Handle deselection - clear everything
        function handleDeselectProject() {
            setSelected(null);
            urlRouter.navigateHome();
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

        // Handle category/theme/product filter changes from SearchBar
        function handleFiltersChange(filters) {
            setFilterCriteria(prev => ({
                ...prev,
                categories: filters.categories || [],
                themes: filters.themes || [],
                products: filters.products || []
            }));
        }

        function handleSplitResize() {
            if (!mapApiRef.current?.invalidateSize) return;
            if (resizeFrameRef.current) return;
            resizeFrameRef.current = requestAnimationFrame(() => {
                resizeFrameRef.current = null;
                mapApiRef.current.invalidateSize();
            });
        }

        return React.createElement('main', 
            { className: 'app-shell' },
            React.createElement(DraggableSplit, {
                className: 'app-shell__split',
                initialPrimary: 0.6,
                onPrimaryResize: handleSplitResize,
                primary: React.createElement('section', { className: 'split-pane__content' },
                    React.createElement(MapContainer, {
                        projects: filtered,
                        allProjects: projects,
                        onMapReady: handleMapReady,
                        onVisibleProjectsChange: setVisibleProjects,
                        onPopupClose: handleDeselectProject,
                        onMarkerClick: handleSelectProject
                    })
                ),
                secondary: React.createElement('aside', { className: 'split-pane__content sidebar' },
                    React.createElement(Sidebar, {
                        projects: visibleProjects.length ? visibleProjects : filtered,
                        allProjects: projects, // Pass all projects for color index calculation
                        selected: selected,
                        onSelect: handleSelectProject,
                        onSearch: search => handleFilterChange({ search }),
                        onFiltersChange: handleFiltersChange,
                        onDeselect: handleDeselectProject
                    })
                )
            })
        );
    };
})();
