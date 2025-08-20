'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItem, Product } from '@/lib/data'
import * as Sentry from '@sentry/nextjs'

interface ShoppingCartProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

// Simple localStorage-based cart management
class CartManager {
  private static CART_KEY = 'holiday-rush-cart'

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
      const cart = localStorage.getItem(this.CART_KEY)
      return cart ? JSON.parse(cart) : []
    } catch (error) {
      console.error('Error loading cart:', error)
      return []
    }
  }

  static saveCart(cart: CartItem[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  static addItem(product: Product, quantity: number = 1): void {
    const cart = this.getCart()
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock)
    } else {
      cart.push({ ...product, quantity: Math.min(quantity, product.stock) })
    }
    
    this.saveCart(cart)
  }

  static updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCart()
    const item = cart.find(item => item.id === productId)
    
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = Math.min(quantity, item.stock)
        this.saveCart(cart)
      }
    }
  }

  static removeItem(productId: string): void {
    const cart = this.getCart()
    const updatedCart = cart.filter(item => item.id !== productId)
    this.saveCart(updatedCart)
  }

  static clearCart(): void {
    this.saveCart([])
  }

  static getItemCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0)
  }

  static getSubtotal(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}

export { CartManager }

export default function ShoppingCart({ isOpen = false, onClose, className = '' }: ShoppingCartProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<any>(null)

  useEffect(() => {
    const currentCart = CartManager.getCart()
    setCart(currentCart)
    setIsLoading(false)

    // Calculate shipping when cart has items
    if (currentCart.length > 0) {
      calculateShippingRates(currentCart)
    }

    const handleCartUpdate = (event: CustomEvent) => {
      setCart(event.detail)
      if (event.detail.length > 0) {
        calculateShippingRates(event.detail)
      } else {
        setShippingRates([])
        setSelectedShipping(null)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
    }
  }, [])

  const calculateShippingRates = async (cartItems: CartItem[]) => {
    setShippingLoading(true)
    
    try {
      await Sentry.startSpan(
        {
          op: 'shipping_calculation_request',
          name: 'calculate_shipping_from_cart',
          attributes: {
            'cart.items_count': cartItems.length,
            'cart.total_value': cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          }
        },
        async () => {
          // Add breadcrumb for shipping calculation start
          Sentry.addBreadcrumb({
            message: 'Starting shipping rate calculation from cart',
            category: 'shipping',
            level: 'info',
            data: {
              items: cartItems.length,
              total_value: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }
          })

          const shippingRequest = {
            items: cartItems.map(item => ({
              id: item.id,
              weight: 1.5, // Default weight in lbs
              dimensions: {
                length: 6,
                width: 4,
                height: 2
              }
            })),
            destination: {
              zipCode: '94105', // Default SF zip for demo
              state: 'CA',
              country: 'US'
            }
          }

          const response = await fetch('/api/shipping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(shippingRequest),
          })

          if (!response.ok) {
            throw new Error('Failed to calculate shipping rates')
          }

          const data = await response.json()
          setShippingRates(data.rates)
          
          // Auto-select standard shipping
          const standardRate = data.rates.find((rate: any) => rate.carrier === 'standard')
          if (standardRate) {
            setSelectedShipping(standardRate)
          }

          // Add success breadcrumb
          Sentry.addBreadcrumb({
            message: 'Shipping rates calculated successfully',
            category: 'shipping',
            level: 'info',
            data: {
              rates_count: data.rates.length,
              selected_carrier: standardRate?.carrier
            }
          })
        }
      )
    } catch (error) {
      console.error('Failed to calculate shipping:', error)
      Sentry.captureException(error, {
        tags: {
          'shipping.operation': 'rate_calculation',
          'shipping.context': 'cart'
        },
        extra: {
          cart_items_count: cartItems.length
        }
      })
      
      // Fallback to default shipping
      setSelectedShipping({
        carrier: 'standard',
        rate: 9.99,
        estimatedDays: 5,
        service: 'standard_shipping'
      })
    } finally {
      setShippingLoading(false)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    CartManager.updateQuantity(productId, quantity)
  }

  const removeItem = (productId: string) => {
    CartManager.removeItem(productId)
  }

  const clearCart = () => {
    CartManager.clearCart()
  }

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const shipping = selectedShipping ? selectedShipping.rate : (subtotal > 50 ? 0 : 9.99)
  const total = subtotal + tax + shipping

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added any festive items yet!
        </p>
        <Link href="/products" className="btn-primary inline-flex items-center">
          Start Shopping
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Cart Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          Shopping Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{item.description}</p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-primary-600">${item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {item.quantity >= item.stock && (
                  <p className="text-xs text-orange-600 mt-1">
                    Maximum quantity reached ({item.stock} available)
                  </p>
                )}
              </div>

              {/* Item Total */}
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            {shippingLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                <span className="text-gray-500">Calculating...</span>
              </div>
            ) : (
              <span className={shipping === 0 ? 'text-green-600' : ''}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                {selectedShipping && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({selectedShipping.carrier} - {selectedShipping.estimatedDays} days)
                  </span>
                )}
              </span>
            )}
          </div>
          {selectedShipping && selectedShipping.rate > 0 && !shippingLoading && (
            <p className="text-xs text-gray-600">
              Estimated delivery: {selectedShipping.estimatedDays} business days
            </p>
          )}
          {shippingLoading && (
            <p className="text-xs text-orange-600">
              Please wait while we calculate shipping costs for your location...
            </p>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {shippingLoading ? (
            <button 
              disabled
              className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Calculating Shipping...</span>
              </div>
            </button>
          ) : (
            <Link 
              href="/checkout"
              className="w-full btn-primary text-center block"
            >
              Proceed to Checkout
            </Link>
          )}
          <div className="flex space-x-3">
            <Link 
              href="/products"
              className="flex-1 btn-secondary text-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}