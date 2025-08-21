import { addDays, addWeeks, addMonths, format, isAfter, isBefore } from 'date-fns';

// Types for automated reporting system
export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  report_type: 'executive_summary' | 'operational' | 'compliance' | 'consumption_analytics' | 'performance';
  schedule: ReportSchedule;
  recipients: ReportRecipient[];
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'dashboard_link';
  filters: ReportFilters;
  status: 'active' | 'paused' | 'draft' | 'archived';
  next_run: string;
  last_run?: string;
  run_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  day_of_month?: number; // 1-31
  time: string; // HH:MM format
  timezone: string;
  end_date?: string;
  custom_cron?: string;
}

export interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  notification_preferences: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    in_app: boolean;
  };
}

export interface ReportFilters {
  date_range: {
    type: 'last_n_days' | 'last_week' | 'last_month' | 'custom';
    value?: number;
    start_date?: string;
    end_date?: string;
  };
  locations?: string[];
  departments?: string[];
  product_categories?: string[];
  metrics?: string[];
  comparison_period?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: AlertCondition;
  threshold: AlertThreshold;
  frequency: 'real_time' | 'hourly' | 'daily';
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  channels: NotificationChannel[];
  escalation_rules?: EscalationRule[];
  status: 'active' | 'paused' | 'triggered' | 'resolved';
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'greater_than_or_equal' | 'less_than_or_equal' | 'percentage_change';
  comparison_type: 'absolute' | 'percentage' | 'moving_average' | 'trend';
  time_window?: string; // e.g., '1h', '24h', '7d'
  consecutive_violations?: number;
}

export interface AlertThreshold {
  value: number;
  unit: string;
  baseline?: 'historical_average' | 'target_value' | 'previous_period';
  baseline_period?: string;
}

export interface EscalationRule {
  level: number;
  delay_minutes: number;
  recipients: string[];
  actions: string[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'push';
  config: Record<string, any>;
  enabled: boolean;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  execution_time: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  duration_ms?: number;
  file_path?: string;
  file_size?: number;
  error_message?: string;
  recipients_notified: number;
  metadata: Record<string, any>;
}

export interface AlertExecution {
  id: string;
  alert_id: string;
  triggered_at: string;
  resolved_at?: string;
  status: 'triggered' | 'escalated' | 'resolved' | 'suppressed';
  trigger_value: number;
  threshold_value: number;
  notifications_sent: number;
  escalation_level: number;
  resolution_notes?: string;
}

export class AutomatedReportingService {
  private reports: ScheduledReport[] = [];
  private alerts: AlertRule[] = [];
  private executions: ReportExecution[] = [];
  private alertExecutions: AlertExecution[] = [];

  constructor() {
    this.initializeDefaultReports();
    this.initializeDefaultAlerts();
  }

  // Report Management
  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'next_run' | 'run_count'>): Promise<ScheduledReport> {
    const newReport: ScheduledReport = {
      ...report,
      id: this.generateId(),
      next_run: this.calculateNextRun(report.schedule),
      run_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.reports.push(newReport);
    return newReport;
  }

  async getScheduledReports(filters?: {
    status?: string;
    report_type?: string;
    created_by?: string;
  }): Promise<ScheduledReport[]> {
    let filtered = this.reports;

    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters?.report_type) {
      filtered = filtered.filter(r => r.report_type === filters.report_type);
    }
    if (filters?.created_by) {
      filtered = filtered.filter(r => r.created_by === filters.created_by);
    }

    return filtered;
  }

  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport | null> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return null;

    this.reports[reportIndex] = {
      ...this.reports[reportIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Recalculate next run if schedule changed
    if (updates.schedule) {
      this.reports[reportIndex].next_run = this.calculateNextRun(updates.schedule);
    }

    return this.reports[reportIndex];
  }

  async deleteScheduledReport(id: string): Promise<boolean> {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return false;

    this.reports.splice(reportIndex, 1);
    return true;
  }

  // Alert Management
  async createAlertRule(alert: Omit<AlertRule, 'id' | 'created_at' | 'updated_at' | 'trigger_count'>): Promise<AlertRule> {
    const newAlert: AlertRule = {
      ...alert,
      id: this.generateId(),
      trigger_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.alerts.push(newAlert);
    return newAlert;
  }

  async getAlertRules(filters?: {
    status?: string;
    priority?: string;
    metric?: string;
  }): Promise<AlertRule[]> {
    let filtered = this.alerts;

    if (filters?.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters?.priority) {
      filtered = filtered.filter(a => a.priority === filters.priority);
    }
    if (filters?.metric) {
      filtered = filtered.filter(a => a.metric === filters.metric);
    }

    return filtered;
  }

  // Report Execution
  async executeReport(reportId: string): Promise<ReportExecution> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const execution: ReportExecution = {
      id: this.generateId(),
      report_id: reportId,
      execution_time: new Date().toISOString(),
      status: 'running',
      recipients_notified: 0,
      metadata: {}
    };

    this.executions.push(execution);

    try {
      // Simulate report generation
      const startTime = Date.now();
      
      // Generate report based on type
      const reportData = await this.generateReportData(report);
      
      // Create file
      const filePath = await this.createReportFile(report, reportData);
      
      // Send notifications
      const notificationCount = await this.sendReportNotifications(report, filePath);
      
      const duration = Date.now() - startTime;

      // Update execution
      execution.status = 'completed';
      execution.duration_ms = duration;
      execution.file_path = filePath;
      execution.file_size = Math.floor(Math.random() * 1000000) + 100000; // Simulate file size
      execution.recipients_notified = notificationCount;

      // Update report
      const reportIndex = this.reports.findIndex(r => r.id === reportId);
      if (reportIndex !== -1) {
        this.reports[reportIndex].last_run = execution.execution_time;
        this.reports[reportIndex].run_count++;
        this.reports[reportIndex].next_run = this.calculateNextRun(report.schedule);
      }

    } catch (error) {
      execution.status = 'failed';
      execution.error_message = error instanceof Error ? error.message : 'Unknown error';
    }

    return execution;
  }

  // Alert Monitoring
  async checkAlerts(metrics: Record<string, number>): Promise<AlertExecution[]> {
    const triggeredAlerts: AlertExecution[] = [];

    for (const alert of this.alerts.filter(a => a.status === 'active')) {
      const metricValue = metrics[alert.metric];
      if (metricValue === undefined) continue;

      const shouldTrigger = this.evaluateAlertCondition(alert, metricValue);
      
      if (shouldTrigger && alert.status !== 'triggered') {
        const alertExecution: AlertExecution = {
          id: this.generateId(),
          alert_id: alert.id,
          triggered_at: new Date().toISOString(),
          status: 'triggered',
          trigger_value: metricValue,
          threshold_value: alert.threshold.value,
          notifications_sent: 0,
          escalation_level: 1
        };

        // Send notifications
        alertExecution.notifications_sent = await this.sendAlertNotifications(alert, alertExecution);

        this.alertExecutions.push(alertExecution);
        triggeredAlerts.push(alertExecution);

        // Update alert status
        const alertIndex = this.alerts.findIndex(a => a.id === alert.id);
        if (alertIndex !== -1) {
          this.alerts[alertIndex].status = 'triggered';
          this.alerts[alertIndex].last_triggered = new Date().toISOString();
          this.alerts[alertIndex].trigger_count++;
        }
      }
    }

    return triggeredAlerts;
  }

  async resolveAlert(alertId: string, resolutionNotes?: string): Promise<boolean> {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;

    this.alerts[alertIndex].status = 'resolved';

    // Update latest execution
    const executionIndex = this.alertExecutions
      .slice()
      .reverse()
      .findIndex(e => e.alert_id === alertId && e.status === 'triggered');
    
    if (executionIndex !== -1) {
      const actualIndex = this.alertExecutions.length - 1 - executionIndex;
      this.alertExecutions[actualIndex].status = 'resolved';
      this.alertExecutions[actualIndex].resolved_at = new Date().toISOString();
      this.alertExecutions[actualIndex].resolution_notes = resolutionNotes;
    }

    return true;
  }

  // Analytics and Insights
  async getReportingAnalytics(dateRange: { start: string; end: string }): Promise<{
    execution_summary: {
      total_executions: number;
      successful_executions: number;
      failed_executions: number;
      average_duration_ms: number;
    };
    alert_summary: {
      total_alerts: number;
      active_alerts: number;
      triggered_alerts: number;
      average_resolution_time_hours: number;
    };
    top_reports: Array<{
      report_id: string;
      report_name: string;
      execution_count: number;
      success_rate: number;
    }>;
    top_alerts: Array<{
      alert_id: string;
      alert_name: string;
      trigger_count: number;
      average_resolution_hours: number;
    }>;
  }> {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Filter executions and alerts by date range
    const periodExecutions = this.executions.filter(e => {
      const execDate = new Date(e.execution_time);
      return execDate >= startDate && execDate <= endDate;
    });

    const periodAlertExecutions = this.alertExecutions.filter(e => {
      const triggerDate = new Date(e.triggered_at);
      return triggerDate >= startDate && triggerDate <= endDate;
    });

    // Calculate execution summary
    const successfulExecutions = periodExecutions.filter(e => e.status === 'completed');
    const failedExecutions = periodExecutions.filter(e => e.status === 'failed');
    const avgDuration = successfulExecutions.length > 0 
      ? successfulExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / successfulExecutions.length
      : 0;

    // Calculate alert summary
    const resolvedAlerts = periodAlertExecutions.filter(e => e.status === 'resolved');
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, e) => {
          if (e.resolved_at) {
            const triggerTime = new Date(e.triggered_at).getTime();
            const resolveTime = new Date(e.resolved_at).getTime();
            return sum + (resolveTime - triggerTime) / (1000 * 60 * 60); // hours
          }
          return sum;
        }, 0) / resolvedAlerts.length
      : 0;

    return {
      execution_summary: {
        total_executions: periodExecutions.length,
        successful_executions: successfulExecutions.length,
        failed_executions: failedExecutions.length,
        average_duration_ms: avgDuration
      },
      alert_summary: {
        total_alerts: this.alerts.length,
        active_alerts: this.alerts.filter(a => a.status === 'active').length,
        triggered_alerts: periodAlertExecutions.length,
        average_resolution_time_hours: avgResolutionTime
      },
      top_reports: this.getTopReports(periodExecutions),
      top_alerts: this.getTopAlerts(periodAlertExecutions)
    };
  }

  // Private helper methods
  private initializeDefaultReports(): void {
    const defaultReports: ScheduledReport[] = [
      {
        id: 'exec-daily',
        name: 'Executive Daily Dashboard',
        description: 'Daily executive summary with key KPIs and alerts',
        report_type: 'executive_summary',
        schedule: {
          frequency: 'daily',
          time: '08:00',
          timezone: 'America/New_York'
        },
        recipients: [
          {
            id: 'ceo',
            name: 'CEO',
            email: 'ceo@carmen-erp.com',
            role: 'C-Suite',
            department: 'Executive',
            notification_preferences: {
              email: true,
              slack: false,
              teams: false,
              in_app: true
            }
          }
        ],
        format: 'pdf',
        filters: {
          date_range: {
            type: 'last_n_days',
            value: 1
          }
        },
        status: 'active',
        next_run: '2024-01-15T08:00:00Z',
        last_run: '2024-01-14T08:00:00Z',
        run_count: 45,
        created_by: 'system',
        created_at: '2023-12-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'ops-hourly',
        name: 'Operations Monitoring',
        description: 'Hourly operational metrics for kitchen and service staff',
        report_type: 'operational',
        schedule: {
          frequency: 'daily', // Actually runs hourly via custom_cron
          time: '00:00',
          timezone: 'America/New_York',
          custom_cron: '0 * * * *' // Every hour
        },
        recipients: [
          {
            id: 'ops-manager',
            name: 'Operations Manager',
            email: 'ops@carmen-erp.com',
            role: 'Manager',
            department: 'Operations',
            notification_preferences: {
              email: false,
              slack: true,
              teams: false,
              in_app: true
            }
          }
        ],
        format: 'dashboard_link',
        filters: {
          date_range: {
            type: 'last_n_days',
            value: 1
          }
        },
        status: 'active',
        next_run: '2024-01-14T15:00:00Z',
        run_count: 1240,
        created_by: 'ops-manager',
        created_at: '2023-11-15T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    this.reports = defaultReports;
  }

  private initializeDefaultAlerts(): void {
    const defaultAlerts: AlertRule[] = [
      {
        id: 'waste-critical',
        name: 'Critical Waste Level Alert',
        description: 'Alert when waste levels exceed 8% of daily production',
        metric: 'daily_waste_percentage',
        condition: {
          operator: 'greater_than',
          comparison_type: 'absolute',
          time_window: '1h',
          consecutive_violations: 1
        },
        threshold: {
          value: 8,
          unit: 'percent'
        },
        frequency: 'real_time',
        priority: 'critical',
        recipients: ['ops-manager', 'kitchen-supervisor'],
        channels: [
          {
            type: 'email',
            config: { template: 'waste-alert' },
            enabled: true
          },
          {
            type: 'slack',
            config: { channel: '#operations' },
            enabled: true
          }
        ],
        escalation_rules: [
          {
            level: 1,
            delay_minutes: 15,
            recipients: ['regional-manager'],
            actions: ['auto-pause-production']
          }
        ],
        status: 'active',
        trigger_count: 3,
        created_at: '2023-12-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'efficiency-warning',
        name: 'Kitchen Efficiency Warning',
        description: 'Alert when kitchen efficiency drops below 80%',
        metric: 'kitchen_efficiency_percentage',
        condition: {
          operator: 'less_than',
          comparison_type: 'moving_average',
          time_window: '2h',
          consecutive_violations: 2
        },
        threshold: {
          value: 80,
          unit: 'percent'
        },
        frequency: 'hourly',
        priority: 'medium',
        recipients: ['kitchen-supervisor', 'ops-manager'],
        channels: [
          {
            type: 'slack',
            config: { channel: '#kitchen-alerts' },
            enabled: true
          },
          {
            type: 'email',
            config: { template: 'efficiency-warning' },
            enabled: false
          }
        ],
        status: 'active',
        trigger_count: 12,
        created_at: '2023-12-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    this.alerts = defaultAlerts;
  }

  private calculateNextRun(schedule: ReportSchedule): string {
    const now = new Date();
    let nextRun = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        nextRun = addDays(now, 1);
        break;
      case 'weekly':
        nextRun = addWeeks(now, 1);
        if (schedule.day_of_week !== undefined) {
          const daysToAdd = (schedule.day_of_week - now.getDay() + 7) % 7;
          nextRun = addDays(now, daysToAdd || 7);
        }
        break;
      case 'monthly':
        nextRun = addMonths(now, 1);
        if (schedule.day_of_month) {
          nextRun.setDate(schedule.day_of_month);
        }
        break;
      case 'quarterly':
        nextRun = addMonths(now, 3);
        break;
      case 'on_demand':
        return ''; // No scheduled run
    }

    // Set time
    const [hours, minutes] = schedule.time.split(':');
    nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextRun.toISOString();
  }

  private evaluateAlertCondition(alert: AlertRule, currentValue: number): boolean {
    const { condition, threshold } = alert;
    
    switch (condition.operator) {
      case 'greater_than':
        return currentValue > threshold.value;
      case 'less_than':
        return currentValue < threshold.value;
      case 'greater_than_or_equal':
        return currentValue >= threshold.value;
      case 'less_than_or_equal':
        return currentValue <= threshold.value;
      case 'equals':
        return currentValue === threshold.value;
      case 'not_equals':
        return currentValue !== threshold.value;
      default:
        return false;
    }
  }

  private async generateReportData(report: ScheduledReport): Promise<any> {
    // Simulate data generation based on report type
    const mockData = {
      executive_summary: { kpis: {}, trends: {}, alerts: {} },
      operational: { metrics: {}, stations: {}, orders: {} },
      compliance: { standards: {}, violations: {}, audits: {} },
      consumption_analytics: { consumption: {}, efficiency: {}, forecasts: {} },
      performance: { locations: {}, trends: {}, comparisons: {} }
    };

    return mockData[report.report_type] || {};
  }

  private async createReportFile(report: ScheduledReport, data: any): Promise<string> {
    // Simulate file creation
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    return `/reports/${report.report_type}/${report.id}_${timestamp}.${report.format}`;
  }

  private async sendReportNotifications(report: ScheduledReport, filePath: string): Promise<number> {
    // Simulate sending notifications
    let notificationCount = 0;
    
    for (const recipient of report.recipients) {
      if (recipient.notification_preferences.email) {
        notificationCount++;
      }
      if (recipient.notification_preferences.slack) {
        notificationCount++;
      }
      if (recipient.notification_preferences.teams) {
        notificationCount++;
      }
    }

    return notificationCount;
  }

  private async sendAlertNotifications(alert: AlertRule, execution: AlertExecution): Promise<number> {
    // Simulate sending alert notifications
    let notificationCount = 0;
    
    for (const channel of alert.channels.filter(c => c.enabled)) {
      notificationCount++;
    }

    return notificationCount;
  }

  private getTopReports(executions: ReportExecution[]): Array<{
    report_id: string;
    report_name: string;
    execution_count: number;
    success_rate: number;
  }> {
    const reportStats = new Map();
    
    for (const execution of executions) {
      if (!reportStats.has(execution.report_id)) {
        reportStats.set(execution.report_id, {
          total: 0,
          successful: 0,
          name: this.reports.find(r => r.id === execution.report_id)?.name || 'Unknown'
        });
      }
      
      const stats = reportStats.get(execution.report_id);
      stats.total++;
      if (execution.status === 'completed') {
        stats.successful++;
      }
    }

    return Array.from(reportStats.entries())
      .map(([report_id, stats]) => ({
        report_id,
        report_name: stats.name,
        execution_count: stats.total,
        success_rate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.execution_count - a.execution_count)
      .slice(0, 5);
  }

  private getTopAlerts(alertExecutions: AlertExecution[]): Array<{
    alert_id: string;
    alert_name: string;
    trigger_count: number;
    average_resolution_hours: number;
  }> {
    const alertStats = new Map();
    
    for (const execution of alertExecutions) {
      if (!alertStats.has(execution.alert_id)) {
        alertStats.set(execution.alert_id, {
          trigger_count: 0,
          total_resolution_time: 0,
          resolved_count: 0,
          name: this.alerts.find(a => a.id === execution.alert_id)?.name || 'Unknown'
        });
      }
      
      const stats = alertStats.get(execution.alert_id);
      stats.trigger_count++;
      
      if (execution.resolved_at) {
        const triggerTime = new Date(execution.triggered_at).getTime();
        const resolveTime = new Date(execution.resolved_at).getTime();
        const resolutionHours = (resolveTime - triggerTime) / (1000 * 60 * 60);
        stats.total_resolution_time += resolutionHours;
        stats.resolved_count++;
      }
    }

    return Array.from(alertStats.entries())
      .map(([alert_id, stats]) => ({
        alert_id,
        alert_name: stats.name,
        trigger_count: stats.trigger_count,
        average_resolution_hours: stats.resolved_count > 0 
          ? stats.total_resolution_time / stats.resolved_count 
          : 0
      }))
      .sort((a, b) => b.trigger_count - a.trigger_count)
      .slice(0, 5);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}