'use client'

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Users, Package, ArrowUp, ArrowDown, MoreVertical, Filter } from 'lucide-react';
import Link from 'next/link';
import { CountsTable } from './components/counts-table';

// Mock data - replace with actual API data
const mockStats = {
  totalCounts: 156,
  inProgress: 8,
  scheduledToday: 12,
  pendingReview: 5,
};

const mockRecentCounts = [
  {
    id: '1',
    department: 'Grocery',
    counter: 'John Doe',
    startTime: '2024-01-10T09:00:00',
    status: 'in_progress',
    itemsCounted: 234,
    variance: 12,
  },
  {
    id: '2',
    department: 'Produce',
    counter: 'Jane Smith',
    startTime: '2024-01-10T08:30:00',
    status: 'completed',
    itemsCounted: 156,
    variance: -5,
  },
  // Add more mock data...
];

const mockChartData = [
  { name: 'Jan', counts: 65 },
  { name: 'Feb', counts: 59 },
  { name: 'Mar', counts: 80 },
  { name: 'Apr', counts: 81 },
  { name: 'May', counts: 56 },
  { name: 'Jun', counts: 55 },
];

export default function PhysicalCountDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Physical Count Dashboard</h1>
          <p className="text-gray-500">Overview of all physical count activities</p>
        </div>
        <Link
          href="/inventory-management/physical-count"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Count
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <p className="text-gray-500">Total Counts</p>
          <p className="text-2xl font-bold">{mockStats.totalCounts}</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="text-green-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <p className="text-gray-500">In Progress</p>
          <p className="text-2xl font-bold">{mockStats.inProgress}</p>
          <p className="text-sm text-blue-600 mt-2">
            {mockStats.scheduledToday} scheduled today
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="text-purple-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <p className="text-gray-500">Active Counters</p>
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-gray-600 mt-2">Across 5 departments</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="text-orange-600" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <p className="text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold">{mockStats.pendingReview}</p>
          <p className="text-sm text-orange-600 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Chart and Recent Counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Count Activity</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Filter size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="counts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Counts */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Counts</h2>
            <button className="text-blue-600 text-sm hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-6">
            {mockRecentCounts.map((count) => (
              <div key={count.id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{count.department}</p>
                  <p className="text-sm text-gray-500">{count.counter}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(count.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      count.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {count.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  </span>
                  <p className="text-sm font-medium mt-1">
                    {count.itemsCounted} items
                  </p>
                  <p
                    className={`text-xs flex items-center justify-end gap-1 ${
                      count.variance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {count.variance > 0 ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )}
                    {Math.abs(count.variance)} variance
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Counts Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">All Physical Counts</h2>
          <div className="space-x-4">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Schedule Count
            </button>
            <Link
              href="/inventory-management/physical-count"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Count
            </Link>
          </div>
        </div>
        <CountsTable />
      </div>
    </div>
  );
}
