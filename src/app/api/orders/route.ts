import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Generate a unique order number in format ELR-XXXXX
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // exclude confusing chars like I,O,0,1
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ELR-${code}`
}

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

    // Generate a unique order number
    let orderNumber = generateOrderNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db.order.findUnique({ where: { orderNumber } })
      if (!existing) break
      orderNumber = generateOrderNumber()
      attempts++
    }

    // Use a transaction for atomicity: create order + decrement stock
    const order = await db.$transaction(async (tx) => {
      // Validate products exist and calculate total
      let totalAmount = 0
      const orderItemsData = []

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`)
        }

        // Check stock availability
        if (product.stockQuantity < (item.quantity || 1)) {
          throw new Error(`Insufficient stock for product: ${product.title}`)
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

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
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

      // Decrement stock for each item
      for (const itemData of orderItemsData) {
        // Decrement product stock
        await tx.product.update({
          where: { id: itemData.productId },
          data: {
            stockQuantity: {
              decrement: itemData.quantity,
            },
          },
        })

        // If a specific color variant was selected, decrement that variant's stock
        if (itemData.selectedColor) {
          const colorVariant = await tx.productVariant.findFirst({
            where: {
              productId: itemData.productId,
              variantType: 'color',
              variantValue: itemData.selectedColor,
            },
          })
          if (colorVariant) {
            await tx.productVariant.update({
              where: { id: colorVariant.id },
              data: {
                stockQuantity: {
                  decrement: itemData.quantity,
                },
              },
            })
          }
        }

        // If a specific size variant was selected, decrement that variant's stock
        if (itemData.selectedSize) {
          const sizeVariant = await tx.productVariant.findFirst({
            where: {
              productId: itemData.productId,
              variantType: 'size',
              variantValue: itemData.selectedSize,
            },
          })
          if (sizeVariant) {
            await tx.productVariant.update({
              where: { id: sizeVariant.id },
              data: {
                stockQuantity: {
                  decrement: itemData.quantity,
                },
              },
            })
          }
        }
      }

      return newOrder
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)

    // Return user-friendly messages for known errors
    if (error instanceof Error) {
      if (error.message.startsWith('Product not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.startsWith('Insufficient stock')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
