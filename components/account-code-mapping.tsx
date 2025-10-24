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

export function AccountCodeMapping() {
  const [selectedView, setSelectedView] = useState("posting-to-ap")
  const mappingData = [
    { store: "Mini Bar", category: "Beverage", subCategory: "Beers", itemGroup: "Beer", department: "35", accountCode: "5000020" },
    { store: "MIN1", category: "2", subCategory: "21", itemGroup: "2100", department: "35", accountCode: "5000020" },
    { store: "Rooms - Housekeeping", category: "Food", subCategory: "Dry Goods", itemGroup: "Coffee/Tea/Hot Bev.", department: "21", accountCode: "1116007" },
    { store: "RH", category: "1", subCategory: "10", itemGroup: "1000", department: "21", accountCode: "1116007" },
    { store: "A&G - Security", category: "Beverage", subCategory: "Soft Drink", itemGroup: "Waters", department: "10", accountCode: "1111005" },
    { store: "AGS", category: "2", subCategory: "20", itemGroup: "2001", department: "10", accountCode: "1111005" },
  ]

  return (
    <div className=" mx-auto p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Account Code Mapping</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ScanIcon className="w-4 h-4 mr-2" />
            Scan
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input className="max-w-xs" placeholder="Search..." />
        <div className="flex items-center space-x-2">
          <span>View Name:</span>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posting-to-ap">Posting to AP</SelectItem>
              <SelectItem value="other-view">Other View</SelectItem>
              <SelectItem value="another-view">Another View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STORE/LOCATION</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>SUB-CATEGORY</TableHead>
            <TableHead>ITEM GROUP</TableHead>
            <TableHead>DEPARTMENT</TableHead>
            <TableHead>ACCOUNT CODE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappingData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.store}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.subCategory}</TableCell>
              <TableCell>{row.itemGroup}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.accountCode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}