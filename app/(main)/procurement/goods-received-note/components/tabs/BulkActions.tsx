import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedItems: string[];
  onAction: (action: string) => void;
}

export function BulkActions({ selectedItems, onAction }: BulkActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button onClick={() => onAction('delete')} disabled={selectedItems.length === 0}>
        Delete Selected
      </Button>
      {/* <Button onClick={() => onAction('archive')} disabled={selectedItems.length === 0}>
        Archive Selected
      </Button>
      Add more bulk actions as needed */}
    </div>
  );
}