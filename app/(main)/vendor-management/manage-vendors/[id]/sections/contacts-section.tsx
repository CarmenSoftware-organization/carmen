'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Contact } from '@/lib/types'

interface ContactsSectionProps {
  contacts: Contact[]
  isEditing: boolean
  onContactChange: (name: string, value: any) => void
}

export function ContactsSection({ contacts, isEditing, onContactChange }: ContactsSectionProps) {
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
              <TableCell>{contact.position}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.isPrimary ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
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