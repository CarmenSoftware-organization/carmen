"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, FileText, Settings, GitBranch, History, TestTube } from "lucide-react";

// Tab components (to be implemented)
import { GlobalDefaultsTab } from "./components/global-defaults-tab";
import { EmailTemplatesTab } from "./components/email-templates-tab";
import { DeliverySettingsTab } from "./components/delivery-settings-tab";
import { RoutingRulesTab } from "./components/routing-rules-tab";
import { NotificationHistoryTab } from "./components/notification-history-tab";
import { TestingTab } from "./components/testing-tab";

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState("defaults");

  return (
    <div className="px-9 pt-9 pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage organization-wide notification preferences, templates, routing rules, and delivery settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="defaults" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Defaults</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Routing</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-4">
          <GlobalDefaultsTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <EmailTemplatesTab />
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <DeliverySettingsTab />
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <RoutingRulesTab />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <NotificationHistoryTab />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <TestingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
