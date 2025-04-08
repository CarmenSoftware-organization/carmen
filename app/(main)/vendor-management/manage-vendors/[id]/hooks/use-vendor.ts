import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateVendor } from '../../actions'
import { Vendor, EnvironmentalImpact } from '../types'

'use client'


// No need to extend Vendor since our local type already has environmentalImpact
type VendorWithEnvironmental = Vendor

type FieldValue = string | number | boolean | Date | null;

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
      } catch (error) {
        console.error('Error fetching vendor:', error)
        toast.error("Error fetching vendor", {
          description: "There was a problem loading the vendor details."
        })
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
      toast.error("Error updating vendor", {
        description: result.error
      })
      return
    }

    toast.success("Vendor updated", {
      description: "The vendor has been updated successfully."
    })
    
    setIsEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    try {
      // Mock delete success
      toast.success("Vendor deleted", {
        description: "The vendor has been deleted successfully."
      })
      router.push('/vendor-management/manage-vendors')
    } catch (error) {
      toast.error("Error deleting vendor", {
        description: "There was a problem deleting the vendor."
      })
    }
  }

  const handleFieldChange = (name: string, value: FieldValue) => {
    setVendor(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  const updateVendor = async (updatedData: Partial<Vendor>) => {
    try {
      // Simulating API call with mock data
      if (!vendor) {
        return { success: false, error: "Vendor not found" }
      }
      
      const updatedVendor: Vendor = {
        ...vendor,
        ...updatedData
      }
      
      setVendor(updatedVendor)
      toast.success("Vendor updated", {
        description: "The vendor has been updated successfully."
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating vendor:', error)
      toast.error("Error updating vendor", {
        description: "There was a problem updating the vendor."
      })
      return { success: false, error: "There was a problem updating the vendor." }
    }
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