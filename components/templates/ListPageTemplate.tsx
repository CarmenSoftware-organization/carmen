import React, { ReactNode } from 'react';

interface ListPageTemplateProps {
  title: string;
  actionButtons?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  bulkActions? : ReactNode;
}

const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  actionButtons,
  filters,
  content,
  bulkActions,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {actionButtons && <div>{actionButtons}</div>}
      </div>
      
      {/* Search and Filters */}
      {filters && <div>{filters}</div>}
      
      {/* Bulk Actions */}
      {bulkActions && <div>{bulkActions}</div>}
      
      {/* Content */}
      {content}
    </div>
  );
};

export default ListPageTemplate;
