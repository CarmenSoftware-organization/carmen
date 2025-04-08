'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Address } from '../types'

interface AddressesSectionProps {
  addresses?: Address[]
  isEditing?: boolean
  onAddressChange?: (name: string, value: string | number | boolean) => void
  onRemoveAddress?: (address: Address) => void
}

export function AddressesSection({ addresses = [], isEditing = false, onAddressChange, onRemoveAddress }: AddressesSectionProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Primary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addresses.map((address: Address) => (
            <TableRow key={address.id}>
              <TableCell>{address.addressType}</TableCell>
              <TableCell>{address.addressLine}</TableCell>
              <TableCell>{address.isPrimary ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveAddress?.(address)}>Delete</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isEditing && (
        <Button>Add Address</Button>
      )}
    </div>
  )
} 