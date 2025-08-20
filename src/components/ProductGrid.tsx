'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Product, categories } from '@/lib/data'
import { CartManager } from './ShoppingCart'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort products
    switch (sortBy) {
      case 'featured':
        return filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
        return filtered.sort((a, b) => b.id.localeCompare(a.id))
      default:
        return filtered
    }
  }, [products, selectedCategory, sortBy, searchQuery])

  const handleAddToCart = (product: Product) => {
    CartManager.addItem(product, 1)
    
    // Show success feedback
    const button = document.activeElement as HTMLButtonElement
    if (button) {
      const originalText = button.textContent
      button.textContent = 'Added! ✓'
      button.disabled = true
      setTimeout(() => {
        button.textContent = originalText
        button.disabled = false
      }, 2000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredAndSortedProducts.length} products
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSortBy('featured')
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <div
              key={product.id}
              className="card group animate-fade-in hover:scale-105 transition-transform duration-200"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.originalPrice && (
                    <span className="badge-sale">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  {product.featured && (
                    <span className="badge-featured">
                      ⭐ Featured
                    </span>
                  )}
                  {product.stock <= 5 && (
                    <span className="badge bg-orange-100 text-orange-800">
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-primary-600">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    product.stock > 10 
                      ? 'text-green-600' 
                      : product.stock > 0 
                        ? 'text-orange-600' 
                        : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <span className="text-gray-500 capitalize">{product.category}</span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-primary hover:shadow-lg'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (for pagination simulation) */}
      {filteredAndSortedProducts.length > 12 && (
        <div className="text-center pt-8">
          <button className="btn-secondary">
            Load More Products
          </button>
        </div>
      )}
    </div>
  )
}