import React, { ReactNode } from 'react';

interface ListPageTemplateProps {
  title: string;
  actionButtons?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
  bulkActions?: ReactNode;
}

const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  actionButtons,
  filters,
  content,
  bulkActions,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {actionButtons && <div className="flex flex-wrap gap-2">{actionButtons}</div>}
      </div>
      
      {filters && <div>{filters}</div>}
      {bulkActions && <div className="mt-4">{bulkActions}</div>}
      
      <main>
        {content}
      </main>
    </div>
  );
};

export default ListPageTemplate;
