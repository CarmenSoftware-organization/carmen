'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Award
} from 'lucide-react';

import { VendorComparisonModalProps, VendorComparison } from '@/lib/types/enhanced-pr-types';
import { asMockPurchaseRequestItem } from '@/lib/types';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

export function VendorComparisonModal({ 
  isOpen, 
  onClose, 
  prItem, 
  onVendorSelect, 
  onPriceOverride 
}: VendorComparisonModalProps) {
  const [vendorComparisons, setVendorComparisons] = useState<VendorComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorComparison | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  useEffect(() => {
    if (isOpen && prItem.id) {
      loadVendorComparisons();
    }
  }, [isOpen, prItem.id]);

  const loadVendorComparisons = async () => {
    try {
      setLoading(true);
      const comparisons = await prPriceAssignmentService.getVendorComparison(prItem.id || '');
      setVendorComparisons(comparisons);
    } catch (error) {
      console.error('Error loading vendor comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSelection = (vendor: VendorComparison) => {
    setSelectedVendor(vendor);
    setShowOverrideForm(true);
  };

  const handleOverrideSubmit = () => {
    if (!selectedVendor || !overrideReason.trim()) return;

    const override = {
      id: `override-${Date.now()}`,
      originalVendorId: prItem.priceAssignment?.selectedVendor.id || '',
      originalVendorName: prItem.priceAssignment?.selectedVendor.name || '',
      originalPrice: prItem.priceAssignment?.assignedPrice || 0,
      newVendorId: selectedVendor.vendorId,
      newVendorName: selectedVendor.vendorName,
      newPrice: selectedVendor.price,
      currency: selectedVendor.currency,
      reason: overrideReason,
      overriddenBy: 'current-user', // In real app, get from auth context
      overrideDate: new Date()
    };

    onPriceOverride(override);
    onVendorSelect(selectedVendor.vendorId);
    setShowOverrideForm(false);
    setOverrideReason('');
    onClose();
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Fair</Badge>;
    }
  };

  const currentVendor = prItem.priceAssignment?.selectedVendor;
  const bestSavings = vendorComparisons.length > 0 ? 
    Math.max(...vendorComparisons.map(v => v.savings)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Vendor Comparison - {asMockPurchaseRequestItem(prItem).name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading vendor comparisons...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Assignment Summary */}
            {currentVendor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Current Assignment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Vendor</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-medium">{currentVendor.name}</span>
                        {currentVendor.isPreferred && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Price</Label>
                      <p className="text-lg font-bold mt-1">
                        ${prItem.priceAssignment?.assignedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Confidence</Label>
                      <p className="mt-1">
                        {prItem.assignmentConfidence ? 
                          `${Math.round(prItem.assignmentConfidence * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assignment Reason</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {prItem.priceAssignment?.assignmentReason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Savings Opportunity Alert */}
            {bestSavings > 0 && (
              <Alert>
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  <strong>Savings Opportunity:</strong> You could save up to ${bestSavings.toFixed(2)} 
                  by switching to an alternative vendor.
                </AlertDescription>
              </Alert>
            )}

            {/* Vendor Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Available Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorComparisons.map((vendor) => {
                      const isCurrentVendor = vendor.vendorId === currentVendor?.id;
                      
                      return (
                        <TableRow 
                          key={vendor.vendorId}
                          className={isCurrentVendor ? 'bg-blue-50' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{vendor.vendorName}</span>
                              {vendor.isPreferred && (
                                <Star className="w-4 h-4 text-yellow-500" />
                              )}
                              {isCurrentVendor && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${vendor.price.toFixed(2)}
                            </span>
                            <p className="text-sm text-gray-500">{vendor.currency}</p>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${vendor.totalCost.toFixed(2)}
                            </span>
                            <p className="text-sm text-gray-500">
                              Qty: {asMockPurchaseRequestItem(prItem).quantityRequested}
                            </p>
                          </TableCell>
                          <TableCell>
                            {vendor.savings > 0 ? (
                              <div className="flex items-center space-x-1">
                                <TrendingDown className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 font-medium">
                                  ${vendor.savings.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({vendor.savingsPercentage.toFixed(1)}%)
                                </span>
                              </div>
                            ) : vendor.savings < 0 ? (
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 font-medium">
                                  +${Math.abs(vendor.savings).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{vendor.rating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Truck className="w-4 h-4 text-gray-500" />
                              <span>{vendor.leadTime} days</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAvailabilityBadge(vendor.availability)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {vendor.overallScore.toFixed(0)}
                              </span>
                              {getScoreBadge(vendor.overallScore)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {!isCurrentVendor && vendor.availability === 'available' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVendorSelection(vendor)}
                              >
                                Select
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detailed Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>Best Price</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vendorComparisons.length > 0 && (
                    <div>
                      <p className="font-medium">
                        {vendorComparisons.reduce((min, vendor) => 
                          vendor.price < min.price ? vendor : min
                        ).vendorName}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ${Math.min(...vendorComparisons.map(v => v.price)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>Highest Rated</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vendorComparisons.length > 0 && (
                    <div>
                      <p className="font-medium">
                        {vendorComparisons.reduce((max, vendor) => 
                          vendor.rating > max.rating ? vendor : max
                        ).vendorName}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold">
                          {Math.max(...vendorComparisons.map(v => v.rating)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>Fastest Delivery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vendorComparisons.length > 0 && (
                    <div>
                      <p className="font-medium">
                        {vendorComparisons.reduce((min, vendor) => 
                          vendor.leadTime < min.leadTime ? vendor : min
                        ).vendorName}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.min(...vendorComparisons.map(v => v.leadTime))} days
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Override Form Modal */}
        <Dialog open={showOverrideForm} onOpenChange={setShowOverrideForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Override Price Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedVendor && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Vendor</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Vendor:</Label>
                      <p className="font-medium">{selectedVendor.vendorName}</p>
                    </div>
                    <div>
                      <Label>Price:</Label>
                      <p className="font-medium">${selectedVendor.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Total Cost:</Label>
                      <p className="font-medium">${selectedVendor.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Savings:</Label>
                      <p className={`font-medium ${selectedVendor.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedVendor.savings > 0 ? '-' : '+'}${Math.abs(selectedVendor.savings).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="override-reason">Reason for Override *</Label>
                <Textarea
                  id="override-reason"
                  placeholder="Please provide a reason for overriding the automatic price assignment..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOverrideForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOverrideSubmit}
                  disabled={!overrideReason.trim()}
                >
                  Confirm Override
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}