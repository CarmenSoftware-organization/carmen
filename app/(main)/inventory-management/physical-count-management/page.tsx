'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CountListItem } from "./components/count-list-item"
import { CountDetailCard } from "./components/count-detail-card"
import { NewCountForm, NewCountData } from "./components/new-count-form"

export default function PhysicalCountManagement() {
  const [showNewCountForm, setShowNewCountForm] = useState(false)
  const [showCountDetailForm, setShowCountDetailForm] = useState(false)

  const counts = [
    {
      storeName: "Main Kitchen Store",
      department: "F&B",
      userName: "John Doe",
      date: "2024-04-20",
      status: "pending" as const,
      itemCount: 150,
      completedCount: 75,
      lastCountDate: "2024-03-20",
      variance: 5.2,
      notes: "Discrepancies found in dry goods section"
    }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Physical Count Management</h1>
          <p className="text-muted-foreground">Manage and track physical inventory counts</p>
        </div>
        <Button onClick={() => setShowNewCountForm(true)}>New Count</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Search counts..." />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="fb">F&B</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {counts.map((count, index) => (
          <CountListItem
            key={index}
            {...count}
            onStartCount={() => {/* handle start count */}}
            onDelete={() => {/* handle delete */}}
          />
        ))}
      </div>

      {showCountDetailForm && (
        <Dialog open={showCountDetailForm} onOpenChange={setShowCountDetailForm}>
          <DialogContent>
            <CountDetailCard
              {...counts[0]}
              onStartCount={() => {/* handle start count */}}
              onDelete={() => {/* handle delete */}}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showNewCountForm} onOpenChange={setShowNewCountForm}>
        <DialogContent>
          <NewCountForm 
            onClose={() => setShowNewCountForm(false)} 
            onSubmit={(data: NewCountData) => {
              console.log('New count data:', data)
              setShowNewCountForm(false)
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

