'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, Import, Printer, Search, ChevronDown, ChevronRight, MoreVertical, Edit, Trash2, FolderTree } from 'lucide-react'

type CategoryType = 'Main' | 'Sub' | 'Group'

type Category = {
  id: string
  name: string
  code: string
  taxAccount: string
  categoryType: CategoryType
  priceDeviation: string
  quantityDeviation: string
  active: boolean
  description: string
  subcategories: Category[]
}

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    code: 'ELEC',
    taxAccount: 'TA-001',
    categoryType: 'Main',
    priceDeviation: '5%',
    quantityDeviation: '10%',
    active: true,
    description: 'All electronic devices and accessories',
    subcategories: [
      {
        id: '1-1',
        name: 'Computers',
        code: 'ELEC-COMP',
        taxAccount: 'TA-001-1',
        categoryType: 'Sub',
        priceDeviation: '4%',
        quantityDeviation: '8%',
        active: true,
        description: 'Computer devices and accessories',
        subcategories: [
          {
            id: '1-1-1',
            name: 'Laptops',
            code: 'ELEC-COMP-LAP',
            taxAccount: 'TA-001-1-1',
            categoryType: 'Group',
            priceDeviation: '3%',
            quantityDeviation: '7%',
            active: true,
            description: 'Portable computers',
            subcategories: []
          },
          {
            id: '1-1-2',
            name: 'Desktops',
            code: 'ELEC-COMP-DESK',
            taxAccount: 'TA-001-1-2',
            categoryType: 'Group',
            priceDeviation: '3%',
            quantityDeviation: '6%',
            active: true,
            description: 'Stationary computers',
            subcategories: []
          }
        ]
      },
      {
        id: '1-2',
        name: 'Smartphones',
        code: 'ELEC-SMART',
        taxAccount: 'TA-001-2',
        categoryType: 'Sub',
        priceDeviation: '3%',
        quantityDeviation: '7%',
        active: true,
        description: 'Mobile phones and smartphones',
        subcategories: [
          {
            id: '1-2-1',
            name: 'Android Phones',
            code: 'ELEC-SMART-AND',
            taxAccount: 'TA-001-2-1',
            categoryType: 'Group',
            priceDeviation: '2%',
            quantityDeviation: '5%',
            active: true,
            description: 'Smartphones running Android OS',
            subcategories: []
          },
          {
            id: '1-2-2',
            name: 'iOS Phones',
            code: 'ELEC-SMART-IOS',
            taxAccount: 'TA-001-2-2',
            categoryType: 'Group',
            priceDeviation: '2%',
            quantityDeviation: '5%',
            active: true,
            description: 'Smartphones running iOS',
            subcategories: []
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Clothing',
    code: 'CLTH',
    taxAccount: 'TA-002',
    categoryType: 'Main',
    priceDeviation: '8%',
    quantityDeviation: '15%',
    active: true,
    description: 'All types of clothing and apparel',
    subcategories: [
      {
        id: '2-1',
        name: 'Men\'s Wear',
        code: 'CLTH-MEN',
        taxAccount: 'TA-002-1',
        categoryType: 'Sub',
        priceDeviation: '6%',
        quantityDeviation: '12%',
        active: true,
        description: 'Clothing for men',
        subcategories: [
          {
            id: '2-1-1',
            name: 'Men\'s Shirts',
            code: 'CLTH-MEN-SHRT',
            taxAccount: 'TA-002-1-1',
            categoryType: 'Group',
            priceDeviation: '5%',
            quantityDeviation: '10%',
            active: true,
            description: 'Shirts for men',
            subcategories: []
          },
          {
            id: '2-1-2',
            name: 'Men\'s Pants',
            code: 'CLTH-MEN-PANT',
            taxAccount: 'TA-002-1-2',
            categoryType: 'Group',
            priceDeviation: '5%',
            quantityDeviation: '10%',
            active: true,
            description: 'Pants for men',
            subcategories: []
          }
        ]
      },
      {
        id: '2-2',
        name: 'Women\'s Wear',
        code: 'CLTH-WMN',
        taxAccount: 'TA-002-2',
        categoryType: 'Sub',
        priceDeviation: '7%',
        quantityDeviation: '13%',
        active: true,
        description: 'Clothing for women',
        subcategories: [
          {
            id: '2-2-1',
            name: 'Women\'s Dresses',
            code: 'CLTH-WMN-DRESS',
            taxAccount: 'TA-002-2-1',
            categoryType: 'Group',
            priceDeviation: '6%',
            quantityDeviation: '11%',
            active: true,
            description: 'Dresses for women',
            subcategories: []
          },
          {
            id: '2-2-2',
            name: 'Women\'s Skirts',
            code: 'CLTH-WMN-SKIRT',
            taxAccount: 'TA-002-2-2',
            categoryType: 'Group',
            priceDeviation: '6%',
            quantityDeviation: '11%',
            active: true,
            description: 'Skirts for women',
            subcategories: []
          }
        ]
      }
    ]
  }
]

export function CategoryManagement() {
  const [categories] = useState<Category[]>(initialCategories)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleEdit = (categoryId: string) => {
    console.log(`Edit category ${categoryId}`)
    // Implement edit functionality
  }

  const handleDelete = (categoryId: string) => {
    console.log(`Delete category ${categoryId}`)
    // Implement delete functionality
  }

  const handleRecategorize = (categoryId: string) => {
    console.log(`Recategorize category ${categoryId}`)
    // Implement recategorize functionality
  }

  const renderCategoryRow = (category: Category, depth = 0): React.ReactNode => {
    const isExpanded = expandedCategories.has(category.id)
    return (
      <>
        <TableRow key={category.id} className={depth > 0 ? 'bg-gray-100' : ''}>
          <TableCell className="font-medium">
            <div className="flex items-center">
              {category.subcategories.length > 0 && (
                <Button variant="ghost" size="sm" className="mr-2 p-0" onClick={() => toggleExpand(category.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              <span className={`ml-${depth * 4}`}>{category.name}</span>
            </div>
          </TableCell>
          <TableCell>{category.code}</TableCell>
          <TableCell>{category.taxAccount}</TableCell>
          <TableCell>{category.categoryType}</TableCell>
          <TableCell>{category.priceDeviation}</TableCell>
          <TableCell>{category.quantityDeviation}</TableCell>
          <TableCell>
            <Checkbox checked={category.active} />
          </TableCell>
          <TableCell>{category.description}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(category.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(category.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRecategorize(category.id)}>
                  <FolderTree className="mr-2 h-4 w-4" />
                  <span>Recategorize</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && category.subcategories.map(subcat => renderCategoryRow(subcat, depth + 1))}
      </>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Category
          </Button>
          <Button variant="outline">
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="mb-4 relative w-1/4">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white text-gray-900 border-gray-300"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Tax Account</TableHead>
            <TableHead>Category Type</TableHead>
            <TableHead>Price Deviation</TableHead>
            <TableHead>Quantity Deviation</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => renderCategoryRow(category))}
        </TableBody>
      </Table>
    </div>
  )
}