'use client'

import { useState } from 'react'
import { validateCouponCode, calculateDiscount, CouponCode as CouponType } from '@/lib/data'

interface CouponCodeProps {
  orderTotal: number
  onCouponApplied?: (coupon: CouponType, discount: number) => void
  onCouponRemoved?: () => void
  appliedCoupon?: CouponType | null
  className?: string
}

export default function CouponCode({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  className = ''
}: CouponCodeProps) {
  const [couponInput, setCouponInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const validatedCoupon = validateCouponCode(couponInput, orderTotal)
      
      if (!validatedCoupon) {
        setError('Invalid or expired coupon code')
        setIsLoading(false)
        return
      }

      const discount = calculateDiscount(validatedCoupon, orderTotal)
      
      if (onCouponApplied) {
        onCouponApplied(validatedCoupon, discount)
      }
      
      setCouponInput('')
      setError('')
      setIsExpanded(false)
    } catch (err) {
      setError('Failed to apply coupon code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (onCouponRemoved) {
      onCouponRemoved()
    }
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApplyCoupon()
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {!appliedCoupon ? (
        <div className="p-4">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 transition-colors p-2 -m-2 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                <span className="font-medium text-gray-900">Have a coupon code?</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Apply Coupon Code</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase())
                      setError('')
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter coupon code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={isLoading || !couponInput.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-1">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Applying</span>
                    </div>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Available coupons:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <code className="bg-white px-2 py-1 rounded font-mono">HOLIDAY20</code>
                    <span className="text-gray-500">20% off orders $50+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-white px-2 py-1 rounded font-mono">WINTER10</code>
                    <span className="text-gray-500">$10 off orders $30+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-white px-2 py-1 rounded font-mono">FESTIVE25</code>
                    <span className="text-gray-500">25% off orders $100+</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Coupon "{appliedCoupon.code}" applied!
                </p>
                <p className="text-sm text-green-700">
                  {appliedCoupon.type === 'percentage' 
                    ? `${appliedCoupon.discount}% discount` 
                    : `$${appliedCoupon.discount} discount`}
                  {appliedCoupon.minOrder && ` (min. order $${appliedCoupon.minOrder})`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-700 hover:text-green-800 transition-colors text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}