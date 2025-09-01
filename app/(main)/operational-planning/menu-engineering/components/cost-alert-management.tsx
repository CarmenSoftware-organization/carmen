'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Monitor,
  Webhook,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CostAlert {
  id: string;
  recipeName: string;
  category: string;
  alertType: 'cost_increase' | 'margin_decrease' | 'threshold_exceeded' | 'variance_detected';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  currentCost: number;
  previousCost?: number;
  thresholdValue: number;
  exceedsThresholdBy: number;
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

interface CostAlertConfig {
  id: string;
  name: string;
  description: string;
  thresholdType: 'percentage' | 'absolute' | 'variance';
  warningThreshold: number;
  criticalThreshold: number;
  isActive: boolean;
  notificationChannels: ('email' | 'sms' | 'dashboard' | 'webhook')[];
  recipients: string[];
  checkFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  recipeCount: number;
}

// Mock data
const mockAlerts: CostAlert[] = [
  {
    id: '1',
    recipeName: 'Grilled Salmon',
    category: 'Main Course',
    alertType: 'cost_increase',
    severity: 'warning',
    title: 'Cost Increase Alert',
    message: 'Ingredient costs have increased by 15% from last week',
    currentCost: 18.50,
    previousCost: 16.10,
    thresholdValue: 17.00,
    exceedsThresholdBy: 1.50,
    status: 'active',
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    recipeName: 'Wagyu Steak',
    category: 'Main Course',
    alertType: 'threshold_exceeded',
    severity: 'critical',
    title: 'Critical Cost Threshold Exceeded',
    message: 'Recipe cost has exceeded the critical threshold of $45',
    currentCost: 52.00,
    previousCost: 48.00,
    thresholdValue: 45.00,
    exceedsThresholdBy: 7.00,
    status: 'acknowledged',
    createdAt: new Date('2024-01-14T14:22:00Z'),
    acknowledgedAt: new Date('2024-01-14T15:10:00Z'),
    acknowledgedBy: 'John Chef'
  },
  {
    id: '3',
    recipeName: 'Caesar Salad',
    category: 'Appetizer',
    alertType: 'margin_decrease',
    severity: 'info',
    title: 'Margin Decrease Alert',
    message: 'Profit margin has decreased to 38% (target: 45%)',
    currentCost: 9.30,
    previousCost: 8.80,
    thresholdValue: 8.25,
    exceedsThresholdBy: 1.05,
    status: 'resolved',
    createdAt: new Date('2024-01-13T09:15:00Z')
  }
];

const mockConfigs: CostAlertConfig[] = [
  {
    id: '1',
    name: 'High-Value Items Alert',
    description: 'Monitor cost changes for premium menu items',
    thresholdType: 'percentage',
    warningThreshold: 10,
    criticalThreshold: 20,
    isActive: true,
    notificationChannels: ['email', 'dashboard'],
    recipients: ['chef@restaurant.com', 'manager@restaurant.com'],
    checkFrequency: 'daily',
    recipeCount: 15
  },
  {
    id: '2',
    name: 'Margin Protection Alert',
    description: 'Alert when profit margins fall below target',
    thresholdType: 'absolute',
    warningThreshold: 2.00,
    criticalThreshold: 5.00,
    isActive: true,
    notificationChannels: ['email', 'sms', 'dashboard'],
    recipients: ['finance@restaurant.com'],
    checkFrequency: 'realtime',
    recipeCount: 42
  },
  {
    id: '3',
    name: 'Seasonal Variance Monitor',
    description: 'Track seasonal ingredient cost fluctuations',
    thresholdType: 'variance',
    warningThreshold: 15,
    criticalThreshold: 30,
    isActive: false,
    notificationChannels: ['dashboard'],
    recipients: ['procurement@restaurant.com'],
    checkFrequency: 'weekly',
    recipeCount: 28
  }
];

const alertTypeLabels = {
  cost_increase: 'Cost Increase',
  margin_decrease: 'Margin Decrease',
  threshold_exceeded: 'Threshold Exceeded',
  variance_detected: 'Variance Detected'
};

const severityConfig = {
  info: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle },
  warning: { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertTriangle },
  critical: { color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle }
};

const statusConfig = {
  active: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Active' },
  acknowledged: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Acknowledged' },
  resolved: { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Resolved' },
  suppressed: { color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Suppressed' }
};

const notificationChannelIcons = {
  email: Mail,
  sms: MessageSquare,
  dashboard: Monitor,
  webhook: Webhook
};

export default function CostAlertManagement() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [configs, setConfigs] = useState(mockConfigs);
  const [selectedAlert, setSelectedAlert] = useState<CostAlert | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CostAlertConfig | null>(null);

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      if (searchQuery && !alert.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !alert.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [alerts, filterStatus, filterSeverity, searchQuery]);

  // Alert statistics
  const alertStats = useMemo(() => {
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  }, [alerts]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'acknowledged', 
              acknowledgedAt: new Date(),
              acknowledgedBy: 'Current User' 
            }
          : alert
      )
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' }
          : alert
      )
    );
  };

  const handleSuppressAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'suppressed' }
          : alert
      )
    );
  };

  const renderAlertCard = (alert: CostAlert) => {
    const severity = severityConfig[alert.severity];
    const status = statusConfig[alert.status];
    const SeverityIcon = severity.icon;

    return (
      <Card key={alert.id} className={cn("cursor-pointer transition-colors hover:bg-muted/50")}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full", severity.bgColor)}>
                  <SeverityIcon className={cn("h-4 w-4", severity.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{alert.recipeName} • {alert.category}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", status.color, status.bgColor)}
                >
                  {status.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(alert.createdAt, 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{alert.message}</p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Current: ${alert.currentCost.toFixed(2)}</span>
                </div>
                {alert.previousCost && (
                  <div className="flex items-center gap-1">
                    {alert.currentCost > alert.previousCost ? (
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    )}
                    <span>From: ${alert.previousCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {alert.status === 'active' && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcknowledgeAlert(alert.id);
                  }}
                >
                  Acknowledge
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolveAlert(alert.id);
                  }}
                >
                  Resolve
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuppressAlert(alert.id);
                  }}
                >
                  Suppress
                </Button>
              </div>
            )}

            {alert.acknowledgedBy && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Acknowledged by {alert.acknowledgedBy} on {format(alert.acknowledgedAt!, 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConfigCard = (config: CostAlertConfig) => (
    <Card key={config.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{config.name}</CardTitle>
            <CardDescription className="text-sm">{config.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={config.isActive} />
            <Button variant="ghost" size="sm" onClick={() => setEditingConfig(config)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Threshold Type:</span>
          <Badge variant="outline">{config.thresholdType}</Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Warning / Critical:</span>
          <span className="font-medium">
            {config.warningThreshold}
            {config.thresholdType === 'percentage' ? '%' : config.thresholdType === 'absolute' ? '$' : 'σ'} / {config.criticalThreshold}
            {config.thresholdType === 'percentage' ? '%' : config.thresholdType === 'absolute' ? '$' : 'σ'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Check Frequency:</span>
          <Badge variant="secondary">{config.checkFrequency}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Recipes Monitored:</span>
          <span className="font-medium">{config.recipeCount}</span>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Notification Channels:</span>
          <div className="flex gap-2">
            {config.notificationChannels.map(channel => {
              const Icon = notificationChannelIcons[channel];
              return (
                <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                  <Icon className="h-3 w-3" />
                  <span className="text-xs capitalize">{channel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Alert Management</h2>
          <p className="text-muted-foreground">Monitor and manage recipe cost alerts and notifications</p>
        </div>
        <Button onClick={() => setShowConfigDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Alert Rule
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alertStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-full">
                <BellRing className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{alertStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-amber-600">{alertStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="configurations">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="suppressed">Suppressed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No alerts found</h3>
                  <p className="text-sm text-muted-foreground">
                    No alerts match your current filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map(renderAlertCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {configs.map(renderConfigCard)}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Alert History</h3>
              <p className="text-sm text-muted-foreground">
                Historical alert data and analytics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
            <DialogDescription>
              Configure a new cost alert rule to monitor recipe costs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input id="rule-name" placeholder="Enter rule name..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <Textarea id="rule-description" placeholder="Describe what this rule monitors..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Threshold Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="absolute">Absolute ($)</SelectItem>
                    <SelectItem value="variance">Statistical Variance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Check Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warning Threshold</Label>
                <Input type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Critical Threshold</Label>
                <Input type="number" placeholder="20" />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Notification Channels</Label>
              <div className="space-y-2">
                {Object.entries(notificationChannelIcons).map(([channel, Icon]) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox id={channel} />
                    <Icon className="h-4 w-4" />
                    <Label htmlFor={channel} className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowConfigDialog(false)}>
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}