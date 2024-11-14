'use client'
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Data with units (tCO2e - tonnes of CO2 equivalent)
const scopeData = [
  { year: '2019', scope1: 1200, scope2: 3800, scope3: 3000, unit: 'tCO2e' },
  { year: '2020', scope1: 1000, scope2: 3600, scope3: 2800, unit: 'tCO2e' },
  { year: '2021', scope1: 900, scope2: 3500, scope3: 2400, unit: 'tCO2e' },
  { year: '2022', scope1: 850, scope2: 3400, scope3: 2200, unit: 'tCO2e' },
  { year: '2023', scope1: 800, scope2: 3300, scope3: 2000, unit: 'tCO2e' }
];

// Energy data in kWh
const energyData = [
  { year: '2019', energy: 5413228, unit: 'kWh' },
  { year: '2020', energy: 3786304, unit: 'kWh' },
  { year: '2021', energy: 3228497, unit: 'kWh' },
  { year: '2022', energy: 4831306, unit: 'kWh' },
  { year: '2023', energy: 4251449, unit: 'kWh' }
];

// Consumption data with units
const consumptionData = [
  {
    year: '2021',
    employeeTravel: 800000, // km traveled
    foodWaste: 600000, // kg
    purchasedGoods: 1000000, // kg
    water: 400000, // m³
    energy: 500000, // kWh
    units: {
      employeeTravel: 'km',
      foodWaste: 'kg',
      purchasedGoods: 'kg',
      water: 'm³',
      energy: 'kWh'
    }
  },
  {
    year: '2022',
    employeeTravel: 700000,
    foodWaste: 500000,
    purchasedGoods: 900000,
    water: 350000,
    energy: 450000,
    units: {
      employeeTravel: 'km',
      foodWaste: 'kg',
      purchasedGoods: 'kg',
      water: 'm³',
      energy: 'kWh'
    }
  },
  {
    year: '2023',
    employeeTravel: 600000,
    foodWaste: 400000,
    purchasedGoods: 800000,
    water: 300000,
    energy: 400000,
    units: {
      employeeTravel: 'km',
      foodWaste: 'kg',
      purchasedGoods: 'kg',
      water: 'm³',
      energy: 'kWh'
    }
  }
];

// Calculate year-over-year changes
const calculateYoYChanges = (data: EnergyData[]): (EnergyData & { change: number })[] => {
  return data.map((item, index, arr) => {
    if (index === 0) return { ...item, change: 0 };
    const prevYear = arr[index - 1].energy;
    const change = ((item.energy - prevYear) / prevYear) * 100;
    return { ...item, change };
  });
};

const energyWithChanges = calculateYoYChanges(energyData);

// Calculate total emissions by year
const calculateTotalEmissions = (data: YearlyData[]): EmissionsTotal[] => {
  return data.map(year => ({
    year: year.year,
    total: year.scope1 + year.scope2 + year.scope3,
    unit: 'tCO2e'
  }));
};

const emissionTotals = calculateTotalEmissions(scopeData);

// Calculate current year breakdown for pie chart
const currentYearBreakdown = [
  { name: 'Scope 1', value: scopeData[scopeData.length - 1].scope1, unit: 'tCO2e' },
  { name: 'Scope 2', value: scopeData[scopeData.length - 1].scope2, unit: 'tCO2e' },
  { name: 'Scope 3', value: scopeData[scopeData.length - 1].scope3, unit: 'tCO2e' }
];

const COLORS = ['#0ea5e9', '#6366f1', '#7dd3fc'];

// Add type for tooltip values
type TooltipValue = string | number;

// Add helper function to safely convert values
function toNumber(value: TooltipValue): number {
  if (typeof value === 'string') return parseFloat(value);
  return value;
}

// Add helper function to format large numbers
function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

// Add interfaces for data structures
interface YearlyData {
  year: string
  scope1: number
  scope2: number
  scope3: number
  unit: string
}

interface EnergyData {
  year: string
  energy: number
  unit: string
  change?: number
}

interface ConsumptionData {
  year: string
  employeeTravel: number
  foodWaste: number
  purchasedGoods: number
  water: number
  energy: number
  units: {
    employeeTravel: string
    foodWaste: string
    purchasedGoods: string
    water: string
    energy: string
  }
}

interface EmissionsTotal {
  year: string
  total: number
  unit: string
}

interface EmissionsBreakdown {
  name: string
  value: number
  unit: string
}

// Add type for MetricCard props
interface MetricCardProps {
  title: string
  value: string | number
  subtext: string
  unit: string
}

const MetricCard = ({ title, value, subtext, unit }: MetricCardProps) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold">
      {typeof value === 'number' ? formatLargeNumber(value) : value}{' '}
      <span className="text-lg font-normal text-gray-500">{unit}</span>
    </p>
    <p className="text-sm text-gray-600">{subtext}</p>
  </div>
);

const EnvironmentalDashboard = () => {
  // Calculate metrics with proper error handling
  const latestYear = energyData[energyData.length - 1];
  const previousYear = energyData[energyData.length - 2];
  const energyChange = latestYear && previousYear
    ? ((latestYear.energy - previousYear.energy) / previousYear.energy * 100).toFixed(1)
    : '0.0';

  const currentYearBreakdown = [
    { name: 'Scope 1', value: scopeData[scopeData.length - 1].scope1, unit: 'tCO2e' },
    { name: 'Scope 2', value: scopeData[scopeData.length - 1].scope2, unit: 'tCO2e' },
    { name: 'Scope 3', value: scopeData[scopeData.length - 1].scope3, unit: 'tCO2e' }
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Energy Usage" 
          value={formatLargeNumber(latestYear?.energy || 0)}
          unit="kWh"
          subtext={`${energyChange}% vs previous year`}
        />
        <MetricCard 
          title="Current Scope 1" 
          value={formatLargeNumber(scopeData[scopeData.length - 1].scope1)}
          unit="tCO2e"
          subtext="Direct emissions"
        />
        <MetricCard 
          title="Current Scope 2" 
          value={formatLargeNumber(scopeData[scopeData.length - 1].scope2)}
          unit="tCO2e"
          subtext="Indirect emissions"
        />
        <MetricCard 
          title="Current Scope 3" 
          value={formatLargeNumber(scopeData[scopeData.length - 1].scope3)}
          unit="tCO2e"
          subtext="Value chain emissions"
        />
      </div>

      {/* Main Charts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emissions by Scope */}
        <Card className="h-[calc(100vh-800px)]">
          <CardHeader>
            <CardTitle>Emissions by Scope Over Time (tCO2e)</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scopeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value: TooltipValue) => `${formatLargeNumber(toNumber(value))}`} />
                <Tooltip 
                  formatter={(value: TooltipValue) => [
                    `${formatLargeNumber(toNumber(value))} tCO2e`, 
                    'Scope Emissions'
                  ]} 
                />
                <Legend />
                <Bar dataKey="scope1" name="Scope 1" fill="#0ea5e9" />
                <Bar dataKey="scope2" name="Scope 2" fill="#6366f1" />
                <Bar dataKey="scope3" name="Scope 3" fill="#7dd3fc" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Energy Usage Trend */}
        <Card className="h-[calc(100vh-800px)]">
          <CardHeader>
            <CardTitle>Energy Usage Trend & YoY Change (kWh)</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyWithChanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${formatLargeNumber(value)}`} />
                <YAxis yAxisId="right" orientation="right" unit="%" />
                <Tooltip 
                  formatter={(value: number | string, name: string) => {
                    if (name === 'change' && typeof value === 'number') {
                      return [`${value.toFixed(1)}%`, 'YoY Change'];
                    }
                    return [`${formatLargeNumber(Number(value))} kWh`, 'Energy Usage'];
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="energy" name="Energy Usage" stroke="#6366f1" />
                <Line yAxisId="right" type="monotone" dataKey="change" name="YoY Change %" stroke="#0ea5e9" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Current Year Emissions Distribution (tCO2e)</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentYearBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {currentYearBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: TooltipValue) => 
                    `${formatLargeNumber(toNumber(value))} tCO2e`
                  } 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Consumption Breakdown Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value: TooltipValue) => formatLargeNumber(toNumber(value))} />
                <Tooltip 
                  formatter={(value: TooltipValue, name: string, props: any) => {
                    const unit = props.payload.units[name];
                    return [`${formatLargeNumber(toNumber(value))} ${unit}`, name];
                  }} 
                />
                <Legend />
                <Bar dataKey="employeeTravel" name="Employee Travel" fill="#0ea5e9" />
                <Bar dataKey="foodWaste" name="Food Waste" fill="#7dd3fc" />
                <Bar dataKey="purchasedGoods" name="Purchased Goods" fill="#6366f1" />
                <Bar dataKey="water" name="Water" fill="#818cf8" />
                <Bar dataKey="energy" name="Energy" fill="#a5b4fc" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnvironmentalDashboard;