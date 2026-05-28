import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/related/[id] — Get related products with weighted scoring
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the current product
    const currentProduct = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        category: true,
        tags: true,
        price: true,
      },
    })

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch all other products with their data for scoring
    const allProducts = await db.product.findMany({
      where: { id: { not: id } },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    })

    // Parse current product tags
    const currentTags = currentProduct.tags
      ? currentProduct.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : []

    const currentPrice = currentProduct.price
    const priceLower = currentPrice * 0.7  // -30%
    const priceUpper = currentPrice * 1.3  // +30%

    // Score each product
    const scored = allProducts.map((product) => {
      let score = 0

      // a. Same category — weight 3
      if (product.category === currentProduct.category) {
        score += 3
      }

      // b. Same tags — weight 2 per matching tag
      if (product.tags && currentTags.length > 0) {
        const productTags = product.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
        const matchingTags = productTags.filter((tag) => currentTags.includes(tag))
        score += matchingTags.length * 2
      }

      // c. Similar price range (±30%) — weight 1
      const effectivePrice = product.discountPrice ?? product.price
      if (effectivePrice >= priceLower && effectivePrice <= priceUpper) {
        score += 1
      }

      // Calculate avgRating and reviewCount
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0
      const reviewCount = product.reviews.length

      return {
        product: {
          ...product,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount,
        },
        score,
      }
    })

    // Sort by score descending, then by reviewCount as tiebreaker
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.product.reviewCount - a.product.reviewCount
    })

    // Take top 6, exclude zero-score products if we have enough scored ones
    const results = scored
      .filter((s) => s.score > 0)
      .slice(0, 6)
      .map((s) => s.product)

    // Fallback: if no scored products, return same-category products
    if (results.length === 0) {
      const fallbackProducts = allProducts
        .filter((p) => p.category === currentProduct.category)
        .slice(0, 6)
        .map((product) => {
          const avgRating =
            product.reviews.length > 0
              ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
              : 0
          const { reviews, ...rest } = product
          return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
        })
      return NextResponse.json({ products: fallbackProducts })
    }

    // Remove reviews from response (already computed avgRating and reviewCount)
    const cleanResults = results.map(({ reviews, ...rest }) => rest)

    return NextResponse.json({ products: cleanResults })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
  }
}
