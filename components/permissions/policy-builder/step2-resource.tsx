'use client';

import React, { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  ChefHat, 
  DollarSign, 
  Settings, 
  FileText,
  Shield,
  Building,
  MapPin
} from 'lucide-react';

import { ResourceType, getResourcesByCategory, getResourceActions } from '@/lib/types/permission-resources';
import { mockDepartments, mockLocations } from '@/lib/mock-data/permission-index';

// Form schema for Step 2
const step2Schema = z.object({
  resourceTypes: z.array(z.nativeEnum(ResourceType)).min(1, 'At least one resource type must be selected'),
  dataClassifications: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  resourceValueLimit: z.number().optional(),
  customAttributes: z.array(z.object({
    attribute: z.string(),
    value: z.string()
  })).optional()
});

type Step2FormData = z.infer<typeof step2Schema>;

interface PolicyBuilderStep2Props {
  onNext: (data: Step2FormData) => void;
  onPrevious: () => void;
  onCancel: () => void;
  initialData?: Partial<Step2FormData>;
}

// Resource category mapping with icons
const resourceCategories = [
  { 
    key: 'procurement', 
    label: 'Procurement', 
    icon: ShoppingCart, 
    description: 'Purchase requests, orders, receipts, and vendor management',
    resources: getResourcesByCategory('procurement')
  },
  { 
    key: 'inventory', 
    label: 'Inventory Management', 
    icon: Warehouse, 
    description: 'Stock management, adjustments, counts, and transfers',
    resources: getResourcesByCategory('inventory')
  },
  { 
    key: 'vendor', 
    label: 'Vendor Management', 
    icon: Users, 
    description: 'Vendor profiles, contracts, and performance management',
    resources: getResourcesByCategory('vendor')
  },
  { 
    key: 'product', 
    label: 'Product Management', 
    icon: Package, 
    description: 'Product catalog, categories, and specifications',
    resources: getResourcesByCategory('product')
  },
  { 
    key: 'recipe', 
    label: 'Recipe & Menu', 
    icon: ChefHat, 
    description: 'Recipes, menu items, and culinary management',
    resources: getResourcesByCategory('recipe')
  },
  { 
    key: 'financial', 
    label: 'Financial Management', 
    icon: DollarSign, 
    description: 'Invoices, payments, budgets, and accounting',
    resources: getResourcesByCategory('financial')
  },
  { 
    key: 'system', 
    label: 'System Administration', 
    icon: Settings, 
    description: 'Users, roles, configurations, and system settings',
    resources: getResourcesByCategory('system')
  }
];

export function PolicyBuilderStep2({ onNext, onPrevious, onCancel, initialData }: PolicyBuilderStep2Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('procurement');
  const [customAttribute, setCustomAttribute] = useState({ attribute: '', value: '' });

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      resourceTypes: initialData?.resourceTypes || [],
      dataClassifications: initialData?.dataClassifications || [],
      departments: initialData?.departments || [],
      locations: initialData?.locations || [],
      resourceValueLimit: initialData?.resourceValueLimit,
      customAttributes: initialData?.customAttributes || []
    }
  });

  const watchedResourceTypes = form.watch('resourceTypes');
  const watchedCustomAttributes = form.watch('customAttributes') || [];

  // Get current category resources
  const currentCategory = resourceCategories.find(cat => cat.key === selectedCategory);
  const categoryResources = currentCategory?.resources || [];

  // Handle resource type selection
  const handleResourceToggle = (resourceType: ResourceType) => {
    const current = watchedResourceTypes;
    const updated = current.includes(resourceType)
      ? current.filter(r => r !== resourceType)
      : [...current, resourceType];
    form.setValue('resourceTypes', updated);
  };

  // Handle select all resources in category
  const handleSelectAllInCategory = () => {
    const current = watchedResourceTypes;
    const categoryResourceTypes = categoryResources;
    const allSelected = categoryResourceTypes.every(r => current.includes(r));
    
    if (allSelected) {
      // Deselect all in category
      const updated = current.filter(r => !categoryResourceTypes.includes(r));
      form.setValue('resourceTypes', updated);
    } else {
      // Select all in category
      const updated = [...new Set([...current, ...categoryResourceTypes])];
      form.setValue('resourceTypes', updated);
    }
  };

  // Add custom attribute
  const addCustomAttribute = () => {
    if (customAttribute.attribute && customAttribute.value) {
      const updated = [...watchedCustomAttributes, customAttribute];
      form.setValue('customAttributes', updated);
      setCustomAttribute({ attribute: '', value: '' });
    }
  };

  // Remove custom attribute
  const removeCustomAttribute = (index: number) => {
    const updated = watchedCustomAttributes.filter((_, i) => i !== index);
    form.setValue('customAttributes', updated);
  };

  const dataClassificationOptions = [
    { value: 'public', label: 'Public', description: 'Publicly accessible information' },
    { value: 'internal', label: 'Internal', description: 'Internal company information' },
    { value: 'confidential', label: 'Confidential', description: 'Sensitive business information' },
    { value: 'restricted', label: 'Restricted', description: 'Highly sensitive information' },
    { value: 'top_secret', label: 'Top Secret', description: 'Critical classified information' }
  ];

  // Resource type display name helper
  const getResourceDisplayName = (resourceType: ResourceType): string => {
    return resourceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Check if all resources in category are selected
  const isCategoryFullySelected = useMemo(() => {
    return categoryResources.length > 0 && 
           categoryResources.every(r => watchedResourceTypes.includes(r));
  }, [categoryResources, watchedResourceTypes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Step 2: Resource Configuration</h2>
        <p className="text-muted-foreground">
          Select the resources this policy applies to and define any additional constraints.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          {/* Resource Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Types</CardTitle>
              <CardDescription>
                Select the Carmen ERP resources this policy should control access to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {resourceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.key}
                      type="button"
                      variant={selectedCategory === category.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>

              {/* Current category info */}
              {currentCategory && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <currentCategory.icon className="h-4 w-4" />
                        {currentCategory.label}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentCategory.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllInCategory}
                    >
                      {isCategoryFullySelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Resource selection grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryResources.map((resourceType) => {
                  const isSelected = watchedResourceTypes.includes(resourceType);
                  return (
                    <div key={resourceType} className="flex items-center space-x-2">
                      <Checkbox
                        id={resourceType}
                        checked={isSelected}
                        onCheckedChange={() => handleResourceToggle(resourceType)}
                      />
                      <label 
                        htmlFor={resourceType}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {getResourceDisplayName(resourceType)}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Selected resources summary */}
              {watchedResourceTypes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Selected Resources ({watchedResourceTypes.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {watchedResourceTypes.slice(0, 10).map((resourceType) => (
                      <Badge key={resourceType} variant="secondary" className="text-xs">
                        {getResourceDisplayName(resourceType)}
                      </Badge>
                    ))}
                    {watchedResourceTypes.length > 10 && (
                      <Badge variant="secondary" className="text-xs">
                        +{watchedResourceTypes.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Classification Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Data Classification (Optional)</CardTitle>
              <CardDescription>
                Restrict policy to specific data classification levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="dataClassifications"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dataClassificationOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="dataClassifications"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      return checked
                                        ? field.onChange([...current, option.value])
                                        : field.onChange(current.filter((value) => value !== option.value));
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {option.label}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location and Department Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department Filter (Optional)
                </CardTitle>
                <CardDescription>
                  Restrict to specific departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="departments"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2">
                        {mockDepartments.map((dept) => (
                          <FormField
                            key={dept.id}
                            control={form.control}
                            name="departments"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={dept.id}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(dept.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        return checked
                                          ? field.onChange([...current, dept.id])
                                          : field.onChange(current.filter((value) => value !== dept.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm cursor-pointer">
                                    {dept.name} ({dept.code})
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Filter (Optional)
                </CardTitle>
                <CardDescription>
                  Restrict to specific locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="locations"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2">
                        {mockLocations.map((location) => (
                          <FormField
                            key={location.id}
                            control={form.control}
                            name="locations"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={location.id}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(location.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        return checked
                                          ? field.onChange([...current, location.id])
                                          : field.onChange(current.filter((value) => value !== location.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm cursor-pointer">
                                    {location.name} ({location.type})
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resource Value Limit */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Value Limit (Optional)</CardTitle>
              <CardDescription>
                Set a maximum value limit for resources affected by this policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="resourceValueLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Value (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 10000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Policy will only apply to resources with value at or below this amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Custom Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Attributes (Optional)</CardTitle>
              <CardDescription>
                Add custom resource attribute filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new custom attribute */}
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Attribute Name</label>
                  <Input
                    placeholder="e.g., resource.priority"
                    value={customAttribute.attribute}
                    onChange={(e) => setCustomAttribute({...customAttribute, attribute: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., high"
                      value={customAttribute.value}
                      onChange={(e) => setCustomAttribute({...customAttribute, value: e.target.value})}
                    />
                    <Button
                      type="button"
                      onClick={addCustomAttribute}
                      disabled={!customAttribute.attribute || !customAttribute.value}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing custom attributes */}
              {watchedCustomAttributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Custom Attributes:</h4>
                  <div className="space-y-2">
                    {watchedCustomAttributes.map((attr, index) => (
                      <Badge key={index} variant="outline" className="flex items-center justify-between p-2">
                        <span className="text-sm">{attr.attribute} = {attr.value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomAttribute(index)}
                          className="h-auto p-1 ml-2"
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous: Subject Selection
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Next: Action Assignment
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}