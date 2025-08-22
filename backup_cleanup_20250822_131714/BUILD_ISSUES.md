# Build Issues After Cleanup

## Status
❌ **Build Currently Failing**

## Issues Identified

### 1. Missing Mock Data Files
The cleanup removed some mock data files that were needed. Created the following files to restore functionality:
- `lib/mock-data/vendors.ts` ✅ Created
- `lib/mock-data/products.ts` ✅ Created  
- `lib/mock-data/recipes.ts` ✅ Created
- `lib/mock-data/finance.ts` ✅ Created
- `lib/mock-data/factories.ts` ✅ Created
- `lib/mock-data/test-scenarios.ts` ✅ Created

### 2. Export Naming Conflicts
- `mockProducts` was exported from both `inventory.ts` and `products.ts`
- Fixed by renaming in `inventory.ts` to `mockInventoryProducts` ✅ Fixed
- Added `mockCounts` alias for backward compatibility ✅ Fixed

### 3. Import/Export Issues
Several files had incorrect imports that needed fixing:
- `mockLocations` and functions not exported from main index ✅ Partially Fixed
- Type imports needed to be more specific ✅ Partially Fixed

### 4. Type Definition Conflicts
❌ **Current Issue**: Department type conflict between different type files:
```
Type 'import("/Users/peak/Documents/GitHub/carmen/lib/types").Department[]' is not assignable to type 'import("/Users/peak/Documents/GitHub/carmen/lib/types/user").Department[]'.
Property 'code' is missing in type 'import("/Users/peak/Documents/GitHub/carmen/lib/types").Department' but required in type 'import("/Users/peak/Documents/GitHub/carmen/lib/types/user").Department'.
```

## Files That Need Import Fixes
1. `app/(main)/inventory-management/physical-count/active/[id]/page.tsx` ✅ Fixed
2. `app/(main)/inventory-management/spot-check/active/[id]/page.tsx` ✅ Fixed  
3. `app/(main)/inventory-management/physical-count/components/location-selection.tsx` ✅ Fixed
4. `app/(main)/inventory-management/spot-check/components/review.tsx` ✅ Fixed
5. `app/(main)/inventory-management/physical-count/components/setup.tsx` ✅ Fixed
6. `lib/context/user-context.tsx` ❌ **Still has type conflict**

## Resolution Status

### Resolved ✅
- Created missing mock data files
- Fixed naming conflicts  
- Fixed most import issues
- Fixed TypeScript parameter type issues

### Still Needs Work ❌
- Type definition conflicts in Department interface
- Complete export organization in mock-data index files
- Full type consistency check across the application

## Recommended Next Steps

1. **Fix Department Type Conflict**:
   - Standardize on one Department interface across the application
   - Update conflicting type definitions to match
   - Ensure mock data matches the standardized interface

2. **Organize Exports**:
   - Update `lib/mock-data/index.ts` to properly export all necessary functions
   - Standardize import patterns across the application

3. **Type Audit**:
   - Run comprehensive type checking across all files
   - Resolve any remaining type conflicts

4. **Testing**:
   - Verify application builds successfully
   - Test key functionality to ensure nothing is broken

## Impact on Cleanup

The cleanup operation successfully moved orphaned files, but revealed some underlying technical debt:
- Inconsistent type definitions
- Import/export organization issues
- Mock data structure inconsistencies

These issues were likely pre-existing and became visible after the cleanup exposed dependencies.

---
*Issue documented on August 22, 2025 during cleanup verification*