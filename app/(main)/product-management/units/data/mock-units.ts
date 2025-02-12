import { Unit } from "../components/unit-list"

export const mockUnits: Unit[] = [
  // Inventory Units
  {
    id: "1",
    code: "KG",
    name: "Kilogram",
    description: "Standard weight measurement for inventory",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2",
    code: "G",
    name: "Gram",
    description: "Smaller weight measurement for precise inventory",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "3",
    code: "L",
    name: "Liter",
    description: "Standard liquid measurement for inventory",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "4",
    code: "ML",
    name: "Milliliter",
    description: "Smaller liquid measurement for precise inventory",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },

  // Order Units
  {
    id: "5",
    code: "BOX",
    name: "Box",
    description: "Standard box unit for orders",
    type: "ORDER",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "6",
    code: "CTN",
    name: "Carton",
    description: "Carton unit for bulk orders",
    type: "ORDER",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "7",
    code: "PLT",
    name: "Pallet",
    description: "Pallet unit for large orders",
    type: "ORDER",
    isActive: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },

  // Recipe Units
  {
    id: "8",
    code: "TSP",
    name: "Teaspoon",
    description: "Teaspoon measurement for recipes",
    type: "RECIPE",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "9",
    code: "TBSP",
    name: "Tablespoon",
    description: "Tablespoon measurement for recipes",
    type: "RECIPE",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "10",
    code: "CUP",
    name: "Cup",
    description: "Cup measurement for recipes",
    type: "RECIPE",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },

  // Counting Units
  {
    id: "11",
    code: "PC",
    name: "Piece",
    description: "Single item count",
    type: "COUNTING",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "12",
    code: "DOZ",
    name: "Dozen",
    description: "Group of twelve items",
    type: "COUNTING",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "13",
    code: "GRS",
    name: "Gross",
    description: "Group of 144 items (12 dozens)",
    type: "COUNTING",
    isActive: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },

  // Additional Units with Various States
  {
    id: "14",
    code: "BG",
    name: "Bag",
    description: "Standard bag unit for orders",
    type: "ORDER",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "15",
    code: "CASE",
    name: "Case",
    description: "Case unit for specific product orders",
    type: "ORDER",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
] 