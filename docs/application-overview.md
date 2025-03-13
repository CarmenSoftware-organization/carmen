# Carmen - F&B Management System Overview

## Introduction

Carmen is a comprehensive enterprise resource planning (ERP) system designed specifically for food service operations. Built with Next.js 13+ App Router architecture, the system provides end-to-end management of F&B operations, from procurement to inventory management and financial control.

## Core Modules

### 1. Procurement Management
- Purchase Requests (PR)
- Purchase Orders (PO)
- Goods Received Notes (GRN)
- Credit Notes (CN)
- Vendor Management
- My Approvals Dashboard

### 2. Inventory Management
- Stock Overview
- Stock Movement Tracking
- Multi-location Inventory
- Real-time Stock Monitoring
- Stock Valuation
- Inventory Analytics

### 3. Product Management
- Product Catalog
- Category Management
- Unit Management
- Product Reports
- Recipe Management

### 4. Store Operations
- Store Requisitions
- Stock Transfers
- Wastage Management
- Store Performance Metrics

### 5. Operational Planning
- Demand Forecasting
- Budget Planning
- Resource Allocation
- Operational Analytics

## Technical Architecture

### Technology Stack
- Frontend: Next.js 14
- UI Components: 
  - Shadcn UI
  - Tailwind CSS
  - Radix UI primitives
  - Lucide Icons
- Authentication: Next.js App Router Auth
- State Management: React Context + Hooks

### Project Structure
```
app/
├── (auth)/                # Authentication routes
├── (main)/               # Main application routes
├── components/           # Shared UI components
├── lib/                  # Utility functions
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── actions/             # Server actions
└── api/                 # API routes
```

## Key Features

### 1. Authentication & Authorization
- Role-based access control (RBAC)
- Multi-level approval workflows
- Audit logging
- Session management

### 2. Real-time Monitoring
- Stock level tracking
- Alert management
- Performance metrics
- Activity logging

### 3. Reporting & Analytics
- Customizable dashboards
- Performance reports
- Financial analytics
- Operational insights

### 4. Integration Capabilities
- API-first architecture
- External system integration
- Data import/export
- Batch processing

## User Roles

1. **System Administrators**
   - System configuration
   - User management
   - Access control
   - System monitoring

2. **Operations Managers**
   - Operational oversight
   - Performance monitoring
   - Resource allocation
   - Strategic planning

3. **Store Managers**
   - Store operations
   - Inventory management
   - Staff supervision
   - Local reporting

4. **Finance Controllers**
   - Financial oversight
   - Budget management
   - Cost control
   - Financial reporting

5. **Procurement Officers**
   - Purchase management
   - Vendor relations
   - Contract management
   - Cost optimization

## Best Practices

### 1. Development Standards
- Server Components preferred for performance
- Client Components marked with "use client"
- Consistent code structure
- TypeScript for type safety

### 2. UI/UX Guidelines
- Responsive design throughout
- Consistent UI patterns
- Intuitive navigation
- Accessibility compliance

### 3. Performance Optimization
- Server-side rendering
- Image optimization
- Code splitting
- Caching strategies

### 4. Security Measures
- Authentication
- Authorization
- Data encryption
- Input validation

## Documentation Structure

```
docs/
├── design/              # System design documents
├── po/                 # Purchase Order documentation
├── pr/                 # Purchase Request documentation
├── grn/                # Goods Received Note documentation
├── cn/                 # Credit Note documentation
└── sr/                 # Store Requisition documentation
```

## Deployment & Environment

### Development Environment
- Local development setup
- Development database
- Test data sets
- Development tools

### Production Environment
- Scalable infrastructure
- Database clustering
- Load balancing
- Monitoring tools

## Support & Maintenance

### Technical Support
- Issue tracking
- Bug reporting
- Feature requests
- Documentation updates

### User Support
- Training materials
- User guides
- Help desk
- FAQ documentation

## Future Roadmap

1. **Phase 1 (Current)**
   - Core module implementation
   - Basic reporting
   - Essential integrations

2. **Phase 2 (Planned)**
   - Advanced analytics
   - Mobile applications
   - Extended integrations
   - AI-powered insights

3. **Phase 3 (Future)**
   - Predictive analytics
   - Automated operations
   - Extended ecosystem
   - Global scaling

## Contact & Resources

- Technical Documentation: `/docs/design`
- User Guides: `/docs/user-guides`
- API Documentation: `/docs/api`
- Support: support@carmen-fb.com