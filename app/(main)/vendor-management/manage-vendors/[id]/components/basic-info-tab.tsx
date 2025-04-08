'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Vendor } from '../types'



interface BasicInfoTabProps {
  vendor: Vendor
  isEditing: boolean
  onFieldChange: (name: keyof Vendor, value: Vendor[keyof Vendor]) => void
}

export function BasicInfoTab({ vendor, isEditing, onFieldChange }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            value={vendor.companyName}
            onChange={(e) => onFieldChange('companyName', e.target.value as Vendor[keyof Vendor])}
            disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
          <Input
            id="businessRegistrationNumber"
            name="businessRegistrationNumber"
            value={vendor.businessRegistrationNumber || ''}
            onChange={(e) => onFieldChange('businessRegistrationNumber', e.target.value as Vendor[keyof Vendor])}
            disabled={!isEditing}
          />
        </div>
        
        {/* Add other fields similarly */}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={vendor.isActive}
          onCheckedChange={(checked) => onFieldChange('isActive', checked as Vendor[keyof Vendor])}
          disabled={!isEditing}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
    </div>
  )
} 