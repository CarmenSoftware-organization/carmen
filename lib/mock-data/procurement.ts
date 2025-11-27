/**
 * Procurement Mock Data
 * 
 * Centralized mock data for procurement entities including purchase orders,
 * purchase requests, and goods receive notes.
 */

import { PurchaseOrder, PurchaseRequest, GoodsReceiveNote } from '../types'

// Re-export from existing mock files (temporary)
export { Mock_purchaseOrders as mockPurchaseOrders } from '../mock/mock_purchaseOrder'
export { mockGoodsReceiveNotes } from '../mock/mock_goodsReceiveNotes'
export { staticCreditNotes as mockCreditNotes } from '../mock/static-credit-notes'
export { mockPurchaseRequests } from './purchase-requests'

// TODO: Move the actual data from these mock files here
// and convert it to use our centralized type system

// Utility functions
export const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
  // Import here to avoid circular dependencies
  const { Mock_purchaseOrders } = require('../mock/mock_purchaseOrder')
  return Mock_purchaseOrders.find((po: PurchaseOrder) => po.id === id)
}

export const getPurchaseOrdersByStatus = (status: string): PurchaseOrder[] => {
  const { Mock_purchaseOrders } = require('../mock/mock_purchaseOrder')
  return Mock_purchaseOrders.filter((po: PurchaseOrder) => po.status === status)
}