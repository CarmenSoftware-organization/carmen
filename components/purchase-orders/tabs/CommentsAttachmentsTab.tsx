import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"


interface Comment {
  date: string
  user: string
  text: string
}

interface Attachment {
  fileName: string
  uploadedBy: string
  date: string
}

interface PurchaseOrderData {
  comments?: Comment[]
  attachments?: Attachment[]
}

interface CommentsAttachmentsTabProps {
  poData?: PurchaseOrderData
}

// Mock data for when no data is provided
const mockComments: Comment[] = [
  {
    date: "2023-07-15",
    user: "John Smith",
    text: "Please expedite this order"
  },
  {
    date: "2023-07-16",
    user: "Jane Doe",
    text: "Vendor confirmed availability"
  }
];

const mockAttachments: Attachment[] = [
  {
    fileName: "requirements.pdf",
    uploadedBy: "John Smith",
    date: "2023-07-15"
  },
  {
    fileName: "vendor_quote.pdf",
    uploadedBy: "Jane Doe",
    date: "2023-07-16"
  }
];

export default function CommentsAttachmentsTab({ poData }: CommentsAttachmentsTabProps) {
  // Use provided data or fallback to mock data
  const comments = poData?.comments || mockComments;
  const attachments = poData?.attachments || mockAttachments;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comments & Attachments</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-3">
          <Textarea placeholder="Add a comment..." />
        </div>
        <div>
          <Button className="mt-6">Add Comment</Button>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment: Comment, index: number) => (
              <TableRow key={index}>
                <TableCell>{comment.date}</TableCell>
                <TableCell>{comment.user}</TableCell>
                <TableCell>{comment.text}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-3">
          <Input type="file" />
        </div>
        <div>
          <Button className="mt-1">Add Attachment</Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Attachments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attachments.map((attachment: Attachment, index: number) => (
              <TableRow key={index}>
                <TableCell>{attachment.fileName}</TableCell>
                <TableCell>{attachment.uploadedBy}</TableCell>
                <TableCell>{attachment.date}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2">View</Button>
                  <Button variant="outline" size="sm">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
