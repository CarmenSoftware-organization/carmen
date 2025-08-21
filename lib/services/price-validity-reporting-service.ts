import { readFileSync } from 'fs';
import { join } from 'path';

// Types for price validity reporting
export interface PriceValidityReport {
  id: string;
  name: string;
  description: string;
  generatedAt: Date;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  summary: ValidityReportSummary;
  details: ValidityReportDetail[];
  alerts: ValidityAlert[];
  recommendations: ValidityRecommendation[];
}

export interface ValidityReportSummary {
  totalPrices: number;
  activePrices: number;
  expiringPrices: number;
  expiredPrices: number;
  suspendedPrices: number;
  averageDaysUntilExpiration: number;
  totalValueAtRisk: number;
  currency: string;
  autoRenewalRate: number;
  manualInterventionRequired: number;
}

export interface ValidityReportDetail {
  priceItemId: string;
  productName: string;
  vendorName: string;
  currentStatus: string;
  effectiveDate: Date;
  expirationDate: Date;
  daysUntilExpiration?: number;
  daysSinceExpiration?: number;
  currentPrice: number;
  currency: string;
  autoRenewal: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  affectedPRs: number;
  totalValue: number;
  lastStatusChange: Date;
  nextAction: string;
  actionDeadline?: Date;
}

export interface ValidityAlert {
  id: string;
  type: 'expiration_warning' | 'critical_expiration' | 'grace_period' | 'renewal_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  priceItemId: string;
  productName: string;
  vendorName: string;
  createdAt: Date;
  actionRequired: boolean;
  actionText?: string;
  dueDate?: Date;
}

export interface ValidityRecommendation {
  id: string;
  type: 'renewal' | 'negotiation' | 'alternative_vendor' | 'bulk_renewal' | 'policy_change';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedBenefit: string;
  estimatedSavings?: number;
  implementationEffort: 'low' | 'medium' | 'high';
  affectedItems: string[];
  actionSteps: string[];
}

export interface ValidityReportFilters {
  vendorIds?: string[];
  productCategories?: string[];
  statusFilter?: string[];
  expirationDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  riskLevels?: string[];
  autoRenewalOnly?: boolean;
  requiresActionOnly?: boolean;
}

export class PriceValidityReportingService {
  private mockDataPath = join(process.cwd(), 'lib/mock/price-management');

  private loadMockData<T>(filename: string): T {
    try {
      const filePath = join(this.mockDataPath, filename);
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading mock data from ${filename}:`, error);
      throw new Error(`Failed to load mock data: ${filename}`);
    }
  }

  /**
   * Generate a comprehensive price validity report
   */
  async generateValidityReport(
    reportType: 'summary' | 'detailed' | 'executive',
    filters?: ValidityReportFilters
  ): Promise<PriceValidityReport> {
    const statusData = this.loadMockData<any>('price-status-indicators.json');
    const lifecycleData = this.loadMockData<any>('price-lifecycle-states.json');
    const expirationData = this.loadMockData<any>('expiration-scenarios.json');

    const reportId = `validity-report-${Date.now()}`;
    const now = new Date();
    const reportPeriod = {
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: now
    };

    // Filter price data based on provided filters
    let filteredPrices = statusData.priceStatusData;
    if (filters) {
      filteredPrices = this.applyFilters(filteredPrices, filters);
    }

    // Generate summary
    const summary = this.generateSummary(filteredPrices);

    // Generate detailed data
    const details = this.generateDetailedData(filteredPrices, reportType);

    // Generate alerts
    const alerts = this.generateAlerts(filteredPrices, expirationData.expirationScenarios);

    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredPrices, summary);

    return {
      id: reportId,
      name: `Price Validity Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      description: `Comprehensive price validity analysis for the period ${reportPeriod.startDate.toISOString().split('T')[0]} to ${reportPeriod.endDate.toISOString().split('T')[0]}`,
      generatedAt: now,
      reportPeriod,
      summary,
      details,
      alerts,
      recommendations
    };
  }

  /**
   * Get real-time validity alerts
   */
  async getValidityAlerts(severity?: string[]): Promise<ValidityAlert[]> {
    const statusData = this.loadMockData<any>('price-status-indicators.json');
    const expirationData = this.loadMockData<any>('expiration-scenarios.json');

    const alerts = this.generateAlerts(statusData.priceStatusData, expirationData.expirationScenarios);

    if (severity && severity.length > 0) {
      return alerts.filter(alert => severity.includes(alert.severity));
    }

    return alerts;
  }

  /**
   * Get validity metrics dashboard data
   */
  async getValidityMetrics(): Promise<{
    summary: ValidityReportSummary;
    trends: any[];
    statusDistribution: any[];
    riskAnalysis: any[];
  }> {
    const statusData = this.loadMockData<any>('price-status-indicators.json');
    const versionHistory = this.loadMockData<any>('price-version-history.json');

    const summary = this.generateSummary(statusData.priceStatusData);

    // Generate trend data (mock historical data)
    const trends = this.generateTrendData();

    // Generate status distribution
    const statusDistribution = Object.entries(statusData.statusMetrics.statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count as number) / statusData.statusMetrics.totalPrices * 100).toFixed(1)
    }));

    // Generate risk analysis
    const riskAnalysis = this.generateRiskAnalysis(statusData.priceStatusData);

    return {
      summary,
      trends,
      statusDistribution,
      riskAnalysis
    };
  }

  /**
   * Get expiration forecast
   */
  async getExpirationForecast(days: number = 90): Promise<{
    forecast: any[];
    summary: {
      totalExpiring: number;
      highRiskItems: number;
      autoRenewalItems: number;
      manualActionRequired: number;
    };
  }> {
    const statusData = this.loadMockData<any>('price-status-indicators.json');

    const forecast = [];
    const now = new Date();
    
    // Generate forecast for next 'days' period
    for (let i = 0; i <= days; i += 7) { // Weekly intervals
      const forecastDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const expiringItems = statusData.priceStatusData.filter((item: any) => {
        const expirationDate = new Date(item.expirationDate);
        return expirationDate >= forecastDate && expirationDate < new Date(forecastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      });

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        expiringCount: expiringItems.length,
        totalValue: expiringItems.reduce((sum: number, item: any) => sum + (item.currentPrice || 0), 0),
        highRiskCount: expiringItems.filter((item: any) => !item.autoRenewal).length,
        autoRenewalCount: expiringItems.filter((item: any) => item.autoRenewal).length
      });
    }

    const summary = {
      totalExpiring: statusData.priceStatusData.filter((item: any) => {
        const expirationDate = new Date(item.expirationDate);
        return expirationDate <= new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }).length,
      highRiskItems: statusData.priceStatusData.filter((item: any) => 
        !item.autoRenewal && item.daysUntilExpiration <= days
      ).length,
      autoRenewalItems: statusData.priceStatusData.filter((item: any) => 
        item.autoRenewal && item.daysUntilExpiration <= days
      ).length,
      manualActionRequired: statusData.statusMetrics.requiresActionCount
    };

    return { forecast, summary };
  }

  private applyFilters(prices: any[], filters: ValidityReportFilters): any[] {
    let filtered = [...prices];

    if (filters.statusFilter && filters.statusFilter.length > 0) {
      filtered = filtered.filter(price => filters.statusFilter!.includes(price.currentStatus));
    }

    if (filters.requiresActionOnly) {
      const statusIndicators = this.loadMockData<any>('price-status-indicators.json');
      const actionRequiredStatuses = statusIndicators.statusIndicators
        .filter((indicator: any) => indicator.requiresAction)
        .map((indicator: any) => indicator.id);
      
      filtered = filtered.filter(price => actionRequiredStatuses.includes(price.currentStatus));
    }

    if (filters.autoRenewalOnly !== undefined) {
      filtered = filtered.filter(price => price.autoRenewal === filters.autoRenewalOnly);
    }

    return filtered;
  }

  private generateSummary(prices: any[]): ValidityReportSummary {
    const statusCounts = prices.reduce((acc, price) => {
      acc[price.currentStatus] = (acc[price.currentStatus] || 0) + 1;
      return acc;
    }, {});

    const totalValue = prices.reduce((sum, price) => {
      // Mock calculation - in real implementation, this would be based on actual PR values
      return sum + ((price.currentPrice || 0) * 100); // Assuming average quantity of 100
    }, 0);

    const validPrices = prices.filter(price => price.daysUntilExpiration !== undefined);
    const averageDaysUntilExpiration = validPrices.length > 0 
      ? validPrices.reduce((sum, price) => sum + price.daysUntilExpiration, 0) / validPrices.length 
      : 0;

    const autoRenewalCount = prices.filter(price => price.autoRenewal).length;
    const autoRenewalRate = prices.length > 0 ? autoRenewalCount / prices.length : 0;

    const statusIndicators = this.loadMockData<any>('price-status-indicators.json');
    const actionRequiredStatuses = statusIndicators.statusIndicators
      .filter((indicator: any) => indicator.requiresAction)
      .map((indicator: any) => indicator.id);
    
    const manualInterventionRequired = prices.filter(price => 
      actionRequiredStatuses.includes(price.currentStatus)
    ).length;

    return {
      totalPrices: prices.length,
      activePrices: statusCounts['active'] || 0,
      expiringPrices: statusCounts['expiring'] || 0,
      expiredPrices: (statusCounts['expired'] || 0) + (statusCounts['grace_period'] || 0),
      suspendedPrices: statusCounts['suspended'] || 0,
      averageDaysUntilExpiration: Math.round(averageDaysUntilExpiration),
      totalValueAtRisk: totalValue,
      currency: 'USD',
      autoRenewalRate: Math.round(autoRenewalRate * 100) / 100,
      manualInterventionRequired
    };
  }

  private generateDetailedData(prices: any[], reportType: string): ValidityReportDetail[] {
    return prices.map(price => {
      const riskLevel = this.calculateRiskLevel(price);
      const nextAction = this.determineNextAction(price);
      
      return {
        priceItemId: price.priceItemId,
        productName: price.productName,
        vendorName: price.vendorName,
        currentStatus: price.currentStatus,
        effectiveDate: new Date(price.effectiveDate),
        expirationDate: new Date(price.expirationDate),
        daysUntilExpiration: price.daysUntilExpiration,
        daysSinceExpiration: price.daysSinceExpiration,
        currentPrice: price.currentPrice || 0,
        currency: 'USD',
        autoRenewal: price.autoRenewal,
        riskLevel,
        affectedPRs: Math.floor(Math.random() * 10) + 1, // Mock data
        totalValue: (price.currentPrice || 0) * (Math.floor(Math.random() * 100) + 50), // Mock calculation
        lastStatusChange: new Date(price.statusHistory?.[price.statusHistory.length - 1]?.timestamp || price.effectiveDate),
        nextAction: nextAction.action,
        actionDeadline: nextAction.deadline
      };
    });
  }

  private generateAlerts(prices: any[], scenarios: any[]): ValidityAlert[] {
    const alerts: ValidityAlert[] = [];

    prices.forEach(price => {
      const statusIndicators = this.loadMockData<any>('price-status-indicators.json');
      const statusInfo = statusIndicators.statusIndicators.find((s: any) => s.id === price.currentStatus);

      if (statusInfo?.requiresAction) {
        const severity = this.mapUrgencyToSeverity(statusInfo.urgencyLevel);
        
        alerts.push({
          id: `alert-${price.priceItemId}-${Date.now()}`,
          type: this.mapStatusToAlertType(price.currentStatus),
          severity,
          title: `${statusInfo.displayText}: ${price.productName}`,
          message: `${price.productName} from ${price.vendorName} requires attention. Status: ${statusInfo.description}`,
          priceItemId: price.priceItemId,
          productName: price.productName,
          vendorName: price.vendorName,
          createdAt: new Date(),
          actionRequired: true,
          actionText: statusInfo.actionText,
          dueDate: price.expirationDate ? new Date(price.expirationDate) : undefined
        });
      }
    });

    return alerts;
  }

  private generateRecommendations(prices: any[], summary: ValidityReportSummary): ValidityRecommendation[] {
    const recommendations: ValidityRecommendation[] = [];

    // Recommendation for bulk renewals
    if (summary.expiringPrices > 3) {
      recommendations.push({
        id: 'bulk-renewal-001',
        type: 'bulk_renewal',
        priority: 'medium',
        title: 'Consider Bulk Renewal for Expiring Prices',
        description: `${summary.expiringPrices} prices are expiring soon. Consider negotiating bulk renewals for better rates.`,
        expectedBenefit: 'Potential 5-10% cost savings through bulk negotiations',
        estimatedSavings: summary.totalValueAtRisk * 0.075,
        implementationEffort: 'medium',
        affectedItems: prices.filter(p => p.currentStatus === 'expiring').map(p => p.priceItemId),
        actionSteps: [
          'Group expiring prices by vendor',
          'Schedule renewal meetings with vendors',
          'Negotiate bulk renewal terms',
          'Execute bulk renewal agreements'
        ]
      });
    }

    // Recommendation for auto-renewal setup
    const manualRenewalCount = prices.filter(p => !p.autoRenewal).length;
    if (manualRenewalCount > summary.totalPrices * 0.3) {
      recommendations.push({
        id: 'auto-renewal-001',
        type: 'policy_change',
        priority: 'high',
        title: 'Increase Auto-Renewal Adoption',
        description: `${manualRenewalCount} prices require manual renewal. Consider enabling auto-renewal for stable vendor relationships.`,
        expectedBenefit: 'Reduced manual workload and fewer expiration incidents',
        implementationEffort: 'low',
        affectedItems: prices.filter(p => !p.autoRenewal).map(p => p.priceItemId),
        actionSteps: [
          'Review vendor performance metrics',
          'Identify stable vendor relationships',
          'Enable auto-renewal for qualified vendors',
          'Set up monitoring for auto-renewed prices'
        ]
      });
    }

    // Recommendation for alternative vendors
    const expiredCount = summary.expiredPrices;
    if (expiredCount > 0) {
      recommendations.push({
        id: 'alternative-vendor-001',
        type: 'alternative_vendor',
        priority: 'high',
        title: 'Source Alternative Vendors for Expired Prices',
        description: `${expiredCount} prices have expired. Consider sourcing alternative vendors to ensure supply continuity.`,
        expectedBenefit: 'Improved supply chain resilience and competitive pricing',
        implementationEffort: 'high',
        affectedItems: prices.filter(p => p.currentStatus === 'expired' || p.currentStatus === 'grace_period').map(p => p.priceItemId),
        actionSteps: [
          'Identify critical expired items',
          'Research alternative vendors',
          'Request quotes from new vendors',
          'Evaluate and onboard selected vendors'
        ]
      });
    }

    return recommendations;
  }

  private generateTrendData(): any[] {
    // Mock trend data for the last 12 months
    const trends = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trends.push({
        month: date.toISOString().substring(0, 7),
        activePrices: Math.floor(Math.random() * 50) + 100,
        expiringPrices: Math.floor(Math.random() * 20) + 5,
        expiredPrices: Math.floor(Math.random() * 10) + 2,
        renewalRate: (Math.random() * 0.3 + 0.7).toFixed(2)
      });
    }
    
    return trends;
  }

  private generateRiskAnalysis(prices: any[]): any[] {
    const riskLevels = ['low', 'medium', 'high'];
    
    return riskLevels.map(level => {
      const count = prices.filter(price => this.calculateRiskLevel(price) === level).length;
      return {
        riskLevel: level,
        count,
        percentage: prices.length > 0 ? ((count / prices.length) * 100).toFixed(1) : '0.0'
      };
    });
  }

  private calculateRiskLevel(price: any): 'low' | 'medium' | 'high' {
    if (price.currentStatus === 'expired' || price.currentStatus === 'grace_period') {
      return 'high';
    }
    
    if (price.currentStatus === 'expiring' || price.currentStatus === 'suspended') {
      return 'medium';
    }
    
    if (!price.autoRenewal && price.daysUntilExpiration <= 30) {
      return 'medium';
    }
    
    return 'low';
  }

  private determineNextAction(price: any): { action: string; deadline?: Date } {
    const statusIndicators = this.loadMockData<any>('price-status-indicators.json');
    const statusInfo = statusIndicators.statusIndicators.find((s: any) => s.id === price.currentStatus);
    
    if (statusInfo?.requiresAction) {
      const deadline = price.expirationDate ? new Date(price.expirationDate) : undefined;
      return {
        action: statusInfo.actionText || 'Review required',
        deadline
      };
    }
    
    return { action: 'No action required' };
  }

  private mapUrgencyToSeverity(urgency: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (urgency) {
      case 'high': return 'critical';
      case 'medium': return 'high';
      case 'low': return 'medium';
      default: return 'low';
    }
  }

  private mapStatusToAlertType(status: string): 'expiration_warning' | 'critical_expiration' | 'grace_period' | 'renewal_failure' {
    switch (status) {
      case 'expiring': return 'expiration_warning';
      case 'expired': return 'critical_expiration';
      case 'grace_period': return 'grace_period';
      case 'suspended': return 'renewal_failure';
      default: return 'expiration_warning';
    }
  }
}

export const priceValidityReportingService = new PriceValidityReportingService();