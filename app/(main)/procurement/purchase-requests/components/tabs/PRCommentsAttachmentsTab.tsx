import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send } from 'lucide-react';
import { PurchaseRequest, Comment } from '@/lib/types';
import { useUser } from '@/lib/context/user-context';

interface PRCommentsAttachmentsTabProps {
  prData: PurchaseRequest;
}

const mockComments: Comment[] = [
  {
    id: 'comment-pr-001',
    userId: 'user-chef-001',
    userName: 'Chef Maria Rodriguez',
    text: 'Request submitted for Grand Ballroom event. All equipment is essential for successful catering.',
    content: 'Request submitted for Grand Ballroom event. All equipment is essential for successful catering.',
    timestamp: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'comment-pr-002',
    userId: 'user-manager-001',
    userName: 'Kitchen Manager Sarah',
    text: 'Reviewed equipment specifications. All items appear necessary and within budget guidelines.',
    content: 'Reviewed equipment specifications. All items appear necessary and within budget guidelines.',
    timestamp: new Date('2024-01-16T09:15:00Z')
  },
  {
    id: 'comment-pr-003',
    userId: 'user-fm-001',
    userName: 'Finance Manager John',
    text: 'Budget allocation verified. Approved for procurement as part of Q1 equipment upgrade program.',
    content: 'Budget allocation verified. Approved for procurement as part of Q1 equipment upgrade program.',
    timestamp: new Date('2024-01-17T11:30:00Z')
  }
];

export default function PRCommentsAttachmentsTab({ prData }: PRCommentsAttachmentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(() => {
    // Use actual PR comments if available, otherwise use mock data
    return prData.comments && prData.comments.length > 0 ? prData.comments : mockComments;
  });
  const { user } = useUser();

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        text: newComment,
        content: newComment,
        timestamp: new Date()
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  // Mock attachments based on PR type and items
  const mockAttachments = [
    { name: 'quotation_kitchen_equipment.pdf', type: 'application/pdf' },
    { name: 'vendor_specifications.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'budget_approval.pdf', type: 'application/pdf' }
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
                    {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
              {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
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