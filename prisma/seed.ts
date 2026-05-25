import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.address.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // ── Create Users ──────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@elara.ng',
      fullName: 'ELARA Admin',
      phone: '+2348012345678',
      role: 'admin',
    },
  })

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'chioma.okonkwo@gmail.com',
        fullName: 'Chioma Okonkwo',
        phone: '+2348023456789',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ade.balogun@yahoo.com',
        fullName: 'Ade Balogun',
        phone: '+2348034567890',
        role: 'customer',
      },
    }),
    prisma.user.create({
      data: {
        email: 'nneka.eze@hotmail.com',
        fullName: 'Nneka Eze',
        phone: '+2348045678901',
        role: 'customer',
      },
    }),
  ])

  // ── Create Products ───────────────────────────────────────
  const productsData = [
    // ── PERFUMES ──
    {
      title: 'Noir Éclat Eau de Parfum',
      description: 'A bold, intoxicating blend of dark orchid and amber. Unisex evening fragrance that commands attention and leaves a lasting impression. Perfect for evening events and special occasions.',
      price: 28500,
      discountPrice: null,
      category: 'Perfumes',
      tags: 'unisex,evening,luxury,amber,orchid',
      featured: true,
      badge: 'BEST SELLER',
      stockQuantity: 25,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', altText: 'Noir Éclat perfume bottle', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea081aedb04?w=800&q=80', altText: 'Noir Éclat dark packaging', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', altText: 'Noir Éclat lifestyle shot', position: 2 },
      ],
      variants: [
        { variantType: 'size', variantValue: '30ml', stockQuantity: 10 },
        { variantType: 'size', variantValue: '50ml', stockQuantity: 8 },
        { variantType: 'size', variantValue: '100ml', stockQuantity: 7 },
      ],
    },
    {
      title: 'Golden Hour Eau de Toilette',
      description: 'Warm vanilla and sandalwood with citrus top notes. Perfect for daytime elegance. A radiant fragrance that captures the warmth of a Lagos sunset.',
      price: 18900,
      discountPrice: 15900,
      category: 'Perfumes',
      tags: 'daytime,vanilla,sandalwood,citrus',
      featured: false,
      badge: 'SALE',
      stockQuantity: 35,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', altText: 'Golden Hour perfume bottle', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', altText: 'Golden Hour packaging', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea081aedb04?w=800&q=80', altText: 'Golden Hour lifestyle', position: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', altText: 'Golden Hour detail', position: 3 },
      ],
      variants: [
        { variantType: 'size', variantValue: '30ml', stockQuantity: 15 },
        { variantType: 'size', variantValue: '50ml', stockQuantity: 12 },
        { variantType: 'size', variantValue: '100ml', stockQuantity: 8 },
      ],
    },
    {
      title: 'Sahara Breeze Eau de Parfum',
      description: 'Exotic saffron and oud with a modern twist. Luxury unisex scent that evokes the mystique of the desert. A statement fragrance for the bold and sophisticated.',
      price: 35000,
      discountPrice: null,
      category: 'Perfumes',
      tags: 'unisex,luxury,oud,saffron,exotic',
      featured: true,
      badge: 'NEW ARRIVAL',
      stockQuantity: 15,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea081aedb04?w=800&q=80', altText: 'Sahara Breeze perfume bottle', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', altText: 'Sahara Breeze packaging', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', altText: 'Sahara Breeze lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'size', variantValue: '50ml', stockQuantity: 8 },
        { variantType: 'size', variantValue: '100ml', stockQuantity: 7 },
      ],
    },
    {
      title: 'Velvet Rose Eau de Parfum',
      description: 'Deep Bulgarian rose with musk and patchouli base. Timeless feminine fragrance that exudes grace and sophistication. A modern classic for the elegant woman.',
      price: 22000,
      discountPrice: null,
      category: 'Perfumes',
      tags: 'feminine,rose,musk,patchouli,classic',
      featured: false,
      badge: null,
      stockQuantity: 30,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', altText: 'Velvet Rose perfume bottle', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', altText: 'Velvet Rose packaging', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', altText: 'Velvet Rose lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'size', variantValue: '30ml', stockQuantity: 12 },
        { variantType: 'size', variantValue: '50ml', stockQuantity: 10 },
        { variantType: 'size', variantValue: '100ml', stockQuantity: 8 },
      ],
    },

    // ── SUNGLASSES ──
    {
      title: 'Aviator Luxe',
      description: 'Classic aviator frame with gold accents and gradient lenses. Unisex design that pairs effortlessly with any outfit. A timeless accessory for the modern trendsetter.',
      price: 15500,
      discountPrice: null,
      category: 'Sunglasses',
      tags: 'unisex,aviator,gold,gradient,classic',
      featured: true,
      badge: 'BEST SELLER',
      stockQuantity: 20,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', altText: 'Aviator Luxe sunglasses', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', altText: 'Aviator Luxe side view', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80', altText: 'Aviator Luxe lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Gold/Green', stockQuantity: 8 },
        { variantType: 'color', variantValue: 'Gold/Brown', stockQuantity: 7 },
        { variantType: 'color', variantValue: 'Silver/Blue', stockQuantity: 5 },
      ],
    },
    {
      title: 'Cat-Eye Noir',
      description: 'Bold cat-eye frames in matte black. Statement piece for her. Channel your inner diva with these head-turning frames that blend vintage charm with modern attitude.',
      price: 12800,
      discountPrice: 9800,
      category: 'Sunglasses',
      tags: 'women,cat-eye,matte-black,statement',
      featured: false,
      badge: 'SALE',
      stockQuantity: 18,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', altText: 'Cat-Eye Noir sunglasses', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', altText: 'Cat-Eye Noir detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', altText: 'Cat-Eye Noir lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Matte Black', stockQuantity: 8 },
        { variantType: 'color', variantValue: 'Tortoiseshell', stockQuantity: 6 },
        { variantType: 'color', variantValue: 'Wine Red', stockQuantity: 4 },
      ],
    },
    {
      title: 'Rounded Vintage',
      description: 'Retro rounded frames with titanium arms. Unisex minimalist design for the effortlessly cool. Lightweight and durable, perfect for everyday wear.',
      price: 14200,
      discountPrice: null,
      category: 'Sunglasses',
      tags: 'unisex,rounded,vintage,titanium,minimalist',
      featured: false,
      badge: null,
      stockQuantity: 22,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80', altText: 'Rounded Vintage sunglasses', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', altText: 'Rounded Vintage side view', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', altText: 'Rounded Vintage detail', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Silver', stockQuantity: 8 },
        { variantType: 'color', variantValue: 'Gold', stockQuantity: 7 },
        { variantType: 'color', variantValue: 'Rose Gold', stockQuantity: 7 },
      ],
    },
    {
      title: 'Oversized Glam',
      description: 'Oversized square frames with subtle gold detailing. Pure luxury that makes a bold statement. Designed for those who dare to stand out.',
      price: 18500,
      discountPrice: null,
      category: 'Sunglasses',
      tags: 'women,oversized,gold,luxury,statement',
      featured: false,
      badge: 'NEW ARRIVAL',
      stockQuantity: 12,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', altText: 'Oversized Glam sunglasses', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', altText: 'Oversized Glam detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', altText: 'Oversized Glam lifestyle', position: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80', altText: 'Oversized Glam packaging', position: 3 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Black/Gold', stockQuantity: 5 },
        { variantType: 'color', variantValue: 'Tortoise/Gold', stockQuantity: 4 },
        { variantType: 'color', variantValue: 'Cream/Gold', stockQuantity: 3 },
      ],
    },

    // ── JEWELRY ──
    {
      title: 'Luna Chain Necklace',
      description: '18K gold-plated chain with minimalist pendant. Everyday luxury that transitions from boardroom to evening with effortless elegance. A signature piece for the modern woman.',
      price: 25000,
      discountPrice: null,
      category: 'Jewelry',
      tags: 'gold,necklace,minimalist,everyday,women',
      featured: true,
      badge: 'NEW ARRIVAL',
      stockQuantity: 15,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', altText: 'Luna Chain Necklace', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80', altText: 'Luna Chain Necklace detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', altText: 'Luna Chain Necklace lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Gold', stockQuantity: 8 },
        { variantType: 'color', variantValue: 'Rose Gold', stockQuantity: 5 },
        { variantType: 'color', variantValue: 'Silver', stockQuantity: 2 },
      ],
    },
    {
      title: 'Obsidian Signet Ring',
      description: 'Sterling silver ring with obsidian stone. Bold masculine elegance that makes a powerful statement. Crafted for the modern gentleman who values heritage and style.',
      price: 16500,
      discountPrice: null,
      category: 'Jewelry',
      tags: 'silver,ring,obsidian,masculine,men',
      featured: false,
      badge: null,
      stockQuantity: 20,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80', altText: 'Obsidian Signet Ring', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', altText: 'Obsidian Signet Ring detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', altText: 'Obsidian Signet Ring lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'size', variantValue: 'S (7)', stockQuantity: 5 },
        { variantType: 'size', variantValue: 'M (9)', stockQuantity: 7 },
        { variantType: 'size', variantValue: 'L (11)', stockQuantity: 5 },
        { variantType: 'size', variantValue: 'XL (13)', stockQuantity: 3 },
      ],
    },
    {
      title: 'Crystal Drop Earrings',
      description: 'Swarovski crystal drops on gold-plated hooks. Evening sophistication that catches the light with every movement. The perfect finishing touch for any formal occasion.',
      price: 19800,
      discountPrice: 16900,
      category: 'Jewelry',
      tags: 'crystal,earrings,gold,evening,women',
      featured: false,
      badge: 'SALE',
      stockQuantity: 25,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', altText: 'Crystal Drop Earrings', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', altText: 'Crystal Drop Earrings detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', altText: 'Crystal Drop Earrings lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Clear Crystal', stockQuantity: 10 },
        { variantType: 'color', variantValue: 'Smoke Crystal', stockQuantity: 8 },
        { variantType: 'color', variantValue: 'Rose Crystal', stockQuantity: 7 },
      ],
    },
    {
      title: 'Infinity Bracelet',
      description: 'Delicate gold-plated infinity symbol bracelet. Meaningful gifting that symbolizes eternal love and connection. Comes in a premium gift box.',
      price: 13000,
      discountPrice: null,
      category: 'Jewelry',
      tags: 'gold,bracelet,infinity,gifting,women',
      featured: false,
      badge: null,
      stockQuantity: 40,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', altText: 'Infinity Bracelet', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', altText: 'Infinity Bracelet detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80', altText: 'Infinity Bracelet lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Gold', stockQuantity: 18 },
        { variantType: 'color', variantValue: 'Rose Gold', stockQuantity: 12 },
        { variantType: 'color', variantValue: 'Silver', stockQuantity: 10 },
      ],
    },

    // ── FASHION ACCESSORIES ──
    {
      title: 'Heritage Leather Belt',
      description: 'Premium Italian leather belt with gold buckle. Unisex classic that elevates any outfit. Handcrafted with attention to detail, built to last a lifetime.',
      price: 11500,
      discountPrice: null,
      category: 'Fashion Accessories',
      tags: 'leather,belt,unisex,italian,gold-buckle',
      featured: true,
      badge: 'BEST SELLER',
      stockQuantity: 28,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1624222249164-dd0676c8e3e8?w=800&q=80', altText: 'Heritage Leather Belt', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', altText: 'Heritage Leather Belt detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', altText: 'Heritage Leather Belt lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'size', variantValue: 'S (28-30)', stockQuantity: 8 },
        { variantType: 'size', variantValue: 'M (32-34)', stockQuantity: 10 },
        { variantType: 'size', variantValue: 'L (36-38)', stockQuantity: 7 },
        { variantType: 'size', variantValue: 'XL (40-42)', stockQuantity: 3 },
        { variantType: 'color', variantValue: 'Black', stockQuantity: 14 },
        { variantType: 'color', variantValue: 'Brown', stockQuantity: 14 },
      ],
    },
    {
      title: 'Silk Pocket Square Set',
      description: 'Set of 3 premium silk pocket squares. Gentleman\'s essential for adding a touch of sophistication to any suit. Features complementary patterns and colors.',
      price: 8900,
      discountPrice: null,
      category: 'Fashion Accessories',
      tags: 'silk,pocket-square,men,formal,gifting',
      featured: false,
      badge: null,
      stockQuantity: 35,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', altText: 'Silk Pocket Square Set', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', altText: 'Silk Pocket Square Set detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc64?w=800&q=80', altText: 'Silk Pocket Square Set lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Navy/Gold/Burgundy', stockQuantity: 12 },
        { variantType: 'color', variantValue: 'Black/Silver/Grey', stockQuantity: 12 },
        { variantType: 'color', variantValue: 'Teal/Cream/Rust', stockQuantity: 11 },
      ],
    },
    {
      title: 'Monogram Clutch',
      description: 'Genuine leather clutch with custom monogram option. Elegant evening bag that holds all your essentials in style. Handcrafted with premium materials.',
      price: 22500,
      discountPrice: null,
      category: 'Fashion Accessories',
      tags: 'leather,clutch,monogram,evening,women',
      featured: false,
      badge: 'NEW ARRIVAL',
      stockQuantity: 10,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', altText: 'Monogram Clutch', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc64?w=800&q=80', altText: 'Monogram Clutch detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1624222249164-dd0676c8e3e8?w=800&q=80', altText: 'Monogram Clutch lifestyle', position: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', altText: 'Monogram Clutch packaging', position: 3 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Black', stockQuantity: 4 },
        { variantType: 'color', variantValue: 'Cognac', stockQuantity: 3 },
        { variantType: 'color', variantValue: 'Burgundy', stockQuantity: 3 },
      ],
    },
    {
      title: 'Cashmere Blend Scarf',
      description: 'Luxuriously soft cashmere blend in neutral tones. Unisex warmth that adds a touch of luxury to any outfit. Perfect for cooler evenings and travel.',
      price: 14800,
      discountPrice: 11800,
      category: 'Fashion Accessories',
      tags: 'cashmere,scarf,unisex,neutral,warm',
      featured: false,
      badge: 'SALE',
      stockQuantity: 20,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc64?w=800&q=80', altText: 'Cashmere Blend Scarf', position: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1624222249164-dd0676c8e3e8?w=800&q=80', altText: 'Cashmere Blend Scarf detail', position: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', altText: 'Cashmere Blend Scarf lifestyle', position: 2 },
      ],
      variants: [
        { variantType: 'color', variantValue: 'Ivory', stockQuantity: 7 },
        { variantType: 'color', variantValue: 'Charcoal', stockQuantity: 7 },
        { variantType: 'color', variantValue: 'Camel', stockQuantity: 6 },
      ],
    },
  ]

  const createdProducts = []
  for (const productData of productsData) {
    const { images, variants, ...productFields } = productData
    const product = await prisma.product.create({
      data: {
        ...productFields,
        slug: slugify(productFields.title),
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
      include: { images: true, variants: true },
    })
    createdProducts.push(product)
    console.log(`  ✓ Created product: ${product.title}`)
  }

  // ── Create Reviews ────────────────────────────────────────
  const reviewsData = [
    {
      userId: customers[0].id,
      productId: createdProducts[0].id, // Noir Éclat
      authorName: 'Chioma Okonkwo',
      rating: 5,
      comment: 'Absolutely stunning fragrance! I get compliments every time I wear it. The dark orchid notes are divine. Worth every naira!',
    },
    {
      userId: customers[1].id,
      productId: createdProducts[4].id, // Aviator Luxe
      authorName: 'Ade Balogun',
      rating: 4,
      comment: 'Great quality sunglasses, the gold accents are subtle and classy. Only wish they came with a harder case. Still, very satisfied!',
    },
    {
      userId: customers[2].id,
      productId: createdProducts[8].id, // Luna Chain Necklace
      authorName: 'Nneka Eze',
      rating: 5,
      comment: 'This necklace is everything! The gold plating looks so real and the pendant is the perfect size. My new everyday piece.',
    },
    {
      userId: customers[0].id,
      productId: createdProducts[12].id, // Heritage Leather Belt
      authorName: 'Chioma Okonkwo',
      rating: 4,
      comment: 'Beautiful leather quality. The buckle has a nice weight to it. Fits perfectly. Would definitely buy again as a gift.',
    },
    {
      userId: customers[1].id,
      productId: createdProducts[1].id, // Golden Hour
      authorName: 'Ade Balogun',
      rating: 5,
      comment: 'The vanilla and sandalwood combination is perfect for daytime. Not too overpowering. Plus the sale price was a steal!',
    },
  ]

  for (const reviewData of reviewsData) {
    await prisma.review.create({ data: reviewData })
  }
  console.log(`  ✓ Created ${reviewsData.length} reviews`)

  // ── Create Addresses ──────────────────────────────────────
  await prisma.address.createMany({
    data: [
      {
        userId: customers[0].id,
        fullName: 'Chioma Okonkwo',
        phone: '+2348023456789',
        address: '12 Admiralty Way, Lekki Phase 1',
        state: 'Lagos',
        isDefault: true,
      },
      {
        userId: customers[1].id,
        fullName: 'Ade Balogun',
        phone: '+2348034567890',
        address: '45 Awolowo Road, Ikoyi',
        state: 'Lagos',
        isDefault: true,
      },
      {
        userId: customers[2].id,
        fullName: 'Nneka Eze',
        phone: '+2348045678901',
        address: '8 Wuse 2, Off Aminu Kano Crescent',
        state: 'FCT Abuja',
        isDefault: true,
      },
    ],
  })
  console.log('  ✓ Created addresses')

  console.log('\n🌱 Seeding complete!')
  console.log(`  Products: ${createdProducts.length}`)
  console.log(`  Users: 1 admin + ${customers.length} customers`)
  console.log(`  Reviews: ${reviewsData.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
