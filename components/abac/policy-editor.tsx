"use client";

import { useEffect, useState } from 'react';
import { Policy } from '@/types/abac';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PolicyProgressBar } from './policy-progress-bar';
import { Step1Subject } from './step-1-subject';
import { Step2Resource } from './step-2-resource';
import { Step3Actions } from './step-3-actions';
import { Step4Environment } from './step-4-environment';
import { Step5Review } from './step-5-review';

interface PolicyEditorProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: Policy) => void;
}

const initialPolicyState: Omit<Policy, 'id'> = {
  name: '',
  description: '',
  priority: 100,
  enabled: true,
  target: {
    subjects: [],
    resources: [],
    actions: [],
    environment: [],
  },
  rules: [],
  effect: 'permit',
};

export function PolicyEditor({ policy, isOpen, onClose, onSave }: PolicyEditorProps) {
  const [step, setStep] = useState(1);
  const [editedPolicy, setEditedPolicy] = useState<Omit<Policy, 'id'> | Policy>(initialPolicyState);

  useEffect(() => {
    if (policy) {
      setEditedPolicy(policy);
    } else {
      setEditedPolicy(initialPolicyState);
    }
    // Reset step when modal opens
    setStep(1);
  }, [policy, isOpen]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    if (!editedPolicy.name) {
      alert('Policy name is required.');
      return;
    }
    onSave(editedPolicy as Policy);
    onClose(); // Close modal on save
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Subject policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
      case 2:
        return <Step2Resource policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
      case 3:
        return <Step3Actions policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
      case 4:
        return <Step4Environment policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
      case 5:
        return <Step5Review policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
      default:
        return <Step1Subject policy={editedPolicy as Policy} setPolicy={setEditedPolicy} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Permission Policy</DialogTitle>
        </DialogHeader>
        <div className="p-6">
            <p className="text-slate-500 -mt-4 mb-4">Follow the steps to create a new access rule for the Carmen Hospitality ERP.</p>
            <PolicyProgressBar currentStep={step} />
            <div className="mt-8 min-h-[350px]">{renderStep()}</div>
        </div>
        <DialogFooter className="bg-slate-50 px-8 py-4 flex justify-between items-center border-t border-slate-200">
            <Button
                onClick={handleBack}
                disabled={step === 1}
                variant="outline"
            >
                Back
            </Button>
            {step < 5 ? (
                <Button onClick={handleNext}>
                Next
                </Button>
            ) : (
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Save Policy
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}