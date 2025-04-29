import { GoodsReceiveNoteItem } from '@/lib/types';

// Define which fields from GoodsReceiveNoteItem might be considered 'dynamic'
// and should be shown based on category.
// Keys are category IDs (adjust these to match your actual category IDs)
// Values are arrays of field names from GoodsReceiveNoteItem
export const DYNAMIC_FIELDS_BY_CATEGORY: Record<string, Array<keyof GoodsReceiveNoteItem>> = {
  'FOOD': ['expiryDate', 'lotNumber'],
  'ELECTRONICS': ['serialNumber', 'lotNumber'],
  'CHEMICALS': ['lotNumber', 'expiryDate', 'jobCode'],
  'PROJECT_MATERIAL': ['projectCode', 'jobCode', 'marketSegment'],
  'DEFAULT': ['lotNumber', 'jobCode'] // Fallback if category unknown or has no specifics
};

// You might want a function to get the fields for a category easily
export function getDynamicFieldsForCategory(categoryId?: string): Array<keyof GoodsReceiveNoteItem> {
  if (categoryId && DYNAMIC_FIELDS_BY_CATEGORY[categoryId]) {
    return DYNAMIC_FIELDS_BY_CATEGORY[categoryId];
  }
  // Return default or specific known fields if category is unknown/not mapped
  // Adjust this logic as needed - perhaps return an empty array?
  return DYNAMIC_FIELDS_BY_CATEGORY['DEFAULT'] || [];
}

// Helper to get a display label for a field name (simple version)
export function getFieldLabel(fieldName: keyof GoodsReceiveNoteItem): string {
    switch (fieldName) {
        case 'expiryDate': return 'Expiry Date';
        case 'lotNumber': return 'Lot Number';
        case 'serialNumber': return 'Serial Number';
        case 'jobCode': return 'Job Code';
        case 'projectCode': return 'Project Code';
        case 'marketSegment': return 'Market Segment';
        // Add more cases as needed
        default:
             // Attempt to convert camelCase to Title Case
             const result = fieldName.replace(/([A-Z])/g, ' $1');
             return result.charAt(0).toUpperCase() + result.slice(1);
    }
} 