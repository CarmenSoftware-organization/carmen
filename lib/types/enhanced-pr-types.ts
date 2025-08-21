import { PurchaseRequestItem } from '../types';
import { PriceAssignmentResult, VendorPriceOption } from './price-management';

// Enhanced PR Item with Price Assignment Integration
export interface EnhancedPRItem extends PurchaseRequestItem {
  // Price Assignment Fields
  priceAssignment?: PriceAssignmentResult;
  vendorOptions?: VendorPriceOption[];
  priceHistory?: PriceHistoryEntry[];
  currencyInfo?: CurrencyInfo;
  isAutoAssigned: boolean;
  isManualOverride: boolean;
  assignmentConfidence?: number;
  
  // Price Alert Fields
  priceAlerts?: PriceAlert[];
  hasActiveAlerts: boolean;
  
  // Assignment Status
  assignmentStatus: 'pending' | 'assigned' | 'failed' | 'manual_review';
  assignmentDate?: Date;
  assignedBy?: string;
  
  // Override Information
  overrideHistory?: PriceOverrideEntry[];
  canOverride: boolean;
  
  // Comparison Data
  alternativeVendors?: VendorComparison[];
  savingsOpportunity?: SavingsAnalysis;
}

export interface PriceHistoryEntry {
  date: Date;
  price: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  changePercentage: number;
}

export interface CurrencyInfo {
  originalCurrency: string;
  displayCurrency: string;
  exchangeRate: number;
  lastUpdated: Date;
}

export interface PriceAlert {
  id: string;
  type: 'price_increase' | 'price_decrease' | 'vendor_unavailable' | 'price_volatility';
  severity: 'low' | 'medium' | 'high';
  message: string;
  impact: string;
  recommendedAction: string;
  effectiveDate: Date;
  detectedDate: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
}

export interface PriceOverrideEntry {
  id: string;
  originalVendorId: string;
  originalVendorName: string;
  originalPrice: number;
  newVendorId: string;
  newVendorName: string;
  newPrice: number;
  currency: string;
  reason: string;
  overriddenBy: string;
  overrideDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface VendorComparison {
  vendorId: string;
  vendorName: string;
  price: number;
  currency: string;
  normalizedPrice: number;
  availability: 'available' | 'limited' | 'unavailable';
  leadTime: number;
  rating: number;
  isPreferred: boolean;
  minQuantity: number;
  totalCost: number;
  savings: number;
  savingsPercentage: number;
  qualityScore: number;
  deliveryScore: number;
  overallScore: number;
}

export interface SavingsAnalysis {
  potentialSavings: number;
  savingsPercentage: number;
  bestAlternativeVendor: {
    vendorId: string;
    vendorName: string;
    price: number;
    savings: number;
  };
  riskAssessment: 'low' | 'medium' | 'high';
  recommendation: string;
}

// PR Integration Types
export interface PRPriceAssignmentContext {
  prId: string;
  prNumber: string;
  requestorId: string;
  department: string;
  location: string;
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent';
  budgetLimit?: number;
  approvalLevel: string;
  items: EnhancedPRItem[];
}

export interface PRPriceAssignmentResult {
  prId: string;
  totalItems: number;
  assignedItems: number;
  failedItems: number;
  manualReviewItems: number;
  totalSavings: number;
  averageConfidence: number;
  assignmentSummary: {
    autoAssigned: number;
    manualOverride: number;
    requiresReview: number;
  };
  alerts: PriceAlert[];
  recommendations: string[];
}

// Component Props Types
export interface EnhancedItemsTabProps {
  prId: string;
  items: EnhancedPRItem[];
  onItemUpdate: (itemId: string, updates: Partial<EnhancedPRItem>) => void;
  onPriceOverride: (itemId: string, override: PriceOverrideEntry) => void;
  onVendorCompare: (itemId: string) => void;
  onPriceHistoryView: (itemId: string) => void;
  userRole: 'requestor' | 'approver' | 'purchaser';
  canEditPrices: boolean;
  canOverridePrices: boolean;
}

export interface VendorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  prItem: EnhancedPRItem;
  onVendorSelect: (vendorId: string) => void;
  onPriceOverride: (override: PriceOverrideEntry) => void;
}

export interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prItem: EnhancedPRItem;
  priceHistory: PriceHistoryEntry[];
}

export interface PriceAlertBadgeProps {
  alerts: PriceAlert[];
  onAlertClick: (alert: PriceAlert) => void;
  onAcknowledge: (alertId: string) => void;
}

// Service Types
export interface PRPriceAssignmentService {
  assignPricesForPR(prId: string): Promise<PRPriceAssignmentResult>;
  assignPriceForItem(prItemId: string): Promise<PriceAssignmentResult>;
  overrideItemPrice(prItemId: string, override: PriceOverrideEntry): Promise<void>;
  getVendorComparison(prItemId: string): Promise<VendorComparison[]>;
  getPriceHistory(productId: string): Promise<PriceHistoryEntry[]>;
  getPriceAlerts(prItemId: string): Promise<PriceAlert[]>;
  acknowledgePriceAlert(alertId: string, userId: string): Promise<void>;
}