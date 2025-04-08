'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, Menu, User, LogOut, Settings, HelpCircle } from "lucide-react"
import { QuickAccessNav } from "@/components/quick-access-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onSidebarToggle: () => void
  businessUnit?: string
  setBusinessUnit?: (value: string) => void
}

export default function Header({ onSidebarToggle, businessUnit = 'unit1', setBusinessUnit }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border border-border rounded-lg m-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onSidebarToggle}>
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center mr-auto">
          <Link href="/" className="flex flex-col">
            <span className="font-bold text-2xl">Carmen</span>
            <span className="text-xs text-muted-foreground">Hospitality Supply Chain System</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <QuickAccessNav />
          </div>
          
          {setBusinessUnit && (
            <Select value={businessUnit} onValueChange={setBusinessUnit}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 border border-border rounded-md">
                <SelectValue placeholder="Business Unit 1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit1">Business Unit 1</SelectItem>
                <SelectItem value="unit2">Business Unit 2</SelectItem>
                <SelectItem value="unit3">Business Unit 3</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="/assets/avatar.png" alt="User avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="flex cursor-pointer items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex cursor-pointer items-center text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}