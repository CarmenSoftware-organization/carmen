'use client'

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
                  <p className="text-xs text-muted-foreground">General settings and preferences</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/settings/system">
                    Configure
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAPPING Section */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <span>Mapping</span>
            </CardTitle>
            <CardDescription>
              Map POS items to inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Recipe Mapping</h3>
                  <p className="text-xs text-muted-foreground">Map POS menu items to recipes</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/mapping/recipes">
                    Map Items
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Unit Mapping</h3>
                  <p className="text-xs text-muted-foreground">Map POS units to inventory units</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/system-administration/system-integrations/pos/mapping/units">
                    Map Units
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 