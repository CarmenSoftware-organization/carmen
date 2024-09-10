'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, User, Settings, LogOut, Globe } from 'lucide-react';

interface HeaderProps {
  onSidebarToggle: (isOpen: boolean) => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [businessUnit, setBusinessUnit] = useState("BU1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onSidebarToggle(newState);
  };

  const handleEditProfile = () => {
    console.log("Navigating to edit profile");
    router.push('/edit-profile');
  };

  return (
    <header className="bg-background backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button 
              onClick={toggleSidebar} 
              className="mr-4 text-gray-600 hover:text-blue-600"
              variant="ghost"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <Link href="/dashboard" className="text-2xl md:text-3xl font-bold text-blue-900">
              CARMEN
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Select value={businessUnit} onValueChange={setBusinessUnit}>
              <SelectTrigger className="w-[140px] sm:w-[180px]">
                <SelectValue placeholder="Business Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BU1">Business Unit 1</SelectItem>
                <SelectItem value="BU2">Business Unit 2</SelectItem>
              </SelectContent>
            </Select>
            {/* <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div> */}
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Bell size={20} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Spanish</DropdownMenuItem>
                <DropdownMenuItem>French</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@johndoe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleEditProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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