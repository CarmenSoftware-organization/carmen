// Define available dynamic field types for GRN items
export type DynamicFieldType =
  | 'expiryDate'
  | 'lotNumber'
  | 'batchNumber'
  | 'serialNumbers'
  | 'manufacturingDate'
  | 'notes';

// Define which fields should be shown based on category.
// Keys are category IDs (adjust these to match your actual category IDs)
// Values are arrays of dynamic field types
export const DYNAMIC_FIELDS_BY_CATEGORY: Record<string, DynamicFieldType[]> = {
  'FOOD': ['expiryDate', 'lotNumber', 'batchNumber'],
  'ELECTRONICS': ['serialNumbers', 'lotNumber', 'batchNumber'],
  'CHEMICALS': ['lotNumber', 'expiryDate', 'batchNumber'],
  'PROJECT_MATERIAL': ['lotNumber', 'batchNumber', 'notes'],
  'DEFAULT': ['lotNumber', 'batchNumber'] // Fallback if category unknown or has no specifics
};

// You might want a function to get the fields for a category easily
export function getDynamicFieldsForCategory(categoryId?: string): DynamicFieldType[] {
  if (categoryId && DYNAMIC_FIELDS_BY_CATEGORY[categoryId]) {
    return DYNAMIC_FIELDS_BY_CATEGORY[categoryId];
  }
  // Return default or specific known fields if category is unknown/not mapped
  return DYNAMIC_FIELDS_BY_CATEGORY['DEFAULT'] || [];
}

// Helper to get a display label for a field name (simple version)
export function getFieldLabel(fieldName: DynamicFieldType): string {
    switch (fieldName) {
        case 'expiryDate': return 'Expiry Date';
        case 'lotNumber': return 'Lot Number';
        case 'batchNumber': return 'Batch Number';
        case 'serialNumbers': return 'Serial Numbers';
        case 'manufacturingDate': return 'Manufacturing Date';
        case 'notes': return 'Notes';
        default: {
             // Attempt to convert camelCase to Title Case
             const result = (fieldName as string).replace(/([A-Z])/g, ' $1');
             return result.charAt(0).toUpperCase() + result.slice(1);
        }
    }
} 