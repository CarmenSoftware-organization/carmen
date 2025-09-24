"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  User,
  Settings,
  LogOut,
  Globe,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { QuickAccessNav } from "@/components/quick-access-nav";
import { UserContextSwitcher } from "@/components/user-context-switcher";
import { useSimpleUser } from "@/lib/context/simple-user-context";
// Force refresh
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {}

export default function Header({}: HeaderProps = {}) {
  const [businessUnit, setBusinessUnit] = useState("BU1");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useSimpleUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditProfile = () => {
    console.log("Navigating to edit profile");
    router.push("/edit-profile");
  };

  const toggleTheme = () => {
    console.log('Current theme:', theme);
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="backdrop-blur supports-[backdrop-filter]:bg-background dark:supports-[backdrop-filter]:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-500">
      <div className="w-full px-4 py-2 sm:px-6">
        <div className="flex items-center h-12">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4 md:mr-6" />
            <div className="flex flex-col">
              <Link
                href="/dashboard"
                className="text-lg md:text-xl lg:text-xl font-bold text-foreground dark:text-gray-100"
              >
                CARMEN
              </Link>
              <span className="text-xs md:text-sm text-primary">
                Hospitality Supply Chain
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Select value={businessUnit} onValueChange={setBusinessUnit}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 bg-background dark:bg-gray-700 text-foreground dark:text-gray-100">
                <SelectValue placeholder="Business Unit" />
              </SelectTrigger>
              <SelectContent className="bg-background dark:bg-gray-700">
                <SelectItem value="BU1" className="text-foreground dark:text-gray-100">Business Unit 1</SelectItem>
                <SelectItem value="BU2" className="text-foreground dark:text-gray-100">Business Unit 2</SelectItem>
              </SelectContent>
            </Select>
            
            <QuickAccessNav />
            
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-foreground dark:text-gray-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground dark:text-gray-100">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background dark:bg-gray-700">
                <DropdownMenuItem className="text-foreground dark:text-gray-100">English</DropdownMenuItem>
                <DropdownMenuItem className="text-foreground dark:text-gray-100">Spanish</DropdownMenuItem>
                <DropdownMenuItem className="text-foreground dark:text-gray-100">French</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Theme: {theme || 'loading'}</span>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground dark:text-gray-100">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-background dark:bg-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground dark:text-gray-100">
                        {user?.name || "John Doe"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">
                        {user?.email || "john@example.com"}
                      </p>
                    </div>
                    {user && (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <span className="font-medium">Role:</span>
                          <span>{user.context.currentRole.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <span className="font-medium">Department:</span>
                          <span>{user.context.currentDepartment.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <span className="font-medium">Location:</span>
                          <span>{user.context.currentLocation.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* User Context Switcher */}
                <div className="p-1">
                  <UserContextSwitcher />
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleEditProfile} className="text-foreground dark:text-gray-100">
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground dark:text-gray-100">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={() => router.push('/')}
                  className="text-foreground dark:text-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}