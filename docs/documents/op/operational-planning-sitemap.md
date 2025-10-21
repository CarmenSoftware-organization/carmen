# Operational Planning Module - Complete Sitemap

> **Module:** Operational Planning
> **Total Pages:** 25
> **Last Updated:** 2025-01-17

---

## Navigation Hierarchy

```
Operational Planning
├── Dashboard (Landing Page)
│   └── /operational-planning
│
├── Recipe Management
│   ├── /operational-planning/recipe-management
│   │
│   ├── Recipes
│   │   ├── /operational-planning/recipe-management/recipes
│   │   ├── /operational-planning/recipe-management/recipes/new
│   │   ├── /operational-planning/recipe-management/recipes/create
│   │   ├── /operational-planning/recipe-management/recipes/[id]
│   │   └── /operational-planning/recipe-management/recipes/[id]/edit
│   │
│   ├── Categories
│   │   └── /operational-planning/recipe-management/categories
│   │
│   └── Cuisine Types
│       └── /operational-planning/recipe-management/cuisine-types
│
└── Menu Engineering
    └── /operational-planning/menu-engineering
```

---

## Page Count by Sub-Module

| Sub-Module | Page Count | Status |
|------------|------------|--------|
| Dashboard | 1 | ✅ Complete |
| Recipe Management | 20 | ✅ Complete |
| Menu Engineering | 4 | ✅ Complete |
| **TOTAL** | **25** | **✅ Complete** |

---

## Detailed Page Descriptions

### Dashboard (1 page)

**Route:** `/operational-planning`

**Features:**
- Customizable drag-and-drop dashboard
- Demand forecast vs actual (Line chart)
- Menu performance metrics (Bar chart)
- Inventory planning status (Pie chart)
- Recipe updates widget
- Upcoming events widget
- Menu engineering insights

---

### Recipe Management (20 pages)

#### Recipes (5 pages)
1. **Recipe List** `/recipe-management/recipes` - Browse all recipes
2. **New Recipe (Legacy)** `/recipe-management/recipes/new` - Create recipe form (old)
3. **Create Recipe** `/recipe-management/recipes/create` - Create recipe form (new)
4. **Recipe Detail** `/recipe-management/recipes/[id]` - View recipe details
5. **Edit Recipe** `/recipe-management/recipes/[id]/edit` - Modify recipe

**Features:**
- Search and filter recipes
- Recipe cards with images
- Cost and margin calculations
- Ingredient management
- Preparation instructions
- Nutrition information
- Allergen tracking
- Recipe variations
- Print functionality

#### Recipe Categories (1 page)
1. **Categories List** `/recipe-management/categories` - Manage recipe categories

**Features:**
- Create, edit, delete categories
- Category hierarchy (parent-child)
- Color coding
- Category icons
- Recipe count per category

#### Cuisine Types (1 page)
1. **Cuisine Types** `/recipe-management/cuisine-types` - Manage cuisine classifications

**Features:**
- Add, edit cuisine types
- Cultural classification
- Region mapping
- Recipe association

---

### Menu Engineering (4 pages)

**Route:** `/operational-planning/menu-engineering`

**Main Tabs:**
1. **Performance Matrix** - Scatter plot analysis
2. **Portfolio Analysis** - Composition breakdown
3. **Recipe Details** - Individual recipe metrics
4. **Cost Alerts** - Alert management
5. **Data Import** - Sales data import

**Features:**
- **Performance Matrix**:
  - Stars (High popularity, High profitability)
  - Plow Horses (High popularity, Low profitability)
  - Puzzles (Low popularity, High profitability)
  - Dogs (Low popularity, Low profitability)
  - Interactive scatter chart
  - Quadrant analysis

- **Filters**:
  - Date range selection
  - Category filter
  - Location filter
  - Quick actions

- **Key Metrics**:
  - Total menu items
  - Total revenue with trends
  - Average contribution margin
  - Active cost alerts
  - Portfolio health score

- **Portfolio Analysis**:
  - Pie chart composition
  - Top performers ranking
  - Classification distribution
  - Recommendations

- **Cost Alerts**:
  - Alert creation and management
  - Cost variance tracking
  - Ingredient price changes
  - Threshold monitoring

- **Sales Data Import**:
  - POS integration
  - Manual upload
  - Data validation
  - Import history

---

## User Flows

### Common User Journeys

#### 1. Create New Recipe
```
/operational-planning
  → Recipe Management
    → /recipe-management/recipes
      → [Create Recipe]
        → Fill recipe details
          → Add ingredients
            → Set pricing
              → Save
```

#### 2. Analyze Menu Performance
```
/operational-planning
  → Menu Engineering
    → /menu-engineering
      → Performance Matrix tab
        → Filter by date/category
          → Click on recipe point
            → View detailed metrics
              → Review recommendations
```

#### 3. Import Sales Data
```
/operational-planning
  → Menu Engineering
    → /menu-engineering
      → Data Import tab
        → Upload POS data
          → Map fields
            → Validate
              → Process
                → View updated metrics
```

---

## Access Control

### Role-Based Access

| Feature | Chef | Kitchen Manager | GM | Staff |
|---------|------|----------------|----|----|-----|
| Recipe Management | Full | Full | Edit | View |
| Menu Engineering | View | Full | Full | None |
| Cost Analysis | None | Full | Full | None |
| Demand Forecast | None | View | Full | None |
| Recipe Cost | View | Edit | Edit | None |

---

## Technical Notes

### Dynamic Routes

- `[id]` - Recipe identifier
- `[subItem]` - Dynamic sub-navigation

### Components

**Recipe Management**:
- RecipeList - Main list view
- RecipeCardCompact - Condensed recipe cards
- RecipeCard - Full recipe cards
- RecipeForm - Create/edit form
- RecipeImage - Image handling
- CategoryList - Category management
- CuisineList - Cuisine type management

**Menu Engineering**:
- SalesDataImport - Sales data upload
- CostAlertManagement - Alert configuration
- RecipePerformanceMetrics - Detailed metrics

### Data Visualization

**Charts Used:**
- Scatter Chart - Performance matrix
- Pie Chart - Portfolio composition, inventory status
- Bar Chart - Menu performance comparison
- Line Chart - Demand forecast vs actual

### External Dependencies

```typescript
// Charting
import { Recharts } from 'recharts';

// Drag & Drop
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Date Handling
import { format } from 'date-fns';
```

---

## Menu Engineering Methodology

### Classification Algorithm

**Popularity Score:**
```typescript
popularityScore = (itemSales / totalSales) * 100
// Threshold: 50% (above = high, below = low)
```

**Profitability Score:**
```typescript
profitabilityScore = (itemMargin / averageMargin) * 100
// Threshold: 50% (above = high, below = low)
```

**Classification Matrix:**
```
                  High Popularity | Low Popularity
High Profitability    STAR       |    PUZZLE
Low Profitability   PLOW HORSE   |     DOG
```

### Recommendations by Classification

**Stars (25%):** Promote, maintain quality, monitor carefully
**Plow Horses (25%):** Increase price, reduce costs, reposition
**Puzzles (25%):** Increase marketing, reduce price, enhance appeal
**Dogs (25%):** Remove, reformulate, or replace

---

## Related Documentation

- [Recipe Management Feature Specification](./features/recipe-management/README.md)
- [Menu Engineering Feature Specification](./features/menu-engineering/README.md)
- [Inventory Management Module](../inventory/README.md)
- [Product Management Module](../product/README.md)

---

**Last Updated:** 2025-01-17
**Module Version:** 1.0.0
