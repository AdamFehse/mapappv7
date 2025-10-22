// Sidebar.js - Main sidebar layout with search, legend, carousel, and project list
// Components: ProjectCard.js, ProjectCarousel.js, SearchBar.js
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Main Sidebar Component - orchestrates all sub-components
    window.StoryMapComponents.Sidebar = function Sidebar({ projects, allProjects, selected, onSelect, onSearch, onFiltersChange, onDeselect }) {
        const { useState } = React;
        const resultCount = projects.length;
        const totalCount = allProjects.length;
        const [isDetailExpanded, setIsDetailExpanded] = useState(false);

        const handleSelectProject = (project) => {
            onSelect(project);
            setIsDetailExpanded(false); // Reset to preview mode when selecting new project
        };

        const handleExpandDetail = () => {
            setIsDetailExpanded(true);
        };

        const handleCollapseDetail = () => {
            setIsDetailExpanded(false);
        };

        const handleDeselect = () => {
            setIsDetailExpanded(false);
            onDeselect();
        };

        return React.createElement('div',
            { 
                className: `sidebar${isDetailExpanded && selected ? ' sidebar--detail-expanded' : ''}`,
                'data-detail-mode': isDetailExpanded ? 'expanded' : 'preview'
            },
            // Search + Filters panel (top, compact) - hidden when detail is expanded
            !isDetailExpanded && React.createElement('section',
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
            // Carousel panel (visual browsing) - hidden when detail is expanded
            !isDetailExpanded && React.createElement('section',
                { className: 'sidebar__panel sidebar__browse' },
                // Carousel (scrollable)
                React.createElement('div', { className: 'sidebar__carousel-browse' },
                    React.createElement(window.StoryMapComponents.ProjectCarousel, {
                        projects: projects,
                        onSelect: handleSelectProject,
                        selectedId: selected?.id
                    })
                ),
                // Category legend below carousel
                React.createElement('div', { className: 'sidebar__carousel-legend' },
                    window.ColorUtils && Object.entries(window.ColorUtils.categoryColors || {}).map(([name, colors]) =>
                        React.createElement('div', { key: name, className: 'sidebar__legend-item' },
                            React.createElement('span', {
                                className: 'sidebar__legend-dot',
                                style: { background: colors?.border || '#3b82f6' }
                            }),
                            React.createElement('span', {}, colors?.short || name)
                        )
                    )
                )
            ),
            // Main region: switches between full detail view (expanded) or empty space
            isDetailExpanded && selected
                ? React.createElement('section',
                    { className: 'sidebar__panel sidebar__main sidebar__main--expanded' },
                    React.createElement(window.StoryMapComponents.ProjectDetail, {
                        project: selected,
                        onDeselect: handleCollapseDetail
                    })
                )
                : null,
            // Project preview (bottom) - always rendered, handles idle/preview states internally
            !isDetailExpanded && React.createElement('div',
                { className: 'sidebar__preview' },
                React.createElement(window.StoryMapComponents.ProjectPreview, {
                    project: selected, // Null triggers idle state
                    onExpand: handleExpandDetail,
                    onDeselect: handleDeselect,
                    isExpanded: false
                })
            )
        );
    };
})();
