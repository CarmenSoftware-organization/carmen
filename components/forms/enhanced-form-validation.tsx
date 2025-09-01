'use client'

import React from 'react'
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form'
import { z, ZodSchema } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading'
import { enhancedToast } from '@/components/ui/enhanced-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Enhanced validation states
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning'

// Field validation result
export interface FieldValidationResult {
  state: ValidationState
  message?: string
  suggestions?: string[]
  severity?: 'error' | 'warning' | 'info'
}

// Async validation function
export type AsyncValidator<T = any> = (
  value: T,
  formData?: FieldValues
) => Promise<FieldValidationResult>

// Enhanced field configuration
export interface EnhancedFieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio'
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  autoComplete?: string
  options?: { value: string; label: string; disabled?: boolean }[]
  asyncValidators?: AsyncValidator[]
  validationDelay?: number
  showValidationState?: boolean
  showCharacterCount?: boolean
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  customValidation?: (value: any) => string | undefined
  helpText?: string
  icon?: React.ReactNode
  adornment?: React.ReactNode
  className?: string
  inputClassName?: string
  wrapperClassName?: string
}

// Enhanced field validation hook
export function useFieldValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldConfig: EnhancedFieldConfig
) {
  const [validationState, setValidationState] = React.useState<ValidationState>('idle')
  const [validationMessage, setValidationMessage] = React.useState<string>()
  const [isValidating, setIsValidating] = React.useState(false)
  const validationTimeoutRef = React.useRef<NodeJS.Timeout>()
  
  const fieldName = fieldConfig.name as FieldPath<T>
  const fieldValue = form.watch(fieldName)
  const fieldError = form.formState.errors[fieldName]

  // Debounced async validation
  React.useEffect(() => {
    if (!fieldConfig.asyncValidators || fieldConfig.asyncValidators.length === 0) {
      return
    }

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    // Skip validation if field is empty and not required
    if (!fieldValue && !fieldConfig.required) {
      setValidationState('idle')
      setValidationMessage(undefined)
      return
    }

    // Set up debounced validation
    const delay = fieldConfig.validationDelay || 500
    validationTimeoutRef.current = setTimeout(async () => {
      setIsValidating(true)
      setValidationState('validating')

      try {
        const formData = form.getValues()
        
        // Run all async validators
        const results = await Promise.all(
          fieldConfig.asyncValidators!.map(validator => validator(fieldValue, formData))
        )

        // Find the first error or warning
        const errorResult = results.find(r => r.state === 'invalid')
        const warningResult = results.find(r => r.state === 'warning')
        const result = errorResult || warningResult || { state: 'valid' as ValidationState }

        setValidationState(result.state)
        setValidationMessage(result.message)

        // Set custom form error if validation failed
        if (result.state === 'invalid' && result.message) {
          form.setError(fieldName, {
            type: 'async',
            message: result.message
          })
        } else if (result.state === 'valid') {
          form.clearErrors(fieldName)
        }
      } catch (error) {
        console.error('Async validation error:', error)
        setValidationState('invalid')
        setValidationMessage('Validation failed')
      } finally {
        setIsValidating(false)
      }
    }, delay)

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [fieldValue, fieldConfig.asyncValidators, fieldConfig.validationDelay, fieldConfig.required, form, fieldName])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  return {
    validationState,
    validationMessage,
    isValidating,
    hasError: !!fieldError,
    errorMessage: fieldError?.message as string | undefined
  }
}

// Validation state indicator
function ValidationStateIndicator({ 
  state, 
  isValidating,
  className 
}: { 
  state: ValidationState
  isValidating: boolean
  className?: string 
}) {
  if (isValidating) {
    return <LoadingSpinner size="sm" className={cn('text-blue-500', className)} />
  }

  switch (state) {
    case 'valid':
      return <CheckCircle className={cn('h-4 w-4 text-green-500', className)} />
    case 'invalid':
      return <AlertCircle className={cn('h-4 w-4 text-red-500', className)} />
    case 'warning':
      return <AlertTriangle className={cn('h-4 w-4 text-yellow-500', className)} />
    default:
      return null
  }
}

// Enhanced form field component
export function EnhancedFormField<T extends FieldValues>({
  form,
  config,
  children
}: {
  form: UseFormReturn<T>
  config: EnhancedFieldConfig
  children?: React.ReactNode
}) {
  const [showPassword, setShowPassword] = React.useState(false)
  const fieldName = config.name as FieldPath<T>
  const fieldValue = form.watch(fieldName)
  
  const {
    validationState,
    validationMessage,
    isValidating,
    hasError,
    errorMessage
  } = useFieldValidation(form, config)

  const showValidation = config.showValidationState && (validationState !== 'idle' || hasError)
  const characterCount = fieldValue?.length || 0
  const isOverLimit = config.maxLength ? characterCount > config.maxLength : false
  const isNearLimit = config.maxLength ? characterCount > config.maxLength * 0.8 : false

  const getFieldProps = () => ({
    ...form.register(fieldName),
    disabled: config.disabled || form.formState.isSubmitting,
    readOnly: config.readOnly,
    placeholder: config.placeholder,
    autoComplete: config.autoComplete,
    className: cn(
      'transition-all duration-200',
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      validationState === 'valid' && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      validationState === 'warning' && 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
      config.inputClassName
    )
  })

  const renderField = () => {
    switch (config.type) {
      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              {...getFieldProps()}
              rows={4}
            />
            {showValidation && (
              <div className="absolute right-3 top-3">
                <ValidationStateIndicator state={validationState} isValidating={isValidating} />
              </div>
            )}
          </div>
        )

      case 'password':
        return (
          <div className="relative">
            <Input
              {...getFieldProps()}
              type={showPassword ? 'text' : 'password'}
              className="pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {showValidation && (
                <ValidationStateIndicator state={validationState} isValidating={isValidating} />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        )

      case 'select':
        return (
          <Controller
            name={fieldName}
            control={form.control}
            render={({ field }) => (
              <div className="relative">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={config.disabled || form.formState.isSubmitting}
                >
                  <SelectTrigger className={getFieldProps().className}>
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {config.options?.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <ValidationStateIndicator state={validationState} isValidating={isValidating} />
                  </div>
                )}
              </div>
            )}
          />
        )

      case 'checkbox':
        return (
          <Controller
            name={fieldName}
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={config.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={config.disabled || form.formState.isSubmitting}
                />
                <Label 
                  htmlFor={config.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {config.label}
                </Label>
                {showValidation && (
                  <ValidationStateIndicator state={validationState} isValidating={isValidating} />
                )}
              </div>
            )}
          />
        )

      case 'radio':
        return (
          <Controller
            name={fieldName}
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={config.disabled || form.formState.isSubmitting}
              >
                {config.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )

      default:
        return (
          <div className="relative">
            <Input
              {...getFieldProps()}
              type={config.type || 'text'}
              className={cn(
                showValidation && 'pr-10',
                config.inputClassName
              )}
            />
            {config.adornment && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground">
                {config.adornment}
              </div>
            )}
            {showValidation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationStateIndicator state={validationState} isValidating={isValidating} />
              </div>
            )}
          </div>
        )
    }
  }

  // Don't render wrapper for checkbox and radio types
  if (config.type === 'checkbox' || config.type === 'radio') {
    return renderField()
  }

  return (
    <div className={cn('space-y-2', config.wrapperClassName)}>
      {/* Label and help text */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={config.name} className="text-sm font-medium">
            {config.label}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {config.helpText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{config.helpText}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Character count */}
        {config.showCharacterCount && config.maxLength && (
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs',
              isOverLimit && 'text-red-500',
              isNearLimit && !isOverLimit && 'text-yellow-600',
              !isNearLimit && 'text-muted-foreground'
            )}>
              {characterCount}/{config.maxLength}
            </span>
            {isOverLimit && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Over limit
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {config.description && (
        <p className="text-sm text-muted-foreground">{config.description}</p>
      )}

      {/* Field input */}
      {renderField()}

      {/* Validation messages */}
      <div className="min-h-[1.25rem]">
        {hasError && errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {!hasError && validationMessage && (
          <Alert className={cn(
            validationState === 'warning' && 'border-yellow-200 bg-yellow-50',
            validationState === 'valid' && 'border-green-200 bg-green-50'
          )}>
            <ValidationStateIndicator state={validationState} isValidating={isValidating} />
            <AlertDescription className={cn(
              'text-sm',
              validationState === 'warning' && 'text-yellow-800',
              validationState === 'valid' && 'text-green-800'
            )}>
              {validationMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Custom children */}
      {children}
    </div>
  )
}

// Form validation summary component
export function FormValidationSummary<T extends FieldValues>({
  form,
  className
}: {
  form: UseFormReturn<T>
  className?: string
}) {
  const { errors, isValid, isSubmitting } = form.formState
  const errorCount = Object.keys(errors).length

  if (errorCount === 0) return null

  return (
    <Alert className={cn('border-red-200 bg-red-50', className)}>
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium text-red-800">
            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before submitting:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error?.message as string}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Enhanced submit button with form state integration
export function EnhancedSubmitButton<T extends FieldValues>({
  form,
  children = 'Submit',
  successMessage = 'Form submitted successfully',
  className,
  ...props
}: {
  form: UseFormReturn<T>
  children?: React.ReactNode
  successMessage?: string
  className?: string
} & React.ComponentProps<typeof Button>) {
  const { isSubmitting, isValid, errors } = form.formState
  const errorCount = Object.keys(errors).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await form.handleSubmit(async (data) => {
        // Form submission logic would be handled by the parent component
        // This is just for the loading state
      })()
      
      enhancedToast.success(successMessage)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !isValid}
      className={cn('relative', className)}
      onClick={handleSubmit}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          {children}
          {errorCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 h-5 min-w-[1.25rem] text-xs"
            >
              {errorCount}
            </Badge>
          )}
        </>
      )}
    </Button>
  )
}

// Common async validators
export const commonAsyncValidators = {
  // Email uniqueness check
  uniqueEmail: (apiEndpoint: string): AsyncValidator<string> => async (email) => {
    if (!email || !email.includes('@')) {
      return { state: 'idle' }
    }

    try {
      // Simulate API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      const isUnique = Math.random() > 0.3 // Simulate 70% unique emails
      
      return isUnique
        ? { state: 'valid', message: 'Email is available' }
        : { state: 'invalid', message: 'Email is already in use' }
    } catch (error) {
      return { state: 'invalid', message: 'Unable to verify email' }
    }
  },

  // Username availability
  usernameAvailable: (): AsyncValidator<string> => async (username) => {
    if (!username || username.length < 3) {
      return { state: 'idle' }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const isAvailable = !['admin', 'user', 'test'].includes(username.toLowerCase())
      
      return isAvailable
        ? { state: 'valid', message: 'Username is available' }
        : { state: 'invalid', message: 'Username is not available' }
    } catch (error) {
      return { state: 'invalid', message: 'Unable to check username' }
    }
  },

  // Password strength
  passwordStrength: (): AsyncValidator<string> => async (password) => {
    if (!password) return { state: 'idle' }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)
    const isLongEnough = password.length >= 8

    const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length

    if (score < 3) {
      return { 
        state: 'invalid', 
        message: 'Password is too weak',
        suggestions: [
          'Use at least 8 characters',
          'Include uppercase and lowercase letters',
          'Add numbers and special characters'
        ]
      }
    } else if (score < 5) {
      return { 
        state: 'warning', 
        message: 'Password strength: Good' 
      }
    } else {
      return { 
        state: 'valid', 
        message: 'Password strength: Excellent' 
      }
    }
  }
}

export default EnhancedFormField