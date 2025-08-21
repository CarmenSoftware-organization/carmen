// Vendor Dependency Checker Service
// Checks for dependencies before vendor deletion

import { vendorApi, pricelistApi, campaignApi } from '../api'
import { ApiResponse } from '../../types'

export interface VendorDependency {
  type: 'pricelist' | 'campaign' | 'purchaseOrder' | 'contract' | 'invoice'
  id: string
  name: string
  status: string
  createdAt: Date
  impact: 'low' | 'medium' | 'high'
  canDelete: boolean
  reason?: string
}

export interface DependencyCheckResult {
  canDelete: boolean
  dependencies: VendorDependency[]
  warnings: string[]
  blockers: string[]
  summary: {
    totalDependencies: number
    highImpact: number
    mediumImpact: number
    lowImpact: number
    blockers: number
  }
}

export class VendorDependencyChecker {
  
  /**
   * Comprehensive dependency check for vendor deletion
   */
  async checkDependencies(vendorId: string): Promise<ApiResponse<DependencyCheckResult>> {
    try {
      const dependencies: VendorDependency[] = []
      const warnings: string[] = []
      const blockers: string[] = []

      // Check for active pricelists
      const pricelistDeps = await this.checkPricelistDependencies(vendorId)
      if (pricelistDeps.success && pricelistDeps.data) {
        dependencies.push(...pricelistDeps.data)
      }

      // Check for active campaigns
      const campaignDeps = await this.checkCampaignDependencies(vendorId)
      if (campaignDeps.success && campaignDeps.data) {
        dependencies.push(...campaignDeps.data)
      }

      // Check for purchase orders
      const purchaseOrderDeps = await this.checkPurchaseOrderDependencies(vendorId)
      if (purchaseOrderDeps.success && purchaseOrderDeps.data) {
        dependencies.push(...purchaseOrderDeps.data)
      }

      // Check for contracts
      const contractDeps = await this.checkContractDependencies(vendorId)
      if (contractDeps.success && contractDeps.data) {
        dependencies.push(...contractDeps.data)
      }

      // Check for invoices
      const invoiceDeps = await this.checkInvoiceDependencies(vendorId)
      if (invoiceDeps.success && invoiceDeps.data) {
        dependencies.push(...invoiceDeps.data)
      }

      // Analyze dependencies and determine if deletion is possible
      const analysis = this.analyzeDependencies(dependencies)
      
      // Generate warnings and blockers
      const { warnings: generatedWarnings, blockers: generatedBlockers } = this.generateWarningsAndBlockers(dependencies)
      warnings.push(...generatedWarnings)
      blockers.push(...generatedBlockers)

      const result: DependencyCheckResult = {
        canDelete: blockers.length === 0,
        dependencies,
        warnings,
        blockers,
        summary: {
          totalDependencies: dependencies.length,
          highImpact: dependencies.filter(d => d.impact === 'high').length,
          mediumImpact: dependencies.filter(d => d.impact === 'medium').length,
          lowImpact: dependencies.filter(d => d.impact === 'low').length,
          blockers: blockers.length
        }
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEPENDENCY_CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check dependencies',
          details: { vendorId }
        }
      }
    }
  }

  /**
   * Check for pricelist dependencies
   */
  private async checkPricelistDependencies(vendorId: string): Promise<ApiResponse<VendorDependency[]>> {
    try {
      const result = await pricelistApi.list({ vendorIds: [vendorId] })
      
      if (!result.success || !result.data) {
        return { success: true, data: [] }
      }

      const dependencies: VendorDependency[] = result.data.items.map(pricelist => ({
        type: 'pricelist' as const,
        id: pricelist.id,
        name: `Pricelist ${pricelist.pricelistNumber}`,
        status: pricelist.status,
        createdAt: pricelist.createdAt,
        impact: this.assessPricelistImpact(pricelist.status, pricelist.items?.length || 0),
        canDelete: this.canDeletePricelist(pricelist.status),
        reason: this.getPricelistDeletionReason(pricelist.status)
      }))

      return {
        success: true,
        data: dependencies
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PRICELIST_DEPENDENCY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check pricelist dependencies'
        }
      }
    }
  }

  /**
   * Check for campaign dependencies
   */
  private async checkCampaignDependencies(vendorId: string): Promise<ApiResponse<VendorDependency[]>> {
    try {
      const result = await campaignApi.list({})
      
      if (!result.success || !result.data) {
        return { success: true, data: [] }
      }

      // Filter campaigns that include this vendor
      const vendorCampaigns = result.data.items.filter(campaign => 
        campaign.vendorIds.includes(vendorId)
      )

      const dependencies: VendorDependency[] = vendorCampaigns.map(campaign => ({
        type: 'campaign' as const,
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        impact: this.assessCampaignImpact(campaign.status, campaign.vendorIds.length),
        canDelete: this.canDeleteFromCampaign(campaign.status),
        reason: this.getCampaignDeletionReason(campaign.status)
      }))

      return {
        success: true,
        data: dependencies
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CAMPAIGN_DEPENDENCY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check campaign dependencies'
        }
      }
    }
  }

  /**
   * Check for purchase order dependencies
   */
  private async checkPurchaseOrderDependencies(vendorId: string): Promise<ApiResponse<VendorDependency[]>> {
    try {
      // Mock implementation - in real system would check purchase orders
      const mockPurchaseOrders = [
        {
          id: 'po-001',
          name: 'PO #2024-001',
          status: 'pending',
          createdAt: new Date('2024-01-15'),
          amount: 5000
        },
        {
          id: 'po-002',
          name: 'PO #2024-002',
          status: 'completed',
          createdAt: new Date('2024-01-10'),
          amount: 3000
        }
      ]

      const dependencies: VendorDependency[] = mockPurchaseOrders.map(po => ({
        type: 'purchaseOrder' as const,
        id: po.id,
        name: po.name,
        status: po.status,
        createdAt: po.createdAt,
        impact: this.assessPurchaseOrderImpact(po.status, po.amount),
        canDelete: this.canDeletePurchaseOrder(po.status),
        reason: this.getPurchaseOrderDeletionReason(po.status)
      }))

      return {
        success: true,
        data: dependencies
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PURCHASE_ORDER_DEPENDENCY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check purchase order dependencies'
        }
      }
    }
  }

  /**
   * Check for contract dependencies
   */
  private async checkContractDependencies(vendorId: string): Promise<ApiResponse<VendorDependency[]>> {
    try {
      // Mock implementation - in real system would check contracts
      const mockContracts = [
        {
          id: 'contract-001',
          name: 'Service Agreement 2024',
          status: 'active',
          createdAt: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        }
      ]

      const dependencies: VendorDependency[] = mockContracts.map(contract => ({
        type: 'contract' as const,
        id: contract.id,
        name: contract.name,
        status: contract.status,
        createdAt: contract.createdAt,
        impact: this.assessContractImpact(contract.status),
        canDelete: this.canDeleteContract(contract.status),
        reason: this.getContractDeletionReason(contract.status)
      }))

      return {
        success: true,
        data: dependencies
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_DEPENDENCY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check contract dependencies'
        }
      }
    }
  }

  /**
   * Check for invoice dependencies
   */
  private async checkInvoiceDependencies(vendorId: string): Promise<ApiResponse<VendorDependency[]>> {
    try {
      // Mock implementation - in real system would check invoices
      const mockInvoices = [
        {
          id: 'inv-001',
          name: 'Invoice #2024-001',
          status: 'paid',
          createdAt: new Date('2024-01-20'),
          amount: 2500
        },
        {
          id: 'inv-002',
          name: 'Invoice #2024-002',
          status: 'pending',
          createdAt: new Date('2024-01-25'),
          amount: 1800
        }
      ]

      const dependencies: VendorDependency[] = mockInvoices.map(invoice => ({
        type: 'invoice' as const,
        id: invoice.id,
        name: invoice.name,
        status: invoice.status,
        createdAt: invoice.createdAt,
        impact: this.assessInvoiceImpact(invoice.status, invoice.amount),
        canDelete: this.canDeleteInvoice(invoice.status),
        reason: this.getInvoiceDeletionReason(invoice.status)
      }))

      return {
        success: true,
        data: dependencies
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVOICE_DEPENDENCY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check invoice dependencies'
        }
      }
    }
  }

  /**
   * Analyze dependencies and determine overall impact
   */
  private analyzeDependencies(dependencies: VendorDependency[]): {
    canDelete: boolean
    riskLevel: 'low' | 'medium' | 'high'
  } {
    const highImpactDeps = dependencies.filter(d => d.impact === 'high')
    const undeletableDeps = dependencies.filter(d => !d.canDelete)

    if (undeletableDeps.length > 0) {
      return { canDelete: false, riskLevel: 'high' }
    }

    if (highImpactDeps.length > 0) {
      return { canDelete: true, riskLevel: 'high' }
    }

    const mediumImpactDeps = dependencies.filter(d => d.impact === 'medium')
    if (mediumImpactDeps.length > 0) {
      return { canDelete: true, riskLevel: 'medium' }
    }

    return { canDelete: true, riskLevel: 'low' }
  }

  /**
   * Generate warnings and blockers based on dependencies
   */
  private generateWarningsAndBlockers(dependencies: VendorDependency[]): {
    warnings: string[]
    blockers: string[]
  } {
    const warnings: string[] = []
    const blockers: string[] = []

    // Check for blockers
    const activePricelists = dependencies.filter(d => d.type === 'pricelist' && d.status === 'active')
    const activeCampaigns = dependencies.filter(d => d.type === 'campaign' && d.status === 'active')
    const activeContracts = dependencies.filter(d => d.type === 'contract' && d.status === 'active')
    const pendingPurchaseOrders = dependencies.filter(d => d.type === 'purchaseOrder' && d.status === 'pending')

    if (activePricelists.length > 0) {
      blockers.push(`Vendor has ${activePricelists.length} active pricelist(s) that must be deactivated first`)
    }

    if (activeCampaigns.length > 0) {
      blockers.push(`Vendor is participating in ${activeCampaigns.length} active campaign(s)`)
    }

    if (activeContracts.length > 0) {
      blockers.push(`Vendor has ${activeContracts.length} active contract(s) that must be terminated first`)
    }

    if (pendingPurchaseOrders.length > 0) {
      blockers.push(`Vendor has ${pendingPurchaseOrders.length} pending purchase order(s) that must be processed first`)
    }

    // Check for warnings
    const completedPricelists = dependencies.filter(d => d.type === 'pricelist' && d.status === 'submitted')
    const paidInvoices = dependencies.filter(d => d.type === 'invoice' && d.status === 'paid')
    const completedPurchaseOrders = dependencies.filter(d => d.type === 'purchaseOrder' && d.status === 'completed')

    if (completedPricelists.length > 0) {
      warnings.push(`Vendor has ${completedPricelists.length} completed pricelist(s) that will be permanently deleted`)
    }

    if (paidInvoices.length > 0) {
      warnings.push(`Vendor has ${paidInvoices.length} paid invoice(s) that will be archived`)
    }

    if (completedPurchaseOrders.length > 0) {
      warnings.push(`Vendor has ${completedPurchaseOrders.length} completed purchase order(s) that will be archived`)
    }

    return { warnings, blockers }
  }

  // Impact assessment methods
  private assessPricelistImpact(status: string, itemCount: number): 'low' | 'medium' | 'high' {
    if (status === 'active') return 'high'
    if (status === 'submitted' && itemCount > 50) return 'medium'
    return 'low'
  }

  private assessCampaignImpact(status: string, vendorCount: number): 'low' | 'medium' | 'high' {
    if (status === 'active') return 'high'
    if (status === 'completed' && vendorCount > 10) return 'medium'
    return 'low'
  }

  private assessPurchaseOrderImpact(status: string, amount: number): 'low' | 'medium' | 'high' {
    if (status === 'pending') return 'high'
    if (status === 'completed' && amount > 10000) return 'medium'
    return 'low'
  }

  private assessContractImpact(status: string): 'low' | 'medium' | 'high' {
    if (status === 'active') return 'high'
    return 'low'
  }

  private assessInvoiceImpact(status: string, amount: number): 'low' | 'medium' | 'high' {
    if (status === 'pending') return 'high'
    if (status === 'paid' && amount > 5000) return 'medium'
    return 'low'
  }

  // Deletion possibility methods
  private canDeletePricelist(status: string): boolean {
    return status !== 'active'
  }

  private canDeleteFromCampaign(status: string): boolean {
    return status !== 'active'
  }

  private canDeletePurchaseOrder(status: string): boolean {
    return status !== 'pending'
  }

  private canDeleteContract(status: string): boolean {
    return status !== 'active'
  }

  private canDeleteInvoice(status: string): boolean {
    return status !== 'pending'
  }

  // Deletion reason methods
  private getPricelistDeletionReason(status: string): string | undefined {
    if (status === 'active') return 'Active pricelists cannot be deleted'
    return undefined
  }

  private getCampaignDeletionReason(status: string): string | undefined {
    if (status === 'active') return 'Cannot remove vendor from active campaign'
    return undefined
  }

  private getPurchaseOrderDeletionReason(status: string): string | undefined {
    if (status === 'pending') return 'Pending purchase orders must be processed first'
    return undefined
  }

  private getContractDeletionReason(status: string): string | undefined {
    if (status === 'active') return 'Active contracts must be terminated first'
    return undefined
  }

  private getInvoiceDeletionReason(status: string): string | undefined {
    if (status === 'pending') return 'Pending invoices must be processed first'
    return undefined
  }
}

// Export singleton instance
export const vendorDependencyChecker = new VendorDependencyChecker()
export default vendorDependencyChecker