"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings, TwoFactorMethod, AuditEventType } from "@/lib/types";
import { mockSecuritySettings } from "@/lib/mock-data";
import { Shield, Lock, Key, AlertTriangle, ArrowLeft, Save, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>(mockSecuritySettings);
  const [activeTab, setActiveTab] = useState("password");

  const handleSave = () => {
    // TODO: Save to backend
    toast({
      title: "Security Settings Saved",
      description: "Security policies have been updated successfully.",
    });
  };

  const handlePasswordPolicyChange = (field: keyof SecuritySettings["passwordPolicy"], value: any) => {
    setSettings({
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        [field]: value,
      },
    });
  };

  const handleSessionSettingsChange = (field: keyof SecuritySettings["sessionSettings"], value: any) => {
    setSettings({
      ...settings,
      sessionSettings: {
        ...settings.sessionSettings,
        [field]: value,
      },
    });
  };

  const handleTwoFactorChange = (field: keyof SecuritySettings["twoFactor"], value: any) => {
    setSettings({
      ...settings,
      twoFactor: {
        ...settings.twoFactor,
        [field]: value,
      },
    });
  };

  const handleIPAccessChange = (field: keyof SecuritySettings["ipAccessControl"], value: any) => {
    setSettings({
      ...settings,
      ipAccessControl: {
        ...settings.ipAccessControl,
        [field]: value,
      },
    });
  };

  const handleLoginAttemptsChange = (field: keyof SecuritySettings["loginAttempts"], value: any) => {
    setSettings({
      ...settings,
      loginAttempts: {
        ...settings.loginAttempts,
        [field]: value,
      },
    });
  };

  const handleSecurityQuestionsChange = (field: keyof SecuritySettings["securityQuestions"], value: any) => {
    setSettings({
      ...settings,
      securityQuestions: {
        ...settings.securityQuestions,
        [field]: value,
      },
    });
  };

  const handleAuditLoggingChange = (field: keyof SecuritySettings["auditLogging"], value: any) => {
    setSettings({
      ...settings,
      auditLogging: {
        ...settings.auditLogging,
        [field]: value,
      },
    });
  };

  const handleDataEncryptionChange = (field: keyof SecuritySettings["dataEncryption"], value: any) => {
    setSettings({
      ...settings,
      dataEncryption: {
        ...settings.dataEncryption,
        [field]: value,
      },
    });
  };

  const getPasswordStrength = () => {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = settings.passwordPolicy;
    let strength = 0;
    if (minLength >= 12) strength += 2;
    else if (minLength >= 8) strength += 1;
    if (requireUppercase) strength += 1;
    if (requireLowercase) strength += 1;
    if (requireNumbers) strength += 1;
    if (requireSpecialChars) strength += 1;

    if (strength <= 2) return { label: "Weak", color: "destructive" };
    if (strength <= 4) return { label: "Medium", color: "warning" };
    return { label: "Strong", color: "success" };
  };

  const passwordStrength = getPasswordStrength();

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
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure security policies, authentication, and access control
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            Password Policy
          </TabsTrigger>
          <TabsTrigger value="authentication">
            <Key className="h-4 w-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Users className="h-4 w-4 mr-2" />
            Audit & Logging
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Password Requirements</CardTitle>
                  <CardDescription>
                    Configure password complexity and security requirements
                  </CardDescription>
                </div>
                <Badge variant={passwordStrength.color as any}>
                  {passwordStrength.label} Policy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min-length">Minimum Password Length: {settings.passwordPolicy.minLength}</Label>
                </div>
                <Slider
                  id="min-length"
                  value={[settings.passwordPolicy.minLength]}
                  onValueChange={([value]) => handlePasswordPolicyChange("minLength", value)}
                  min={6}
                  max={32}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: At least 12 characters
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                    <p className="text-sm text-muted-foreground">
                      At least one uppercase letter (A-Z)
                    </p>
                  </div>
                  <Switch
                    id="require-uppercase"
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => handlePasswordPolicyChange("requireUppercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-lowercase">Require Lowercase Letters</Label>
                    <p className="text-sm text-muted-foreground">
                      At least one lowercase letter (a-z)
                    </p>
                  </div>
                  <Switch
                    id="require-lowercase"
                    checked={settings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => handlePasswordPolicyChange("requireLowercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-numbers">Require Numbers</Label>
                    <p className="text-sm text-muted-foreground">
                      At least one numeric digit (0-9)
                    </p>
                  </div>
                  <Switch
                    id="require-numbers"
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => handlePasswordPolicyChange("requireNumbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-special">Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">
                      At least one special character (!@#$%^&*)
                    </p>
                  </div>
                  <Switch
                    id="require-special"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => handlePasswordPolicyChange("requireSpecialChars", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-expiry">Password Expiry (Days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={settings.passwordPolicy.expiryDays}
                    onChange={(e) => handlePasswordPolicyChange("expiryDays", parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    0 = Never expires
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-history">Password History</Label>
                  <Input
                    id="password-history"
                    type="number"
                    value={settings.passwordPolicy.historyCount}
                    onChange={(e) => handlePasswordPolicyChange("historyCount", parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Prevent reuse of last N passwords
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Configure multi-factor authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa-enabled">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to enable 2FA for their accounts
                  </p>
                </div>
                <Switch
                  id="2fa-enabled"
                  checked={settings.twoFactor.enabled}
                  onCheckedChange={(checked) => handleTwoFactorChange("enabled", checked)}
                />
              </div>

              {settings.twoFactor.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa-required">Require for All Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Make 2FA mandatory for all user accounts
                      </p>
                    </div>
                    <Switch
                      id="2fa-required"
                      checked={settings.twoFactor.required}
                      onCheckedChange={(checked) => handleTwoFactorChange("required", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed Methods</Label>
                    <div className="space-y-2">
                      {(["authenticator", "sms", "email"] as const).map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`method-${method}`}
                            checked={settings.twoFactor.methods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...settings.twoFactor.methods, method]
                                : settings.twoFactor.methods.filter((m: TwoFactorMethod) => m !== method);
                              handleTwoFactorChange("methods", methods);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`method-${method}`} className="capitalize font-normal">
                            {method === "authenticator" ? "Authenticator App" : method.toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="2fa-grace">Grace Period (Days)</Label>
                    <Input
                      id="2fa-grace"
                      type="number"
                      value={settings.twoFactor.gracePeriodDays}
                      onChange={(e) => handleTwoFactorChange("gracePeriodDays", parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of days before 2FA becomes mandatory
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Configure user session timeout and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (Minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionSettings.timeout}
                    onChange={(e) => handleSessionSettingsChange("timeout", parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
                  <Input
                    id="max-sessions"
                    type="number"
                    value={settings.sessionSettings.maxConcurrentSessions}
                    onChange={(e) => handleSessionSettingsChange("maxConcurrentSessions", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remember-me">Allow "Remember Me"</Label>
                  <p className="text-sm text-muted-foreground">
                    Let users stay logged in across browser sessions
                  </p>
                </div>
                <Switch
                  id="remember-me"
                  checked={settings.sessionSettings.rememberMe}
                  onCheckedChange={(checked) => handleSessionSettingsChange("rememberMe", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="absolute-timeout">Absolute Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Force logout after maximum session duration regardless of activity
                  </p>
                </div>
                <Switch
                  id="absolute-timeout"
                  checked={settings.sessionSettings.absoluteTimeout}
                  onCheckedChange={(checked) => handleSessionSettingsChange("absoluteTimeout", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Security</CardTitle>
              <CardDescription>
                Configure failed login attempt policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Failed Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={settings.loginAttempts.maxAttempts}
                    onChange={(e) => handleLoginAttemptsChange("maxAttempts", parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (Minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings.loginAttempts.lockoutDuration}
                    onChange={(e) => handleLoginAttemptsChange("lockoutDuration", parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-admin">Notify Administrator</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notification when account is locked
                  </p>
                </div>
                <Switch
                  id="notify-admin"
                  checked={settings.loginAttempts.notifyAdmin}
                  onCheckedChange={(checked) => handleLoginAttemptsChange("notifyAdmin", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IP Access Control</CardTitle>
              <CardDescription>
                Restrict access based on IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ip-enabled">Enable IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">
                    Only allow access from specified IP addresses
                  </p>
                </div>
                <Switch
                  id="ip-enabled"
                  checked={settings.ipAccessControl.enabled}
                  onCheckedChange={(checked) => handleIPAccessChange("enabled", checked)}
                />
              </div>

              {settings.ipAccessControl.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="whitelist">Whitelisted IP Addresses</Label>
                  <Input
                    id="whitelist"
                    placeholder="192.168.1.0/24, 10.0.0.1"
                    value={settings.ipAccessControl.whitelist.join(", ")}
                    onChange={(e) =>
                      handleIPAccessChange(
                        "whitelist",
                        e.target.value.split(",").map((ip) => ip.trim())
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated list of IP addresses or CIDR ranges
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Questions</CardTitle>
              <CardDescription>
                Configure security question requirements for password recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sq-enabled">Enable Security Questions</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to set up security questions
                  </p>
                </div>
                <Switch
                  id="sq-enabled"
                  checked={settings.securityQuestions.enabled}
                  onCheckedChange={(checked) => handleSecurityQuestionsChange("enabled", checked)}
                />
              </div>

              {settings.securityQuestions.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="min-questions">Minimum Questions Required</Label>
                  <Input
                    id="min-questions"
                    type="number"
                    value={settings.securityQuestions.minRequired}
                    onChange={(e) =>
                      handleSecurityQuestionsChange("minRequired", parseInt(e.target.value))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logging</CardTitle>
              <CardDescription>
                Configure system audit and activity logging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="audit-enabled">Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all user actions and system events
                  </p>
                </div>
                <Switch
                  id="audit-enabled"
                  checked={settings.auditLogging.enabled}
                  onCheckedChange={(checked) => handleAuditLoggingChange("enabled", checked)}
                />
              </div>

              {settings.auditLogging.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="retention">Log Retention Period (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={settings.auditLogging.retentionDays}
                      onChange={(e) =>
                        handleAuditLoggingChange("retentionDays", parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Events to Log</Label>
                    <div className="space-y-2">
                      {(["login", "logout", "dataAccess", "dataModification", "settingsChange"] as const).map(
                        (event) => (
                          <div key={event} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`event-${event}`}
                              checked={settings.auditLogging.events.includes(event)}
                              onChange={(e) => {
                                const events = e.target.checked
                                  ? [...settings.auditLogging.events, event]
                                  : settings.auditLogging.events.filter((ev: AuditEventType) => ev !== event);
                                handleAuditLoggingChange("events", events);
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`event-${event}`} className="capitalize font-normal">
                              {event.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Encryption</CardTitle>
              <CardDescription>
                Configure data encryption settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="encrypt-at-rest">Encrypt Data at Rest</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable encryption for stored data
                  </p>
                </div>
                <Switch
                  id="encrypt-at-rest"
                  checked={settings.dataEncryption.atRest}
                  onCheckedChange={(checked) => handleDataEncryptionChange("atRest", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="encrypt-in-transit">Encrypt Data in Transit</Label>
                  <p className="text-sm text-muted-foreground">
                    Require HTTPS/TLS for all communications
                  </p>
                </div>
                <Switch
                  id="encrypt-in-transit"
                  checked={settings.dataEncryption.inTransit}
                  onCheckedChange={(checked) => handleDataEncryptionChange("inTransit", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="algorithm">Encryption Algorithm</Label>
                <Select
                  value={settings.dataEncryption.algorithm}
                  onValueChange={(value) => handleDataEncryptionChange("algorithm", value)}
                >
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256 (Recommended)</SelectItem>
                    <SelectItem value="AES-128">AES-128</SelectItem>
                    <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Security Warning</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              Changes to security settings may affect all users. Ensure you understand the implications
              before saving. Consider testing changes in a non-production environment first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
