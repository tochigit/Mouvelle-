import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireProductionConfig } from '@/lib/config'

// GET /api/orders/[id] — Get single order by ID or orderNumber (ELR-XXXXX format)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response

    const { id } = await params

    // If the id looks like an order number (starts with ELR-), look up by orderNumber
    const where = id.startsWith('ELR-') ? { orderNumber: id } : { id }

    const order = await db.order.findUnique({
      where,
      include: {
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
        },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PUT /api/orders/[id] — Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response

    const { id } = await params
    const body = await request.json()

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.orderStatus !== undefined) updateData.orderStatus = body.orderStatus
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod
    if (body.shippingAddress !== undefined) updateData.shippingAddress = body.shippingAddress
    if (body.shippingState !== undefined) updateData.shippingState = body.shippingState
    if (body.shipmentReference !== undefined) updateData.shipmentReference = body.shipmentReference
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes
    if (body.confirmDelivery === true) {
      updateData.orderStatus = 'delivered'
      updateData.deliveryConfirmedAt = new Date()
      updateData.deliveredAt = new Date()
    }

    // If payment is confirmed, update order status automatically
    if (body.paymentStatus === 'paid' && existing.orderStatus === 'pending') {
      updateData.orderStatus = 'paid'
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
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
        },
        user: { select: { id: true, fullName: true, email: true } },
      },
    })

    if (body.confirmDelivery === true) {
      await db.analyticsEvent.create({
        data: {
          type: 'delivery_confirmed',
          entityType: 'order',
          entityId: order.id,
          orderId: order.id,
          email: order.guestEmail,
          metadata: JSON.stringify({ orderNumber: order.orderNumber }),
        },
      })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
