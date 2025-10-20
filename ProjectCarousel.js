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

    const STYLE_ID = 'project-carousel-embla-scale';

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .embla {
                width: 100%;
                max-width: 640px;
                margin: 0 auto;
                --slide-spacing: 0.6rem;
                --slide-size: 38%;
            }
            .embla__viewport {
                overflow: hidden;
            }
            .embla__container {
                display: flex;
                touch-action: pan-y pinch-zoom;
                margin-left: calc(var(--slide-spacing) * -1);
                user-select: none;
            }
            .embla__slide {
                transform: translate3d(0, 0, 0);
                flex: 0 0 var(--slide-size);
                min-width: 0;
                padding-left: var(--slide-spacing);
            }
            @media (max-width: 900px) {
                .embla {
                    --slide-size: 44%;
                }
            }
            @media (max-width: 640px) {
                .embla {
                    --slide-size: 58%;
                }
            }
            .embla__scale__container {
                width: 100%;
                display: flex;
                justify-content: center;
                transform: scale(0.85);
                transition: transform 0.35s ease;
            }
            .carousel-card {
                width: 100%;
                border-radius: 0.85rem;
                border: 2px solid transparent;
                padding: 0.45rem 0.45rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 0.25rem;
                color: #fff;
                background: linear-gradient(135deg, #3b82f6, #1e3a8a);
                box-shadow: 0 12px 26px rgba(15, 23, 42, 0.25);
                cursor: pointer;
                transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
                min-height: 120px;
                max-height: 120px;
            }
            .carousel-card:hover {
                opacity: 0.93;
            }
            .carousel-card:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.45);
            }
            .carousel-card__image {
                width: 100%;
                height: 52px;
                object-fit: cover;
                border-radius: 0.65rem;
                box-shadow: 0 6px 16px rgba(15, 23, 42, 0.35);
            }
            .carousel-card__label {
                font-size: 0.7rem;
                font-weight: 600;
                text-align: center;
                line-height: 1.25;
                padding: 0 0.2rem;
                max-height: 32px;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            .embla__scale__container.carousel-slide--active .carousel-card {
                border-color: rgba(255, 255, 255, 0.9);
                box-shadow: 0 16px 30px rgba(15, 23, 42, 0.35);
            }
            .embla__controls {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                gap: 0.9rem;
                margin-top: 1rem;
            }
            .embla__buttons {
                display: grid;
                grid-template-columns: repeat(2, 2.6rem);
                gap: 0.5rem;
            }
            .embla__button {
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                border: 0;
                width: 2.6rem;
                height: 2.6rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: rgba(226, 232, 240, 0.85);
                box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.6);
                transition: color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            }
            .embla__button:hover:not([disabled]) {
                background: rgba(59, 130, 246, 0.15);
                color: #fff;
            }
            .embla__button:focus {
                outline: none;
                box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.55);
            }
            .embla__button[disabled] {
                opacity: 0.35;
                cursor: default;
            }
            .embla__button__svg {
                width: 40%;
                height: 40%;
            }
            .embla__progress {
                position: relative;
                width: 100%;
                height: 0.4rem;
                border-radius: 9999px;
                background: rgba(148, 163, 184, 0.35);
                overflow: hidden;
            }
            .embla__progress__bar {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(135deg, #4CAF50, #22c55e);
                transform: translate3d(0,0,0);
                transition: transform 0.12s linear;
            }
        `;
        document.head.appendChild(style);
    }

    window.StoryMapComponents.ProjectCarousel = function ProjectCarousel({ projects, allProjects, onSelect, selectedId }) {
        ensureStyles();

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

        return React.createElement('div', { className: 'embla cursor-pointer' },
            React.createElement('div', { className: 'embla__viewport', ref: viewportRef },
                React.createElement('div', { className: 'embla__container' },
                    projects.map((proj) => {
                        const projectIndex = allProjects ? allProjects.findIndex(p => p.id === proj.id) : 0;
                        const gradientStyle = colorUtils.getGradientStyle(projectIndex >= 0 ? projectIndex : 0);
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
