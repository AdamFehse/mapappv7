// ProjectDetail.js - Simple scrollable project detail view
(function() {
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Helper component to render a section
    function Section({ title, children, className = '' }) {
        return React.createElement('div', { className: `mb-6 ${className}` },
            title && React.createElement('h3', { 
                className: 'text-xl font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-200' 
            }, title),
            React.createElement('div', { className: 'space-y-2' }, children)
        );
    }

    // Helper component for info rows
    function InfoRow({ label, value }) {
        if (!value) return null;
        return React.createElement('div', { className: 'flex flex-col sm:flex-row' },
            React.createElement('span', { className: 'font-semibold text-gray-700 sm:w-32 flex-shrink-0' }, label + ':'),
            React.createElement('span', { className: 'text-gray-900' }, value)
        );
    }

    // Main Project Detail Component
    window.StoryMapComponents.ProjectDetail = function ProjectDetail({ project, allProjects, onDeselect }) {
        if (!project) {
            return React.createElement('div',
                { className: 'flex flex-col items-center justify-center h-full text-gray-500 text-center p-8' },
                React.createElement('div', { className: 'text-6xl mb-4' }, '🗺️'),
                React.createElement('div', { className: 'text-xl font-semibold mb-2' }, 'No Project Selected'),
                React.createElement('div', { className: 'text-sm' }, 'Click a project on the map or in the carousel below to view details')
            );
        }

        const raw = project.raw || {};
        const colorUtils = window.ColorUtils;
        
        // Get the color gradient for this project
        const projectIndex = allProjects ? allProjects.findIndex(p => p.id === project.id) : 0;
        const gradientStyle = colorUtils.getGradientStyle(projectIndex >= 0 ? projectIndex : 0);

        return React.createElement('div', {
            className: 'h-full overflow-y-auto bg-white relative'
        },
            // Close/Deselect button (floating top-right)
            onDeselect && React.createElement('button', {
                onClick: onDeselect,
                className: 'absolute top-2 right-2 z-10 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg transition-colors',
                title: 'Clear selection',
                'aria-label': 'Clear selection'
            }, React.createElement('svg', {
                className: 'w-5 h-5',
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
            React.createElement('div', {
                className: 'text-white shadow-lg',
                style: gradientStyle
            },
                React.createElement('div', { className: 'flex h-32 gap-3 p-3' },
                    // Image section (smaller)
                    project.image && React.createElement('div', { className: 'flex-shrink-0 w-32' },
                        React.createElement('img', {
                            src: project.image,
                            alt: project.name,
                            className: 'w-full h-full object-cover rounded-lg shadow-md'
                        })
                    ),
                    // Info section (more compact)
                    React.createElement('div', { className: 'flex-1 flex flex-col justify-between overflow-hidden py-1' },
                        React.createElement('div', {},
                            React.createElement('h2', { className: 'text-lg font-bold mb-1 line-clamp-2' }, raw.ProjectName || project.name),
                            React.createElement('p', { className: 'text-xs opacity-90 line-clamp-2' }, raw.DescriptionShort || project.description)
                        ),
                        React.createElement('div', { className: 'text-xs space-y-0.5 opacity-80' },
                            raw.Year && React.createElement('div', {}, '📅 ', raw.Year),
                            raw.Location && React.createElement('div', { className: 'truncate' }, '📍 ', raw.Location)
                        )
                    )
                )
            ),

            // Content area with padding
            React.createElement('div', { className: 'px-6 pb-6 pt-6' },
            
            // Note: Main project image removed - already shown in carousel, popup, and marker
            
            // Long Description
            raw.DescriptionLong && React.createElement(Section, { title: 'Full Description' },
                React.createElement('p', {
                    className: 'text-gray-800 leading-relaxed whitespace-pre-line'
                }, Array.isArray(raw.DescriptionLong) ? raw.DescriptionLong.join(' ') : raw.DescriptionLong)
            ),

            // Project Category, Theme, and Product (prominently displayed)
            React.createElement(Section, { title: 'Project Overview', className: 'bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg' },
                React.createElement('div', { className: 'flex flex-wrap gap-2 mb-3' },
                    raw.ProjectCategory && React.createElement('span', {
                        className: 'inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full'
                    }, raw.ProjectCategory),
                    raw.Theme && React.createElement('span', {
                        className: 'inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full'
                    }, raw.Theme),
                    raw.Product && React.createElement('span', {
                        className: 'inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full'
                    }, raw.Product)
                ),
                Array.isArray(raw.Tags) && raw.Tags.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-1' },
                    React.createElement('span', { className: 'text-xs text-gray-600 font-semibold' }, 'Tags:'),
                    raw.Tags.map(tag => React.createElement('span', {
                        key: tag,
                        className: 'inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded'
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
                        className: 'text-blue-600 hover:underline'
                    }, raw.Email)
                })
            ),

            // Artworks
            Array.isArray(raw.Artworks) && raw.Artworks.length > 0 && React.createElement(Section, { title: 'Artworks' },
                raw.Artworks.map((art, i) => 
                    React.createElement('div', { 
                        key: i, 
                        className: 'p-4 bg-white rounded-lg shadow mb-3'
                    },
                        art.ImageUrl && React.createElement('img', {
                            src: art.ImageUrl,
                            alt: art.Title || 'Artwork',
                            className: 'w-full h-48 object-cover rounded mb-3'
                        }),
                        art.Title && React.createElement('h4', { 
                            className: 'font-bold text-lg text-gray-900 mb-2' 
                        }, art.Title),
                        art.Description && React.createElement('p', { 
                            className: 'text-gray-700' 
                        }, art.Description)
                    )
                )
            ),

            // Poems
            Array.isArray(raw.Poems) && raw.Poems.length > 0 && React.createElement(Section, { title: 'Poems' },
                raw.Poems.map((poem, i) => 
                    React.createElement('div', { 
                        key: i, 
                        className: 'p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow mb-3'
                    },
                        poem.Title && React.createElement('h4', { 
                            className: 'font-bold text-lg text-purple-900 mb-2' 
                        }, poem.Title),
                        poem.Text && React.createElement('pre', { 
                            className: 'whitespace-pre-wrap text-gray-800 font-serif leading-relaxed' 
                        }, poem.Text)
                    )
                )
            ),

            // Activities
            Array.isArray(raw.Activities) && raw.Activities.length > 0 && React.createElement(Section, { title: 'Activities' },
                raw.Activities.map((act, i) => 
                    React.createElement('div', { 
                        key: i, 
                        className: 'p-4 bg-white rounded-lg shadow mb-3'
                    },
                        act.Title && React.createElement('h4', { 
                            className: 'font-bold text-lg text-gray-900 mb-2' 
                        }, act.Title),
                        act.Description && React.createElement('p', { 
                            className: 'text-gray-700' 
                        }, act.Description)
                    )
                )
            ),

            // Outcome
            raw.Outcome && (raw.Outcome.Title || raw.Outcome.Link || raw.Outcome.Summary) && 
            React.createElement(Section, { title: 'Outcome' },
                React.createElement('div', { className: 'p-4 bg-green-50 rounded-lg shadow' },
                    raw.Outcome.Title && React.createElement('h4', { 
                        className: 'font-bold text-lg text-green-900 mb-2' 
                    }, raw.Outcome.Title),
                    raw.Outcome.Summary && React.createElement('p', { 
                        className: 'text-gray-700 mb-3' 
                    }, raw.Outcome.Summary),
                    raw.Outcome.Link && React.createElement('a', {
                        href: raw.Outcome.Link,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
                    }, 'View Outcome →')
                )
            )
            ) // Close content area div
        );
    };
})();
