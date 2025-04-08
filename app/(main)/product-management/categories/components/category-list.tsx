"use client"

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus, Trash } from "lucide-react"
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu"

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
  onAdd: (parentId: string) => void;
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

const TreeNode = ({ item, level = 0, onAdd, onEdit, onDelete, onMove }: TreeNodeProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id: item.id, type: item.type },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (draggedItem: { id: string }) => {
      if (draggedItem.id !== item.id) {
        onMove(draggedItem.id, item.id);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  });

  // Combine the refs correctly
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  const handleEdit = () => {
    const newName = window.prompt('Enter new name:', item.name);
    if (newName) onEdit(item.id, newName);
  };

  const getIndentStyle = (level: number) => ({
    marginLeft: `${level * 24}px`
  });

  const getLevelStyles = (level: number) => {
    switch (level) {
      case 0:
        return 'font-semibold text-primary';
      case 1:
        return 'font-medium text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

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
    <div>
      <div
        ref={dragDropRef}
        className={cn(
          'group flex items-center justify-between py-2 px-4',
          'hover:bg-muted/50 rounded-lg cursor-pointer',
          isDragging && 'opacity-50',
          isOver && 'bg-muted/50'
        )}
        style={getIndentStyle(level)}
      >
        <div className="flex items-center gap-2">
          {item.children ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={getLevelStyles(level)}>{item.name}</span>
          <span className="text-sm text-muted-foreground">({item.itemCount})</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {getNextLevelType(item.type) && (
                <DropdownMenuItem onClick={() => onAdd(item.id)}>
                  Add {getNextLevelType(item.type)?.toLowerCase()}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {item.children && (
        <div>
          {item.children.map(child => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterType {
  field: string
  operator: string
  value: string | number | boolean | Date | null
  logicalOperator?: 'AND' | 'OR'
}

interface ProductCategoryTreeProps {
  searchQuery: string
  filters?: FilterType[]
}

export interface ProductCategoryTreeRef {
  handleAddTopLevel: () => void;
}

const ProductCategoryTree = forwardRef<ProductCategoryTreeRef, ProductCategoryTreeProps>(
  ({ searchQuery, filters = [] }, ref) => {
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

    // Helper function to generate unique ID
    const generateId = useCallback(() => {
      return Math.random().toString(36).substr(2, 9);
    }, []);

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
    const findCategory = useCallback((id: string, items: CategoryItem[]): CategoryItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findCategory(id, item.children);
          if (found) return found;
        }
      }
      return null;
    }, []);

    // Add new category
    const handleAdd = useCallback((parentId: string) => {
      const parent = findCategory(parentId, categories);
      if (parent) {
        setCategories(prevCategories => {
          const newItem: CategoryItem = {
            id: generateId(),
            name: `New ${parent.type === 'CATEGORY' ? 'Subcategory' : 'Item Group'}`,
            type: parent.type === 'CATEGORY' ? 'SUBCATEGORY' : 'ITEM_GROUP',
            itemCount: 0,
            parentId,
            children: parent.type === 'CATEGORY' ? [] : undefined
          };

          const updateParent = (item: CategoryItem): CategoryItem => ({
            ...item,
            children: [...(item.children || []), newItem]
          });

          return updateCategoryTree(prevCategories, parentId, updateParent);
        });
      }
    }, [categories, findCategory, generateId, updateCategoryTree]);

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
        const draggedItem = findCategory(dragId, prevCategories);
        const targetItem = findCategory(targetId, prevCategories);

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

    const filterCategories = useCallback((items: CategoryItem[], query: string, activeFilters: FilterType[]): CategoryItem[] => {
      return items
        .map(item => ({
          ...item,
          children: item.children ? filterCategories(item.children, query, activeFilters) : undefined
        }))
        .filter(item => {
          // First apply search query
          const matchesSearch = item.name.toLowerCase().includes(query.toLowerCase())
          
          // Then apply advanced filters
          const matchesFilters = activeFilters.length === 0 || activeFilters.every(filter => {
            const value = item[filter.field as keyof CategoryItem]
            if (!value) return false
            if (filter.value === null) return !value

            switch (filter.operator) {
              case 'equals':
                return value === filter.value
              case 'contains':
                return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
              case 'in':
                return Array.isArray(filter.value) ? filter.value.includes(value) : false
              case 'between':
                if (Array.isArray(filter.value) && filter.value.length === 2) {
                  return value >= filter.value[0] && value <= filter.value[1]
                }
                return false
              case 'greaterThan':
                return value > filter.value
              case 'lessThan':
                return value < filter.value
              default:
                return false
            }
          })

          return matchesSearch || (item.children && item.children.length > 0) || matchesFilters
        })
    }, [])

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
    }, [generateId]);

    // Expose the handleAddTopLevel function via ref
    useImperativeHandle(ref, () => ({
      handleAddTopLevel
    }));

    const filteredCategories = filterCategories(categories, searchQuery, filters)

    return (
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TreeNode
                  key={category.id}
                  item={category}
                  level={0}
                  onMove={handleMove}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onAdd={handleAdd}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filters.length > 0 
                    ? "No categories match your search criteria" 
                    : "No categories found"}
                </p>
                <Button onClick={handleAddTopLevel} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Category
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Drag and drop to reorder categories. Click on the icons to expand/collapse.</p>
            <p>Use the + button to add subcategories or item groups.</p>
          </div>
        </div>
      </DndProvider>
    );
  }
);

ProductCategoryTree.displayName = "ProductCategoryTree";

export default ProductCategoryTree;

export function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  const handleMove = (dragId: string, hoverId: string) => {
    // ... existing move logic ...
  };

  const handleDelete = (id: string) => {
    // ... existing delete logic ...
  };

  const handleEdit = (id: string, newName: string) => {
    // ... existing edit logic ...
  };

  const handleAdd = (parentId: string) => {
    // ... existing add logic ...
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {categories.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            level={0}
            onMove={handleMove}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        ))}
      </div>
    </DndProvider>
  );
}



