'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Building, Plus, List, Grid, X } from 'lucide-react'
import { CountListItem } from "@/app/(main)/inventory-management/physical-count-management/components/count-list-item"
import { CountDetailCard } from "@/app/(main)/inventory-management/physical-count-management/components/count-detail-card"
import { NewCountForm, NewCountData } from "@/app/(main)/inventory-management/physical-count-management/components/new-count-form"
import { CountDetailForm } from "@/app/(main)/inventory-management/physical-count-management/components/count-detail-form"
import { users, departments, storeLocations, itemsToCount } from '@/lib/mock-data/legacy-simple'

interface CountData {
  storeName: string
  department: string
  userName: string
  date: string
  status: "pending" | "completed" | "in-progress"
  itemCount: number
  lastCountDate: string
  variance: number
  notes: string
  completedCount: number
}

const countData = [
  {
    storeName: "Main Kitchen Store",
    department: "F&B",
    userName: "John Doe",
    date: "2024-04-20",
    status: "pending" as const,
    itemCount: 150,
    lastCountDate: "2024-03-20",
    variance: 5.2,
    notes: "Discrepancies found in dry goods section",
    completedCount: 75
  },
  {
    storeName: "Dry Store",
    department: "Housekeeping",
    userName: "Jane Smith",
    date: "2024-04-19",
    status: "completed" as const,
    itemCount: 75,
    lastCountDate: "2024-03-19",
    variance: -2.1,
    notes: "All items accounted for",
    completedCount: 75
  },
  {
    storeName: "Cold Room",
    department: "F&B",
    userName: "Mike Johnson",
    date: "2024-04-18",
    status: "in-progress" as const,
    itemCount: 200,
    lastCountDate: "2024-03-18",
    variance: 0,
    notes: "Counting in progress, no variances reported yet",
    completedCount: 0
  },
]

export default function PhysicalCountManagement() {
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showLocationFilter, setShowLocationFilter] = useState(false)
  const [showNewCountForm, setShowNewCountForm] = useState(false)
  const [showCountDetailForm, setShowCountDetailForm] = useState(false)
  const [counts, setCounts] = useState(countData)

  const filteredData = counts.filter(item => 
    (statusFilter === 'all' || item.status === statusFilter) &&
    (locationFilter === 'all' || item.storeName === locationFilter) &&
    (departmentFilter === 'all' || item.department === departmentFilter)
  )

  const handleNewCount = (data: NewCountData) => {
    const newCount: CountData = {
      storeName: data.storeName,
      department: data.department,
      userName: data.counter,
      date: data.date,
      status: 'pending' as const,
      itemCount: 0,
      lastCountDate: '-',
      variance: 0,
      notes: data.notes || '',
      completedCount: 0
    }
    setCounts([newCount, ...counts])
    setShowNewCountForm(false)
  }

  const handleCountDetailSubmit = (data: any) => {
    console.log('Count details submitted:', data)
    setShowCountDetailForm(false)
    // Here you would typically update the count status and other relevant data
  }

  const handleDeleteCount = (index: number) => {
    setCounts(prevCounts => prevCounts.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Physical Count Management</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground mb-4 sm:mb-0">Manage and track inventory counts across locations</p>
            <Button onClick={() => setShowNewCountForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Count
            </Button>
          </div>
        </header>

        {showNewCountForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <NewCountForm 
              onClose={() => setShowNewCountForm(false)}
              onSubmit={handleNewCount}
            />
          </div>
        )}

        {showCountDetailForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <CountDetailForm 
              onClose={() => setShowCountDetailForm(false)}
              onSubmit={handleCountDetailSubmit}
            />
          </div>
        )}

        <Card className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr,auto,auto,auto] gap-4 items-center p-4">
            <div className="relative w-full sm:w-64">
              <Input className="pl-3" placeholder="Search counts..." />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2 justify-end sm:justify-start">
              <Button 
                variant={showLocationFilter ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setShowLocationFilter(!showLocationFilter)}
              >
                <Building className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showLocationFilter && (
            <div className="border-t p-4">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {storeLocations.map(location => (
                    <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locationFilter !== 'all' && (
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium mr-2">Filtered by:</span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setLocationFilter('all')}
                  >
                    {locationFilter}
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {view === 'list' ? (
          <div className="space-y-4">
            {filteredData.map((item, index) => (
              <CountListItem 
                key={index} 
                {...item} 
                onStartCount={() => setShowCountDetailForm(true)}
                onDelete={() => handleDeleteCount(index)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((item, index) => (
              <CountDetailCard 
                key={index} 
                {...item} 
                onStartCount={() => setShowCountDetailForm(true)}
                onDelete={() => handleDeleteCount(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

