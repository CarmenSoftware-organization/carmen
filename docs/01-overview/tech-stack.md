# Carmen ERP - Technology Stack

> **Document Type:** Technical Reference
> **Audience:** Developers, DevOps, Technical Teams
> **Last Updated:** October 20, 2025
> **Version:** 1.0

---

## Overview

Carmen ERP is built using modern web technologies with a focus on performance, scalability, and developer experience. The stack combines proven frameworks with cutting-edge tools to deliver a robust hospitality management system.

---

## Frontend Stack

### Core Framework
- **[Next.js 14](https://nextjs.org/)** `^14.2.15`
  - App Router for improved routing and layouts
  - React Server Components for optimal performance
  - Server Actions for type-safe mutations
  - Built-in optimization (images, fonts, scripts)
  - Streaming SSR with Suspense boundaries

### UI Framework & Language
- **[React 18](https://react.dev/)** `^18.x`
  - Concurrent rendering
  - Automatic batching
  - Transitions API
- **[TypeScript 5](https://www.typescriptlang.org/)** `^5.8.2`
  - Strict mode enabled
  - Path aliases configured (`@/` prefix)
  - Type-safe API and database access

### Styling & UI Components
- **[Tailwind CSS](https://tailwindcss.com/)** `^3.4.1`
  - Utility-first CSS framework
  - Custom design system configuration
  - JIT compilation for optimal bundle size

- **[Shadcn/ui](https://ui.shadcn.com/)** `^2.1.6`
  - Accessible component library built on Radix UI
  - Customizable components
  - Copy-paste component architecture

- **[Radix UI](https://www.radix-ui.com/)** (multiple packages)
  - Unstyled, accessible UI primitives
  - WAI-ARIA compliant components
  - Keyboard navigation support
  - Focus management

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** `^5.0.1`
  - Global state management
  - Minimal boilerplate
  - TypeScript support
  - React hooks integration

- **[TanStack Query (React Query)](https://tanstack.com/query)** `^5.59.15`
  - Server state management
  - Caching and synchronization
  - Automatic refetching
  - Optimistic updates
  - Infinite queries

### Form Management
- **[React Hook Form](https://react-hook-form.com/)** `^7.50.0`
  - Performant form validation
  - Minimal re-renders
  - TypeScript support
  - Integration with Zod

- **[Zod](https://zod.dev/)** `^3.25.76`
  - TypeScript-first schema validation
  - Composable validators
  - Type inference
  - Error formatting

### Data Visualization
- **[Recharts](https://recharts.org/)** `^2.15.4`
  - Composable charting library
  - Built on React and D3
  - Responsive charts
  - Customizable themes

### Icons & Assets
- **[Lucide React](https://lucide.dev/)** `^0.439.0`
  - Modern icon library
  - Tree-shakeable
  - Consistent design
- **[Heroicons](https://heroicons.com/)** `^2.2.0`
  - Tailwind CSS icon set

### Utilities
- **[Date-fns](https://date-fns.org/)** `^3.6.0`
  - Modern date utility library
  - Modular and tree-shakeable
  - TypeScript support
- **[class-variance-authority](https://cva.style/docs)** `^0.7.1`
  - CSS-in-TS variant management
- **[clsx](https://github.com/lukeed/clsx)** `^2.1.1` + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** `^2.5.2`
  - Conditional className utilities

---

## Backend Stack

### Runtime & Framework
- **[Node.js](https://nodejs.org/)** `v20.14.0`
  - LTS version for stability
  - ES modules support

- **[Next.js API Routes & Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** `^14.2.15`
  - Server-side API endpoints
  - Type-safe server actions
  - Middleware support
  - Edge runtime compatibility

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** `16.x`
  - Primary relational database
  - ACID compliance
  - Advanced features (JSON, full-text search)

- **[Prisma](https://www.prisma.io/)** `^5.22.0`
  - Modern TypeScript ORM
  - Type-safe database access
  - Schema migrations
  - Prisma Studio for data visualization
  - Connection pooling
  - Query optimization

- **[Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)** `^5.22.0`
  - Auto-generated type-safe database client
  - Relations and nested queries
  - Transactions support

### Authentication
- **[NextAuth.js](https://next-auth.js.org/)** `^4.24.11`
  - Authentication for Next.js
  - Multiple providers support
  - JWT and database sessions
  - Role-based access control integration

### File Processing
- **[jsPDF](https://github.com/parallax/jsPDF)** `^3.0.1`
  - PDF generation
- **[jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)** `^5.0.2`
  - Table plugin for jsPDF
- **[XLSX](https://sheetjs.com/)** `^0.18.5`
  - Excel file processing
  - Import/export spreadsheets

---

## Development Tools

### Build & Tooling
- **[Webpack](https://webpack.js.org/)** (via Next.js)
  - Module bundling
  - Code splitting
  - Tree shaking
  - Asset optimization

- **[PostCSS](https://postcss.org/)** `^8.x`
  - CSS transformation
  - Autoprefixer
  - Tailwind CSS processing

### Testing
- **[Vitest](https://vitest.dev/)** `^3.2.4`
  - Unit testing framework
  - Vite-powered test runner
  - Jest-compatible API
  - TypeScript support
  - Watch mode

- **[@vitest/ui](https://vitest.dev/guide/ui.html)** `^3.2.4`
  - Visual test runner interface

- **[Playwright](https://playwright.dev/)** `^1.54.2`
  - End-to-end testing
  - Cross-browser testing
  - API testing
  - Visual regression testing

### Code Quality
- **[ESLint](https://eslint.org/)** `^8.57.0`
  - Code linting
  - Style enforcement
  - Custom rules

- **[@typescript-eslint](https://typescript-eslint.io/)** `^7.2.0`
  - TypeScript-specific linting

- **[Depcheck](https://github.com/depcheck/depcheck)** `^1.4.7`
  - Dependency analysis
  - Unused dependency detection

- **[ts-prune](https://github.com/nadeesha/ts-prune)** `^0.10.3`
  - Dead code detection
  - Unused export identification

### Development Utilities
- **[ts-node](https://typestrong.org/ts-node/)** `^10.9.1`
  - TypeScript execution
  - Script running

- **[Nodemon](https://nodemon.io/)**
  - Auto-restart on file changes
  - Development workflow automation

---

## DevOps & Infrastructure

### Database Tools
- **[Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli)** `^5.22.0`
  - Schema management
  - Migration generation
  - Database introspection

- **[Prisma Studio](https://www.prisma.io/studio)**
  - Visual database browser
  - Data editing interface

### Environment Management
- **[dotenv](https://github.com/motdotla/dotenv)** `^16.4.5`
  - Environment variable management
  - Configuration separation

### Version Control
- **[Git](https://git-scm.com/)**
  - Source control
  - Branch management
  - Collaborative development

---

## Architecture Patterns

### Design Patterns
- **Server Components + Client Components**
  - Hybrid rendering for optimal performance
  - Server-side data fetching with type safety

- **Repository Pattern**
  - Data access layer abstraction
  - Business logic separation

- **Service Layer**
  - Business logic encapsulation
  - Reusable business operations

### Code Organization
- **Feature-based Structure**
  - Modules organized by business domain
  - Clear separation of concerns

- **Barrel Exports**
  - Centralized exports from modules
  - Simplified import paths

### State Management Strategy
- **Server State:** TanStack Query for API data
- **Global UI State:** Zustand for app-wide state
- **Local Component State:** useState/useReducer for component-specific state
- **Form State:** React Hook Form for form management

---

## Performance Optimizations

### Frontend
- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js Image component with WebP support
- **Font Optimization:** Next.js Font with variable fonts
- **Bundle Analysis:** @next/bundle-analyzer for size optimization
- **Tree Shaking:** Automatic dead code elimination

### Backend
- **Database Connection Pooling:** Prisma connection pooling
- **Query Optimization:** Prisma optimized queries
- **Caching:** React Query caching strategies
- **Streaming:** Server-side streaming with Suspense

---

## Security Features

### Application Security
- **Authentication:** NextAuth.js with secure sessions
- **Authorization:** Role-based access control (RBAC)
- **Attribute-based Access Control (ABAC):** Policy-based permissions
- **Input Validation:** Zod schema validation
- **SQL Injection Protection:** Prisma parameterized queries
- **XSS Protection:** React automatic escaping

### Data Security
- **Password Hashing:** bcrypt or equivalent
- **HTTPS:** Enforced secure connections
- **Environment Variables:** Sensitive data protection
- **CORS:** Cross-origin resource sharing controls

---

## Deployment Stack

### Hosting Options
- **Vercel** (Recommended)
  - Native Next.js support
  - Automatic deployments
  - Edge functions
  - Preview deployments

- **Docker**
  - Containerization support
  - Self-hosted deployments
  - Environment isolation

### Database Hosting
- **Supabase** (Recommended)
  - Managed PostgreSQL
  - Built-in backups
  - Connection pooling
  - Auto-scaling

- **Neon** / **Railway** / **PlanetScale**
  - Alternative managed database options

---

## Browser Support

### Target Browsers
- **Modern Browsers:** Last 2 versions
  - Chrome/Edge (Chromium)
  - Firefox
  - Safari

### Minimum Versions
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Version Matrix

| Component | Current Version | Update Frequency |
|-----------|----------------|------------------|
| Next.js | 14.2.15 | Major: Yearly, Minor: Quarterly |
| React | 18.x | Major: Yearly, Minor: As needed |
| TypeScript | 5.8.2 | Minor: Monthly, Major: Yearly |
| Prisma | 5.22.0 | Minor: Monthly |
| Node.js | 20.14.0 LTS | LTS updates every 6 months |
| PostgreSQL | 16.x | Major: Yearly |

---

## Development Requirements

### Minimum System Requirements
- **Node.js:** v20.14.0 or higher
- **npm:** v10.7.0 or higher
- **Memory:** 8GB RAM minimum
- **Storage:** 2GB available disk space

### Recommended Setup
- **OS:** macOS, Linux, or Windows with WSL2
- **Editor:** VS Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - TypeScript and JavaScript Language Features

---

## Related Documentation

- [System Architecture](../02-architecture/system-architecture.md) - Architecture overview
- [Development Guide](../07-development/) - Development setup and guidelines
- [Data Model](../03-data-model/) - Database schema and structure
- [API Reference](../06-api-reference/) - API documentation
