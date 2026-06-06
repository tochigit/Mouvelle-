import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireProductionConfig } from '@/lib/config';
import { assertAdminAccess } from '@/lib/admin-auth';

function uniqueSlug(slug: string) {
  return `${slug}-copy-${Date.now().toString(36)}`;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig();
    if (!gate.ok) return gate.response;
    await assertAdminAccess();

    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const duplicate = await db.product.create({
      data: {
        title: `${product.title} Copy`,
        slug: uniqueSlug(product.slug),
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        category: product.category,
        tags: product.tags,
        featured: false,
        badge: product.badge,
        stockQuantity: product.stockQuantity,
        condition: product.condition,
        status: 'draft',
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        images: {
          create: product.images.map((image) => ({
            imageUrl: image.imageUrl,
            altText: image.altText,
            position: image.position,
          })),
        },
        variants: {
          create: product.variants.map((variant) => ({
            variantType: variant.variantType,
            variantValue: variant.variantValue,
            stockQuantity: variant.stockQuantity,
          })),
        },
      },
      include: { images: { orderBy: { position: 'asc' } }, variants: true },
    });

    return NextResponse.json({ product: duplicate }, { status: 201 });
  } catch (error) {
    console.error('Duplicate product error:', error);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
}
