/**
 * Finance Types
 * 
 * Types and interfaces for financial management including currencies,
 * exchange rates, invoicing, payments, and financial reporting.
 */

import { AuditTimestamp, Money, DocumentStatus } from './common'

// ====== CURRENCY MANAGEMENT ======

/**
 * Enhanced currency with additional properties
 */
export interface Currency {
  id: string;
  code: string; // ISO 4217 currency code (USD, EUR, etc.)
  name: string;
  symbol: string; // Currency symbol ($, €, £, etc.)
  description?: string;
  // Regional information
  country?: string;
  region?: string;
  // Display preferences
  symbolPosition: 'before' | 'after'; // Position relative to amount
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  // Exchange rate information
  isBaseCurrency: boolean;
  currentExchangeRate?: number;
  lastRateUpdate?: Date;
  rateSource?: string;
  // Settings
  isActive: boolean;
  allowNegativeBalance: boolean;
  roundingMethod: 'round' | 'floor' | 'ceil';
  minimumAmount?: number;
  maximumAmount?: number;
  ...AuditTimestamp;
}

/**
 * Enhanced exchange rate with historical tracking
 */
export interface ExchangeRate {
  id: string;
  fromCurrency: string; // Currency code
  toCurrency: string; // Currency code
  rate: number;
  inverseRate: number; // Calculated inverse for quick lookup
  // Rate information
  effectiveDate: Date;
  source: ExchangeRateSource;
  rateType: 'spot' | 'forward' | 'historical' | 'manual';
  // Metadata
  isActive: boolean;
  confidence: number; // 0-100 reliability score
  spread?: number; // Bid-ask spread
  volatility?: number; // Rate volatility measure
  // Provider information
  providerId?: string;
  providerName?: string;
  fetchedAt?: Date;
  // Manual rate information
  setBy?: string; // User who set manual rate
  reason?: string; // Reason for manual rate
  expiresAt?: Date; // For manual rates
  ...AuditTimestamp;
}

/**
 * Exchange rate sources
 */
export enum ExchangeRateSource {
  CENTRAL_BANK = "CENTRAL_BANK",
  COMMERCIAL_BANK = "COMMERCIAL_BANK",
  REUTERS = "REUTERS",
  BLOOMBERG = "BLOOMBERG",
  XE = "XE",
  FIXER = "FIXER",
  OPEN_EXCHANGE_RATES = "OPEN_EXCHANGE_RATES",
  MANUAL = "MANUAL",
  SYSTEM_DEFAULT = "SYSTEM_DEFAULT"
}

/**
 * Exchange rate history for tracking changes
 */
export interface ExchangeRateHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  date: Date;
  openRate: number;
  closeRate: number;
  highRate: number;
  lowRate: number;
  averageRate: number;
  volume?: number;
  source: ExchangeRateSource;
  ...AuditTimestamp;
}

// ====== PAYMENT TERMS ======

/**
 * Payment terms definition
 */
export interface PaymentTerms {
  id: string;
  code: string;
  name: string;
  description?: string;
  // Terms configuration
  paymentDays: number; // Days from invoice date
  discountDays?: number; // Days for early payment discount
  discountPercentage?: number; // Early payment discount percentage
  // Payment schedule
  paymentType: 'net' | 'eom' | 'cod' | 'advance' | 'installment';
  installments?: PaymentInstallment[];
  // Grace period
  gracePeriodDays?: number;
  lateFeePercentage?: number;
  lateFeeAmount?: Money;
  // Restrictions
  minimumAmount?: Money;
  maximumAmount?: Money;
  applicableCurrencies?: string[];
  // Status
  isActive: boolean;
  isDefault: boolean;
  ...AuditTimestamp;
}

/**
 * Payment installment for complex payment terms
 */
export interface PaymentInstallment {
  installmentNumber: number;
  percentage: number; // Percentage of total amount
  daysFromInvoice: number;
  description?: string;
}

// ====== CHART OF ACCOUNTS ======

/**
 * Account types
 */
export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE"
}

/**
 * Chart of accounts
 */
export interface ChartOfAccounts {
  id: string;
  accountCode: string;
  accountName: string;
  description?: string;
  accountType: AccountType;
  parentAccountId?: string;
  level: number;
  // Balance information
  normalBalance: 'debit' | 'credit';
  currentBalance: Money;
  // Settings
  isActive: boolean;
  allowDirectPosting: boolean;
  requiresDepartment: boolean;
  requiresProject: boolean;
  // Tax information
  taxCodeId?: string;
  isTaxAccount: boolean;
  // Reconciliation
  requiresReconciliation: boolean;
  lastReconciledDate?: Date;
  // Reporting
  reportingCategory?: string;
  consolidationAccount?: string;
  ...AuditTimestamp;
}

// ====== INVOICING ======

/**
 * Invoice types
 */
export type InvoiceType = 'standard' | 'proforma' | 'recurring' | 'credit_note' | 'debit_note';

/**
 * Invoice status
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled' | 'void';

/**
 * Invoice header
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  // Dates
  invoiceDate: Date;
  dueDate: Date;
  paymentTermsId: string;
  // Parties
  vendorId?: string; // For purchase invoices
  customerId?: string; // For sales invoices
  billToAddress: InvoiceAddress;
  shipToAddress?: InvoiceAddress;
  // Currency and amounts
  currency: string;
  exchangeRate: number;
  subtotal: Money;
  totalTax: Money;
  totalDiscount: Money;
  totalAmount: Money;
  paidAmount: Money;
  balanceAmount: Money;
  // Reference documents
  purchaseOrderId?: string;
  grnId?: string;
  contractId?: string;
  // Line items
  lineItems: InvoiceLineItem[];
  totalItems: number;
  // Tax information
  taxExempt: boolean;
  taxExemptReason?: string;
  // Payment information
  paymentTerms: string;
  paymentMethod?: string;
  bankAccountId?: string;
  // Approval workflow
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  // Communication
  sentAt?: Date;
  sentBy?: string;
  viewedAt?: Date;
  // Notes and attachments
  notes?: string;
  internalNotes?: string;
  attachments?: string[];
  // Recurring invoice settings
  isRecurring: boolean;
  recurringSchedule?: RecurringSchedule;
  // Audit trail
  ...AuditTimestamp;
}

/**
 * Invoice address information
 */
export interface InvoiceAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  taxId?: string;
  email?: string;
  phone?: string;
}

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  lineNumber: number;
  // Item information
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description: string;
  // Quantity and pricing
  quantity: number;
  unit: string;
  unitPrice: Money;
  discount: number; // percentage
  discountAmount: Money;
  lineTotal: Money;
  // Tax information
  taxCodeId?: string;
  taxRate: number;
  taxAmount: Money;
  // Account coding
  accountId?: string;
  departmentId?: string;
  projectId?: string;
  costCenterId?: string;
  // Reference
  purchaseOrderLineId?: string;
  grnLineId?: string;
  notes?: string;
}

/**
 * Recurring invoice schedule
 */
export interface RecurringSchedule {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number; // Every N periods
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
  currentOccurrence: number;
  nextInvoiceDate: Date;
  isActive: boolean;
}

// ====== PAYMENTS ======

/**
 * Payment methods
 */
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'ach' | 'wire' | 'paypal' | 'crypto';

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

/**
 * Payment record
 */
export interface Payment {
  id: string;
  paymentNumber: string;
  paymentType: 'vendor_payment' | 'customer_payment' | 'internal_transfer';
  status: PaymentStatus;
  // Amount information
  amount: Money;
  currency: string;
  exchangeRate: number;
  // Dates
  paymentDate: Date;
  valueDate?: Date; // When funds are available
  dueDate?: Date;
  // Parties
  payerId?: string; // Customer/Vendor ID
  payeeId?: string;
  // Payment details
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  checkNumber?: string;
  referenceNumber?: string;
  // Associated documents
  invoices: PaymentInvoiceAllocation[];
  // Bank information
  bankTransactionId?: string;
  clearingDate?: Date;
  reconciled: boolean;
  reconciledBy?: string;
  reconciledAt?: Date;
  // Processing information
  processedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  // Fees and charges
  processingFee?: Money;
  bankCharges?: Money;
  exchangeLoss?: Money;
  exchangeGain?: Money;
  netAmount: Money;
  // Notes
  notes?: string;
  internalNotes?: string;
  attachments?: string[];
  ...AuditTimestamp;
}

/**
 * Payment allocation to invoices
 */
export interface PaymentInvoiceAllocation {
  invoiceId: string;
  invoiceNumber: string;
  originalAmount: Money;
  paidAmount: Money;
  discount: Money;
  exchangeDifference?: Money;
}

// ====== BANK ACCOUNTS ======

/**
 * Bank account types
 */
export type BankAccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'payroll';

/**
 * Bank account
 */
export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccountType;
  // Bank information
  bankName: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  iban?: string;
  swiftCode?: string;
  routingNumber?: string;
  // Account details
  currency: string;
  currentBalance: Money;
  availableBalance: Money;
  overdraftLimit?: Money;
  // Settings
  isActive: boolean;
  isPrimaryAccount: boolean;
  allowOnlinePayments: boolean;
  requiresApproval: boolean;
  // Reconciliation
  lastReconciledDate?: Date;
  lastReconciledBalance?: Money;
  unReconciledTransactions: number;
  // Signatory information
  signatories: AccountSignatory[];
  requiredSignatures: number;
  // Audit
  lastStatementDate?: Date;
  nextStatementDate?: Date;
  ...AuditTimestamp;
}

/**
 * Bank account signatory
 */
export interface AccountSignatory {
  id: string;
  userId: string;
  userName: string;
  signatureLevel: number; // Priority level
  maximumAmount?: Money;
  canApprovePayments: boolean;
  canInitiateTransfers: boolean;
  isActive: boolean;
  authorizedBy: string;
  authorizedAt: Date;
}

// ====== FINANCIAL REPORTING ======

/**
 * Financial period
 */
export interface FinancialPeriod {
  id: string;
  periodName: string;
  fiscalYear: string;
  periodType: 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'locked';
  // Closing information
  closedBy?: string;
  closedAt?: Date;
  adjustmentEntries?: number;
  // Period balances
  openingBalance: Money;
  closingBalance: Money;
  netIncome: Money;
  ...AuditTimestamp;
}

/**
 * Budget information
 */
export interface Budget {
  id: string;
  budgetName: string;
  fiscalYear: string;
  departmentId?: string;
  categoryId?: string;
  // Budget amounts
  originalBudget: Money;
  revisedBudget: Money;
  actualAmount: Money;
  committedAmount: Money;
  availableAmount: Money;
  variance: Money;
  variancePercentage: number;
  // Period information
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Status
  status: 'draft' | 'approved' | 'active' | 'closed';
  approvedBy?: string;
  approvedAt?: Date;
  // Tracking
  lastUpdated: Date;
  alerts: BudgetAlert[];
  ...AuditTimestamp;
}

/**
 * Budget alert
 */
export interface BudgetAlert {
  id: string;
  alertType: 'utilization' | 'overrun' | 'variance';
  threshold: number; // percentage
  currentValue: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// ====== TAX MANAGEMENT ======

/**
 * Tax types
 */
export type TaxType = 'vat' | 'gst' | 'sales_tax' | 'withholding_tax' | 'excise_tax' | 'import_duty';

/**
 * Tax code definition
 */
export interface TaxCode {
  id: string;
  taxCode: string;
  taxName: string;
  description?: string;
  taxType: TaxType;
  // Rate information
  taxRate: number; // percentage
  isCompound: boolean; // Compound tax calculation
  // Applicability
  effectiveDate: Date;
  expiryDate?: Date;
  applicableRegions: string[];
  // Account mapping
  taxPayableAccountId: string;
  taxReceivableAccountId: string;
  // Settings
  isActive: boolean;
  isDefault: boolean;
  roundingMethod: 'round' | 'floor' | 'ceil';
  // Reporting
  reportingCategory?: string;
  governmentCode?: string;
  ...AuditTimestamp;
}

/**
 * Cost center for expense allocation
 */
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  // Management
  managerId: string;
  departmentId?: string;
  // Budget information
  budgetAmount?: Money;
  actualAmount: Money;
  // Status
  isActive: boolean;
  ...AuditTimestamp;
}