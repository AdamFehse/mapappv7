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

        return React.createElement('div', { ref: dropdownRef, className: 'relative' },
            // Dropdown button
            React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                className: `px-3 py-2 rounded-lg border-2 transition-colors flex items-center gap-1 text-sm ${
                    hasSelection
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`
            },
                React.createElement('span', {}, icon),
                React.createElement('span', {}, label),
                selected.length > 0 && React.createElement('span', {
                    className: 'ml-1 bg-blue-600 text-white px-1.5 rounded-full text-xs font-bold'
                }, selected.length)
            ),

            // Dropdown menu (conditionally rendered)
            isOpen && React.createElement('div', {
                className: 'absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-max'
            },
                React.createElement('div', { className: 'p-2 max-h-64 overflow-y-auto' },
                    options.length > 0
                        ? options.map(option => React.createElement('label', {
                            key: option,
                            className: 'flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer text-sm'
                        },
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: selected.includes(option),
                                onChange: () => toggleOption(option),
                                className: 'w-4 h-4'
                            }),
                            React.createElement('span', {}, option)
                        ))
                        : React.createElement('div', { className: 'px-3 py-2 text-gray-500 text-sm' }, 'No options')
                )
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
            const categories = new Set();
            const themes = new Set();
            const products = new Set();

            allProjects.forEach(p => {
                if (p.raw?.ProjectCategory) categories.add(p.raw.ProjectCategory);
                if (p.raw?.Theme) themes.add(p.raw.Theme);
                if (p.raw?.Product) products.add(p.raw.Product);
            });

            return {
                categories: Array.from(categories).sort(),
                themes: Array.from(themes).sort(),
                products: Array.from(products).sort()
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

        return React.createElement('div', { className: 'space-y-3' },
            // Filter dropdowns in a compact row
            React.createElement('div', { className: 'flex gap-2 items-center flex-wrap' },
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
                    className: 'px-2 py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'
                }, '✕ Clear')
            ),

            // Search input
            React.createElement('div', { className: 'relative' },
                React.createElement('input', {
                    type: 'text',
                    value: value,
                    onChange: handleChange,
                    placeholder: 'Search projects...',
                    className: 'w-full px-4 py-2 pr-20 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none'
                }),
                // Clear button (only show when there's text)
                isSearchFiltered && React.createElement('button', {
                    onClick: handleClear,
                    className: 'absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors',
                    title: 'Clear search'
                }, '✕'),
                // Result count below search bar
                showCount && React.createElement('div', {
                    className: 'text-xs text-gray-600 mt-1 px-1'
                }, isSearchFiltered || hasActiveFilters
                    ? `Showing ${resultCount} of ${totalCount} projects`
                    : `${totalCount} projects total`
                )
            )
        );
    };
})();
