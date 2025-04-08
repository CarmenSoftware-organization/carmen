import React from 'react'
import { CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, PrinterIcon, DownloadIcon, ShareIcon } from 'lucide-react'

// File: PRHeader.tsx

interface PRHeaderProps {
  title: string
  mode: 'view' | 'edit' | 'add'
  onModeChange: (mode: 'view' | 'edit') => void
  onDocumentAction: (action: 'print' | 'download' | 'share') => void
}

export const PRHeader: React.FC<PRHeaderProps> = ({ title, mode, onModeChange, onDocumentAction }) => (
  <div className="flex items-center justify-between">
    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
    <div className="flex space-x-2">
      <Button onClick={() => onModeChange('edit')} variant={mode === 'edit' ? 'default' : 'outline'} size="sm">
        <PencilIcon className="mr-2 h-4 w-4" />
        Edit
      </Button>
      {['print', 'download', 'share'].map(action => (
        <Button key={action} onClick={() => onDocumentAction(action as 'print' | 'download' | 'share')} variant="outline" size="sm">
          {action === 'print' ? <PrinterIcon className="mr-2 h-4 w-4" /> :
           action === 'download' ? <DownloadIcon className="mr-2 h-4 w-4" /> :
           <ShareIcon className="mr-2 h-4 w-4" />}
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Button>
      ))}
    </div>
  </div>
)
