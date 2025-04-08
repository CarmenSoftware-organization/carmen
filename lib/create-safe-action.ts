import { z } from "zod"


export type FieldErrors<T> = {
  [K in keyof T]?: string[]
}

export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>
  error?: string | null
  data?: TOutput
}

export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    const validationResult = schema.safeParse(data)

    if (validationResult.success) {
      // Validation SUCCEEDED
      try {
        // Explicit check for data (satisfies linter)
        if (validationResult.data) {
          const result = await handler(validationResult.data)
          return result
        }
        // Should logically never reach here if success is true
        return { error: "Validation succeeded but data was unexpectedly missing." };
      } catch (error: unknown) { // Explicitly type caught error
        return {
          error: error instanceof Error ? error.message : "An unexpected error occurred"
        }
      }
    } else {
      // Validation FAILED
      // Convert Zod errors to our FieldErrors format
      const fieldErrors: FieldErrors<TInput> = {}
      
      // Explicit check for error (satisfies linter)
      if (validationResult.error) {
        // Process each error
        for (const error of validationResult.error.errors) { 
          // Get the first path component
          const path = error.path[0] as keyof TInput
          
          // Initialize array if it doesn't exist
          if (!fieldErrors[path]) {
            fieldErrors[path] = []
          }

          // Check if this is the specific array validation error from the schema
          if (path === 'components' && error.code === 'too_small' && error.minimum === 1) {
             fieldErrors[path]!.push("At least one component is required")
          } else {
            // Add the raw error message for other errors
            fieldErrors[path]!.push(error.message)
          }
        }
      }
      
      return { fieldErrors }
    }
  }
} 