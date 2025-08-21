# Carmen Directory Structure

## Root Level Structure
```
/Users/peak/Documents/GitHub/carmen/
├── app/                     # Next.js App Router application
├── components/              # Reusable UI components
├── lib/                     # Utilities, types, services
├── docs/                    # Comprehensive documentation
├── tests/                   # Test suites (e2e, integration, performance, security)
├── database/                # Database schemas and migrations
├── public/                  # Static assets and images
├── .kiro/                   # Project specifications and requirements
└── web-bundles/             # Agent configurations and team setups
```

## Key Application Structure (app/)
```
app/
├── (auth)/                  # Authentication routes
├── (main)/                  # Main application modules
│   ├── dashboard/
│   ├── procurement/
│   ├── inventory-management/
│   ├── vendor-management/   # COMPLETED - Full vendor lifecycle
│   ├── product-management/
│   ├── operational-planning/
│   ├── store-operations/
│   ├── finance/
│   ├── reporting-analytics/
│   └── system-administration/
└── api/                     # API routes and endpoints
```

## Components Structure
```
components/
├── ui/                      # Shadcn/ui base components (40+ components)
├── templates/               # Page templates (List, Detail, Form, Dialog)
├── Sidebar.tsx              # Main navigation component
└── [module-specific]/       # Module-specific components
```

## Documentation Structure
```
docs/
├── business-analysis/       # BA documents for all modules
├── purchase-request-management/
├── good-recive-note-managment/
├── inventory-adjustment/
├── product-management/
├── vendor-pricelist-management/
├── design/                  # System architecture and patterns
└── testing/    
```