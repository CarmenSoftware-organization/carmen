'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { title: "Dashboard", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", subItems: [] },
  { title: "Procurement", path: "/procurement", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", subItems: ["Purchase Requests", "Purchase Orders", "Goods Received Note", "Credit Notes", "Vendor Management", "Purchase Request Templates"] },
  { title: "Store Operations", path: "/store-operations", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", subItems: ["Store Requisitions", "Issues Management", "Stock Replenishment", "Wastage Reporting"] },
  { title: "Inventory Management", path: "/inventory-management", icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4", subItems: ["Stock Overview", "Stock In", "Stock Out", "Transfer Between Locations", "Physical Count", "Stock Take", "Inventory Valuation"] },
  { title: "Operational Planning", path: "/operational-planning", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", subItems: ["Recipes Management", "Menu Engineering", "Demand Forecasting", "Inventory Planning"] },
  { title: "Production", path: "/production", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", subItems: ["Recipe Execution", "Batch Production", "Wastage Tracking", "Quality Control"] },
  { title: "Reporting & Analytics", path: "/reporting-analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", subItems: ["Operational Reports", "Financial Reports", "Inventory Reports", "Vendor Performance", "Cost Analysis", "Sales Analysis"] },
  { title: "Finance", path: "/finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", subItems: [{ name: "Account Code Mapping", path: "/finance/account-code-mapping" }, { name: "Currency Management", path: "/finance/currency-management" }, { name: "Exchange Rates", path: "/finance/exchange-rates" }, { name: "Department and Cost Center", path: "/finance/department-list" }, "Budget Planning and Control"] },
  { title: "System Administration", path: "/system-administration", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", subItems: ["User Management", "Location Management", "Workflow Management", "General Settings", "Notification Preferences", "License Management", "Security Settings", "Data Backup and Recovery", "System Integrations"] },
  { title: "Help & Support", path: "/help-support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", subItems: ["User Manuals", "Video Tutorials", "FAQs", "Support Ticket System", "System Updates and Release Notes"] },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <nav className={`bg-gray-800 text-white fixed left-0 top-16 bottom-0 z-40 overflow-y-auto transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0 -translate-x-full'} md:translate-x-0`}>
      <div className="p-4 min-h-full">
        <ul className="space-y-2 mt-8">
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                href={item.path}
                className={`flex items-center text-left hover:text-blue-400 ${pathname.startsWith(item.path) ? 'text-blue-400' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.title}</span>
                {item.subItems.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === item.path ? null : item.path);
                    }}
                    className="ml-auto"
                  >
                    {openMenu === item.path ? '▼' : '▶'}
                  </button>
                )}
              </Link>
              {openMenu === item.path && item.subItems.length > 0 && (
                <ul className="ml-6 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={typeof subItem === 'string' ? subItem : subItem.name}>
                      <Link 
                        href={typeof subItem === 'string' 
                          ? `${item.path}/${subItem.toLowerCase().replace(/&/g, 'and').replace(/ /g, '-')}` 
                          : subItem.path
                        } 
                        className="hover:text-blue-400 block py-1"
                      >
                        {typeof subItem === 'string' ? subItem : subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}