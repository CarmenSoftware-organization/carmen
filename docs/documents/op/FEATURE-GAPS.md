# Operational Planning Module - Feature Gaps

> **Generated:** 2025-01-18
> **Module:** Operational Planning
> **Gap Count:** 2
> **Implementation Status:** 50% (2 of 4 features implemented)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Summary

The Operational Planning module has **2 identified gaps** where features are documented but not yet implemented. This represents a 50% gap rate for this module.

### Gap Overview

| Feature | Status | Priority | Impact | Classification |
|---------|--------|----------|--------|----------------|
| Recipe Management | ✅ Implemented | High | N/A | Production Ready |
| Menu Engineering | ✅ Implemented | Medium | N/A | Production Ready |
| Demand Forecasting | ❌ Gap | Medium | Medium | **Documented but NOT implemented** |
| Inventory Planning | ❌ Gap | Medium | Medium | **Documented but NOT implemented** |

---

## Identified Gaps

### 1. Demand Forecasting

**Route:** `/operational-planning/demand-forecasting`

**Status:** ❌ NOT IMPLEMENTED

**Documentation Reference:** `docs/documents/index.html` (Main documentation index)

**Impact:** Medium
- Planning feature that would enhance operational efficiency
- Not critical to core business operations
- Nice-to-have for advanced planning scenarios

**Priority:** Low

**Analysis:**
- Feature is mentioned in main documentation index
- No corresponding `page.tsx` file exists in codebase
- No components or implementation found
- Likely a planned future feature mistakenly documented as available

**Recommendation:**
- Update documentation to mark as "Planned" or "Coming Soon"
- Remove from available features list until implementation begins
- Add to product roadmap with priority classification

---

### 2. Inventory Planning

**Route:** `/operational-planning/inventory-planning`

**Status:** ❌ NOT IMPLEMENTED

**Documentation Reference:** `docs/documents/index.html` (Main documentation index)

**Impact:** Medium
- Planning feature that would complement demand forecasting
- Not critical to core business operations
- Would integrate with existing inventory management if implemented

**Priority:** Low

**Analysis:**
- Feature is mentioned in main documentation index
- No corresponding `page.tsx` file exists in codebase
- No components or implementation found
- Likely a planned future feature mistakenly documented as available

**Recommendation:**
- Update documentation to mark as "Planned" or "Coming Soon"
- Remove from available features list until implementation begins
- Consider implementing alongside Demand Forecasting as they are related features

---

## Implemented Features

### Recipe Management ✅

**Route:** `/operational-planning/recipe-management`

**Implementation Details:**
- Main page: `app/(main)/operational-planning/recipe-management/page.tsx`
- Sub-features implemented:
  - Recipes List/CRUD (`/recipe-management/recipes`)
  - Cuisine Types (`/recipe-management/cuisine-types`)
  - Recipe Categories (`/recipe-management/categories`)
- Full implementation with create, edit, detail views
- Complete component structure in place

**Status:** Production Ready

---

### Menu Engineering ✅

**Route:** `/operational-planning/menu-engineering`

**Implementation Details:**
- Page exists: `app/(main)/operational-planning/menu-engineering/page.tsx`
- Documented in main index.html
- Implemented and functional

**Status:** Production Ready

---

## Documentation Updates Required

### 1. Main Index (`docs/documents/index.html`)

**Current State:**
- Lists all 4 features as available
- No indication that 2 are unimplemented

**Required Changes:**
```html
<!-- Mark gaps with visual indicators -->
<div class="feature-card gap">
  <span class="status-badge planned">Planned</span>
  <h3>Demand Forecasting</h3>
  <p>Coming soon - Advanced demand prediction and planning</p>
</div>

<div class="feature-card gap">
  <span class="status-badge planned">Planned</span>
  <h3>Inventory Planning</h3>
  <p>Coming soon - Strategic inventory optimization</p>
</div>
```

**Add CSS for gap indicators:**
```css
.feature-card.gap {
  opacity: 0.6;
  border: 2px dashed #ccc;
}

.status-badge.planned {
  background: #ffc107;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
```

### 2. Module Index Page

**Action:** Create `docs/documents/op/index.html`

**Should Include:**
- Sidebar navigation with implemented features only
- Clear separation of "Available Features" vs "Planned Features"
- Gap indicators for unimplemented features
- Links to Recipe Management and Menu Engineering only in main nav
- Separate "Roadmap" section for planned features

---

## Gap Classification

### Fictional vs. Planned

**Demand Forecasting:**
- Classification: **Planned Feature**
- Reason: Appears in main documentation as part of module scope
- Recommendation: Keep in documentation with "Planned" status

**Inventory Planning:**
- Classification: **Planned Feature**
- Reason: Appears in main documentation as part of module scope
- Recommendation: Keep in documentation with "Planned" status

### Why Not Fictional?

These features are NOT considered "fictional" because:
1. They align with the module's operational planning purpose
2. They complement existing Recipe Management functionality
3. They represent logical future enhancements
4. No detailed implementation documentation exists (only high-level mention)

If these were "fictional," we would completely remove them. Instead, we reclassify them as "Planned."

---

## Impact Analysis

### Business Impact

**Low to Medium:**
- Core operational planning needs met by Recipe Management
- Menu Engineering provides adequate planning capabilities
- Gap features would enhance but not fundamentally change operations

### User Impact

**Low:**
- Users can currently perform essential operational planning
- No critical workflows are blocked
- Advanced users might want forecasting features in the future

### Technical Impact

**Low:**
- No dependencies on gap features in existing code
- Other modules function independently
- Implementation can be deferred without risk

---

## Recommendations

### Immediate Actions (High Priority)

1. **Update Main Documentation**
   - Mark Demand Forecasting as "Planned"
   - Mark Inventory Planning as "Planned"
   - Add visual indicators (badges, different styling)
   - Update module statistics to show 2/4 implemented

2. **Create Module Index**
   - Build `docs/documents/op/index.html`
   - Include only implemented features in main navigation
   - Add "Coming Soon" section for planned features

3. **Update Navigation**
   - Remove direct links to unimplemented features
   - Add tooltips explaining "Planned" status
   - Ensure no broken links exist

### Future Actions (Low Priority)

1. **Product Roadmap**
   - Add Demand Forecasting to roadmap
   - Add Inventory Planning to roadmap
   - Prioritize based on user feedback and business needs

2. **Implementation Planning**
   - Define requirements for each gap feature
   - Design data models and API endpoints
   - Create implementation timeline

---

## Verification Checklist

- [ ] Main index.html updated with gap indicators
- [ ] Module index.html created with correct navigation
- [ ] All .md links converted to .html
- [ ] Gap features marked as "Planned" not "Available"
- [ ] No broken links to unimplemented features
- [ ] Visual indicators (badges, styling) applied
- [ ] Module statistics updated (2/4 instead of 4/4)
- [ ] Roadmap section added for planned features

---

## Related Documentation

- [Feature Verification Matrix](../FEATURE-VERIFICATION-MATRIX.md) - Complete cross-reference
- [Recipe Management Specification](./recipe-management/README.md) - Implemented feature
- [Main Index](../index.html) - Needs updates for gaps

---

**Last Updated:** 2025-01-18
**Status:** Gap documentation complete, awaiting implementation of updates
