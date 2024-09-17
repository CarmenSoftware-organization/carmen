'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DetailPageTemplate from '@/components/templates/DetailPageTemplate';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface Pricelist {
  id: string;
  number: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items: PricelistItem[];
}

interface PricelistItem {
  id: string;
  rank: number;
  sku: string;
  productName: string;
  name: string;
  taxRate: number;
  price: number;
  unit: string;
  discountPercentage: number;
  discountAmount: number;
  minQuantity: number;
  total: number;
  lastReceivedPrice: number;
}

const pricelistData : Pricelist = {
  id: "1",
  number: "PL-2023-001",
  name: "Summer Sale 2023",
  description: "Special discounts for summer products",
  startDate: "2023-06-01",
  endDate: "2023-08-31",
  isActive: true,
  items: [
    {
      id: "1",
      rank: 1,
      sku: "SUM-001",
      productName: "Beach Umbrella",
      name: "Large Beach Umbrella",
      taxRate: 0.08,
      price: 39.99,
      unit: "each",
      discountPercentage: 10,
      discountAmount: 4.00,
      minQuantity: 1,
      total: 35.99,
      lastReceivedPrice: 25.00
    },
    {
      id: "2",
      rank: 2,
      sku: "SUM-002",
      productName: "Sunscreen",
      name: "SPF 50 Sunscreen",
      taxRate: 0.08,
      price: 12.99,
      unit: "bottle",
      discountPercentage: 5,
      discountAmount: 0.65,
      minQuantity: 2,
      total: 12.34,
      lastReceivedPrice: 8.50
    },
    {
      id: "3",
      rank: 3,
      sku: "SUM-003",
      productName: "Beach Towel",
      name: "Extra Large Beach Towel",
      taxRate: 0.08,
      price: 24.99,
      unit: "each",
      discountPercentage: 15,
      discountAmount: 3.75,
      minQuantity: 1,
      total: 21.24,
      lastReceivedPrice: 15.00
    },
    {
      id: "4",
      rank: 4,
      sku: "SUM-004",
      productName: "Cooler",
      name: "20L Portable Cooler",
      taxRate: 0.08,
      price: 49.99,
      unit: "each",
      discountPercentage: 20,
      discountAmount: 10.00,
      minQuantity: 1,
      total: 39.99,
      lastReceivedPrice: 30.00
    },
    {
      id: "5",
      rank: 5,
      sku: "SUM-005",
      productName: "Flip Flops",
      name: "Comfortable Flip Flops",
      taxRate: 0.08,
      price: 14.99,
      unit: "pair",
      discountPercentage: 0,
      discountAmount: 0,
      minQuantity: 1,
      total: 14.99,
      lastReceivedPrice: 7.50
    }
  ]
} 

export default function PricelistDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pricelist, setPricelist] = useState<Pricelist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PricelistItem | null>(null);

  useEffect(() => {
    async function fetchPricelist() {
      try {
        // const response = await fetch(`/api/pricelists/${params.id}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch pricelist');
        // }
        // const data = await response.json();
        const data = pricelistData;
        setPricelist(data);
      } catch (error) {
        setError('Error fetching pricelist');
        console.error('Error fetching pricelist:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPricelist();
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/vendor-management/price-lists/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this pricelist?')) {
      try {
        const response = await fetch(`/api/pricelists/${params.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete pricelist');
        }

        router.push('/pricelists');
      } catch (error) {
        console.error('Error deleting pricelist:', error);
      }
    }
  };

  const handleEditItem = (itemId: string) => {
    // Implement item editing logic
    console.log(`Editing item ${itemId}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/pricelists/${params.id}/items/${itemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        // Refresh the pricelist data
        fetchPricelist();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleAddItem = () => {
    // Implement item adding logic
    console.log('Adding new item');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!pricelist) return <div>Pricelist not found</div>;

  const actionButtons = (
    <>
      <Button onClick={handleEdit}>Edit</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </>
  );

  const content = (
    <>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="items">Pricelist Items</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Number:</strong> {pricelist.number}</p>
              <p><strong>Name:</strong> {pricelist.name}</p>
              <p><strong>Description:</strong> {pricelist.description}</p>
              <p><strong>Start Date:</strong> {new Date(pricelist.startDate).toLocaleDateString()} <strong>End Date:</strong> {new Date(pricelist.endDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <Badge variant={pricelist.isActive ? "success" : "destructive"}>{pricelist.isActive ? 'Active' : 'Inactive'}</Badge></p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="items">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefer</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Disc. %/Amt</TableHead>
                <TableHead className="text-right">Minimum</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricelist.items.map((item) => (
                <TableRow key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer hover:bg-gray-100">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={item.rank === 1} 
                      readOnly 
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.taxRate.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    {item.discountPercentage.toFixed(2)}% / {item.discountAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.minQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditItem(item.id); }}>Edit</Button>
                    <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleAddItem} className="mt-4">Add Item</Button>
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedItem?.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <p><strong>SKU:</strong> {selectedItem?.sku}</p>
                <p><strong>Tax Rate:</strong> {selectedItem?.taxRate.toFixed(2)}%</p>
                <p><strong>Price:</strong> {selectedItem?.price.toFixed(2)} / {selectedItem?.unit}</p>
                <p><strong>Discount:</strong> {selectedItem?.discountPercentage.toFixed(2)}% / {selectedItem?.discountAmount.toFixed(2)}</p>
                <p><strong>Minimum Quantity:</strong> {selectedItem?.minQuantity.toFixed(2)}</p>
                <p><strong>Gross:</strong> {selectedItem?.gross.toFixed(2)}</p>
                <p><strong>Last Received Price:</strong> {selectedItem?.lastReceivedPrice.toFixed(2)}</p>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
      <div className="mt-4 space-x-2">
        <Button variant="secondary" asChild>
          <Link href="/vendor-management/price-lists">Back to Pricelist List</Link>
        </Button>
      </div>
    </>
  );

  return (
    <DetailPageTemplate
      title={`Pricelist: ${pricelist.name}`}
      actionButtons={actionButtons}
      content={content}
    />
  );
}
