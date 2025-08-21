export interface VendorComparison {
  vendorId: string;
  vendorName: string;
  metrics: {
    responseRate: number;
    onTimeDeliveryRate: number;
    priceCompetitiveness: number;
    qualityScore: number;
    reliabilityScore: number;
    costSavingsContribution: number;
  };
  categories: string[];
  totalSubmissions: number;
  averageResponseTime: number; // in days
  priceRanking: number; // 1 = most competitive
  overallRanking: number;
}

export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  vendors: {
    vendorId: string;
    vendorName: string;
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketShare: number;
    itemCount: number;
    lastUpdated: Date;
  }[];
  marketInsights: {
    averageMarketPrice: number;
    priceVolatility: 'low' | 'medium' | 'high';
    competitionLevel: 'low' | 'medium' | 'high';
    recommendedVendors: string[];
  };
}

export interface PriceComparison {
  itemId: string;
  itemName: string;
  category: string;
  vendors: {
    vendorId: string;
    vendorName: string;
    price: number;
    currency: string;
    normalizedPrice: number;
    availability: 'available' | 'limited' | 'unavailable';
    leadTime: number;
    minQuantity: number;
    lastUpdated: Date;
    priceHistory: { date: Date; price: number }[];
  }[];
  recommendations: {
    bestPrice: string; // vendorId
    bestValue: string; // vendorId considering quality/price
    mostReliable: string; // vendorId
    fastest: string; // vendorId with shortest lead time
  };
}

export interface MarketAnalysis {
  timeframe: {
    start: Date;
    end: Date;
  };
  categories: {
    categoryId: string;
    categoryName: string;
    trends: {
      priceChange: number; // percentage
      vendorCount: number;
      competitionIndex: number; // 0-100
      marketLeader: string; // vendorId
    };
    insights: string[];
  }[];
  overallMarket: {
    totalVendors: number;
    activeCategories: number;
    averagePriceChange: number;
    marketConcentration: number; // 0-100, higher = more concentrated
    emergingVendors: string[];
    decliningVendors: string[];
  };
}

export interface CompetitivePosition {
  vendorId: string;
  vendorName: string;
  position: {
    marketShare: number;
    pricePosition: 'premium' | 'competitive' | 'budget';
    qualityPosition: 'high' | 'medium' | 'low';
    servicePosition: 'excellent' | 'good' | 'average' | 'poor';
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export class ComparativeAnalysisService {
  private vendorData: Map<string, any> = new Map();
  private categoryData: Map<string, any> = new Map();
  private priceData: Map<string, any> = new Map();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Compare vendors across multiple metrics
   */
  async compareVendors(vendorIds: string[], metrics?: string[]): Promise<VendorComparison[]> {
    const defaultMetrics = [
      'responseRate',
      'onTimeDeliveryRate', 
      'priceCompetitiveness',
      'qualityScore',
      'reliabilityScore',
      'costSavingsContribution'
    ];

    const selectedMetrics = metrics || defaultMetrics;
    const comparisons: VendorComparison[] = [];

    for (const vendorId of vendorIds) {
      const vendorInfo = this.vendorData.get(vendorId);
      if (!vendorInfo) continue;

      const comparison: VendorComparison = {
        vendorId,
        vendorName: vendorInfo.name,
        metrics: {
          responseRate: this.calculateResponseRate(vendorId),
          onTimeDeliveryRate: this.calculateOnTimeRate(vendorId),
          priceCompetitiveness: this.calculatePriceCompetitiveness(vendorId),
          qualityScore: this.calculateQualityScore(vendorId),
          reliabilityScore: this.calculateReliabilityScore(vendorId),
          costSavingsContribution: this.calculateCostSavings(vendorId)
        },
        categories: vendorInfo.categories || [],
        totalSubmissions: vendorInfo.totalSubmissions || 0,
        averageResponseTime: vendorInfo.averageResponseTime || 0,
        priceRanking: 0, // Will be calculated after all vendors
        overallRanking: 0 // Will be calculated after all vendors
      };

      comparisons.push(comparison);
    }

    // Calculate rankings
    this.calculateRankings(comparisons);

    return comparisons.sort((a, b) => a.overallRanking - b.overallRanking);
  }

  /**
   * Compare vendors within specific categories
   */
  async compareCategoriesByVendor(categoryIds: string[]): Promise<CategoryComparison[]> {
    const comparisons: CategoryComparison[] = [];

    for (const categoryId of categoryIds) {
      const categoryInfo = this.categoryData.get(categoryId);
      if (!categoryInfo) continue;

      const vendorsInCategory = this.getVendorsInCategory(categoryId);
      const vendors = vendorsInCategory.map(vendorId => {
        const vendorInfo = this.vendorData.get(vendorId);
        const priceData = this.getCategoryPriceData(categoryId, vendorId);

        return {
          vendorId,
          vendorName: vendorInfo?.name || 'Unknown',
          averagePrice: priceData.averagePrice,
          priceRange: priceData.priceRange,
          marketShare: this.calculateMarketShare(categoryId, vendorId),
          itemCount: priceData.itemCount,
          lastUpdated: priceData.lastUpdated
        };
      });

      const marketInsights = this.generateMarketInsights(categoryId, vendors);

      comparisons.push({
        categoryId,
        categoryName: categoryInfo.name,
        vendors: vendors.sort((a, b) => a.averagePrice - b.averagePrice),
        marketInsights
      });
    }

    return comparisons;
  }

  /**
   * Compare prices for specific items across vendors
   */
  async compareItemPrices(itemIds: string[]): Promise<PriceComparison[]> {
    const comparisons: PriceComparison[] = [];

    for (const itemId of itemIds) {
      const itemInfo = this.priceData.get(itemId);
      if (!itemInfo) continue;

      const vendors = itemInfo.vendors.map((vendor: any) => ({
        ...vendor,
        priceHistory: this.getPriceHistory(itemId, vendor.vendorId)
      }));

      const recommendations = this.generateItemRecommendations(vendors);

      comparisons.push({
        itemId,
        itemName: itemInfo.name,
        category: itemInfo.category,
        vendors: vendors.sort((a: any, b: any) => a.normalizedPrice - b.normalizedPrice),
        recommendations
      });
    }

    return comparisons;
  }

  /**
   * Analyze market trends and competitive landscape
   */
  async analyzeMarket(timeframe: { start: Date; end: Date }): Promise<MarketAnalysis> {
    const categories = Array.from(this.categoryData.keys()).map(categoryId => {
      const categoryInfo = this.categoryData.get(categoryId);
      const trends = this.calculateCategoryTrends(categoryId, timeframe);
      const insights = this.generateCategoryInsights(categoryId, trends);

      return {
        categoryId,
        categoryName: categoryInfo.name,
        trends,
        insights
      };
    });

    const overallMarket = this.calculateOverallMarketMetrics(timeframe);

    return {
      timeframe,
      categories,
      overallMarket
    };
  }

  /**
   * Analyze competitive position of a specific vendor
   */
  async analyzeCompetitivePosition(vendorId: string): Promise<CompetitivePosition> {
    const vendorInfo = this.vendorData.get(vendorId);
    if (!vendorInfo) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const position = {
      marketShare: this.calculateOverallMarketShare(vendorId),
      pricePosition: this.determinePricePosition(vendorId),
      qualityPosition: this.determineQualityPosition(vendorId),
      servicePosition: this.determineServicePosition(vendorId)
    };

    const swotAnalysis = this.performSWOTAnalysis(vendorId);

    return {
      vendorId,
      vendorName: vendorInfo.name,
      position,
      strengths: swotAnalysis.strengths,
      weaknesses: swotAnalysis.weaknesses,
      opportunities: swotAnalysis.opportunities,
      threats: swotAnalysis.threats,
      recommendations: this.generateVendorRecommendations(vendorId, swotAnalysis)
    };
  }

  /**
   * Generate comparative analysis report
   */
  async generateComparativeReport(options: {
    vendorIds?: string[];
    categoryIds?: string[];
    timeframe: { start: Date; end: Date };
    includeMarketAnalysis?: boolean;
    includeCompetitivePositioning?: boolean;
  }): Promise<{
    vendorComparisons?: VendorComparison[];
    categoryComparisons?: CategoryComparison[];
    marketAnalysis?: MarketAnalysis;
    competitivePositions?: CompetitivePosition[];
    executiveSummary: string;
  }> {
    const report: any = {};

    // Vendor comparisons
    if (options.vendorIds && options.vendorIds.length > 0) {
      report.vendorComparisons = await this.compareVendors(options.vendorIds);
    }

    // Category comparisons
    if (options.categoryIds && options.categoryIds.length > 0) {
      report.categoryComparisons = await this.compareCategoriesByVendor(options.categoryIds);
    }

    // Market analysis
    if (options.includeMarketAnalysis) {
      report.marketAnalysis = await this.analyzeMarket(options.timeframe);
    }

    // Competitive positioning
    if (options.includeCompetitivePositioning && options.vendorIds) {
      report.competitivePositions = await Promise.all(
        options.vendorIds.map(id => this.analyzeCompetitivePosition(id))
      );
    }

    // Generate executive summary
    report.executiveSummary = this.generateExecutiveSummary(report);

    return report;
  }

  // Private helper methods

  private initializeMockData(): void {
    // Mock vendor data
    const vendors = [
      { id: 'vendor-001', name: 'Global Office Solutions', categories: ['office-supplies', 'furniture'] },
      { id: 'vendor-002', name: 'TechPro Distributors', categories: ['it-equipment', 'electronics'] },
      { id: 'vendor-003', name: 'CleanCorp Supplies', categories: ['cleaning-supplies', 'maintenance'] }
    ];

    vendors.forEach(vendor => {
      this.vendorData.set(vendor.id, {
        ...vendor,
        totalSubmissions: Math.floor(Math.random() * 100) + 20,
        averageResponseTime: Math.random() * 3 + 1
      });
    });

    // Mock category data
    const categories = [
      { id: 'office-supplies', name: 'Office Supplies' },
      { id: 'it-equipment', name: 'IT Equipment' },
      { id: 'cleaning-supplies', name: 'Cleaning Supplies' }
    ];

    categories.forEach(category => {
      this.categoryData.set(category.id, category);
    });

    // Mock price data
    const items = [
      { id: 'item-001', name: 'A4 Paper Ream', category: 'office-supplies' },
      { id: 'item-002', name: 'Laptop Computer', category: 'it-equipment' },
      { id: 'item-003', name: 'All-Purpose Cleaner', category: 'cleaning-supplies' }
    ];

    items.forEach(item => {
      this.priceData.set(item.id, {
        ...item,
        vendors: vendors.map(vendor => ({
          vendorId: vendor.id,
          vendorName: vendor.name,
          price: Math.random() * 100 + 10,
          currency: 'USD',
          normalizedPrice: Math.random() * 100 + 10,
          availability: 'available',
          leadTime: Math.floor(Math.random() * 14) + 1,
          minQuantity: Math.floor(Math.random() * 10) + 1,
          lastUpdated: new Date()
        }))
      });
    });
  }

  private calculateResponseRate(vendorId: string): number {
    return Math.random() * 20 + 80; // 80-100%
  }

  private calculateOnTimeRate(vendorId: string): number {
    return Math.random() * 25 + 75; // 75-100%
  }

  private calculatePriceCompetitiveness(vendorId: string): number {
    return Math.random() * 2 + 3; // 3-5 scale
  }

  private calculateQualityScore(vendorId: string): number {
    return Math.random() * 1.5 + 3.5; // 3.5-5 scale
  }

  private calculateReliabilityScore(vendorId: string): number {
    return Math.random() * 1.5 + 3.5; // 3.5-5 scale
  }

  private calculateCostSavings(vendorId: string): number {
    return Math.random() * 20000 + 5000; // $5K-$25K
  }

  private calculateRankings(comparisons: VendorComparison[]): void {
    // Price ranking (lower price = better ranking)
    const sortedByPrice = [...comparisons].sort((a, b) => 
      b.metrics.priceCompetitiveness - a.metrics.priceCompetitiveness
    );
    sortedByPrice.forEach((comp, index) => {
      comp.priceRanking = index + 1;
    });

    // Overall ranking (weighted score)
    const sortedByOverall = [...comparisons].sort((a, b) => {
      const scoreA = this.calculateOverallScore(a);
      const scoreB = this.calculateOverallScore(b);
      return scoreB - scoreA;
    });
    sortedByOverall.forEach((comp, index) => {
      comp.overallRanking = index + 1;
    });
  }

  private calculateOverallScore(comparison: VendorComparison): number {
    const weights = {
      responseRate: 0.2,
      onTimeDeliveryRate: 0.2,
      priceCompetitiveness: 0.25,
      qualityScore: 0.2,
      reliabilityScore: 0.15
    };

    return Object.entries(weights).reduce((score, [metric, weight]) => {
      return score + (comparison.metrics[metric as keyof typeof comparison.metrics] * weight);
    }, 0);
  }

  private getVendorsInCategory(categoryId: string): string[] {
    return Array.from(this.vendorData.values())
      .filter((vendor: any) => vendor.categories.includes(categoryId))
      .map((vendor: any) => vendor.id);
  }

  private getCategoryPriceData(categoryId: string, vendorId: string): any {
    return {
      averagePrice: Math.random() * 100 + 20,
      priceRange: { min: 10, max: 150 },
      itemCount: Math.floor(Math.random() * 50) + 10,
      lastUpdated: new Date()
    };
  }

  private calculateMarketShare(categoryId: string, vendorId: string): number {
    return Math.random() * 30 + 5; // 5-35%
  }

  private generateMarketInsights(categoryId: string, vendors: any[]): any {
    const averagePrice = vendors.reduce((sum, v) => sum + v.averagePrice, 0) / vendors.length;
    const priceVariance = Math.max(...vendors.map(v => v.averagePrice)) - Math.min(...vendors.map(v => v.averagePrice));
    
    return {
      averageMarketPrice: averagePrice,
      priceVolatility: priceVariance > 50 ? 'high' : priceVariance > 20 ? 'medium' : 'low',
      competitionLevel: vendors.length > 5 ? 'high' : vendors.length > 2 ? 'medium' : 'low',
      recommendedVendors: vendors.slice(0, 3).map(v => v.vendorId)
    };
  }

  private getPriceHistory(itemId: string, vendorId: string): any[] {
    const history = [];
    const basePrice = Math.random() * 100 + 20;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const price = basePrice + (Math.random() - 0.5) * 10;
      history.push({ date, price });
    }
    
    return history;
  }

  private generateItemRecommendations(vendors: any[]): any {
    const sortedByPrice = [...vendors].sort((a, b) => a.normalizedPrice - b.normalizedPrice);
    const sortedByLeadTime = [...vendors].sort((a, b) => a.leadTime - b.leadTime);
    
    return {
      bestPrice: sortedByPrice[0]?.vendorId,
      bestValue: sortedByPrice[0]?.vendorId, // Simplified
      mostReliable: vendors[0]?.vendorId, // Simplified
      fastest: sortedByLeadTime[0]?.vendorId
    };
  }

  private calculateCategoryTrends(categoryId: string, timeframe: any): any {
    return {
      priceChange: (Math.random() - 0.5) * 20, // -10% to +10%
      vendorCount: Math.floor(Math.random() * 10) + 3,
      competitionIndex: Math.random() * 100,
      marketLeader: 'vendor-001' // Simplified
    };
  }

  private generateCategoryInsights(categoryId: string, trends: any): string[] {
    const insights = [];
    
    if (trends.priceChange > 5) {
      insights.push('Prices are trending upward, consider negotiating long-term contracts');
    } else if (trends.priceChange < -5) {
      insights.push('Prices are declining, good time for bulk purchases');
    }
    
    if (trends.competitionIndex > 70) {
      insights.push('High competition in this category provides good negotiation leverage');
    }
    
    return insights;
  }

  private calculateOverallMarketMetrics(timeframe: any): any {
    return {
      totalVendors: this.vendorData.size,
      activeCategories: this.categoryData.size,
      averagePriceChange: (Math.random() - 0.5) * 10,
      marketConcentration: Math.random() * 100,
      emergingVendors: ['vendor-004', 'vendor-005'],
      decliningVendors: ['vendor-006']
    };
  }

  private calculateOverallMarketShare(vendorId: string): number {
    return Math.random() * 25 + 5; // 5-30%
  }

  private determinePricePosition(vendorId: string): 'premium' | 'competitive' | 'budget' {
    const rand = Math.random();
    return rand > 0.66 ? 'premium' : rand > 0.33 ? 'competitive' : 'budget';
  }

  private determineQualityPosition(vendorId: string): 'high' | 'medium' | 'low' {
    const rand = Math.random();
    return rand > 0.66 ? 'high' : rand > 0.33 ? 'medium' : 'low';
  }

  private determineServicePosition(vendorId: string): 'excellent' | 'good' | 'average' | 'poor' {
    const rand = Math.random();
    return rand > 0.75 ? 'excellent' : rand > 0.5 ? 'good' : rand > 0.25 ? 'average' : 'poor';
  }

  private performSWOTAnalysis(vendorId: string): any {
    return {
      strengths: ['Competitive pricing', 'Reliable delivery', 'Good quality products'],
      weaknesses: ['Limited product range', 'Slow response times'],
      opportunities: ['Expand into new categories', 'Improve digital capabilities'],
      threats: ['New competitors entering market', 'Economic downturn affecting demand']
    };
  }

  private generateVendorRecommendations(vendorId: string, swot: any): string[] {
    return [
      'Focus on improving response times to enhance competitiveness',
      'Consider expanding product portfolio in high-demand categories',
      'Leverage pricing advantages to gain market share'
    ];
  }

  private generateExecutiveSummary(report: any): string {
    let summary = 'Executive Summary:\n\n';
    
    if (report.vendorComparisons) {
      const topVendor = report.vendorComparisons[0];
      summary += `Top performing vendor: ${topVendor.vendorName} with overall ranking #${topVendor.overallRanking}.\n`;
    }
    
    if (report.marketAnalysis) {
      const avgChange = report.marketAnalysis.overallMarket.averagePriceChange;
      summary += `Market prices have ${avgChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(avgChange).toFixed(1)}% on average.\n`;
    }
    
    summary += '\nKey recommendations: Focus on vendor relationship management and continuous market monitoring.';
    
    return summary;
  }
}

export const comparativeAnalysisService = new ComparativeAnalysisService();