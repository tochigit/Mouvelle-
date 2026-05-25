import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews — Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter is required' },
        { status: 400 }
      )
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.review.count({ where: { productId } }),
    ])

    // Calculate rating summary
    const allReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    const ratingSummary = {
      average: allReviews.length > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
        : 0,
      count: allReviews.length,
      distribution: [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: allReviews.filter((r) => r.rating === star).length,
      })),
    }

    return NextResponse.json({ reviews, total, ratingSummary, limit, offset })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — Create a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, authorName, rating, comment } = body

    if (!productId || !authorName || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, authorName, rating, comment' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const review = await db.review.create({
      data: {
        productId,
        userId: userId || null,
        authorName,
        rating: Number(rating),
        comment,
      },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
