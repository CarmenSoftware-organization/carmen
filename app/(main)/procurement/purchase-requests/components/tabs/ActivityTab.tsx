// File: tabs/ActivityTab.tsx
import React, { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  description: string;
  details?: string;
}

interface ActivityTabProps {
  activityLog?: ActivityLogEntry[]
}

// Mock activity data for PR if no activity log is provided
const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'log-pr-001',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    userId: 'user-chef-001',
    userName: 'Chef Maria Rodriguez',
    action: 'Created',
    description: 'Purchase Request created for Grand Ballroom event supplies',
    details: 'Initial request with kitchen equipment and food supplies'
  },
  {
    id: 'log-pr-002',
    timestamp: new Date('2024-01-15T11:30:00Z'),
    userId: 'user-chef-001',
    userName: 'Chef Maria Rodriguez',
    action: 'Submitted',
    description: 'Purchase Request submitted for approval',
    details: 'Ready for department head review'
  },
  {
    id: 'log-pr-003',
    timestamp: new Date('2024-01-16T14:30:00Z'),
    userId: 'user-dh-001',
    userName: 'Kitchen Manager Sarah',
    action: 'Approved',
    description: 'Department Head approved the request',
    details: 'All items approved as requested for event preparation'
  },
  {
    id: 'log-pr-004',
    timestamp: new Date('2024-01-17T09:15:00Z'),
    userId: 'user-fm-001',
    userName: 'Finance Manager John',
    action: 'Final Approval',
    description: 'Financial Manager provided final approval',
    details: 'Budget verification completed, request fully approved'
  },
  {
    id: 'log-pr-005',
    timestamp: new Date('2024-01-18T10:00:00Z'),
    userId: 'user-purchasing-001',
    userName: 'Purchasing Coordinator',
    action: 'Processing',
    description: 'Purchase Order creation initiated',
    details: 'Vendor selection and PO generation in progress'
  }
];

export const ActivityTab: React.FC<ActivityTabProps> = ({ activityLog }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Use provided activity log or fallback to mock data
  const activities = activityLog && activityLog.length > 0 ? activityLog : mockActivityLog;

  const filteredActivityLog = useMemo(() => {
    return activities.filter(entry =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.timestamp.toISOString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activities, searchTerm])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activity log..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Activity Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date/Time</TableHead>
              <TableHead className="w-[150px]">User</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivityLog.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs">
                  <div>{entry.timestamp.toLocaleDateString()}</div>
                  <div className="text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{entry.userName}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {entry.action}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{entry.description}</div>
                  {entry.details && (
                    <div className="text-xs text-muted-foreground mt-1">{entry.details}</div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredActivityLog.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            {searchTerm ? 'No matching activity log entries found.' : 'No activity log entries available.'}
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
