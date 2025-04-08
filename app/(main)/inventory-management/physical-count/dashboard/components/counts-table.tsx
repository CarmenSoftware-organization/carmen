'use client'

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
} from 'lucide-react';

interface Count {
  id: string;
  department: string;
  location: string;
  counter: string;
  startTime: string;
  endTime: string | null;
  status: string;
  itemsCounted: number;
  variance: number;
}

// Mock data - replace with actual API data
const mockCounts: Count[] = [
  {
    id: '1',
    department: 'Grocery',
    location: 'Aisle A1-A3',
    counter: 'John Doe',
    startTime: '2024-01-10T09:00:00',
    endTime: null,
    status: 'in_progress',
    itemsCounted: 234,
    variance: 12,
  },
  {
    id: '2',
    department: 'Produce',
    location: 'Fresh Section',
    counter: 'Jane Smith',
    startTime: '2024-01-10T08:30:00',
    endTime: '2024-01-10T10:45:00',
    status: 'completed',
    itemsCounted: 156,
    variance: -5,
  },
  // Add more mock data...
];

const statusColors = {
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function CountsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Count>('startTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof Count) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredCounts = mockCounts.filter(
    (count) =>
      count.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      count.counter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      count.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCounts = [...filteredCounts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  const totalPages = Math.ceil(sortedCounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCounts = sortedCounts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl border">
      {/* Table Controls */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search counts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <button className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} className="text-gray-500" />
              <span>Filter</span>
            </button>
          </div>
          <button className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <Download size={20} className="text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-2">
                  Department
                  {sortField === 'department' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Counter</th>
              <th
                className="px-4 py-3 text-left cursor-pointer"
                onClick={() => handleSort('startTime')}
              >
                <div className="flex items-center gap-2">
                  Start Time
                  {sortField === 'startTime' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th
                className="px-4 py-3 text-right cursor-pointer"
                onClick={() => handleSort('itemsCounted')}
              >
                <div className="flex items-center justify-end gap-2">
                  Items
                  {sortField === 'itemsCounted' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer"
                onClick={() => handleSort('variance')}
              >
                <div className="flex items-center justify-end gap-2">
                  Variance
                  {sortField === 'variance' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCounts.map((count) => (
              <tr key={count.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{count.department}</td>
                <td className="px-4 py-3">{count.location}</td>
                <td className="px-4 py-3">{count.counter}</td>
                <td className="px-4 py-3">
                  {new Date(count.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {count.endTime
                    ? `${Math.round(
                        (new Date(count.endTime).getTime() -
                          new Date(count.startTime).getTime()) /
                          (1000 * 60)
                      )} min`
                    : 'In Progress'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs text-center ${
                      statusColors[count.status as keyof typeof statusColors]
                    }`}
                  >
                    {count.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{count.itemsCounted}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={count.variance > 0 ? 'text-red-600' : 'text-green-600'}
                  >
                    {count.variance > 0 ? '+' : ''}
                    {count.variance}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + itemsPerPage, sortedCounts.length)} of{' '}
            {sortedCounts.length} counts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
