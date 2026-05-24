import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders — List orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderStatus = searchParams.get('orderStatus')
    const paymentStatus = searchParams.get('paymentStatus')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (orderStatus) {
      where.orderStatus = orderStatus
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: { take: 1, orderBy: { position: 'asc' } },
                },
              },
            },
          },
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, limit, offset })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders — Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      guestEmail,
      guestName,
      guestPhone,
      items,
      deliveryFee,
      paymentMethod,
      shippingAddress,
      shippingState,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
    }

    if (!userId && (!guestEmail || !guestName)) {
      return NextResponse.json(
        { error: 'Either userId or guest details (guestEmail, guestName) are required' },
        { status: 400 }
      )
    }

    // Validate products exist and calculate total
    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }

      const itemPrice = product.discountPrice || product.price
      const quantity = item.quantity || 1

      totalAmount += itemPrice * quantity

      orderItemsData.push({
        productId: item.productId,
        quantity,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        itemPrice,
      })
    }

    const fee = deliveryFee || 0
    totalAmount += fee

    const order = await db.order.create({
      data: {
        userId: userId || null,
        guestEmail: guestEmail || null,
        guestName: guestName || null,
        guestPhone: guestPhone || null,
        totalAmount,
        deliveryFee: fee,
        paymentMethod: paymentMethod || 'paystack',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingAddress: shippingAddress || null,
        shippingState: shippingState || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: { take: 1, orderBy: { position: 'asc' } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
