"use client"

import React, { ReactNode } from "react"
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
  Edit,
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
import { PurchaseRequest, Requestor } from "@/lib/types"
import { PRType } from "@/lib/types/procurement"

interface SummaryTotalProps {
  prData: PurchaseRequest
}

// Temporary SummaryTotal component until we create the actual one
function SummaryTotal({ prData }: SummaryTotalProps) {
  const formatMoney = (money: { amount: number; currency: string }) => {
    return `${money.currency} ${money.amount.toFixed(2)}`
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium">Estimated Total</p>
        <p className="text-2xl font-bold">{formatMoney(prData.estimatedTotal)}</p>
      </div>
      {prData.actualTotal && (
        <div>
          <p className="text-sm font-medium">Actual Total</p>
          <p className="text-2xl font-bold">{formatMoney(prData.actualTotal)}</p>
        </div>
      )}
    </div>
  )
}

interface PRDetailTemplateProps {
  mode: "view" | "edit" | "add"
  title: ReactNode
  formData: PurchaseRequest
  onModeChange: (mode: "view" | "edit") => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (data: Partial<PurchaseRequest>) => void
  children?: React.ReactNode
  tabs?: Array<{
    value: string
    label: string
    content: ReactNode
  }>
  actions?: ReactNode
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
            <div className="flex justify-between items-center">
              {title}
              <div className="flex items-center gap-2">
                {/* Edit/Save/Cancel buttons */}
                {mode === "view" ? (
                  <Button onClick={() => onModeChange("edit")}>
                    <Edit className="mr-2 h-4 w-4" />
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
                  <Label htmlFor="requestNumber">Requisition</Label>
                  <Input
                    id="requestNumber"
                    name="requestNumber"
                    value={formData.requestNumber || ""}
                    onChange={onInputChange}
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="requestDate">Date</Label>
                  <Input
                    id="requestDate"
                    name="requestDate"
                    type="date"
                    value={formData.requestDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      onFormDataChange({
                        requestDate: new Date(e.target.value),
                      })
                    }
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="requestType">PR Type</Label>
                  <Select
                    value={formData.requestType}
                    onValueChange={(value) =>
                      onFormDataChange({ requestType: value as PurchaseRequest['requestType'] })
                    }
                    disabled={mode === "view"}
                  >
                    <SelectTrigger id="requestType">
                      <SelectValue placeholder="Select PR Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goods">Goods</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="capital">Capital</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <div className="grid grid-cols-2 w-full">
                    <div className="space-y-1">
                      <Label
                        htmlFor="requestedBy"
                        className="text-[0.7rem] text-gray-500 flex items-center gap-2"
                      >
                        <UserIcon className="h-3 w-3" /> Requestor
                      </Label>
                      <Input
                        id="requestedBy"
                        name="requestedBy"
                        value={formData.requestedBy}
                        onChange={onInputChange}
                        disabled={mode === "view"}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="departmentId"
                        className="text-[0.7rem] text-gray-500 flex items-center gap-2"
                      >
                        <Building2Icon className="h-3 w-3" /> Department
                      </Label>
                      <Input
                        id="departmentId"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={onInputChange}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea
                    id="justification"
                    name="justification"
                    value={formData.justification || ""}
                    onChange={(e) =>
                      onFormDataChange({ justification: e.target.value })
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
            <Tabs defaultValue={tabs[0].value} className="w-full">
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
                {tabs.map(({ value, content }) => (
                  <TabsContent key={value} value={value.toLowerCase()}>
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