import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Building2, Shield, Settings2, Bell, Database, Palette } from "lucide-react";

export default function SystemSettingsPage() {
  return (
    <div className="px-9 pt-9 pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure global system settings, security policies, and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Company Settings</CardTitle>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Organization information and branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure company details, branding, operating hours, and organizational structure.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/settings/company" className="flex items-center justify-between">
                Configure Company
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Security Settings</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Security policies and authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage password policies, session settings, two-factor authentication, and access control.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/settings/security" className="flex items-center justify-between">
                Configure Security
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Application Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Application Settings</CardTitle>
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              System configuration and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure email, backup, integrations, and application-wide features.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/settings/application" className="flex items-center justify-between">
                Configure Application
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Notification Settings</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Templates, routing, and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure notification templates, routing rules, escalation policies, and channel settings.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/settings/notifications" className="flex items-center justify-between">
                Configure Notifications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Backup & Data Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Backup & Data</CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Data retention and backup policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure automated backups, data retention policies, and archival settings.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/system-administration/settings/application#backup" className="flex items-center justify-between">
                Configure Backup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Appearance & Branding Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Appearance & Branding</CardTitle>
              <Palette className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Customize look and feel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload logos, set brand colors, and customize the application appearance.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/system-administration/settings/company#branding" className="flex items-center justify-between">
                Configure Branding
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground">
          For user-specific preferences like theme, language, and notifications, visit{" "}
          <Link href="/user-preferences" className="text-primary hover:underline">
            User Preferences
          </Link>
          {" "}from your avatar menu.
        </p>
      </div>
    </div>
  );
}
