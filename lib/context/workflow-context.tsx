"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sampleWorkflows } from '@/lib/mock-data/workflow-config';
import { users } from '@/lib/mock-data/role-assignments';
import { useSimpleUser } from './simple-user-context';
import type { WorkflowRoleType } from '@/app/(main)/system-administration/workflow/workflow-configuration/types/workflow';

interface WorkflowStage {
  id: number;
  name: string;
  roleType: WorkflowRoleType;
  assignedUsers: string[];
}

interface WorkflowPermissions {
  canViewFinancialInfo: boolean;
  canEditFields: {
    location: boolean;
    product: boolean;
    comment: boolean;
    requestQty: boolean;
    requestUnit: boolean;
    requiredDate: boolean;
    approvedQty: boolean;
    vendor: boolean;
    price: boolean;
    orderUnit: boolean;
  };
  workflowRoles: WorkflowRoleType[];
}

interface WorkflowContextType {
  currentWorkflowId: string | null;
  userWorkflowStages: WorkflowStage[];
  workflowPermissions: WorkflowPermissions;
  setCurrentWorkflow: (workflowId: string) => void;
  getUserWorkflowRoles: () => WorkflowRoleType[];
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const { user } = useSimpleUser();
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>('WF-001'); // Default to General Purchase Workflow
  const [userWorkflowStages, setUserWorkflowStages] = useState<WorkflowStage[]>([]);
  const [workflowPermissions, setWorkflowPermissions] = useState<WorkflowPermissions>({
    canViewFinancialInfo: false,
    canEditFields: {
      location: false,
      product: false,
      comment: false,
      requestQty: false,
      requestUnit: false,
      requiredDate: false,
      approvedQty: false,
      vendor: false,
      price: false,
      orderUnit: false,
    },
    workflowRoles: []
  });

  // Get user's assigned stages in the current workflow
  useEffect(() => {
    if (!user || !currentWorkflowId) return;

    const workflow = sampleWorkflows.find(w => w.id === currentWorkflowId);
    if (!workflow) return;

    // Find the workflow user in the mock data
    const workflowUser = users.find(u => u.name === user.name);
    if (!workflowUser) return;

    // Get stages where this user is assigned
    const assignedStages = workflow.stages
      .filter(stage => stage.assignedUsers.some(u => u.id === workflowUser.id))
      .map(stage => {
        // Use the actual roleType field from the stage
        const roleType = stage.roleType;

        return {
          id: stage.id,
          name: stage.name,
          roleType,
          assignedUsers: stage.assignedUsers.map(u => u.id)
        };
      });

    setUserWorkflowStages(assignedStages);
  }, [user, currentWorkflowId]);

  // Calculate permissions based on workflow stages
  useEffect(() => {
    const roles = userWorkflowStages.map(stage => stage.roleType);
    const uniqueRoles = [...new Set(roles)];

    const permissions: WorkflowPermissions = {
      canViewFinancialInfo: false,
      canEditFields: {
        location: false,
        product: false,
        comment: false,
        requestQty: false,
        requestUnit: false,
        requiredDate: false,
        approvedQty: false,
        vendor: false,
        price: false,
        orderUnit: false,
      },
      workflowRoles: uniqueRoles
    };

    // Apply permissions based on workflow roles
    if (uniqueRoles.includes('requester')) {
      permissions.canEditFields.location = true;
      permissions.canEditFields.product = true;
      permissions.canEditFields.comment = true;
      permissions.canEditFields.requestQty = true;
      permissions.canEditFields.requestUnit = true;
      permissions.canEditFields.requiredDate = true;
    }

    if (uniqueRoles.includes('approver')) {
      permissions.canEditFields.comment = true;
      permissions.canEditFields.approvedQty = true;
      permissions.canViewFinancialInfo = true;
    }

    if (uniqueRoles.includes('purchaser')) {
      permissions.canEditFields.comment = true;
      permissions.canEditFields.approvedQty = true;
      permissions.canEditFields.vendor = true;
      permissions.canEditFields.price = true;
      permissions.canEditFields.orderUnit = true;
      permissions.canViewFinancialInfo = true;
    }

    if (uniqueRoles.includes('reviewer')) {
      permissions.canViewFinancialInfo = true;
      permissions.canEditFields.comment = true;
    }

    setWorkflowPermissions(permissions);
  }, [userWorkflowStages]);

  const setCurrentWorkflow = (workflowId: string) => {
    setCurrentWorkflowId(workflowId);
  };

  const getUserWorkflowRoles = () => {
    return [...new Set(userWorkflowStages.map(stage => stage.roleType))];
  };

  return (
    <WorkflowContext.Provider
      value={{
        currentWorkflowId,
        userWorkflowStages,
        workflowPermissions,
        setCurrentWorkflow,
        getUserWorkflowRoles
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}