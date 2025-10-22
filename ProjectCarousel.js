// ProjectCarousel.js - Thumbnail navigation carousel (Embla scale effect)
const SCALE_TWEEN_FACTOR_BASE = 0.52;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setupScaleTween(embla) {
    let scaleNodes = [];
    let tweenFactor = 0;

    function setScaleNodes() {
        scaleNodes = embla.slideNodes().map(slideNode =>
            slideNode.querySelector('.embla__scale__container')
        );
    }

    function setTweenFactor() {
        tweenFactor = SCALE_TWEEN_FACTOR_BASE * embla.scrollSnapList().length;
    }

    function tweenScale(eventName) {
        const engine = embla.internalEngine();
        const scrollProgress = embla.scrollProgress();
        const slidesInView = embla.slidesInView();
        const isScrollEvent = eventName === 'scroll';

        embla.scrollSnapList().forEach((scrollSnap, snapIndex) => {
            let diffToTarget = scrollSnap - scrollProgress;
            const slidesInSnap = engine.slideRegistry[snapIndex] || [];

            slidesInSnap.forEach(slideIndex => {
                if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

                if (engine.options.loop) {
                    engine.slideLooper.loopPoints.forEach(loopItem => {
                        const target = loopItem.target();
                        if (slideIndex === loopItem.index && target !== 0) {
                            const sign = Math.sign(target);
                            if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
                            if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
                        }
                    });
                }

                const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor);
                const scale = clamp(tweenValue, 0.8, 0.95).toFixed(3);
                const node = scaleNodes[slideIndex];
                if (node) {
                    node.style.transform = `scale(${scale})`;
                }
            });
        });
    }

    function handleScroll() {
        tweenScale('scroll');
    }

    function handleSlideFocus() {
        tweenScale('slideFocus');
    }

    function handleReInit() {
        setScaleNodes();
        setTweenFactor();
        tweenScale();
    }

    setScaleNodes();
    setTweenFactor();
    tweenScale();

    embla.on('scroll', handleScroll);
    embla.on('slideFocus', handleSlideFocus);
    embla.on('reInit', handleReInit);

    return () => {
        embla.off('scroll', handleScroll);
        embla.off('slideFocus', handleSlideFocus);
        embla.off('reInit', handleReInit);
        scaleNodes.forEach(node => node && node.style.removeProperty('transform'));
    };
}

function setupProgressBar(embla, progressNode, projects) {
    if (!progressNode) return () => {};

    const colorUtils = window.ColorUtils;

    // Helper to get RGB values from hex color
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 }; // fallback to blue
    }

    // Helper to interpolate between two RGB colors
    function interpolateRgb(rgb1, rgb2, t) {
        return {
            r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * t),
            g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * t),
            b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * t)
        };
    }

    // Helper to convert RGB back to hex
    function rgbToHex(rgb) {
        return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Extract color from category or use index-based gradient
    function getProjectColor(project) {
        if (!project) return '#3b82f6'; // fallback if project is undefined
        const category = project.raw?.ProjectCategory;
        const categoryColors = colorUtils.getCategoryColor(category);
        
        // Extract the end color from the gradient (it's in the format "linear-gradient(135deg, #color1 0%, #color2 100%)")
        const match = categoryColors.gradient.match(/#[0-9a-fA-F]{6}/g);
        return match ? match[1] : '#1e40af'; // Use the end color, fallback to blue
    }

    function applyProgress() {
        const progress = clamp(embla.scrollProgress(), 0, 1);
        const barProgress = progress * 100;
        
        const projectCount = projects.length;
        if (projectCount === 0) return;
        
        // Calculate the current index based on scroll progress
        // This gives us the actual centered project during smooth scrolling
        const scrollProgress = embla.scrollProgress();
        const currentIndex = Math.round(scrollProgress * (projectCount - 1));
        const clampedIndex = Math.min(Math.max(currentIndex, 0), projectCount - 1);
        
        // Get color for the currently centered project
        const selectedColor = getProjectColor(projects[clampedIndex]);

        // Convert to RGB
        const selectedRgb = hexToRgb(selectedColor);
        const barColor = rgbToHex(selectedRgb);

        // Apply both color and position with smooth transition
        progressNode.style.background = barColor;
        progressNode.style.transform = `translate3d(${barProgress}%, 0px, 0px)`;
    }

    function removeProgress() {
        progressNode.style.background = '';
        progressNode.style.transform = '';
    }

    applyProgress();
    embla.on('scroll', applyProgress);
    embla.on('select', applyProgress);
    embla.on('reInit', applyProgress);

    return () => {
        embla.off('scroll', applyProgress);
        embla.off('select', applyProgress);
        embla.off('reInit', applyProgress);
        removeProgress();
    };
}

(function() {
    const { useEffect, useRef } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.ProjectCarousel = function ProjectCarousel({ projects, onSelect, selectedId }) {

        const viewportRef = useRef(null);
        const emblaRef = useRef(null);
        const prevButtonRef = useRef(null);
        const nextButtonRef = useRef(null);
        const progressBarRef = useRef(null);
        const cleanupScaleRef = useRef(null);
        const cleanupProgressRef = useRef(null);
        const colorUtils = window.ColorUtils;

        function updateControls(embla) {
            const prevBtn = prevButtonRef.current;
            const nextBtn = nextButtonRef.current;
            if (prevBtn) prevBtn.disabled = !embla.canScrollPrev();
            if (nextBtn) nextBtn.disabled = !embla.canScrollNext();
        }

        useEffect(() => {
            const viewportNode = viewportRef.current;
            if (!viewportNode || !window.EmblaCarousel) return;

            const embla = window.EmblaCarousel(viewportNode, {
                align: 'center',
                containScroll: 'trimSnaps',
                dragFree: true
            }, window.EmblaCarouselWheelGestures ? [window.EmblaCarouselWheelGestures()] : []);

            emblaRef.current = embla;
            updateControls(embla);

            if (cleanupScaleRef.current) {
                cleanupScaleRef.current();
            }
            cleanupScaleRef.current = setupScaleTween(embla);

            if (cleanupProgressRef.current) {
                cleanupProgressRef.current();
            }
            cleanupProgressRef.current = setupProgressBar(embla, progressBarRef.current, projects);

            embla.on('select', () => updateControls(embla));
            embla.on('reInit', () => {
                updateControls(embla);
            });

            return () => {
                if (cleanupScaleRef.current) {
                    cleanupScaleRef.current();
                    cleanupScaleRef.current = null;
                }
                if (cleanupProgressRef.current) {
                    cleanupProgressRef.current();
                    cleanupProgressRef.current = null;
                }
                embla.destroy();
                emblaRef.current = null;
            };
        }, [projects.length]);

        useEffect(() => {
            const embla = emblaRef.current;
            if (!embla || !selectedId) return;
            const index = projects.findIndex(p => p.id === selectedId);
            if (index >= 0) {
                embla.scrollTo(index, true);
            }
        }, [selectedId, projects]);

        return React.createElement('div', { className: 'embla carousel' },
            React.createElement('div', { className: 'embla__viewport', ref: viewportRef },
                React.createElement('div', { className: 'embla__container' },
                    projects.map((proj) => {
                        // Use category color if available, otherwise fallback to index-based gradient
                        const category = proj.raw?.ProjectCategory;
                        const categoryColors = colorUtils.getCategoryColor(category);
                        const gradientStyle = { background: categoryColors.gradient };
                        const isActive = selectedId === proj.id;

                        return React.createElement('div', {
                            key: `thumb-${proj.id}`,
                            className: 'embla__slide'
                        },
                            React.createElement('div', {
                                className: `embla__scale__container${isActive ? ' carousel-slide--active' : ''}`
                            },
                                React.createElement('button', {
                                    type: 'button',
                                    className: 'carousel-card',
                                    style: gradientStyle,
                                    onClick: () => onSelect(proj)
                                },
                                    proj.image && React.createElement('img', {
                                        src: proj.image,
                                        alt: proj.name,
                                        className: 'carousel-card__image'
                                    }),
                                    React.createElement('span', { className: 'carousel-card__label' }, proj.name)
                                )
                            )
                        );
                    })
                )
            ),
            React.createElement('div', { className: 'embla__controls' },
                React.createElement('div', { className: 'embla__buttons' },
                    React.createElement('button', {
                        className: 'embla__button embla__button--prev',
                        type: 'button',
                        ref: prevButtonRef,
                        onClick: () => emblaRef.current && emblaRef.current.scrollPrev(),
                        'aria-label': 'Previous projects'
                    }, React.createElement('svg', { className: 'embla__button__svg', viewBox: '0 0 532 532' },
                        React.createElement('path', {
                            fill: 'currentColor',
                            d: 'M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z'
                        }))
                    ),
                    React.createElement('button', {
                        className: 'embla__button embla__button--next',
                        type: 'button',
                        ref: nextButtonRef,
                        onClick: () => emblaRef.current && emblaRef.current.scrollNext(),
                        'aria-label': 'Next projects'
                    }, React.createElement('svg', { className: 'embla__button__svg', viewBox: '0 0 532 532' },
                        React.createElement('path', {
                            fill: 'currentColor',
                            d: 'M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z'
                        }))
                    )
                ),
                React.createElement('div', { className: 'embla__progress' },
                    React.createElement('div', {
                        className: 'embla__progress__bar',
                        ref: progressBarRef
                    })
                )
            )
        );
    };
})();
