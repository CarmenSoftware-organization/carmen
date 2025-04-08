'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon?: keyof typeof LucideIcons;
  href?: string;
  items?: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarMenuProps {
  items: MenuItem[];
  onClose?: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    href: "/dashboard",
  },
  {
    id: "procurement",
    label: "Procurement",
    icon: "ShoppingCart",
    items: [
      {
        id: "my-approvals",
        label: "My Approvals",
        href: "/procurement/my-approvals",
      },
      {
        id: "purchase-requests",
        label: "Purchase Requests",
        href: "/procurement/purchase-requests",
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        href: "/procurement/purchase-orders",
      },
      {
        id: "goods-received-note",
        label: "Goods Received Note",
        href: "/procurement/goods-received-note",
      },
      {
        id: "credit-note",
        label: "Credit Note",
        href: "/procurement/credit-note",
      },
      {
        id: "vendor-comparison",
        label: "Vendor Comparison",
        href: "/procurement/vendor-comparison",
      }
    ],
  },
  {
    id: "store-operations",
    label: "Store Operations",
    icon: "Store",
    items: [
      {
        id: "store-requisitions-so",
        label: "Store Requisitions",
        href: "/store-operations/store-requisitions",
        icon: "ClipboardList"
      },
      {
        id: "stock-replenishment",
        label: "Stock Replenishment",
        href: "/store-operations/stock-replenishment",
        icon: "RefreshCw"
      },
      {
        id: "wastage-reporting",
        label: "Wastage Reporting",
        href: "/store-operations/wastage-reporting",
        icon: "Trash2"
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory Management",
    icon: "Package",
    items: [
      {
        id: "stock-overview",
        label: "Stock Overview",
        items: [
          {
            id: "inventory-balance",
            label: "Inventory Balance",
            href: "/inventory-management/stock-overview/inventory-balance",
          },
          {
            id: "inventory-aging",
            label: "Inventory Aging",
            href: "/inventory-management/stock-overview/inventory-aging",
          },
          {
            id: "slow-moving",
            label: "Slow Moving",
            href: "/inventory-management/stock-overview/slow-moving",
          },
          {
            id: "stock-cards",
            label: "Stock Cards",
            href: "/inventory-management/stock-overview/stock-cards",
          },
        ],
      },
      {
        id: "stock-in",
        label: "Stock In",
        href: "/inventory-management/stock-in",
      },
      {
        id: "physical-count",
        label: "Physical Count",
        href: "/inventory-management/physical-count",
      },
      {
        id: "spot-check",
        label: "Spot Check",
        href: "/inventory-management/spot-check",
      },
      {
        id: "inventory-adjustments",
        label: "Inventory Adjustments",
        href: "/inventory-management/inventory-adjustments",
      },
      {
        id: "period-end",
        label: "Period End",
        href: "/inventory-management/period-end",
      },
    ],
  },
  {
    id: "vendor-management",
    label: "Vendor Management",
    icon: "Users",
    items: [
      {
        id: "manage-vendors",
        label: "Manage Vendors",
        href: "/vendor-management/manage-vendors",
      },
      {
        id: "price-lists",
        label: "Price Lists",
        href: "/vendor-management/price-lists",
      },
    ],
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: "Package",
    items: [
      {
        id: "products",
        label: "Products",
        href: "/product-management/products",
      },
      {
        id: "categories",
        label: "Categories",
        href: "/product-management/categories",
      },
      {
        id: "units",
        label: "Units",
        href: "/product-management/units",
      },
    ],
  },
  {
    id: "operational-planning",
    label: "Operational Planning",
    icon: "CalendarClock",
    items: [
      {
        id: "recipe-management",
        label: "Recipe Management",
        items: [
          {
            id: "recipes",
            label: "Recipes",
            href: "/operational-planning/recipe-management/recipes",
          },
          {
            id: "categories",
            label: "Categories",
            href: "/operational-planning/recipe-management/categories",
          },
          {
            id: "cuisine-types",
            label: "Cuisine Types",
            href: "/operational-planning/recipe-management/cuisine-types",
          },
          {
            id: "recipe-units",
            label: "Units",
            href: "/product-management/units",
          },
        ],
      },
    ],
  },
  {
    id: "production",
    label: "Production",
    icon: "Factory",
    href: "/production",
  },
  {
    id: "pos-operations",
    label: "POS Operations",
    icon: "ShoppingBag",
    items: [
      {
        id: "pos-ops-dashboard",
        label: "Dashboard",
        href: "/pos-operations/dashboard",
      },
      {
        id: "pos-ops-transactions",
        label: "Transactions",
        href: "/pos-operations/transactions",
      },
      {
        id: "pos-ops-consumptions",
        label: "Consumptions",
        href: "/pos-operations/consumptions",
      },
      {
        id: "pos-ops-interface-posting",
        label: "Interface Posting",
        href: "/pos-operations/interface-posting",
      },
      {
        id: "pos-ops-reports",
        label: "Reports",
        href: "/pos-operations/reports",
      },
      {
        id: "pos-ops-mapping",
        label: "Mapping",
        href: "/pos-operations/mapping",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "DollarSign",
    items: [
      {
        id: "department-list",
        label: "Department List",
        href: "/finance/department-list",
      },
      {
        id: "currency-management",
        label: "Currency Management",
        href: "/finance/currency-management",
      },
      {
        id: "exchange-rates",
        label: "Exchange Rates",
        href: "/finance/exchange-rates",
      },
      {
        id: "account-code-mapping",
        label: "Account Code Mapping",
        href: "/finance/account-code-mapping",
      },
    ],
  },
  {
    id: "reporting-analytics",
    label: "Reporting & Analytics",
    icon: "BarChart2",
    href: "/reporting-analytics",
  },
  {
    id: "system-administration",
    label: "System Administration",
    icon: "Settings",
    items: [
      {
        id: "user-management",
        label: "User Management",
        href: "/system-administration/user-management",
      },
      {
        id: "workflow",
        label: "Workflow",
        items: [
          {
            id: "workflow-configuration",
            label: "Workflow Configuration",
            href: "/system-administration/workflow/workflow-configuration",
          },
          {
            id: "role-assignment",
            label: "Role Assignment",
            href: "/system-administration/workflow/role-assignment",
          },
        ],
      },
      {
        id: "account-code-mapping",
        label: "Account Code Mapping",
        href: "/system-administration/account-code-mapping",
      },
    ],
  },
  {
    id: "pos-integrations",
    label: "POS Integrations",
    icon: "TerminalSquare",
    items: [
      {
        id: "pos-mapping",
        label: "Mapping",
        items: [
          {
            id: "pos-locations",
            label: "Locations",
            href: "/system-administration/system-integrations/pos/mapping/locations",
          },
          {
            id: "pos-recipes",
            label: "Recipes",
            href: "/system-administration/system-integrations/pos/mapping/recipes",
          },
          {
            id: "pos-units",
            label: "Units",
            href: "/system-administration/system-integrations/pos/mapping/units",
          },
        ],
      },
      {
        id: "pos-operational",
        label: "Operational",
        items: [
          {
            id: "pos-sales-data",
            label: "Sales Data",
            href: "/system-administration/system-integrations/pos/operational/sales-data",
          },
          {
            id: "pos-inventory-sync",
            label: "Inventory Sync",
            href: "/system-administration/system-integrations/pos/operational/inventory-sync",
          },
          {
            id: "pos-reports",
            label: "Reports",
            href: "/system-administration/system-integrations/pos/operational/reports",
          },
        ],
      },
      {
        id: "pos-settings",
        label: "Settings",
        items: [
          {
            id: "pos-config",
            label: "Configuration",
            href: "/system-administration/system-integrations/pos/settings/config",
          },
          {
            id: "pos-system",
            label: "System Setup",
            href: "/system-administration/system-integrations/pos/settings/system",
          },
        ],
      },
    ],
  },
  {
    id: "help-support",
    label: "Help & Support",
    icon: "HelpCircle",
    href: "/help-support",
  },
];

function SidebarMenu({ items, onClose }: SidebarMenuProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand menu items based on current path
  useEffect(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    const newExpandedItems: string[] = [];
    
    // Find parent menu items that should be expanded based on the current path
    const findParentItems = (menuItems: MenuItem[], currentPath: string[]) => {
      for (const item of menuItems) {
        // Check if item has nested items
        if (item.items && item.items.length > 0) {
          // Check if any of the nested items match the current path
          const matchesPath = item.items.some(subItem => {
            // Check if the current path includes this item
            if (subItem.href && pathname.startsWith(subItem.href)) {
              return true;
            }
            // Check nested items
            if (subItem.items && subItem.items.length > 0) {
              return findParentItems([subItem], currentPath);
            }
            return false;
          });
          
          if (matchesPath) {
            newExpandedItems.push(item.id);
            // Also expand any nested items that match the path
            findParentItems(item.items, currentPath);
          }
        }
      }
      
      return newExpandedItems.length > 0;
    };
    
    findParentItems(items, pathParts);
    setExpandedItems(newExpandedItems);
  }, [pathname, items]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Helper function to safely get icon component
  const getIcon = (iconName: string | undefined): React.ReactNode => {
    if (!iconName) return null;
    // Cast to any to avoid type issues with the Lucide icons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={16} className="mr-2 flex-shrink-0" /> : null;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = pathname === item.href;
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    
    return (
      <div key={item.id} className="w-full">
        {item.href ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm",
              "hover:bg-accent/50",
              depth > 0 && "pl-6",
              depth > 1 && "pl-9",
              isActive && "bg-accent/50 font-medium"
            )}
            onClick={(e) => {
              if (hasSubItems) {
                e.preventDefault();
                toggleItem(item.id);
              } else {
                onClose && onClose();
              }
            }}
          >
            {getIcon(item.icon)}
            <span>{item.label}</span>
          </Link>
        ) : (
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 text-sm",
              "hover:bg-accent/50 text-left",
              depth > 0 && "pl-6",
              depth > 1 && "pl-9"
            )}
            onClick={() => toggleItem(item.id)}
          >
            <span className="flex items-center">
              {getIcon(item.icon)}
              <span>{item.label}</span>
            </span>
            {hasSubItems && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
          </button>
        )}
        
        {hasSubItems && isExpanded && (
          <div className="mt-1">
            {item.items!.map(subItem => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {items.map(item => renderMenuItem(item))}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50",
          "w-[280px] bg-background",
          "border-r border-border",
          "transform transition-transform duration-300 ease-in-out",
          "top-[64px]",
          "overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:hidden"
        )}
      >
        <SidebarMenu items={menuItems} onClose={onClose} />
      </div>

      {/* Desktop sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0",
          "w-[280px] bg-background",
          "border-r border-border",
          "top-[64px]",
          "overflow-y-auto",
          "hidden lg:block"
        )}
      >
        <SidebarMenu items={menuItems} onClose={onClose} />
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
