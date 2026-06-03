"use client";

import { User, Settings, Bell, Shield } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SettingsTabsProps {
  account: React.ReactNode;
  customize: React.ReactNode;
  notifications: React.ReactNode;
  security: React.ReactNode;
}

export function SettingsTabs({
  account,
  customize,
  notifications,
  security,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="account" className="w-full">
      <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-1 p-1 sm:min-w-0 sm:w-full">
          <TabsTrigger
            value="account"
            className="shrink-0 gap-1.5 px-2 py-2 text-xs sm:px-3 sm:text-sm"
          >
            <User className="hidden size-4 sm:inline" />
            Konto
          </TabsTrigger>
          <TabsTrigger
            value="customize"
            className="shrink-0 gap-1.5 px-2 py-2 text-xs sm:px-3 sm:text-sm"
          >
            <Settings className="hidden size-4 sm:inline" />
            Anpassa
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="shrink-0 gap-1.5 px-2 py-2 text-xs sm:px-3 sm:text-sm"
          >
            <Bell className="hidden size-4 sm:inline" />
            Notiser
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="shrink-0 gap-1.5 px-2 py-2 text-xs sm:px-3 sm:text-sm"
          >
            <Shield className="hidden size-4 sm:inline" />
            Säkerhet & Data
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account" className="space-y-6">
        {account}
      </TabsContent>
      <TabsContent value="customize" className="space-y-6">
        {customize}
      </TabsContent>
      <TabsContent value="notifications" className="space-y-6">
        {notifications}
      </TabsContent>
      <TabsContent value="security" className="space-y-6">
        {security}
      </TabsContent>
    </Tabs>
  );
}
