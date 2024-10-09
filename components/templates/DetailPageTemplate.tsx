import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DetailPageTemplateProps {
  title: ReactNode;
  actionButtons?: ReactNode;
  content: ReactNode;
  backLink : ReactNode;
}

const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  title,
  actionButtons,
  content,
  backLink,
}) => {
  return (
    <div className="container mx-auto p-2 bg-white dark:bg-gray-800">
      {/* <Card> */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-100 dark:bg-gray-800">
          <CardTitle className="text-2xl font-bold flex items-center gap-2"><div>{backLink}</div><div>{title}</div> </CardTitle>
          {actionButtons && <div className="space-x-2">{actionButtons}</div>}
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      {/* </Card> */}
    </div>
  );
};

export default DetailPageTemplate;
