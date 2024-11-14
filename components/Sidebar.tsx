"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Menu, ChevronLeft } from "lucide-react";
import * as LucideIcons from "lucide-react";

const menuItems = [
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
      { name: "My Approvals", path: "/procurement/my-approvals" },
      "Purchase Requests",
      "Purchase Orders",
      "Goods Received Note",
      { name: "Credit Notes", path: "/procurement/credit-note" },
      "Purchase Request Templates",
    ],
  },
  {
    title: "Product Management",
    path: "/product-management",
    icon: "Package",
    subItems: [
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
    subItems: ["Manage Vendors", "Price Lists", "Price Comparisons"],
  },
  {
    title: "Store Operations",
    path: "/store-operations",
    icon: "Store",
    subItems: [
      { name: "Store Requisitions", path: "/store-operations/store-requisitions" },
      { name: "Stock Replenishment", path: "/store-operations/stock-replenishment" },
      { name: "Wastage Reporting", path: "/store-operations/wastage-reporting" },
    ],
  },
  {
    title: "Inventory Management",
    path: "/inventory-management",
    icon: "Package",
    subItems: [
      "Stock Overview",
      { name: "Stock In", path: "/inventory-management/stock-in" },
      "Stock Out",
      "Transfer Between Locations",
      "Physical Count",
      "Stock Take",
      "Inventory Valuation",
    ],
  },
  {
    title: "Operational Planning",
    path: "/operational-planning",
    icon: "CalendarClock",
    subItems: [
      "Recipes Management",
      "Menu Engineering",
      "Demand Forecasting",
      "Inventory Planning",
    ],
  },
  {
    title: "Production",
    path: "/production",
    icon: "Factory",
    subItems: [
      "Recipe Execution",
      "Batch Production",
      "Wastage Tracking",
      "Quality Control",
    ],
  },
  {
    title: "Reporting & Analytics",
    path: "/reporting-analytics",
    icon: "BarChart2",
    subItems: [
      "Operational Reports",
      "Financial Reports",
      "Inventory Reports",
      "Vendor Performance",
      "Cost Analysis",
      "Sales Analysis",
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
      "Budget Planning and Control",
    ],
  },
  {
    title: "System Administration",
    path: "/system-administration",
    icon: "Settings",
    subItems: [
      "User Management",
      "Location Management",
      "Workflow Management",
      "General Settings",
      "Notification Preferences",
      "License Management",
      "Security Settings",
      "Data Backup and Recovery",
      "System Integrations",
    ],
  },
  {
    title: "Help & Support",
    path: "/help-support",
    icon: "HelpCircle",
    subItems: [
      "User Manuals",
      "Video Tutorials",
      "FAQs",
      "Support Ticket System",
      "System Updates and Release Notes",
    ],
  },
  {
    title: "Products",
    path: "/products",
    icon: "ShoppingBag",
    subItems: [
      { name: "Products", path: "/products" },
      { name: "Categories", path: "/products/categories" },
      { name: "Reports", path: "/products/reports" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Sheet open={isOpen && !isLargeScreen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] top-[64px]">
          <SidebarContent menuItems={menuItems} />
        </SheetContent>
      </Sheet>

      <aside className={cn(
        "fixed z-40 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out",
        "top-[64px]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isCollapsed ? "w-[60px]" : "w-[280px]"
      )}>
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed ? "rotate-180" : ""
            )} />
          </Button>
        </div>
        <SidebarContent 
          menuItems={menuItems} 
          isCollapsed={isCollapsed}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  menuItems: Array<{
    title: string;
    path: string;
    icon: string;
    subItems: Array<{ name: string; path: string } | string>;
  }>;
  isCollapsed?: boolean;
}

function SidebarContent({ menuItems, isCollapsed }: SidebarContentProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.subItems?.length > 0) {
      toggleExpand(item.title);
    } else {
      router.push(item.path);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className={cn(
        "flex-1",
        isCollapsed ? "px-1" : "px-1"
      )}>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
            const isExpanded = expandedItems.includes(item.title);
            const isActive = pathname?.startsWith(item.path) ?? false;

            return (
              <div key={item.title} className="space-y-1">
                {item.subItems?.length > 0 ? (
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-between",
                      isCollapsed && "px-2"
                    )}
                    onClick={() => toggleExpand(item.title)}
                  >
                    <span className="flex items-center">
                      <IconComponent className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </span>
                    {!isCollapsed && item.subItems?.length > 0 && (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </Button>
                ) : (
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-between",
                      isCollapsed && "px-2"
                    )}
                    asChild
                  >
                    <Link href={item.path}>
                      <span className="flex items-center">
                        <IconComponent className="h-4 w-4" />
                        {!isCollapsed && <span className="ml-2">{item.title}</span>}
                      </span>
                    </Link>
                  </Button>
                )}

                {!isCollapsed && isExpanded && item.subItems?.length > 0 && (
                  <div className="pl-6 space-y-1">
                    {item.subItems.map((subItem, index) => {
                      const subItemPath = typeof subItem === "string"
                        ? `${item.path}/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                        : subItem.path;
                      const subItemName = typeof subItem === "string" ? subItem : subItem.name;
                      const isSubItemActive = pathname === subItemPath;

                      return (
                        <Button
                          key={index}
                          variant={isSubItemActive ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href={subItemPath}>
                            {subItemName}
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
      </ScrollArea>
    </div>
  );
}

export default Sidebar;
