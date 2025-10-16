// ColorUtils.js - Centralized color gradients for project styling
(function() {
    window.ColorUtils = {
        // Consolidated color palette - single source of truth
        // Each gradient has start/end colors that work everywhere
        gradients: [
            { start: '#a855f7', end: '#7e22ce', name: 'purple' },      // purple-500 to purple-700
            { start: '#ec4899', end: '#ef4444', name: 'pink-red' },    // pink-500 to red-500
            { start: '#22d3ee', end: '#0891b2', name: 'cyan' },        // cyan-400 to cyan-600
            { start: '#4ade80', end: '#14b8a6', name: 'green-teal' },  // green-400 to teal-500
            { start: '#fb923c', end: '#ec4899', name: 'orange-pink' }, // orange-400 to pink-500
            { start: '#6366f1', end: '#7e22ce', name: 'indigo-purple' }, // indigo-500 to purple-800
            { start: '#3b82f6', end: '#4f46e5', name: 'blue-indigo' }, // blue-500 to indigo-600
            { start: '#facc15', end: '#f97316', name: 'yellow-orange' }, // yellow-400 to orange-500
            { start: '#2dd4bf', end: '#22c55e', name: 'teal-green' },  // teal-400 to green-500
            { start: '#ef4444', end: '#ec4899', name: 'red-pink' }     // red-500 to pink-600
        ],

        // Get CSS gradient string for inline styles (popups, markers)
        getGradientCSS: function(index) {
            const gradient = this.gradients[index % this.gradients.length];
            return `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`;
        },

        // Get inline style object for React (carousel, project detail headers)
        getGradientStyle: function(index) {
            const gradient = this.gradients[index % this.gradients.length];
            return {
                background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`
            };
        },

        // Get start color for single color needs (marker borders)
        getStartColor: function(index) {
            return this.gradients[index % this.gradients.length].start;
        },

        // Get end color for single color needs
        getEndColor: function(index) {
            return this.gradients[index % this.gradients.length].end;
        },

        // Get gradient by project ID (finds index in projects array)
        getGradientCSSById: function(projectId, projects) {
            const idx = projects.findIndex(p => p.id === projectId);
            return this.getGradientCSS(idx >= 0 ? idx : 0);
        },

        // Get gradient style by project ID
        getGradientStyleById: function(projectId, projects) {
            const idx = projects.findIndex(p => p.id === projectId);
            return this.getGradientStyle(idx >= 0 ? idx : 0);
        }
    };
})();
