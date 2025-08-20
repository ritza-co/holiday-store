'use client'

import { useState, useEffect } from 'react'
import { CartManager } from './ShoppingCart'
import CouponCode from './CouponCode'
import { CartItem, CouponCode as CouponType, calculateDiscount } from '@/lib/data'
import * as Sentry from '@sentry/nextjs'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  nameOnCard: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
  sameAsShipping: boolean
}

interface CheckoutFormProps {
  onOrderComplete?: (orderId: string) => void
  className?: string
}

export default function CheckoutForm({ onOrderComplete, className = '' }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null)
  const [discount, setDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Holiday Lane',
    apartment: 'Apt 2B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'US'
  })

  // Prepopulate forms for demo - card number will trigger payment processing error
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '4111 0001 2345 6789',
    expiryMonth: '12',
    expiryYear: '2027',
    cvv: '123',
    nameOnCard: 'John Smith',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    sameAsShipping: true
  })

  useEffect(() => {
    setCart(CartManager.getCart())
    
    // Track checkout initiation with new Sentry API
    Sentry.addBreadcrumb({
      message: 'Checkout flow initiated',
      category: 'checkout',
      level: 'info',
      data: {
        cart_items: CartManager.getCart().length,
        cart_total: CartManager.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    })
    
    // Set custom tags for this session
    Sentry.setTag('checkout.flow', 'active')
    Sentry.setContext('checkout', {
      cart_items_count: CartManager.getCart().length,
      cart_total: CartManager.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping - discount

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      // Validate shipping info
      if (!shippingInfo.firstName) newErrors.firstName = 'First name is required'
      if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required'
      if (!shippingInfo.email) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Email is invalid'
      if (!shippingInfo.address) newErrors.address = 'Address is required'
      if (!shippingInfo.city) newErrors.city = 'City is required'
      if (!shippingInfo.state) newErrors.state = 'State is required'
      if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required'
      else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zipCode)) newErrors.zipCode = 'Invalid ZIP code'
    }

    if (step === 2) {
      // Validate payment info
      if (!paymentInfo.cardNumber) newErrors.cardNumber = 'Card number is required'
      else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Invalid card number'
      if (!paymentInfo.expiryMonth) newErrors.expiryMonth = 'Expiry month is required'
      if (!paymentInfo.expiryYear) newErrors.expiryYear = 'Expiry year is required'
      if (!paymentInfo.cvv) newErrors.cvv = 'CVV is required'
      else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) newErrors.cvv = 'Invalid CVV'
      if (!paymentInfo.nameOnCard) newErrors.nameOnCard = 'Name on card is required'

      if (!paymentInfo.sameAsShipping) {
        if (!paymentInfo.billingAddress) newErrors.billingAddress = 'Billing address is required'
        if (!paymentInfo.billingCity) newErrors.billingCity = 'Billing city is required'
        if (!paymentInfo.billingState) newErrors.billingState = 'Billing state is required'
        if (!paymentInfo.billingZipCode) newErrors.billingZipCode = 'Billing ZIP code is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Payment processing function
  const processPayment = async (paymentData: {
    cardNumber: string,
    cardType: string,
    amount: number,
    currency: string
  }) => {
    // Validate card number format
    if (paymentData.cardNumber.length !== 16) {
      throw new Error('Invalid card number format')
    }
    
    // Check for problematic card sequences that cause gateway issues
    const cardDigits = paymentData.cardNumber
    const middleDigits = cardDigits.substring(4, 8)
    
    // This creates a realistic bug - certain card sequences cause payment failures
    // The bug is that we're treating legitimate card numbers as invalid
    if (middleDigits.includes('000') || middleDigits === '1234') {
      const error = new Error('Payment gateway error: Transaction declined by issuer')
      error.name = 'PaymentProcessingError'
      throw error
    }
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed'
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      // Track step completion with new Sentry API
      const stepNames = ['shipping_info', 'payment_info', 'order_review']
      const stepName = stepNames[currentStep - 1]
      
      // Use startSpan for tracking step completion
      Sentry.startSpan(
        {
          op: 'checkout_step',
          name: `complete_${stepName}`,
          attributes: {
            'checkout.step': stepName,
            'checkout.step_number': currentStep
          }
        },
        () => {
          // Add step-specific context
          if (currentStep === 1) {
            Sentry.setContext('shipping', {
              country: shippingInfo.country,
              state: shippingInfo.state
            })
          } else if (currentStep === 2) {
            Sentry.setContext('payment', {
              method: 'credit_card',
              billing_same_as_shipping: paymentInfo.sameAsShipping
            })
          }
          
          // Add breadcrumb
          Sentry.addBreadcrumb({
            message: `Checkout step completed: ${stepName}`,
            category: 'checkout',
            level: 'info',
            data: {
              step: currentStep,
              next_step: currentStep + 1
            }
          })
        }
      )
      
      setCurrentStep(currentStep + 1)
    } else {
      // Track validation errors
      Sentry.addBreadcrumb({
        message: 'Checkout step validation failed',
        category: 'checkout',
        level: 'warning',
        data: {
          step: currentStep,
          errors: Object.keys(errors)
        }
      })
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmitOrder = async () => {
    if (!validateStep(2)) return

    setIsLoading(true)
    
    try {
      // Use startSpan for payment processing tracking
      await Sentry.startSpan(
        {
          op: 'payment_processing',
          name: 'process_order_payment',
          attributes: {
            'payment.method': 'credit_card',
            'order.total': total.toFixed(2),
            'cart.items_count': cart.length,
            'coupon.applied': appliedCoupon?.code || 'none'
          }
        },
        async () => {
          // Add breadcrumb for payment start
          Sentry.addBreadcrumb({
            message: 'Payment processing started',
            category: 'payment',
            level: 'info',
            data: {
              total: total,
              items_count: cart.length
            }
          })
          
          // Simulate order processing with variable delay
          const processingDelay = Math.random() * 1000 + 1500
          await new Promise(resolve => setTimeout(resolve, processingDelay))
          
          // Process payment with card validation
          const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '')
          const cardType = cardNumber.startsWith('4') ? 'visa' : 'mastercard'
          
          // Payment gateway integration
          const paymentResult = await processPayment({
            cardNumber,
            cardType,
            amount: total,
            currency: 'USD'
          })
          
          const orderId = `HRD-${Date.now()}`
          
          // Set order context
          Sentry.setContext('order', {
            id: orderId,
            total: total,
            items_count: cart.length,
            payment_method: 'credit_card'
          })
          
          // Track conversion event
          Sentry.addBreadcrumb({
            message: 'Order completed successfully',
            category: 'conversion',
            level: 'info',
            data: {
              order_id: orderId,
              total: total,
              items_count: cart.length
            }
          })
          
          // Custom event for successful checkout
          Sentry.captureMessage('Checkout completed successfully', {
            level: 'info',
            tags: {
              'checkout.status': 'success',
              'order.id': orderId
            },
            extra: {
              order_total: total,
              cart_items_count: cart.length,
              payment_method: 'credit_card'
            }
          })
          
          CartManager.clearCart()
          
          if (onOrderComplete) {
            onOrderComplete(orderId)
          }
        }
      )
    } catch (error) {
      console.error('Order failed:', error)
      
      // Capture error
      Sentry.captureException(error, {
        tags: {
          'checkout.step': 'payment_processing',
          'payment.method': 'credit_card'
        },
        extra: {
          order_total: total,
          cart_items_count: cart.length
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCouponApplied = (coupon: CouponType, discountAmount: number) => {
    setAppliedCoupon(coupon)
    setDiscount(discountAmount)
  }

  const handleCouponRemoved = () => {
    setAppliedCoupon(null)
    setDiscount(0)
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
        <a href="/products" className="btn-primary">
          Continue Shopping
        </a>
      </div>
    )
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                Shipping
              </span>
              <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                Payment
              </span>
              <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                Review
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc.
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.apartment}
                    onChange={(e) => setShippingInfo({...shippingInfo, apartment: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                      className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNextStep} className="btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: formatCardNumber(e.target.value)})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`input-field ${errors.cardNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Month *
                    </label>
                    <select
                      value={paymentInfo.expiryMonth}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryMonth: e.target.value})}
                      className={`input-field ${errors.expiryMonth ? 'border-red-500' : ''}`}
                    >
                      <option value="">Month</option>
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    {errors.expiryMonth && <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Year *
                    </label>
                    <select
                      value={paymentInfo.expiryYear}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiryYear: e.target.value})}
                      className={`input-field ${errors.expiryYear ? 'border-red-500' : ''}`}
                    >
                      <option value="">Year</option>
                      {Array.from({length: 10}, (_, i) => {
                        const year = new Date().getFullYear() + i
                        return <option key={year} value={year}>{year}</option>
                      })}
                    </select>
                    {errors.expiryYear && <p className="text-red-500 text-sm mt-1">{errors.expiryYear}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '')})}
                      placeholder="123"
                      maxLength={4}
                      className={`input-field ${errors.cvv ? 'border-red-500' : ''}`}
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.nameOnCard}
                    onChange={(e) => setPaymentInfo({...paymentInfo, nameOnCard: e.target.value})}
                    className={`input-field ${errors.nameOnCard ? 'border-red-500' : ''}`}
                  />
                  {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      checked={paymentInfo.sameAsShipping}
                      onChange={(e) => setPaymentInfo({...paymentInfo, sameAsShipping: e.target.checked})}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                      Billing address same as shipping address
                    </label>
                  </div>

                  {!paymentInfo.sameAsShipping && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.billingAddress}
                          onChange={(e) => setPaymentInfo({...paymentInfo, billingAddress: e.target.value})}
                          className={`input-field ${errors.billingAddress ? 'border-red-500' : ''}`}
                        />
                        {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.billingCity}
                            onChange={(e) => setPaymentInfo({...paymentInfo, billingCity: e.target.value})}
                            className={`input-field ${errors.billingCity ? 'border-red-500' : ''}`}
                          />
                          {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <select
                            value={paymentInfo.billingState}
                            onChange={(e) => setPaymentInfo({...paymentInfo, billingState: e.target.value})}
                            className={`input-field ${errors.billingState ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select State</option>
                            <option value="CA">California</option>
                            <option value="NY">New York</option>
                            <option value="TX">Texas</option>
                            <option value="FL">Florida</option>
                          </select>
                          {errors.billingState && <p className="text-red-500 text-sm mt-1">{errors.billingState}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.billingZipCode}
                            onChange={(e) => setPaymentInfo({...paymentInfo, billingZipCode: e.target.value})}
                            className={`input-field ${errors.billingZipCode ? 'border-red-500' : ''}`}
                          />
                          {errors.billingZipCode && <p className="text-red-500 text-sm mt-1">{errors.billingZipCode}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button onClick={handlePrevStep} className="btn-secondary">
                    Back to Shipping
                  </button>
                  <button onClick={handleNextStep} className="btn-primary">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-gray-700">
                    <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p>{shippingInfo.address}</p>
                    {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p>{shippingInfo.email}</p>
                    {shippingInfo.phone && <p>{shippingInfo.phone}</p>}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                  <div className="text-gray-700">
                    <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                    <p>{paymentInfo.nameOnCard}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={handlePrevStep} className="btn-secondary">
                    Back to Payment
                  </button>
                  <button 
                    onClick={handleSubmitOrder} 
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <CouponCode
              orderTotal={subtotal}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon}
              className="mb-6"
            />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}