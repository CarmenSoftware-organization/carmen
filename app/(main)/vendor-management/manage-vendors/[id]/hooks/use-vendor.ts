'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { updateVendor } from '../../actions'
import { Vendor } from '../../../types'
import { mockVendors } from '../../../lib/mock-data'

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
        
        // Use centralized mock data
        const mockVendor = mockVendors.find(v => v.id === id) || mockVendors[0]
        
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
    
    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : "Failed to update vendor"
      toast({
        title: "Error",
        description: errorMessage,
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