import ProductCategoryTree from "./components/category-list"

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6 mt-10">Category Lists</h1>
      <ProductCategoryTree />
    </div>
  )
} 