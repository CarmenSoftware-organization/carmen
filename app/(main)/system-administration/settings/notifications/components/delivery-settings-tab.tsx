"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Truck, Mail, MessageSquare, Smartphone, Webhook } from "lucide-react";
import { mockDeliverySettings } from "@/lib/mock-data/settings";
import type { DeliverySettings } from "@/lib/types/settings";

export function DeliverySettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<DeliverySettings>(mockDeliverySettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleRateLimitingChange = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      rateLimiting: {
        ...prev.rateLimiting,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleRetryPolicyChange = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      retryPolicy: {
        ...prev.retryPolicy,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleBatchingChange = (field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      batching: {
        ...prev.batching,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleChannelChange = (channel: 'email' | 'sms' | 'push' | 'webhook', field: string, value: boolean | number | string) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In real implementation, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Delivery settings have been updated successfully.",
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(mockDeliverySettings);
    setHasChanges(false);
    toast({
      title: "Settings Reset",
      description: "Delivery settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure notification delivery infrastructure and channel settings
              </CardDescription>
            </div>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={!hasChanges}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Control notification frequency to prevent spam
              </CardDescription>
            </div>
            <Switch
              checked={settings.rateLimiting.enabled}
              onCheckedChange={(checked) => handleRateLimitingChange('enabled', checked)}
            />
          </div>
        </CardHeader>
        {settings.rateLimiting.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Per User Per Hour</Label>
                <Input
                  type="number"
                  value={settings.rateLimiting.perUserPerHour}
                  onChange={(e) => handleRateLimitingChange('perUserPerHour', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum notifications per user per hour</p>
              </div>
              <div className="space-y-2">
                <Label>Organization Per Hour</Label>
                <Input
                  type="number"
                  value={settings.rateLimiting.organizationPerHour}
                  onChange={(e) => handleRateLimitingChange('organizationPerHour', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum notifications for entire organization per hour</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Retry Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Retry Policy</CardTitle>
          <CardDescription>
            Configure automatic retry behavior for failed deliveries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Retries</Label>
              <Input
                type="number"
                value={settings.retryPolicy.maxRetries}
                onChange={(e) => handleRetryPolicyChange('maxRetries', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Delay (seconds)</Label>
              <Input
                type="number"
                value={settings.retryPolicy.initialDelaySeconds}
                onChange={(e) => handleRetryPolicyChange('initialDelaySeconds', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Backoff Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.retryPolicy.backoffMultiplier}
                onChange={(e) => handleRetryPolicyChange('backoffMultiplier', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Example:</strong> With current settings, retries will occur at: {settings.retryPolicy.initialDelaySeconds}s,
            {' '}{settings.retryPolicy.initialDelaySeconds * settings.retryPolicy.backoffMultiplier}s,
            {' '}{settings.retryPolicy.initialDelaySeconds * Math.pow(settings.retryPolicy.backoffMultiplier, 2)}s
          </div>
        </CardContent>
      </Card>

      {/* Batching */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Batching</CardTitle>
              <CardDescription>
                Group notifications together to reduce noise
              </CardDescription>
            </div>
            <Switch
              checked={settings.batching.enabled}
              onCheckedChange={(checked) => handleBatchingChange('enabled', checked)}
            />
          </div>
        </CardHeader>
        {settings.batching.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batching Window (minutes)</Label>
                <Input
                  type="number"
                  value={settings.batching.windowMinutes}
                  onChange={(e) => handleBatchingChange('windowMinutes', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Notifications within this window will be grouped together</p>
              </div>
              <div className="space-y-2">
                <Label>Max Batch Size</Label>
                <Input
                  type="number"
                  value={settings.batching.maxBatchSize}
                  onChange={(e) => handleBatchingChange('maxBatchSize', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum number of notifications per batch</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Channel Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Channel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email</CardTitle>
              </div>
              <Switch
                checked={settings.channels.email.enabled}
                onCheckedChange={(checked) => handleChannelChange('email', 'enabled', checked)}
              />
            </div>
          </CardHeader>
          {settings.channels.email.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Quota</Label>
                <Input
                  type="number"
                  value={settings.channels.email.quotaPerDay || 0}
                  onChange={(e) => handleChannelChange('email', 'quotaPerDay', parseInt(e.target.value))}
                />
              </div>
              <Badge variant="default">Active</Badge>
            </CardContent>
          )}
        </Card>

        {/* SMS Channel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>SMS</CardTitle>
              </div>
              <Switch
                checked={settings.channels.sms.enabled}
                onCheckedChange={(checked) => handleChannelChange('sms', 'enabled', checked)}
              />
            </div>
          </CardHeader>
          {settings.channels.sms.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Quota</Label>
                <Input
                  type="number"
                  value={settings.channels.sms.quotaPerDay || 0}
                  onChange={(e) => handleChannelChange('sms', 'quotaPerDay', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={settings.channels.sms.provider || ''}
                  onChange={(e) => handleChannelChange('sms', 'provider', e.target.value)}
                  placeholder="e.g., twilio"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={settings.channels.sms.apiKey || ''}
                  onChange={(e) => handleChannelChange('sms', 'apiKey', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
              {!settings.channels.sms.enabled && <Badge variant="secondary">Disabled</Badge>}
            </CardContent>
          )}
        </Card>

        {/* Push Channel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <CardTitle>Push Notifications</CardTitle>
              </div>
              <Switch
                checked={settings.channels.push.enabled}
                onCheckedChange={(checked) => handleChannelChange('push', 'enabled', checked)}
              />
            </div>
          </CardHeader>
          {settings.channels.push.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Quota</Label>
                <Input
                  type="number"
                  value={settings.channels.push.quotaPerDay || 0}
                  onChange={(e) => handleChannelChange('push', 'quotaPerDay', parseInt(e.target.value))}
                />
              </div>
              <Badge variant="default">Active</Badge>
            </CardContent>
          )}
        </Card>

        {/* Webhook Channel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                <CardTitle>Webhooks</CardTitle>
              </div>
              <Switch
                checked={settings.channels.webhook.enabled}
                onCheckedChange={(checked) => handleChannelChange('webhook', 'enabled', checked)}
              />
            </div>
          </CardHeader>
          {settings.channels.webhook.enabled && (
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {settings.channels.webhook.endpoints.length} endpoint(s) configured
              </div>
              <Button variant="outline" size="sm">
                Manage Endpoints
              </Button>
              <Badge variant="default">Active</Badge>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
