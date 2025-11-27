# Wiki.js Navigation Bulk Import Investigation

**Date:** 2025-11-24
**Objective:** Investigate and implement bulk import options for Carmen ERP Wiki.js navigation structure

## Executive Summary

Successfully developed and executed automated bulk import solution for Wiki.js navigation structure using GraphQL API. The solution eliminates 350-450 manual UI interactions by programmatically creating all 69 navigation items (13 main modules + 56 sub-modules) directly in the database.

**Status:** ✅ Technical implementation complete | ⚠️ UI display issue unresolved

## Problem Statement

The Carmen ERP documentation structure requires approximately 60 navigation items across 13 main functional modules. Manual creation through the Wiki.js UI would require:
- 350-450 individual UI interactions
- High risk of human error
- Significant time investment
- Difficult to maintain consistency

**Solution Approach:** Automate navigation structure creation using Wiki.js GraphQL API

## Technical Implementation

### 1. API Access Configuration

**Wiki.js GraphQL API Endpoint:**
```
http://dev.blueledgers.com:3993/graphql
```

**Steps Taken:**
1. Enabled API Access in Wiki.js admin panel (Administration → API Access)
2. Generated API key with full permissions
3. Verified GraphQL Playground accessibility at `/graphql`

**API Key Generated:**
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiYXVkIjoidXJuOndpa2kuanMiLCJleHAiOjE3OTUxNDEyMTUsImlhdCI6MTczMzYwNTIxNSwiaXNzIjoidXJuOndpa2kuanMifQ.Vbp0kvkZL9yZbLqRDFUDGLg35bY36SFe-hP0pAyMTpLv9S0nKB_VzJR-kw9QgFqFw_P8EWHxKZhfnzFqD7hFNgFbU9r4fV8pHgdnQ8BVD8-Av2F0gkG6kjhwuLmYJnGipvbUWh1cIEqw6W67Eq7Y_KPyqWfcVBZSZWQgbCjQdx_jWbNkI8FIIrD_OBsA2w2jOHv-LdI_5WG9zQx3OP0N3DxOr-fVh5q7kXkNmqWrFJ7J7mxRIYhO9d9vv_8sVlnbdYXlIybvbh4rOBR5ePRjWtN4qMl3f-_zR3R6JT3wc0uJBjt7_5VB5Bn_o-t5xaRrEqzX-5qwTtI7XuX-sbvLjQ
```

### 2. GraphQL Schema Analysis

**Key Schema Elements:**

**Mutation for Navigation Update:**
```graphql
mutation UpdateNavigation($tree: [NavigationTreeInput]!) {
  navigation {
    updateTree(tree: $tree) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
    }
  }
}
```

**Query for Navigation Verification:**
```graphql
query GetNavigation {
  navigation {
    tree {
      locale
      items {
        id
        kind
        label
        icon
        targetType
        target
        visibilityMode
        visibilityGroups
      }
    }
  }
}
```

**Navigation Item Structure:**
```typescript
interface NavigationItemInput {
  id: string;              // Unique identifier
  kind: string;            // "header" | "link" | "divider"
  label: string;           // Display text
  icon: string | null;     // Optional icon
  targetType: string | null;  // "page" | "external" | null (for headers)
  target: string | null;   // Path like "/en/procurement/my-approvals"
  visibilityMode: string;  // "all" | "restricted"
  visibilityGroups: string[]; // Array of group IDs with access
}
```

### 3. Navigation Structure Design

**Source Document:** `/docs/app/module-structure-checklist.md`

**Complete Navigation Hierarchy (69 items):**

#### Main Modules (13 Headers)
1. Dashboard
2. Procurement
3. Product Management
4. Vendor Management
5. Store Operations
6. Inventory Management
7. Operational Planning
8. Production
9. Reporting & Analytics
10. Finance
11. System Administration
12. Help & Support
13. Style Guide

#### Sub-Modules (56 Links)
- Procurement (7): My Approvals, Purchase Requests, Purchase Request Templates, Purchase Orders, Goods Received Notes, Credit Notes, Price Comparison
- Product Management (3): Products, Product Categories, Units of Measure
- Vendor Management (5): Manage Vendors, Vendor Directory, Price Lists, Pricelist Templates, Vendor Portal
- Store Operations (3): Store Requisitions, Stock Replenishment, Wastage Reporting
- Inventory Management (7): Stock Overview, Physical Count Management, Spot Check, Stock In, Stock Out, Inventory Adjustments, Lot Transfer
- Operational Planning (3): Recipes, Recipe Categories, Recipe Cuisine Types
- Production (1): Production Orders
- Reporting & Analytics (12): Dashboard, Consumption Analytics, Material Consumption Report, Recipe Costing Report, Top Purchasing Report, Purchase Analysis Report, Inventory Balance Report, Inventory Movement Report, Stock Card Report, Slow Moving Report, Period End Report, Inventory Aging Report
- Finance (5): Currency Management, Exchange Rates, Account Code Mapping, Departments, Cost Centers
- System Administration (8): User Management, Location Management, Business Rules, Workflow Management, System Integrations, Settings, Monitoring, Permission Management
- Help & Support (1): Documentation
- Style Guide (1): Components

### 4. Implementation Scripts

#### Script 1: Initial Bulk Import
**File:** `/scripts/import-wiki-navigation.js`

**Purpose:** Automate creation of all 69 navigation items

**Key Features:**
- Uses fetch API to communicate with GraphQL endpoint
- Bearer token authentication
- Complete error handling
- Success verification

**Execution Result:**
```
✅ Navigation imported successfully!
Response: {
  "data": {
    "navigation": {
      "updateTree": {
        "responseResult": {
          "succeeded": true,
          "errorCode": 0,
          "slug": "ok",
          "message": null
        }
      }
    }
  }
}
```

#### Script 2: Visibility Settings Update
**File:** `/scripts/update-wiki-navigation-visibility.js`

**Purpose:** Add visibility configuration to all navigation items

**Changes Made:**
- Added `visibilityMode: 'all'` to every item
- Added `visibilityGroups: []` to every item
- Ensures all users can see navigation structure

**Execution Result:**
```
✅ Navigation visibility settings updated successfully!
✅ Updated 69 navigation items with visibility settings
```

### 5. Verification

**Database State Verification via GraphQL:**

**Query Executed:**
```graphql
query GetNavigation {
  navigation {
    tree {
      locale
      items {
        id
        kind
        label
        visibilityMode
        visibilityGroups
      }
    }
  }
}
```

**Result:**
```json
{
  "data": {
    "navigation": {
      "tree": [{
        "locale": "en",
        "items": [
          {
            "id": "dashboard",
            "kind": "header",
            "label": "Dashboard",
            "visibilityMode": "all",
            "visibilityGroups": []
          },
          {
            "id": "procurement",
            "kind": "header",
            "label": "Procurement",
            "visibilityMode": "all",
            "visibilityGroups": []
          },
          {
            "id": "procurement-my-approvals",
            "kind": "link",
            "label": "My Approvals",
            "visibilityMode": "all",
            "visibilityGroups": []
          }
          // ... all 69 items confirmed in database
        ]
      }]
    }
  }
}
```

**✅ Verification Status:** All 69 items successfully saved to database with correct structure and visibility settings

## Current Issue: UI Display Problem

### Problem Description

Despite successful database import and configuration:
- Navigation items are saved and verified in database
- Visibility settings are configured correctly
- Navigation mode is set to "Static Navigation"
- **However:** Navigation sidebar is completely empty/missing in the UI

### Investigation Steps Taken

1. **Initial Configuration:** Set navigation mode to "Custom Navigation"
   - Result: Sidebar showed "Home" and "Browse/Main Menu" buttons but no custom items

2. **Visibility Update:** Added explicit visibility settings to all items
   - Result: Database updated successfully but no UI change

3. **Mode Change:** Switched to "Static Navigation" mode
   - Result: Navigation sidebar completely disappeared

### Current UI State

**Observation:**
- Navigation element exists in DOM (ref=e54) but is empty
- No navigation items rendered despite database containing all 69 items
- Previous navigation buttons ("Home", "Browse") also disappeared

### Technical Analysis

**What's Working:**
- ✅ GraphQL API communication
- ✅ Data persistence to database
- ✅ Navigation structure validation
- ✅ Visibility configuration
- ✅ Mode switching functionality

**What's Not Working:**
- ❌ UI rendering of navigation items
- ❌ Navigation sidebar display

### Possible Causes

1. **Theme Compatibility:** Wiki.js theme may not support custom navigation rendering
2. **Configuration Gap:** Additional settings may be required beyond API import
3. **Cache Issue:** Frontend may be caching old navigation state
4. **Version Limitation:** Wiki.js version may have UI/API mismatch
5. **Render Mechanism:** Static navigation may require different data structure than what API accepts
6. **Page Refresh Required:** Full application restart may be needed
7. **Permission Issue:** Despite API success, UI may require additional permission configuration

## Recommendations for Next Steps

### Immediate Actions

1. **Verify Wiki.js Version:**
   - Check if version supports static navigation UI rendering
   - Review release notes for navigation feature changes

2. **Examine Wiki.js Theme:**
   - Inspect theme files to understand navigation rendering logic
   - Check if theme customization is needed

3. **Test Different Navigation Modes:**
   - Try "Site Tree" mode to see if items display differently
   - Test "None" mode to confirm UI responds to mode changes

4. **Clear All Caches:**
   - Clear browser cache completely
   - Restart Wiki.js application server
   - Clear Wiki.js internal caches

5. **Check Application Logs:**
   - Review Wiki.js server logs for rendering errors
   - Check browser console for JavaScript errors

### Alternative Approaches

1. **Manual UI Creation with API Verification:**
   - Create one item manually through UI
   - Compare database structure with API-created items
   - Identify any missing fields or different formatting

2. **Hybrid Approach:**
   - Use API to create base structure
   - Use UI to activate/finalize navigation

3. **Source Code Investigation:**
   - Review Wiki.js GitHub repository for navigation rendering code
   - Search for similar issues in Wiki.js GitHub Issues
   - Check Wiki.js community forums/Discord

4. **Contact Wiki.js Support:**
   - Report issue to Wiki.js developers
   - Provide GraphQL query results as evidence
   - Request guidance on API-based navigation setup

## Technical Artifacts

### Files Created

1. `/scripts/import-wiki-navigation.js` - Initial bulk import script
2. `/scripts/update-wiki-navigation-visibility.js` - Visibility settings update script
3. `/docs/wiki-js-navigation-bulk-import-investigation.md` - This documentation

### Commands for Future Use

**Run bulk import:**
```bash
node scripts/import-wiki-navigation.js
```

**Update visibility settings:**
```bash
node scripts/update-wiki-navigation-visibility.js
```

**Verify navigation in database:**
```bash
# Use GraphQL Playground at http://dev.blueledgers.com:3993/graphql
# Run the GetNavigation query
```

## Conclusion

The bulk import functionality has been successfully implemented from a technical perspective. The solution demonstrates that:
- Wiki.js GraphQL API can programmatically manage navigation structure
- All 69 Carmen ERP navigation items can be batch-imported
- Data persistence and verification mechanisms work correctly

However, the UI rendering issue indicates a gap between the API layer and the presentation layer. Further investigation is needed to understand how Wiki.js renders navigation items and why API-imported items don't display despite successful database storage.

The implemented scripts remain valuable as they provide:
- Automated, reproducible navigation setup
- Consistency across environments
- Easy maintenance and updates
- Complete audit trail via database queries

## References

- Wiki.js Official Documentation: https://docs.requarks.io
- Wiki.js GraphQL Playground: http://dev.blueledgers.com:3993/graphql
- Carmen ERP Module Structure: `/docs/app/module-structure-checklist.md`
- API Key Expiration: 2025-10-18 (720 days from creation)
