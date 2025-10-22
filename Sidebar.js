// Sidebar.js - Main sidebar layout with inline project detail panel
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
            // Detail panel (fills remaining height, scrollable)
            React.createElement('article',
                { className: 'sidebar__panel sidebar__detail' },
                React.createElement(window.StoryMapComponents.ProjectDetail, {
                    project: selected,
                    onDeselect: onDeselect
                })
            ),
            // Search bar with result count
            React.createElement('section',
                { className: 'sidebar__panel sidebar__panel--padded' },
                React.createElement(window.StoryMapComponents.SearchBar, {
                    onSearch: onSearch,
                    onFiltersChange: onFiltersChange,
                    resultCount: resultCount,
                    totalCount: totalCount,
                    allProjects: allProjects
                })
            ),
            // Carousel panel (fixed, below search)
            React.createElement('section',
                { className: 'sidebar__panel sidebar__carousel' },
                    React.createElement(window.StoryMapComponents.ProjectCarousel, {
                        projects: projects,
                        onSelect: handleSelectProject,
                        selectedId: selected?.id
                    })
            ),
            // Project cards list (scrollable)
            React.createElement('section',
                { className: 'sidebar__panel sidebar__list' },
                projects.length > 0 ? projects.map(proj =>
                    React.createElement(window.StoryMapComponents.ProjectCard, {
                        key: proj.id,
                        project: proj,
                        onClick: handleSelectProject,
                        isSelected: selected?.id === proj.id
                    })
                ) : React.createElement('div', { className: 'empty-state' },
                    'No projects match your search'
                )
            )
        );
    };
})();
