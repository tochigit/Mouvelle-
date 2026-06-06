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

// GET /api/products — List products with filtering, sorting, search
export async function GET(request: NextRequest) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const badge = searchParams.get('badge')
    const inStock = searchParams.get('inStock')
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause using AND to combine multiple conditions
    const andConditions: Record<string, unknown>[] = []

    if (status) {
      andConditions.push({ status })
    } else if (!includeArchived) {
      andConditions.push({ status: 'active' })
    }

    if (category) {
      andConditions.push({ category })
    }

    if (featured === 'true') {
      andConditions.push({ featured: true })
    }

    if (badge) {
      andConditions.push({ badge })
    }

    // In-stock filter: show products that have stockQuantity > 0
    // OR at least one variant with stockQuantity > 0
    if (inStock === 'true') {
      andConditions.push({
        OR: [
          { stockQuantity: { gt: 0 } },
          { variants: { some: { stockQuantity: { gt: 0 } } } },
        ],
      })
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      })
    }

    const where: Record<string, unknown> =
      andConditions.length > 0 ? { AND: andConditions } : {}

    // Build order by
    let orderBy: Record<string, unknown> = { createdAt: 'desc' }
    let isBestSelling = false
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]
        break
      case 'best-selling':
        // Sort by review count (proxy for sales) — handled in-memory after fetch
        isBestSelling = true
        orderBy = { createdAt: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // For best-selling, we need all matching products to sort in-memory,
    // then apply offset/limit after sorting
    const fetchLimit = isBestSelling ? undefined : limit
    const fetchSkip = isBestSelling ? undefined : offset

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: true,
          reviews: { select: { rating: true } },
        },
        orderBy,
        ...(fetchLimit !== undefined ? { take: fetchLimit } : {}),
        ...(fetchSkip !== undefined ? { skip: fetchSkip } : {}),
      }),
      db.product.count({ where }),
    ])

    // Calculate average rating for each product
    let productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0
      const { reviews, ...rest } = product
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
    })

    // Sort by best-selling: primary = reviewCount desc, secondary = avgRating desc, tertiary = createdAt desc
    if (isBestSelling) {
      productsWithRating.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      // Apply offset/limit after in-memory sort
      productsWithRating = productsWithRating.slice(offset, offset + limit)
    }

    return NextResponse.json({
      products: productsWithRating,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products — Create a new product
export async function POST(request: NextRequest) {
  try {
    const gate = requireProductionConfig()
    if (!gate.ok) return gate.response
    await assertAdminAccess()

    const body = await request.json()
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

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, category' },
        { status: 400 }
      )
    }

    const productSlug = slug ? slugify(slug) : slugify(title)

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug: productSlug } })
    if (existing) {
      return NextResponse.json({ error: 'A product with this title already exists' }, { status: 409 })
    }

    const product = await db.product.create({
      data: {
        title,
        slug: productSlug,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        category,
        tags: tags || null,
        featured: featured || false,
        badge: badge || null,
        stockQuantity: stockQuantity || 0,
        condition: condition || 'new',
        status: status || 'draft',
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        images: images
          ? {
              create: images.map((img: { imageUrl: string; altText?: string; position?: number }, i: number) => ({
                imageUrl: img.imageUrl,
                altText: img.altText || null,
                position: img.position ?? i,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((v: { variantType: string; variantValue: string; stockQuantity?: number }) => ({
                variantType: v.variantType,
                variantValue: v.variantValue,
                stockQuantity: v.stockQuantity || 0,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
