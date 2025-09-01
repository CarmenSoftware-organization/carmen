"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// Form schema
const unitSchema = z.object({
  code: z.string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  description: z.string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
  type: z.enum(["inventory", "order", "recipe"], {
    required_error: "Type is required",
  }),
  isActive: z.boolean().default(true),
})

type UnitFormData = z.infer<typeof unitSchema>

interface Unit {
  id: string
  code: string
  name: string
  description?: string
  type: 'inventory' | 'order' | 'recipe'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UnitFormProps {
  open: boolean
  onClose: () => void
  unit?: Unit | null
  onSave: (data: UnitFormData) => Promise<void>
}

export function UnitFormImproved({ open, onClose, unit, onSave }: UnitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!unit

  // Initialize form
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      code: unit?.code || "",
      name: unit?.name || "",
      description: unit?.description || "",
      type: unit?.type || "inventory",
      isActive: unit?.isActive ?? true,
    },
  })

  // Handle form submission
  const handleSubmit = useCallback(async (data: UnitFormData) => {
    setIsLoading(true)
    try {
      // Transform code to uppercase
      const formattedData = {
        ...data,
        code: data.code.toUpperCase(),
      }
      
      await onSave(formattedData)
      
      toast({
        title: isEditing ? "Unit Updated" : "Unit Created",
        description: `Unit "${formattedData.name}" has been ${isEditing ? "updated" : "created"} successfully.`,
      })
      
      form.reset()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} unit. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isEditing, onSave, onClose, form])

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (form.formState.isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?")
      if (!confirmed) return
    }
    form.reset()
    onClose()
  }, [form, onClose])

  // Transform code input to uppercase on change
  const handleCodeChange = useCallback((value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Unit" : "Add New Unit"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to the unit information below." 
              : "Create a new measurement unit for your products."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="KG"
                          {...field}
                          onChange={(e) => field.onChange(handleCodeChange(e.target.value))}
                          className="uppercase"
                          maxLength={10}
                        />
                      </FormControl>
                      <FormDescription>
                        Max 10 characters. Letters, numbers, -, _ only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="recipe">Recipe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How this unit will be used in the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kilogram"
                        {...field}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormDescription>
                      Full descriptive name of the unit (max 50 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this unit..."
                        {...field}
                        rows={3}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description (max 200 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Active units can be used in products and transactions.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Unit" : "Create Unit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}