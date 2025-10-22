// ProjectDetail.js - Scrollable project detail view with rich sections
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    function Section({ title, children, className = '' }) {
        return React.createElement('section', { className: `detail-section ${className}`.trim() },
            title && React.createElement('h3', { className: 'detail-section__title' }, title),
            React.createElement('div', { className: 'detail-section__body' }, children)
        );
    }

    function InfoRow({ label, value }) {
        if (!value) return null;
        return React.createElement('div', { className: 'detail-info-row' },
            React.createElement('span', { className: 'detail-info-label' }, `${label}:`),
            React.createElement('span', { className: 'detail-info-value' }, value)
        );
    }

    const emptyStateIcon = React.createElement('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true'
    },
        React.createElement('circle', { cx: 12, cy: 12, r: 7 }),
        React.createElement('path', { d: 'M12 9v3l2 2' })
    );

    window.StoryMapComponents.ProjectDetail = function ProjectDetail({ project, onDeselect }) {
        if (!project) {
            return React.createElement('article',
                { className: 'detail-panel' },
                React.createElement('div', { className: 'detail-panel__empty' },
                    React.createElement('div', { className: 'detail-panel__empty-icon' }, emptyStateIcon),
                    React.createElement('div', { className: 'detail-panel__empty-title' }, 'No Project Selected'),
                    React.createElement('p', {}, 'Click a project on the map or in the carousel below to view details')
                )
            );
        }

        const raw = project.raw || {};
        const colorUtils = window.ColorUtils;
        const categoryStyle = colorUtils ? colorUtils.getCategoryColor(project.raw?.ProjectCategory) : {
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
        };
        const gradientStyle = { background: categoryStyle.gradient };

        const headerMeta = [];
        if (raw.Year) headerMeta.push({ key: 'year', label: 'Year', value: raw.Year });
        if (raw.Location) headerMeta.push({ key: 'location', label: 'Location', value: raw.Location });

        return React.createElement('article', { className: 'detail-panel' },
            onDeselect && React.createElement('button', {
                onClick: onDeselect,
                className: 'detail-panel__close',
                title: 'Close project details',
                'aria-label': 'Close project details'
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
            React.createElement('header', {
                className: 'detail-panel__header',
                style: gradientStyle
            },
                project.image && React.createElement('img', {
                    src: project.image,
                    alt: project.name || 'Project cover image',
                    className: 'detail-panel__cover'
                }),
                React.createElement('div', { className: 'detail-panel__summary' },
                    React.createElement('div', {},
                        React.createElement('h2', { className: 'detail-panel__title clamp-2' }, raw.ProjectName || project.name),
                        React.createElement('p', { className: 'detail-panel__excerpt clamp-2' }, raw.DescriptionShort || project.description)
                    ),
                    headerMeta.length > 0 && React.createElement('div', { className: 'detail-panel__meta' },
                        headerMeta.map(item => React.createElement('span', {
                            key: item.key,
                            className: 'detail-panel__meta-item'
                        }, `${item.label}: `, item.value))
                    )
                )
            ),
            React.createElement('div', { className: 'detail-panel__body' },
                raw.DescriptionLong && React.createElement(Section, { title: 'Full Description' },
                    React.createElement('p', {
                        className: 'detail-text detail-text--pre'
                    }, Array.isArray(raw.DescriptionLong) ? raw.DescriptionLong.join(' ') : raw.DescriptionLong)
                ),
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
                Array.isArray(raw.Artworks) && raw.Artworks.length > 0 && React.createElement(Section, { title: 'Artworks' },
                    React.createElement('div', { className: 'detail-collection' },
                        raw.Artworks.map((art, index) =>
                            React.createElement('article', {
                                key: index,
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
                Array.isArray(raw.Poems) && raw.Poems.length > 0 && React.createElement(Section, { title: 'Poems' },
                    React.createElement('div', { className: 'detail-collection' },
                        raw.Poems.map((poem, index) =>
                            React.createElement('article', {
                                key: index,
                                className: 'detail-collection__item detail-poem'
                            },
                                poem.Title && React.createElement('h4', {}, poem.Title),
                                poem.Text && React.createElement('pre', {}, poem.Text)
                            )
                        )
                    )
                ),
                Array.isArray(raw.Activities) && raw.Activities.length > 0 && React.createElement(Section, { title: 'Activities' },
                    React.createElement('div', { className: 'detail-collection' },
                        raw.Activities.map((activity, index) =>
                            React.createElement('article', {
                                key: index,
                                className: 'detail-collection__item'
                            },
                                activity.Title && React.createElement('h4', {}, activity.Title),
                                activity.Description && React.createElement('p', {
                                    className: 'detail-text'
                                }, activity.Description)
                            )
                        )
                    )
                ),
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
                        }, 'View Outcome')
                    )
                )
            )
        );
    };
})();
