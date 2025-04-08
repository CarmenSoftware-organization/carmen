import React from 'react'
import { ActivityIcon } from 'lucide-react'

// File: tabs/ActivityTab.tsx

const activities = [
  { action: 'PR Created', date: '2023-07-15 09:00' },
  { action: 'Submitted for Approval', date: '2023-07-15 11:30' },
  { action: 'Department Head Approved', date: '2023-07-16 10:00' },
]

export const ActivityTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {activities.map(({ action, date }, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ActivityIcon className="h-4 w-4" />
          <span className="font-bold">{action}</span>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
      ))}
    </div>
  )
}
