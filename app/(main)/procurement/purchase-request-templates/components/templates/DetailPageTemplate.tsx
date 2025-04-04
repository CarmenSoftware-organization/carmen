import React from 'react';

interface DetailPageTemplateProps {
  title: React.ReactNode;
  subtitle?: string;
  status?: React.ReactNode;
  details?: React.ReactNode;
  editableDetails?: React.ReactNode;
  isEditing?: boolean;
  actionButtons?: React.ReactNode;
  content: React.ReactNode;
  backLink?: React.ReactNode | string;
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
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-6">
        <div>
          {backLink && (
            <div className="mb-4">
              {typeof backLink === 'string' ? (
                <a href={backLink} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <span className="inline-block">←</span> Back
                </a>
              ) : (
                backLink
              )}
            </div>
          )}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {title}
              </div>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {status}
              {actionButtons}
            </div>
          </div>

          {isEditing ? editableDetails : details}
        </div>

        {content}
      </div>
    </div>
  );
};

export default DetailPageTemplate;
