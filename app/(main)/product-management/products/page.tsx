'use client'
import React from 'react';
import ProductList from '../components/product-list';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div className="container mx-auto p-4">
      <ProductList onBack={() => {}} />
      <Link href="/" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded inline-block">
        Back to Home
      </Link>
    </div>
  );
}