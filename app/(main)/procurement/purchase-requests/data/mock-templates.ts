import { PRTemplate, PRType } from "@/lib/types";


/**
 * Mock data for PR templates
 * This data follows the PRTemplate interface defined in lib/types.ts
 */
export const mockTemplates: PRTemplate[] = [
  {
    id: "template-001",
    name: "Office Supplies Template",
    description: "Standard template for office supplies purchases",
    type: PRType.GeneralPurchase,
    category: "Office Supplies",
    department: "Administration",
    createdBy: "user-001",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    isDefault: true,
    isGlobal: true,
    prData: {
      vendor: "Office Supplies Co.",
      vendorId: 1,
      description: "Standard office supplies purchase",
      location: "Head Office",
      department: "Administration",
      jobCode: "JOB-001",
      currency: "USD",
      items: [
        {
          name: "Office Paper",
          description: "A4 printer paper, 80gsm",
          unit: "Box",
          quantityRequested: 10,
          price: 24.99,
          currency: "USD",
          itemCategory: "Office Supplies",
          itemSubcategory: "Paper",
          accountCode: "ACC-001",
          jobCode: "JOB-001",
        },
        {
          name: "Pens",
          description: "Blue ballpoint pens",
          unit: "Box",
          quantityRequested: 5,
          price: 12.99,
          currency: "USD",
          itemCategory: "Office Supplies",
          itemSubcategory: "Writing Materials",
          accountCode: "ACC-001",
          jobCode: "JOB-001",
        }
      ]
    }
  },
  {
    id: "template-002",
    name: "IT Equipment Template",
    description: "Standard template for IT equipment purchases",
    type: PRType.AssetPurchase,
    category: "IT Equipment",
    department: "IT",
    createdBy: "user-002",
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02"),
    isDefault: false,
    isGlobal: true,
    prData: {
      vendor: "Tech Solutions Inc.",
      vendorId: 2,
      description: "Standard IT equipment purchase",
      location: "Head Office",
      department: "IT",
      jobCode: "JOB-002",
      currency: "USD",
      items: [
        {
          name: "Laptop",
          description: "Business laptop with standard specifications",
          unit: "Unit",
          quantityRequested: 1,
          price: 999.99,
          currency: "USD",
          itemCategory: "IT Equipment",
          itemSubcategory: "Computers",
          accountCode: "ACC-002",
          jobCode: "JOB-002",
        }
      ]
    }
  }
];

/**
 * Function to get a template by ID
 * @param id The ID of the template to retrieve
 * @returns The template with the specified ID, or undefined if not found
 */
export function getTemplateById(id: string): PRTemplate | undefined {
  return mockTemplates.find(template => template.id === id);
}

/**
 * Function to get templates by category
 * @param category The category to filter by (Office Supplies, IT Equipment, etc.)
 * @returns An array of templates in the specified category
 */
export function getTemplatesByCategory(category: string): PRTemplate[] {
  return mockTemplates.filter(template => template.category === category);
}

/**
 * Function to get templates by department
 * @param department The department to filter by
 * @returns An array of templates in the specified department
 */
export function getTemplatesByDepartment(department: string): PRTemplate[] {
  return mockTemplates.filter(template => template.department === department);
}

/**
 * Function to get the default template
 * @returns The default template, or undefined if none exists
 */
export function getDefaultTemplate(): PRTemplate | undefined {
  return mockTemplates.find(template => template.isDefault);
}

/**
 * Function to get templates by type
 * @param type The PR type to filter by
 * @returns An array of templates for the specified PR type
 */
export function getTemplatesByType(type: PRType): PRTemplate[] {
  return mockTemplates.filter(template => template.type === type);
} 