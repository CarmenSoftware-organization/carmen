"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TestTube, Send, Mail, MessageSquare, Smartphone, CheckCircle, XCircle, Activity } from "lucide-react";
import { mockEmailTemplates } from "@/lib/mock-data/settings";

export function TestingTab() {
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<string>("email");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [testRecipient, setTestRecipient] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    channel: string;
    recipient: string;
    status: 'success' | 'failed';
    message: string;
    timestamp: Date;
  }>>([]);

  const handleSendTest = () => {
    if (!testRecipient) {
      toast({
        title: "Error",
        description: "Please enter a recipient",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending test notification
    const result = {
      id: Date.now().toString(),
      channel: selectedChannel,
      recipient: testRecipient,
      status: Math.random() > 0.2 ? 'success' as const : 'failed' as const,
      message: Math.random() > 0.2
        ? 'Test notification sent successfully'
        : 'Failed to send: Connection timeout',
      timestamp: new Date()
    };

    setTestResults(prev => [result, ...prev].slice(0, 10));

    toast({
      title: result.status === 'success' ? "Test Sent" : "Test Failed",
      description: result.message,
      variant: result.status === 'success' ? "default" : "destructive",
    });
  };

  const channelStatus = {
    email: { status: 'healthy', latency: '45ms' },
    sms: { status: 'degraded', latency: '230ms' },
    push: { status: 'healthy', latency: '12ms' },
    'in-app': { status: 'healthy', latency: '8ms' }
  };

  return (
    <div className="space-y-6">
      {/* Channel Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Channel Health Status</CardTitle>
              <CardDescription>
                Real-time status and performance metrics for each notification channel
              </CardDescription>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(channelStatus).map(([channel, info]) => (
              <div key={channel} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium capitalize">{channel}</div>
                  {info.status === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={info.status === 'healthy' ? 'default' : 'secondary'}>
                    {info.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{info.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Notification Sender */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Send Test Notification</CardTitle>
              <CardDescription>
                Test notification delivery across different channels
              </CardDescription>
            </div>
            <TestTube className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="push">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Push Notification
                    </div>
                  </SelectItem>
                  <SelectItem value="in-app">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      In-App
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Use custom message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  {mockEmailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recipient</Label>
            <Input
              placeholder={
                selectedChannel === 'email' ? 'test@example.com' :
                selectedChannel === 'sms' ? '+1234567890' :
                selectedChannel === 'push' ? 'device-token-123' :
                'user-id-123'
              }
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
            />
          </div>

          {selectedTemplate === 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Subject / Title</Label>
                <Input
                  placeholder="Test notification subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Enter your test message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          <Button onClick={handleSendTest} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent test notification delivery attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 border rounded-lg ${
                    result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium capitalize">{result.channel}</span>
                        <Badge variant="outline">{result.recipient}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Template Preview & Testing</CardTitle>
          <CardDescription>
            Preview and test email templates with sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template to preview" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground text-center py-8">
                Select a template to preview it with sample data
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Preview Template
              </Button>
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Testing</CardTitle>
          <CardDescription>
            Test webhook endpoints and view delivery logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://api.example.com/webhooks/notifications"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label>Payload</Label>
              <Textarea
                placeholder='{"event": "test", "data": {...}}'
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Test Webhook
            </Button>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground text-center py-4">
                No webhook tests performed yet
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
