import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest } from "@/lib/types"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const purchaseRequestColumns: ColumnDef<PurchaseRequest>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "refNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          PR Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const pr = row.original
      return (
        <Link 
          href={`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=view`}
          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {row.getValue("refNumber")}
        </Link>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return <div>{format(date, "dd/MM/yyyy")}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "currentWorkflowStage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = String(row.getValue("currentWorkflowStage"))
      let color = "bg-gray-200 text-gray-800"
      if (stage === "requester") color = "bg-blue-100 text-blue-800"
      else if (stage === "departmentHeadApproval") color = "bg-yellow-100 text-yellow-800"
      else if (stage === "completed") color = "bg-green-100 text-green-800"
      else if (stage === "financeApproval") color = "bg-purple-100 text-purple-800"
      else if (stage === "rejected") color = "bg-red-100 text-red-800"
      
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${color}`}>
          {stage.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "requestor",
    header: "Requestor",
    cell: ({ row }) => {
      const requestor = row.getValue("requestor") as { name: string }
      return <div>{requestor?.name}</div>
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div>{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
      
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "currency",
    header: () => <div className="text-center">Currency</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("currency")}</div>
    ),
  },
  {
    accessorKey: "vendor_certifications",
    header: "Vendor Certifications",
    cell: ({ row }) => {
      const certifications = row.getValue("vendor_certifications") as { name: string, icon_url: string }[]
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {certifications?.map((cert) => (
              <Tooltip key={cert.name}>
                <TooltipTrigger>
                  <img src={cert.icon_url} alt={cert.name} className="h-6 w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{cert.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )
    },
  },
  {
    accessorKey: "product_certifications",
    header: "Product Certifications",
    cell: ({ row }) => {
      const certifications = row.getValue("product_certifications") as { name: string, icon_url: string }[]
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {certifications?.map((cert) => (
              <Tooltip key={cert.name}>
                <TooltipTrigger>
                  <img src={cert.icon_url} alt={cert.name} className="h-6 w-6" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{cert.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const pr = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              className="text-green-600 focus:text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest } from "@/lib/types"
import { format } from "date-fns"

export const purchaseRequestColumns: ColumnDef<PurchaseRequest>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "refNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          PR Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const pr = row.original
      return (
        <Link 
          href={`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=view`}
          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {row.getValue("refNumber")}
        </Link>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return <div>{format(date, "dd/MM/yyyy")}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "currentWorkflowStage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = String(row.getValue("currentWorkflowStage"))
      let color = "bg-gray-200 text-gray-800"
      if (stage === "requester") color = "bg-blue-100 text-blue-800"
      else if (stage === "departmentHeadApproval") color = "bg-yellow-100 text-yellow-800"
      else if (stage === "completed") color = "bg-green-100 text-green-800"
      else if (stage === "financeApproval") color = "bg-purple-100 text-purple-800"
      else if (stage === "rejected") color = "bg-red-100 text-red-800"
      
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${color}`}>
          {stage.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "requestor",
    header: "Requestor",
    cell: ({ row }) => {
      const requestor = row.getValue("requestor") as { name: string }
      return <div>{requestor?.name}</div>
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div>{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
      
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "currency",
    header: () => <div className="text-center">Currency</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("currency")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const pr = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              className="text-green-600 focus:text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]