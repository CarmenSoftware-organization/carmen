'use client';

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

import { Policy, EffectType } from '@/lib/types/permissions';
import { 
  PolicyDashboardStats, 
  PolicyActivity, 
  PolicyFilter,
  PolicyBuilderDashboardProps 
} from '@/lib/types/policy-builder';

// Mock data for demonstration
const mockStats: PolicyDashboardStats = {
  totalPolicies: 24,
  activePolicies: 18,
  draftPolicies: 4,
  expiredPolicies: 2,
  recentActivity: [
    {
      id: '1',
      type: 'created',
      policyId: 'pol-001',
      policyName: 'Procurement Approval Policy',
      userId: 'admin',
      userName: 'System Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      details: { priority: 800 }
    },
    {
      id: '2',
      type: 'updated',
      policyId: 'pol-015',
      policyName: 'Inventory Access Control',
      userId: 'manager.alex',
      userName: 'Alex Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      details: { changes: ['priority', 'conditions'] }
    },
    {
      id: '3',
      type: 'activated',
      policyId: 'pol-008',
      policyName: 'Vendor Management Permissions',
      userId: 'admin',
      userName: 'System Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: '4',
      type: 'tested',
      policyId: 'pol-012',
      policyName: 'Financial Reports Access',
      userId: 'test.user',
      userName: 'Test User',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      details: { testResult: 'passed' }
    }
  ],
  performanceMetrics: {
    averageEvaluationTime: 45,
    evaluationsPerDay: 1250,
    cacheHitRate: 87,
    slowestPolicies: [
      { policyId: 'pol-003', name: 'Complex Approval Chain', averageTime: 120 },
      { policyId: 'pol-017', name: 'Multi-Department Access', averageTime: 98 }
    ],
    errorRate: 0.2
  }
};

const mockPolicies: Policy[] = [
  {
    id: 'pol-001',
    name: 'Procurement Approval Policy',
    description: 'Controls approval requirements for purchase requests based on amount and department',
    priority: 800,
    enabled: true,
    effect: EffectType.PERMIT,
    target: { subjects: [], resources: [], actions: ['approve'], environment: [] },
    rules: [],
    version: '1.2',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    category: 'procurement',
    tags: ['approval', 'procurement', 'financial']
  },
  {
    id: 'pol-002',
    name: 'Inventory Management Access',
    description: 'Defines access permissions for inventory management operations',
    priority: 600,
    enabled: true,
    effect: EffectType.PERMIT,
    target: { subjects: [], resources: [], actions: ['create', 'update'], environment: [] },
    rules: [],
    version: '1.0',
    createdBy: 'inv.manager',
    createdAt: new Date('2024-01-10'),
    category: 'inventory',
    tags: ['inventory', 'operations']
  },
  {
    id: 'pol-003',
    name: 'Financial Reports Restriction',
    description: 'Restricts access to sensitive financial reports',
    priority: 900,
    enabled: true,
    effect: EffectType.DENY,
    target: { subjects: [], resources: [], actions: ['read'], environment: [] },
    rules: [],
    version: '2.1',
    createdBy: 'finance.manager',
    createdAt: new Date('2023-12-20'),
    category: 'finance',
    tags: ['finance', 'security', 'reports']
  },
  {
    id: 'pol-004',
    name: 'Draft Vendor Policy',
    description: 'New vendor onboarding policy - under review',
    priority: 500,
    enabled: false,
    effect: EffectType.PERMIT,
    target: { subjects: [], resources: [], actions: ['create'], environment: [] },
    rules: [],
    version: '0.1',
    createdBy: 'vendor.admin',
    createdAt: new Date('2024-01-20'),
    category: 'vendor',
    tags: ['vendor', 'draft']
  }
];

export function PolicyBuilderDashboard({
  onCreatePolicy,
  onEditPolicy,
  onViewPolicy,
  onDeletePolicy,
  onDuplicatePolicy
}: PolicyBuilderDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filters, setFilters] = useState<PolicyFilter>({
    search: '',
    effect: 'all',
    status: 'all',
    category: 'all',
    priority: { min: 0, max: 1000 },
    tags: [],
    dateRange: {}
  });

  // Filter policies based on current filters
  const filteredPolicies = useMemo(() => {
    return mockPolicies.filter(policy => {
      if (searchQuery && !policy.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !policy.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [searchQuery]);

  const getActivityIcon = (type: PolicyActivity['type']) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4 text-green-500" />;
      case 'updated': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'activated': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deactivated': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'tested': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'deleted': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (policy: Policy) => {
    if (!policy.enabled) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (policy.effectiveTo && new Date(policy.effectiveTo) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getEffectBadge = (effect: EffectType) => {
    return effect === EffectType.PERMIT ? 
      <Badge variant="default" className="bg-blue-100 text-blue-800">Permit</Badge> :
      <Badge variant="destructive">Deny</Badge>;
  };

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Policy Builder</h1>
          <p className="text-muted-foreground">
            Create and manage attribute-based access control policies for Carmen ERP.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Policies
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Policies
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Validate All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onCreatePolicy}>
            <Plus className="mr-2 h-4 w-4" />
            Create Policy
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalPolicies}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockStats.activePolicies}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((mockStats.activePolicies / mockStats.totalPolicies) * 100)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Policies</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{mockStats.draftPolicies}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting activation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockStats.expiredPolicies}</div>
                <p className="text-xs text-muted-foreground">
                  Expired policies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest changes to policies and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {mockStats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {activity.userName} {activity.type} policy
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.policyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Policy List */}
          <div className="grid gap-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        {getStatusBadge(policy)}
                        {getEffectBadge(policy.effect)}
                      </div>
                      <CardDescription>{policy.description}</CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Priority: {policy.priority}</span>
                        <span>Version: {policy.version}</span>
                        <span>Created: {policy.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewPolicy(policy.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditPolicy(policy.id)}>
                          Edit Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicatePolicy(policy.id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeletePolicy(policy.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                {policy.tags && policy.tags.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {policy.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Policy evaluation performance statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Evaluation Time</span>
                    <span className="font-medium">{mockStats.performanceMetrics.averageEvaluationTime}ms</span>
                  </div>
                  <Progress value={mockStats.performanceMetrics.averageEvaluationTime / 100 * 100} max={200} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium">{mockStats.performanceMetrics.cacheHitRate}%</span>
                  </div>
                  <Progress value={mockStats.performanceMetrics.cacheHitRate} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span className="font-medium">{mockStats.performanceMetrics.errorRate}%</span>
                  </div>
                  <Progress value={mockStats.performanceMetrics.errorRate} max={5} className="bg-red-100" />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Daily Evaluations</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {mockStats.performanceMetrics.evaluationsPerDay.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slowest Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Issues</CardTitle>
                <CardDescription>
                  Policies that need optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStats.performanceMetrics.slowestPolicies.map((policy) => (
                    <div key={policy.policyId} className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{policy.name}</p>
                        <p className="text-xs text-muted-foreground">{policy.policyId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">{policy.averageTime}ms</p>
                        <p className="text-xs text-muted-foreground">avg time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}