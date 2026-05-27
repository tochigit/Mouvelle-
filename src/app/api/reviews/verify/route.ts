import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/reviews/verify — Verify if an email has purchased a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, productId } = body

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, productId' },
        { status: 400 }
      )
    }

    // Check if there's an Order with guestEmail that has an OrderItem with this productId
    const order = await db.order.findFirst({
      where: {
        guestEmail: email.toLowerCase().trim(),
        items: {
          some: {
            productId: productId,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    })

    return NextResponse.json({
      verified: !!order,
      orderId: order?.orderNumber || undefined,
    })
  } catch (error) {
    console.error('Error verifying purchase:', error)
    return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 })
  }
}
