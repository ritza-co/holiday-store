'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedProducts } from '@/lib/data'
import { CartManager } from '@/components/ShoppingCart'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [promoData, setPromoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Simulate slow API calls that impact TTFB and block rendering
  useEffect(() => {
    const loadInitialData = async () => {
      // Simulate slow promotional banner API call (impacts TTFB)
      const promoResponse = await fetch('/api/promotions', { 
        cache: 'no-store' 
      })
      const promo = await promoResponse.json()
      setPromoData(promo)
      
      // Simulate slow featured products API call
      const productsResponse = await fetch('/api/featured-products', {
        cache: 'no-store'
      })
      const products = await productsResponse.json()
      setFeaturedProducts(products)
      
      setLoading(false)
    }
    
    loadInitialData()
  }, [])
  
  const handleAddToCart = (productId: string) => {
    const product = featuredProducts.find(p => p.id === productId)
    if (product) {
      CartManager.addItem(product, 1)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading amazing holiday deals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Large Hero Image that impacts LCP */}
      <section className="relative text-white">
        {/* Large hero image that will impact LCP scores */}
        <div className="relative w-full h-[600px] md:h-[800px]">
          <Image
            src="https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=1920&h=1080&fit=crop&crop=center"
            alt="Holiday decorations and gifts"
            fill
            className="object-cover"
            priority={false}
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
              {promoData?.title || 'Holiday Rush is Here!'} 🎁
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95">
              {promoData?.description || 'Discover magical gifts and festive essentials for everyone on your list. Fast shipping, amazing deals, and holiday joy delivered to your door.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="btn-primary inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-100"
              >
                Shop All Products
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                {promoData?.ctaText || 'View Holiday Deals'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-holiday-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive prices on all holiday essentials with special seasonal discounts</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
            <p className="text-gray-600">Get your holiday gifts delivered quickly with our express shipping options</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-holiday-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600">Premium quality products with hassle-free returns and customer satisfaction</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Holiday Products ⭐
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked favorites that are flying off our shelves. Don't miss out on these popular picks!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <div key={product.id} className="card group">
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.originalPrice && (
                  <span className="absolute top-3 left-3 badge-sale">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
                <span className="absolute top-3 right-3 badge-featured">
                  Featured
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{product.stock} in stock</span>
                </div>
                <button 
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full btn-primary"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/products" className="btn-secondary inline-flex items-center">
            View All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-primary-50 to-holiday-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated on Holiday Deals 📧
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Be the first to know about new arrivals, exclusive discounts, and special holiday promotions.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe Now
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}