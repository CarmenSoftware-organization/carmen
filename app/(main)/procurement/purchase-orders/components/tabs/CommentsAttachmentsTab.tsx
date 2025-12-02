import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, Download, Eye, FileText, Image, File } from 'lucide-react';
import { PurchaseOrder } from '@/lib/types';
import { useSimpleUser } from '@/lib/context/simple-user-context';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface CommentsAttachmentsTabProps {
  poData: PurchaseOrder;
}

const mockComments: Comment[] = [
  {
    id: 'comment-po-001',
    userId: 'user-buyer-001',
    userName: 'Purchasing Manager Sarah',
    content: 'Purchase order created from approved PR-2024-0015. Vendor has been notified.',
    timestamp: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'comment-po-002',
    userId: 'user-vendor-001',
    userName: 'Vendor Contact - John',
    content: 'Order acknowledged. Expected delivery date confirmed for January 25th.',
    timestamp: new Date('2024-01-16T09:15:00Z'),
  },
  {
    id: 'comment-po-003',
    userId: 'user-receiving-001',
    userName: 'Receiving Clerk Mike',
    content: 'Partial delivery received. 15 out of 20 items in good condition. Remaining items expected next week.',
    timestamp: new Date('2024-01-25T14:30:00Z'),
  },
];

const mockAttachments: Attachment[] = [
  {
    id: 'attach-001',
    name: 'vendor_quotation.pdf',
    type: 'application/pdf',
    size: '245 KB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'attach-002',
    name: 'product_specifications.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '128 KB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: new Date('2024-01-15T10:05:00Z'),
  },
  {
    id: 'attach-003',
    name: 'delivery_confirmation.pdf',
    type: 'application/pdf',
    size: '156 KB',
    uploadedBy: 'Mike Chen',
    uploadedAt: new Date('2024-01-25T14:35:00Z'),
  },
];

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('image')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="h-4 w-4 text-blue-600" />;
  return <File className="h-4 w-4 text-gray-500" />;
};

export default function CommentsAttachmentsTab({ poData }: CommentsAttachmentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments);
  const { user } = useSimpleUser();

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        content: newComment,
        timestamp: new Date(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  const handleFileUpload = () => {
    // Trigger file input click - in real app, this would open file picker
    console.log('File upload triggered');
  };

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
          Comments
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
        </h4>

        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/avatars/${comment.userId}.png`} alt={comment.userName} />
                    <AvatarFallback className="text-xs">
                      {comment.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{comment.userName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
          Attachments
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{attachments.length}</span>
        </h4>

        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(attachment.type)}
                <div>
                  <p className="text-sm font-medium">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {attachment.size} • Uploaded by {attachment.uploadedBy} on {attachment.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Comment Section */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user ? `/avatars/${user.id}.png` : undefined} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {user ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleFileUpload}
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach File
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  Ctrl+Enter to send
                </span>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="h-8"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
