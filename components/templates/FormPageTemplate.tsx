import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FormPageTemplateProps {
  title: string;
  children: ReactNode;
  actionButtons: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const FormPageTemplate: React.FC<FormPageTemplateProps> = ({
  title,
  children,
  actionButtons,
  onSubmit,
}) => {
  return (
    <div className="container mx-auto p-4">
      {/* <Card> */}
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {children}
            <div className="flex justify-end space-x-2">
              {actionButtons}
            </div>
          </form>
        </CardContent>
      {/* </Card> */}
    </div>
  );
};

export default FormPageTemplate;
