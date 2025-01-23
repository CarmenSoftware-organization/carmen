import React from 'react';
import { TooltipProvider as RadixTooltipProvider } from '@radix-ui/react-tooltip';

export const TooltipProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <RadixTooltipProvider delayDuration={0}>
      {children}
    </RadixTooltipProvider>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
