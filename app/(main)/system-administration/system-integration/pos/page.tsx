"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, FileText, Map, BarChart, ChevronLeft} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function POSIntegrationPage() {
  const [selectedPOS, setSelectedPOS] = useState('');
  
  const posTypes = [
    { name: 'Comanche', type: 'API' },
    { name: 'Soraso', type: 'API' },
    { name: 'Easy POS', type: 'API' },
    { name: 'HotelTime', type: 'API' },
    { name: 'Infrasys', type: 'Text' }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/system-administration/system-integration">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">POS Integration</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Configure and manage point-of-sale system integrations
          </p>
        </div>
      </div>

      <Tabs defaultValue="mapping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Mapping
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Mapping Tab */}
        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>POS Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loc1">Location 1</SelectItem>
                        <SelectItem value="loc2">Location 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recipe Map</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recipe1">Recipe 1</SelectItem>
                        <SelectItem value="recipe2">Recipe 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>POS Item Code</TableHead>
                      <TableHead>Recipe Code</TableHead>
                      <TableHead>Unit of Sales</TableHead>
                      <TableHead>Recipe Unit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Input placeholder="POS Item Code" />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="Recipe Code" />
                      </TableCell>
                      <TableCell>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit1">Unit 1</SelectItem>
                            <SelectItem value="unit2">Unit 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit1">Unit 1</SelectItem>
                            <SelectItem value="unit2">Unit 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Map</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>POS Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Sample Outlet</TableCell>
                    <TableCell>ITEM001</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>pcs</TableCell>
                    <TableCell>$10.00</TableCell>
                    <TableCell>$20.00</TableCell>
                    <TableCell>2025-01-15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Interface Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">POS System</label>
                  <Select value={selectedPOS} onValueChange={setSelectedPOS}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select POS System" />
                    </SelectTrigger>
                    <SelectContent>
                      {posTypes.map((pos) => (
                        <SelectItem key={pos.name} value={pos.name}>
                          {pos.name} - {pos.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">URL Endpoint</label>
                  <Input placeholder="Enter URL endpoint" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Security Token</label>
                  <Input type="password" placeholder="Enter security token" />
                </div>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Gross Profit Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outlet1">Outlet 1</SelectItem>
                    <SelectItem value="outlet2">Outlet 2</SelectItem>
                  </SelectContent>
                </Select>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Gross Profit</TableHead>
                      <TableHead>Recipe Margin %</TableHead>
                      <TableHead>Actual Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sample Category</TableCell>
                      <TableCell>$1,000.00</TableCell>
                      <TableCell>$400.00</TableCell>
                      <TableCell>$600.00</TableCell>
                      <TableCell>65%</TableCell>
                      <TableCell>60%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 