'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PolicyList } from '@/components/permissions/policy-manager/policy-list';
import { PolicyFiltersComponent, PolicyFilters } from '@/components/permissions/policy-manager/policy-filters';
import { allMockPolicies } from '@/lib/mock-data/permission-index';
import { Policy, EffectType } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

export default function PolicyManagementPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PolicyFilters>({
    search: '',
    effect: 'all',
    status: 'all',
    resourceTypes: [],
    priorityRange: { min: 0, max: 1000 }
  });

  // Sample saved filter presets
  const [savedPresets] = useState([
    {
      name: 'High Priority Permits',
      filters: {
        search: '',
        effect: 'permit' as EffectType,
        status: 'enabled' as const,
        resourceTypes: [],
        priorityRange: { min: 800, max: 1000 }
      }
    },
    {
      name: 'Procurement Policies',
      filters: {
        search: '',
        effect: 'all' as const,
        status: 'all' as const,
        resourceTypes: [ResourceType.PURCHASE_REQUEST, ResourceType.PURCHASE_ORDER],
        priorityRange: { min: 0, max: 1000 }
      }
    }
  ]);

  // Filter policies based on current filters
  const filteredPolicies = useMemo(() => {
    return allMockPolicies.filter(policy => {
      // Search filter
      if (filters.search && !policy.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !policy.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Effect filter
      if (filters.effect !== 'all' && policy.effect !== filters.effect) {
        return false;
      }

      // Status filter
      if (filters.status === 'enabled' && !policy.enabled) return false;
      if (filters.status === 'disabled' && policy.enabled) return false;

      // Priority range filter
      if (policy.priority < filters.priorityRange.min || policy.priority > filters.priorityRange.max) {
        return false;
      }

      // Resource types filter (if any resource types are selected)
      if (filters.resourceTypes.length > 0) {
        // This would need to be implemented based on policy structure
        // For now, we'll assume all policies pass this filter
        // In a real implementation, you'd check if the policy applies to any of the selected resource types
      }

      return true;
    });
  }, [filters]);

  const handleCreatePolicy = () => {
    // Navigate to policy builder or open modal
    console.log('Create new policy');
  };

  const handleEditPolicy = (policyId: string) => {
    // Navigate to policy editor
    console.log('Edit policy:', policyId);
  };

  const handleViewPolicy = (policyId: string) => {
    // Navigate to policy details view
    console.log('View policy:', policyId);
  };

  const handleSavePreset = (name: string, filters: PolicyFilters) => {
    // In a real app, this would save to backend
    console.log('Save preset:', name, filters);
  };

  const handleLoadPreset = (presetFilters: PolicyFilters) => {
    setFilters(presetFilters);
  };

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
          <p className="text-muted-foreground">
            Create and manage attribute-based access control policies for Carmen ERP resources.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button onClick={handleCreatePolicy}>
            <Plus className="mr-2 h-4 w-4" />
            Create Policy
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <PolicyFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          savedPresets={savedPresets}
        />
      )}

      {/* Policy List */}
      <PolicyList
        onCreatePolicy={handleCreatePolicy}
        onEditPolicy={handleEditPolicy}
        onViewPolicy={handleViewPolicy}
      />
    </div>
  );
}