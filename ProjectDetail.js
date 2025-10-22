// ProjectDetail.js - Simple scrollable project detail view
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Helper component to render a section
    function Section({ title, children, className = '' }) {
        return React.createElement('section', { className: `detail-section ${className}`.trim() },
            title && React.createElement('h3', { 
                className: 'detail-section__title' 
            }, title),
            React.createElement('div', { className: 'detail-section__body' }, children)
        );
    }

    // Helper component for info rows
    function InfoRow({ label, value }) {
        if (!value) return null;
        return React.createElement('div', { className: 'detail-info-row' },
            React.createElement('span', { className: 'detail-info-label' }, label + ':'),
            React.createElement('span', { className: 'detail-info-value' }, value)
        );
    }

    // Main Project Detail Component
    window.StoryMapComponents.ProjectDetail = function ProjectDetail({ project, onDeselect }) {
        if (!project) {
            return React.createElement('article',
                { className: 'detail-panel' },
                React.createElement('div', { className: 'detail-panel__empty' },
                    React.createElement('div', { className: 'detail-panel__empty-icon' }, '🗺️'),
                    React.createElement('div', { className: 'detail-panel__empty-title' }, 'No Project Selected'),
                    React.createElement('p', {}, 'Click a project on the map or in the carousel below to view details')
                )
            );
        }

        const raw = project.raw || {};
        const colorUtils = window.ColorUtils;

        // Get the color gradient for this project using category colors (matches carousel and popups)
        const category = project.raw?.ProjectCategory;
        const categoryColors = colorUtils.getCategoryColor(category);
        const gradientStyle = { background: categoryColors.gradient };

        return React.createElement('article', {
            className: 'detail-panel'
        },
            // Close/Deselect button (floating top-right)
            onDeselect && React.createElement('button', {
                onClick: onDeselect,
                className: 'detail-panel__close',
                title: 'Clear selection',
                'aria-label': 'Clear selection'
            }, React.createElement('svg', {
                className: 'detail-panel__close-icon',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24'
            },
                React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M6 18L18 6M6 6l12 12'
                })
            )),
            // Compact header with image and key info
            React.createElement('header', {
                className: 'detail-panel__header',
                style: gradientStyle
            },
                // Image section (smaller)
                project.image && React.createElement('img', {
                    src: project.image,
                    alt: project.name,
                    className: 'detail-panel__cover'
                }),
                // Info section (more compact)
                React.createElement('div', { className: 'detail-panel__summary' },
                    React.createElement('div', {},
                        React.createElement('h2', { className: 'detail-panel__title clamp-2' }, raw.ProjectName || project.name),
                        React.createElement('p', { className: 'detail-panel__excerpt clamp-2' }, raw.DescriptionShort || project.description)
                    ),
                    React.createElement('div', { className: 'detail-panel__meta' },
                        raw.Year && React.createElement('span', {}, '📅 ', raw.Year),
                        raw.Location && React.createElement('span', { className: 'clamp-1' }, '📍 ', raw.Location)
                    )
                )
            ),

            // Content area with padding
            React.createElement('div', { className: 'detail-panel__body' },
            
            // Note: Main project image removed - already shown in carousel, popup, and marker
            
            // Long Description
            raw.DescriptionLong && React.createElement(Section, { title: 'Full Description' },
                React.createElement('p', {
                    className: 'detail-text detail-text--pre'
                }, Array.isArray(raw.DescriptionLong) ? raw.DescriptionLong.join(' ') : raw.DescriptionLong)
            ),

            // Project Category, Theme, and Product (prominently displayed)
            React.createElement(Section, { title: 'Project Overview', className: 'detail-overview' },
                React.createElement('div', { className: 'detail-badges' },
                    raw.ProjectCategory && React.createElement('span', {
                        className: 'detail-badge detail-badge--category'
                    }, raw.ProjectCategory),
                    raw.Theme && React.createElement('span', {
                        className: 'detail-badge detail-badge--theme'
                    }, raw.Theme),
                    raw.Product && React.createElement('span', {
                        className: 'detail-badge detail-badge--product'
                    }, raw.Product)
                ),
                Array.isArray(raw.Tags) && raw.Tags.length > 0 && React.createElement('div', { className: 'detail-tags' },
                    React.createElement('span', { className: 'detail-tags__label' }, 'Tags:'),
                    raw.Tags.map(tag => React.createElement('span', {
                        key: tag,
                        className: 'detail-tag'
                    }, tag))
                )
            ),

            // Project Info
            React.createElement(Section, { title: 'Project Information' },
                Array.isArray(raw.ProjectLeads) && raw.ProjectLeads.length > 0 && React.createElement(InfoRow, {
                    label: 'Project Leads',
                    value: raw.ProjectLeads.join(', ')
                }),
                raw.Name && React.createElement(InfoRow, { label: 'PI', value: raw.Name }),
                raw.Title && React.createElement(InfoRow, { label: 'Title', value: raw.Title }),
                React.createElement(InfoRow, { label: 'Affiliation', value: raw.Affiliation }),
                React.createElement(InfoRow, { label: 'College', value: raw.College }),
                React.createElement(InfoRow, { label: 'Department', value: raw.Department }),
                raw.Year && raw.Year > 0 && React.createElement(InfoRow, { label: 'Year', value: raw.Year }),
                React.createElement(InfoRow, { label: 'Location', value: raw.Location }),
                raw.Email && React.createElement(InfoRow, {
                    label: 'Email',
                    value: React.createElement('a', {
                        href: `mailto:${raw.Email}`,
                        className: 'detail-link'
                    }, raw.Email)
                })
            ),

            // Artworks
            Array.isArray(raw.Artworks) && raw.Artworks.length > 0 && React.createElement(Section, { title: 'Artworks' },
                React.createElement('div', { className: 'detail-collection' },
                    raw.Artworks.map((art, i) => 
                        React.createElement('article', { 
                            key: i, 
                            className: 'detail-collection__item detail-collection__item--media'
                        },
                            art.ImageUrl && React.createElement('img', {
                                src: art.ImageUrl,
                                alt: art.Title || 'Artwork',
                                className: 'detail-media'
                            }),
                            art.Title && React.createElement('h4', {}, art.Title),
                            art.Description && React.createElement('p', { 
                                className: 'detail-text' 
                            }, art.Description)
                        )
                    )
                )
            ),

            // Poems
            Array.isArray(raw.Poems) && raw.Poems.length > 0 && React.createElement(Section, { title: 'Poems' },
                React.createElement('div', { className: 'detail-collection' },
                    raw.Poems.map((poem, i) => 
                        React.createElement('article', { 
                            key: i, 
                            className: 'detail-collection__item detail-poem'
                        },
                            poem.Title && React.createElement('h4', {}, poem.Title),
                            poem.Text && React.createElement('pre', {}, poem.Text)
                        )
                    )
                )
            ),

            // Activities
            Array.isArray(raw.Activities) && raw.Activities.length > 0 && React.createElement(Section, { title: 'Activities' },
                React.createElement('div', { className: 'detail-collection' },
                    raw.Activities.map((act, i) => 
                        React.createElement('article', { 
                            key: i, 
                            className: 'detail-collection__item'
                        },
                            act.Title && React.createElement('h4', {}, act.Title),
                            act.Description && React.createElement('p', { 
                                className: 'detail-text' 
                            }, act.Description)
                        )
                    )
                )
            ),

            // Outcome
            raw.Outcome && (raw.Outcome.Title || raw.Outcome.Link || raw.Outcome.Summary) && 
            React.createElement(Section, { title: 'Outcome' },
                React.createElement('article', { className: 'detail-outcome' },
                    raw.Outcome.Title && React.createElement('h4', {}, raw.Outcome.Title),
                    raw.Outcome.Summary && React.createElement('p', { 
                        className: 'detail-text' 
                    }, raw.Outcome.Summary),
                    raw.Outcome.Link && React.createElement('a', {
                        href: raw.Outcome.Link,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'detail-link detail-link--button'
                    }, 'View Outcome →')
                )
            )
            ) // Close content area div
        );
    };
})();
