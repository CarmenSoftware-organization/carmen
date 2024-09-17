import React, { ReactNode } from 'react';

interface ListPageTemplateProps {
  title: string;
  actionButtons?: ReactNode;
  filters?: ReactNode;
  content: ReactNode;
}

const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  actionButtons,
  filters,
  content,
}) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {actionButtons && <div className="space-x-2">{actionButtons}</div>}
      </div>
      {filters && <div className="mb-4">{filters}</div>}
      <div className="bg-background rounded-lg shadow">
        {content}
      </div>
    </div>
  );
};

export default ListPageTemplate;
