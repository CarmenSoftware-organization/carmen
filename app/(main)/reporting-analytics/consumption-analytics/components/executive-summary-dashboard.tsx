'use client';

import React, { useState } from 'react';
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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, 
  Users, Target, AlertCircle, CheckCircle,
  Calendar, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus, Star
} from 'lucide-react';

interface ExecutiveKPI {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
}

interface StrategicInsight {
  id: string;
  category: 'revenue' | 'efficiency' | 'customer' | 'compliance' | 'growth';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  timeline: string;
  roi_potential: number;
}

interface MarketPosition {
  segment: string;
  market_share: number;
  growth_rate: number;
  competitive_advantage: number;
  customer_satisfaction: number;
}

interface RiskAlert {
  id: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
  timeline: string;
}

export default function ExecutiveSummaryDashboard() {
  const [timeRange, setTimeRange] = useState('quarter');
  const [refreshing, setRefreshing] = useState(false);

  // Executive KPIs
  const executiveKPIs: ExecutiveKPI[] = [
    {
      id: 'fractional_revenue',
      title: 'Fractional Revenue',
      value: '$2.85M',
      change: 15.3,
      trend: 'up',
      target: 85,
      unit: 'million',
      priority: 'high'
    },
    {
      id: 'gross_margin',
      title: 'Gross Margin',
      value: '68.2%',
      change: 3.1,
      trend: 'up',
      target: 70,
      unit: 'percent',
      priority: 'high'
    },
    {
      id: 'customer_satisfaction',
      title: 'Customer Satisfaction',
      value: '4.7/5.0',
      change: 0.2,
      trend: 'up',
      target: 95,
      unit: 'rating',
      priority: 'medium'
    },
    {
      id: 'operational_efficiency',
      title: 'Operational Efficiency',
      value: '87.3%',
      change: -2.1,
      trend: 'down',
      target: 90,
      unit: 'percent',
      priority: 'high'
    },
    {
      id: 'waste_reduction',
      title: 'Waste Reduction',
      value: '23.5%',
      change: 5.8,
      trend: 'up',
      target: 80,
      unit: 'percent',
      priority: 'medium'
    },
    {
      id: 'market_share',
      title: 'Market Share',
      value: '12.8%',
      change: 1.2,
      trend: 'up',
      target: 70,
      unit: 'percent',
      priority: 'low'
    }
  ];

  // Strategic Insights
  const strategicInsights: StrategicInsight[] = [
    {
      id: 'si1',
      category: 'revenue',
      title: 'Premium Fractional Products Drive 34% Revenue Growth',
      description: 'High-margin fractional items are outperforming whole products by 34% in revenue per square foot.',
      impact: 'high',
      recommendation: 'Expand premium fractional product lines and optimize shelf placement for maximum visibility.',
      timeline: '3-6 months',
      roi_potential: 285000
    },
    {
      id: 'si2',
      category: 'efficiency',
      title: 'Kitchen Automation Reduces Labor Costs by 18%',
      description: 'Automated portioning systems for fractional products show significant labor savings.',
      impact: 'high',
      recommendation: 'Accelerate automation rollout to all locations with ROI analysis.',
      timeline: '6-12 months',
      roi_potential: 450000
    },
    {
      id: 'si3',
      category: 'customer',
      title: 'Younger Demographics Prefer Fractional Options 3:1',
      description: 'Gen Z and Millennial customers show strong preference for fractional portions.',
      impact: 'medium',
      recommendation: 'Develop targeted marketing campaigns and loyalty programs for younger demographics.',
      timeline: '2-4 months',
      roi_potential: 125000
    }
  ];

  // Market Position Data
  const marketPosition: MarketPosition[] = [
    {
      segment: 'Premium Fractional',
      market_share: 18.5,
      growth_rate: 24.3,
      competitive_advantage: 85,
      customer_satisfaction: 92
    },
    {
      segment: 'Value Fractional',
      market_share: 12.8,
      growth_rate: 15.7,
      competitive_advantage: 72,
      customer_satisfaction: 88
    },
    {
      segment: 'Specialty Items',
      market_share: 8.3,
      growth_rate: 31.2,
      competitive_advantage: 94,
      customer_satisfaction: 95
    }
  ];

  // Revenue Trend Data
  const revenueTrend = [
    { period: 'Q1 2023', fractional: 2.1, traditional: 4.8, total: 6.9 },
    { period: 'Q2 2023', fractional: 2.3, traditional: 4.6, total: 6.9 },
    { period: 'Q3 2023', fractional: 2.5, traditional: 4.5, total: 7.0 },
    { period: 'Q4 2023', fractional: 2.7, traditional: 4.4, total: 7.1 },
    { period: 'Q1 2024', fractional: 2.85, traditional: 4.3, total: 7.15 }
  ];

  // Risk Alerts
  const riskAlerts: RiskAlert[] = [
    {
      id: 'r1',
      level: 'high',
      category: 'Supply Chain',
      title: 'Supplier Concentration Risk',
      description: '68% of fractional ingredients sourced from single supplier',
      probability: 75,
      impact: 85,
      mitigation: 'Diversify supplier base and establish backup contracts',
      timeline: '2 months'
    },
    {
      id: 'r2',
      level: 'medium',
      category: 'Regulatory',
      title: 'Upcoming Food Labeling Regulations',
      description: 'New fractional product labeling requirements effective Q3 2024',
      probability: 95,
      impact: 60,
      mitigation: 'Update labeling systems and train compliance team',
      timeline: '4 months'
    }
  ];

  // Performance Distribution
  const performanceDistribution = [
    { name: 'Exceeding Targets', value: 45, color: '#10b981' },
    { name: 'Meeting Targets', value: 30, color: '#3b82f6' },
    { name: 'Below Targets', value: 20, color: '#f59e0b' },
    { name: 'Underperforming', value: 5, color: '#ef4444' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground">Fractional Sales Strategic Overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Executive KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {executiveKPIs.map((kpi) => (
          <Card key={kpi.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(kpi.trend)}
                <Badge variant={kpi.priority === 'high' ? 'destructive' : 
                              kpi.priority === 'medium' ? 'default' : 'secondary'} 
                       className="text-xs">
                  {kpi.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`flex items-center ${
                    kpi.change > 0 ? 'text-green-600' : 
                    kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.change > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : 
                     kpi.change < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : null}
                    {Math.abs(kpi.change)}%
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
                {kpi.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress to Target</span>
                      <span>{kpi.target}%</span>
                    </div>
                    <Progress value={kpi.target} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Trend and Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend Analysis</CardTitle>
            <CardDescription>
              Fractional vs Traditional Product Performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${value}M`} />
                  <Tooltip 
                    formatter={(value, name) => [`$${value}M`, name === 'fractional' ? 'Fractional' : name === 'traditional' ? 'Traditional' : 'Total']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="traditional" 
                    stackId="1"
                    stroke="#94a3b8" 
                    fill="#94a3b8" 
                    fillOpacity={0.8}
                    name="Traditional"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fractional" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.8}
                    name="Fractional"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>
              Location performance vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Locations']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Position Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Market Position Analysis</CardTitle>
          <CardDescription>
            Competitive positioning across key segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={marketPosition}>
                <PolarGrid />
                <PolarAngleAxis dataKey="segment" />
                <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
                <Radar
                  name="Market Share"
                  dataKey="market_share"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Growth Rate"
                  dataKey="growth_rate"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Competitive Advantage"
                  dataKey="competitive_advantage"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Insights & Recommendations</CardTitle>
          <CardDescription>
            Key insights and actionable recommendations for executive action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategicInsights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={
                        insight.category === 'revenue' ? 'default' :
                        insight.category === 'efficiency' ? 'secondary' :
                        insight.category === 'customer' ? 'outline' : 'destructive'
                      }>
                        {insight.category}
                      </Badge>
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 
                                   insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{insight.title}</h4>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="font-medium text-blue-900 mb-1">Recommendation:</p>
                      <p className="text-blue-800">{insight.recommendation}</p>
                    </div>
                  </div>
                  <div className="ml-4 text-right space-y-2">
                    <div className="text-sm text-gray-500">{insight.timeline}</div>
                    <div className="font-bold text-green-600">
                      ${(insight.roi_potential / 1000).toFixed(0)}K ROI
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Risk Management Dashboard
          </CardTitle>
          <CardDescription>
            Critical risks requiring executive attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskAlerts.map((risk) => (
              <div key={risk.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.level)}`} />
                      <Badge variant="outline">{risk.category}</Badge>
                      <Badge variant={
                        risk.level === 'critical' ? 'destructive' :
                        risk.level === 'high' ? 'destructive' :
                        risk.level === 'medium' ? 'default' : 'secondary'
                      }>
                        {risk.level} risk
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{risk.title}</h4>
                    <p className="text-gray-600 mb-3">{risk.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-500">Probability:</span>
                        <div className="flex items-center">
                          <Progress value={risk.probability} className="h-2 flex-1 mr-2" />
                          <span className="text-sm font-medium">{risk.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Impact:</span>
                        <div className="flex items-center">
                          <Progress value={risk.impact} className="h-2 flex-1 mr-2" />
                          <span className="text-sm font-medium">{risk.impact}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                      <p className="font-medium text-orange-900 mb-1">Mitigation Strategy:</p>
                      <p className="text-orange-800">{risk.mitigation}</p>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-500">Timeline:</div>
                    <div className="font-medium">{risk.timeline}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}