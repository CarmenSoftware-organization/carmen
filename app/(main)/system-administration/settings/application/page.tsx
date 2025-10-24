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
                        value={settings.email.smtp.host}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtp: { ...settings.email.smtp, host: e.target.value }
                          }
                        })}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings.email.smtp.port}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtp: { ...settings.email.smtp, port: parseInt(e.target.value) }
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input
                        id="smtp-user"
                        value={settings.email.smtp.username}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtp: { ...settings.email.smtp, username: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">SMTP Password</Label>
                      <Input
                        id="smtp-pass"
                        type="password"
                        value={settings.email.smtp.password}
                        onChange={(e) => setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtp: { ...settings.email.smtp, password: e.target.value }
                          }
                        })}
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
                      checked={settings.email.smtp.secure}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        email: {
                          ...settings.email,
                          smtp: { ...settings.email.smtp, secure: checked }
                        }
                      })}
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
                  value={settings.email.replyToEmail}
                  onChange={(e) => handleEmailChange("replyToEmail", e.target.value)}
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
                        value={settings.backup.schedule.frequency}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          backup: {
                            ...settings.backup,
                            schedule: { ...settings.backup.schedule, frequency: value as 'hourly' | 'daily' | 'weekly' | 'monthly' }
                          }
                        })}
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
                      <Label htmlFor="backup-retention">Daily Retention (Days)</Label>
                      <Input
                        id="backup-retention"
                        type="number"
                        value={settings.backup.retention.keepDaily}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: {
                            ...settings.backup,
                            retention: { ...settings.backup.retention, keepDaily: parseInt(e.target.value) }
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-location">Backup Location</Label>
                    <Select
                      value={settings.backup.storage.type}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        backup: {
                          ...settings.backup,
                          storage: { ...settings.backup.storage, type: value as 'local' | 's3' | 'azure' | 'gcp' }
                        }
                      })}
                    >
                      <SelectTrigger id="backup-location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        <SelectItem value="gcp">Google Cloud Storage</SelectItem>
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
                      checked={settings.backup.compressionEnabled}
                      onCheckedChange={(checked) => handleBackupChange("compressionEnabled", checked)}
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
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase-requests-retention">Purchase Requests (Days)</Label>
                      <Input
                        id="purchase-requests-retention"
                        type="number"
                        value={settings.dataRetention.documents.purchaseRequests}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            documents: {
                              ...settings.dataRetention.documents,
                              purchaseRequests: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase-orders-retention">Purchase Orders (Days)</Label>
                      <Input
                        id="purchase-orders-retention"
                        type="number"
                        value={settings.dataRetention.documents.purchaseOrders}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            documents: {
                              ...settings.dataRetention.documents,
                              purchaseOrders: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Logs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audit-retention">Audit Logs (Days)</Label>
                      <Input
                        id="audit-retention"
                        type="number"
                        value={settings.dataRetention.logs.auditLogs}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            logs: {
                              ...settings.dataRetention.logs,
                              auditLogs: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="system-logs-retention">System Logs (Days)</Label>
                      <Input
                        id="system-logs-retention"
                        type="number"
                        value={settings.dataRetention.logs.systemLogs}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            logs: {
                              ...settings.dataRetention.logs,
                              systemLogs: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Archived Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="auto-archive">Auto-Archive After (Days)</Label>
                      <Input
                        id="auto-archive"
                        type="number"
                        value={settings.dataRetention.archived.autoArchiveAfter}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            archived: {
                              ...settings.dataRetention.archived,
                              autoArchiveAfter: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delete-archived">Delete Archived After (Days)</Label>
                      <Input
                        id="delete-archived"
                        type="number"
                        value={settings.dataRetention.archived.deleteArchivedAfter}
                        onChange={(e) => setSettings({
                          ...settings,
                          dataRetention: {
                            ...settings.dataRetention,
                            archived: {
                              ...settings.dataRetention.archived,
                              deleteArchivedAfter: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.integrations.thirdParty.posSystem.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        thirdParty: {
                          ...settings.integrations.thirdParty,
                          posSystem: {
                            ...settings.integrations.thirdParty.posSystem,
                            enabled: checked
                          }
                        }
                      }
                    })}
                  />
                  <Input
                    id="pos-system"
                    value={settings.integrations.thirdParty.posSystem.provider}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        thirdParty: {
                          ...settings.integrations.thirdParty,
                          posSystem: {
                            ...settings.integrations.thirdParty.posSystem,
                            provider: e.target.value
                          }
                        }
                      }
                    })}
                    placeholder="Oracle Micros, Toast, Square, etc."
                    disabled={!settings.integrations.thirdParty.posSystem.enabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accounting-system">Accounting System</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.integrations.thirdParty.accounting.enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        thirdParty: {
                          ...settings.integrations.thirdParty,
                          accounting: {
                            ...settings.integrations.thirdParty.accounting,
                            enabled: checked
                          }
                        }
                      }
                    })}
                  />
                  <Input
                    id="accounting-system"
                    value={settings.integrations.thirdParty.accounting.provider}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        thirdParty: {
                          ...settings.integrations.thirdParty,
                          accounting: {
                            ...settings.integrations.thirdParty.accounting,
                            provider: e.target.value
                          }
                        }
                      }
                    })}
                    placeholder="QuickBooks, Xero, etc."
                    disabled={!settings.integrations.thirdParty.accounting.enabled}
                  />
                </div>
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
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable system maintenance mode
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.features.maintenanceMode}
                  onCheckedChange={(checked) => handleFeaturesChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration-enabled">User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new user registration
                  </p>
                </div>
                <Switch
                  id="registration-enabled"
                  checked={settings.features.registrationEnabled}
                  onCheckedChange={(checked) => handleFeaturesChange("registrationEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="guest-access">Guest Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow guest access to the system
                  </p>
                </div>
                <Switch
                  id="guest-access"
                  checked={settings.features.guestAccessEnabled}
                  onCheckedChange={(checked) => handleFeaturesChange("guestAccessEnabled", checked)}
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
                  checked={settings.features.apiAccessEnabled}
                  onCheckedChange={(checked) => handleFeaturesChange("apiAccessEnabled", checked)}
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
                  checked={settings.performance.cacheEnabled}
                  onCheckedChange={(checked) => handlePerformanceChange("cacheEnabled", checked)}
                />
              </div>

              {settings.performance.cacheEnabled && (
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
                <Label htmlFor="session-storage">Session Storage</Label>
                <Select
                  value={settings.performance.sessionStorage}
                  onValueChange={(value) => handlePerformanceChange("sessionStorage", value)}
                >
                  <SelectTrigger id="session-storage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memory">Memory</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compression">Enable Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Compress responses for better performance
                  </p>
                </div>
                <Switch
                  id="compression"
                  checked={settings.performance.compressionEnabled}
                  onCheckedChange={(checked) => handlePerformanceChange("compressionEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
