import { create } from "zustand";
import { HotelLocation, HotelProduct } from "../mock/hotel-data";
import { v4 as uuidv4 } from "uuid";

export type CountStatus = 'pending' | 'in_progress' | 'completed' | 'discrepancy';

interface CountAllocation {
  id: string;
  productId: string;
  expectedQuantity: number;
  status: CountStatus;
  actualQuantity?: number;
  notes?: string;
}

interface CountSession {
  id: string;
  type: 'physical' | 'spot';
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  countDate: Date;
  startTime: string;
  endTime?: string;
  reason: string;
  department: string;
  counter: string;
  locations: string[];
  targetCount: number;
  totalItems: number;
  discrepancies: number;
  notes?: string;
  allocations: CountAllocation[];
  updatedAt: Date;
  createdAt: Date;
}

interface ActiveCount {
  id: string
  counter: string
  department: string
  startTime: string
  duration: string
  locations: string[]
  status: 'pending' | 'in-progress' | 'paused'
  totalItems: number
  completedItems: number
  matches: number
  variances: number
  pending: number
}

interface CountStore {
  // Count Session
  currentSession: CountSession | null;
  selectedLocations: string[];
  selectedProducts: HotelProduct[];
  
  // Setup Actions
  initializeSession: (data: SessionInit) => void;
  
  // Location Actions
  setSelectedLocations: (locations: string[]) => void;
  addLocation: (locationId: string) => void;
  removeLocation: (locationId: string) => void;
  
  // Product Actions
  setSelectedProducts: (products: HotelProduct[]) => void;
  addProduct: (product: HotelProduct) => void;
  removeProduct: (productId: string) => void;
  
  // Count Session Actions
  startCount: () => void;
  cancelCount: () => void;
  completeCount: () => void;
  resetSession: () => void;
  
  // Active Counts
  activeCounts: ActiveCount[]
  addActiveCount: (count: ActiveCount) => void
  updateActiveCount: (id: string, updates: Partial<ActiveCount>) => void
  removeActiveCount: (id: string) => void
}

interface SessionInit {
  counterName: string;
  department: string;
  date: Date;
  time: string;
  notes: string;
  type: "spot" | "physical";
  selectedLocations: string[];
}

const mockActiveCounts: ActiveCount[] = [
  {
    id: "CNT-20240420-abc12",
    counter: "John Doe",
    department: "F&B",
    startTime: "2024-04-20 09:00",
    duration: "45m",
    locations: ["Main Kitchen", "Dry Store"],
    status: "pending",
    totalItems: 45,
    completedItems: 0,
    matches: 0,
    variances: 0,
    pending: 45
  },
  {
    id: "CNT-20240420-def34",
    counter: "Jane Smith",
    department: "Housekeeping",
    startTime: "2024-04-20 10:30",
    duration: "30m",
    locations: ["Linen Room", "Storage Room"],
    status: "in-progress",
    totalItems: 30,
    completedItems: 15,
    matches: 12,
    variances: 3,
    pending: 15
  },
  {
    id: "CNT-20240420-ghi56",
    counter: "Mike Johnson",
    department: "F&B",
    startTime: "2024-04-20 11:15",
    duration: "20m",
    locations: ["Bar", "Wine Cellar"],
    status: "paused",
    totalItems: 25,
    completedItems: 10,
    matches: 8,
    variances: 2,
    pending: 15
  }
];

export const useCountStore = create<CountStore>((set) => ({
  currentSession: null,
  selectedLocations: [],
  selectedProducts: [],

  // Initialize a new count session
  initializeSession: (data: SessionInit) => {
    const sessionId = uuidv4();
    set({
      currentSession: {
        id: sessionId,
        type: data.type,
        status: 'draft',
        countDate: data.date,
        startTime: data.time,
        reason: data.notes,
        department: data.department,
        counter: data.counterName,
        locations: data.selectedLocations,
        targetCount: 0,
        totalItems: 0,
        discrepancies: 0,
        notes: data.notes,
        allocations: [],
        updatedAt: new Date(),
        createdAt: new Date(),
      }
    });
  },

  // Location management
  setSelectedLocations: (locations) => {
    set({ selectedLocations: locations });
  },

  addLocation: (locationId) => {
    set((state): Partial<CountStore> => ({
      selectedLocations: [...state.selectedLocations, locationId],
    }));
  },

  removeLocation: (locationId) => {
    set((state): Partial<CountStore> => ({
      selectedLocations: state.selectedLocations.filter((loc) => loc !== locationId),
    }));
  },

  // Product management
  setSelectedProducts: (products) => {
    set((state): Partial<CountStore> => {
      if (!state.currentSession) return { selectedProducts: products };

      const allocations: CountAllocation[] = products.map((product) => ({
        id: uuidv4(),
        productId: product.id,
        expectedQuantity: product.currentStock || 0,
        status: 'pending' as const,
      }));

      const updatedSession: CountSession = {
        ...state.currentSession,
        allocations,
        totalItems: products.length,
        updatedAt: new Date(),
      };

      return {
        selectedProducts: products,
        currentSession: updatedSession,
      };
    });
  },

  addProduct: (product) => {
    set((state): Partial<CountStore> => {
      const newProducts = [...state.selectedProducts, product];
      const newAllocation: CountAllocation = {
        id: uuidv4(),
        productId: product.id,
        expectedQuantity: product.currentStock || 0,
        status: 'pending' as const,
      };

      const newSession = state.currentSession
        ? {
            ...state.currentSession,
            allocations: [...state.currentSession.allocations, newAllocation],
            totalItems: state.currentSession.totalItems + 1,
            updatedAt: new Date(),
          }
        : null;

      return {
        selectedProducts: newProducts,
        currentSession: newSession,
      };
    });
  },

  removeProduct: (productId) => {
    set((state): Partial<CountStore> => {
      const newProducts = state.selectedProducts.filter(
        (product) => product.id !== productId
      );

      const newSession = state.currentSession
        ? {
            ...state.currentSession,
            allocations: state.currentSession.allocations.filter(
              (allocation) => allocation.productId !== productId
            ),
            totalItems: state.currentSession.totalItems - 1,
            updatedAt: new Date(),
          }
        : null;

      return {
        selectedProducts: newProducts,
        currentSession: newSession,
      };
    });
  },

  // Count session management
  startCount: () => {
    set((state): Partial<CountStore> => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            status: 'in_progress',
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  cancelCount: () => {
    set((state): Partial<CountStore> => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            status: 'cancelled',
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  completeCount: () => {
    set((state): Partial<CountStore> => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            status: 'completed',
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  resetSession: () => {
    set({
      currentSession: null,
      selectedLocations: [],
      selectedProducts: [],
    });
  },

  // Active Counts
  activeCounts: mockActiveCounts,
  addActiveCount: (count) => 
    set((state): Partial<CountStore> => ({
      activeCounts: [...state.activeCounts, count]
    })),
  updateActiveCount: (id, updates) =>
    set((state): Partial<CountStore> => ({
      activeCounts: state.activeCounts.map(count =>
        count.id === id ? { ...count, ...updates } : count
      )
    })),
  removeActiveCount: (id) =>
    set((state): Partial<CountStore> => ({
      activeCounts: state.activeCounts.filter(count => count.id !== id)
    })),
}));
