"use client"

import { forwardRef } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Copy,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Character count indicator
export interface CharacterCountProps {
  current: number
  max: number
  className?: string
  showProgress?: boolean
}

export const CharacterCount = ({ 
  current, 
  max, 
  className = "", 
  showProgress = false 
}: CharacterCountProps) => {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`text-xs ${
        isOverLimit ? 'text-destructive font-medium' : 
        isNearLimit ? 'text-amber-600 font-medium' : 
        'text-muted-foreground'
      }`}>
        {current}/{max}
      </span>
      {showProgress && (
        <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              isOverLimit ? 'bg-destructive' :
              isNearLimit ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Field help tooltip
export interface FieldHelpProps {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export const FieldHelp = ({ content, side = 'top' }: FieldHelpProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

// Field validation indicator
export interface FieldValidationProps {
  isValid: boolean
  hasError: boolean
  isTouched: boolean
  isValidating?: boolean
}

export const FieldValidation = ({ 
  isValid, 
  hasError, 
  isTouched, 
  isValidating = false 
}: FieldValidationProps) => {
  if (isValidating) {
    return (
      <div className="animate-spin">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
      </div>
    )
  }

  if (hasError && isTouched) {
    return <AlertTriangle className="h-4 w-4 text-destructive" />
  }

  if (isValid && isTouched) {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }

  return null
}

// Enhanced input with validation and character count
export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number
  showCharacterCount?: boolean
  validationState?: FieldValidationProps
  helpText?: string
  onClear?: () => void
  autoFormat?: (value: string) => string
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    maxLength, 
    showCharacterCount = false, 
    validationState, 
    helpText, 
    onClear, 
    autoFormat,
    onChange,
    className = "",
    ...props 
  }, ref) => {
    const value = props.value?.toString() || ''
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value
      
      if (autoFormat) {
        newValue = autoFormat(newValue)
        e.target.value = newValue
      }
      
      onChange?.(e)
    }

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          onChange={handleChange}
          className={`
            ${validationState?.hasError ? 'border-destructive' : ''}
            ${validationState?.isValid ? 'border-green-500' : ''}
            ${showCharacterCount ? 'pr-20' : validationState ? 'pr-10' : ''}
            ${className}
          `}
          maxLength={maxLength}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {validationState && (
            <FieldValidation {...validationState} />
          )}
          
          {showCharacterCount && maxLength && (
            <CharacterCount current={value.length} max={maxLength} />
          )}
          
          {onClear && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={onClear}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {helpText && (
          <div className="mt-1 text-xs text-muted-foreground">
            {helpText}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

// Enhanced textarea with validation and character count
export interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCharacterCount?: boolean
  validationState?: FieldValidationProps
  helpText?: string
  autoResize?: boolean
  minRows?: number
  maxRows?: number
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ 
    maxLength, 
    showCharacterCount = false, 
    validationState, 
    helpText, 
    autoResize = false,
    minRows = 3,
    maxRows = 8,
    className = "",
    ...props 
  }, ref) => {
    const value = props.value?.toString() || ''

    return (
      <div className="relative">
        <Textarea
          {...props}
          ref={ref}
          className={`
            ${validationState?.hasError ? 'border-destructive' : ''}
            ${validationState?.isValid ? 'border-green-500' : ''}
            ${autoResize ? 'resize-none' : ''}
            ${className}
          `}
          maxLength={maxLength}
          rows={autoResize ? undefined : minRows}
          style={{
            ...(autoResize && {
              minHeight: `${minRows * 1.5}rem`,
              maxHeight: `${maxRows * 1.5}rem`,
            }),
          }}
        />
        
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {validationState && (
            <FieldValidation {...validationState} />
          )}
          
          {showCharacterCount && maxLength && (
            <CharacterCount current={value.length} max={maxLength} />
          )}
        </div>
        
        {helpText && (
          <div className="mt-1 text-xs text-muted-foreground">
            {helpText}
          </div>
        )}
      </div>
    )
  }
)

EnhancedTextarea.displayName = "EnhancedTextarea"

// Field error display
export interface FieldErrorProps {
  error?: string
  className?: string
}

export const FieldError = ({ error, className = "" }: FieldErrorProps) => {
  if (!error) return null

  return (
    <div className={`flex items-center gap-2 text-sm text-destructive mt-1 ${className}`}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}

// Field success message
export interface FieldSuccessProps {
  message?: string
  className?: string
}

export const FieldSuccess = ({ message, className = "" }: FieldSuccessProps) => {
  if (!message) return null

  return (
    <div className={`flex items-center gap-2 text-sm text-green-600 mt-1 ${className}`}>
      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// Copy to clipboard button
export interface CopyButtonProps {
  value: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'default'
}

export const CopyButton = ({ value, size = 'sm', variant = 'ghost' }: CopyButtonProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleCopy}
      className="h-8 w-8 p-0"
    >
      <Copy className="h-4 w-4" />
    </Button>
  )
}

// Form section with collapsible content
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  icon?: React.ReactNode
  className?: string
}

export const FormSection = ({ 
  title, 
  description, 
  children, 
  collapsible = false, 
  defaultExpanded = true,
  icon,
  className = "" 
}: FormSectionProps) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        {collapsible && (
          <Button variant="ghost" size="sm">
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Form status badge
export interface FormStatusProps {
  hasUnsavedChanges: boolean
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

export const FormStatus = ({ 
  hasUnsavedChanges, 
  isValid, 
  isDirty, 
  isSubmitting 
}: FormStatusProps) => {
  if (isSubmitting) {
    return (
      <Badge variant="outline" className="text-blue-600">
        <div className="animate-spin mr-1">
          <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
        Saving...
      </Badge>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="outline" className="text-amber-600">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Unsaved changes
      </Badge>
    )
  }

  if (isValid && isDirty) {
    return (
      <Badge variant="outline" className="text-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Ready to save
      </Badge>
    )
  }

  return null
}

export default {
  CharacterCount,
  FieldHelp,
  FieldValidation,
  EnhancedInput,
  EnhancedTextarea,
  FieldError,
  FieldSuccess,
  CopyButton,
  FormSection,
  FormStatus,
}