# Item Row Layout Guide
**Based on PR Detail Item Tab Expanded Row Structure**

This guide provides comprehensive layout specifications, styling, structure, formats, and sizing for item rows in procurement modules.

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Main Row Structure](#main-row-structure)
3. [Expandable Sections](#expandable-sections)
4. [Component Specifications](#component-specifications)
5. [Responsive Design](#responsive-design)
6. [Implementation Examples](#implementation-examples)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 🏗️ Architecture Overview

### Three-Tier Structure
```
├── Tier 1: Compact Row (Always Visible)
│   ├── Checkbox + Status Badge
│   ├── Product Information
│   ├── Key Metrics (Quantities, Pricing)
│   └── Action Buttons
│
├── Tier 2: Quick Info Panel (Conditional)
│   ├── Comment/Notes
│   └── Inventory Metrics Row
│
└── Tier 3: Expandable Details (On Demand)
    ├── Vendor & Pricing Section
    ├── Inventory Information
    └── Business Dimensions
```

---

## 📦 Main Row Structure

### Container Specifications
```css
/* Main Row Container */
.item-row {
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* Spacing */
  padding: 12px 16px;
  gap: 12px;
  
  /* Styling */
  background: white;
  border: 1px solid rgb(229, 231, 235); /* border-gray-200 */
  border-radius: 8px;
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms;
}

.item-row:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: rgb(209, 213, 219); /* border-gray-300 */
}

.item-row.selected {
  border-color: rgb(59, 130, 246); /* border-blue-500 */
  background: rgb(239, 246, 255); /* bg-blue-50 */
}
```

### Layout Grid System
```
┌─────────────────────────────────────────────────────────────────────┐
│ [☑] [Product Info......] [Metrics.....] [Status] [Actions] [≫]     │
│  40   300-400px          400-600px      80px     120px     32px     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Specifications

### 1. Selection Checkbox
```typescript
<Checkbox
  checked={isSelected}
  onCheckedChange={onSelect}
  className="w-4 h-4"
  // Size: 16x16px
  // Position: Left-aligned, centered vertically
/>
```

### 2. Product Information Section
```css
.product-info {
  min-width: 300px;
  max-width: 400px;
  flex: 1;
}

.product-name {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: rgb(17, 24, 39); /* text-gray-900 */
  margin-bottom: 2px;
}

.product-description {
  font-size: 12px;
  line-height: 16px;
  color: rgb(107, 114, 128); /* text-gray-500 */
}
```

### 3. Metrics Section
```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(80px, 1fr));
  gap: 16px;
  align-items: center;
}

.metric-item {
  text-align: center;
  min-width: 80px;
}

.metric-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(107, 114, 128);
  margin-bottom: 2px;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
  color: rgb(17, 24, 39);
}
```

### 4. Status Badge
```css
.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Status Variants */
.status-approved { background: rgb(220, 252, 231); color: rgb(22, 101, 52); }
.status-pending { background: rgb(249, 250, 251); color: rgb(75, 85, 99); }
.status-rejected { background: rgb(254, 226, 226); color: rgb(153, 27, 27); }
.status-review { background: rgb(254, 240, 138); color: rgb(146, 64, 14); }
```

---

## 🔽 Expandable Sections

### Section 1: Vendor & Pricing Panel
```css
.vendor-pricing-panel {
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 8px;
  margin-top: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgb(249, 250, 251);
  border-bottom: 1px solid rgb(243, 244, 246);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(17, 24, 39);
}

.section-content {
  padding: 16px;
}

.vendor-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  font-size: 14px;
}
```

#### Vendor Information Grid Layout
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Vendor    │  Pricelist  │  Currency   │ Unit Price  │   Total     │
│             │             │             │             │             │
│ Company     │ PL-00121    │    BHT      │   125.50    │  2,510.00   │
│ Name Here   │    KTH      │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Financial Summary Layout
```css
.financial-summary {
  display: grid;
  grid-template-columns: 2fr 4fr;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: rgb(249, 250, 251);
  border-radius: 6px;
}

.financial-grid {
  display: grid;
  grid-template-columns: 2fr 4fr;
  gap: 8px;
  font-size: 14px;
}

.financial-row {
  display: contents;
}

.financial-label {
  color: rgb(75, 85, 99);
  text-align: right;
  font-weight: 500;
}

.financial-value {
  color: rgb(17, 24, 39);
  font-weight: 600;
  text-align: right;
}

/* Special highlighting */
.total-amount { color: rgb(22, 163, 74); font-weight: 700; }
.net-amount { color: rgb(37, 99, 235); font-weight: 600; }
```

### Section 2: Inventory Information Row
```css
.inventory-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 16px 0;
}

.inventory-card {
  background: rgb(249, 250, 251);
  border: 1px solid rgb(229, 231, 235);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  cursor: pointer;
  transition: background-color 150ms;
}

.inventory-card:hover {
  background: rgb(243, 244, 246);
}

.inventory-value {
  font-size: 14px;
  font-weight: 700;
  color: rgb(55, 65, 81);
  line-height: 1.2;
}

.inventory-label {
  font-size: 12px;
  font-weight: 500;
  color: rgb(107, 114, 128);
  margin-top: 2px;
}
```

#### Inventory Grid Layout
```
┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│ On Hand   │ On Order  │ Reorder   │ Restock   │ Delivery  │ Point     │
│           │           │  Level    │  Level    │   Date    │           │
│  125 kg   │   50 kg   │   20 kg   │  100 kg   │ 15/01/24  │ Kitchen   │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
```

### Section 3: Business Dimensions
```css
.business-dimensions {
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.dimension-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: rgb(55, 65, 81);
}

.field-value {
  font-size: 16px;
  font-weight: 500;
  color: rgb(17, 24, 39);
}
```

---

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile: < 640px */
@media (max-width: 639px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .vendor-grid { grid-template-columns: 1fr; }
  .inventory-row { grid-template-columns: repeat(3, 1fr); }
  .dimensions-grid { grid-template-columns: 1fr; }
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) and (max-width: 1023px) {
  .metrics-grid { grid-template-columns: repeat(4, 1fr); }
  .vendor-grid { grid-template-columns: repeat(3, 1fr); }
  .inventory-row { grid-template-columns: repeat(4, 1fr); }
  .dimensions-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: >= 1024px */
@media (min-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(6, 1fr); }
  .vendor-grid { grid-template-columns: repeat(5, 1fr); }
  .inventory-row { grid-template-columns: repeat(6, 1fr); }
  .dimensions-grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Mobile Card Layout
```css
.mobile-card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgb(229, 231, 235);
  margin-bottom: 12px;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.mobile-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  font-size: 14px;
}
```

---

## 🎨 Color System

### Status Colors
```css
:root {
  /* Success (Approved) */
  --status-approved-bg: rgb(220, 252, 231);
  --status-approved-text: rgb(22, 101, 52);
  --status-approved-border: rgb(187, 247, 208);
  
  /* Warning (Review) */
  --status-review-bg: rgb(254, 240, 138);
  --status-review-text: rgb(146, 64, 14);
  --status-review-border: rgb(251, 191, 36);
  
  /* Error (Rejected) */
  --status-rejected-bg: rgb(254, 226, 226);
  --status-rejected-text: rgb(153, 27, 27);
  --status-rejected-border: rgb(248, 113, 113);
  
  /* Neutral (Pending) */
  --status-pending-bg: rgb(249, 250, 251);
  --status-pending-text: rgb(75, 85, 99);
  --status-pending-border: rgb(209, 213, 219);
}
```

### Semantic Colors
```css
:root {
  /* Primary Actions */
  --primary-blue: rgb(37, 99, 235);
  --primary-blue-hover: rgb(29, 78, 216);
  
  /* Success States */
  --success-green: rgb(22, 163, 74);
  --success-green-light: rgb(220, 252, 231);
  
  /* Warning States */
  --warning-orange: rgb(234, 88, 12);
  --warning-orange-light: rgb(254, 240, 138);
  
  /* Neutral Elements */
  --neutral-gray: rgb(107, 114, 128);
  --neutral-light: rgb(249, 250, 251);
}
```

---

## ⚙️ Implementation Examples

### React Component Structure
```typescript
interface ItemRowProps {
  item: PurchaseRequestItem;
  isSelected: boolean;
  isExpanded: boolean;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  isSelected,
  isExpanded,
  canEdit,
  onSelect,
  onExpand,
  onUpdate,
}) => {
  return (
    <div className={`item-row ${isSelected ? 'selected' : ''}`}>
      {/* Tier 1: Main Row */}
      <div className="main-row">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.id)}
        />
        
        <div className="product-info">
          <h4 className="product-name">{item.name}</h4>
          <p className="product-description">{item.description}</p>
        </div>
        
        <div className="metrics-grid">
          <MetricDisplay label="Unit" value={item.unit} />
          <MetricDisplay label="Requested" value={item.quantityRequested} />
          <MetricDisplay label="Approved" value={item.quantityApproved} />
          <MetricDisplay label="Price" value={`$${item.price}`} />
          <MetricDisplay label="Total" value={`$${item.totalAmount}`} />
          <MetricDisplay label="Status" value={item.status} />
        </div>
        
        <StatusBadge status={item.status} />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExpand(item.id)}
        >
          <ChevronRight className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
      
      {/* Tier 3: Expandable Details */}
      {isExpanded && (
        <div className="expanded-details">
          <VendorPricingPanel item={item} canEdit={canEdit} />
          <InventoryInfoRow item={item} />
          <BusinessDimensionsPanel item={item} canEdit={canEdit} />
        </div>
      )}
    </div>
  );
};
```

### Tailwind CSS Classes Reference
```typescript
const styles = {
  // Main Container
  container: "flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200",
  selectedContainer: "ring-2 ring-blue-500 bg-blue-50",
  
  // Product Info
  productName: "text-sm font-semibold text-gray-900 leading-tight",
  productDesc: "text-xs text-gray-500 mt-0.5 line-clamp-2",
  
  // Metrics
  metricsGrid: "grid grid-cols-6 gap-4 items-center",
  metricItem: "text-center min-w-20",
  metricLabel: "text-xs uppercase tracking-wide text-gray-500 mb-1",
  metricValue: "text-sm font-medium text-gray-900",
  
  // Status Badges
  statusApproved: "bg-green-100 text-green-700 border-green-200",
  statusPending: "bg-gray-100 text-gray-600 border-gray-200",
  statusReview: "bg-yellow-100 text-yellow-700 border-yellow-200",
  statusRejected: "bg-red-100 text-red-600 border-red-200",
  
  // Expandable Sections
  sectionPanel: "bg-white rounded-lg border border-gray-200 mt-4",
  sectionHeader: "flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100",
  sectionTitle: "flex items-center gap-2 text-xs font-semibold text-gray-900",
  sectionContent: "p-4 space-y-3",
  
  // Inventory Row
  inventoryGrid: "grid grid-cols-6 gap-2",
  inventoryCard: "bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center cursor-pointer hover:bg-gray-100 transition-colors",
  inventoryValue: "text-sm font-bold text-gray-700",
  inventoryLabel: "text-xs text-gray-600 font-medium",
  
  // Business Dimensions
  dimensionsGrid: "grid grid-cols-4 gap-4",
  dimensionField: "space-y-2",
  fieldLabel: "text-sm font-medium text-gray-700",
  fieldValue: "text-base font-medium text-gray-900",
};
```

---

## 🚀 Performance Considerations

### Optimization Guidelines
1. **Virtualization**: Use virtual scrolling for large lists (>100 items)
2. **Lazy Loading**: Load expandable content on demand
3. **Memoization**: Memoize expensive calculations and component renders
4. **Debouncing**: Debounce search and filter operations
5. **Image Optimization**: Lazy load and optimize any product images

### Bundle Size Optimization
```typescript
// Use dynamic imports for heavy components
const VendorComparison = lazy(() => import('./VendorComparison'));
const BusinessDimensionsPanel = lazy(() => import('./BusinessDimensionsPanel'));

// Optimize icon imports
import { CheckCircle, Clock, RotateCcw, XCircle } from 'lucide-react';
```

---

## ✅ Accessibility Guidelines

### ARIA Labels and Roles
```typescript
<div
  role="row"
  aria-selected={isSelected}
  aria-expanded={isExpanded}
  tabIndex={0}
>
  <Checkbox
    aria-label={`Select ${item.name}`}
    checked={isSelected}
  />
  
  <button
    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${item.name}`}
    onClick={() => onExpand(item.id)}
  >
    <ChevronRight />
  </button>
</div>
```

### Keyboard Navigation
- `Tab/Shift+Tab`: Navigate between items
- `Space`: Toggle selection
- `Enter`: Expand/collapse details
- `Arrow Keys`: Navigate within expanded sections

---

## 📐 Sizing Guidelines

### Container Sizes
- **Minimum Height**: 64px (compact row)
- **Maximum Height**: 400px (fully expanded)
- **Minimum Width**: 320px (mobile)
- **Optimal Width**: 1200px+ (desktop)

### Component Dimensions
- **Checkbox**: 16x16px
- **Status Badge**: 20px height, auto width
- **Action Buttons**: 32x32px
- **Metric Cards**: 80px min-width
- **Section Headers**: 40px height

This comprehensive guide provides all the necessary specifications to implement consistent, responsive, and accessible item row layouts across procurement modules.