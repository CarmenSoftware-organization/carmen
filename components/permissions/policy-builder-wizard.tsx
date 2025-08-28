'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

import { PolicyBuilderStep1 } from './policy-builder/step1-subject';
import { PolicyBuilderStep2 } from './policy-builder/step2-resource';
import { PolicyBuilderStep3 } from './policy-builder/step3-actions';
import { PolicyBuilderStep4 } from './policy-builder/step4-review';

interface PolicyBuilderWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Types for each step's data
interface Step1Data {
  name: string;
  description: string;
  priority: number;
  subjectType: 'role' | 'department' | 'user_group';
  selectedSubjects: string[];
  attributeConditions: Array<{
    attribute: string;
    operator: any;
    value: any;
  }>;
}

interface Step2Data {
  resourceTypes: any[];
  dataClassifications?: string[];
  departments?: string[];
  locations?: string[];
  resourceValueLimit?: number;
  customAttributes?: Array<{
    attribute: string;
    value: string;
  }>;
}

interface Step3Data {
  actions: string[];
  actionConditions?: Array<{
    action: string;
    attribute: string;
    operator: any;
    value: any;
  }>;
}

interface Step4Data {
  enabled: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  timeRestrictions?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  locationRestrictions?: string[];
  ipRestrictions?: string[];
  deviceRestrictions?: string[];
  obligations?: Array<{
    id: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  advice?: Array<{
    id: string;
    type: string;
    message: string;
  }>;
}

type PolicyFormData = {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
};

const wizardSteps = [
  {
    id: 1,
    title: 'Subject Selection',
    description: 'Define policy name and who it applies to'
  },
  {
    id: 2,
    title: 'Resource Configuration',
    description: 'Select resources and constraints'
  },
  {
    id: 3,
    title: 'Action Assignment',
    description: 'Choose actions and conditions'
  },
  {
    id: 4,
    title: 'Review & Environment',
    description: 'Review and set environmental conditions'
  }
];

export function PolicyBuilderWizard({ open, onOpenChange }: PolicyBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [policyData, setPolicyData] = useState<PolicyFormData>({});

  const handleClose = () => {
    setCurrentStep(1);
    setPolicyData({});
    onOpenChange(false);
  };

  const handleNext = (stepData: any) => {
    const updatedData = { ...policyData, [`step${currentStep}`]: stepData };
    setPolicyData(updatedData);
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create policy
      handlePolicyCreation(updatedData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePolicyCreation = async (finalData: PolicyFormData) => {
    try {
      // Here you would call your API to create the policy
      console.log('Creating policy with data:', finalData);
      
      // For now, just show success and close
      alert('Policy created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Error creating policy. Please try again.');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PolicyBuilderStep1
            onNext={handleNext}
            onCancel={handleClose}
            initialData={policyData.step1}
          />
        );
      case 2:
        return (
          <PolicyBuilderStep2
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={handleClose}
            initialData={policyData.step2}
          />
        );
      case 3:
        return (
          <PolicyBuilderStep3
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={handleClose}
            initialData={policyData.step3}
            selectedResourceTypes={policyData.step2?.resourceTypes || []}
          />
        );
      case 4:
        return (
          <PolicyBuilderStep4
            onNext={handleNext}
            onBack={handlePrevious}
            onCancel={handleClose}
            initialData={policyData.step4}
            policyData={{
              name: policyData.step1?.name || '',
              description: policyData.step1?.description || '',
              priority: policyData.step1?.priority || 100,
              subjectType: policyData.step1?.subjectType || 'role',
              selectedSubjects: policyData.step1?.selectedSubjects || [],
              resourceTypes: policyData.step2?.resourceTypes || [],
              actions: policyData.step3?.actions || []
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Access Control Policy</DialogTitle>
          <DialogDescription>
            Use this wizard to create a new attribute-based access control policy for Carmen ERP.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {wizardSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      {step.id < currentStep ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : step.id === currentStep ? (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{step.id}</span>
                        </div>
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${
                        step.id === currentStep ? 'text-foreground' : 
                        step.id < currentStep ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <Badge variant="secondary">
                Step {currentStep} of {wizardSteps.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current step content */}
        <div className="min-h-[600px]">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}