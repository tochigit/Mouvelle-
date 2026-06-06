import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireProductionConfig } from '@/lib/config';
import { assertAdminAccess } from '@/lib/admin-auth';

export async function GET() {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;
    await assertAdminAccess();

    const [products, orders, customers, lowStockProducts, recentActivity] = await Promise.all([
      db.product.findMany({
        include: { images: { orderBy: { position: 'asc' } }, variants: true },
        orderBy: { updatedAt: 'desc' },
      }),
      db.order.findMany({
        include: {
          items: { include: { product: { select: { id: true, title: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      db.product.findMany({
        where: { status: 'active', stockQuantity: { lte: 5 } },
        orderBy: { stockQuantity: 'asc' },
        take: 10,
      }),
      db.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid').length;
    const productSales = new Map<string, { id: string; title: string; quantity: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const current = productSales.get(item.productId) || {
          id: item.productId,
          title: item.product?.title || 'Unknown product',
          quantity: 0,
        };
        current.quantity += item.quantity;
        productSales.set(item.productId, current);
      }
    }

    return NextResponse.json({
      metrics: {
        revenue,
        orderCount,
        paidOrders,
        productCount: products.length,
        customerCount: customers.length,
        conversionSignal: orderCount > 0 ? Math.round((paidOrders / orderCount) * 100) : 0,
      },
      products,
      orders,
      customers,
      lowStockProducts,
      bestSellers: Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8),
      recentActivity,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Failed to load admin overview' }, { status: 500 });
  }
}
