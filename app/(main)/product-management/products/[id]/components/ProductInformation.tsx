'use client'

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  subCategories: { id: string; name: string }[]
}

interface ItemGroup {
  id: string
  name: string
}

interface ProductInformationProps {
  data: {
    categoryId: string
    subCategoryId: string
    itemGroupId: string
    englishDescription: string
    localDescription: string
    taxType: string
    taxRate: number
    barCode: string
    standardCost: number
    lastCost: number
    quantityDeviation: number
    priceDeviation: number
    isUsedInRecipes: boolean
    isSoldDirectly: boolean
  }
  categories: Category[]
  itemGroups: ItemGroup[]
  isEditing: boolean
  onChange: (field: string, value: any) => void
}

export function ProductInformation({
  data,
  categories,
  itemGroups,
  isEditing,
  onChange
}: ProductInformationProps) {
  const selectedCategory = categories.find(c => c.id === data.categoryId)
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                disabled={!isEditing}
                value={data.categoryId}
                onValueChange={(value) => onChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sub Category</Label>
              <Select
                disabled={!isEditing || !selectedCategory}
                value={data.subCategoryId}
                onValueChange={(value) => onChange('subCategoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub category" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Item Group</Label>
            <Select
              disabled={!isEditing}
              value={data.itemGroupId}
              onValueChange={(value) => onChange('itemGroupId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item group" />
              </SelectTrigger>
              <SelectContent>
                {itemGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>English Description</Label>
            <Textarea
              disabled={!isEditing}
              value={data.englishDescription}
              onChange={(e) => onChange('englishDescription', e.target.value)}
              placeholder="Enter product description in English"
            />
          </div>

          <div className="space-y-2">
            <Label>Local Description</Label>
            <Textarea
              disabled={!isEditing}
              value={data.localDescription}
              onChange={(e) => onChange('localDescription', e.target.value)}
              placeholder="Enter product description in local language"
            />
          </div>

          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input
              disabled={!isEditing}
              value={data.barCode}
              onChange={(e) => onChange('barCode', e.target.value)}
              placeholder="Enter product barcode"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax & Cost Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tax Type</Label>
              <Select
                disabled={!isEditing}
                value={data.taxType}
                onValueChange={(value) => onChange('taxType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="NON_VAT">Non-VAT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={data.taxRate}
                onChange={(e) => onChange('taxRate', parseFloat(e.target.value))}
                placeholder="Enter tax rate"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard Cost</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={data.standardCost}
                onChange={(e) => onChange('standardCost', parseFloat(e.target.value))}
                placeholder="Enter standard cost"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Cost</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={data.lastCost}
                onChange={(e) => onChange('lastCost', parseFloat(e.target.value))}
                placeholder="Enter last cost"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity Deviation (%)</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={data.quantityDeviation}
                onChange={(e) => onChange('quantityDeviation', parseFloat(e.target.value))}
                min={0}
                max={100}
                placeholder="Enter quantity deviation"
              />
            </div>

            <div className="space-y-2">
              <Label>Price Deviation (%)</Label>
              <Input
                type="number"
                disabled={!isEditing}
                value={data.priceDeviation}
                onChange={(e) => onChange('priceDeviation', parseFloat(e.target.value))}
                min={0}
                max={100}
                placeholder="Enter price deviation"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recipes"
              disabled={!isEditing}
              checked={data.isUsedInRecipes}
              onCheckedChange={(checked) => onChange('isUsedInRecipes', checked)}
            />
            <Label htmlFor="recipes">Used in Recipes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="direct-sale"
              disabled={!isEditing}
              checked={data.isSoldDirectly}
              onCheckedChange={(checked) => onChange('isSoldDirectly', checked)}
            />
            <Label htmlFor="direct-sale">Sold Directly</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 