"use client"

import React, { useState, useCallback, useMemo, memo } from 'react';
import { Search, ChevronRight, ChevronDown, Plus, Edit, Trash2, Folder, Package2, Layers3, GripVertical, X, AlertTriangle } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Import centralized types
import { CategoryType, CategoryItem, CategoryTreeOperations, CategoryDragItem } from '@/lib/types';

// Import mobile optimizations
import { ScrollToTop, NetworkStatus, CategorySkeleton, TouchFeedback, triggerHapticFeedback } from './mobile-optimizations';

interface TreeNodeProps extends CategoryTreeOperations {
  item: CategoryItem;
  level: number;
  isSearching?: boolean;
  searchTerm?: string;
}

// Category level constants with better type safety
const CATEGORY_LEVELS = {
  CATEGORY: 'Category',
  SUBCATEGORY: 'Subcategory',
  ITEM_GROUP: 'Item Group'
} as const;

type CategoryLevel = typeof CATEGORY_LEVELS[keyof typeof CATEGORY_LEVELS];

const initialCategories: CategoryItem[] = [
  {
    id: '1',
    name: 'Raw Materials',
    type: 'CATEGORY',
    itemCount: 150,
    children: [
      {
        id: '1-1',
        name: 'Coffee Beans',
        type: 'SUBCATEGORY',
        itemCount: 45,
        children: [
          {
            id: '1-1-1',
            name: 'Arabica',
            type: 'ITEM_GROUP',
            itemCount: 25
          },
          {
            id: '1-1-2',
            name: 'Robusta',
            type: 'ITEM_GROUP',
            itemCount: 20
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Packaging',
    type: 'CATEGORY',
    itemCount: 75,
    children: [
      {
        id: '2-1',
        name: 'Cups',
        type: 'SUBCATEGORY',
        itemCount: 30,
        children: [
          {
            id: '2-1-1',
            name: 'Paper Cups',
            type: 'ITEM_GROUP',
            itemCount: 15
          }
        ]
      }
    ]
  }
];

const TreeNode = memo<TreeNodeProps>(({ item, level, onMove, onDelete, onEdit, onAdd, isSearching, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(item.isExpanded ?? true);
  const [isEditing, setIsEditing] = useState(item.isEditing ?? false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const [{ isDragging }, drag, dragPreview] = useDrag<CategoryDragItem, void, { isDragging: boolean }>({
    type: 'CATEGORY',
    item: { id: item.id, type: 'CATEGORY' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<CategoryDragItem, void, { isOver: boolean }>({
    accept: 'CATEGORY',
    drop: (draggedItem: CategoryDragItem) => {
      if (draggedItem.id !== item.id) {
        onMove(draggedItem.id, item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleEdit = useCallback(() => {
    if (newName.trim() && newName !== item.name) {
      onEdit(item.id, newName.trim());
    }
    setIsEditing(false);
  }, [newName, item.name, item.id, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setNewName(item.name);
      setIsEditing(false);
    }
  }, [handleEdit, item.name]);

  const getIndentStyle = useMemo(() => ({
    paddingLeft: `${Math.max(level * 20 + 16, 16)}px`, // Better visual hierarchy
    borderLeft: level > 0 ? '1px solid hsl(var(--border))' : 'none'
  }), [level]);

  // Memoized level-specific styling with enhanced visual hierarchy
  const levelStyles = useMemo(() => {
    const baseStyles = 'transition-all duration-200 ease-in-out';
    
    switch (item.type) {
      case 'CATEGORY':
        return cn(baseStyles, 'bg-muted/50 hover:bg-muted/70 font-semibold border-l-4 border-l-primary/60 shadow-sm');
      case 'SUBCATEGORY':
        return cn(baseStyles, 'bg-card hover:bg-muted/30 border-l-4 border-l-orange-400/60');
      case 'ITEM_GROUP':
        return cn(baseStyles, 'bg-card hover:bg-muted/30 border-l-4 border-l-emerald-400/60');
      default:
        return baseStyles;
    }
  }, [item.type]);

  // Memoized type icon component
  const TypeIcon = useMemo(() => {
    const iconProps = { className: "h-3 w-3 flex-shrink-0" };
    
    switch (item.type) {
      case 'CATEGORY':
        return <Folder {...iconProps} className={cn(iconProps.className, "text-primary/70")} />;
      case 'SUBCATEGORY':
        return <Package2 {...iconProps} className={cn(iconProps.className, "text-orange-500/70")} />;
      case 'ITEM_GROUP':
        return <Layers3 {...iconProps} className={cn(iconProps.className, "text-emerald-500/70")} />;
      default:
        return null;
    }
  }, [item.type]);

  // Memoized next level type calculation
  const nextLevelType = useMemo((): CategoryType | null => {
    switch (item.type) {
      case 'CATEGORY':
        return 'SUBCATEGORY';
      case 'SUBCATEGORY':
        return 'ITEM_GROUP';
      default:
        return null;
    }
  }, [item.type]);

  // Highlight search term in item name
  const highlightedName = useMemo(() => {
    if (!searchTerm || !item.name) return item.name;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return item.name.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  }, [item.name, searchTerm]);

  // Optimized ref combination with proper typing
  const dragDropRef = useCallback((node: HTMLDivElement | null) => {
    drag(drop(node));
  }, [drag, drop]);

  return (
    <TouchFeedback onTouch={() => triggerHapticFeedback('light')}>
      <div 
        ref={dragPreview}
        className={cn(
          "relative group",
          isDragging && "opacity-50 scale-95",
          isOver && "ring-2 ring-primary/50 ring-offset-2"
        )}
      >
      <div 
        ref={dragDropRef}
        style={getIndentStyle}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center py-2 px-3",
          "gap-2 sm:gap-3 cursor-pointer",
          "hover:shadow-md hover:scale-[1.01]",
          levelStyles,
          isSearching && "animate-in fade-in-50 slide-in-from-left-5 duration-300"
        )}
        role="treeitem"
        aria-expanded={item.children ? isExpanded : undefined}
        aria-selected={false}
        aria-label={`${item.name} - ${CATEGORY_LEVELS[item.type]} with ${item.itemCount} items`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (item.children) setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* Drag handle - visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        </div>

        {/* Main content row with improved layout */}
        <div className="flex items-center w-full sm:flex-grow gap-2">
          {item.children && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }} 
              className={cn(
                "h-6 w-6 p-0 hover:bg-accent flex-shrink-0",
                "focus:ring-2 focus:ring-primary focus:ring-offset-1",
                "transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
          
          {/* Type icon with better spacing */}
          <div className="flex-shrink-0">
            {TypeIcon}
          </div>
          
          {isEditing ? (
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyDown}
              className="flex-grow h-9 text-sm"
              autoFocus
              placeholder="Enter category name"
            />
          ) : (
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="font-medium truncate text-foreground text-xs">
                  {highlightedName}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-normal px-2 py-0.5",
                      item.type === 'CATEGORY' && "bg-primary/10 text-primary",
                      item.type === 'SUBCATEGORY' && "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                      item.type === 'ITEM_GROUP' && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    )}
                  >
                    {CATEGORY_LEVELS[item.type]}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
                    {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons with enhanced interactions */}
        <TooltipProvider>
          <div className={cn(
            "flex gap-1 opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200 sm:w-auto w-full justify-end",
            isEditing && "opacity-100"
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className={cn(
                    "h-6 w-6 p-0 hover:bg-accent hover:text-primary",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    "transition-all duration-200 hover:scale-110"
                  )}
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Edit category name</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className={cn(
                    "h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive",
                    "focus:ring-2 focus:ring-destructive focus:ring-offset-1",
                    "transition-all duration-200 hover:scale-110"
                  )}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Delete category</p>
              </TooltipContent>
            </Tooltip>
            
            {nextLevelType && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(item.id, nextLevelType);
                    }}
                    className={cn(
                      "h-6 w-6 p-0 hover:bg-emerald-50 hover:text-emerald-600",
                      "dark:hover:bg-emerald-900/20",
                      "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
                      "transition-all duration-200 hover:scale-110"
                    )}
                    aria-label={`Add ${CATEGORY_LEVELS[nextLevelType]} to ${item.name}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Add {CATEGORY_LEVELS[nextLevelType]}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Children with animation */}
      {isExpanded && item.children && (
        <div className={cn(
          "animate-in slide-in-from-top-2 fade-in-50 duration-300",
          "border-l border-muted-foreground/20 ml-4"
        )}>
          {item.children.map((child, index) => (
            <div key={child.id} style={{ animationDelay: `${index * 50}ms` }}>
              <TreeNode
                item={child}
                level={level + 1}
                onMove={onMove}
                onDelete={onDelete}
                onEdit={onEdit}
                onAdd={onAdd}
                isSearching={isSearching}
                searchTerm={searchTerm}
              />
            </div>
          ))}
        </div>
      )}

      {/* Enhanced delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>?</p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone and will remove this {CATEGORY_LEVELS[item.type].toLowerCase()}.
              </p>
              {item.children && item.children.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warning: Cascade Delete
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    This will also permanently delete all {item.children.length} child {item.children.length === 1 ? 'item' : 'items'}!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mr-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(item.id);
                setShowDeleteDialog(false);
              }}
              className={cn(
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                "focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {CATEGORY_LEVELS[item.type]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TouchFeedback>
  );
});

// Add display name for better debugging
TreeNode.displayName = 'TreeNode';

// Main component with comprehensive optimizations
export default function ProductCategoryTree() {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Helper function to generate unique ID
  const generateId = () => {
    return Math.random().toString(36).slice(2, 11);
  };

  // Helper function to find and update category in tree
  const updateCategoryTree = useCallback((
    items: CategoryItem[],
    id: string,
    updateFn: (item: CategoryItem) => CategoryItem
  ): CategoryItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return updateFn(item);
      }
      if (item.children) {
        return {
          ...item,
          children: updateCategoryTree(item.children, id, updateFn)
        };
      }
      return item;
    });
  }, []);

  // Helper function to find category by id
  const findCategory = useCallback((items: CategoryItem[], id: string): CategoryItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findCategory(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Add new category
  const handleAdd = useCallback((parentId: string, type: CategoryType) => {
    setCategories(prevCategories => {
      const newItem: CategoryItem = {
        id: generateId(),
        name: `New ${CATEGORY_LEVELS[type]}`,
        type,
        itemCount: 0,
        parentId,
        children: type !== 'ITEM_GROUP' ? [] : undefined,
        isEditing: true // Start in edit mode
      };

      const updateParent = (item: CategoryItem): CategoryItem => ({
        ...item,
        children: [...(item.children || []), newItem]
      });

      return updateCategoryTree(prevCategories, parentId, updateParent);
    });
  }, [updateCategoryTree]);

  // Edit category name
  const handleEdit = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;

    setCategories(prevCategories => 
      updateCategoryTree(prevCategories, id, item => ({
        ...item,
        name: newName.trim(),
        isEditing: false
      }))
    );
  }, [updateCategoryTree]);

  // Delete category and its children
  const handleDelete = useCallback((id: string) => {
    setCategories(prevCategories => {
      const deleteFromArray = (items: CategoryItem[]): CategoryItem[] => 
        items.filter(item => {
          if (item.id === id) return false;
          if (item.children) {
            item.children = deleteFromArray(item.children);
          }
          return true;
        });

      return deleteFromArray(prevCategories);
    });
  }, []);

  // Move category (drag and drop)
  const handleMove = useCallback((dragId: string, targetId: string) => {
    setCategories(prevCategories => {
      const draggedItem = findCategory(prevCategories, dragId);
      const targetItem = findCategory(prevCategories, targetId);

      if (!draggedItem || !targetItem) return prevCategories;
      if (draggedItem.type !== targetItem.type) return prevCategories;

      // Remove dragged item from its original position
      const removeItem = (items: CategoryItem[]): CategoryItem[] =>
        items.filter(item => {
          if (item.id === dragId) return false;
          if (item.children) {
            item.children = removeItem(item.children);
          }
          return true;
        });

      // Add dragged item to new position
      const addItem = (items: CategoryItem[]): CategoryItem[] =>
        items.map(item => {
          if (item.id === targetId) {
            return {
              ...item,
              children: [...(item.children || []), { ...draggedItem, parentId: targetId }]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addItem(item.children)
            };
          }
          return item;
        });

      const categoriesWithoutDraggedItem = removeItem(prevCategories);
      return addItem(categoriesWithoutDraggedItem);
    });
  }, [findCategory]);

  // Optimized search with memoization and debouncing
  const filterCategories = useCallback((items: CategoryItem[], query: string): CategoryItem[] => {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    
    return items.reduce<CategoryItem[]>((acc, item) => {
      const matchesName = item.name.toLowerCase().includes(lowercaseQuery);
      const filteredChildren = item.children ? filterCategories(item.children, query) : undefined;
      const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;
      
      if (matchesName || hasMatchingChildren) {
        acc.push({
          ...item,
          children: filteredChildren,
          isExpanded: hasMatchingChildren ? true : item.isExpanded // Auto-expand if children match
        });
      }
      
      return acc;
    }, []);
  }, []);

  const filteredCategories = useMemo(
    () => filterCategories(categories, searchQuery),
    [categories, searchQuery, filterCategories]
  );

  // Optimized handlers with better state management
  const handleAddTopLevel = useCallback(() => {
    setCategories(prevCategories => {
      const newCategory: CategoryItem = {
        id: generateId(),
        name: `New ${CATEGORY_LEVELS.CATEGORY}`,
        type: 'CATEGORY',
        itemCount: 0,
        children: [],
        isExpanded: true,
        isEditing: true // Start in edit mode
      };
      return [...prevCategories, newCategory];
    });
  }, []);

  // Performance metrics for debugging
  const categoryStats = useMemo(() => {
    const totalItems = categories.reduce((sum, cat) => sum + cat.itemCount, 0);
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => 
      sum + (cat.children?.length || 0), 0
    );
    const totalItemGroups = categories.reduce((sum, cat) => 
      sum + (cat.children?.reduce((subSum, sub) => 
        subSum + (sub.children?.length || 0), 0) || 0), 0
    );
    
    return { totalItems, totalCategories, totalSubcategories, totalItemGroups };
  }, [categories]);

  return (
    <>
      <NetworkStatus />
      <DndProvider backend={HTML5Backend}>
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 sm:flex-initial sm:w-80">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
            aria-label="Search categories"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleAddTopLevel}
            className="h-8 px-3 text-xs font-medium"
            aria-label="Add new top-level category"
            disabled={isLoading}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Category
          </Button>
        </div>
      </div>
      {/* Category Statistics */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Folder className="h-3 w-3 text-primary/70" />
          <span>Categories ({categoryStats.totalCategories})</span>
        </div>
        <div className="flex items-center gap-2">
          <Package2 className="h-3 w-3 text-orange-500/70" />
          <span>Subcategories ({categoryStats.totalSubcategories})</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers3 className="h-3 w-3 text-emerald-500/70" />
          <span>Item Groups ({categoryStats.totalItemGroups})</span>
        </div>
        <div className="text-xs font-medium">
          Total Items: {categoryStats.totalItems.toLocaleString()}
        </div>
      </div>

      {/* Enhanced Tree Content */}
      <div className={cn(
        "bg-card border rounded-lg shadow-sm w-full overflow-hidden",
        "transition-all duration-200 hover:shadow-md"
      )} role="tree" aria-label="Product categories tree">
        {isLoading ? (
          <CategorySkeleton />
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4">
              {searchQuery ? (
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              ) : (
                <Folder className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              )}
            </div>
            <div className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : 'Start by creating your first product category'
              }
            </div>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mr-2"
              >
                <X className="h-4 w-4 mr-2" />
                Clear search
              </Button>
            ) : (
              <Button
                onClick={handleAddTopLevel}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCategories.map((category, index) => (
              <div 
                key={category.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-in slide-in-from-left-5 fade-in-50 duration-300"
              >
                <TreeNode
                  item={category}
                  level={0}
                  onMove={handleMove}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onAdd={handleAdd}
                  isSearching={!!searchQuery}
                  searchTerm={searchQuery}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      </DndProvider>
      <ScrollToTop />
    </>
  );
}

// Performance monitoring hook (development only)
if (process.env.NODE_ENV === 'development') {
  ProductCategoryTree.displayName = 'ProductCategoryTree';
}