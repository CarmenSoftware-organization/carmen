"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegionalSettings as RegionalSettingsType, Language } from "@/lib/types";
import { mockUserPreferences } from "@/lib/mock-data";

interface RegionalSettingsProps {
  userId: string;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "zh", label: "中文 (Chinese)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "it", label: "Italiano (Italian)" },
  { value: "ru", label: "Русский (Russian)" },
  { value: "ko", label: "한국어 (Korean)" },
  { value: "ar", label: "العربية (Arabic)" },
];

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "AED", label: "AED - UAE Dirham" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (31 Dec 2024)" },
];

const TIME_FORMATS = [
  { value: "12h", label: "12-hour (3:30 PM)" },
  { value: "24h", label: "24-hour (15:30)" },
];

const NUMBER_FORMATS = [
  { value: "en-US", label: "1,234.56 (US)" },
  { value: "de-DE", label: "1.234,56 (European)" },
  { value: "fr-FR", label: "1 234,56 (French)" },
];

export function RegionalSettings({ userId }: RegionalSettingsProps) {
  const [settings, setSettings] = useState<RegionalSettingsType>(mockUserPreferences.regional);

  const handleChange = (key: keyof RegionalSettingsType, value: any) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>
            Set your preferred language and regional formatting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Display Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleChange("language", value as Language)}
            >
              <SelectTrigger id="language">
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
            <p className="text-sm text-muted-foreground">
              The language used throughout the application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => handleChange("timezone", value)}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              All dates and times will be displayed in this timezone
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger id="currency">
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
            <p className="text-sm text-muted-foreground">
              Your preferred currency for monetary values
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formatting</CardTitle>
          <CardDescription>
            Customize how dates, times, and numbers are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => handleChange("dateFormat", value)}
            >
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-format">Time Format</Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value) => handleChange("timeFormat", value)}
            >
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number-format">Number Format</Label>
            <Select
              value={settings.numberFormat}
              onValueChange={(value) => handleChange("numberFormat", value)}
            >
              <SelectTrigger id="number-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="first-day">First Day of Week</Label>
            <Select
              value={settings.firstDayOfWeek}
              onValueChange={(value) => handleChange("firstDayOfWeek", value)}
            >
              <SelectTrigger id="first-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
