"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PrinterIcon,
  DownloadIcon,
  ShareIcon,
  PencilIcon,
  CheckCircle,
  X,
  ArrowLeft,
  UserIcon,
  Building2Icon,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest, PRType, Requestor } from "@/lib/types"

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
                {/* Edit/Save/Cancel buttons */}
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

                {/* Separator between edit/save buttons and action buttons */}
                <div className="w-px h-6 bg-border mx-2" />

                {/* Action buttons that are always visible */}
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

          {/* Main Form Section */}
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
                <div className="col-span-2">
                  <div className="grid grid-cols-2 w-full">
                    {[
                      {
                        id: "requestor.name",
                        label: "Requestor",
                        icon: UserIcon,
                      },
                      {
                        id: "department",
                        label: "Department",
                        icon: Building2Icon,
                      },
                    ].map(({ id, label, icon: Icon }) => (
                      <div key={id} className="space-y-1">
                        <Label
                          htmlFor={id}
                          className="text-[0.7rem] text-gray-500 flex items-center gap-2"
                        >
                          <Icon className="h-3 w-3" /> {label}
                        </Label>
                        <Input
                          id={id}
                          name={id}
                          value={
                            id.includes(".")
                              ? (formData[
                                  id.split(".")[0] as keyof PurchaseRequest
                                ] as Requestor)[id.split(".")[1] as keyof Requestor]
                              : String(formData[id as keyof PurchaseRequest])
                          }
                          onChange={onInputChange}
                          disabled={mode === "view"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      onFormDataChange({ description: e.target.value })
                    }
                    disabled={mode === "view"}
                  />
                </div>

                <div className="col-span-2 bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    {["currentWorkflowStage", "workflowStatus", "status"].map(
                      (key) => (
                        <div key={key} className="space-y-2 text-center">
                          <label className="text-sm font-medium block">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                          <StatusBadge
                            status={String(
                              formData[key as keyof PurchaseRequest]
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Tabs Section */}
          {tabs.length > 0 && (
            <Tabs defaultValue={tabs[0].label.toLowerCase()} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map(({ label }) => (
                  <TabsTrigger
                    key={label}
                    value={label.toLowerCase()}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                {tabs.map(({ label, content }) => (
                  <TabsContent key={label} value={label.toLowerCase()}>
                    {content}
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          )}

          {/* Summary Section */}
          <Card className="mt-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <SummaryTotal prData={formData} />
            </CardContent>
          </Card>
        </CardContent>

        {/* Footer Actions */}
        {mode !== "add" && actions && (
          <CardFooter className="flex justify-end space-x-2">
            {actions}
          </CardFooter>
        )}

        {/* Additional Content */}
        {children}
      </Card>
    </div>
  )
} 