"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useCountStore } from "@/lib/store/use-count-store";
import { generateProductsForLocation, mockLocations } from "@/lib/mock/hotel-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Package, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function ItemsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState<"all" | "high-value" | "random">("all");
  const { selectedLocations, selectedProducts, setSelectedProducts, currentSession } = useCountStore();
  const [showValueDialog, setShowValueDialog] = useState(false)
  const [minValue, setMinValue] = useState<string>("")

  useEffect(() => {
    if (!currentSession || selectedLocations.length === 0) {
      router.push("/inventory-management/spot-check/new/location");
      return;
    }
  }, [currentSession, selectedLocations, router]);

  // Generate products for all selected locations
  const allProducts = useMemo(() => {
    return selectedLocations.flatMap(locationId => {
      const location = mockLocations.find(loc => loc.id === locationId);
      return location ? generateProductsForLocation(location) : [];
    });
  }, [selectedLocations]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return ["all", ...Array.from(cats)].sort();
  }, [allProducts]);

  // Filter products based on search, category, and selection mode
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query)
      );
    }

    // Apply selection mode filter
    switch (selectionMode) {
      case "high-value":
        filtered = filtered.sort((a, b) => b.value - a.value).slice(0, 10);
        break;
      case "random":
        filtered = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, selectionMode]);

  const handleProductToggle = (product: typeof allProducts[0]) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleNext = () => {
    if (selectedProducts.length > 0) {
      router.push("/inventory-management/spot-check/new/review");
    }
  };

  const getStockLevelColor = (currentStock: number, reorderPoint: number) => {
    if (currentStock <= reorderPoint) {
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    }
    if (currentStock <= reorderPoint * 1.5) {
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    }
    return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts);
    }
  };

  const handleSelectionMode = (mode: "all" | "high-value" | "random") => {
    if (mode === "high-value") {
      setShowValueDialog(true)
      return
    }

    let selectedItems = [];
    switch (mode) {
      case "random":
        selectedItems = [...filteredProducts]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        break;
      case "all":
        selectedItems = filteredProducts;
        break;
    }
    setSelectedProducts(selectedItems);
  };

  const handleHighValueSelection = () => {
    const minValueNumber = parseFloat(minValue)
    if (!isNaN(minValueNumber)) {
      const highValueItems = filteredProducts
        .filter(product => product.value >= minValueNumber)
        .sort((a, b) => b.value - a.value)
      setSelectedProducts(highValueItems)
    }
    setShowValueDialog(false)
    setMinValue("")
  }

  const handleRemoveItem = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="space-y-4">
      {/* Review Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Count Summary</h2>
                <p className="text-muted-foreground">
                  Selected {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} and {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Started {currentSession ? format(currentSession.countDate, 'MMM d, yyyy') + ' at ' + currentSession.startTime : '-'}
                </p>
                <p className="text-sm font-medium">{currentSession?.type === 'spot' ? 'Spot Check' : 'Physical Count'} #{currentSession?.id.split('-')[0]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map(location => (
                <Badge key={location} variant="secondary">
                  {mockLocations.find(loc => loc.id === location)?.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Selection Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select Items</h2>
              <div className="space-x-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Package className="h-4 w-4" />
                      Selected Items ({selectedProducts.length})
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Selected Items ({selectedProducts.length})</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                        <div className="space-y-4">
                          {selectedProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-start justify-between gap-2 p-3 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {product.code}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary">
                                    {product.currentStock} {product.uom}
                                  </Badge>
                                  <Badge variant="outline">
                                    ${product.value.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(product.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {selectedProducts.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No items selected
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      {selectedProducts.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span>Total Items</span>
                            <span className="font-medium">{selectedProducts.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Value</span>
                            <span className="font-medium">
                              ${selectedProducts.reduce((sum, p) => sum + p.value, 0).toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            className="w-full" 
                            variant="destructive"
                            onClick={() => setSelectedProducts([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={selectedProducts.length === 0}
                  className="min-w-[140px]"
                >
                  Review Count ({selectedProducts.length})
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectionMode("all")}
                >
                  All Items
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectionMode("high-value")}
                >
                  High Value
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectionMode("random")}
                >
                  Random
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead className="text-right">Value/Unit</TableHead>
                  <TableHead>Last Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const location = mockLocations.find(loc => loc.id === product.locationId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.some(p => p.id === product.id)}
                          onCheckedChange={() => handleProductToggle(product)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{product.category}</span>
                          <span className="text-xs text-muted-foreground">{product.subcategory}</span>
                        </div>
                      </TableCell>
                      <TableCell>{location?.name}</TableCell>
                      <TableCell>{product.packSize} {product.uom}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={getStockLevelColor(product.currentStock, product.reorderPoint)}
                        >
                          {product.currentStock} {product.uom}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.value.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {product.lastCountDate ? format(new Date(product.lastCountDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showValueDialog} onOpenChange={setShowValueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Minimum Value</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <div>
                <Label>Minimum Value ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter minimum value"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Select items with value greater than or equal to this amount
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValueDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleHighValueSelection}
              disabled={!minValue || isNaN(parseFloat(minValue))}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
