"use client";

import { format } from "date-fns";
import { Clock, MapPin, Package2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCountStore } from "@/lib/store/use-count-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mockLocations } from "@/lib/mock/hotel-data";

export default function ReviewPage() {
  const router = useRouter();
  const { currentSession, selectedLocations, selectedProducts, addActiveCount } = useCountStore();

  if (!currentSession || selectedLocations.length === 0 || selectedProducts.length === 0) {
    router.push("/inventory-management/spot-check/new/zones");
    return null;
  }

  const totalItems = selectedProducts.length;
  const totalValue = selectedProducts.reduce((sum, p) => sum + p.value, 0);
  const estimatedDuration = totalItems * 5; // 5 minutes per item

  const handleStartCount = () => {
    const countId = `CNT-${format(new Date(), 'yyyyMMdd')}-${Math.random().toString(36).substr(2, 5)}`;
    
    const newCount = {
      id: countId,
      counter: currentSession.counter,
      department: currentSession.department,
      startTime: format(new Date(), "yyyy-MM-dd HH:mm"),
      duration: "0m",
      locations: selectedLocations,
      status: "pending" as const,
      totalItems: selectedProducts.length,
      completedItems: 0,
      matches: 0,
      variances: 0,
      pending: selectedProducts.length
    };

    // Add to store
    addActiveCount(newCount);
    
    // Redirect directly to the count interface instead of the list
    router.push(`/inventory-management/spot-check/active/${countId}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Counter Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Counter Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="text-sm font-medium">
                  {currentSession.counter}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Department</dt>
                <dd className="text-sm font-medium capitalize">
                  {currentSession.department}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Reason</dt>
                <dd className="text-sm font-medium capitalize">
                  {currentSession.reason.replace('_', ' ')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd className="text-sm font-medium">
                  {format(currentSession.countDate, "PPP")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Time</dt>
                <dd className="text-sm font-medium">
                  {currentSession.startTime}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estimated Duration</dt>
                <dd className="text-sm font-medium">
                  {Math.floor(estimatedDuration / 60)} hours {estimatedDuration % 60} minutes
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Selected Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selected Locations ({selectedLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedLocations.map((locationId) => {
              const location = mockLocations.find(loc => loc.id === locationId);
              return (
                <div
                  key={locationId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{location?.name || locationId}</h4>
                    <p className="text-sm text-muted-foreground">
                      {location?.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {location?.type}
                    </Badge>
                    <Badge variant="outline">
                      {selectedProducts.filter(p => p.locationId === locationId).length} items
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Selected Items ({selectedProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {selectedLocations.map((locationId) => {
              const locationItems = selectedProducts.filter(
                (item) => item.locationId === locationId
              );

              if (locationItems.length === 0) return null;

              return (
                <div key={locationId} className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    {mockLocations.find(loc => loc.id === locationId)?.name || locationId}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.code}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">
                            {item.currentStock} {item.uom}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.value.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}

            <Separator />

            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="font-medium ml-8">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium ml-8">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button onClick={handleStartCount}>
                Start Count
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
