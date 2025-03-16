# Static Analysis Report
Generated: 2025-03-13T05:44:25.046Z

## ESLint Analysis
```

> carmen@0.1.0 analyze:lint
> eslint . --ext .ts,.tsx


```

## TypeScript Type Checking
```

> carmen@0.1.0 analyze:types
> tsc --noEmit


```

## Dependency Analysis
```

> carmen@0.1.0 analyze:deps
> depcheck

Unused dependencies
* @radix-ui/react-focus-scope
* @tanstack/react-query
* add
* dotenv
* form
* framer-motion
* postgres
* shadcn
* sonner
Unused devDependencies
* @typescript-eslint/eslint-plugin
* @typescript-eslint/parser
* eslint-config-next
* postcss

```

## Dead Code Analysis
```

> carmen@0.1.0 analyze:dead
> ts-prune

middleware.ts:4 - middleware
middleware.ts:11 - config
tailwind.config.ts:92 - default
components/BulkActions.tsx:9 - BulkActions
components/button.tsx:35 - ButtonProps (used in module)
components/button.tsx:55 - Button (used in module)
components/button.tsx:55 - buttonVariants (used in module)
components/card.tsx:78 - Card (used in module)
components/card.tsx:78 - CardHeader (used in module)
components/card.tsx:78 - CardFooter (used in module)
components/card.tsx:78 - CardTitle (used in module)
components/card.tsx:78 - CardDescription (used in module)
components/card.tsx:78 - CardContent (used in module)
components/carmen-header.tsx:17 - CarmenHeader
components/category-management.tsx:209 - CategoryManagement
components/EditProfile.tsx:14 - default
components/goods-receive-note-table.tsx:44 - GoodsReceiveNoteTable
components/improved-goods-receive-note.tsx:42 - GoodsReceiveNoteComponent
components/input.tsx:4 - InputProps (used in module)
components/input.tsx:24 - Input (used in module)
components/item-details-edit-form.tsx:69 - ItemDetailsEditForm
components/item-details.tsx:27 - ItemDetailsComponent
components/pr-items-table.tsx:42 - PrItemsTable
components/pricing-form.tsx:35 - PricingFormComponent
components/select.tsx:4 - SelectProps (used in module)
components/select.tsx:28 - Select (used in module)
components/Sidebar.tsx:228 - Sidebar (used in module)
components/theme-provider.tsx:7 - ThemeProvider (used in module)
components/vendor-comparison.tsx:46 - VendorComparisonComponent
contexts/AuthContext.tsx:15 - AuthProvider
contexts/AuthContext.tsx:30 - useAuth
hooks/use-toast.ts:77 - reducer (used in module)
hooks/use-toast.ts:194 - toast (used in module)
lib/create-safe-action.ts:3 - FieldErrors (used in module)
lib/create-safe-action.ts:7 - ActionState (used in module)
lib/create-safe-action.ts:13 - createSafeAction
lib/mockData.ts:1 - CountItem (used in module)
lib/types.ts:14 - Money (used in module)
lib/types.ts:21 - Currency
lib/types.ts:29 - ExchangeRate
lib/types.ts:60 - CostingMethod
lib/types.ts:66 - InventoryTransaction
lib/types.ts:81 - TransactionType (used in module)
lib/types.ts:251 - PurchaseOrderLine
lib/types.ts:265 - POLineStatus (used in module)
lib/types.ts:272 - PurchaseRequest_1
lib/types.ts:416 - WorkflowStep (used in module)
lib/types.ts:521 - LocationInfo (used in module)
lib/types.ts:608 - JournalEntryTotal (used in module)
lib/types.ts:705 - ItemDetail (used in module)
lib/types.ts:769 - ActionState
lib/types.ts:788 - Budget (used in module)
lib/types.ts:794 - ApprovalHistoryItem (used in module)
lib/types.ts:801 - PurchaseRequest_3
lib/utils.ts:8 - formatNumber
lib/utils.ts:12 - formatCurrency
app/(main)/layout.tsx:3 - default
app/data/mock-recipes.ts:1 - Recipe (used in module)
app/data/mock-recipes.ts:16 - mockRecipes
app/lib/create-safe-action.ts:3 - FieldErrors (used in module)
app/lib/create-safe-action.ts:7 - ActionState (used in module)
app/lib/create-safe-action.ts:13 - createSafeAction
app/lib/history.ts:1 - HistoryEntry
app/lib/types.ts:1 - Address (used in module)
app/lib/types.ts:12 - Contact (used in module)
app/lib/types.ts:22 - EnvironmentalImpact (used in module)
app/lib/types.ts:30 - Certification (used in module)
app/lib/types.ts:38 - Vendor
app/lib/types.ts:53 - InventoryInfo (used in module)
app/lib/types.ts:65 - PurchaseRequestItem
components/navigation/config.ts:1 - mainNavItems
components/purchase-orders/ColumnSelectionScreen.tsx:22 - ColumnSelectionScreenProps (used in module)
components/purchase-orders/ExportContext.tsx:24 - ExportProvider
components/purchase-orders/ExportSidepanel.tsx:18 - ExportSidepanel
components/purchase-orders/PrintOptionsSidepanel.tsx:15 - PrintOptionsSidepanel
components/templates/DialogPageTemplate.tsx:75 - default
components/templates/FormPageTemplate.tsx:36 - default
components/ui/alert-dialog.tsx:131 - AlertDialogPortal (used in module)
components/ui/alert-dialog.tsx:132 - AlertDialogOverlay (used in module)
components/ui/alert-dialog.tsx:133 - AlertDialogTrigger (used in module)
components/ui/aspect-ratio.tsx:7 - AspectRatio (used in module)
components/ui/badge.tsx:26 - BadgeProps (used in module)
components/ui/badge.tsx:36 - badgeVariants (used in module)
components/ui/breadcrumb.tsx:113 - BreadcrumbEllipsis (used in module)
components/ui/calendar.tsx:10 - CalendarProps (used in module)
components/ui/command.tsx:143 - Command (used in module)
components/ui/command.tsx:144 - CommandDialog (used in module)
components/ui/command.tsx:145 - CommandInput (used in module)
components/ui/command.tsx:146 - CommandList (used in module)
components/ui/command.tsx:147 - CommandEmpty (used in module)
components/ui/command.tsx:148 - CommandGroup (used in module)
components/ui/command.tsx:149 - CommandItem (used in module)
components/ui/command.tsx:150 - CommandShortcut (used in module)
components/ui/command.tsx:151 - CommandSeparator (used in module)
components/ui/custom-dialog.tsx:114 - DialogPortal (used in module)
components/ui/custom-dialog.tsx:115 - DialogOverlay (used in module)
components/ui/date-picker.tsx:21 - DatePicker
components/ui/date-picker.tsx:14 - DatePickerProps (used in module)
components/ui/date-picker.tsx:54 - DateRangePickerProps (used in module)
components/ui/dialog.tsx:112 - DialogPortal (used in module)
components/ui/dialog.tsx:113 - DialogOverlay (used in module)
components/ui/dialog.tsx:115 - DialogClose (used in module)
components/ui/dropdown-menu.tsx:193 - DropdownMenuShortcut (used in module)
components/ui/dropdown-menu.tsx:195 - DropdownMenuPortal (used in module)
components/ui/dropdown-menu.tsx:196 - DropdownMenuSub (used in module)
components/ui/dropdown-menu.tsx:197 - DropdownMenuSubContent (used in module)
components/ui/dropdown-menu.tsx:198 - DropdownMenuSubTrigger (used in module)
components/ui/form.tsx:170 - useFormField (used in module)
components/ui/icon-button.tsx:11 - IconButton
components/ui/input.tsx:5 - InputProps (used in module)
components/ui/popover.tsx:33 - PopoverAnchor (used in module)
components/ui/select.tsx:161 - SelectSeparator (used in module)
components/ui/select.tsx:162 - SelectScrollUpButton (used in module)
components/ui/select.tsx:163 - SelectScrollDownButton (used in module)
components/ui/sheet.tsx:131 - SheetPortal (used in module)
components/ui/sheet.tsx:132 - SheetOverlay (used in module)
components/ui/slider.tsx:28 - Slider (used in module)
components/ui/table.tsx:115 - TableFooter (used in module)
components/ui/table.tsx:119 - TableCaption (used in module)
components/ui/textarea.tsx:5 - TextareaProps (used in module)
components/ui/toast.tsx:128 - ToastAction (used in module)
components/ui/toaster.tsx:13 - Toaster
components/ui/tooltip-provider.tsx:4 - TooltipProvider (used in module)
components/ui/tooltip-provider.tsx:12 - Tooltip
components/ui/tooltip-provider.tsx:12 - TooltipTrigger
components/ui/tooltip-provider.tsx:12 - TooltipContent
components/ui/use-toast copy.ts:77 - reducer (used in module)
components/ui/use-toast copy.ts:194 - useToast (used in module)
components/ui/use-toast copy.ts:194 - toast (used in module)
components/ui/use-toast.ts:77 - reducer (used in module)
components/ui/use-toast.ts:194 - useToast (used in module)
lib/api/goodsReceiveNote.ts:4 - getGoodsReceiveNoteById
lib/mock/credit-notes.ts:3 - mockCreditNotes
lib/mock/hotel-data.ts:35 - mockLocations (used in module)
lib/mock/hotel-data.ts:237 - generateProductsForLocation (used in module)
lib/mock/hotel-data.ts:284 - mockProducts (used in module)
lib/mock/hotel-data.ts:289 - getLocationsByType
lib/mock/hotel-data.ts:293 - getProductsByCategory
lib/mock/hotel-data.ts:297 - getProductsByLocation
lib/mock/hotel-data.ts:301 - getLowStockProducts
lib/mock/hotel-data.ts:305 - getNearExpiryProducts
lib/mock/inventory-data.ts:3 - Department (used in module)
lib/mock/inventory-data.ts:666 - getCountsByDepartment
lib/mock/inventory-data.ts:670 - getCountsByType
lib/mock/inventory-data.ts:674 - getLocationsByType
lib/mock/inventory-data.ts:688 - getProductsByCategory
lib/mock/inventory-data.ts:692 - getLowStockProducts
lib/mock/inventory-data.ts:696 - getProductsNeedingCount
lib/mock/mock_goodsReceiveNotes.tsx:3 - mockStockMovements (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:788 - mockJournalEntries (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:846 - mockFinancialSummary (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:873 - mockGoodsReceiveNote
lib/store/use-count-store.ts:5 - CountStatus (used in module)
lib/types/count-allocation.ts:3 - CountAllocation (used in module)
lib/types/count-allocation.ts:17 - CountSession
lib/types/count-allocation.ts:35 - AllocationGroup
lib/types/credit-note.ts:25 - CreditNoteStatus
lib/types/credit-note.ts:27 - CreditNoteType
lib/types/credit-note.ts:30 - CreditNoteItem (used in module)
lib/types/credit-note.ts:39 - CreditNoteAttachment (used in module)
lib/types/hotel.ts:1 - LocationType (used in module)
lib/types/hotel.ts:3 - HotelLocation
lib/types/hotel.ts:17 - HotelProduct
lib/utils/filter-storage.ts:1 - FilterOperator (used in module)
lib/utils/filter-storage.ts:14 - LogicalOperator (used in module)
lib/utils/filter-storage.ts:89 - toggleStar (used in module)
lib/utils/filter-storage.ts:113 - readSavedFilters
lib/utils/filter-storage.ts:114 - addSavedFilter
lib/utils/filter-storage.ts:115 - deleteSavedFilter
lib/utils/filter-storage.ts:116 - toggleFilterStar
.next/types/app/layout.ts:49 - PageProps
.next/types/app/layout.ts:53 - LayoutProps (used in module)
.next/types/app/page.ts:49 - PageProps (used in module)
.next/types/app/page.ts:53 - LayoutProps
app/components/ui/skeleton.tsx:15 - Skeleton (used in module)
components/purchase-orders/tabs/ActivityLogTab.tsx:8 - default
components/purchase-orders/tabs/CommentsAttachmentsTab.tsx:7 - default
components/purchase-orders/tabs/FinancialDetailsTab.tsx:7 - default
components/purchase-orders/tabs/GeneralInfoTab.tsx:7 - default
components/purchase-orders/tabs/GoodsReceiveNoteTab.tsx:104 - default
components/purchase-orders/tabs/InventoryStatusTab.tsx:7 - default
components/purchase-orders/tabs/ItemsTab.tsx:14 - default
components/purchase-orders/tabs/purchase-order-item-form.tsx:22 - PurchaseOrderItemFormComponent
components/purchase-orders/tabs/RelatedDocumentsTab.tsx:7 - default
.next/types/app/(auth)/layout.ts:49 - PageProps
.next/types/app/(auth)/layout.ts:53 - LayoutProps (used in module)
.next/types/app/testui/page.ts:49 - PageProps (used in module)
.next/types/app/testui/page.ts:53 - LayoutProps
.next/types/app/transactions/page.ts:49 - PageProps (used in module)
.next/types/app/transactions/page.ts:53 - LayoutProps
app/(main)/inventory-management/components/stock-in-jv-entry.tsx:218 - default
app/(main)/inventory-management/components/stock-in-list.tsx:1018 - default
app/(main)/store-operations/store-requisitions/types.ts:1 - FilterCondition
app/(main)/store-operations/store-requisitions/types.ts:7 - Requisition
.next/types/app/(main)/dashboard/layout.ts:49 - PageProps
.next/types/app/(main)/dashboard/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/edit-profile/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/edit-profile/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/page.ts:53 - LayoutProps
.next/types/app/(main)/help-support/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/help-support/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/page.ts:53 - LayoutProps
.next/types/app/(main)/production/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/production/page.ts:53 - LayoutProps
.next/types/app/(main)/reporting-analytics/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/reporting-analytics/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/page.ts:53 - LayoutProps
.next/types/app/(main)/TEMPLATE/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/TEMPLATE/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/page.ts:53 - LayoutProps
app/(main)/inventory-management/inventory-adjustments/components/types.ts:1 - Location (used in module)
app/(main)/inventory-management/inventory-adjustments/components/types.ts:7 - Lot (used in module)
app/(main)/inventory-management/inventory-adjustments/components/types.ts:24 - InventoryAdjustment
app/(main)/inventory-management/spot-check/components/count-detail-card.tsx:164 - mockSpotChecks
app/(main)/inventory-management/spot-check/components/count-items.tsx:25 - CountItems
app/(main)/inventory-management/spot-check/components/item-selection.tsx:36 - ItemSelection
app/(main)/inventory-management/spot-check/components/location-selection.tsx:32 - LocationSelection
app/(main)/inventory-management/spot-check/components/review.tsx:31 - Review
app/(main)/inventory-management/spot-check/components/setup.tsx:50 - SpotCheckSetup
app/(main)/inventory-management/spot-check/components/spot-check-nav.tsx:54 - SpotCheckNav
app/(main)/procurement/credit-note/components/advanced-filter.tsx:80 - AdvancedFilter
app/(main)/procurement/credit-note/components/grn-selection.tsx:15 - GRNSelection
app/(main)/procurement/credit-note/components/item-and-lot-selection.tsx:20 - ItemAndLotSelection
app/(main)/procurement/credit-note/components/item-details-edit.tsx:18 - ItemDetailsEdit
app/(main)/procurement/credit-note/components/lot-selection.tsx:24 - LotSelection
app/(main)/procurement/goods-received-note/[id]/edit.tsx:8 - default
app/(main)/procurement/goods-received-note/components/FilterBuilder.tsx:33 - FilterBuilder
app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:462 - default
app/(main)/procurement/purchase-orders/components/ColumnSelectionScreen.tsx:22 - ColumnSelectionScreenProps (used in module)
app/(main)/procurement/purchase-orders/components/createpofrompr.tsx:117 - default
app/(main)/procurement/purchase-orders/components/ExportContext.tsx:24 - ExportProvider
app/(main)/procurement/purchase-orders/components/ExportSidepanel.tsx:18 - ExportSidepanel
app/(main)/procurement/purchase-orders/components/po-item-form.tsx:19 - PurchaseOrderItemFormComponent
app/(main)/procurement/purchase-orders/components/PrintOptionsSidepanel.tsx:15 - PrintOptionsSidepanel
app/(main)/procurement/purchase-orders/components/PurchaseOrderList.tsx:68 - PurchaseOrderList (used in module)
app/(main)/procurement/purchase-requests/components/PRForm.tsx:16 - PRForm
app/(main)/product-management/products/components/counting-unit-tab.tsx:16 - default
app/(main)/product-management/products/components/ingredients.tsx:43 - IngredientUnitTabProps (used in module)
app/(main)/product-management/products/components/inventory.tsx:53 - default
app/(main)/product-management/products/components/order-unit.tsx:54 - OrderUnitTabProps (used in module)
app/(main)/product-management/products/components/stock-count.tsx:21 - StockCountTabProps (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:4 - BaseProductUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:9 - mockBaseProduct (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:15 - StockCountUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:23 - mockStockCountUnits (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:51 - mockCountingUnits (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:69 - OrderUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:77 - OrderUnitRules (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:84 - OrderUnitConfig (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:90 - mockOrderUnits (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:124 - ProductUnitsConfig (used in module)
app/(main)/recipe-management/recipes/components/recipe-list-view.tsx:30 - RecipeListView
app/(main)/store-operations/store-requisitions/components/index.ts:20 - FilterBuilder
app/(main)/store-operations/store-requisitions/components/index.ts:31 - ListFilters
app/(main)/store-operations/store-requisitions/components/index.ts:12 - ListHeader
app/(main)/store-operations/store-requisitions/components/index.ts:13 - HeaderActions
app/(main)/store-operations/store-requisitions/components/index.ts:12 - HeaderInfo
app/(main)/store-operations/store-requisitions/components/stock-movement-sr.tsx:357 - default
app/(main)/store-operations/store-requisitions/types/index.ts:7 - Requisition
app/(main)/vendor-management/manage-vendors/[id]/types.ts:5 - Address (used in module)
app/(main)/vendor-management/manage-vendors/[id]/types.ts:7 - Contact (used in module)
app/(main)/vendor-management/manage-vendors/[id]/types.ts:9 - Certification (used in module)
app/(main)/vendor-management/manage-vendors/data/mock.ts:110 - getMockVendor
app/(main)/vendor-management/manage-vendors/data/mock.ts:4 - AddressType (used in module)
app/(main)/vendor-management/manage-vendors/data/mock.ts:103 - ADDRESS_TYPES
.next/types/app/(auth)/login/[[...login]]/page.ts:49 - PageProps (used in module)
.next/types/app/(auth)/login/[[...login]]/page.ts:53 - LayoutProps
.next/types/app/(auth)/signup/[[...signup]]/page.ts:49 - PageProps (used in module)
.next/types/app/(auth)/signup/[[...signup]]/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/account-code-mapping/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/account-code-mapping/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/currency-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/currency-management/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/department-list/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/department-list/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/exchange-rates/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/exchange-rates/page.ts:53 - LayoutProps
.next/types/app/(main)/help-support/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/help-support/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/inventory-adjustments/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/inventory-adjustments/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/period-end/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/period-end/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count-management/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/layout.ts:49 - PageProps
.next/types/app/(main)/inventory-management/spot-check/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-in/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-in/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/my-approvals/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/my-approvals/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-request-templates/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-request-templates/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/vendor-comparison/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/vendor-comparison/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/categories/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/categories/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/products/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/products/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/units/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/units/page.ts:53 - LayoutProps
.next/types/app/(main)/production/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/production/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/reporting-analytics/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/reporting-analytics/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/stock-replenishment/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/stock-replenishment/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/store-requisitions/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/store-requisitions/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/wastage-reporting/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/wastage-reporting/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/account-code-mapping/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/account-code-mapping/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integration/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-management/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/page.ts:53 - LayoutProps
.next/types/app/(main)/TEMPLATE/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/TEMPLATE/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/manage-vendors/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/manage-vendors/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/price-lists/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/price-lists/page.ts:53 - LayoutProps
app/(main)/operational-planning/recipe-management/recipes/components/recipe-form-skeleton.tsx:4 - RecipeFormSkeleton
app/(main)/operational-planning/recipe-management/recipes/components/recipe-view-skeleton.tsx:5 - RecipeViewSkeleton
app/(main)/procurement/goods-received-note/components/tabs/AttachmentTab.tsx:18 - AttachmentTab
app/(main)/procurement/goods-received-note/components/tabs/CommentTab.tsx:17 - CommentTab
app/(main)/procurement/purchase-orders/components/tabs/GeneralInfoTab.tsx:7 - default
app/(main)/procurement/purchase-orders/components/tabs/InventoryStatusTab.tsx:7 - default
app/(main)/procurement/purchase-orders/components/tabs/VendorInfoTab.tsx:7 - default
app/(main)/procurement/purchase-requests/components/tabs/BudgetsTab.tsx:30 - BudgetsTab
app/(main)/procurement/purchase-requests/components/tabs/DetailsTab.tsx:15 - DetailsTab
app/(main)/system-administration/system-integrations/pos/mapping/layout.tsx:12 - default
app/(main)/system-administration/workflow/role-assignment/data/mockData.ts:122 - initialRoleConfiguration
app/(main)/system-administration/workflow/role-assignment/types/approver.ts:26 - AssignedUser
app/(main)/system-administration/workflow/workflow-configuration/components/workflow-notifications.tsx:18 - WorkflowNotifications
app/(main)/system-administration/workflow/workflow-configuration/data/mockData.ts:301 - mockRoutingRules
app/(main)/system-administration/workflow/workflow-configuration/types/workflow.ts:34 - RoutingCondition (used in module)
app/(main)/system-administration/workflow/workflow-configuration/types/workflow.ts:40 - RoutingAction (used in module)
app/(main)/vendor-management/manage-vendors/[id]/components/addresses-tab.tsx:13 - AddressesTab
app/(main)/vendor-management/manage-vendors/[id]/components/basic-info-tab.tsx:15 - BasicInfoTab
app/(main)/vendor-management/manage-vendors/[id]/components/contacts-tab.tsx:13 - ContactsTab
app/(main)/vendor-management/manage-vendors/[id]/hooks/use-vendor.ts:12 - useVendor
app/(main)/vendor-management/manage-vendors/[id]/sections/environmental-section.tsx:14 - EnvironmentalSection
.next/types/app/(main)/inventory-management/inventory-adjustments/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/inventory-adjustments/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/period-end/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/period-end/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/active/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/active/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/completed/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/completed/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/new/layout.ts:49 - PageProps
.next/types/app/(main)/inventory-management/spot-check/new/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/new/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/inventory-aging/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/inventory-aging/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/inventory-balance/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/inventory-balance/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/slow-moving/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/slow-moving/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/stock-card/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/stock-card/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/categories/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/categories/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/cuisine-types/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/cuisine-types/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/new/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/create/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/create/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-request-templates/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-request-templates/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/new-pr/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/new-pr/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/products/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/products/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/store-requisitions/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/store-requisitions/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integration/pos/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integration/pos/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/system-integrations/pos/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-management/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-management/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/role-assignment/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/role-assignment/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/workflow-configuration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/manage-vendors/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/manage-vendors/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/price-lists/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/price-lists/[id]/page.ts:53 - LayoutProps
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:1 - MappingHeader
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:2 - FilterBar
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:3 - DataTable
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:4 - StatusBadge
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:5 - RowActions
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:6 - MappingNav
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - FilterOption
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - FilterGroup
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - AppliedFilter
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:9 - ActionType
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:10 - StatusType
app/(main)/system-administration/system-integrations/pos/mapping/locations/types.ts:16 - LocationMappingFormData
app/(main)/system-administration/system-integrations/pos/mapping/recipes/types.ts:20 - RecipeMappingFormData
app/(main)/system-administration/system-integrations/pos/mapping/units/types.ts:18 - UnitMappingFormData
.next/types/app/(main)/inventory-management/physical-count/active/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/active/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/active/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/active/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/completed/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/completed/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/create/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/create/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/new/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/transactions/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/transactions/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/role-assignment/components/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/workflow/role-assignment/components/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/locations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/locations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/recipes/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/recipes/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/units/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/units/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/consumption/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/consumption/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/gross-profit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/gross-profit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/config/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/config/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/system/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/system/page.ts:53 - LayoutProps

```
