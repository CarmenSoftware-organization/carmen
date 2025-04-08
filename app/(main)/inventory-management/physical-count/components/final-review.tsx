'use client'

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockLocations, getProductsByLocation, Location } from '@/lib/mock/inventory-data';

interface CountItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity?: number;
}

interface FinalReviewProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
    selectedLocations: string[];
    items: CountItem[];
  };
}

export function FinalReview({ formData }: FinalReviewProps) {
  const router = useRouter();

  // Get location details
  const selectedLocationDetails = formData.selectedLocations
    .map((id: string) => mockLocations.find(loc => loc.id === id))
    .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined);

  // Get all products from selected locations
  const allProducts = formData.selectedLocations.flatMap((locationId: string) => 
    getProductsByLocation(locationId)
  );

  // Remove duplicates and get unique products
  const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());

  // Calculate statistics
  const totalItems = uniqueProducts.length;
  const totalLocations = selectedLocationDetails.length;
  const categories = Array.from(new Set(uniqueProducts.map(p => p.category)));
  const locationTypes = Array.from(new Set(selectedLocationDetails.map(l => l.type)));
  const estimatedDuration = Math.ceil(totalItems / 100) * 30; // 30 minutes per 100 items

  const handleStartCount = () => {
    const countId = `PC-${Date.now()}`;
    router.push(`/inventory-management/physical-count/active/${countId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Review</CardTitle>
        <CardDescription>
          Review all details before starting the physical count.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counter Details */}
        <div className="space-y-4">
          <h3 className="font-medium">Counter Details</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Counter Name</dt>
              <dd className="font-medium">{formData.counterName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Department</dt>
              <dd className="font-medium">{formData.department}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Date & Time</dt>
              <dd className="font-medium">
                {formData.dateTime.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Notes</dt>
              <dd className="font-medium">{formData.notes || 'None'}</dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* Count Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Count Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalLocations}</div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {locationTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-sm text-muted-foreground">Items</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  {categories.length} categories
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{estimatedDuration}</div>
                <p className="text-sm text-muted-foreground">Est. Minutes</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  ~{Math.ceil(estimatedDuration / 60)} hours
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Categories Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Categories Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const itemsInCategory = uniqueProducts.filter(p => p.category === category);
              return category ? (
                <div key={category} className="p-3 rounded-lg border">
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-muted-foreground">
                    {itemsInCategory.length} items
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <Separator />

        {/* Location List */}
        <div className="space-y-4">
          <h3 className="font-medium">Selected Locations</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {selectedLocationDetails.map((location) => {
                const locationProducts = getProductsByLocation(location.id);
                return (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.code} • {location.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Floor {location.floor} • {location.building || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {locationProducts.length} items
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            variant="default"
            onClick={handleStartCount}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Start Count
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
