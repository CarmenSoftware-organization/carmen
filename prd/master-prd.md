# Carmen Hospitality Supply Chain System - Master PRD

## Document Control

| **Document Information** |                                      |
|-------------------------|--------------------------------------|
| **Document Title**      | Carmen Hospitality System Master PRD |
| **Version**             | 1.0.0                                |
| **Date**                | January 2025                         |
| **Status**              | Draft                                |
| **Classification**      | Confidential                         |

### Version History

| Version | Date         | Author              | Description           |
|---------|--------------|---------------------|----------------------|
| 1.0.0   | Jan 2025     | Carmen Product Team | Initial master PRD   |

### Approval Matrix

| Role                    | Name | Date | Signature |
|------------------------|------|------|-----------|
| Chief Product Officer  |      |      |           |
| Chief Technology Officer|      |      |           |
| Chief Operations Officer|      |      |           |
| Head of Hospitality    |      |      |           |

---

## Executive Summary

Carmen Hospitality Supply Chain System is a comprehensive, cloud-native enterprise resource planning (ERP) solution designed specifically for the hospitality industry. Built on modern microservices architecture with cutting-edge web technologies, Carmen provides end-to-end supply chain management from procurement to production, enabling hospitality businesses to optimize operations, reduce costs, and improve service delivery.

### Key Objectives

1. **Operational Excellence**: Streamline procurement, inventory, and production processes
2. **Cost Optimization**: Reduce waste, optimize purchasing, and improve resource utilization
3. **Real-time Visibility**: Provide instant insights into inventory levels, costs, and operations
4. **Vendor Management**: Centralize vendor relationships and optimize pricing
5. **Compliance & Control**: Ensure regulatory compliance with comprehensive audit trails
6. **Scalability**: Support growth from single properties to global chains
7. **Integration**: Seamless connection with POS systems and accounting software

### Target Market

- **Primary**: Hotels, resorts, and hotel chains (50-5000+ rooms)
- **Secondary**: Restaurants, catering companies, cruise lines
- **Tertiary**: Healthcare facilities, educational institutions with food service

---

## System Architecture Overview

### Technology Stack

#### Frontend (Web Application)
- **Framework**: Next.js 15+ with App Router
- **Rendering**: Static Site Generation (SSG) with Partial Prerendering (PPR)
- **Styling**: Tailwind CSS 4+ with container queries and layers
- **Components**: TweakCN (latest) component library
- **State Management**: TanStack Query v5, Table v8, Virtual v3
- **Forms**: React Hook Form v7 with Zod validation
- **Internationalization**: Next.js native i18n with multi-language support
- **Date Handling**: date-fns v3+ with timezone support
- **PDF Generation**: @react-pdf/renderer for client-side documents
- **Build Tools**: Turbopack (development), SWC (production)

#### Backend (Microservices)
- **Framework**: NestJS (latest) with modular architecture
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15+ with database-per-service pattern
- **ORM**: Prisma 5+ with type-safe database access
- **Authentication**: Keycloak for identity and access management
- **Authorization**: JWT (RS256) with RBAC/ABAC
- **Validation**: Zod schemas with shared frontend/backend types
- **Documentation**: Swagger/OpenAPI 3.1
- **PDF Generation**: @react-pdf/renderer for server-side documents
- **Message Queue**: RabbitMQ/Kafka for event-driven architecture
- **Caching**: Redis for performance optimization

#### Infrastructure
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes for container management
- **API Gateway**: Kong/Traefik for routing and load balancing
- **CDN**: CloudFront/Fastly for static assets
- **Storage**: S3-compatible object storage
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **CI/CD**: GitHub Actions with automated testing

### Security Architecture

#### Identity & Access Management (Keycloak)
- **Single Sign-On (SSO)**: Centralized authentication
- **Multi-Factor Authentication (MFA)**: TOTP, WebAuthn
- **OAuth 2.0 / OpenID Connect**: Standard protocols
- **Federation**: LDAP, Active Directory, Social logins
- **Multi-tenancy**: Realm-based tenant isolation
- **Session Management**: Centralized with timeout policies

#### Security Standards
- **Compliance**: GDPR, PCI DSS, SOC 2, ISO 27001
- **Encryption**: TLS 1.3 for transit, AES-256 for rest
- **API Security**: Rate limiting, DDoS protection
- **Audit Logging**: Complete user action tracking
- **Data Privacy**: Minimization and anonymization

---

## System Modules

### Core Operations

#### 1. Procurement Module ✅
Complete procurement lifecycle management from requisition to payment.

**Sub-modules**:
- [Purchase Requests](./modules/procurement/purchase-requests/module-prd.md)
- [Purchase Orders](./modules/procurement/purchase-orders/module-prd.md)
- [Goods Received Notes](./modules/procurement/goods-received-notes/module-prd.md)
- [Credit Notes](./modules/procurement/credit-notes/module-prd.md)

**Key Features**:
- Multi-level approval workflows
- Vendor price comparison
- Automatic PO generation from approved PRs
- Three-way matching (PO-GRN-Invoice)
- Budget control and validation

**Status**: Fully implemented

---

#### 2. Inventory Management Module ✅
Comprehensive inventory control with real-time tracking and optimization.

**Sub-modules**:
- [Inventory Adjustments](./modules/inventory-management/inventory-adjustments/module-prd.md)
- [Physical Count](./modules/inventory-management/physical-count/module-prd.md)
- [Spot Check](./modules/inventory-management/spot-check/module-prd.md)
- [Stock Overview](./modules/inventory-management/stock-overview/module-prd.md)
- [Period End](./modules/inventory-management/period-end/module-prd.md)

**Key Features**:
- Real-time stock tracking
- FIFO/LIFO/Average costing methods
- Multi-location inventory
- Automated reorder points
- Variance analysis and reporting

**Status**: Fully implemented

---

#### 3. Vendor Management Module ✅
Centralized vendor relationship and performance management.

**Components**:
- [Vendor Profiles](./modules/vendor-management/module-prd.md)
- [Pricelists Management](./modules/vendor-management/pricelists-prd.md)
- [Campaign Management](./modules/vendor-management/campaigns-prd.md)
- [Vendor Portal](./modules/vendor-management/vendor-portal-prd.md)

**Key Features**:
- Vendor onboarding and verification
- Performance scoring and tracking
- Multi-currency pricelist management
- Request for Pricing (RFP) campaigns
- Self-service vendor portal

**Status**: Fully implemented

---

#### 4. Product Management Module ✅
Comprehensive product catalog and specification management.

**Components**:
- [Product Catalog](./modules/product-management/products-prd.md)
- [Categories](./modules/product-management/categories-prd.md)
- [Units of Measure](./modules/product-management/units-prd.md)

**Key Features**:
- Hierarchical product categorization
- Multiple units and conversions
- Product specifications and attributes
- Allergen and nutritional tracking
- Multi-location product settings

**Status**: Fully implemented

---

#### 5. Operational Planning Module 🔄
Recipe and menu management with cost optimization.

**Sub-modules**:
- [Recipe Management](./modules/operational-planning/recipe-management/module-prd.md) ✅
- [Menu Engineering](./modules/operational-planning/menu-engineering/module-prd.md) 🚧
- [Buffet Management](./modules/operational-planning/buffet-management/module-prd.md) 🚧

**Recipe Management Features** (Implemented):
- Recipe creation with versioning
- Ingredient management and scaling
- Cost calculation and tracking
- Nutritional analysis
- Allergen management
- Production planning

**Menu Engineering** (Planned):
- Menu profitability analysis
- Price optimization
- Menu mix analysis
- Contribution margin tracking

**Buffet Management** (Planned):
- Buffet configuration
- Consumption tracking
- Waste analysis
- Cost per cover calculation

**Status**: Partially implemented

---

#### 6. Store Operations Module ✅
Inter-location inventory movement and waste management.

**Components**:
- [Store Requisitions](./modules/store-operations/requisitions-prd.md)
- [Stock Replenishment](./modules/store-operations/replenishment-prd.md)
- [Wastage Reporting](./modules/store-operations/wastage-prd.md)

**Key Features**:
- Inter-store transfer workflows
- Automated replenishment
- Min/max level management
- Wastage tracking with reason codes
- Transfer approval workflows

**Status**: Fully implemented

---

#### 7. Finance Module ⚠️
Financial management and accounting integration.

**Components**:
- [Currency Management](./modules/finance/currency-prd.md)
- [Exchange Rates](./modules/finance/exchange-rates-prd.md)
- [Account Code Mapping](./modules/finance/account-mapping-prd.md)
- [Department Management](./modules/finance/departments-prd.md)

**Key Features**:
- Multi-currency support
- Automated exchange rate updates
- GL account mapping
- Cost center configuration
- Budget tracking

**Status**: Partially implemented

---

#### 8. System Administration Module ✅
User management and system configuration.

**Components**:
- [User Management](./modules/system-administration/users-prd.md)
- [Workflow Configuration](./modules/system-administration/workflows-prd.md)
- [Location Management](./modules/system-administration/locations-prd.md)
- [POS Integration](./modules/system-administration/pos-integration-prd.md)

**Key Features**:
- Keycloak-based user management
- Role-based access control (RBAC)
- Workflow engine configuration
- Multi-location support
- POS system mapping

**POS Integration Features**:
- Product/menu mapping
- Price synchronization
- Transaction import
- Multi-POS support (Oracle Simphony, Micros)
- Sales reconciliation

**Status**: Fully implemented (POS mapping UI in development)

---

### Modules in Development

#### 9. Dashboard Module ⚠️
Executive dashboards and KPI visualization.

**Planned Features**:
- Customizable widget layout
- Real-time KPI tracking
- Drill-down analytics
- Alert configuration
- Mobile responsive design

**Status**: UI design in progress

---

### Future Modules

#### 10. Production Module 🚧
Manufacturing and production planning.

**Planned Features**:
- Production planning
- Batch tracking
- Quality control
- Manufacturing processes
- Resource planning

**Status**: Requirements gathering

---

#### 11. Reporting & Analytics Module 🚧
Advanced reporting and business intelligence.

**Planned Features**:
- Custom report builder
- Scheduled reports
- Data exports
- Analytics dashboards
- POS sales analytics

**Status**: Framework design

---

#### 12. Help & Support Module 🚧
User assistance and documentation.

**Planned Features**:
- In-app help system
- Video tutorials
- Support ticket management
- Knowledge base
- Community forum

**Status**: Planning phase

---

## Integration Architecture

### Point of Sale (POS) Systems
- **Oracle Simphony**: Full integration
- **Micros**: Transaction and product sync
- **Square**: API integration
- **Toast**: Menu and sales data
- **Custom POS**: RESTful API support

### Accounting Systems
- **QuickBooks**: GL posting
- **SAP**: Master data sync
- **Oracle Financials**: Journal entries
- **NetSuite**: Full integration

### Payment Gateways
- **Stripe**: Payment processing
- **PayPal**: Vendor payments
- **Bank APIs**: Direct transfers

### External Services
- **Email**: SendGrid/AWS SES
- **SMS**: Twilio
- **Storage**: AWS S3/Azure Blob
- **Maps**: Google Maps API

---

## Performance Requirements

### Response Times
- **Page Load**: <2 seconds (SSG pages)
- **API Response**: <200ms (p95)
- **Search**: <500ms
- **Report Generation**: <5 seconds
- **PDF Generation**: <2 seconds (10 pages)

### Scalability
- **Concurrent Users**: 10,000+
- **Transactions/Day**: 1,000,000+
- **Data Retention**: 7 years
- **Database Size**: Petabyte scale
- **File Storage**: Unlimited (S3)

### Availability
- **Uptime SLA**: 99.9%
- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 15 minutes
- **Backup Frequency**: Daily incremental, weekly full

---

## Security & Compliance

### Data Protection
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Key Management**: AWS KMS/Azure Key Vault
- **Data Masking**: PII anonymization
- **Audit Logging**: Immutable audit trail

### Compliance Standards
- **GDPR**: EU data protection
- **PCI DSS**: Payment card security
- **SOC 2 Type II**: Security controls
- **ISO 27001**: Information security
- **HIPAA**: Healthcare (where applicable)

### Access Control
- **Authentication**: Keycloak SSO
- **MFA**: TOTP, WebAuthn, SMS
- **Authorization**: RBAC/ABAC hybrid
- **Session Management**: Configurable timeouts
- **API Security**: OAuth 2.0, API keys

---

## Deployment Architecture

### Environments
- **Development**: Feature branches
- **Staging**: Pre-production testing
- **UAT**: User acceptance testing
- **Production**: Multi-region deployment

### Deployment Strategy
- **Blue-Green**: Zero-downtime deployments
- **Canary**: Gradual rollout
- **Rollback**: Instant rollback capability
- **Feature Flags**: Progressive feature release

### Monitoring
- **Application**: New Relic/DataDog
- **Infrastructure**: Prometheus/Grafana
- **Logs**: ELK Stack
- **Errors**: Sentry
- **Uptime**: Pingdom/UptimeRobot

---

## Support & Maintenance

### Support Tiers
- **Tier 1**: Help desk (24/7)
- **Tier 2**: Application support (Business hours)
- **Tier 3**: Engineering support (On-call)

### SLA Commitments
- **Critical Issues**: 2-hour response
- **High Priority**: 4-hour response
- **Medium Priority**: 1 business day
- **Low Priority**: 3 business days

### Training & Documentation
- **User Manuals**: Role-specific guides
- **Video Tutorials**: Feature walkthroughs
- **API Documentation**: Swagger/OpenAPI
- **Administrator Guide**: System configuration
- **Developer Guide**: Integration documentation

---

## Implementation Roadmap

### Phase 1: Foundation (Q1 2025) ✅
- Core infrastructure setup
- Procurement module
- Inventory management
- Basic vendor management

### Phase 2: Enhancement (Q2 2025) 🔄
- Recipe management
- Store operations
- Advanced vendor features
- POS integration

### Phase 3: Optimization (Q3 2025) 📅
- Dashboard and analytics
- Menu engineering
- Buffet management
- Mobile applications

### Phase 4: Expansion (Q4 2025) 📅
- Production module
- Advanced reporting
- AI/ML features
- Global rollout

---

## Success Metrics

### Business KPIs
- **Cost Reduction**: 15-20% procurement costs
- **Waste Reduction**: 25-30% food waste
- **Efficiency Gain**: 40% time savings
- **ROI**: 200% within 18 months

### Technical KPIs
- **System Uptime**: >99.9%
- **User Adoption**: >90% active users
- **Data Accuracy**: >99.5%
- **Integration Success**: 100% POS sync

### User Satisfaction
- **NPS Score**: >50
- **User Rating**: >4.5/5
- **Support Tickets**: <5% of users/month
- **Training Completion**: >95%

---

## Risk Management

### Technical Risks
- **Data Migration**: Mitigation through phased approach
- **Integration Failures**: Fallback mechanisms
- **Performance Issues**: Auto-scaling and optimization
- **Security Breaches**: Defense in depth strategy

### Business Risks
- **User Adoption**: Comprehensive training program
- **Change Management**: Phased rollout
- **Vendor Lock-in**: Open standards and APIs
- **Compliance**: Regular audits and updates

---

## Appendices

### A. Glossary
- **ERP**: Enterprise Resource Planning
- **POS**: Point of Sale
- **PR**: Purchase Request
- **PO**: Purchase Order
- **GRN**: Goods Received Note
- **SSO**: Single Sign-On
- **MFA**: Multi-Factor Authentication
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control

### B. References
- [Frontend Architecture](./frontend/frontend-prd.md)
- [Backend Architecture](./backend/backend-prd.md)
- [Keycloak Configuration](./backend/keycloak-integration.md)
- [API Documentation](./backend/swagger-documentation.md)
- [Security Guidelines](./common/security-guidelines.md)

### C. Contact Information
- **Product Team**: product@carmen.io
- **Technical Support**: support@carmen.io
- **Sales**: sales@carmen.io
- **Documentation**: docs.carmen.io

---

*This document is confidential and proprietary to Carmen Hospitality Systems. Distribution is limited to authorized personnel only.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025