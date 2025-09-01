
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.Tb_activityScalarFieldEnum = {
  id: 'id',
  action: 'action',
  entity_type: 'entity_type',
  entity_id: 'entity_id',
  actor_id: 'actor_id',
  meta_data: 'meta_data',
  old_data: 'old_data',
  new_data: 'new_data',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  description: 'description',
  created_at: 'created_at',
  created_by_id: 'created_by_id'
};

exports.Prisma.RelationLoadStrategy = {
  query: 'query',
  join: 'join'
};

exports.Prisma.Tb_credit_note_reasonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_credit_noteScalarFieldEnum = {
  id: 'id',
  cn_no: 'cn_no',
  cn_date: 'cn_date',
  doc_status: 'doc_status',
  credit_note_type: 'credit_note_type',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  pricelist_detail_id: 'pricelist_detail_id',
  pricelist_no: 'pricelist_no',
  pricelist_unit: 'pricelist_unit',
  pricelist_price: 'pricelist_price',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  exchange_rate_date: 'exchange_rate_date',
  grn_id: 'grn_id',
  grn_no: 'grn_no',
  grn_date: 'grn_date',
  cn_reason_id: 'cn_reason_id',
  cn_reason_name: 'cn_reason_name',
  cn_reason_description: 'cn_reason_description',
  invoice_no: 'invoice_no',
  invoice_date: 'invoice_date',
  tax_invoice_no: 'tax_invoice_no',
  tax_invoice_date: 'tax_invoice_date',
  note: 'note',
  description: 'description',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_credit_note_detailScalarFieldEnum = {
  id: 'id',
  credit_note_id: 'credit_note_id',
  inventory_transaction_id: 'inventory_transaction_id',
  sequence_no: 'sequence_no',
  description: 'description',
  note: 'note',
  location_id: 'location_id',
  location_name: 'location_name',
  delivery_point_id: 'delivery_point_id',
  delivery_point_name: 'delivery_point_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  return_qty: 'return_qty',
  return_unit_id: 'return_unit_id',
  return_unit_name: 'return_unit_name',
  return_conversion_factor: 'return_conversion_factor',
  return_base_qty: 'return_base_qty',
  price: 'price',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  base_tax_amount: 'base_tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  discount_rate: 'discount_rate',
  discount_amount: 'discount_amount',
  base_discount_amount: 'base_discount_amount',
  is_discount_adjustment: 'is_discount_adjustment',
  extra_cost_amount: 'extra_cost_amount',
  base_extra_cost_amount: 'base_extra_cost_amount',
  sub_total_price: 'sub_total_price',
  net_amount: 'net_amount',
  total_price: 'total_price',
  base_price: 'base_price',
  base_sub_total_price: 'base_sub_total_price',
  base_net_amount: 'base_net_amount',
  base_total_price: 'base_total_price',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_currencyScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  symbol: 'symbol',
  description: 'description',
  decimal_places: 'decimal_places',
  is_active: 'is_active',
  exchange_rate: 'exchange_rate',
  exchange_rate_at: 'exchange_rate_at',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_delivery_pointScalarFieldEnum = {
  id: 'id',
  name: 'name',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_departmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_exchange_rateScalarFieldEnum = {
  id: 'id',
  at_date: 'at_date',
  currency_id: 'currency_id',
  currency_code: 'currency_code',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_good_received_noteScalarFieldEnum = {
  id: 'id',
  grn_no: 'grn_no',
  grn_date: 'grn_date',
  invoice_no: 'invoice_no',
  invoice_date: 'invoice_date',
  description: 'description',
  doc_status: 'doc_status',
  doc_type: 'doc_type',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  currency_rate: 'currency_rate',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  is_consignment: 'is_consignment',
  is_cash: 'is_cash',
  signature_image_url: 'signature_image_url',
  received_by_id: 'received_by_id',
  received_by_name: 'received_by_name',
  received_at: 'received_at',
  credit_term_id: 'credit_term_id',
  credit_term_name: 'credit_term_name',
  credit_term_days: 'credit_term_days',
  payment_due_date: 'payment_due_date',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_good_received_note_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  good_received_note_id: 'good_received_note_id',
  purchase_order_detail_id: 'purchase_order_detail_id',
  sequence_no: 'sequence_no',
  location_id: 'location_id',
  location_name: 'location_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  inventory_unit_id: 'inventory_unit_id',
  inventory_unit_name: 'inventory_unit_name',
  order_qty: 'order_qty',
  order_unit_id: 'order_unit_id',
  order_unit_name: 'order_unit_name',
  order_unit_conversion_factor: 'order_unit_conversion_factor',
  order_base_qty: 'order_base_qty',
  received_qty: 'received_qty',
  received_unit_id: 'received_unit_id',
  received_unit_name: 'received_unit_name',
  received_unit_conversion_factor: 'received_unit_conversion_factor',
  received_base_qty: 'received_base_qty',
  foc_qty: 'foc_qty',
  foc_unit_id: 'foc_unit_id',
  foc_unit_name: 'foc_unit_name',
  foc_unit_conversion_factor: 'foc_unit_conversion_factor',
  foc_base_qty: 'foc_base_qty',
  price: 'price',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  total_amount: 'total_amount',
  delivery_point_id: 'delivery_point_id',
  delivery_point_name: 'delivery_point_name',
  base_price: 'base_price',
  base_qty: 'base_qty',
  extra_cost: 'extra_cost',
  total_cost: 'total_cost',
  discount_rate: 'discount_rate',
  discount_amount: 'discount_amount',
  is_discount_adjustment: 'is_discount_adjustment',
  expired_date: 'expired_date',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_inventory_transactionScalarFieldEnum = {
  id: 'id',
  inventory_doc_type: 'inventory_doc_type',
  inventory_doc_no: 'inventory_doc_no',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_inventory_transaction_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  from_lot_no: 'from_lot_no',
  current_lot_no: 'current_lot_no',
  location_id: 'location_id',
  product_id: 'product_id',
  qty: 'qty',
  cost_per_unit: 'cost_per_unit',
  total_cost: 'total_cost',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id'
};

exports.Prisma.Tb_inventory_transaction_closing_balanceScalarFieldEnum = {
  id: 'id',
  inventory_transaction_detail_id: 'inventory_transaction_detail_id',
  lot_no: 'lot_no',
  lot_index: 'lot_index',
  location_id: 'location_id',
  product_id: 'product_id',
  in_qty: 'in_qty',
  out_qty: 'out_qty',
  cost_per_unit: 'cost_per_unit',
  total_cost: 'total_cost',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id'
};

exports.Prisma.Tb_locationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  location_type: 'location_type',
  description: 'description',
  delivery_point_id: 'delivery_point_id',
  delivery_point_name: 'delivery_point_name',
  physical_count_type: 'physical_count_type',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_menuScalarFieldEnum = {
  id: 'id',
  module_id: 'module_id',
  name: 'name',
  url: 'url',
  description: 'description',
  is_visible: 'is_visible',
  is_active: 'is_active',
  is_lock: 'is_lock',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_productScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  local_name: 'local_name',
  description: 'description',
  inventory_unit_id: 'inventory_unit_id',
  inventory_unit_name: 'inventory_unit_name',
  product_status_type: 'product_status_type',
  product_item_group_id: 'product_item_group_id',
  is_used_in_recipe: 'is_used_in_recipe',
  is_sold_directly: 'is_sold_directly',
  barcode: 'barcode',
  sku: 'sku',
  price_deviation_limit: 'price_deviation_limit',
  qty_deviation_limit: 'qty_deviation_limit',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_product_categoryScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  is_active: 'is_active',
  price_deviation_limit: 'price_deviation_limit',
  qty_deviation_limit: 'qty_deviation_limit',
  is_used_in_recipe: 'is_used_in_recipe',
  is_sold_directly: 'is_sold_directly',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_product_item_groupScalarFieldEnum = {
  id: 'id',
  product_subcategory_id: 'product_subcategory_id',
  code: 'code',
  name: 'name',
  description: 'description',
  price_deviation_limit: 'price_deviation_limit',
  qty_deviation_limit: 'qty_deviation_limit',
  is_used_in_recipe: 'is_used_in_recipe',
  is_sold_directly: 'is_sold_directly',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_product_sub_categoryScalarFieldEnum = {
  id: 'id',
  product_category_id: 'product_category_id',
  code: 'code',
  name: 'name',
  description: 'description',
  price_deviation_limit: 'price_deviation_limit',
  qty_deviation_limit: 'qty_deviation_limit',
  is_used_in_recipe: 'is_used_in_recipe',
  is_sold_directly: 'is_sold_directly',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_product_tb_vendorScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  product_name: 'product_name',
  vendor_id: 'vendor_id',
  vendor_product_code: 'vendor_product_code',
  vendor_product_name: 'vendor_product_name',
  description: 'description',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_orderScalarFieldEnum = {
  id: 'id',
  po_no: 'po_no',
  po_status: 'po_status',
  description: 'description',
  order_date: 'order_date',
  delivery_date: 'delivery_date',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  approval_date: 'approval_date',
  email: 'email',
  buyer_id: 'buyer_id',
  buyer_name: 'buyer_name',
  credit_term_id: 'credit_term_id',
  credit_term_name: 'credit_term_name',
  credit_term_value: 'credit_term_value',
  remarks: 'remarks',
  history: 'history',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_order_detailScalarFieldEnum = {
  id: 'id',
  purchase_order_id: 'purchase_order_id',
  description: 'description',
  sequence_no: 'sequence_no',
  is_active: 'is_active',
  order_qty: 'order_qty',
  order_unit_id: 'order_unit_id',
  order_unit_conversion_factor: 'order_unit_conversion_factor',
  order_unit_name: 'order_unit_name',
  base_qty: 'base_qty',
  base_unit_id: 'base_unit_id',
  base_unit_name: 'base_unit_name',
  is_foc: 'is_foc',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  base_tax_amount: 'base_tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  discount_rate: 'discount_rate',
  discount_amount: 'discount_amount',
  base_discount_amount: 'base_discount_amount',
  is_discount_adjustment: 'is_discount_adjustment',
  price: 'price',
  sub_total_price: 'sub_total_price',
  net_amount: 'net_amount',
  total_price: 'total_price',
  base_price: 'base_price',
  base_sub_total_price: 'base_sub_total_price',
  base_net_amount: 'base_net_amount',
  base_total_price: 'base_total_price',
  received_qty: 'received_qty',
  cancelled_qty: 'cancelled_qty',
  history: 'history',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_order_detail_tb_purchase_request_detailScalarFieldEnum = {
  id: 'id',
  po_detail_id: 'po_detail_id',
  pr_detail_id: 'pr_detail_id',
  pr_detail_order_unit_id: 'pr_detail_order_unit_id',
  pr_detail_order_unit_name: 'pr_detail_order_unit_name',
  pr_detail_qty: 'pr_detail_qty',
  pr_detail_base_qty: 'pr_detail_base_qty',
  pr_detail_base_unit_id: 'pr_detail_base_unit_id',
  pr_detail_base_unit_name: 'pr_detail_base_unit_name'
};

exports.Prisma.Tb_purchase_requestScalarFieldEnum = {
  id: 'id',
  pr_no: 'pr_no',
  pr_date: 'pr_date',
  description: 'description',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  pr_status: 'pr_status',
  requestor_id: 'requestor_id',
  requestor_name: 'requestor_name',
  department_id: 'department_id',
  department_name: 'department_name',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_request_detailScalarFieldEnum = {
  id: 'id',
  purchase_request_id: 'purchase_request_id',
  sequence_no: 'sequence_no',
  location_id: 'location_id',
  location_name: 'location_name',
  delivery_point_id: 'delivery_point_id',
  delivery_point_name: 'delivery_point_name',
  delivery_date: 'delivery_date',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  inventory_unit_id: 'inventory_unit_id',
  inventory_unit_name: 'inventory_unit_name',
  description: 'description',
  comment: 'comment',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  pricelist_detail_id: 'pricelist_detail_id',
  pricelist_no: 'pricelist_no',
  pricelist_unit: 'pricelist_unit',
  pricelist_price: 'pricelist_price',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  exchange_rate_date: 'exchange_rate_date',
  requested_qty: 'requested_qty',
  requested_unit_id: 'requested_unit_id',
  requested_unit_name: 'requested_unit_name',
  requested_unit_conversion_factor: 'requested_unit_conversion_factor',
  requested_base_qty: 'requested_base_qty',
  approved_qty: 'approved_qty',
  approved_unit_id: 'approved_unit_id',
  approved_unit_name: 'approved_unit_name',
  approved_unit_conversion_factor: 'approved_unit_conversion_factor',
  approved_base_qty: 'approved_base_qty',
  foc_qty: 'foc_qty',
  foc_unit_id: 'foc_unit_id',
  foc_unit_name: 'foc_unit_name',
  foc_unit_conversion_factor: 'foc_unit_conversion_factor',
  foc_base_qty: 'foc_base_qty',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  base_tax_amount: 'base_tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  discount_rate: 'discount_rate',
  discount_amount: 'discount_amount',
  base_discount_amount: 'base_discount_amount',
  is_discount_adjustment: 'is_discount_adjustment',
  sub_total_price: 'sub_total_price',
  net_amount: 'net_amount',
  total_price: 'total_price',
  base_price: 'base_price',
  base_sub_total_price: 'base_sub_total_price',
  base_net_amount: 'base_net_amount',
  base_total_price: 'base_total_price',
  history: 'history',
  stages_status: 'stages_status',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_request_templateScalarFieldEnum = {
  id: 'id',
  description: 'description',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  department_id: 'department_id',
  department_name: 'department_name',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_purchase_request_template_detailScalarFieldEnum = {
  id: 'id',
  purchase_request_template_id: 'purchase_request_template_id',
  location_id: 'location_id',
  location_name: 'location_name',
  delivery_point_id: 'delivery_point_id',
  delivery_point_name: 'delivery_point_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  inventory_unit_id: 'inventory_unit_id',
  inventory_unit_name: 'inventory_unit_name',
  description: 'description',
  comment: 'comment',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  exchange_rate_date: 'exchange_rate_date',
  requested_qty: 'requested_qty',
  requested_unit_id: 'requested_unit_id',
  requested_unit_name: 'requested_unit_name',
  requested_unit_conversion_factor: 'requested_unit_conversion_factor',
  requested_base_qty: 'requested_base_qty',
  foc_qty: 'foc_qty',
  foc_unit_id: 'foc_unit_id',
  foc_unit_name: 'foc_unit_name',
  foc_unit_conversion_factor: 'foc_unit_conversion_factor',
  foc_base_qty: 'foc_base_qty',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  base_tax_amount: 'base_tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  discount_rate: 'discount_rate',
  discount_amount: 'discount_amount',
  base_discount_amount: 'base_discount_amount',
  is_discount_adjustment: 'is_discount_adjustment',
  is_active: 'is_active',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_stock_inScalarFieldEnum = {
  id: 'id',
  si_no: 'si_no',
  description: 'description',
  doc_status: 'doc_status',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id'
};

exports.Prisma.Tb_stock_in_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  stock_in_id: 'stock_in_id',
  sequence_no: 'sequence_no',
  description: 'description',
  location_id: 'location_id',
  location_name: 'location_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  qty: 'qty',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_stock_outScalarFieldEnum = {
  id: 'id',
  so_no: 'so_no',
  description: 'description',
  doc_status: 'doc_status',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_stock_out_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  stock_out_id: 'stock_out_id',
  sequence_no: 'sequence_no',
  description: 'description',
  location_id: 'location_id',
  location_name: 'location_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  qty: 'qty',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_stock_takeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  stk_no: 'stk_no',
  description: 'description',
  doc_status: 'doc_status',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_stock_take_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  stock_take_id: 'stock_take_id',
  sequence_no: 'sequence_no',
  description: 'description',
  location_id: 'location_id',
  location_name: 'location_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  qty: 'qty',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_store_requisitionScalarFieldEnum = {
  id: 'id',
  sr_no: 'sr_no',
  sr_date: 'sr_date',
  expected_date: 'expected_date',
  description: 'description',
  doc_status: 'doc_status',
  from_location_id: 'from_location_id',
  from_location_name: 'from_location_name',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  requestor_id: 'requestor_id',
  requestor_name: 'requestor_name',
  department_id: 'department_id',
  department_name: 'department_name',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_store_requisition_detailScalarFieldEnum = {
  id: 'id',
  inventory_transaction_id: 'inventory_transaction_id',
  store_requisition_id: 'store_requisition_id',
  sequence_no: 'sequence_no',
  description: 'description',
  to_location_id: 'to_location_id',
  to_location_name: 'to_location_name',
  product_id: 'product_id',
  product_name: 'product_name',
  product_local_name: 'product_local_name',
  requested_qty: 'requested_qty',
  approved_qty: 'approved_qty',
  issued_qty: 'issued_qty',
  history: 'history',
  last_action: 'last_action',
  approved_message: 'approved_message',
  approved_by_id: 'approved_by_id',
  approved_by_name: 'approved_by_name',
  approved_date_at: 'approved_date_at',
  review_message: 'review_message',
  review_by_id: 'review_by_id',
  review_by_name: 'review_by_name',
  review_date_at: 'review_date_at',
  reject_message: 'reject_message',
  reject_by_id: 'reject_by_id',
  reject_by_name: 'reject_by_name',
  reject_date_at: 'reject_date_at',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_unitScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_unit_conversionScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  unit_type: 'unit_type',
  from_unit_id: 'from_unit_id',
  from_unit_name: 'from_unit_name',
  from_unit_qty: 'from_unit_qty',
  to_unit_id: 'to_unit_id',
  to_unit_name: 'to_unit_name',
  to_unit_qty: 'to_unit_qty',
  is_default: 'is_default',
  description: 'description',
  is_active: 'is_active',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_vendorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  note: 'note',
  business_type_id: 'business_type_id',
  business_type_name: 'business_type_name',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  is_active: 'is_active',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_vendor_addressScalarFieldEnum = {
  id: 'id',
  vendor_id: 'vendor_id',
  address_type: 'address_type',
  data: 'data',
  is_active: 'is_active',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_vendor_contactScalarFieldEnum = {
  id: 'id',
  vendor_id: 'vendor_id',
  contact_type: 'contact_type',
  is_active: 'is_active',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_workflowScalarFieldEnum = {
  id: 'id',
  name: 'name',
  workflow_type: 'workflow_type',
  data: 'data',
  is_active: 'is_active',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_count_stockScalarFieldEnum = {
  id: 'id',
  count_stock_no: 'count_stock_no',
  start_date: 'start_date',
  end_date: 'end_date',
  location_id: 'location_id',
  location_name: 'location_name',
  doc_status: 'doc_status',
  count_stock_type: 'count_stock_type',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_count_stock_detailScalarFieldEnum = {
  id: 'id',
  count_stock_id: 'count_stock_id',
  sequence_no: 'sequence_no',
  product_id: 'product_id',
  product_name: 'product_name',
  qty: 'qty',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_jv_detailScalarFieldEnum = {
  id: 'id',
  jv_header_id: 'jv_header_id',
  account_code: 'account_code',
  account_name: 'account_name',
  sequence_no: 'sequence_no',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  debit: 'debit',
  credit: 'credit',
  base_currency_id: 'base_currency_id',
  base_currency_name: 'base_currency_name',
  base_debit: 'base_debit',
  base_credit: 'base_credit',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_jv_headerScalarFieldEnum = {
  id: 'id',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  exchange_rate: 'exchange_rate',
  base_currency_id: 'base_currency_id',
  base_currency_name: 'base_currency_name',
  jv_type: 'jv_type',
  jv_no: 'jv_no',
  jv_date: 'jv_date',
  description: 'description',
  note: 'note',
  jv_status: 'jv_status',
  workflow_id: 'workflow_id',
  workflow_name: 'workflow_name',
  workflow_history: 'workflow_history',
  workflow_current_stage: 'workflow_current_stage',
  workflow_previous_stage: 'workflow_previous_stage',
  workflow_next_stage: 'workflow_next_stage',
  user_action: 'user_action',
  last_action: 'last_action',
  last_action_at_date: 'last_action_at_date',
  last_action_by_id: 'last_action_by_id',
  last_action_by_name: 'last_action_by_name',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_pricelist_templateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  note: 'note',
  status: 'status',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_pricelist_template_detailScalarFieldEnum = {
  id: 'id',
  pricelist_template_id: 'pricelist_template_id',
  sequence_no: 'sequence_no',
  product_id: 'product_id',
  product_name: 'product_name',
  array_order_unit: 'array_order_unit',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_request_for_pricingScalarFieldEnum = {
  id: 'id',
  pricelist_template_id: 'pricelist_template_id',
  start_date: 'start_date',
  end_date: 'end_date',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_request_for_pricing_detailScalarFieldEnum = {
  id: 'id',
  request_for_pricing_id: 'request_for_pricing_id',
  sequence_no: 'sequence_no',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  contact_person: 'contact_person',
  contact_phone: 'contact_phone',
  contact_email: 'contact_email',
  pricelist_id: 'pricelist_id',
  pricelist_name: 'pricelist_name',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_pricelistScalarFieldEnum = {
  id: 'id',
  pricelist_no: 'pricelist_no',
  name: 'name',
  url_token: 'url_token',
  vendor_id: 'vendor_id',
  vendor_name: 'vendor_name',
  from_date: 'from_date',
  to_date: 'to_date',
  currency_id: 'currency_id',
  currency_name: 'currency_name',
  is_active: 'is_active',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_pricelist_detailScalarFieldEnum = {
  id: 'id',
  pricelist_id: 'pricelist_id',
  sequence_no: 'sequence_no',
  product_id: 'product_id',
  product_name: 'product_name',
  unit_id: 'unit_id',
  unit_name: 'unit_name',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  price: 'price',
  price_without_vat: 'price_without_vat',
  price_with_vat: 'price_with_vat',
  is_active: 'is_active',
  description: 'description',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_product_locationScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  product_name: 'product_name',
  location_id: 'location_id',
  location_name: 'location_name',
  min_qty: 'min_qty',
  max_qty: 'max_qty',
  re_order_qty: 're_order_qty',
  par_qty: 'par_qty',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_department_userScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  department_id: 'department_id',
  is_hod: 'is_hod',
  note: 'note',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_attachmentScalarFieldEnum = {
  id: 'id',
  s3_token: 's3_token',
  s3_folder: 's3_folder',
  file_name: 'file_name',
  file_ext: 'file_ext',
  file_type: 'file_type',
  file_size: 'file_size',
  file_url: 'file_url',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_currency_commentScalarFieldEnum = {
  id: 'id',
  type: 'type',
  user_id: 'user_id',
  message: 'message',
  attachments: 'attachments',
  info: 'info',
  note: 'note',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_unit_commentScalarFieldEnum = {
  id: 'id',
  type: 'type',
  user_id: 'user_id',
  user_name: 'user_name',
  message: 'message',
  attachments: 'attachments',
  info: 'info',
  note: 'note',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_user_locationScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  location_id: 'location_id',
  note: 'note',
  info: 'info',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_user_profileScalarFieldEnum = {
  user_id: 'user_id',
  firstname: 'firstname',
  middlename: 'middlename',
  lastname: 'lastname',
  bio: 'bio'
};

exports.Prisma.Tb_config_running_codeScalarFieldEnum = {
  id: 'id',
  type: 'type',
  config: 'config',
  note: 'note',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_credit_termScalarFieldEnum = {
  id: 'id',
  name: 'name',
  value: 'value',
  description: 'description',
  note: 'note',
  is_active: 'is_active',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_dimensionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  type: 'type',
  value: 'value',
  description: 'description',
  note: 'note',
  default_value: 'default_value',
  is_active: 'is_active',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_dimension_display_inScalarFieldEnum = {
  id: 'id',
  dimension_id: 'dimension_id',
  display_in: 'display_in',
  default_value: 'default_value',
  note: 'note',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_extra_costScalarFieldEnum = {
  id: 'id',
  name: 'name',
  good_received_note_id: 'good_received_note_id',
  allocate_extra_cost_type: 'allocate_extra_cost_type',
  description: 'description',
  note: 'note',
  info: 'info',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_extra_cost_detailScalarFieldEnum = {
  id: 'id',
  extra_cost_id: 'extra_cost_id',
  sequence_no: 'sequence_no',
  extra_cost_type_id: 'extra_cost_type_id',
  name: 'name',
  description: 'description',
  note: 'note',
  amount: 'amount',
  tax_profile_id: 'tax_profile_id',
  tax_profile_name: 'tax_profile_name',
  tax_rate: 'tax_rate',
  tax_amount: 'tax_amount',
  is_tax_adjustment: 'is_tax_adjustment',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_extra_cost_typeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  note: 'note',
  is_active: 'is_active',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_vendor_business_typeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  note: 'note',
  is_active: 'is_active',
  info: 'info',
  dimension: 'dimension',
  doc_version: 'doc_version',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_application_configScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.Tb_application_user_configScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  key: 'key',
  value: 'value',
  created_at: 'created_at',
  created_by_id: 'created_by_id',
  updated_at: 'updated_at',
  updated_by_id: 'updated_by_id',
  deleted_at: 'deleted_at',
  deleted_by_id: 'deleted_by_id'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.enum_activity_action = exports.$Enums.enum_activity_action = {
  view: 'view',
  create: 'create',
  update: 'update',
  delete: 'delete',
  login: 'login',
  logout: 'logout',
  approve: 'approve',
  reject: 'reject',
  cancel: 'cancel',
  void: 'void',
  print: 'print',
  email: 'email',
  other: 'other',
  upload: 'upload',
  download: 'download',
  export: 'export',
  import: 'import',
  copy: 'copy',
  move: 'move',
  rename: 'rename',
  save: 'save'
};

exports.enum_activity_entity_type = exports.$Enums.enum_activity_entity_type = {
  user: 'user',
  business_unit: 'business_unit',
  product: 'product',
  location: 'location',
  department: 'department',
  unit: 'unit',
  currency: 'currency',
  exchange_rate: 'exchange_rate',
  menu: 'menu',
  delivery_point: 'delivery_point',
  purchase_request: 'purchase_request',
  purchase_request_item: 'purchase_request_item',
  purchase_order: 'purchase_order',
  purchase_order_item: 'purchase_order_item',
  good_received_note: 'good_received_note',
  good_received_note_item: 'good_received_note_item',
  inventory_transaction: 'inventory_transaction',
  inventory_adjustment: 'inventory_adjustment',
  store_requisition: 'store_requisition',
  store_requisition_item: 'store_requisition_item',
  stock_in: 'stock_in',
  stock_out: 'stock_out',
  stock_adjustment: 'stock_adjustment',
  stock_transfer: 'stock_transfer',
  stock_count: 'stock_count',
  stock_take: 'stock_take',
  stock_take_item: 'stock_take_item',
  other: 'other'
};

exports.enum_credit_note_doc_status = exports.$Enums.enum_credit_note_doc_status = {
  draft: 'draft',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  voided: 'voided'
};

exports.enum_credit_note_type = exports.$Enums.enum_credit_note_type = {
  quantity_return: 'quantity_return',
  amount_discount: 'amount_discount'
};

exports.enum_last_action = exports.$Enums.enum_last_action = {
  submitted: 'submitted',
  approved: 'approved',
  reviewed: 'reviewed',
  rejected: 'rejected'
};

exports.enum_good_received_note_status = exports.$Enums.enum_good_received_note_status = {
  draft: 'draft',
  saved: 'saved',
  committed: 'committed',
  voided: 'voided'
};

exports.enum_good_received_note_type = exports.$Enums.enum_good_received_note_type = {
  manual: 'manual',
  purchase_order: 'purchase_order'
};

exports.enum_inventory_doc_type = exports.$Enums.enum_inventory_doc_type = {
  good_received_note: 'good_received_note',
  credit_note: 'credit_note',
  store_requisition: 'store_requisition',
  stock_in: 'stock_in',
  stock_out: 'stock_out'
};

exports.enum_location_type = exports.$Enums.enum_location_type = {
  inventory: 'inventory',
  direct: 'direct',
  consignment: 'consignment'
};

exports.enum_physical_count_type = exports.$Enums.enum_physical_count_type = {
  no: 'no',
  yes: 'yes'
};

exports.enum_product_status_type = exports.$Enums.enum_product_status_type = {
  active: 'active',
  inactive: 'inactive'
};

exports.enum_purchase_order_doc_status = exports.$Enums.enum_purchase_order_doc_status = {
  pending: 'pending',
  sent: 'sent',
  closed: 'closed',
  completed: 'completed',
  cancelled: 'cancelled',
  voided: 'voided'
};

exports.enum_purchase_request_doc_status = exports.$Enums.enum_purchase_request_doc_status = {
  draft: 'draft',
  in_progress: 'in_progress',
  approved: 'approved',
  completed: 'completed',
  cancelled: 'cancelled',
  voided: 'voided'
};

exports.enum_doc_status = exports.$Enums.enum_doc_status = {
  draft: 'draft',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  voided: 'voided'
};

exports.enum_unit_type = exports.$Enums.enum_unit_type = {
  order_unit: 'order_unit',
  ingredient_unit: 'ingredient_unit'
};

exports.enum_vendor_address_type = exports.$Enums.enum_vendor_address_type = {
  contact_address: 'contact_address',
  mailing_address: 'mailing_address',
  register_address: 'register_address'
};

exports.enum_vendor_contact_type = exports.$Enums.enum_vendor_contact_type = {
  phone_number: 'phone_number',
  email_address: 'email_address'
};

exports.enum_workflow_type = exports.$Enums.enum_workflow_type = {
  purchase_request_workflow: 'purchase_request_workflow',
  store_requisition_workflow: 'store_requisition_workflow'
};

exports.enum_count_stock_status = exports.$Enums.enum_count_stock_status = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed'
};

exports.enum_count_stock_type = exports.$Enums.enum_count_stock_type = {
  physical: 'physical',
  spot: 'spot'
};

exports.enum_jv_status = exports.$Enums.enum_jv_status = {
  draft: 'draft',
  posted: 'posted'
};

exports.enum_pricelist_template_status = exports.$Enums.enum_pricelist_template_status = {
  draft: 'draft',
  active: 'active',
  inactive: 'inactive'
};

exports.enum_comment_type = exports.$Enums.enum_comment_type = {
  user: 'user',
  system: 'system'
};

exports.enum_dimension_type = exports.$Enums.enum_dimension_type = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  datetime: 'datetime',
  json: 'json',
  dataset: 'dataset',
  lookup: 'lookup',
  lookup_dataset: 'lookup_dataset'
};

exports.enum_dimension_display_in = exports.$Enums.enum_dimension_display_in = {
  currency: 'currency',
  exchange_rate: 'exchange_rate',
  delivery_point: 'delivery_point',
  department: 'department',
  product_category: 'product_category',
  product_sub_category: 'product_sub_category',
  product_item_group: 'product_item_group',
  product: 'product',
  location: 'location',
  vendor: 'vendor',
  pricelist: 'pricelist',
  unit: 'unit',
  purchase_request_header: 'purchase_request_header',
  purchase_request_detail: 'purchase_request_detail',
  purchase_order_header: 'purchase_order_header',
  purchase_order_detail: 'purchase_order_detail',
  goods_received_note_header: 'goods_received_note_header',
  goods_received_note_detail: 'goods_received_note_detail',
  stock_take: 'stock_take',
  stock_take_detail: 'stock_take_detail',
  transfer_header: 'transfer_header',
  transfer_detail: 'transfer_detail',
  stock_in_header: 'stock_in_header',
  stock_in_detail: 'stock_in_detail',
  stock_out_header: 'stock_out_header',
  stock_out_detail: 'stock_out_detail'
};

exports.enum_allocate_extra_cost_type = exports.$Enums.enum_allocate_extra_cost_type = {
  manual: 'manual',
  by_value: 'by_value',
  by_qty: 'by_qty'
};

exports.Prisma.ModelName = {
  tb_activity: 'tb_activity',
  tb_credit_note_reason: 'tb_credit_note_reason',
  tb_credit_note: 'tb_credit_note',
  tb_credit_note_detail: 'tb_credit_note_detail',
  tb_currency: 'tb_currency',
  tb_delivery_point: 'tb_delivery_point',
  tb_department: 'tb_department',
  tb_exchange_rate: 'tb_exchange_rate',
  tb_good_received_note: 'tb_good_received_note',
  tb_good_received_note_detail: 'tb_good_received_note_detail',
  tb_inventory_transaction: 'tb_inventory_transaction',
  tb_inventory_transaction_detail: 'tb_inventory_transaction_detail',
  tb_inventory_transaction_closing_balance: 'tb_inventory_transaction_closing_balance',
  tb_location: 'tb_location',
  tb_menu: 'tb_menu',
  tb_product: 'tb_product',
  tb_product_category: 'tb_product_category',
  tb_product_item_group: 'tb_product_item_group',
  tb_product_sub_category: 'tb_product_sub_category',
  tb_product_tb_vendor: 'tb_product_tb_vendor',
  tb_purchase_order: 'tb_purchase_order',
  tb_purchase_order_detail: 'tb_purchase_order_detail',
  tb_purchase_order_detail_tb_purchase_request_detail: 'tb_purchase_order_detail_tb_purchase_request_detail',
  tb_purchase_request: 'tb_purchase_request',
  tb_purchase_request_detail: 'tb_purchase_request_detail',
  tb_purchase_request_template: 'tb_purchase_request_template',
  tb_purchase_request_template_detail: 'tb_purchase_request_template_detail',
  tb_stock_in: 'tb_stock_in',
  tb_stock_in_detail: 'tb_stock_in_detail',
  tb_stock_out: 'tb_stock_out',
  tb_stock_out_detail: 'tb_stock_out_detail',
  tb_stock_take: 'tb_stock_take',
  tb_stock_take_detail: 'tb_stock_take_detail',
  tb_store_requisition: 'tb_store_requisition',
  tb_store_requisition_detail: 'tb_store_requisition_detail',
  tb_unit: 'tb_unit',
  tb_unit_conversion: 'tb_unit_conversion',
  tb_vendor: 'tb_vendor',
  tb_vendor_address: 'tb_vendor_address',
  tb_vendor_contact: 'tb_vendor_contact',
  tb_workflow: 'tb_workflow',
  tb_count_stock: 'tb_count_stock',
  tb_count_stock_detail: 'tb_count_stock_detail',
  tb_jv_detail: 'tb_jv_detail',
  tb_jv_header: 'tb_jv_header',
  tb_pricelist_template: 'tb_pricelist_template',
  tb_pricelist_template_detail: 'tb_pricelist_template_detail',
  tb_request_for_pricing: 'tb_request_for_pricing',
  tb_request_for_pricing_detail: 'tb_request_for_pricing_detail',
  tb_pricelist: 'tb_pricelist',
  tb_pricelist_detail: 'tb_pricelist_detail',
  tb_product_location: 'tb_product_location',
  tb_department_user: 'tb_department_user',
  tb_attachment: 'tb_attachment',
  tb_currency_comment: 'tb_currency_comment',
  tb_unit_comment: 'tb_unit_comment',
  tb_user_location: 'tb_user_location',
  tb_user_profile: 'tb_user_profile',
  tb_config_running_code: 'tb_config_running_code',
  tb_credit_term: 'tb_credit_term',
  tb_dimension: 'tb_dimension',
  tb_dimension_display_in: 'tb_dimension_display_in',
  tb_extra_cost: 'tb_extra_cost',
  tb_extra_cost_detail: 'tb_extra_cost_detail',
  tb_extra_cost_type: 'tb_extra_cost_type',
  tb_vendor_business_type: 'tb_vendor_business_type',
  tb_application_config: 'tb_application_config',
  tb_application_user_config: 'tb_application_user_config'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
