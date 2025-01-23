'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, Award, Leaf, BarChart2, FileText, Activity } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtext: string
  icon: React.ElementType
  trend?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

const MetricCard = ({ title, value, subtext, icon: Icon, trend }: MetricCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
          <p className="text-sm text-gray-600">{subtext}</p>
        </div>
        <div className="rounded-full bg-blue-100 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-2">
          <Badge variant={trend.type === 'increase' ? 'destructive' : 'secondary'}>
            {trend.value}% vs prev period
          </Badge>
        </div>
      )}
    </CardContent>
  </Card>
)

interface EnvironmentalImpact {
  carbonFootprint: {
    value: number
    unit: string
    trend: number
  }
  energyEfficiency: {
    value: number
    benchmark: number
    trend: number
  }
  wasteReduction: {
    value: number
    trend: number
  }
  complianceRate: {
    value: number
    trend: number
  }
  lastUpdated: string
  esgScore: string
  certifications: Array<{
    name: string
    status: 'Active' | 'Expired' | 'Pending'
    expiry: string
  }>
}

interface VendorEnvironmentalProps {
  vendorId: string
  environmentalData?: EnvironmentalImpact
}

// Add these interfaces after the existing interfaces
interface EmissionsData {
  month: string
  scope1: number
  scope2: number
  scope3: number
}

interface ResourceUsageData {
  resource: string
  usage: number
  target: number
}

interface ComplianceData {
  category: string
  compliant: number
  total: number
}

export function EnvironmentalProfile({ vendorId, environmentalData }: VendorEnvironmentalProps) {
  const [timeRange, setTimeRange] = useState('1y')

  // Static data for charts
  const emissionsData: EmissionsData[] = [
    { month: 'Jan', scope1: 120, scope2: 480, scope3: 250 },
    { month: 'Feb', scope1: 115, scope2: 475, scope3: 240 },
    { month: 'Mar', scope1: 125, scope2: 490, scope3: 260 },
    { month: 'Apr', scope1: 110, scope2: 470, scope3: 230 },
    { month: 'May', scope1: 105, scope2: 465, scope3: 220 },
    { month: 'Jun', scope1: 100, scope2: 460, scope3: 210 }
  ]

  const resourceUsage: ResourceUsageData[] = [
    { resource: 'Energy', usage: 75, target: 100 },
    { resource: 'Water', usage: 82, target: 100 },
    { resource: 'Waste', usage: 45, target: 100 },
    { resource: 'Raw Materials', usage: 68, target: 100 }
  ]

  const complianceData: ComplianceData[] = [
    { category: 'Environmental', compliant: 95, total: 100 },
    { category: 'Social', compliant: 88, total: 100 },
    { category: 'Governance', compliant: 92, total: 100 }
  ]

  // Use environmental data from props, or fallback to default values
  const {
    lastUpdated = '2024-03-15',
    esgScore = 'A+',
    carbonFootprint = { value: 2450, unit: 'tCO2e', trend: -12 },
    energyEfficiency = { value: 85, benchmark: 80, trend: 5 },
    wasteReduction = { value: 45, trend: 15 },
    complianceRate = { value: 98, trend: 3 },
    certifications = [
      { name: 'ISO 14001', status: 'Active', expiry: '2025-12-31' },
      { name: 'Carbon Trust', status: 'Active', expiry: '2024-08-15' },
      { name: 'ESG Rating A+', status: 'Active', expiry: '2024-12-31' }
    ]
  } = environmentalData || {}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            Last Updated: {lastUpdated}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            ESG Score: {esgScore}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Carbon Footprint"
          value={`${carbonFootprint.value} ${carbonFootprint.unit}`}
          subtext="Total emissions YTD"
          icon={Leaf}
          trend={{ value: carbonFootprint.trend, type: carbonFootprint.trend < 0 ? 'decrease' : 'increase' }}
        />
        <MetricCard
          title="Energy Efficiency"
          value={`${energyEfficiency.value}%`}
          subtext="vs. industry benchmark"
          icon={Activity}
          trend={{ value: energyEfficiency.trend, type: energyEfficiency.trend > 0 ? 'increase' : 'decrease' }}
        />
        <MetricCard
          title="Waste Reduction"
          value={`${wasteReduction.value}%`}
          subtext="YoY improvement"
          icon={BarChart2}
          trend={{ value: wasteReduction.trend, type: wasteReduction.trend < 0 ? 'decrease' : 'increase' }}
        />
        <MetricCard
          title="Compliance Rate"
          value={`${complianceRate.value}%`}
          subtext="Environmental standards"
          icon={AlertCircle}
          trend={{ value: complianceRate.trend, type: complianceRate.trend > 0 ? 'increase' : 'decrease' }}
        />
      </div>

      <Tabs defaultValue="emissions" className="w-full">
        <TabsList>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="emissions">
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scope1" name="Scope 1" fill="#0ea5e9" />
                    <Bar dataKey="scope2" name="Scope 2" fill="#6366f1" />
                    <Bar dataKey="scope3" name="Scope 3" fill="#7dd3fc" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage vs Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="resource" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usage" name="Current Usage" fill="#0ea5e9" />
                    <Bar dataKey="target" name="Target" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {complianceData.map((item: ComplianceData) => (
                  <Card key={item.category}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">{item.category}</h3>
                        <div className="mt-2 text-3xl font-bold text-blue-600">
                          {item.compliant}%
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.compliant}/{item.total} requirements met
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <Card key={cert.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Award className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-500">
                              Expires: {cert.expiry}
                            </p>
                          </div>
                        </div>
                        <Badge variant={cert.status === 'Active' ? 'secondary' : 'destructive'}>
                          {cert.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 