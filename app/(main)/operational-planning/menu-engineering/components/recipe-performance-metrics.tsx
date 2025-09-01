'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Target, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipePerformanceProps {
  recipeId: string;
  recipeName: string;
  className?: string;
}

// Mock performance data
const performanceData = {
  classification: 'star' as const,
  popularityScore: 85,
  profitabilityScore: 90,
  totalSales: 450,
  totalRevenue: 13500,
  grossMargin: 60,
  unitContribution: 18,
  salesTrend: 12,
  profitTrend: 8,
  costTrend: -3,
  // Historical data for charts
  salesHistory: [
    { month: 'Jan', sales: 380, revenue: 11400, cost: 4560 },
    { month: 'Feb', sales: 420, revenue: 12600, cost: 5040 },
    { month: 'Mar', sales: 390, revenue: 11700, cost: 4680 },
    { month: 'Apr', sales: 450, revenue: 13500, cost: 5400 },
    { month: 'May', sales: 410, revenue: 12300, cost: 4920 },
    { month: 'Jun', sales: 480, revenue: 14400, cost: 5760 }
  ],
  // Cost breakdown
  costBreakdown: [
    { category: 'Ingredients', amount: 12.50, percentage: 69 },
    { category: 'Labor', amount: 3.20, percentage: 18 },
    { category: 'Overhead', amount: 2.30, percentage: 13 }
  ],
  // Performance vs competitors
  competitorData: [
    { name: 'Our Recipe', popularity: 85, profitability: 90, fill: '#22c55e' },
    { name: 'Competitor A', popularity: 75, profitability: 75, fill: '#94a3b8' },
    { name: 'Competitor B', popularity: 80, profitability: 70, fill: '#94a3b8' },
    { name: 'Industry Average', popularity: 65, profitability: 65, fill: '#94a3b8' }
  ]
};

const classificationConfig = {
  star: {
    label: 'Star',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Star,
    description: 'High popularity, High profitability'
  },
  plow_horse: {
    label: 'Plow Horse',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: BarChart3,
    description: 'High popularity, Low profitability'
  },
  puzzle: {
    label: 'Puzzle',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Target,
    description: 'Low popularity, High profitability'
  },
  dog: {
    label: 'Dog',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'Low popularity, Low profitability'
  }
};

export default function RecipePerformanceMetrics({ recipeId, recipeName, className }: RecipePerformanceProps) {
  const classification = classificationConfig[performanceData.classification];
  const ClassificationIcon = classification.icon;

  const renderTrendIndicator = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs font-medium">+{value}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs font-medium">{value}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <span className="text-xs font-medium">0%</span>
        </div>
      );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Overview */}
      <Card className={cn("border-2", classification.borderColor)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Menu Engineering Performance</CardTitle>
              <CardDescription>Current classification and key metrics</CardDescription>
            </div>
            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full", classification.bgColor)}>
              <ClassificationIcon className={cn("h-4 w-4", classification.color)} />
              <span className={cn("font-medium text-sm", classification.color)}>
                {classification.label}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classification Description */}
          <div className={cn("p-4 rounded-lg", classification.bgColor)}>
            <p className={cn("text-sm", classification.color)}>
              <strong>{classification.label} Items:</strong> {classification.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Popularity Score</span>
                {renderTrendIndicator(performanceData.salesTrend)}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{performanceData.popularityScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={performanceData.popularityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profitability Score</span>
                {renderTrendIndicator(performanceData.profitTrend)}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{performanceData.profitabilityScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={performanceData.profitabilityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sales</span>
                {renderTrendIndicator(performanceData.salesTrend)}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{performanceData.totalSales}</span>
                <span className="text-sm text-muted-foreground">units</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unit Contribution</span>
                {renderTrendIndicator(performanceData.costTrend)}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">${performanceData.unitContribution}</span>
                <span className="text-sm text-muted-foreground">profit</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales and Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales & Revenue Trends</CardTitle>
            <CardDescription>6-month historical performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "#3b82f6" },
                revenue: { label: "Revenue", color: "#22c55e" }
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.salesHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Sales (units)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
            <CardDescription>Current cost structure analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChartContainer
                config={{
                  ingredients: { label: "Ingredients", color: "#ef4444" },
                  labor: { label: "Labor", color: "#f59e0b" },
                  overhead: { label: "Overhead", color: "#6b7280" }
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData.costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="percentage"
                      nameKey="category"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#6b7280" />
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                              <p className="font-medium">{data.category}</p>
                              <p className="text-sm">${data.amount.toFixed(2)} ({data.percentage}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Cost Details */}
              <div className="space-y-2">
                {performanceData.costBreakdown.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#6b7280'
                        }} 
                      />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">${item.amount.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitive Position</CardTitle>
          <CardDescription>Performance vs industry benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              our_recipe: { label: "Our Recipe", color: "#22c55e" },
              competitors: { label: "Competitors", color: "#94a3b8" }
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData.competitorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">Popularity: {payload[0].value}%</p>
                          <p className="text-sm">Profitability: {payload[1].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="popularity" name="Popularity" fill="#3b82f6" />
                <Bar dataKey="profitability" name="Profitability" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Optimization suggestions based on current performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.classification === 'star' ? (
              <>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Maintain Excellence</h4>
                    <p className="text-sm text-green-700 mt-1">
                      This is a star performer! Continue promoting this item and maintain quality standards.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <ArrowUpRight className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Expansion Opportunity</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Consider creating variations or pairing suggestions to increase order frequency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Premium Positioning</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Test a slight price increase (5-10%) to maximize profitability without hurting demand.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Recommendations will appear based on menu classification</p>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last updated: 2 hours ago</span>
              <Button size="sm" variant="outline">
                View Detailed Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}