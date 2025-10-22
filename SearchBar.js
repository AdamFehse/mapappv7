// SearchBar.js - Search input with dropdown filters for category/theme/product
(function() {
    const { useState, useMemo, useRef, useEffect } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    const svgBaseProps = {
        width: 18,
        height: 18,
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        focusable: 'false',
        'aria-hidden': 'true'
    };

    const FILTER_ICONS = {
        category: React.createElement('svg', svgBaseProps,
            React.createElement('rect', { x: 3, y: 8, width: 18, height: 11, rx: 2, ry: 2 }),
            React.createElement('path', { d: 'M3 8h6l2-2h10' })
        ),
        theme: React.createElement('svg', svgBaseProps,
            React.createElement('path', { d: 'M12 3v4' }),
            React.createElement('path', { d: 'M5.5 7.3l3 2.2' }),
            React.createElement('path', { d: 'M18.5 7.3l-3 2.2' }),
            React.createElement('polygon', { points: '12 9.2 14.2 13.4 19 14.1 15.6 17.2 16.4 21.7 12 19.5 7.6 21.7 8.4 17.2 5 14.1 9.8 13.4' })
        ),
        product: React.createElement('svg', svgBaseProps,
            React.createElement('path', { d: 'M4 8.5 12 4l8 4.5v7l-8 4.5-8-4.5z' }),
            React.createElement('path', { d: 'M12 4v16.5' }),
            React.createElement('path', { d: 'm4 8.5 8 4.5 8-4.5' })
        )
    };

    // Dropdown component for multi-select filters
    function FilterDropdown({ label, icon, options, selected, onChange }) {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        // Close dropdown when clicking outside
        useEffect(() => {
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        function toggleOption(option) {
            const next = selected.includes(option)
                ? selected.filter(value => value !== option)
                : [...selected, option];
            onChange(next);
        }

        const hasSelection = selected.length > 0;

        return React.createElement('div', { ref: dropdownRef, className: 'filter-dropdown' },
            // Dropdown button
            React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                type: 'button',
                className: `filter-dropdown__button${hasSelection ? ' is-active' : ''}`,
                'aria-haspopup': 'listbox',
                'aria-expanded': isOpen ? 'true' : 'false'
            },
                React.createElement('span', { className: 'filter-dropdown__icon', 'aria-hidden': 'true' }, icon),
                React.createElement('span', { className: 'filter-dropdown__label' }, label),
                hasSelection && React.createElement('span', {
                    className: 'filter-dropdown__badge'
                }, selected.length)
            ),

            // Dropdown menu (conditionally rendered)
            isOpen && React.createElement('div', {
                className: 'filter-dropdown__menu',
                role: 'listbox',
                'aria-label': `${label} options`
            },
                options.length > 0
                    ? options.map(option => React.createElement('label', {
                        key: option,
                        className: 'filter-dropdown__option',
                        role: 'option',
                        'aria-selected': selected.includes(option) ? 'true' : 'false'
                    },
                        React.createElement('input', {
                            type: 'checkbox',
                            checked: selected.includes(option),
                            onChange: () => toggleOption(option)
                        }),
                        React.createElement('span', {}, option)
                    ))
                    : React.createElement('div', { className: 'filter-dropdown__empty muted' }, 'No options')
            )
        );
    }

    window.StoryMapComponents.SearchBar = function SearchBar({
        onSearch,
        onFiltersChange,
        resultCount,
        totalCount,
        allProjects = []
    }) {
        const [value, setValue] = useState('');
        const [activeFilters, setActiveFilters] = useState({
            categories: [],
            themes: [],
            products: []
        });

        // Extract unique categories, themes, products from all projects
        const filterOptions = useMemo(() => {
            const filterUtils = window.ProjectFilter;
            if (!filterUtils) {
                return { categories: [], themes: [], products: [] };
            }
            return {
                categories: filterUtils.getCategories(allProjects),
                themes: filterUtils.getThemes(allProjects),
                products: filterUtils.getProducts(allProjects)
            };
        }, [allProjects]);

        function handleChange(event) {
            const next = event.target.value;
            setValue(next);
            onSearch(next);
        }

        function handleClear() {
            setValue('');
            onSearch('');
        }

        function handleFilterChange(filterType, selectedValues) {
            const newFilters = { ...activeFilters, [filterType]: selectedValues };
            setActiveFilters(newFilters);

            if (typeof onFiltersChange === 'function') {
                onFiltersChange({
                    categories: newFilters.categories,
                    themes: newFilters.themes,
                    products: newFilters.products
                });
            }
        }

        function handleClearAllFilters() {
            const emptyFilters = { categories: [], themes: [], products: [] };
            setActiveFilters(emptyFilters);
            if (typeof onFiltersChange === 'function') {
                onFiltersChange(emptyFilters);
            }
        }

        const showCount = resultCount !== undefined && totalCount !== undefined;
        const isSearchFiltered = value.trim().length > 0;
        const hasActiveFilters = activeFilters.categories.length > 0 || activeFilters.themes.length > 0 || activeFilters.products.length > 0;

        return React.createElement('div', { className: 'search-panel' },
            // Filter dropdowns in a compact row
            React.createElement('div', { className: 'search-panel__filters' },
                // Category filter
                React.createElement(FilterDropdown, {
                    label: 'Category',
                    icon: FILTER_ICONS.category,
                    options: filterOptions.categories,
                    selected: activeFilters.categories,
                    onChange: (selected) => handleFilterChange('categories', selected)
                }),

                // Theme filter
                React.createElement(FilterDropdown, {
                    label: 'Theme',
                    icon: FILTER_ICONS.theme,
                    options: filterOptions.themes,
                    selected: activeFilters.themes,
                    onChange: (selected) => handleFilterChange('themes', selected)
                }),

                // Product filter
                React.createElement(FilterDropdown, {
                    label: 'Product',
                    icon: FILTER_ICONS.product,
                    options: filterOptions.products,
                    selected: activeFilters.products,
                    onChange: (selected) => handleFilterChange('products', selected)
                }),

                // Clear all button (only show if filters active)
                hasActiveFilters && React.createElement('button', {
                    onClick: handleClearAllFilters,
                    type: 'button',
                    className: 'filter-dropdown__clear'
                }, 'Clear filters')
            ),

            // Search input
            React.createElement('div', { className: 'search-panel__field' },
                React.createElement('input', {
                    type: 'text',
                    value: value,
                    onChange: handleChange,
                    placeholder: 'Search projects...',
                    className: 'search-panel__input',
                    'aria-label': 'Search projects'
                }),
                // Clear button (only show when there's text)
                isSearchFiltered && React.createElement('button', {
                    onClick: handleClear,
                    type: 'button',
                    className: 'search-panel__clear',
                    title: 'Clear search'
                }, 'Clear'),
                // Result count below search bar
                showCount && React.createElement('p', {
                    className: 'search-panel__count'
                }, isSearchFiltered || hasActiveFilters
                    ? `Showing ${resultCount} of ${totalCount} projects`
                    : `${totalCount} projects total`
                )
            ),

            // Mini legend with category colors
            React.createElement('div', { className: 'sidebar__legend' },
                window.ColorUtils && Object.entries(window.ColorUtils.categoryColors || {}).map(([name, colors]) =>
                    React.createElement('div', { key: name, className: 'sidebar__legend-item' },
                        React.createElement('span', {
                            className: 'sidebar__legend-dot',
                            style: { background: colors?.border || '#3b82f6' }
                        }),
                        React.createElement('span', {}, colors?.short || name)
                    )
                )
            )
        );
    };
})();
