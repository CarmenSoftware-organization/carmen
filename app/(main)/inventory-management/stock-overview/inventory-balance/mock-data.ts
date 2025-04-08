import { BalanceReport } from "./types"


export const mockBalanceReport: BalanceReport = {
  locations: [
    {
      id: "loc1",
      code: "WH-001",
      name: "Main Warehouse",
      categories: [
        {
          id: "cat1",
          code: "PROD",
          name: "Produce",
          products: [
            {
              id: "prod1",
              code: "P-1001",
              name: "Fresh Tomatoes",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 50,
                maximum: 200
              },
              totals: {
                quantity: 120,
                averageCost: 2.5,
                value: 300
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-01",
                  expiryDate: "2023-05-15",
                  quantity: 70,
                  unitCost: 2.4,
                  value: 168
                },
                {
                  lotNumber: "LOT-2023-05-10",
                  expiryDate: "2023-05-25",
                  quantity: 50,
                  unitCost: 2.64,
                  value: 132
                }
              ]
            },
            {
              id: "prod2",
              code: "P-1002",
              name: "Onions",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 100,
                maximum: 500
              },
              totals: {
                quantity: 350,
                averageCost: 1.8,
                value: 630
              },
              lots: [
                {
                  lotNumber: "LOT-2023-04-15",
                  expiryDate: "2023-06-15",
                  quantity: 200,
                  unitCost: 1.75,
                  value: 350
                },
                {
                  lotNumber: "LOT-2023-05-05",
                  expiryDate: "2023-07-05",
                  quantity: 150,
                  unitCost: 1.87,
                  value: 280
                }
              ]
            },
            {
              id: "prod3",
              code: "P-1003",
              name: "Potatoes",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 200,
                maximum: 800
              },
              totals: {
                quantity: 180,
                averageCost: 1.2,
                value: 216
              },
              lots: [
                {
                  lotNumber: "LOT-2023-04-20",
                  expiryDate: "2023-06-20",
                  quantity: 180,
                  unitCost: 1.2,
                  value: 216
                }
              ]
            }
          ],
          totals: {
            quantity: 650,
            value: 1146
          }
        },
        {
          id: "cat2",
          code: "MEAT",
          name: "Meat & Poultry",
          products: [
            {
              id: "prod4",
              code: "M-2001",
              name: "Chicken Breast",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 50,
                maximum: 150
              },
              totals: {
                quantity: 85,
                averageCost: 8.5,
                value: 722.5
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-08",
                  expiryDate: "2023-05-15",
                  quantity: 85,
                  unitCost: 8.5,
                  value: 722.5
                }
              ]
            },
            {
              id: "prod5",
              code: "M-2002",
              name: "Ground Beef",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 40,
                maximum: 120
              },
              totals: {
                quantity: 65,
                averageCost: 12.75,
                value: 828.75
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-07",
                  expiryDate: "2023-05-14",
                  quantity: 65,
                  unitCost: 12.75,
                  value: 828.75
                }
              ]
            }
          ],
          totals: {
            quantity: 150,
            value: 1551.25
          }
        },
        {
          id: "cat3",
          code: "DAIRY",
          name: "Dairy Products",
          products: [
            {
              id: "prod6",
              code: "D-3001",
              name: "Milk",
              unit: "liter",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 100,
                maximum: 300
              },
              totals: {
                quantity: 250,
                averageCost: 1.95,
                value: 487.5
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-09",
                  expiryDate: "2023-05-16",
                  quantity: 150,
                  unitCost: 1.9,
                  value: 285
                },
                {
                  lotNumber: "LOT-2023-05-11",
                  expiryDate: "2023-05-18",
                  quantity: 100,
                  unitCost: 2.025,
                  value: 202.5
                }
              ]
            },
            {
              id: "prod7",
              code: "D-3002",
              name: "Cheese",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 30,
                maximum: 100
              },
              totals: {
                quantity: 45,
                averageCost: 15.8,
                value: 711
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-01",
                  expiryDate: "2023-06-01",
                  quantity: 45,
                  unitCost: 15.8,
                  value: 711
                }
              ]
            }
          ],
          totals: {
            quantity: 295,
            value: 1198.5
          }
        }
      ],
      totals: {
        quantity: 1095,
        value: 3895.75
      }
    },
    {
      id: "loc2",
      code: "WH-002",
      name: "Secondary Warehouse",
      categories: [
        {
          id: "cat1",
          code: "PROD",
          name: "Produce",
          products: [
            {
              id: "prod1",
              code: "P-1001",
              name: "Fresh Tomatoes",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 50,
                maximum: 200
              },
              totals: {
                quantity: 40,
                averageCost: 2.6,
                value: 104
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-08",
                  expiryDate: "2023-05-22",
                  quantity: 40,
                  unitCost: 2.6,
                  value: 104
                }
              ]
            },
            {
              id: "prod3",
              code: "P-1003",
              name: "Potatoes",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 200,
                maximum: 800
              },
              totals: {
                quantity: 250,
                averageCost: 1.15,
                value: 287.5
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-01",
                  expiryDate: "2023-07-01",
                  quantity: 250,
                  unitCost: 1.15,
                  value: 287.5
                }
              ]
            }
          ],
          totals: {
            quantity: 290,
            value: 391.5
          }
        },
        {
          id: "cat4",
          code: "DRY",
          name: "Dry Goods",
          products: [
            {
              id: "prod8",
              code: "DG-4001",
              name: "Rice",
              unit: "kg",
              tracking: {
                batch: false
              },
              thresholds: {
                minimum: 500,
                maximum: 2000
              },
              totals: {
                quantity: 1200,
                averageCost: 2.25,
                value: 2700
              },
              lots: []
            },
            {
              id: "prod9",
              code: "DG-4002",
              name: "Pasta",
              unit: "kg",
              tracking: {
                batch: false
              },
              thresholds: {
                minimum: 300,
                maximum: 1000
              },
              totals: {
                quantity: 850,
                averageCost: 1.85,
                value: 1572.5
              },
              lots: []
            },
            {
              id: "prod10",
              code: "DG-4003",
              name: "Flour",
              unit: "kg",
              tracking: {
                batch: false
              },
              thresholds: {
                minimum: 400,
                maximum: 1500
              },
              totals: {
                quantity: 950,
                averageCost: 1.35,
                value: 1282.5
              },
              lots: []
            }
          ],
          totals: {
            quantity: 3000,
            value: 5555
          }
        }
      ],
      totals: {
        quantity: 3290,
        value: 5946.5
      }
    },
    {
      id: "loc3",
      code: "KIT-001",
      name: "Main Kitchen",
      categories: [
        {
          id: "cat1",
          code: "PROD",
          name: "Produce",
          products: [
            {
              id: "prod1",
              code: "P-1001",
              name: "Fresh Tomatoes",
              unit: "kg",
              tracking: {
                batch: true
              },
              thresholds: {
                minimum: 50,
                maximum: 200
              },
              totals: {
                quantity: 25,
                averageCost: 2.55,
                value: 63.75
              },
              lots: [
                {
                  lotNumber: "LOT-2023-05-10",
                  expiryDate: "2023-05-17",
                  quantity: 25,
                  unitCost: 2.55,
                  value: 63.75
                }
              ]
            }
          ],
          totals: {
            quantity: 25,
            value: 63.75
          }
        },
        {
          id: "cat5",
          code: "SPICE",
          name: "Spices & Herbs",
          products: [
            {
              id: "prod11",
              code: "S-5001",
              name: "Black Pepper",
              unit: "kg",
              tracking: {
                batch: false
              },
              thresholds: {
                minimum: 5,
                maximum: 20
              },
              totals: {
                quantity: 8,
                averageCost: 25.5,
                value: 204
              },
              lots: []
            },
            {
              id: "prod12",
              code: "S-5002",
              name: "Salt",
              unit: "kg",
              tracking: {
                batch: false
              },
              thresholds: {
                minimum: 10,
                maximum: 50
              },
              totals: {
                quantity: 35,
                averageCost: 1.2,
                value: 42
              },
              lots: []
            }
          ],
          totals: {
            quantity: 43,
            value: 246
          }
        }
      ],
      totals: {
        quantity: 68,
        value: 309.75
      }
    }
  ],
  totals: {
    quantity: 4453,
    value: 10152
  }
} 