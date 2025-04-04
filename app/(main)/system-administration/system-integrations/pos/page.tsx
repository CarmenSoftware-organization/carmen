"use client";

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  ArrowRight, 
  BarChart, 
  Cable, 
  Database, 
  FileText, 
  Map, 
  RefreshCcw, 
  Settings, 
  ShoppingCart,
  Settings2,
  ChevronDown,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  FileBarChart2,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function POSIntegrationPage() {
  const [selectedPOS, setSelectedPOS] = useState("")
  
  // Mock data for status indicators
  const systemStatus = {
    connected: true,
    lastSync: "Today at 14:32",
    unmappedItems: 12,
    failedTransactions: 3,
    pendingApprovals: 5
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to System Integrations</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">POS Integration</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/system-administration/system-integrations/pos/settings/config">
                  POS Configuration
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/system-administration/system-integrations/pos/settings/system">
                  System Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" asChild>
            <Link href="/system-administration/system-integrations/pos/transactions">
              <Eye className="h-4 w-4 mr-2" />
              View Transactions
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mt-1">
        Configure and manage point-of-sale system integrations
      </p>
      
      {/* System Status Section */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </span>
              {systemStatus.connected ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Last synchronized: {systemStatus.lastSync}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemStatus.unmappedItems > 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{systemStatus.unmappedItems} Unmapped Items</span>
                    <Button size="sm" variant="outline" asChild className="h-7 px-2 text-xs">
                      <Link href="/system-administration/system-integrations/pos/mapping/recipes">
                        Map Items
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {systemStatus.failedTransactions > 0 && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{systemStatus.failedTransactions} Failed Transactions</span>
                    <Button size="sm" variant="outline" asChild className="h-7 px-2 text-xs">
                      <Link href="/system-administration/system-integrations/pos/transactions?filter=failed">
                        Review
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {systemStatus.pendingApprovals > 0 && (
                <Alert className="bg-blue-50 border-blue-200">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{systemStatus.pendingApprovals} Pending Approvals</span>
                    <Button size="sm" variant="outline" asChild className="h-7 px-2 text-xs">
                      <Link href="/system-administration/system-integrations/pos/transactions/stock-out-review">
                        Approve
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Category Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SETUP Section */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Setup</span>
            </CardTitle>
            <CardDescription>
              Configure POS system integration and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">POS Configuration</h3>
                  <p className="text-xs text-muted-foreground">API settings and connection details</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/settings/config">
                    Configure
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">System Settings</h3>
                  <p className="text-xs text-muted-foreground">Workflow and notification preferences</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/settings/system">
                    Settings
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Connection Status</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs">Connected to Comanche POS</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/settings/config">
                Go to Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* MAPPING Section */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <span>Mapping</span>
            </CardTitle>
            <CardDescription>
              Map POS data to system entities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Recipe Mapping</h3>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.unmappedItems > 0 ? (
                      <span className="text-amber-600 font-medium">{systemStatus.unmappedItems} items need mapping</span>
                    ) : (
                      "Map POS items to system recipes"
                    )}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/mapping/recipes">
                    Map Recipes
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Unit Mapping</h3>
                  <p className="text-xs text-muted-foreground">Configure unit conversions</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/mapping/units">
                    Map Units
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Location Mapping</h3>
                  <p className="text-xs text-muted-foreground">Map POS locations to system locations</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/mapping/locations">
                    Map Locations
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/mapping/recipes">
                Go to Mapping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* OPERATIONS Section */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Operations</span>
            </CardTitle>
            <CardDescription>
              Monitor and manage POS operations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Interface Posting</h3>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.pendingApprovals > 0 ? (
                      <span className="text-amber-600 font-medium">{systemStatus.pendingApprovals} transactions pending</span>
                    ) : (
                      "Manage interface transactions"
                    )}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/interface-posting">
                    View
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Consumptions</h3>
                  <p className="text-xs text-muted-foreground">View and manage POS consumptions</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/consumptions">
                    View
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Transactions</h3>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.failedTransactions > 0 ? (
                      <span className="text-red-600 font-medium">{systemStatus.failedTransactions} failed transactions</span>
                    ) : (
                      "View transaction history"
                    )}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/transactions">
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/interface-posting">
                Go to Operations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* REPORTING Section */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <FileBarChart2 className="h-5 w-5 text-primary" />
              <span>Reporting</span>
            </CardTitle>
            <CardDescription>
              Access reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Gross Profit Analysis</h3>
                  <p className="text-xs text-muted-foreground">Sales vs. Cost analysis by category</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/reports/gross-profit">
                    View Report
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Consumption Report</h3>
                  <p className="text-xs text-muted-foreground">Actual vs. Theoretical usage analysis</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/reports/consumption">
                    View Report
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium">Today's Sales</h3>
                    <span className="text-xs font-bold">$1,234.56</span>
                  </div>
                  <Progress value={65} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">65% of target</span>
                    <span className="text-muted-foreground">Target: $1,900.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/reports">
                Go to Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <section aria-labelledby="recent-activity" className="space-y-4">
        <h2 id="recent-activity" className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Activity
        </h2>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">Today 14:30</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Transaction</Badge>
                  </TableCell>
                  <TableCell>12 sales transactions processed from Main Restaurant</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/system-administration/system-integrations/pos/transactions">
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Today 13:15</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Mapping</Badge>
                  </TableCell>
                  <TableCell>New items detected from POS system</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/system-administration/system-integrations/pos/mapping/recipes">
                        Map Items
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Today 10:45</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Stock-out</Badge>
                  </TableCell>
                  <TableCell>Stock-out approval requested for Coffee Shop</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Awaiting Approval</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/system-administration/system-integrations/pos/transactions/stock-out-review">
                        Review
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end py-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/system-administration/system-integrations/pos/activity">
                View All Activity
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
} 