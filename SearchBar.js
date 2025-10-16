// SearchBar.js - Simple search input component
(function() {
    const { useState } = React;
    window.StoryMapComponents = window.StoryMapComponents || {};

    window.StoryMapComponents.SearchBar = function SearchBar({ onSearch, resultCount, totalCount }) {
        const [value, setValue] = useState('');

        function handleChange(e) {
            setValue(e.target.value);
            onSearch(e.target.value);
        }

        function handleClear() {
            setValue('');
            onSearch('');
        }

        const showCount = resultCount !== undefined && totalCount !== undefined;
        const isFiltered = value.trim().length > 0;

        return React.createElement('div', { className: 'relative' },
            React.createElement('input', {
                type: 'text',
                value: value,
                onChange: handleChange,
                placeholder: 'Search projects...',
                className: 'w-full px-4 py-2 pr-20 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none'
            }),
            // Clear button (only show when there's text)
            isFiltered && React.createElement('button', {
                onClick: handleClear,
                className: 'absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors',
                title: 'Clear search'
            }, '✕'),
            // Result count below search bar
            showCount && React.createElement('div', {
                className: 'text-xs text-gray-600 mt-1 px-1'
            }, isFiltered
                ? `Showing ${resultCount} of ${totalCount} projects`
                : `${totalCount} projects total`
            )
        );
    };
})();
