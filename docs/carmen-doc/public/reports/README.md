# Carmen ERP Reports Documentation - HTML Version

This directory contains the HTML version of all Carmen ERP report documentation, converted from the markdown sources in `docs/04-modules/reporting`.

## 📁 Directory Structure

```
carmen-doc/public/reports/
├── index.html                              # Main navigation page for all reports
├── 01-pr-001-purchase-request-list/
│   ├── PRD.html                           # Product Requirements Document
│   └── TEMPLATE.html                      # Template Structure
├── 02-pr-002-purchase-request-detail/
│   ├── PRD.html
│   └── TEMPLATE.html
... (35 report directories total)
└── 35-rm-003-material-consumption/
    ├── PRD.html
    └── TEMPLATE.html
```

## 📊 Statistics

- **Total Reports**: 35
- **Total HTML Files**: 71 (70 report docs + 1 index)
- **Report Categories**: 12 modules
- **Documents per Report**: 2 (PRD + Template)

## 🚀 Quick Start

1. **Main Navigation**: Open `index.html` in your browser to access all reports
2. **Search Feature**: Use the search bar on the index page to find specific reports
3. **Quick Navigation**: Click category links to jump to specific report modules

## 📑 Report Categories

### Purchase Request (PR) - 3 Reports
- PR-001: Purchase Request List
- PR-002: Purchase Request Detail (Critical Priority)
- PR-003: Price List by Product

### Purchase Order (PO) - 3 Reports
- PO-001: Order Pending (Merged with PO-002)
- PO-002: Purchase Order Detail (Critical Priority)
- PO-003: Purchase Order List

### Receiving (RC) - 4 Reports
- RC-001: Receiving List
- RC-002: Receiving Detail (Critical Priority)
- RC-003: Top Purchasing
- RC-004: Purchase Analysis by Item

### Credit Note (CN) - 2 Reports
- CN-001: Credit Note List
- CN-002: Credit Note Detail

### Vendor (VD) - 2 Reports
- VD-001: Vendor List
- VD-002: Vendor Detailed

### Product (PD) - 2 Reports
- PD-001: Product List
- PD-002: Product Category

### Store Requisition (SR) - 4 Reports
- SR-001: Store Requisition Detail
- SR-002: Store Requisition Summary
- SR-003: Store Requisition List
- SR-004: Issue Detail

### Stock Movement - 3 Reports
- SI-001: Stock In Detail
- SO-001: Stock Out Detail
- CL-001: EOP Adjustment

### Inventory (INV) - 9 Reports
- INV-001: Inventory Balance (Critical Priority)
- INV-002: Inventory Movement Detail
- INV-003: Inventory Movement Summary
- INV-004: Slow Moving
- INV-008: Stock Card Detailed (Critical Priority)
- INV-009: Stock Card Summary
- INV-010: Deviation by Item
- INV-011: Inventory Aging
- INV-012: Expired Items

### Recipe Management (RM) - 3 Reports
- RM-001: Recipe List
- RM-002: Recipe Card
- RM-003: Material Consumption

## 🛠️ Technical Details

### Conversion Process

All HTML files were generated from markdown sources using the custom conversion script:
- **Source Location**: `docs/04-modules/reporting/`
- **Conversion Script**: `docs/convert-reports-to-html.js`
- **Generated**: 2025-10-21

### Features

- **Responsive Design**: Mobile-friendly layout
- **Modern Styling**: Clean, professional appearance
- **Search Functionality**: Quick filter by report name or ID
- **Navigation**: Breadcrumbs and quick links
- **Print-Friendly**: Optimized for printing
- **Accessibility**: WCAG compliant structure

### Styling

- **Color Scheme**: Professional blue theme
- **Typography**: System fonts for optimal performance
- **Layout**: Grid-based responsive design
- **Components**: Cards, badges, tables, and forms

## 📋 File Types

### PRD.html (Product Requirements Document)
Contains:
- Executive summary
- Business objectives
- Functional requirements
- Filter parameters
- Data columns
- Business rules
- UI/UX requirements
- Performance requirements
- Integration points

### TEMPLATE.html (Template Structure)
Contains:
- Template layout diagrams
- Column specifications
- Visual design elements
- Color schemes
- Export formats
- Display features

## 🔄 Updates

To regenerate HTML files from markdown sources:

```bash
cd docs
node convert-reports-to-html.js
```

This will:
1. Read all markdown files from `04-modules/reporting`
2. Convert to HTML with styling
3. Generate output in `carmen-doc/public/reports`
4. Create individual files for each report
5. Update the main index page

## 📖 Usage

### For Developers
- Review both PRD.html and TEMPLATE.html for each report
- Use specifications for implementation
- Follow defined data structures and business rules

### For Designers
- Focus on TEMPLATE.html for layout specifications
- Review visual design elements
- Follow color schemes and styling guidelines

### For Business Analysts
- Review PRD.html for functional requirements
- Understand business rules and calculations
- Validate against business needs

### For Project Managers
- Use priority badges for planning
- Reference implementation phases
- Track report development status

## 🌐 Access

### Local Access
Open `index.html` in any modern web browser:
```
file:///Users/peak/Documents/GitHub/carmen/docs/carmen-doc/public/reports/index.html
```

### Web Server
Deploy the entire `reports` directory to a web server for team access.

## 📝 Notes

- All reports have been extracted and refactored from the original MSD (Master Specification Document)
- Reports marked as "Critical" should be prioritized for implementation
- Some reports have detailed PRDs while others have basic specifications requiring elaboration
- The index page includes search functionality for easy navigation
- All HTML files are standalone and can be viewed independently

## 🔗 Related Resources

- **Source Markdown**: `docs/04-modules/reporting/`
- **Original MSD**: `docs/reports/bl_reports_msd.md`
- **Original PRD**: `docs/reports/bl_reports_prd_templates.md`
- **Report Index**: `docs/04-modules/reporting/00-REPORTS-INDEX.md`

---

**Generated**: 2025-10-21
**Version**: 1.0
**Format**: HTML5
**Total Reports**: 35
**Total Files**: 71
