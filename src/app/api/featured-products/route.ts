import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getFeaturedProducts } from '@/lib/data'

export async function GET() {
  // Simulate slow personalization algorithm that impacts page load
  await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second delay
  
  // Simulate multiple slow operations that impact frontend performance
  await Sentry.startSpan(
    {
      op: 'db.query',
      name: 'fetch user profile for personalization',
      attributes: {
        'db.statement': 'SELECT preferences, purchase_history FROM users WHERE id = ?'
      }
    },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 600))
    }
  )
  
  await Sentry.startSpan(
    {
      op: 'ml.inference',
      name: 'generate personalized product recommendations',
      attributes: {
        'model': 'product-recommendation-v2',
        'inference_type': 'personalized_ranking'
      }
    },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  )
  
  await Sentry.startSpan(
    {
      op: 'db.query',
      name: 'check real-time inventory levels',
      attributes: {
        'db.statement': 'SELECT product_id, stock_count FROM inventory WHERE product_id IN (?)'
      }
    },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
    }
  )
  
  const products = getFeaturedProducts()
  
  return NextResponse.json(products)
}