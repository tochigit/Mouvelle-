import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireProductionConfig } from '@/lib/config'
import { assertAdminAccess } from '@/lib/admin-auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ôö]/g, 'o')
    .replace(/[îï]/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET /api/products/[id] — Get single product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response

    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        reviews: {
          include: {
            user: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

    return NextResponse.json({
      product: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/[id] — Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response
    await assertAdminAccess()

    const { id } = await params
    const body = await request.json()

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const {
      title,
      slug,
      description,
      price,
      discountPrice,
      category,
      tags,
      featured,
      badge,
      stockQuantity,
      condition,
      status,
      seoTitle,
      seoDescription,
      images,
      variants,
    } = body

    // If title is being changed, update the slug too
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      updateData.title = title
      updateData.slug = slugify(title)
    }
    if (slug !== undefined) updateData.slug = slugify(slug)
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (featured !== undefined) updateData.featured = featured
    if (badge !== undefined) updateData.badge = badge
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity)
    if (condition !== undefined) updateData.condition = condition
    if (status !== undefined) updateData.status = status
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null

    // Handle images update: delete existing and create new
    if (images && Array.isArray(images)) {
      await db.productImage.deleteMany({ where: { productId: id } })
      updateData.images = {
        create: images.map((img: { imageUrl: string; altText?: string; position?: number }, i: number) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || null,
          position: img.position ?? i,
        })),
      }
    }

    // Handle variants update: delete existing and create new
    if (variants && Array.isArray(variants)) {
      await db.productVariant.deleteMany({ where: { productId: id } })
      updateData.variants = {
        create: variants.map((v: { variantType: string; variantValue: string; stockQuantity?: number }) => ({
          variantType: v.variantType,
          variantValue: v.variantValue,
          stockQuantity: v.stockQuantity || 0,
        })),
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] — Delete product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response
    await assertAdminAccess()

    const { id } = await params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await db.product.update({ where: { id }, data: { status: 'archived' } })

    return NextResponse.json({ message: 'Product archived successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
