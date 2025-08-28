'use client';

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  Star, 
  Users, 
  Building, 
  Zap, 
  Crown, 
  Shield,
  ChevronRight,
  Info,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Percent
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { 
  SubscriptionPackage, 
  PackageType, 
  UserSubscription, 
  BillingCycle, 
  PackageComparison 
} from '@/lib/types/permission-subscriptions';
import { ResourceType } from '@/lib/types/permission-resources';
import { mockSubscriptionPackages, mockUserSubscriptions, createPackageComparison, calculateMonthlyPrice, calculateYearlyPrice, getYearlySavings } from '@/lib/mock-data/permission-subscriptions';

interface PackageSelectorProps {
  packages?: SubscriptionPackage[];
  currentSubscription?: UserSubscription;
  onPackageSelect?: (pkg: SubscriptionPackage) => void;
  onUpgrade?: (comparison: PackageComparison) => void;
  onDowngrade?: (comparison: PackageComparison) => void;
  selectedPackage?: SubscriptionPackage | null;
  showComparison?: boolean;
}

export function PackageSelector({ 
  packages = mockSubscriptionPackages, 
  currentSubscription = mockUserSubscriptions[0], 
  onPackageSelect, 
  onUpgrade, 
  onDowngrade, 
  selectedPackage, 
  showComparison = true 
}: PackageSelectorProps) {
  const [showFeatureDetails, setShowFeatureDetails] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(BillingCycle.YEARLY);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<PackageComparison | null>(null);
  const [activeTab, setActiveTab] = useState('packages');

  const currentPackage = useMemo(() => {
    if (!currentSubscription) return null;
    return packages.find(p => p.id === currentSubscription.packageId) || null;
  }, [packages, currentSubscription]);

  const getTierIcon = (type: PackageType) => {
    switch (type) {
      case PackageType.BASIC: return <Users className="h-5 w-5 text-blue-500" />;
      case PackageType.PROFESSIONAL: return <Building className="h-5 w-5 text-green-500" />;
      case PackageType.ENTERPRISE: return <Zap className="h-5 w-5 text-purple-500" />;
      case PackageType.CUSTOM: return <Crown className="h-5 w-5 text-amber-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTierBadge = (type: PackageType, isPopular = false) => {
    const baseClasses = "font-medium";
    switch (type) {
      case PackageType.BASIC: return <Badge variant="secondary" className={baseClasses}>Basic</Badge>;
      case PackageType.PROFESSIONAL: return (
        <div className="flex items-center gap-1">
          <Badge className="bg-green-100 text-green-800 border-green-200" >
            Professional
          </Badge>
          {isPopular && (
            <Badge className="bg-green-500 text-white">
              <Star className="h-3 w-3 mr-1" />Most Popular
            </Badge>
          )}
        </div>
      );
      case PackageType.ENTERPRISE: return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Enterprise</Badge>;
      case PackageType.CUSTOM: return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Custom</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getResourceDisplayName = (resource: ResourceType) => {
    return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatLimit = (value: number, suffix: string = '') => {
    if (value === -1) return 'Unlimited';
    if (value === 0) return 'Not included';
    return `${value.toLocaleString()}${suffix}`;
  };

  const formatMoney = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPriceForCycle = (pkg: SubscriptionPackage, cycle: BillingCycle) => {
    return pkg.pricing.find(p => p.billingCycle === cycle);
  };

  const handlePackageAction = (pkg: SubscriptionPackage) => {
    if (!currentPackage || !currentSubscription) {
      onPackageSelect?.(pkg);
      return;
    }

    if (pkg.id === currentPackage.id) {
      return; // Same package, no action needed
    }

    try {
      const comparison = createPackageComparison(currentPackage.id, pkg.id);
      setShowUpgradeDialog(comparison);
    } catch (error) {
      console.error('Error creating package comparison:', error);
    }
  };

  const handleUpgradeConfirm = () => {
    if (!showUpgradeDialog) return;
    
    const isUpgrade = showUpgradeDialog.costDifference.amount > 0;
    if (isUpgrade) {
      onUpgrade?.(showUpgradeDialog);
    } else {
      onDowngrade?.(showUpgradeDialog);
    }
    setShowUpgradeDialog(null);
  };

  const calculateUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    if (max === 0) return 100; // No allowance
    return Math.min((current / max) * 100, 100);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Current Subscription Info */}
        {currentSubscription && currentPackage && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTierIcon(currentPackage.type)}
                  <div>
                    <CardTitle className="text-lg">Current Subscription</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{currentPackage.name}</span>
                      {getTierBadge(currentPackage.type, currentPackage.isPopular)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatMoney(currentSubscription.currentPrice.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {currentSubscription.billingCycle}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Users</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {currentSubscription.currentUsage.activeUsers}/{formatLimit(currentPackage.features.maxUsers)}
                    </span>
                    <Progress 
                      value={calculateUsagePercentage(currentSubscription.currentUsage.activeUsers, currentPackage.features.maxUsers)} 
                      className="h-2 flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Storage</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {currentSubscription.currentUsage.storageUsedGB}GB/{formatLimit(currentPackage.features.storageLimit, 'GB')}
                    </span>
                    <Progress 
                      value={calculateUsagePercentage(currentSubscription.currentUsage.storageUsedGB, currentPackage.features.storageLimit)} 
                      className="h-2 flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">API Calls</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatLimit(currentSubscription.currentUsage.apiCallsMade)}/{formatLimit(currentPackage.features.apiCallsPerMonth)}
                    </span>
                    <Progress 
                      value={calculateUsagePercentage(currentSubscription.currentUsage.apiCallsMade, currentPackage.features.apiCallsPerMonth)} 
                      className="h-2 flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Next Billing</div>
                  <div className="font-medium">
                    {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              All Packages
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Compare Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            {/* Billing Cycle Selector */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Choose Your Plan
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedBillingCycle === BillingCycle.MONTHLY ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBillingCycle(BillingCycle.MONTHLY)}
                    >
                      Monthly
                    </Button>
                    <Button
                      variant={selectedBillingCycle === BillingCycle.YEARLY ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBillingCycle(BillingCycle.YEARLY)}
                      className="relative"
                    >
                      Yearly
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5">
                        Save up to 17%
                      </Badge>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {packages.map((pkg) => {
                    const pricing = getPriceForCycle(pkg, selectedBillingCycle);
                    const isCurrentPackage = currentPackage?.id === pkg.id;
                    const yearlySavings = getYearlySavings(pkg);
                    
                    return (
                      <div 
                        key={pkg.id} 
                        className={`relative rounded-lg border-2 p-6 hover:shadow-lg transition-all duration-200 ${
                          isCurrentPackage ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                        } ${pkg.isPopular ? 'border-green-500 shadow-sm' : ''}`}
                      >
                        {pkg.isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-green-500 text-white border-0">
                              <Star className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        
                        {isCurrentPackage && (
                          <div className="absolute -top-3 right-4">
                            <Badge className="bg-primary text-primary-foreground border-0">
                              <Check className="h-3 w-3 mr-1" />
                              Current
                            </Badge>
                          </div>
                        )}

                        <div className="space-y-6">
                          {/* Package Header */}
                          <div className="text-center space-y-3">
                            <div className="flex items-center justify-center">
                              {getTierIcon(pkg.type)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{pkg.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{pkg.description}</p>
                            </div>
                            <div className="flex justify-center">
                              {getTierBadge(pkg.type, pkg.isPopular)}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="text-center space-y-2">
                            {pricing ? (
                              <>
                                <div className="space-y-1">
                                  <div className="text-3xl font-bold">
                                    {formatMoney(pricing.price.amount)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    per {selectedBillingCycle}
                                  </div>
                                  {pricing.originalPrice && pricing.discountPercentage && (
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                      <span className="line-through text-muted-foreground">
                                        {formatMoney(pricing.originalPrice.amount)}
                                      </span>
                                      <Badge variant="destructive" className="text-xs">
                                        {pricing.discountPercentage}% OFF
                                      </Badge>
                                    </div>
                                  )}
                                  {selectedBillingCycle === BillingCycle.YEARLY && yearlySavings > 0 && (
                                    <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                                      <Percent className="h-3 w-3" />
                                      Save {yearlySavings}% annually
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-2xl font-bold text-muted-foreground">
                                Contact Sales
                              </div>
                            )}
                          </div>

                          {/* Key Features */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm border-b pb-2">Key Features</h4>
                            <ul className="space-y-2">
                              {pkg.highlights.slice(0, 5).map((highlight, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-1">{highlight}</span>
                                </li>
                              ))}
                              {pkg.highlights.length > 5 && (
                                <li className="text-sm text-muted-foreground pl-5">
                                  +{pkg.highlights.length - 5} more features
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Limits Summary */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm border-b pb-2">Limits</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center">
                                <div className="font-medium">{formatLimit(pkg.features.maxUsers)}</div>
                                <div className="text-muted-foreground">Users</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{formatLimit(pkg.features.maxLocations)}</div>
                                <div className="text-muted-foreground">Locations</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{formatLimit(pkg.features.storageLimit, 'GB')}</div>
                                <div className="text-muted-foreground">Storage</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">
                                  {pkg.features.apiCallsPerMonth === -1 ? '∞' : Math.round(pkg.features.apiCallsPerMonth / 1000) + 'K'}
                                </div>
                                <div className="text-muted-foreground">API Calls</div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                  <Info className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getTierIcon(pkg.type)}
                                    {pkg.name} - Complete Package Details
                                  </DialogTitle>
                                  <DialogDescription>{pkg.description}</DialogDescription>
                                </DialogHeader>
                                
                                <Tabs defaultValue="features" className="space-y-4">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="features">Features</TabsTrigger>
                                    <TabsTrigger value="modules">Modules</TabsTrigger>
                                    <TabsTrigger value="limits">Limits</TabsTrigger>
                                    <TabsTrigger value="support">Support</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="features" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="font-medium mb-3">All Features</h4>
                                        <div className="space-y-2">
                                          {pkg.highlights.map((highlight, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                              <span className="text-sm">{highlight}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-3">Use Cases</h4>
                                        <div className="space-y-2">
                                          {pkg.useCases.map((useCase, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                              <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                              <span className="text-sm">{useCase}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="modules" className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-3">
                                        Included Modules ({pkg.modules.length})
                                      </h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {pkg.modules.map((module) => (
                                          <Badge key={module} variant="outline" className="justify-center">
                                            {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="limits" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Usage Limits</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">Max Users</span>
                                            <span>{formatLimit(pkg.features.maxUsers)}</span>
                                          </div>
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">Max Locations</span>
                                            <span>{formatLimit(pkg.features.maxLocations)}</span>
                                          </div>
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">Max Departments</span>
                                            <span>{formatLimit(pkg.features.maxDepartments)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Resource Limits</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">Storage</span>
                                            <span>{formatLimit(pkg.features.storageLimit, 'GB')}</span>
                                          </div>
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">API Calls/Month</span>
                                            <span>{formatLimit(pkg.features.apiCallsPerMonth)}</span>
                                          </div>
                                          <div className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">Report Retention</span>
                                            <span>{formatLimit(pkg.features.reportRetentionDays, ' days')}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="support" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Support Features</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span>Support Level</span>
                                            <Badge variant="outline">{pkg.features.supportLevel}</Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Response Time</span>
                                            <span className="text-sm font-medium">{pkg.features.responseTime}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Phone Support</span>
                                            {pkg.features.phoneSupport ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Dedicated Manager</span>
                                            {pkg.features.dedicatedManager ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Training Included</span>
                                            {pkg.features.training ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Compliance & Security</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span>GDPR Compliance</span>
                                            {pkg.features.gdprCompliance ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>HIPAA Compliance</span>
                                            {pkg.features.hipaaCompliance ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Data Encryption</span>
                                            {pkg.features.dataEncryption ? (
                                              <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Backup Frequency</span>
                                            <span className="text-sm font-medium capitalize">{pkg.features.backupFrequency}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>

                            <Button 
                              onClick={() => handlePackageAction(pkg)}
                              className="w-full"
                              variant={isCurrentPackage ? "outline" : "default"}
                              disabled={isCurrentPackage}
                            >
                              {isCurrentPackage ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Current Plan
                                </>
                              ) : (
                                <>
                                  {currentPackage && (
                                    packages.findIndex(p => p.id === pkg.id) > packages.findIndex(p => p.id === currentPackage.id) ? (
                                      <>
                                        <ArrowUpRight className="h-4 w-4 mr-2" />
                                        Upgrade
                                      </>
                                    ) : (
                                      <>
                                        <ArrowDownRight className="h-4 w-4 mr-2" />
                                        Downgrade
                                      </>
                                    )
                                  )}
                                  {!currentPackage && (
                                    <>
                                      Select Plan
                                      <ChevronRight className="h-4 w-4 ml-2" />
                                    </>
                                  )}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Feature Comparison Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Detailed Feature Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Feature</th>
                        {packages.map((pkg) => (
                          <th key={pkg.id} className="text-center py-3 px-4 min-w-[140px]">
                            <div className="flex flex-col items-center gap-2">
                              {getTierIcon(pkg.type)}
                              <span className="text-sm font-medium">{pkg.name}</span>
                              {pkg.type === currentPackage?.type && (
                                <Badge variant="outline" className="text-xs">Current</Badge>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Usage Limits */}
                      <tr className="bg-muted/30">
                        <td colSpan={packages.length + 1} className="py-2 px-4 font-semibold text-sm">Usage Limits</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">Max Users</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center font-medium">
                            {formatLimit(pkg.features.maxUsers)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">Max Locations</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center font-medium">
                            {formatLimit(pkg.features.maxLocations)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">Storage</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center font-medium">
                            {formatLimit(pkg.features.storageLimit, 'GB')}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">API Calls/Month</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center font-medium">
                            {formatLimit(pkg.features.apiCallsPerMonth)}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Core Features */}
                      <tr className="bg-muted/30">
                        <td colSpan={packages.length + 1} className="py-2 px-4 font-semibold text-sm">Core Features</td>
                      </tr>
                      {[
                        { key: 'apiAccess', label: 'API Access' },
                        { key: 'webhookSupport', label: 'Webhook Support' },
                        { key: 'customWorkflows', label: 'Custom Workflows' },
                        { key: 'advancedReporting', label: 'Advanced Reporting' },
                        { key: 'realTimeAnalytics', label: 'Real-time Analytics' },
                        { key: 'multiCurrency', label: 'Multi-currency Support' },
                        { key: 'multiLanguage', label: 'Multi-language Support' },
                        { key: 'whiteLabel', label: 'White Label' }
                      ].map((feature) => (
                        <tr key={feature.key} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{feature.label}</td>
                          {packages.map((pkg) => (
                            <td key={pkg.id} className="py-3 px-4 text-center">
                              {pkg.features[feature.key as keyof typeof pkg.features] ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      
                      {/* Support Features */}
                      <tr className="bg-muted/30">
                        <td colSpan={packages.length + 1} className="py-2 px-4 font-semibold text-sm">Support & Service</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">Support Level</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center">
                            <Badge variant="outline" className="capitalize">{pkg.features.supportLevel}</Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">Response Time</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="py-3 px-4 text-center font-medium">
                            {pkg.features.responseTime}
                          </td>
                        ))}
                      </tr>
                      {[
                        { key: 'phoneSupport', label: 'Phone Support' },
                        { key: 'dedicatedManager', label: 'Dedicated Manager' },
                        { key: 'training', label: 'Training Included' }
                      ].map((feature) => (
                        <tr key={feature.key} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{feature.label}</td>
                          {packages.map((pkg) => (
                            <td key={pkg.id} className="py-3 px-4 text-center">
                              {pkg.features[feature.key as keyof typeof pkg.features] ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      
                      {/* Security & Compliance */}
                      <tr className="bg-muted/30">
                        <td colSpan={packages.length + 1} className="py-2 px-4 font-semibold text-sm">Security & Compliance</td>
                      </tr>
                      {[
                        { key: 'ssoIntegration', label: 'SSO Integration' },
                        { key: 'mfaRequired', label: 'MFA Required' },
                        { key: 'ipRestrictions', label: 'IP Restrictions' },
                        { key: 'auditLog', label: 'Audit Logs' },
                        { key: 'dataEncryption', label: 'Data Encryption' },
                        { key: 'gdprCompliance', label: 'GDPR Compliance' },
                        { key: 'hipaaCompliance', label: 'HIPAA Compliance' }
                      ].map((feature) => (
                        <tr key={feature.key} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{feature.label}</td>
                          {packages.map((pkg) => (
                            <td key={pkg.id} className="py-3 px-4 text-center">
                              {pkg.features[feature.key as keyof typeof pkg.features] ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-400 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade/Downgrade Confirmation Dialog */}
        <AlertDialog open={!!showUpgradeDialog} onOpenChange={() => setShowUpgradeDialog(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {showUpgradeDialog && (
                  <>
                    {showUpgradeDialog.costDifference.amount > 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-orange-500" />
                    )}
                    {showUpgradeDialog.costDifference.amount > 0 ? 'Upgrade' : 'Downgrade'} Subscription
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {showUpgradeDialog && (
                  <div className="space-y-4">
                    <p>
                      {showUpgradeDialog.costDifference.amount > 0 
                        ? 'Upgrade your subscription to unlock additional features and higher limits.' 
                        : 'Downgrade your subscription to reduce costs.'}
                    </p>
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Plan Change:</span>
                        <span>
                          {showUpgradeDialog.currentPackage.name} → {showUpgradeDialog.targetPackage.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cost Difference:</span>
                        <span className={`font-bold ${
                          showUpgradeDialog.costDifference.amount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {showUpgradeDialog.costDifference.amount > 0 ? '+' : ''}
                          {formatMoney(showUpgradeDialog.costDifference.amount)}/month
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Effective Date:</span>
                        <span>{showUpgradeDialog.effectiveDate.toLocaleDateString()}</span>
                      </div>
                      {showUpgradeDialog.prorationAmount && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Proration:</span>
                          <span>{formatMoney(showUpgradeDialog.prorationAmount.amount)}</span>
                        </div>
                      )}
                    </div>
                    
                    {showUpgradeDialog.addedFeatures.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Added Features:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {showUpgradeDialog.addedFeatures.map((feature, index) => (
                            <li key={index} className="text-green-700">{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {showUpgradeDialog.downgradeWarnings && showUpgradeDialog.downgradeWarnings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-orange-600">Important Notes:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {showUpgradeDialog.downgradeWarnings.map((warning, index) => (
                            <li key={index} className="text-orange-700">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {showUpgradeDialog.migrationRequired && (
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium text-orange-800">Migration Required</div>
                            <div className="text-orange-700 mt-1">
                              Estimated time: {showUpgradeDialog.estimatedMigrationTime}
                            </div>
                            {showUpgradeDialog.dataBackupRequired && (
                              <div className="text-orange-700 mt-1">
                                A data backup will be created before the migration.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpgradeConfirm}>
                {showUpgradeDialog && (
                  showUpgradeDialog.costDifference.amount > 0 ? 'Upgrade Now' : 'Downgrade Now'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}