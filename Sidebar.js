// Sidebar.js - Main sidebar layout with search, legend, carousel, and project list
// Components: ProjectCard.js, ProjectCarousel.js, SearchBar.js
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Main Sidebar Component - orchestrates all sub-components
    window.StoryMapComponents.Sidebar = function Sidebar({ projects, allProjects, selected, onSelect, onSearch, onFiltersChange, onDeselect }) {
        const resultCount = projects.length;
        const totalCount = allProjects.length;

        const handleSelectProject = (project) => {
            onSelect(project);
        };

        return React.createElement('div',
            { className: 'sidebar' },
            // Search + Filters panel (top, compact)
            React.createElement('section',
                { className: 'sidebar__panel sidebar__controls' },
                // Search + Filters row
                React.createElement('div', { className: 'sidebar__search-legend' },
                    React.createElement('div', { className: 'sidebar__search-area' },
                        React.createElement(window.StoryMapComponents.SearchBar, {
                            onSearch: onSearch,
                            onFiltersChange: onFiltersChange,
                            resultCount: resultCount,
                            totalCount: totalCount,
                            allProjects: allProjects
                        })
                    )
                )
            ),
            // Carousel panel (visual browsing)
            React.createElement('section',
                { className: 'sidebar__panel sidebar__browse' },
                // Carousel (scrollable)
                React.createElement('div', { className: 'sidebar__carousel-browse' },
                    React.createElement(window.StoryMapComponents.ProjectCarousel, {
                        projects: projects,
                        onSelect: handleSelectProject,
                        selectedId: selected?.id
                    })
                )
            ),
            // Main region swaps between detail view and project list
            React.createElement('section',
                { className: 'sidebar__panel sidebar__main' },
                selected
                    ? React.createElement(window.StoryMapComponents.ProjectDetail, {
                        project: selected,
                        onDeselect: onDeselect
                    })
                    : (
                        projects.length > 0
                            ? React.createElement('div', { className: 'sidebar__list' },
                                projects.map(proj =>
                                    React.createElement(window.StoryMapComponents.ProjectCard, {
                                        key: proj.id,
                                        project: proj,
                                        onClick: handleSelectProject,
                                        isSelected: selected?.id === proj.id
                                    })
                                )
                            )
                            : React.createElement('div', { className: 'empty-state' },
                                'No projects match your search'
                            )
                    )
            )
        );
    };
})();
