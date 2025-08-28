# Carmen ERP Role-Based Interface Documentation

**Generated**: 2025-08-22T10:01:17.926Z  
**Screenshots**: 60  
**User Roles**: 6  
**Routes Covered**: 10

## 🎭 Overview

This documentation demonstrates how the Carmen ERP interface adapts to different user roles, showing the practical implementation of role-based access control (RBAC) in the user interface.

## 👥 User Roles


### Staff User (`staff`)
Basic operational access with limited permissions

**Permissions**: read, basic-operations  
**Screenshots**: 10

### Department Manager (`department-manager`)
Department-level management with approval capabilities

**Permissions**: read, write, approve-departmental, manage-team  
**Screenshots**: 10

### Financial Manager (`financial-manager`)
Financial oversight with budget and cost controls

**Permissions**: read, write, financial-approve, budget-control  
**Screenshots**: 10

### Purchasing Staff (`purchasing-staff`)
Procurement specialization with vendor management

**Permissions**: read, write, vendor-manage, procurement-full  
**Screenshots**: 10

### Counter Staff (`counter`)
Inventory operations with counting and stock management

**Permissions**: read, write, inventory-operations, count-manage  
**Screenshots**: 10

### Chef (`chef`)
Recipe management with ingredient and menu control

**Permissions**: read, write, recipe-manage, menu-plan  
**Screenshots**: 10


## 📊 Interface Variations

Each role sees different:
- **Navigation options**: Menu items and accessible features
- **Action buttons**: Available operations based on permissions
- **Data visibility**: Information filtered by role and department
- **Approval workflows**: Different approval paths and authorities
- **Form fields**: Editable vs read-only fields based on permissions

## 🔍 Route Coverage

- `/dashboard`
- `/procurement/purchase-requests`
- `/procurement/purchase-requests/new-pr`
- `/procurement/purchase-orders`
- `/inventory-management/stock-overview`
- `/vendor-management/vendors`
- `/system-administration/user-management`
- `/finance/account-code-mapping`
- `/operational-planning/recipe-management/recipes`
- `/store-operations/store-requisitions`

## 📁 File Organization

```
role-based/
├── index.html              # Main role documentation portal
├── comparisons/            # Side-by-side role comparisons
│   ├── dashboard-comparison.html
│   ├── procurement-purchase-requests-comparison.html
│   └── [other route comparisons]
├── staff/                  # Staff user screenshots
├── department-manager/     # Department manager screenshots
├── financial-manager/      # Financial manager screenshots
├── purchasing-staff/       # Purchasing staff screenshots
├── counter/               # Counter staff screenshots
└── chef/                  # Chef user screenshots
```

## 🚀 Usage

1. **Browse by Role**: Navigate to individual role directories to see their specific interface
2. **Compare Roles**: Use the comparison HTML files to see side-by-side differences
3. **Interactive Portal**: Open `index.html` for a comprehensive browsing experience

## 📈 Statistics


- **Staff User**: 10 screenshots, 10 successful, 0 failed
- **Department Manager**: 10 screenshots, 10 successful, 0 failed
- **Financial Manager**: 10 screenshots, 10 successful, 0 failed
- **Purchasing Staff**: 10 screenshots, 10 successful, 0 failed
- **Counter Staff**: 10 screenshots, 10 successful, 0 failed
- **Chef**: 10 screenshots, 10 successful, 0 failed

---

*This role-based documentation helps understand how RBAC is implemented in the Carmen ERP user interface and supports accurate role-based feature replication.*
