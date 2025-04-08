'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Send, History, FileText, X } from 'lucide-react'


interface Comment {
  id: string
  user: string
  avatar: string
  content: string
  timestamp: string
  attachments?: string[]
}

interface Attachment {
  id: string
  name: string
  size: string
  uploadedBy: string
  uploadedAt: string
  type: string
}

interface AuditLog {
  id: string
  user: string
  action: string
  timestamp: string
  details?: string
}

interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data
const mockComments: Comment[] = [
  {
    id: '1',
    user: 'John Doe',
    avatar: '/avatars/john-doe.png',
    content: 'Added new items to the adjustment.',
    timestamp: '2024-01-15 09:30 AM',
  },
  {
    id: '2',
    user: 'Jane Smith',
    avatar: '/avatars/jane-smith.png',
    content: 'Updated quantities based on stock count.',
    timestamp: '2024-01-15 02:15 PM',
    attachments: ['count_sheet.pdf'],
  },
]

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: 'count_sheet.pdf',
    size: '2.4 MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2024-01-15 02:15 PM',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'inventory_photos.zip',
    size: '15.7 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-01-15 09:30 AM',
    type: 'zip',
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Created adjustment',
    timestamp: '2024-01-15 09:00 AM',
    details: 'Initial creation of inventory adjustment',
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'Updated quantities',
    timestamp: '2024-01-15 02:15 PM',
    details: 'Modified quantities for items based on physical count',
  },
  {
    id: '3',
    user: 'John Doe',
    action: 'Added comment',
    timestamp: '2024-01-15 09:30 AM',
  },
]

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [attachments] = useState<Attachment[]>(mockAttachments)
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs)

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: (comments.length + 1).toString(),
      user: 'Current User',
      avatar: '/avatars/current-user.png',
      content: newComment,
      timestamp: new Date().toLocaleString(),
    }

    setComments([...comments, comment])
    setNewComment('')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-96 bg-background/100 border-l border-border shadow-lg pt-16 z-50">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Comments and Attachments Section */}
          <div className="flex-1 border-b">
            <div className="p-4">
              <ScrollArea className="h-[calc(100vh-420px)]">
                <div className="flex flex-col gap-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={comment.avatar} />
                          <AvatarFallback>{comment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{comment.user}</span>
                            <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm">{comment.content}</p>
                          {comment.attachments && (
                            <div className="mt-2">
                              {comment.attachments.map((attachment) => (
                                <div key={attachment} className="flex items-center gap-2 text-sm text-blue-600">
                                  <FileText className="h-4 w-4" />
                                  {attachment}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {attachments.map((file) => (
                    <Card key={file.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{file.name}</span>
                            <span className="text-sm text-muted-foreground">{file.size}</span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Uploaded by {file.uploadedBy} • {file.uploadedAt}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="absolute bottom-[200px] left-0 right-0 p-4 bg-background border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-between mt-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Audit Log Section */}
          <div className="h-[200px] bg-muted/30">
            <div className="flex items-center justify-between p-2 px-4 border-b">
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4" />
                History
              </div>
            </div>
            <ScrollArea className="h-[164px]">
              <div className="p-4 flex flex-col gap-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <History className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="font-medium">{log.user}</span>
                          <span className="text-muted-foreground"> {log.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                      </div>
                      {log.details && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  )
}
