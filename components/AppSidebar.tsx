"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Store, 
  CalendarClock, 
  Factory, 
  BarChart2, 
  DollarSign, 
  Settings, 
  HelpCircle, 
  ShoppingBag,
  Search
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Enhanced menu structure with proper typing
interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  items?: SubMenuItem[]
}

interface SubMenuItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  items?: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

const menuData: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Procurement",
    url: "/procurement",
    icon: ShoppingCart,
    items: [
      { title: "My Approvals", url: "/procurement/my-approvals" },
      { title: "Purchase Requests", url: "/procurement/purchase-requests" },
      { title: "Purchase Orders", url: "/procurement/purchase-orders" },
      { title: "Goods Received Note", url: "/procurement/goods-received-note" },
      { title: "Credit Notes", url: "/procurement/credit-note" },
      { title: "Purchase Request Templates", url: "/procurement/purchase-request-templates" },
    ],
  },
  {
    title: "Product Management",
    url: "/product-management",
    icon: Package,
    items: [
      { title: "Products", url: "/product-management/products" },
      { title: "Categories", url: "/product-management/categories" },
      { title: "Units", url: "/product-management/units" },
      { title: "Reports", url: "/product-management/reports" },
    ],
  },
  {
    title: "Vendor Management",
    url: "/vendor-management",
    icon: Users,
    items: [
      { 
        title: "Vendor Directory", 
        url: "/vendor-management/manage-vendors",
        description: "Manage vendor profiles and relationships"
      },
      { 
        title: "Pricelist Templates", 
        url: "/vendor-management/templates",
        description: "Create and manage pricing templates"
      },
      { 
        title: "Requests for Pricing", 
        url: "/vendor-management/campaigns",
        description: "Send pricing requests to vendors"
      },
      { 
        title: "Price Lists", 
        url: "/vendor-management/pricelists",
        description: "View and manage vendor pricelists"
      },
    ],
  },
  {
    title: "System Administration",
    url: "/system-administration",
    icon: Settings,
    items: [
      { title: "User Management", url: "/system-administration/user-management" },
      { title: "Location Management", url: "/system-administration/location-management" },
      { 
        title: "Permission Management", 
        url: "/system-administration/permission-management",
        description: "Manage policies, roles, and access control",
        items: [
          { 
            title: "Policy Management", 
            url: "/system-administration/permission-management/policies",
          },
          { 
            title: "Role Management", 
            url: "/system-administration/permission-management/roles",
          },
          { 
            title: "Subscription Settings", 
            url: "/system-administration/permission-management/subscription",
          }
        ]
      },
      { title: "General Settings", url: "/system-administration/settings" },
    ],
  },
]

// Search form component
function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search menu..."
            className="pl-8"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Package className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Carmen ERP</span>
            <span className="truncate text-xs">Hospitality Management</span>
          </div>
        </div>
        <SearchForm />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Core Operations */}
        <SidebarGroup>
          <SidebarGroupLabel>Core Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.slice(0, 4).map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                
                if (!item.items) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubActive = pathname === subItem.url
                            
                            if (!subItem.items) {
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            }

                            return (
                              <Collapsible
                                key={subItem.title}
                                asChild
                                defaultOpen={pathname.startsWith(subItem.url)}
                              >
                                <SidebarMenuSubItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton>
                                      <span>{subItem.title}</span>
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {subItem.items.map((subSubItem) => (
                                        <SidebarMenuSubItem key={subSubItem.title}>
                                          <SidebarMenuSubButton asChild isActive={pathname === subSubItem.url}>
                                            <Link href={subSubItem.url}>
                                              <span>{subSubItem.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuSubItem>
                              </Collapsible>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration */}
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.slice(4).map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                
                if (!item.items) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubActive = pathname === subItem.url
                            
                            if (!subItem.items) {
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            }

                            return (
                              <Collapsible
                                key={subItem.title}
                                asChild
                                defaultOpen={pathname.startsWith(subItem.url)}
                              >
                                <SidebarMenuSubItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton>
                                      <span>{subItem.title}</span>
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {subItem.items.map((subSubItem) => (
                                        <SidebarMenuSubItem key={subSubItem.title}>
                                          <SidebarMenuSubButton asChild isActive={pathname === subSubItem.url}>
                                            <Link href={subSubItem.url}>
                                              <span>{subSubItem.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuSubItem>
                              </Collapsible>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}