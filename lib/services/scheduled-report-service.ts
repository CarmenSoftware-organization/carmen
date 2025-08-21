export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  isActive: boolean;
  recipients: string[];
  filters: Record<string, any>;
  format: 'excel' | 'pdf' | 'csv';
  createdAt: Date;
  lastGenerated?: Date;
  nextScheduled: Date;
  createdBy: string;
}

export interface ReportSchedule {
  reportId: string;
  cronExpression: string;
  timezone: string;
  isActive: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  fileSize?: number;
  recordCount?: number;
}

export class ScheduledReportService {
  private reports: Map<string, ScheduledReport> = new Map();
  private schedules: Map<string, ReportSchedule> = new Map();
  private executions: Map<string, ReportExecution> = new Map();

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextScheduled'>): Promise<ScheduledReport> {
    const newReport: ScheduledReport = {
      ...report,
      id: `sched-${Date.now()}`,
      createdAt: new Date(),
      nextScheduled: this.calculateNextSchedule(report.frequency)
    };

    this.reports.set(newReport.id, newReport);

    // Create schedule
    const schedule: ReportSchedule = {
      reportId: newReport.id,
      cronExpression: this.frequencyToCron(report.frequency),
      timezone: 'UTC',
      isActive: report.isActive
    };

    this.schedules.set(newReport.id, schedule);

    return newReport;
  }

  /**
   * Update an existing scheduled report
   */
  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const existingReport = this.reports.get(id);
    if (!existingReport) {
      throw new Error(`Scheduled report with ID ${id} not found`);
    }

    const updatedReport: ScheduledReport = {
      ...existingReport,
      ...updates
    };

    // Recalculate next schedule if frequency changed
    if (updates.frequency) {
      updatedReport.nextScheduled = this.calculateNextSchedule(updates.frequency);
    }

    this.reports.set(id, updatedReport);

    // Update schedule if needed
    if (updates.frequency || updates.isActive !== undefined) {
      const schedule = this.schedules.get(id);
      if (schedule) {
        schedule.cronExpression = this.frequencyToCron(updatedReport.frequency);
        schedule.isActive = updatedReport.isActive;
        this.schedules.set(id, schedule);
      }
    }

    return updatedReport;
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: string): Promise<void> {
    this.reports.delete(id);
    this.schedules.delete(id);
    
    // Clean up executions
    for (const [execId, execution] of this.executions.entries()) {
      if (execution.reportId === id) {
        this.executions.delete(execId);
      }
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(filters?: {
    category?: string;
    isActive?: boolean;
    createdBy?: string;
  }): Promise<ScheduledReport[]> {
    let reports = Array.from(this.reports.values());

    if (filters) {
      if (filters.category) {
        reports = reports.filter(r => r.category === filters.category);
      }
      if (filters.isActive !== undefined) {
        reports = reports.filter(r => r.isActive === filters.isActive);
      }
      if (filters.createdBy) {
        reports = reports.filter(r => r.createdBy === filters.createdBy);
      }
    }

    return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get scheduled report by ID
   */
  async getScheduledReport(id: string): Promise<ScheduledReport | null> {
    return this.reports.get(id) || null;
  }

  /**
   * Execute a scheduled report immediately
   */
  async executeReport(reportId: string): Promise<ReportExecution> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Scheduled report with ID ${reportId} not found`);
    }

    const execution: ReportExecution = {
      id: `exec-${Date.now()}`,
      reportId,
      status: 'pending',
      startedAt: new Date()
    };

    this.executions.set(execution.id, execution);

    // Simulate report execution
    setTimeout(async () => {
      try {
        execution.status = 'running';
        this.executions.set(execution.id, execution);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000));

        execution.status = 'completed';
        execution.completedAt = new Date();
        execution.fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
        execution.recordCount = Math.floor(Math.random() * 10000) + 100;

        // Update last generated time
        report.lastGenerated = new Date();
        report.nextScheduled = this.calculateNextSchedule(report.frequency);
        this.reports.set(reportId, report);

        this.executions.set(execution.id, execution);

        // Send email notifications (simulated)
        await this.sendReportNotifications(report, execution);

      } catch (error) {
        execution.status = 'failed';
        execution.completedAt = new Date();
        execution.error = error instanceof Error ? error.message : 'Unknown error';
        this.executions.set(execution.id, execution);
      }
    }, 100);

    return execution;
  }

  /**
   * Get report executions
   */
  async getReportExecutions(reportId?: string, limit = 50): Promise<ReportExecution[]> {
    let executions = Array.from(this.executions.values());

    if (reportId) {
      executions = executions.filter(e => e.reportId === reportId);
    }

    return executions
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get reports due for execution
   */
  async getReportsDue(): Promise<ScheduledReport[]> {
    const now = new Date();
    return Array.from(this.reports.values())
      .filter(report => 
        report.isActive && 
        report.nextScheduled <= now
      );
  }

  /**
   * Process scheduled reports (would be called by a cron job)
   */
  async processScheduledReports(): Promise<void> {
    const dueReports = await this.getReportsDue();
    
    for (const report of dueReports) {
      try {
        await this.executeReport(report.id);
      } catch (error) {
        console.error(`Failed to execute scheduled report ${report.id}:`, error);
      }
    }
  }

  /**
   * Convert frequency to cron expression
   */
  private frequencyToCron(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 9 * * *'; // 9 AM daily
      case 'weekly':
        return '0 9 * * 1'; // 9 AM every Monday
      case 'monthly':
        return '0 9 1 * *'; // 9 AM on 1st of every month
      case 'quarterly':
        return '0 9 1 */3 *'; // 9 AM on 1st of every 3rd month
      default:
        return '0 9 1 * *'; // Default to monthly
    }
  }

  /**
   * Calculate next schedule date
   */
  private calculateNextSchedule(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(now.getMonth() + 3);
        break;
      default:
        next.setMonth(now.getMonth() + 1);
    }

    // Set to 9 AM
    next.setHours(9, 0, 0, 0);

    return next;
  }

  /**
   * Send report notifications (simulated)
   */
  private async sendReportNotifications(report: ScheduledReport, execution: ReportExecution): Promise<void> {
    // In a real implementation, this would send actual emails
    console.log(`Sending report notification for ${report.name} to ${report.recipients.join(', ')}`);
    console.log(`Execution status: ${execution.status}`);
    
    if (execution.status === 'completed') {
      console.log(`Report generated successfully with ${execution.recordCount} records`);
    } else if (execution.status === 'failed') {
      console.log(`Report generation failed: ${execution.error}`);
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<{
    totalReports: number;
    activeReports: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  }> {
    const reports = Array.from(this.reports.values());
    const executions = Array.from(this.executions.values());
    const completedExecutions = executions.filter(e => e.completedAt);

    const executionTimes = completedExecutions
      .map(e => e.completedAt!.getTime() - e.startedAt.getTime())
      .filter(time => time > 0);

    return {
      totalReports: reports.length,
      activeReports: reports.filter(r => r.isActive).length,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageExecutionTime: executionTimes.length > 0 
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
        : 0
    };
  }
}

export const scheduledReportService = new ScheduledReportService();