'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, UserCircle2 } from "lucide-react"

interface ApprovalLog {
  id: number
  date: string
  status: 'Accept' | 'Reject' | 'Review'
  by: string
  comments: string
}

interface ApprovalLogDialogProps {
  itemId: number
  itemName: string
  children: React.ReactNode
  logs: ApprovalLog[]
}

export function ApprovalLogDialog({ itemId, itemName, children, logs }: ApprovalLogDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approval History - {itemName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-gray-400" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircle2 className="h-4 w-4" />
                      <span>{log.by}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{log.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'Accept' ? 'bg-green-100 text-green-800' :
                      log.status === 'Reject' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  {log.comments && (
                    <p className="text-sm text-gray-600 mt-1">{log.comments}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 