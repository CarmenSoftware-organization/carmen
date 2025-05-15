import { Building, Calendar, User, Package, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CountProgress } from "./count-progress"

interface CountDetailCardProps {
  storeName: string
  department: string
  userName: string
  date: string
  status: "pending" | "completed" | "in-progress"
  itemCount: number
  lastCountDate: string
  variance: number
  notes?: string
  onStartCount: () => void
  onDelete: () => void
  completedCount: number
}

export function CountDetailCard({
  storeName,
  department,
  userName,
  date,
  status,
  itemCount,
  lastCountDate,
  variance,
  notes,
  onStartCount,
  onDelete,
  completedCount
}: CountDetailCardProps) {
  const statusStyles = {
    pending: "text-yellow-600 bg-yellow-50",
    completed: "text-green-600 bg-green-50",
    "in-progress": "text-blue-600 bg-blue-50"
  }

  const statusLabels = {
    pending: "Pending",
    completed: "Completed",
    "in-progress": "In Progress"
  }

  const varianceColor = variance === 0 
    ? "text-gray-600" 
    : variance > 0 
      ? "text-green-600" 
      : "text-red-600"

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Building className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{storeName}</h3>
                <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[status])}>
                  {statusLabels[status]}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{department}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{userName || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{itemCount} items</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Last count: {lastCountDate || '-'}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold">Variance</h4>
          <p className={cn("text-lg font-bold", varianceColor)}>
            {variance > 0 ? "+" : ""}{variance}%
          </p>
        </div>
        <CountProgress 
          total={itemCount} 
          completed={completedCount} 
          className="mt-4"
        />
        {notes && (
          <div className="mt-4">
            <h4 className="font-semibold">Notes</h4>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between gap-2">
        <Button 
          className="flex-1" 
          onClick={onStartCount} 
          disabled={status === 'completed'}
        >
          {status === 'pending' ? 'Start Count' : 'Continue Count'}
        </Button>
        {(status === 'pending' || status === 'in-progress') && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

