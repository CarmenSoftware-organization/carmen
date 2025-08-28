/**
 * Permission Hooks Usage Examples
 * 
 * This file demonstrates how to use the permission management hooks
 * in various real-world scenarios within the Carmen ERP system.
 */

import React from 'react'
import { 
  usePermission,
  useBulkPermissions,
  useUserPermissions,
  usePermissionValidation,
  useHasPermission,
  useResourcePermissions,
  useFormPermissionGuard,
  usePermissionLogic
} from './use-permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

/**
 * Example 1: Basic Permission Check
 * Check if user can create purchase requests
 */
export function CreatePurchaseRequestButton() {
  const { hasPermission, isLoading, reason } = useHasPermission(
    'purchase-request',
    'create'
  )

  if (isLoading) {
    return <Button disabled>Loading...</Button>
  }

  return (
    <Button 
      disabled={!hasPermission}
      title={!hasPermission ? reason : undefined}
    >
      Create Purchase Request
    </Button>
  )
}

/**
 * Example 2: Bulk Permission Checks
 * Check multiple permissions at once for efficiency
 */
export function PurchaseRequestActions({ purchaseRequestId }: { purchaseRequestId: string }) {
  const { data: permissions, isLoading } = useBulkPermissions({
    permissions: [
      { resourceType: 'purchase-request', action: 'read', resourceId: purchaseRequestId },
      { resourceType: 'purchase-request', action: 'update', resourceId: purchaseRequestId },
      { resourceType: 'purchase-request', action: 'approve', resourceId: purchaseRequestId },
      { resourceType: 'purchase-request', action: 'delete', resourceId: purchaseRequestId },
    ]
  })

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  const canRead = permissions?.results.find(r => r.action === 'read')?.allowed ?? false
  const canUpdate = permissions?.results.find(r => r.action === 'update')?.allowed ?? false
  const canApprove = permissions?.results.find(r => r.action === 'approve')?.allowed ?? false
  const canDelete = permissions?.results.find(r => r.action === 'delete')?.allowed ?? false

  if (!canRead) {
    return <Alert><AlertDescription>You don't have permission to view this purchase request.</AlertDescription></Alert>
  }

  return (
    <div className="flex gap-2">
      <Button disabled={!canUpdate}>Edit</Button>
      <Button disabled={!canApprove} variant="default">Approve</Button>
      <Button disabled={!canDelete} variant="destructive">Delete</Button>
    </div>
  )
}

/**
 * Example 3: Resource Permissions Helper
 * Get all standard permissions for a resource type
 */
export function ProductManagementPanel({ productId }: { productId?: string }) {
  const {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canWrite,
    isLoading
  } = useResourcePermissions('product', productId)

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>Read Access: <Badge variant={canRead ? 'success' : 'secondary'}>{canRead ? 'Yes' : 'No'}</Badge></div>
          <div>Write Access: <Badge variant={canWrite ? 'success' : 'secondary'}>{canWrite ? 'Yes' : 'No'}</Badge></div>
          
          <div className="flex gap-2 mt-4">
            {canCreate && <Button>Create Product</Button>}
            {canUpdate && productId && <Button variant="outline">Edit Product</Button>}
            {canDelete && productId && <Button variant="destructive">Delete Product</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Example 4: Form Validation with Permissions
 * Validate permissions before allowing form submission
 */
export function VendorCreationForm() {
  const { 
    checkPermissionsAndSubmit, 
    validationErrors, 
    isValidating, 
    hasErrors 
  } = useFormPermissionGuard([
    {
      resourceType: 'vendor',
      action: 'create',
      message: 'You need vendor creation permissions to submit this form',
      required: true
    },
    {
      resourceType: 'vendor-price-list',
      action: 'create',
      message: 'You need price list permissions to set vendor prices',
      required: false
    }
  ])

  const handleSubmit = async () => {
    await checkPermissionsAndSubmit(async () => {
      // Actual form submission logic here
      console.log('Creating vendor...')
      alert('Vendor created successfully!')
    })
  }

  return (
    <form className="space-y-4">
      <div>
        <input type="text" placeholder="Vendor Name" className="w-full p-2 border rounded" />
      </div>
      
      {hasErrors && (
        <Alert>
          <AlertDescription>
            Permission Issues:
            <ul className="mt-2 space-y-1">
              {Object.entries(validationErrors).map(([key, message]) => (
                <li key={key} className="text-sm">• {message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="button"
        onClick={handleSubmit}
        disabled={isValidating}
      >
        {isValidating ? 'Checking Permissions...' : 'Create Vendor'}
      </Button>
    </form>
  )
}

/**
 * Example 5: Permission Logic Combinations
 * Check complex permission combinations with AND/OR logic
 */
export function FinancialReportsAccess() {
  // User needs either finance read permissions OR manager role permissions
  const { hasPermission: canAccessReports, isLoading } = usePermissionLogic(
    [
      { resourceType: 'financial-report', action: 'read' },
      { resourceType: 'department-budget', action: 'read' },
      { resourceType: 'audit-log', action: 'read' }
    ],
    'OR' // User needs at least one of these permissions
  )

  // User needs ALL of these permissions for full financial access
  const { hasPermission: hasFullAccess } = usePermissionLogic(
    [
      { resourceType: 'financial-report', action: 'read' },
      { resourceType: 'financial-report', action: 'export' },
      { resourceType: 'department-budget', action: 'read' },
      { resourceType: 'payment', action: 'approve' }
    ],
    'AND' // User needs ALL of these permissions
  )

  if (isLoading) {
    return <div>Loading permissions...</div>
  }

  if (!canAccessReports) {
    return <Alert><AlertDescription>You don't have access to financial reports.</AlertDescription></Alert>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Access Level: <Badge variant={hasFullAccess ? 'success' : 'secondary'}>
              {hasFullAccess ? 'Full Access' : 'Limited Access'}
            </Badge></p>
            
            <div className="flex gap-2">
              <Button>View Reports</Button>
              {hasFullAccess && (
                <>
                  <Button variant="outline">Export Data</Button>
                  <Button variant="outline">Approve Payments</Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Example 6: User Permissions Dashboard
 * Show all permissions for current user
 */
export function UserPermissionsDashboard() {
  const { data: permissions, isLoading, error } = useUserPermissions()

  if (isLoading) {
    return <div>Loading user permissions...</div>
  }

  if (error) {
    return <Alert><AlertDescription>Error loading permissions: {error.message}</AlertDescription></Alert>
  }

  if (!permissions || permissions.length === 0) {
    return <Alert><AlertDescription>No permissions found for current user.</AlertDescription></Alert>
  }

  // Group permissions by resource type
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resourceType]) {
      acc[perm.resourceType] = []
    }
    acc[perm.resourceType].push(perm)
    return acc
  }, {} as Record<string, typeof permissions>)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Permissions</h3>
      
      {Object.entries(groupedPermissions).map(([resourceType, perms]) => (
        <Card key={resourceType}>
          <CardHeader>
            <CardTitle className="text-base capitalize">
              {resourceType.replace('-', ' ')} ({perms.length} permissions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {perms.map((perm) => (
                <Badge key={`${perm.resourceType}-${perm.action}`} variant="outline">
                  {perm.action}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Example 7: Department-specific Permissions
 * Check permissions with department context
 */
export function DepartmentInventoryAccess({ departmentId }: { departmentId: string }) {
  const { hasPermission, isLoading } = useHasPermission(
    'inventory-item',
    'read',
    undefined,
    { department: departmentId }
  )

  const { hasPermission: canAdjustStock } = useHasPermission(
    'stock-adjustment',
    'create',
    undefined,
    { department: departmentId }
  )

  if (isLoading) {
    return <div>Checking department access...</div>
  }

  if (!hasPermission) {
    return <Alert><AlertDescription>No access to inventory for this department.</AlertDescription></Alert>
  }

  return (
    <div className="space-y-4">
      <h3>Inventory Access - Department {departmentId}</h3>
      <div className="flex gap-2">
        <Button>View Inventory</Button>
        {canAdjustStock && <Button>Adjust Stock Levels</Button>}
      </div>
    </div>
  )
}

/**
 * Example 8: Real-time Permission Updates
 * Handle permission changes in real-time
 */
export function RealtimePermissionMonitor() {
  const { data: permissions, refetch } = useUserPermissions()
  const [lastUpdate, setLastUpdate] = React.useState(new Date())

  React.useEffect(() => {
    // Set up periodic permission refresh
    const interval = setInterval(() => {
      refetch()
      setLastUpdate(new Date())
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refetch])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Last Updated: {lastUpdate.toLocaleTimeString()}</p>
          <p>Total Permissions: {permissions?.length ?? 0}</p>
          <Button size="sm" onClick={() => refetch()}>
            Refresh Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Export all examples for documentation and testing
export const PermissionExamples = {
  CreatePurchaseRequestButton,
  PurchaseRequestActions,
  ProductManagementPanel,
  VendorCreationForm,
  FinancialReportsAccess,
  UserPermissionsDashboard,
  DepartmentInventoryAccess,
  RealtimePermissionMonitor,
}

export default PermissionExamples