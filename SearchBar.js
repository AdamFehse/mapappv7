// SearchBar.js - Search input with dropdown filters for category/theme/product
(function() {
    const { useState, useMemo, useRef, useEffect } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    // Dropdown component for multi-select filters
    function FilterDropdown({ label, icon, options, selected, onChange }) {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        // Close dropdown when clicking outside
        useEffect(() => {
            function handleClickOutside(e) {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        function toggleOption(option) {
            const newSelected = selected.includes(option)
                ? selected.filter(s => s !== option)
                : [...selected, option];
            onChange(newSelected);
        }

        const hasSelection = selected.length > 0;

        return React.createElement('div', { ref: dropdownRef, className: 'filter-dropdown' },
            // Dropdown button
            React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                type: 'button',
                className: `filter-dropdown__button${hasSelection ? ' is-active' : ''}`
            },
                React.createElement('span', {}, icon),
                React.createElement('span', {}, label),
                selected.length > 0 && React.createElement('span', {
                    className: 'filter-dropdown__badge'
                }, selected.length)
            ),

            // Dropdown menu (conditionally rendered)
            isOpen && React.createElement('div', {
                className: 'filter-dropdown__menu'
            },
                options.length > 0
                    ? options.map(option => React.createElement('label', {
                        key: option,
                        className: 'filter-dropdown__option'
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

        function handleChange(e) {
            setValue(e.target.value);
            onSearch(e.target.value);
        }

        function handleClear() {
            setValue('');
            onSearch('');
        }

        function handleFilterChange(filterType, selectedValues) {
            const newFilters = { ...activeFilters, [filterType]: selectedValues };
            setActiveFilters(newFilters);

            // Notify parent component with arrays of selected values
            if (typeof onFiltersChange === 'function') {
                onFiltersChange({
                    categories: newFilters.categories,
                    themes: newFilters.themes,
                    products: newFilters.products
                });
            }
        }

        function handleClearAllFilters() {
            setActiveFilters({ categories: [], themes: [], products: [] });
            if (typeof onFiltersChange === 'function') {
                onFiltersChange({ categories: [], themes: [], products: [] });
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
                    icon: '📁',
                    options: filterOptions.categories,
                    selected: activeFilters.categories,
                    onChange: (selected) => handleFilterChange('categories', selected)
                }),

                // Theme filter
                React.createElement(FilterDropdown, {
                    label: 'Theme',
                    icon: '🎯',
                    options: filterOptions.themes,
                    selected: activeFilters.themes,
                    onChange: (selected) => handleFilterChange('themes', selected)
                }),

                // Product filter
                React.createElement(FilterDropdown, {
                    label: 'Product',
                    icon: '📦',
                    options: filterOptions.products,
                    selected: activeFilters.products,
                    onChange: (selected) => handleFilterChange('products', selected)
                }),

                // Clear all button (only show if filters active)
                hasActiveFilters && React.createElement('button', {
                    onClick: handleClearAllFilters,
                    type: 'button',
                    className: 'filter-dropdown__clear'
                }, '✕ Clear')
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
                }, '✕'),
                // Result count below search bar
                showCount && React.createElement('p', {
                    className: 'search-panel__count'
                }, isSearchFiltered || hasActiveFilters
                    ? `Showing ${resultCount} of ${totalCount} projects`
                    : `${totalCount} projects total`
                )
            )
        );
    };
})();
