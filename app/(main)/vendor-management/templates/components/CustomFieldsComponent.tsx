'use client'

// Custom Fields Component for Pricelist Templates
// Phase 2 Task 4 - Custom fields configuration

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  GripVertical, 
  Type, 
  Hash, 
  Calendar, 
  List, 
  FileText,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomField } from '../../types'

interface CustomFieldsComponentProps {
  customFields: CustomField[]
  onChange: (fields: CustomField[]) => void
}

interface CustomFieldFormData {
  name: string
  type: CustomField['type']
  required: boolean
  options: string[]
  defaultValue?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
  { value: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'select', label: 'Dropdown', icon: List, description: 'Single selection from options' }
] as const

const PREDEFINED_FIELDS = [
  {
    name: 'Brand',
    type: 'text' as const,
    required: false,
    description: 'Product brand or manufacturer'
  },
  {
    name: 'Model Number',
    type: 'text' as const,
    required: false,
    description: 'Product model or SKU'
  },
  {
    name: 'Packaging',
    type: 'select' as const,
    required: false,
    options: ['Each', 'Case', 'Box', 'Bag', 'Pallet'],
    description: 'Packaging unit type'
  },
  {
    name: 'Shelf Life',
    type: 'number' as const,
    required: false,
    description: 'Shelf life in days'
  },
  {
    name: 'Country of Origin',
    type: 'text' as const,
    required: false,
    description: 'Manufacturing country'
  },
  {
    name: 'Certification',
    type: 'select' as const,
    required: false,
    options: ['Organic', 'Fair Trade', 'Non-GMO', 'Kosher', 'Halal', 'None'],
    description: 'Product certifications'
  },
  {
    name: 'Temperature Storage',
    type: 'select' as const,
    required: false,
    options: ['Frozen (-18°C)', 'Refrigerated (0-4°C)', 'Cool (10-15°C)', 'Room Temperature'],
    description: 'Required storage temperature'
  }
]

export default function CustomFieldsComponent({ customFields, onChange }: CustomFieldsComponentProps) {
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [formData, setFormData] = useState<CustomFieldFormData>({
    name: '',
    type: 'text',
    required: false,
    options: []
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [optionInput, setOptionInput] = useState('')

  const openCreateDialog = () => {
    setEditingField(null)
    setFormData({
      name: '',
      type: 'text',
      required: false,
      options: []
    })
    setDialogOpen(true)
  }

  const openEditDialog = (field: CustomField) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options || [],
      defaultValue: field.defaultValue,
      validation: field.validation
    })
    setDialogOpen(true)
  }

  const addPredefinedField = (predefinedField: typeof PREDEFINED_FIELDS[0]) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: predefinedField.name,
      type: predefinedField.type,
      required: predefinedField.required,
      options: predefinedField.options || []
    }
    onChange([...customFields, newField])
  }

  const saveField = () => {
    if (!formData.name.trim()) return

    const fieldData: CustomField = {
      id: editingField?.id || Date.now().toString(),
      name: formData.name.trim(),
      type: formData.type,
      required: formData.required,
      options: formData.options,
      defaultValue: formData.defaultValue,
      validation: formData.validation
    }

    if (editingField) {
      // Update existing field
      const updatedFields = customFields.map(field =>
        field.id === editingField.id ? fieldData : field
      )
      onChange(updatedFields)
    } else {
      // Add new field
      onChange([...customFields, fieldData])
    }

    setDialogOpen(false)
  }

  const deleteField = (fieldId: string) => {
    onChange(customFields.filter(field => field.id !== fieldId))
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = customFields.findIndex(field => field.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= customFields.length) return

    const newFields = [...customFields]
    const [movedField] = newFields.splice(currentIndex, 1)
    newFields.splice(newIndex, 0, movedField)
    onChange(newFields)
  }

  const addOption = () => {
    if (!optionInput.trim()) return
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, optionInput.trim()]
    }))
    setOptionInput('')
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const getFieldIcon = (type: CustomField['type']) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type)
    const Icon = fieldType?.icon || Type
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">
            Add custom fields for vendors to provide additional product information
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* Predefined Fields */}
      {customFields.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Add Common Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREDEFINED_FIELDS.map((field, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{field.name}</div>
                    <div className="text-xs text-muted-foreground">{field.description}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addPredefinedField(field)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Fields List */}
      {customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Fields ({customFields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === customFields.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getFieldIcon(field.type)}
                      <span className="font-medium">{field.name}</span>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {FIELD_TYPES.find(ft => ft.value === field.type)?.label}
                      </Badge>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Options: {field.options.join(', ')}
                      </div>
                    )}
                    {field.defaultValue && (
                      <div className="text-sm text-muted-foreground">
                        Default: {field.defaultValue}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(field)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteField(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Field Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
            </DialogTitle>
            <DialogDescription>
              Configure a custom field for vendors to fill out when submitting pricing information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldName">Field Name *</Label>
                <Input
                  id="fieldName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter field name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fieldType">Field Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    type: value as CustomField['type'],
                    options: value === 'select' ? prev.options : []
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div>{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="required">Required Field</Label>
                <p className="text-sm text-muted-foreground">
                  Vendors must fill out this field to submit their pricing
                </p>
              </div>
              <Switch
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
              />
            </div>

            {formData.type === 'select' && (
              <div>
                <Label>Options</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Enter option"
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button onClick={addOption} disabled={!optionInput.trim()}>
                      Add
                    </Button>
                  </div>
                  {formData.options.length > 0 && (
                    <div className="space-y-1">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{option}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(formData.type === 'text' || formData.type === 'textarea') && (
              <div>
                <Label htmlFor="defaultValue">Default Value (Optional)</Label>
                <Input
                  id="defaultValue"
                  value={formData.defaultValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder="Enter default value"
                  className="mt-1"
                />
              </div>
            )}

            {formData.type === 'number' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minValue">Minimum Value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    value={formData.validation?.min || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxValue">Maximum Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={formData.validation?.max || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveField} disabled={!formData.name.trim()}>
              {editingField ? 'Update Field' : 'Create Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}