import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

export default function PRApprovalPage() {
  // Mock data for PRs
  const purchaseRequests = [
    {
      id: "PR-2023-001",
      requester: "John Smith",
      department: "Main Kitchen",
      supplier: "Fresh Produce Inc.",
      date: "May 11, 2025",
      status: "Pending",
      value: "$845.50",
      urgent: true,
    },
    {
      id: "PR-2023-002",
      requester: "Sarah Johnson",
      department: "Restaurant",
      supplier: "Seafood Suppliers",
      date: "May 11, 2025",
      status: "Pending",
      value: "$1,276.25",
      urgent: false,
    },
    {
      id: "PR-2023-003",
      requester: "Michael Brown",
      department: "Main Kitchen",
      supplier: "Meat Masters",
      date: "May 10, 2025",
      status: "Pending",
      value: "$932.75",
      urgent: true,
    },
    {
      id: "PR-2023-004",
      requester: "Emily Davis",
      department: "Restaurant",
      supplier: "Bakery Goods",
      date: "May 10, 2025",
      status: "Pending",
      value: "$435.60",
      urgent: false,
    },
    {
      id: "PR-2023-005",
      requester: "David Wilson",
      department: "Main Kitchen",
      supplier: "Dairy Delights",
      date: "May 9, 2025",
      status: "Pending",
      value: "$678.90",
      urgent: false,
    },
  ]

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-4">PR Approval</h1>
        <h2 className="text-lg font-medium text-muted-foreground mb-6">Pending Requests</h2>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search PR or requester..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="main-kitchen">Main Kitchen</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 mt-6">
          {purchaseRequests.map((pr) => (
            <Link href={`/pr-approval/${pr.id}`} key={pr.id}>
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{pr.id}</div>
                    <div className="flex gap-2">
                      {pr.urgent && <Badge variant="destructive">Urgent</Badge>}
                      <Badge>{pr.status}</Badge>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Requester:</span> {pr.requester}
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Supplier:</span> {pr.supplier}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>{pr.date}</div>
                    <div>{pr.value}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Department: {pr.department}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
