// SplitLayout.js - Draggable split panels for map and sidebar
(function() {
    const { useState, useRef, useMemo } = React;
    const useEffect = React.useEffect;
    window.StoryMapComponents = window.StoryMapComponents || {};

    const STYLE_ID = 'draggable-split-styles';

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .split-layout {
                position: relative;
                display: flex;
                width: 100%;
                height: 100%;
            }
            .split-layout--column {
                flex-direction: column;
            }
            .split-layout--row {
                flex-direction: row;
            }
            .split-pane {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
            }
            .split-handle {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                background: rgba(17, 24, 39, 0.12);
                transition: background 0.2s ease;
            }
            .split-handle::after {
                content: '';
                display: inline-block;
                background: rgba(17, 24, 39, 0.5);
                border-radius: 9999px;
            }
            .split-handle:hover {
                background: rgba(17, 24, 39, 0.18);
            }
            .split-handle:active {
                background: rgba(17, 24, 39, 0.25);
            }
            .split-layout--column .split-handle {
                cursor: row-resize;
                height: 10px;
                width: 100%;
            }
            .split-layout--column .split-handle::after {
                width: 48px;
                height: 4px;
            }
            .split-layout--row .split-handle {
                cursor: col-resize;
                width: 10px;
                height: 100%;
            }
            .split-layout--row .split-handle::after {
                width: 4px;
                height: 48px;
            }
        `;
        document.head.appendChild(style);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    window.StoryMapComponents.DraggableSplit = function DraggableSplit({
        primary,
        secondary,
        initialPrimary = 0.6,
        minPrimary = 0.25,
        maxPrimary = 0.85,
        breakpoint = 1024,
        onPrimaryResize,
        className = '',
        handleAriaLabel = 'Resize panels'
    }) {
        ensureStyles();

        const containerRef = useRef(null);
        const orientationRef = useRef(false);

        const [isRow, setIsRow] = useState(() => {
            if (typeof window === 'undefined' || !window.matchMedia) return false;
            return window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
        });
        const [primaryRatio, setPrimaryRatio] = useState(() => clamp(initialPrimary, minPrimary, maxPrimary));
        const draggingRef = useRef(false);
        const cleanupRef = useRef(null);

        // Keep refs updated with latest values for event handlers
        orientationRef.current = isRow;

        const ratioRef = useRef(primaryRatio);
        ratioRef.current = primaryRatio;

        useEffect(() => {
            if (typeof onPrimaryResize === 'function') {
                onPrimaryResize(primaryRatio);
            }
        }, [primaryRatio, onPrimaryResize]);

        useEffect(() => {
            if (typeof window === 'undefined' || !window.matchMedia) return;
            const query = window.matchMedia(`(min-width: ${breakpoint}px)`);

            const handleChange = (event) => {
                setIsRow(event.matches);
            };

            handleChange(query);
            query.addEventListener('change', handleChange);
            return () => query.removeEventListener('change', handleChange);
        }, [breakpoint]);

        useEffect(() => {
            if (typeof onPrimaryResize === 'function') {
                onPrimaryResize(ratioRef.current);
            }
        }, [isRow, onPrimaryResize]);

        const updateRatioFromEvent = (event) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            let ratio;
            if (orientationRef.current) {
                ratio = (event.clientX - rect.left) / rect.width;
            } else {
                ratio = (event.clientY - rect.top) / rect.height;
            }
            setPrimaryRatio(clamp(ratio, minPrimary, maxPrimary));
        };

        const startDragging = (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            const activePointerId = event.pointerId;
            draggingRef.current = true;
            updateRatioFromEvent(event);

            const handleMove = (moveEvent) => {
                if (moveEvent.pointerId !== activePointerId) return;
                moveEvent.preventDefault();
                updateRatioFromEvent(moveEvent);
            };

            const handleUp = (upEvent) => {
                if (upEvent.pointerId !== activePointerId) return;
                upEvent.preventDefault();
                if (cleanupRef.current) {
                    cleanupRef.current();
                }
            };

            const cleanup = () => {
                if (!draggingRef.current) return;
                draggingRef.current = false;
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleUp);
                window.removeEventListener('pointercancel', handleUp);
                cleanupRef.current = null;
            };

            cleanupRef.current = cleanup;

            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
            window.addEventListener('pointercancel', handleUp);
        };

        useEffect(() => {
            return () => {
                if (cleanupRef.current) {
                    cleanupRef.current();
                }
            };
        }, []);

        const primaryStyle = useMemo(() => ({
            flexBasis: `${(primaryRatio * 100).toFixed(2)}%`
        }), [primaryRatio]);

        const secondaryStyle = useMemo(() => ({
            flexBasis: `${((1 - primaryRatio) * 100).toFixed(2)}%`
        }), [primaryRatio]);

        const orientationClass = isRow ? 'split-layout--row' : 'split-layout--column';

        return React.createElement('div', {
            ref: containerRef,
            className: `split-layout ${orientationClass} ${className}`.trim()
        },
            React.createElement('div', {
                className: 'split-pane split-pane-primary',
                style: primaryStyle
            }, primary),
            React.createElement('div', {
                className: 'split-handle',
                role: 'separator',
                tabIndex: 0,
                'aria-label': handleAriaLabel,
                'aria-orientation': isRow ? 'vertical' : 'horizontal',
                onPointerDown: startDragging,
                onKeyDown: (event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        setPrimaryRatio(prev => clamp(prev - 0.02, minPrimary, maxPrimary));
                    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        setPrimaryRatio(prev => clamp(prev + 0.02, minPrimary, maxPrimary));
                    }
                }
            }),
            React.createElement('div', {
                className: 'split-pane split-pane-secondary',
                style: secondaryStyle
            }, secondary)
        );
    };
})();
