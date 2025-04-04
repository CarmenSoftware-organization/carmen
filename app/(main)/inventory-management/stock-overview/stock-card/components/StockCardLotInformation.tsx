import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { FileDown, Search } from "lucide-react"
import { StockCardData } from "../../types"
import { formatCurrency, formatDate, formatNumber } from "../../inventory-balance/utils"

interface StockCardLotInformationProps {
  data: StockCardData
}

export function StockCardLotInformation({ data }: StockCardLotInformationProps) {
  const { product, lotInformation } = data
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [locationFilter, setLocationFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Get unique locations
  const uniqueLocations = Array.from(
    new Set(lotInformation.map(lot => lot.locationId))
  ).map(locationId => {
    const lot = lotInformation.find(l => l.locationId === locationId)
    return {
      id: locationId,
      name: lot ? lot.locationName : "Unknown"
    }
  })
  
  // Filter records based on search and filters
  const filteredRecords = lotInformation.filter(lot => {
    // Filter by status
    if (statusFilter !== "ALL" && lot.status !== statusFilter) {
      return false
    }
    
    // Filter by location
    if (locationFilter !== "ALL" && lot.locationId !== locationFilter) {
      return false
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        lot.lotNumber.toLowerCase().includes(searchLower) ||
        lot.locationName.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
      case 'Reserved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reserved</Badge>
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
      case 'Quarantine':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Quarantine</Badge>
      default:
        return null
    }
  }
  
  // Calculate summary
  const summary = {
    totalLots: lotInformation.length,
    totalQuantity: lotInformation.reduce((sum, lot) => sum + lot.quantity, 0),
    totalValue: lotInformation.reduce((sum, lot) => sum + lot.value, 0),
    availableLots: lotInformation.filter(lot => lot.status === "Available").length,
    availableQuantity: lotInformation
      .filter(lot => lot.status === "Available")
      .reduce((sum, lot) => sum + lot.quantity, 0),
    expiringLots: lotInformation.filter(lot => {
      const expiryDate = new Date(lot.expiryDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today
    }).length
  }
  
  // Check if expiry date is approaching (within 30 days)
  const isExpiryApproaching = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return expiry <= thirtyDaysFromNow && expiry >= today
  }
  
  // Check if lot is expired
  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Lots</p>
              <p className="text-2xl font-bold">{summary.totalLots}</p>
              <p className="text-xs text-muted-foreground">
                {summary.availableLots} available
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalQuantity)}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(summary.availableQuantity)} available
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold">{summary.expiringLots}</p>
              <p className="text-xs text-muted-foreground">
                Lots expiring within 30 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Quarantine">Quarantine</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Location Filter */}
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search lot number..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Button variant="outline" className="self-start">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Lot Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="py-3 font-medium text-gray-600">Lot Number</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Expiry Date</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Received Date</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Location</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Quantity</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Unit Cost</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No lot information found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((lot) => (
                  <TableRow key={lot.lotNumber} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{lot.lotNumber}</TableCell>
                    <TableCell>
                      <div className={
                        isExpired(lot.expiryDate) 
                          ? "text-red-600" 
                          : isExpiryApproaching(lot.expiryDate) 
                            ? "text-amber-600" 
                            : ""
                      }>
                        {lot.expiryDate}
                        {isExpiryApproaching(lot.expiryDate) && !isExpired(lot.expiryDate) && (
                          <div className="text-xs text-amber-600">Expiring soon</div>
                        )}
                        {isExpired(lot.expiryDate) && (
                          <div className="text-xs text-red-600">Expired</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lot.receivedDate}</TableCell>
                    <TableCell>{lot.locationName}</TableCell>
                    <TableCell>{getStatusBadge(lot.status)}</TableCell>
                    <TableCell className="text-right">{formatNumber(lot.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(lot.unitCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(lot.value)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 