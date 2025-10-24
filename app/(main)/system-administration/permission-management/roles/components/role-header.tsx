'use client';

import React from 'react';
import { Shield, Users, FileText, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data/users';
import { allMockPolicies } from '@/lib/mock-data/permission-policies';

interface RoleHeaderProps {
  role: Role;
}

export function RoleHeader({ role }: RoleHeaderProps) {
  // Calculate statistics
  const assignedUsers = mockUsers.filter(user => 
    user.roles?.some(r => r.id === role.id) || user.primaryRole?.id === role.id
  );
  
  // Mock policy assignments based on role type
  const assignedPolicies = allMockPolicies.slice(0, Math.min(3, allMockPolicies.length));
  
  const permissionCount = role.permissions?.length || 0;
  const hierarchyLevel = role.hierarchy || 0;

  const getHierarchyBadgeColor = (level: number) => {
    if (level >= 900) return 'bg-red-100 text-red-800';
    if (level >= 700) return 'bg-orange-100 text-orange-800';
    if (level >= 500) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getHierarchyLabel = (level: number) => {
    if (level >= 900) return 'Executive';
    if (level >= 700) return 'Senior';
    if (level >= 500) return 'Supervisor';
    return 'Staff';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Role Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{role.name}</h2>
                <p className="text-sm text-muted-foreground">{role.id}</p>
              </div>
            </div>
            
            {role.description && (
              <p className="text-muted-foreground max-w-2xl">
                {role.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Badge className={getHierarchyBadgeColor(hierarchyLevel)}>
                Level {hierarchyLevel} - {getHierarchyLabel(hierarchyLevel)}
              </Badge>
              
              {role.parentRoles && role.parentRoles.length > 0 && (
                <Badge variant="outline">
                  <Layers className="w-3 h-3 mr-1" />
                  {role.parentRoles.length} Parent Role{role.parentRoles.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Parent Roles */}
            {role.parentRoles && role.parentRoles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Inherits from:</p>
                <div className="flex flex-wrap gap-2">
                  {role.parentRoles.map((parentRoleId) => {
                    const parentRole = mockUsers.find(u => u.roles?.find(r => r.id === parentRoleId))?.roles?.find(r => r.id === parentRoleId);
                    return (
                      <Badge key={parentRoleId} variant="secondary">
                        {parentRole?.name || parentRoleId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-fit">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{assignedUsers.length}</div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{assignedPolicies.length}</div>
              <div className="text-xs text-muted-foreground">Policies</div>
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{permissionCount}</div>
              <div className="text-xs text-muted-foreground">Permissions</div>
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto">
                <Layers className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{hierarchyLevel}</div>
              <div className="text-xs text-muted-foreground">Hierarchy</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Active Role</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Last Modified: {new Date().toLocaleDateString()}</span>
            </div>
            {assignedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>In Use</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}