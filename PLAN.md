# Story Map App - Art-Focused Refactoring Plan

## Overview
Refactor the app to leverage the new enhanced data structure (v3) with 70 projects, art/research categorization, and tags for an engaging, modern art-focused storymap experience.

---

## Current State (✅ Complete)

### Data Migration (v2 → v3)
- ✅ CSV from college taxonomy imported
- ✅ 70 projects converted to JSON (v3)
- ✅ Coordinates mapped to location names
- ✅ Data uploaded to gh-pages
- ✅ Config updated to point to new data

### New Data Structure Available
```json
{
  "id": "project-1-...",
  "ProjectName": "...",
  "ProjectLeads": ["..."],
  "Affiliation": "...",
  "Year": 2022,
  "Email": "...",
  "ImageUrl": "...",
  "ProjectCategory": "Art-Based Projects|Research Projects|Education and Community Outreach",
  "Theme": "Place and Identity|Migration and Human Rights|...",
  "Product": "Photography|Music|Theater & Other Live Performances|...",
  "Location": "Tucson|Nogales, MX|Tohono O'odham Nation|...",
  "Latitude": 32.xxx,
  "Longitude": -110.xxx,
  "Tags": ["art", "music", "research", "community"],
  "HasArtwork": true,
  "HasMusic": false,
  "HasResearch": false,
  "Artworks": [],
  "Music": [],
  "Research": [],
  "Outcomes": []
}
```

---

## Phase 1: Filter & Search Enhancement

### 1.1 Update ProjectFilter.js
- [ ] Add **category filter** (Art-Based, Research, Education/Community)
- [ ] Add **tag filter** (art, music, research, community)
- [ ] Add **theme filter** (Place & Identity, Migration & Human Rights, etc.)
- [ ] Add **product type filter** (Photography, Music, Theater, etc.)
- [ ] Update filter logic to handle multiple filter types simultaneously
- [ ] Clear/reset all filters button

### 1.2 Update SearchBar.js
- [ ] Display active filters as chips/badges
- [ ] Show filter counts (e.g., "3 Art projects matching...")
- [ ] Add category quick-select buttons above search
- [ ] Maintain result counter with new filters

**Expected Outcome:** Users can drill down by category → theme → product type → search

---

## Phase 2: Visual Enhancements - Markers & Map

### 2.1 Update MapUtils.js
- [ ] **Color-code markers by ProjectCategory**
  - Art-Based Projects → Warm color (e.g., #FF6B6B)
  - Research Projects → Cool color (e.g., #4ECDC4)
  - Education & Community → Accent color (e.g., #FFE66D)
- [ ] **Size markers based on HasArtwork/HasMusic flags**
  - Larger circle if has media content
  - Indicator icon for media types
- [ ] Update popup content to show Product type & Theme

### 2.2 Update MapContainer.js
- [ ] Apply color scheme consistently
- [ ] Add legend showing category colors
- [ ] Ensure color persistence across filter changes

**Expected Outcome:** Visual map that communicates project type at a glance

---

## Phase 3: Project Detail & Sidebar Enhancement

### 3.1 Update ProjectDetail.js
- [ ] Display **ProjectCategory** prominently (badge/pill)
- [ ] Display **Theme** as secondary classification
- [ ] Display **Product type** (Photography, Music, etc.)
- [ ] Display **Tags** as clickable badges (click to filter)
- [ ] Show **Project Leads** with emails
- [ ] Show **Year** and **Affiliation**
- [ ] "Related Projects" section based on matching tags/theme

### 3.2 Update Sidebar.js
- [ ] Reorganize header to show category + theme + product
- [ ] Add tags section
- [ ] Prepare space for future Artworks/Music/Research media

**Expected Outcome:** Rich project information that highlights art/research nature

---

## Phase 4: Gallery & Collections View (Future Enhancements)

### 4.1 Create Art Gallery Component
- [ ] Filter view by "Art-Based Projects" only
- [ ] Grid/gallery layout of project cards
- [ ] Display ImageUrl prominently
- [ ] When Artworks array is populated: lightbox/modal for images

### 4.2 Create Thematic Collections
- [ ] Curated views: "Place & Identity", "Migration Stories", "Community Voices"
- [ ] Timeline view: Projects funded by year
- [ ] Impact showcase: Projects with outcomes

**Expected Outcome:** Multiple ways to explore the 70 projects beyond the map

---

## Phase 5: Content Enhancement (Future)

### 5.1 Populate Media Arrays
- [ ] Add artwork images to Artworks[] when available
- [ ] Add music files/links to Music[] array
- [ ] Add research papers/links to Research[] array
- [ ] Add outcome descriptions to Outcomes[] array

### 5.2 Enrichment Tasks
- [ ] Write DescriptionShort for each project (1-2 sentences)
- [ ] Add key quotes/stats from outcomes
- [ ] Tag projects with additional custom tags

---

## Implementation Order

### Week 1: Core Filtering & Display
1. **Update ProjectFilter.js** - add category/tag/theme filters
2. **Update MapUtils.js** - color-code by category
3. **Update ProjectDetail.js** - display new fields (Theme, Product, Tags)
4. **Test** - all filters work, colors show correctly, details display

### Week 2: Visual Polish & Navigation
5. **Add filter UI** to SearchBar.js - category buttons, active filter display
6. **Add map legend** showing color scheme
7. **Implement related projects** logic
8. **Test** - all interactions smooth, no UI conflicts

### Week 3: Gallery & Collections (if time)
9. Create art gallery component
10. Create thematic collections/timeline view
11. Polish styling & interactions
12. Final testing

---

## File Modification Priority

| File | Changes | Complexity | Priority |
|------|---------|-----------|----------|
| ProjectFilter.js | Add filter logic | Medium | HIGH |
| MapUtils.js | Color-coding, legend | Medium | HIGH |
| ProjectDetail.js | Display new fields | Low | HIGH |
| SearchBar.js | Filter UI buttons | Medium | MEDIUM |
| MapContainer.js | Apply colors | Low | MEDIUM |
| Sidebar.js | Reorganize layout | Low | MEDIUM |
| (New) GalleryView.js | Art gallery | High | LOW |

---

## Testing Checklist

- [ ] All 70 projects load without errors
- [ ] Filters work independently and together
- [ ] Map markers display correct colors by category
- [ ] Marker colors persist during filter changes
- [ ] Project detail shows all new fields
- [ ] Tags are clickable and filter works
- [ ] Search + filters work together
- [ ] Related projects logic works
- [ ] Mobile responsive on filters & detail view
- [ ] No console errors

---

## Future Enhancements (Post-Launch)

- Media player for music projects
- Lightbox gallery for artwork images
- Timeline animation of funding by year
- Before/after sliders for location impact
- Community contributor map
- Impact statistics dashboard
- Share/bookmark functionality
- Research paper embeddings

