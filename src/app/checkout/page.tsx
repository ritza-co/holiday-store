'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'

export default function CheckoutPage() {
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  const router = useRouter()

  const handleOrderComplete = (id: string) => {
    setOrderId(id)
    setOrderComplete(true)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-holiday-snow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Order Confirmed!
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase! Your holiday order has been successfully placed.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h2>
              <p className="text-gray-600">
                <strong>Order ID:</strong> {orderId}
              </p>
              <p className="text-gray-600">
                <strong>Confirmation email</strong> has been sent to your email address.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full btn-primary"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/products')}
                className="w-full btn-secondary"
              >
                Browse More Products
              </button>
            </div>
            
            <div className="mt-8 p-6 bg-holiday-green/10 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• We'll prepare your items for shipment</li>
                <li>• You'll receive a tracking number via email</li>
                <li>• Expected delivery: 3-5 business days</li>
                <li>• Questions? Contact our support team</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-holiday-snow">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <a href="/" className="hover:text-primary-600">Home</a>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/cart" className="hover:text-primary-600">Cart</a>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout 🔒</h1>
          <p className="text-gray-600 mt-2">
            Complete your holiday shopping with our secure, fast checkout process
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </div>

      {/* Security Banner */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Trusted Payments</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}