import { NextRequest, NextResponse } from 'next/server'
import { products, getProductById, getFeaturedProducts, getProductsByCategory } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const id = searchParams.get('id')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Get single product by ID
    if (id) {
      const product = getProductById(id)
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ product })
    }

    let filteredProducts = products

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = getProductsByCategory(category)
    }

    // Filter featured products
    if (featured === 'true') {
      filteredProducts = getFeaturedProducts()
    }

    // Search products
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply pagination
    const startIndex = offset ? parseInt(offset) : 0
    const endIndex = limit ? startIndex + parseInt(limit) : filteredProducts.length
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
      products: paginatedProducts,
      total: filteredProducts.length,
      count: paginatedProducts.length,
      offset: startIndex,
      hasMore: endIndex < filteredProducts.length
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would be used for admin operations to add new products
    // For now, return method not allowed
    return NextResponse.json(
      { error: 'Method not implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}