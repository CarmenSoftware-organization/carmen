import { 
  PriceAssignmentHistory, 
  AuditTrailEntry, 
  AssignmentEvent,
  AuditQuery,
  AuditReport
} from '@/lib/types/price-management';

// Mock data imports
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';

export class AssignmentAuditService {
  private auditTrail: AuditTrailEntry[] = [];

  /**
   * Log a price assignment event for audit trail
   */
  async logAssignmentEvent(event: AssignmentEvent): Promise<void> {
    const auditEntry: AuditTrailEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType: event.type,
      prItemId: event.prItemId,
      userId: event.userId || 'system',
      userRole: event.userRole || 'system',
      action: event.action,
      details: event.details,
      beforeState: event.beforeState,
      afterState: event.afterState,
      metadata: {
        ipAddress: event.metadata?.ipAddress || '127.0.0.1',
        userAgent: event.metadata?.userAgent || 'System',
        sessionId: event.metadata?.sessionId || 'system-session',
        requestId: event.metadata?.requestId || `req-${Date.now()}`
      }
    };

    // In a real implementation, this would be stored in a database
    this.auditTrail.push(auditEntry);
    console.log('Audit event logged:', auditEntry);
  }

  /**
   * Get assignment history for a specific PR item
   */
  async getAssignmentHistory(prItemId: string): Promise<PriceAssignmentHistory[]> {
    // Return mock history data filtered by prItemId
    const mockHistory = priceAssignmentsData.assignmentHistory.filter(
      history => history.prItemId === prItemId
    );

    // Convert to proper format and add additional details
    return mockHistory.map(history => ({
      id: history.historyId,
      prItemId: history.prItemId,
      timestamp: new Date(history.timestamp),
      eventType: history.action as any,
      vendorId: history.vendorId,
      vendorName: this.getVendorName(history.vendorId),
      price: history.price,
      currency: history.currency,
      reason: history.reason,
      performedBy: history.performedBy,
      userRole: this.getUserRole(history.performedBy),
      ruleId: history.ruleId,
      confidenceScore: history.confidenceScore,
      previousVendorId: (history as any).previousVendorId,
      previousPrice: (history as any).previousPrice,
      overrideReason: (history as any).overrideReason,
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: `session-${history.historyId}`,
        requestId: `req-${history.historyId}`
      }
    }));
  }

  /**
   * Get comprehensive audit trail with filtering
   */
  async getAuditTrail(query: AuditQuery): Promise<AuditTrailEntry[]> {
    let results = [...this.auditTrail];

    // Add mock data for demonstration
    const mockAuditData = this.generateMockAuditData();
    results = [...results, ...mockAuditData];

    // Apply filters
    if (query.prItemId) {
      results = results.filter(entry => entry.prItemId === query.prItemId);
    }

    if (query.userId) {
      results = results.filter(entry => entry.userId === query.userId);
    }

    if (query.eventType) {
      results = results.filter(entry => entry.eventType === query.eventType);
    }

    if (query.startDate) {
      results = results.filter(entry => entry.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter(entry => entry.timestamp <= query.endDate!);
    }

    if (query.vendorId) {
      results = results.filter(entry => 
        entry.details?.vendorId === query.vendorId ||
        entry.beforeState?.vendorId === query.vendorId ||
        entry.afterState?.vendorId === query.vendorId
      );
    }

    // Sort by timestamp (most recent first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    
    return results.slice(startIndex, endIndex);
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(query: AuditQuery): Promise<AuditReport> {
    const auditEntries = await this.getAuditTrail({ ...query, page: 1, limit: 10000 });
    
    const report: AuditReport = {
      reportId: `report-${Date.now()}`,
      generatedAt: new Date(),
      query,
      summary: {
        totalEvents: auditEntries.length,
        dateRange: {
          start: query.startDate || new Date(Math.min(...auditEntries.map(e => e.timestamp.getTime()))),
          end: query.endDate || new Date(Math.max(...auditEntries.map(e => e.timestamp.getTime())))
        },
        eventTypeBreakdown: this.calculateEventTypeBreakdown(auditEntries),
        userActivityBreakdown: this.calculateUserActivityBreakdown(auditEntries),
        vendorActivityBreakdown: this.calculateVendorActivityBreakdown(auditEntries)
      },
      entries: auditEntries,
      insights: this.generateAuditInsights(auditEntries),
      recommendations: this.generateAuditRecommendations(auditEntries)
    };

    return report;
  }

  /**
   * Track assignment performance metrics
   */
  async getAssignmentMetrics(startDate: Date, endDate: Date): Promise<any> {
    const auditEntries = await this.getAuditTrail({
      startDate,
      endDate,
      page: 1,
      limit: 10000
    });

    const assignments = auditEntries.filter(entry => entry.eventType === 'assignment');
    const overrides = auditEntries.filter(entry => entry.eventType === 'override');
    const reassignments = auditEntries.filter(entry => entry.eventType === 'reassignment');

    return {
      totalAssignments: assignments.length,
      automaticAssignments: assignments.filter(a => a.userId === 'system').length,
      manualAssignments: assignments.filter(a => a.userId !== 'system').length,
      overrideRate: assignments.length > 0 ? (overrides.length / assignments.length) * 100 : 0,
      reassignmentRate: assignments.length > 0 ? (reassignments.length / assignments.length) * 100 : 0,
      averageConfidenceScore: this.calculateAverageConfidence(assignments),
      topVendors: this.getTopVendorsByAssignments(assignments),
      topUsers: this.getTopUsersByActivity(auditEntries),
      assignmentTrends: this.calculateAssignmentTrends(assignments, startDate, endDate)
    };
  }

  /**
   * Validate assignment integrity
   */
  async validateAssignmentIntegrity(prItemId: string): Promise<any> {
    const history = await this.getAssignmentHistory(prItemId);
    
    const validationResults = {
      isValid: true,
      issues: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[]
    };

    // Check for missing initial assignment
    const initialAssignment = history.find(h => h.eventType === 'initial_assignment');
    if (!initialAssignment) {
      validationResults.isValid = false;
      validationResults.issues.push('Missing initial assignment record');
    }

    // Check for orphaned overrides
    const overrides = history.filter(h => h.eventType === 'manual_override');
    for (const override of overrides) {
      if (!override.previousVendorId) {
        validationResults.warnings.push(`Override ${override.id} missing previous vendor reference`);
      }
    }

    // Check for suspicious patterns
    const recentOverrides = overrides.filter(o => 
      new Date().getTime() - o.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    if (recentOverrides.length > 3) {
      validationResults.warnings.push('High frequency of recent overrides detected');
      validationResults.recommendations.push('Review assignment rules and vendor options');
    }

    // Check confidence score trends
    const confidenceScores = history
      .filter(h => h.confidenceScore !== undefined)
      .map(h => h.confidenceScore!);
    
    if (confidenceScores.length > 0) {
      const avgConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
      if (avgConfidence < 0.5) {
        validationResults.warnings.push('Low average confidence scores detected');
        validationResults.recommendations.push('Review vendor options and business rules');
      }
    }

    return validationResults;
  }

  /**
   * Export audit data
   */
  async exportAuditData(query: AuditQuery, format: 'json' | 'csv' | 'excel'): Promise<any> {
    const auditEntries = await this.getAuditTrail({ ...query, page: 1, limit: 10000 });
    
    switch (format) {
      case 'json':
        return {
          format: 'json',
          data: auditEntries,
          filename: `audit-export-${Date.now()}.json`
        };
      
      case 'csv':
        return {
          format: 'csv',
          data: this.convertToCSV(auditEntries),
          filename: `audit-export-${Date.now()}.csv`
        };
      
      case 'excel':
        return {
          format: 'excel',
          data: this.convertToExcelFormat(auditEntries),
          filename: `audit-export-${Date.now()}.xlsx`
        };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Private helper methods
   */
  private generateMockAuditData(): AuditTrailEntry[] {
    const mockData: AuditTrailEntry[] = [];
    const eventTypes: AssignmentEvent['type'][] = ['assignment', 'override', 'reassignment', 'validation'];
    const users = ['user-001', 'user-002', 'system', 'user-manager-001'];
    const prItems = ['pri-001', 'pri-002', 'pri-003', 'pri-004', 'pri-005'];

    for (let i = 0; i < 20; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const userId = users[Math.floor(Math.random() * users.length)];
      const prItemId = prItems[Math.floor(Math.random() * prItems.length)];
      
      mockData.push({
        id: `audit-mock-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        eventType,
        prItemId,
        userId,
        userRole: userId === 'system' ? 'system' : userId.includes('manager') ? 'manager' : 'user',
        action: this.getActionForEventType(eventType),
        details: {
          vendorId: `vendor-${Math.floor(Math.random() * 10) + 1}`,
          price: Math.random() * 100 + 10,
          currency: 'USD',
          reason: this.getReasonForEventType(eventType)
        },
        beforeState: eventType !== 'assignment' ? {
          vendorId: `vendor-${Math.floor(Math.random() * 10) + 1}`,
          price: Math.random() * 100 + 10,
          currency: 'USD'
        } : undefined,
        afterState: {
          vendorId: `vendor-${Math.floor(Math.random() * 10) + 1}`,
          price: Math.random() * 100 + 10,
          currency: 'USD'
        },
        metadata: {
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: `session-${i}`,
          requestId: `req-${i}`
        }
      });
    }

    return mockData;
  }

  private getVendorName(vendorId: string): string {
    const vendorNames: { [key: string]: string } = {
      'vendor-001': 'Global Office Supplies',
      'vendor-002': 'Premium Office Solutions',
      'vendor-003': 'Budget Furniture Co',
      'vendor-004': 'Tech Solutions Inc',
      'vendor-005': 'Computer World',
      'vendor-006': 'International Supplies Ltd',
      'vendor-007': 'Local Print Supplies',
      'vendor-008': 'Strategic Partner Corp'
    };
    
    return vendorNames[vendorId] || `Vendor ${vendorId}`;
  }

  private getUserRole(userId: string): string {
    if (userId === 'system') return 'system';
    if (userId.includes('manager')) return 'manager';
    return 'user';
  }

  private getActionForEventType(eventType: AssignmentEvent['type']): string {
    switch (eventType) {
      case 'assignment': return 'create_assignment';
      case 'override': return 'override_assignment';
      case 'reassignment': return 'reassign_vendor';
      case 'validation': return 'validate_assignment';
      default: return 'unknown_action';
    }
  }

  private getReasonForEventType(eventType: AssignmentEvent['type']): string {
    switch (eventType) {
      case 'assignment': return 'Automated assignment based on business rules';
      case 'override': return 'Manual override for strategic reasons';
      case 'reassignment': return 'Vendor became unavailable';
      case 'validation': return 'Routine validation check';
      default: return 'Unknown reason';
    }
  }

  private calculateEventTypeBreakdown(entries: AuditTrailEntry[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      breakdown[entry.eventType] = (breakdown[entry.eventType] || 0) + 1;
    });
    
    return breakdown;
  }

  private calculateUserActivityBreakdown(entries: AuditTrailEntry[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      breakdown[entry.userId] = (breakdown[entry.userId] || 0) + 1;
    });
    
    return breakdown;
  }

  private calculateVendorActivityBreakdown(entries: AuditTrailEntry[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      const vendorId = entry.details?.vendorId || entry.afterState?.vendorId;
      if (vendorId) {
        breakdown[vendorId] = (breakdown[vendorId] || 0) + 1;
      }
    });
    
    return breakdown;
  }

  private generateAuditInsights(entries: AuditTrailEntry[]): string[] {
    const insights: string[] = [];
    
    const systemEvents = entries.filter(e => e.userId === 'system').length;
    const totalEvents = entries.length;
    const automationRate = totalEvents > 0 ? (systemEvents / totalEvents) * 100 : 0;
    
    insights.push(`${automationRate.toFixed(1)}% of events were automated`);
    
    const overrides = entries.filter(e => e.eventType === 'override').length;
    const assignments = entries.filter(e => e.eventType === 'assignment').length;
    const overrideRate = assignments > 0 ? (overrides / assignments) * 100 : 0;
    
    if (overrideRate > 20) {
      insights.push(`High override rate detected (${overrideRate.toFixed(1)}%)`);
    }
    
    const uniqueUsers = new Set(entries.map(e => e.userId)).size;
    insights.push(`${uniqueUsers} unique users performed actions`);
    
    return insights;
  }

  private generateAuditRecommendations(entries: AuditTrailEntry[]): string[] {
    const recommendations: string[] = [];
    
    const overrides = entries.filter(e => e.eventType === 'override').length;
    const assignments = entries.filter(e => e.eventType === 'assignment').length;
    const overrideRate = assignments > 0 ? (overrides / assignments) * 100 : 0;
    
    if (overrideRate > 15) {
      recommendations.push('Review business rules to reduce manual overrides');
    }
    
    const recentEntries = entries.filter(e => 
      new Date().getTime() - e.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    
    if (recentEntries.length < entries.length * 0.1) {
      recommendations.push('Low recent activity - consider system health check');
    }
    
    recommendations.push('Regular audit reviews recommended monthly');
    
    return recommendations;
  }

  private calculateAverageConfidence(assignments: AuditTrailEntry[]): number {
    const confidenceScores = assignments
      .map(a => a.details?.confidenceScore)
      .filter(score => score !== undefined) as number[];
    
    if (confidenceScores.length === 0) return 0;
    
    return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
  }

  private getTopVendorsByAssignments(assignments: AuditTrailEntry[]): Array<{ vendorId: string; count: number }> {
    const vendorCounts: { [key: string]: number } = {};
    
    assignments.forEach(assignment => {
      const vendorId = assignment.details?.vendorId || assignment.afterState?.vendorId;
      if (vendorId) {
        vendorCounts[vendorId] = (vendorCounts[vendorId] || 0) + 1;
      }
    });
    
    return Object.entries(vendorCounts)
      .map(([vendorId, count]) => ({ vendorId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopUsersByActivity(entries: AuditTrailEntry[]): Array<{ userId: string; count: number }> {
    const userCounts: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
    });
    
    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateAssignmentTrends(assignments: AuditTrailEntry[], startDate: Date, endDate: Date): any {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const dailyCounts: { [key: string]: number } = {};
    
    assignments.forEach(assignment => {
      const dateKey = assignment.timestamp.toISOString().split('T')[0];
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    });
    
    return {
      dailyAverage: assignments.length / days,
      peakDay: Object.entries(dailyCounts).reduce((max, [date, count]) => 
        count > max.count ? { date, count } : max, { date: '', count: 0 }),
      trend: this.calculateTrendDirection(dailyCounts)
    };
  }

  private calculateTrendDirection(dailyCounts: { [key: string]: number }): 'increasing' | 'decreasing' | 'stable' {
    const dates = Object.keys(dailyCounts).sort();
    if (dates.length < 2) return 'stable';
    
    const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
    const secondHalf = dates.slice(Math.floor(dates.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, date) => sum + dailyCounts[date], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, date) => sum + dailyCounts[date], 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  private convertToCSV(entries: AuditTrailEntry[]): string {
    const headers = ['ID', 'Timestamp', 'Event Type', 'PR Item ID', 'User ID', 'User Role', 'Action', 'Vendor ID', 'Price', 'Currency'];
    const rows = entries.map(entry => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.eventType,
      entry.prItemId,
      entry.userId,
      entry.userRole,
      entry.action,
      entry.details?.vendorId || '',
      entry.details?.price || '',
      entry.details?.currency || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToExcelFormat(entries: AuditTrailEntry[]): any {
    // Mock Excel format conversion
    return {
      worksheets: [
        {
          name: 'Audit Trail',
          data: entries.map(entry => ({
            ID: entry.id,
            Timestamp: entry.timestamp.toISOString(),
            'Event Type': entry.eventType,
            'PR Item ID': entry.prItemId,
            'User ID': entry.userId,
            'User Role': entry.userRole,
            Action: entry.action,
            'Vendor ID': entry.details?.vendorId || '',
            Price: entry.details?.price || '',
            Currency: entry.details?.currency || ''
          }))
        }
      ]
    };
  }
}

export const assignmentAuditService = new AssignmentAuditService();