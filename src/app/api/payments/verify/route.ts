import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireProductionConfig } from '@/lib/config';
import { sendCommerceEmail } from '@/lib/notifications';

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ELR-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack secret key is not configured' }, { status: 503 });
    }

    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    const pending = await db.pendingPayment.findUnique({ where: { reference } });
    if (!pending) {
      return NextResponse.json({ error: 'Payment session not found' }, { status: 404 });
    }
    if (pending.status === 'verified') {
      return NextResponse.json({ error: 'Payment has already been verified' }, { status: 409 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.data?.status !== 'success') {
      await db.pendingPayment.update({ where: { reference }, data: { status: 'failed' } });
      return NextResponse.json({ error: 'Payment was not successful' }, { status: 402 });
    }

    const payload = JSON.parse(pending.payload) as {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      state: string;
      deliveryFee: number;
      items: Array<{ productId: string; quantity: number; selectedColor?: string | null; selectedSize?: string | null }>;
    };

    let orderNumber = generateOrderNumber();
    for (let attempts = 0; attempts < 10; attempts++) {
      const existing = await db.order.findUnique({ where: { orderNumber } });
      if (!existing) break;
      orderNumber = generateOrderNumber();
    }

    const order = await db.$transaction(async (tx) => {
      let totalAmount = Number(payload.deliveryFee || 0);
      const orderItemsData = [];

      for (const item of payload.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.status !== 'active') throw new Error('Product is no longer available');
        const quantity = item.quantity || 1;
        if (product.stockQuantity < quantity) throw new Error(`Insufficient stock for ${product.title}`);
        const itemPrice = product.discountPrice || product.price;
        totalAmount += itemPrice * quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          itemPrice,
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          guestEmail: payload.email.toLowerCase().trim(),
          guestName: payload.fullName,
          guestPhone: payload.phone,
          totalAmount,
          deliveryFee: Number(payload.deliveryFee || 0),
          paymentMethod: 'paystack',
          paymentStatus: 'paid',
          orderStatus: 'paid',
          shippingAddress: payload.address,
          shippingState: payload.state,
          items: { create: orderItemsData },
        },
        include: { items: { include: { product: { select: { id: true, title: true } } } } },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.pendingPayment.update({ where: { reference }, data: { status: 'verified' } });
      await tx.analyticsEvent.create({
        data: {
          type: 'payment_verified',
          entityType: 'order',
          entityId: created.id,
          orderId: created.id,
          email: payload.email.toLowerCase().trim(),
          metadata: JSON.stringify({ reference, orderNumber }),
        },
      });

      return created;
    });

    await sendCommerceEmail({
      toEmail: payload.email,
      toName: payload.fullName,
      subject: `Your ÈLARA order ${order.orderNumber}`,
      templateParams: {
        order_number: order.orderNumber,
        order_total: order.totalAmount,
        delivery_state: order.shippingState,
      },
    }).catch(() => null);

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Paystack verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify payment' },
      { status: 500 }
    );
  }
}
