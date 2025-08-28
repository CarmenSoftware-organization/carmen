import ProductCategoryTree from "./components/category-list"

export default function CategoriesPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-10">Category Lists</h1>
      <ProductCategoryTree />
    </div>
  )
} 