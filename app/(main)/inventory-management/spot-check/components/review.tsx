import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, CalendarIcon, CheckCircle2, Clock, FileCheck, MapPin, User } from "lucide-react";
import { toast } from "sonner"
import type { Location } from '@/lib/mock/inventory-data';

'use client';


interface CountItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit?: string;
  expectedCount?: number;
  actualCount?: number;
  discrepancy?: number;
  hasDiscrepancy?: boolean;
  variancePercent?: number;
}

interface Item {
  id: string
  expectedCount: number
  name: string
  sku: string
}

interface FormData {
  counts: Record<string, number>
  name: string
  department: string
  dateTime?: Date
  notes?: string
}

interface ReviewProps {
  selectedItems: Item[]
  selectedLocations: Location[]
  onBack: () => void
  onSubmit: () => void
  formData: FormData
}

export function Review({ selectedItems, selectedLocations, onBack, onSubmit, formData }: ReviewProps) {
  const itemsWithCounts = selectedItems.map(item => {
    const count = formData.counts?.[item.id] || 0;
    const expected = item.expectedCount || 0;
    const discrepancy = count - expected;
    const variancePercent = expected === 0 ? 0 : (discrepancy / expected) * 100;
    
    return {
      ...item,
      actualCount: count,
      discrepancy,
      hasDiscrepancy: discrepancy !== 0,
      variancePercent
    };
  });

  const discrepancyItems = itemsWithCounts.filter(item => item.hasDiscrepancy);
  
  const handleConfirmCount = () => {
    toast.success("Spot check submitted successfully");
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Spot Check</CardTitle>
          <CardDescription>
            Review and confirm your spot check before submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">General Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Count Name:</span>
                  <span>{formData.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Department:</span>
                  <span>{formData.department}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{formData.dateTime ? format(formData.dateTime, 'PPP') : 'Not set'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>{formData.dateTime ? format(formData.dateTime, 'p') : 'Not set'}</span>
                </div>
                
                {formData.notes && (
                  <div className="pt-2">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Count Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{selectedItems.length}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Locations</p>
                  <p className="text-2xl font-bold">{selectedLocations.length}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Items with Discrepancy</p>
                  <p className="text-2xl font-bold">{discrepancyItems.length}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{Object.keys(formData.counts || {}).length}/{selectedItems.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Locations</h3>
              <span className="text-sm text-muted-foreground">{selectedLocations.length} locations selected</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((location) => (
                <div 
                  key={location.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted"
                >
                  <MapPin className="h-3 w-3" />
                  {location.name}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <span className="text-sm text-muted-foreground">{selectedItems.length} items selected</span>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-3">
                {itemsWithCounts.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                      
                      {item.hasDiscrepancy ? (
                        <div className={`py-1 px-2 rounded-md text-xs font-medium ${item.discrepancy < 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                          {item.discrepancy < 0 ? item.discrepancy : `+${item.discrepancy}`}
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Matched</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Expected</p>
                        <p className="font-medium">{item.expectedCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Actual</p>
                        <p className="font-medium">{item.actualCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={`font-medium ${item.discrepancy < 0 ? 'text-destructive' : item.discrepancy > 0 ? 'text-green-600' : ''}`}>
                          {item.variancePercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleConfirmCount}
            >
              Submit Count
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
