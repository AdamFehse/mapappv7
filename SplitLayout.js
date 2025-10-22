// SplitLayout.js - Draggable split panels for map and sidebar
const { useState, useRef, useMemo, useEffect } = React;
window.StoryMapComponents = window.StoryMapComponents || {};

(function() {
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
            // Only trigger resize callback when orientation changes
            // Don't depend on onPrimaryResize to avoid infinite loops
            if (typeof onPrimaryResize === 'function') {
                onPrimaryResize(ratioRef.current);
            }
        }, [isRow]);

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
