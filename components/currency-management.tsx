'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreVertical, Plus, Trash2, Printer, Search } from 'lucide-react'

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

  return (
    <div className="mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Currency Management</h1>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="default"><Plus className="mr-1 h-3 w-3" /> Create</Button>
          <Button size="sm" variant="destructive"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
          <Button size="sm" variant="outline"><Printer className="mr-1 h-3 w-3" /> Print</Button>
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
            <TableHead className="w-10"><Checkbox /></TableHead>
            <TableHead>Currency Code</TableHead>
            <TableHead>Currency Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCurrencies.map((currency) => (
            <TableRow key={currency.code}>
              <TableCell><Checkbox /></TableCell>
              <TableCell>{currency.code}</TableCell>
              <TableCell>{currency.description}</TableCell>
              <TableCell>
                <Checkbox
                  checked={currency.active}
                  onCheckedChange={() => toggleActive(currency.code)}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}