# Carmen ERP - Application Reference Document (ARD)

## Document Overview

**Document Type**: Application Reference Document  
**Version**: 1.0  
**Created**: January 2025  
**Purpose**: Comprehensive technical definitions and function specifications for all implemented features in Carmen ERP

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Dashboard & Analytics](#2-dashboard--analytics)
3. [Inventory Management](#3-inventory-management)
4. [Procurement Management](#4-procurement-management)
5. [Vendor Management](#5-vendor-management)
6. [Product Management](#6-product-management)
7. [Recipe Management](#7-recipe-management)
8. [Store Operations](#8-store-operations)
9. [System Administration](#9-system-administration)
10. [Finance Management](#10-finance-management)
11. [Reporting & Analytics](#11-reporting--analytics)
12. [Production Management](#12-production-management)

---

## 1. Authentication & User Management

### Core Feature: User Authentication System

#### Technical Definitions

**Authentication**: Multi-route authentication system supporting login, signup, and signin with business unit selection
**Session Management**: Client-side session handling with context persistence
**Role-Based Access Control (RBAC)**: Dynamic permission system with context switching

#### Function Specifications

##### Primary Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| AUTH-001 | `userLogin` | `/login` | User authentication | `credentials: LoginCredentials` | `AuthResult` |
| AUTH-002 | `userSignup` | `/signup` | User registration | `userData: UserRegistration` | `UserAccount` |
| AUTH-003 | `userSignin` | `/signin` | Alternative signin | `credentials: SigninCredentials` | `AuthResult` |
| AUTH-004 | `selectBusinessUnit` | `/select-business-unit` | Post-auth unit selection | `unitId: string` | `BusinessContext` |
| AUTH-005 | `switchRole` | N/A (Context) | Dynamic role switching | `roleId: UserRole` | `ContextUpdate` |
| AUTH-006 | `switchDepartment` | N/A (Context) | Department context change | `departmentId: string` | `ContextUpdate` |
| AUTH-007 | `switchLocation` | N/A (Context) | Location context change | `locationId: string` | `ContextUpdate` |

##### Supporting Functions

| Function ID | Function Name | Purpose | Input Parameters | Output |
|-------------|---------------|---------|------------------|--------|
| AUTH-S001 | `validateUserPermissions` | Permission checking | `userId: string, action: string` | `boolean` |
| AUTH-S002 | `getUserContext` | Current user context | `userId: string` | `UserContext` |
| AUTH-S003 | `updateUserProfile` | Profile modification | `userId: string, updates: UserUpdates` | `User` |

#### Type Definitions

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UserContext {
  user: User;
  currentRole: UserRole;
  currentDepartment: Department;
  currentLocation: Location;
  permissions: Permission[];
  priceVisibility: boolean;
}

type UserRole = 'staff' | 'department-manager' | 'financial-manager' | 
                'purchasing-staff' | 'counter' | 'chef';

interface Permission {
  module: string;
  actions: ('read' | 'write' | 'approve')[];
}
```

#### Data Models

**Primary Entities**:
- `User` - User profile and authentication data
- `Role` - Role definitions with permissions
- `Department` - Organizational units
- `Location` - Physical/logical locations
- `Permission` - Granular access rights

**File Locations**:
- Types: `lib/types/user.ts`
- Context: `lib/context/user-context.tsx`
- Mock Data: `lib/mock-data/users.ts`

---

## 2. Dashboard & Analytics

### Core Feature: Executive Dashboard

#### Technical Definitions

**Executive Dashboard**: Real-time performance metrics and KPI visualization
**Metric Cards**: Interactive cards displaying key business indicators
**Performance Charts**: Visual data representation with trend analysis

#### Function Specifications

##### Primary Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| DASH-001 | `getDashboardMetrics` | `/dashboard` | Load dashboard KPIs | `userId: string, dateRange: DateRange` | `DashboardMetrics` |
| DASH-002 | `getPerformanceCharts` | `/dashboard` | Chart data retrieval | `chartType: string, period: string` | `ChartData` |
| DASH-003 | `getActiveOrders` | `/dashboard` | Active order summary | `locationId?: string` | `OrderSummary[]` |
| DASH-004 | `getInventoryStatus` | `/dashboard` | Inventory overview | `locationId?: string` | `InventoryStatus` |
| DASH-005 | `getSupplierAnalytics` | `/dashboard` | Supplier performance | `dateRange: DateRange` | `SupplierMetrics` |

#### Type Definitions

```typescript
interface DashboardMetrics {
  totalOrders: MetricValue;
  activeSuppliers: MetricValue;
  inventoryValue: MetricValue;
  monthlySpend: MetricValue;
}

interface MetricValue {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
}
```

#### Component Architecture

**Primary Components**:
- `DashboardHeader` - Main dashboard header with filters
- `DashboardCards` - Metric card container
- `DashboardChart` - Chart visualization component
- `PerformanceMetrics` - Performance indicator display
- `InventoryStatus` - Stock level indicators

**File Locations**:
- Components: `app/(main)/dashboard/components/`
- Types: `lib/types/dashboard.ts`
- Mock Data: `lib/mock-data/dashboard.ts`

---

## 3. Inventory Management

### Core Feature: Stock Management System

#### Technical Definitions

**Stock Overview**: Real-time inventory monitoring across multiple locations
**Physical Count**: Systematic inventory counting with variance analysis
**Spot Check**: Random inventory verification process
**Fractional Inventory**: Portion-based inventory tracking for prepared foods

#### Function Specifications

##### Stock Overview Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| INV-001 | `getStockOverview` | `/inventory-management/stock-overview` | Stock summary | `locationId?: string, filters: StockFilters` | `StockItem[]` |
| INV-002 | `getStockCard` | `/inventory-management/stock-overview/stock-card` | Individual item detail | `itemId: string, locationId?: string` | `StockCard` |
| INV-003 | `getInventoryAging` | `/inventory-management/stock-overview/inventory-aging` | Aging analysis | `locationId?: string, ageThreshold: number` | `AgingReport` |
| INV-004 | `getInventoryBalance` | `/inventory-management/stock-overview/inventory-balance` | Balance report | `dateRange: DateRange, locationId?: string` | `BalanceReport` |
| INV-005 | `getSlowMovingItems` | `/inventory-management/stock-overview/slow-moving` | Slow movers analysis | `locationId?: string, threshold: number` | `SlowMovingItem[]` |

##### Physical Count Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PHY-001 | `createPhysicalCount` | `/inventory-management/physical-count/dashboard` | Create new count | `countData: PhysicalCountData` | `PhysicalCount` |
| PHY-002 | `executePhysicalCount` | `/inventory-management/physical-count/active/[id]` | Execute counting | `countId: string, items: CountItem[]` | `CountResult` |
| PHY-003 | `reviewPhysicalCount` | `/inventory-management/physical-count/active/[id]` | Review variances | `countId: string, approvals: Approval[]` | `ReviewResult` |
| PHY-004 | `finalizePhysicalCount` | `/inventory-management/physical-count/active/[id]` | Finalize count | `countId: string, adjustments: Adjustment[]` | `FinalizedCount` |

##### Spot Check Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| SPOT-001 | `createSpotCheck` | `/inventory-management/spot-check/new` | Create spot check | `spotCheckData: SpotCheckData` | `SpotCheck` |
| SPOT-002 | `executeSpotCheck` | `/inventory-management/spot-check/active/[id]` | Execute spot check | `spotCheckId: string, counts: SpotCount[]` | `SpotCheckResult` |
| SPOT-003 | `reviewSpotCheck` | `/inventory-management/spot-check/active/[id]` | Review results | `spotCheckId: string` | `SpotCheckReview` |
| SPOT-004 | `completeSpotCheck` | `/inventory-management/spot-check/completed/[id]` | Complete process | `spotCheckId: string, actions: Action[]` | `CompletedSpotCheck` |

##### Fractional Inventory Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| FRAC-001 | `getFractionalInventory` | `/inventory-management/fractional-inventory` | Fractional overview | `locationId?: string` | `FractionalItem[]` |
| FRAC-002 | `convertFractionalItem` | `/inventory-management/fractional-inventory` | Item conversion | `conversionData: ConversionData` | `ConversionResult` |
| FRAC-003 | `trackConversion` | `/inventory-management/fractional-inventory` | Track conversion | `conversionId: string` | `ConversionTracking` |

#### Type Definitions

```typescript
interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  unit: string;
  unitCost: Money;
  totalValue: Money;
  reorderLevel: number;
  safetyStock: number;
  lastUpdated: Date;
  location: Location;
}

interface PhysicalCount {
  id: string;
  countNumber: string;
  location: Location;
  status: PhysicalCountStatus;
  countDate: Date;
  items: CountItem[];
  variances: Variance[];
  totalVariance: Money;
}

type PhysicalCountStatus = 'planned' | 'in-progress' | 'review' | 'finalized' | 'cancelled';

interface FractionalItem {
  id: string;
  baseItemId: string;
  conversionRatio: number;
  portionSize: number;
  portionUnit: string;
  availablePortions: number;
  costPerPortion: Money;
}
```

#### Component Architecture

**Stock Overview Components**:
- `StockCardList` - Filterable stock card display
- `StockCardDetail` - Individual item detail view
- `QuickFilters` - Quick filtering interface
- `InventoryBalanceTable` - Balance report display

**Physical Count Components**:
- `PhysicalCountForm` - Count creation form
- `ActiveCountForm` - Counting interface
- `CountProgress` - Progress tracking
- `FinalReview` - Variance review interface

**File Locations**:
- Components: `app/(main)/inventory-management/`
- Types: `lib/types/inventory.ts`
- Mock Data: `lib/mock-data/inventory.ts`

---

## 4. Procurement Management

### Core Feature: Purchase-to-Pay Process

#### Technical Definitions

**Purchase Request (PR)**: Initial request for goods/services with approval workflow
**Purchase Order (PO)**: Formal order to vendor with terms and conditions
**Goods Received Note (GRN)**: Receipt confirmation with quality control
**Credit Note (CN)**: Adjustment document for returns and corrections

#### Function Specifications

##### Purchase Request Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PR-001 | `createPurchaseRequest` | `/procurement/purchase-requests/new-pr` | Create PR | `prData: PurchaseRequestData` | `PurchaseRequest` |
| PR-002 | `getPurchaseRequest` | `/procurement/purchase-requests/[id]` | Retrieve PR | `prId: string` | `PurchaseRequest` |
| PR-003 | `updatePurchaseRequest` | `/procurement/purchase-requests/[id]` | Update PR | `prId: string, updates: PRUpdates` | `PurchaseRequest` |
| PR-004 | `approvePurchaseRequest` | `/procurement/my-approvals` | Approve PR | `prId: string, approval: Approval` | `ApprovalResult` |
| PR-005 | `convertPRToPO` | `/procurement/purchase-orders/create/from-pr` | PR to PO conversion | `prId: string, vendorId: string` | `PurchaseOrder` |

##### Purchase Order Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PO-001 | `createPurchaseOrder` | `/procurement/purchase-orders/create` | Create PO | `poData: PurchaseOrderData` | `PurchaseOrder` |
| PO-002 | `getPurchaseOrder` | `/procurement/purchase-orders/[id]` | Retrieve PO | `poId: string` | `PurchaseOrder` |
| PO-003 | `updatePurchaseOrder` | `/procurement/purchase-orders/[id]/edit` | Update PO | `poId: string, updates: POUpdates` | `PurchaseOrder` |
| PO-004 | `createBulkPO` | `/procurement/purchase-orders/create/bulk` | Bulk PO creation | `bulkData: BulkPOData` | `PurchaseOrder[]` |

##### Goods Received Note Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| GRN-001 | `createGRN` | `/procurement/goods-received-note/new` | Create GRN | `grnData: GRNData` | `GoodsReceivedNote` |
| GRN-002 | `getGRN` | `/procurement/goods-received-note/[id]` | Retrieve GRN | `grnId: string` | `GoodsReceivedNote` |
| GRN-003 | `updateGRN` | `/procurement/goods-received-note/[id]/edit` | Update GRN | `grnId: string, updates: GRNUpdates` | `GoodsReceivedNote` |
| GRN-004 | `selectPOForGRN` | `/procurement/goods-received-note/new/po-selection` | PO selection | `poId: string` | `POSelectionResult` |
| GRN-005 | `manualGRNEntry` | `/procurement/goods-received-note/new/manual-entry` | Manual entry | `manualData: ManualGRNData` | `GoodsReceivedNote` |

##### Credit Note Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| CN-001 | `createCreditNote` | `/procurement/credit-note/new` | Create credit note | `cnData: CreditNoteData` | `CreditNote` |
| CN-002 | `getCreditNote` | `/procurement/credit-note/[id]` | Retrieve credit note | `cnId: string` | `CreditNote` |
| CN-003 | `processCreditNote` | `/procurement/credit-note/[id]` | Process credit note | `cnId: string, processing: CNProcessing` | `ProcessingResult` |

#### Type Definitions

```typescript
interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestDate: Date;
  requester: User;
  department: Department;
  priority: PRPriority;
  status: PRStatus;
  items: PRItem[];
  totalAmount: Money;
  approvals: Approval[];
  workflow: WorkflowStage[];
}

type PRPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
type PRStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: Vendor;
  orderDate: Date;
  deliveryDate: Date;
  status: POStatus;
  items: POItem[];
  terms: Terms;
  totalAmount: Money;
  currency: Currency;
}

interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  purchaseOrder: PurchaseOrder;
  receiptDate: Date;
  items: GRNItem[];
  discrepancies: Discrepancy[];
  qualityChecks: QualityCheck[];
  status: GRNStatus;
}
```

#### Component Architecture

**Purchase Request Components**:
- `PRForm` - Purchase request creation form
- `PRDetailPage` - Comprehensive PR management
- `WorkflowProgressTimeline` - Approval workflow display
- `VendorComparisonModal` - Vendor comparison interface

**Purchase Order Components**:
- `PODetailPage` - Comprehensive PO management
- `ModernPurchaseOrderList` - Enhanced PO listing
- `POItemForm` - Line item management
- `BulkPOCreation` - Bulk creation interface

**File Locations**:
- Components: `app/(main)/procurement/`
- Types: `lib/types/procurement.ts`
- Mock Data: `lib/mock-data/procurement.ts`

---

## 5. Vendor Management

### Core Feature: Vendor Lifecycle Management

#### Technical Definitions

**Vendor Profile**: Comprehensive vendor information including contacts, certifications, and banking
**Pricelist Management**: Version-controlled pricing with approval workflows
**Campaign Management**: Pricing request campaigns with vendor portal integration
**Template System**: Customizable Excel templates for price submissions

#### Function Specifications

##### Vendor Profile Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| VEN-001 | `createVendor` | `/vendor-management/vendors/new` | Create vendor | `vendorData: VendorData` | `Vendor` |
| VEN-002 | `getVendor` | `/vendor-management/vendors/[id]` | Retrieve vendor | `vendorId: string` | `Vendor` |
| VEN-003 | `updateVendor` | `/vendor-management/vendors/[id]/edit` | Update vendor | `vendorId: string, updates: VendorUpdates` | `Vendor` |
| VEN-004 | `getVendorPerformance` | `/vendor-management/vendors/[id]` | Performance metrics | `vendorId: string, period: string` | `VendorPerformance` |
| VEN-005 | `enhancedVendorCreate` | `/vendor-management/manage-vendors/new` | Enhanced creation | `enhancedData: EnhancedVendorData` | `Vendor` |

##### Pricelist Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PL-001 | `createPricelist` | `/vendor-management/pricelists/new` | Create pricelist | `pricelistData: PricelistData` | `Pricelist` |
| PL-002 | `getPricelist` | `/vendor-management/pricelists/[id]` | Retrieve pricelist | `pricelistId: string` | `Pricelist` |
| PL-003 | `updatePricelist` | `/vendor-management/pricelists/[id]/edit` | Update pricelist | `pricelistId: string, updates: PricelistUpdates` | `Pricelist` |
| PL-004 | `approvePricelist` | `/vendor-management/pricelists/[id]` | Approve pricelist | `pricelistId: string, approval: Approval` | `ApprovalResult` |
| PL-005 | `supersedePricelist` | `/vendor-management/pricelists/[id]` | Version control | `pricelistId: string, newVersion: PricelistData` | `Pricelist` |

##### Campaign Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| CAM-001 | `createCampaign` | `/vendor-management/campaigns/new` | Create campaign | `campaignData: CampaignData` | `Campaign` |
| CAM-002 | `getCampaign` | `/vendor-management/campaigns/[id]` | Retrieve campaign | `campaignId: string` | `Campaign` |
| CAM-003 | `launchCampaign` | `/vendor-management/campaigns/[id]` | Launch campaign | `campaignId: string` | `LaunchResult` |
| CAM-004 | `trackCampaignResponses` | `/vendor-management/campaigns/[id]` | Response tracking | `campaignId: string` | `CampaignMetrics` |

##### Template Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| TEM-001 | `createTemplate` | `/vendor-management/templates/new` | Create template | `templateData: TemplateData` | `Template` |
| TEM-002 | `getTemplate` | `/vendor-management/templates/[id]` | Retrieve template | `templateId: string` | `Template` |
| TEM-003 | `generateExcelTemplate` | `/vendor-management/templates/[id]` | Excel generation | `templateId: string, customization: CustomizationOptions` | `ExcelFile` |

#### Type Definitions

```typescript
interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  businessRegistration: BusinessRegistration;
  addresses: Address[];
  contacts: Contact[];
  certifications: Certification[];
  bankAccounts: BankAccount[];
  performanceRating: number;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

interface Pricelist {
  id: string;
  pricelistNumber: string;
  vendor: Vendor;
  version: number;
  effectiveDate: Date;
  expiryDate: Date;
  status: PricelistStatus;
  items: PricelistItem[];
  currency: Currency;
  approvals: Approval[];
  supersededBy?: string;
}

interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  products: Product[];
  vendors: Vendor[];
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  template: Template;
  responses: CampaignResponse[];
}
```

#### Component Architecture

**Vendor Profile Components**:
- `VendorForm` - Comprehensive vendor creation/editing
- `VendorCard` - Vendor summary display
- `BasicInfoTab` - Basic information section
- `ContactsTab` - Contact management
- `AddressesTab` - Address management
- `CertificationsSection` - Certification tracking

**Pricelist Components**:
- `PricelistProductEditingComponent` - Product price editing
- `StaffPricelistForm` - Staff pricelist management
- `PriceValidation` - Price validation utilities

**File Locations**:
- Components: `app/(main)/vendor-management/`
- Types: `lib/types/vendor.ts`
- Mock Data: `lib/mock-data/vendors.ts`

---

## 6. Product Management

### Core Feature: Product Catalog Management

#### Technical Definitions

**Product Catalog**: Centralized product master data with categories and specifications
**Unit Management**: Measurement units with conversion factors
**Category System**: Hierarchical product categorization
**Product Specifications**: Detailed product attributes and characteristics

#### Function Specifications

##### Product Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PRD-001 | `createProduct` | `/product-management/products` | Create product | `productData: ProductData` | `Product` |
| PRD-002 | `getProduct` | `/product-management/products/[id]` | Retrieve product | `productId: string` | `Product` |
| PRD-003 | `updateProduct` | `/product-management/products/[id]` | Update product | `productId: string, updates: ProductUpdates` | `Product` |
| PRD-004 | `searchProducts` | `/product-management/products` | Product search | `searchCriteria: ProductSearchCriteria` | `Product[]` |
| PRD-005 | `getProductPerformance` | `/product-management/products/[id]` | Performance analytics | `productId: string, period: string` | `ProductPerformance` |

##### Category Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| CAT-001 | `createCategory` | `/product-management/categories` | Create category | `categoryData: CategoryData` | `Category` |
| CAT-002 | `getCategories` | `/product-management/categories` | Retrieve categories | `parentId?: string` | `Category[]` |
| CAT-003 | `updateCategory` | `/product-management/categories` | Update category | `categoryId: string, updates: CategoryUpdates` | `Category` |

##### Unit Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| UNT-001 | `createUnit` | `/product-management/units` | Create unit | `unitData: UnitData` | `Unit` |
| UNT-002 | `getUnits` | `/product-management/units` | Retrieve units | `type?: string` | `Unit[]` |
| UNT-003 | `convertUnits` | `/product-management/units` | Unit conversion | `fromUnit: string, toUnit: string, quantity: number` | `ConversionResult` |

#### Type Definitions

```typescript
interface Product {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  category: Category;
  baseUnit: Unit;
  alternativeUnits: AlternativeUnit[];
  specifications: ProductSpecification[];
  nutritionalInfo?: NutritionalInfo;
  allergens: Allergen[];
  images: ProductImage[];
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

interface Category {
  id: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  parentCategory?: Category;
  subCategories: Category[];
  isActive: boolean;
}

interface Unit {
  id: string;
  unitCode: string;
  unitName: string;
  unitType: UnitType;
  baseUnit?: Unit;
  conversionFactor?: number;
  isActive: boolean;
}

type UnitType = 'weight' | 'volume' | 'length' | 'area' | 'count' | 'time';
```

#### Component Architecture

**Product Components**:
- `ProductList` - Searchable product listing
- `ProductForm` - Product creation/editing form
- `ProductInformation` - Product detail display
- `InventoryTab` - Inventory information
- `OrderUnitTab` - Unit management
- `IngredientsTab` - Recipe ingredients
- `LocationsTab` - Location assignments

**File Locations**:
- Components: `app/(main)/product-management/`
- Types: `lib/types/product.ts`
- Mock Data: `lib/mock-data/products.ts`

---

## 7. Recipe Management

### Core Feature: Recipe Lifecycle Management

#### Technical Definitions

**Recipe Management**: Recipe creation, costing, and version control
**Ingredient Management**: Recipe ingredients with yield calculations
**Cuisine Classification**: Recipe categorization by cuisine types
**Recipe Costing**: Automatic cost calculation based on ingredient prices

#### Function Specifications

##### Recipe Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| REC-001 | `createRecipe` | `/operational-planning/recipe-management/recipes/new` | Create recipe | `recipeData: RecipeData` | `Recipe` |
| REC-002 | `getRecipe` | `/operational-planning/recipe-management/recipes/[id]` | Retrieve recipe | `recipeId: string` | `Recipe` |
| REC-003 | `updateRecipe` | `/operational-planning/recipe-management/recipes/[id]/edit` | Update recipe | `recipeId: string, updates: RecipeUpdates` | `Recipe` |
| REC-004 | `calculateRecipeCost` | `/operational-planning/recipe-management/recipes/[id]` | Cost calculation | `recipeId: string, yield: number` | `CostCalculation` |
| REC-005 | `scaleRecipe` | `/operational-planning/recipe-management/recipes/[id]` | Recipe scaling | `recipeId: string, scaleFactor: number` | `ScaledRecipe` |

##### Cuisine Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| CUI-001 | `createCuisineType` | `/operational-planning/recipe-management/cuisine-types` | Create cuisine | `cuisineData: CuisineData` | `CuisineType` |
| CUI-002 | `getCuisineTypes` | `/operational-planning/recipe-management/cuisine-types` | Retrieve cuisines | N/A | `CuisineType[]` |

##### Category Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| RCA-001 | `createRecipeCategory` | `/operational-planning/recipe-management/categories` | Create category | `categoryData: RecipeCategoryData` | `RecipeCategory` |
| RCA-002 | `getRecipeCategories` | `/operational-planning/recipe-management/categories` | Retrieve categories | N/A | `RecipeCategory[]` |

#### Type Definitions

```typescript
interface Recipe {
  id: string;
  recipeCode: string;
  recipeName: string;
  description: string;
  category: RecipeCategory;
  cuisineType: CuisineType;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  yield: RecipeYield;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: DifficultyLevel;
  images: RecipeImage[];
  nutritionalInfo?: NutritionalInfo;
  cost: RecipeCost;
  version: number;
  status: RecipeStatus;
}

interface RecipeIngredient {
  id: string;
  product: Product;
  quantity: number;
  unit: Unit;
  preparation?: string;
  cost: Money;
  isOptional: boolean;
}

interface RecipeYield {
  quantity: number;
  unit: string;
  servings: number;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
type RecipeStatus = 'draft' | 'active' | 'archived' | 'pending-approval';
```

#### Component Architecture

**Recipe Components**:
- `RecipeForm` - Comprehensive recipe creation/editing
- `RecipeList` - Recipe browsing with filters
- `RecipeCard` - Recipe summary display
- `RecipeImage` - Recipe image management

**File Locations**:
- Components: `app/(main)/operational-planning/recipe-management/`
- Types: `lib/types/recipe.ts`
- Mock Data: `lib/mock-data/recipes.ts`

---

## 8. Store Operations

### Core Feature: Store Requisition Management

#### Technical Definitions

**Store Requisition**: Internal request for stock transfers between locations
**Wastage Reporting**: Tracking and reporting of inventory waste
**Stock Replenishment**: Automated and manual stock replenishment processes

#### Function Specifications

##### Store Requisition Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| SR-001 | `createStoreRequisition` | `/store-operations/store-requisitions` | Create requisition | `requisitionData: RequisitionData` | `StoreRequisition` |
| SR-002 | `getStoreRequisition` | `/store-operations/store-requisitions/[id]` | Retrieve requisition | `requisitionId: string` | `StoreRequisition` |
| SR-003 | `approveStoreRequisition` | `/store-operations/store-requisitions/[id]` | Approve requisition | `requisitionId: string, approval: Approval` | `ApprovalResult` |
| SR-004 | `fulfillStoreRequisition` | `/store-operations/store-requisitions/[id]` | Fulfill requisition | `requisitionId: string, fulfillment: Fulfillment` | `FulfillmentResult` |

##### Wastage Reporting Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| WAS-001 | `reportWastage` | `/store-operations/wastage-reporting` | Report waste | `wastageData: WastageData` | `WastageReport` |
| WAS-002 | `getWastageReports` | `/store-operations/wastage-reporting` | Retrieve reports | `filters: WastageFilters` | `WastageReport[]` |
| WAS-003 | `analyzeWastagePatterns` | `/store-operations/wastage-reporting` | Pattern analysis | `period: string, location?: string` | `WastageAnalysis` |

##### Stock Replenishment Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| REP-001 | `checkReplenishmentNeeds` | `/store-operations/stock-replenishment` | Check needs | `locationId: string` | `ReplenishmentNeeds` |
| REP-002 | `createReplenishmentOrder` | `/store-operations/stock-replenishment` | Create order | `replenishmentData: ReplenishmentData` | `ReplenishmentOrder` |

#### Type Definitions

```typescript
interface StoreRequisition {
  id: string;
  requisitionNumber: string;
  requestingStore: Location;
  supplyingStore: Location;
  requestDate: Date;
  requiredDate: Date;
  status: RequisitionStatus;
  items: RequisitionItem[];
  approvals: Approval[];
  fulfillment?: Fulfillment;
}

interface WastageReport {
  id: string;
  reportDate: Date;
  location: Location;
  items: WastageItem[];
  totalValue: Money;
  reasons: WastageReason[];
  reporter: User;
  approved: boolean;
}

interface WastageItem {
  product: Product;
  quantity: number;
  unit: Unit;
  value: Money;
  reason: WastageReason;
  batchNumber?: string;
  expiryDate?: Date;
}

type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'fulfilled' | 'cancelled';
type WastageReason = 'expired' | 'damaged' | 'contaminated' | 'overproduction' | 'other';
```

#### Component Architecture

**Store Operations Components**:
- `StoreRequisitionList` - Requisition listing and management
- `StoreRequisitionDetail` - Detailed requisition view
- `WastageReporting` - Wastage entry and reporting
- `StockReplenishment` - Replenishment management

**File Locations**:
- Components: `app/(main)/store-operations/`
- Types: `lib/types/store-operations.ts`
- Mock Data: `lib/mock-data/store-operations.ts`

---

## 9. System Administration

### Core Feature: System Configuration Management

#### Technical Definitions

**User Management**: User account lifecycle and permission management
**Location Management**: Location hierarchy and configuration
**Workflow Configuration**: Business process workflow definitions
**POS Integration**: Point-of-sale system data mapping and synchronization

#### Function Specifications

##### User Management Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| USR-001 | `createUser` | `/system-administration/user-management` | Create user | `userData: UserData` | `User` |
| USR-002 | `getUser` | `/system-administration/user-management/[id]` | Retrieve user | `userId: string` | `User` |
| USR-003 | `updateUser` | `/system-administration/user-management/[id]` | Update user | `userId: string, updates: UserUpdates` | `User` |
| USR-004 | `deactivateUser` | `/system-administration/user-management/[id]` | Deactivate user | `userId: string` | `DeactivationResult` |
| USR-005 | `assignUserRoles` | `/system-administration/user-management/[id]` | Assign roles | `userId: string, roles: Role[]` | `RoleAssignmentResult` |

##### Location Management Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| LOC-001 | `createLocation` | `/system-administration/location-management/new` | Create location | `locationData: LocationData` | `Location` |
| LOC-002 | `getLocation` | `/system-administration/location-management/[id]` | Retrieve location | `locationId: string` | `Location` |
| LOC-003 | `updateLocation` | `/system-administration/location-management/[id]/edit` | Update location | `locationId: string, updates: LocationUpdates` | `Location` |
| LOC-004 | `getLocationHierarchy` | `/system-administration/location-management` | Location tree | N/A | `LocationHierarchy` |

##### Workflow Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| WF-001 | `createWorkflow` | `/system-administration/workflow/workflow-configuration` | Create workflow | `workflowData: WorkflowData` | `Workflow` |
| WF-002 | `getWorkflow` | `/system-administration/workflow/workflow-configuration/[id]` | Retrieve workflow | `workflowId: string` | `Workflow` |
| WF-003 | `configureWorkflow` | `/system-administration/workflow/workflow-configuration/[id]` | Configure workflow | `workflowId: string, config: WorkflowConfig` | `Workflow` |
| WF-004 | `assignWorkflowRoles` | `/system-administration/workflow/role-assignment` | Assign roles | `workflowId: string, assignments: RoleAssignment[]` | `AssignmentResult` |

##### POS Integration Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| POS-001 | `mapPOSUnits` | `/system-administration/system-integrations/pos/mapping/units` | Map units | `mappingData: UnitMappingData` | `MappingResult` |
| POS-002 | `mapPOSRecipes` | `/system-administration/system-integrations/pos/mapping/recipes` | Map recipes | `mappingData: RecipeMappingData` | `MappingResult` |
| POS-003 | `mapPOSLocations` | `/system-administration/system-integrations/pos/mapping/locations` | Map locations | `mappingData: LocationMappingData` | `MappingResult` |
| POS-004 | `syncPOSData` | `/system-administration/system-integrations/pos/transactions` | Sync data | `syncParams: SyncParameters` | `SyncResult` |

#### Type Definitions

```typescript
interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  locationType: LocationType;
  parentLocation?: Location;
  address: Address;
  isActive: boolean;
  operatingHours: OperatingHours;
  manager: User;
  capacity?: number;
}

interface Workflow {
  id: string;
  workflowName: string;
  workflowType: WorkflowType;
  stages: WorkflowStage[];
  rules: WorkflowRule[];
  isActive: boolean;
  createdBy: User;
  createdAt: Date;
}

interface POSMapping {
  id: string;
  posSystemId: string;
  carmenSystemId: string;
  mappingType: MappingType;
  isActive: boolean;
  lastSynced: Date;
}

type LocationType = 'restaurant' | 'kitchen' | 'warehouse' | 'store' | 'office';
type WorkflowType = 'approval' | 'notification' | 'validation' | 'escalation';
type MappingType = 'unit' | 'product' | 'recipe' | 'location' | 'category';
```

#### Component Architecture

**User Management Components**:
- `UserFormDialog` - User creation/editing dialog
- `BulkActions` - Bulk user operations
- `UserDashboard` - User analytics

**Location Management Components**:
- `LocationDetailForm` - Location creation/editing
- `LocationList` - Location hierarchy display

**Workflow Components**:
- `WorkflowDetail` - Workflow configuration
- `WorkflowList` - Workflow management
- `RoleConfiguration` - Role assignment interface

**File Locations**:
- Components: `app/(main)/system-administration/`
- Types: `lib/types/system-administration.ts`
- Mock Data: `lib/mock-data/system-administration.ts`

---

## 10. Finance Management

### Core Feature: Financial Integration

#### Technical Definitions

**Account Code Mapping**: Chart of accounts integration
**Currency Management**: Multi-currency support with exchange rates
**Department Management**: Cost center and department tracking

#### Function Specifications

##### Account Management Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| ACC-001 | `mapAccountCodes` | `/finance/account-code-mapping` | Map accounts | `mappingData: AccountMappingData` | `AccountMapping` |
| ACC-002 | `getAccountMappings` | `/finance/account-code-mapping` | Retrieve mappings | N/A | `AccountMapping[]` |

##### Currency Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| CUR-001 | `createCurrency` | `/finance/currency-management` | Create currency | `currencyData: CurrencyData` | `Currency` |
| CUR-002 | `getCurrencies` | `/finance/currency-management` | Retrieve currencies | N/A | `Currency[]` |
| CUR-003 | `updateExchangeRates` | `/finance/exchange-rates` | Update rates | `rates: ExchangeRateData[]` | `ExchangeRate[]` |
| CUR-004 | `convertCurrency` | `/finance/exchange-rates` | Convert amount | `fromCurrency: string, toCurrency: string, amount: number` | `ConversionResult` |

##### Department Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| DEP-001 | `createDepartment` | `/finance/department-list` | Create department | `departmentData: DepartmentData` | `Department` |
| DEP-002 | `getDepartments` | `/finance/department-list` | Retrieve departments | N/A | `Department[]` |

#### Type Definitions

```typescript
interface Currency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

interface ExchangeRate {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  effectiveDate: Date;
  isActive: boolean;
}

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  manager: User;
  budget?: Money;
  isActive: boolean;
}
```

---

## 11. Reporting & Analytics

### Core Feature: Business Intelligence

#### Technical Definitions

**Consumption Analytics**: Usage pattern analysis and reporting
**Performance Dashboards**: Real-time operational metrics
**Compliance Reports**: Regulatory compliance tracking

#### Function Specifications

##### Analytics Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| ANA-001 | `getConsumptionAnalytics` | `/reporting-analytics/consumption-analytics` | Consumption data | `filters: AnalyticsFilters` | `ConsumptionAnalytics` |
| ANA-002 | `generateComplianceReport` | `/reporting-analytics/consumption-analytics` | Compliance report | `reportType: string, period: string` | `ComplianceReport` |
| ANA-003 | `getOperationalDashboard` | `/reporting-analytics/consumption-analytics` | Operational metrics | `locationId?: string` | `OperationalMetrics` |

#### Type Definitions

```typescript
interface ConsumptionAnalytics {
  period: DateRange;
  location?: Location;
  consumption: ConsumptionData[];
  trends: TrendAnalysis[];
  forecasts: ForecastData[];
}

interface ComplianceReport {
  reportType: string;
  generatedDate: Date;
  period: DateRange;
  complianceScore: number;
  violations: ComplianceViolation[];
  recommendations: Recommendation[];
}
```

---

## 12. Production Management

### Core Feature: Production Planning

#### Technical Definitions

**Production Planning**: Manufacturing schedule and resource allocation
**Bill of Materials**: Recipe execution for production orders

#### Function Specifications

##### Production Functions

| Function ID | Function Name | Route | Purpose | Input Parameters | Output |
|-------------|---------------|--------|---------|------------------|--------|
| PRO-001 | `createProductionOrder` | `/production` | Create order | `productionData: ProductionOrderData` | `ProductionOrder` |
| PRO-002 | `getProductionSchedule` | `/production` | Schedule overview | `dateRange: DateRange` | `ProductionSchedule` |

#### Type Definitions

```typescript
interface ProductionOrder {
  id: string;
  orderNumber: string;
  recipe: Recipe;
  quantity: number;
  scheduledDate: Date;
  status: ProductionStatus;
  ingredients: ProductionIngredient[];
}

type ProductionStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
```

---

## Technical Architecture Summary

### Type System Architecture

**Centralized Types** (`lib/types/`):
- Core business entities with comprehensive relationships
- Type guards for runtime validation
- Conversion utilities for data transformation
- Business rule validators

### Mock Data Architecture

**Factory Pattern** (`lib/mock-data/`):
- Type-safe data generation
- Realistic business scenarios
- Consistent relationships between entities
- Test data for development and QA

### Component Patterns

**Consistent Architecture**:
- List components with filtering and sorting
- Detail components with tabbed interfaces
- Form components with validation
- Modal dialogs for quick actions

### State Management

**Multi-layer State**:
- User context for authentication and permissions
- Zustand for global UI state
- React Query for server state simulation
- Local component state for UI interactions

### Testing Strategy

**Comprehensive Coverage**:
- 130+ route accessibility testing
- Component unit testing
- Type validation testing
- Mock data factory testing

---

This ARD serves as the definitive technical reference for all implemented features in the Carmen ERP system, providing AI agents and developers with detailed function specifications, type definitions, and architectural patterns for consistent development and maintenance.