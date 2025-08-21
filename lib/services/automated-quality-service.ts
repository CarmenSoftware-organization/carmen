import { ValidationResult } from './price-validation-engine';
import { QualityReport, dataQualityService } from './data-quality-service';
import { ErrorReport, errorReportingService } from './error-reporting-service';

export interface QualityCheckConfig {
  enableAutoFlagging: boolean;
  enableAutoApproval: boolean;
  autoApprovalThreshold: number;
  manualReviewThreshold: number;
  criticalErrorThreshold: number;
  qualityScoreThreshold: number;
  enableNotifications: boolean;
  enableTrendAnalysis: boolean;
}

export interface QualityFlag {
  id: string;
  submissionId: string;
  vendorId: string;
  flagType: 'quality' | 'error' | 'trend' | 'anomaly' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  description: string;
  flaggedAt: Date;
  flaggedBy: 'system' | 'user';
  status: 'active' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface QualityAlert {
  id: string;
  type: 'quality_decline' | 'error_spike' | 'submission_anomaly' | 'compliance_issue';
  vendorId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details: any;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface QualityTrendAnalysis {
  vendorId: string;
  period: string;
  trendDirection: 'improving' | 'declining' | 'stable' | 'volatile';
  qualityScore: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  errorRate: {
    current: number;
    previous: number;
    change: number;
  };
  submissionFrequency: {
    current: number;
    expected: number;
    variance: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnomalyDetection {
  submissionId: string;
  anomalyType: 'price_spike' | 'volume_change' | 'quality_drop' | 'timing_unusual';
  confidence: number;
  description: string;
  expectedValue: any;
  actualValue: any;
  deviation: number;
  requiresReview: boolean;
}

export class AutomatedQualityService {
  private config: QualityCheckConfig;
  private qualityFlags: Map<string, QualityFlag> = new Map();
  private qualityAlerts: Map<string, QualityAlert> = new Map();

  constructor(config?: Partial<QualityCheckConfig>) {
    this.config = {
      enableAutoFlagging: true,
      enableAutoApproval: true,
      autoApprovalThreshold: 85,
      manualReviewThreshold: 70,
      criticalErrorThreshold: 5,
      qualityScoreThreshold: 60,
      enableNotifications: true,
      enableTrendAnalysis: true,
      ...config
    };
  }

  // Main automated quality check orchestrator
  async performAutomatedQualityChecks(
    submissionId: string,
    vendorId: string,
    validationResult: ValidationResult,
    submissionData: any
  ): Promise<{
    qualityReport: QualityReport;
    errorReport: ErrorReport;
    flags: QualityFlag[];
    alerts: QualityAlert[];
    recommendation: 'approve' | 'flag_for_review' | 'reject';
    anomalies: AnomalyDetection[];
  }> {
    
    // Generate quality and error reports
    const qualityReport = await dataQualityService.generateQualityReport(
      submissionId,
      vendorId,
      validationResult,
      submissionData
    );

    const errorReport = await errorReportingService.generateErrorReport(
      submissionId,
      vendorId,
      validationResult,
      qualityReport,
      submissionData
    );

    // Perform automated checks
    const flags = await this.performQualityFlagging(submissionId, vendorId, qualityReport, errorReport);
    const alerts = await this.generateQualityAlerts(vendorId, qualityReport, submissionData);
    const anomalies = await this.detectAnomalies(submissionId, vendorId, submissionData);
    const recommendation = this.generateRecommendation(qualityReport, errorReport, flags, anomalies);

    // Execute automated actions
    await this.executeAutomatedActions(submissionId, recommendation, qualityReport);

    return {
      qualityReport,
      errorReport,
      flags,
      alerts,
      recommendation,
      anomalies
    };
  }

  // Automated quality flagging
  private async performQualityFlagging(
    submissionId: string,
    vendorId: string,
    qualityReport: QualityReport,
    errorReport: ErrorReport
  ): Promise<QualityFlag[]> {
    
    const flags: QualityFlag[] = [];

    if (!this.config.enableAutoFlagging) return flags;

    // Flag for low quality score
    if (qualityReport.metrics.overallScore < this.config.qualityScoreThreshold) {
      flags.push(this.createQualityFlag({
        submissionId,
        vendorId,
        flagType: 'quality',
        severity: qualityReport.metrics.overallScore < 40 ? 'critical' : 'high',
        reason: 'Low Quality Score',
        description: `Quality score ${qualityReport.metrics.overallScore} is below threshold ${this.config.qualityScoreThreshold}`
      }));
    }

    // Flag for high error count
    if (errorReport.errorSummary.criticalErrors > this.config.criticalErrorThreshold) {
      flags.push(this.createQualityFlag({
        submissionId,
        vendorId,
        flagType: 'error',
        severity: 'critical',
        reason: 'High Critical Error Count',
        description: `${errorReport.errorSummary.criticalErrors} critical errors exceed threshold ${this.config.criticalErrorThreshold}`
      }));
    }

    // Flag for data completeness issues
    if (qualityReport.metrics.completenessScore < 70) {
      flags.push(this.createQualityFlag({
        submissionId,
        vendorId,
        flagType: 'quality',
        severity: 'medium',
        reason: 'Incomplete Data',
        description: `Data completeness score ${qualityReport.metrics.completenessScore} indicates missing required information`
      }));
    }

    // Flag for consistency issues
    if (qualityReport.metrics.consistencyScore < 60) {
      flags.push(this.createQualityFlag({
        submissionId,
        vendorId,
        flagType: 'quality',
        severity: 'medium',
        reason: 'Data Inconsistency',
        description: `Consistency score ${qualityReport.metrics.consistencyScore} indicates data formatting or value inconsistencies`
      }));
    }

    // Flag for accuracy issues
    if (qualityReport.metrics.accuracyScore < 70) {
      flags.push(this.createQualityFlag({
        submissionId,
        vendorId,
        flagType: 'error',
        severity: 'high',
        reason: 'Accuracy Issues',
        description: `Accuracy score ${qualityReport.metrics.accuracyScore} indicates validation errors requiring attention`
      }));
    }

    return flags;
  }

  // Generate quality alerts
  private async generateQualityAlerts(
    vendorId: string,
    qualityReport: QualityReport,
    submissionData: any
  ): Promise<QualityAlert[]> {
    
    const alerts: QualityAlert[] = [];

    // Check for quality decline trend
    const qualityTrend = await dataQualityService.getVendorQualityTrend(vendorId, 30);
    if (qualityTrend.trend === 'declining' && qualityTrend.improvement < -10) {
      alerts.push(this.createQualityAlert({
        type: 'quality_decline',
        vendorId,
        severity: 'high',
        message: `Quality trend declining by ${Math.abs(qualityTrend.improvement)}% over 30 days`,
        details: { trend: qualityTrend, currentScore: qualityReport.metrics.overallScore }
      }));
    }

    // Check for error spike
    if (qualityReport.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length > 3) {
      alerts.push(this.createQualityAlert({
        type: 'error_spike',
        vendorId,
        severity: 'high',
        message: 'Unusual number of critical/high severity issues detected',
        details: { issueCount: qualityReport.issues.length, criticalIssues: qualityReport.issues }
      }));
    }

    // Check for submission anomalies
    const anomalies = await this.detectSubmissionAnomalies(vendorId, submissionData);
    if (anomalies.length > 0) {
      alerts.push(this.createQualityAlert({
        type: 'submission_anomaly',
        vendorId,
        severity: 'medium',
        message: `${anomalies.length} submission anomalies detected`,
        details: { anomalies }
      }));
    }

    return alerts;
  }

  // Detect various types of anomalies
  private async detectAnomalies(
    submissionId: string,
    vendorId: string,
    submissionData: any
  ): Promise<AnomalyDetection[]> {
    
    const anomalies: AnomalyDetection[] = [];

    // Price spike detection
    if (submissionData.items) {
      const priceAnomalies = this.detectPriceAnomalies(submissionData.items);
      anomalies.push(...priceAnomalies.map(anomaly => ({
        submissionId,
        ...anomaly
      })));
    }

    // Volume change detection
    const volumeAnomaly = await this.detectVolumeAnomalies(vendorId, submissionData);
    if (volumeAnomaly) {
      anomalies.push({ submissionId, ...volumeAnomaly });
    }

    // Timing anomalies
    const timingAnomaly = await this.detectTimingAnomalies(vendorId, submissionData);
    if (timingAnomaly) {
      anomalies.push({ submissionId, ...timingAnomaly });
    }

    return anomalies;
  }

  // Detect price anomalies
  private detectPriceAnomalies(items: any[]): Omit<AnomalyDetection, 'submissionId'>[] {
    const anomalies: Omit<AnomalyDetection, 'submissionId'>[] = [];
    
    if (items.length < 2) return anomalies;

    const prices = items.map(item => item.unitPrice).filter(price => price > 0);
    if (prices.length === 0) return anomalies;

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const stdDev = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    );

    items.forEach((item, index) => {
      if (item.unitPrice > 0) {
        const zScore = Math.abs((item.unitPrice - mean) / stdDev);
        if (zScore > 2.5) { // More than 2.5 standard deviations
          anomalies.push({
            anomalyType: 'price_spike',
            confidence: Math.min(zScore / 3, 1), // Normalize to 0-1
            description: `Price ${item.unitPrice} is ${zScore.toFixed(1)} standard deviations from mean`,
            expectedValue: mean.toFixed(2),
            actualValue: item.unitPrice,
            deviation: zScore,
            requiresReview: zScore > 3
          });
        }
      }
    });

    return anomalies;
  }

  // Detect volume anomalies
  private async detectVolumeAnomalies(
    vendorId: string,
    submissionData: any
  ): Promise<Omit<AnomalyDetection, 'submissionId'> | null> {
    
    // This would typically compare against historical submission volumes
    const currentItemCount = submissionData.items?.length || 0;
    const expectedItemCount = 50; // Mock expected count
    
    const variance = Math.abs(currentItemCount - expectedItemCount) / expectedItemCount;
    
    if (variance > 0.5) { // More than 50% variance
      return {
        anomalyType: 'volume_change',
        confidence: Math.min(variance, 1),
        description: `Submission volume ${currentItemCount} differs significantly from expected ${expectedItemCount}`,
        expectedValue: expectedItemCount,
        actualValue: currentItemCount,
        deviation: variance,
        requiresReview: variance > 0.8
      };
    }

    return null;
  }

  // Detect timing anomalies
  private async detectTimingAnomalies(
    vendorId: string,
    submissionData: any
  ): Promise<Omit<AnomalyDetection, 'submissionId'> | null> {
    
    const submissionTime = new Date();
    const hour = submissionTime.getHours();
    
    // Flag submissions outside normal business hours (9 AM - 5 PM)
    if (hour < 9 || hour > 17) {
      return {
        anomalyType: 'timing_unusual',
        confidence: 0.7,
        description: `Submission at ${hour}:00 is outside normal business hours`,
        expectedValue: '9:00-17:00',
        actualValue: `${hour}:00`,
        deviation: Math.min(Math.abs(hour - 13), 12) / 12, // Distance from 1 PM
        requiresReview: false
      };
    }

    return null;
  }

  // Detect submission anomalies
  private async detectSubmissionAnomalies(vendorId: string, submissionData: any): Promise<any[]> {
    const anomalies = [];

    // Check for unusual currency mix
    if (submissionData.items) {
      const currencies = [...new Set(submissionData.items.map((item: any) => item.currency))];
      if (currencies.length > 3) {
        anomalies.push({
          type: 'currency_mix',
          description: `Unusual number of currencies: ${currencies.join(', ')}`,
          severity: 'medium'
        });
      }
    }

    // Check for unusual validity periods
    if (submissionData.items) {
      const validityPeriods = submissionData.items.map((item: any) => {
        if (item.validFrom && item.validTo) {
          return (new Date(item.validTo).getTime() - new Date(item.validFrom).getTime()) / (1000 * 60 * 60 * 24);
        }
        return null;
      }).filter((period: number | null) => period !== null);

      const unusualPeriods = validityPeriods.filter((period: number) => period < 7 || period > 730);
      if (unusualPeriods.length > 0) {
        anomalies.push({
          type: 'validity_period',
          description: `${unusualPeriods.length} items have unusual validity periods`,
          severity: 'low'
        });
      }
    }

    return anomalies;
  }

  // Generate recommendation based on all checks
  private generateRecommendation(
    qualityReport: QualityReport,
    errorReport: ErrorReport,
    flags: QualityFlag[],
    anomalies: AnomalyDetection[]
  ): 'approve' | 'flag_for_review' | 'reject' {
    
    // Reject if critical issues exist
    const criticalFlags = flags.filter(f => f.severity === 'critical');
    const criticalAnomalies = anomalies.filter(a => a.requiresReview);
    
    if (criticalFlags.length > 0 || criticalAnomalies.length > 0 || errorReport.errorSummary.criticalErrors > 0) {
      return 'reject';
    }

    // Auto-approve if quality is high and no significant issues
    if (qualityReport.metrics.overallScore >= this.config.autoApprovalThreshold && 
        flags.length === 0 && 
        errorReport.errorSummary.totalErrors === 0) {
      return 'approve';
    }

    // Flag for manual review if quality is moderate
    if (qualityReport.metrics.overallScore >= this.config.manualReviewThreshold) {
      return 'flag_for_review';
    }

    // Reject if quality is too low
    return 'reject';
  }

  // Execute automated actions based on recommendation
  private async executeAutomatedActions(
    submissionId: string,
    recommendation: 'approve' | 'flag_for_review' | 'reject',
    qualityReport: QualityReport
  ): Promise<void> {
    
    switch (recommendation) {
      case 'approve':
        if (this.config.enableAutoApproval) {
          await this.autoApproveSubmission(submissionId, qualityReport);
        }
        break;
      
      case 'flag_for_review':
        await this.flagForManualReview(submissionId, 'Quality review required');
        break;
      
      case 'reject':
        await this.autoRejectSubmission(submissionId, 'Critical quality issues detected');
        break;
    }

    // Send notifications if enabled
    if (this.config.enableNotifications) {
      await this.sendQualityNotifications(submissionId, recommendation, qualityReport);
    }
  }

  // Helper methods for creating flags and alerts
  private createQualityFlag(params: {
    submissionId: string;
    vendorId: string;
    flagType: QualityFlag['flagType'];
    severity: QualityFlag['severity'];
    reason: string;
    description: string;
  }): QualityFlag {
    
    const flag: QualityFlag = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submissionId: params.submissionId,
      vendorId: params.vendorId,
      flagType: params.flagType,
      severity: params.severity,
      reason: params.reason,
      description: params.description,
      flaggedAt: new Date(),
      flaggedBy: 'system',
      status: 'active'
    };

    this.qualityFlags.set(flag.id, flag);
    return flag;
  }

  private createQualityAlert(params: {
    type: QualityAlert['type'];
    vendorId: string;
    severity: QualityAlert['severity'];
    message: string;
    details: any;
  }): QualityAlert {
    
    const alert: QualityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      vendorId: params.vendorId,
      severity: params.severity,
      message: params.message,
      details: params.details,
      triggeredAt: new Date(),
      acknowledged: false
    };

    this.qualityAlerts.set(alert.id, alert);
    return alert;
  }

  // Automated action methods
  private async autoApproveSubmission(submissionId: string, qualityReport: QualityReport): Promise<void> {
    console.log(`Auto-approving submission ${submissionId} with quality score ${qualityReport.metrics.overallScore}`);
    // This would typically update database status
  }

  private async flagForManualReview(submissionId: string, reason: string): Promise<void> {
    console.log(`Flagging submission ${submissionId} for manual review: ${reason}`);
    // This would typically create review tasks and notifications
  }

  private async autoRejectSubmission(submissionId: string, reason: string): Promise<void> {
    console.log(`Auto-rejecting submission ${submissionId}: ${reason}`);
    // This would typically update status and send rejection notifications
  }

  private async sendQualityNotifications(
    submissionId: string,
    recommendation: string,
    qualityReport: QualityReport
  ): Promise<void> {
    console.log(`Sending quality notification for submission ${submissionId}: ${recommendation}`);
    // This would typically send emails or system notifications
  }

  // Public methods for managing flags and alerts
  async getActiveFlags(vendorId?: string): Promise<QualityFlag[]> {
    const flags = Array.from(this.qualityFlags.values()).filter(f => f.status === 'active');
    return vendorId ? flags.filter(f => f.vendorId === vendorId) : flags;
  }

  async resolveFlag(flagId: string, resolutionNotes: string, resolvedBy: string): Promise<void> {
    const flag = this.qualityFlags.get(flagId);
    if (flag) {
      flag.status = 'resolved';
      flag.resolvedAt = new Date();
      flag.resolutionNotes = resolutionNotes;
      flag.assignedTo = resolvedBy;
    }
  }

  async getActiveAlerts(vendorId?: string): Promise<QualityAlert[]> {
    const alerts = Array.from(this.qualityAlerts.values()).filter(a => !a.acknowledged);
    return vendorId ? alerts.filter(a => a.vendorId === vendorId) : alerts;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.qualityAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
  }

  // Configuration management
  updateConfig(newConfig: Partial<QualityCheckConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): QualityCheckConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const automatedQualityService = new AutomatedQualityService();