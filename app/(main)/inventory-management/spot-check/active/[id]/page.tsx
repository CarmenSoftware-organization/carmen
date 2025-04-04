"use client"

import { useState } from 'react';
import { 
  CheckCircle, 
  PauseCircle,
  ArrowLeft,
  User,
  Calendar,
  Store,
  Building2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CountDetailForm } from '../../components/count-detail-form';
import { mockCounts, mockProducts, mockLocations } from '@/lib/mock/inventory-data';
import { useRouter } from 'next/navigation';
import { SpotCheckNav } from '../../components/spot-check-nav';
import { CountItems } from '../../components/count-items';
import { CountItem } from '../../types';

interface PageProps {
  params: {
    id: string
  }
}

interface CountDetailData {
  items: {
    id: string;
    name: string;
    code: string;
    currentStock: number;
    actualCount: number;
    unit: string;
    status: 'good' | 'damaged' | 'missing' | 'expired';
    isSubmitted: boolean;
    variance?: number;
  }[];
  notes: string;
}

export default function ActiveCountPage({ params }: PageProps) {
  const router = useRouter();
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Get count session from mock data
  const countSession = mockCounts.find(count => count.id === params.id) || mockCounts[0];
  const countLocations = countSession.locations.map(locId => 
    mockLocations.find(loc => loc.id === locId)
  ).filter(loc => loc) as typeof mockLocations;
  
  // Convert mockProducts to CountItem type
  const countProducts: CountItem[] = mockProducts
    .filter(product => countSession.locations.includes(product.locationId))
    .map(product => {
      // Find the location for this product to get the department
      const location = mockLocations.find(loc => loc.id === product.locationId);
      const department = location?.responsibleDepartment || 'Kitchen';
      
      return {
        id: product.id,
        name: product.name,
        description: product.name, // Using name as description since Product doesn't have description
        expectedCount: product.currentStock || 0,
        department: department,
        code: product.code,
        category: product.category || 'General',
        currentStock: product.currentStock
      };
    });

  const handleSubmit = (data: CountDetailData) => {
    console.log('Count submitted:', data);
    // Here you would typically save the data to your backend
    router.push('/inventory-management/spot-check');
  };

  const handleClose = () => {
    router.push('/inventory-management/spot-check');
  };

  const steps = [
    { id: 1, name: 'Setup', description: 'Basic information' },
    { id: 2, name: 'Locations', description: 'Select areas to count' },
    { id: 3, name: 'Items', description: 'Choose items to count' },
    { id: 4, name: 'Count', description: 'Perform the count' },
    { id: 5, name: 'Review', description: 'Check and submit results' }
  ];

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleCountChange = (id: string, count: number) => {
    console.log(`Setting count for ${id} to ${count}`);
    // In a real app, you would update state here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Spot Checks
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center gap-2">
                <PauseCircle className="h-4 w-4" />
                Pause
              </Button>
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => setShowCompleteConfirm(true)}
              >
                <CheckCircle className="h-4 w-4" />
                Complete Count
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Counter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Counter</span>
                </div>
                <p className="font-medium">{countSession.counter}</p>
              </div>
              
              {/* Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <p className="font-medium">{countSession.startDate.toLocaleDateString()}</p>
              </div>
              
              {/* Reason */}
              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Reference</span>
                </div>
                <p className="font-medium">{countSession.id}</p>
              </div>
            </div>
          </div>
        </Card>

        <SpotCheckNav 
          currentStep={currentStep} 
          steps={steps}
          onChange={handleStepChange}
        />

        <div className="pt-6">
          {currentStep === 4 && (
            <CountItems 
              items={countProducts}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              onCountChange={handleCountChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}