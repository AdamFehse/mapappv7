// Sidebar.js - Combined project display, search, and carousel
(function() {
    const { useState, useEffect, useRef } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};


    // Project Detail View - Engaging, with tabs and gallery
    function ProjectDetail({ project }) {
        const [tab, setTab] = useState('Details');
        if (!project) {
            return React.createElement('div',
                { className: 'flex items-center justify-center h-full text-gray-400' },
                'Select a project to view details'
            );
        }

        // Prefer ImageUrl, then first artwork, then fallback
        const raw = project.raw || {};
        let mainImage = raw.ImageUrl || '';
        if (!mainImage && Array.isArray(raw.Artworks) && raw.Artworks.length > 0) {
            mainImage = raw.Artworks[0].ImageUrl || '';
        }
        if (!mainImage && project.image) mainImage = project.image;

        // Tabs: Details, Artworks, Poems, Activities, Outcomes
        const hasArtworks = Array.isArray(raw.Artworks) && raw.Artworks.length > 0;
        const hasPoems = Array.isArray(raw.Poems) && raw.Poems.length > 0;
        const hasActivities = Array.isArray(raw.Activities) && raw.Activities.length > 0;
        const hasOutcome = raw.Outcome && (raw.Outcome.Title || raw.Outcome.Link || raw.Outcome.Summary);

        const tabs = [
            'Details',
            ...(hasArtworks ? ['Artworks'] : []),
            ...(hasPoems ? ['Poems'] : []),
            ...(hasActivities ? ['Activities'] : []),
            ...(hasOutcome ? ['Outcome'] : [])
        ];

        // Details tab content
        // Gather all images for gallery: ImageUrl, project.image, artworks
        const galleryImages = [];
        if (raw.ImageUrl) galleryImages.push({ url: raw.ImageUrl, alt: raw.ProjectName || project.name });
        if (project.image && project.image !== raw.ImageUrl) galleryImages.push({ url: project.image, alt: project.name });
        if (Array.isArray(raw.Artworks)) {
            raw.Artworks.forEach(art => {
                if (art.ImageUrl) galleryImages.push({ url: art.ImageUrl, alt: art.Title || 'Artwork' });
            });
        }

        // Swiper gallery for main image area
        let galleryArea = null;
        if (galleryImages.length > 1) {
            const swiperId = `sidebar-swiper-${project.id || project.name || Math.random()}`;
            galleryArea = React.createElement('div', { className: 'relative mb-2' },
                React.createElement('div', {
                    className: 'swiper sidebar-swiper rounded-lg shadow bg-gray-100',
                    id: swiperId,
                    style: { width: '100%', height: '192px' }
                },
                    React.createElement('div', { className: 'swiper-wrapper' },
                        galleryImages.map((img, idx) =>
                            React.createElement('div', { className: 'swiper-slide flex items-center justify-center', key: idx },
                                React.createElement('img', {
                                    src: img.url,
                                    alt: img.alt,
                                    className: 'h-48 max-w-full object-contain'
                                })
                            )
                        )
                    ),
                    React.createElement('div', { className: 'swiper-pagination' })
                ),
                React.createElement('script', {
                    dangerouslySetInnerHTML: {
                        __html: `setTimeout(function(){ if(window.Swiper){ new window.Swiper('#${swiperId}', { slidesPerView: 1, pagination: { el: '#${swiperId} .swiper-pagination', clickable: true }, loop: true, autoHeight: true });}}, 0);`
                    }
                })
            );
        } else if (galleryImages.length === 1) {
            galleryArea = React.createElement('img', {
                src: galleryImages[0].url,
                alt: galleryImages[0].alt,
                className: 'w-full h-48 object-contain bg-gray-100 rounded-lg shadow mb-2'
            });
        }

        const detailsContent = React.createElement('div', { className: 'space-y-2' },
            galleryArea,
            React.createElement('h2', { className: 'text-2xl font-bold text-blue-900' }, raw.ProjectName || project.name),
            React.createElement('div', { className: 'text-lg text-gray-700 mb-2' }, raw.DescriptionShort || project.description),
            React.createElement('div', { className: 'grid grid-cols-2 gap-2 text-sm text-gray-600' },
                raw.Name && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'PI: '), raw.Name),
                raw.Title && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Title: '), raw.Title),
                raw.Affiliation && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Affiliation: '), raw.Affiliation),
                raw.College && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'College: '), raw.College),
                raw.Department && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Department: '), raw.Department),
                raw.Year && raw.Year > 0 && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Year: '), raw.Year),
                raw.Location && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Location: '), raw.Location),
                raw.ProjectCategory && React.createElement('div', {}, React.createElement('span', { className: 'font-semibold' }, 'Category: '), raw.ProjectCategory)
            ),
            raw.DescriptionLong && React.createElement('div', {
                className: 'text-gray-800 text-sm mt-2 p-2 bg-gray-50 rounded max-h-40 overflow-auto',
                style: { whiteSpace: 'pre-line' }
            }, Array.isArray(raw.DescriptionLong) ? raw.DescriptionLong.join(' ') : raw.DescriptionLong)
        );

        // Artworks tab content - use a component with ref to initialize Swiper
        function ArtworksGallery({ artworks }) {
            const swiperRef = useRef(null);
            
            useEffect(() => {
                if (!swiperRef.current || !window.Swiper) return;
                
                if (swiperRef.current.swiper) {
                    swiperRef.current.swiper.destroy(true, true);
                }
                
                new window.Swiper(swiperRef.current, {
                    direction: 'vertical',
                    slidesPerView: 1,
                    pagination: {
                        el: '.artworks-swiper .swiper-pagination',
                        clickable: true
                    },
                    mousewheel: true
                });
            }, [artworks]);
            
            return React.createElement('div', { className: 'relative h-full min-h-0' },
                React.createElement('div', {
                    className: 'swiper artworks-swiper rounded-lg shadow bg-white h-full',
                    ref: swiperRef
                },
                    React.createElement('div', { className: 'swiper-wrapper' },
                        artworks.map((art, idx) =>
                            React.createElement('div', { className: 'swiper-slide', key: idx },
                                React.createElement('div', { className: 'h-full overflow-y-auto p-4 flex flex-col' },
                                    art.ImageUrl && React.createElement('img', {
                                        src: art.ImageUrl,
                                        alt: art.Title || 'Artwork',
                                        className: 'w-full h-48 object-contain rounded mb-3 flex-shrink-0 bg-gray-50'
                                    }),
                                    art.Title && React.createElement('div', { className: 'font-bold text-lg text-center mb-3 flex-shrink-0' }, art.Title),
                                    art.Description && React.createElement('div', { className: 'text-sm text-gray-700 text-left leading-relaxed' }, art.Description)
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'swiper-pagination' })
                )
            );
        }
        
        const artworksContent = hasArtworks && React.createElement(ArtworksGallery, { artworks: raw.Artworks });

        // Poems tab content
        const poemsContent = hasPoems && React.createElement('div', { className: 'space-y-4' },
            raw.Poems.map((poem, i) => React.createElement('div', { key: i, className: 'bg-gray-50 rounded p-2' },
                poem.Title && React.createElement('div', { className: 'font-semibold mb-1' }, poem.Title),
                poem.Text && React.createElement('pre', { className: 'whitespace-pre-wrap text-gray-800' }, poem.Text)
            ))
        );

        // Activities tab content
        const activitiesContent = hasActivities && React.createElement('div', { className: 'space-y-2' },
            raw.Activities.map((act, i) => React.createElement('div', { key: i, className: 'bg-gray-50 rounded p-2' },
                act.Title && React.createElement('div', { className: 'font-semibold mb-1' }, act.Title),
                act.Description && React.createElement('div', { className: 'text-sm text-gray-700' }, act.Description)
            ))
        );

        // Outcome tab content
        const outcomeContent = hasOutcome && React.createElement('div', { className: 'space-y-2' },
            raw.Outcome.Title && React.createElement('div', { className: 'font-semibold' }, raw.Outcome.Title),
            raw.Outcome.Summary && React.createElement('div', { className: 'text-sm text-gray-700' }, raw.Outcome.Summary),
            raw.Outcome.Link && React.createElement('a', {
                href: raw.Outcome.Link,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'text-blue-600 underline'
            }, 'View Outcome')
        );

        // Tab content switch
        let tabContent = detailsContent;
        if (tab === 'Artworks') tabContent = artworksContent;
        if (tab === 'Poems') tabContent = poemsContent;
        if (tab === 'Activities') tabContent = activitiesContent;
        if (tab === 'Outcome') tabContent = outcomeContent;

        return React.createElement('div',
            { className: 'p-4 overflow-auto h-full animate__animated animate__fadeIn' },
            // Tab bar
            React.createElement('div', { className: 'flex space-x-2 mb-4' },
                tabs.map(t => React.createElement('button', {
                    key: t,
                    className: `px-3 py-1 rounded-full text-sm font-semibold transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-900 hover:bg-blue-100'}`,
                    onClick: () => setTab(t)
                }, t))
            ),
            tabContent
        );
    }

    // Search Bar
    function SearchBar({ onSearch }) {
        const [value, setValue] = useState('');

        function handleChange(e) {
            setValue(e.target.value);
            onSearch(e.target.value);
        }

        return React.createElement('input', {
            type: 'text',
            value: value,
            onChange: handleChange,
            placeholder: 'Search projects...',
            className: 'w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none'
        });
    }

    // Project Carousel
    function ProjectCarousel({ projects, onSelect, selectedId }) {
        const swiperRef = useRef(null);

        useEffect(() => {
            if (!swiperRef.current || !window.Swiper) return;

            if (swiperRef.current.swiper) {
                swiperRef.current.swiper.destroy(true, true);
            }

            // Use dynamic bullets for pagination (shows a few dots, not all)
            new window.Swiper(swiperRef.current, {
                slidesPerView: 2.2,
                spaceBetween: 20,
                freeMode: true,
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true,
                    dynamicBullets: true,
                    dynamicMainBullets: 5
                },
                breakpoints: {
                    640: { slidesPerView: 2.5 },
                    1024: { slidesPerView: 3.5 },
                    1280: { slidesPerView: 4.5 }
                }
            });
        }, [projects]);

        // Just show the swiper and dynamic bullets (no nav arrows)
        return React.createElement('div', { className: 'relative h-full' },
            React.createElement('div', { className: 'swiper h-full', ref: swiperRef },
                React.createElement('div', { className: 'swiper-wrapper' },
                    projects.map((proj, idx) => 
                        React.createElement('div', {
                            key: (proj.id ? proj.id + '-' : '') + idx,
                            className: `swiper-slide p-3 border rounded-lg cursor-pointer transition hover:bg-blue-50 ${
                                selectedId === proj.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`,
                            onClick: () => onSelect(proj)
                        },
                            proj.image && React.createElement('img', {
                                src: proj.image,
                                alt: proj.name,
                                className: 'w-full h-16 sm:h-20 md:h-24 object-cover rounded mb-2'
                            }),
                            React.createElement('h3', { className: 'font-semibold text-xs sm:text-sm truncate' }, proj.name),
                            React.createElement('p', { className: 'text-xs text-gray-600 line-clamp-2 overflow-hidden' }, proj.description)
                        )
                    )
                ),
                // Dynamic bullets pagination (shows a few dots, not all)
                React.createElement('div', { className: 'swiper-pagination text-sm text-gray-600 mt-2' })
            )
        );
    }

    // Main Sidebar Component
    window.StoryMapComponents.Sidebar = function Sidebar({ projects, selected, onSelect, onSearch }) {
        return React.createElement('div', 
            { className: 'flex flex-col h-full space-y-2 sm:space-y-4' },
            // Project details panel
            React.createElement('div', 
                { className: 'bg-white rounded-lg shadow flex-grow overflow-hidden min-h-0' },
                React.createElement(ProjectDetail, { project: selected })
            ),
            // Search and carousel
            React.createElement('div', 
                { className: 'space-y-2 flex-shrink-0' },
                React.createElement(SearchBar, { onSearch: onSearch }),
                React.createElement('div', 
                    { className: 'bg-white rounded-lg shadow p-2 sm:p-4 h-32 sm:h-40 md:h-48' },
                    React.createElement(ProjectCarousel, {
                        projects: projects,
                        onSelect: onSelect,
                        selectedId: selected?.id
                    })
                )
            )
        );
    };
})();
