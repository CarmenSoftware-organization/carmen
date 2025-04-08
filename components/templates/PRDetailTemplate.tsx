"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest, PRType, Requestor } from "@/lib/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Printer as PrinterIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Pencil as PencilIcon,
  CheckCircle,
  X,
  ArrowLeft,
  User as UserIcon,
  Building2 as Building2Icon
} from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

interface SummaryTotalProps {
  prData: PurchaseRequest
}

// Temporary SummaryTotal component until we create the actual one
function SummaryTotal({ prData }: SummaryTotalProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium">Sub Total</p>
        <p className="text-2xl font-bold">{prData.subTotalPrice.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Total Amount</p>
        <p className="text-2xl font-bold">{prData.totalAmount.toFixed(2)}</p>
      </div>
    </div>
  )
}

interface PRDetailTemplateProps {
  mode: "view" | "edit" | "add"
  title: string
  formData: PurchaseRequest
  onModeChange: (mode: "view" | "edit") => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (data: Partial<PurchaseRequest>) => void
  children?: React.ReactNode
  tabs?: {
    label: string
    content: React.ReactNode
  }[]
  actions?: React.ReactNode
  backUrl?: string
}

export function PRDetailTemplate({
  mode,
  title,
  formData,
  onModeChange,
  onSubmit,
  onInputChange,
  onFormDataChange,
  children,
  tabs = [],
  actions,
  backUrl = "/procurement/purchase-requests",
}: PRDetailTemplateProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-0">
      <Card className="mb-6 bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col space-y-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(backUrl)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="flex items-center gap-2">
                {mode === "view" ? (
                  <Button onClick={() => onModeChange("edit")}>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="default" onClick={onSubmit}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onModeChange("view")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}

                <div className="w-px h-6 bg-border mx-2" />

                <Button variant="outline" size="sm">
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="refNumber">Reference Number</Label>
                  <Input
                    id="refNumber"
                    name="refNumber"
                    value={formData.refNumber}
                    onChange={onInputChange}
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={(e) =>
                      onFormDataChange({
                        date: new Date(e.target.value),
                      })
                    }
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="type">PR Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      onFormDataChange({ type: value as PRType })
                    }
                    disabled={mode === "view"}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select PR Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PRType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardHeader>
      </Card>
    </div>
  )
} 