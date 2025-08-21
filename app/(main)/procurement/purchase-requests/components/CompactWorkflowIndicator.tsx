"use client";

import React from "react";
import { WorkflowStage, PurchaseRequest } from "@/lib/types";
import { CheckCircle, Clock, User, Building, CheckSquare, CreditCard, UserCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactWorkflowIndicatorProps {
  currentStage: WorkflowStage;
  prData: PurchaseRequest;
  className?: string;
}

interface WorkflowStep {
  stage: WorkflowStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function CompactWorkflowIndicator({ currentStage, prData, className }: CompactWorkflowIndicatorProps) {
  // Define all workflow steps in order (using PR workflow stage labels)
  const allSteps: WorkflowStep[] = [
    {
      stage: WorkflowStage.requester,
      label: "Request Submitted",
      icon: User,
    },
    {
      stage: WorkflowStage.departmentHeadApproval,
      label: "Department Head",
      icon: Building,
    },
    {
      stage: WorkflowStage.purchaseCoordinatorReview,
      label: "Purchase Review",
      icon: CheckSquare,
    },
    {
      stage: WorkflowStage.financeManagerApproval,
      label: "Finance Approval",
      icon: CreditCard,
    },
    {
      stage: WorkflowStage.generalManagerApproval,
      label: "General Manager",
      icon: UserCheck,
    },
    {
      stage: WorkflowStage.completed,
      label: "Completed",
      icon: CheckCircle,
    },
  ];

  // Find current step index
  const currentIndex = allSteps.findIndex(step => step.stage === currentStage);
  
  // Determine which steps to show (at least 3, up to 5 steps)
  const getVisibleSteps = (): Array<{step: WorkflowStep; status: 'completed' | 'current' | 'pending'}> => {
    const steps = [];
    const minSteps = 3;
    const maxSteps = 5;
    
    // Calculate the range of steps to show
    let startIndex = Math.max(0, currentIndex - 1); // Start with 1 before current
    let endIndex = Math.min(allSteps.length - 1, currentIndex + 1); // End with 1 after current
    
    // Ensure we show at least 3 steps
    while (endIndex - startIndex + 1 < minSteps && (startIndex > 0 || endIndex < allSteps.length - 1)) {
      if (startIndex > 0) startIndex--;
      if (endIndex < allSteps.length - 1 && endIndex - startIndex + 1 < minSteps) endIndex++;
    }
    
    // Don't exceed max steps
    if (endIndex - startIndex + 1 > maxSteps) {
      // Prefer showing more future steps than past steps
      if (currentIndex <= 2) {
        endIndex = Math.min(allSteps.length - 1, startIndex + maxSteps - 1);
      } else {
        startIndex = Math.max(0, endIndex - maxSteps + 1);
      }
    }
    
    // Build the visible steps array
    for (let i = startIndex; i <= endIndex; i++) {
      let status: 'completed' | 'current' | 'pending';
      
      if (i < currentIndex) {
        status = 'completed';
      } else if (i === currentIndex) {
        status = 'current';
      } else {
        status = 'pending';
      }
      
      steps.push({
        step: allSteps[i],
        status
      });
    }
    
    return steps;
  };

  const visibleSteps = getVisibleSteps();

  if (visibleSteps.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {visibleSteps.map((stepInfo, index) => {
        const { step, status } = stepInfo;
        const isLast = index === visibleSteps.length - 1;
        const IconComponent = step.icon;

        return (
          <React.Fragment key={step.stage}>
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                status === 'completed' ? 'bg-green-500 text-white' :
                status === 'current' ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-500'
              )}>
                {status === 'completed' ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : status === 'current' ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <IconComponent className="h-3.5 w-3.5" />
                )}
              </div>
              
              {/* Step Label */}
              <span className={cn(
                "text-xs font-medium mt-1 whitespace-nowrap",
                status === 'completed' ? 'text-green-600' :
                status === 'current' ? 'text-blue-600' :
                'text-gray-400'
              )}>
                {step.label}
              </span>
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div className={cn(
                "w-6 h-px -mb-4",
                status === 'completed' || (index < visibleSteps.findIndex(s => s.status === 'current')) ? 'bg-green-300' :
                'bg-gray-200'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}