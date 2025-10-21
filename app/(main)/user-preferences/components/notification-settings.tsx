"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NotificationSettings as NotificationSettingsType, NotificationPreference, NotificationEventType } from "@/lib/types";
import { mockUserPreferences } from "@/lib/mock-data";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

interface NotificationSettingsProps {
  userId: string;
}

const EVENT_LABELS: Record<NotificationEventType, { label: string; category: string }> = {
  "purchase-request-submitted": { label: "Purchase Request Submitted", category: "Procurement" },
  "purchase-request-approved": { label: "Purchase Request Approved", category: "Procurement" },
  "purchase-request-rejected": { label: "Purchase Request Rejected", category: "Procurement" },
  "purchase-order-created": { label: "Purchase Order Created", category: "Procurement" },
  "purchase-order-sent": { label: "Purchase Order Sent", category: "Procurement" },
  "purchase-order-confirmed": { label: "Purchase Order Confirmed", category: "Procurement" },
  "goods-receipt-created": { label: "Goods Receipt Created", category: "Inventory" },
  "stock-low": { label: "Stock Level Low", category: "Inventory" },
  "stock-adjustment-required": { label: "Stock Adjustment Required", category: "Inventory" },
  "physical-count-scheduled": { label: "Physical Count Scheduled", category: "Inventory" },
  "invoice-received": { label: "Invoice Received", category: "Finance" },
  "payment-due": { label: "Payment Due", category: "Finance" },
  "payment-processed": { label: "Payment Processed", category: "Finance" },
  "vendor-rating-low": { label: "Vendor Rating Low", category: "Vendor" },
  "workflow-assigned": { label: "Workflow Task Assigned", category: "System" },
  "workflow-escalated": { label: "Workflow Escalated", category: "System" },
  "system-maintenance": { label: "System Maintenance Scheduled", category: "System" },
};

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsType>(mockUserPreferences.notifications);

  const handlePreferenceChange = (
    eventType: NotificationEventType,
    field: "email" | "inApp" | "sms" | "push" | "enabled",
    value: boolean
  ) => {
    const updatedPreferences = settings.preferences.map((pref) => {
      if (pref.eventType === eventType) {
        if (field === "enabled") {
          return { ...pref, enabled: value };
        }
        return {
          ...pref,
          channels: { ...pref.channels, [field]: value },
        };
      }
      return pref;
    });
    setSettings({ ...settings, preferences: updatedPreferences });
    // TODO: Save to backend
  };

  const handleFrequencyChange = (eventType: NotificationEventType, frequency: string) => {
    const updatedPreferences = settings.preferences.map((pref) =>
      pref.eventType === eventType
        ? { ...pref, frequency: frequency as NotificationPreference["frequency"] }
        : pref
    );
    setSettings({ ...settings, preferences: updatedPreferences });
    // TODO: Save to backend
  };

  const handleGlobalToggle = (key: keyof NotificationSettingsType, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  const handleEmailDigestChange = (value: string) => {
    setSettings({
      ...settings,
      emailDigest: value as NotificationSettingsType["emailDigest"],
    });
    // TODO: Save to backend
  };

  const handleDoNotDisturbChange = (field: keyof NotificationSettingsType["doNotDisturb"], value: any) => {
    setSettings({
      ...settings,
      doNotDisturb: {
        ...settings.doNotDisturb,
        [field]: value,
      },
    });
    // TODO: Save to backend
  };

  const groupedPreferences = settings.preferences.reduce(
    (acc, pref) => {
      const category = EVENT_LABELS[pref.eventType].category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(pref);
      return acc;
    },
    {} as Record<string, NotificationPreference[]>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure global notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-enabled">Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Play a sound when receiving notifications
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleGlobalToggle("soundEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show browser notifications when the app is not in focus
              </p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={settings.desktopNotifications}
              onCheckedChange={(checked) => handleGlobalToggle("desktopNotifications", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-digest">Email Digest</Label>
            <Select value={settings.emailDigest} onValueChange={handleEmailDigestChange}>
              <SelectTrigger id="email-digest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No digest</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
                <SelectItem value="weekly">Weekly digest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Receive a summary of notifications via email
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Do Not Disturb</CardTitle>
          <CardDescription>
            Set quiet hours when notifications will be muted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dnd-enabled">Enable Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">
                Mute notifications during specified hours
              </p>
            </div>
            <Switch
              id="dnd-enabled"
              checked={settings.doNotDisturb.enabled}
              onCheckedChange={(checked) => handleDoNotDisturbChange("enabled", checked)}
            />
          </div>

          {settings.doNotDisturb.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dnd-start">Start Time</Label>
                  <Select
                    value={settings.doNotDisturb.startTime}
                    onValueChange={(value) => handleDoNotDisturbChange("startTime", value)}
                  >
                    <SelectTrigger id="dnd-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                          {`${i.toString().padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dnd-end">End Time</Label>
                  <Select
                    value={settings.doNotDisturb.endTime}
                    onValueChange={(value) => handleDoNotDisturbChange("endTime", value)}
                  >
                    <SelectTrigger id="dnd-end">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                          {`${i.toString().padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {Object.entries(groupedPreferences).map(([category, prefs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category} Notifications</CardTitle>
            <CardDescription>
              Manage notification preferences for {category.toLowerCase()} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Event</TableHead>
                  <TableHead className="text-center w-[80px]">
                    <Mail className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <Bell className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <Smartphone className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <MessageSquare className="h-4 w-4 mx-auto" />
                  </TableHead>
                  <TableHead className="w-[120px]">Frequency</TableHead>
                  <TableHead className="text-center w-[80px]">Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prefs.map((pref) => (
                  <TableRow key={pref.eventType}>
                    <TableCell className="font-medium">
                      {EVENT_LABELS[pref.eventType].label}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.channels.email}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.eventType, "email", checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.channels.inApp}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.eventType, "inApp", checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.channels.sms}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.eventType, "sms", checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.channels.push}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.eventType, "push", checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={pref.frequency}
                        onValueChange={(value) =>
                          handleFrequencyChange(pref.eventType, value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="batched">Batched</SelectItem>
                          <SelectItem value="digest">Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.enabled}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.eventType, "enabled", checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
