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
      <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1 p-1">
        <TabsTrigger value="account" className="gap-1.5 px-3 py-2">
          <User className="size-4" />
          Konto
        </TabsTrigger>
        <TabsTrigger value="customize" className="gap-1.5 px-3 py-2">
          <Settings className="size-4" />
          Anpassa
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1.5 px-3 py-2">
          <Bell className="size-4" />
          Notiser
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-1.5 px-3 py-2">
          <Shield className="size-4" />
          Säkerhet & Data
        </TabsTrigger>
      </TabsList>

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
