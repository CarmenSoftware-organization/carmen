import { PRTemplate, PRType } from "@/lib/types";

/**
 * Mock data for PR templates
 * This data follows the PRTemplate interface defined in lib/types.ts
 */
export const mockTemplates: PRTemplate[] = [
  {
    id: "template1",
    name: "Office Supplies",
    description: "Standard template for ordering office supplies",
    type: PRType.GeneralPurchase,
    category: "department",
    department: "Administration",
    createdBy: "John Doe",
    createdAt: new Date("2023-10-15"),
    updatedAt: new Date("2023-11-20"),
    isDefault: true,
    isGlobal: false,
    prData: {
      vendor: "Office Depot",
      vendorId: 1001,
      description: "Monthly office supplies",
      location: "HQ",
      department: "Administration",
      jobCode: "ADMIN-2023",
      currency: "USD",
      items: [
        {
          name: "Printer Paper",
          description: "A4 printer paper, 80gsm",
          unit: "Box",
          location: "Main Storage",
          vendor: "Office Depot",
          price: 24.99,
          taxRate: 7,
          discountRate: 0
        },
        {
          name: "Ballpoint Pens",
          description: "Blue ballpoint pens, pack of 12",
          unit: "Pack",
          location: "Main Storage",
          vendor: "Office Depot",
          price: 8.99,
          taxRate: 7,
          discountRate: 0
        }
      ]
    }
  },
  {
    id: "template2",
    name: "Kitchen Supplies",
    description: "Template for kitchen and pantry items",
    type: PRType.MarketList,
    category: "global",
    createdBy: "Jane Smith",
    createdAt: new Date("2023-09-05"),
    updatedAt: new Date("2023-11-10"),
    isDefault: false,
    isGlobal: true,
    prData: {
      vendor: "Restaurant Supply Co.",
      vendorId: 1002,
      description: "Kitchen supplies restocking",
      location: "Main Kitchen",
      department: "F&B",
      jobCode: "FB-2023",
      currency: "USD",
      items: [
        {
          name: "Dish Soap",
          description: "Industrial dish soap, 5L",
          unit: "Bottle",
          location: "Kitchen Storage",
          vendor: "Restaurant Supply Co.",
          price: 18.50,
          taxRate: 7,
          discountRate: 0
        },
        {
          name: "Paper Towels",
          description: "Industrial paper towels, pack of 6",
          unit: "Pack",
          location: "Kitchen Storage",
          vendor: "Restaurant Supply Co.",
          price: 12.99,
          taxRate: 7,
          discountRate: 0
        }
      ]
    }
  },
  {
    id: "template3",
    name: "IT Equipment",
    description: "Template for standard IT equipment purchases",
    type: PRType.AssetPurchase,
    category: "my",
    createdBy: "Current User",
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2023-11-01"),
    isDefault: false,
    isGlobal: false,
    prData: {
      vendor: "Tech Solutions Inc.",
      vendorId: 1003,
      description: "IT equipment for new hires",
      location: "HQ",
      department: "IT",
      jobCode: "IT-2023",
      currency: "USD",
      items: [
        {
          name: "Laptop",
          description: "Standard business laptop",
          unit: "Unit",
          location: "IT Storage",
          vendor: "Tech Solutions Inc.",
          price: 899.99,
          taxRate: 7,
          discountRate: 0
        },
        {
          name: "Monitor",
          description: "24-inch LED monitor",
          unit: "Unit",
          location: "IT Storage",
          vendor: "Tech Solutions Inc.",
          price: 199.99,
          taxRate: 7,
          discountRate: 0
        }
      ]
    }
  }
];

/**
 * Function to get a template by ID
 * @param templateId The ID of the template to retrieve
 * @returns The template with the specified ID, or undefined if not found
 */
export function getTemplateById(templateId: string): PRTemplate | undefined {
  return mockTemplates.find(template => template.id === templateId);
}

/**
 * Function to get templates by category
 * @param category The category to filter by (my, department, global, or all)
 * @returns An array of templates in the specified category
 */
export function getTemplatesByCategory(category: string): PRTemplate[] {
  if (category === 'all') {
    return mockTemplates;
  }
  return mockTemplates.filter(template => template.category === category);
}

/**
 * Function to get templates by type
 * @param type The PR type to filter by
 * @returns An array of templates for the specified PR type
 */
export function getTemplatesByType(type: PRType): PRTemplate[] {
  return mockTemplates.filter(template => template.type === type);
}

/**
 * Function to get the default template for a PR type
 * @param type The PR type to get the default template for
 * @returns The default template for the specified PR type, or undefined if none exists
 */
export function getDefaultTemplateForType(type: PRType): PRTemplate | undefined {
  return mockTemplates.find(template => template.type === type && template.isDefault);
} 