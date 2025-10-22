// ProjectFilter.js - Centralized filtering logic for projects
// Usage: ProjectFilter.filter(projects, criteria)

const ProjectFilter = {
    /**
     * Filter projects by criteria
     * @param {Array} projects - List of all projects
     * @param {Object} criteria - Filtering criteria (search, category, tags, theme, product, year, etc.)
     * @returns {Array} Filtered projects
     */
    filter(projects, criteria) {
        if (!Array.isArray(projects)) return [];
        let result = projects;

        // Search term filter - expanded to include PI name, location, category, theme, product
        if (criteria.search && criteria.search.trim()) {
            const term = criteria.search.trim().toLowerCase();
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                (p.raw && p.raw.ProjectName && p.raw.ProjectName.toLowerCase().includes(term)) ||
                (p.raw && p.raw.DescriptionShort && p.raw.DescriptionShort.toLowerCase().includes(term)) ||
                (p.raw && p.raw.Name && p.raw.Name.toLowerCase().includes(term)) || // PI name
                (p.raw && p.raw.Location && p.raw.Location.toLowerCase().includes(term)) || // Location
                (p.raw && p.raw.ProjectCategory && p.raw.ProjectCategory.toLowerCase().includes(term)) || // Category
                (p.raw && p.raw.Theme && p.raw.Theme.toLowerCase().includes(term)) || // Theme
                (p.raw && p.raw.Product && p.raw.Product.toLowerCase().includes(term)) || // Product type
                (p.raw && p.raw.Affiliation && p.raw.Affiliation.toLowerCase().includes(term)) || // Affiliation
                (p.raw && p.raw.Department && p.raw.Department.toLowerCase().includes(term)) || // Department
                (Array.isArray(p.raw?.Tags) && p.raw.Tags.some(tag => tag.toLowerCase().includes(term))) // Tags
            );
        }

        // Category filter (array: multiple categories can be selected - match any)
        if (criteria.categories && Array.isArray(criteria.categories) && criteria.categories.length > 0) {
            result = result.filter(p =>
                p.raw && criteria.categories.includes(p.raw.ProjectCategory)
            );
        }
        // Legacy single category filter (for backward compatibility)
        else if (criteria.category && criteria.category !== 'all') {
            result = result.filter(p =>
                p.raw && p.raw.ProjectCategory === criteria.category
            );
        }

        // Theme filter (array: multiple themes can be selected - match any)
        if (criteria.themes && Array.isArray(criteria.themes) && criteria.themes.length > 0) {
            result = result.filter(p =>
                p.raw && criteria.themes.includes(p.raw.Theme)
            );
        }
        // Legacy single theme filter (for backward compatibility)
        else if (criteria.theme && criteria.theme !== 'all') {
            result = result.filter(p =>
                p.raw && p.raw.Theme === criteria.theme
            );
        }

        // Product type filter (array: multiple products can be selected - match any)
        if (criteria.products && Array.isArray(criteria.products) && criteria.products.length > 0) {
            result = result.filter(p =>
                p.raw && criteria.products.includes(p.raw.Product)
            );
        }
        // Legacy single product filter (for backward compatibility)
        else if (criteria.product && criteria.product !== 'all') {
            result = result.filter(p =>
                p.raw && p.raw.Product === criteria.product
            );
        }

        // Tag filter (multiple tags can be selected - match any tag)
        if (criteria.tags && Array.isArray(criteria.tags) && criteria.tags.length > 0) {
            result = result.filter(p =>
                Array.isArray(p.raw?.Tags) && criteria.tags.some(tag => p.raw.Tags.includes(tag))
            );
        }

        // Single tag filter (for convenience)
        if (criteria.tag && criteria.tag !== 'all') {
            result = result.filter(p =>
                Array.isArray(p.raw?.Tags) && p.raw.Tags.includes(criteria.tag)
            );
        }

        // Year filter
        if (criteria.year && !isNaN(criteria.year)) {
            result = result.filter(p =>
                p.raw && Number(p.raw.Year) === Number(criteria.year)
            );
        }

        // HasArtwork filter
        if (criteria.hasArtwork === true) {
            result = result.filter(p =>
                p.raw && p.raw.HasArtwork === true
            );
        }

        // HasMusic filter
        if (criteria.hasMusic === true) {
            result = result.filter(p =>
                p.raw && p.raw.HasMusic === true
            );
        }

        // HasResearch filter
        if (criteria.hasResearch === true) {
            result = result.filter(p =>
                p.raw && p.raw.HasResearch === true
            );
        }

        return result;
    },

    /**
     * Get unique categories from projects
     * @param {Array} projects - List of all projects
     * @returns {Array} Unique categories
     */
    getCategories(projects) {
        const categories = new Set();
        projects.forEach(p => {
            if (p.raw?.ProjectCategory) {
                categories.add(p.raw.ProjectCategory);
            }
        });
        return Array.from(categories).sort();
    },

    /**
     * Get unique themes from projects
     * @param {Array} projects - List of all projects
     * @returns {Array} Unique themes
     */
    getThemes(projects) {
        const themes = new Set();
        projects.forEach(p => {
            if (p.raw?.Theme) {
                themes.add(p.raw.Theme);
            }
        });
        return Array.from(themes).sort();
    },

    /**
     * Get unique product types from projects
     * @param {Array} projects - List of all projects
     * @returns {Array} Unique product types
     */
    getProducts(projects) {
        const products = new Set();
        projects.forEach(p => {
            if (p.raw?.Product) {
                products.add(p.raw.Product);
            }
        });
        return Array.from(products).sort();
    },

    /**
     * Get all tags from projects
     * @param {Array} projects - List of all projects
     * @returns {Array} Unique tags with counts
     */
    getTags(projects) {
        const tagCounts = {};
        projects.forEach(p => {
            if (Array.isArray(p.raw?.Tags)) {
                p.raw.Tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }
};

window.ProjectFilter = ProjectFilter;
