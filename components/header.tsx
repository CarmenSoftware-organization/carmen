"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onSidebarToggle, isSidebarOpen }: HeaderProps) {
  const [businessUnit, setBusinessUnit] = useState("BU1");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditProfile = () => {
    console.log("Navigating to edit profile");
    router.push("/edit-profile");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="backdrop-blur supports-[backdrop-filter]:bg-background dark:supports-[backdrop-filter]:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-40 border-b border-gray-200 dark:border-gray-500">
      <div className="w-full px-4 py-1 sm:px-6">
        <div className="flex items-center h-12">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="lg:hover:bg-accent lg:hover:text-accent-foreground block lg:hidden mr-2"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            <div className="flex flex-col">
              <Link
                href="/dashboard"
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground dark:text-gray-100"
              >
                CARMEN
              </Link>
              <span className="text-xs md:text-sm text-muted-foreground">
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
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground dark:text-gray-100">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8 text-foreground dark:text-gray-100">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="@johndoe"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background dark:bg-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground dark:text-gray-100">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">
                      john@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
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
                <DropdownMenuItem className="text-foreground dark:text-gray-100">
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