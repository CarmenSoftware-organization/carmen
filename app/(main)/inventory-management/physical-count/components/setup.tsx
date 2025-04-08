'use client'

import React, { useEffect, useCallback } from 'react'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockDepartments } from '@/lib/mock/inventory-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SetupFormData {
  counterName: string
  department: string
  dateTime: Date
  notes: string
  type: string
}

interface SetupProps {
  formData: SetupFormData
  setFormData: (data: SetupFormData) => void
  onNext: () => void
}

export function PhysicalCountSetup({ formData, setFormData, onNext }: SetupProps) {
  useEffect(() => {
    // Auto-fill counter name from user context
    if (!formData.counterName) { // Only set if not already set
      setFormData({
        ...formData,
        counterName: 'John Doe', // Replace with actual user name from context
      })
    }
  }, [formData, setFormData]) // Add formData dependency

  useEffect(() => {
    if (!formData.type) {
      setFormData({ ...formData, type: 'full' }) // Restore spread
    }
  }, [formData, setFormData]) // Add formData dependency

  const handleInputChange = useCallback((field: keyof SetupFormData, value: string | Date) => {
    setFormData({
      ...formData, // Restore spread
      [field]: value,
    })
  }, [formData, setFormData]) // Restore formData dependency for useCallback

  const handleDateChange = useCallback((value: Date | undefined) => {
    if (value) {
      handleInputChange('dateTime', value)
    }
  }, [handleInputChange])

  const isValid = formData.department && formData.dateTime

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Count Setup</CardTitle>
        <CardDescription>
          Enter the basic information needed to start a physical count.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counter Name */}
        <div className="space-y-2">
          <Label htmlFor="counterName">Counter Name</Label>
          <Input
            id="counterName"
            type="text"
            value={formData.counterName}
            disabled
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleInputChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {mockDepartments
                .filter(dept => dept.status === 'active')
                .map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date/Time */}
        <div className="space-y-2">
          <Label htmlFor="dateTime">
            Date & Time <span className="text-destructive">*</span>
          </Label>
          <DateTimePicker
            value={formData.dateTime}
            onChange={handleDateChange}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            className="min-h-[120px] resize-y"
          />
        </div>

        <div className="pt-4">
          <Button
            className="w-full"
            onClick={onNext}
            disabled={!isValid}
          >
            Continue to Location Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
