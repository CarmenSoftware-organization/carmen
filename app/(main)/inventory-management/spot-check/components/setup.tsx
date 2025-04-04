'use client';

import { useEffect, useState } from 'react';
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

// Create a mock function to replace missing import
interface Department {
  id: string;
  name: string;
}

function getInventoryDepartments(): Department[] {
  return [
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'storage', name: 'Storage' },
    { id: 'bar', name: 'Bar' }, 
    { id: 'restaurant', name: 'Restaurant' }
  ];
}

interface SpotCheckFormData {
  name: string;
  department: string;
  description: string;
  targetCount: string;
  selectedItems: string[];
  selectedLocations: string[];
  dateTime?: Date;
  notes?: string;
  counts?: Record<string, number>;
  [key: string]: string | string[] | Record<string, number> | Date | undefined;
}

interface SpotCheckSetupProps {
  formData: SpotCheckFormData;
  setFormData: (data: SpotCheckFormData) => void;
  onNext: () => void;
  onBack: () => void;
  onStartCount: () => void;
}

export function SpotCheckSetup({ formData, setFormData, onNext, onBack, onStartCount }: SpotCheckSetupProps) {
  const { user } = useUser();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const departments = getInventoryDepartments();

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        department: user.department || '',
      });
    }
  }, [user, setFormData, formData]);

  const handleInputChange = (field: keyof SpotCheckFormData, value: string | Date) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.targetCount || parseInt(formData.targetCount, 10) <= 0) {
      newErrors.targetCount = 'Target count must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext();
    }
  };

  const isValid = formData.department && formData.dateTime && formData.targetCount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spot Check Setup</CardTitle>
          <CardDescription>
            Enter the basic information needed to start a spot check count.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Spot Check Name</Label>
                <Input
                  id="name"
                  placeholder="Enter a name for this spot check"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger id="department" className={errors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter a description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetCount">Target Count</Label>
              <Input
                id="targetCount"
                type="number"
                min="1"
                placeholder="How many items to count?"
                value={formData.targetCount}
                onChange={(e) => handleInputChange('targetCount', e.target.value)}
              />
              {errors.targetCount && <p className="text-sm text-destructive">{errors.targetCount}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTime">
                Date & Time <span className="text-destructive">*</span>
              </Label>
              {/* Date Time Picker is mocked for simplicity */}
              <Input
                id="dateTime"
                type="datetime-local"
                value={formData.dateTime instanceof Date ? formData.dateTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('dateTime', new Date(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or instructions..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
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
                type="submit"
                disabled={!isValid}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
