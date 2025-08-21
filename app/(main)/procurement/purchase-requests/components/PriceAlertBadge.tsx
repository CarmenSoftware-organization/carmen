'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

import { PriceAlertBadgeProps, PriceAlert } from '@/lib/types/enhanced-pr-types';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

export function PriceAlertBadge({ alerts, onAlertClick, onAcknowledge }: PriceAlertBadgeProps) {
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.isAcknowledged);
  const highSeverityAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'high');
  const mediumSeverityAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'medium');
  const lowSeverityAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'low');

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAcknowledging(alertId);
      await prPriceAssignmentService.acknowledgePriceAlert(alertId, 'current-user');
      onAcknowledge(alertId);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    } finally {
      setAcknowledging(null);
    }
  };

  const getAlertIcon = (alert: PriceAlert) => {
    switch (alert.type) {
      case 'price_increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'price_decrease':
        return <TrendingDown className="w-4 h-4" />;
      case 'vendor_unavailable':
        return <X className="w-4 h-4" />;
      case 'price_volatility':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (alert: PriceAlert) => {
    if (alert.isAcknowledged) {
      return 'bg-gray-100 text-gray-600';
    }

    switch (alert.severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeVariant = () => {
    if (highSeverityAlerts.length > 0) {
      return 'destructive';
    } else if (mediumSeverityAlerts.length > 0) {
      return 'default';
    } else {
      return 'secondary';
    }
  };

  const getBadgeText = () => {
    const total = unacknowledgedAlerts.length;
    if (total === 0) return null;
    
    if (highSeverityAlerts.length > 0) {
      return `${highSeverityAlerts.length} Critical Alert${highSeverityAlerts.length > 1 ? 's' : ''}`;
    } else if (mediumSeverityAlerts.length > 0) {
      return `${mediumSeverityAlerts.length} Alert${mediumSeverityAlerts.length > 1 ? 's' : ''}`;
    } else {
      return `${lowSeverityAlerts.length} Notice${lowSeverityAlerts.length > 1 ? 's' : ''}`;
    }
  };

  const badgeText = getBadgeText();
  if (!badgeText) return null;

  return (
    <Dialog open={showAlertsModal} onOpenChange={setShowAlertsModal}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant={getBadgeVariant()} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowAlertsModal(true)}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {badgeText}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view price alerts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Price Alerts ({alerts.length})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highSeverityAlerts.length > 0 && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Critical Alerts</p>
                      <p className="text-2xl font-bold text-red-600">{highSeverityAlerts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {mediumSeverityAlerts.length > 0 && (
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Medium Alerts</p>
                      <p className="text-2xl font-bold text-orange-600">{mediumSeverityAlerts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {lowSeverityAlerts.length > 0 && (
              <Card className="border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Low Priority</p>
                      <p className="text-2xl font-bold text-yellow-600">{lowSeverityAlerts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getAlertColor(alert)} ${alert.isAcknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{alert.message}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.isAcknowledged && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                      
                      <AlertDescription className="text-sm mb-2">
                        <strong>Impact:</strong> {alert.impact}
                      </AlertDescription>
                      
                      <AlertDescription className="text-sm mb-2">
                        <strong>Recommended Action:</strong> {alert.recommendedAction}
                      </AlertDescription>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>Detected: {alert.detectedDate.toLocaleDateString()}</span>
                        <span>Effective: {alert.effectiveDate.toLocaleDateString()}</span>
                        {alert.acknowledgedBy && (
                          <span>Acknowledged by: {alert.acknowledgedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlertClick(alert)}
                    >
                      View Details
                    </Button>
                    
                    {!alert.isAcknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={acknowledging === alert.id}
                      >
                        {acknowledging === alert.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          'Acknowledge'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No price alerts at this time</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}