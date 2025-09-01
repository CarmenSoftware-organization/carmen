"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Crown,
  Shield,
  Briefcase,
  User,
  Users,
  UserPlus,
  Lock,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Role } from '@/lib/types/permissions'

interface EnhancedRoleCardProps {
  role: Role
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onDuplicate: (role: Role) => void
  onAssignUsers: (role: Role) => void
}

export function EnhancedRoleCard({
  role,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onAssignUsers
}: EnhancedRoleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('Director') || roleName.includes('GM')) {
      return <Crown className="h-5 w-5 text-amber-500" />;
    } else if (roleName.includes('Manager')) {
      return <Shield className="h-5 w-5 text-blue-500" />;
    } else if (roleName.includes('Chef') || roleName.includes('Head')) {
      return <Briefcase className="h-5 w-5 text-green-500" />;
    } else if (roleName.includes('Admin')) {
      return <Users className="h-5 w-5 text-purple-500" />;
    } else {
      return <User className="h-5 w-5 text-gray-500" />;
    }
  }

  const getHierarchyDetails = (hierarchy?: number) => {
    const level = hierarchy || 0;
    
    if (level >= 900) {
      return { 
        label: "Executive", 
        variant: "destructive" as const, 
        color: "bg-red-500",
        progress: 100,
        description: "Highest level access"
      };
    } else if (level >= 700) {
      return { 
        label: "Management", 
        variant: "default" as const, 
        color: "bg-blue-500",
        progress: 75,
        description: "Management level access"
      };
    } else if (level >= 400) {
      return { 
        label: "Supervisor", 
        variant: "secondary" as const, 
        color: "bg-orange-500",
        progress: 50,
        description: "Supervisory access"
      };
    } else {
      return { 
        label: "Staff", 
        variant: "outline" as const, 
        color: "bg-gray-500",
        progress: 25,
        description: "Standard staff access"
      };
    }
  }

  const userCount = role.id.length % 25 + 1 // Mock user count
  const permissionCount = role.permissions?.length || 0
  const inheritedCount = role.parentRoles?.length || 0
  const hierarchyDetails = getHierarchyDetails(role.hierarchy)
  const hasPermissions = permissionCount > 0
  
  // Calculate permission utilization (mock data)
  const maxPermissions = 50
  const permissionUtilization = Math.min((permissionCount / maxPermissions) * 100, 100)

  return (
    <TooltipProvider>
      <Card 
        className={`relative transition-all duration-200 cursor-pointer group ${
          isSelected 
            ? 'ring-2 ring-primary shadow-lg' 
            : 'hover:shadow-md hover:border-primary/20'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView(role)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) onSelect(role.id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
                aria-label={`Select ${role.name}`}
              />
              
              {/* Role Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20">
                  {getRoleIcon(role.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base truncate">{role.name}</h3>
                  {role.isSystem && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          System
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>System-defined role</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  ID: {role.id}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 w-8 p-0 transition-opacity ${
                    isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(role); }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(role); }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAssignUsers(role); }}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(role); }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(role); }}
                  className="text-destructive focus:text-destructive"
                  disabled={userCount > 0 || role.isSystem}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Description */}
          {role.description && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {role.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Hierarchy Level with Visual Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={hierarchyDetails.variant} className="text-xs">
                  {hierarchyDetails.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Level {role.hierarchy || 0}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hierarchyDetails.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Progress 
              value={hierarchyDetails.progress} 
              className="h-2"
            />
          </div>

          <Separator />

          {/* Permissions Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Permissions</span>
              </div>
              <div className="flex items-center gap-1">
                {hasPermissions ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {permissionCount}/{maxPermissions}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Direct permissions</span>
                <span className="font-medium">{permissionCount}</span>
              </div>
              {inheritedCount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Inherited from parents</span>
                  <span className="font-medium">{inheritedCount}</span>
                </div>
              )}
              <Progress value={permissionUtilization} className="h-1" />
            </div>
          </div>

          <Separator />

          {/* User Assignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Assigned Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{userCount}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onAssignUsers(role); }}
                className="h-6 w-6 p-0"
              >
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex justify-between items-center bg-muted/10">
          <div className="flex items-center gap-2">
            <Badge 
              className={`${
                hasPermissions 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {hasPermissions ? "Active" : "Inactive"}
            </Badge>
            <Tooltip>
              <TooltipTrigger>
                <Clock className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated 2 days ago</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onView(role); }}
              className="h-7 w-7 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onEdit(role); }}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}