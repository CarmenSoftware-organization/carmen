// File: WorkflowProgressTimeline.tsx
"use client";

import React from "react";
import { WorkflowStage, WorkflowStatus, PurchaseRequest, PRStatus, asMockPurchaseRequest } from "@/lib/types";

import { CheckCircle, Clock, XCircle, User, Building, CreditCard, UserCheck, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowProgressTimelineProps {
  prData: PurchaseRequest;
  className?: string;
}

interface WorkflowStep {
  stage: WorkflowStage;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'current' | 'pending' | 'rejected';
}

export function WorkflowProgressTimeline({ prData, className }: WorkflowProgressTimelineProps) {
  // Define the workflow steps in order
  const getWorkflowSteps = (): WorkflowStep[] => {
    const steps: Omit<WorkflowStep, 'status'>[] = [
      {
        stage: WorkflowStage.requester,
        title: "Request Submitted",
        description: "Purchase request created",
        icon: User,
      },
      {
        stage: WorkflowStage.departmentHeadApproval,
        title: "Department Head",
        description: "Department manager approval",
        icon: Building,
      },
      {
        stage: WorkflowStage.purchaseCoordinatorReview,
        title: "Purchase Review",
        description: "Purchase coordinator review",
        icon: CheckSquare,
      },
      {
        stage: WorkflowStage.financeManagerApproval,
        title: "Finance Approval",
        description: "Finance manager approval",
        icon: CreditCard,
      },
      {
        stage: WorkflowStage.generalManagerApproval,
        title: "General Manager",
        description: "General manager approval",
        icon: UserCheck,
      },
      {
        stage: WorkflowStage.completed,
        title: "Completed",
        description: "Request approved & processed",
        icon: CheckCircle,
      },
    ];

    // Determine status for each step
    return steps.map((step) => {
      let status: WorkflowStep['status'] = 'pending';

      const mockPrData = asMockPurchaseRequest(prData);

      if (prData.status === PRStatus.Cancelled && step.stage === mockPrData.currentWorkflowStage) {
        status = 'rejected';
      } else if (step.stage === mockPrData.currentWorkflowStage) {
        status = 'current';
      } else {
        // Check if this step is before the current stage (completed)
        const currentStageIndex = steps.findIndex(s => s.stage === mockPrData.currentWorkflowStage);
        const stepIndex = steps.findIndex(s => s.stage === step.stage);

        if (stepIndex < currentStageIndex || mockPrData.currentWorkflowStage === WorkflowStage.completed) {
          status = 'completed';
        }
      }

      return { ...step, status };
    });
  };

  const workflowSteps = getWorkflowSteps();



  return (
    <div className={cn("p-2", className)}>
        <div className="flex items-center justify-between text-xs">
          {workflowSteps.map((step, index) => {
            const isLast = index === workflowSteps.length - 1;
            
            return (
              <React.Fragment key={step.stage}>
                <div className="flex flex-col items-center text-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'current' ? 'bg-blue-500 text-white' :
                    step.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.status === 'current' ? (
                      <Clock className="h-4 w-4" />
                    ) : step.status === 'rejected' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className={cn(
                    "font-medium mt-1",
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'current' ? 'text-blue-700' :
                    step.status === 'rejected' ? 'text-red-700' :
                    'text-gray-500'
                  )}>
                    {step.title}
                  </div>
                </div>
                {!isLast && (
                  <div className={cn(
                    "flex-1 h-px mx-2 -mt-3",
                    index < workflowSteps.findIndex(s => s.status === 'current') ? 'bg-green-300' :
                    'bg-gray-300'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {prData.status === PRStatus.Cancelled && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="text-red-800 font-medium">
              Request Rejected at {workflowSteps.find(s => s.status === 'rejected')?.title} stage
            </div>
          </div>
        )}
        

    </div>
  );
}