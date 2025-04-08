import { z } from "zod"

export const recipeComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0")
})

export const recipeMappingSchema = z.object({
  posItem: z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required")
  }),
  components: z.array(recipeComponentSchema).min(1, "At least one component is required")
})

export type RecipeComponent = z.infer<typeof recipeComponentSchema>
export type RecipeMapping = z.infer<typeof recipeMappingSchema> 