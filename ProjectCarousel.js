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

function setupProgressBar(embla, progressNode) {
    if (!progressNode) return () => {};

    function applyProgress() {
        const progress = clamp(embla.scrollProgress(), 0, 1);
        progressNode.style.transform = `translate3d(${progress * 100}%, 0px, 0px)`;
    }

    function removeProgress() {
        progressNode.removeAttribute('style');
    }

    applyProgress();
    embla.on('scroll', applyProgress);
    embla.on('reInit', applyProgress);

    return () => {
        embla.off('scroll', applyProgress);
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
            cleanupProgressRef.current = setupProgressBar(embla, progressBarRef.current);

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
