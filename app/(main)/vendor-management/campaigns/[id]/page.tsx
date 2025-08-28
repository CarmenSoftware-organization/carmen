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
import { mockCampaigns, mockCampaignTemplates, mockVendors } from '@/lib/mock-data'
import { PriceCollectionCampaign } from '@/lib/types'

export default function RequestForPricingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string
  
  const [campaign, setCampaign] = useState<PriceCollectionCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading campaign data
    const foundCampaign = mockCampaigns.find(c => c.id === requestId)
    setCampaign(foundCampaign || null)
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

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Campaign not found</h3>
        <p className="text-muted-foreground mb-4">The campaign you&apos;re looking for doesn&apos;t exist.</p>
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
    return campaign.template || mockCampaignTemplates.find(t => t.id === 'template-001')
  }

  const getVendorDetails = () => {
    return campaign.selectedVendors.map(vendorId => 
      mockVendors.find(v => v.id === vendorId)
    ).filter(Boolean)
  }

  const getProgress = () => {
    if (campaign.progress.totalVendors === 0) return 0
    return Math.round((campaign.progress.completedSubmissions / campaign.progress.totalVendors) * 100)
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
              <h1 className="text-2xl font-semibold">{campaign.name}</h1>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              <Badge className={getPriorityColor(campaign.settings.priority)}>
                {campaign.settings.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground">{campaign.description}</p>
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
                    {formatDate(campaign.scheduledStart)} - {campaign.scheduledEnd ? formatDate(campaign.scheduledEnd) : 'Ongoing'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.createdAt)} by {campaign.createdBy}
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
                  <span className="text-sm font-medium">{campaign.progress.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="text-sm font-medium">{campaign.progress.averageResponseTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">{campaign.progress.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Submissions</span>
                  <span className="text-sm font-medium">{campaign.progress.completedSubmissions}/{campaign.progress.totalVendors}</span>
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
                  {vendorDetails.map((vendor, index) => {
                    // Mock vendor status based on campaign progress
                    const isResponded = index < campaign.progress.respondedVendors
                    const isCompleted = index < campaign.progress.completedSubmissions
                    const completionPercentage = isCompleted ? 100 : isResponded ? 50 : 0
                    const lastActivity = isResponded ? new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) : null
                    
                    return (
                      <TableRow key={vendor?.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor?.companyName}</div>
                            <div className="text-sm text-muted-foreground">{vendor?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isCompleted ? 'default' : isResponded ? 'secondary' : 'outline'}>
                            {isCompleted ? 'Completed' : isResponded ? 'In Progress' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{completionPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {lastActivity ? formatDate(lastActivity) : 'No activity'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" disabled={isCompleted}>
                            <Mail className="h-4 w-4 mr-2" />
                            {isCompleted ? 'Completed' : 'Send Reminder'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Portal Access Duration</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.portalAccessDuration} days</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Submission Methods</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.allowedSubmissionMethods.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Requires Approval</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.requireApproval ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Auto Reminders</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.autoReminders ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Campaign Type</div>
                    <div className="text-sm text-muted-foreground">{campaign.campaignType}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email Template</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.emailTemplate}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Priority</div>
                    <Badge className={getPriorityColor(campaign.settings.priority)}>
                      {campaign.settings.priority}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Custom Instructions</div>
                    <div className="text-sm text-muted-foreground">{campaign.settings.customInstructions || 'None'}</div>
                  </div>
                </div>
              </div>
                
                {campaign.settings.reminderSchedule?.enabled && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-4">Reminder Schedule</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium">Reminder Intervals</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.settings.reminderSchedule.intervals.join(', ')} days before deadline
                        </div>
                      </div>
                      {campaign.settings.reminderSchedule.escalationRules.length > 0 && (
                        <div>
                          <div className="text-sm font-medium">Escalation Rules</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.settings.reminderSchedule.escalationRules.map((rule, index) => (
                              <div key={index}>
                                After {rule.daysOverdue} days overdue → {rule.escalateTo.join(', ')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}