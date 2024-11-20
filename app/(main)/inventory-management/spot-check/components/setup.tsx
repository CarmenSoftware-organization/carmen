'use client';

import { useEffect, useState } from 'react';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockDepartments } from '@/lib/mock/inventory-data';
import { useUser } from '@/lib/context/user-context';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpotCheckLocationSelection } from './location-selection';

interface SpotCheckSetupProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
    targetCount: string;
    selectedLocations: any[];
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const targetCounts = [
  { value: '10', label: '10 Items' },
  { value: '20', label: '20 Items' },
  { value: '30', label: '30 Items' },
  { value: '50', label: '50 Items' },
  { value: 'custom', label: 'Custom Amount' },
];

export function SpotCheckSetup({ formData, setFormData, onNext, onBack }: SpotCheckSetupProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user) {
      setFormData((prev: any) => ({
        ...prev,
        counterName: user.name,
        department: user.department,
      }));
    }
  }, [user, setFormData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.counterName.trim()) {
      newErrors.counterName = 'Counter name is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.targetCount) {
      newErrors.targetCount = 'Target count is required';
    }
    if (!formData.selectedLocations || formData.selectedLocations.length === 0) {
      newErrors.locations = 'At least one location must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading user information...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details for this spot check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counterName">Counter Name</Label>
              <Input
                id="counterName"
                value={formData.counterName}
                onChange={(e) => handleInputChange('counterName', e.target.value)}
                placeholder="Enter counter name"
                className={errors.counterName ? 'border-destructive' : ''}
              />
              {errors.counterName && (
                <p className="text-sm text-destructive">{errors.counterName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger id="department" className={errors.department ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetCount">Target Count</Label>
            <Select
              value={formData.targetCount}
              onValueChange={(value) => handleInputChange('targetCount', value)}
            >
              <SelectTrigger id="targetCount" className={errors.targetCount ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select target count" />
              </SelectTrigger>
              <SelectContent>
                {targetCounts.map((count) => (
                  <SelectItem key={count.value} value={count.value}>
                    {count.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.targetCount && (
              <p className="text-sm text-destructive">{errors.targetCount}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Locations</CardTitle>
          <CardDescription>Choose the locations to include in this spot check</CardDescription>
        </CardHeader>
        <CardContent>
          <SpotCheckLocationSelection
            formData={{
              selectedLocations: formData.selectedLocations || [],
              department: formData.department,
              targetCount: parseInt(formData.targetCount) || 10
            }}
            setFormData={(data) => {
              setFormData((prev: any) => ({
                ...prev,
                selectedLocations: data.selectedLocations,
              }));
            }}
            onNext={handleNext}
            onBack={onBack}
          />
          {errors.locations && (
            <p className="text-sm text-destructive mt-2">{errors.locations}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
