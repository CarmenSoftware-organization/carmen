# UI Component Library Catalog

**Document Type**: Design System Documentation  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
**Purpose**: Complete UI component library for Carmen ERP recreation

---

## 🎨 Design System Overview

Carmen ERP utilizes a comprehensive design system built on **Shadcn/ui** components with **Tailwind CSS** styling. The system provides 50+ accessible, consistent components that form the foundation of the entire user interface.

### Design System Architecture
- **Base Framework**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Shadcn/ui component library (50+ components)
- **Customization**: Extended components for hospitality-specific needs
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Responsiveness**: Mobile-first design approach

---

## 📚 Component Inventory

### 🔧 Form Controls (15 Components)

#### Input Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Input** | `input.tsx` | Text input fields | Basic text entry, search fields |
| **Textarea** | `textarea.tsx` | Multi-line text input | Descriptions, comments, notes |
| **Select** | `select.tsx` | Dropdown selections | Single choice from options |
| **Checkbox** | `checkbox.tsx` | Boolean selections | Multi-select, toggles |
| **Radio Group** | `radio-group.tsx` | Exclusive selections | Single choice from set |
| **Switch** | `switch.tsx` | Toggle controls | Enable/disable features |

#### Advanced Input Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Date Picker** | `date-picker.tsx` | Single date selection | Due dates, timestamps |
| **Date Range Picker** | `date-picker-with-range.tsx` | Date range selection | Report periods, filters |
| **Date Time Picker** | `date-time-picker.tsx` | Date and time selection | Precise scheduling |
| **Slider** | `slider.tsx` | Numeric range input | Quantities, percentages |

#### Form Structure Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Form** | `form.tsx` | Form structure & validation | Structured data entry |
| **Label** | `label.tsx` | Field labels | Accessibility compliance |
| **Form Footer** | `form-footer.tsx` | Form actions | Save, cancel, submit |
| **Advanced Filter** | `advanced-filter.tsx` | Complex filtering | Data table filtering |
| **Step Indicator** | `step-indicator.tsx` | Multi-step processes | Wizards, workflows |

### 🏗️ Layout & Navigation (12 Components)

#### Container Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Card** | `card.tsx` | Content containers | Information grouping |
| **Accordion** | `accordion.tsx` | Collapsible content | FAQ, details |
| **Collapsible** | `collapsible.tsx` | Show/hide content | Advanced options |
| **Tabs** | `tabs.tsx` | Tabbed interfaces | Module sections |
| **Sheet** | `sheet.tsx` | Slide-out panels | Mobile navigation |
| **Sidebar** | `sidebar.tsx` | Main navigation | App navigation |

#### Navigation Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Breadcrumb** | `breadcrumb.tsx` | Navigation path | Location awareness |
| **Pagination** | `pagination.tsx` | Page navigation | Large datasets |
| **Separator** | `separator.tsx` | Visual separation | Content dividers |
| **Scroll Area** | `scroll-area.tsx` | Scrollable content | Long lists, content |

#### Utility Layout
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Aspect Ratio** | `aspect-ratio.tsx` | Image/video containers | Media display |
| **Progress** | `progress.tsx` | Progress indication | Loading, completion |

### 💬 Feedback & Display (10 Components)

#### Status Communication
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Alert** | `alert.tsx` | Important messages | Warnings, information |
| **Toast** | `toast.tsx` | Temporary notifications | Success, error feedback |
| **Toaster** | `toaster.tsx` | Toast container | System notifications |
| **Badge** | `badge.tsx` | Status indicators | Labels, counts |
| **Status Badge** | `status-badge.tsx` | Document status | Workflow states |
| **Custom Status Badge** | `custom-status-badge.tsx` | Enhanced status | Business-specific states |

#### Information Display
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Tooltip** | `tooltip.tsx` | Contextual help | Additional information |
| **Tooltip Provider** | `tooltip-provider.tsx` | Tooltip system | Global tooltip config |
| **Skeleton** | `skeleton.tsx` | Loading states | Content placeholders |
| **Chart** | `chart.tsx` | Data visualization | Business metrics |

### 🖱️ Interactive Elements (8 Components)

#### Core Interactions
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Button** | `button.tsx` | Actions and navigation | Primary interactions |
| **Icon Button** | `icon-button.tsx` | Icon-based actions | Compact interfaces |
| **Dialog** | `dialog.tsx` | Modal dialogs | Confirmations, forms |
| **Custom Dialog** | `custom-dialog.tsx` | Enhanced modals | Business workflows |
| **Alert Dialog** | `alert-dialog.tsx` | Confirmation dialogs | Destructive actions |

#### Advanced Interactions
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Dropdown Menu** | `dropdown-menu.tsx` | Context menus | Action lists |
| **Popover** | `popover.tsx` | Floating content | Additional options |
| **Command** | `command.tsx` | Command palette | Quick actions |

### 🎭 Specialized Components (5 Components)

#### Display Components
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Avatar** | `avatar.tsx` | User representation | Profile images |
| **Avatar with Fallback** | `avatar-with-fallback.tsx` | Enhanced avatars | User profiles |
| **Table** | `table.tsx` | Data tables | Structured data |
| **Calendar** | `calendar.tsx` | Date selection | Scheduling |

#### Business-Specific
| Component | File | Purpose | Usage |
|-----------|------|---------|-------|
| **Modern Transaction Summary** | `modern-transaction-summary.tsx` | Financial summaries | Transaction displays |

---

## 🎨 Design Token System

### Color Palette
Carmen ERP uses a sophisticated color system designed for hospitality environments:

#### Primary Colors
```css
:root {
  /* Primary Brand Colors */
  --primary: 220 14% 96%;          /* Main brand color */
  --primary-foreground: 220 9% 46%; /* Text on primary */
  
  /* Secondary Palette */
  --secondary: 220 14% 96%;         /* Secondary actions */
  --secondary-foreground: 220 9% 46%; /* Text on secondary */
  
  /* Accent Colors */
  --accent: 220 14% 96%;            /* Highlight elements */
  --accent-foreground: 220 9% 46%;  /* Text on accent */
}
```

#### Semantic Colors
```css
:root {
  /* Status Colors */
  --destructive: 0 84% 60%;         /* Error, danger */
  --destructive-foreground: 210 20% 98%; /* Text on destructive */
  
  /* Background System */
  --background: 0 0% 100%;          /* Main background */
  --foreground: 220 9% 46%;         /* Main text */
  --card: 0 0% 100%;                /* Card backgrounds */
  --card-foreground: 220 9% 46%;    /* Card text */
  
  /* Interactive Elements */
  --muted: 220 14% 96%;             /* Muted backgrounds */
  --muted-foreground: 220 9% 46%;   /* Muted text */
  --border: 220 13% 91%;            /* Borders */
  --input: 220 13% 91%;             /* Form inputs */
  --ring: 262 83% 58%;              /* Focus rings */
}
```

#### Status-Specific Colors
```css
/* Document Status Colors */
.status-draft { --badge-color: 43 74% 66%; }        /* Yellow */
.status-inprogress { --badge-color: 221 83% 53%; }  /* Blue */
.status-approved { --badge-color: 142 71% 45%; }    /* Green */
.status-rejected { --badge-color: 0 84% 60%; }      /* Red */
.status-void { --badge-color: 220 9% 46%; }         /* Gray */
```

### Typography System
```css
/* Font Families */
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;

/* Type Scale */
.text-xs { font-size: 0.75rem; }      /* 12px */
.text-sm { font-size: 0.875rem; }     /* 14px */
.text-base { font-size: 1rem; }       /* 16px */
.text-lg { font-size: 1.125rem; }     /* 18px */
.text-xl { font-size: 1.25rem; }      /* 20px */
.text-2xl { font-size: 1.5rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; }    /* 30px */
.text-4xl { font-size: 2.25rem; }     /* 36px */
```

### Spacing System
```css
/* Spacing Scale (8px base unit) */
.space-1 { margin: 0.25rem; }    /* 4px */
.space-2 { margin: 0.5rem; }     /* 8px */
.space-3 { margin: 0.75rem; }    /* 12px */
.space-4 { margin: 1rem; }       /* 16px */
.space-6 { margin: 1.5rem; }     /* 24px */
.space-8 { margin: 2rem; }       /* 32px */
.space-12 { margin: 3rem; }      /* 48px */
.space-16 { margin: 4rem; }      /* 64px */
```

### Border Radius System
```css
--radius: 0.5rem;                /* Default border radius */
--radius-sm: calc(var(--radius) - 2px);
--radius-md: var(--radius);
--radius-lg: calc(var(--radius) + 2px);
--radius-xl: calc(var(--radius) + 4px);
```

---

## 📱 Responsive Design System

### Breakpoint Strategy
```css
/* Mobile First Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (large laptops) */
2xl: 1536px /* 2X large devices (large monitors) */
```

### Component Responsiveness
| Component Category | Mobile Strategy | Tablet Strategy | Desktop Strategy |
|-------------------|-----------------|-----------------|------------------|
| **Forms** | Single column | Two column | Multi-column |
| **Tables** | Horizontal scroll | Responsive grid | Full table |
| **Navigation** | Hamburger menu | Collapsed sidebar | Full sidebar |
| **Cards** | Stacked | Grid 2-col | Grid 3-4 col |
| **Dialogs** | Full screen | Centered modal | Centered modal |

---

## ♿ Accessibility Implementation

### WCAG 2.1 AA Compliance
All components meet or exceed WCAG 2.1 AA standards:

#### Keyboard Navigation
- **Tab Order**: Logical keyboard navigation sequence
- **Focus Management**: Visible focus indicators on all interactive elements
- **Keyboard Shortcuts**: Standard keyboard shortcuts supported
- **Escape Handling**: Modal dismissal and context escape

#### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Dynamic content announcements
- **Role Attributes**: Clear element roles and purposes

#### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text
- **Color Independence**: Information not conveyed by color alone
- **Text Sizing**: Scalable text up to 200% without horizontal scrolling
- **Focus Indicators**: High contrast focus rings

### Accessibility Testing Checklist
- [ ] Keyboard-only navigation functional
- [ ] Screen reader compatibility verified
- [ ] Color contrast ratios meet standards
- [ ] Focus management implemented
- [ ] ARIA attributes properly used
- [ ] Semantic HTML structure correct

---

## 🔄 Component Usage Patterns

### Form Component Pattern
```tsx
// Standard form implementation pattern
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function ExampleForm() {
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Label</FormLabel>
            <FormControl>
              <Input placeholder="Enter value..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

### Data Display Pattern
```tsx
// Table with status badges pattern
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'

function DataTable({ data }: { data: any[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Navigation Pattern
```tsx
// Sidebar navigation pattern
import { Sidebar, SidebarContent, SidebarItem } from '@/components/ui/sidebar'

function Navigation() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarItem href="/dashboard" icon={Home}>
          Dashboard
        </SidebarItem>
        <SidebarItem href="/inventory" icon={Package}>
          Inventory
        </SidebarItem>
        <SidebarItem href="/procurement" icon={ShoppingCart}>
          Procurement
        </SidebarItem>
      </SidebarContent>
    </Sidebar>
  )
}
```

---

## 🔧 Component Customization

### Variant System
Each component supports multiple variants for different contexts:

#### Button Variants
```css
/* Button component variants */
.btn-default { /* Primary button styling */ }
.btn-destructive { /* Danger/delete actions */ }
.btn-outline { /* Secondary actions */ }
.btn-secondary { /* Tertiary actions */ }
.btn-ghost { /* Minimal styling */ }
.btn-link { /* Link appearance */ }
```

#### Size System
```css
/* Consistent sizing across components */
.size-sm { /* Small components */ }
.size-default { /* Standard size */ }
.size-lg { /* Large components */ }
.size-icon { /* Icon-only components */ }
```

### Theme Customization
```css
/* Custom theme variables can override defaults */
:root {
  --primary: YOUR_PRIMARY_COLOR;
  --secondary: YOUR_SECONDARY_COLOR;
  --accent: YOUR_ACCENT_COLOR;
  --radius: YOUR_BORDER_RADIUS;
}
```

---

## 📊 Component Performance

### Bundle Size Optimization
- **Tree Shaking**: Import only used components
- **Code Splitting**: Lazy load heavy components
- **CSS Optimization**: Purge unused styles
- **Icon Optimization**: SVG icons with optimal sizing

### Performance Metrics
| Component Category | Bundle Impact | Render Performance | Memory Usage |
|-------------------|---------------|-------------------|--------------|
| **Form Controls** | Low (2-5kb) | Fast | Minimal |
| **Layout Components** | Medium (5-10kb) | Fast | Low |
| **Data Tables** | High (10-15kb) | Moderate | Medium |
| **Charts** | High (15-25kb) | Slow | High |

---

## ✅ Component Implementation Checklist

### Core Components (Required)
- [ ] All form controls implemented and tested
- [ ] Layout and navigation components functional
- [ ] Feedback and status components working
- [ ] Interactive elements responsive
- [ ] Data display components optimized

### Design System (Required)
- [ ] Color palette implemented
- [ ] Typography system applied
- [ ] Spacing system consistent
- [ ] Responsive breakpoints configured
- [ ] Accessibility standards met

### Customization (Required)
- [ ] Component variants implemented
- [ ] Theme customization available
- [ ] Performance optimizations applied
- [ ] Bundle size optimized
- [ ] Documentation complete

---

**Next Steps**: Proceed to [Module Implementation Guides](../04-modules/) for business-specific component usage and patterns.

*This component catalog provides the complete design system foundation for recreating Carmen ERP with consistent, accessible, and performant UI components.*