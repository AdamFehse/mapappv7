// Sidebar.js - Main sidebar layout (uses modular components)
// Components: ProjectDetail.js, ProjectCarousel.js, SearchBar.js
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Main Sidebar Component - orchestrates all sub-components
    window.StoryMapComponents.Sidebar = function Sidebar({ projects, allProjects, selected, onSelect, onSearch, onDeselect }) {
        const resultCount = projects.length;
        const totalCount = allProjects.length;

        return React.createElement('div',
            { className: 'flex flex-col h-full' },
            // Details panel (scrollable)
            React.createElement('div',
                { className: 'flex-grow min-h-0 overflow-auto' },
                React.createElement('div',
                    { className: 'bg-white rounded-lg shadow w-full h-full' },
                    React.createElement(window.StoryMapComponents.ProjectDetail, {
                        project: selected,
                        allProjects: allProjects,
                        onDeselect: onDeselect
                    })
                )
            ),
            // Search bar with result count (fixed, separate)
            React.createElement('div',
                { className: 'flex-shrink-0 mt-2' },
                React.createElement(window.StoryMapComponents.SearchBar, {
                    onSearch: onSearch,
                    resultCount: resultCount,
                    totalCount: totalCount
                })
            ),
            // Carousel panel (fixed, separate)
            React.createElement('div',
                { className: 'flex-shrink-0 mt-2' },
                React.createElement('div',
                    { className: 'bg-white rounded-lg shadow p-2' },
                    React.createElement(window.StoryMapComponents.ProjectCarousel, {
                        projects: projects,
                        allProjects: allProjects,
                        onSelect: onSelect,
                        selectedId: selected?.id
                    })
                )
            )
        );
    };
})();
