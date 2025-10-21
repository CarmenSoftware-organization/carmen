"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { DisplaySettings as DisplaySettingsType, ThemeMode } from "@/lib/types";
import { mockUserPreferences } from "@/lib/mock-data";
import { Monitor, Sun, Moon, Laptop } from "lucide-react";

interface DisplaySettingsProps {
  userId: string;
}

export function DisplaySettings({ userId }: DisplaySettingsProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<DisplaySettingsType>(mockUserPreferences.display);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setSettings({ ...settings, theme: newTheme });
    setTheme(newTheme);
    // TODO: Save to backend
  };

  const handleFontSizeChange = (fontSize: string) => {
    setSettings({ ...settings, fontSize: fontSize as DisplaySettingsType["fontSize"] });
    // TODO: Save to backend
  };

  const handleToggle = (key: keyof DisplaySettingsType, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose your preferred color theme for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.theme}
            onValueChange={(value) => handleThemeChange(value as ThemeMode)}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="light"
                className="peer sr-only"
              />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="dark"
                id="dark"
                className="peer sr-only"
              />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="system"
                id="system"
                className="peer sr-only"
              />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>
            Adjust the text size throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium (Default)</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
          <CardDescription>
            Customize the visual appearance and behavior of the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleToggle("highContrast", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for a denser layout
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleToggle("compactMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Show Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch
              id="animations"
              checked={settings.showAnimations}
              onCheckedChange={(checked) => handleToggle("showAnimations", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-collapsed">Collapsed Sidebar by Default</Label>
              <p className="text-sm text-muted-foreground">
                Start with the sidebar minimized
              </p>
            </div>
            <Switch
              id="sidebar-collapsed"
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) => handleToggle("sidebarCollapsed", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
