/**
 * Inventory Settings Service
 *
 * Manages inventory configuration settings (costing method, etc.)
 * See: docs/app/shared-methods/inventory-valuation/SM-inventory-valuation.md
 */

import { CostingMethod, InventorySettings } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

/**
 * Settings update request
 */
export interface UpdateCostingMethodRequest {
  method: CostingMethod
  userId: string
  reason?: string
}

/**
 * Audit log entry for settings changes
 */
interface SettingsAuditLog {
  id: string
  eventType: 'COSTING_METHOD_CHANGED'
  oldValue: CostingMethod
  newValue: CostingMethod
  reason?: string
  userId: string
  timestamp: Date
}

// ============================================================================
// Inventory Settings Service
// ============================================================================

export class InventorySettingsService {
  /**
   * Get inventory settings for a company
   *
   * @param companyId - Company identifier (optional, defaults to current user's company)
   * @returns Inventory settings record
   * @throws Error if settings not found
   *
   * @example
   * const settings = await service.getSettings()
   * console.log(settings.defaultCostingMethod) // 'FIFO' or 'PERIODIC_AVERAGE'
   */
  async getSettings(companyId?: string): Promise<InventorySettings> {
    const targetCompanyId = companyId || await this.getCurrentCompanyId()

    const settings = await this.querySettingsFromDatabase(targetCompanyId)

    if (!settings) {
      throw new Error(`Inventory settings not found for company ${targetCompanyId}`)
    }

    return settings
  }

  /**
   * Update the system-wide costing method
   *
   * @param method - New costing method ('FIFO' or 'PERIODIC_AVERAGE')
   * @param userId - User making the change
   * @param reason - Optional reason for change (audit trail)
   * @returns Updated settings
   * @throws Error if update fails
   *
   * @example
   * const updated = await service.updateCostingMethod(
   *   'PERIODIC_AVERAGE',
   *   'USER-123',
   *   'Switching to periodic average for performance'
   * )
   */
  async updateCostingMethod(
    method: CostingMethod,
    userId: string,
    reason?: string
  ): Promise<InventorySettings> {
    // Validate costing method
    this.validateCostingMethod(method)

    // Get current settings
    const currentSettings = await this.getSettings()

    // Check if method is actually changing
    if (currentSettings.defaultCostingMethod === method) {
      console.log('Costing method unchanged, no update needed')
      return currentSettings
    }

    // Create audit log entry BEFORE making the change
    await this.createAuditLog({
      eventType: 'COSTING_METHOD_CHANGED',
      oldValue: currentSettings.defaultCostingMethod,
      newValue: method,
      reason,
      userId,
      timestamp: new Date()
    })

    // Update settings
    const updatedSettings: InventorySettings = {
      ...currentSettings,
      defaultCostingMethod: method,
      updatedAt: new Date(),
      updatedBy: userId
    }

    // Save to database
    await this.saveSettingsToDatabase(updatedSettings)

    // Send notifications
    await this.notifySettingsChange(currentSettings.defaultCostingMethod, method, userId)

    // Invalidate application cache
    await this.invalidateSettingsCache(currentSettings.companyId)

    console.log(`Costing method updated from ${currentSettings.defaultCostingMethod} to ${method} by user ${userId}`)

    return updatedSettings
  }

  /**
   * Quick method to get just the costing method
   *
   * @param companyId - Optional company identifier
   * @returns Current costing method
   *
   * @example
   * const method = await service.getDefaultCostingMethod()
   * if (method === 'FIFO') {
   *   // Use FIFO logic
   * }
   */
  async getDefaultCostingMethod(companyId?: string): Promise<CostingMethod> {
    const settings = await this.getSettings(companyId)
    return settings.defaultCostingMethod
  }

  /**
   * Initialize settings for a new company
   *
   * @param companyId - Company identifier
   * @param userId - User creating the settings
   * @param initialMethod - Initial costing method (defaults to FIFO)
   * @returns Created settings
   *
   * @example
   * const settings = await service.initializeSettings('COMPANY-123', 'USER-456', 'FIFO')
   */
  async initializeSettings(
    companyId: string,
    userId: string,
    initialMethod: CostingMethod = CostingMethod.FIFO
  ): Promise<InventorySettings> {
    // Check if settings already exist
    const existing = await this.querySettingsFromDatabase(companyId)
    if (existing) {
      throw new Error(`Settings already exist for company ${companyId}`)
    }

    // Create new settings
    const newSettings: InventorySettings = {
      id: this.generateId(),
      companyId,
      defaultCostingMethod: initialMethod,
      periodType: 'CALENDAR_MONTH',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: undefined
    }

    // Save to database
    await this.saveSettingsToDatabase(newSettings)

    // Create audit log
    await this.createAuditLog({
      eventType: 'COSTING_METHOD_CHANGED',
      oldValue: null as any, // No previous value
      newValue: initialMethod,
      reason: 'Initial settings creation',
      userId,
      timestamp: new Date()
    })

    console.log(`Initialized inventory settings for company ${companyId} with method ${initialMethod}`)

    return newSettings
  }

  /**
   * Validate costing method value
   *
   * @param method - Method to validate
   * @throws Error if invalid
   */
  private validateCostingMethod(method: CostingMethod): void {
    const validMethods: CostingMethod[] = [
      CostingMethod.FIFO,
      CostingMethod.PERIODIC_AVERAGE
    ]

    if (!validMethods.includes(method)) {
      throw new Error(
        `Invalid costing method: ${method}. Must be one of: ${validMethods.join(', ')}`
      )
    }
  }

  /**
   * Send notifications about settings change
   *
   * @param oldMethod - Previous costing method
   * @param newMethod - New costing method
   * @param userId - User who made the change
   */
  private async notifySettingsChange(
    oldMethod: CostingMethod,
    newMethod: CostingMethod,
    userId: string
  ): Promise<void> {
    // TODO: Implement notification system
    // Send to:
    // - Finance managers
    // - Operations managers
    // - System administrators

    console.log(`Notification: Costing method changed from ${oldMethod} to ${newMethod} by user ${userId}`)

    // Example notification:
    // await notificationService.send({
    //   title: 'Inventory Costing Method Changed',
    //   message: `The inventory costing method has been changed from ${oldMethod} to ${newMethod}.`,
    //   severity: 'MEDIUM',
    //   recipients: ['finance-managers', 'operations-managers'],
    //   metadata: { oldMethod, newMethod, userId }
    // })
  }

  /**
   * Invalidate application-level settings cache
   *
   * @param companyId - Company identifier
   */
  private async invalidateSettingsCache(companyId: string): Promise<void> {
    // TODO: Implement cache invalidation
    // If using Redis, Memcached, or application cache
    console.log(`Invalidating settings cache for company ${companyId}`)
  }

  /**
   * Create audit log entry
   *
   * @param logEntry - Audit log data
   */
  private async createAuditLog(logEntry: Partial<SettingsAuditLog>): Promise<void> {
    // TODO: Implement audit logging
    /*
    INSERT INTO valuation_audit_log (
      id, event_type, old_value, new_value,
      reason, user_id, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    */

    console.log('Audit log created:', logEntry)
  }

  /**
   * Generate unique ID
   * TODO: Implement proper UUID generation
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get current user's company ID
   * TODO: Implement actual user context lookup
   */
  private async getCurrentCompanyId(): Promise<string> {
    // Placeholder - get from user context/session
    return 'DEFAULT-COMPANY-ID'
  }

  // ============================================================================
  // Database Operations (To be implemented)
  // ============================================================================

  /**
   * Query settings from database
   * TODO: Implement actual database query
   */
  private async querySettingsFromDatabase(
    companyId: string
  ): Promise<InventorySettings | null> {
    // Placeholder - implement with actual database
    /*
    SELECT * FROM inventory_settings
    WHERE company_id = ?
    LIMIT 1
    */

    console.warn('querySettingsFromDatabase not yet implemented', companyId)

    // Return mock data for development
    return {
      id: 'SETTINGS-001',
      companyId,
      defaultCostingMethod: CostingMethod.FIFO,
      periodType: 'CALENDAR_MONTH',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'SYSTEM',
      updatedBy: undefined
    }
  }

  /**
   * Save settings to database
   * TODO: Implement actual database upsert
   */
  private async saveSettingsToDatabase(
    settings: InventorySettings
  ): Promise<void> {
    // Placeholder - implement with actual database
    /*
    INSERT INTO inventory_settings (
      id, company_id, default_costing_method, period_type,
      created_at, updated_at, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (company_id) DO UPDATE SET
      default_costing_method = EXCLUDED.default_costing_method,
      period_type = EXCLUDED.period_type,
      updated_at = EXCLUDED.updated_at,
      updated_by = EXCLUDED.updated_by
    */

    console.warn('saveSettingsToDatabase not yet implemented', settings)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get costing method with caching
 *
 * Uses in-memory cache to avoid database queries on every request
 */
let cachedMethod: CostingMethod | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

export async function getCostingMethodCached(
  service: InventorySettingsService
): Promise<CostingMethod> {
  const now = Date.now()

  // Check if cache is still valid
  if (cachedMethod && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedMethod
  }

  // Cache miss or expired - fetch from database
  const method = await service.getDefaultCostingMethod()

  // Update cache
  cachedMethod = method
  cacheTimestamp = now

  return method
}

/**
 * Clear the costing method cache
 * Call this after updating settings
 */
export function clearCostingMethodCache(): void {
  cachedMethod = null
  cacheTimestamp = 0
}
