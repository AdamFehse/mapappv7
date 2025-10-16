// ProjectFilter.js - Centralized filtering logic for projects
// Usage: ProjectFilter.filter(projects, criteria)

const ProjectFilter = {
    /**
     * Filter projects by criteria
     * @param {Array} projects - List of all projects
     * @param {Object} criteria - Filtering criteria (search, category, year, etc.)
     * @returns {Array} Filtered projects
     */
    filter(projects, criteria) {
        if (!Array.isArray(projects)) return [];
        let result = projects;

        // Search term filter - expanded to include PI name, location, and category
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
                (p.raw && p.raw.Affiliation && p.raw.Affiliation.toLowerCase().includes(term)) || // Affiliation
                (p.raw && p.raw.Department && p.raw.Department.toLowerCase().includes(term)) // Department
            );
        }

        // Category filter (example)
        if (criteria.category && criteria.category !== 'all') {
            result = result.filter(p =>
                p.raw && p.raw.ProjectCategory === criteria.category
            );
        }

        // Year filter (example)
        if (criteria.year && !isNaN(criteria.year)) {
            result = result.filter(p =>
                p.raw && Number(p.raw.Year) === Number(criteria.year)
            );
        }

        // Add more filters here as needed

        return result;
    }
};

window.ProjectFilter = ProjectFilter;
