import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string) => void;
}

export function BulkActions({ selectedCount, onAction }: BulkActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button onClick={() => onAction('delete')} disabled={selectedCount === 0}>
        Delete Selected ({selectedCount})
      </Button>
      {/* <Button onClick={() => onAction('archive')} disabled={selectedCount === 0}>
        Archive Selected
      </Button>
      Add more bulk actions as needed */}
    </div>
  );
}