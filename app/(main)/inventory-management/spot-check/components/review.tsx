'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getLocationsByDepartment } from '@/lib/mock-data/users';
import { getProductsByDepartment } from '@/lib/mock-data/inventory';
import type { Location } from '@/lib/types/user';
import type { Product } from '@/lib/types';

interface ReviewProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
    targetCount: string;
    selectedLocations: string[];
    selectedItems: string[];
  };
  onNext: () => void;
  onBack: () => void;
  onStartCount: () => void;
}

export function Review({ formData, onNext, onBack, onStartCount }: ReviewProps) {
  const locations = useMemo(() => {
    const departmentLocations = getLocationsByDepartment(formData.department);
    return departmentLocations.filter(loc => 
      formData.selectedLocations.includes(loc.id)
    );
  }, [formData.department, formData.selectedLocations]);

  const items = useMemo(() => {
    const departmentItems = getProductsByDepartment(formData.department);
    return departmentItems.filter(item => 
      formData.selectedItems.includes(item.id)
    );
  }, [formData.department, formData.selectedItems]);

  const totalValue = useMemo(() => 
    items.reduce((sum, item) => sum + item.value, 0)
  , [items]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Review Spot Check</h2>
        <p className="text-sm text-muted-foreground">
          Review the details of your spot check before starting.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Counter</dt>
                  <dd>{formData.counterName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Department</dt>
                  <dd>{formData.department}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Date & Time</dt>
                  <dd>{format(formData.dateTime, 'PPpp')}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium mb-2">Count Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Target Count</dt>
                  <dd>{formData.targetCount} items</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Selected Items</dt>
                  <dd>{items.length} items</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Total Value</dt>
                  <dd>${totalValue.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Locations */}
      <div>
        <h3 className="font-medium mb-2">Selected Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-muted-foreground">{location.code}</p>
                  </div>
                  <Badge>{location.type}</Badge>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Floor:</span>{' '}
                  {location.floor}
                  {location.building && (
                    <>, <span className="text-muted-foreground">Building:</span> {location.building}</>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Items */}
      <div>
        <h3 className="font-medium mb-2">Selected Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.code}</p>
                  </div>
                  <Badge>{item.category}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="text-muted-foreground">Stock:</span>{' '}
                    {item.currentStock} {item.uom}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Value:</span>{' '}
                    ${item.value.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div>
          <h3 className="font-medium mb-2">Notes</h3>
          <Card>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap">{formData.notes}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
          >
            Start Count
          </Button>
          <Button onClick={onNext}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
