import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';

interface DetailPageTemplateProps {
  title: React.ReactNode;
  subtitle?: string;
  status?: React.ReactNode;
  details?: React.ReactNode;
  editableDetails?: React.ReactNode;
  isEditing?: boolean;
  actionButtons?: React.ReactNode;
  content: React.ReactNode;
  backLink?: string;
}

const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  title,
  subtitle,
  status,
  details,
  editableDetails,
  isEditing = false,
  actionButtons,
  content,
  backLink,
}) => {
  return (
    <div className="container mx-auto py-4">
      <div className="space-y-4">
        <div className="px-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {backLink && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 shrink-0"
                      >
                        <Link href={backLink}>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Back</span>
                        </Link>
                      </Button>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold">
                          {title}
                        </div>
                        {status}
                      </div>
                      {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {actionButtons}
                  </div>
                </div>
                {details && (
                  <div className="border-t pt-6">
                    {details}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="p-6 -mt-6">
          {content}
        </div>
      </div>
    </div>
  );
};

export default DetailPageTemplate;
