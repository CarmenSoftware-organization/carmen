"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BaseMapping {
  id: string
  posItemName?: string
  posItemId?: string
  posUnitName?: string
  posLocationName?: string
  isActive: boolean
}

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: BaseMapping | null
  mappingType: "recipe" | "unit" | "location"
  onConfirm: (deleteType: "soft" | "hard", reason?: string) => void
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  mapping,
  mappingType,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft")
  const [reason, setReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Get mapping name based on type
  const getMappingName = () => {
    if (!mapping) return ""

    switch (mappingType) {
      case "recipe":
        return mapping.posItemName || "Unknown Recipe"
      case "unit":
        return mapping.posUnitName || "Unknown Unit"
      case "location":
        return mapping.posLocationName || "Unknown Location"
      default:
        return "Unknown Mapping"
    }
  }

  // Calculate impact based on mapping type
  const calculateImpact = () => {
    // Mock impact analysis - in production this would come from API
    const impacts = {
      recipe: {
        affectedTransactions: 45,
        historicalData: "3 months of transaction history",
        dependencies: ["12 pending transactions", "5 active mappings"],
      },
      unit: {
        affectedTransactions: 28,
        historicalData: "6 months of conversion history",
        dependencies: ["8 recipes using this unit", "3 active sales items"],
      },
      location: {
        affectedTransactions: 67,
        historicalData: "12 months of location data",
        dependencies: ["15 active inventory items", "10 pending transfers"],
      },
    }

    return impacts[mappingType]
  }

  const impact = calculateImpact()

  const handleConfirm = async () => {
    setIsDeleting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    onConfirm(deleteType, reason.trim() || undefined)
    setIsDeleting(false)
    onOpenChange(false)

    // Reset form
    setDeleteType("soft")
    setReason("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setDeleteType("soft")
    setReason("")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete {mappingType.charAt(0).toUpperCase() + mappingType.slice(1)} Mapping
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete the mapping for {getMappingName()}. This action requires confirmation.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this mapping will affect {impact.affectedTransactions} transactions and may impact system operations.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Impact Analysis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Impact Analysis</Label>
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Affected Transactions:</span>
                <Badge variant="destructive">{impact.affectedTransactions}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Historical Data:</span>
                <span className="font-medium">{impact.historicalData}</span>
              </div>
              <Separator className="my-2" />
              <div>
                <p className="text-muted-foreground mb-1">Dependencies:</p>
                <ul className="list-disc list-inside space-y-1">
                  {impact.dependencies.map((dep, idx) => (
                    <li key={idx} className="text-xs">{dep}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delete Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Delete Type</Label>
            <RadioGroup value={deleteType} onValueChange={(value) => setDeleteType(value as "soft" | "hard")}>
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="soft" id="soft" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="soft" className="text-sm font-medium cursor-pointer">
                    Soft Delete (Recommended)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark as inactive. Preserves historical data and can be reactivated later.
                    Transactions will stop using this mapping.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Reversible</Badge>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="hard" id="hard" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="hard" className="text-sm font-medium cursor-pointer">
                    Hard Delete (Permanent)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permanently removes the mapping and all associated data. This action cannot be undone.
                    Use with extreme caution.
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">Permanent</Badge>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Deletion {deleteType === "hard" && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for deleting this mapping (optional for soft delete, required for hard delete)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className={deleteType === "hard" && !reason ? "border-destructive" : ""}
            />
            {deleteType === "hard" && !reason && (
              <p className="text-xs text-destructive">
                A reason is required for permanent deletion
              </p>
            )}
          </div>

          {/* Summary */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Summary:</strong> You are performing a{" "}
              <span className={deleteType === "hard" ? "text-destructive font-semibold" : "font-medium"}>
                {deleteType} delete
              </span>{" "}
              on {getMappingName()}.
              {deleteType === "soft" ? (
                " The mapping will be marked as inactive and can be reactivated."
              ) : (
                " The mapping and all associated data will be permanently removed."
              )}
            </AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || (deleteType === "hard" && !reason.trim())}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                {deleteType === "soft" ? "Deactivate" : "Permanently Delete"}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
