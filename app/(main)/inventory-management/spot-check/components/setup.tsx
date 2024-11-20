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
import { Card, CardContent } from "@/components/ui/card";
import { mockDepartments } from '@/lib/mock/inventory-data';
import { useUser } from '@/lib/context/user-context';

interface SpotCheckSetupProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
    targetCount: string;
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
    <Card className="mt-6">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Physical Count Setup</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Step</div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
              1
            </div>
            <div className="text-sm text-muted-foreground">of 4</div>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="counterName">Counter Name</Label>
            <Input
              id="counterName"
              value={formData.counterName}
              onChange={(e) => handleInputChange('counterName', e.target.value)}
              placeholder="Enter counter name"
              disabled
            />
            {errors.counterName && (
              <p className="text-sm text-red-500">{errors.counterName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleInputChange('department', value)}
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.code}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Count Date & Time</Label>
            <DateTimePicker
              value={formData.dateTime}
              onChange={(date: Date) => handleInputChange('dateTime', date)}
              disabled={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetCount">Target Count</Label>
            <Select
              value={formData.targetCount}
              onValueChange={(value) => handleInputChange('targetCount', value)}
            >
              <SelectTrigger>
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
              <p className="text-sm text-red-500">{errors.targetCount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
