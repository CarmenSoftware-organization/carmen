"use client"

import { useRouter } from "next/navigation"
import { 
  Clock, 
  Layers, 
  CheckCircle,
  AlertTriangle,
  Building2,
  User,
  Download,
  Calendar,
  ChevronLeft,
  FileBarChart,
  FileText,
  Camera
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PageProps {
  params: {
    id: string
  }
}

export default function CompletedCountDetailsPage({ params }: PageProps) {
  const router = useRouter()

  // Mock data for a completed count
  const count = {
    id: params.id,
    counter: "John Doe",
    department: "F&B",
    startTime: "2024-04-19 09:00",
    completedTime: "2024-04-19 10:30",
    duration: "1h 30m",
    locations: ["Main Kitchen", "Dry Store"],
    totalItems: 45,
    completedItems: 45,
    matches: 40,
    variances: 5,
    accuracy: 88.9,
    status: "completed",
    notes: "Regular spot check completed with minor variances",
    items: [
      {
        id: "1",
        code: "SKU001",
        name: "Item 1",
        category: "Dry Goods",
        location: "Main Kitchen",
        expectedQty: 100,
        actualQty: 98,
        variance: -2,
        status: "variance",
        notes: "Found damaged items",
        hasPhoto: true
      },
      {
        id: "2",
        code: "SKU002",
        name: "Item 2",
        category: "Perishables",
        location: "Main Kitchen",
        expectedQty: 50,
        actualQty: 50,
        variance: 0,
        status: "match",
        notes: "",
        hasPhoto: false
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "match":
        return "bg-green-500/10 text-green-500"
      case "variance":
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Count Details</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Completed count session details and results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Count Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Counter</dt>
                <dd className="text-sm font-medium">{count.counter}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Department</dt>
                <dd className="text-sm font-medium">{count.department}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Duration</dt>
                <dd className="text-sm font-medium">{count.duration}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Accuracy</dt>
                <dd className="text-sm font-medium">
                  <Badge className={count.accuracy >= 95 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                    {count.accuracy}%
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Started</dt>
                <dd className="text-sm font-medium">{count.startTime}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Completed</dt>
                <dd className="text-sm font-medium">{count.completedTime}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Items</dt>
                <dd className="text-sm font-medium">{count.totalItems}</dd>
              </div>
              <div className="flex gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Matches</dt>
                  <dd className="text-sm font-medium text-green-500">{count.matches}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Variances</dt>
                  <dd className="text-sm font-medium text-yellow-500">{count.variances}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Count Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {count.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="text-right">{item.expectedQty}</TableCell>
                  <TableCell className="text-right">{item.actualQty}</TableCell>
                  <TableCell className="text-right">{item.variance}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.hasPhoto && (
                        <Button variant="ghost" size="icon">
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                      {item.notes && (
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 