import { describe, it, expect, beforeEach } from 'vitest';
import { reportExportService } from '../report-export-service';
import { scheduledReportService } from '../scheduled-report-service';
import { customDashboardService } from '../custom-dashboard-service';
import { comparativeAnalysisService } from '../comparative-analysis-service';
import { costSavingsReportingService } from '../cost-savings-reporting-service';

describe('Advanced Reporting Services', () => {
  describe('Report Export Service', () => {
    it('should export report to Excel format', async () => {
      const reportData = {
        title: 'Test Report',
        data: [
          { vendor: 'Vendor A', savings: 1000 },
          { vendor: 'Vendor B', savings: 2000 }
        ],
        summary: { totalSavings: 3000 }
      };

      const options = {
        format: 'excel' as const,
        includeCharts: true
      };

      const result = await reportExportService.exportReport(reportData, options);
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should export report to PDF format', async () => {
      const reportData = {
        title: 'Test Report',
        data: [
          { vendor: 'Vendor A', savings: 1000 },
          { vendor: 'Vendor B', savings: 2000 }
        ]
      };

      const options = {
        format: 'pdf' as const
      };

      const result = await reportExportService.exportReport(reportData, options);
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    it('should export report to CSV format', async () => {
      const reportData = {
        title: 'Test Report',
        data: [
          { vendor: 'Vendor A', savings: 1000 },
          { vendor: 'Vendor B', savings: 2000 }
        ]
      };

      const options = {
        format: 'csv' as const
      };

      const result = await reportExportService.exportReport(reportData, options);
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv');
    });

    it('should generate appropriate filename', () => {
      const reportData = {
        title: 'Vendor Performance Report',
        data: []
      };

      const options = {
        format: 'excel' as const
      };

      const filename = reportExportService.generateFilename(reportData, options);
      
      expect(filename).toMatch(/Vendor_Performance_Report_\d{4}-\d{2}-\d{2}\.xlsx/);
    });
  });

  describe('Scheduled Report Service', () => {
    beforeEach(() => {
      // Reset service state for each test
    });

    it('should create a scheduled report', async () => {
      const reportData = {
        name: 'Weekly Vendor Report',
        description: 'Weekly vendor performance summary',
        category: 'vendor_performance',
        frequency: 'weekly' as const,
        isActive: true,
        recipients: ['test@example.com'],
        filters: {},
        format: 'excel' as const,
        createdBy: 'test-user'
      };

      const result = await scheduledReportService.createScheduledReport(reportData);
      
      expect(result.id).toBeDefined();
      expect(result.name).toBe(reportData.name);
      expect(result.frequency).toBe(reportData.frequency);
      expect(result.nextScheduled).toBeInstanceOf(Date);
    });

    it('should update a scheduled report', async () => {
      const reportData = {
        name: 'Test Report',
        description: 'Test description',
        category: 'test',
        frequency: 'monthly' as const,
        isActive: true,
        recipients: [],
        filters: {},
        format: 'excel' as const,
        createdBy: 'test-user'
      };

      const created = await scheduledReportService.createScheduledReport(reportData);
      const updated = await scheduledReportService.updateScheduledReport(created.id, {
        name: 'Updated Test Report',
        frequency: 'weekly' as const
      });
      
      expect(updated.name).toBe('Updated Test Report');
      expect(updated.frequency).toBe('weekly');
    });

    it('should execute a scheduled report', async () => {
      const reportData = {
        name: 'Test Report',
        description: 'Test description',
        category: 'test',
        frequency: 'monthly' as const,
        isActive: true,
        recipients: [],
        filters: {},
        format: 'excel' as const,
        createdBy: 'test-user'
      };

      const created = await scheduledReportService.createScheduledReport(reportData);
      const execution = await scheduledReportService.executeReport(created.id);
      
      expect(execution.id).toBeDefined();
      expect(execution.reportId).toBe(created.id);
      expect(execution.status).toBe('pending');
    });

    it('should get report statistics', async () => {
      const stats = await scheduledReportService.getReportStatistics();
      
      expect(stats).toHaveProperty('totalReports');
      expect(stats).toHaveProperty('activeReports');
      expect(stats).toHaveProperty('totalExecutions');
      expect(stats).toHaveProperty('successfulExecutions');
      expect(stats).toHaveProperty('failedExecutions');
      expect(stats).toHaveProperty('averageExecutionTime');
    });
  });

  describe('Custom Dashboard Service', () => {
    it('should create a custom dashboard', async () => {
      const dashboardData = {
        name: 'Test Dashboard',
        description: 'Test dashboard description',
        userRole: 'purchaser',
        isPublic: false,
        widgets: [],
        layout: 'grid' as const,
        theme: 'auto' as const,
        createdBy: 'test-user'
      };

      const result = await customDashboardService.createDashboard(dashboardData);
      
      expect(result.id).toBeDefined();
      expect(result.name).toBe(dashboardData.name);
      expect(result.userRole).toBe(dashboardData.userRole);
    });

    it('should create dashboard from template', async () => {
      const templates = await customDashboardService.getTemplates();
      expect(templates.length).toBeGreaterThan(0);

      const template = templates[0];
      const dashboard = await customDashboardService.createFromTemplate(template.id, {
        name: 'Dashboard from Template',
        userRole: 'purchaser',
        createdBy: 'test-user'
      });
      
      expect(dashboard.name).toBe('Dashboard from Template');
      expect(dashboard.widgets.length).toBeGreaterThan(0);
    });

    it('should add widget to dashboard', async () => {
      const dashboardData = {
        name: 'Test Dashboard',
        description: 'Test dashboard description',
        userRole: 'purchaser',
        isPublic: false,
        widgets: [],
        layout: 'grid' as const,
        theme: 'auto' as const,
        createdBy: 'test-user'
      };

      const dashboard = await customDashboardService.createDashboard(dashboardData);
      
      const widget = await customDashboardService.addWidget(dashboard.id, {
        type: 'metric',
        title: 'Test Metric',
        position: { x: 0, y: 0, width: 2, height: 2 },
        config: { metric: 'testMetric' },
        dataSource: 'test-source',
        isVisible: true
      });
      
      expect(widget.id).toBeDefined();
      expect(widget.title).toBe('Test Metric');
    });
  });

  describe('Comparative Analysis Service', () => {
    it('should compare vendors', async () => {
      const vendorIds = ['vendor-001', 'vendor-002', 'vendor-003'];
      const result = await comparativeAnalysisService.compareVendors(vendorIds);
      
      expect(result).toHaveLength(vendorIds.length);
      expect(result[0]).toHaveProperty('vendorId');
      expect(result[0]).toHaveProperty('vendorName');
      expect(result[0]).toHaveProperty('metrics');
      expect(result[0]).toHaveProperty('overallRanking');
    });

    it('should compare categories by vendor', async () => {
      const categoryIds = ['office-supplies', 'it-equipment'];
      const result = await comparativeAnalysisService.compareCategoriesByVendor(categoryIds);
      
      expect(result).toHaveLength(categoryIds.length);
      expect(result[0]).toHaveProperty('categoryId');
      expect(result[0]).toHaveProperty('vendors');
      expect(result[0]).toHaveProperty('marketInsights');
    });

    it('should analyze market trends', async () => {
      const timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      };
      
      const result = await comparativeAnalysisService.analyzeMarket(timeframe);
      
      expect(result).toHaveProperty('timeframe');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('overallMarket');
    });

    it('should analyze competitive position', async () => {
      const vendorId = 'vendor-001';
      const result = await comparativeAnalysisService.analyzeCompetitivePosition(vendorId);
      
      expect(result.vendorId).toBe(vendorId);
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('opportunities');
      expect(result).toHaveProperty('threats');
    });
  });

  describe('Cost Savings Reporting Service', () => {
    it('should generate cost savings report', async () => {
      const timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      };
      
      const result = await costSavingsReportingService.generateCostSavingsReport(timeframe);
      
      expect(result).toHaveProperty('totalSavings');
      expect(result).toHaveProperty('savingsPercentage');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('projections');
      expect(result.breakdown).toHaveProperty('byCategory');
      expect(result.breakdown).toHaveProperty('byVendor');
      expect(result.breakdown).toHaveProperty('byMethod');
    });

    it('should generate efficiency report', async () => {
      const timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      };
      
      const result = await costSavingsReportingService.generateEfficiencyReport(timeframe);
      
      expect(result).toHaveProperty('timeToSavings');
      expect(result).toHaveProperty('automationImpact');
      expect(result).toHaveProperty('userProductivity');
      expect(result).toHaveProperty('systemPerformance');
    });

    it('should generate ROI analysis', async () => {
      const timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      };
      
      const result = await costSavingsReportingService.generateROIAnalysis(timeframe);
      
      expect(result).toHaveProperty('investment');
      expect(result).toHaveProperty('returns');
      expect(result).toHaveProperty('roi');
      expect(result.roi).toHaveProperty('percentage');
      expect(result.roi).toHaveProperty('paybackPeriod');
    });

    it('should generate executive summary', async () => {
      const timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      };
      
      const result = await costSavingsReportingService.generateExecutiveSummary(timeframe);
      
      expect(result).toHaveProperty('totalSavings');
      expect(result).toHaveProperty('savingsPercentage');
      expect(result).toHaveProperty('keyAchievements');
      expect(result).toHaveProperty('topCategories');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('futureOpportunities');
    });
  });
});