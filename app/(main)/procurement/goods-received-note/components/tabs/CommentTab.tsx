import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GoodsReceiveNoteMode, Comment } from '@/lib/types'
import { Edit, Trash2 } from 'lucide-react'

interface CommentTabProps {
  mode: GoodsReceiveNoteMode
  comments: Comment[]
  onAddComment: (comment: Omit<Comment, 'id' | 'number' | 'date'>) => void
  onEditComment: (id: string, text: string) => void
  onDeleteComment: (id: string) => void
}

export function CommentTab({ mode, comments, onAddComment, onEditComment, onDeleteComment }: CommentTabProps) {
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editedCommentText, setEditedCommentText] = useState('')

  const handleAddComment = () => {
    if (newComment.trim()) {
      // onAddComment({
      //   author: 'Current User', // Replace with actual user name
      //   text: newComment,
      //   content: '',
      //   timestamp: new Date()
      // })
      setNewComment('')
    }
  }

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditedCommentText(comment.text)
  }

  const handleSaveEdit = () => {
    if (editingCommentId && editedCommentText.trim()) {
      onEditComment(editingCommentId, editedCommentText)
      setEditingCommentId(null)
      setEditedCommentText('')
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Comment #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Text</TableHead>
            {mode !== 'view' && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>{comment.id}</TableCell>
              <TableCell>{comment.timestamp.toISOString()}</TableCell>
              <TableCell>{comment.userName}</TableCell>
              <TableCell>
                {editingCommentId === comment.id ? (
                  <Textarea
                    value={editedCommentText}
                    onChange={(e) => setEditedCommentText(e.target.value)}
                  />
                ) : (
                  comment.text
                )}
              </TableCell>
              {mode !== 'view' && (
                <TableCell>
                  {editingCommentId === comment.id ? (
                    <Button onClick={handleSaveEdit}>Save</Button>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => handleEditClick(comment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => onDeleteComment(comment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mode !== 'view' && (
        <div className="mt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a new comment..."
          />
          <Button onClick={handleAddComment} className="mt-2">Add Comment</Button>
        </div>
      )}
    </div>
  )
}