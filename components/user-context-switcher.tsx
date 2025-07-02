"use client";

import { useState } from "react";
import { Check, ChevronDown, Building2, MapPin, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/context/user-context";
import type { Role, Department, Location } from "@/lib/types/user";

export function UserContextSwitcher() {
  const { user, updateUserContext } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleRoleChange = (role: Role) => {
    updateUserContext({ currentRole: role });
    setIsOpen(false);
  };

  const handleDepartmentChange = (department: Department) => {
    updateUserContext({ currentDepartment: department });
    setIsOpen(false);
  };

  const handleLocationChange = (location: Location) => {
    updateUserContext({ currentLocation: location });
    setIsOpen(false);
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'warehouse': return '📦';
      case 'office': return '🏢';
      default: return '📍';
    }
  };

  const getLocationTypeBadge = (type: string) => {
    const variants = {
      'hotel': 'default',
      'restaurant': 'secondary',
      'warehouse': 'outline',
      'office': 'destructive'
    } as const;
    
    return variants[type as keyof typeof variants] || 'default';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start">
          <div className="flex items-center space-x-2">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Switch Context</span>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span>{user.context.currentRole.name}</span>
                <span>•</span>
                <span>{user.context.currentDepartment.code}</span>
                <span>•</span>
                <span>{user.context.currentLocation.name}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Current Context</span>
            <div className="flex flex-wrap gap-1">
              <Badge variant="default">{user.context.currentRole.name}</Badge>
              <Badge variant="secondary">{user.context.currentDepartment.name}</Badge>
              <Badge variant={getLocationTypeBadge(user.context.currentLocation.type)}>
                {getLocationTypeIcon(user.context.currentLocation.type)} {user.context.currentLocation.name}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Role Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Switch Role</span>
            <Badge variant="outline" className="ml-auto">
              {user.context.currentRole.name}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableRoles.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => handleRoleChange(role)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {role.permissions.length} permissions
                  </span>
                </div>
                {user.context.currentRole.id === role.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Department Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Switch Department</span>
            <Badge variant="outline" className="ml-auto">
              {user.context.currentDepartment.code}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuLabel>Available Departments</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableDepartments.map((department) => (
              <DropdownMenuItem
                key={department.id}
                onClick={() => handleDepartmentChange(department)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{department.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Code: {department.code}
                  </span>
                </div>
                {user.context.currentDepartment.id === department.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Location Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Switch Location</span>
            <Badge variant="outline" className="ml-auto">
              {getLocationTypeIcon(user.context.currentLocation.type)} {user.context.currentLocation.name}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-80">
            <DropdownMenuLabel>Available Locations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableLocations.map((location) => (
              <DropdownMenuItem
                key={location.id}
                onClick={() => handleLocationChange(location)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span>{getLocationTypeIcon(location.type)}</span>
                    <span className="font-medium">{location.name}</span>
                    <Badge variant={getLocationTypeBadge(location.type)} className="text-xs">
                      {location.type}
                    </Badge>
                  </div>
                  {location.address && (
                    <span className="text-xs text-muted-foreground">
                      {location.address}
                    </span>
                  )}
                </div>
                {user.context.currentLocation.id === location.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}