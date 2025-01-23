'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download
} from 'lucide-react';

const WastageReportingDashboard = () => {
  const monthlyWastage = [
    { month: 'Jan', value: 2500 },
    { month: 'Feb', value: 1800 },
    { month: 'Mar', value: 3200 },
    { month: 'Apr', value: 2200 },
    { month: 'May', value: 2800 },
    { month: 'Jun', value: 1900 }
  ];

  const wastageByReason = [
    { name: 'Expiration', value: 45 },
    { name: 'Damage', value: 25 },
    { name: 'Quality Issues', value: 20 },
    { name: 'Other', value: 10 }
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16'];

  const wastageRecords = [
    {
      id: 1,
      date: '2024-01-15',
      itemCode: 'BEV-001',
      itemName: 'Thai Milk Tea (12 pack)',
      quantity: 5,
      unitCost: 45.99,
      totalLoss: 229.95,
      reason: 'Expiration',
      reportedBy: 'John Smith',
      status: 'Pending Review'
    },
    {
      id: 2,
      date: '2024-01-14',
      itemCode: 'BEV-002',
      itemName: 'Coffee Beans (1kg)',
      quantity: 2,
      unitCost: 28.50,
      totalLoss: 57.00,
      reason: 'Quality Issues',
      reportedBy: 'Jane Doe',
      status: 'Approved'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-gray-500">Total Wastage This Month</p>
              <p className="text-2xl font-bold text-red-500">$3,458.50</p>
              <p className="text-sm text-green-500">-12% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-gray-500">Items Written Off</p>
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-red-500">+8% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-500">12</p>
              <p className="text-sm">Requires attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Wastage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyWastage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wastage by Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wastageByReason}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wastageByReason.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {wastageByReason.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wastage Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wastage Records</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input className="pl-8" placeholder="Search records..." />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wastageRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.itemCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.unitCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.totalLoss}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Pending Review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WastageReportingDashboard;