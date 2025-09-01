# List Screen Size Guide

**Visual Language Standard for All List Screens**

This guide establishes the consistent sizing and spacing standards for all list/table screens in the Carmen ERP system, based on the optimized Categories page implementation.

---

## 🎯 Core Principles

### **Compact Density Philosophy**
- **Information Density**: Maximize visible data while maintaining readability
- **Consistent Sizing**: All interactive elements use harmonious size relationships
- **Responsive Design**: Maintain usability across all device sizes
- **Accessibility**: Adequate touch targets and contrast while being compact

---

## 📏 Size Standards

### **Typography Scale**

| Element | Size Class | Pixel Size | Usage |
|---------|------------|------------|--------|
| **Page Title** | `text-2xl` | 24px | Main page heading |
| **Page Subtitle** | `text-sm` | 14px | Page description |
| **Section Headings** | `text-lg` | 18px | Modal/section titles |
| **Table Headers** | `text-xs` | 12px | Column headers |
| **Table Content** | `text-xs` | 12px | Cell content |
| **Button Text** | `text-xs` | 12px | All button labels |
| **Form Labels** | `text-sm` | 14px | Form field labels |
| **Helper Text** | `text-xs` | 12px | Descriptions and hints |

### **Component Heights**

| Component | Height Class | Pixel Size | Usage |
|-----------|--------------|------------|--------|
| **Primary Buttons** | `h-8` | 32px | Action buttons (Create, Import, etc.) |
| **Filter Buttons** | `h-8` | 32px | Quick filters, toggles |
| **Search Input** | `h-8` | 32px | Search fields |
| **Form Inputs** | `h-9` | 36px | Modal form inputs (slightly larger for usability) |
| **Table Rows** | `py-2` | ~28px | Row padding creates compact rows |
| **Action Buttons** | `h-6 w-6` | 24x24px | Dropdown triggers, expand/collapse |
| **Icon Buttons** | `h-6 w-6` | 24x24px | Small utility buttons |

### **Icon Sizes**

| Context | Size Class | Pixel Size | Usage |
|---------|------------|------------|--------|
| **Button Icons** | `h-3 w-3` | 12x12px | Icons within buttons |
| **Search Icons** | `h-3 w-3` | 12x12px | Input field icons |
| **Action Icons** | `h-3 w-3` | 12x12px | Dropdown menu icons |
| **Expand Icons** | `h-3 w-3` | 12x12px | Tree view expand/collapse |
| **Status Icons** | `h-3 w-3` | 12x12px | Status indicators |

### **Spacing System**

| Element | Spacing Class | Pixel Size | Usage |
|---------|---------------|------------|--------|
| **Page Sections** | `space-y-8` | 32px | Between major page sections |
| **Component Groups** | `space-y-6` | 24px | Between related component groups |
| **Form Sections** | `space-y-5` | 20px | Between form sections in modals |
| **Form Fields** | `space-y-2` | 8px | Between individual form fields |
| **Button Groups** | `gap-2` | 8px | Between buttons in groups |
| **Filter Row** | `gap-4` | 16px | Between search and filters |

### **Padding Standards**

| Component | Padding Class | Pixel Size | Usage |
|-----------|---------------|------------|--------|
| **Large Buttons** | `px-3` | 12px horizontal | Primary action buttons |
| **Small Buttons** | `px-2` | 8px horizontal | Filter and utility buttons |
| **Search Input** | `pl-7` | 28px left | Space for search icon |
| **Table Cells** | `py-2` | 8px vertical | Compact row height |
| **Modal Content** | `space-y-5` | 20px vertical | Modal section spacing |
| **Form Grids** | `gap-4` | 16px | Between form fields in grids |

---

## 🎨 Visual Components

### **Header Pattern**
```jsx
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
  <div className="space-y-2">
    <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Page description
    </p>
  </div>
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" className="h-8 px-3 text-xs">
      <FileUp className="h-3 w-3 mr-1" />
      Import
    </Button>
    <Button className="h-8 px-3 text-xs font-medium">
      <Plus className="h-3 w-3 mr-1" />
      New Item
    </Button>
  </div>
</div>
```

### **Search and Filter Row**
```jsx
<div className="flex flex-col sm:flex-row sm:justify-between gap-4">
  <div className="relative flex-1 sm:flex-initial sm:w-80">
    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
    <Input
      placeholder="Search items..."
      className="pl-7 h-8 text-xs"
    />
  </div>
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
      Filter Option
    </Button>
    {/* View Toggle - positioned at far right */}
    <div className="flex items-center border rounded-md ml-auto">
      <Button variant="default" size="sm" className="h-8 px-2 rounded-r-none border-0">
        <List className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 rounded-l-none border-0">
        <LayoutGrid className="h-3 w-3" />
      </Button>
    </div>
  </div>
</div>
```

### **Table Structure**
```jsx
<Table>
  <TableHeader>
    <TableRow className="bg-muted/30">
      <TableHead className="font-semibold text-xs py-2">Column Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="py-2 text-xs">Content</TableCell>
      <TableCell className="py-2">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### **Status Badges**
```jsx
<Badge 
  variant="default" 
  className="text-xs px-2 py-0.5 bg-green-100 text-green-800"
>
  Active
</Badge>
```

### **Dropdown Menu Items**
```jsx
<DropdownMenuItem onClick={handleAction}>
  <Icon className="mr-2 h-3 w-3" />
  <span className="text-xs">Action Name</span>
</DropdownMenuItem>
```

---

## 📱 Responsive Behavior

### **Breakpoint Strategy**
- **Mobile First**: Start with mobile layout, enhance for larger screens
- **Flexible Grids**: Use responsive grid classes (sm:grid-cols-2, lg:grid-cols-3)
- **Progressive Enhancement**: Add features/columns as screen size increases

### **Component Adaptation**
| Screen Size | Behavior |
|-------------|----------|
| **Mobile (<640px)** | Single column layout, stacked filters, simplified table |
| **Tablet (640-1024px)** | Two column grids, condensed filter row |
| **Desktop (>1024px)** | Full feature display, all table columns visible |

---

## 🎛️ Interactive Elements

### **Touch Targets**
- **Minimum Size**: 24x24px (h-6 w-6) for accessibility
- **Comfortable Size**: 32px (h-8) for primary interactions
- **Spacing**: Minimum 8px between clickable elements

### **Hover States**
- **Tables**: `hover:bg-muted/30` for row highlighting
- **Buttons**: Default shadcn/ui hover states
- **Cards**: Subtle shadow elevation on hover

---

## 🔧 Implementation Checklist

### **For Any List Screen:**

#### **Header Section:**
- [ ] Page title uses `text-2xl font-bold`
- [ ] Subtitle uses `text-sm text-muted-foreground`
- [ ] Action buttons use `h-8 px-3 text-xs`
- [ ] Icons use `h-3 w-3 mr-1`

#### **Search and Filters:**
- [ ] Search input uses `h-8 text-xs pl-7`
- [ ] Search icon uses `h-3 w-3 left-2`
- [ ] Filter buttons use `h-8 px-2 text-xs`
- [ ] View toggle positioned with `ml-auto`
- [ ] Container uses `sm:justify-between`

#### **Table/List:**
- [ ] Headers use `text-xs py-2 font-semibold`
- [ ] Cells use `text-xs py-2`
- [ ] Action buttons use `h-6 w-6`
- [ ] Icons throughout use `h-3 w-3`
- [ ] Dropdown text uses `text-xs`

#### **Modal Forms:**
- [ ] Titles use `text-2xl font-semibold`
- [ ] Form inputs use `h-9 text-sm`
- [ ] Labels use `text-sm font-medium`
- [ ] Buttons use `h-9 size="sm"`
- [ ] Section spacing uses `space-y-5`

#### **Responsive Design:**
- [ ] Mobile-first approach implemented
- [ ] Proper breakpoint classes applied
- [ ] Touch targets meet minimum 24px size
- [ ] Content adapts gracefully across screen sizes

---

## 🎨 Design Tokens Reference

### **Colors**
- Use semantic color tokens: `text-foreground`, `text-muted-foreground`, `bg-muted/30`
- Status colors: Green for active/success, appropriate variants for other states

### **Typography**
- Font family: System default (Inter/system-ui)
- Line heights: Maintain readability with `leading-relaxed` where needed
- Font weights: Regular, medium, semibold, bold as appropriate

### **Borders & Radii**
- Border radius: `rounded-md` for compact elements, `rounded-lg` for cards
- Border colors: Use `border-border` semantic token

---

## 📋 Examples in Carmen ERP

### **Implemented Screens:**
- ✅ **Recipe Categories** (`/operational-planning/recipe-management/categories`)
  - Perfect implementation of this size guide
  - List/card view toggle
  - Compact table with proper sizing

### **Recently Updated:**
- ✅ **Purchase Orders** (`/procurement/purchase-orders`)
  - Applied compact sizing standards to main page, data table, card view, and all filter components
  - Updated header layout, search/filter row, table styling, and pagination controls

### **To Be Updated:**
- 📋 Product Categories (`/product-management/categories`)
- 📋 Units Management (`/product-management/units`) 
- 📋 Vendor Management (`/vendor-management/vendors`)
- 📋 Purchase Requests (`/procurement/purchase-requests`)
- 📋 All other list/table screens

---

**This guide ensures consistent, compact, and professional list screens throughout the Carmen ERP system while maintaining excellent usability and accessibility.**