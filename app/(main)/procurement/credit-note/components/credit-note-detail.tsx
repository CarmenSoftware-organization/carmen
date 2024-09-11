'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Edit, Printer, XCircle } from 'lucide-react'

export function CreditNoteDetail() {
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => setIsEditing(true)
  const handleSave = () => setIsEditing(false)
  const handleCancel = () => setIsEditing(false)

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader className="sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <CardTitle>Credit Note Detail</CardTitle>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEdit}>Edit</Button>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Void
                  </Button>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="ref">Ref#</Label>
              <Input id="ref" value="CN-001" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value="2023-06-15" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" value="ACME Corp" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value="Returned goods" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="docNumber">Doc.#</Label>
              <Input id="docNumber" value="DOC-001" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value="THB (1.0)" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="docDate">Doc. Date</Label>
              <Input id="docDate" type="date" value="2023-06-14" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" value="Active" readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Credit Note Items</TabsTrigger>
          <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activityLog">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Card>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>CN Type</TableHead>
                      <TableHead>Rcv. No</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[120px]">
                        <div>Order Unit</div>
                        <div className="text-xs font-normal">Inventory</div>
                      </TableHead>
                      <TableHead>Rcv. Qty</TableHead>
                      <TableHead>CN Qty.</TableHead>
                      <TableHead>CN Amt.</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="align-top">
                      <TableCell className="pt-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="pt-4">Qty</TableCell>
                      <TableCell className="pt-4">RC24070001</TableCell>
                      <TableCell className="pt-4">Pasta Fettucini brand BestFood 500 Gram</TableCell>
                      <TableCell className="pt-4">Food Store</TableCell>
                      <TableCell className="pt-4">
                        <div>Box</div>
                        <div className="text-xs text-gray-500">10 @Pcs</div>
                      </TableCell>
                      <TableCell className="pt-4">990,000.00</TableCell>
                      <TableCell className="pt-4">900,000.00</TableCell>
                      <TableCell className="pt-4">9,000,000.00</TableCell>
                      <TableCell className="pt-4">630,000.00 (7%)</TableCell>
                      <TableCell className="pt-4">9,630,000.00</TableCell>
                    </TableRow>
                    <TableRow className="align-top">
                      <TableCell className="pt-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="pt-4">Amt</TableCell>
                      <TableCell className="pt-4">RC24070002</TableCell>
                      <TableCell className="pt-4">Olive Oil Extra Virgin 1L</TableCell>
                      <TableCell className="pt-4">Food Store</TableCell>
                      <TableCell className="pt-4">
                        <div>Bottle</div>
                        <div className="text-xs text-gray-500">1 @Bottle</div>
                      </TableCell>
                      <TableCell className="pt-4">500.00</TableCell>
                      <TableCell className="pt-4">-</TableCell>
                      <TableCell className="pt-4">450.00</TableCell>
                      <TableCell className="pt-4">31.50 (7%)</TableCell>
                      <TableCell className="pt-4">481.50</TableCell>
                    </TableRow>
                    <TableRow className="align-top">
                      <TableCell className="pt-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="pt-4">Qty</TableCell>
                      <TableCell className="pt-4">RC24070003</TableCell>
                      <TableCell className="pt-4">Fresh Milk Whole 1L</TableCell>
                      <TableCell className="pt-4">Dairy Section</TableCell>
                      <TableCell className="pt-4">
                        <div>Carton</div>
                        <div className="text-xs text-gray-500">12 @Pcs</div>
                      </TableCell>
                      <TableCell className="pt-4">1,200.00</TableCell>
                      <TableCell className="pt-4">600.00</TableCell>
                      <TableCell className="pt-4">600.00</TableCell>
                      <TableCell className="pt-4">42.00 (7%)</TableCell>
                      <TableCell className="pt-4">642.00</TableCell>
                    </TableRow>
                    <TableRow className="align-top">
                      <TableCell className="pt-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="pt-4">Amt</TableCell>
                      <TableCell className="pt-4">RC24070004</TableCell>
                      <TableCell className="pt-4">Organic Quinoa 500g</TableCell>
                      <TableCell className="pt-4">Health Food</TableCell>
                      <TableCell className="pt-4">
                        <div>Pack</div>
                        <div className="text-xs text-gray-500">1 @Pack</div>
                      </TableCell>
                      <TableCell className="pt-4">250.00</TableCell>
                      <TableCell className="pt-4">-</TableCell>
                      <TableCell className="pt-4">200.00</TableCell>
                      <TableCell className="pt-4">14.00 (7%)</TableCell>
                      <TableCell className="pt-4">214.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stockMovement">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commit Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Inventory Unit</TableHead>
                    <TableHead>Stock In</TableHead>
                    <TableHead>Stock Out</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>Store A</TableCell>
                    <TableCell>Thai Milk Taa (12 pack)</TableCell>
                    <TableCell>pack</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>1000.00</TableCell>
                    <TableCell>CN-001</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Credit note processed for returned goods</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Public Access</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Uploader</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>invoice.pdf</TableCell>
                    <TableCell>Original invoice</TableCell>
                    <TableCell>No</TableCell>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>Jane Smith</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activityLog">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-15 09:30:00</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Created credit note</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Transaction Currency (THB)</TableHead>
                <TableHead>Base Currency (THB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Net</TableCell>
                <TableCell>1000.00</TableCell>
                <TableCell>1000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell>70.00</TableCell>
                <TableCell>70.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>1070.00</TableCell>
                <TableCell>1070.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}