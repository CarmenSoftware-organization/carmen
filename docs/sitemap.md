# Carmen - Detailed Sitemap

## Application Structure

```
app/
├── (auth)/                  # Authentication routes
│   ├── layout.tsx          # Auth layout wrapper
│   ├── login/              # Login functionality
│   └── signup/             # User registration
│
├── (main)/                  # Main application routes
│   ├── layout.tsx          # Main layout with navigation
│   ├── dashboard/          # Main dashboard
│   ├── procurement/        # Procurement module
│   ├── product-management/ # Product management
│   ├── vendor-management/  # Vendor management
│   ├── store-operations/   # Store operations
│   ├── inventory-management/ # Inventory control
│   ├── operational-planning/ # Planning module
│   ├── recipe-management/  # Recipe management
│   ├── production/        # Production module
│   ├── reporting-analytics/ # Reports and analytics
│   ├── finance/          # Financial management
│   ├── system-administration/ # System settings
│   ├── help-support/     # Help and documentation
│   ├── edit-profile/     # User profile management
│   └── TEMPLATE/         # Template directory for new modules
│
├── api/                    # API routes
├── components/            # Shared UI components
├── data/                 # Data and mock files
├── fonts/                # Custom font files
├── lib/                  # Utility functions
├── testui/              # UI testing components
│
├── favicon.ico           # Site favicon
├── globals.css          # Global styles
├── layout.tsx           # Root layout
├── page.tsx             # Root page
└── providers.tsx        # App providers
```

## Route Groups

### Authentication (/(auth))
- `/login` - User authentication
- `/signup` - New user registration

### Main Application (/(main))

#### Dashboard
- `/dashboard` - Main application dashboard

#### Procurement
- Procurement management interface
- Purchase orders and requisitions

#### Product Management
- Product catalog
- Category management
- Product configuration

#### Vendor Management
- Vendor directory
- Vendor relationship management

#### Store Operations
- Store management
- Operational controls
- Store inventory

#### Inventory Management
- Stock control
- Inventory tracking
- Stock adjustments

#### Operational Planning
- Strategic planning tools
- Resource allocation

#### Recipe Management
- Recipe database
- Recipe configuration
- Ingredient management

#### Production
- Production planning
- Manufacturing controls
- Quality assurance

#### Reporting & Analytics
- Business intelligence
- Performance metrics
- Custom reports

#### Finance
- Financial management
- Accounting tools
- Budget controls

#### System Administration
- User management
- System configuration
- Security settings

#### Help & Support
- Documentation
- Support resources
- User guides

#### Profile Management
- `/edit-profile` - User profile settings

## Core Files

### Root Level
- `layout.tsx` - Root layout component
- `page.tsx` - Root page component
- `providers.tsx` - Application providers
- `globals.css` - Global styles

### Special Directories
- `/api` - Backend API routes
- `/components` - Reusable UI components
- `/data` - Data management
- `/lib` - Utility functions
- `/fonts` - Typography assets
- `/testui` - UI testing environment

## Technical Notes

1. Next.js App Router Structure
   - Route groups in parentheses (e.g., `(auth)`, `(main)`)
   - Layouts for different sections
   - API routes separation

2. Component Organization
   - Shared components in `/components`
   - Module-specific components within their routes
   - Testing components in `/testui`

3. Data Management
   - API routes in `/api`
   - Data utilities in `/data`
   - Helper functions in `/lib`

4. Asset Management
   - Fonts in `/fonts`
   - Styles in `globals.css`
   - Icons and images in `public/`

