import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Copy, Archive } from "lucide-react"

interface Recipe {
  id: string
  name: string
  category: string
  cuisine: string
  portionSize: string
  costPerPortion: number
  sellingPrice: number
  grossMargin: number
  lastUpdated: string
  status: "active" | "draft" | "archived"
}

interface RecipeListViewProps {
  recipes: Recipe[]
}

export function RecipeListView({ recipes }: RecipeListViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Cost/Portion</TableHead>
          <TableHead>Selling Price</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.category}</TableCell>
            <TableCell>${recipe.costPerPortion.toFixed(2)}</TableCell>
            <TableCell>${recipe.sellingPrice.toFixed(2)}</TableCell>
            <TableCell>{recipe.grossMargin.toFixed(1)}%</TableCell>
            <TableCell>
              <Badge
                variant={recipe.status === "active" ? "default" : "secondary"}
              >
                {recipe.status}
              </Badge>
            </TableCell>
            <TableCell>{recipe.lastUpdated}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}