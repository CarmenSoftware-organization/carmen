"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table" // Verify this path is correct for your project
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data
interface EligiblePr {
  id: string;
  requestDate: string;
  requester: string;
  department: string;
  itemCount: number;
  status: 'Approved' | 'Pending Comparison';
}

const mockEligiblePrs: EligiblePr[] = [
  { id: "PR-00451", requestDate: "2024-07-15", requester: "Alice Johnson", department: "Housekeeping", itemCount: 3, status: 'Approved' },
  { id: "PR-00458", requestDate: "2024-07-16", requester: "Bob Smith", department: "F&B", itemCount: 5, status: 'Approved' },
  { id: "PR-00460", requestDate: "2024-07-17", requester: "Carol Davis", department: "Admin", itemCount: 2, status: 'Pending Comparison' },
  { id: "PR-00462", requestDate: "2024-07-18", requester: "David Brown", department: "IT", itemCount: 8, status: 'Approved' },
];
// --- End Mock Data ---

export function EligiblePrList() {
  const router = useRouter()
  // Add loading/error state later when fetching real data
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<EligiblePr[]>(mockEligiblePrs);

  const handleCompareClick = (prId: string) => {
    router.push(`/procurement/vendor-comparison/${prId}`)
  }

  const columns: ColumnDef<EligiblePr>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PR ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "requestDate",
      header: "Request Date",
    },
    {
      accessorKey: "requester",
      header: "Requester",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => <div className="text-center">{row.getValue("itemCount")}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            // Ensure badge variant handles potential unexpected statuses gracefully
            const variant = status === 'Approved' ? 'default' : (status === 'Pending Comparison' ? 'secondary' : 'outline');
            return <Badge variant={variant}>{status}</Badge>
        }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const pr = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCompareClick(pr.id)}
            className="whitespace-nowrap" // Prevent button text wrapping
          >
            <Eye className="mr-2 h-4 w-4 flex-shrink-0" /> Compare Vendors
          </Button>
        )
      },
      header: () => <div className="text-right">Actions</div>, // Align header right
      size: 180, // Give action column slightly more fixed width
    },
  ]

  return (
    <Card>
        <CardHeader>
            <CardTitle>Purchase Requests Ready for Comparison</CardTitle>
            <CardDescription>Select a Purchase Request to compare vendor pricing and terms.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                // TODO: Add filtering for PR ID, Requester, Department, Status
                // TODO: Add default sorting (e.g., by Request Date descending)
             />
        </CardContent>
    </Card>
  )
}