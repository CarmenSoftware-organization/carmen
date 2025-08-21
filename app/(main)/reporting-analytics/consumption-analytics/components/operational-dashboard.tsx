'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { 
  ChefHat, Users, Clock, Thermometer, Package,
  AlertTriangle, CheckCircle, Timer, Truck,
  TrendingUp, TrendingDown, RefreshCw, Bell,
  Eye, EyeOff, Settings, Filter, Search,
  Zap, Target, Activity
} from 'lucide-react';

interface OperationalMetric {
  id: string;
  title: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: number;
  current: number;
  unit: string;
  lastUpdated: string;
}

interface StationStatus {
  id: string;
  name: string;
  type: 'prep' | 'cooking' | 'assembly' | 'packaging';
  status: 'operational' | 'warning' | 'maintenance' | 'offline';
  efficiency: number;
  current_load: number;
  capacity: number;
  active_orders: number;
  staff_count: number;
  temperature?: number;
  next_maintenance: string;
}

interface ActiveOrder {
  id: string;
  order_number: string;
  station: string;
  items: OrderItem[];
  priority: 'normal' | 'high' | 'urgent';
  start_time: string;
  estimated_completion: string;
  actual_time?: string;
  status: 'queued' | 'in_progress' | 'quality_check' | 'ready' | 'completed';
  staff_assigned: string[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  fractional_portions: number;
  prep_time: number;
  special_instructions?: string;
  allergens: string[];
}

interface QualityAlert {
  id: string;
  type: 'temperature' | 'timing' | 'portioning' | 'allergen' | 'waste';
  severity: 'low' | 'medium' | 'high' | 'critical';
  station: string;
  description: string;
  time_detected: string;
  action_required: string;
  assigned_to?: string;
}

interface InventoryAlert {
  id: string;
  item: string;
  current_level: number;
  minimum_level: number;
  unit: string;
  category: 'fractional' | 'whole' | 'ingredient';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  supplier: string;
  estimated_depletion: string;
  reorder_quantity: number;
}

export default function OperationalDashboard() {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertsVisible, setAlertsVisible] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Operational Metrics
  const operationalMetrics: OperationalMetric[] = [
    {
      id: 'avg_prep_time',
      title: 'Avg Prep Time',
      value: '12.5 min',
      status: 'normal',
      threshold: 15,
      current: 12.5,
      unit: 'minutes',
      lastUpdated: '2 min ago'
    },
    {
      id: 'order_accuracy',
      title: 'Order Accuracy',
      value: '98.2%',
      status: 'normal',
      threshold: 95,
      current: 98.2,
      unit: 'percent',
      lastUpdated: '1 min ago'
    },
    {
      id: 'kitchen_efficiency',
      title: 'Kitchen Efficiency',
      value: '87.3%',
      status: 'warning',
      threshold: 90,
      current: 87.3,
      unit: 'percent',
      lastUpdated: '30 sec ago'
    },
    {
      id: 'waste_level',
      title: 'Waste Level',
      value: '3.2%',
      status: 'normal',
      threshold: 5,
      current: 3.2,
      unit: 'percent',
      lastUpdated: '5 min ago'
    },
    {
      id: 'staff_utilization',
      title: 'Staff Utilization',
      value: '89%',
      status: 'normal',
      threshold: 85,
      current: 89,
      unit: 'percent',
      lastUpdated: '1 min ago'
    },
    {
      id: 'customer_wait',
      title: 'Avg Customer Wait',
      value: '8.7 min',
      status: 'warning',
      threshold: 8,
      current: 8.7,
      unit: 'minutes',
      lastUpdated: '45 sec ago'
    }
  ];

  // Station Status Data
  const stationStatus: StationStatus[] = [
    {
      id: 'prep_1',
      name: 'Prep Station 1',
      type: 'prep',
      status: 'operational',
      efficiency: 92,
      current_load: 75,
      capacity: 100,
      active_orders: 12,
      staff_count: 3,
      temperature: 4,
      next_maintenance: '2024-01-20'
    },
    {
      id: 'cook_1',
      name: 'Cooking Station 1',
      type: 'cooking',
      status: 'warning',
      efficiency: 85,
      current_load: 95,
      capacity: 100,
      active_orders: 18,
      staff_count: 2,
      temperature: 180,
      next_maintenance: '2024-01-15'
    },
    {
      id: 'assembly_1',
      name: 'Assembly Line 1',
      type: 'assembly',
      status: 'operational',
      efficiency: 94,
      current_load: 60,
      capacity: 100,
      active_orders: 8,
      staff_count: 4,
      next_maintenance: '2024-01-25'
    },
    {
      id: 'packaging_1',
      name: 'Packaging Station 1',
      type: 'packaging',
      status: 'operational',
      efficiency: 88,
      current_load: 40,
      capacity: 100,
      active_orders: 5,
      staff_count: 2,
      next_maintenance: '2024-01-22'
    }
  ];

  // Active Orders Queue
  const activeOrders: ActiveOrder[] = [
    {
      id: 'ord_001',
      order_number: '#4521',
      station: 'prep_1',
      items: [
        {
          id: 'item_1',
          name: 'Premium Salmon Portions',
          quantity: 6,
          fractional_portions: 12,
          prep_time: 15,
          allergens: ['Fish']
        }
      ],
      priority: 'urgent',
      start_time: '14:25',
      estimated_completion: '14:40',
      status: 'in_progress',
      staff_assigned: ['John D.', 'Sarah M.']
    },
    {
      id: 'ord_002',
      order_number: '#4522',
      station: 'cook_1',
      items: [
        {
          id: 'item_2',
          name: 'Wagyu Beef Cuts',
          quantity: 4,
          fractional_portions: 8,
          prep_time: 25,
          special_instructions: 'Medium-rare only',
          allergens: []
        }
      ],
      priority: 'high',
      start_time: '14:30',
      estimated_completion: '14:55',
      status: 'queued',
      staff_assigned: ['Mike R.']
    }
  ];

  // Quality Alerts
  const qualityAlerts: QualityAlert[] = [
    {
      id: 'qa_001',
      type: 'temperature',
      severity: 'high',
      station: 'prep_1',
      description: 'Refrigeration temperature rising above safe limits',
      time_detected: '14:32',
      action_required: 'Check cooling system immediately',
      assigned_to: 'Maintenance Team'
    },
    {
      id: 'qa_002',
      type: 'portioning',
      severity: 'medium',
      station: 'assembly_1',
      description: 'Fractional portions inconsistent - 5% variance detected',
      time_detected: '14:28',
      action_required: 'Recalibrate portioning scales',
      assigned_to: 'Sarah M.'
    }
  ];

  // Inventory Alerts
  const inventoryAlerts: InventoryAlert[] = [
    {
      id: 'inv_001',
      item: 'Premium Olive Oil',
      current_level: 2.5,
      minimum_level: 5,
      unit: 'liters',
      category: 'ingredient',
      urgency: 'high',
      supplier: 'Mediterranean Imports',
      estimated_depletion: '2 hours',
      reorder_quantity: 20
    },
    {
      id: 'inv_002',
      item: 'Artisan Cheese Wheels',
      current_level: 1,
      minimum_level: 3,
      unit: 'wheels',
      category: 'fractional',
      urgency: 'critical',
      supplier: 'Local Dairy Co',
      estimated_depletion: '45 minutes',
      reorder_quantity: 10
    }
  ];

  // Performance trends for the day
  const hourlyPerformance = [
    { hour: '08:00', efficiency: 85, orders: 12, waste: 2.1 },
    { hour: '09:00', efficiency: 88, orders: 18, waste: 2.8 },
    { hour: '10:00', efficiency: 92, orders: 24, waste: 3.1 },
    { hour: '11:00', efficiency: 89, orders: 32, waste: 3.5 },
    { hour: '12:00', efficiency: 86, orders: 45, waste: 4.2 },
    { hour: '13:00', efficiency: 84, orders: 52, waste: 3.8 },
    { hour: '14:00', efficiency: 87, orders: 38, waste: 3.2 },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'maintenance': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Real-time Clock */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <ChefHat className="h-6 w-6 mr-2" />
            Kitchen Operations Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time operational monitoring • {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAlertsVisible(!alertsVisible)}
          >
            {alertsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Live
          </Badge>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {operationalMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                <div className={`w-2 h-2 rounded-full ${
                  metric.status === 'normal' ? 'bg-green-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="text-lg font-bold">{metric.value}</div>
              <div className="text-xs text-gray-500">{metric.lastUpdated}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stations">Station Status</TabsTrigger>
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Station Status Tab */}
        <TabsContent value="stations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stationStatus.map((station) => (
              <Card key={station.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{station.name}</CardTitle>
                    <Badge className={getStatusColor(station.status)}>
                      {station.status}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">
                    {station.type} • {station.staff_count} staff
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficiency</span>
                      <span>{station.efficiency}%</span>
                    </div>
                    <Progress value={station.efficiency} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Load</span>
                      <span>{station.current_load}/{station.capacity}</span>
                    </div>
                    <Progress 
                      value={station.current_load} 
                      className={`h-2 ${station.current_load > 90 ? 'text-red-500' : ''}`} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Active Orders:</span>
                      <div className="font-medium">{station.active_orders}</div>
                    </div>
                    {station.temperature && (
                      <div>
                        <span className="text-gray-500">Temp:</span>
                        <div className="font-medium flex items-center">
                          <Thermometer className="h-3 w-3 mr-1" />
                          {station.temperature}°C
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Next Maintenance: {station.next_maintenance}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="h-5 w-5 mr-2" />
                Active Order Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`} />
                          <span className="font-semibold">{order.order_number}</span>
                          <Badge variant="outline">{order.station}</Badge>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Items:</h4>
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm space-y-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-gray-500">
                                  Qty: {item.quantity} ({item.fractional_portions} portions)
                                </div>
                                {item.allergens.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.allergens.map((allergen) => (
                                      <Badge key={allergen} variant="destructive" className="text-xs">
                                        {allergen}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Started:</span> {order.start_time}
                            </div>
                            <div>
                              <span className="text-gray-500">Est. Completion:</span> {order.estimated_completion}
                            </div>
                            <div>
                              <span className="text-gray-500">Staff:</span> {order.staff_assigned.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Control Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Quality Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {alert.severity} {alert.type}
                          </Badge>
                          <Badge variant="outline">{alert.station}</Badge>
                        </div>
                        <h4 className="font-medium mb-2">{alert.description}</h4>
                        <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                          <p className="font-medium text-orange-900">Action Required:</p>
                          <p className="text-orange-800">{alert.action_required}</p>
                        </div>
                      </div>
                      <div className="ml-4 text-right text-sm text-gray-500">
                        <div>Detected: {alert.time_detected}</div>
                        {alert.assigned_to && (
                          <div>Assigned: {alert.assigned_to}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            alert.urgency === 'critical' ? 'destructive' :
                            alert.urgency === 'high' ? 'destructive' :
                            alert.urgency === 'medium' ? 'default' : 'secondary'
                          }>
                            {alert.urgency} urgency
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                        </div>
                        
                        <h4 className="font-medium mb-2">{alert.item}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Current Level:</span>
                            <div className="font-medium">{alert.current_level} {alert.unit}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Minimum Level:</span>
                            <div className="font-medium">{alert.minimum_level} {alert.unit}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Est. Depletion:</span>
                            <div className="font-medium text-red-600">{alert.estimated_depletion}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Reorder Qty:</span>
                            <div className="font-medium">{alert.reorder_quantity} {alert.unit}</div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-blue-900">Supplier: <span className="font-medium">{alert.supplier}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Performance Trends</CardTitle>
              <CardDescription>Today's operational performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Efficiency (%)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Orders Processed"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="waste" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Waste (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}