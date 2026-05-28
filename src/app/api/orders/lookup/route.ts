import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders/lookup?q=ELR-XXXXX or q=email@example.com
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const isOrderNumber = query.toUpperCase().startsWith('ELR-')
    const isEmail = query.includes('@')

    const orderInclude = {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              discountPrice: true,
              images: { take: 1, orderBy: { position: 'asc' } },
            },
          },
        },
        orderBy: { id: 'asc' as const },
      },
    }

    if (isOrderNumber) {
      // Look up by orderNumber
      const order = await db.order.findUnique({
        where: { orderNumber: query.toUpperCase() },
        include: orderInclude,
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found', orders: [] },
          { status: 404 }
        )
      }

      return NextResponse.json({ orders: [order] })
    } else if (isEmail) {
      // Look up by guestEmail
      const orders = await db.order.findMany({
        where: { guestEmail: query.toLowerCase() },
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
      })

      if (orders.length === 0) {
        return NextResponse.json(
          { error: 'No orders found for this email', orders: [] },
          { status: 404 }
        )
      }

      return NextResponse.json({ orders })
    } else {
      // Try as order number fallback
      const order = await db.order.findUnique({
        where: { orderNumber: query.toUpperCase() },
        include: orderInclude,
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found. Please enter a valid order number (ELR-XXXXX) or email address.', orders: [] },
          { status: 404 }
        )
      }

      return NextResponse.json({ orders: [order] })
    }
  } catch (error) {
    console.error('Error looking up orders:', error)
    return NextResponse.json({ error: 'Failed to look up orders' }, { status: 500 })
  }
}
