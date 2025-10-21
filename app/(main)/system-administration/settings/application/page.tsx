"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationSettings } from "@/lib/types";
import { mockApplicationSettings } from "@/lib/mock-data";
import { Mail, Database, Zap, Settings2, ArrowLeft, Save, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ApplicationSettings>(mockApplicationSettings);
  const [activeTab, setActiveTab] = useState("email");

  const handleSave = () => {
    // TODO: Save to backend
    toast({
      title: "Application Settings Saved",
      description: "Application configuration has been updated successfully.",
    });
  };

  const handleEmailChange = (field: keyof ApplicationSettings["email"], value: any) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [field]: value,
      },
    });
  };

  const handleBackupChange = (field: keyof ApplicationSettings["backup"], value: any) => {
    setSettings({
      ...settings,
      backup: {
        ...settings.backup,
        [field]: value,
      },
    });
  };

  const handleDataRetentionChange = (field: keyof ApplicationSettings["dataRetention"], value: any) => {
    setSettings({
      ...settings,
      dataRetention: {
        ...settings.dataRetention,
        [field]: value,
      },
    });
  };

  const handleIntegrationsChange = (field: keyof ApplicationSettings["integrations"], value: any) => {
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        [field]: value,
      },
    });
  };

  const handleFeaturesChange = (field: keyof ApplicationSettings["features"], value: any) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [field]: value,
      },
    });
  };

  const handlePerformanceChange = (field: keyof ApplicationSettings["performance"], value: any) => {
    setSettings({
      ...settings,
      performance: {
        ...settings.performance,
        [field]: value,
      },
    });
  };

  return (
    <div className="px-9 pt-9 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/system-administration/settings")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold">Application Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure email, backup, integrations, and system features
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Configuration
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backup & Recovery
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Zap className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings2 className="h-4 w-4 mr-2" />
            Features & Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6" id="email">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure email server settings for sending notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-provider">Email Provider</Label>
                <Select
                  value={settings.email.provider}
                  onValueChange={(value) => handleEmailChange("provider", value)}
                >
                  <SelectTrigger id="email-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.email.provider === "smtp" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={settings.email.smtpHost}
                        onChange={(e) => handleEmailChange("smtpHost", e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => handleEmailChange("smtpPort", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input
                        id="smtp-user"
                        value={settings.email.smtpUser}
                        onChange={(e) => handleEmailChange("smtpUser", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">SMTP Password</Label>
                      <Input
                        id="smtp-pass"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => handleEmailChange("smtpPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smtp-secure">Use Secure Connection (TLS/SSL)</Label>
                      <p className="text-sm text-muted-foreground">
                        Encrypt email transmission
                      </p>
                    </div>
                    <Switch
                      id="smtp-secure"
                      checked={settings.email.smtpSecure}
                      onCheckedChange={(checked) => handleEmailChange("smtpSecure", checked)}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleEmailChange("fromEmail", e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={settings.email.fromName}
                    onChange={(e) => handleEmailChange("fromName", e.target.value)}
                    placeholder="CARMEN System"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-To Email</Label>
                <Input
                  id="reply-to"
                  type="email"
                  value={settings.email.replyTo || ""}
                  onChange={(e) => handleEmailChange("replyTo", e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" size="sm">
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize email notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Email templates can be customized to match your brand. Templates support variables
                and localization.
              </p>
              <Button variant="outline">
                Manage Email Templates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6" id="backup">
          <Card>
            <CardHeader>
              <CardTitle>Automated Backup</CardTitle>
              <CardDescription>
                Configure automated backup schedule and retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="backup-enabled">Enable Automated Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup system data on a schedule
                  </p>
                </div>
                <Switch
                  id="backup-enabled"
                  checked={settings.backup.enabled}
                  onCheckedChange={(checked) => handleBackupChange("enabled", checked)}
                />
              </div>

              {settings.backup.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Select
                        value={settings.backup.frequency}
                        onValueChange={(value) => handleBackupChange("frequency", value)}
                      >
                        <SelectTrigger id="backup-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backup-retention">Retention Period (Days)</Label>
                      <Input
                        id="backup-retention"
                        type="number"
                        value={settings.backup.retentionDays}
                        onChange={(e) =>
                          handleBackupChange("retentionDays", parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-location">Backup Location</Label>
                    <Select
                      value={settings.backup.location}
                      onValueChange={(value) => handleBackupChange("location", value)}
                    >
                      <SelectTrigger id="backup-location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="backup-compress">Compress Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce backup file size
                      </p>
                    </div>
                    <Switch
                      id="backup-compress"
                      checked={settings.backup.compress}
                      onCheckedChange={(checked) => handleBackupChange("compress", checked)}
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
                <Button variant="outline" size="sm">
                  View Backup History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
              <CardDescription>
                Configure how long different types of data are kept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactions-retention">Transaction Data (Days)</Label>
                  <Input
                    id="transactions-retention"
                    type="number"
                    value={settings.dataRetention.transactionData}
                    onChange={(e) =>
                      handleDataRetentionChange("transactionData", parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-retention">Audit Logs (Days)</Label>
                  <Input
                    id="audit-retention"
                    type="number"
                    value={settings.dataRetention.auditLogs}
                    onChange={(e) =>
                      handleDataRetentionChange("auditLogs", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="archive-retention">Archived Data (Days)</Label>
                  <Input
                    id="archive-retention"
                    type="number"
                    value={settings.dataRetention.archivedData}
                    onChange={(e) =>
                      handleDataRetentionChange("archivedData", parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleted-retention">Deleted Records (Days)</Label>
                  <Input
                    id="deleted-retention"
                    type="number"
                    value={settings.dataRetention.deletedRecords}
                    onChange={(e) =>
                      handleDataRetentionChange("deletedRecords", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External System Integrations</CardTitle>
              <CardDescription>
                Configure connections to external systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pos-system">POS System</Label>
                <Input
                  id="pos-system"
                  value={settings.integrations.posSystem || ""}
                  onChange={(e) => handleIntegrationsChange("posSystem", e.target.value)}
                  placeholder="Oracle Micros, Toast, Square, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="erp-system">ERP System</Label>
                <Input
                  id="erp-system"
                  value={settings.integrations.erpSystem || ""}
                  onChange={(e) => handleIntegrationsChange("erpSystem", e.target.value)}
                  placeholder="SAP, Oracle, NetSuite, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accounting-system">Accounting System</Label>
                <Input
                  id="accounting-system"
                  value={settings.integrations.accountingSystem || ""}
                  onChange={(e) => handleIntegrationsChange("accountingSystem", e.target.value)}
                  placeholder="QuickBooks, Xero, etc."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Manage API keys and access tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                API keys allow external systems to integrate with CARMEN. Keep these keys secure
                and rotate them regularly.
              </p>
              <Button variant="outline">
                Manage API Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable specific system features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="advanced-analytics">Advanced Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable advanced reporting and analytics features
                  </p>
                </div>
                <Switch
                  id="advanced-analytics"
                  checked={settings.features.advancedAnalytics}
                  onCheckedChange={(checked) => handleFeaturesChange("advancedAnalytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mobile-app">Mobile Application</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable mobile app access and features
                  </p>
                </div>
                <Switch
                  id="mobile-app"
                  checked={settings.features.mobileApp}
                  onCheckedChange={(checked) => handleFeaturesChange("mobileApp", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="api-access">API Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow external API integrations
                  </p>
                </div>
                <Switch
                  id="api-access"
                  checked={settings.features.apiAccess}
                  onCheckedChange={(checked) => handleFeaturesChange("apiAccess", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vendor-portal">Vendor Portal</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable vendor self-service portal
                  </p>
                </div>
                <Switch
                  id="vendor-portal"
                  checked={settings.features.vendorPortal}
                  onCheckedChange={(checked) => handleFeaturesChange("vendorPortal", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Configure caching and performance optimizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-caching">Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache frequently accessed data for better performance
                  </p>
                </div>
                <Switch
                  id="enable-caching"
                  checked={settings.performance.enableCaching}
                  onCheckedChange={(checked) => handlePerformanceChange("enableCaching", checked)}
                />
              </div>

              {settings.performance.enableCaching && (
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (Seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    value={settings.performance.cacheTTL}
                    onChange={(e) =>
                      handlePerformanceChange("cacheTTL", parseInt(e.target.value))
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">API Rate Limit (Requests/Minute)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  value={settings.performance.apiRateLimit}
                  onChange={(e) =>
                    handlePerformanceChange("apiRateLimit", parseInt(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
