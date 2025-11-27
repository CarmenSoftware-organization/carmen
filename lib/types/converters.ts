/**
 * Type Conversion Utilities
 * 
 * Functions to convert between different types and transform data structures.
 * These utilities help with data mapping and type transformations.
 */

import { 
  PurchaseRequest, 
  PurchaseOrder, 
  PurchaseRequestItem,
  PurchaseOrderItem,
  Money,
  User,
  Vendor,
  Product,
  Recipe,
  InventoryItem
} from './index'

// ====== PURCHASE REQUEST TO PURCHASE ORDER ======

/**
 * Convert a PurchaseRequest to a PurchaseOrder
 */
export const purchaseRequestToPurchaseOrder = (
  pr: PurchaseRequest,
  vendorId: string,
  vendor: Vendor,
  approvedBy: string
): Omit<PurchaseOrder, 'id'> => {
  const now = new Date();
  
  return {
    orderNumber: generateOrderNumber('PO'),
    orderDate: now,
    vendorId: vendorId,
    vendorName: vendor.companyName,
    vendorAddress: vendor.addresses.find(addr => addr.isPrimary)?.addressLine || '',
    vendorContact: vendor.contacts.find(contact => contact.isPrimary)?.email || '',
    status: 'draft',
    currency: 'USD', // Default currency
    exchangeRate: 1.0,
    subtotal: pr.estimatedTotal ?? { amount: 0, currency: pr.currency || 'THB' },
    taxAmount: { amount: 0, currency: pr.currency || 'THB' }, // Calculate based on tax rules
    discountAmount: { amount: 0, currency: pr.currency || 'THB' },
    totalAmount: pr.estimatedTotal ?? { amount: 0, currency: pr.currency || 'THB' },
    deliveryLocationId: pr.locationId,
    expectedDeliveryDate: pr.requiredDate,
    paymentTerms: vendor.preferredPaymentTerms || 'Net 30',
    terms: {
      paymentTerms: vendor.preferredPaymentTerms || 'Net 30',
      deliveryTerms: 'FOB Destination',
      warrantyPeriod: 365,
      returnPolicy: 'Standard return policy applies',
      penaltyClause: 'Late delivery penalty may apply',
      specialInstructions: pr.notes || ''
    },
    approvedBy: approvedBy,
    approvedAt: now,
    totalItems: pr.totalItems,
    receivedItems: 0,
    pendingItems: pr.totalItems,
    notes: `Generated from PR: ${pr.requestNumber}`,
    attachments: pr.attachments || [],
    createdAt: now,
    createdBy: approvedBy,
    updatedAt: now,
    updatedBy: approvedBy
  };
};

/**
 * Convert PurchaseRequestItem to PurchaseOrderItem
 */
export const purchaseRequestItemToPurchaseOrderItem = (
  prItem: PurchaseRequestItem,
  orderId: string,
  lineNumber: number
): Omit<PurchaseOrderItem, 'id'> => {
  return {
    orderId: orderId,
    lineNumber: lineNumber,
    itemId: prItem.itemId,
    itemCode: prItem.itemCode,
    itemName: prItem.itemName,
    description: prItem.description,
    specification: prItem.specification,
    orderedQuantity: prItem.approvedQuantity || prItem.requestedQuantity,
    receivedQuantity: 0,
    pendingQuantity: prItem.approvedQuantity || prItem.requestedQuantity,
    unit: prItem.unit,
    unitPrice: prItem.approvedUnitPrice || prItem.estimatedUnitPrice || { amount: 0, currency: 'USD' },
    discount: 0,
    discountAmount: { amount: 0, currency: 'USD' },
    lineTotal: prItem.approvedTotal || prItem.estimatedTotal || { amount: 0, currency: 'USD' },
    taxRate: 0, // Calculate based on tax rules
    taxAmount: { amount: 0, currency: 'USD' },
    deliveryDate: prItem.requiredDate,
    status: 'pending',
    notes: prItem.notes,
    sourceRequestId: prItem.requestId,
    sourceRequestItemId: prItem.id
  };
};

// ====== MONEY CONVERSIONS ======

/**
 * Convert Money to different currency
 */
export const convertMoney = (
  money: Money, 
  targetCurrency: string, 
  exchangeRate: number
): Money => {
  if (money.currency === targetCurrency) {
    return money;
  }
  
  return {
    amount: money.amount * exchangeRate,
    currency: targetCurrency
  };
};

/**
 * Add two Money objects (must be same currency)
 */
export const addMoney = (money1: Money, money2: Money): Money => {
  if (money1.currency !== money2.currency) {
    throw new Error(`Cannot add money with different currencies: ${money1.currency} and ${money2.currency}`);
  }
  
  return {
    amount: money1.amount + money2.amount,
    currency: money1.currency
  };
};

/**
 * Subtract Money objects (must be same currency)
 */
export const subtractMoney = (money1: Money, money2: Money): Money => {
  if (money1.currency !== money2.currency) {
    throw new Error(`Cannot subtract money with different currencies: ${money1.currency} and ${money2.currency}`);
  }
  
  return {
    amount: money1.amount - money2.amount,
    currency: money1.currency
  };
};

/**
 * Multiply Money by a factor
 */
export const multiplyMoney = (money: Money, factor: number): Money => {
  return {
    amount: money.amount * factor,
    currency: money.currency
  };
};

/**
 * Format Money for display
 */
export const formatMoney = (money: Money, locale: string = 'en-US'): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(money.amount);
};

// ====== USER CONVERSIONS ======

/**
 * Get user display name with role
 */
export const getUserDisplayName = (user: User, includeRole: boolean = false): string => {
  if (includeRole) {
    return `${user.name} (${user.context.currentRole.name})`;
  }
  return user.name;
};

/**
 * Convert user to dropdown option
 */
export const userToOption = (user: User) => ({
  value: user.id,
  label: user.name,
  description: `${user.context.currentRole.name} - ${user.context.currentDepartment.name}`
});

// ====== VENDOR CONVERSIONS ======

/**
 * Get vendor display name
 */
export const getVendorDisplayName = (vendor: Vendor): string => {
  return vendor.displayName || vendor.companyName;
};

/**
 * Convert vendor to dropdown option
 */
export const vendorToOption = (vendor: Vendor) => ({
  value: vendor.id,
  label: getVendorDisplayName(vendor),
  description: vendor.businessType
});

/**
 * Get vendor primary contact
 */
export const getVendorPrimaryContact = (vendor: Vendor) => {
  return vendor.contacts.find(contact => contact.isPrimary) || vendor.contacts[0];
};

/**
 * Get vendor primary address
 */
export const getVendorPrimaryAddress = (vendor: Vendor) => {
  return vendor.addresses.find(address => address.isPrimary) || vendor.addresses[0];
};

// ====== PRODUCT CONVERSIONS ======

/**
 * Get product display name
 */
export const getProductDisplayName = (product: Product): string => {
  return product.displayName || product.productName;
};

/**
 * Convert product to dropdown option
 */
export const productToOption = (product: Product) => ({
  value: product.id,
  label: getProductDisplayName(product),
  description: `${product.productCode} - ${product.description || ''}`
});

/**
 * Get product base unit
 */
export const getProductBaseUnit = (product: Product): string => {
  return product.baseUnit;
};

// ====== RECIPE CONVERSIONS ======

/**
 * Get recipe display name
 */
export const getRecipeDisplayName = (recipe: Recipe): string => {
  return recipe.displayName || recipe.name;
};

/**
 * Convert recipe to dropdown option
 */
export const recipeToOption = (recipe: Recipe) => ({
  value: recipe.id,
  label: getRecipeDisplayName(recipe),
  description: `${recipe.recipeCode} - ${recipe.shortDescription || recipe.description}`
});

/**
 * Calculate recipe cost per portion
 */
export const calculateRecipeCostPerPortion = (recipe: Recipe): Money => {
  if (recipe.yield <= 0) {
    return { amount: 0, currency: recipe.totalCost.currency };
  }
  
  return {
    amount: recipe.totalCost.amount / recipe.yield,
    currency: recipe.totalCost.currency
  };
};

// ====== INVENTORY CONVERSIONS ======

/**
 * Get inventory item display name
 */
export const getInventoryItemDisplayName = (item: InventoryItem): string => {
  return item.itemName;
};

/**
 * Convert inventory item to dropdown option
 */
export const inventoryItemToOption = (item: InventoryItem) => ({
  value: item.id,
  label: getInventoryItemDisplayName(item),
  description: `${item.itemCode} - ${item.description || ''}`
});

// ====== DATE CONVERSIONS ======

/**
 * Convert Date to ISO string for API
 */
export const dateToISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Convert ISO string to Date
 */
export const isoStringToDate = (isoString: string): Date => {
  return new Date(isoString);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date, locale: string = 'en-US'): string => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (date: Date, locale: string = 'en-US'): string => {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ====== STATUS CONVERSIONS ======

/**
 * Convert status to display-friendly format
 */
export const statusToDisplayText = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'draft': 'gray',
    'pending': 'yellow',
    'approved': 'green',
    'rejected': 'red',
    'inprogress': 'blue',
    'completed': 'green',
    'cancelled': 'red',
    'void': 'gray'
  };
  
  return statusColors[status] || 'gray';
};

// ====== UTILITY FUNCTIONS ======

/**
 * Generate unique number for entities
 */
export const generateOrderNumber = (prefix: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  
  return `${prefix}-${year}${month}${day}-${timestamp}`;
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
};

/**
 * Deep clone object (simple implementation)
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined and null values from object
 */
export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: Partial<T> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      cleaned[key as keyof T] = value;
    }
  });
  
  return cleaned;
};