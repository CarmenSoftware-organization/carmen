"use client"

import React, { useState, useCallback } from 'react';
import { Search, ChevronRight, ChevronDown, Plus, Edit, Trash2, Folder, Package2, Layers3 } from 'lucide-react';
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

type CategoryType = 'CATEGORY' | 'SUBCATEGORY' | 'ITEM_GROUP';

interface CategoryItem {
  id: string;
  name: string;
  type: CategoryType;
  itemCount: number;
  children?: CategoryItem[];
  parentId?: string;
}

interface TreeNodeProps {
  item: CategoryItem;
  level: number;
  onMove: (dragId: string, hoverId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
  onAdd: (parentId: string, type: CategoryType) => void;
}

// Update the type definitions to be more specific about the hierarchy
type CategoryLevel = {
  CATEGORY: 'Category'
  SUBCATEGORY: 'Subcategory'
  ITEM_GROUP: 'Item Group'
}

const CATEGORY_LEVELS: CategoryLevel = {
  CATEGORY: 'Category',
  SUBCATEGORY: 'Subcategory',
  ITEM_GROUP: 'Item Group'
}

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

const TreeNode: React.FC<TreeNodeProps> = ({ item, level, onMove, onDelete, onEdit, onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id: item.id, type: 'CATEGORY' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (draggedItem: { id: string }) => {
      if (draggedItem.id !== item.id) {
        onMove(draggedItem.id, item.id);
      }
    }
  });

  const handleEdit = () => {
    if (newName.trim() && newName !== item.name) {
      onEdit(item.id, newName);
    }
    setIsEditing(false);
  };

  const getIndentStyle = (level: number) => {
    return {
      paddingLeft: `${level * 4 + 4}px` // Mobile-first: minimal indentation for narrow screens
    }
  }

  // Combine the refs correctly
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  // Update the level-specific styling with design system tokens
  const getLevelStyles = (type: CategoryType) => {
    switch (type) {
      case 'CATEGORY':
        return 'bg-muted/50 font-semibold border-l-4 border-l-primary/60'
      case 'SUBCATEGORY':
        return 'bg-card border-l-4 border-l-orange-400/60'
      case 'ITEM_GROUP':
        return 'bg-card border-l-4 border-l-emerald-400/60'
      default:
        return ''
    }
  }

  // Get the appropriate icon for each category type
  const getTypeIcon = (type: CategoryType) => {
    switch (type) {
      case 'CATEGORY':
        return <Folder className="h-4 w-4 text-primary/70" />
      case 'SUBCATEGORY':
        return <Package2 className="h-4 w-4 text-orange-500/70" />
      case 'ITEM_GROUP':
        return <Layers3 className="h-4 w-4 text-emerald-500/70" />
      default:
        return null
    }
  }

  // Add level-specific add button logic
  const getNextLevelType = (currentType: CategoryType): CategoryType | null => {
    switch (currentType) {
      case 'CATEGORY':
        return 'SUBCATEGORY'
      case 'SUBCATEGORY':
        return 'ITEM_GROUP'
      default:
        return null
    }
  }

  return (
    <div 
      ref={dragDropRef}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <div 
        style={getIndentStyle(level)}
        className={`
          flex flex-col sm:flex-row sm:items-center py-2 px-1.5 hover:bg-accent/50 
          ${getLevelStyles(item.type)}
          transition-all duration-200 min-h-[44px] gap-2 sm:gap-0
        `}
        role="treeitem"
        aria-expanded={item.children ? isExpanded : undefined}
        aria-selected={false}
        aria-label={`${item.name} - ${CATEGORY_LEVELS[item.type]} with ${item.itemCount} items`}
      >
        {/* Mobile Layout: Main content row */}
        <div className="flex items-center w-full sm:flex-grow">
          {item.children && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)} 
              className="h-10 w-10 p-2 hover:bg-accent flex-shrink-0 focus:ring-2 focus:ring-primary focus:ring-offset-1"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          )}
          
          {/* Icon for category type */}
          <div className="flex-shrink-0 mr-3">
            {getTypeIcon(item.type)}
          </div>
          
          {isEditing ? (
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              className="mr-2 h-8 flex-grow"
              autoFocus
            />
          ) : (
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium truncate text-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {CATEGORY_LEVELS[item.type]}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons with improved accessibility and tooltips */}
        <TooltipProvider>
          <div className="flex justify-end gap-1 w-full sm:w-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-10 w-10 p-2 hover:bg-accent hover:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit category name</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-10 w-10 p-2 hover:bg-destructive/10 hover:text-destructive focus:ring-2 focus:ring-destructive focus:ring-offset-1"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete category</p>
              </TooltipContent>
            </Tooltip>
            
            {getNextLevelType(item.type) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAdd(item.id, getNextLevelType(item.type)!)}
                    className="h-10 w-10 p-2 hover:bg-emerald-50 hover:text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                    aria-label={`Add ${CATEGORY_LEVELS[getNextLevelType(item.type)!]} to ${item.name}`}
                  >
                    <Plus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add {CATEGORY_LEVELS[getNextLevelType(item.type)!]}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onMove={onMove}
              onDelete={onDelete}
              onEdit={onEdit}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item.name}&quot;? This action cannot be undone.
              {item.children && item.children.length > 0 && (
                <p className="mt-2 text-red-600">
                  Warning: This will also delete all child items!
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(item.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function ProductCategoryTree() {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        children: type !== 'ITEM_GROUP' ? [] : undefined
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
        name: newName.trim()
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

  const filterCategories = useCallback((items: CategoryItem[], query: string): CategoryItem[] => {
    return items.map(item => ({
      ...item,
      children: item.children ? filterCategories(item.children, query) : undefined
    })).filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.children && item.children.length > 0)
    );
  }, []);

  const filteredCategories = searchQuery
    ? filterCategories(categories, searchQuery)
    : categories;

  // Add new top-level category
  const handleAddTopLevel = useCallback(() => {
    setCategories(prevCategories => {
      const newCategory: CategoryItem = {
        id: generateId(),
        name: `New ${CATEGORY_LEVELS.CATEGORY}`,
        type: 'CATEGORY',
        itemCount: 0,
        children: []
      };
      return [...prevCategories, newCategory];
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Toolbar Section */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search categories, subcategories, and item groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-full focus:ring-2 focus:ring-primary"
              aria-label="Search categories"
            />
          </div>
          <Button
            onClick={handleAddTopLevel}
            className="h-11 px-6 w-full sm:w-auto flex-shrink-0 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Add new top-level category"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Category</span>
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-primary/70" />
            <span>Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-orange-500/70" />
            <span>Subcategories</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-emerald-500/70" />
            <span>Item Groups</span>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="bg-card border rounded-lg shadow-sm w-full overflow-hidden" role="tree" aria-label="Product categories tree">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-2">No categories found</div>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="text-sm"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredCategories.map((category, index) => (
            <React.Fragment key={category.id}>
              <TreeNode
                item={category}
                level={0}
                onMove={handleMove}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
              {index < filteredCategories.length - 1 && <Separator />}
            </React.Fragment>
          ))
        )}
      </div>
    </DndProvider>
  );
}
