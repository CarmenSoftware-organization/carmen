'use client'

// Pricelist Template Management - Phase 2 Task 4
// Main page for managing pricelist templates

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Download,
  FileSpreadsheet,
  Users,
  Calendar,
  Mail,
  List,
  Grid
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { PricelistTemplate } from '../types'
import { templateApi } from '../lib/api'
import { mockTemplates } from '../lib/mock-data'

interface TemplateFilters {
  status?: string
  search?: string
}

export default function PricelistTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<PricelistTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PricelistTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TemplateFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<PricelistTemplate | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [templates, filters])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      // For now, use mock data
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...templates]

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(template => template.status === filters.status)
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm) ||
        template.description?.toLowerCase().includes(searchTerm) ||
        template.productSelection.categories.some(cat => cat.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleCreateTemplate = () => {
    router.push('/vendor-management/templates/new')
  }

  const handleEditTemplate = (template: PricelistTemplate) => {
    router.push(`/vendor-management/templates/${template.id}/edit`)
  }

  const handleViewTemplate = (template: PricelistTemplate) => {
    router.push(`/vendor-management/templates/${template.id}`)
  }

  const handleCreateCampaign = (template: PricelistTemplate) => {
    router.push(`/vendor-management/campaigns/new?templateId=${template.id}`)
  }

  const handleDuplicateTemplate = async (template: PricelistTemplate) => {
    try {
      // For now, create a copy locally
      const duplicatedTemplate: PricelistTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setTemplates(prev => [duplicatedTemplate, ...prev])
      
      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      })
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      // Remove from local state
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id))
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleGenerateExcel = async (template: PricelistTemplate) => {
    try {
      toast({
        title: 'Success',
        description: 'Excel template generated successfully',
      })
    } catch (error) {
      console.error('Error generating Excel template:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate Excel template',
        variant: 'destructive',
      })
    }
  }

  const handleAddFilters = () => {
    setShowAdvancedFilters(true)
    toast({
      title: 'Advanced Filters',
      description: 'Advanced filtering options will be available in a future release',
    })
  }

  const handleSavedFilters = () => {
    setShowSavedFilters(true)
    toast({
      title: 'Saved Filters',
      description: 'Saved filters functionality will be available in a future release',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">{template.name}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(template.status)}>
                    {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateCampaign(template)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Create Request for Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateExcel(template)}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setTemplateToDelete(template)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Validity</div>
                  <div>{template.validityPeriod} days</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Categories</div>
                  <div>{template.productSelection.categories.length} categories</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Created</div>
                  <div>{formatDate(template.createdAt)}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Updated</div>
                  <div>{formatDate(template.updatedAt)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Template</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{template.productSelection.categories.length} items</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Pricelist Templates</h1>
            <p className="text-muted-foreground">Manage your pricelist collection templates</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Pricelist Templates Card with Header */}
      <Card>
        <CardHeader className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Pricelist Templates</CardTitle>
              <CardDescription className="text-sm text-gray-600">Create and manage templates for vendor requests for pricing</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Left Side - Search and Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              {/* Search Input */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Basic Filter Dropdowns */}
              <div className="flex gap-2 items-center">
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Side - Action Buttons and View Toggle */}
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={handleSavedFilters}>
                Saved Filters
              </Button>

              <Button variant="outline" size="sm" onClick={handleAddFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Add Filters
              </Button>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="border-r"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'card' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== 'all' 
                  ? 'No templates match your current filters.'
                  : 'Get started by creating your first pricelist template.'
                }
              </p>
              {!filters.search && filters.status === 'all' && (
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Validity Period</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {template.description}
                    </TableCell>
                    <TableCell>
                      {template.validityPeriod} days
                    </TableCell>
                    <TableCell>
                      {formatDate(template.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(template.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCreateCampaign(template)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Create Request for Pricing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateExcel(template)}>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setTemplateToDelete(template)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            renderCardView()
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}