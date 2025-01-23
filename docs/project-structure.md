# Carmen - Project Structure Documentation

## Overview
Carmen is a comprehensive enterprise resource planning (ERP) system designed for food service operations. The application follows Next.js 13+ App Router architecture with a focus on modularity and maintainability.

## Directory Structure

```
app/
├── (main)/                   # Main application routes
│   ├── dashboard/           # Dashboard module
│   ├── procurement/         # Procurement management
│   ├── product-management/  # Product catalog and management
│   ├── vendor-management/   # Vendor relationships and management
│   ├── store-operations/    # Store operations management
│   ├── inventory-management/# Inventory control and management
│   ├── operational-planning/# Planning and forecasting
│   ├── production/         # Production and manufacturing
│   ├── reporting-analytics/# Reports and analytics
│   ├── finance/           # Financial management
│   ├── system-administration/ # System settings and administration
│   ├── help-support/      # Help and support resources
│   └── products/          # Product catalog
├── components/            # Shared UI components
├── lib/                  # Utility functions and shared logic
└── public/              # Static assets
```

## Page Mapping

### Dashboard
- Path: `/dashboard`
- Purpose: Main dashboard and overview

### Procurement
- `/procurement/my-approvals` - Approval management
- `/procurement/purchase-requests` - Purchase request management
- `/procurement/purchase-orders` - Purchase order management
- `/procurement/goods-received-note` - Goods receipt management
- `/procurement/credit-note` - Credit note management
- `/procurement/purchase-request-templates` - Template management

### Product Management
- `/product-management/products` - Product catalog
- `/product-management/categories` - Product categories
- `/product-management/units` - Unit management
- `/product-management/reports` - Product reports

### Vendor Management
- `/vendor-management/manage-vendors` - Vendor directory
- `/vendor-management/price-lists` - Price list management
- `/vendor-management/price-comparisons` - Price comparison tools

### Store Operations
- `/store-operations/store-requisitions` - Store requisition management
- `/store-operations/stock-replenishment` - Stock replenishment
- `/store-operations/wastage-reporting` - Wastage tracking

### Inventory Management
- `/inventory-management/stock-overview` - Stock level monitoring
- `/inventory-management/inventory-adjustments` - Inventory adjustment tools
- `/inventory-management/spot-check` - Spot check functionality
- `/inventory-management/physical-count-management` - Physical count tools
- `/inventory-management/period-end` - Period end procedures

### Operational Planning
- `/operational-planning/recipe-management`
  - `/recipes` - Recipe library
  - `/categories` - Recipe categories
  - `/cuisine-types` - Cuisine type management
- `/operational-planning/menu-engineering` - Menu planning
- `/operational-planning/demand-forecasting` - Demand prediction
- `/operational-planning/inventory-planning` - Inventory planning

### Production
- `/production/recipe-execution` - Recipe production
- `/production/batch-production` - Batch management
- `/production/wastage-tracking` - Production wastage
- `/production/quality-control` - Quality assurance

### Reporting & Analytics
- `/reporting-analytics/operational-reports` - Operations reporting
- `/reporting-analytics/financial-reports` - Financial analysis
- `/reporting-analytics/inventory-reports` - Inventory reporting
- `/reporting-analytics/vendor-performance` - Vendor metrics
- `/reporting-analytics/cost-analysis` - Cost analysis tools
- `/reporting-analytics/sales-analysis` - Sales performance

### Finance
- `/finance/account-code-mapping` - Account mapping
- `/finance/currency-management` - Currency settings
- `/finance/exchange-rates` - Exchange rate management
- `/finance/department-list` - Department management
- `/finance/budget-planning-and-control` - Budget control

### System Administration
- `/system-administration/user-management` - User administration
- `/system-administration/location-management` - Location settings
- `/system-administration/workflow/workflow-configuration` - Workflow settings
- `/system-administration/general-settings` - System settings
- `/system-administration/notification-preferences` - Notification config
- `/system-administration/license-management` - License management
- `/system-administration/security-settings` - Security config
- `/system-administration/data-backup-and-recovery` - Backup management
- `/system-administration/system-integrations` - Integration settings

### Help & Support
- `/help-support/user-manuals` - User documentation
- `/help-support/video-tutorials` - Tutorial videos
- `/help-support/faqs` - FAQ section
- `/help-support/support-ticket-system` - Support tickets
- `/help-support/system-updates-and-release-notes` - Update notes

### Products
- `/products` - Product catalog
- `/products/categories` - Product categories
- `/products/reports` - Product reports

## Key Components

### Navigation
- `components/Sidebar.tsx` - Main navigation component
  - Handles responsive behavior
  - Supports collapsible navigation
  - Implements multi-level menu structure

### UI Components
The application uses several UI frameworks and libraries:
- Shadcn UI
- Tailwind CSS
- Radix UI primitives
- Lucide Icons

## Routing Structure
The application uses Next.js 13+ App Router with the following structure:
- Route groups are organized under `app/(main)`
- Each major module has its own directory
- Complex features use nested routing
- Server and client components are properly segregated

## Best Practices
1. Server Components are preferred for better performance
2. Client Components are marked with "use client"
3. Responsive design is implemented throughout
4. TypeScript is used for type safety
5. Modular architecture for scalability

