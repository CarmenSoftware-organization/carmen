
export interface HotelLocation {
  id: string;
  code: string;
  name: string;
  type: "storage" | "kitchen" | "restaurant" | "bar" | "housekeeping" | "maintenance";
  floor: number;
  building?: string;
  status: "active" | "inactive" | "maintenance";
  capacity?: number;
  responsibleDepartment: string;
}

export interface HotelProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  brand?: string;
  uom: string;
  packSize: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  currentStock: number;
  value: number;
  supplier?: string;
  expiryDate?: Date;
  locationId: string;
  lastCountDate?: Date;
  status: "active" | "inactive" | "discontinued";
}

// Mock Locations Data
export const mockLocations: HotelLocation[] = [
  // Storage Locations
  {
    id: "ms-001",
    code: "MS001",
    name: "Main Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 1000,
    responsibleDepartment: "Inventory",
  },
  {
    id: "fs-001",
    code: "FS001",
    name: "F&B Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 500,
    responsibleDepartment: "F&B",
  },
  {
    id: "hs-001",
    code: "HS001",
    name: "Housekeeping Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 300,
    responsibleDepartment: "Housekeeping",
  },

  // Kitchen Locations
  {
    id: "mk-001",
    code: "MK001",
    name: "Main Kitchen",
    type: "kitchen",
    floor: 1,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "F&B",
  },
  {
    id: "pk-001",
    code: "PK001",
    name: "Pastry Kitchen",
    type: "kitchen",
    floor: 1,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "F&B",
  },

  // Restaurant Locations
  {
    id: "mr-001",
    code: "MR001",
    name: "Main Restaurant",
    type: "restaurant",
    floor: 1,
    building: "Main Building",
    status: "active",
    capacity: 200,
    responsibleDepartment: "F&B",
  },
  {
    id: "br-001",
    code: "BR001",
    name: "Breakfast Room",
    type: "restaurant",
    floor: 2,
    building: "Main Building",
    status: "active",
    capacity: 150,
    responsibleDepartment: "F&B",
  },

  // Bar Locations
  {
    id: "lb-001",
    code: "LB001",
    name: "Lobby Bar",
    type: "bar",
    floor: 1,
    building: "Main Building",
    status: "active",
    capacity: 50,
    responsibleDepartment: "F&B",
  },
  {
    id: "pb-001",
    code: "PB001",
    name: "Pool Bar",
    type: "bar",
    floor: 3,
    building: "Main Building",
    status: "active",
    capacity: 30,
    responsibleDepartment: "F&B",
  },

  // Housekeeping Locations
  {
    id: "hl-001",
    code: "HL001",
    name: "Housekeeping 1st Floor",
    type: "housekeeping",
    floor: 1,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Housekeeping",
  },
  {
    id: "hl-002",
    code: "HL002",
    name: "Housekeeping 2nd Floor",
    type: "housekeeping",
    floor: 2,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Housekeeping",
  },
];

// Realistic product templates based on hotel operations
const productTemplates = {
  storage: {
    "F&B Dry Goods": [
      { name: "Basmati Rice", brand: "Royal", uom: "kg", packSize: 25, value: 45.99, minStock: 100, maxStock: 500 },
      { name: "All Purpose Flour", brand: "Gold Medal", uom: "kg", packSize: 20, value: 32.50, minStock: 80, maxStock: 400 },
      { name: "Sugar", brand: "C&H", uom: "kg", packSize: 25, value: 35.99, minStock: 100, maxStock: 500 }
    ],
    "Beverages": [
      { name: "Bottled Water", brand: "Evian", uom: "case", packSize: 24, value: 36.99, minStock: 50, maxStock: 200 },
      { name: "Soft Drinks", brand: "Coca-Cola", uom: "case", packSize: 24, value: 28.99, minStock: 40, maxStock: 160 }
    ]
  },
  kitchen: {
    "Equipment": [
      { name: "Chef's Knife", brand: "Wusthof", uom: "piece", packSize: 1, value: 159.99, minStock: 5, maxStock: 15 },
      { name: "Cutting Board", brand: "John Boos", uom: "piece", packSize: 1, value: 89.99, minStock: 10, maxStock: 30 }
    ],
    "Supplies": [
      { name: "Kitchen Towels", brand: "ChefTex", uom: "dozen", packSize: 12, value: 24.99, minStock: 20, maxStock: 60 },
      { name: "Food Container", brand: "Cambro", uom: "piece", packSize: 6, value: 45.99, minStock: 30, maxStock: 100 }
    ]
  },
  restaurant: {
    "Tableware": [
      { name: "Dinner Plate", brand: "Villeroy & Boch", uom: "piece", packSize: 12, value: 240.99, minStock: 100, maxStock: 300 },
      { name: "Wine Glass", brand: "Riedel", uom: "piece", packSize: 6, value: 180.99, minStock: 80, maxStock: 240 }
    ],
    "Linens": [
      { name: "Table Cloth", brand: "Standard Textile", uom: "piece", packSize: 10, value: 199.99, minStock: 50, maxStock: 150 },
      { name: "Napkin", brand: "Standard Textile", uom: "piece", packSize: 50, value: 149.99, minStock: 200, maxStock: 600 }
    ]
  },
  bar: {
    "Glassware": [
      { name: "Cocktail Glass", brand: "Libbey", uom: "piece", packSize: 12, value: 120.99, minStock: 60, maxStock: 180 },
      { name: "Beer Glass", brand: "Spiegelau", uom: "piece", packSize: 12, value: 96.99, minStock: 60, maxStock: 180 }
    ],
    "Bar Tools": [
      { name: "Cocktail Shaker", brand: "Cocktail Kingdom", uom: "piece", packSize: 1, value: 29.99, minStock: 5, maxStock: 15 },
      { name: "Ice Tongs", brand: "Winco", uom: "piece", packSize: 1, value: 9.99, minStock: 10, maxStock: 30 }
    ]
  },
  housekeeping: {
    "Guest Amenities": [
      { name: "Shampoo", brand: "L'Occitane", uom: "bottle", packSize: 48, value: 240.99, minStock: 200, maxStock: 800 },
      { name: "Body Lotion", brand: "L'Occitane", uom: "bottle", packSize: 48, value: 240.99, minStock: 200, maxStock: 800 },
      { name: "Bath Soap", brand: "L'Occitane", uom: "piece", packSize: 100, value: 299.99, minStock: 400, maxStock: 1600 }
    ],
    "Cleaning Supplies": [
      { name: "All Purpose Cleaner", brand: "Ecolab", uom: "bottle", packSize: 6, value: 45.99, minStock: 24, maxStock: 72 },
      { name: "Glass Cleaner", brand: "Ecolab", uom: "bottle", packSize: 6, value: 39.99, minStock: 24, maxStock: 72 }
    ]
  },
  maintenance: {
    "Tools": [
      { name: "Screwdriver Set", brand: "Stanley", uom: "set", packSize: 1, value: 49.99, minStock: 5, maxStock: 15 },
      { name: "Pliers Set", brand: "Klein Tools", uom: "set", packSize: 1, value: 79.99, minStock: 5, maxStock: 15 }
    ],
    "Supplies": [
      { name: "Light Bulbs", brand: "Philips", uom: "box", packSize: 12, value: 36.99, minStock: 20, maxStock: 60 },
      { name: "Air Filters", brand: "3M", uom: "piece", packSize: 6, value: 89.99, minStock: 30, maxStock: 90 }
    ]
  }
};

const suppliers = [
  "US Foods", "Sysco", "Edward Don", "American Hotel Register",
  "Guest Supply", "Standard Textile", "Southern Wine & Spirits",
  "HD Supply", "Ecolab", "Imperial Dade"
];

// Generate products for a location
export const generateProductsForLocation = (location: HotelLocation): HotelProduct[] => {
  const products: HotelProduct[] = [];
  const locationTemplates = productTemplates[location.type];
  if (!locationTemplates) return products;

  Object.entries(locationTemplates).forEach(([subcategory, items]) => {
    items.forEach((template, index) => {
      const randomStock = Math.floor(Math.random() * (template.maxStock - template.minStock)) + template.minStock;
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const lastCountDate = new Date();
      lastCountDate.setDate(lastCountDate.getDate() - Math.floor(Math.random() * 30));
      
      const product: HotelProduct = {
        id: `${location.code}-${subcategory.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
        code: `${location.type.substring(0, 2).toUpperCase()}${index + 1}`.padEnd(6, '0'),
        name: template.name,
        category: subcategory.split(' ')[0],
        subcategory,
        brand: template.brand,
        uom: template.uom,
        packSize: template.packSize,
        minStock: template.minStock,
        maxStock: template.maxStock,
        reorderPoint: Math.floor(template.minStock * 1.2),
        currentStock: randomStock,
        value: template.value,
        supplier,
        locationId: location.id,
        lastCountDate,
        status: "active"
      };

      // Add expiry date for perishable items
      if (["Proteins", "Dairy", "Produce"].includes(subcategory)) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 14) + 1);
        product.expiryDate = expiryDate;
      }

      products.push(product);
    });
  });

  return products;
};

// Generate all products for all locations
export const mockProducts: HotelProduct[] = mockLocations.flatMap(location => 
  generateProductsForLocation(location)
);

// Helper functions
export const getLocationsByType = (type: HotelLocation["type"]) => {
  return mockLocations.filter(location => location.type === type);
};

export const getProductsByCategory = (category: HotelProduct["category"]) => {
  return mockProducts.filter(product => product.category === category);
};

export const getProductsByLocation = (locationCode: string) => {
  return mockProducts.filter(product => product.locationId === locationCode);
};

export const getLowStockProducts = () => {
  return mockProducts.filter(product => product.currentStock <= product.reorderPoint);
};

export const getNearExpiryProducts = () => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return mockProducts.filter(product => 
    product.expiryDate && product.expiryDate <= thirtyDaysFromNow
  );
};
