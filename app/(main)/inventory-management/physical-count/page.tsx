'use client'

import { useState, useEffect } from 'react';
import { PhysicalCountSetup } from './components/setup';
import { LocationSelection } from './components/location-selection';
import { ItemReview } from './components/item-review';
import { FinalReview } from './components/final-review';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/mock/inventory-data';

interface FormData {
  counterName: string;
  department: string;
  dateTime: Date;
  notes: string;
  selectedLocations: string[];
  locations: string[];
  items: Product[];
  type: string;
}

const steps = [
  { title: 'Setup', description: 'Basic information' },
  { title: 'Location', description: 'Select count locations' },
  { title: 'Items', description: 'Review items' },
  { title: 'Review', description: 'Final check' },
];

export default function PhysicalCountPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    counterName: '', // Will be auto-filled
    department: '',
    dateTime: new Date(),
    notes: '',
    selectedLocations: [],
    locations: [],
    items: [],
    type: 'full',
  });

  const handleStepChange = (data: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const renderCurrentStep = () => {
    const baseFormData = {
      counterName: formData.counterName,
      department: formData.department,
      dateTime: formData.dateTime,
      notes: formData.notes,
      type: formData.type,
    };

    switch (currentStep) {
      case 0:
        return (
          <PhysicalCountSetup
            formData={baseFormData}
            setFormData={handleStepChange}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <LocationSelection
            formData={{
              department: formData.department,
              locations: formData.selectedLocations,
            }}
            onChange={handleStepChange}
          />
        );
      case 2:
        return (
          <ItemReview
            formData={{
              selectedLocations: formData.selectedLocations,
              items: formData.items,
              department: formData.department,
            }}
            setFormData={handleStepChange}
          />
        );
      case 3:
        return (
          <FinalReview
            formData={{
              counterName: formData.counterName,
              department: formData.department,
              dateTime: formData.dateTime,
              notes: formData.notes,
              selectedLocations: formData.selectedLocations,
              items: formData.items.map(item => ({
                id: item.id,
                name: item.name,
                sku: item.code,
                category: item.category,
                quantity: item.currentStock,
              })),
            }}
          />
        );
      default:
        return null;
    }
  };

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
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Physical Count</CardTitle>
        </CardHeader>
        <CardContent>
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={setCurrentStep}
          />
        </CardContent>
      </Card>

      {renderCurrentStep()}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleSave}
          >
            Save Draft
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handleSave}>Complete Setup</Button>
          )}
        </div>
      </div>
    </div>
  );
}
