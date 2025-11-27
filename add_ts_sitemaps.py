#!/usr/bin/env python3
"""
Add standardized sitemap sections to TS files that are missing them
"""

import re
from pathlib import Path

# Files that need sitemaps added
files_to_update = {
    # Inventory Management (3)
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/fractional-inventory/TS-fractional-inventory.md": {
        "module": "Inventory Management",
        "submodule": "Fractional Inventory",
        "route": "/inventory-management/fractional-inventory",
        "entity": "fractional inventory item",
        "entities": "fractional inventory items"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/lot-based-costing/TS-lot-based-costing.md": {
        "module": "Inventory Management",
        "submodule": "Lot-Based Costing",
        "route": "/inventory-management/lot-based-costing",
        "entity": "lot",
        "entities": "lots"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/period-end/TS-period-end.md": {
        "module": "Inventory Management",
        "submodule": "Period End",
        "route": "/inventory-management/period-end",
        "entity": "period closing",
        "entities": "period closings"
    },
    # Operational Planning (4)
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/menu-engineering/TS-menu-engineering.md": {
        "module": "Operational Planning",
        "submodule": "Menu Engineering",
        "route": "/operational-planning/menu-engineering",
        "entity": "menu item",
        "entities": "menu items"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/categories/TS-categories.md": {
        "module": "Operational Planning",
        "submodule": "Recipe Categories",
        "route": "/operational-planning/recipe-management/categories",
        "entity": "recipe category",
        "entities": "recipe categories"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/cuisine-types/TS-cuisine-types.md": {
        "module": "Operational Planning",
        "submodule": "Cuisine Types",
        "route": "/operational-planning/recipe-management/cuisine-types",
        "entity": "cuisine type",
        "entities": "cuisine types"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/recipes/TS-recipes.md": {
        "module": "Operational Planning",
        "submodule": "Recipes",
        "route": "/operational-planning/recipe-management/recipes",
        "entity": "recipe",
        "entities": "recipes"
    },
    # Procurement (3)
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/credit-note/TS-credit-note.md": {
        "module": "Procurement",
        "submodule": "Credit Notes",
        "route": "/procurement/credit-note",
        "entity": "credit note",
        "entities": "credit notes"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/my-approvals/TS-my-approvals.md": {
        "module": "Procurement",
        "submodule": "My Approvals",
        "route": "/procurement/my-approvals",
        "entity": "approval",
        "entities": "approvals"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-request-templates/TS-purchase-request-templates.md": {
        "module": "Procurement",
        "submodule": "Purchase Request Templates",
        "route": "/procurement/purchase-request-templates",
        "entity": "template",
        "entities": "templates"
    },
    # Product Management (3)
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/categories/TS-categories.md": {
        "module": "Product Management",
        "submodule": "Categories",
        "route": "/product-management/categories",
        "entity": "category",
        "entities": "categories"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/products/TS-products.md": {
        "module": "Product Management",
        "submodule": "Products",
        "route": "/product-management/products",
        "entity": "product",
        "entities": "products"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/units/TS-units.md": {
        "module": "Product Management",
        "submodule": "Units",
        "route": "/product-management/units",
        "entity": "unit",
        "entities": "units"
    },
    # Store Operations (2)
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/stock-replenishment/TS-stock-replenishment.md": {
        "module": "Store Operations",
        "submodule": "Stock Replenishment",
        "route": "/store-operations/stock-replenishment",
        "entity": "replenishment request",
        "entities": "replenishment requests"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/store-requisitions/TS-store-requisitions.md": {
        "module": "Store Operations",
        "submodule": "Store Requisitions",
        "route": "/store-operations/store-requisitions",
        "entity": "requisition",
        "entities": "requisitions"
    },
    # System Administration (7)
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/TS-system-administration.md": {
        "module": "System Administration",
        "submodule": "Overview",
        "route": "/system-administration",
        "entity": "configuration",
        "entities": "configurations"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/business-rules/TS-business-rules.md": {
        "module": "System Administration",
        "submodule": "Business Rules",
        "route": "/system-administration/business-rules",
        "entity": "business rule",
        "entities": "business rules"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/monitoring/TS-monitoring.md": {
        "module": "System Administration",
        "submodule": "Monitoring",
        "route": "/system-administration/monitoring",
        "entity": "metric",
        "entities": "metrics"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/permission-management/TS-permission-management.md": {
        "module": "System Administration",
        "submodule": "Permission Management",
        "route": "/system-administration/permission-management",
        "entity": "permission",
        "entities": "permissions"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/settings/TS-settings.md": {
        "module": "System Administration",
        "submodule": "Settings",
        "route": "/system-administration/settings",
        "entity": "setting",
        "entities": "settings"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/system-integrations/TS-system-integrations.md": {
        "module": "System Administration",
        "submodule": "System Integrations",
        "route": "/system-administration/system-integrations",
        "entity": "integration",
        "entities": "integrations"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/workflow/TS-workflow.md": {
        "module": "System Administration",
        "submodule": "Workflow",
        "route": "/system-administration/workflow",
        "entity": "workflow",
        "entities": "workflows"
    },
    # Vendor Management (5)
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/price-lists/TS-price-lists.md": {
        "module": "Vendor Management",
        "submodule": "Price Lists",
        "route": "/vendor-management/price-lists",
        "entity": "price list",
        "entities": "price lists"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/pricelist-templates/TS-pricelist-templates.md": {
        "module": "Vendor Management",
        "submodule": "Pricelist Templates",
        "route": "/vendor-management/pricelist-templates",
        "entity": "template",
        "entities": "templates"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/requests-for-pricing/TS-requests-for-pricing.md": {
        "module": "Vendor Management",
        "submodule": "Requests for Pricing",
        "route": "/vendor-management/requests-for-pricing",
        "entity": "request",
        "entities": "requests"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-directory/TS-vendor-directory.md": {
        "module": "Vendor Management",
        "submodule": "Vendor Directory",
        "route": "/vendor-management/vendor-directory",
        "entity": "vendor",
        "entities": "vendors"
    },
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/TS-vendor-portal.md": {
        "module": "Vendor Management",
        "submodule": "Vendor Portal",
        "route": "/vendor-management/vendor-portal",
        "entity": "portal submission",
        "entities": "portal submissions"
    },
}

def generate_sitemap(config):
    """Generate standardized sitemap section"""
    sitemap = f"""
## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the {config['submodule']} sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage["List Page<br/>({config['route']})"]
    CreatePage["Create Page<br/>({config['route']}/new)"]
    DetailPage["Detail Page<br/>({config['route']}/[id])"]
    EditPage["Edit Page<br/>({config['route']}/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1["Tab: All Items"]
    ListPage --> ListTab2["Tab: Active"]
    ListPage --> ListTab3["Tab: Archived"]

    %% List Page Dialogues
    ListPage -.-> ListDialog1["Dialog: Quick Create"]
    ListPage -.-> ListDialog2["Dialog: Bulk Actions"]
    ListPage -.-> ListDialog3["Dialog: Export"]
    ListPage -.-> ListDialog4["Dialog: Filter"]

    %% Detail Page Tabs
    DetailPage --> DetailTab1["Tab: Overview"]
    DetailPage --> DetailTab2["Tab: History"]
    DetailPage --> DetailTab3["Tab: Activity Log"]

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1["Dialog: Edit"]
    DetailPage -.-> DetailDialog2["Dialog: Delete Confirm"]
    DetailPage -.-> DetailDialog3["Dialog: Status Change"]

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1["Dialog: Cancel Confirm"]
    CreatePage -.-> CreateDialog2["Dialog: Save Draft"]

    EditPage -.-> EditDialog1["Dialog: Discard Changes"]
    EditPage -.-> EditDialog2["Dialog: Save Draft"]

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `{config['route']}`
**File**: `page.tsx`
**Purpose**: Display paginated list of all {config['entities']}

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all {config['entities']}
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `{config['route']}/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive {config['entity']} details

**Sections**:
- Header: Breadcrumbs, {config['entity']} title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change {config['entity']} status with reason

#### 3. Create Page
**Route**: `{config['route']}/new`
**File**: `new/page.tsx`
**Purpose**: Create new {config['entity']}

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `{config['route']}/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing {config['entity']}

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft

"""
    return sitemap

def find_insertion_point(content):
    """Find where to insert sitemap section"""
    # Look for common section headings after which sitemap should go
    patterns = [
        r'\n## Component Specifications\n',
        r'\n## Components\n',
        r'\n## Implementation Details\n',
        r'\n## Technical Implementation\n',
        r'\n## Architecture\n',
        r'\n## Data Flow\n',
    ]

    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            return match.start()

    # If no match, insert before last ## heading
    last_heading = list(re.finditer(r'\n## ', content))
    if last_heading:
        return last_heading[-1].start()

    # Otherwise, insert at end
    return len(content)

def add_sitemap_to_file(file_path, config):
    """Add sitemap section to TS file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if sitemap already exists
        if re.search(r'## Sitemap|## Site Map', content, re.IGNORECASE):
            return False, "Sitemap already exists"

        # Generate sitemap
        sitemap = generate_sitemap(config)

        # Find insertion point
        insert_pos = find_insertion_point(content)

        # Insert sitemap
        new_content = content[:insert_pos] + sitemap + content[insert_pos:]

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True, "Sitemap added"

    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("ADDING SITEMAP SECTIONS TO TS FILES")
    print("="*80)
    print(f"Processing {len(files_to_update)} files...\n")

    added_count = 0
    skipped_count = 0
    error_count = 0

    for file_path, config in files_to_update.items():
        path_obj = Path(file_path)
        rel_path = path_obj.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))

        if not path_obj.exists():
            error_count += 1
            print(f"❌ {rel_path}")
            print(f"   File not found")
            continue

        success, message = add_sitemap_to_file(file_path, config)

        if success:
            added_count += 1
            print(f"✅ {rel_path}")
            print(f"   {config['submodule']}")
        elif "already exists" in message:
            skipped_count += 1
            print(f"⏭️  {rel_path}")
            print(f"   {message}")
        else:
            error_count += 1
            print(f"❌ {rel_path}")
            print(f"   {message}")

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total files processed: {len(files_to_update)}")
    print(f"✅ Sitemaps added: {added_count}")
    print(f"⏭️  Already had sitemaps: {skipped_count}")
    print(f"❌ Errors: {error_count}")

if __name__ == "__main__":
    main()
