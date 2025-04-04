"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

interface SpotCheckNavProps {
  currentStep: number;
  steps: { 
    id: number;
    name: string;
    description?: string;
    isCompleted?: boolean;
  }[];
  onChange?: (step: number) => void;
}

export function SpotCheckNav({ 
  currentStep, 
  steps, 
  onChange 
}: SpotCheckNavProps) {
  return (
    <div className="py-4 space-y-2">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {steps[currentStep - 1]?.name || 'Spot Check'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.description || 'Manage inventory with spot checks'}
          </p>
        </div>
      </div>
      
      <nav className="flex items-center justify-between">
        <ol className="grid grid-flow-col auto-cols-fr gap-2">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.isCompleted || currentStep > step.id;
            
            return (
              <li key={step.id} className="relative">
                <button
                  type="button"
                  className={cn(
                    "flex h-16 w-full flex-col items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium border",
                    isActive
                      ? "border-primary text-primary"
                      : isCompleted
                      ? "border-transparent text-foreground"
                      : "border-muted text-muted-foreground"
                  )}
                  onClick={() => {
                    if (onChange && (isCompleted || isActive)) {
                      onChange(step.id);
                    }
                  }}
                >
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full border">
                    {isCompleted ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="text-xs">{step.name}</div>
                </button>
                
                {step.id !== steps.length && (
                  <div className="absolute right-0 top-8 z-10 h-0.5 w-[calc(50%-16px)] bg-muted" />
                )}
                
                {step.id !== 1 && (
                  <div className="absolute left-0 top-8 z-10 h-0.5 w-[calc(50%-16px)] bg-muted" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
