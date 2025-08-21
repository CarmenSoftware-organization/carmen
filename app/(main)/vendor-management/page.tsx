'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  BarChart3, 
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Link2
} from 'lucide-react';

export default function VendorManagementPage() {
  const quickStats = {
    totalVendors: 25,
    activeContracts: 18,
    priceUpdatesThisMonth: 45,
    pendingApprovals: 3
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage vendors, contracts, and pricing across your supply chain
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {quickStats.activeContracts} active contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Updates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.priceUpdatesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.activeContracts}</div>
            <p className="text-xs text-green-600">
              All up to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {quickStats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Vendor Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Manage Vendors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, and manage vendor profiles, contacts, and certifications
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{quickStats.totalVendors} vendors</Badge>
              <Link href="/vendor-management/manage-vendors">
                <Button variant="outline" size="sm">
                  Manage
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Existing Price Lists */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Price Lists</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage vendor price lists and product catalogs
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Updated weekly</Badge>
              <Link href="/vendor-management/pricelists">
                <Button variant="outline" size="sm">
                  View Lists
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Templates - Prototype */}
        <Card className="hover:shadow-lg transition-shadow border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <span>Pricelist Templates</span>
              <Badge className="bg-orange-100 text-orange-700">Prototype</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              UI prototype for pricelist template management and configuration
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Demo Only
              </Badge>
              <Link href="/vendor-management/templates">
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  View Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns - Prototype */}
        <Card className="hover:shadow-lg transition-shadow border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span>Pricing Campaigns</span>
              <Badge className="bg-orange-100 text-orange-700">Prototype</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              UI prototype for request for pricing campaign management
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Demo Only
              </Badge>
              <Link href="/vendor-management/campaigns">
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  View Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>


        {/* Analytics & Reports */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics & Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vendor performance analytics and procurement insights
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Coming Soon</Badge>
              <Button variant="outline" size="sm" disabled>
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Status */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-orange-600" />
            <span>Price Management Development Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">Vendor Management</h4>
              <p className="text-sm text-muted-foreground">
                ✅ Fully implemented and production-ready
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold">Price Management</h4>
              <p className="text-sm text-muted-foreground">
                🚧 UI prototypes with mock data only
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">Future Features</h4>
              <p className="text-sm text-muted-foreground">
                📅 Advanced automation and AI planned
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Link href="/vendor-management/vendor-portal/sample">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <FileText className="h-4 w-4 mr-2" />
                Try Price Entry Demo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}