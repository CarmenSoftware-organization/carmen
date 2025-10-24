'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vendor } from '@/lib/types'
import { BUSINESS_TYPES } from '../../data/mock'

interface BasicInfoSectionProps {
  vendor: Vendor
  isEditing: boolean
  onFieldChange: (name: string, value: any) => void
}

export function BasicInfoSection({ vendor, isEditing, onFieldChange }: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            value={vendor.companyName}
            onChange={(e) => onFieldChange('companyName', e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessRegistrationNumber">Registration No.</Label>
          <Input
            id="businessRegistrationNumber"
            name="businessRegistrationNumber"
            value={vendor.businessRegistrationNumber}
            onChange={(e) => onFieldChange('businessRegistrationNumber', e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            name="taxId"
            value={vendor.taxId}
            onChange={(e) => onFieldChange('taxId', e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Select
            value={vendor.businessType}
            onValueChange={(value) => onFieldChange('businessType', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="establishmentDate">Establishment Date</Label>
          <Input
            id="establishmentDate"
            name="establishmentDate"
            type="date"
            value={vendor.establishmentDate}
            onChange={(e) => onFieldChange('establishmentDate', e.target.value)}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={vendor.rating}
            onChange={(e) => onFieldChange('rating', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={vendor.isActive}
            onCheckedChange={(checked) => onFieldChange('isActive', checked)}
            disabled={!isEditing}
          />
          <Label htmlFor="isActive">Active Vendor</Label>
        </div>
      </div>
    </div>
  )
} 