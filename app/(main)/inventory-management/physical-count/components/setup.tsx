'use client';

import { useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDepartments } from '@/lib/mock/inventory-data';

interface SetupProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhysicalCountSetup({ formData, setFormData, onNext, onBack }: SetupProps) {
  useEffect(() => {
    // Auto-fill counter name from user context
    setFormData((prev: any) => ({
      ...prev,
      counterName: 'John Doe', // Replace with actual user name from context
    }));
  }, [setFormData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isValid = formData.department && formData.dateTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Count Setup</CardTitle>
        <CardDescription>
          Enter the basic information needed to start a physical count.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counter Name */}
        <div className="space-y-2">
          <Label htmlFor="counterName">Counter Name</Label>
          <Input
            id="counterName"
            type="text"
            value={formData.counterName}
            disabled
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleInputChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {mockDepartments
                .filter(dept => dept.status === 'active')
                .map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date/Time */}
        <div className="space-y-2">
          <Label htmlFor="dateTime">
            Date & Time <span className="text-destructive">*</span>
          </Label>
          <DateTimePicker
            value={formData.dateTime}
            onChange={(value) => handleInputChange('dateTime', value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            className="min-h-[120px] resize-y"
          />
        </div>

        <div className="pt-4">
          <Button
            className="w-full"
            onClick={onNext}
            disabled={!isValid}
          >
            Continue to Location Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
