'use client'
import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { MoreVertical, Plus, Trash2, Printer, Search, Edit, Copy } from 'lucide-react'

interface Currency {
  code: string
  description: string
  active: boolean
}

export function CurrencyManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', description: 'United States Dollar', active: true },
    { code: 'EUR', description: 'Euro', active: true },
    { code: 'JPY', description: 'Japanese Yen', active: true },
    { code: 'GBP', description: 'British Pound Sterling', active: true },
  ])
  const [showActive, setShowActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
  const [newCurrency, setNewCurrency] = useState({ code: '', description: '', active: true })

  const toggleActive = (code: string) => {
    setCurrencies(currencies.map(currency => 
      currency.code === code ? { ...currency, active: !currency.active } : currency
    ))
  }

  const filteredCurrencies = currencies.filter(currency => 
    (showActive ? currency.active : true) &&
    (currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     currency.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSelectCurrency = (code: string) => {
    setSelectedCurrencies(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const handleSelectAll = () => {
    if (selectedCurrencies.length === filteredCurrencies.length) {
      setSelectedCurrencies([])
    } else {
      setSelectedCurrencies(filteredCurrencies.map(c => c.code))
    }
  }

  const handleCreateCurrency = () => {
    if (newCurrency.code && newCurrency.description) {
      setCurrencies([...currencies, newCurrency])
      setNewCurrency({ code: '', description: '', active: true })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCurrency = () => {
    if (editingCurrency) {
      setCurrencies(currencies.map(c =>
        c.code === editingCurrency.code ? editingCurrency : c
      ))
      setEditingCurrency(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedCurrencies.length} currency(ies)?`)) {
      setCurrencies(currencies.filter(c => !selectedCurrencies.includes(c.code)))
      setSelectedCurrencies([])
    }
  }

  const handleDuplicateCurrency = (currency: Currency) => {
    const newCode = `${currency.code}_COPY`
    setCurrencies([...currencies, { ...currency, code: newCode }])
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Currency Management</h1>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="default" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-1 h-3 w-3" /> Create
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedCurrencies.length === 0}
          >
            <Trash2 className="mr-1 h-3 w-3" /> Delete
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="mr-1 h-3 w-3" /> Print
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-active"
            checked={showActive}
            onCheckedChange={() => setShowActive(!showActive)}
          />
          <label htmlFor="show-active" className="text-sm">
            Show Active
          </label>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selectedCurrencies.length === filteredCurrencies.length && filteredCurrencies.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Currency Code</TableHead>
            <TableHead>Currency Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCurrencies.map((currency) => (
            <TableRow key={currency.code}>
              <TableCell>
                <Checkbox
                  checked={selectedCurrencies.includes(currency.code)}
                  onCheckedChange={() => handleSelectCurrency(currency.code)}
                />
              </TableCell>
              <TableCell>{currency.code}</TableCell>
              <TableCell>{currency.description}</TableCell>
              <TableCell>
                <Checkbox
                  checked={currency.active}
                  onCheckedChange={() => toggleActive(currency.code)}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCurrency(currency)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateCurrency(currency)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this currency?')) {
                          setCurrencies(currencies.filter(c => c.code !== currency.code))
                        }
                      }}
                      className="text-destructive"
                    >
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

      {/* Create Currency Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Currency</DialogTitle>
            <DialogDescription>
              Add a new currency to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Currency Code</Label>
              <Input
                id="code"
                placeholder="e.g., USD"
                value={newCurrency.code}
                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., United States Dollar"
                value={newCurrency.description}
                onChange={(e) => setNewCurrency({ ...newCurrency, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={newCurrency.active}
                onCheckedChange={(checked) => setNewCurrency({ ...newCurrency, active: checked as boolean })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCurrency}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Currency Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
            <DialogDescription>
              Update currency information
            </DialogDescription>
          </DialogHeader>
          {editingCurrency && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Currency Code</Label>
                <Input
                  id="edit-code"
                  value={editingCurrency.code}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCurrency.description}
                  onChange={(e) => setEditingCurrency({ ...editingCurrency, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={editingCurrency.active}
                  onCheckedChange={(checked) => setEditingCurrency({ ...editingCurrency, active: checked as boolean })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCurrency}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}