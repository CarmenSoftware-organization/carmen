'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Vendor, Contact } from '../types'

interface ContactsSectionProps {
  contacts: Contact[]
  onUpdate?: (contacts: Contact[]) => void
  isEditing: boolean
  vendor?: Vendor
  onContactChange: (name: keyof Contact, value: Contact[keyof Contact]) => void
  onFieldChange?: (field: keyof Vendor, value: Vendor[keyof Vendor]) => void
  onRemoveContact?: (contact: Contact) => void
}

export function ContactsSection({ isEditing, vendor, contacts, onContactChange, onFieldChange, onRemoveContact }: ContactsSectionProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Primary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact: Contact) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.position || contact.role}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.isPrimary ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveContact && onRemoveContact(contact)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isEditing && (
        <Button>Add Contact</Button>
      )}
    </div>
  )
} 