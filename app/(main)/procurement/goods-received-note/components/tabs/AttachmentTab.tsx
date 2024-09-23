import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { GoodsReceiveNoteMode, Attachment } from '@/lib/types'
import { Edit, Trash, Download } from 'lucide-react'

interface AttachmentTabProps {
  mode: GoodsReceiveNoteMode
  attachments: Attachment[]
  onAddAttachment: (attachment: Omit<Attachment, 'id' | 'number' | 'date' | 'uploader'>) => void
  onEditAttachment: (id: string, description: string, publicAccess: boolean) => void
  onDeleteAttachment: (id: string) => void
  onDownloadAttachment: (id: string) => void
}

export function AttachmentTab({ mode, attachments, onAddAttachment, onEditAttachment, onDeleteAttachment, onDownloadAttachment }: AttachmentTabProps) {
  const [newFileName, setNewFileName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPublicAccess, setNewPublicAccess] = useState(false)
  const [editingAttachmentId, setEditingAttachmentId] = useState<string | null>(null)
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPublicAccess, setEditedPublicAccess] = useState(false)

  const handleAddAttachment = () => {
    if (newFileName.trim()) {
      onAddAttachment({
        fileName: newFileName,
        description: newDescription,
        publicAccess: newPublicAccess,
        fileType: '',
        fileSize: 0,
        fileUrl: '',
        uploadDate: new Date(),
        uploaderId: ''
      })
      setNewFileName('')
      setNewDescription('')
      setNewPublicAccess(false)
    }
  }

  const handleEditClick = (attachment: Attachment) => {
    setEditingAttachmentId(attachment.id)
    setEditedDescription(attachment.description)
    setEditedPublicAccess(attachment.publicAccess)
  }

  const handleSaveEdit = () => {
    if (editingAttachmentId) {
      onEditAttachment(editingAttachmentId, editedDescription, editedPublicAccess)
      setEditingAttachmentId(null)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attachment #</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Public Access</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Uploader</TableHead>
            {mode !== 'view' && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => (
            <TableRow key={attachment.id}>
              <TableCell>{attachment.number}</TableCell>
              <TableCell>{attachment.fileName}</TableCell>
              <TableCell>
                {editingAttachmentId === attachment.id ? (
                  <Input
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                ) : (
                  attachment.description
                )}
              </TableCell>
              <TableCell>
                {editingAttachmentId === attachment.id ? (
                  <Checkbox
                    checked={editedPublicAccess}
                    onCheckedChange={(checked) => setEditedPublicAccess(checked as boolean)}
                  />
                ) : (
                  attachment.publicAccess ? 'Yes' : 'No'
                )}
              </TableCell>
              <TableCell>{attachment.date}</TableCell>
              <TableCell>{attachment.uploader}</TableCell>
              {mode !== 'view' && (
                <TableCell>
                  {editingAttachmentId === attachment.id ? (
                    <Button onClick={handleSaveEdit}>Save</Button>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => handleEditClick(attachment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => onDeleteAttachment(attachment.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" onClick={() => onDownloadAttachment(attachment.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mode !== 'view' && (
        <div className="mt-4 space-y-2">
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name"
          />
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publicAccess"
              checked={newPublicAccess}
              onCheckedChange={(checked) => setNewPublicAccess(checked as boolean)}
            />
            <label htmlFor="publicAccess">Public Access</label>
          </div>
          <Button onClick={handleAddAttachment}>Add Attachment</Button>
        </div>
      )}
    </div>
  )
}