'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ChevronRight, Settings, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

interface SettingsNavProps {
  activeTab?: "config" | "system"
}

export function SettingsNav({ activeTab }: SettingsNavProps) {
  const pathname = usePathname()
  const basePath = "/system-administration/system-integrations/pos"
  
  return (
    <div className="mb-6 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/procurement">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/system-administration">System Administration</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/system-administration/system-integrations">Integrations</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={basePath}>POS Integration</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex space-x-1 border-b">
        <Link href={`${basePath}/settings/config`} passHref>
          <Button 
            variant={activeTab === "config" ? "default" : "ghost"} 
            className={cn(
              "rounded-none border-b-2 border-transparent pb-2.5 pt-2", 
              activeTab === "config" && "border-primary"
            )}
            aria-current={activeTab === "config" ? "page" : undefined}
          >
            <Settings className="mr-2 h-4 w-4" />
            POS Configuration
          </Button>
        </Link>
        <Link href={`${basePath}/settings/system`} passHref>
          <Button 
            variant={activeTab === "system" ? "default" : "ghost"} 
            className={cn(
              "rounded-none border-b-2 border-transparent pb-2.5 pt-2", 
              activeTab === "system" && "border-primary"
            )}
            aria-current={activeTab === "system" ? "page" : undefined}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        </Link>
      </div>
    </div>
  )
} 