import { Building, Calendar, User, Trash } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CountProgress } from "@/app/(main)/inventory-management/spot-check/components/count-progress"


interface CountListItemProps {
  storeName: string
  department: string
  userName: string
  date: string
  status: "pending" | "completed" | "in-progress"
  onStartCount: () => void
  onDelete: () => void
  itemCount: number
  completedCount: number
}

export function CountListItem({
  storeName,
  department,
  userName,
  date,
  status,
  onStartCount,
  onDelete,
  itemCount,
  completedCount,
}: CountListItemProps) {
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

  return (
    <Card className="overflow-hidden transition-colors hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Building className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{storeName}</h3>
              <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[status])}>
                {statusLabels[status]}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{department}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{userName || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{date}</span>
          </div>
          <div className="w-40">
            <CountProgress 
              total={itemCount} 
              completed={completedCount}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onStartCount} disabled={status === 'completed'}>
              {status === 'pending' ? 'Start Check' : 'Continue Check'}
            </Button>
            {(status === 'pending' || status === 'in-progress') && (
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
} 