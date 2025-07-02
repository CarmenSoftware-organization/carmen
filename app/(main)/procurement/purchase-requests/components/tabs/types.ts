// Local type definitions for ItemsTab components
import type { User as GlobalUser } from "@/lib/types/user";

export type User = GlobalUser;

export interface OrderItem {
  id: string;
  location: string;
  product: string;
  productDescription: string;
  sku: string;
  orderUnit: string;
  invUnit: string;
  requestQuantity: number;
  onOrderQuantity: number;
  onOrderInvUnit: number;
  approvedQuantity: number;
  onHandQuantity: number;
  onHandInvUnit: number;
  currency: string;
  baseCurrency: string;
  price: number;
  lastPrice: number;
  baseCurrencyPrice: number;
  baseCurrencyLastPrice: number;
  total: number;
  baseCurrencyTotal: number;
  conversionRate: number;
  status: "pending" | "approved" | "rejected" | "Review";
  requestorId: string;
  requestorName: string;
  department: string;
  requestDate: string;
  expectedDeliveryDate?: string;
  approvalDate?: string;
  approvedBy?: string;
  reviewDate?: string;
  reviewedBy?: string;
  vendorAllocationDate?: string;
  vendorAllocatedBy?: string;
  vendor: string;
  lastVendor?: string;
  vendorCode?: string;
  vendorContact?: string;
  comment?: string;
}