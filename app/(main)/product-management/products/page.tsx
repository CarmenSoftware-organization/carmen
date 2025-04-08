"use client"

import React from 'react'
import ProductList from './components/product-list'

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      <ProductList />
    </div>
  )
}