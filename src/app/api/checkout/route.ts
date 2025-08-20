import { NextRequest, NextResponse } from 'next/server'
import { validateCouponCode, calculateDiscount } from '@/lib/data'
import * as Sentry from '@sentry/nextjs'

interface CheckoutRequest {
  cart: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address: string
    apartment?: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentInfo: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    nameOnCard: string
    billingAddress?: string
    billingCity?: string
    billingState?: string
    billingZipCode?: string
    sameAsShipping: boolean
  }
  couponCode?: string
  sessionId?: string
}

// Simulate order storage (in a real app, this would use a database)
const orders: Record<string, any> = {}

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/checkout',
      attributes: {
        'api.route': 'checkout'
      }
    },
    async () => {
      try {
        const body: CheckoutRequest = await request.json()
        
        // Set context for this request
        Sentry.setContext('checkout_api', {
          cart_items_count: body.cart?.length || 0,
          has_coupon: !!body.couponCode
        })
        
        Sentry.addBreadcrumb({
          message: 'Checkout API request started',
          category: 'api',
          level: 'info',
          data: {
            cart_items: body.cart?.length || 0,
            has_coupon: !!body.couponCode
          }
        })
    
        // Validate required fields
        if (!body.cart || body.cart.length === 0) {
          Sentry.setTag('validation.error', 'empty_cart')
          return NextResponse.json(
            { error: 'Cart is empty' },
            { status: 400 }
          )
        }

    if (!body.shippingInfo || !body.paymentInfo) {
      return NextResponse.json(
        { error: 'Shipping and payment information required' },
        { status: 400 }
      )
    }

    // Validate shipping info
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']
    for (const field of requiredShippingFields) {
      if (!body.shippingInfo[field as keyof typeof body.shippingInfo]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate payment info
    const requiredPaymentFields = ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'nameOnCard']
    for (const field of requiredPaymentFields) {
      if (!body.paymentInfo[field as keyof typeof body.paymentInfo]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.shippingInfo.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate ZIP code
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(body.shippingInfo.zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      )
    }

    // Calculate order totals
    const subtotal = body.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99

    let discount = 0
    let appliedCoupon = null

    // Validate and apply coupon if provided
    if (body.couponCode) {
      const coupon = validateCouponCode(body.couponCode, subtotal)
      if (coupon) {
        discount = calculateDiscount(coupon, subtotal)
        appliedCoupon = coupon
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired coupon code' },
          { status: 400 }
        )
      }
    }

    const total = subtotal + tax + shipping - discount

        // Process payment with tracking
        const paymentResult = await Sentry.startSpan(
          {
            op: 'payment.process',
            name: 'Process credit card payment',
            attributes: {
              'payment.method': 'credit_card',
              'order.total': total.toString()
            }
          },
          async () => {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Simulate payment processing (in a real app, integrate with Stripe, PayPal, etc.)
            const paymentSuccessful = Math.random() > 0.05 // 95% success rate

            if (!paymentSuccessful) {
              Sentry.captureMessage('Payment processing failed', {
                level: 'warning',
                tags: {
                  'payment.status': 'failed',
                  'order.total': total.toString()
                }
              })
              
              return NextResponse.json(
                { 
                  error: 'Payment processing failed. Please check your payment details and try again.',
                  code: 'PAYMENT_FAILED'
                },
                { status: 402 }
              )
            }
            
            return true
          }
        )
        
        if (paymentResult !== true) {
          return paymentResult
        }

    // Generate order ID
    const orderId = `HRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create order record
    const order = {
      id: orderId,
      status: 'confirmed',
      items: body.cart,
      shippingInfo: body.shippingInfo,
      paymentInfo: {
        // Only store last 4 digits of card for security
        cardLast4: body.paymentInfo.cardNumber.slice(-4),
        nameOnCard: body.paymentInfo.nameOnCard
      },
      pricing: {
        subtotal,
        tax,
        shipping,
        discount,
        total
      },
      appliedCoupon,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    }

    // Store order (in production, save to database)
    orders[orderId] = order

    // In a real application, you would:
    // 1. Send confirmation email
    // 2. Update inventory
    // 3. Create shipping label
    // 4. Send notifications to fulfillment team

        // Set order context and track success
        Sentry.setContext('order', {
          id: orderId,
          total: total,
          items_count: body.cart.length
        })
        
        Sentry.addBreadcrumb({
          message: 'Order created successfully',
          category: 'order',
          level: 'info',
          data: {
            order_id: orderId,
            total: total,
            items_count: body.cart.length
          }
        })
        
        return NextResponse.json({
          success: true,
          order: {
            id: orderId,
            status: order.status,
            total: order.pricing.total,
            estimatedDelivery: order.estimatedDelivery
          },
          message: 'Order placed successfully'
        })

      } catch (error) {
        console.error('Checkout error:', error)
        
        Sentry.captureException(error, {
          tags: {
            'api.route': 'checkout',
            'error.type': 'checkout_processing'
          },
          extra: {
            request_body: body
          }
        })
        
        return NextResponse.json(
          { 
            error: 'Internal server error during checkout',
            code: 'CHECKOUT_ERROR'
          },
          { status: 500 }
        )
      }
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const order = orders[orderId]
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint for checkout service
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}