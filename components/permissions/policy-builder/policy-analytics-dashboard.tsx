'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Clock,
  Users,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Cpu,
  Database,
  Network,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  PieChart,
  LineChart,
  DollarSign,
  Gauge
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  PolicyDashboardStats,
  PolicyActivity,
  PolicyPerformanceMetrics,
  PolicyTestResult
} from '@/lib/types/policy-builder';
import { Policy, EffectType } from '@/lib/types/permissions';

// Analytics data types
interface PolicyAnalytics {
  evaluationTrends: {
    date: string;
    evaluations: number;
    permits: number;
    denies: number;
    averageLatency: number;
  }[];
  topPolicies: {
    policyId: string;
    policyName: string;
    evaluationCount: number;
    averageLatency: number;
    permitRate: number;
    lastEvaluated: Date;
  }[];
  errorAnalysis: {
    errorType: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  complianceMetrics: {
    totalPolicies: number;
    compliantPolicies: number;
    nonCompliantPolicies: number;
    complianceScore: number;
    criticalIssues: number;
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    cacheUtilization: number;
  };
  securityInsights: {
    suspiciousActivities: number;
    blockedRequests: number;
    privilegeEscalations: number;
    anomalousPatterns: number;
  };
}

interface PolicyAnalyticsDashboardProps {
  policies?: Policy[];
  testResults?: PolicyTestResult[];
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
  refreshInterval?: number;
}

// Mock analytics data generator
const generateMockAnalytics = (): PolicyAnalytics => {
  const now = new Date();
  const evaluationTrends = [];
  
  // Generate trend data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const evaluations = Math.floor(Math.random() * 1000) + 200;
    const permits = Math.floor(evaluations * (0.6 + Math.random() * 0.3));
    const denies = evaluations - permits;
    
    evaluationTrends.push({
      date: date.toLocaleDateString(),
      evaluations,
      permits,
      denies,
      averageLatency: Math.floor(Math.random() * 50) + 80
    });
  }

  return {
    evaluationTrends,
    topPolicies: [
      {
        policyId: 'policy-001',
        policyName: 'Purchase Request Approval Policy',
        evaluationCount: 2847,
        averageLatency: 145,
        permitRate: 72.3,
        lastEvaluated: new Date()
      },
      {
        policyId: 'policy-002',
        policyName: 'Inventory Access Control',
        evaluationCount: 1923,
        averageLatency: 98,
        permitRate: 89.1,
        lastEvaluated: new Date()
      },
      {
        policyId: 'policy-003',
        policyName: 'Financial Data Security Policy',
        evaluationCount: 1456,
        averageLatency: 203,
        permitRate: 45.7,
        lastEvaluated: new Date()
      },
      {
        policyId: 'policy-004',
        policyName: 'Admin Access Control',
        evaluationCount: 892,
        averageLatency: 167,
        permitRate: 23.4,
        lastEvaluated: new Date()
      }
    ],
    errorAnalysis: [
      { errorType: 'Attribute Resolution Failed', count: 23, percentage: 2.1, trend: 'down' },
      { errorType: 'Policy Evaluation Timeout', count: 18, percentage: 1.6, trend: 'stable' },
      { errorType: 'Invalid Request Format', count: 12, percentage: 1.1, trend: 'up' },
      { errorType: 'Database Connection Error', count: 8, percentage: 0.7, trend: 'down' }
    ],
    complianceMetrics: {
      totalPolicies: 45,
      compliantPolicies: 41,
      nonCompliantPolicies: 4,
      complianceScore: 91.1,
      criticalIssues: 2
    },
    resourceUsage: {
      cpuUsage: 34.2,
      memoryUsage: 67.8,
      diskUsage: 23.4,
      networkLatency: 12.3,
      cacheUtilization: 78.9
    },
    securityInsights: {
      suspiciousActivities: 15,
      blockedRequests: 234,
      privilegeEscalations: 3,
      anomalousPatterns: 8
    }
  };
};

export function PolicyAnalyticsDashboard({
  policies = [],
  testResults = [],
  timeRange = '7d',
  refreshInterval = 30000
}: PolicyAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PolicyAnalytics>(generateMockAnalytics());
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Refresh analytics data
  const refreshAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newAnalytics = generateMockAnalytics();
      setAnalytics(newAnalytics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed metrics
  const computedMetrics = useMemo(() => {
    const totalEvaluations = analytics.evaluationTrends.reduce((sum, trend) => sum + trend.evaluations, 0);
    const totalPermits = analytics.evaluationTrends.reduce((sum, trend) => sum + trend.permits, 0);
    const totalDenies = analytics.evaluationTrends.reduce((sum, trend) => sum + trend.denies, 0);
    const averageLatency = analytics.evaluationTrends.reduce((sum, trend) => sum + trend.averageLatency, 0) / analytics.evaluationTrends.length;
    const permitRate = totalEvaluations > 0 ? (totalPermits / totalEvaluations) * 100 : 0;
    const errorRate = analytics.errorAnalysis.reduce((sum, error) => sum + error.percentage, 0);

    return {
      totalEvaluations,
      totalPermits,
      totalDenies,
      averageLatency: Math.round(averageLatency),
      permitRate: Math.round(permitRate * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10
    };
  }, [analytics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Policy Analytics</h2>
          <p className="text-muted-foreground">
            Monitor policy performance, security insights, and compliance metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAutoRefresh(!autoRefresh)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Raw Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedMetrics.totalEvaluations.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permit Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedMetrics.permitRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedMetrics.averageLatency}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              -8.2ms improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{computedMetrics.errorRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -0.3% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.complianceMetrics.complianceScore}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +1.8% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.resourceUsage.cacheUtilization.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="policies">Policy Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evaluation Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Evaluation Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.evaluationTrends.map((trend, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{trend.date}</span>
                        <span>{trend.evaluations} evaluations</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Permits: {trend.permits}</span>
                          <span>Denies: {trend.denies}</span>
                        </div>
                        <Progress 
                          value={(trend.permits / trend.evaluations) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>System Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{analytics.resourceUsage.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.resourceUsage.cpuUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{analytics.resourceUsage.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.resourceUsage.memoryUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>{analytics.resourceUsage.diskUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.resourceUsage.diskUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Utilization</span>
                    <span>{analytics.resourceUsage.cacheUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.resourceUsage.cacheUtilization} className="h-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.resourceUsage.networkLatency.toFixed(1)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Network Latency</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {policies.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Policies</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Policies and Error Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Most Evaluated Policies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPolicies.map((policy, index) => (
                    <div key={policy.policyId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{policy.policyName}</div>
                        <div className="text-xs text-muted-foreground">
                          {policy.evaluationCount.toLocaleString()} evaluations
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {policy.permitRate.toFixed(1)}% permit rate
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {policy.averageLatency}ms avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.errorAnalysis.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{error.errorType}</div>
                        <div className="text-xs text-muted-foreground">
                          {error.count} occurrences ({error.percentage}%)
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {error.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {error.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                        {error.trend === 'stable' && <div className="w-4 h-4 border rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TooltipProvider>
                  <div className="grid grid-cols-2 gap-4">
                    <Tooltip>
                      <TooltipTrigger className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {computedMetrics.averageLatency}ms
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Latency</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Average policy evaluation time
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(computedMetrics.totalEvaluations / 7 / 24).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Req/Hour</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Average requests per hour
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analytics.resourceUsage.cacheUtilization.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Cache Hit</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Cache hit rate percentage
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {computedMetrics.errorRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Error Rate</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Error rate percentage
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Latency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>&lt; 50ms</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>50-100ms</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>100-200ms</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>200-500ms</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>&gt; 500ms</span>
                    <span>3%</span>
                  </div>
                  <Progress value={3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Throughput Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {(computedMetrics.totalEvaluations / 7).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Evaluations per day</div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Peak Hour</span>
                      <span>2:00 PM - 3:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Peak Requests</span>
                      <span>1,247 evaluations</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Off-Peak Hour</span>
                      <span>3:00 AM - 4:00 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Requests</span>
                      <span>23 evaluations</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      Capacity: 10K evaluations/hour
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.securityInsights.suspiciousActivities}
                    </div>
                    <div className="text-sm text-muted-foreground">Suspicious Activities</div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.securityInsights.blockedRequests}
                    </div>
                    <div className="text-sm text-muted-foreground">Blocked Requests</div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.securityInsights.privilegeEscalations}
                    </div>
                    <div className="text-sm text-muted-foreground">Privilege Escalations</div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.securityInsights.anomalousPatterns}
                    </div>
                    <div className="text-sm text-muted-foreground">Anomalous Patterns</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Security Event Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Failed Authentications', count: 45, trend: 'down', color: 'text-green-600' },
                    { type: 'Unauthorized Access Attempts', count: 23, trend: 'up', color: 'text-red-600' },
                    { type: 'Policy Violations', count: 12, trend: 'stable', color: 'text-yellow-600' },
                    { type: 'Data Exfiltration Attempts', count: 3, trend: 'down', color: 'text-green-600' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{event.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.count} incidents this week
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${event.color}`}>
                          {event.trend === 'up' ? '+' : event.trend === 'down' ? '-' : ''}
                          {event.trend === 'stable' ? 'Stable' : `${Math.floor(Math.random() * 20)}%`}
                        </span>
                        {event.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {event.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                        {event.trend === 'stable' && <div className="w-4 h-4 border rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    priority: 'high',
                    title: 'Enable Multi-Factor Authentication',
                    description: 'Several high-privilege accounts lack MFA protection'
                  },
                  {
                    priority: 'medium',
                    title: 'Review Admin Access Policies',
                    description: 'Some admin policies have overly permissive conditions'
                  },
                  {
                    priority: 'medium',
                    title: 'Implement Rate Limiting',
                    description: 'Add rate limiting to prevent brute force attacks'
                  },
                  {
                    priority: 'low',
                    title: 'Update Password Policies',
                    description: 'Current password requirements could be strengthened'
                  }
                ].map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Compliance Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {analytics.complianceMetrics.complianceScore}%
                  </div>
                  <Badge variant="default" className="text-sm">
                    Good Compliance
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Compliant Policies</span>
                    <span className="font-medium">
                      {analytics.complianceMetrics.compliantPolicies} / {analytics.complianceMetrics.totalPolicies}
                    </span>
                  </div>
                  <Progress 
                    value={(analytics.complianceMetrics.compliantPolicies / analytics.complianceMetrics.totalPolicies) * 100} 
                    className="h-3"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Non-compliant: {analytics.complianceMetrics.nonCompliantPolicies}</span>
                    <span>Critical Issues: {analytics.complianceMetrics.criticalIssues}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'Data Retention Policy',
                      severity: 'high',
                      description: 'Some policies lack proper data retention controls'
                    },
                    {
                      type: 'Audit Trail Requirements',
                      severity: 'medium',
                      description: 'Missing audit trail configuration in 2 policies'
                    },
                    {
                      type: 'Access Review Cycles',
                      severity: 'medium',
                      description: 'Quarterly access reviews not configured'
                    },
                    {
                      type: 'Documentation Updates',
                      severity: 'low',
                      description: 'Policy documentation needs updates'
                    }
                  ].map((issue, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{issue.type}</h4>
                        <Badge 
                          variant={
                            issue.severity === 'high' ? 'destructive' :
                            issue.severity === 'medium' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regulatory Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Framework Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { framework: 'GDPR', score: 94, status: 'compliant' },
                  { framework: 'SOX', score: 89, status: 'compliant' },
                  { framework: 'HIPAA', score: 76, status: 'needs_improvement' },
                  { framework: 'PCI DSS', score: 82, status: 'compliant' },
                  { framework: 'ISO 27001', score: 91, status: 'compliant' },
                  { framework: 'CCPA', score: 87, status: 'compliant' }
                ].map((framework, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{framework.framework}</h4>
                    <div className="text-2xl font-bold mb-2">
                      {framework.score}%
                    </div>
                    <Badge 
                      variant={framework.status === 'compliant' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {framework.status === 'compliant' ? 'Compliant' : 'Needs Improvement'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Insights Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPolicies.map((policy, index) => (
                    <div key={policy.policyId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{policy.policyName}</h4>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        <div>
                          <div className="font-medium">{policy.evaluationCount.toLocaleString()}</div>
                          <div className="text-muted-foreground">Evaluations</div>
                        </div>
                        <div>
                          <div className="font-medium">{policy.permitRate.toFixed(1)}%</div>
                          <div className="text-muted-foreground">Permit Rate</div>
                        </div>
                        <div>
                          <div className="font-medium">{policy.averageLatency}ms</div>
                          <div className="text-muted-foreground">Avg Latency</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={policy.permitRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Policy Optimization Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'Performance',
                      policy: 'Financial Data Security Policy',
                      suggestion: 'Simplify condition logic to reduce evaluation time',
                      impact: 'high'
                    },
                    {
                      type: 'Coverage',
                      policy: 'Admin Access Control',
                      suggestion: 'Add time-based restrictions for better security',
                      impact: 'medium'
                    },
                    {
                      type: 'Maintenance',
                      policy: 'Purchase Request Approval Policy',
                      suggestion: 'Consolidate similar conditions to reduce complexity',
                      impact: 'low'
                    },
                    {
                      type: 'Security',
                      policy: 'Inventory Access Control',
                      suggestion: 'Add IP-based restrictions for sensitive operations',
                      impact: 'medium'
                    }
                  ].map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                        <Badge 
                          variant={
                            suggestion.impact === 'high' ? 'destructive' :
                            suggestion.impact === 'medium' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {suggestion.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{suggestion.policy}</h4>
                      <p className="text-xs text-muted-foreground">{suggestion.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Usage Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Usage Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2:00 PM</div>
                  <div className="text-sm text-muted-foreground">Peak Usage Hour</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Monday</div>
                  <div className="text-sm text-muted-foreground">Busiest Day</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">78%</div>
                  <div className="text-sm text-muted-foreground">Business Hours Usage</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-muted-foreground">Unused Policies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              {autoRefresh && (
                <Badge variant="outline" className="text-xs">
                  Auto-refresh enabled
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Data retention: 90 days</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Time zone: UTC</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}