import React from 'react'
import { Button } from "@/components/ui/button"
import { PaperclipIcon } from 'lucide-react'


// File: tabs/AttachmentsTab.tsx

export const AttachmentsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {['quotation.pdf', 'invoice.pdf'].map(file => (
        <div key={file} className="flex items-center space-x-2">
          <PaperclipIcon className="h-4 w-4" />
          <span>{file}</span>
          <Button variant="outline" size="sm">View</Button>
          <Button variant="outline" size="sm">Download</Button>
        </div>
      ))}
    </div>
  )
}