'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, RefreshCcw } from "lucide-react"

export default function InterfacePostingPage() {
  return (
    <div className="container mx-auto py-6 px-9">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Interface Posting</h1>
            <p className="text-muted-foreground">Manage and monitor POS transaction processing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">Process All</Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-8" />
              </div>
              <Button variant="outline">Today</Button>
              <Button variant="outline">This Week</Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75">
                  <TableHead className="py-3 font-medium text-gray-600">Transaction ID</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Date</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Type</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Amount</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="group hover:bg-gray-50/50">
                  <TableCell>TRX-001</TableCell>
                  <TableCell>2024-03-20 10:30</TableCell>
                  <TableCell>Sale</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>$150.00</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Process</Button>
                  </TableCell>
                </TableRow>
                <TableRow className="group hover:bg-gray-50/50">
                  <TableCell>TRX-002</TableCell>
                  <TableCell>2024-03-20 10:35</TableCell>
                  <TableCell>Refund</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Failed
                    </Badge>
                  </TableCell>
                  <TableCell>$75.00</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Retry</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 