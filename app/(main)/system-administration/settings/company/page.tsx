"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "@/lib/types";
import { mockCompanySettings } from "@/lib/mock-data";
import { Building2, Image as ImageIcon, Palette, Clock, MapPin, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AED", label: "AED - UAE Dirham" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Asia/Dubai", label: "Dubai" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export default function CompanySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    // TODO: Save to backend
    toast({
      title: "Settings Saved",
      description: "Company settings have been updated successfully.",
    });
  };

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleAddressChange = (field: keyof CompanySettings["address"], value: string) => {
    setSettings({
      ...settings,
      address: { ...settings.address, [field]: value },
    });
  };

  const handleLogoChange = (field: keyof CompanySettings["logo"], value: string) => {
    setSettings({
      ...settings,
      logo: { ...settings.logo, [field]: value },
    });
  };

  const handleOperatingHoursChange = (day: typeof DAYS[number], field: "open" | "start" | "end", value: any) => {
    setSettings({
      ...settings,
      operatingHours: {
        ...settings.operatingHours,
        [day]: {
          ...settings.operatingHours[day],
          [field]: value,
        },
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
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage organization information, branding, and operational settings
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            General Information
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="operational">
            <Clock className="h-4 w-4 mr-2" />
            Operational Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details and legal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal-name">Legal Name *</Label>
                  <Input
                    id="legal-name"
                    value={settings.legalName}
                    onChange={(e) => handleChange("legalName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={settings.taxId}
                    onChange={(e) => handleChange("taxId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration-number">Registration Number</Label>
                  <Input
                    id="registration-number"
                    value={settings.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Primary contact details for the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={settings.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={settings.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={settings.address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={settings.address.country}
                  onChange={(e) => handleAddressChange("country", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding Assets</CardTitle>
              <CardDescription>
                Upload and manage company logos and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL (Light Mode)</Label>
                <Input
                  id="logo-url"
                  value={settings.logo.url}
                  onChange={(e) => handleLogoChange("url", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 200x60px, PNG or SVG format
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-dark-url">Logo URL (Dark Mode)</Label>
                <Input
                  id="logo-dark-url"
                  value={settings.logo.darkUrl || ""}
                  onChange={(e) => handleLogoChange("darkUrl", e.target.value)}
                  placeholder="https://example.com/logo-dark.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon-url">Favicon URL</Label>
                <Input
                  id="favicon-url"
                  value={settings.logo.faviconUrl || ""}
                  onChange={(e) => handleLogoChange("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 32x32px, ICO or PNG format
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Define primary and secondary brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      placeholder="#000000"
                    />
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      placeholder="#000000"
                    />
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Defaults</CardTitle>
              <CardDescription>
                Set default currency, timezone, and language for the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onValueChange={(value) => handleChange("defaultCurrency", value)}
                  >
                    <SelectTrigger id="default-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <Select
                    value={settings.defaultTimezone}
                    onValueChange={(value) => handleChange("defaultTimezone", value)}
                  >
                    <SelectTrigger id="default-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => handleChange("defaultLanguage", value)}
                  >
                    <SelectTrigger id="default-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year Start (MM-DD)</Label>
                <Input
                  id="fiscal-year"
                  value={settings.fiscalYearStart}
                  onChange={(e) => handleChange("fiscalYearStart", e.target.value)}
                  placeholder="01-01"
                />
                <p className="text-sm text-muted-foreground">
                  Format: MM-DD (e.g., 01-01 for January 1st)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>
                Configure default business hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <Switch
                    checked={settings.operatingHours[day].open}
                    onCheckedChange={(checked) =>
                      handleOperatingHoursChange(day, "open", checked)
                    }
                  />
                  {settings.operatingHours[day].open && (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={settings.operatingHours[day].start}
                          onChange={(e) =>
                            handleOperatingHoursChange(day, "start", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={settings.operatingHours[day].end}
                          onChange={(e) =>
                            handleOperatingHoursChange(day, "end", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                  {!settings.operatingHours[day].open && (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizational Structure</CardTitle>
              <CardDescription>
                Enable or disable multi-location and multi-department features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="multi-location">Multi-Location Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable support for multiple business locations
                  </p>
                </div>
                <Switch
                  id="multi-location"
                  checked={settings.multiLocation}
                  onCheckedChange={(checked) => handleChange("multiLocation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="multi-department">Multi-Department Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable support for multiple departments
                  </p>
                </div>
                <Switch
                  id="multi-department"
                  checked={settings.multiDepartment}
                  onCheckedChange={(checked) => handleChange("multiDepartment", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
