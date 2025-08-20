'use client'

import { useState, useEffect } from 'react'
import { CartManager } from './ShoppingCart'

export default function Header() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Set initial cart count
    setCartCount(CartManager.getItemCount())

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(CartManager.getItemCount())
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
              🎄 Holiday Rush
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</a>
            <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">Products</a>
            <a href="/cart" className="text-gray-700 hover:text-primary-600 transition-colors">Cart</a>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>
            <button className="md:hidden p-2 text-gray-700 hover:text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}