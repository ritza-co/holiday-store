import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

interface ShippingCalculationRequest {
  items: Array<{
    id: string
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }>
  destination: {
    zipCode: string
    state: string
    country: string
  }
}

export async function POST(request: NextRequest) {
  return await Sentry.startSpan(
    {
      op: 'shipping_calculation',
      name: 'calculate_shipping_costs',
      attributes: {
        'shipping.service': 'logistics_provider'
      }
    },
    async () => {
      try {
        const body: ShippingCalculationRequest = await request.json()
        
        // Add shipping context to Sentry
        Sentry.setContext('shipping_request', {
          item_count: body.items.length,
          destination: body.destination.state,
          zip_code: body.destination.zipCode
        })
        
        // Start shipping rate lookup
        Sentry.addBreadcrumb({
          message: 'Starting shipping rate calculation',
          category: 'shipping',
          level: 'info',
          data: {
            items: body.items.length,
            destination: body.destination.zipCode
          }
        })
        
        // Simulate complex logistics calculations
        const shippingRates = await calculateShippingRates(body)
        
        return NextResponse.json({
          success: true,
          rates: shippingRates,
          calculatedAt: new Date().toISOString()
        })
        
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            'shipping.operation': 'rate_calculation',
            'shipping.provider': 'logistics_provider'
          }
        })
        
        return NextResponse.json(
          { error: 'Failed to calculate shipping costs' },
          { status: 500 }
        )
      }
    }
  )
}

// Complex shipping rate calculation with performance bottlenecks
async function calculateShippingRates(request: ShippingCalculationRequest) {
  // Simulate multiple carrier API calls
  const carriers = ['standard', 'expedited', 'overnight']
  const rates = []
  
  for (const carrier of carriers) {
    const rate = await Sentry.startSpan(
      {
        op: 'carrier_lookup',
        name: `get_${carrier}_rate`,
        attributes: {
          'carrier.type': carrier,
          'carrier.provider': 'logistics_api'
        }
      },
      async () => {
        // This creates the performance bottleneck - inefficient zip code processing
        const processingTime = await processZipCodeData(request.destination.zipCode)
        
        // Simulate network delay for carrier API
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Calculate base rate
        const baseRate = calculateBaseRate(request.items, carrier)
        
        return {
          carrier,
          rate: baseRate + (processingTime * 0.1), // Factor in processing complexity
          estimatedDays: carrier === 'overnight' ? 1 : carrier === 'expedited' ? 2 : 5,
          service: `${carrier}_shipping`
        }
      }
    )
    
    rates.push(rate)
  }
  
  return rates
}

// This function creates N+1 query performance issues that Sentry auto-detects
async function processZipCodeData(zipCode: string): Promise<number> {
  return await Sentry.startSpan(
    {
      op: 'zipcode_processing',
      name: 'validate_delivery_zones',
      attributes: {
        'zipcode.value': zipCode,
        'processing.type': 'zone_validation'
      }
    },
    async () => {
      let processingComplexity = 0
      
      // REQUIRED: Source database query that precedes N+1 queries
      // This is essential for Sentry's N+1 pattern detection
      await Sentry.startSpan({
        op: 'db',
        name: 'SELECT * FROM shipping_zones WHERE active = %s',
        attributes: {
          'db.operation': 'SELECT',
          'db.table': 'shipping_zones',
          'db.statement': 'SELECT * FROM shipping_zones WHERE active = %s',
          'db.system': 'postgresql',
          'query.type': 'source_query'
        }
      }, async () => {
        // Simulate initial database lookup
        await new Promise(resolve => setTimeout(resolve, 150))
        return { zones: [] }
      })
      
      // Extended zip code to ensure we have 6+ queries (minimum for reliable detection)
      const extendedZipCode = zipCode.padEnd(6, '0')
      
      // N+1 Query Pattern: Query database for each digit in zip code
      // This creates the performance issue that Sentry will auto-detect
      for (let i = 0; i < extendedZipCode.length; i++) {
        const digit = extendedZipCode[i]
        
        // Individual database query for each digit (N+1 pattern)
        const zoneData = await queryZoneDatabase(digit, i)
        processingComplexity += zoneData.complexity
      }
      
      return processingComplexity
    }
  )
}

// Simulates individual database queries (creates N+1 pattern)
async function queryZoneDatabase(digit: string, index: number): Promise<{complexity: number}> {
  return await Sentry.startSpan(
    {
      op: 'db',
      name: 'SELECT * FROM shipping_zones WHERE digit = %s',
      attributes: {
        'db.operation': 'SELECT',
        'db.table': 'shipping_zones',
        'db.statement': 'SELECT * FROM shipping_zones WHERE digit = %s',
        'db.system': 'postgresql',
        'query.digit': digit,
        'query.position': index
      }
    },
    async () => {
      // Simulate database query delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return {
        complexity: parseInt(digit) * 100
      }
    }
  )
}

// Helper function for base rate calculation
function calculateBaseRate(items: any[], carrier: string): number {
  const baseRates = {
    standard: 5.99,
    expedited: 12.99,
    overnight: 24.99
  }
  
  const itemCount = items.length
  const weightMultiplier = itemCount * 0.5
  
  return baseRates[carrier as keyof typeof baseRates] + weightMultiplier
}