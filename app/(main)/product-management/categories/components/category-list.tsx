"use client"

import React, { useState, useCallback, useRef } from 'react';
import { Search, ChevronRight, ChevronDown, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
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
      paddingLeft: `${level * 7.2 + 4.8}px` // Reduced from 24px to 7.2px per level, and from 16px to 4.8px base padding
    }
  }

  // Combine the refs correctly
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  // Update the level-specific styling
  const getLevelStyles = (type: CategoryType) => {
    switch (type) {
      case 'CATEGORY':
        return 'bg-gray-50 font-semibold border-l-4 border-gray-400'
      case 'SUBCATEGORY':
        return 'bg-white border-l-4 border-blue-400'
      case 'ITEM_GROUP':
        return 'bg-white border-l-4 border-green-400'
      default:
        return ''
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
          flex items-center py-2 px-1.5 hover:bg-gray-100 
          ${getLevelStyles(item.type)}
          transition-all duration-200
        `}
      >
        {item.children && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleEdit}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
            className="border rounded px-2 py-1 mr-2"
            autoFocus
          />
        ) : (
          <div className="flex-grow">
            <span className="font-medium">{item.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {CATEGORY_LEVELS[item.type]}
            </span>
          </div>
        )}
        
        <span className="text-gray-500 text-sm mr-4">({item.itemCount})</span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:text-blue-600"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-1 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
          {getNextLevelType(item.type) && (
            <button
              onClick={() => onAdd(item.id, getNextLevelType(item.type)!)}
              className="p-1 hover:text-green-600"
              title={`Add ${CATEGORY_LEVELS[getNextLevelType(item.type)!]}`}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
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
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to generate unique ID
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Helper function to find and update category in tree
  const updateCategoryTree = (
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
  };

  // Helper function to find category by id
  const findCategory = (items: CategoryItem[], id: string): CategoryItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findCategory(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

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
  }, []);

  // Edit category name
  const handleEdit = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;

    setCategories(prevCategories => 
      updateCategoryTree(prevCategories, id, item => ({
        ...item,
        name: newName.trim()
      }))
    );
  }, []);

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
  }, []);

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
      <div className="flex justify-between items-center mb-4 w-full">
        <div className="relative flex-1 mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleAddTopLevel}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow w-full">
        {filteredCategories.map((category) => (
          <TreeNode
            key={category.id}
            item={category}
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
