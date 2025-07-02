// File: PRHeader.tsx
import React from 'react'
import { CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  PrinterIcon, 
  DownloadIcon, 
  ShareIcon, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trash2, 
  Send 
} from 'lucide-react'

interface WorkflowActionButton {
  action: string;
  label: string;
  icon: string;
  variant: 'default' | 'destructive' | 'outline';
  description: string;
}

interface PRHeaderProps {
  title: string
  mode: 'view' | 'edit' | 'add'
  onModeChange: (mode: 'view' | 'edit') => void
  onDocumentAction: (action: 'print' | 'download' | 'share') => void
  workflowActions?: WorkflowActionButton[]
  onWorkflowAction?: (action: string) => void
}

const getIconComponent = (iconName: string) => {
  const icons = {
    CheckCircle,
    XCircle,
    RotateCcw,
    Edit,
    Trash2,
    Send
  };
  return icons[iconName as keyof typeof icons] || Edit;
};

export const PRHeader: React.FC<PRHeaderProps> = ({ 
  title, 
  mode, 
  onModeChange, 
  onDocumentAction, 
  workflowActions = [],
  onWorkflowAction 
}) => (
  <div className="flex items-center justify-between">
    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
    <div className="flex space-x-2">
      {/* Workflow Actions (RBAC-controlled) */}
      {workflowActions.map((actionBtn) => {
        const IconComponent = getIconComponent(actionBtn.icon);
        return (
          <Button 
            key={actionBtn.action}
            onClick={() => onWorkflowAction?.(actionBtn.action)} 
            variant={actionBtn.variant} 
            size="sm"
            title={actionBtn.description}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            {actionBtn.label}
          </Button>
        );
      })}
      
      {/* Document Actions */}
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
