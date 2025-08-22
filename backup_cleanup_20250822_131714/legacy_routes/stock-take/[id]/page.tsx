"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Save, AlertTriangle } from "lucide-react"
import { ArrowLeftIcon, PaperPlaneIcon } from "@radix-ui/react-icons"

export default function StockTakeEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const sessionId = params.id

  // Mock data for stock take session
  const sessionDetails = {
    id: sessionId,
    name: "Weekly Stock Take - Main Kitchen",
    outlet: "Main Kitchen",
    status: "In Progress",
    date: "May 11, 2025",
    totalItems: 120,
    completedItems: 45,
  }

  // Mock data for items to count
  const stockItems = [
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
    {
      id: "4",
      name: "Peppers, Bell",
      sku: "VEG-PEP-004",
      location: "Walk-in Cooler",
      uom: "KG",
      systemQty: 5.8,
    },
    {
      id: "5",
      name: "Cucumbers",
      sku: "VEG-CUC-005",
      location: "Walk-in Cooler",
      uom: "KG",
      systemQty: 7.3,
    },
  ]

  // State for counted quantities
  const [countedItems, setCountedItems] = useState(
    stockItems.map((item) => ({
      id: item.id,
      countedQty: "",
      note: "",
      hasPhoto: false,
      hasVariance: false,
    })),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuantityChange = (id: string, value: string) => {
    setCountedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const originalItem = stockItems.find((i) => i.id === id)
          return {
            ...item,
            countedQty: value,
            hasVariance: !!(originalItem && Number(value) !== Number(originalItem.systemQty)),
          }
        }
        return item
      }),
    )
  }

  const handleNoteChange = (id: string, value: string) => {
    setCountedItems((prev) => prev.map((item) => (item.id === id ? { ...item, note: value } : item)))
  }

  const handlePhotoAttach = (id: string) => {
    setCountedItems((prev) => prev.map((item) => (item.id === id ? { ...item, hasPhoto: true } : item)))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      router.push(`/stock-take/${sessionId}/confirm`)
    }, 1000)
  }

  const handleSaveDraft = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/stock-take")
    }, 1000)
  }

  // Calculate progress
  const progress = Math.round((sessionDetails.completedItems / sessionDetails.totalItems) * 100)

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/stock-take">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{sessionDetails.name}</h1>
            <p className="text-sm text-muted-foreground">{sessionDetails.outlet}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Progress</div>
            <Badge variant="outline">
              {sessionDetails.completedItems} of {sessionDetails.totalItems} items
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4 mb-6">
          {stockItems.map((item, index) => {
            const countedItem = countedItems.find((i) => i.id === item.id)
            const variance = countedItem?.countedQty ? Number.parseFloat(countedItem.countedQty) - item.systemQty : 0
            const hasSignificantVariance = countedItem?.hasVariance

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-3 bg-background">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sku} | {item.location}
                    </div>
                  </div>

                  <div className="p-3 border-t">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">System Qty</div>
                        <div className="text-sm font-medium">
                          {item.systemQty} {item.uom}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Counted Qty</div>
                        <Input
                          type="number"
                          step="0.01"
                          value={countedItem?.countedQty || ""}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Variance</div>
                        <div
                          className={`text-sm font-medium ${
                            hasSignificantVariance
                              ? "text-destructive"
                              : countedItem?.countedQty
                                ? "text-green-600 dark:text-green-400"
                                : ""
                          }`}
                        >
                          {countedItem?.countedQty ? variance.toFixed(2) : "-"}{" "}
                          {countedItem?.countedQty ? item.uom : ""}
                        </div>
                      </div>
                    </div>

                    {hasSignificantVariance && (
                      <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md mb-3 text-xs">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Significant variance detected. Please add a note.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Textarea
                        placeholder="Add note (required for variances)"
                        value={countedItem?.note || ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-full aspect-square"
                        onClick={() => handlePhotoAttach(item.id)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    {countedItem?.hasPhoto && <div className="mt-2 text-xs text-muted-foreground">Photo attached</div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || countedItems.some((item) => item.hasVariance && !item.note)}
          >
            <PaperPlaneIcon className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>
    </>
  )
}
