export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'text';
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval?: number; // in seconds
  isVisible: boolean;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  userRole: string;
  userId?: string;
  isPublic: boolean;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
  theme: 'light' | 'dark' | 'auto';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  widgets: Omit<DashboardWidget, 'id'>[];
  previewImage?: string;
}

export interface WidgetDataSource {
  id: string;
  name: string;
  type: 'api' | 'query' | 'static';
  endpoint?: string;
  query?: string;
  data?: any;
  refreshRate: number;
}

export class CustomDashboardService {
  private dashboards: Map<string, CustomDashboard> = new Map();
  private templates: Map<string, DashboardTemplate> = new Map();
  private dataSources: Map<string, WidgetDataSource> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDataSources();
  }

  /**
   * Create a new custom dashboard
   */
  async createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomDashboard> {
    const newDashboard: CustomDashboard = {
      ...dashboard,
      id: `dash-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      widgets: dashboard.widgets.map(widget => ({
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    this.dashboards.set(newDashboard.id, newDashboard);
    return newDashboard;
  }

  /**
   * Update an existing dashboard
   */
  async updateDashboard(id: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> {
    const existingDashboard = this.dashboards.get(id);
    if (!existingDashboard) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }

    const updatedDashboard: CustomDashboard = {
      ...existingDashboard,
      ...updates,
      updatedAt: new Date()
    };

    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(id: string): Promise<void> {
    if (!this.dashboards.has(id)) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }
    this.dashboards.delete(id);
  }

  /**
   * Get dashboards for a user/role
   */
  async getDashboards(filters?: {
    userRole?: string;
    userId?: string;
    isPublic?: boolean;
  }): Promise<CustomDashboard[]> {
    let dashboards = Array.from(this.dashboards.values());

    if (filters) {
      if (filters.userRole) {
        dashboards = dashboards.filter(d => 
          d.userRole === filters.userRole || d.isPublic
        );
      }
      if (filters.userId) {
        dashboards = dashboards.filter(d => 
          d.createdBy === filters.userId || d.isPublic
        );
      }
      if (filters.isPublic !== undefined) {
        dashboards = dashboards.filter(d => d.isPublic === filters.isPublic);
      }
    }

    return dashboards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(id: string): Promise<CustomDashboard | null> {
    return this.dashboards.get(id) || null;
  }

  /**
   * Create dashboard from template
   */
  async createFromTemplate(templateId: string, customization: {
    name: string;
    description?: string;
    userRole: string;
    userId?: string;
    createdBy: string;
  }): Promise<CustomDashboard> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'> = {
      name: customization.name,
      description: customization.description || template.description,
      userRole: customization.userRole,
      userId: customization.userId,
      isPublic: false,
      widgets: template.widgets.map(widget => ({
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      layout: 'grid',
      theme: 'auto',
      createdBy: customization.createdBy
    };

    return this.createDashboard(dashboard);
  }

  /**
   * Get available templates
   */
  async getTemplates(targetRole?: string): Promise<DashboardTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (targetRole) {
      templates = templates.filter(t => 
        t.targetRole === targetRole || t.targetRole === 'all'
      );
    }

    return templates;
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with ID ${dashboardId} not found`);
    }

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);

    return newWidget;
  }

  /**
   * Update widget
   */
  async updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with ID ${dashboardId} not found`);
    }

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new Error(`Widget with ID ${widgetId} not found`);
    }

    dashboard.widgets[widgetIndex] = {
      ...dashboard.widgets[widgetIndex],
      ...updates
    };

    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);

    return dashboard.widgets[widgetIndex];
  }

  /**
   * Remove widget from dashboard
   */
  async removeWidget(dashboardId: string, widgetId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with ID ${dashboardId} not found`);
    }

    dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
    dashboard.updatedAt = new Date();
    this.dashboards.set(dashboardId, dashboard);
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgetId: string, dashboardId: string): Promise<any> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard with ID ${dashboardId} not found`);
    }

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) {
      throw new Error(`Widget with ID ${widgetId} not found`);
    }

    const dataSource = this.dataSources.get(widget.dataSource);
    if (!dataSource) {
      throw new Error(`Data source ${widget.dataSource} not found`);
    }

    // Simulate data fetching based on data source type
    switch (dataSource.type) {
      case 'api':
        return this.fetchApiData(dataSource.endpoint!, widget.config);
      case 'query':
        return this.executeQuery(dataSource.query!, widget.config);
      case 'static':
        return dataSource.data;
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }

  /**
   * Get available data sources
   */
  async getDataSources(): Promise<WidgetDataSource[]> {
    return Array.from(this.dataSources.values());
  }

  /**
   * Initialize default dashboard templates
   */
  private initializeDefaultTemplates(): void {
    // Executive Dashboard Template
    const executiveTemplate: DashboardTemplate = {
      id: 'exec-001',
      name: 'Executive Summary Dashboard',
      description: 'High-level metrics and KPIs for executive management',
      targetRole: 'executive',
      widgets: [
        {
          type: 'metric',
          title: 'Total Cost Savings',
          position: { x: 0, y: 0, width: 3, height: 2 },
          config: { 
            metric: 'totalCostSavings',
            format: 'currency',
            trend: true
          },
          dataSource: 'cost-savings',
          isVisible: true
        },
        {
          type: 'metric',
          title: 'Active Vendors',
          position: { x: 3, y: 0, width: 3, height: 2 },
          config: { 
            metric: 'activeVendors',
            format: 'number'
          },
          dataSource: 'vendor-metrics',
          isVisible: true
        },
        {
          type: 'chart',
          title: 'Monthly Savings Trend',
          position: { x: 0, y: 2, width: 6, height: 4 },
          config: { 
            chartType: 'line',
            xAxis: 'month',
            yAxis: 'savings'
          },
          dataSource: 'savings-trend',
          isVisible: true
        },
        {
          type: 'chart',
          title: 'Vendor Performance',
          position: { x: 6, y: 0, width: 6, height: 6 },
          config: { 
            chartType: 'bar',
            xAxis: 'vendor',
            yAxis: 'performance'
          },
          dataSource: 'vendor-performance',
          isVisible: true
        }
      ]
    };

    // Purchaser Dashboard Template
    const purchaserTemplate: DashboardTemplate = {
      id: 'purch-001',
      name: 'Purchaser Operations Dashboard',
      description: 'Operational metrics and tools for purchasing staff',
      targetRole: 'purchaser',
      widgets: [
        {
          type: 'metric',
          title: 'Pending Assignments',
          position: { x: 0, y: 0, width: 2, height: 2 },
          config: { 
            metric: 'pendingAssignments',
            format: 'number',
            alert: { threshold: 50, type: 'warning' }
          },
          dataSource: 'assignment-queue',
          isVisible: true
        },
        {
          type: 'metric',
          title: 'Automation Rate',
          position: { x: 2, y: 0, width: 2, height: 2 },
          config: { 
            metric: 'automationRate',
            format: 'percentage'
          },
          dataSource: 'automation-metrics',
          isVisible: true
        },
        {
          type: 'table',
          title: 'Recent Price Assignments',
          position: { x: 0, y: 2, width: 8, height: 4 },
          config: { 
            columns: ['item', 'vendor', 'price', 'confidence', 'date'],
            sortable: true,
            filterable: true
          },
          dataSource: 'recent-assignments',
          isVisible: true
        },
        {
          type: 'chart',
          title: 'Price Trends by Category',
          position: { x: 8, y: 0, width: 4, height: 6 },
          config: { 
            chartType: 'area',
            xAxis: 'date',
            yAxis: 'price',
            groupBy: 'category'
          },
          dataSource: 'price-trends',
          isVisible: true
        }
      ]
    };

    // Vendor Dashboard Template
    const vendorTemplate: DashboardTemplate = {
      id: 'vendor-001',
      name: 'Vendor Performance Dashboard',
      description: 'Vendor-specific metrics and performance indicators',
      targetRole: 'vendor',
      widgets: [
        {
          type: 'metric',
          title: 'Response Rate',
          position: { x: 0, y: 0, width: 3, height: 2 },
          config: { 
            metric: 'responseRate',
            format: 'percentage',
            target: 95
          },
          dataSource: 'vendor-response',
          isVisible: true
        },
        {
          type: 'metric',
          title: 'On-Time Submissions',
          position: { x: 3, y: 0, width: 3, height: 2 },
          config: { 
            metric: 'onTimeRate',
            format: 'percentage'
          },
          dataSource: 'vendor-timeliness',
          isVisible: true
        },
        {
          type: 'chart',
          title: 'Submission History',
          position: { x: 0, y: 2, width: 6, height: 4 },
          config: { 
            chartType: 'bar',
            xAxis: 'month',
            yAxis: 'submissions'
          },
          dataSource: 'submission-history',
          isVisible: true
        }
      ]
    };

    this.templates.set(executiveTemplate.id, executiveTemplate);
    this.templates.set(purchaserTemplate.id, purchaserTemplate);
    this.templates.set(vendorTemplate.id, vendorTemplate);
  }

  /**
   * Initialize data sources
   */
  private initializeDataSources(): void {
    const dataSources: WidgetDataSource[] = [
      {
        id: 'cost-savings',
        name: 'Cost Savings Metrics',
        type: 'api',
        endpoint: '/api/price-management/analytics/cost-savings',
        refreshRate: 3600 // 1 hour
      },
      {
        id: 'vendor-metrics',
        name: 'Vendor Metrics',
        type: 'api',
        endpoint: '/api/price-management/analytics/vendor-metrics',
        refreshRate: 1800 // 30 minutes
      },
      {
        id: 'savings-trend',
        name: 'Savings Trend Data',
        type: 'api',
        endpoint: '/api/price-management/analytics/savings-trend',
        refreshRate: 3600
      },
      {
        id: 'vendor-performance',
        name: 'Vendor Performance Data',
        type: 'api',
        endpoint: '/api/price-management/analytics/vendor-performance',
        refreshRate: 1800
      },
      {
        id: 'assignment-queue',
        name: 'Assignment Queue Metrics',
        type: 'api',
        endpoint: '/api/price-management/assignments/queue-metrics',
        refreshRate: 300 // 5 minutes
      },
      {
        id: 'automation-metrics',
        name: 'Automation Metrics',
        type: 'api',
        endpoint: '/api/price-management/analytics/automation',
        refreshRate: 1800
      },
      {
        id: 'recent-assignments',
        name: 'Recent Price Assignments',
        type: 'api',
        endpoint: '/api/price-management/assignments/recent',
        refreshRate: 300
      },
      {
        id: 'price-trends',
        name: 'Price Trends Data',
        type: 'api',
        endpoint: '/api/price-management/analytics/price-trends',
        refreshRate: 3600
      },
      {
        id: 'vendor-response',
        name: 'Vendor Response Metrics',
        type: 'api',
        endpoint: '/api/price-management/vendors/response-metrics',
        refreshRate: 1800
      },
      {
        id: 'vendor-timeliness',
        name: 'Vendor Timeliness Metrics',
        type: 'api',
        endpoint: '/api/price-management/vendors/timeliness-metrics',
        refreshRate: 1800
      },
      {
        id: 'submission-history',
        name: 'Submission History Data',
        type: 'api',
        endpoint: '/api/price-management/vendors/submission-history',
        refreshRate: 3600
      }
    ];

    dataSources.forEach(ds => this.dataSources.set(ds.id, ds));
  }

  /**
   * Simulate API data fetching
   */
  private async fetchApiData(endpoint: string, config: any): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Return mock data based on endpoint
    switch (endpoint) {
      case '/api/price-management/analytics/cost-savings':
        return {
          totalCostSavings: 125678.90,
          monthlyChange: 12.5,
          trend: 'up'
        };
      case '/api/price-management/analytics/vendor-metrics':
        return {
          activeVendors: 47,
          totalVendors: 52,
          responseRate: 89.2
        };
      default:
        return { message: 'Mock data for ' + endpoint };
    }
  }

  /**
   * Simulate query execution
   */
  private async executeQuery(query: string, config: any): Promise<any> {
    // Simulate query execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    return { message: 'Mock query result for: ' + query };
  }
}

export const customDashboardService = new CustomDashboardService();