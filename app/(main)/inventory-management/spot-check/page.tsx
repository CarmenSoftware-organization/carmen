"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Building, List, Grid, X, Plus } from 'lucide-react'
import { CountListItem } from "./components/count-list-item"
import { CountDetailCard } from "./components/count-detail-card"
import { CountDetailForm } from "./components/count-detail-form"
import { departments, storeLocations } from '@/lib/mockData'
import { useRouter } from "next/navigation"
import { Count, mockCounts } from '@/lib/mock/inventory-data'

type ComponentStatus = "pending" | "completed" | "in-progress"
type MockStatus = "draft" | "in_progress" | "completed" | "cancelled"

const mapStatus = (status: MockStatus): ComponentStatus => {
  switch (status) {
    case 'draft':
      return 'pending'
    case 'in_progress':
      return 'in-progress'
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'pending'
  }
}

interface SpotCheckDetails {
  countId: string
  counter: string
  department: string
  store: string
  date: string
  selectedItems: {
    id: string
    code: string
    name: string
    description: string
    expectedQuantity: number
    unit: string
  }[]
}

export default function SpotCheck() {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showLocationFilter, setShowLocationFilter] = useState(false)
  const [showCountDetailForm, setShowCountDetailForm] = useState(false)
  const [counts, setCounts] = useState<Count[]>(mockCounts.filter(count => count.type === 'spot'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDetails, setCurrentDetails] = useState<SpotCheckDetails | null>(null)

  const filteredData = counts.filter((item: Count) => 
    (statusFilter === 'all' || item.status === statusFilter) &&
    (locationFilter === 'all' || item.locations.includes(locationFilter)) &&
    (departmentFilter === 'all' || item.department === departmentFilter)
  )

  const handleCountDetailSubmit = () => {
    if (currentDetails) {
      console.log('Count details submitted:', currentDetails)
    }
    setShowCountDetailForm(false)
  }

  const handleDeleteCount = (index: number) => {
    setCounts((prevCounts: Count[]) => prevCounts.filter((_: Count, i: number) => i !== index))
  }

  const handleNewSpotCheck = () => {
    router.push('/inventory-management/spot-check/new')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Spot Check</h1>
            <Button 
              onClick={handleNewSpotCheck}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Spot Check
            </Button>
          </div>
          <p className="text-muted-foreground">Random inventory spot checks for accuracy verification</p>
        </header>

        {showCountDetailForm && currentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <CountDetailForm 
              items={[]}
              locationName={currentDetails.store}
              userName={currentDetails.counter}
              date={currentDetails.date}
              reference={currentDetails.countId}
              onClose={() => setShowCountDetailForm(false)}
              onSubmit={handleCountDetailSubmit}
            />
          </div>
        )}

        <Card className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr,auto,auto,auto] gap-4 items-center p-4">
            <div className="relative w-full sm:w-64">
              <Input className="pl-3" placeholder="Search spot checks..." />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
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
            {filteredData.map((item: Count, index: number) => (
              <CountListItem 
                key={index} 
                storeName={item.locations[0]}
                department={item.department}
                userName={item.counter}
                date={item.startDate.toISOString()}
                status={mapStatus(item.status)}
                itemCount={item.itemCount}
                completedCount={0}
                onStartCount={() => {
                  setCurrentDetails({
                    countId: item.id,
                    counter: item.counter,
                    department: item.department,
                    store: item.locations[0],
                    date: item.startDate.toISOString(),
                    selectedItems: []
                  });
                  setShowCountDetailForm(true);
                }}
                onDelete={() => handleDeleteCount(index)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item: Count, index: number) => (
              <CountDetailCard 
                key={index}
                storeName={item.locations[0]}
                department={item.department}
                userName={item.counter}
                date={item.startDate.toISOString()}
                status={mapStatus(item.status)}
                itemCount={item.itemCount}
                completedCount={0}
                onStartCount={() => {
                  setCurrentDetails({
                    countId: item.id,
                    counter: item.counter,
                    department: item.department,
                    store: item.locations[0],
                    date: item.startDate.toISOString(),
                    selectedItems: []
                  });
                  setShowCountDetailForm(true);
                }}
                onDelete={() => handleDeleteCount(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
