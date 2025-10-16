// ProjectCarousel.js - Thumbnail navigation carousel
(function() {
    const { useEffect, useRef } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.ProjectCarousel = function ProjectCarousel({ projects, allProjects, onSelect, selectedId }) {
        const sliderRef = useRef(null);
        const sliderInstance = useRef(null);
        const colorUtils = window.ColorUtils;

        // Initialize thumbnail slider
        useEffect(() => {
            if (!sliderRef.current || !window.keenSlider) return;

            sliderInstance.current = new window.keenSlider(
                sliderRef.current,
                {
                    initial: 0,
                    slides: {
                        perView: 4,
                        spacing: 10,
                    },
                    mode: "free-snap"
                }
            );

            return () => {
                if (sliderInstance.current) {
                    sliderInstance.current.destroy();
                    sliderInstance.current = null;
                }
            };
        }, [projects]);

        // Sync slider position and update active state when selectedId changes
        useEffect(() => {
            const slides = sliderRef.current?.querySelectorAll('.keen-slider__slide');

            // If no selection, clear all active states
            if (!selectedId) {
                if (slides) {
                    slides.forEach(slide => slide.classList.remove('active'));
                }
                return;
            }

            // Otherwise, find and highlight the selected project
            if (!projects.length || !sliderInstance.current) return;
            const idx = projects.findIndex(p => p.id === selectedId);
            if (idx < 0) return;

            // Move slider to show selected thumbnail
            if (typeof sliderInstance.current.moveToIdx === 'function') {
                sliderInstance.current.moveToIdx(idx);
            }

            // Update active class
            if (slides) {
                slides.forEach((slide, i) => {
                    if (i === idx) {
                        slide.classList.add('active');
                    } else {
                        slide.classList.remove('active');
                    }
                });
            }
        }, [selectedId, projects]);

        return React.createElement('div', { className: 'cursor-pointer' },
            // Thumbnail slider - navigation only
            React.createElement('div', {
                ref: sliderRef,
                className: 'keen-slider thumbnail cursor-pointer',
                style: { height: '120px' }
            },
                projects.map((proj) => {
                    // Find the project's index in the FULL allProjects array for consistent coloring
                    const projectIndex = allProjects ? allProjects.findIndex(p => p.id === proj.id) : 0;
                    const gradientStyle = colorUtils.getGradientStyle(projectIndex >= 0 ? projectIndex : 0);
                    return React.createElement('div', {
                        key: `thumb-${proj.id}`,
                        className: 'keen-slider__slide flex flex-col items-center justify-start p-2 rounded-lg cursor-pointer border-2 border-transparent transition-all hover:opacity-90',
                        style: gradientStyle,
                        onClick: () => onSelect(proj)
                    },
                        proj.image && React.createElement('img', {
                            src: proj.image,
                            alt: proj.name,
                            className: 'w-full h-20 object-contain rounded mb-1.5 bg-white/20 p-1'
                        }),
                        React.createElement('span', { className: 'text-xs font-semibold truncate w-full text-center leading-tight text-white' }, proj.name)
                    );
                })
            ),
            // CSS for active thumbnail with green border like the example
            React.createElement('style', {
                dangerouslySetInnerHTML: {
                    __html: `.thumbnail .keen-slider__slide.active { border-color: #4CAF50; box-shadow: 0 0 0 3px #4CAF50; }`
                }
            })
        );
    };
})();
