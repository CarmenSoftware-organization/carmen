"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Scan, AlertTriangle, CheckCircle2 } from "lucide-react"
import { MagnifyingGlassIcon, ArrowRightIcon } from "@radix-ui/react-icons"

export default function SpotCheckPage() {
  const router = useRouter()

  const [step, setStep] = useState<"search" | "entry" | "success">("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [actualQty, setActualQty] = useState("")
  const [reason, setReason] = useState("")
  const [hasPhoto, setHasPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock inventory items
  const inventoryItems = [
    {
      id: "1",
      name: "Tomatoes, Roma",
      sku: "VEG-TOM-001",
      location: "Walk-in Cooler",
      uom: "KG",
      systemQty: 12.5,
    },
    {
      id: "2",
      name: "Lettuce, Iceberg",
      sku: "VEG-LET-002",
      location: "Walk-in Cooler",
      uom: "EA",
      systemQty: 8,
    },
    {
      id: "3",
      name: "Onions, Yellow",
      sku: "VEG-ONI-003",
      location: "Dry Storage",
      uom: "KG",
      systemQty: 15.2,
    },
  ]

  const handleSearch = () => {
    // Simulate finding an item
    const found = inventoryItems.find(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (found) {
      setSelectedItem(found)
      setStep("entry")
    }
  }

  const handleScan = () => {
    // Simulate scanning a barcode
    setSelectedItem(inventoryItems[0])
    setStep("entry")
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setStep("success")
      setIsSubmitting(false)
    }, 1000)
  }

  const handleReset = () => {
    setStep("search")
    setSearchQuery("")
    setSelectedItem(null)
    setActualQty("")
    setReason("")
    setHasPhoto(false)
  }

  const hasVariance = selectedItem && actualQty && Math.abs(Number.parseFloat(actualQty) - selectedItem.systemQty) > 0

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Spot Check</h1>

        {step === "search" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name or SKU..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleScan}>
                  <Scan className="h-4 w-4" />
                </Button>
              </div>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="cooler">Walk-in Cooler</SelectItem>
                  <SelectItem value="dry">Dry Storage</SelectItem>
                  <SelectItem value="freezer">Freezer</SelectItem>
                </SelectContent>
              </Select>

              <div className="pt-2">
                <Button className="w-full" onClick={handleSearch} disabled={!searchQuery}>
                  Find Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "entry" && selectedItem && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spot Check Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium">{selectedItem.name}</div>
                <div className="text-sm text-muted-foreground">{selectedItem.sku}</div>
                <div className="text-sm mt-1">
                  <span className="font-medium">Location:</span> {selectedItem.location}
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">System Qty:</span> {selectedItem.systemQty} {selectedItem.uom}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Actual Quantity</label>
                <Input type="number" step="0.01" value={actualQty} onChange={(e) => setActualQty(e.target.value)} />
              </div>

              {hasVariance && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950 rounded-md text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Variance detected: {(Number.parseFloat(actualQty) - selectedItem.systemQty).toFixed(2)}{" "}
                    {selectedItem.uom}
                  </span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Notes {hasVariance && "(Required)"}</label>
                <Textarea
                  placeholder="Add notes about the spot check..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setHasPhoto(!hasPhoto)}>
                  <Camera className="h-4 w-4 mr-2" />
                  {hasPhoto ? "Photo Added" : "Add Photo"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!actualQty || (hasVariance && !reason) || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl">Spot Check Completed</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-2">
              <p className="text-muted-foreground">
                You have successfully completed a spot check for {selectedItem?.name}.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <div className="mb-1">
                  <span className="font-medium">Item:</span> {selectedItem?.name}
                </div>
                <div className="mb-1">
                  <span className="font-medium">System Qty:</span> {selectedItem?.systemQty} {selectedItem?.uom}
                </div>
                <div className="mb-1">
                  <span className="font-medium">Actual Qty:</span> {actualQty} {selectedItem?.uom}
                </div>
                <div>
                  <span className="font-medium">Variance:</span>{" "}
                  {(Number.parseFloat(actualQty) - selectedItem?.systemQty).toFixed(2)} {selectedItem?.uom}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button onClick={handleReset} className="w-full">
                New Spot Check
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  )
}
