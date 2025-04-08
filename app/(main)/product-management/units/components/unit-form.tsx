"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"
import { Unit } from "./unit-list"

const unitSchema = z.object({
  code: z.string().min(1, "Code is required").max(10, "Code must be 10 characters or less"),
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  type: z.enum(["INVENTORY", "ORDER", "RECIPE"], {
    required_error: "Please select a unit type",
  }),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  isActive: z.boolean().default(true),
})

type UnitFormData = z.infer<typeof unitSchema>

export interface UnitFormProps {
  unit?: Unit
  onSuccess: (data: UnitFormData) => void
  onCancel: () => void
}

export function UnitForm({ unit, onSuccess, onCancel }: UnitFormProps) {
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      code: unit?.code || "",
      name: unit?.name || "",
      type: unit?.type || "INVENTORY",
      description: unit?.description || "",
      isActive: unit?.isActive ?? true,
    },
  })

  const onSubmit = async (data: UnitFormData) => {
    try {
      // Here you would typically make an API call to save the data
      onSuccess(data)
    } catch (error) {
      console.error("Error saving unit:", error)
      toast.error("Failed to save unit")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter unit code" {...field} />
              </FormControl>
              <FormDescription>
                A unique identifier for the unit (e.g., KG, L, PC)
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter unit name" {...field} />
              </FormControl>
              <FormDescription>
                The full name of the unit (e.g., Kilogram, Liter, Piece)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INVENTORY">Inventory</SelectItem>
                  <SelectItem value="ORDER">Order</SelectItem>
                  <SelectItem value="RECIPE">Recipe</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The category this unit belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter unit description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional details about the unit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether this unit is currently active and can be used
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

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {unit ? "Update" : "Create"} Unit
          </Button>
        </div>
      </form>
    </Form>
  )
} 