'use client'

// Request for Pricing Detail Page
// Request for pricing dashboard with analytics and vendor tracking

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft,
  Play,
  Pause,
  Square,
  Edit,
  Copy,
  Mail,
  Users,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  Download
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockCampaigns, mockTemplates, mockVendors } from '../../lib/mock-data'
import { RequestForPricing } from '../../types'

export default function RequestForPricingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string
  
  const [requestForPricing, setRequestForPricing] = useState<RequestForPricing | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading request for pricing data
    const foundRequest = mockCampaigns.find(c => c.id === requestId)
    setRequestForPricing(foundRequest || null)
    setIsLoading(false)
  }, [requestId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!requestForPricing) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Request for Pricing not found</h3>
        <p className="text-muted-foreground mb-4">The request for pricing you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/vendor-management/campaigns')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTemplate = () => {
    return mockTemplates.find(t => t.id === requestForPricing.templateId)
  }

  const getVendorDetails = () => {
    return requestForPricing.vendorIds.map(vendorId => 
      mockVendors.find(v => v.id === vendorId)
    ).filter(Boolean)
  }

  const getProgress = () => {
    if (requestForPricing.analytics.totalVendors === 0) return 0
    return Math.round((requestForPricing.analytics.submissionsCompleted / requestForPricing.analytics.totalVendors) * 100)
  }

  const template = getTemplate()
  const vendorDetails = getVendorDetails()

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{requestForPricing.name}</h1>
              <Badge className={getStatusColor(requestForPricing.status)}>
                {requestForPricing.status}
              </Badge>
              <Badge className={getPriorityColor(requestForPricing.priority)}>
                {requestForPricing.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground">{requestForPricing.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Template</div>
                  <div className="text-sm text-muted-foreground">{template?.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Schedule</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(requestForPricing.schedule.startDate)} - {requestForPricing.schedule.endDate ? formatDate(requestForPricing.schedule.endDate) : 'Ongoing'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(requestForPricing.createdAt)} by {requestForPricing.createdBy}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Rate</span>
                  <span className="text-sm font-medium">{requestForPricing.analytics.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="text-sm font-medium">{requestForPricing.analytics.averageResponseTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">{requestForPricing.analytics.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Score</span>
                  <span className="text-sm font-medium">{(requestForPricing.analytics.qualityScore/20).toFixed(1)}/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorDetails.map((vendor) => {
                    const engagement = requestForPricing.analytics.vendorEngagement.find(e => e.vendorId === vendor?.id)
                    return (
                      <TableRow key={vendor?.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor?.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor?.contactEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={engagement ? 'default' : 'secondary'}>
                            {engagement ? 'Active' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${engagement?.completionPercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm">{engagement?.completionPercentage || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {engagement?.lastActivity ? formatDate(engagement.lastActivity) : 'No activity'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Deadline Buffer</div>
                  <div className="text-sm text-muted-foreground">{requestForPricing.deadlineBuffer} hours</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Max Submission Attempts</div>
                  <div className="text-sm text-muted-foreground">{requestForPricing.maxSubmissionAttempts}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}