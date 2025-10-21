/**
 * POS Integration - Approvals API Service
 *
 * Handles all POS approval workflow operations including:
 * - Pending transaction retrieval
 * - Single and bulk approvals
 * - Rejection handling
 * - Approval queue filtering
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import {
  type PendingTransaction,
  type POSTransaction,
  type InventoryImpact,
  type ApprovalQueueFilters,
  type BulkApprovalRequest,
  type BulkApprovalResult,
  type ApprovalRequest,
  type RejectionRequest
} from '@/lib/types'

// API response types
export interface PendingTransactionsListResponse {
  transactions: PendingTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface ApprovalStatsResponse {
  totalPending: number
  lowImpact: number
  mediumImpact: number
  highImpact: number
  avgApprovalTime: number
  avgInventoryImpact: {
    amount: number
    currency: string
  }
}

// Request types
export interface ApprovalRequestWithNotes extends ApprovalRequest {
  applyInventoryDeduction?: boolean
}

export interface BulkApprovalRequestBody extends BulkApprovalRequest {
  userId: string
  timestamp: string
}

// POS Approvals API Service
export class POSApprovalsApiService {
  /**
   * Get all pending transactions with filtering and pagination
   */
  async getPendingTransactions(
    filters?: ApprovalQueueFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Get pending transaction by ID
   */
  async getPendingTransaction(id: string): Promise<ApiResponse<PendingTransaction>> {
    return apiClient.get<PendingTransaction>(`/pos/approvals/pending/${id}`)
  }

  /**
   * Get approval queue statistics
   */
  async getApprovalStats(): Promise<ApiResponse<ApprovalStatsResponse>> {
    return apiClient.get<ApprovalStatsResponse>('/pos/approvals/stats')
  }

  /**
   * Approve single transaction
   */
  async approveSingleTransaction(
    transactionId: string,
    request: ApprovalRequestWithNotes
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post<POSTransaction>(
      `/pos/approvals/${transactionId}/approve`,
      request
    )
  }

  /**
   * Reject single transaction
   */
  async rejectSingleTransaction(
    transactionId: string,
    request: RejectionRequest
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post<POSTransaction>(
      `/pos/approvals/${transactionId}/reject`,
      request
    )
  }

  /**
   * Bulk approve transactions
   */
  async bulkApproveTransactions(
    request: BulkApprovalRequest
  ): Promise<ApiResponse<BulkApprovalResult>> {
    return apiClient.post<BulkApprovalResult>('/pos/approvals/bulk-approve', request)
  }

  /**
   * Bulk reject transactions
   */
  async bulkRejectTransactions(
    transactionIds: string[],
    reason: string,
    notes?: string
  ): Promise<ApiResponse<BulkApprovalResult>> {
    return apiClient.post<BulkApprovalResult>('/pos/approvals/bulk-reject', {
      transactionIds,
      reason,
      notes
    })
  }

  /**
   * Get inventory impact preview for transaction
   */
  async getInventoryImpactPreview(transactionId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/pos/approvals/${transactionId}/inventory-impact`)
  }

  /**
   * Filter pending transactions by impact level
   */
  async filterByImpact(
    impact: InventoryImpact,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      inventoryImpact: impact,
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Filter pending transactions by location
   */
  async filterByLocation(
    locationId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      location: locationId,
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Filter pending transactions by requester
   */
  async filterByRequester(
    requesterId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      requester: requesterId,
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Filter pending transactions by date range
   */
  async filterByDateRange(
    from: string,
    to: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      dateRange: { from, to },
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Search pending transactions
   */
  async searchPendingTransactions(
    query: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PendingTransactionsListResponse>> {
    const params = {
      searchQuery: query,
      ...pagination
    }

    return apiClient.get<PendingTransactionsListResponse>('/pos/approvals/pending', params)
  }

  /**
   * Export pending transactions to CSV/Excel
   */
  async exportPendingTransactions(
    format: 'csv' | 'excel',
    filters?: ApprovalQueueFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/pos/approvals/export', params)
  }
}

// Create singleton instance
export const posApprovalsApi = new POSApprovalsApiService()

// Export types for external use
export type {
  PendingTransactionsListResponse,
  ApprovalStatsResponse,
  ApprovalRequestWithNotes,
  BulkApprovalRequestBody
}
