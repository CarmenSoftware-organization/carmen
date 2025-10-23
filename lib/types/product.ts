/**
 * Product Management Types
 * 
 * Types and interfaces for product catalog management including products,
 * categories, units, and product specifications.
 */

import { AuditTimestamp, ActivityStatus, Money, Category, Unit } from './common'

// ====== PRODUCT CORE TYPES ======

/**
 * Product types
 */
export type ProductType = 'raw_material' | 'finished_good' | 'semi_finished' | 'service' | 'asset' | 'consumable';

/**
 * Product status
 */
export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'pending_approval' | 'draft';

/**
 * Main product interface
 */
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  displayName?: string;
  description?: string;
  shortDescription?: string;
  productType: ProductType;
  status: ProductStatus;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  manufacturerId?: string;
  // Specifications
  specifications: ProductSpecification[];
  // Units and measurements
  baseUnit: string;
  alternativeUnits: ProductUnit[];
  unitConversions?: ProductUnit[]; // Alternative name for unit conversions
  // Inventory settings
  isInventoried: boolean;
  isSerialTrackingRequired: boolean;
  isBatchTrackingRequired: boolean;
  shelfLifeDays?: number;
  storageConditions?: string;
  handlingInstructions?: string;
  // Procurement settings
  isPurchasable: boolean;
  isSellable: boolean;
  defaultVendorId?: string;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  standardOrderQuantity?: number;
  leadTimeDays?: number;
  // Costing
  standardCost?: Money;
  lastPurchaseCost?: Money;
  averageCost?: Money;
  // Physical properties
  weight?: number;
  weightUnit?: string;
  dimensions?: ProductDimensions;
  color?: string;
  material?: string;
  // Compliance and safety
  hazardousClassification?: string;
  regulatoryApprovals: string[];
  safetyDataSheetUrl?: string;
  // Digital assets
  images: ProductImage[];
  documents: ProductDocument[];
  // Relationships
  relatedProducts: string[]; // Product IDs
  substitutes: string[]; // Product IDs
  accessories: string[]; // Product IDs
  // Metadata
  keywords: string[];
  tags: string[];
  notes?: string;
  isActive: boolean;
}

/**
 * Product specifications
 */
export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
  category?: string;
  isRequired: boolean;
  displayOrder: number;
}

/**
 * Product unit conversions
 */
export interface ProductUnit {
  id: string;
  productId: string;
  unit: string;
  conversionFactor: number; // Factor to convert to base unit
  isActive: boolean;
  isPurchaseUnit: boolean;
  isSalesUnit: boolean;
  isInventoryUnit: boolean;
  barcode?: string;
  notes?: string;
}

/**
 * Product dimensions
 */
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string; // cm, inch, etc.
  volume?: number;
  volumeUnit?: string;
}

/**
 * Product images
 */
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
  imageType: 'product' | 'specification' | 'packaging' | 'certificate';
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Product documents
 */
export interface ProductDocument {
  id: string;
  productId: string;
  documentName: string;
  documentUrl: string;
  documentType: 'datasheet' | 'manual' | 'certificate' | 'specification' | 'warranty' | 'other';
  version?: string;
  language?: string;
  isPublic: boolean;
  uploadedBy: string;
  uploadedAt: Date;
}

// ====== PRODUCT CATEGORIES ======

/**
 * Product category hierarchy types
 */
export type CategoryType = 'CATEGORY' | 'SUBCATEGORY' | 'ITEM_GROUP';

/**
 * Category hierarchy item for tree operations
 */
export interface CategoryItem {
  id: string;
  name: string;
  type: CategoryType;
  itemCount: number;
  children?: CategoryItem[];
  parentId?: string;
  isExpanded?: boolean; // UI state for tree expansion
  isEditing?: boolean; // UI state for inline editing
}

/**
 * Category drag and drop operations
 */
export interface CategoryDragItem {
  id: string;
  type: string;
}

/**
 * Category tree operations
 */
export interface CategoryTreeOperations {
  onMove: (dragId: string, hoverId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
  onAdd: (parentId: string, type: CategoryType) => void;
}

/**
 * Extended product category with additional properties
 */
export interface ProductCategory extends Category {
  code?: string;
  imageUrl?: string;
  // Category-specific settings
  requiresSerialNumber: boolean;
  requiresBatchNumber: boolean;
  defaultShelfLifeDays?: number;
  defaultLeadTimeDays?: number;
  // Approval requirements
  requiresApprovalForPurchase: boolean;
  approvalLimit?: Money;
  // Compliance
  regulatoryCategory?: string;
  hazardClass?: string;
  // Template specifications
  requiredSpecifications: CategorySpecificationTemplate[];
}

/**
 * Category specification template
 */
export interface CategorySpecificationTemplate {
  id: string;
  name: string;
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'list';
  isRequired: boolean;
  validValues?: string[]; // For list type
  unit?: string;
  displayOrder: number;
}

// ====== PRODUCT BRANDS ======

/**
 * Product brand information
 */
export interface ProductBrand {
  id: string;
  brandName: string;
  brandCode?: string;
  description?: string;
  manufacturerId?: string;
  logoUrl?: string;
  website?: string;
  countryOfOrigin?: string;
  isActive: boolean;
}

// ====== PRODUCT MANUFACTURERS ======

/**
 * Product manufacturer
 */
export interface ProductManufacturer {
  id: string;
  manufacturerName: string;
  manufacturerCode?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  countryOfOrigin?: string;
  certifications: string[];
  isActive: boolean;
}

// ====== PRODUCT VARIANTS ======

/**
 * Product variant for items with multiple options
 */
export interface ProductVariant {
  id: string;
  parentProductId: string;
  variantName: string;
  variantCode: string;
  description?: string;
  // Variant attributes
  attributes: VariantAttribute[];
  // Pricing and inventory
  standardCost?: Money;
  sellingPrice?: Money;
  stockQuantity?: number;
  reservedQuantity?: number;
  // Physical properties
  weight?: number;
  dimensions?: ProductDimensions;
  // Identification
  sku?: string;
  barcode?: string;
  // Status
  isActive: boolean;
}

/**
 * Variant attribute (size, color, etc.)
 */
export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
  displayOrder: number;
}

// ====== PRODUCT BUNDLES ======

/**
 * Product bundle or kit
 */
export interface ProductBundle {
  id: string;
  bundleName: string;
  bundleCode: string;
  description?: string;
  bundleType: 'kit' | 'assembly' | 'package';
  // Components
  components: BundleComponent[];
  // Pricing
  bundlePrice?: Money;
  componentsTotalCost: Money;
  margin?: number; // percentage
  // Inventory
  requiresAssembly: boolean;
  assemblyInstructions?: string;
  assemblyTimeMins?: number;
  // Status
  isActive: boolean;
}

/**
 * Bundle component
 */
export interface BundleComponent {
  id: string;
  productId: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  canSubstitute: boolean;
  substitutes?: string[]; // Product IDs
  notes?: string;
}

// ====== PRODUCT PRICING ======

/**
 * Product price list
 */
export interface ProductPriceList {
  id: string;
  priceListName: string;
  priceListCode: string;
  description?: string;
  currency: string;
  priceType: 'cost' | 'selling' | 'wholesale' | 'retail';
  effectiveDate: Date;
  expiryDate?: Date;
  // Applicable to
  customerType?: string;
  locationIds?: string[];
  // Status
  isActive: boolean;
  isDefault: boolean;
  // Metadata
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Product price
 */
export interface ProductPrice {
  id: string;
  priceListId: string;
  productId: string;
  unit: string;
  price: Money;
  minimumQuantity: number;
  maximumQuantity?: number;
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
}

// ====== PRODUCT ATTRIBUTES ======

/**
 * Product attribute definition
 */
export interface ProductAttribute {
  id: string;
  attributeName: string;
  attributeCode: string;
  description?: string;
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'multiselect';
  validValues?: string[]; // For list/multiselect types
  unit?: string;
  isRequired: boolean;
  categoryIds: string[]; // Categories where this attribute applies
  displayOrder: number;
  isActive: boolean;
}

/**
 * Product attribute value
 */
export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  value: string;
  numericValue?: number;
  booleanValue?: boolean;
  dateValue?: Date;
  unit?: string;
}

// ====== PRODUCT LIFECYCLE ======

/**
 * Product lifecycle stages
 */
export type ProductLifecycleStage = 'introduction' | 'growth' | 'maturity' | 'decline' | 'discontinued';

/**
 * Product lifecycle tracking
 */
export interface ProductLifecycle {
  id: string;
  productId: string;
  currentStage: ProductLifecycleStage;
  stageHistory: LifecycleStageHistory[];
  expectedEndOfLife?: Date;
  replacementProductId?: string;
  isEndOfLifeNotified: boolean;
  notifications: LifecycleNotification[];
}

/**
 * Lifecycle stage history
 */
export interface LifecycleStageHistory {
  stage: ProductLifecycleStage;
  startDate: Date;
  endDate?: Date;
  changedBy: string;
  reason?: string;
  notes?: string;
}

/**
 * Lifecycle notification
 */
export interface LifecycleNotification {
  id: string;
  notificationType: 'end_of_life' | 'replacement_available' | 'phase_out';
  sentDate: Date;
  sentTo: string[];
  message: string;
  acknowledgedBy?: string[];
}

// ====== PRODUCT ANALYTICS ======

/**
 * Product performance metrics
 */
export interface ProductMetrics {
  productId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Sales metrics
  totalSales: Money;
  unitsSold: number;
  averageSellingPrice: Money;
  // Inventory metrics
  averageInventoryValue: Money;
  inventoryTurnover: number;
  stockoutDays: number;
  // Procurement metrics
  totalPurchases: Money;
  unitsPurchased: number;
  averagePurchasePrice: Money;
  supplierCount: number;
  // Quality metrics
  returnRate: number; // percentage
  defectRate: number; // percentage
  customerSatisfactionScore?: number; // 0-5
  // Calculated metrics
  grossMargin: Money;
  grossMarginPercentage: number;
  roi: number; // return on investment percentage
  lastUpdated: Date;
}