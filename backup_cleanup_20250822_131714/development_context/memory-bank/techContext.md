# Technical Context

## Development Environment
- Node.js: v20.14.0
- npm: v10.7.0
- OS Support: Cross-platform (Windows, macOS, Linux)
- Development server: Next.js with hot reloading

## Core Technologies

### Frontend Framework
- Next.js: v14.2.24 with App Router
- React: v18.3.1
- React DOM: v18.3.1
- TypeScript: v5.8.2 with strict type checking

### UI Framework & Components
- Tailwind CSS: v3.4.17
- Shadcn UI: v2.3.0
- Radix UI (various components): v1.1.2 - v2.1.6
- Lucide React (icons): v0.439.0
- Framer Motion: v12.4.10
- class-variance-authority: v0.7.1
- clsx: v2.1.1
- tailwind-merge: v2.6.0
- tailwindcss-animate: v1.0.7

### Form Handling & Validation
- React Hook Form: v7.54.2
- Zod: v3.24.2
- @hookform/resolvers: v3.10.0

### Data Management & State
- Zustand: v5.0.3
- TanStack React Query: v5.67.2
- TanStack React Table: v8.21.2

### Date & Time
- date-fns: v3.6.0
- React Day Picker: v8.10.1

### UI Components & Utilities
- Sonner (toast notifications): v2.0.1
- cmdk (command menu): v1.0.4
- React Beautiful DnD: v13.1.1
- React DnD: v16.0.1
- UUID: v11.1.0

## Module-Specific Technologies

### Procurement Module
- Advanced filtering with custom filter builders
- Multi-step approval workflows
- Document status tracking
- Vendor and product selection interfaces
- Multi-currency support
- Tax calculation

### Inventory Management
- Barcode scanning integration
- Stock movement tracking
- Lot and batch tracking
- Expiry date management
- Stock level monitoring

## Development Tools

### Build Tools
- SWC (Speedy Web Compiler)
- PostCSS
- Autoprefixer

### Code Quality
- ESLint
- Prettier
- TypeScript strict mode
- husky for git hooks

### Development Server
- Next.js development server
- Hot Module Replacement
- Fast Refresh

## Technical Requirements

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support
- CSS Grid and Flexbox support
- Mobile device support (iOS Safari, Android Chrome)

### Performance Targets
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
- List rendering with 1000+ items: < 2s

### Security
- HTTPS required in production
- Content Security Policy
- XSS protection
- CSRF protection
- Role-based access control
- Data validation at all levels

## F&B-Specific Requirements

### Inventory Precision
- Quantity precision: 3 decimal places
- Cost precision: 2 decimal places
- Weight precision: 3 decimal places
- Exchange rates: 5 decimal places

### Business Rules
- Support for multiple units of measure with conversions
- VAT/tax calculation with multiple rates
- Multi-currency support with date-effective exchange rates
- Cost calculation methods (FIFO, weighted average, standard)
- Approval workflows with multiple stages

## Deployment

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Environment Variables
Required environment variables:
```
NODE_ENV=development|production
NEXT_PUBLIC_API_URL=
DATABASE_URL=
CURRENCY_API_KEY=
```

### Production Requirements
- Node.js v20.14.0 or higher
- 1GB RAM minimum
- SSL certificate
- Process manager (PM2 recommended)
- Database: PostgreSQL recommended

## Monitoring & Logging
- Error tracking
- Performance monitoring
- User analytics
- Server logs
- Inventory transaction audit trails

## Development Workflow
1. Feature branches
2. Pull request reviews
3. Automated testing
4. Continuous Integration
5. Staged deployments 