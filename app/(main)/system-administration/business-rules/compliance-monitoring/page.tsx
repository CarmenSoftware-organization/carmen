'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  TrendingDown,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  FileText,
  Bell,
  Target,
  Activity,
  Zap
} from 'lucide-react'
import { ComplianceViolation, CorrectiveAction } from "@/lib/types/business-rules"

interface ComplianceMonitoringDashboardProps {}

export default function ComplianceMonitoringDashboard({}: ComplianceMonitoringDashboardProps) {
  const [violations, setViolations] = useState<ComplianceViolation[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('today')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockViolations: ComplianceViolation[] = [
      {
        id: 'V-001',
        ruleId: 'PSR-002',
        ruleName: 'Pizza Slice Holding Time Limits',
        violationType: 'critical',
        description: 'Pizza slices exceeded safe holding time of 4 hours at Hot Food Station',
        location: 'Main Kitchen - Hot Food Station',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        detectedBy: 'system',
        status: 'acknowledged',
        assignedTo: 'kitchen-manager-001',
        correctiveActions: [
          {
            id: 'CA-001',
            action: 'Remove expired pizza slices immediately',
            responsible: 'kitchen-staff',
            targetDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
            status: 'in-progress',
            evidenceRequired: true,
            verificationMethod: 'photo_documentation'
          },
          {
            id: 'CA-002',
            action: 'Check heating equipment temperature',
            responsible: 'maintenance-team',
            targetDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            status: 'pending',
            evidenceRequired: true,
            verificationMethod: 'temperature_log'
          }
        ],
        businessImpact: 'safety-risk',
        estimatedCost: 45
      },
      {
        id: 'V-002',
        ruleId: 'CSR-003',
        ruleName: 'Refrigerated Cake Storage Requirements',
        violationType: 'major',
        description: 'Cake display case temperature exceeded 41°F threshold',
        location: 'Bakery Display Case 2',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        detectedBy: 'system',
        status: 'acknowledged',
        assignedTo: 'bakery-supervisor-001',
        correctiveActions: [
          {
            id: 'CA-003',
            action: 'Adjust refrigeration settings',
            responsible: 'bakery-staff',
            targetDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            status: 'completed',
            evidenceRequired: false,
            verificationMethod: 'system_check'
          }
        ],
        businessImpact: 'safety-risk',
        estimatedCost: 25
      },
      {
        id: 'V-003',
        ruleId: 'MYR-002',
        ruleName: 'Waste Minimization for Fractional Items',
        violationType: 'minor',
        description: 'Pizza waste exceeded 15% threshold for the week',
        location: 'Main Kitchen',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        detectedBy: 'system',
        status: 'open',
        correctiveActions: [],
        businessImpact: 'financial-loss',
        estimatedCost: 120
      }
    ]

    setViolations(mockViolations)
    setLoading(false)
  }, [])

  const complianceMetrics = {
    totalViolations: violations.length,
    criticalViolations: violations.filter(v => v.violationType === 'critical').length,
    majorViolations: violations.filter(v => v.violationType === 'major').length,
    minorViolations: violations.filter(v => v.violationType === 'minor').length,
    openViolations: violations.filter(v => v.status === 'open').length,
    inProgressViolations: violations.filter(v => v.status === 'acknowledged').length,
    resolvedViolations: violations.filter(v => v.status === 'resolved').length,
    overallComplianceScore: 87.3,
    foodSafetyScore: 92.1,
    qualityControlScore: 84.5,
    inventoryComplianceScore: 86.8,
    totalCost: violations.reduce((sum, v) => sum + (v.estimatedCost || 0), 0)
  }

  const getViolationSeverityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'safety-risk':
        return 'text-red-600'
      case 'financial-loss':
        return 'text-orange-600'
      case 'reputation-risk':
        return 'text-purple-600'
      case 'operational-inefficiency':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Compliance Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring of business rule compliance for fractional sales operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.overallComplianceScore}%</div>
            <Progress value={complianceMetrics.overallComplianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceMetrics.openViolations + complianceMetrics.inProgressViolations}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs">{complianceMetrics.criticalViolations} Critical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs">{complianceMetrics.majorViolations} Major</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Safety Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceMetrics.foodSafetyScore}%</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">+2.3% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Impact</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${complianceMetrics.totalCost}</div>
            <p className="text-xs text-muted-foreground">
              Potential cost from violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {complianceMetrics.criticalViolations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Violations Require Immediate Action</AlertTitle>
          <AlertDescription className="text-red-700">
            {complianceMetrics.criticalViolations} critical violations detected. Food safety protocols may be compromised. 
            Review and address immediately to prevent health risks.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="violations">Active Violations</TabsTrigger>
          <TabsTrigger value="corrective-actions">Corrective Actions</TabsTrigger>
          <TabsTrigger value="compliance-trends">Compliance Trends</TabsTrigger>
          <TabsTrigger value="location-performance">Location Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Violations</CardTitle>
              <CardDescription>
                Violations requiring immediate attention, sorted by severity and time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Violation Details</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations
                    .filter(v => v.status !== 'resolved')
                    .sort((a, b) => {
                      // Sort by severity first, then by time
                      const severityOrder = { 'critical': 3, 'major': 2, 'minor': 1, 'observation': 0 }
                      if (severityOrder[a.violationType] !== severityOrder[b.violationType]) {
                        return severityOrder[b.violationType] - severityOrder[a.violationType]
                      }
                      return b.timestamp.getTime() - a.timestamp.getTime()
                    })
                    .map((violation) => (
                      <TableRow key={violation.id} className={violation.violationType === 'critical' ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{violation.ruleName}</div>
                            <div className="text-sm text-muted-foreground max-w-[300px]">
                              {violation.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>{violation.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getViolationSeverityColor(violation.violationType)}>
                            {violation.violationType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{violation.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(violation.status)}>
                            {violation.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {violation.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{violation.assignedTo}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <span className={`text-sm font-medium ${getBusinessImpactColor(violation.businessImpact)}`}>
                              {violation.businessImpact.replace('-', ' ')}
                            </span>
                            {violation.estimatedCost && (
                              <span className="text-xs text-muted-foreground">${violation.estimatedCost}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {violation.status === 'open' && (
                              <Button size="sm">
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrective-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Corrective Actions</CardTitle>
              <CardDescription>
                Track progress on corrective actions for violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Evidence Required</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations
                    .flatMap(v => v.correctiveActions.map(action => ({ ...action, violationId: v.id, violationName: v.ruleName })))
                    .map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{action.action}</div>
                            <div className="text-sm text-muted-foreground">
                              Related to: {action.violationName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{action.responsible}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{action.targetDate.toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(action.status)}>
                            {action.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {action.evidenceRequired ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-sm">Required</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not required</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Update Progress
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance-trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score Trends</CardTitle>
                <CardDescription>7-day compliance score history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Compliance trend chart would be implemented here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violation Categories</CardTitle>
                <CardDescription>Distribution of violations by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Food Safety</span>
                    <span className="text-sm">{violations.filter(v => v.businessImpact === 'safety-risk').length}</span>
                  </div>
                  <Progress value={40} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Financial Loss</span>
                    <span className="text-sm">{violations.filter(v => v.businessImpact === 'financial-loss').length}</span>
                  </div>
                  <Progress value={30} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operational</span>
                    <span className="text-sm">{violations.filter(v => v.businessImpact === 'operational-inefficiency').length}</span>
                  </div>
                  <Progress value={20} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location-performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Main Kitchen</CardTitle>
                <CardDescription>Hot Food Station, Prep Area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span className="text-sm">85%</span>
                </div>
                <Progress value={85} />
                <div className="mt-2 text-xs text-muted-foreground">
                  2 active violations
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bakery Section</CardTitle>
                <CardDescription>Display Cases, Prep Area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span className="text-sm">92%</span>
                </div>
                <Progress value={92} />
                <div className="mt-2 text-xs text-muted-foreground">
                  1 active violation
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Storage Areas</CardTitle>
                <CardDescription>Dry Storage, Walk-in Coolers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span className="text-sm">96%</span>
                </div>
                <Progress value={96} />
                <div className="mt-2 text-xs text-muted-foreground">
                  0 active violations
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}