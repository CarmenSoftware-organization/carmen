'use client';

import { CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinalReviewProps {
  formData: {
    counterName: string;
    department: string;
    dateTime: Date;
    notes: string;
    selectedLocations: string[];
    items: any[];
  };
  onNext: () => void;
  onBack: () => void;
}

// Mock data - replace with actual data from API
const mockLocations = [
  {
    id: '1',
    name: 'Aisle A1',
    type: 'aisle',
    itemCount: 150,
  },
  {
    id: '2',
    name: 'Shelf B2',
    type: 'shelf',
    itemCount: 75,
  },
];

const equipment = [
  { id: 1, name: 'Handheld Scanner', status: true },
  { id: 2, name: 'Tablet Device', status: true },
  { id: 3, name: 'Printer', status: false },
  { id: 4, name: 'Labels', status: true },
];

const verificationPoints = [
  { id: 1, text: 'All locations are accessible', status: true },
  { id: 2, text: 'Equipment is fully charged', status: true },
  { id: 3, text: 'Backup devices available', status: false },
  { id: 4, text: 'Team members briefed', status: true },
];

export function FinalReview({ formData }: FinalReviewProps) {
  const selectedLocationDetails = mockLocations.filter((loc) =>
    formData.selectedLocations.includes(loc.id)
  );

  const totalItems = selectedLocationDetails.reduce(
    (sum, loc) => sum + loc.itemCount,
    0
  );

  const estimatedDuration = Math.ceil(totalItems / 100) * 30; // 30 minutes per 100 items

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Review</CardTitle>
          <CardDescription>
            Review all details before starting the physical count.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Counter Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
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
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipment Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <ul className="space-y-3">
                      {equipment.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          {item.status ? (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100/80">
                              <Check className="h-3 w-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                              <AlertCircle className="h-3 w-3" />
                              Check Required
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <ul className="space-y-3">
                      {selectedLocationDetails.map((location) => (
                        <li key={location.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{location.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {location.itemCount} items
                            </p>
                          </div>
                          <Badge>{location.type}</Badge>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Est. Duration</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {estimatedDuration} minutes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <ul className="space-y-3">
                      {verificationPoints.map((point) => (
                        <li key={point.id} className="flex items-center justify-between">
                          <span className="font-medium">{point.text}</span>
                          {point.status ? (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100/80">
                              <Check className="h-3 w-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          Start Physical Count
        </Button>
      </div>
    </div>
  );
}
