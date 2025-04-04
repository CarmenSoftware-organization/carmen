"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Menu, LayoutDashboard, Terminal, Settings } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  subItems: Array<SubMenuItem>;
}

interface SubMenuItem {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  subItems?: Array<{
    name: string;
    path: string;
    icon?: string;
    description?: string;
    subItems?: Array<{
      name: string;
      path: string;
      icon?: string;
      description?: string;
    }>;
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    subItems: [],
  },
  {
    title: "Procurement",
    path: "/procurement",
    icon: "ShoppingCart",
    subItems: [
      { name: "Dashboard", path: "/procurement/dashboard" },
      { name: "My Approvals", path: "/procurement/my-approvals" },
      { name: "Purchase Requests", path: "/procurement/purchase-requests" },
      { name: "Purchase Orders", path: "/procurement/purchase-orders" },
      { name: "Goods Received Note", path: "/procurement/goods-received-note" },
      { name: "Credit Notes", path: "/procurement/credit-note" },
      { name: "Purchase Request Templates", path: "/procurement/purchase-request-templates" },
    ],
  },
  {
    title: "Product Management",
    path: "/product-management",
    icon: "Package",
    subItems: [
      { name: "Dashboard", path: "/product-management/dashboard" },
      { name: "Products", path: "/product-management/products" },
      { name: "Categories", path: "/product-management/categories" },
      { name: "Units", path: "/product-management/units" },
      { name: "Reports", path: "/product-management/reports" },
    ],
  },
  {
    title: "Vendor Management",
    path: "/vendor-management",
    icon: "Users",
    subItems: [
      { name: "Dashboard", path: "/vendor-management/dashboard" },
      { name: "Manage Vendors", path: "/vendor-management/manage-vendors" },
      { name: "Price Lists", path: "/vendor-management/price-lists" },
      { name: "Price Comparisons", path: "/vendor-management/price-comparisons" },
    ],
  },
  {
    title: "Store Operations",
    path: "/store-operations",
    icon: "Store",
    subItems: [
      { name: "Dashboard", path: "/store-operations/dashboard" },
      { name: "Store Requisitions", path: "/store-operations/store-requisitions" },
      { name: "Stock Replenishment", path: "/store-operations/stock-replenishment" },
      { name: "Wastage Reporting", path: "/store-operations/wastage-reporting" },
    ],
  },
  {
    title: "POS Operations",
    path: "/pos-operations",
    icon: "Terminal",
    subItems: [
      { name: "Interface Posting", path: "/pos-operations/interface-posting" },
      { name: "Consumptions", path: "/pos-operations/consumptions" },
      { name: "Transactions", path: "/pos-operations/transactions" },
      { 
        name: "Mapping", 
        path: "/pos-operations/mapping",
        subItems: [
          { name: "Recipe Mapping", path: "/pos-operations/mapping/recipes" },
          { name: "Unit Mapping", path: "/pos-operations/mapping/units" },
          { name: "Location Mapping", path: "/pos-operations/mapping/locations" }
        ]
      },
      { name: "Reports", path: "/pos-operations/reports" },
    ],
  },
  {
    title: "Inventory Management",
    path: "/inventory-management",
    icon: "Package",
    subItems: [
      { name: "Dashboard", path: "/inventory-management/dashboard" },
      { 
        name: "Stock Overview", 
        path: "/inventory-management/stock-overview",
        subItems: [
          { name: "Overview", path: "/inventory-management/stock-overview" },
          { name: "Inventory Balance", path: "/inventory-management/stock-overview/inventory-balance" },
          { name: "Stock Cards", path: "/inventory-management/stock-overview/stock-cards" },
          { name: "Slow Moving", path: "/inventory-management/stock-overview/slow-moving" },
          { name: "Inventory Aging", path: "/inventory-management/stock-overview/inventory-aging" }
        ]
      },
      { name: "Inventory Adjustments", path: "/inventory-management/inventory-adjustments" },
      { name: "Spot Check", path: "/inventory-management/spot-check" },
      { name: "Physical Count", path: "/inventory-management/physical-count-management" },
      { name: "Period End", path: "/inventory-management/period-end" },
    ],
  },
  {
    title: "Operational Planning",
    path: "/operational-planning",
    icon: "CalendarClock",
    subItems: [
      { name: "Dashboard", path: "/operational-planning/dashboard" },
      { 
        name: "Recipe Management", 
        path: "/operational-planning/recipe-management",
        subItems: [
          { name: "Recipe Library", path: "/operational-planning/recipe-management/recipes" },
          { name: "Categories", path: "/operational-planning/recipe-management/categories" },
          { name: "Cuisine Types", path: "/operational-planning/recipe-management/cuisine-types" },
        ]
      },
      { name: "Menu Engineering", path: "/operational-planning/menu-engineering" },
      { name: "Demand Forecasting", path: "/operational-planning/demand-forecasting" },
      { name: "Inventory Planning", path: "/operational-planning/inventory-planning" },
    ],
  },
  {
    title: "Production",
    path: "/production",
    icon: "Factory",
    subItems: [
      { name: "Dashboard", path: "/production/dashboard" },
      { name: "Recipe Execution", path: "/production/recipe-execution" },
      { name: "Batch Production", path: "/production/batch-production" },
      { name: "Wastage Tracking", path: "/production/wastage-tracking" },
      { name: "Quality Control", path: "/production/quality-control" },
    ],
  },
  {
    title: "Reporting & Analytics",
    path: "/reporting-analytics",
    icon: "BarChart2",
    subItems: [
      { name: "Dashboard", path: "/reporting-analytics/dashboard" },
      { name: "Operational Reports", path: "/reporting-analytics/operational-reports" },
      { name: "Financial Reports", path: "/reporting-analytics/financial-reports" },
      { name: "Inventory Reports", path: "/reporting-analytics/inventory-reports" },
      { name: "Vendor Performance", path: "/reporting-analytics/vendor-performance" },
      { name: "Cost Analysis", path: "/reporting-analytics/cost-analysis" },
      { name: "Sales Analysis", path: "/reporting-analytics/sales-analysis" },
    ],
  },
  {
    title: "Finance",
    path: "/finance",
    icon: "DollarSign",
    subItems: [
      { name: "Account Code Mapping", path: "/finance/account-code-mapping" },
      { name: "Currency Management", path: "/finance/currency-management" },
      { name: "Exchange Rates", path: "/finance/exchange-rates" },
      { name: "Department and Cost Center", path: "/finance/department-list" },
      { name: "Budget Planning and Control", path: "/finance/budget-planning-and-control" },
    ],
  },
  {
    title: "System Administration",
    path: "/system-administration",
    icon: "Settings",
    subItems: [
      { name: "User Management", path: "/system-administration/user-management" },
      { name: "Location Management", path: "/system-administration/location-management" },
      { name: "Workflow Management", path: "/system-administration/workflow/workflow-configuration" },
      { name: "General Settings", path: "/system-administration/general-settings" },
      { name: "Notification Preferences", path: "/system-administration/notification-preferences" },
      { name: "License Management", path: "/system-administration/license-management" },
      { name: "Security Settings", path: "/system-administration/security-settings" },
      { name: "Data Backup and Recovery", path: "/system-administration/data-backup-and-recovery" },
      { 
        name: "System Integrations",
        path: "/system-administration/system-integrations",
        subItems: [
          { 
            name: "POS",
            path: "/system-administration/system-integrations/pos",
            subItems: [
              { name: "Settings", path: "/system-administration/system-integrations/pos/settings" },
            ]
          }
        ]
      },
    ],
  },
  {
    title: "Help & Support",
    path: "/help-support",
    icon: "HelpCircle",
    subItems: [
      { name: "User Manuals", path: "/help-support/user-manuals" },
      { name: "Video Tutorials", path: "/help-support/video-tutorials" },
      { name: "FAQs", path: "/help-support/faqs" },
      { name: "Support Ticket System", path: "/help-support/support-ticket-system" },
      { name: "System Updates and Release Notes", path: "/help-support/system-updates-and-release-notes" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] top-[64px] border-r dark:border-gray-800">
          <SidebarContent menuItems={menuItems} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed h-[calc(100vh-64px)] w-[280px]",
        "bg-background dark:bg-gray-950",
        "border-r border-border dark:border-gray-800",
        "shadow-sm dark:shadow-gray-900/50",
        "transition-all duration-300 ease-in-out",
        "top-[64px] left-0",
        "hidden lg:block"
      )}>
        <SidebarContent menuItems={menuItems} />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 lg:hidden z-40"
          onClick={onClose}
        />
      )}
    </>
  );
}

interface SidebarContentProps {
  menuItems: MenuItem[];
}

function SidebarContent({ menuItems }: SidebarContentProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);

  const isExpanded = (title: string) => expandedItems.includes(title);
  const isSubExpanded = (name: string) => expandedSubItems.includes(name);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev: string[]) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const toggleSubExpand = (name: string) => {
    setExpandedSubItems((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleSubItemClick = (subItem: SubMenuItem, event: React.MouseEvent) => {
    if (subItem.subItems?.length) {
      event.preventDefault();
      toggleSubExpand(subItem.name);
    }
  };

  // Helper function to safely get icon component
  const getIcon = (iconName: string): React.ElementType => {
    return (LucideIcons as unknown as Record<string, React.ElementType>)[iconName] || LucideIcons.Circle;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = getIcon(item.icon);
              const isActive = pathname === item.path;
              const isItemExpanded = isExpanded(item.title);
              const isDashboard = item.title === "Dashboard";

              return (
                <div key={index} className="space-y-1">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-9",
                      "text-foreground dark:text-gray-100",
                      "hover:bg-accent hover:text-accent-foreground",
                      "dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      isActive && "bg-accent/50 dark:bg-gray-800"
                    )}
                    asChild={!isDashboard}
                  >
                    {isDashboard ? (
                      <div className="flex items-center justify-between w-full">
                        <Link href={item.path} className="flex items-center">
                          <IconComponent className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </div>
                    ) : (
                      item.subItems?.length > 0 ? (
                        <div 
                          className="flex items-center justify-between w-full"
                          onClick={() => toggleExpand(item.title)}
                        >
                          <span className="flex items-center">
                            <IconComponent className="h-4 w-4" />
                            <span className="ml-2">{item.title}</span>
                          </span>
                          {isItemExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                          )}
                        </div>
                      ) : (
                        <Link href={item.path} className="flex items-center">
                          <IconComponent className="h-4 w-4" />
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      )
                    )}
                  </Button>

                  {isItemExpanded && item.subItems?.length > 0 && (
                    <div className="pl-6 space-y-1">
                      {item.subItems.map((subItem, subIndex) => {
                        const SubIconComponent = subItem.icon ? getIcon(subItem.icon) : undefined;
                        const isSubActive = pathname === subItem.path;
                        const isSubItemExpanded = isSubExpanded(subItem.name);

                        return (
                          <div key={subIndex} className="space-y-1">
                            <Button
                              variant={isSubActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-between",
                                "text-foreground dark:text-gray-100",
                                "hover:bg-accent hover:text-accent-foreground",
                                "dark:hover:bg-gray-800 dark:hover:text-gray-100",
                                isSubActive && "bg-accent/50 dark:bg-gray-800"
                              )}
                              onClick={(e) => handleSubItemClick(subItem, e)}
                              asChild={!subItem.subItems}
                            >
                              {subItem.subItems ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="flex items-center">
                                    {SubIconComponent && <SubIconComponent className="h-4 w-4 mr-2" />}
                                    <div>
                                      <span>{subItem.name}</span>
                                      {subItem.description && (
                                        <p className="text-xs text-muted-foreground dark:text-gray-400">{subItem.description}</p>
                                      )}
                                    </div>
                                  </span>
                                  {isSubItemExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                                  )}
                                </div>
                              ) : (
                                <Link href={subItem.path} className="flex items-center w-full">
                                  {SubIconComponent && <SubIconComponent className="h-4 w-4 mr-2" />}
                                  <div>
                                    <span>{subItem.name}</span>
                                    {subItem.description && (
                                      <p className="text-xs text-muted-foreground dark:text-gray-400">{subItem.description}</p>
                                    )}
                                  </div>
                                </Link>
                              )}
                            </Button>

                            {subItem.subItems && isSubItemExpanded && (
                              <div className="pl-6 space-y-1">
                                {subItem.subItems.map((subSubItem, subSubIndex) => {
                                  const SubSubIconComponent = subSubItem.icon ? getIcon(subSubItem.icon) : undefined;
                                  const isSubSubActive = pathname === subSubItem.path;

                                  return (
                                    <Button
                                      key={subSubIndex}
                                      variant={isSubSubActive ? "secondary" : "ghost"}
                                      className={cn(
                                        "w-full justify-start",
                                        "text-foreground dark:text-gray-100",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "dark:hover:bg-gray-800 dark:hover:text-gray-100",
                                        isSubSubActive && "bg-accent/50 dark:bg-gray-800"
                                      )}
                                      asChild
                                    >
                                      <Link href={subSubItem.path} className="flex items-center">
                                        {SubSubIconComponent && <SubSubIconComponent className="h-4 w-4 mr-2" />}
                                        <span>{subSubItem.name}</span>
                                      </Link>
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default Sidebar;
