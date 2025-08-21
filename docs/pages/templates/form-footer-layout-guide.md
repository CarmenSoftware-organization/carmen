# Form Footer Layout Guide

This guide provides standardized patterns for form footers in the Carmen ERP system, based on successful implementations in the PR (Purchase Request) detail forms.

## Overview

Form footers serve as the primary action zone for forms, providing users with consistent navigation, actions, and contextual information. The PR detail forms demonstrate sophisticated footer patterns including floating action menus, contextual buttons, and workflow-aware interfaces.

## Pattern Analysis from PR Detail Forms

### 1. Modern Transaction Summary Pattern
**Location**: `ModernTransactionSummary.tsx`

```tsx
interface ModernTransactionSummaryProps {
  subtotal: number
  discount: number
  netAmount: number
  tax: number
  totalAmount: number
  currency: string
  baseCurrency?: string
  exchangeRate?: number
  className?: string
}

export function ModernTransactionSummary({
  subtotal, discount, netAmount, tax, totalAmount, currency, baseCurrency, exchangeRate = 1, className
}: ModernTransactionSummaryProps) {
  const items = [
    {
      id: 'subtotal',
      label: 'Subtotal',
      amount: subtotal,
      icon: DollarSign,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    // ... other items
  ]

  return (
    <div className="space-y-4">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div className={cn("bg-white rounded-lg border-l-4 p-4 shadow-sm", item.borderColor)}>
            <div className="flex items-center gap-2">
              <item.icon className={item.iconColor} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Total Amount Card */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">Total Amount</div>
              <div className="text-sm text-gray-600">Final amount including all charges</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">{totalAmount.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
```

**Key Features**:
- Modern card-based layout with colored left borders
- Icon + label pattern for visual clarity  
- Responsive grid (4 cols desktop, 2 tablet, 1 mobile)
- Highlighted total amount section with blue background
- Consistent number formatting with locale support
- Dual currency support with base currency conversion
- Automatic display of exchange rate calculations

### 2. Header Action Bar Pattern
**Location**: `PRDetailPage.tsx:380-444`

```tsx
<div className="flex items-center gap-2 flex-wrap justify-end">
  {/* Mode-dependent buttons */}
  {mode === "view" ? (
    <Button onClick={() => handleModeChange("edit")} size="sm" className="h-9">
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </Button>
  ) : (
    <>
      <Button variant="default" onClick={handleSubmit} size="sm" className="h-9">
        <CheckCircle className="mr-2 h-4 w-4" />
        Save
      </Button>
      <Button variant="outline" onClick={handleCancel} size="sm" className="h-9">
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </>
  )}
  
  {/* Utility actions */}
  <Button variant="outline" size="sm" className="h-9">
    <PrinterIcon className="mr-2 h-4 w-4" />
    Print
  </Button>
  <Button variant="outline" size="sm" className="h-9">
    <DownloadIcon className="mr-2 h-4 w-4" />
    Export
  </Button>
  <Button variant="outline" size="sm" className="h-9">
    <ShareIcon className="mr-2 h-4 w-4" />
    Share
  </Button>
</div>
```

**Key Features**:
- Consistent button height (`h-9`)
- Icon + text pattern for clarity
- Mode-aware button display
- Responsive flex layout with wrap
- Right-aligned action group

### 2. Floating Action Menu Pattern
**Location**: `PRDetailPage.tsx:684-856`

```tsx
{/* Smart Floating Action Menu - Workflow Decision Based */}
{mode === "view" && user && workflowDecision && (
  <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
    {/* Workflow Summary Card */}
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border">
      <div className="text-xs text-muted-foreground mb-1">Items Status</div>
      <div className="text-sm font-medium">
        {WorkflowDecisionEngine.getWorkflowSummaryText(workflowDecision)}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {workflowDecision.reason}
      </div>
    </div>
    
    {/* Action Buttons Card */}
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 flex space-x-3 border">
      {/* Role-based button logic */}
      {renderWorkflowButtons(user, workflowDecision)}
    </div>
  </div>
)}
```

**Key Features**:
- Fixed positioning (`bottom-6 right-6`)
- High z-index for overlay (`z-50`)
- Contextual information card above actions
- Role-based action rendering
- Workflow state awareness
- Multiple card layout with spacing

### 3. Modal Footer Pattern
**Location**: `PRDetailPage.tsx:858-922`

```tsx
<DialogContent className="max-w-lg">
  <DialogHeader>
    <DialogTitle>Return Purchase Request - Select Destination</DialogTitle>
  </DialogHeader>
  
  {/* Modal Content */}
  <div className="space-y-4">
    {/* Step selection and content */}
  </div>
  
  {/* Modal Footer */}
  <div className="flex justify-end gap-2 pt-4 border-t">
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <Button 
      onClick={handleConfirm}
      disabled={!isValidSelection}
      className="bg-orange-600 hover:bg-orange-700"
    >
      Return to {selectedStep?.label || 'Selected Step'}
    </Button>
  </div>
</DialogContent>
```

**Key Features**:
- Border top separator (`border-t`)
- Right-aligned buttons with gap
- Primary/secondary button hierarchy
- Disabled state handling
- Dynamic button text
- Consistent padding (`pt-4`)

## Layout Structures

### 1. Modern Transaction Summary
```tsx
interface TransactionItem {
  id: string
  label: string
  amount: number
  currency: string
  icon: React.ComponentType<{ className?: string }>
  borderColor: string
  iconColor: string
}

export function ModernTransactionSummary({
  subtotal,
  discount,
  netAmount,
  tax,
  totalAmount,
  currency,
  className
}: ModernTransactionSummaryProps) {
  const items: TransactionItem[] = [
    {
      id: 'subtotal',
      label: 'Subtotal',
      amount: subtotal,
      currency,
      icon: DollarSign,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      id: 'discount',
      label: 'Discount',
      amount: discount,
      currency,
      icon: Percent,
      borderColor: 'border-l-green-500',
      iconColor: 'text-green-500'
    },
    {
      id: 'net',
      label: 'Net Amount',
      amount: netAmount,
      currency,
      icon: Receipt,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      id: 'tax',
      label: 'Tax',
      amount: tax,
      currency,
      icon: TrendingUp,
      borderColor: 'border-l-orange-500',
      iconColor: 'text-orange-500'
    }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className={cn("bg-white rounded-lg border-l-4 p-4 shadow-sm", item.borderColor)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <item.icon className={cn("h-4 w-4", item.iconColor)} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {item.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Card */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Total Amount</div>
              <div className="text-sm text-gray-600">Final amount including all charges</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {totalAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2. Standard Form Footer
```tsx
interface FormFooterProps {
  mode: 'view' | 'edit' | 'add'
  onSave?: () => void
  onCancel?: () => void
  onEdit?: () => void
  isLoading?: boolean
  hasChanges?: boolean
  className?: string
  children?: React.ReactNode
}

export function FormFooter({
  mode,
  onSave,
  onCancel,
  onEdit,
  isLoading = false,
  hasChanges = false,
  className = "",
  children
}: FormFooterProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-4 border-t bg-background",
      className
    )}>
      {/* Left side - optional content */}
      <div className="flex items-center gap-2">
        {children}
      </div>
      
      {/* Right side - primary actions */}
      <div className="flex items-center gap-2">
        {mode === "view" ? (
          <Button onClick={onEdit} size="sm" className="h-9">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={onCancel} 
              size="sm" 
              className="h-9"
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              size="sm" 
              className="h-9"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

### 2. Floating Action Menu
```tsx
interface FloatingActionMenuProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  actions: ActionItem[]
  summary?: {
    title: string
    description: string
    metadata?: string
  }
  visible: boolean
  className?: string
}

interface ActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function FloatingActionMenu({
  position = 'bottom-right',
  actions,
  summary,
  visible,
  className
}: FloatingActionMenuProps) {
  if (!visible) return null
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  }
  
  return (
    <div className={cn(
      "fixed flex flex-col space-y-3 z-50",
      positionClasses[position],
      className
    )}>
      {/* Summary Card (optional) */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-muted-foreground mb-1">{summary.title}</div>
          <div className="text-sm font-medium">{summary.description}</div>
          {summary.metadata && (
            <div className="text-xs text-muted-foreground mt-1">{summary.metadata}</div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 flex space-x-3 border border-gray-200 dark:border-gray-700">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            size="sm"
            className={cn("h-9", action.className)}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### 3. Modal Footer
```tsx
interface ModalFooterProps {
  primaryAction: {
    label: string
    onClick: () => void
    disabled?: boolean
    variant?: 'default' | 'destructive' | 'outline'
    className?: string
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  isLoading?: boolean
  className?: string
}

export function ModalFooter({
  primaryAction,
  secondaryAction,
  isLoading = false,
  className
}: ModalFooterProps) {
  return (
    <div className={cn("flex justify-end gap-2 pt-4 border-t", className)}>
      {secondaryAction && (
        <Button 
          variant="outline" 
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled || isLoading}
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button 
        variant={primaryAction.variant || 'default'}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled || isLoading}
        className={primaryAction.className}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {primaryAction.label}
      </Button>
    </div>
  )
}
```

## Styling Guidelines

### 1. Transaction Summary Styling
- **Card Borders**: Left border with 4px width (`border-l-4`)
- **Color Scheme**: Blue (subtotal/net), Green (discount), Orange (tax)
- **Grid Layout**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for responsiveness
- **Total Card**: Blue background (`bg-blue-50`) with blue border (`border-blue-200`)
- **Number Formatting**: Locale-aware with 2 decimal places
- **Icons**: Consistent 16px size (`h-4 w-4`) with matching colors

### 2. Consistent Button Styling
- **Standard Height**: `h-9` (36px) for all action buttons
- **Icon Spacing**: `mr-2 h-4 w-4` for button icons
- **Size Prop**: Use `size="sm"` for footer buttons
- **Gap**: `gap-2` for button groups, `space-x-3` for floating menus

### 2. Layout Spacing
- **Padding**: `p-4` for standard footers, `p-3` for compact summaries
- **Margins**: `space-y-3` for vertical floating menu spacing
- **Borders**: `border-t` for footer separators

### 3. Color Schemes
- **Primary Actions**: Default button variant with brand colors
- **Destructive Actions**: `variant="destructive"` or custom red (`bg-red-600 hover:bg-red-700`)
- **Secondary Actions**: `variant="outline"` for less prominent actions
- **Specialty Actions**: Custom colors like `bg-orange-600 hover:bg-orange-700` for return actions

### 4. Dark Mode Support
```tsx
// Standard card styling with dark mode
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  {/* Content */}
</div>

// Text color adjustments
<div className="text-muted-foreground"> {/* Auto adjusts for dark mode */}
```

### 5. Responsive Behavior
- **Flex Wrap**: `flex-wrap` for button groups that may overflow
- **Mobile Stacking**: Consider vertical layouts for mobile screens
- **Fixed Positioning**: Ensure floating menus don't interfere with content

## Best Practices

### 1. Button Hierarchy
- **Primary Action**: Most prominent, usually rightmost
- **Secondary Actions**: Outline or ghost variants
- **Destructive Actions**: Clear visual distinction
- **Utility Actions**: Grouped separately from primary workflow

### 2. State Management
- **Loading States**: Show spinners and disable interactions
- **Disabled States**: Clear visual indication with proper accessibility
- **Success States**: Brief confirmation feedback
- **Error States**: Clear error messaging with recovery options

### 3. Workflow Integration
- **Context Awareness**: Actions should reflect current workflow state
- **Role-based Display**: Show only relevant actions for user role
- **Progress Indication**: Show workflow progress when applicable
- **Confirmation Patterns**: Use modals for destructive or significant actions

### 4. Accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Tab order and keyboard shortcuts
- **Focus Management**: Clear focus indicators
- **High Contrast**: Ensure sufficient color contrast

### 5. Performance
- **Conditional Rendering**: Only render when necessary
- **Event Delegation**: Efficient event handling
- **Animation Performance**: Use CSS transforms for smooth animations
- **Memory Management**: Clean up event listeners and timeouts

## Usage Examples

### Modern Transaction Summary
```tsx
{/* Single Currency */}
<ModernTransactionSummary
  subtotal={14250.00}
  discount={712.50}
  netAmount={15750.00}
  tax={1212.50}
  totalAmount={15750.00}
  currency="USD"
/>

{/* Dual Currency with Exchange Rate */}
<ModernTransactionSummary
  subtotal={14250.00}
  discount={712.50}
  netAmount={15750.00}
  tax={1212.50}
  totalAmount={15750.00}
  currency="EUR"
  baseCurrency="USD"
  exchangeRate={1.08}
/>
```

### Integrated with Form Footer
```tsx
<Card>
  <CardHeader>
    <CardTitle>Transaction Summary (USD)</CardTitle>
  </CardHeader>
  <CardContent>
    <ModernTransactionSummary
      subtotal={formData.subTotalPrice || 0}
      discount={formData.discountAmount || 0}
      netAmount={formData.netAmount || 0}
      tax={formData.taxAmount || 0}
      totalAmount={formData.totalAmount || 0}
      currency={formData.currency || 'USD'}
      baseCurrency={formData.baseCurrency}
      exchangeRate={formData.exchangeRate || 1}
    />
  </CardContent>
</Card>

<FormFooter
  mode={mode}
  onSave={handleSave}
  onCancel={handleCancel}
  onEdit={handleEdit}
  hasChanges={hasChanges}
  isLoading={isLoading}
/>
```

### Standard Form Footer
```tsx
<FormFooter
  mode={mode}
  onSave={handleSave}
  onCancel={handleCancel}
  onEdit={() => setMode('edit')}
  hasChanges={isDirty}
  isLoading={isSubmitting}
>
  <span className="text-sm text-muted-foreground">
    Last saved: {lastSavedTime}
  </span>
</FormFooter>
```

### Workflow-Aware Floating Menu
```tsx
<FloatingActionMenu
  visible={showFloatingMenu}
  summary={{
    title: "Workflow Status",
    description: getWorkflowSummary(),
    metadata: workflowDecision?.reason
  }}
  actions={getWorkflowActions(userRole, workflowDecision)}
/>
```

### Modal Confirmation Footer
```tsx
<ModalFooter
  primaryAction={{
    label: "Confirm Delete",
    onClick: handleDelete,
    variant: "destructive",
    disabled: !confirmationText
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel
  }}
  isLoading={isDeleting}
/>
```

This layout guide provides the foundation for consistent, accessible, and user-friendly form footers throughout the Carmen ERP system.