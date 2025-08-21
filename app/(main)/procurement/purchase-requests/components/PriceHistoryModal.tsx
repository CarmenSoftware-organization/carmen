'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  DollarSign,
  BarChart3,
  Download
} from 'lucide-react';

import { PriceHistoryModalProps, PriceHistoryEntry } from '@/lib/types/enhanced-pr-types';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

export function PriceHistoryModal({ 
  isOpen, 
  onClose, 
  prItem, 
  priceHistory: initialHistory 
}: PriceHistoryModalProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>(initialHistory || []);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    if (isOpen && prItem.id && !initialHistory?.length) {
      loadPriceHistory();
    } else if (initialHistory?.length) {
      setPriceHistory(initialHistory);
    }
  }, [isOpen, prItem.id, initialHistory]);

  const loadPriceHistory = async () => {
    try {
      setLoading(true);
      const history = await prPriceAssignmentService.getPriceHistory(prItem.id || '');
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return priceHistory;
    }

    return priceHistory.filter(entry => entry.date >= cutoffDate);
  };

  const getChangeIcon = (changePercentage: number) => {
    if (changePercentage > 0) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (changePercentage < 0) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeBadge = (changePercentage: number) => {
    if (changePercentage === 0) {
      return <Badge variant="secondary">No Change</Badge>;
    }

    const isIncrease = changePercentage > 0;
    const absChange = Math.abs(changePercentage);
    
    let severity = 'low';
    if (absChange >= 10) severity = 'high';
    else if (absChange >= 5) severity = 'medium';

    const colorClass = isIncrease 
      ? severity === 'high' ? 'bg-red-100 text-red-800' 
        : severity === 'medium' ? 'bg-orange-100 text-orange-800'
        : 'bg-yellow-100 text-yellow-800'
      : severity === 'high' ? 'bg-green-100 text-green-800'
        : severity === 'medium' ? 'bg-green-100 text-green-700'
        : 'bg-green-50 text-green-600';

    return (
      <Badge variant="outline" className={colorClass}>
        {isIncrease ? '+' : ''}{changePercentage.toFixed(1)}%
      </Badge>
    );
  };

  const calculateStats = () => {
    const filteredHistory = getFilteredHistory();
    if (filteredHistory.length === 0) return null;

    const prices = filteredHistory.map(entry => entry.price);
    const currentPrice = prices[0]; // Most recent price
    const oldestPrice = prices[prices.length - 1];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    const totalChange = oldestPrice > 0 ? ((currentPrice - oldestPrice) / oldestPrice) * 100 : 0;
    const volatility = prices.length > 1 ? 
      Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length) : 0;

    return {
      currentPrice,
      minPrice,
      maxPrice,
      avgPrice,
      totalChange,
      volatility,
      dataPoints: filteredHistory.length
    };
  };

  const exportData = () => {
    const filteredHistory = getFilteredHistory();
    const csvContent = [
      ['Date', 'Price', 'Currency', 'Vendor', 'Change %'].join(','),
      ...filteredHistory.map(entry => [
        entry.date.toISOString().split('T')[0],
        entry.price.toString(),
        entry.currency,
        entry.vendorName,
        entry.changePercentage.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-history-${prItem.name}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredHistory = getFilteredHistory();
  const stats = calculateStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Price History - {prItem.name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading price history...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div>
                  <label className="text-sm font-medium">Time Range:</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32 ml-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Current Price</p>
                        <p className="text-2xl font-bold">${stats.currentPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Price Range</p>
                        <p className="text-lg font-bold">
                          ${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Average Price</p>
                        <p className="text-2xl font-bold">${stats.avgPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      {stats.totalChange >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">Total Change</p>
                        <p className={`text-2xl font-bold ${stats.totalChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Price History Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Price History ({filteredHistory.length} entries)</span>
                  {stats && (
                    <Badge variant="outline">
                      Volatility: {stats.volatility.toFixed(2)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{entry.date.toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-lg">
                                ${entry.price.toFixed(2)}
                              </span>
                              <p className="text-sm text-gray-500">{entry.currency}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{entry.vendorName}</span>
                          </TableCell>
                          <TableCell>
                            {getChangeBadge(entry.changePercentage)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getChangeIcon(entry.changePercentage)}
                              {entry.changePercentage !== 0 && (
                                <span className={`text-sm ${
                                  entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {entry.changePercentage > 0 ? 'Increase' : 'Decrease'}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No price history data available for the selected time range</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Insights */}
            {stats && filteredHistory.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Price Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.totalChange > 10 && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Significant Price Increase</p>
                          <p className="text-sm text-red-700">
                            Price has increased by {stats.totalChange.toFixed(1)}% over the selected period. 
                            Consider reviewing vendor contracts or exploring alternatives.
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.totalChange < -10 && (
                      <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Favorable Price Decrease</p>
                          <p className="text-sm text-green-700">
                            Price has decreased by {Math.abs(stats.totalChange).toFixed(1)}% over the selected period. 
                            This represents good cost savings for your organization.
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.volatility > stats.avgPrice * 0.1 && (
                      <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">High Price Volatility</p>
                          <p className="text-sm text-yellow-700">
                            This item shows high price volatility. Consider negotiating fixed-price contracts 
                            or implementing price hedging strategies.
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.currentPrice === stats.minPrice && (
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Optimal Pricing</p>
                          <p className="text-sm text-blue-700">
                            Current price matches the lowest price in the selected period. 
                            This is an optimal time for procurement.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}