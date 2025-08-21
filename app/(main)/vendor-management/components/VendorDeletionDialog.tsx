'use client'

// VendorDeletionDialog Component
// Comprehensive vendor deletion with dependency checking

import React, { useState, useEffect } from 'react'
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Shield, 
  FileText, 
  Package, 
  Users, 
  DollarSign, 
  Clock,
  RefreshCw,
  Trash2,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Vendor } from '../types'
import { vendorDependencyChecker, VendorDependency, DependencyCheckResult } from '../lib/services/vendor-dependency-checker'
import { vendorService } from '../lib/services/vendor-service'

interface VendorDeletionDialogProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

const getDependencyIcon = (type: string) => {
  switch (type) {
    case 'pricelist':
      return <FileText className="h-4 w-4" />
    case 'campaign':
      return <Users className="h-4 w-4" />
    case 'purchaseOrder':
      return <Package className="h-4 w-4" />
    case 'contract':
      return <Shield className="h-4 w-4" />
    case 'invoice':
      return <DollarSign className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'expired':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function VendorDeletionDialog({ vendor, isOpen, onClose, onDeleted }: VendorDeletionDialogProps) {
  const [dependencyResult, setDependencyResult] = useState<DependencyCheckResult | null>(null)
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && vendor) {
      checkDependencies()
    }
  }, [isOpen, vendor])

  const checkDependencies = async () => {
    if (!vendor) return

    setIsCheckingDependencies(true)
    setError(null)

    try {
      const result = await vendorDependencyChecker.checkDependencies(vendor.id)
      
      if (result.success && result.data) {
        setDependencyResult(result.data)
      } else {
        setError(result.error?.message || 'Failed to check dependencies')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsCheckingDependencies(false)
    }
  }

  const handleDelete = async () => {
    if (!vendor || !dependencyResult) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await vendorService.deleteVendor(vendor.id, 'current-user-id')
      
      if (result.success) {
        onDeleted()
        onClose()
      } else {
        setError(result.error?.message || 'Failed to delete vendor')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setDependencyResult(null)
    setConfirmationChecked(false)
    setActiveTab('overview')
    setError(null)
    onClose()
  }

  const renderOverview = () => {
    if (!dependencyResult) return null

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Dependencies</p>
                  <p className="text-2xl font-bold">{dependencyResult.summary.totalDependencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Blockers</p>
                  <p className="text-2xl font-bold">{dependencyResult.summary.blockers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impact Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm">High Impact</span>
                </div>
                <span className="text-sm font-medium">{dependencyResult.summary.highImpact}</span>
              </div>
              <Progress value={(dependencyResult.summary.highImpact / dependencyResult.summary.totalDependencies) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Medium Impact</span>
                </div>
                <span className="text-sm font-medium">{dependencyResult.summary.mediumImpact}</span>
              </div>
              <Progress value={(dependencyResult.summary.mediumImpact / dependencyResult.summary.totalDependencies) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Low Impact</span>
                </div>
                <span className="text-sm font-medium">{dependencyResult.summary.lowImpact}</span>
              </div>
              <Progress value={(dependencyResult.summary.lowImpact / dependencyResult.summary.totalDependencies) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Blockers */}
        {dependencyResult.blockers.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Deletion Blockers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dependencyResult.blockers.map((blocker, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{blocker}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {dependencyResult.warnings.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Warnings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dependencyResult.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{warning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderDependencies = () => {
    if (!dependencyResult) return null

    const groupedDependencies = dependencyResult.dependencies.reduce((groups, dep) => {
      if (!groups[dep.type]) {
        groups[dep.type] = []
      }
      groups[dep.type].push(dep)
      return groups
    }, {} as Record<string, VendorDependency[]>)

    return (
      <div className="space-y-4">
        {Object.entries(groupedDependencies).map(([type, deps]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                {getDependencyIcon(type)}
                <span className="capitalize">{type}s ({deps.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deps.map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getDependencyIcon(dep.type)}
                      <div>
                        <p className="font-medium">{dep.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {dep.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(dep.status)}>
                        {dep.status}
                      </Badge>
                      <Badge className={getImpactColor(dep.impact)}>
                        {dep.impact} impact
                      </Badge>
                      {dep.canDelete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderConfirmation = () => {
    if (!dependencyResult) return null

    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Deletion Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm">
                  <strong>This action cannot be undone.</strong> Deleting this vendor will:
                </p>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>Permanently remove the vendor from the system</li>
                  <li>Archive all associated historical data</li>
                  <li>Remove the vendor from all inactive campaigns</li>
                  <li>Archive completed pricelists and transactions</li>
                </ul>
              </div>

              {dependencyResult.dependencies.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium">The following actions will be taken:</p>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>{dependencyResult.dependencies.filter(d => d.type === 'pricelist').length} pricelist(s) will be archived</li>
                    <li>{dependencyResult.dependencies.filter(d => d.type === 'invoice').length} invoice(s) will be archived</li>
                    <li>{dependencyResult.dependencies.filter(d => d.type === 'purchaseOrder').length} purchase order(s) will be archived</li>
                    <li>Vendor will be removed from {dependencyResult.dependencies.filter(d => d.type === 'campaign').length} campaign(s)</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirm-deletion"
            checked={confirmationChecked}
            onCheckedChange={(checked) => setConfirmationChecked(checked === true)}
          />
          <label htmlFor="confirm-deletion" className="text-sm font-medium">
            I understand the consequences and want to proceed with deletion
          </label>
        </div>
      </div>
    )
  }

  if (!vendor) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span>Delete Vendor: {vendor.name}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Before deleting this vendor, we need to check for dependencies and ensure data integrity.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-hidden">
          {isCheckingDependencies ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-lg font-medium">Checking dependencies...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment as we verify all related data.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center space-y-3">
                <XCircle className="h-8 w-8 mx-auto text-red-600" />
                <p className="text-lg font-medium">Error checking dependencies</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={checkDependencies} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : dependencyResult ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="confirm" disabled={!dependencyResult.canDelete}>
                  Confirm Deletion
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[400px] mt-4">
                <TabsContent value="overview" className="mt-0">
                  {renderOverview()}
                </TabsContent>
                
                <TabsContent value="dependencies" className="mt-0">
                  {renderDependencies()}
                </TabsContent>
                
                <TabsContent value="confirm" className="mt-0">
                  {renderConfirmation()}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}
        </div>

        <AlertDialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {dependencyResult && !dependencyResult.canDelete && (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Cannot delete due to active dependencies</span>
              </div>
            )}
            {dependencyResult && dependencyResult.canDelete && activeTab !== 'confirm' && (
              <Button 
                onClick={() => setActiveTab('confirm')} 
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            
            {dependencyResult && dependencyResult.canDelete && activeTab === 'confirm' && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={!confirmationChecked || isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Vendor
                  </>
                )}
              </AlertDialogAction>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}