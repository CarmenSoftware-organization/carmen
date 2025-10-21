# POS Mapping Navigation Review

## Executive Summary

The POS Mapping module has **incomplete navigation** for edit and view details functionality. While the UI shows action buttons (Edit, Delete, View History, Test Mapping), these actions currently only log to console and do not perform any actual operations.

**Status**: ⚠️ **NEEDS IMPLEMENTATION**

---

## Current State Analysis

### 1. Recipe Mapping (`/mapping/recipes/page.tsx`)
**Available Actions**: Edit, Delete, View History, Test Mapping
**Current Implementation**: `console.log` only
**Missing Components**:
- ❌ Edit Recipe Mapping Modal/Drawer
- ❌ Delete Confirmation Dialog
- ❌ Mapping History Drawer
- ❌ Test Mapping Modal

### 2. Unit Mapping (`/mapping/units/page.tsx`)
**Available Actions**: Edit, Delete, View History
**Current Implementation**: `console.log` only
**Missing Components**:
- ❌ Edit Unit Mapping Modal/Drawer
- ❌ Delete Confirmation Dialog
- ❌ Unit Mapping History Drawer

### 3. Location Mapping (`/mapping/locations/page.tsx`)
**Available Actions**: Edit, Delete, View History
**Current Implementation**: `console.log` only
**Missing Components**:
- ❌ Edit Location Mapping Modal/Drawer
- ❌ Delete Confirmation Dialog
- ❌ Location Mapping History Drawer

### 4. Fractional Variants (`/mapping/recipes/fractional-variants/page.tsx`)
**Status**: Need to verify implementation

---

## Issues Identified

### Critical Issues ❌

1. **No Edit Functionality**
   - Users cannot modify existing mappings
   - Edit button exists but does nothing
   - No modal or drawer component for editing

2. **No Delete Functionality**
   - Users cannot remove incorrect mappings
   - Delete button exists but does nothing
   - No confirmation dialog

3. **No History View**
   - Users cannot see mapping change history
   - History button exists but does nothing
   - No audit trail display

4. **No Test Functionality** (Recipe Mapping Only)
   - Users cannot test if mapping works correctly
   - Test button exists but does nothing
   - No test result display

### Navigation Issues 🔀

5. **Inconsistent Patterns**
   - Transactions have `TransactionDetailDrawer` and `MappingDrawerModal`
   - Mapping pages lack equivalent components
   - No standardized pattern for edit/view actions

6. **MappingDrawerModal Location**
   - Currently in `/transactions/components/`
   - Should be in `/mapping/components/` for better organization
   - Only handles NEW mappings, not editing existing ones

---

## Existing Components Analysis

### MappingDrawerModal (transactions/components/)
**Purpose**: Create NEW POS item to recipe mappings
**Features**:
- ✅ Recipe search
- ✅ Portion size configuration
- ✅ Unit selection
- ✅ Inventory impact preview
- ✅ Cost comparison

**Limitations**:
- ❌ Cannot edit existing mappings
- ❌ No history view
- ❌ No delete functionality
- ❌ Located in wrong folder

### RowActions Component
**Purpose**: Display action menu for table rows
**Features**:
- ✅ Configurable actions (edit, delete, history, link, test)
- ✅ Icon-based dropdown menu
- ✅ Disabled state support

**Current Usage**:
```typescript
<RowActions
  onAction={(action) => handleRowAction(action, row.original)}
  availableActions={["edit", "delete", "history", "test"]}
/>
```

**Problem**: `handleRowAction` not implemented
```typescript
const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
  console.log(`${action} action on recipe:`, recipe)
  // Implement action handlers here  ← TODO comment
}
```

---

## Required Components

### 1. RecipeMapping EditDrawer
**Location**: `/mapping/components/recipe-edit-drawer.tsx`
**Features Needed**:
- Pre-populated form with existing mapping data
- Recipe selection with search
- Portion size modification
- Unit conversion
- Inventory impact recalculation
- Save/Cancel actions
- Validation

### 2. UnitMapping EditDrawer
**Location**: `/mapping/components/unit-edit-drawer.tsx`
**Features Needed**:
- Pre-populated unit mapping data
- Conversion rate modification
- Unit type selection
- Base unit selection
- Save/Cancel actions
- Validation

### 3. LocationMapping EditDrawer
**Location**: `/mapping/components/location-edit-drawer.tsx`
**Features Needed**:
- Pre-populated location mapping data
- POS location selection
- Carmen location mapping
- Status modification
- Save/Cancel actions

### 4. MappingHistory Drawer
**Location**: `/mapping/components/mapping-history-drawer.tsx`
**Features Needed**:
- Chronological change history
- User attribution
- Before/After comparison
- Timestamp display
- Filter by date range
- Export history

### 5. Delete Confirmation Dialog
**Location**: `/mapping/components/delete-confirmation-dialog.tsx`
**Features Needed**:
- Warning message
- Impact preview (if any)
- Reason for deletion (optional)
- Confirm/Cancel actions
- Soft delete vs hard delete option

### 6. Test Mapping Modal (Recipe only)
**Location**: `/mapping/components/test-mapping-modal.tsx`
**Features Needed**:
- Input test quantity
- Show expected inventory deductions
- Display cost calculations
- Show any errors or warnings
- Test result summary

---

## Recommended Implementation Plan

### Phase 1: Core Edit Functionality (Priority: HIGH)
1. ✅ Create `recipe-edit-drawer.tsx`
2. ✅ Create `unit-edit-drawer.tsx`
3. ✅ Create `location-edit-drawer.tsx`
4. ✅ Implement state management for drawers
5. ✅ Connect edit actions to drawers

### Phase 2: Delete Functionality (Priority: HIGH)
1. ✅ Create `delete-confirmation-dialog.tsx`
2. ✅ Implement soft delete vs hard delete
3. ✅ Add impact analysis
4. ✅ Connect delete actions to dialog

### Phase 3: History & Audit (Priority: MEDIUM)
1. ✅ Create `mapping-history-drawer.tsx`
2. ✅ Design history data structure
3. ✅ Implement history tracking
4. ✅ Add filter and export features

### Phase 4: Testing & Validation (Priority: MEDIUM)
1. ✅ Create `test-mapping-modal.tsx`
2. ✅ Implement test logic
3. ✅ Add validation rules
4. ✅ Display test results

### Phase 5: Component Reorganization (Priority: LOW)
1. ✅ Move `MappingDrawerModal` to `/mapping/components/`
2. ✅ Update imports across codebase
3. ✅ Standardize component naming
4. ✅ Update navigation map documentation

---

## Navigation Flow Improvements

### Current Flow (Broken)
```
User clicks Edit → Console.log → Nothing happens
User clicks Delete → Console.log → Nothing happens
User clicks History → Console.log → Nothing happens
```

### Proposed Flow
```
Recipe Mapping:
User clicks Edit → RecipeEditDrawer opens → User modifies → Save → Drawer closes → Table refreshes
User clicks Delete → DeleteConfirmationDialog opens → User confirms → Delete → Dialog closes → Table refreshes
User clicks History → MappingHistoryDrawer opens → Show audit trail → User closes drawer
User clicks Test → TestMappingModal opens → User tests → View results → User closes modal

Unit Mapping:
User clicks Edit → UnitEditDrawer opens → User modifies → Save → Drawer closes → Table refreshes
User clicks Delete → DeleteConfirmationDialog opens → User confirms → Delete → Dialog closes → Table refreshes
User clicks History → MappingHistoryDrawer opens → Show audit trail → User closes drawer

Location Mapping:
User clicks Edit → LocationEditDrawer opens → User modifies → Save → Drawer closes → Table refreshes
User clicks Delete → DeleteConfirmationDialog opens → User confirms → Delete → Dialog closes → Table refreshes
User clicks History → MappingHistoryDrawer opens → Show audit trail → User closes drawer
```

---

## Code Examples

### Example: Implementing Edit Action

**Before** (Current - Broken):
```typescript
const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
  console.log(`${action} action on recipe:`, recipe)
  // Implement action handlers here
}
```

**After** (Proposed - Working):
```typescript
const [editDrawerOpen, setEditDrawerOpen] = useState(false)
const [selectedRecipe, setSelectedRecipe] = useState<RecipeMapping | null>(null)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
const [testModalOpen, setTestModalOpen] = useState(false)

const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
  setSelectedRecipe(recipe)

  switch(action) {
    case "edit":
      setEditDrawerOpen(true)
      break
    case "delete":
      setDeleteDialogOpen(true)
      break
    case "history":
      setHistoryDrawerOpen(true)
      break
    case "test":
      setTestModalOpen(true)
      break
  }
}

// In JSX:
<RecipeEditDrawer
  open={editDrawerOpen}
  onOpenChange={setEditDrawerOpen}
  recipe={selectedRecipe}
  onSave={handleSaveMapping}
/>

<DeleteConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  mapping={selectedRecipe}
  onConfirm={handleDeleteMapping}
/>

<MappingHistoryDrawer
  open={historyDrawerOpen}
  onOpenChange={setHistoryDrawerOpen}
  mappingId={selectedRecipe?.id}
/>

<TestMappingModal
  open={testModalOpen}
  onOpenChange={setTestModalOpen}
  mapping={selectedRecipe}
/>
```

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Edit recipe mapping and verify save
- [ ] Edit unit mapping and verify save
- [ ] Edit location mapping and verify save
- [ ] Delete mapping with confirmation
- [ ] Cancel delete operation
- [ ] View mapping history
- [ ] Test recipe mapping
- [ ] Verify table refreshes after save/delete
- [ ] Test validation on all forms
- [ ] Test error handling

### Accessibility Testing
- [ ] Keyboard navigation for all modals
- [ ] Screen reader announcements
- [ ] Focus management on open/close
- [ ] Escape key closes modals
- [ ] Tab trapping in dialogs

---

## Impact Assessment

### User Impact
**Before**: Users cannot edit, delete, or view history of mappings
**After**: Full CRUD operations available for all mapping types

### Business Impact
- ✅ Reduces support tickets (users can fix mappings themselves)
- ✅ Improves data quality (easier to maintain accurate mappings)
- ✅ Increases user confidence (full control over their data)
- ✅ Provides audit trail (compliance and troubleshooting)

### Technical Debt
**Current**: High - Core functionality missing
**After Implementation**: Low - Complete feature set with proper patterns

---

## Conclusion

The POS Mapping module requires significant implementation work to complete the edit/view/delete functionality. All UI elements are in place, but the actual functionality is missing.

**Recommendation**: Prioritize Phase 1 (Core Edit Functionality) and Phase 2 (Delete Functionality) as these are critical user features. History and testing features can be implemented in subsequent releases.

**Estimated Effort**:
- Phase 1: 8-12 hours
- Phase 2: 4-6 hours
- Phase 3: 6-8 hours
- Phase 4: 6-8 hours
- Phase 5: 2-4 hours
- **Total**: 26-38 hours

**Priority**: **HIGH** - Users cannot manage mappings without this functionality.
