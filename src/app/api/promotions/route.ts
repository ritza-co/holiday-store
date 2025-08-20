import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  // Simulate slow database query or external API call that impacts TTFB
  await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
  
  // Simulate additional slow operations for realistic TTFB impact
  await Sentry.startSpan(
    {
      op: 'db.query',
      name: 'fetch promotional banner data',
      attributes: {
        'db.statement': 'SELECT * FROM promotions WHERE active = true AND start_date <= NOW() ORDER BY priority DESC LIMIT 1',
        'db.operation': 'select'
      }
    },
    async () => {
      // Simulate complex database query
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  )
  
  // More slow operations that compound TTFB issues
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return NextResponse.json({
    title: 'Holiday Rush is Here!',
    description: 'Discover magical gifts and festive essentials for everyone on your list. Fast shipping, amazing deals, and holiday joy delivered to your door.',
    ctaText: 'View Holiday Deals',
    discount: 25,
    validUntil: '2024-12-31'
  })
}