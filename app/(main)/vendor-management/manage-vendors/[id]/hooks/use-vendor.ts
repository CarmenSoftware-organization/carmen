'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { updateVendor } from '../../actions'
import { Vendor, EnvironmentalImpact } from '../types'

// No need to extend Vendor since our local type already has environmentalImpact
type VendorWithEnvironmental = Vendor

export function useVendor(id: string) {
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorWithEnvironmental | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVendor() {
      try {
        setIsLoading(true)
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock vendor data
        const mockVendor: VendorWithEnvironmental = {
          id,
          companyName: 'Acme Corp',
          businessRegistrationNumber: 'BR123456',
          taxId: 'TAX123456',
          establishmentDate: '2000-01-01',
          businessTypeId: 'BT001',
          rating: 4.5,
          isActive: true,
          addresses: [],
          contacts: [],
          certifications: [
            {
              id: 'cert1',
              name: 'ISO 9001',
              status: 'active',
              issuer: 'ISO',
              validUntil: '2025-12-31'
            }
          ],
          environmentalImpact: {
            carbonFootprint: {
              value: 2450,
              unit: 'tCO2e',
              trend: -12
            },
            energyEfficiency: {
              value: 85,
              benchmark: 80,
              trend: 5
            },
            wasteReduction: {
              value: 45,
              trend: 15
            },
            complianceRate: {
              value: 98,
              trend: 3
            },
            lastUpdated: '2024-03-15',
            esgScore: 'A+',
            certifications: [
              {
                name: 'ISO 14001',
                status: 'Active',
                expiry: '2025-12-31'
              }
            ]
          }
        }
        
        setVendor(mockVendor)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchVendor()
    }
  }, [id])

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => setIsEditing(false)

  const handleSave = async () => {
    if (!vendor) return

    const result = await updateVendor(vendor)
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Vendor updated successfully"
    })
    
    setIsEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    try {
      // Mock delete success
      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      })
      router.push('/vendor-management/manage-vendors')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      })
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setVendor(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  return {
    vendor,
    isLoading,
    error,
    isEditing,
    isDeleting,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    handleFieldChange,
    setIsDeleting
  }
} 