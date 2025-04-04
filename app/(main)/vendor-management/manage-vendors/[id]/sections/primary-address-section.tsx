'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Address } from "../types"

interface PrimaryAddressSectionProps {
  address: Address | null
  isEditing: boolean
  onFieldChange: (name: string, value: string) => void
}

export function PrimaryAddressSection({
  address,
  isEditing,
  onFieldChange,
}: PrimaryAddressSectionProps) {
  if (!address) return null

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <p className="text-sm font-medium">{address.addressLine}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
          <p className="text-sm font-medium">{address.postalCode}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Address Type</p>
          <p className="text-sm font-medium">{address.addressType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Primary</p>
          <p className="text-sm font-medium">{address.isPrimary ? "Yes" : "No"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="addressLine">Address</Label>
        <Input
          id="addressLine"
          value={address.addressLine}
          onChange={(e) => onFieldChange("addressLine", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          value={address.postalCode}
          onChange={(e) => onFieldChange("postalCode", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="addressType">Address Type</Label>
        <Input
          id="addressType"
          value={address.addressType}
          onChange={(e) => onFieldChange("addressType", e.target.value)}
        />
      </div>
    </div>
  )
} 