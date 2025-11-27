/**
 * Mock Product Category Data
 * Centralized product category mock data for the Carmen ERP application
 */

export interface ProductItemGroup {
  id: string
  name: string
}

export interface ProductSubcategory {
  id: string
  name: string
  itemGroups?: ProductItemGroup[]
}

export interface ProductCategory {
  id: string
  name: string
  subcategories: ProductSubcategory[]
}

export const mockProductCategories: ProductCategory[] = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    subcategories: [
      { 
        id: 'meat-poultry', 
        name: 'Meat & Poultry',
        itemGroups: [
          { id: 'beef-cuts', name: 'Beef Cuts' },
          { id: 'poultry-fresh', name: 'Fresh Poultry' },
          { id: 'processed-meats', name: 'Processed Meats' }
        ]
      },
      { 
        id: 'seafood', 
        name: 'Seafood',
        itemGroups: [
          { id: 'fresh-fish', name: 'Fresh Fish' },
          { id: 'shellfish', name: 'Shellfish' },
          { id: 'frozen-seafood', name: 'Frozen Seafood' }
        ]
      },
      { 
        id: 'produce', 
        name: 'Fresh Produce',
        itemGroups: [
          { id: 'vegetables', name: 'Vegetables' },
          { id: 'fruits', name: 'Fruits' },
          { id: 'herbs-spices', name: 'Herbs & Spices' }
        ]
      },
      { 
        id: 'dairy', 
        name: 'Dairy Products',
        itemGroups: [
          { id: 'milk-cream', name: 'Milk & Cream' },
          { id: 'cheese', name: 'Cheese' },
          { id: 'yogurt', name: 'Yogurt' }
        ]
      },
      { 
        id: 'beverages', 
        name: 'Beverages',
        itemGroups: [
          { id: 'soft-drinks', name: 'Soft Drinks' },
          { id: 'juices', name: 'Juices' },
          { id: 'hot-beverages', name: 'Hot Beverages' }
        ]
      },
      { 
        id: 'dry-goods', 
        name: 'Dry Goods',
        itemGroups: [
          { id: 'grains-rice', name: 'Grains & Rice' },
          { id: 'pasta-noodles', name: 'Pasta & Noodles' },
          { id: 'canned-goods', name: 'Canned Goods' }
        ]
      }
    ]
  },
  {
    id: 'supplies',
    name: 'Supplies',
    subcategories: [
      { 
        id: 'cleaning', 
        name: 'Cleaning Supplies',
        itemGroups: [
          { id: 'detergents', name: 'Detergents' },
          { id: 'disinfectants', name: 'Disinfectants' },
          { id: 'cleaning-tools', name: 'Cleaning Tools' }
        ]
      },
      { 
        id: 'disposables', 
        name: 'Disposables',
        itemGroups: [
          { id: 'paper-products', name: 'Paper Products' },
          { id: 'plastic-items', name: 'Plastic Items' },
          { id: 'packaging', name: 'Packaging' }
        ]
      },
      { 
        id: 'linens', 
        name: 'Linens & Textiles',
        itemGroups: [
          { id: 'bed-linens', name: 'Bed Linens' },
          { id: 'towels', name: 'Towels' },
          { id: 'table-linens', name: 'Table Linens' }
        ]
      },
      { 
        id: 'maintenance', 
        name: 'Maintenance Supplies',
        itemGroups: [
          { id: 'tools', name: 'Tools' },
          { id: 'hardware', name: 'Hardware' },
          { id: 'electrical', name: 'Electrical' }
        ]
      }
    ]
  },
  {
    id: 'equipment',
    name: 'Equipment',
    subcategories: [
      { 
        id: 'kitchen', 
        name: 'Kitchen Equipment',
        itemGroups: [
          { id: 'cooking-equipment', name: 'Cooking Equipment' },
          { id: 'prep-equipment', name: 'Prep Equipment' },
          { id: 'storage-equipment', name: 'Storage Equipment' }
        ]
      },
      { 
        id: 'furniture', 
        name: 'Furniture',
        itemGroups: [
          { id: 'dining-furniture', name: 'Dining Furniture' },
          { id: 'bedroom-furniture', name: 'Bedroom Furniture' },
          { id: 'outdoor-furniture', name: 'Outdoor Furniture' }
        ]
      },
      { 
        id: 'technology', 
        name: 'Technology',
        itemGroups: [
          { id: 'computers', name: 'Computers' },
          { id: 'networking', name: 'Networking' },
          { id: 'audio-visual', name: 'Audio Visual' }
        ]
      },
      { 
        id: 'tools', 
        name: 'Tools & Hardware',
        itemGroups: [
          { id: 'power-tools', name: 'Power Tools' },
          { id: 'hand-tools', name: 'Hand Tools' },
          { id: 'fasteners', name: 'Fasteners' }
        ]
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    subcategories: [
      { 
        id: 'maintenance-services', 
        name: 'Maintenance Services',
        itemGroups: [
          { id: 'hvac-services', name: 'HVAC Services' },
          { id: 'plumbing-services', name: 'Plumbing Services' },
          { id: 'electrical-services', name: 'Electrical Services' }
        ]
      },
      { 
        id: 'consulting', 
        name: 'Consulting',
        itemGroups: [
          { id: 'business-consulting', name: 'Business Consulting' },
          { id: 'technical-consulting', name: 'Technical Consulting' },
          { id: 'legal-consulting', name: 'Legal Consulting' }
        ]
      },
      { 
        id: 'delivery', 
        name: 'Delivery Services',
        itemGroups: [
          { id: 'food-delivery', name: 'Food Delivery' },
          { id: 'package-delivery', name: 'Package Delivery' },
          { id: 'freight-delivery', name: 'Freight Delivery' }
        ]
      }
    ]
  }
]

