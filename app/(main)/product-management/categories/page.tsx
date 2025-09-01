import ProductCategoryTree from "./components/category-list"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Product Categories
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button className="h-8 px-3 text-xs font-medium">
            <Plus className="h-3 w-3 mr-1" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <ProductCategoryTree />
      </main>
    </div>
  )
} 