'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  RefreshCw,
  DollarSign,
  Star,
  Truck,
  AlertCircle
} from 'lucide-react';

import { EnhancedPRItem, EnhancedItemsTabProps, VendorComparison, PriceHistoryEntry } from '@/lib/types/enhanced-pr-types';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';
import { PriceAlertBadge } from '../PriceAlertBadge';
import { VendorComparisonModal } from '../VendorComparisonModal';
import { PriceHistoryModal } from '../PriceHistoryModal';

export function EnhancedItemsTab({ 
  prId, 
  items, 
  onItemUpdate, 
  onPriceOverride, 
  onVendorCompare, 
  onPriceHistoryView,
  userRole,
  canEditPrices,
  canOverridePrices 
}: EnhancedItemsTabProps) {
  const [enhancedItems, setEnhancedItems] = useState<EnhancedPRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EnhancedPRItem | null>(null);
  const [showVendorComparison, setShowVendorComparison] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [vendorComparisons, setVendorComparisons] = useState<VendorComparison[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  useEffect(() => {
    loadEnhancedItems();
  }, [items, prId]);

  const loadEnhancedItems = async () => {
    try {
      setLoading(true);
      const enhanced = await prPriceAssignmentService.enhancePRItems(items, prId);
      setEnhancedItems(enhanced);
    } catch (error) {
      console.error('Error loading enhanced items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorComparison = async (item: EnhancedPRItem) => {
    try {
      setSelectedItem(item);
      const comparisons = await prPriceAssignmentService.getVendorComparison(item.id || '');
      setVendorComparisons(comparisons);
      setShowVendorComparison(true);
      onVendorCompare(item.id || '');
    } catch (error) {
      console.error('Error loading vendor comparison:', error);
    }
  };

  const handlePriceHistory = async (item: EnhancedPRItem) => {
    try {
      setSelectedItem(item);
      const history = await prPriceAssignmentService.getPriceHistory(item.id || '');
      setPriceHistory(history);
      setShowPriceHistory(true);
      onPriceHistoryView(item.id || '');
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const handlePriceOverride = async (item: EnhancedPRItem, newVendorId: string, newPrice: number, reason: string) => {
    try {
      const override = {
        id: `override-${Date.now()}`,
        originalVendorId: item.priceAssignment?.selectedVendor.id || '',
        originalVendorName: item.priceAssignment?.selectedVendor.name || '',
        originalPrice: item.priceAssignment?.assignedPrice || 0,
        newVendorId,
        newVendorName: vendorComparisons.find(v => v.vendorId === newVendorId)?.vendorName || '',
        newPrice,
        currency: item.priceAssignment?.currency || 'USD',
        reason,
        overriddenBy: 'current-user', // In real app, get from auth context
        overrideDate: new Date()
      };

      await prPriceAssignmentService.overrideItemPrice(item.id || '', override);
      onPriceOverride(item.id || '', override);
      
      // Refresh the item data
      await loadEnhancedItems();
      setShowVendorComparison(false);
    } catch (error) {
      console.error('Error overriding price:', error);
    }
  };

  const getAssignmentStatusBadge = (item: EnhancedPRItem) => {
    if (item.isAutoAssigned && item.priceAssignment) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Auto-Assigned
        </Badge>
      );
    } else if (item.isManualOverride) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <RefreshCw className="w-3 h-3 mr-1" />
          Manual Override
        </Badge>
      );
    } else if (item.assignmentStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    } else if (item.assignmentStatus === 'failed') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return null;
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let color = "bg-gray-100 text-gray-800";
    
    if (percentage >= 90) {
      color = "bg-green-100 text-green-800";
    } else if (percentage >= 70) {
      color = "bg-yellow-100 text-yellow-800";
    } else {
      color = "bg-red-100 text-red-800";
    }

    return (
      <Badge variant="outline" className={color}>
        {percentage}% Confidence
      </Badge>
    );
  };

  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked:', alert);
    // Handle alert click - could show detailed alert info
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await prPriceAssignmentService.acknowledgePriceAlert(alertId, 'current-user');
      // Refresh the enhanced items to update alert status
      await loadEnhancedItems();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading enhanced price data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Auto-Assigned</p>
                <p className="text-2xl font-bold">
                  {enhancedItems.filter(item => item.isAutoAssigned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Manual Override</p>
                <p className="text-2xl font-bold">
                  {enhancedItems.filter(item => item.isManualOverride).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {enhancedItems.filter(item => item.hasActiveAlerts).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Potential Savings</p>
                <p className="text-2xl font-bold">
                  ${enhancedItems.reduce((sum, item) => 
                    sum + (item.savingsOpportunity?.potentialSavings || 0), 0
                  ).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Assignment Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Price Assignment Actions</h3>
              <p className="text-sm text-gray-500">
                Trigger automatic price assignment or refresh current assignments
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={loadEnhancedItems}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await prPriceAssignmentService.triggerPriceAssignment(prId);
                    await loadEnhancedItems();
                  } catch (error) {
                    console.error('Error triggering price assignment:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Assign Prices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Request Items with Price Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Assigned Price</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enhancedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantityRequested}</TableCell>
                  <TableCell>
                    {item.priceAssignment ? (
                      <div>
                        <p className="font-medium">
                          ${item.priceAssignment.assignedPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.priceAssignment.currency}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.priceAssignment ? (
                      <div className="flex items-center space-x-2">
                        <span>{item.priceAssignment.selectedVendor.name}</span>
                        {item.priceAssignment.selectedVendor.isPreferred && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No vendor</span>
                    )}
                  </TableCell>
                  <TableCell>{getAssignmentStatusBadge(item)}</TableCell>
                  <TableCell>{getConfidenceBadge(item.assignmentConfidence)}</TableCell>
                  <TableCell>
                    {item.priceAlerts && item.priceAlerts.length > 0 && (
                      <PriceAlertBadge
                        alerts={item.priceAlerts}
                        onAlertClick={handleAlertClick}
                        onAcknowledge={handleAlertAcknowledge}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVendorComparison(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Compare Vendors</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePriceHistory(item)}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Price History</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Comparison Modal */}
      {selectedItem && (
        <VendorComparisonModal
          isOpen={showVendorComparison}
          onClose={() => setShowVendorComparison(false)}
          prItem={selectedItem}
          onVendorSelect={(vendorId) => {
            console.log('Vendor selected:', vendorId);
            // Handle vendor selection
          }}
          onPriceOverride={(override) => {
            onPriceOverride(selectedItem.id || '', override);
            loadEnhancedItems(); // Refresh data
          }}
        />
      )}

      {/* Price History Modal */}
      {selectedItem && (
        <PriceHistoryModal
          isOpen={showPriceHistory}
          onClose={() => setShowPriceHistory(false)}
          prItem={selectedItem}
          priceHistory={priceHistory}
        />
      )}
    </div>
  );
}