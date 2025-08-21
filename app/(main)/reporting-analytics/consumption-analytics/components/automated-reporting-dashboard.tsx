'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { 
  Calendar, Clock, Mail, Slack, Bell, Settings,
  Play, Pause, Edit, Trash2, Plus, Download,
  AlertTriangle, CheckCircle, TrendingUp, Activity,
  Users, FileText, Shield, BarChart3, Eye,
  RefreshCw, Filter, Search, Send
} from 'lucide-react';
import { 
  AutomatedReportingService, 
  ScheduledReport, 
  AlertRule, 
  ReportExecution,
  AlertExecution
} from '@/lib/services/automated-reporting-service';

export default function AutomatedReportingDashboard() {
  const [reportingService] = useState(new AutomatedReportingService());
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ReportExecution[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertExecution[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const loadData = async () => {
    setRefreshing(true);
    
    try {
      // Load scheduled reports and alerts
      const reports = await reportingService.getScheduledReports();
      const alerts = await reportingService.getAlertRules();
      
      setScheduledReports(reports);
      setAlertRules(alerts);

      // Load analytics
      const endDate = new Date();
      const startDate = new Date();
      const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      const analyticsData = await reportingService.getReportingAnalytics({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      
      setAnalytics(analyticsData);

      // Simulate recent executions and alerts
      setRecentExecutions([
        {
          id: 'exec1',
          report_id: 'exec-daily',
          execution_time: '2024-01-14T08:00:00Z',
          status: 'completed',
          duration_ms: 2500,
          file_path: '/reports/executive_summary/exec-daily_2024-01-14_08-00.pdf',
          file_size: 250000,
          recipients_notified: 3,
          metadata: {}
        },
        {
          id: 'exec2',
          report_id: 'ops-hourly',
          execution_time: '2024-01-14T14:00:00Z',
          status: 'failed',
          error_message: 'Data source connection timeout',
          recipients_notified: 0,
          metadata: {}
        }
      ]);

      setRecentAlerts([
        {
          id: 'alert1',
          alert_id: 'waste-critical',
          triggered_at: '2024-01-14T13:45:00Z',
          status: 'resolved',
          resolved_at: '2024-01-14T14:15:00Z',
          trigger_value: 8.5,
          threshold_value: 8.0,
          notifications_sent: 4,
          escalation_level: 1,
          resolution_notes: 'Adjusted portion sizes, waste reduced'
        }
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    setRefreshing(false);
  };

  const handleExecuteReport = async (reportId: string) => {
    try {
      await reportingService.executeReport(reportId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  const handleToggleReportStatus = async (reportId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await reportingService.updateScheduledReport(reportId, { status: newStatus });
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error toggling report status:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await reportingService.resolveAlert(alertId, 'Resolved manually from dashboard');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'resolved': return 'text-green-600 bg-green-100';
      case 'paused': case 'running': case 'triggered': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'escalated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  // Mock trend data for analytics
  const executionTrend = [
    { date: '2024-01-08', successful: 45, failed: 2 },
    { date: '2024-01-09', successful: 48, failed: 1 },
    { date: '2024-01-10', successful: 52, failed: 3 },
    { date: '2024-01-11', successful: 49, failed: 1 },
    { date: '2024-01-12', successful: 51, failed: 2 },
    { date: '2024-01-13', successful: 47, failed: 4 },
    { date: '2024-01-14', successful: 44, failed: 1 }
  ];

  const alertTrend = [
    { date: '2024-01-08', triggered: 12, resolved: 11 },
    { date: '2024-01-09', triggered: 8, resolved: 9 },
    { date: '2024-01-10', triggered: 15, resolved: 13 },
    { date: '2024-01-11', triggered: 6, resolved: 8 },
    { date: '2024-01-12', triggered: 11, resolved: 12 },
    { date: '2024-01-13', triggered: 9, resolved: 7 },
    { date: '2024-01-14', triggered: 4, resolved: 6 }
  ];

  const reportTypeDistribution = [
    { name: 'Executive Summary', value: 35, color: '#3b82f6' },
    { name: 'Operational', value: 28, color: '#10b981' },
    { name: 'Compliance', value: 20, color: '#f59e0b' },
    { name: 'Analytics', value: 12, color: '#8b5cf6' },
    { name: 'Performance', value: 5, color: '#06b6d4' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            Automated Reporting
          </h1>
          <p className="text-muted-foreground">
            Scheduled reports, alerts, and automation management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledReports.length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-600">{scheduledReports.filter(r => r.status === 'active').length} active</span>
              <span className="mx-1">•</span>
              <span className="text-yellow-600">{scheduledReports.filter(r => r.status === 'paused').length} paused</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertRules.filter(a => a.status === 'active').length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-red-600">{alertRules.filter(a => a.priority === 'critical').length} critical</span>
              <span className="mx-1">•</span>
              <span className="text-orange-600">{alertRules.filter(a => a.priority === 'high').length} high</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96.3%</div>
            <div className="text-xs text-muted-foreground">
              +2.1% from last period
            </div>
            <Progress value={96.3} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4s</div>
            <div className="text-xs text-muted-foreground">
              -0.3s improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Scheduled Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {scheduledReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.report_type.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Schedule</h4>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {report.schedule.frequency}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {report.schedule.time}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Recipients</h4>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {report.recipients.length} recipients
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {report.format}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Execution</h4>
                      <div className="text-sm">
                        <div>Runs: {report.run_count}</div>
                        <div>Next: {new Date(report.next_run).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteReport(report.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleReportStatus(report.id, report.status)}
                      >
                        {report.status === 'active' ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {alertRules.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{alert.name}</CardTitle>
                      <CardDescription>{alert.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Metric</h4>
                      <div className="text-sm">
                        <div>{alert.metric}</div>
                        <div className="text-gray-500">
                          {alert.condition.operator} {alert.threshold.value}{alert.threshold.unit}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Notifications</h4>
                      <div className="text-sm">
                        <div>{alert.recipients.length} recipients</div>
                        <div className="flex items-center space-x-1 mt-1">
                          {alert.channels.map((channel, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${channel.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Activity</h4>
                      <div className="text-sm">
                        <div>Triggers: {alert.trigger_count}</div>
                        {alert.last_triggered && (
                          <div className="text-gray-500">
                            Last: {new Date(alert.last_triggered).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      {alert.status === 'triggered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Report Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <span className="font-medium">
                          {scheduledReports.find(r => r.id === execution.report_id)?.name || 'Unknown Report'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Executed:</span><br />
                          {new Date(execution.execution_time).toLocaleString()}
                        </div>
                        {execution.duration_ms && (
                          <div>
                            <span className="font-medium">Duration:</span><br />
                            {formatDuration(execution.duration_ms)}
                          </div>
                        )}
                        {execution.file_size && (
                          <div>
                            <span className="font-medium">File Size:</span><br />
                            {formatFileSize(execution.file_size)}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Recipients:</span><br />
                          {execution.recipients_notified} notified
                        </div>
                      </div>
                      
                      {execution.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                          {execution.error_message}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {execution.file_path && (
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alertExec) => (
                  <div key={alertExec.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(alertExec.status)}>
                          {alertExec.status}
                        </Badge>
                        <span className="font-medium">
                          {alertRules.find(a => a.id === alertExec.alert_id)?.name || 'Unknown Alert'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Triggered:</span><br />
                          {new Date(alertExec.triggered_at).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Value:</span><br />
                          {alertExec.trigger_value} (threshold: {alertExec.threshold_value})
                        </div>
                        <div>
                          <span className="font-medium">Notifications:</span><br />
                          {alertExec.notifications_sent} sent
                        </div>
                        {alertExec.resolved_at && (
                          <div>
                            <span className="font-medium">Resolved:</span><br />
                            {new Date(alertExec.resolved_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      {alertExec.resolution_notes && (
                        <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
                          {alertExec.resolution_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Execution Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Report Execution Trends</CardTitle>
              <CardDescription>Daily execution success and failure rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="successful" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.8}
                      name="Successful"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.8}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alert Activity and Report Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Activity</CardTitle>
                <CardDescription>Daily alert triggers and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={alertTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="triggered" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Triggered"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Resolved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Type Distribution</CardTitle>
                <CardDescription>Breakdown by report categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {reportTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Reports']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Automation performance metrics for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.execution_summary.total_executions}
                    </div>
                    <div className="text-sm text-gray-600">Total Executions</div>
                    <div className="text-xs text-green-600">
                      {Math.round((analytics.execution_summary.successful_executions / analytics.execution_summary.total_executions) * 100)}% success rate
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatDuration(analytics.execution_summary.average_duration_ms)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Duration</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {analytics.alert_summary.triggered_alerts}
                    </div>
                    <div className="text-sm text-gray-600">Alerts Triggered</div>
                    <div className="text-xs text-blue-600">
                      {Math.round(analytics.alert_summary.average_resolution_time_hours * 10) / 10}h avg resolution
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.alert_summary.active_alerts}
                    </div>
                    <div className="text-sm text-gray-600">Active Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}