'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  PauseCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { mockCounts, mockProducts, mockLocations, Product, Count } from '@/lib/mock/inventory-data';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PhysicalActiveCountPage({ params }: PageProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [counts, setCounts] = useState<Record<string, { count: number; status: string }>>({});
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Get count session from mock data
  const countSession = mockCounts.find(count => count.id === params.id && count.type === 'physical') || 
    mockCounts.find(count => count.type === 'physical')!;
    
  const countLocations = countSession.locations.map(locId => 
    mockLocations.find(loc => loc.id === locId)
  ).filter(loc => loc) as typeof mockLocations;
  
  // If no location is selected, use the first one
  if (!currentLocation && countLocations.length > 0) {
    setCurrentLocation(countLocations[0].id);
  }

  // Get products for current location
  const locationProducts = mockProducts.filter(product => 
    currentLocation ? product.locationId === currentLocation : countSession.locations.includes(product.locationId)
  );

  const handleCount = (itemId: string, data: { count?: number; status?: string }) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...data
      }
    }));
  };

  const CountHeader = () => (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">Physical Count: {countSession.id}</h1>
            <p className="text-sm text-gray-500">
              Started: {countSession.startDate.toLocaleString()} | Counter: {countSession.counter}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <PauseCircle className="h-4 w-4" />
              Pause Count
            </Button>
            <Button variant="default" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Count
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Duration: {Math.floor((new Date().getTime() - countSession.startDate.getTime()) / (1000 * 60))}m</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Progress: {Object.keys(counts).length}/{locationProducts.length} items</span>
          </div>
        </div>
      </div>
    </div>
  );

  const LocationBar = () => (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex space-x-4">
          {countLocations.map((loc) => (
            <div 
              key={loc.id}
              onClick={() => setCurrentLocation(loc.id)}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                loc.id === currentLocation ? 'bg-blue-50 border border-blue-200' : 'bg-white border'
              }`}
            >
              {loc.name}
              <Badge variant="secondary" className="ml-2">
                {mockProducts.filter(p => p.locationId === loc.id).length} items
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CountInterface = () => (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Location: {mockLocations.find(loc => loc.id === currentLocation)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationProducts.map(product => {
                const itemCount = counts[product.id] || { count: 0, status: '' };
                return (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.code}</p>
                      </div>
                      <Badge variant="secondary">
                        System: {product.currentStock} {product.uom}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Physical Count</Label>
                        <Input 
                          type="number" 
                          className="mt-1.5"
                          value={itemCount.count || ''}
                          onChange={(e) => handleCount(product.id, { count: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={itemCount.status}
                          onValueChange={(value) => handleCount(product.id, { status: value })}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="missing">Missing</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button>
                        Save Count
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Count Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(Object.keys(counts).length/locationProducts.length) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{Object.keys(counts).length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">
                    {locationProducts.length - Object.keys(counts).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountHeader />
      <LocationBar />
      <div className="max-w-7xl mx-auto">
        <CountInterface />
      </div>
    </div>
  );
}
