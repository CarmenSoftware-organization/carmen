import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, FileText, FileSpreadsheet, FileImage, File, Download, Eye } from 'lucide-react';
import { PurchaseRequest, Comment, asMockPurchaseRequest } from '@/lib/types';
import { useSimpleUser } from '@/lib/context/simple-user-context';

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
  const mockPrData = asMockPurchaseRequest(prData);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(() => {
    // Use actual PR comments if available, otherwise use mock data
    return mockPrData.comments && mockPrData.comments.length > 0 ? mockPrData.comments : mockComments;
  });
  const { user } = useSimpleUser();

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
    { name: 'quotation_kitchen_equipment.pdf', type: 'application/pdf', size: '312 KB', uploadedAt: new Date('2024-01-15T10:30:00Z') },
    { name: 'vendor_specifications.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: '156 KB', uploadedAt: new Date('2024-01-15T11:00:00Z') },
    { name: 'budget_approval.pdf', type: 'application/pdf', size: '78 KB', uploadedAt: new Date('2024-01-16T09:15:00Z') }
  ];

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return <FileImage className="h-4 w-4 text-blue-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-4 w-4 text-blue-600" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  // Helper function to get friendly file type label
  const getFileTypeLabel = (type: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toUpperCase() || '';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Excel';
    if (type.includes('csv')) return 'CSV';
    if (type.includes('word') || type.includes('document')) return 'Word';
    if (type.includes('image') || type.includes('png')) return 'PNG';
    if (type.includes('jpg') || type.includes('jpeg')) return 'JPEG';
    return extension;
  };

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
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-muted-foreground">Attachments</h4>
          <span className="text-xs text-muted-foreground">{mockAttachments.length} files</span>
        </div>
        <div className="space-y-2">
          {mockAttachments.map((attachment, index) => (
            <div key={index} className="group flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-transparent hover:border-muted transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background flex items-center justify-center border">
                {getFileIcon(attachment.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
                    {getFileTypeLabel(attachment.type, attachment.name)}
                  </span>
                  <span>{attachment.size}</span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
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