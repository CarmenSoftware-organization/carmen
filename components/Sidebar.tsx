"use client";

import { Menu, X } from "lucide-react";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

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
      {name :"My Approvals", path : "/procurement/my-approvals"},
      "Purchase Requests",
      "Purchase Orders",
      "Goods Received Note",
      { name: "Credit Notes", path: "/procurement/credit-note" },
      "Purchase Request Templates",
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
      "Store Requisitions",
      "Issues Management",
      "Stock Replenishment",
      "Wastage Reporting",
    ],
  },
  {
    title: "Inventory Management",
    path: "/inventory-management",
    icon: "Package",
    subItems: [
      "Stock Overview",
      "Stock In",
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

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleIsOpen = () => {
    isOpen = !isOpen;
  }

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    );
  };

  return (
    <>
    <div className="z-50 flex-col gap-4 relative">
     {/* <div className="bg-green-300 md:sticky absolute">
            <Button variant="ghost" size="icon" onClick={handleIsOpen}>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            
            <Link
              href="/dashboard"
              className="text-2xl md:text-3xl font-bold text-blue-900"
            >
              CARMEN
            </Link>

     </div> */}

      {isOpen && !isLargeScreen && (
        <div 
          className="fixed md:sticky inset-0 bg-black/40 z-40" 
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out",
          isOpen || isLargeScreen ? "translate-x-0 md:sticky" : "-translate-x-full"
        )}
      >
        <div className="px-8 pt-6 w-fit">
         <Link
              href="/"
              className="text-2xl text-center font-bold text-blue-900"
            >
              CARMEN
            </Link>
            </div>

        <ScrollArea className="h-full">
          <div className="space-y-1 py-4">
            {menuItems.map((item) => {
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
              return (
                <div key={item.title} className="px-3 py-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-base font-semibold"
                    onClick={() => toggleExpand(item.title)}
                  >
                    <span className="flex items-center">
                      <IconComponent className="mr-2 h-5 w-5" />
                      {item.title}
                    </span>
                    {item.subItems && item.subItems.length > 0 && (
                      expandedItems.includes(item.title) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  {item.subItems && item.subItems.length > 0 && expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.subItems.map((subItem, index) => (
                        <Button
                          key={typeof subItem === 'string' ? subItem : subItem.name}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start text-sm",
                            pathname === (typeof subItem === 'string' ? `${item.path}/${subItem.toLowerCase().replace(/\s+/g, '-')}` : subItem.path) ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline"
                          )}
                          onClick={() => !isLargeScreen && onClose()}
                        >
                          <Link href={typeof subItem === 'string' ? `${item.path}/${subItem.toLowerCase().replace(/\s+/g, '-')}` : subItem.path}>
                            {typeof subItem === 'string' ? subItem : subItem.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
      </div>
    </>
  );
}

export default Sidebar;
