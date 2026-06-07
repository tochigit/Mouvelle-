import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireProductionConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Paystack secret key is not configured' }, { status: 503 });
    }

    const payload = await request.json();
    const { email, amount, callbackUrl } = payload;

    if (!email || !amount || !payload.items?.length) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const reference = `MOUVELLE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await db.pendingPayment.create({
      data: {
        reference,
        email: String(email).toLowerCase().trim(),
        amount: Number(amount),
        payload: JSON.stringify(payload),
      },
    });

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Number(amount) * 100,
        reference,
        callback_url: callbackUrl,
        metadata: {
          customer_name: payload.fullName,
          phone: payload.phone,
          source: 'mouvelle_checkout',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      await db.pendingPayment.update({ where: { reference }, data: { status: 'failed' } });
      return NextResponse.json({ error: data.message || 'Unable to initialize payment' }, { status: 502 });
    }

    return NextResponse.json({
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
    });
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return NextResponse.json({ error: 'Unable to initialize payment' }, { status: 500 });
  }
}
