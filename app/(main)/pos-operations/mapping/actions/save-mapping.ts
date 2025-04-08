'use server'

import { z } from "zod"
import { createSafeAction } from "@/lib/create-safe-action"
import { ActionState } from "@/lib/create-safe-action"

// Input validation schema
const recipeComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().min(0.01),
  costPerUnit: z.number().min(0),
})

const recipeMappingSchema = z.object({
  posItem: z.object({
    id: z.string(),
    name: z.string().min(1),
    sku: z.string().min(1),
  }),
  components: z.array(recipeComponentSchema).min(1, "At least one component is required"),
})

// Output type
type OutputType = {
  id: string
  name: string
  status: "mapped"
  components: number
  lastUpdated: string
}

// Mock function to simulate API call
const saveMappingToDatabase = async (data: z.infer<typeof recipeMappingSchema>): Promise<OutputType> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, always succeed
  return {
    id: data.posItem.id,
    name: data.posItem.name,
    status: "mapped",
    components: data.components.length,
    lastUpdated: new Date().toISOString(),
  }
}

const handler = async (data: z.infer<typeof recipeMappingSchema>): Promise<ActionState<z.infer<typeof recipeMappingSchema>, OutputType>> => {
  try {
    const result = await saveMappingToDatabase(data)
    return { data: result }
  } catch (error) {
    return {
      error: "Failed to save mapping. Please try again."
    }
  }
}

export const saveMapping = createSafeAction(recipeMappingSchema, handler) 