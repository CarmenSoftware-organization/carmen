import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send } from 'lucide-react';
import { GoodsReceiveNote } from '@/lib/types';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface CommentsAttachmentsTabProps {
  poData: GoodsReceiveNote;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: 'John Doe',
    avatar: '/avatars/john-doe.png',
    content: 'Vendor confirmed the order details.',
    timestamp: '2023-08-15 09:30 AM',
    attachments: ['order_confirmation.pdf'],
  },
  {
    id: '2',
    user: 'Jane Smith',
    avatar: '/avatars/jane-smith.png',
    content: 'Delivery date has been updated to next week.',
    timestamp: '2023-08-16 02:15 PM',
  },
  {
    id: '3',
    user: 'Mike Johnson',
    avatar: '/avatars/mike-johnson.png',
    content: 'Quality check completed. All items meet our standards.',
    timestamp: '2023-08-18 11:45 AM',
    attachments: ['quality_report.docx', 'inspection_photos.zip'],
  },
];

export function CommentsAttachmentsTab({ poData }: CommentsAttachmentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        user: 'Current User', // Replace with actual current user
        avatar: '/avatars/current-user.png', // Replace with actual avatar
        content: newComment,
        timestamp: new Date().toLocaleString(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Comments & Attachments</h2>
      
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={comment.avatar} alt={comment.user} />
                  <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{comment.user}</h3>
                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold">Attachments:</h4>
                      <ul className="list-disc list-inside">
                        {comment.attachments.map((attachment, index) => (
                          <li key={index} className="text-sm text-blue-500 hover:underline">
                            <a href="#">{attachment}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex items-start space-x-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1"
        />
        <div className="space-y-2">
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddComment}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
