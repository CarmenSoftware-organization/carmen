'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  X, 
  Settings, 
  Users, 
  Package, 
  ShoppingCart,
  Truck,
  ChefHat,
  Calculator,
  BarChart3,
  Shield,
  Sliders,
  AlertTriangle,
  Info,
  Save,
  RotateCcw,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Gauge,
  LineChart,
  PieChart,
  Brain,
  Target,
  FileText,
  Building
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { 
  SubscriptionPackage, 
  UserSubscription, 
  ResourceActivation as ResourceActivationType, 
  UsageLimit 
} from '@/lib/types/permission-subscriptions';
import { ResourceType } from '@/lib/types/permission-resources';
import { 
  mockSubscriptionPackages, 
  mockUserSubscriptions 
} from '@/lib/mock-data/permission-subscriptions';

interface ResourceActivationProps {
  package?: SubscriptionPackage;
  subscription?: UserSubscription;
  onPackageUpdate?: (pkg: SubscriptionPackage) => void;
  onResourceToggle?: (resource: ResourceType, enabled: boolean) => void;
  onLimitUpdate?: (resource: ResourceType, limits: Record<string, number>) => void;
  showAnalytics?: boolean;
}

interface ResourceConfig {
  enabled: boolean;
  limits?: Record<string, number>;
  features?: string[];
  currentUsage?: Record<string, number>;
  trends?: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

interface UsageStats {
  resourceType: ResourceType;
  current: number;
  limit: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'normal' | 'warning' | 'critical' | 'over_limit';
  lastUpdated: Date;
}

export function ResourceActivation({ 
  package: pkg = mockSubscriptionPackages[1], 
  subscription = mockUserSubscriptions[0],
  onPackageUpdate, 
  onResourceToggle,
  onLimitUpdate,
  showAnalytics = true 
}: ResourceActivationProps) {
  const [resourceConfigs, setResourceConfigs] = useState<Record<string, ResourceConfig>>({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('configuration');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Mock usage statistics
  const usageStats = useMemo<UsageStats[]>(() => [
    {
      resourceType: ResourceType.USER,
      current: subscription.currentUsage.activeUsers,
      limit: pkg.features.maxUsers,
      percentage: (subscription.currentUsage.activeUsers / pkg.features.maxUsers) * 100,
      trend: 'up',
      trendValue: 12,
      status: subscription.currentUsage.activeUsers > pkg.features.maxUsers * 0.9 ? 'warning' : 'normal',
      lastUpdated: new Date()
    },
    {
      resourceType: ResourceType.INVENTORY_ITEM,
      current: 850,
      limit: 5000,
      percentage: 17,
      trend: 'up',
      trendValue: 8,
      status: 'normal',
      lastUpdated: new Date()
    },
    {
      resourceType: ResourceType.PURCHASE_REQUEST,
      current: subscription.currentUsage.resourceUsage[ResourceType.PURCHASE_REQUEST] || 120,
      limit: 1000,
      percentage: 12,
      trend: 'stable',
      trendValue: 0,
      status: 'normal',
      lastUpdated: new Date()
    },
    {
      resourceType: ResourceType.VENDOR,
      current: 45,
      limit: 100,
      percentage: 45,
      trend: 'down',
      trendValue: -5,
      status: 'normal',
      lastUpdated: new Date()
    },
    {
      resourceType: ResourceType.RECIPE,
      current: subscription.currentUsage.resourceUsage[ResourceType.RECIPE] || 75,
      limit: 500,
      percentage: 15,
      trend: 'up',
      trendValue: 18,
      status: 'normal',
      lastUpdated: new Date()
    }
  ], [subscription, pkg]);

  // Initialize resource configurations
  useEffect(() => {
    const initialConfigs: Record<string, ResourceConfig> = {};
    
    Object.values(ResourceType).forEach(resource => {
      const currentUsage = subscription.currentUsage.resourceUsage[resource] || 0;
      initialConfigs[resource] = {
        enabled: pkg.resourceActivations.some(ra => ra.resourceType === resource && ra.isActive),
        limits: getDefaultLimits(resource),
        features: getDefaultFeatures(resource),
        currentUsage: { current: currentUsage },
        trends: {
          daily: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
          weekly: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
          monthly: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
        }
      };
    });
    
    setResourceConfigs(initialConfigs);
  }, [pkg, subscription]);

  const getResourceIcon = (resource: ResourceType) => {
    switch (resource) {
      case ResourceType.USER: return <Users className="h-4 w-4" />;
      case ResourceType.PRODUCT: return <Package className="h-4 w-4" />;
      case ResourceType.PURCHASE_REQUEST: return <ShoppingCart className="h-4 w-4" />;
      case ResourceType.PURCHASE_ORDER: return <ShoppingCart className="h-4 w-4" />;
      case ResourceType.GOODS_RECEIPT_NOTE: return <Truck className="h-4 w-4" />;
      case ResourceType.INVENTORY_ITEM: return <Package className="h-4 w-4" />;
      case ResourceType.RECIPE: return <ChefHat className="h-4 w-4" />;
      case ResourceType.VENDOR: return <Users className="h-4 w-4" />;
      case ResourceType.OPERATIONAL_REPORT: return <BarChart3 className="h-4 w-4" />;
      case ResourceType.INVOICE: return <Calculator className="h-4 w-4" />;
      case ResourceType.LOCATION: return <Building className="h-4 w-4" />;
      case ResourceType.DEPARTMENT: return <Building className="h-4 w-4" />;
      case ResourceType.ROLE: return <Shield className="h-4 w-4" />;
      case ResourceType.SYSTEM_CONFIGURATION: return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getResourceDisplayName = (resource: ResourceType) => {
    return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDefaultLimits = (resource: ResourceType): Record<string, number> => {
    switch (resource) {
      case ResourceType.USER:
        return { maxUsers: pkg.features.maxUsers || 100, maxSessions: 5 };
      case ResourceType.PRODUCT:
        return { maxProducts: 1000, maxCategories: 50 };
      case ResourceType.VENDOR:
        return { maxVendors: 100, maxContracts: 500 };
      case ResourceType.PURCHASE_REQUEST:
        return { maxPRsPerMonth: 1000, maxPRValue: 50000 };
      case ResourceType.INVENTORY_ITEM:
        return { maxItems: 5000, maxLocations: pkg.features.maxLocations || 10 };
      case ResourceType.RECIPE:
        return { maxRecipes: 500, maxIngredients: 5000 };
      case ResourceType.LOCATION:
        return { maxLocations: pkg.features.maxLocations || 10 };
      case ResourceType.DEPARTMENT:
        return { maxDepartments: pkg.features.maxDepartments || 20 };
      default:
        return { maxRecords: 1000 };
    }
  };

  const getDefaultFeatures = (resource: ResourceType): string[] => {
    switch (resource) {
      case ResourceType.USER:
        return ['Role management', 'Permission assignment', 'Activity tracking'];
      case ResourceType.PRODUCT:
        return ['Category management', 'Pricing tiers', 'Inventory tracking'];
      case ResourceType.VENDOR:
        return ['Contract management', 'Performance metrics', 'Payment terms'];
      case ResourceType.PURCHASE_REQUEST:
        return ['Approval workflows', 'Budget controls', 'Vendor comparison'];
      case ResourceType.INVENTORY_ITEM:
        return ['Stock tracking', 'Reorder points', 'Valuation methods'];
      case ResourceType.RECIPE:
        return ['Cost calculation', 'Nutritional analysis', 'Scaling options'];
      default:
        return ['Basic CRUD operations', 'Search and filter', 'Export data'];
    }
  };

  const getUsageStatus = (current: number, limit: number) => {
    if (limit === -1) return 'unlimited';
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return 'over_limit';
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over_limit': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'unlimited': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over_limit': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'unlimited': return <Zap className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const handleResourceToggle = (resource: ResourceType, enabled: boolean) => {
    setResourceConfigs(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        enabled
      }
    }));
    setHasChanges(true);
    onResourceToggle?.(resource, enabled);
  };

  const handleLimitChange = (resource: ResourceType, limitKey: string, value: number) => {
    setResourceConfigs(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        limits: {
          ...prev[resource].limits,
          [limitKey]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSaveConfiguration = () => {
    const enabledResources = Object.entries(resourceConfigs)
      .filter(([_, config]) => config.enabled)
      .map(([resource, _]) => resource as ResourceType);

    const updatedPackage: SubscriptionPackage = {
      ...pkg,
      resourceActivations: enabledResources.map(resource => ({
        resourceType: resource,
        isActive: true,
        activatedAt: new Date()
      }))
    };

    onPackageUpdate?.(updatedPackage);
    
    // Update limits for each resource
    Object.entries(resourceConfigs).forEach(([resource, config]) => {
      if (config.enabled && config.limits) {
        onLimitUpdate?.(resource as ResourceType, config.limits);
      }
    });

    setHasChanges(false);
  };

  const handleReset = () => {
    const initialConfigs: Record<string, ResourceConfig> = {};
    
    Object.values(ResourceType).forEach(resource => {
      const currentUsage = subscription.currentUsage.resourceUsage[resource] || 0;
      initialConfigs[resource] = {
        enabled: pkg.resourceActivations.some(ra => ra.resourceType === resource && ra.isActive),
        limits: getDefaultLimits(resource),
        features: getDefaultFeatures(resource),
        currentUsage: { current: currentUsage }
      };
    });
    
    setResourceConfigs(initialConfigs);
    setHasChanges(false);
    setShowResetDialog(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Group resources by category
  const resourceGroups = {
    'User Management': [ResourceType.USER, ResourceType.ROLE, ResourceType.DEPARTMENT],
    'Procurement': [ResourceType.PURCHASE_REQUEST, ResourceType.PURCHASE_ORDER, ResourceType.VENDOR],
    'Inventory': [ResourceType.INVENTORY_ITEM, ResourceType.PRODUCT, ResourceType.GOODS_RECEIPT_NOTE],
    'Operations': [ResourceType.RECIPE, ResourceType.STORE_REQUISITION, ResourceType.PRODUCTION_ORDER],
    'Finance': [ResourceType.INVOICE, ResourceType.PAYMENT, ResourceType.BUDGET],
    'System': [ResourceType.LOCATION, ResourceType.SYSTEM_CONFIGURATION, ResourceType.OPERATIONAL_REPORT]
  };

  const getEnabledCount = (resources: ResourceType[]) => {
    return resources.filter(resource => resourceConfigs[resource]?.enabled).length;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Save Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Resource Management - {pkg.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor usage, configure limits, and manage resource activation
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowResetDialog(true)}
                  disabled={!hasChanges}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSaveConfiguration}
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Resources</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(resourceConfigs).filter(config => config.enabled).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Over Limit</p>
                  <p className="text-2xl font-bold text-red-600">
                    {usageStats.filter(stat => stat.status === 'over_limit' || stat.status === 'critical').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(usageStats.reduce((acc, stat) => acc + stat.percentage, 0) / usageStats.length)}%
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trending Up</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {usageStats.filter(stat => stat.trend === 'up').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            {/* Resource Groups */}
            {Object.entries(resourceGroups).map(([groupName, resources]) => {
              const availableResources = resources.filter(r => Object.values(ResourceType).includes(r));
              const enabledCount = getEnabledCount(availableResources);
              
              return (
                <Card key={groupName}>
                  <Collapsible
                    open={expandedSections[groupName] !== false}
                    onOpenChange={() => toggleSection(groupName)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{groupName}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {enabledCount}/{availableResources.length} enabled
                            </Badge>
                            <Settings className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {availableResources.map((resource) => {
                            const config = resourceConfigs[resource as string];
                            const stats = usageStats.find(s => s.resourceType === resource);
                            if (!config) return null;

                            return (
                              <div key={resource} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    {getResourceIcon(resource)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{getResourceDisplayName(resource)}</h4>
                                        {stats && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getStatusColor(stats.status)}`}
                                          >
                                            {getStatusIcon(stats.status)}
                                            <span className="ml-1">{Math.round(stats.percentage)}% used</span>
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {config.features?.join(', ') || 'Standard features'}
                                      </p>
                                      {stats && (
                                        <div className="mt-2 flex items-center gap-4">
                                          <div className="flex items-center gap-1 text-sm">
                                            <Activity className="h-3 w-3" />
                                            <span>Current: {stats.current.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-sm">
                                            <Target className="h-3 w-3" />
                                            <span>Limit: {stats.limit === -1 ? 'Unlimited' : stats.limit.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-sm">
                                            {getTrendIcon(stats.trend)}
                                            <span className={stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                                              {stats.trendValue > 0 ? '+' : ''}{stats.trendValue}%
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`toggle-${resource}`} className="text-sm">
                                      {config.enabled ? 'Enabled' : 'Disabled'}
                                    </Label>
                                    <Switch
                                      id={`toggle-${resource}`}
                                      checked={config.enabled}
                                      onCheckedChange={(checked) => handleResourceToggle(resource, checked)}
                                    />
                                  </div>
                                </div>

                                {/* Usage Progress Bar */}
                                {stats && config.enabled && (
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span>Usage</span>
                                      <span>{stats.current.toLocaleString()} / {stats.limit === -1 ? 'Unlimited' : stats.limit.toLocaleString()}</span>
                                    </div>
                                    <Progress 
                                      value={stats.limit === -1 ? 0 : stats.percentage} 
                                      className={`h-2 ${stats.status === 'critical' || stats.status === 'over_limit' ? '[&>div]:bg-red-500' : 
                                        stats.status === 'warning' ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                                    />
                                  </div>
                                )}

                                {config.enabled && config.limits && (
                                  <div className="space-y-4 pt-4 border-t">
                                    <h5 className="font-medium text-sm flex items-center gap-2">
                                      <Sliders className="h-4 w-4" />
                                      Usage Limits
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(config.limits).map(([limitKey, value]) => (
                                        <div key={limitKey} className="space-y-2">
                                          <Label className="text-sm">
                                            {limitKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                          </Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="number"
                                              value={value as number}
                                              onChange={(e) => handleLimitChange(
                                                resource,
                                                limitKey,
                                                parseInt(e.target.value) || 0
                                              )}
                                              className="w-24"
                                              min="0"
                                            />
                                            <div className="flex-1">
                                              <Slider
                                                value={[value as number]}
                                                onValueChange={(values) => handleLimitChange(
                                                  resource,
                                                  limitKey,
                                                  values[0]
                                                )}
                                                max={limitKey.includes('Value') ? 100000 : 10000}
                                                step={limitKey.includes('Value') ? 1000 : 10}
                                                className="w-full"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!config.enabled && (
                                  <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Info className="h-4 w-4" />
                                      <span>Enable this resource to configure limits and monitor usage</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Time Range Selector */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usage Analytics</CardTitle>
                  <Select value={selectedTimeRange} onValueChange={(value: '24h' | '7d' | '30d') => setSelectedTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usageStats.map((stat) => (
                <Card key={stat.resourceType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(stat.resourceType)}
                        <span className="font-medium">{getResourceDisplayName(stat.resourceType)}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(stat.status)}>
                        {getStatusIcon(stat.status)}
                        <span className="ml-1">{stat.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{stat.current.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          of {stat.limit === -1 ? 'unlimited' : stat.limit.toLocaleString()}
                        </div>
                      </div>
                      
                      <Progress 
                        value={stat.limit === -1 ? 0 : stat.percentage}
                        className={`h-3 ${stat.status === 'critical' || stat.status === 'over_limit' ? '[&>div]:bg-red-500' : 
                          stat.status === 'warning' ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(stat.trend)}
                          <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                            {stat.trendValue > 0 ? '+' : ''}{stat.trendValue}%
                          </span>
                          <span className="text-muted-foreground">vs last period</span>
                        </div>
                        <div className="text-muted-foreground">
                          Updated: {stat.lastUpdated.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Real-time Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Resource Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usageStats.filter(stat => resourceConfigs[stat.resourceType]?.enabled).map((stat) => (
                    <div key={stat.resourceType} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(stat.resourceType)}
                          <span className="font-medium text-sm">{getResourceDisplayName(stat.resourceType)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Live</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current</span>
                          <span className="font-medium">{stat.current.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={stat.limit === -1 ? 0 : stat.percentage}
                          className="h-1.5"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{stat.limit === -1 ? '∞' : stat.limit.toLocaleString()}</span>
                        </div>
                      </div>

                      {stat.status === 'critical' || stat.status === 'over_limit' ? (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {stat.status === 'over_limit' ? 'Over limit' : 'Critical usage'}
                          </div>
                        </div>
                      ) : stat.status === 'warning' ? (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Approaching limit
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Normal usage
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-muted-foreground">System Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">120ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2.1K</div>
                    <div className="text-sm text-muted-foreground">API Calls/hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">0.02%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(resourceConfigs).filter(config => config.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(ResourceType).length}
                </div>
                <div className="text-sm text-muted-foreground">Total Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {usageStats.filter(stat => stat.status === 'critical' || stat.status === 'over_limit').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(usageStats.reduce((acc, stat) => acc + stat.percentage, 0) / usageStats.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all resource configurations to the default settings for your {pkg.name} package. 
                Any unsaved changes will be lost. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground">
                Reset Configuration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}