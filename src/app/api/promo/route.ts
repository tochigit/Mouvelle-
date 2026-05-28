import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a promo code' },
        { status: 400 }
      );
    }

    const promoCode = await db.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid promo code. Please check and try again.' },
        { status: 404 }
      );
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: 'This promo code is no longer active.' },
        { status: 400 }
      );
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json(
        { error: 'This promo code has expired.' },
        { status: 400 }
      );
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { error: 'This promo code has reached its usage limit.' },
        { status: 400 }
      );
    }

    const total = orderTotal || 0;
    if (promoCode.minOrder > 0 && total < promoCode.minOrder) {
      return NextResponse.json(
        { error: `Minimum order of ₦${(promoCode.minOrder / 100).toLocaleString()} required for this code.` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === 'percentage') {
      discountAmount = Math.round((total * promoCode.value) / 100);
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      // Fixed amount
      discountAmount = promoCode.value;
    }

    // Don't allow discount greater than order total
    if (discountAmount > total) {
      discountAmount = total;
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      discountAmount,
      message:
        promoCode.type === 'percentage'
          ? `${promoCode.value}% discount applied!`
          : `₦${(promoCode.value / 100).toLocaleString()} discount applied!`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
