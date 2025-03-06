# Carmen - Application Page Map

## Authentication Routes /(auth)
- `/login` - User authentication
- `/signup` - New user registration

## Main Application Routes /(main)

### Dashboard
- `/dashboard` - Main application dashboard

### Procurement
- `/procurement`
  - `/purchase-requests`
    - `/` - List view
    - `/new` - Create new PR
    - `/[id]` - PR details
    - `/import` - Import PRs
  - `/purchase-orders`
    - `/` - List view
    - `/new` - Create new PO
    - `/[id]` - PO details
  - `/my-approvals` - Approval management
  - `/goods-received-note` - Goods receipt management
  - `/credit-note` - Credit note management
  - `/purchase-request-templates` - Template management

### Product Management
- `/product-management`
  - `/products` - Product catalog
  - `/categories` - Product categories
  - `/units` - Unit management
  - `/reports` - Product reports

### Vendor Management
- `/vendor-management`
  - `/vendors` - Vendor list
  - `/price-lists` - Price list management
    - `/` - List view
    - `/new` - Create new price list
    - `/import` - Import price lists
    - `/[id]` - Price list details

### Store Operations
- `/store-operations`
  - `/locations` - Store locations
  - `/pos-management` - POS systems
  - `/staff` - Staff management

### Inventory Management
- `/inventory-management`
  - `/physical-count`
    - `/active/[id]` - Active count interface
  - `/stock-movement` - Stock movement tracking
  - `/adjustments` - Inventory adjustments
  - `/reports` - Inventory reports

### Operational Planning
- `/operational-planning`
  - `/forecasts` - Sales forecasts
  - `/schedules` - Production schedules
  - `/capacity` - Capacity planning

### Recipe Management
- `/recipe-management`
  - `/recipes` - Recipe list
  - `/ingredients` - Ingredient management
  - `/costing` - Recipe costing

### Production
- `/production`
  - `/orders` - Production orders
  - `/scheduling` - Production scheduling
  - `/tracking` - Production tracking

### Reporting & Analytics
- `/reporting-analytics`
  - `/dashboards` - Analytics dashboards
  - `/reports` - Standard reports
  - `/custom-reports` - Custom report builder

### Finance
- `/finance`
  - `/account-code-mapping` - Account code configuration
  - `/budgets` - Budget management
  - `/cost-centers` - Cost center management

### System Administration
- `/system-administration`
  - `/workflow`
    - `/` - Workflow management
    - `/workflow-configuration` - Configure workflows
    - `/role-assignment` - Role assignments
  - `/users` - User management
  - `/roles` - Role management
  - `/settings` - System settings

### Help & Support
- `/help-support`
  - `/documentation` - System documentation
  - `/tutorials` - User tutorials
  - `/support-tickets` - Support management

### User Profile
- `/edit-profile` - User profile management

## API Routes
- `/api`
  - `/auth` - Authentication endpoints
  - `/users` - User management
  - `/products` - Product management
  - `/inventory` - Inventory operations
  - `/procurement` - Procurement operations
  - `/workflow` - Workflow management

## Special Routes
- `/` - Landing page
- `/404` - Not found page
- `/500` - Error page
- `/maintenance` - Maintenance page