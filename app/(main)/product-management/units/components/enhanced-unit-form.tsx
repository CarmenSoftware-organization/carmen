"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Loader2, 
  Save, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { Unit } from "./unit-list"
import { toast } from "sonner"

// Enhanced validation schema with comprehensive rules
const unitSchema = z.object({
  code: z.string()
    .min(1, "Unit code is required")
    .max(10, "Code must not exceed 10 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores")
    .refine(val => val.trim() === val, "Code cannot have leading or trailing spaces")
    .transform(val => val.toUpperCase()),
  name: z.string()
    .min(1, "Unit name is required")
    .max(50, "Name must not exceed 50 characters")
    .refine(val => val.trim().length > 0, "Name cannot be only whitespace")
    .transform(val => val.trim()),
  description: z.string()
    .max(200, "Description must not exceed 200 characters")
    .optional()
    .transform(val => val?.trim() || undefined),
  type: z.enum(["INVENTORY", "ORDER", "RECIPE"], {
    required_error: "Please select a unit type",
    invalid_type_error: "Invalid unit type selected",
  }),
  isActive: z.boolean().default(true),
})

type UnitFormValues = z.infer<typeof unitSchema>

interface UnitFormProps {
  unit?: Unit
  onSuccess: (data: UnitFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit' | 'view'
  showAdvancedOptions?: boolean
}

// Character count component for real-time feedback
const CharacterCount = ({ current, max, className = "" }: { current: number, max: number, className?: string }) => {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100
  
  return (
    <span className={`text-xs ${
      isOverLimit ? 'text-destructive' : 
      isNearLimit ? 'text-amber-600' : 
      'text-muted-foreground'
    } ${className}`}>
      {current}/{max}
    </span>
  )
}

// Field help tooltip
const FieldHelp = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export function EnhancedUnitForm({ 
  unit, 
  onSuccess, 
  onCancel, 
  isLoading = false, 
  mode = 'create',
  showAdvancedOptions = false 
}: UnitFormProps) {
  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedOptions)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({})
  
  const formRef = useRef<HTMLFormElement>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)
  
  // Enhanced form with proper defaults and validation
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      code: unit?.code || "",
      name: unit?.name || "",
      description: unit?.description || "",
      type: unit?.type || "INVENTORY",
      isActive: unit?.isActive ?? true,
    },
  })
  
  // Watch form values for unsaved changes detection
  const watchedValues = form.watch()
  
  // Auto-focus code input on mount for new units
  useEffect(() => {
    if (!unit && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [])
  
  // Track unsaved changes
  useEffect(() => {
    if (!unit) {
      // New unit - check if any fields have values
      const hasChanges = Object.values(watchedValues).some(value => {
        if (typeof value === 'boolean') return value !== true // isActive defaults to true
        if (typeof value === 'string') return value.length > 0
        return false
      })
      setHasUnsavedChanges(hasChanges)
    } else {
      // Existing unit - compare with original values
      const hasChanges = (
        watchedValues.code !== unit.code ||
        watchedValues.name !== unit.name ||
        (watchedValues.description || '') !== (unit.description || '') ||
        watchedValues.type !== unit.type ||
        watchedValues.isActive !== unit.isActive
      )
      setHasUnsavedChanges(hasChanges)
    }
  }, [watchedValues, unit])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (form.formState.isValid && !isSubmitting) {
          form.handleSubmit(onSubmit)()
        }
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        handleCancel()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [form.formState.isValid, isSubmitting])
  
  // Enhanced submit handler with loading and error states
  const onSubmit = useCallback(async (data: UnitFormValues) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess(data)
      setHasUnsavedChanges(false)
      
      toast.success(
        unit ? 'Unit updated successfully!' : 'Unit created successfully!',
        { duration: 3000 }
      )
    } catch (error) {
      toast.error('Failed to save unit. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onSuccess, unit])
  
  // Enhanced cancel handler with unsaved changes protection
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onCancel()
    }
  }, [hasUnsavedChanges, onCancel])
  
  // Confirm discard changes
  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false)
    setHasUnsavedChanges(false)
    onCancel()
  }
  
  // Field validation on blur
  const handleFieldBlur = (fieldName: string) => {
    setValidationTouched(prev => ({ ...prev, [fieldName]: true }))
    form.trigger(fieldName)
  }
  
  const isViewMode = mode === 'view'
  
  // Get form state for UI feedback
  const { errors, isValid, isDirty } = form.formState
  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      <TooltipProvider>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {isViewMode ? 'View Unit' : unit ? 'Edit Unit' : 'Create New Unit'}
                </CardTitle>
                {unit && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {unit.type}
                    </Badge>
                    <Badge 
                      variant={unit.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {unit.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Form status indicator */}
              {!isViewMode && (
                <div className="flex items-center gap-2 text-sm">
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-amber-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unsaved changes
                    </Badge>
                  )}
                  {isValid && isDirty && !hasUnsavedChanges && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ready to save
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Code Field */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Unit Code *</FormLabel>
                            <FieldHelp content="A unique identifier for the unit (e.g., KG, L, PC). Only uppercase letters, numbers, hyphens, and underscores allowed." />
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field}
                                ref={codeInputRef}
                                disabled={isViewMode || isLoading}
                                placeholder="e.g., KG, L, PC"
                                className={`
                                  ${errors.code ? 'border-destructive' : ''}
                                  ${validationTouched.code && !errors.code ? 'border-green-500' : ''}
                                `}
                                onBlur={() => handleFieldBlur('code')}
                                onChange={(e) => {
                                  // Auto-format to uppercase
                                  const value = e.target.value.toUpperCase()
                                  field.onChange(value)
                                }}
                                maxLength={10}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CharacterCount current={field.value.length} max={10} />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Used in reports and product specifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Unit Type Field */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Unit Type *</FormLabel>
                            <FieldHelp content="Category that determines where this unit can be used: Inventory (stock tracking), Order (purchasing), Recipe (cooking measurements)." />
                          </div>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isViewMode || isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select unit category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INVENTORY">
                                <div className="flex flex-col items-start">
                                  <span>Inventory</span>
                                  <span className="text-xs text-muted-foreground">Stock and warehouse tracking</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ORDER">
                                <div className="flex flex-col items-start">
                                  <span>Order</span>
                                  <span className="text-xs text-muted-foreground">Purchasing and procurement</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="RECIPE">
                                <div className="flex flex-col items-start">
                                  <span>Recipe</span>
                                  <span className="text-xs text-muted-foreground">Cooking and food preparation</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Determines system modules where unit appears
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Unit Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium">Unit Name *</FormLabel>
                          <FieldHelp content="Full descriptive name of the unit (e.g., Kilogram, Liter, Piece). Used in user interfaces and reports." />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              disabled={isViewMode || isLoading}
                              placeholder="e.g., Kilogram, Liter, Piece"
                              className={`
                                ${errors.name ? 'border-destructive' : ''}
                                ${validationTouched.name && !errors.name ? 'border-green-500' : ''}
                              `}
                              onBlur={() => handleFieldBlur('name')}
                              maxLength={50}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CharacterCount current={field.value.length} max={50} />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Displayed to users throughout the system
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description Field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium">Description</FormLabel>
                          <FieldHelp content="Optional detailed description, usage notes, or conversion information for this unit." />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Textarea 
                              {...field}
                              disabled={isViewMode || isLoading}
                              placeholder="Additional details about this unit..."
                              className={`
                                min-h-[80px] resize-none
                                ${errors.description ? 'border-destructive' : ''}
                                ${validationTouched.description && !errors.description ? 'border-green-500' : ''}
                              `}
                              onBlur={() => handleFieldBlur('description')}
                              maxLength={200}
                            />
                            <div className="absolute right-3 bottom-3">
                              <CharacterCount current={field.value?.length || 0} max={200} />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Optional: conversion notes, usage guidelines, or special instructions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Status Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Status & Settings</h3>
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-base font-medium">Active Status</FormLabel>
                              <FieldHelp content="Active units can be used throughout the system. Inactive units are hidden from selection lists but preserved for historical data." />
                            </div>
                            <FormDescription className="text-sm">
                              {field.value 
                                ? "This unit is available for use in the system" 
                                : "This unit is hidden from new transactions"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isViewMode || isLoading}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Form Actions */}
                {!isViewMode && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                    <div className="flex-1 sm:flex-initial">
                      {hasErrors && (
                        <div className="flex items-center gap-2 text-sm text-destructive mb-3 sm:mb-0">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Please fix the errors above</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSubmitting || isLoading}
                        className="flex-1 sm:flex-initial min-w-[100px]"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || isLoading || !isValid || !isDirty}
                        className="flex-1 sm:flex-initial min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {unit ? 'Update Unit' : 'Create Unit'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Keyboard shortcuts help */}
                {!isViewMode && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    <div className="flex items-center justify-center gap-4">
                      <span><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd> Save</span>
                      <span><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> Cancel</span>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </TooltipProvider>
      
      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you continue. 
              Are you sure you want to discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDiscardChanges}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}