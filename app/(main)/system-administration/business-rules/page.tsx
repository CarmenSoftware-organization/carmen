'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Settings, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Shield,
  Package,
  Trash2,
  Users,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import { BusinessRule, ComplianceViolation, CorrectiveAction } from "@/lib/types/business-rules"

interface BusinessRulesDashboardProps {}

export default function BusinessRulesDashboard({}: BusinessRulesDashboardProps) {
  const [rules, setRules] = useState<BusinessRule[]>([])
  const [violations, setViolations] = useState<ComplianceViolation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockRules: BusinessRule[] = [
      {
        id: 'PSR-001',
        name: 'Pizza Cutting Standards',
        description: 'Defines standard cutting procedures for pizzas to ensure consistent slice sizes and food safety',
        priority: 9,
        isActive: true,
        category: 'fractional-sales',
        conditions: [],
        actions: [],
        createdBy: 'system',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
        triggerCount: 156,
        successRate: 94.8
      },
      {
        id: 'PSR-002',
        name: 'Pizza Slice Holding Time Limits',
        description: 'Enforces maximum holding time for cut pizza slices to maintain food safety and quality',
        priority: 10,
        isActive: true,
        category: 'food-safety',
        conditions: [],
        actions: [],
        createdBy: 'system',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
        triggerCount: 89,
        successRate: 97.8
      },
      {
        id: 'CSR-001',
        name: 'Cake Cutting Standards',
        description: 'Standardized cake cutting procedures for consistent portion control and presentation',
        priority: 8,
        isActive: true,
        category: 'fractional-sales',
        conditions: [],
        actions: [],
        createdBy: 'system',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
        triggerCount: 67,
        successRate: 91.0
      }
    ]

    const mockViolations: ComplianceViolation[] = [
      {
        id: 'V-001',
        ruleId: 'PSR-002',
        ruleName: 'Pizza Slice Holding Time Limits',
        violationType: 'critical',
        description: 'Pizza slices exceeded safe holding time of 4 hours',
        location: 'Main Kitchen',
        timestamp: new Date(),
        detectedBy: 'system',
        status: 'open',
        correctiveActions: [],
        businessImpact: 'safety-risk'
      }
    ]

    setRules(mockRules)
    setViolations(mockViolations)
    setLoading(false)
  }, [])

  const filteredRules = rules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food-safety':
        return <Shield className="h-4 w-4" />
      case 'fractional-sales':
        return <Package className="h-4 w-4" />
      case 'inventory-management':
        return <BarChart3 className="h-4 w-4" />
      case 'waste-management':
        return <Trash2 className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food-safety':
        return 'bg-red-100 text-red-800'
      case 'fractional-sales':
        return 'bg-blue-100 text-blue-800'
      case 'inventory-management':
        return 'bg-green-100 text-green-800'
      case 'waste-management':
        return 'bg-yellow-100 text-yellow-800'
      case 'quality-control':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getViolationSeverityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'major':
        return 'bg-orange-100 text-orange-800'
      case 'minor':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const overallMetrics = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    inactiveRules: rules.filter(r => !r.isActive).length,
    averageSuccessRate: rules.length > 0 ? rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length : 0,
    criticalViolations: violations.filter(v => v.violationType === 'critical').length,
    openViolations: violations.filter(v => v.status === 'open').length
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
          <h1 className="text-2xl font-semibold text-gray-900">Business Rules Management</h1>
          <p className="text-gray-600">Manage and monitor business rules for fractional sales operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalRules}</div>
            <p className="text-xs text-muted-foreground">
              {overallMetrics.activeRules} active, {overallMetrics.inactiveRules} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.averageSuccessRate.toFixed(1)}%</div>
            <Progress value={overallMetrics.averageSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overallMetrics.openViolations}</div>
            <p className="text-xs text-muted-foreground">
              {overallMetrics.criticalViolations} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92.3%</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Violations Alert */}
      {overallMetrics.criticalViolations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Violations Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {overallMetrics.criticalViolations} critical violations require immediate attention. 
            Review the violations tab for details.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fractional-sales">Fractional Sales</SelectItem>
                <SelectItem value="food-safety">Food Safety</SelectItem>
                <SelectItem value="quality-control">Quality Control</SelectItem>
                <SelectItem value="inventory-management">Inventory Management</SelectItem>
                <SelectItem value="waste-management">Waste Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
              <CardDescription>
                Manage and monitor your business rules for fractional sales operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {rule.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(rule.category)}>
                          {getCategoryIcon(rule.category)}
                          <span className="ml-1 capitalize">{rule.category.replace('-', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            rule.priority >= 9 ? 'bg-red-500' : 
                            rule.priority >= 7 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span>{rule.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rule.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${rule.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{rule.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{rule.triggerCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Violations</CardTitle>
              <CardDescription>
                Active violations that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Violation</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{violation.ruleName}</div>
                          <div className="text-sm text-muted-foreground">
                            {violation.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getViolationSeverityColor(violation.violationType)}>
                          {violation.violationType}
                        </Badge>
                      </TableCell>
                      <TableCell>{violation.location}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {violation.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {violation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rule Performance</CardTitle>
                <CardDescription>Success rates by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Food Safety</span>
                    <span className="text-sm">97.8%</span>
                  </div>
                  <Progress value={97.8} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fractional Sales</span>
                    <span className="text-sm">92.9%</span>
                  </div>
                  <Progress value={92.9} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Control</span>
                    <span className="text-sm">89.5%</span>
                  </div>
                  <Progress value={89.5} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violation Trends</CardTitle>
                <CardDescription>Violations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Chart would be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Track all changes to business rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Audit trail would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}