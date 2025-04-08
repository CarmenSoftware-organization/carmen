'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Printer, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Requisition {
  date: string
  refNo: string
  requestTo: string
  storeName: string
  description: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  totalAmount: number
}

const mockRequisitions: Requisition[] = [
  {
    date: "2024-03-15",
    refNo: "SR-2024-001",
    requestTo: "M01",
    storeName: "Main Store",
    description: "Weekly replenishment",
    status: "In Process",
    totalAmount: 1250.50
  },
  {
    date: "2024-03-14",
    refNo: "SR-2024-002",
    requestTo: "CK01",
    storeName: "Central Kitchen",
    description: "Inventory restock",
    status: "Complete",
    totalAmount: 3425.75
  },
  {
    date: "2024-03-12",
    refNo: "SR-2024-003",
    requestTo: "B01",
    storeName: "Bar Storage",
    description: "Beverage supplies",
    status: "Draft",
    totalAmount: 785.20
  },
  {
    date: "2024-03-10",
    refNo: "SR-2024-004",
    requestTo: "M01",
    storeName: "Main Store",
    description: "Equipment parts",
    status: "Reject",
    totalAmount: 452.00
  },
  {
    date: "2024-03-08",
    refNo: "SR-2024-005",
    requestTo: "P01",
    storeName: "Pastry Kitchen",
    description: "Monthly supplies",
    status: "Complete",
    totalAmount: 1875.60
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'Complete':
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case 'In Process':
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case 'Reject':
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case 'Void':
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    case 'Draft':
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function StoreRequisitionListComponent() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  
  const filteredRequisitions = mockRequisitions.filter(req => 
    req.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Store Requisitions</h1>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            New Request
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requisitions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          Filters
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ref #</TableHead>
                <TableHead>Request To</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequisitions.map((req) => (
                <TableRow 
                  key={req.refNo}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/store-operations/store-requisitions/${req.refNo}`)}
                >
                  <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{req.refNo}</TableCell>
                  <TableCell>{req.requestTo}</TableCell>
                  <TableCell>{req.storeName}</TableCell>
                  <TableCell>{req.description}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(req.status)} variant="outline">
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${req.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredRequisitions.length} of {mockRequisitions.length} requisitions
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  )
} 