# Carmen ERP - Documentation Hub

> **Welcome to the Carmen ERP Documentation**
>
> Comprehensive documentation for the Carmen hospitality management system covering architecture, modules, APIs, and development guides.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 📚 Documentation Sections

### 01. Overview
**Introduction and Getting Started**

- [**System Documentation Index**](01-overview/README.md) - Main navigation hub
- [**Business Value & ROI**](01-overview/business-value.md) - Business case and value proposition
- [**Technology Stack**](01-overview/tech-stack.md) - Technologies, frameworks, and versions

---

### 02. Architecture
**System Design and Technical Architecture**

- [**System Architecture**](02-architecture/system-architecture.md) - Technical architecture overview
- Technical design patterns and principles
- Integration architecture

---

### 03. Data Model
**Database Schema and Data Dictionary**

- [**Data Dictionary**](03-data-model/data-dictionary.md) - Complete database documentation
- [**Prisma Schema**](03-data-model/schema.prisma) - Database schema definition
- Table relationships and constraints
- Index and performance optimization

---

### 04. Application Modules
**Feature Modules and Business Logic**

#### Procurement
- [**Purchase Requests**](04-modules/procurement/purchase-requests/README.md) - PR module documentation
- [**Purchase Orders**](04-modules/procurement/purchase-orders/README.md) - PO module documentation
- [**Goods Received Notes**](04-modules/procurement/goods-received-notes/README.md) - GRN module documentation
- [**Credit Notes**](04-modules/procurement/credit-notes/README.md) - CN module documentation
- [**Templates**](04-modules/procurement/templates/README.md) - PR templates

#### Inventory Management
- [**Stock Management**](04-modules/inventory/stock-management/README.md) - Inventory tracking and control
- [**Physical Count**](04-modules/inventory/physical-count/README.md) - Inventory counting procedures
- [**Spot Check**](04-modules/inventory/spot-check/README.md) - Quick inventory verification

#### Finance
- [**Finance Module**](04-modules/finance/README.md) - Financial management overview
- [**Account Code Mapping**](04-modules/finance/features/account-code-mapping/README.md)
- [**Currency Management**](04-modules/finance/features/currency-and-rates/README.md)
- [**Departments**](04-modules/finance/features/departments/README.md)

#### Vendor Management
- [**Vendor Management**](04-modules/vendor-management/README.md) - Supplier relationship management
- Vendor profiles and certifications
- Price lists and campaigns

#### Product Management
- [**Product Management**](04-modules/product-management/README.md) - Product catalog and specifications

#### Store Operations
- [**Store Operations**](04-modules/store-operations/README.md) - Store management operations
- Store requisitions
- Wastage reporting
- Stock replenishment

#### Operational Planning
- [**Operational Planning**](04-modules/operational-planning/README.md) - Recipe and menu management
- Recipe management
- Menu engineering

#### System Administration
- [**System Administration**](04-modules/system-administration/README.md) - System configuration
- Permission management
- Workflow configuration
- Location management
- User management

#### Reporting
- [**Reporting & Analytics**](04-modules/reporting/README.md) - Reports and dashboards
- Consumption analytics
- Performance metrics

#### Dashboard
- [**Dashboard**](04-modules/dashboard/README.md) - Main dashboard and overview

#### Production
- [**Production**](04-modules/production/README.md) - Production management

#### POS Integration
- [**POS Integration**](04-modules/pos-integration/navigation-map.md) - Point of sale integration

---

### 05. Cross-Cutting Concerns
**System-wide Features and Services**

- [**Security**](05-cross-cutting/security/README.md) - Security documentation and best practices
- Authentication and authorization
- Data protection

---

### 06. API Reference
**API Documentation and Specifications**

- [**API Requirements**](06-api-reference/api-requirements.md) - API design requirements
- [**Lot Transfer API**](06-api-reference/lot-transfer-api-sp.md) - Lot transfer specifications
- [**Workflow API**](06-api-reference/workflow-api-sp.md) - Workflow API specifications

---

### 07. Development
**Development Guides and Setup**

- [**Policy Engine Implementation**](07-development/policy-engine-implementation.md) - ABAC policy implementation guide
- Development environment setup
- Coding standards and conventions

---

### 08. Reference
**Migration Guides and Technical Reference**

- [**Migration Guide**](08-reference/migration-guide.md) - Documentation reorganization guide
- [**Navigation Verification**](08-reference/NAVIGATION-VERIFICATION-REPORT.md) - Navigation testing report
- [**Link Fix Report**](08-reference/COMPLETE-LINK-FIX-REPORT.md) - Link validation report
- [**Mermaid Support**](08-reference/MERMAID-SUPPORT-REPORT.md) - Diagram support documentation
- [**Mermaid Verification**](08-reference/MERMAID-VERIFICATION-REPORT.md) - Diagram verification report

---

## 🚀 Quick Start

### For Developers
1. Start with [System Architecture](02-architecture/system-architecture.md)
2. Review [Technology Stack](01-overview/tech-stack.md)
3. Check [Development Guide](07-development/policy-engine-implementation.md)
4. Explore [API Reference](06-api-reference/)

### For Business Users
1. Read [Business Value & ROI](01-overview/business-value.md)
2. Explore module documentation in [Application Modules](#04-application-modules)
3. Review feature-specific guides

### For Database Administrators
1. Review [Data Dictionary](03-data-model/data-dictionary.md)
2. Check [Prisma Schema](03-data-model/schema.prisma)
3. Understand table relationships and indexes

---

## 📊 Documentation Statistics

- **Total Sections:** 8
- **Total Modules:** 12
- **Markdown Files:** 123
- **HTML Pages:** 123
- **Last Updated:** October 20, 2025

---

## 🔍 Search & Navigation

### By Category
- **Getting Started:** [Overview Section](#01-overview)
- **Technical Details:** [Architecture](#02-architecture) | [Data Model](#03-data-model)
- **Features:** [Application Modules](#04-application-modules)
- **Integration:** [API Reference](#06-api-reference)
- **Development:** [Development Section](#07-development)

### By Role
- **Developers:** Architecture, API Reference, Development
- **Business Analysts:** Overview, Application Modules
- **Database Admins:** Data Model, Schema
- **System Admins:** System Administration, Security

---

## 📝 Documentation Standards

All documentation follows these standards:
- **Format:** Markdown with GitHub Flavored Markdown (GFM)
- **Diagrams:** Mermaid syntax for diagrams
- **Images:** PNG/JPG with descriptive alt text
- **Links:** Relative paths within documentation
- **Code Blocks:** Language-specific syntax highlighting

---

## 🔄 Keeping Documentation Updated

### Update Frequency
- **Architecture:** Updated with major changes
- **Module Documentation:** Updated with feature releases
- **API Reference:** Updated with API changes
- **Tech Stack:** Updated quarterly

### Contribution Guidelines
1. Keep documentation in sync with code
2. Use proper markdown formatting
3. Include diagrams for complex concepts
4. Test all links before committing
5. Run `npm run docs:convert` to generate HTML

---

## 📞 Support

For documentation questions or corrections:
- Review the [Migration Guide](08-reference/migration-guide.md)
- Check module-specific README files
- Contact the development team

---

## 📜 License & Copyright

© 2025 Carmen ERP. All rights reserved.

---

*This documentation hub was reorganized on October 20, 2025 to improve navigation and maintainability.*
