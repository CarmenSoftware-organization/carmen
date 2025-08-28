'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  Settings,
  TrendingUp,
  Receipt,
  Bell,
  Shield,
  Wallet,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';

import { 
  UserSubscription, 
  PaymentRecord, 
  BillingCycle,
  PackageType,
  SubscriptionStatus
} from '@/lib/types/permission-subscriptions';
import { mockCurrentSubscription, mockPaymentHistory } from '@/lib/mock-data/permission-subscriptions';

// Extended mock data for billing
const mockBillingInfo = {
  nextBillingDate: new Date('2024-09-15'),
  paymentMethod: {
    type: 'card' as const,
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true
  },
  billingAddress: {
    line1: '123 Restaurant Ave',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postal: '94105',
    country: 'US'
  },
  taxRate: 8.75,
  invoiceSettings: {
    autoSend: true,
    emailRecipients: ['billing@restaurant.com', 'finance@restaurant.com'],
    daysBefore: 3
  }
};

interface BillingPaymentInfoProps {
  subscription?: UserSubscription;
  paymentHistory?: PaymentRecord[];
  onPaymentMethodUpdate?: (method: any) => void;
  onBillingAddressUpdate?: (address: any) => void;
  onInvoiceSettingsUpdate?: (settings: any) => void;
  onDownloadInvoice?: (invoiceId: string) => void;
  className?: string;
}

export function BillingPaymentInfo({
  subscription = mockCurrentSubscription,
  paymentHistory = mockPaymentHistory,
  onPaymentMethodUpdate,
  onBillingAddressUpdate,
  onInvoiceSettingsUpdate,
  onDownloadInvoice,
  className = ""
}: BillingPaymentInfoProps) {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [isInvoiceSettingsOpen, setIsInvoiceSettingsOpen] = useState(false);

  // Calculate billing metrics
  const billingMetrics = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const yearlyPayments = paymentHistory.filter(p => 
      p.date >= yearStart && p.status === 'paid'
    );
    const monthlyPayments = paymentHistory.filter(p => 
      p.date >= monthStart && p.status === 'paid'
    );

    const yearlyTotal = yearlyPayments.reduce((sum, p) => sum + p.amount.amount, 0);
    const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + p.amount.amount, 0);
    const avgMonthly = yearlyPayments.length > 0 ? yearlyTotal / 12 : 0;

    const failedPayments = paymentHistory.filter(p => p.status === 'failed').length;
    const totalPayments = paymentHistory.length;
    const successRate = totalPayments > 0 ? ((totalPayments - failedPayments) / totalPayments) * 100 : 100;

    return {
      yearlyTotal,
      monthlyTotal,
      avgMonthly,
      successRate,
      failedPayments,
      nextPayment: subscription.nextBillingDate,
      daysUntilNext: Math.ceil((subscription.nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [paymentHistory, subscription]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'refunded': return <ArrowUpDown className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Billing Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscription.currentPrice.amount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in {billingMetrics.daysUntilNext} days
            </p>
            <div className="mt-2">
              <Progress 
                value={Math.max(0, 100 - (billingMetrics.daysUntilNext / 30) * 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${billingMetrics.monthlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.billingCycle} billing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${billingMetrics.yearlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg ${billingMetrics.avgMonthly.toFixed(2)}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingMetrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {billingMetrics.failedPayments} failed payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payment-method" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
          <TabsTrigger value="billing-address">Billing Address</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Invoice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-method" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your default payment method and billing preferences
                  </CardDescription>
                </div>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Payment Method</DialogTitle>
                      <DialogDescription>
                        Add or update your payment method for subscription billing
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsPaymentDialogOpen(false)}>
                          Update Payment Method
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{mockBillingInfo.paymentMethod.brand}</span>
                    <span className="text-muted-foreground">
                      {showCardDetails ? `4242 4242 4242 ${mockBillingInfo.paymentMethod.last4}` : `•••• ${mockBillingInfo.paymentMethod.last4}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      className="h-6 w-6 p-0"
                    >
                      {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge variant="secondary">
                    Default
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Expires: {mockBillingInfo.paymentMethod.expiryMonth}/{mockBillingInfo.paymentMethod.expiryYear}</p>
                <p>Next charge: ${subscription.currentPrice.amount.toFixed(2)} on {billingMetrics.nextPayment.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-address" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>
                    Address used for billing and tax calculations
                  </CardDescription>
                </div>
                <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Billing Address</DialogTitle>
                      <DialogDescription>
                        Update your billing address for accurate tax calculations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="line1">Address Line 1</Label>
                        <Input id="line1" defaultValue={mockBillingInfo.billingAddress.line1} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                        <Input id="line2" defaultValue={mockBillingInfo.billingAddress.line2} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" defaultValue={mockBillingInfo.billingAddress.city} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Select defaultValue={mockBillingInfo.billingAddress.state}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postal">Postal Code</Label>
                          <Input id="postal" defaultValue={mockBillingInfo.billingAddress.postal} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select defaultValue={mockBillingInfo.billingAddress.country}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsBillingDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsBillingDialogOpen(false)}>
                          Update Address
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="font-medium">Carmen Restaurant Group</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{mockBillingInfo.billingAddress.line1}</p>
                  {mockBillingInfo.billingAddress.line2 && (
                    <p>{mockBillingInfo.billingAddress.line2}</p>
                  )}
                  <p>{mockBillingInfo.billingAddress.city}, {mockBillingInfo.billingAddress.state} {mockBillingInfo.billingAddress.postal}</p>
                  <p>{mockBillingInfo.billingAddress.country}</p>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <span>{mockBillingInfo.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Invoice Total:</span>
                  <span>${(subscription.currentPrice.amount * (1 + mockBillingInfo.taxRate / 100)).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View all past payments and download invoices
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(payment.status)}`} />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className="font-medium">
                            ${payment.amount.amount.toFixed(2)} {payment.amount.currency}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.date.toLocaleDateString()} • {payment.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paymentMethod} {payment.invoiceId && `• Invoice: ${payment.invoiceId}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {payment.invoiceId && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDownloadInvoice?.(payment.invoiceId!)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Settings</CardTitle>
                  <CardDescription>
                    Configure invoice delivery and notification preferences
                  </CardDescription>
                </div>
                <Dialog open={isInvoiceSettingsOpen} onOpenChange={setIsInvoiceSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invoice Settings</DialogTitle>
                      <DialogDescription>
                        Configure how you receive invoices and payment notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Auto-send Invoices</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically send invoices when generated
                            </p>
                          </div>
                          <Switch defaultChecked={mockBillingInfo.invoiceSettings.autoSend} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Notification Timing</Label>
                          <Select defaultValue={mockBillingInfo.invoiceSettings.daysBefore.toString()}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 day before</SelectItem>
                              <SelectItem value="3">3 days before</SelectItem>
                              <SelectItem value="7">1 week before</SelectItem>
                              <SelectItem value="14">2 weeks before</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Email Recipients</Label>
                          <div className="space-y-2">
                            {mockBillingInfo.invoiceSettings.emailRecipients.map((email, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input value={email} readOnly />
                                <Button variant="outline" size="sm">Remove</Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full">
                              Add Email Recipient
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsInvoiceSettingsOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsInvoiceSettingsOpen(false)}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Payment Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified {mockBillingInfo.invoiceSettings.daysBefore} days before each payment
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Auto-send Invoices</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically email invoices when generated
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={mockBillingInfo.invoiceSettings.autoSend} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invoice Recipients</Label>
                  <div className="space-y-2">
                    {mockBillingInfo.invoiceSettings.emailRecipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{email}</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}