'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScanIcon, DownloadIcon, Edit, PrinterIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface APMapping {
  businessUnit: string
  store: string
  category: string
  subCategory: string
  itemGroup: string
  department: string
  accountCode: string
}

interface GLMapping {
  businessUnit: string
  store: string
  category: string
  itemGroup: string
  movementType: string
  drDepartment: string
  crDepartment: string
  drAccount: string
  crAccount: string
}

export function AccountCodeMapping() {
  const [selectedView, setSelectedView] = useState("posting-to-ap")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for Posting to AP view
  const apMappingData: APMapping[] = [
    { businessUnit: "Operations", store: "Mini Bar", category: "Beverage", subCategory: "Beers", itemGroup: "Beer", department: "35", accountCode: "5000020" },
    { businessUnit: "Operations", store: "MIN1", category: "Beverage", subCategory: "Spirits", itemGroup: "Vodka", department: "35", accountCode: "5000020" },
    { businessUnit: "Rooms", store: "Rooms - Housekeeping", category: "Food", subCategory: "Dry Goods", itemGroup: "Coffee/Tea/Hot Bev.", department: "21", accountCode: "1116007" },
    { businessUnit: "Rooms", store: "RH", category: "Food", subCategory: "Dry Goods", itemGroup: "Sugar", department: "21", accountCode: "1116007" },
    { businessUnit: "Administration", store: "A&G - Security", category: "Beverage", subCategory: "Soft Drink", itemGroup: "Waters", department: "10", accountCode: "1111005" },
    { businessUnit: "Administration", store: "AGS", category: "Beverage", subCategory: "Soft Drink", itemGroup: "Juices", department: "10", accountCode: "1111005" },
  ]

  // Mock data for Posting to GL view
  const glMappingData: GLMapping[] = [
    { businessUnit: "Operations", store: "Kitchen", category: "Food", itemGroup: "Vegetables", movementType: "Purchase", drDepartment: "Kitchen", crDepartment: "Inventory", drAccount: "5001001", crAccount: "1200001" },
    { businessUnit: "Operations", store: "Kitchen", category: "Food", itemGroup: "Meat", movementType: "Transfer", drDepartment: "Kitchen", crDepartment: "Warehouse", drAccount: "5001002", crAccount: "1200002" },
    { businessUnit: "Operations", store: "Bar", category: "Beverage", itemGroup: "Beer", movementType: "Sale", drDepartment: "Bar", crDepartment: "Revenue", drAccount: "1100001", crAccount: "4000001" },
    { businessUnit: "Rooms", store: "Housekeeping", category: "Supplies", itemGroup: "Cleaning", movementType: "Usage", drDepartment: "Housekeeping", crDepartment: "Supplies", drAccount: "6001001", crAccount: "1200003" },
    { businessUnit: "Administration", store: "Office", category: "Office Supplies", itemGroup: "Stationery", movementType: "Purchase", drDepartment: "Admin", crDepartment: "Inventory", drAccount: "6002001", crAccount: "1200004" },
  ]

  const handleScan = () => {
    alert('Scan for new codes - To be implemented\n\nThis will scan for:\n- New Location codes\n- New Item Groups\n- New transaction combinations')
  }

  const handleImportExport = () => {
    alert('Import/Export - To be implemented\n\nOptions:\n- Import mappings from CSV\n- Export current mappings')
  }

  const handleEdit = () => {
    alert('Edit mode - To be implemented\n\nThis will enable inline editing of mappings')
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter data based on search term
  const filteredAPData = apMappingData.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const filteredGLData = glMappingData.filter(row =>
    Object.values(row).some(val =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Account Code Mapping</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleScan}>
            <ScanIcon className="w-4 h-4 mr-2" />
            Scan
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportExport}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-xs"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">View Name:</span>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posting-to-ap">Posting to AP</SelectItem>
              <SelectItem value="posting-to-gl">Posting to GL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedView === "posting-to-ap" ? (
        // Posting to AP View
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Unit</TableHead>
                <TableHead>Store/Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Item Group</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Account Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAPData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No mappings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAPData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.businessUnit}</TableCell>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.subCategory}</TableCell>
                    <TableCell>{row.itemGroup}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="font-mono">{row.accountCode}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        // Posting to GL View
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Unit</TableHead>
                <TableHead>Store/Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Item Group</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Dr. Department</TableHead>
                <TableHead>Cr. Department</TableHead>
                <TableHead>Dr. Account</TableHead>
                <TableHead>Cr. Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGLData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No mappings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGLData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.businessUnit}</TableCell>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.itemGroup}</TableCell>
                    <TableCell>{row.movementType}</TableCell>
                    <TableCell>{row.drDepartment}</TableCell>
                    <TableCell>{row.crDepartment}</TableCell>
                    <TableCell className="font-mono">{row.drAccount}</TableCell>
                    <TableCell className="font-mono">{row.crAccount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        {selectedView === "posting-to-ap" ? (
          <p>
            <strong>Posting to AP:</strong> Manages account code mappings for Accounts Payable transactions.
            Links inventory procurement transactions with payable invoices. Only Debit Accounts are allowed;
            Tax Accounts default from Vendor Profile.
          </p>
        ) : (
          <p>
            <strong>Posting to GL:</strong> Manages general ledger posting mappings for inventory transactions.
            Ensures all inventory movements (purchases, adjustments, disposals) are accurately reflected
            in the company's main accounting records using the "To" Location accounts.
          </p>
        )}
      </div>
    </div>
  )
}
