# Project Brief: Carmen

## Overview
Carmen is a modern F&B Management System built with Next.js 14, focusing on delivering a robust and user-friendly experience for food and beverage operations. The project utilizes the latest web technologies and follows best practices in software development to provide comprehensive modules for procurement, inventory management, store operations, and more.

## Core Requirements
1. Modern UI/UX with Shadcn UI components and Tailwind CSS
2. Type-safe development with TypeScript
3. Server-side rendering and optimized performance
4. Responsive design for all device sizes
5. Consistent pattern implementation across modules
6. Efficient state management with Zustand
7. Data fetching with TanStack React Query

## Project Goals
- Create a performant and scalable F&B management system
- Implement best practices for code organization and maintainability
- Ensure type safety throughout the application
- Provide excellent developer experience
- Deliver a polished user interface with consistent patterns
- Support comprehensive procurement and inventory workflows

## Technical Stack
- Next.js 14 with App Router
- TypeScript
- React 18
- Tailwind CSS
- Shadcn UI
- Zustand for state management
- TanStack React Query for data fetching
- TanStack Table for data display
- React Hook Form with Zod validation

## Project Scope
The project includes the following key modules:

### Procurement Module
- Purchase Requests management
- Purchase Orders processing
- Goods Received Notes
- Credit Notes
- Vendor management
- Approval workflows

### Inventory Management
- Stock overview
- Inventory transactions
- Physical count management
- Stock adjustments
- Period-end processing

### Store Operations
- Store requisitions
- Stock replenishment
- Wastage reporting

### Product Management
- Product catalog
- Categories and units
- Recipe management

### System Administration
- User management
- Workflow configuration
- Role assignments

## Established Patterns

### List-Detail Pattern
- List views with consistent sorting and filtering
- Detail views with tabbed interfaces
- Type-safe data handling with proper interfaces

### Component Architecture
- Separation of concerns with focused components
- Server-first approach with React Server Components
- Client components only when necessary
- Consistent styling with Tailwind CSS

### Data Handling
- Type-safe interfaces for all data structures
- Consistent sorting with SortConfig object pattern
- Advanced filtering with centralized patterns
- Memoized data processing for performance

## Success Criteria
1. Clean, maintainable codebase with consistent patterns
2. Type-safe implementation across all modules
3. Optimal performance with efficient data handling
4. Responsive design across devices
5. Comprehensive documentation
6. Efficient development workflow with reusable patterns 