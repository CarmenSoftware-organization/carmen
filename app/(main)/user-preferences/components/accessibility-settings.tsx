"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { mockUserPreferences } from "@/lib/mock-data";

interface AccessibilitySettingsProps {
  userId: string;
}

interface AccessibilityState {
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  highContrastText: boolean;
  largerClickTargets: boolean;
  focusIndicators: boolean;
  textToSpeech: boolean;
  voiceCommands: boolean;
}

export function AccessibilitySettings({ userId }: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState<AccessibilityState>({
    screenReader: mockUserPreferences.accessibility?.screenReaderOptimized || false,
    keyboardNavigation: mockUserPreferences.accessibility?.keyboardNavigationHints || true,
    reducedMotion: mockUserPreferences.accessibility?.reduceMotion || false,
    highContrastText: false, // Not in AccessibilitySettings type, using local state only
    largerClickTargets: false, // Not in AccessibilitySettings type, using local state only
    focusIndicators: mockUserPreferences.accessibility?.focusIndicatorEnhanced || true,
    textToSpeech: false,
    voiceCommands: false,
  });

  const handleToggle = (key: keyof AccessibilityState, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Save to backend
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visual Accessibility</CardTitle>
          <CardDescription>
            Customize visual elements for better readability and visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast-text">High Contrast Text</Label>
              <p className="text-sm text-muted-foreground">
                Increase text contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast-text"
              checked={settings.highContrastText}
              onCheckedChange={(checked) => handleToggle("highContrastText", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="larger-click-targets">Larger Click Targets</Label>
              <p className="text-sm text-muted-foreground">
                Make buttons and interactive elements larger
              </p>
            </div>
            <Switch
              id="larger-click-targets"
              checked={settings.largerClickTargets}
              onCheckedChange={(checked) => handleToggle("largerClickTargets", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">
                Show prominent outlines on focused elements
              </p>
            </div>
            <Switch
              id="focus-indicators"
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => handleToggle("focusIndicators", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleToggle("reducedMotion", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Assistance</CardTitle>
          <CardDescription>
            Configure assistive technologies and navigation aids
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Optimize interface for screen reader users
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={(checked) => handleToggle("screenReader", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-navigation">Enhanced Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard shortcuts and focus management
              </p>
            </div>
            <Switch
              id="keyboard-navigation"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => handleToggle("keyboardNavigation", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text-to-speech">Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">
                Read out content on demand
              </p>
            </div>
            <Switch
              id="text-to-speech"
              checked={settings.textToSpeech}
              onCheckedChange={(checked) => handleToggle("textToSpeech", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-commands">Voice Commands</Label>
              <p className="text-sm text-muted-foreground">
                Control the application using voice
              </p>
            </div>
            <Switch
              id="voice-commands"
              checked={settings.voiceCommands}
              onCheckedChange={(checked) => handleToggle("voiceCommands", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Common keyboard shortcuts for navigating the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Navigate between sections</span>
              <kbd className="px-2 py-1 bg-muted rounded">Tab</kbd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Open search</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-muted rounded">K</kbd>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Open notifications</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-muted rounded">N</kbd>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Go to dashboard</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-muted rounded">H</kbd>
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Toggle sidebar</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-muted rounded">B</kbd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Resources</CardTitle>
          <CardDescription>
            Learn more about accessibility features and support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              CARMEN is committed to providing an accessible experience for all users.
              If you encounter any accessibility issues or have suggestions for improvement,
              please contact our support team.
            </p>
            <div className="mt-4 space-y-1">
              <p className="font-medium">Accessibility Support:</p>
              <p className="text-muted-foreground">Email: accessibility@carmen.com</p>
              <p className="text-muted-foreground">Phone: 1-800-CARMEN-A11Y</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
