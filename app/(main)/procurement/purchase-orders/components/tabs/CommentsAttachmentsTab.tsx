import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Paperclip, Send } from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}


interface CommentsAttachmentsTabProps {
  poData: any; // Replace 'any' with your PurchaseOrder type
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


export default function CommentsAttachmentsTab({ poData }: CommentsAttachmentsTabProps) {
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
    <div className="h-full">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col space-y-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {comments.map((comment) => (
                <Card key={comment.id} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <AvatarWithFallback
                        src={comment.avatar}
                        alt={comment.user}
                        fallbackText={comment.user}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-sm">{comment.user}</h4>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Attachments:</h5>
                            <ul className="space-y-1">
                              {comment.attachments.map((attachment, index) => (
                                <li key={index} className="text-xs text-blue-600 hover:underline">
                                  <a href="#" className="flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    {attachment}
                                  </a>
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
            
            <div className="border-t pt-3">
              <div className="flex items-start space-x-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px] resize-none"
                />
                <div className="flex flex-col space-y-1">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Paperclip className="h-3 w-3" />
                  </Button>
                  <Button onClick={handleAddComment} size="sm" className="h-8">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
