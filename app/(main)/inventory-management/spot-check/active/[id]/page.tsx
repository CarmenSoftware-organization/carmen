"use client"

import { useState } from 'react';
import { 
  CheckCircle, 
  PauseCircle,
  ChevronLeft,
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

  // Get count session from mock data
  const countSession = mockCounts.find(count => count.id === params.id) || mockCounts[0];
  const countLocations = countSession.locations.map(locId => 
    mockLocations.find(loc => loc.id === locId)
  ).filter(loc => loc) as typeof mockLocations;
  
  const countProducts = mockProducts.filter(product => 
    countSession.locations.includes(product.locationId)
  );

  const handleSubmit = (data: CountDetailData) => {
    console.log('Count submitted:', data);
    // Here you would typically save the data to your backend
    router.push('/inventory-management/spot-check');
  };

  const handleClose = () => {
    router.push('/inventory-management/spot-check');
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
              <ChevronLeft className="h-4 w-4" />
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

        <CountDetailForm
          items={countProducts.map(product => ({
            id: product.id,
            name: product.name,
            code: product.code,
            currentStock: product.currentStock,
            unit: product.uom || 'pcs'
          }))}
          locationName={countLocations[0]?.name || ''}
          userName={countSession.counter}
          date={countSession.startDate.toLocaleDateString()}
          reference={countSession.id}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}