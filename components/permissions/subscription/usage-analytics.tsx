'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Database, 
  Zap, 
  BarChart3, 
  PieChart, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Download,
  Filter,
  Maximize2
} from 'lucide-react';

import {
  UserSubscription,
  SubscriptionUsage,
  PackageFeatures,
  ModuleType
} from '@/lib/types/permission-subscriptions';
import { ResourceType } from '@/lib/types/permission-resources';
import { mockCurrentSubscription } from '@/lib/mock-data/permission-subscriptions';

// Extended mock usage data for analytics
const mockUsageHistory: SubscriptionUsage[] = [
  {
    period: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
    activeUsers: 18, storageUsedGB: 12.5, apiCallsMade: 145000, reportsGenerated: 89,
    resourceUsage: { 'purchase-orders': 245, 'inventory-items': 1200, 'vendors': 45, 'recipes': 156 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting'], integrationsActive: 2, workflowsExecuted: 340,
    peakConcurrentUsers: 25, peakStorageGB: 13.2, peakApiCallsPerDay: 8500
  },
  {
    period: { start: new Date('2024-02-01'), end: new Date('2024-02-29') },
    activeUsers: 22, storageUsedGB: 15.8, apiCallsMade: 167000, reportsGenerated: 112,
    resourceUsage: { 'purchase-orders': 289, 'inventory-items': 1450, 'vendors': 52, 'recipes': 178 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting', 'analytics'], integrationsActive: 3, workflowsExecuted: 425,
    peakConcurrentUsers: 31, peakStorageGB: 16.9, peakApiCallsPerDay: 9200
  },
  {
    period: { start: new Date('2024-03-01'), end: new Date('2024-03-31') },
    activeUsers: 25, storageUsedGB: 18.9, apiCallsMade: 198000, reportsGenerated: 134,
    resourceUsage: { 'purchase-orders': 334, 'inventory-items': 1680, 'vendors': 58, 'recipes': 203 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting', 'analytics', 'workflows'], integrationsActive: 4, workflowsExecuted: 512,
    peakConcurrentUsers: 38, peakStorageGB: 19.8, peakApiCallsPerDay: 11200
  },
  {
    period: { start: new Date('2024-04-01'), end: new Date('2024-04-30') },
    activeUsers: 28, storageUsedGB: 21.2, apiCallsMade: 223000, reportsGenerated: 156,
    resourceUsage: { 'purchase-orders': 378, 'inventory-items': 1890, 'vendors': 65, 'recipes': 234 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting', 'analytics', 'workflows', 'quality'], integrationsActive: 5, workflowsExecuted: 634,
    peakConcurrentUsers: 42, peakStorageGB: 22.1, peakApiCallsPerDay: 12800
  },
  {
    period: { start: new Date('2024-05-01'), end: new Date('2024-05-31') },
    activeUsers: 32, storageUsedGB: 24.1, apiCallsMade: 251000, reportsGenerated: 178,
    resourceUsage: { 'purchase-orders': 423, 'inventory-items': 2100, 'vendors': 72, 'recipes': 267 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting', 'analytics', 'workflows', 'quality'], integrationsActive: 6, workflowsExecuted: 756,
    peakConcurrentUsers: 48, peakStorageGB: 25.3, peakApiCallsPerDay: 14500
  },
  {
    period: { start: new Date('2024-06-01'), end: new Date('2024-06-30') },
    activeUsers: 35, storageUsedGB: 26.8, apiCallsMade: 278000, reportsGenerated: 203,
    resourceUsage: { 'purchase-orders': 467, 'inventory-items': 2340, 'vendors': 78, 'recipes': 298 } as any,
    featuresUsed: ['procurement', 'inventory', 'reporting', 'analytics', 'workflows', 'quality'], integrationsActive: 6, workflowsExecuted: 889,
    peakConcurrentUsers: 53, peakStorageGB: 28.1, peakApiCallsPerDay: 16200
  }
];

const mockPackageFeatures: PackageFeatures = {
  maxUsers: 50, maxLocations: 5, maxDepartments: 20, maxConcurrentSessions: 25,
  availableModules: [], availableResources: [], storageLimit: 25, apiCallsPerMonth: 300000,
  reportRetentionDays: 365, auditLogRetentionDays: 90, apiAccess: true, webhookSupport: true,
  customWorkflows: true, advancedReporting: true, realTimeAnalytics: true, multiCurrency: true,
  multiLanguage: false, whiteLabel: false, posIntegration: true, accountingIntegration: true,
  thirdPartyIntegrations: 10, customIntegrations: true, ssoIntegration: true, mfaRequired: false,
  ipRestrictions: false, auditLog: true, dataEncryption: true, backupFrequency: 'daily',
  supportLevel: 'standard', responseTime: '4-8 hours', phoneSupport: true, dedicatedManager: false,
  training: true, complianceReporting: true, dataResidency: false, gdprCompliance: true,
  hipaaCompliance: false, customCompliance: false
};

interface UsageAnalyticsProps {
  subscription?: UserSubscription;
  usageHistory?: SubscriptionUsage[];
  packageFeatures?: PackageFeatures;
  onExportData?: (period: string, format: string) => void;
  className?: string;
}

export function UsageAnalytics({
  subscription = mockCurrentSubscription,
  usageHistory = mockUsageHistory,
  packageFeatures = mockPackageFeatures,
  onExportData,
  className = ""
}: UsageAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [viewMode, setViewMode] = useState('trend');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const currentUsage = usageHistory[usageHistory.length - 1];
    const previousUsage = usageHistory[usageHistory.length - 2];
    
    const userGrowth = previousUsage ? 
      ((currentUsage.activeUsers - previousUsage.activeUsers) / previousUsage.activeUsers) * 100 : 0;
    
    const storageGrowth = previousUsage ?
      ((currentUsage.storageUsedGB - previousUsage.storageUsedGB) / previousUsage.storageUsedGB) * 100 : 0;
    
    const apiGrowth = previousUsage ?
      ((currentUsage.apiCallsMade - previousUsage.apiCallsMade) / previousUsage.apiCallsMade) * 100 : 0;
    
    const avgUsers = usageHistory.reduce((sum, usage) => sum + usage.activeUsers, 0) / usageHistory.length;
    const avgStorage = usageHistory.reduce((sum, usage) => sum + usage.storageUsedGB, 0) / usageHistory.length;
    const avgApiCalls = usageHistory.reduce((sum, usage) => sum + usage.apiCallsMade, 0) / usageHistory.length;
    
    // Usage efficiency scores
    const userUtilization = (currentUsage.activeUsers / packageFeatures.maxUsers) * 100;
    const storageUtilization = (currentUsage.storageUsedGB / packageFeatures.storageLimit) * 100;
    const apiUtilization = (currentUsage.apiCallsMade / packageFeatures.apiCallsPerMonth) * 100;
    
    // Feature adoption
    const totalFeatures = ['procurement', 'inventory', 'reporting', 'analytics', 'workflows', 'quality', 'finance'];
    const featureAdoption = (currentUsage.featuresUsed.length / totalFeatures.length) * 100;
    
    // Resource utilization trends
    const resourceTrends = Object.keys(currentUsage.resourceUsage).map(resource => {
      const resourceKey = resource as ResourceType;
      const trend = usageHistory.map(usage => ({
        month: usage.period.start.toLocaleDateString('en', { month: 'short' }),
        value: usage.resourceUsage[resourceKey] ?? 0
      }));

      const current = trend[trend.length - 1].value;
      const previous = trend[trend.length - 2]?.value || 0;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

      return {
        resource: resource.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        current,
        growth,
        trend
      };
    });
    
    return {
      currentUsage,
      growth: { users: userGrowth, storage: storageGrowth, api: apiGrowth },
      averages: { users: avgUsers, storage: avgStorage, api: avgApiCalls },
      utilization: { users: userUtilization, storage: storageUtilization, api: apiUtilization },
      featureAdoption,
      resourceTrends,
      healthScore: Math.round((userUtilization + featureAdoption + Math.min(100, 100 - apiUtilization)) / 3)
    };
  }, [usageHistory, packageFeatures]);

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return { icon: AlertCircle, text: 'High Usage', color: 'text-red-600' };
    if (percentage >= 75) return { icon: Clock, text: 'Moderate Usage', color: 'text-yellow-600' };
    return { icon: CheckCircle, text: 'Good Usage', color: 'text-green-600' };
  };

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track subscription usage patterns and optimize your plan
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => onExportData?.(selectedPeriod, 'csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.currentUsage.activeUsers}</div>
            <div className="flex items-center space-x-2 text-xs">
              <div className={`flex items-center space-x-1 ${getTrendColor(analyticsData.growth.users)}`}>
                {React.createElement(getTrendIcon(analyticsData.growth.users), { className: 'h-3 w-3' })}
                <span>{Math.abs(analyticsData.growth.users).toFixed(1)}%</span>
              </div>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <Progress 
              value={analyticsData.utilization.users} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.utilization.users.toFixed(1)}% of {packageFeatures.maxUsers} user limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.currentUsage.storageUsedGB.toFixed(1)} GB
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className={`flex items-center space-x-1 ${getTrendColor(analyticsData.growth.storage)}`}>
                {React.createElement(getTrendIcon(analyticsData.growth.storage), { className: 'h-3 w-3' })}
                <span>{Math.abs(analyticsData.growth.storage).toFixed(1)}%</span>
              </div>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <Progress 
              value={analyticsData.utilization.storage} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.utilization.storage.toFixed(1)}% of {packageFeatures.storageLimit} GB limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData.currentUsage.apiCallsMade / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className={`flex items-center space-x-1 ${getTrendColor(analyticsData.growth.api)}`}>
                {React.createElement(getTrendIcon(analyticsData.growth.api), { className: 'h-3 w-3' })}
                <span>{Math.abs(analyticsData.growth.api).toFixed(1)}%</span>
              </div>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <Progress 
              value={analyticsData.utilization.api} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.utilization.api.toFixed(1)}% of {(packageFeatures.apiCallsPerMonth / 1000).toFixed(0)}K monthly limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.healthScore}%</div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="outline" className={getUtilizationColor(analyticsData.healthScore)}>
                Excellent
              </Badge>
              <span className="text-muted-foreground">Overall efficiency</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Feature Adoption</span>
                <span>{analyticsData.featureAdoption.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trend">Usage Trends</TabsTrigger>
          <TabsTrigger value="resources">Resource Breakdown</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>
                    Track your subscription usage patterns over time
                  </CardDescription>
                </div>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Active Users</SelectItem>
                    <SelectItem value="storage">Storage Usage</SelectItem>
                    <SelectItem value="api">API Calls</SelectItem>
                    <SelectItem value="reports">Reports Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Simplified trend visualization */}
              <div className="space-y-4">
                {usageHistory.map((usage, index) => {
                  const value = selectedMetric === 'users' ? usage.activeUsers :
                              selectedMetric === 'storage' ? usage.storageUsedGB :
                              selectedMetric === 'api' ? usage.apiCallsMade :
                              usage.reportsGenerated;
                  
                  const maxValue = Math.max(...usageHistory.map(u => 
                    selectedMetric === 'users' ? u.activeUsers :
                    selectedMetric === 'storage' ? u.storageUsedGB :
                    selectedMetric === 'api' ? u.apiCallsMade :
                    u.reportsGenerated
                  ));
                  
                  const percentage = (value / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {usage.period.start.toLocaleDateString('en', { month: 'short' })}
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <div className="w-20 text-sm font-medium text-right">
                        {selectedMetric === 'api' ? `${(value / 1000).toFixed(0)}K` :
                         selectedMetric === 'storage' ? `${value.toFixed(1)}GB` :
                         value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsData.resourceTrends.map((resource) => {
              const StatusIcon = getUtilizationStatus(75).icon;
              return (
                <Card key={resource.resource}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {resource.resource}
                      </CardTitle>
                      <div className={`flex items-center space-x-1 ${getTrendColor(resource.growth)}`}>
                        {React.createElement(getTrendIcon(resource.growth), { className: 'h-3 w-3' })}
                        <span className="text-xs">{Math.abs(resource.growth).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-2">{resource.current}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>6-month trend</span>
                        <span>Current month</span>
                      </div>
                      <div className="space-y-1">
                        {resource.trend.slice(-3).map((point, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-8 text-xs text-muted-foreground">
                              {point.month}
                            </div>
                            <div className="flex-1">
                              <Progress 
                                value={(point.value / Math.max(...resource.trend.map(p => p.value))) * 100} 
                                className="h-1" 
                              />
                            </div>
                            <div className="w-8 text-xs text-right">{point.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.utilization.users < 70 && (
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <TrendingDown className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">User License Optimization</p>
                      <p className="text-xs text-muted-foreground">
                        You're using {analyticsData.utilization.users.toFixed(0)}% of user licenses. 
                        Consider downgrading to save costs.
                      </p>
                    </div>
                  </div>
                )}
                
                {analyticsData.featureAdoption < 60 && (
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <BarChart3 className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Feature Adoption</p>
                      <p className="text-xs text-muted-foreground">
                        You're using {analyticsData.featureAdoption.toFixed(0)}% of available features. 
                        Explore more modules to maximize value.
                      </p>
                    </div>
                  </div>
                )}
                
                {analyticsData.utilization.storage > 85 && (
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Storage Warning</p>
                      <p className="text-xs text-muted-foreground">
                        You're using {analyticsData.utilization.storage.toFixed(0)}% of storage. 
                        Consider upgrading or cleaning up old data.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Usage Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'User Licenses', value: analyticsData.utilization.users, limit: 100 },
                  { name: 'Storage Space', value: analyticsData.utilization.storage, limit: 100 },
                  { name: 'API Calls', value: analyticsData.utilization.api, limit: 100 },
                  { name: 'Feature Adoption', value: analyticsData.featureAdoption, limit: 100 }
                ].map((item) => {
                  const status = getUtilizationStatus(item.value);
                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center space-x-2">
                          <status.icon className={`h-4 w-4 ${status.color}`} />
                          <span className="text-sm">{item.value.toFixed(0)}%</span>
                        </div>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}