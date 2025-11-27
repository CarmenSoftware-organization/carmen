import { create } from 'zustand';
import { Vendor, PurchaseOrder, GoodsReceiveNoteItem, GoodsReceiveNote } from '@/lib/types';

type ProcessType = 'po' | 'manual' | null;
type Step = 'process-selection' | 'vendor-selection' | 'po-selection' | 'item-location-selection' | 'manual-entry' | 'confirmation';

interface GRNDetails {
  reference?: string;
  remarks?: string;
  date?: Date;
  vendor?: string; // Add vendor name or ID for manual entry
  // Add other header fields as needed
}

interface GRNCreationState {
  processType: ProcessType;
  currentStep: Step;
  selectedVendor: Vendor | null;
  selectedPOs: PurchaseOrder[]; // Or just PO IDs: string[]
  selectedItems: GoodsReceiveNoteItem[]; // *** This will store the final GRN items to be created ***
  manualItems: GoodsReceiveNoteItem[]; // Items entered manually
  grnDetails: GRNDetails; // For manual GRN header info
  newlyCreatedGRNData: GoodsReceiveNote | null; // State to hold data before saving
  setProcessType: (type: ProcessType) => void;
  setStep: (step: Step) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  setSelectedPOs: (pos: PurchaseOrder[]) => void; // Or (poIds: string[]) => void
  setGRNItemsToCreate: (items: GoodsReceiveNoteItem[]) => void;
  addGRNItemToCreate: (item: GoodsReceiveNoteItem) => void;
  updateGRNItemToCreate: (itemId: string, updates: Partial<GoodsReceiveNoteItem>) => void;
  removeGRNItemToCreate: (itemId: string) => void;
  setManualItems: (items: GoodsReceiveNoteItem[]) => void;
  addManualItem: (item: GoodsReceiveNoteItem) => void;
  updateManualItem: (itemId: string, updates: Partial<GoodsReceiveNoteItem>) => void;
  removeManualItem: (itemId: string) => void;
  setGrnDetails: (details: Partial<GRNDetails>) => void;
  setNewlyCreatedGRNData: (data: GoodsReceiveNote | null) => void; // Action to set the data
  resetStore: () => void;
}

const initialState = {
  processType: null,
  currentStep: 'process-selection' as Step,
  selectedVendor: null,
  selectedPOs: [],
  selectedItems: [],
  manualItems: [],
  grnDetails: { vendor: undefined, reference: undefined, remarks: undefined, date: undefined }, // Initialize fields
  newlyCreatedGRNData: null, // Initialize new state
};

export const useGRNCreationStore = create<GRNCreationState>((set) => ({
  ...initialState,
  setProcessType: (type) => set({ processType: type, currentStep: type === 'po' ? 'vendor-selection' : type === 'manual' ? 'manual-entry' : 'process-selection' }),
  setStep: (step) => set({ currentStep: step }),
  setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),
  setSelectedPOs: (pos) => set({ selectedPOs: pos }),
  setGRNItemsToCreate: (items) => set({ selectedItems: items }),
  addGRNItemToCreate: (item) => set((state) => ({ selectedItems: [...state.selectedItems, item] })),
  updateGRNItemToCreate: (itemId, updates) =>
    set((state) => ({
      selectedItems: state.selectedItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),
  removeGRNItemToCreate: (itemId) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((item) => item.id !== itemId),
    })),
  setManualItems: (items) => set({ manualItems: items }),
  addManualItem: (item) => set((state) => ({ manualItems: [...state.manualItems, item] })),
  updateManualItem: (itemId, updates) =>
    set((state) => ({
      manualItems: state.manualItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),
  removeManualItem: (itemId) =>
    set((state) => ({
      manualItems: state.manualItems.filter((item) => item.id !== itemId),
    })),
  setGrnDetails: (details) => set((state) => ({ grnDetails: { ...state.grnDetails, ...details } })),
  setNewlyCreatedGRNData: (data) => set({ newlyCreatedGRNData: data }),
  resetStore: () => set(initialState),
})); 