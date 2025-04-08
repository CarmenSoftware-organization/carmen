'use client'

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, XIcon } from "lucide-react"
import { toast } from "sonner"
import { ComponentSearchDialog } from "./component-search-dialog"
import { saveMapping } from "../actions/save-mapping"
import { bulkSaveMapping } from "../actions/bulk-save-mapping"
import { useMappingStore, MappingItem, RecipeComponent } from "../store/mapping-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { MappingHistoryViewer } from "./mapping-history-viewer"

// Schema for recipe component
const recipeComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().min(0.01),
  costPerUnit: z.number().min(0),
})

// Schema for the form - POS Item is now optional for bulk mode
const recipeMappingFormSchema = z.object({
  posItem: z.object({
    id: z.string(),
    name: z.string().min(1),
    sku: z.string().min(1),
  }).optional(), // Make POS item optional
  components: z.array(recipeComponentSchema)
    .min(1, "At least one component is required")
    // Add refinement for uniqueness
    .refine((components) => {
        const ids = components.map(c => c.id);
        // Check if the number of unique IDs is the same as the total number of components
        return new Set(ids).size === ids.length;
    }, {
        // Custom error message for the components array field
        message: "Duplicate components are not allowed.",
        // Optional: Specify path if you want error on a specific duplicate field (more complex)
        // path: ["components"] 
    }),
})

type RecipeMappingFormValues = z.infer<typeof recipeMappingFormSchema>

// Define the type expected by ComponentSearchDialog's onSelect prop
// (Assuming it provides these fields without quantity)
type BaseComponent = Omit<RecipeComponent, 'quantity'>;

interface MappingDialogProps {
  isOpen: boolean
  onClose: () => void
  // onSave is now only for single item saving
  onSave?: (mapping: MappingItem) => Promise<void> 
  initialData?: MappingItem | null // Allow null for bulk mode indication
  isBulkMode?: boolean // New prop for bulk mode
  description?: string
}

export function MappingDialog({
  isOpen,
  onClose,
  onSave, // May be undefined in bulk mode
  initialData, // May be null in bulk mode
  isBulkMode = false, // Default to false
  description = 'Edit or create a recipe mapping',
}: MappingDialogProps) {
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { getSelectedUnmappedIds, setRowSelection } = useMappingStore() // Add setRowSelection

  const formTitle = isBulkMode ? "Map Selected Items" : initialData ? "Edit Recipe Mapping" : "Create Recipe Mapping"

  // Adjust default values based on mode
  const defaultValues = useMemo(() => {
    if (isBulkMode || !initialData) {
      return {
        // No posItem needed for bulk mode initially
        components: [],
      }
    }
    // Single item mode
    return {
      posItem: {
        id: initialData.id,
        name: initialData.name,
        sku: initialData.sku,
      },
      components: initialData.components || [],
    }
  }, [initialData, isBulkMode])

  const form = useForm<RecipeMappingFormValues>({
    resolver: zodResolver(recipeMappingFormSchema),
    defaultValues,
  })

  // Reset form when initialData or mode changes (important!)
  useEffect(() => {
     form.reset(defaultValues);
  }, [defaultValues, form]);


  const { components } = form.watch()

  const totalCost = useMemo(() => {
    return components.reduce((sum, component) => {
      return sum + component.quantity * component.costPerUnit
    }, 0)
  }, [components])

  const onSubmit = async (data: RecipeMappingFormValues) => {
    setIsSaving(true)
    try {
      if (isBulkMode) {
        // Bulk Mode Logic
        const selectedIds = getSelectedUnmappedIds ? getSelectedUnmappedIds() : [];
        if (selectedIds.length === 0) {
          toast.error("No items selected for bulk mapping.");
          setIsSaving(false);
          return;
        }
        
        // Call the bulk save action
        const result = await bulkSaveMapping({ 
          posItemIds: selectedIds, 
          components: data.components 
        });
        
        // Handle result from safe action
        if (result.error) {
           toast.error(result.error); // Show specific error from action
        } else if (result.data?.success) {
           toast.success(result.data.message || "Items mapped successfully.");
           setRowSelection({}); // Clear selection on success
           onClose(); // Close dialog on success
        } else {
            toast.error("An unexpected error occurred during bulk mapping.");
        }

      } else if (initialData && onSave) {
        // Single Item Edit/Create Mode Logic
        const mappingItem: MappingItem = {
          id: initialData.id, // Use initialData ID for updates
          name: data.posItem!.name, // Non-null assertion ok due to schema if not bulk
          sku: data.posItem!.sku,
          lastSale: initialData.lastSale || new Date().toISOString(), 
          saleFrequency: initialData.saleFrequency || 'Unknown',
          status: "mapped", 
          lastUpdated: new Date().toISOString(),
          components: data.components,
        }
        await onSave(mappingItem)
        toast.success("Recipe mapping saved successfully")
        onClose()
      } else {
         toast.error("Save configuration error.") // Should not happen
      }
    } catch (error) {
      console.error("Mapping save error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComponent = (component: BaseComponent) => {
    const currentComponents = form.getValues("components")
    // Add the component with a default quantity of 1
    form.setValue("components", [...currentComponents, { ...component, quantity: 1 }])
  }

  const handleRemoveComponent = (index: number) => {
    const currentComponents = form.getValues("components")
    form.setValue(
      "components",
      currentComponents.filter((_, i) => i !== index)
    )
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const currentComponents = form.getValues("components")
    currentComponents[index].quantity = isNaN(quantity) ? 0 : quantity
    form.setValue("components", [...currentComponents])
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Removed max-w- restriction for potentially more content */}
        <DialogContent 
          className="sm:max-w-[800px] [&>button]:hidden"
          aria-describedby="dialog-description" 
         > 
          <div id="dialog-description" className="sr-only">
            {description || formTitle} 
          </div>
          <DialogHeader>
             <div className="flex justify-between w-full items-center">
              <DialogTitle>{formTitle}</DialogTitle>
              {/* Explicit close button */}
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
                 <XIcon className="h-4 w-4" />
                 <span className="sr-only">Close</span>
               </Button>
            </div>
          </DialogHeader>

          {/* Use Tabs only in single item mode */}
          {!isBulkMode && initialData ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                 {/* Form content goes here */}
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="mapping-form" className="space-y-6 max-h-[65vh] overflow-y-auto pr-6 pl-1">
                      {/* POS Item Details (already conditional) */}
                       {!isBulkMode && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="posItem.name" render={({ field }) => (
                              <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="posItem.sku" render={({ field }) => (
                              <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                       )}
                       {/* Components Section */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Recipe Components</h3>
                            <Button type="button" variant="outline" onClick={() => setIsComponentDialogOpen(true)} disabled={isSaving}> Add Component </Button>
                          </div>
                          {/* Components Table/Empty State */}
                          {components.length > 0 ? (
                              <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead>Unit</TableHead><TableHead>Quantity</TableHead><TableHead>Cost/Unit</TableHead><TableHead>Total Cost</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {components.map((component, index) => (
                                      <TableRow key={`${component.id}-${index}`}> 
                                        <TableCell>{component.name}</TableCell>
                                        <TableCell>{component.sku}</TableCell>
                                        <TableCell>{component.unit}</TableCell>
                                        <TableCell><Input type="number" value={component.quantity} onChange={(e) => handleUpdateQuantity(index, parseFloat(e.target.value))} className="w-20" min={0.01} step={0.01} disabled={isSaving} aria-label={`Quantity for ${component.name}`}/></TableCell>
                                        <TableCell>${component.costPerUnit.toFixed(2)}</TableCell>
                                        <TableCell>${(component.quantity * component.costPerUnit).toFixed(2)}</TableCell>
                                        <TableCell><Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveComponent(index)} disabled={isSaving} aria-label={`Remove ${component.name}`}>Remove</Button></TableCell>
                                      </TableRow>
                                    ))}
                                     <TableRow><TableCell colSpan={5} className="text-right font-semibold">Total Cost:</TableCell><TableCell className="font-semibold">${totalCost.toFixed(2)}</TableCell><TableCell /></TableRow>
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-12 text-muted-foreground border rounded-lg">No components added yet.</div>
                            )}
                          <FormMessage>{form.formState.errors.components?.message}</FormMessage>
                       </div>
                      <div className="h-16"></div> {/* Spacer */} 
                    </form>
                 </Form>
              </TabsContent>
              <TabsContent value="history" className="max-h-[65vh] overflow-y-auto">
                 {/* Render History Viewer component */}
                 <MappingHistoryViewer mappingId={initialData.id} />
              </TabsContent>
            </Tabs>
          ) : (
             // Render form directly in bulk mode (or if creating new - not currently supported)
             <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} id="mapping-form" className="space-y-6 max-h-[70vh] overflow-y-auto pr-6 pl-1">
                    {/* Components Section (only this is needed in bulk mode) */}
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Recipe Components</h3>
                            <Button type="button" variant="outline" onClick={() => setIsComponentDialogOpen(true)} disabled={isSaving}> Add Component </Button>
                          </div>
                          {/* Components Table/Empty State */}
                          {components.length > 0 ? (
                              <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead>Unit</TableHead><TableHead>Quantity</TableHead><TableHead>Cost/Unit</TableHead><TableHead>Total Cost</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {components.map((component, index) => (
                                    <TableRow key={`${component.id}-${index}`}> 
                                      <TableCell>{component.name}</TableCell>
                                      <TableCell>{component.sku}</TableCell>
                                      <TableCell>{component.unit}</TableCell>
                                      <TableCell><Input type="number" value={component.quantity} onChange={(e) => handleUpdateQuantity(index, parseFloat(e.target.value))} className="w-20" min={0.01} step={0.01} disabled={isSaving} aria-label={`Quantity for ${component.name}`}/></TableCell>
                                      <TableCell>${component.costPerUnit.toFixed(2)}</TableCell>
                                      <TableCell>${(component.quantity * component.costPerUnit).toFixed(2)}</TableCell>
                                      <TableCell><Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveComponent(index)} disabled={isSaving} aria-label={`Remove ${component.name}`}>Remove</Button></TableCell>
                                    </TableRow>
                                  ))}
                                    <TableRow><TableCell colSpan={5} className="text-right font-semibold">Total Cost:</TableCell><TableCell className="font-semibold">${totalCost.toFixed(2)}</TableCell><TableCell /></TableRow>
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-12 text-muted-foreground border rounded-lg">No components added yet.</div>
                            )}
                          <FormMessage>{form.formState.errors.components?.message}</FormMessage>
                       </div>
                    <div className="h-16"></div> {/* Spacer */} 
                 </form>
             </Form>
          )}
          
          {/* Footer outside the scrollable/tabbed area */}
          <DialogFooter className="pt-4 border-t">
             <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
               Cancel
            </Button>
            <Button 
              type="submit" 
              form="mapping-form" 
              disabled={isSaving || !form.formState.isValid}
              onClick={form.handleSubmit(onSubmit)}
            > 
               {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isSaving ? "Saving..." : "Save Mapping"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      <ComponentSearchDialog
        isOpen={isComponentDialogOpen}
        onClose={() => setIsComponentDialogOpen(false)}
        onSelect={handleAddComponent} 
      />
    </>
  )
}