'use client'

import { useState, useMemo, useCallback } from "react"
import { useMappingStore, MappingItem } from "../store/mapping-store"
import { columns } from "./columns"
import { DataTable } from "../../../../../components/ui/data-table"
import { MappingDialog } from "./mapping-dialog"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { bulkDeleteMapping } from "../actions/bulk-delete-mapping"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

// Mock API call (replace with actual server action)
async function saveMappingToDatabase(mapping: MappingItem): Promise<MappingItem> {
  console.log("Saving mapping:", mapping)
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  // Simulate successful save with updated timestamp
  return {
    ...mapping,
    status: "mapped",
    lastUpdated: new Date().toISOString(),
  }
}

interface MappingListProps {
  items: MappingItem[]
  isLoading: boolean
  title: string
  // No longer needs setRowSelection, handled by store
}

export function MappingList({ items, isLoading, title }: MappingListProps) {
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MappingItem | null>(null)
  const [isBulkModeActive, setIsBulkModeActive] = useState(false) // New state for bulk mode
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // State for delete dialog
  const [isDeleting, setIsDeleting] = useState(false) // State for delete operation loading
  
  const { 
    rowSelection, 
    setRowSelection, 
    addMapping, 
    updateMapping, 
    getSelectedUnmappedIds, // Get the selector
    removeItemsByIds, // Import the new action
  } = useMappingStore()

  const selectedRowCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])

  const handleEditMapping = useCallback((item: MappingItem) => {
    setSelectedItem(item)
    setIsBulkModeActive(false) // Ensure not in bulk mode
    setIsMappingDialogOpen(true)
  }, [])

  const handleCloseMappingDialog = useCallback(() => {
    setIsMappingDialogOpen(false)
    setSelectedItem(null) // Reset selected item on close
    setIsBulkModeActive(false) // Reset bulk mode on close
  }, [])

  // Handler for saving a single mapping (used by dialog in single mode)
  const handleSaveMapping = useCallback(async (data: MappingItem) => {
    // Call the actual save function (replace mock later)
    const savedMapping = await saveMappingToDatabase(data) 

    if (selectedItem) {
      // Update existing mapping in the store
      updateMapping(selectedItem.id, savedMapping)
    } else {
      // Add new mapping (if create mode was supported, not currently)
      addMapping(savedMapping) 
    }
  }, [selectedItem, addMapping, updateMapping]) // Dependencies added

  // Handler for the bulk map button
  const handleBulkMap = useCallback(() => {
    const selectedIds = getSelectedUnmappedIds();
    if (selectedIds.length === 0) {
      // Should not happen if button is disabled, but good practice
      return; 
    }
    setSelectedItem(null) // No single item is selected in bulk mode
    setIsBulkModeActive(true) // Set bulk mode flag
    setIsMappingDialogOpen(true) // Open the dialog
  }, [getSelectedUnmappedIds]); // Dependency added

  // Handler for clicking the delete button - opens the confirmation dialog
  const handleBulkDeleteClick = useCallback(() => {
     if (selectedRowCount > 0) {
       setIsDeleteDialogOpen(true);
     }
  }, [selectedRowCount]);

  // Handler for confirming the delete action
  const executeBulkDelete = useCallback(async () => {
      const selectedIds = getSelectedUnmappedIds();
      if (selectedIds.length === 0) {
          toast.warning("No items selected for deletion.");
          setIsDeleteDialogOpen(false);
          return;
      }

      setIsDeleting(true);
      try {
          const result = await bulkDeleteMapping({ posItemIds: selectedIds });

          if (result.error) {
              toast.error(result.error);
          } else if (result.data?.success) {
              toast.success(result.data.message || "Items deleted successfully.");
              setRowSelection({}); // Clear selection first
              removeItemsByIds(selectedIds); // Call store action to remove items from UI
              setIsDeleteDialogOpen(false); // Close dialog on success
          } else {
              toast.error("An unexpected error occurred during deletion.");
          }
      } catch (error) {
         console.error("Bulk delete execution error:", error);
         toast.error("A client-side error occurred during deletion.");
      } finally {
          setIsDeleting(false);
      }
  }, [getSelectedUnmappedIds, setRowSelection, removeItemsByIds]);

  // Define columns with explicit type 
  const tableColumns = useMemo(() => columns(handleEditMapping), [
    handleEditMapping,
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {/* Render Bulk Action Buttons only if rows are selected */}
        {selectedRowCount > 0 && (
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={handleBulkMap}> {/* Attach handler */}
                Map Selected ({selectedRowCount})
            </Button>
            {/* Use AlertDialogTrigger for the delete button */}
             <AlertDialogTrigger asChild>
               <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick} disabled={isDeleting}>
                   {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                   Delete Selected ({selectedRowCount})
               </Button>
             </AlertDialogTrigger>
          </div>
        )}
      </div>

      {/* Pass props directly again */}
      <DataTable
        columns={tableColumns}
        data={items} 
        isLoading={isLoading}
        rowSelection={rowSelection} 
        onRowSelectionChange={setRowSelection} 
        enableRowSelection={true} 
      />

      {/* Pass isBulkModeActive to the dialog */}
      <MappingDialog
        isOpen={isMappingDialogOpen}
        onClose={handleCloseMappingDialog}
        onSave={handleSaveMapping} // Used only in single mode
        initialData={selectedItem} // Will be null in bulk mode
        isBulkMode={isBulkModeActive} // Pass bulk mode flag
        description={isBulkModeActive ? "Map selected POS items to recipe components" : "Edit recipe mapping for the selected POS item"}
      />

       {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected
              mapping(s). If these POS items appear in future transactions, they will need to be re-mapped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            {/* Call executeBulkDelete on continue */}
            <AlertDialogAction onClick={executeBulkDelete} disabled={isDeleting}> 
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
} 