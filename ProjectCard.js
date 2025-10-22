// ProjectCard.js - Compact project card for sidebar list
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.ProjectCard = function ProjectCard({ project, onClick, isSelected }) {
        const raw = project.raw || {};
        const colorUtils = window.ColorUtils;

        // Get category color (matches carousel and detail header)
        const category = raw.ProjectCategory;
        const categoryColors = colorUtils.getCategoryColor(category);

        return React.createElement('button', {
            onClick: () => onClick(project),
            className: `project-card${isSelected ? ' is-active' : ''}`,
            type: 'button'
        },
            // Header with color bar and category
            React.createElement('header', { className: 'project-card__header' },
                React.createElement('span', {
                    className: 'project-card__swatch',
                    style: { background: categoryColors.border }
                }),
                React.createElement('div', { className: 'project-card__heading' },
                    React.createElement('h4', {
                        className: 'project-card__title clamp-2'
                    }, raw.ProjectName || project.name),
                    React.createElement('span', {
                        className: 'project-card__badge',
                        style: { background: categoryColors.border }
                    }, categoryColors.short)
                )
            ),
            // Description
            raw.DescriptionShort && React.createElement('p', {
                className: 'project-card__body clamp-2'
            }, raw.DescriptionShort),
            // Footer with location and year
            React.createElement('footer', { className: 'project-card__meta' },
                raw.Location && React.createElement('span', { className: 'project-card__meta-item' },
                    'Loc. ',
                    React.createElement('span', {}, raw.Location)
                ),
                raw.Year && React.createElement('span', { className: 'project-card__meta-item' },
                    'Year: ',
                    raw.Year
                )
            )
        );
    };
})();
