import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

const cardData = [
  {
    title: "Total Orders",
    value: "1,234",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    description: "Purchase orders this month"
  },
  {
    title: "Active Suppliers",
    value: "89",
    change: "+3.2%", 
    trend: "up",
    icon: Users,
    description: "Verified suppliers"
  },
  {
    title: "Inventory Value",
    value: "$45,231",
    change: "-2.4%",
    trend: "down", 
    icon: Package,
    description: "Current stock value"
  },
  {
    title: "Monthly Spend",
    value: "$89,432",
    change: "+8.7%",
    trend: "up",
    icon: DollarSign,
    description: "Total procurement spend"
  }
]

const statusCards = [
  {
    title: "Critical Stock Items",
    value: "12",
    status: "critical",
    icon: AlertTriangle,
    description: "Items below minimum threshold"
  },
  {
    title: "Orders Pending Approval",
    value: "8",
    status: "warning",
    icon: Package,
    description: "Awaiting manager approval"
  },
  {
    title: "Completed Deliveries",
    value: "156",
    status: "success",
    icon: CheckCircle2,
    description: "This week"
  }
]

export function DashboardCards() {
  return (
    <div className="space-y-6">
      {/* Main Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => {
          const Icon = card.icon
          const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown
          
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendIcon 
                    className={`h-3 w-3 ${
                      card.trend === "up" ? "text-green-500" : "text-red-500"
                    }`} 
                  />
                  <span 
                    className={
                      card.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {card.change}
                  </span>
                  <span>from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statusCards.map((card) => {
          const Icon = card.icon
          const statusColors = {
            critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
            success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }
          
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Badge 
                  variant="secondary" 
                  className={statusColors[card.status as keyof typeof statusColors]}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {card.value}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}