'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  User,
  FileText,
  Globe,
  Zap,
  Star,
  Clock,
  Tag,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { 
  AttributeDefinition, 
  AttributeInspectorProps,
  AttributeSearchResult 
} from '@/lib/types/policy-builder';
import { 
  attributeCategories, 
  allAttributes, 
  searchAttributes,
  getAttributesByTag 
} from '@/lib/mock-data/policy-builder-attributes';

const categoryIcons = {
  subject: User,
  resource: FileText,
  environment: Globe,
  action: Zap
};

const dataTypeColors = {
  string: 'bg-blue-100 text-blue-800',
  number: 'bg-green-100 text-green-800',
  boolean: 'bg-purple-100 text-purple-800',
  date: 'bg-orange-100 text-orange-800',
  array: 'bg-pink-100 text-pink-800',
  object: 'bg-gray-100 text-gray-800'
};

export function AttributeInspector({
  onAttributeSelect,
  selectedAttributes = [],
  category,
  showSearch = true,
  showFavorites = true
}: AttributeInspectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(category || 'subject');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core']));
  const [favoriteAttributes, setFavoriteAttributes] = useState<Set<string>>(new Set([
    'subject.userId',
    'subject.role.name',
    'subject.department.name',
    'resource.resourceType',
    'resource.totalValue.amount',
    'environment.isBusinessHours'
  ]));

  // Search and filter attributes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = searchAttributes(searchQuery);
    return results.map(attr => ({
      attribute: attr,
      relevanceScore: calculateRelevanceScore(attr, searchQuery),
      matchType: getMatchType(attr, searchQuery) as 'name' | 'description' | 'path' | 'tag',
      highlightedText: highlightMatch(attr.displayName, searchQuery)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [searchQuery]);

  // Group attributes by tags for better organization
  const groupedAttributes = useMemo(() => {
    const categoryData = attributeCategories.find(cat => cat.category === selectedTab);
    if (!categoryData) return {};

    const groups: Record<string, AttributeDefinition[]> = {};
    
    categoryData.attributes.forEach(attr => {
      if (!attr.tags || attr.tags.length === 0) {
        if (!groups.other) groups.other = [];
        groups.other.push(attr);
      } else {
        const primaryTag = attr.tags[0]; // Use first tag as primary group
        if (!groups[primaryTag]) groups[primaryTag] = [];
        groups[primaryTag].push(attr);
      }
    });

    return groups;
  }, [selectedTab]);

  // Calculate relevance score for search
  function calculateRelevanceScore(attr: AttributeDefinition, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    if (attr.name.toLowerCase().includes(lowerQuery)) score += 10;
    if (attr.displayName.toLowerCase().includes(lowerQuery)) score += 8;
    if (attr.description.toLowerCase().includes(lowerQuery)) score += 5;
    if (attr.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 3;
    if (favoriteAttributes.has(attr.path)) score += 2;
    if (selectedAttributes.includes(attr.path)) score += 1;

    return score;
  }

  // Get match type for highlighting
  function getMatchType(attr: AttributeDefinition, query: string): string {
    const lowerQuery = query.toLowerCase();
    if (attr.name.toLowerCase().includes(lowerQuery)) return 'name';
    if (attr.displayName.toLowerCase().includes(lowerQuery)) return 'name';
    if (attr.description.toLowerCase().includes(lowerQuery)) return 'description';
    if (attr.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return 'tag';
    return 'path';
  }

  // Highlight matching text
  function highlightMatch(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Toggle favorite attribute
  const toggleFavorite = (attributePath: string) => {
    const newFavorites = new Set(favoriteAttributes);
    if (newFavorites.has(attributePath)) {
      newFavorites.delete(attributePath);
    } else {
      newFavorites.add(attributePath);
    }
    setFavoriteAttributes(newFavorites);
  };

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Render attribute item
  const renderAttributeItem = (attr: AttributeDefinition, isSearchResult = false) => {
    const isSelected = selectedAttributes.includes(attr.path);
    const isFavorite = favoriteAttributes.has(attr.path);

    return (
      <TooltipProvider key={attr.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onAttributeSelect(attr)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {isSearchResult && searchQuery ? (
                        <span dangerouslySetInnerHTML={{ __html: highlightMatch(attr.displayName, searchQuery) }} />
                      ) : (
                        attr.displayName
                      )}
                    </span>
                    <Badge variant="outline" className={`text-xs ${dataTypeColors[attr.dataType]}`}>
                      {attr.dataType}
                    </Badge>
                    {attr.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {attr.description}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-1 rounded">
                      {attr.path}
                    </code>
                    {showFavorites && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(attr.path);
                        }}
                      >
                        <Star 
                          className={`h-3 w-3 ${
                            isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    )}
                  </div>

                  {attr.tags && attr.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {attr.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {attr.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{attr.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          
          <TooltipContent side="right" className="max-w-md">
            <div className="space-y-2">
              <div className="font-semibold">{attr.displayName}</div>
              <div className="text-sm">{attr.description}</div>
              <div className="text-xs text-muted-foreground">
                <div>Path: {attr.path}</div>
                <div>Type: {attr.dataType}</div>
                {attr.examples && attr.examples.length > 0 && (
                  <div>Examples: {attr.examples.slice(0, 3).map(ex => JSON.stringify(ex)).join(', ')}</div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Attribute Inspector</span>
        </CardTitle>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {searchQuery && searchResults.length > 0 ? (
          // Search Results
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Found {searchResults.length} attributes matching "{searchQuery}"
              </div>
              {searchResults.map(result => renderAttributeItem(result.attribute, true))}
            </div>
          </ScrollArea>
        ) : (
          // Category Tabs
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-4">
                {attributeCategories.map(category => {
                  const Icon = categoryIcons[category.category];
                  return (
                    <TabsTrigger key={category.category} value={category.category} className="flex items-center space-x-1">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.displayName.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {attributeCategories.map(category => (
              <TabsContent key={category.category} value={category.category} className="mt-0">
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-4">
                    {/* Favorites Section */}
                    {showFavorites && favoriteAttributes.size > 0 && (
                      <div className="space-y-2">
                        <Collapsible open={expandedGroups.has('favorites')} onOpenChange={() => toggleGroup('favorites')}>
                          <CollapsibleTrigger className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                            {expandedGroups.has('favorites') ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Favorites</span>
                            <Badge variant="secondary" className="text-xs">
                              {Array.from(favoriteAttributes).filter(path => 
                                allAttributes.some(attr => attr.path === path && attr.category === category.category)
                              ).length}
                            </Badge>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {Array.from(favoriteAttributes)
                              .map(path => allAttributes.find(attr => attr.path === path))
                              .filter((attr): attr is AttributeDefinition => attr !== undefined && attr.category === category.category)
                              .map(attr => renderAttributeItem(attr))
                            }
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}

                    {/* Grouped Attributes */}
                    {Object.entries(groupedAttributes).map(([groupName, attributes]) => (
                      <div key={groupName} className="space-y-2">
                        <Collapsible 
                          open={expandedGroups.has(groupName)} 
                          onOpenChange={() => toggleGroup(groupName)}
                        >
                          <CollapsibleTrigger className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                            {expandedGroups.has(groupName) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Tag className="h-4 w-4" />
                            <span className="capitalize">{groupName.replace('_', ' ')}</span>
                            <Badge variant="secondary" className="text-xs">
                              {attributes.length}
                            </Badge>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {attributes.map(attr => renderAttributeItem(attr))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}