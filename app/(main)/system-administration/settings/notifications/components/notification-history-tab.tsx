"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Download, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { mockNotificationLogs } from "@/lib/mock-data/settings";
import type { NotificationLog } from "@/lib/types/settings";

const statusIcons = {
  sent: CheckCircle,
  failed: XCircle,
  pending: Clock,
  retrying: AlertCircle,
  bounced: XCircle,
  opened: CheckCircle,
  clicked: CheckCircle
};

const statusColors = {
  sent: "default",
  failed: "destructive",
  pending: "secondary",
  retrying: "outline",
  bounced: "destructive",
  opened: "default",
  clicked: "default"
} as const;

export function NotificationHistoryTab() {
  const [logs] = useState<NotificationLog[]>(mockNotificationLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        searchQuery === "" ||
        log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subject?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      const matchesChannel = channelFilter === "all" || log.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [logs, searchQuery, statusFilter, channelFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const sent = logs.filter(l => l.status === 'sent').length;
    const failed = logs.filter(l => l.status === 'failed').length;
    const pending = logs.filter(l => l.status === 'pending').length;
    const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(1) : '0';

    return { total, sent, failed, pending, deliveryRate };
  }, [logs]);

  const handleExport = () => {
    // In real implementation, this would export logs to CSV/JSON
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notification-logs.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.sent.toLocaleString()}</div>
              <Badge variant="default">{stats.deliveryRate}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View and search notification logs with detailed delivery information
              </CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipient, event type, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in-app">In-App</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Notification Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium">Event Type</th>
                    <th className="text-left p-3 text-sm font-medium">Recipient</th>
                    <th className="text-left p-3 text-sm font-medium">Subject</th>
                    <th className="text-left p-3 text-sm font-medium">Channel</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                        No notification logs found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const StatusIcon = statusIcons[log.status];
                      return (
                        <tr key={log.id} className="hover:bg-muted/50">
                          <td className="p-3 text-sm">
                            <div className="font-medium">
                              {log.sentAt.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.sentAt.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.eventType}
                            </code>
                          </td>
                          <td className="p-3 text-sm">{log.recipient}</td>
                          <td className="p-3 text-sm max-w-xs truncate">
                            {log.subject || '-'}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{log.channel}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={statusColors[log.status]}>
                                {log.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-center">
                            {log.attempts}/{log.maxAttempts || 3}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredLogs.length} of {logs.length} notifications
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
