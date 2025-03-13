# Project Code Structure Documentation

## Overview
This document outlines the code structure and organization of the Carmen project, a Next.js application with TypeScript.

## Root Directory Structure

```
carmen/
├── app/                    # Next.js 13+ app directory (main application code)
├── components/             # Reusable React components
├── lib/                    # Shared libraries and utilities
├── public/                # Static assets
├── docs/                  # Documentation files
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── actions/               # Server actions
├── api/                   # API routes
├── data/                  # Data files and mock data
└── prompts/               # AI prompt templates

# Configuration Files
├── package.json           # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── postcss.config.mjs    # PostCSS configuration
└── components.json       # UI components configuration
```

## App Directory Structure
The app directory follows Next.js 13+ App Router structure:

```
app/
├── (auth)/               # Authentication-related pages
├── (main)/              # Main application pages
├── api/                 # API route handlers
├── components/          # App-specific components
├── data/               # Application data
├── fonts/              # Font files
├── lib/                # App-specific libraries
├── layout.tsx          # Root layout
├── page.tsx           # Root page
├── providers.tsx      # App providers
└── globals.css        # Global styles
```

## Components Directory
The components directory contains reusable UI components:

```
components/
├── ui/                 # Shadcn UI components
├── navigation/         # Navigation-related components
├── templates/         # Page templates
├── goods-receive/     # Goods receive related components
├── purchase-orders/   # Purchase order related components
└── [individual components].tsx
```

### Key Components
- `Sidebar.tsx`: Main navigation sidebar
- `carmen-header.tsx`: Main application header
- `user-dashboard.tsx`: User dashboard component
- `item-details.tsx`: Item details display component
- `item-details-edit-form.tsx`: Form for editing item details
- `vendor-comparison.tsx`: Vendor comparison functionality
- `category-management.tsx`: Category management interface

## Features and Modules

### Authentication
- Located in `app/(auth)`
- Handles user authentication and authorization

### Main Application
- Located in `app/(main)`
- Contains core application features:
  - Purchase Requests
  - Goods Receive
  - Purchase Orders
  - Vendor Management
  - Category Management

### UI Components
- Uses Shadcn UI components
- Custom components built on top of base UI components
- Responsive design using Tailwind CSS

### Data Management
- Server actions in `actions/` directory
- API routes in `api/` directory
- Data models and types in `lib/types`

## Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured
- Type definitions in `lib/types`

### Next.js
- App Router
- Server Components
- API Routes
- Middleware configuration

### Styling
- Tailwind CSS
- PostCSS
- Custom theme configuration

## Development Guidelines

### Component Organization
- Reusable components in `/components`
- Page-specific components co-located with pages
- Shared utilities in `/utils`
- Custom hooks in `/hooks`

### State Management
- React Context for global state
- Server Components for data fetching
- Custom hooks for local state

### API Structure
- API routes in `app/api`
- Server actions for form handling
- Type-safe API calls

### Asset Management
- Static assets in `public/`
- Fonts in `app/fonts/`
- Icons from Lucide React

## Best Practices

1. Use TypeScript for type safety
2. Implement server components where possible
3. Follow file naming conventions
4. Maintain modular component structure
5. Use proper error handling
6. Implement proper loading states
7. Follow accessibility guidelines
8. Optimize for performance

## Future Considerations

1. Module expansion capabilities
2. Scalability considerations
3. Performance optimization opportunities
4. Security enhancements
5. Testing implementation 