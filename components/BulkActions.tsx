import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedItems: string[];
  onAction: (action: string) => void;
}

export function BulkActions({ selectedItems, onAction }: BulkActionsProps) {
  const isDisabled = selectedItems.length === 0;

  return (
    <div className="space-x-2">
      <Button disabled={isDisabled} onClick={() => onAction('delete')}>
        Delete ({selectedItems.length})
      </Button>
      <Button disabled={isDisabled} onClick={() => onAction('mark-as-received')}>
        Mark as Received ({selectedItems.length})
      </Button>
      <Button disabled={isDisabled} onClick={() => onAction('export')}>
        Export ({selectedItems.length})
      </Button>
    </div>
  );
}