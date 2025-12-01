import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send } from 'lucide-react';
import { PurchaseOrder } from '@/lib/types';
import { useSimpleUser } from '@/lib/context/simple-user-context';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  content: string;
  timestamp: Date;
}

interface CommentsAttachmentsTabProps {
  poData: PurchaseOrder;
}

const mockComments: Comment[] = [
  {
    id: 'comment-po-001',
    userId: 'user-buyer-001',
    userName: 'Purchasing Manager Sarah',
    text: 'Purchase order created from approved PR-2024-0015. Vendor has been notified.',
    content: 'Purchase order created from approved PR-2024-0015. Vendor has been notified.',
    timestamp: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'comment-po-002',
    userId: 'user-vendor-001',
    userName: 'Vendor Contact - John',
    text: 'Order acknowledged. Expected delivery date confirmed for January 25th.',
    content: 'Order acknowledged. Expected delivery date confirmed for January 25th.',
    timestamp: new Date('2024-01-16T09:15:00Z'),
  },
  {
    id: 'comment-po-003',
    userId: 'user-receiving-001',
    userName: 'Receiving Clerk Mike',
    text: 'Partial delivery received. 15 out of 20 items in good condition. Remaining items expected next week.',
    content: 'Partial delivery received. 15 out of 20 items in good condition. Remaining items expected next week.',
    timestamp: new Date('2024-01-25T14:30:00Z'),
  },
];

export default function CommentsAttachmentsTab({ poData }: CommentsAttachmentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const { user } = useSimpleUser();

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        text: newComment,
        content: newComment,
        timestamp: new Date(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  // Mock attachments for PO
  const mockAttachments = [
    { name: 'vendor_quotation.pdf', type: 'application/pdf' },
    { name: 'product_specifications.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'delivery_confirmation.pdf', type: 'application/pdf' }
  ];

  return (
    <div className="space-y-4">
      {/* Comments Section */}
      <div className="space-y-4 mb-6">
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

      {/* Attachments Section */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-sm text-muted-foreground">Attachments</h4>
        {mockAttachments.map((attachment, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{attachment.name}</span>
              <span className="text-xs text-muted-foreground">
                ({attachment.type.split('/').pop()?.toUpperCase()})
              </span>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                View
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Section */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-2">
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
              <Button variant="outline" size="sm" className="h-8">
                <Paperclip className="h-4 w-4 mr-1" />
                Attach File
              </Button>
              <div className="flex space-x-2">
                <span className="text-xs text-muted-foreground self-center">
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
