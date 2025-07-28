import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/lib/mock/price-management/products.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let filteredProducts = [...productsData];

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: 'An error occurred while retrieving products'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, subcategory, sku, description, unit, specifications } = body;

    // Validate required fields
    if (!name || !category || !sku) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name, category, and SKU are required'
        },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = productsData.find(product => product.sku === sku);
    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'SKU already exists',
          message: 'A product with this SKU already exists'
        },
        { status: 409 }
      );
    }

    // Create new product
    const newProduct = {
      id: `prod-${Date.now()}`,
      name,
      category,
      subcategory: subcategory || '',
      sku,
      description: description || '',
      unit: unit || 'piece',
      status: 'Active',
      assignedVendors: 0,
      lastPriceUpdate: new Date().toISOString(),
      averagePrice: 0,
      priceRange: {
        min: 0,
        max: 0
      },
      specifications: specifications || {}
    };

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: 'An error occurred while creating the product'
      },
      { status: 500 }
    );
  }
}