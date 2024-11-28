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
import { useUser } from '@/lib/context/user-context';

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
  onStartCount: () => void;
}

const targetCounts = [
  { value: '10', label: '10 Items' },
  { value: '20', label: '20 Items' },
  { value: '30', label: '30 Items' },
  { value: '50', label: '50 Items' },
  { value: 'custom', label: 'Custom Amount' },
];

const departments = [
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Front Office", label: "Front Office" },
  { value: "Spa & Recreation", label: "Spa & Recreation" },
];

export function SpotCheckSetup({ formData, setFormData, onNext, onBack, onStartCount }: SpotCheckSetupProps) {
  const { user } = useUser();

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
  };

  const isValid = formData.department && formData.dateTime && formData.targetCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spot Check Setup</CardTitle>
        <CardDescription>
          Enter the basic information needed to start a spot check count.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counter Name */}
        <div className="space-y-2">
          <Label htmlFor="counterName">Counter Name</Label>
          <Input
            id="counterName"
            type="text"
            value={formData.counterName || user?.name || ''}
            disabled
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.department || user?.department || ''}
            onValueChange={(value) => handleInputChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
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

        {/* Target Count */}
        <div className="space-y-2">
          <Label htmlFor="targetCount">
            Target Count <span className="text-destructive">*</span>
          </Label>
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
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or instructions..."
            className="min-h-[100px]"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-0">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onStartCount}
              disabled={!isValid}
            >
              Start Count
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
