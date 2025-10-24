'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { useVendor as useVendorQuery, useUpdateVendor, useDeleteVendor } from '@/lib/hooks'
import type { Vendor } from '@/lib/types/vendor'

export function useVendor(id: string) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [vendorData, setVendorData] = useState<Vendor | null>(null)

  // Use React Query hooks for data fetching and mutations
  const { 
    data: vendor, 
    isLoading, 
    error,
    refetch
  } = useVendorQuery(id, { enabled: !!id })

  const updateVendorMutation = useUpdateVendor()
  const deleteVendorMutation = useDeleteVendor()

  // Update local state when vendor data changes
  React.useEffect(() => {
    if (vendor && !vendorData) {
      setVendorData(vendor)
    }
  }, [vendor, vendorData])

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    setIsEditing(false)
    // Reset changes by reverting to original data
    setVendorData(vendor || null)
  }

  const handleSave = async () => {
    if (!vendorData || !vendor) return

    try {
      // Extract id from vendorData and pass the rest
      const { id, ...vendorUpdates } = vendorData
      await updateVendorMutation.mutateAsync({
        id: vendor.id,
        ...vendorUpdates
      })

      setIsEditing(false)
      // Refresh data to get latest from server
      refetch()
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to update vendor:', error)
    }
  }

  const handleDelete = async () => {
    if (!vendor) return

    try {
      setIsDeleting(true)
      await deleteVendorMutation.mutateAsync(vendor.id)
      
      // Navigate back to vendor list after successful deletion
      router.push('/vendor-management/manage-vendors')
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete vendor:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setVendorData(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  const isLoadingMutation = updateVendorMutation.isPending || deleteVendorMutation.isPending

  return {
    vendor: vendorData || vendor,
    isLoading: isLoading || isLoadingMutation,
    error: error?.message,
    isEditing,
    isDeleting: isDeleting || deleteVendorMutation.isPending,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    handleFieldChange,
    setIsDeleting,
    refetch,
    // Additional state for mutations
    isSaving: updateVendorMutation.isPending
  }
} 