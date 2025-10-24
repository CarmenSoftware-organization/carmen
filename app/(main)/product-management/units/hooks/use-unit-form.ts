"use client"

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Unit } from '../components/unit-list'

// Enhanced validation schema
export const unitFormSchema = z.object({
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

export type UnitFormData = z.infer<typeof unitFormSchema>

export interface UseUnitFormOptions {
  unit?: Unit
  mode?: 'create' | 'edit' | 'view'
  onSuccess?: (data: UnitFormData) => void
  onCancel?: () => void
  autoSave?: boolean
  validateOnBlur?: boolean
}

export interface UseUnitFormReturn {
  form: ReturnType<typeof useForm<UnitFormData>>
  isSubmitting: boolean
  hasUnsavedChanges: boolean
  fieldErrors: Record<string, boolean>
  validationTouched: Record<string, boolean>
  handleSubmit: (data: UnitFormData) => Promise<void>
  handleCancel: () => void
  handleFieldBlur: (fieldName: string) => void
  resetForm: () => void
  validateField: (fieldName: keyof UnitFormData) => Promise<boolean>
  getFieldState: (fieldName: keyof UnitFormData) => {
    hasError: boolean
    isValid: boolean
    isTouched: boolean
    errorMessage?: string
  }
}

export function useUnitForm(options: UseUnitFormOptions): UseUnitFormReturn {
  const { 
    unit, 
    mode = 'create', 
    onSuccess, 
    onCancel, 
    autoSave = false, 
    validateOnBlur = true 
  } = options

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({})

  // Form configuration
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    mode: validateOnBlur ? 'onBlur' : 'onChange',
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

  // Track unsaved changes
  useEffect(() => {
    if (!unit) {
      // New unit - check if any fields have values
      const hasChanges = Object.entries(watchedValues).some(([key, value]) => {
        if (key === 'isActive' && typeof value === 'boolean') return value !== true
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

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && form.formState.isValid) {
      const timer = setTimeout(() => {
        handleSubmit(watchedValues)
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [autoSave, hasUnsavedChanges, form.formState.isValid, watchedValues])

  // Enhanced submit handler
  const handleSubmit = useCallback(async (data: UnitFormData) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check for duplicate codes (mock validation)
      if (data.code === 'DUPLICATE') {
        form.setError('code', {
          type: 'manual',
          message: 'This code already exists. Please choose a different code.'
        })
        return
      }

      onSuccess?.(data)
      setHasUnsavedChanges(false)

      toast.success(
        unit ? 'Unit updated successfully!' : 'Unit created successfully!',
        { 
          duration: 3000,
          description: `${data.code} - ${data.name} has been saved.`
        }
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error('Failed to save unit', {
        description: errorMessage
      })
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onSuccess, unit, form])

  // Enhanced cancel handler
  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  // Field validation on blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setValidationTouched(prev => ({ ...prev, [fieldName]: true }))
    form.trigger(fieldName as keyof UnitFormData)
    
    // Update field error state
    const fieldError = form.formState.errors[fieldName as keyof UnitFormData]
    setFieldErrors(prev => ({ 
      ...prev, 
      [fieldName]: !!fieldError 
    }))
  }, [form])

  // Reset form to initial state
  const resetForm = useCallback(() => {
    form.reset({
      code: unit?.code || "",
      name: unit?.name || "",
      description: unit?.description || "",
      type: unit?.type || "INVENTORY",
      isActive: unit?.isActive ?? true,
    })
    setHasUnsavedChanges(false)
    setFieldErrors({})
    setValidationTouched({})
  }, [form, unit])

  // Validate specific field
  const validateField = useCallback(async (fieldName: keyof UnitFormData): Promise<boolean> => {
    return await form.trigger(fieldName)
  }, [form])

  // Get field state information
  const getFieldState = useCallback((fieldName: keyof UnitFormData) => {
    const error = form.formState.errors[fieldName]
    const isTouched = validationTouched[fieldName] || form.formState.touchedFields[fieldName]

    return {
      hasError: !!error,
      isValid: !error && !!isTouched,
      isTouched: !!isTouched,
      errorMessage: error?.message,
    }
  }, [form.formState.errors, form.formState.touchedFields, validationTouched])

  return {
    form,
    isSubmitting,
    hasUnsavedChanges,
    fieldErrors,
    validationTouched,
    handleSubmit,
    handleCancel,
    handleFieldBlur,
    resetForm,
    validateField,
    getFieldState,
  }
}

// Validation utilities
export const unitValidationUtils = {
  // Check if code format is valid
  isValidCode: (code: string): boolean => {
    return /^[A-Z0-9_-]+$/.test(code) && code.trim() === code
  },

  // Format code to uppercase
  formatCode: (code: string): string => {
    return code.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  },

  // Check if name has valid length and content
  isValidName: (name: string): boolean => {
    return name.trim().length > 0 && name.length <= 50
  },

  // Trim and validate description
  formatDescription: (description?: string): string | undefined => {
    if (!description) return undefined
    const trimmed = description.trim()
    return trimmed.length === 0 ? undefined : trimmed
  },

  // Get unit type display info
  getUnitTypeInfo: (type: UnitFormData['type']) => {
    const typeInfo = {
      INVENTORY: {
        label: 'Inventory',
        description: 'Stock and warehouse tracking',
        icon: '📦',
      },
      ORDER: {
        label: 'Order',
        description: 'Purchasing and procurement',
        icon: '🛒',
      },
      RECIPE: {
        label: 'Recipe',
        description: 'Cooking and food preparation',
        icon: '👨‍🍳',
      },
    }
    return typeInfo[type]
  },

  // Character count helper
  getCharacterCount: (value: string, max: number) => {
    const current = value.length
    const percentage = (current / max) * 100
    return {
      current,
      max,
      percentage,
      isNearLimit: percentage >= 80,
      isOverLimit: percentage >= 100,
      remaining: max - current,
    }
  },
}

// Form field configurations
export const unitFormFields = {
  code: {
    label: 'Unit Code',
    placeholder: 'e.g., KG, L, PC',
    helpText: 'A unique identifier for the unit (e.g., KG, L, PC). Only uppercase letters, numbers, hyphens, and underscores allowed.',
    maxLength: 10,
    required: true,
  },
  name: {
    label: 'Unit Name',
    placeholder: 'e.g., Kilogram, Liter, Piece',
    helpText: 'Full descriptive name of the unit (e.g., Kilogram, Liter, Piece). Used in user interfaces and reports.',
    maxLength: 50,
    required: true,
  },
  description: {
    label: 'Description',
    placeholder: 'Additional details about this unit...',
    helpText: 'Optional detailed description, usage notes, or conversion information for this unit.',
    maxLength: 200,
    required: false,
  },
  type: {
    label: 'Unit Type',
    helpText: 'Category that determines where this unit can be used: Inventory (stock tracking), Order (purchasing), Recipe (cooking measurements).',
    required: true,
    options: [
      { value: 'INVENTORY', label: 'Inventory', description: 'Stock and warehouse tracking' },
      { value: 'ORDER', label: 'Order', description: 'Purchasing and procurement' },
      { value: 'RECIPE', label: 'Recipe', description: 'Cooking and food preparation' },
    ],
  },
  isActive: {
    label: 'Active Status',
    helpText: 'Active units can be used throughout the system. Inactive units are hidden from selection lists but preserved for historical data.',
    required: false,
  },
} as const