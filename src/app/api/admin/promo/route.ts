import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireProductionConfig } from '@/lib/config';
import { assertAdminAccess } from '@/lib/admin-auth';

export async function GET() {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;
    await assertAdminAccess();
    const promoCodes = await db.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    const banners = await db.homepageBanner.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ promoCodes, banners });
  } catch (error) {
    console.error('Promo admin GET error:', error);
    return NextResponse.json({ error: 'Failed to load promotions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;
    await assertAdminAccess();
    const body = await request.json();

    const promoCode = await db.promoCode.create({
      data: {
        code: String(body.code || '').trim().toUpperCase(),
        type: body.type || 'percentage',
        value: Number(body.value || 0),
        minOrder: Number(body.minOrder || 0),
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        isActive: body.isActive ?? true,
        campaignType: body.campaignType || 'standard',
        bannerTitle: body.bannerTitle || null,
        bannerCopy: body.bannerCopy || null,
      },
    });

    return NextResponse.json({ promoCode }, { status: 201 });
  } catch (error) {
    console.error('Promo admin POST error:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}
