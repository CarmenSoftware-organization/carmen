'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Vendor, Address, Contact, Certification, EnvironmentalImpact } from "../types"
import { BUSINESS_TYPES } from '../../data/mock'

type VendorFieldValue = string | number | boolean | Date | Address[] | Contact[] | Certification[] | EnvironmentalImpact | undefined

interface BasicInfoSectionProps {
  vendor: Vendor
  isEditing: boolean
  onFieldChange: (field: keyof Vendor, value: VendorFieldValue) => void
}

export function BasicInfoSection({ isEditing, vendor, onFieldChange }: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Company Information</h3>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={vendor.companyName}
                onChange={(e) => onFieldChange('companyName', e.target.value as Vendor[keyof Vendor])}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber" className="text-sm font-medium">Registration No.</Label>
              <Input
                id="businessRegistrationNumber"
                name="businessRegistrationNumber"
                value={vendor.businessRegistrationNumber}
                onChange={(e) => onFieldChange('businessRegistrationNumber', e.target.value as Vendor[keyof Vendor])}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-sm font-medium">Tax ID</Label>
              <Input
                id="taxId"
                name="taxId"
                value={vendor.taxId}
                onChange={(e) => onFieldChange('taxId', e.target.value as Vendor[keyof Vendor])}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Details</h3>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessTypeId" className="text-sm font-medium">Business Type</Label>
              <Select
                value={vendor.businessTypeId}
                onValueChange={(value) => onFieldChange('businessTypeId', value as Vendor[keyof Vendor])}
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

            <div className="space-y-2">
              <Label htmlFor="establishmentDate" className="text-sm font-medium">Establishment Date</Label>
              <Input
                id="establishmentDate"
                name="establishmentDate"
                type="date"
                value={vendor.establishmentDate}
                onChange={(e) => onFieldChange('establishmentDate', e.target.value as Vendor[keyof Vendor])}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm font-medium">Rating</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={vendor.rating}
                onChange={(e) => onFieldChange('rating', parseFloat(e.target.value) as Vendor[keyof Vendor])}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
          <Separator className="mb-4" />
          <div className="flex items-center space-x-3">
            <Switch
              id="isActive"
              checked={vendor.isActive}
              onCheckedChange={(checked) => onFieldChange('isActive', checked as Vendor[keyof Vendor])}
              disabled={!isEditing}
            />
            <Label htmlFor="isActive" className="text-sm font-medium">Active Vendor</Label>
          </div>
        </div>
      </div>
    </div>
  )
} 