'use server'

import { z } from 'zod'
import { ActionState, createSafeAction } from '@/lib/create-safe-action'
import { RecipeComponent } from '../store/mapping-store' // Assuming type definition exists

// Define the schema for individual components (can likely share with single mapping)
const recipeComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().min(0.01),
  costPerUnit: z.number().min(0),
})

// Define the Zod schema for the bulk save action input
const BulkSaveMappingSchema = z.object({
  posItemIds: z.array(z.string().min(1, "POS Item ID cannot be empty")).min(1, "At least one POS Item ID is required"),
  components: z.array(recipeComponentSchema)
    .min(1, "At least one component is required")
    // Add refinement for uniqueness
    .refine((components) => {
        const ids = components.map(c => c.id);
        return new Set(ids).size === ids.length;
    }, {
        message: "Duplicate components are not allowed.",
    }),
})

// Define the input type based on the schema
type Input = z.infer<typeof BulkSaveMappingSchema>

// Define the return type for the data field on success
type Output = {
    success: boolean;
    message?: string;
    updatedCount?: number;
}

// The handler now returns a Promise of ActionState<Input, Output>
const handler = async (data: Input): Promise<ActionState<Input, Output>> => {
  const { posItemIds, components } = data
  const simulatedUserId = "user_sim_123"; // Placeholder for actual user ID
  const timestamp = new Date();

  console.log("--- Bulk Save Mapping Action --- ")
  console.log("Timestamp:", timestamp.toISOString())
  console.log("User ID:", simulatedUserId)
  console.log("POS Item IDs:", posItemIds)
  console.log("Components:", components)
  console.log("----------------------------------")

  try {
    // Simulate database operation
    console.log("Simulating bulk save...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
    const updatedCount = posItemIds.length; // Assume all were updated successfully

    console.log(`Successfully simulated mapping for ${updatedCount} items.`);

    // Simulate history logging
    console.log("--- Simulating History Logging --- ");
    posItemIds.forEach(id => {
        console.log(JSON.stringify({
            posMappingId: id,
            timestamp: timestamp,
            userId: simulatedUserId,
            action: 'BULK_MAP',
            // Storing full component list for each item in bulk might be excessive,
            // consider just logging the action or a reference
            componentsSnapshot: components 
        }));
    })
    console.log("--- End History Logging Simulation --- ");

    // Return structure for success
    return {
      data: {
          success: true,
          message: `Successfully mapped ${updatedCount} items.`,
          updatedCount: updatedCount
      }
    }
  } catch (error) {
    console.error("Simulation - Bulk mapping error:", error)
    const errorMessage = error instanceof Error ? error.message : "Simulated error during bulk mapping.";
    // Return structure for error
    return {
      error: errorMessage
    }
  }
}

// Create the safe action using the correct signature
export const bulkSaveMapping = createSafeAction(
  BulkSaveMappingSchema, // Schema as first argument
  handler                // Handler as second argument
) 