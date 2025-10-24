'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Printer, Upload, MoreVertical, Edit, Trash2 } from "lucide-react"

interface ExchangeRate {
  code: string
  name: string
  rate: number
  lastUpdated: string
}

export function ExchangeRateViewer() {
  const [currencies, setCurrencies] = useState<ExchangeRate[]>([
    { code: "USD", name: "United States Dollar", rate: 1.000000, lastUpdated: "2023-07-01" },
    { code: "EUR", name: "Euro", rate: 0.920000, lastUpdated: "2023-07-01" },
    { code: "JPY", name: "Japanese Yen", rate: 144.500000, lastUpdated: "2023-07-01" },
    { code: "GBP", name: "British Pound Sterling", rate: 0.790000, lastUpdated: "2023-07-01" },
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null)
  const [newRate, setNewRate] = useState({ code: '', name: '', rate: 1.0, lastUpdated: new Date().toISOString().split('T')[0] })

  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddRate = () => {
    if (newRate.code && newRate.name && newRate.rate > 0) {
      setCurrencies([...currencies, { ...newRate, lastUpdated: new Date().toISOString().split('T')[0] }])
      setNewRate({ code: '', name: '', rate: 1.0, lastUpdated: new Date().toISOString().split('T')[0] })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditRate = (rate: ExchangeRate) => {
    setEditingRate(rate)
    setIsEditDialogOpen(true)
  }

  const handleUpdateRate = () => {
    if (editingRate) {
      setCurrencies(currencies.map(c =>
        c.code === editingRate.code ? { ...editingRate, lastUpdated: new Date().toISOString().split('T')[0] } : c
      ))
      setEditingRate(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteRate = (code: string) => {
    if (confirm(`Are you sure you want to delete exchange rate for ${code}?`)) {
      setCurrencies(currencies.filter(c => c.code !== code))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleImportCSV = () => {
    alert('Import CSV functionality - To be implemented')
  }

  return (
    <div className=" mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exchange Rate Viewer</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Rate
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
        </div>
      </div>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search currencies..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Currency Code</TableHead>
            <TableHead>Currency Name</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCurrencies.map((currency) => (
            <TableRow key={currency.code}>
              <TableCell>{currency.code}</TableCell>
              <TableCell>{currency.name}</TableCell>
              <TableCell>{currency.rate.toFixed(6)}</TableCell>
              <TableCell>{currency.lastUpdated}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditRate(currency)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Rate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteRate(currency.code)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Rate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exchange Rate</DialogTitle>
            <DialogDescription>
              Add a new currency exchange rate
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Currency Code</Label>
              <Input
                id="code"
                placeholder="e.g., USD"
                value={newRate.code}
                onChange={(e) => setNewRate({ ...newRate, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Currency Name</Label>
              <Input
                id="name"
                placeholder="e.g., United States Dollar"
                value={newRate.name}
                onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Exchange Rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.000001"
                placeholder="e.g., 1.000000"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRate}>Add Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exchange Rate</DialogTitle>
            <DialogDescription>
              Update exchange rate information
            </DialogDescription>
          </DialogHeader>
          {editingRate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Currency Code</Label>
                <Input
                  id="edit-code"
                  value={editingRate.code}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Currency Name</Label>
                <Input
                  id="edit-name"
                  value={editingRate.name}
                  onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rate">Exchange Rate</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.000001"
                  value={editingRate.rate}
                  onChange={(e) => setEditingRate({ ...editingRate, rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}