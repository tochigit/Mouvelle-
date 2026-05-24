import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const badge = searchParams.get('badge')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (badge) {
      where.badge = badge
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    // Build order by
    let orderBy: Record<string, unknown> = { createdAt: 'desc' }
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
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: true,
          reviews: { select: { rating: true } },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.product.count({ where }),
    ])

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0
      const { reviews, ...rest } = product
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
    })

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
    const body = await request.json()
    const { title, description, price, discountPrice, category, tags, featured, badge, stockQuantity, images, variants } = body

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, category' },
        { status: 400 }
      )
    }

    const slug = slugify(title)

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'A product with this title already exists' }, { status: 409 })
    }

    const product = await db.product.create({
      data: {
        title,
        slug,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        category,
        tags: tags || null,
        featured: featured || false,
        badge: badge || null,
        stockQuantity: stockQuantity || 0,
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
