"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { mockNotificationPreferences, mockRoleNotificationDefaults } from "@/lib/mock-data/settings";
import type { NotificationPreference, NotificationEventType } from "@/lib/types/settings";

const eventCategories: Record<string, NotificationEventType[]> = {
  Procurement: ['purchase-request-submitted', 'purchase-request-approved', 'purchase-request-rejected', 'purchase-order-created', 'purchase-order-approved'],
  Inventory: ['goods-received', 'low-stock-alert', 'stock-count-required'],
  Finance: ['invoice-received', 'payment-due'],
  Vendor: ['price-update', 'vendor-update'],
  System: ['workflow-assignment', 'comment-mention', 'document-shared', 'system-maintenance', 'security-alert']
};

const eventLabels: Record<NotificationEventType, string> = {
  'purchase-request-submitted': 'Purchase Request Submitted',
  'purchase-request-approved': 'Purchase Request Approved',
  'purchase-request-rejected': 'Purchase Request Rejected',
  'purchase-order-created': 'Purchase Order Created',
  'purchase-order-approved': 'Purchase Order Approved',
  'goods-received': 'Goods Received',
  'invoice-received': 'Invoice Received',
  'payment-due': 'Payment Due',
  'low-stock-alert': 'Low Stock Alert',
  'stock-count-required': 'Stock Count Required',
  'workflow-assignment': 'Workflow Assignment',
  'comment-mention': 'Comment Mention',
  'document-shared': 'Document Shared',
  'price-update': 'Price Update',
  'vendor-update': 'Vendor Update',
  'system-maintenance': 'System Maintenance',
  'security-alert': 'Security Alert'
};

export function GlobalDefaultsTab() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>(mockNotificationPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggleChannel = (eventType: NotificationEventType, channel: keyof NotificationPreference['channels']) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.eventType === eventType) {
        return {
          ...pref,
          channels: {
            ...pref.channels,
            [channel]: !pref.channels[channel]
          }
        };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  const handleToggleEnabled = (eventType: NotificationEventType) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.eventType === eventType) {
        return { ...pref, enabled: !pref.enabled };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  const handleChangeFrequency = (eventType: NotificationEventType, frequency: NotificationPreference['frequency']) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.eventType === eventType) {
        return { ...pref, frequency };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  const handleEnableCategory = (category: string, enabled: boolean) => {
    const events = eventCategories[category as keyof typeof eventCategories];
    setPreferences(prev => prev.map(pref => {
      if (events.includes(pref.eventType)) {
        return { ...pref, enabled };
      }
      return pref;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In real implementation, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Global notification defaults have been updated successfully.",
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setPreferences(mockNotificationPreferences);
    setHasChanges(false);
    toast({
      title: "Settings Reset",
      description: "Global defaults have been reset to original values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global Notification Defaults</CardTitle>
              <CardDescription>
                Configure default notification preferences for new users. Users can override these in their personal settings.
              </CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
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

      {/* Notification Preferences by Category */}
      {Object.entries(eventCategories).map(([category, events]) => {
        const categoryPrefs = preferences.filter(p => events.includes(p.eventType));
        const allEnabled = categoryPrefs.every(p => p.enabled);
        const someEnabled = categoryPrefs.some(p => p.enabled);

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>{category}</CardTitle>
                  <Badge variant={allEnabled ? "default" : someEnabled ? "secondary" : "outline"}>
                    {categoryPrefs.filter(p => p.enabled).length} / {categoryPrefs.length} enabled
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Enable All</span>
                  <Switch
                    checked={allEnabled}
                    onCheckedChange={(checked) => handleEnableCategory(category, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map(eventType => {
                  const pref = preferences.find(p => p.eventType === eventType);
                  if (!pref) return null;

                  return (
                    <div key={eventType} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Switch
                            checked={pref.enabled}
                            onCheckedChange={() => handleToggleEnabled(eventType)}
                          />
                          <span className="font-medium">{eventLabels[eventType]}</span>
                        </div>

                        {pref.enabled && (
                          <div className="ml-12 space-y-3">
                            {/* Channels */}
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground w-20">Channels:</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={pref.channels.email ? "default" : "outline"}
                                  onClick={() => handleToggleChannel(eventType, 'email')}
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant={pref.channels.inApp ? "default" : "outline"}
                                  onClick={() => handleToggleChannel(eventType, 'inApp')}
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  In-App
                                </Button>
                                <Button
                                  size="sm"
                                  variant={pref.channels.sms ? "default" : "outline"}
                                  onClick={() => handleToggleChannel(eventType, 'sms')}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  SMS
                                </Button>
                                <Button
                                  size="sm"
                                  variant={pref.channels.push ? "default" : "outline"}
                                  onClick={() => handleToggleChannel(eventType, 'push')}
                                >
                                  <Smartphone className="h-4 w-4 mr-1" />
                                  Push
                                </Button>
                              </div>
                            </div>

                            {/* Frequency */}
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground w-20">Frequency:</span>
                              <Select
                                value={pref.frequency}
                                onValueChange={(value) => handleChangeFrequency(eventType, value as NotificationPreference['frequency'])}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="instant">Instant</SelectItem>
                                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                                  <SelectItem value="daily">Daily Digest</SelectItem>
                                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
