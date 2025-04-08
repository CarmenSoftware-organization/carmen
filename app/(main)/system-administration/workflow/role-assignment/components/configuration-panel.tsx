'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleConfiguration } from "./role-configuration"
import { AssignedUsers } from "./assigned-users"

interface ConfigurationPanelProps {
  selectedRoleId: number | null
}

export function ConfigurationPanel({ selectedRoleId }: ConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState("role-configuration")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="role-configuration">Role Configuration</TabsTrigger>
        <TabsTrigger value="assigned-users">Assigned Users</TabsTrigger>
      </TabsList>
      <TabsContent value="role-configuration">
        <RoleConfiguration selectedRoleId={selectedRoleId} />
      </TabsContent>
      <TabsContent value="assigned-users">
        <AssignedUsers selectedRoleId={selectedRoleId} />
      </TabsContent>
    </Tabs>
  )
}