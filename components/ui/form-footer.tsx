"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle, Edit, Loader2, X } from 'lucide-react'

interface FormFooterProps {
  mode: 'view' | 'edit' | 'add' | 'confirm'
  onSave?: () => void
  onCancel?: () => void
  onEdit?: () => void
  onDelete?: () => void
  additionalActions?: ActionItem[]
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
  onDelete,
  additionalActions = [],
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
          <>
            {/* Additional actions in view mode */}
            {additionalActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                className={cn("h-9", action.className)}
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}
            
            {/* Primary Edit action */}
            {onEdit && (
              <Button onClick={onEdit} size="sm" className="h-9">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </>
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
              disabled={isLoading || (!hasChanges && mode === 'edit')}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {mode === 'confirm' ? 'Confirm & Save' : 'Save'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export interface ActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: () => void
  disabled?: boolean
  className?: string
}

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

export function FloatingActionMenu({
  position = 'bottom-right',
  actions,
  summary,
  visible,
  className
}: FloatingActionMenuProps) {
  if (!visible || actions.length === 0) return null
  
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
            variant={action.variant || 'default'}
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