# Carmen ERP Design System Documentation

**Design System Version**: 1.0  
**Created**: January 2025  
**Based on**: Purchase Request Module Production Implementation

This directory contains comprehensive design system documentation extracted from the Purchase Request module implementation to serve as the foundation for consistent UI/UX patterns across all Carmen ERP modules.

## 📚 Documentation Overview

### Core Design Guides

#### [PR UI Design Guide](./pr-ui-design-guide.md)
**Primary design patterns and component implementations**
- Complete layout patterns (List & Detail pages)
- Component architecture and responsive design
- Form field patterns with RBAC integration
- Workflow UI patterns and floating actions
- Performance optimization and accessibility

#### [RBAC Implementation Patterns](./rbac-implementation-patterns.md)
**Role-based access control system design**
- Multi-layered RBAC architecture
- Field-level and widget-based permissions
- Workflow-stage access control
- Section visibility and progressive disclosure
- Bulk operations with role filtering

## 🎯 Purpose and Scope

### Design System Goals

1. **Consistency**: Standardized UI patterns across all modules
2. **Accessibility**: WCAG 2.1 AA compliant by default
3. **Performance**: Optimized components with lazy loading and virtualization
4. **Security**: Built-in RBAC integration at the component level
5. **Scalability**: Patterns that work from small to enterprise scale
6. **Maintainability**: Clear documentation and reusable patterns

### Module Coverage

This design system is extracted from the **Purchase Request module**, which represents the most sophisticated implementation in the Carmen ERP system:

**✅ Production-Ready Patterns:**
- Advanced RBAC with multi-role support
- Responsive list and detail page layouts
- Complex form management with field-level permissions
- Intelligent workflow decision engines
- Real-time updates and optimistic UI
- Comprehensive accessibility implementation

## 🏗️ Architecture Foundation

### Technical Stack

**Framework Foundation:**
```
Next.js 14 App Router + TypeScript
├── UI Components: Shadcn/ui + Radix UI primitives
├── Styling: Tailwind CSS with custom design tokens
├── Forms: React Hook Form + Zod validation
├── State: Zustand + React Query
├── Icons: Lucide React
└── Utilities: date-fns, clsx, cn
```

**Core Libraries:**
- `@radix-ui/react-*` - Accessible component primitives
- `lucide-react` - Consistent iconography system
- `tailwindcss` - Utility-first CSS framework
- `react-hook-form` - Performant form management
- `zod` - Runtime type validation
- `zustand` - Lightweight state management

### Design Principles

1. **Role-Based Progressive Disclosure**: UI adapts to user permissions
2. **Context-Aware Interfaces**: Components respond to workflow states
3. **Responsive-First Design**: Mobile-first with graceful enhancement
4. **Accessibility by Default**: WCAG compliance built into all patterns
5. **Performance-Optimized**: Lazy loading and virtual scrolling

## 📋 Component Patterns

### 1. List Page Pattern

**Standard layout for all module list pages:**
- Header with role-based actions and view controls
- RBAC widget filtering system with dynamic toggles
- Advanced filter panel with saved presets
- Table/Grid view toggle with responsive design
- Bulk operations with smart validation
- Pagination with summary statistics

**Key Components:**
- `ModuleHeader` - Standardized header with actions
- `RBACFilterBar` - Dynamic filtering based on user role
- `DataDisplay` - Responsive table/grid toggle
- `BulkActionBar` - Context-aware bulk operations

### 2. Detail Page Pattern

**Two-column responsive layout:**
- Main content area (70-100% width)
- Collapsible sidebar (30-0% width)
- Header card with mode switching (view/edit)
- RBAC field-level permissions
- Tabbed content with role-based visibility
- Floating action menu with workflow intelligence

**Key Components:**
- `DetailPageLayout` - Two-column responsive wrapper
- `DetailHeader` - Dynamic header with actions
- `RBACFieldRenderer` - Permission-aware form fields
- `TabbedContent` - Role-filtered tab system
- `FloatingActionMenu` - Context-aware workflow actions

### 3. Form Patterns

**RBAC-integrated form management:**
- Field-level permission checking
- Dynamic field rendering based on user role
- Intelligent validation with contextual rules
- Progressive disclosure of form sections
- Optimistic updates with error handling

### 4. Status and Badge System

**Consistent status representation:**
- Color-coded status badges with WCAG compliance
- Tooltip descriptions for accessibility
- Workflow stage indicators
- Progress visualization components

## 🔐 RBAC Integration Patterns

### Permission Layers

1. **Role-Based**: Core permissions tied to user roles
2. **Field-Level**: Individual form field access control
3. **Widget-Based**: Dynamic UI sections based on permissions
4. **Workflow-Stage**: Actions available based on process stage
5. **Context-Aware**: Permissions based on document state

### Implementation Patterns

**Service Layer:**
```typescript
interface RBACService {
  canPerformAction(user: User, entity: any, action: string): boolean;
  getAvailableActions(user: User, entity: any): string[];
  canEditField(fieldName: string, userRole: string): boolean;
  canViewField(fieldName: string, userRole: string): boolean;
  getRoleConfiguration(userRole: string): RoleConfiguration;
}
```

**Component Integration:**
- `withRBAC` Higher-Order Component
- `RBACWrapper` for conditional rendering
- `SmartActionButton` for context-aware actions
- `RBACSection` for progressive disclosure

## 📱 Responsive Design System

### Breakpoint Strategy

**Mobile-First Approach:**
- `< 768px`: Single column, simplified navigation
- `768px - 1199px`: Adaptive layout with collapsible elements
- `≥ 1200px`: Full desktop experience with all features

**Key Patterns:**
- Responsive grid systems with Tailwind utilities
- Progressive enhancement from mobile to desktop
- Touch-friendly interactions on mobile devices
- Adaptive navigation patterns

## ⚡ Performance Patterns

### Optimization Strategies

1. **Lazy Loading**: Components and routes loaded on demand
2. **Virtual Scrolling**: Large lists with react-window
3. **Optimistic Updates**: Immediate UI feedback
4. **Caching**: Strategic use of React Query cache
5. **Code Splitting**: Module-level bundle optimization

### Implementation Examples

**Lazy Loading:**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const SidebarContent = lazy(() => import('./SidebarContent'));
```

**Virtual Scrolling:**
```typescript
import { FixedSizeList as List } from 'react-window';
```

**Optimistic Updates:**
```typescript
const useOptimisticUpdate = <T>(updateFn: (data: T) => Promise<T>) => {
  // Immediate UI response with error fallback
};
```

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

**Built-in Accessibility:**
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (4.5:1 minimum)

**Implementation Patterns:**
- Focus management for modals and navigation
- Skip links for main content areas
- Accessible form validation and error messages
- Clear visual focus indicators

## 🧪 Testing Patterns

### Comprehensive Testing Strategy

**RBAC Testing:**
- Permission checks across all user roles
- Field visibility and editability validation
- Workflow action availability testing
- Widget access control verification

**Accessibility Testing:**
- Screen reader compatibility
- Keyboard navigation verification
- Color contrast validation
- Focus management testing

**Performance Testing:**
- Component rendering performance
- Large dataset handling
- Mobile device optimization
- Network condition testing

## 📖 Usage Guidelines

### Implementation Checklist

**Module Setup:**
- [ ] Directory structure following Next.js conventions
- [ ] TypeScript interfaces in `/types/index.ts`
- [ ] RBAC service with role definitions
- [ ] Base components (List, Detail, Form)
- [ ] Responsive layout patterns
- [ ] Accessibility attributes
- [ ] Lazy loading setup
- [ ] Error boundaries

**Quality Assurance:**
- [ ] WCAG 2.1 AA compliance verified
- [ ] Cross-browser compatibility tested
- [ ] Mobile responsiveness validated
- [ ] Performance optimization confirmed
- [ ] RBAC implementation tested across all roles

### Migration Guide

**For Existing Modules:**
1. Assessment of current implementation
2. Foundation setup with RBAC integration
3. Component migration to standardized patterns
4. Feature enhancement with new capabilities
5. Comprehensive testing and optimization

**For New Modules:**
1. Planning with RBAC requirements
2. Foundation setup with type definitions
3. List page implementation
4. Detail page implementation
5. Integration and testing
6. Documentation updates

## 🔗 Related Resources

### External Documentation
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal References
- `/app/(main)/procurement/purchase-requests/` - Reference implementation
- `/lib/types.ts` - Core type definitions
- `/components/ui/` - Base UI component library
- `/lib/utils/` - Utility functions and helpers

## 🚀 Getting Started

### Quick Start Guide

1. **Review the Design Guides**: Start with the PR UI Design Guide for component patterns
2. **Understand RBAC**: Study the RBAC Implementation Patterns for security integration
3. **Examine Reference Code**: Review the Purchase Request module implementation
4. **Plan Your Module**: Define user roles, workflows, and component requirements
5. **Implement Incrementally**: Start with list page, then detail page, then advanced features
6. **Test Thoroughly**: Validate across all user roles and accessibility requirements

### Support and Updates

This design system is based on the production implementation of the Purchase Request module and will be updated as new patterns emerge and existing patterns are refined.

For questions or contributions to the design system, reference the actual implementation in the Purchase Request module as the source of truth.

---

**Document Status**: Living documentation - updated with new patterns as they are proven in production