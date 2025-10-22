// ProjectPreview.js - Enhanced preview with idle, preview, and expanded states
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Idle state component - shown when no project is selected
    function ProjectPreviewIdle() {
        return React.createElement('div', {
            className: 'project-preview project-preview--idle',
            role: 'region',
            'aria-label': 'Project selection area'
        },
            React.createElement('div', {
                className: 'project-preview__idle-content'
            },
                React.createElement('svg', {
                    className: 'project-preview__idle-icon',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 1.5,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    'aria-hidden': 'true'
                },
                    React.createElement('path', {
                        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
                    }),
                    React.createElement('path', {
                        d: 'M11 16h2v-5h-2z'
                    }),
                    React.createElement('path', {
                        d: 'M11 6h2v2h-2z'
                    })
                ),
                React.createElement('p', {
                    className: 'project-preview__idle-text'
                }, 'Select a project from the carousel above'),
                React.createElement('p', {
                    className: 'project-preview__idle-subtext'
                }, 'Click any card to view details')
            )
        );
    }

    // SVG noise texture overlay for header
    function NoiseTexture() {
        return React.createElement('svg', {
            width: '100%',
            height: '100%',
            className: 'project-preview__noise',
            style: { 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                mixBlendMode: 'overlay',
                pointerEvents: 'none'
            },
            'aria-hidden': 'true'
        },
            React.createElement('filter', { id: 'preview-noise-filter' },
                React.createElement('feTurbulence', {
                    type: 'fractalNoise',
                    baseFrequency: '0.8',
                    numOctaves: '4',
                    stitchTiles: 'stitch'
                })
            ),
            React.createElement('rect', {
                width: '100%',
                height: '100%',
                filter: 'url(#preview-noise-filter)',
                opacity: '0.05'
            })
        );
    }

    // Main ProjectPreview component
    window.StoryMapComponents.ProjectPreview = function ProjectPreview({ 
        project, 
        onExpand, 
        onDeselect, 
        isExpanded 
    }) {
        // IDLE STATE: No project selected
        if (!project) {
            return React.createElement(ProjectPreviewIdle);
        }

        // PREVIEW STATE: Project selected, not expanded
        const raw = project.raw || {};
        const colorUtils = window.ColorUtils;
        const categoryStyle = colorUtils 
            ? colorUtils.getCategoryColor(raw.ProjectCategory) 
            : { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' };

        // Get snippet of description
        const description = raw.DescriptionShort || raw.DescriptionLong || project.description || '';
        const descriptionSnippet = description.substring(0, 80);
        const hasMore = description.length > 80;

        const categoryShort = categoryStyle?.short || raw.ProjectCategory || 'Project';
        
        // Extract metadata for enhanced header
        const year = raw.Year || '';
        const location = raw.Location || '';
        const hasMetadata = year || location;

        return React.createElement('footer', {
            className: 'project-preview project-preview--active',
            role: 'region',
            'aria-label': 'Selected project preview'
        },
            // Enhanced gradient header with category badge and metadata
            React.createElement('header', {
                className: 'project-preview__header',
                style: { background: categoryStyle.gradient }
            },
                React.createElement(NoiseTexture),
                React.createElement('div', {
                    className: 'project-preview__header-content'
                },
                    React.createElement('div', {
                        className: 'project-preview__header-badge'
                    },
                        React.createElement('span', {
                            className: 'project-preview__header-icon',
                            style: { background: categoryStyle.border || categoryStyle.gradient }
                        }),
                        React.createElement('span', {
                            className: 'project-preview__header-category'
                        }, categoryShort)
                    ),
                    hasMetadata && React.createElement('div', {
                        className: 'project-preview__header-meta'
                    },
                        year && React.createElement('span', {
                            className: 'project-preview__header-meta-item'
                        }, year),
                        location && React.createElement('span', {
                            className: 'project-preview__header-meta-item'
                        }, location)
                    )
                )
            ),
            // Content grid: [Image] [Title + Description] [Actions]
            React.createElement('div', {
                className: 'project-preview__content'
            },
                // Thumbnail with zoom hover effect
                project.image && React.createElement('img', {
                    src: project.image,
                    alt: raw.ProjectName || project.name || 'Project thumbnail',
                    className: 'project-preview__image'
                }),
                // Text content with better hierarchy
                React.createElement('div', {
                    className: 'project-preview__text'
                },
                    React.createElement('h4', {
                        className: 'project-preview__title'
                    }, raw.ProjectName || project.name),
                    React.createElement('p', {
                        className: 'project-preview__description'
                    }, descriptionSnippet + (hasMore ? '...' : ''))
                ),
                // Action buttons with micro-interactions
                React.createElement('div', {
                    className: 'project-preview__actions'
                },
                    // Expand button
                    React.createElement('button', {
                        onClick: onExpand,
                        className: 'project-preview__expand',
                        type: 'button',
                        title: 'Expand project details',
                        'aria-label': 'Expand to view full project details',
                        'aria-expanded': 'false'
                    },
                        React.createElement('svg', {
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            stroke: 'currentColor',
                            strokeWidth: 2,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            'aria-hidden': 'true'
                        },
                            React.createElement('polyline', {
                                points: '6 9 12 15 18 9'
                            })
                        )
                    ),
                    // Close button
                    React.createElement('button', {
                        onClick: onDeselect,
                        className: 'project-preview__close',
                        type: 'button',
                        title: 'Clear selection',
                        'aria-label': 'Clear project selection'
                    },
                        React.createElement('svg', {
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            stroke: 'currentColor',
                            strokeWidth: 2,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            'aria-hidden': 'true'
                        },
                            React.createElement('path', {
                                d: 'M6 18L18 6M6 6l12 12'
                            })
                        )
                    )
                )
            )
        );
    };
})();
