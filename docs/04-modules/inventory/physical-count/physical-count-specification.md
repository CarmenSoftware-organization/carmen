# Physical Count Module - Complete Specification

## Overview

The Physical Count module is a comprehensive inventory management system designed for hospitality environments. It provides a structured workflow for conducting physical inventory counts with multi-step processes, location-based organization, and real-time progress tracking.

## Module Architecture

### Core Components
- **Physical Count Creation Wizard** - Multi-step form for setting up new counts
- **Physical Count Dashboard** - Overview and management interface
- **Active Count Interface** - Real-time counting execution
- **Physical Count Management** - Administrative management of counts

## Physical Count Creation Workflow

### Main Wizard Steps
The physical count creation follows a 4-step wizard pattern:

1. **Setup** - Basic information and configuration
2. **Location** - Select locations to include in count
3. **Items** - Review and configure items to count
4. **Review** - Final verification before starting count

### Step 1: Setup (`/physical-count` - Setup Component)

**Location**: `app/(main)/inventory-management/physical-count/components/setup.tsx`

**Purpose**: Capture basic information for the physical count

**Fields**:
- **Counter Name** (auto-filled from user context)
- **Department** (dropdown from mockDepartments)
- **Date & Time** (DateTimePicker component)
- **Notes** (optional text area)

**Validation**: Requires department and dateTime to proceed

**UI Elements**:
- Card layout with title "Physical Count Setup"
- Form fields with labels
- Auto-population of counter name
- Navigation buttons (Back/Next)

### Step 2: Location Selection (`/physical-count` - Location Component)

**Location**: `app/(main)/inventory-management/physical-count/components/location-selection.tsx`

**Purpose**: Allow users to select which locations to include in the physical count

**Features**:
- Multi-select location checkboxes
- Location details display
- Validation to ensure at least one location is selected

**UI Elements**:
- Checkbox list of available locations
- Location information cards
- Select all/none functionality

### Step 3: Item Review (`/physical-count` - Items Component)

**Location**: `app/(main)/inventory-management/physical-count/components/item-review.tsx`

**Purpose**: Review and configure items that will be included in the count

**Features**:
- Display items from selected locations
- Option to exclude specific items
- Item details and current stock levels

### Step 4: Final Review (`/physical-count` - Review Component)

**Location**: `app/(main)/inventory-management/physical-count/components/final-review.tsx`

**Purpose**: Final verification before starting the physical count

**Features**:
- Summary of all selections
- Confirmation before count creation
- Redirects to active count page upon completion

**Navigation**: Redirects to `/inventory-management/physical-count/active/${countId}`

## Physical Count Dashboard

**Location**: `app/(main)/inventory-management/physical-count/dashboard/page.tsx`

**Purpose**: Provides overview and management of all physical count activities

### Dashboard Components

#### Statistics Cards
- **Total Counts** - Overall count statistics
- **In Progress** - Currently active counts
- **Active Counters** - Number of people currently counting
- **Pending Review** - Counts requiring attention

#### Activity Chart
- Bar chart showing count activity over time
- Filterable by time period (Week/Month/Quarter/Year)
- Uses Recharts library for visualization

#### Recent Counts Panel
- List of recent counting activities
- Status indicators (In Progress/Completed)
- Variance information
- Counter assignments

#### All Counts Table
- Comprehensive table of all physical counts
- Implemented via CountsTable component
- Action buttons for scheduling and creating new counts

### Navigation Options
- **New Count** button → `/inventory-management/physical-count`
- **Schedule Count** button (placeholder functionality)

## Active Count Interface

**Location**: `app/(main)/inventory-management/physical-count/active/[id]/page.tsx`

**Purpose**: Real-time interface for conducting physical counts

### Interface Components

#### Count Header (Sticky)
- Count session information
- Start time and duration tracking
- Control buttons:
  - **Pause Count** - Temporarily pause the counting process
  - **Complete Count** - Finish and submit the count

#### Location Bar
- Horizontal tabs for switching between count locations
- Item count badges for each location
- Visual indication of current active location

#### Count Interface (Main)
- **Left Panel (2/3 width)**: Current location items
  - Item cards with system stock information
  - Physical count input fields
  - Status dropdown (Good/Damaged/Missing/Expired)
  - Individual save buttons per item

- **Right Panel (1/3 width)**: Progress tracking
  - Progress bar visualization
  - Completed vs remaining items counter
  - Count statistics

### Count Data Management
- State management for count entries
- Real-time progress calculation
- Location-based item filtering

## Physical Count Management

**Location**: `app/(main)/inventory-management/physical-count-management/page.tsx`

**Purpose**: Administrative interface for managing physical counts

### Management Features

#### View Options
- **List View** - Detailed list with full information
- **Grid View** - Card-based layout for quick overview

#### Filtering System
- **Status Filter**: All/Pending/In Progress/Completed
- **Department Filter**: Dropdown from departments
- **Location Filter**: Collapsible location selector with active filter display

#### Search Functionality
- Text search input (placeholder functionality)
- Real-time filtering of displayed counts

#### Count Operations
- **New Count** creation via modal form
- **Delete** functionality for count entries
- **Start Count** action launching count detail form

### Data Structure
```typescript
interface CountData {
  storeName: string
  department: string
  userName: string
  date: string
  status: "pending" | "completed" | "in-progress"
  itemCount: number
  lastCountDate: string
  variance: number
  notes: string
  completedCount: number
}
```

## Modal Components

### New Count Form Modal
**Component**: `NewCountForm`
**Location**: `app/(main)/inventory-management/physical-count-management/components/new-count-form.tsx`

**Purpose**: Create new physical count entries

**Fields**:
- Store Name
- Department
- Counter assignment
- Scheduled date
- Notes

### Count Detail Form Modal
**Component**: `CountDetailForm`
**Location**: `app/(main)/inventory-management/physical-count-management/components/count-detail-form.tsx`

**Purpose**: Manage detailed count execution and configuration

## Supporting Components

### Count List Item
**Component**: `CountListItem`
**Location**: `app/(main)/inventory-management/physical-count-management/components/count-list-item.tsx`

**Purpose**: List view representation of count entries

### Count Detail Card
**Component**: `CountDetailCard`
**Location**: `app/(main)/inventory-management/physical-count-management/components/count-detail-card.tsx`

**Purpose**: Grid view card representation of count entries

### Counts Table
**Component**: `CountsTable`
**Location**: `app/(main)/inventory-management/physical-count/dashboard/components/counts-table.tsx`

**Purpose**: Tabular display of all counts in dashboard

## API Integration

### Endpoints
- `GET /api/inventory/counts` - Retrieve physical counts with filtering
- `POST /api/inventory/counts` - Create new physical count
- `GET /api/inventory/counts/[id]` - Get specific count details
- `POST /api/inventory/counts/[id]/start` - Start physical count execution
- `POST /api/inventory/counts/advanced` - Advanced count operations

### Services
- `physicalCountService` - Database service for physical count operations
- Located in `lib/services/db/physical-count-service`

## Data Flow

### Count Creation Flow
1. User navigates to Physical Count creation wizard
2. Completes 4-step setup process
3. System validates and creates count session
4. Redirects to active count interface
5. User performs physical counting
6. System tracks progress and saves count data
7. Count completion triggers inventory adjustment workflows

### Count Management Flow
1. Administrative users access management interface
2. Filter and search existing counts
3. Create new counts via modal forms
4. Monitor count progress and status
5. Handle count completion and variance resolution

## State Management

### Local State (useState)
- Form data for wizard steps
- Current step tracking
- Modal visibility states
- Filter selections
- View preferences (list/grid)

### Data State
- Mock data integration for counts, locations, departments
- Real-time count updates
- Progress calculations

## Integration Points

### User Context
- Auto-population of counter names
- Department access based on user roles
- Permission-based feature access

### Inventory System
- Integration with inventory items and locations
- Stock level verification
- Variance calculation and reporting

### Reporting System
- Count completion data feeding into reports
- Variance analysis and trending
- Performance metrics and KPIs

## Navigation Structure

```
/inventory-management/
├── physical-count/                    # Count creation wizard
│   ├── dashboard/                    # Dashboard overview
│   └── active/[id]/                  # Active count interface
└── physical-count-management/        # Administrative management
    └── components/                   # Management components
```

## Technical Implementation

### Framework Integration
- **Next.js 14** App Router structure
- **TypeScript** for type safety
- **Shadcn/ui** component library
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Component Patterns
- Function-based React components
- Props interface definitions
- Controlled form components
- Modal overlay patterns
- Progressive wizard interfaces

### Data Validation
- Form validation at each wizard step
- Required field enforcement
- Data type validation
- Business rule validation

This specification provides a complete overview of the Physical Count module's functionality, components, and integration points within the larger inventory management system.