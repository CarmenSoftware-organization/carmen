'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Vendor, Certification } from '../types'

interface CertificationsSectionProps {
  certifications: Certification[]
  onUpdate?: (certifications: Certification[]) => void
  isEditing: boolean
  vendor?: Vendor
  onCertificationChange: (name: keyof Certification, value: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  onFieldChange?: (field: keyof Vendor, value: Vendor[keyof Vendor]) => void
}

export function CertificationsSection({ isEditing, vendor, certifications, onCertificationChange, onFieldChange }: CertificationsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'expired':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Issuer</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell className="font-medium">{cert.name}</TableCell>
              <TableCell>{cert.issuer}</TableCell>
              <TableCell>{cert.validUntil}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  className={`${getStatusColor(cert.status)} text-white`}
                >
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </Badge>
              </TableCell>
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
        <Button variant="outline" size="sm">
          Add Certification
        </Button>
      )}
    </div>
  )
} 