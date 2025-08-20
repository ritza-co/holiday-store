import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/data'

// Simulate server-side cart storage (in a real app, this would use a database or session storage)
const serverCarts: Record<string, any[]> = {}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'anonymous'

    const cart = serverCarts[sessionId] || []
    
    return NextResponse.json({
      cart,
      itemCount: cart.reduce((total: number, item: any) => total + item.quantity, 0),
      subtotal: cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0)
    })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1, sessionId = 'anonymous' } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available` },
        { status: 400 }
      )
    }

    // Initialize cart if it doesn't exist
    if (!serverCarts[sessionId]) {
      serverCarts[sessionId] = []
    }

    const cart = serverCarts[sessionId]
    const existingItem = cart.find((item: any) => item.id === productId)

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available` },
          { status: 400 }
        )
      }
      existingItem.quantity = newQuantity
    } else {
      // Add new item to cart
      cart.push({
        ...product,
        quantity: Math.min(quantity, product.stock)
      })
    }

    return NextResponse.json({
      message: 'Item added to cart',
      cart,
      itemCount: cart.reduce((total: number, item: any) => total + item.quantity, 0)
    })
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, sessionId = 'anonymous' } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!serverCarts[sessionId]) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const cart = serverCarts[sessionId]
    const itemIndex = cart.findIndex((item: any) => item.id === productId)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      // Remove item from cart
      cart.splice(itemIndex, 1)
    } else {
      // Update item quantity
      const product = getProductById(productId)
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      if (quantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available` },
          { status: 400 }
        )
      }

      cart[itemIndex].quantity = quantity
    }

    return NextResponse.json({
      message: 'Cart updated',
      cart,
      itemCount: cart.reduce((total: number, item: any) => total + item.quantity, 0)
    })
  } catch (error) {
    console.error('Cart PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'anonymous'
    const productId = searchParams.get('productId')

    if (!serverCarts[sessionId]) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    if (productId) {
      // Remove specific item
      const cart = serverCarts[sessionId]
      const itemIndex = cart.findIndex((item: any) => item.id === productId)
      
      if (itemIndex === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }
      
      cart.splice(itemIndex, 1)
      
      return NextResponse.json({
        message: 'Item removed from cart',
        cart
      })
    } else {
      // Clear entire cart
      serverCarts[sessionId] = []
      
      return NextResponse.json({
        message: 'Cart cleared',
        cart: []
      })
    }
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}