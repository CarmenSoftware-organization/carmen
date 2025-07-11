// Item-specific vendor pricelist data
// Each item can be sourced from multiple vendors with different prices and terms

export interface ItemVendorOption {
  vendorId: number;
  vendorName: string;
  isPreferred: boolean;
  rating: number;
  priceListNumber: string;
  priceListName: string;
  unitPrice: number;
  minQuantity: number;
  orderUnit: string;
  validFrom: string;
  validTo: string;
  leadTime?: number;
  notes?: string;
}

export interface ItemVendorData {
  itemName: string;
  itemDescription: string;
  category: string;
  vendorOptions: ItemVendorOption[];
}

// Mock data: Each PR item with its available vendor options
export const itemVendorDatabase: { [itemName: string]: ItemVendorData } = {
  "Premium Coffee Beans": {
    itemName: "Premium Coffee Beans",
    itemDescription: "Arabica beans, medium roast, 1kg bags",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 1,
        vendorName: "Global F&B Suppliers",
        isPreferred: true,
        rating: 4.5,
        priceListNumber: "PL-2023-06-FB",
        priceListName: "Coffee & Beverages",
        unitPrice: 15.50,
        minQuantity: 10,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Premium quality, consistent supply"
      },
      {
        vendorId: 11,
        vendorName: "Coffee World Ltd",
        isPreferred: false,
        rating: 4.2,
        priceListNumber: "PL-2023-06-COFFEE",
        priceListName: "Specialty Coffee",
        unitPrice: 16.20,
        minQuantity: 25,
        orderUnit: "kg",
        validFrom: "15/06/2024",
        validTo: "14/06/2025",
        leadTime: 5,
        notes: "Single origin, premium grade"
      },
      {
        vendorId: 12,
        vendorName: "Specialty Beans Co",
        isPreferred: false,
        rating: 4.8,
        priceListNumber: "PL-2023-06-SPECIALTY",
        priceListName: "Artisan Coffee",
        unitPrice: 14.80,
        minQuantity: 50,
        orderUnit: "kg",
        validFrom: "01/07/2024",
        validTo: "30/06/2025",
        leadTime: 7,
        notes: "Best price for bulk orders"
      }
    ]
  },
  "All Purpose Flour": {
    itemName: "All Purpose Flour",
    itemDescription: "Premium quality baking flour, 25kg sacks",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 2,
        vendorName: "Baking Supplies Co.",
        isPreferred: true,
        rating: 4.2,
        priceListNumber: "PL-2023-06-BAKE",
        priceListName: "Baking Essentials",
        unitPrice: 3.00,
        minQuantity: 50,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 2,
        notes: "Consistent quality, reliable delivery"
      },
      {
        vendorId: 13,
        vendorName: "Wholesale Flour Mills",
        isPreferred: false,
        rating: 4.0,
        priceListNumber: "PL-2023-06-MILLS",
        priceListName: "Bulk Flour",
        unitPrice: 2.75,
        minQuantity: 100,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 4,
        notes: "Best pricing for large quantities"
      },
      {
        vendorId: 14,
        vendorName: "Premium Grain Co",
        isPreferred: false,
        rating: 4.6,
        priceListNumber: "PL-2023-06-GRAIN",
        priceListName: "Premium Flour",
        unitPrice: 3.25,
        minQuantity: 25,
        orderUnit: "kg",
        validFrom: "15/06/2024",
        validTo: "14/06/2025",
        leadTime: 3,
        notes: "Organic certified, premium quality"
      }
    ]
  },
  "Fresh Atlantic Salmon": {
    itemName: "Fresh Atlantic Salmon",
    itemDescription: "Premium salmon fillets, fresh daily delivery",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 3,
        vendorName: "Ocean Fresh Seafood",
        isPreferred: true,
        rating: 4.8,
        priceListNumber: "PL-2023-06-SEA",
        priceListName: "Fresh Seafood",
        unitPrice: 24.50,
        minQuantity: 5,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 1,
        notes: "Daily fresh delivery, premium grade"
      },
      {
        vendorId: 15,
        vendorName: "Atlantic Fish Market",
        isPreferred: false,
        rating: 4.3,
        priceListNumber: "PL-2023-06-ATLANTIC",
        priceListName: "Fish Market",
        unitPrice: 23.80,
        minQuantity: 10,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 1,
        notes: "Competitive pricing, good quality"
      },
      {
        vendorId: 16,
        vendorName: "Premium Seafood Ltd",
        isPreferred: false,
        rating: 4.9,
        priceListNumber: "PL-2023-06-PREMIUM-SEA",
        priceListName: "Premium Seafood",
        unitPrice: 26.00,
        minQuantity: 3,
        orderUnit: "kg",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 1,
        notes: "Highest quality, sashimi grade"
      }
    ]
  },
  "Premium Bath Towels": {
    itemName: "Premium Bath Towels",
    itemDescription: "100% cotton, 600 GSM, white, hotel grade",
    category: "Housekeeping",
    vendorOptions: [
      {
        vendorId: 4,
        vendorName: "Hotel Linen Co.",
        isPreferred: false,
        rating: 4.1,
        priceListNumber: "PL-2023-06-LINEN",
        priceListName: "Hotel Linens",
        unitPrice: 19.50,
        minQuantity: 20,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "Standard hotel quality"
      },
      {
        vendorId: 17,
        vendorName: "Luxury Linens Ltd",
        isPreferred: true,
        rating: 4.7,
        priceListNumber: "PL-2023-06-LUXURY",
        priceListName: "Luxury Linens",
        unitPrice: 22.00,
        minQuantity: 12,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 7,
        notes: "Premium quality, longer lasting"
      },
      {
        vendorId: 18,
        vendorName: "Wholesale Textiles",
        isPreferred: false,
        rating: 3.8,
        priceListNumber: "PL-2023-06-WHOLESALE",
        priceListName: "Bulk Textiles",
        unitPrice: 17.25,
        minQuantity: 50,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 10,
        notes: "Economy option, bulk pricing"
      }
    ]
  },
  "LED Light Bulbs": {
    itemName: "LED Light Bulbs",
    itemDescription: "Energy efficient LED bulbs, 60W equivalent, warm white",
    category: "Maintenance",
    vendorOptions: [
      {
        vendorId: 5,
        vendorName: "Electrical Supplies Inc.",
        isPreferred: false,
        rating: 4.0,
        priceListNumber: "PL-2023-06-ELEC",
        priceListName: "LED & Electrical",
        unitPrice: 9.00,
        minQuantity: 25,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Standard commercial grade"
      },
      {
        vendorId: 19,
        vendorName: "LED Solutions Pro",
        isPreferred: true,
        rating: 4.5,
        priceListNumber: "PL-2023-06-LED-PRO",
        priceListName: "Professional LED",
        unitPrice: 8.50,
        minQuantity: 50,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 2,
        notes: "Best value, long warranty"
      },
      {
        vendorId: 20,
        vendorName: "Green Energy Supplies",
        isPreferred: false,
        rating: 4.3,
        priceListNumber: "PL-2023-06-GREEN",
        priceListName: "Eco Lighting",
        unitPrice: 9.75,
        minQuantity: 20,
        orderUnit: "piece",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 4,
        notes: "Energy star certified, eco-friendly"
      }
    ]
  },
  "Premium Whiskey Collection": {
    itemName: "Premium Whiskey Collection",
    itemDescription: "Single malt whiskey selection for VIP guests",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 6,
        vendorName: "Premium Spirits Ltd.",
        isPreferred: false,
        rating: 4.7,
        priceListNumber: "PL-2023-06-SPIRITS",
        priceListName: "Premium Spirits",
        unitPrice: 135.00,
        minQuantity: 6,
        orderUnit: "bottle",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 7,
        notes: "Premium single malt collection"
      },
      {
        vendorId: 21,
        vendorName: "Elite Beverages Co",
        isPreferred: true,
        rating: 4.9,
        priceListNumber: "PL-2023-06-ELITE",
        priceListName: "Elite Spirits",
        unitPrice: 128.00,
        minQuantity: 12,
        orderUnit: "bottle",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "Exclusive distributor, better pricing"
      },
      {
        vendorId: 22,
        vendorName: "Luxury Spirits Import",
        isPreferred: false,
        rating: 4.5,
        priceListNumber: "PL-2023-06-LUXURY-SPIRITS",
        priceListName: "Luxury Import",
        unitPrice: 142.00,
        minQuantity: 6,
        orderUnit: "bottle",
        validFrom: "15/06/2024",
        validTo: "14/06/2025",
        leadTime: 10,
        notes: "Rare and vintage selections"
      }
    ]
  },
  "RFID Key Cards": {
    itemName: "RFID Key Cards",
    itemDescription: "Hotel access cards with magnetic stripe backup",
    category: "Front Office",
    vendorOptions: [
      {
        vendorId: 7,
        vendorName: "SecureAccess Systems",
        isPreferred: false,
        rating: 4.3,
        priceListNumber: "PL-2023-06-SECURITY",
        priceListName: "Security Systems",
        unitPrice: 48.00,
        minQuantity: 10,
        orderUnit: "pack",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "Standard RFID cards with backup stripe"
      },
      {
        vendorId: 23,
        vendorName: "Smart Card Solutions",
        isPreferred: true,
        rating: 4.6,
        priceListNumber: "PL-2023-06-SMARTCARD",
        priceListName: "Smart Access",
        unitPrice: 45.00,
        minQuantity: 20,
        orderUnit: "pack",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Advanced encryption, better durability"
      },
      {
        vendorId: 24,
        vendorName: "Digital Access Tech",
        isPreferred: false,
        rating: 4.4,
        priceListNumber: "PL-2023-06-DIGITAL",
        priceListName: "Digital Access",
        unitPrice: 52.00,
        minQuantity: 15,
        orderUnit: "pack",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 7,
        notes: "Premium cards with mobile integration"
      }
    ]
  },
  "Professional Chef Knives Set": {
    itemName: "Professional Chef Knives Set",
    itemDescription: "High-carbon stainless steel knife set with storage block",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 8,
        vendorName: "Professional Kitchen Supply",
        isPreferred: false,
        rating: 4.4,
        priceListNumber: "PL-2023-06-KITCHEN",
        priceListName: "Kitchen Equipment",
        unitPrice: 295.00,
        minQuantity: 1,
        orderUnit: "set",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "German steel, professional grade"
      },
      {
        vendorId: 25,
        vendorName: "Chef's Choice Equipment",
        isPreferred: true,
        rating: 4.7,
        priceListNumber: "PL-2023-06-CHEF",
        priceListName: "Chef Equipment",
        unitPrice: 285.00,
        minQuantity: 2,
        orderUnit: "set",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Japanese steel, superior sharpness"
      },
      {
        vendorId: 26,
        vendorName: "Commercial Kitchen Pro",
        isPreferred: false,
        rating: 4.2,
        priceListNumber: "PL-2023-06-COMMERCIAL",
        priceListName: "Commercial Kitchen",
        unitPrice: 310.00,
        minQuantity: 1,
        orderUnit: "set",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 7,
        notes: "Heavy duty, restaurant grade"
      }
    ]
  },
  "Pool Cleaning Chemicals": {
    itemName: "Pool Cleaning Chemicals",
    itemDescription: "Chlorine tablets, pH balancers, and algae treatment",
    category: "Maintenance",
    vendorOptions: [
      {
        vendorId: 9,
        vendorName: "Pool Maintenance Co.",
        isPreferred: false,
        rating: 3.9,
        priceListNumber: "PL-2023-06-POOL",
        priceListName: "Pool Chemicals",
        unitPrice: 92.00,
        minQuantity: 2,
        orderUnit: "kit",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "Standard pool maintenance kit"
      },
      {
        vendorId: 27,
        vendorName: "AquaCare Solutions",
        isPreferred: true,
        rating: 4.5,
        priceListNumber: "PL-2023-06-AQUA",
        priceListName: "AquaCare",
        unitPrice: 88.00,
        minQuantity: 3,
        orderUnit: "kit",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Eco-friendly, long-lasting formula"
      },
      {
        vendorId: 28,
        vendorName: "Professional Pool Supply",
        isPreferred: false,
        rating: 4.2,
        priceListNumber: "PL-2023-06-PROF-POOL",
        priceListName: "Professional Pool",
        unitPrice: 95.00,
        minQuantity: 1,
        orderUnit: "kit",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 4,
        notes: "Commercial grade chemicals"
      }
    ]
  },
  "Commercial Laundry Detergent": {
    itemName: "Commercial Laundry Detergent",
    itemDescription: "Heavy-duty detergent for hotel linens, 20kg drums",
    category: "Housekeeping",
    vendorOptions: [
      {
        vendorId: 10,
        vendorName: "Industrial Cleaning Supplies",
        isPreferred: false,
        rating: 4.1,
        priceListNumber: "PL-2023-06-CLEAN",
        priceListName: "Commercial Cleaning",
        unitPrice: 68.00,
        minQuantity: 3,
        orderUnit: "drum",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 5,
        notes: "Heavy duty, commercial grade"
      },
      {
        vendorId: 29,
        vendorName: "EcoClean Industries",
        isPreferred: true,
        rating: 4.6,
        priceListNumber: "PL-2023-06-ECO",
        priceListName: "EcoClean",
        unitPrice: 65.00,
        minQuantity: 5,
        orderUnit: "drum",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 3,
        notes: "Biodegradable, excellent stain removal"
      },
      {
        vendorId: 30,
        vendorName: "Hotel Supplies Direct",
        isPreferred: false,
        rating: 4.3,
        priceListNumber: "PL-2023-06-HOTEL",
        priceListName: "Hotel Direct",
        unitPrice: 72.00,
        minQuantity: 2,
        orderUnit: "drum",
        validFrom: "01/06/2024",
        validTo: "31/05/2025",
        leadTime: 2,
        notes: "Fast delivery, hotel-specific formula"
      }
    ]
  },
  "Spring Truffle Collection": {
    itemName: "Spring Truffle Collection",
    itemDescription: "Fresh spring truffles from France - mixed varieties",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 465,
        vendorName: "Seasonal Gourmet Supplies",
        isPreferred: false,
        rating: 4.8,
        priceListNumber: "PL-2024-SEASONAL-001",
        priceListName: "Seasonal Gourmet",
        unitPrice: 4200.00,
        minQuantity: 1,
        orderUnit: "kg",
        validFrom: "01/03/2024",
        validTo: "31/05/2024",
        leadTime: 10,
        notes: "Premium French truffles, seasonal availability"
      },
      {
        vendorId: 31,
        vendorName: "French Gourmet Imports",
        isPreferred: true,
        rating: 4.9,
        priceListNumber: "PL-2024-FRENCH-001",
        priceListName: "French Delicacies",
        unitPrice: 3950.00,
        minQuantity: 2,
        orderUnit: "kg",
        validFrom: "15/02/2024",
        validTo: "30/04/2024",
        leadTime: 14,
        notes: "Direct from Périgord region, highest quality"
      },
      {
        vendorId: 32,
        vendorName: "European Specialty Foods",
        isPreferred: false,
        rating: 4.6,
        priceListNumber: "PL-2024-EURO-SPEC-001",
        priceListName: "European Specialties",
        unitPrice: 4450.00,
        minQuantity: 1,
        orderUnit: "kg",
        validFrom: "01/03/2024",
        validTo: "31/05/2024",
        leadTime: 7,
        notes: "Mixed European truffle varieties, reliable supply"
      }
    ]
  },
  "Organic Spring Vegetable Medley": {
    itemName: "Organic Spring Vegetable Medley",
    itemDescription: "Premium organic spring vegetables - seasonal selection",
    category: "Food & Beverage",
    vendorOptions: [
      {
        vendorId: 465,
        vendorName: "Seasonal Gourmet Supplies",
        isPreferred: false,
        rating: 4.8,
        priceListNumber: "PL-2024-SEASONAL-002",
        priceListName: "Seasonal Vegetables",
        unitPrice: 15.00,
        minQuantity: 20,
        orderUnit: "kg",
        validFrom: "01/03/2024",
        validTo: "31/05/2024",
        leadTime: 3,
        notes: "Seasonal spring vegetables, premium organic"
      },
      {
        vendorId: 33,
        vendorName: "Organic Farms Collective",
        isPreferred: true,
        rating: 4.7,
        priceListNumber: "PL-2024-ORGANIC-001",
        priceListName: "Organic Produce",
        unitPrice: 13.50,
        minQuantity: 50,
        orderUnit: "kg",
        validFrom: "01/02/2024",
        validTo: "30/06/2024",
        leadTime: 2,
        notes: "Locally sourced, certified organic, better pricing"
      },
      {
        vendorId: 34,
        vendorName: "Fresh Farm Direct",
        isPreferred: false,
        rating: 4.4,
        priceListNumber: "PL-2024-FRESH-001",
        priceListName: "Fresh Direct",
        unitPrice: 16.25,
        minQuantity: 25,
        orderUnit: "kg",
        validFrom: "15/02/2024",
        validTo: "15/05/2024",
        leadTime: 1,
        notes: "Same-day delivery available, premium quality"
      }
    ]
  }
};

// Helper function to get vendor options for a specific item
export function getVendorOptionsForItem(itemName: string): ItemVendorData | null {
  return itemVendorDatabase[itemName] || null;
}

// Helper function to find current vendor option by pricelist number
export function getCurrentVendorOption(itemName: string, pricelistNumber: string): ItemVendorOption | null {
  const itemData = getVendorOptionsForItem(itemName);
  if (!itemData) return null;
  
  return itemData.vendorOptions.find(option => option.priceListNumber === pricelistNumber) || null;
}