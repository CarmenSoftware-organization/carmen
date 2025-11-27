"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InventoryLocationType,
  LocationStatus,
  LOCATION_TYPE_LABELS,
  LOCATION_TYPE_DESCRIPTIONS,
} from "@/lib/types/location-management"

// Form validation schema
const locationFormSchema = z.object({
  code: z.string()
    .min(1, "Location code is required")
    .max(10, "Code must be 10 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric with hyphens only"),
  name: z.string()
    .min(1, "Location name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(InventoryLocationType),
  status: z.enum(['active', 'inactive', 'closed', 'pending_setup'] as const),
  physicalCountEnabled: z.boolean(),
  departmentId: z.string().optional(),
  costCenterId: z.string().optional(),
  consignmentVendorId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

interface LocationFormProps {
  initialData?: Partial<LocationFormValues>
  onSubmit: (data: LocationFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

// Mock departments
const mockDepartments = [
  { id: 'dept-kitchen', name: 'Central Kitchen' },
  { id: 'dept-warehouse', name: 'Warehouse' },
  { id: 'dept-fnb', name: 'Food & Beverage' },
  { id: 'dept-maintenance', name: 'Maintenance' },
  { id: 'dept-housekeeping', name: 'Housekeeping' },
]

// Mock cost centers
const mockCostCenters = [
  { id: 'cc-001', name: 'F&B Operations' },
  { id: 'cc-002', name: 'Logistics' },
  { id: 'cc-003', name: 'Bar Operations' },
  { id: 'cc-004', name: 'Facilities' },
  { id: 'cc-005', name: 'Consignment' },
]

// Mock vendors (for consignment)
const mockVendors = [
  { id: 'vendor-001', name: 'Premium Beverages Co.' },
  { id: 'vendor-002', name: 'Royal Linen Services' },
  { id: 'vendor-003', name: 'Fresh Produce Direct' },
]

export function LocationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: LocationFormProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || InventoryLocationType.INVENTORY,
      status: initialData?.status || 'active',
      physicalCountEnabled: initialData?.physicalCountEnabled ?? true,
      departmentId: initialData?.departmentId || '',
      costCenterId: initialData?.costCenterId || '',
      consignmentVendorId: initialData?.consignmentVendorId || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || 'Thailand',
    },
  })

  const locationType = form.watch('type')
  const isConsignment = locationType === InventoryLocationType.CONSIGNMENT

  const handleSubmit = (data: LocationFormValues) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core location details and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Code *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., WH-001"
                        className="uppercase"
                        maxLength={10}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique code (max 10 characters, uppercase)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Main Warehouse"
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description of this location"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Type & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Type & Status</CardTitle>
            <CardDescription>Location classification and operational status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(InventoryLocationType).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div>
                              <div className="font-medium">{LOCATION_TYPE_LABELS[type]}</div>
                              <div className="text-xs text-muted-foreground">
                                {LOCATION_TYPE_DESCRIPTIONS[type]}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="pending_setup">Pending Setup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="physicalCountEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Physical Count</FormLabel>
                      <FormDescription>
                        Enable physical inventory counts at this location
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Department and cost center assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costCenterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCostCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isConsignment && (
                <FormField
                  control={form.control}
                  name="consignmentVendorId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Consignment Vendor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockVendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Required for consignment locations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Physical location address (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Street address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Building, floor, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Location'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
