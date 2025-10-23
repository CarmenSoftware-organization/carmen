/**
 * POS Integration - Transactions API Service
 *
 * Handles all POS transaction operations including:
 * - Transaction retrieval and filtering
 * - Transaction detail viewing
 * - Failed transaction handling
 * - Transaction retry and manual resolution
 */

import { apiClient, type ApiResponse, type PaginationParams } from './client'
import type {
  POSTransaction,
  TransactionStatus,
  TransactionError,
  TransactionAuditLog,
  TransactionStatistics,
  ManualResolutionRequest,
  RetryTransactionRequest,
  POSWebSocketEvent
} from '@/lib/types/pos-integration'

// API response types
export interface TransactionListResponse {
  transactions: POSTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
}

export interface TransactionDetailResponse extends POSTransaction {
  lineItems?: any[]
  error?: TransactionError
  auditLog: TransactionAuditLog[]
  relatedTransactions?: POSTransaction[]
}

export interface FailedTransactionsListResponse {
  transactions: POSTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
  pageCount: number
  errorSummary: {
    mappingErrors: number
    stockErrors: number
    validationErrors: number
    systemErrors: number
    connectionErrors: number
  }
}

// Filter types
export interface TransactionFilters {
  status?: TransactionStatus[]
  locationId?: string[]
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
  minAmount?: number
  maxAmount?: number
  currency?: string
}

export interface FailedTransactionFilters {
  errorCategory?: string[]
  errorSeverity?: ('low' | 'medium' | 'high' | 'critical')[]
  locationId?: string[]
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

// POS Transactions API Service
export class POSTransactionsApiService {
  /**
   * Get all transactions with filtering and pagination
   */
  async getTransactions(
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<TransactionListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<TransactionListResponse>('/pos/transactions', params)
  }

  /**
   * Get transaction by ID with full details
   */
  async getTransactionDetail(id: string): Promise<ApiResponse<TransactionDetailResponse>> {
    return apiClient.get<TransactionDetailResponse>(`/pos/transactions/${id}`)
  }

  /**
   * Get transactions by status
   */
  async getTransactionsByStatus(
    status: TransactionStatus,
    pagination?: PaginationParams
  ): Promise<ApiResponse<TransactionListResponse>> {
    const params = {
      status: [status],
      ...pagination
    }

    return apiClient.get<TransactionListResponse>('/pos/transactions', params)
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<TransactionStatistics>> {
    const params = {
      dateFrom,
      dateTo
    }

    return apiClient.get<TransactionStatistics>('/pos/transactions/stats', params)
  }

  /**
   * Get failed transactions with filtering
   */
  async getFailedTransactions(
    filters?: FailedTransactionFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<FailedTransactionsListResponse>> {
    const params = {
      ...filters,
      ...pagination
    }

    return apiClient.get<FailedTransactionsListResponse>('/pos/transactions/failed', params)
  }

  /**
   * Get transaction error details
   */
  async getTransactionError(transactionId: string): Promise<ApiResponse<TransactionError>> {
    return apiClient.get<TransactionError>(`/pos/transactions/${transactionId}/error`)
  }

  /**
   * Get transaction audit log
   */
  async getTransactionAuditLog(transactionId: string): Promise<ApiResponse<TransactionAuditLog[]>> {
    return apiClient.get<TransactionAuditLog[]>(`/pos/transactions/${transactionId}/audit-log`)
  }

  /**
   * Retry failed transaction
   */
  async retryTransaction(
    transactionId: string,
    request: RetryTransactionRequest
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post<POSTransaction>(
      `/pos/transactions/${transactionId}/retry`,
      request
    )
  }

  /**
   * Manually resolve failed transaction
   */
  async manuallyResolveTransaction(
    transactionId: string,
    request: ManualResolutionRequest
  ): Promise<ApiResponse<POSTransaction>> {
    return apiClient.post<POSTransaction>(
      `/pos/transactions/${transactionId}/resolve`,
      request
    )
  }

  /**
   * Get suggested fixes for failed transaction
   */
  async getSuggestedFixes(transactionId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/pos/transactions/${transactionId}/suggested-fixes`)
  }

  /**
   * Filter transactions by location
   */
  async filterByLocation(
    locationId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<TransactionListResponse>> {
    const params = {
      locationId: [locationId],
      ...pagination
    }

    return apiClient.get<TransactionListResponse>('/pos/transactions', params)
  }

  /**
   * Filter transactions by date range
   */
  async filterByDateRange(
    dateFrom: string,
    dateTo: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<TransactionListResponse>> {
    const params = {
      dateFrom,
      dateTo,
      ...pagination
    }

    return apiClient.get<TransactionListResponse>('/pos/transactions', params)
  }

  /**
   * Search transactions
   */
  async searchTransactions(
    query: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<TransactionListResponse>> {
    const params = {
      searchQuery: query,
      ...pagination
    }

    return apiClient.get<TransactionListResponse>('/pos/transactions', params)
  }

  /**
   * Export transactions to CSV/Excel
   */
  async exportTransactions(
    format: 'csv' | 'excel',
    filters?: TransactionFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = {
      format,
      ...filters
    }

    return apiClient.get<{ downloadUrl: string }>('/pos/transactions/export', params)
  }

  /**
   * Subscribe to real-time transaction updates (WebSocket)
   */
  async subscribeToUpdates(callback: (event: POSWebSocketEvent) => void): Promise<() => void> {
    // WebSocket implementation would go here
    // For now, return a no-op unsubscribe function
    return () => {}
  }

  /**
   * Get transaction line items
   */
  async getTransactionLineItems(transactionId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/pos/transactions/${transactionId}/line-items`)
  }

  /**
   * Get related transactions (e.g., retries, duplicates)
   */
  async getRelatedTransactions(transactionId: string): Promise<ApiResponse<POSTransaction[]>> {
    return apiClient.get<POSTransaction[]>(`/pos/transactions/${transactionId}/related`)
  }

  /**
   * Bulk retry failed transactions
   */
  async bulkRetryTransactions(
    transactionIds: string[],
    notes?: string
  ): Promise<ApiResponse<{
    successful: number
    failed: string[]
  }>> {
    return apiClient.post('/pos/transactions/bulk-retry', {
      transactionIds,
      notes
    })
  }

  /**
   * Bulk resolve failed transactions
   */
  async bulkResolveTransactions(
    transactionIds: string[],
    resolution: 'manually_processed' | 'not_required' | 'duplicate' | 'other',
    notes: string
  ): Promise<ApiResponse<{
    successful: number
    failed: string[]
  }>> {
    return apiClient.post('/pos/transactions/bulk-resolve', {
      transactionIds,
      resolution,
      notes
    })
  }
}

// Create singleton instance
export const posTransactionsApi = new POSTransactionsApiService()
