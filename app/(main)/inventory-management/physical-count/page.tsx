'use client';

import { useState } from 'react';
import { PhysicalCountSetup } from './components/setup';
import { LocationSelection } from './components/location-selection';
import { ItemReview } from './components/item-review';
import { FinalReview } from './components/final-review';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const steps = [
  { title: 'Setup', description: 'Basic information' },
  { title: 'Location', description: 'Select count locations' },
  { title: 'Items', description: 'Review items' },
  { title: 'Review', description: 'Final check' },
];

export default function PhysicalCountPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    counterName: '', // Will be auto-filled
    department: '',
    dateTime: new Date(),
    notes: '',
    selectedLocations: [],
    items: [],
  });

  const StepComponents = [
    PhysicalCountSetup,
    LocationSelection,
    ItemReview,
    FinalReview,
  ];

  const CurrentStepComponent = StepComponents[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
  };

  return (
    <div className="container space-y-6 p-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Physical Count</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
          >
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={() => {}} // Handle cancel
          >
            Cancel
          </Button>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
