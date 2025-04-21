'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash } from "lucide-react"

interface Store {
  id: string
  code: string
  name: string
}

interface StoreAssignment {
  id: string
  storeId: string
  minimumQuantity: number
  maximumQuantity: number
}

interface StoreAssignmentProps {
  stores: Store[]
  assignments: StoreAssignment[]
  isEditing: boolean
  onAdd: (assignment: Omit<StoreAssignment, 'id'>) => void
  onUpdate: (id: string, updates: Partial<StoreAssignment>) => void
  onRemove: (id: string) => void
}

export function StoreAssignment({
  stores,
  assignments,
  isEditing,
  onAdd,
  onUpdate,
  onRemove
}: StoreAssignmentProps) {
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [minQuantity, setMinQuantity] = useState<number>(0)
  const [maxQuantity, setMaxQuantity] = useState<number>(0)

  const availableStores = stores.filter(
    store => !assignments.some(a => a.storeId === store.id)
  )

  const handleAdd = () => {
    if (!selectedStore) return

    onAdd({
      storeId: selectedStore,
      minimumQuantity: minQuantity,
      maximumQuantity: maxQuantity
    })

    // Reset form
    setSelectedStore("")
    setMinQuantity(0)
    setMaxQuantity(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store/Location Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing && (
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Store/Location</Label>
              <Select
                value={selectedStore}
                onValueChange={setSelectedStore}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {availableStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Quantity</Label>
              <Input
                type="number"
                min={0}
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum Quantity</Label>
              <Input
                type="number"
                min={0}
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(Number(e.target.value))}
              />
            </div>

            <Button
              onClick={handleAdd}
              disabled={!selectedStore || maxQuantity < minQuantity}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Code</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead className="text-right">Min Quantity</TableHead>
              <TableHead className="text-right">Max Quantity</TableHead>
              {isEditing && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const store = stores.find(s => s.id === assignment.storeId)
              if (!store) return null

              return (
                <TableRow key={assignment.id}>
                  <TableCell>{store.code}</TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0}
                        value={assignment.minimumQuantity}
                        onChange={(e) => onUpdate(assignment.id, {
                          minimumQuantity: Number(e.target.value)
                        })}
                        className="w-24 ml-auto"
                      />
                    ) : assignment.minimumQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0}
                        value={assignment.maximumQuantity}
                        onChange={(e) => onUpdate(assignment.id, {
                          maximumQuantity: Number(e.target.value)
                        })}
                        className="w-24 ml-auto"
                      />
                    ) : assignment.maximumQuantity}
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(assignment.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 