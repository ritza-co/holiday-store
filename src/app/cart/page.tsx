import ShoppingCart from '@/components/ShoppingCart'

export const metadata = {
  title: 'Shopping Cart - Holiday Rush Demo',
  description: 'Review your selected holiday items and proceed to checkout.',
}

export default function CartPage() {
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
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900">Your Holiday Cart 🛒</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShoppingCart />
      </div>

      {/* Trust Indicators */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Secure Checkout</h3>
                <p className="text-sm text-gray-600">SSL encrypted payments</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Multiple Payment Options</h3>
                <p className="text-sm text-gray-600">Card, PayPal, Apple Pay</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Satisfaction Guaranteed</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}