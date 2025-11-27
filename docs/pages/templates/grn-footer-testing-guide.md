# GRN Footer Testing Guide

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Testing scenarios for the updated GRN Detail footer patterns based on the form footer layout guide.

## Test Scenarios

### 1. View Mode Footer
**Test Case**: Standard view mode with completed GRN
- **Expected**: 
  - Standard footer shows Edit button only
  - Utility actions (Print, Export, Share) remain in header
  - No floating action menu visible for completed GRNs

### 2. Edit Mode Footer  
**Test Case**: Edit mode with unsaved changes
- **Expected**:
  - Standard footer shows Save and Cancel buttons
  - Save button enabled when hasUnsavedChanges is true
  - Loading spinner shown during save operation
  - Status message shows "You have unsaved changes"

### 3. Edit Mode Without Changes
**Test Case**: Edit mode with no modifications
- **Expected**:
  - Save button disabled when no changes made
  - Status message shows "No changes made"
  - Cancel button always enabled

### 4. Confirm Mode with Floating Actions
**Test Case**: New GRN in confirmation mode
- **Expected**:
  - Standard footer hidden (mode='confirm' doesn't show standard actions)
  - Floating action menu visible in bottom-right
  - Summary shows "Confirmation Required" with item count
  - Two actions: "Edit Further" (outline) and "Confirm & Save" (green)

### 5. View Mode with Received Status
**Test Case**: GRN with status='Received' in view mode  
- **Expected**:
  - Standard footer shows Edit button
  - Floating action menu visible with workflow actions
  - Summary shows current status and last updated date
  - Actions: "Delete" (destructive) and "Send" (blue)

### 6. Loading States
**Test Case**: Various loading scenarios
- **Expected**:
  - Save button shows spinner during save operation
  - Floating action buttons disabled during loading
  - No duplicate actions possible during loading

### 7. Form Change Tracking
**Test Case**: Modify various form fields
- **Expected**:
  - Date changes trigger hasUnsavedChanges=true
  - Invoice fields trigger change tracking
  - Description textarea triggers change tracking  
  - Select components (receiver, vendor) trigger changes
  - Items tab changes trigger hasUnsavedChanges=true

### 8. Responsive Layout
**Test Case**: Different screen sizes
- **Expected**:
  - Footer buttons maintain proper spacing on mobile
  - Floating menu positioned correctly on all screen sizes
  - Text wrapping handled gracefully in summary cards

## Component Integration Tests

### FormFooter Component
```tsx
// Test different mode combinations
<FormFooter mode="view" onEdit={mockEdit} />
<FormFooter mode="edit" onSave={mockSave} onCancel={mockCancel} hasChanges={true} />
<FormFooter mode="confirm" onSave={mockConfirm} isLoading={true} />
```

### FloatingActionMenu Component  
```tsx
// Test visibility conditions
<FloatingActionMenu visible={true} actions={mockActions} />
<FloatingActionMenu visible={false} actions={mockActions} />

// Test different action configurations
const confirmActions = [
  { id: 'edit', label: 'Edit Further', icon: PencilRuler, variant: 'outline' },
  { id: 'save', label: 'Confirm & Save', icon: CheckCheck, variant: 'default' }
]

const workflowActions = [
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' },
  { id: 'send', label: 'Send', icon: Send, variant: 'default' }
]
```

## Manual Testing Checklist

### Header Actions
- [ ] Print button works in all modes
- [ ] Export button accessible 
- [ ] Share button functions properly
- [ ] Back navigation works correctly

### Footer Actions
- [ ] Edit button appears only in view mode
- [ ] Save/Cancel buttons appear only in edit mode
- [ ] Save button enables/disables based on changes
- [ ] Loading states display correctly
- [ ] Button heights consistent (h-9)
- [ ] Icon spacing proper (mr-2 h-4 w-4)

### Floating Menu
- [ ] Appears only when visible=true
- [ ] Summary card shows correct information
- [ ] Action buttons render with proper variants
- [ ] Click handlers execute correctly
- [ ] Position fixed at bottom-right
- [ ] z-index allows overlay display

### State Management
- [ ] hasUnsavedChanges updates on form modifications
- [ ] isLoading state prevents multiple submissions
- [ ] Mode transitions work smoothly
- [ ] Form reset on cancel works properly

### Accessibility
- [ ] Keyboard navigation between footer elements
- [ ] Screen reader announces button states
- [ ] Focus management during loading states
- [ ] ARIA labels on icon-only buttons

### Performance
- [ ] No unnecessary re-renders during typing
- [ ] Floating menu doesn't cause layout shifts
- [ ] Smooth animations for state transitions
- [ ] Memory cleanup on component unmount

## Success Criteria

The GRN footer implementation passes testing when:
1. All footer patterns match the form-footer-layout-guide specifications
2. Mode transitions work smoothly without UI glitches
3. Change tracking accurately reflects form state
4. Floating actions appear contextually based on GRN status
5. Loading states provide clear user feedback
6. Responsive layout works across device sizes
7. Accessibility requirements are met
8. Performance remains smooth during interactions

## Known Considerations

- Floating menu only appears for confirm mode and view mode with 'Received' status
- Standard footer actions are context-aware based on current mode
- Change tracking requires manual trigger on each form field
- Loading states should prevent user actions but maintain visual feedback
- Button styling follows consistent height (h-9) and icon spacing (mr-2 h-4 w-4) patterns