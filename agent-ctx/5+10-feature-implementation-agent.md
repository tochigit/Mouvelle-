# Task 5+10 - Feature Implementation Agent

## Task: Make "In Stock Only" Filter Functional at API Level + Make "You May Also Like" Section Dynamic

### Completed Work

#### Part 1: In Stock Only Filter at API Level
- **Modified**: `src/app/api/products/route.ts`
  - Added `inStock` query parameter support
  - Restructured where clause from direct property assignment to AND array pattern
  - Prevents conflicts between search (OR) and inStock (OR) filters
  - When `inStock=true`: filters products with `stockQuantity > 0` OR at least one variant with `stockQuantity > 0`
- **Modified**: `src/components/shop/ShopPage.tsx`
  - Sends `inStock=true` as API parameter when filter is active
  - Enhanced client-side fallback to also check variant stock

#### Part 2: Dynamic "You May Also Like" Section
- **Created**: `src/app/api/products/related/[id]/route.ts`
  - Weighted scoring: same category (3), matching tags (2 per tag), similar price ±30% (1)
  - Returns top 6 scored products with images, avgRating, reviewCount
  - Graceful fallback to same-category products when no scored matches
- **Modified**: `src/components/product/ProductDetailPage.tsx`
  - Uses new `/api/products/related/${id}` endpoint
  - Fallback to category query if endpoint fails

### Verification
- Lint passes cleanly
- API endpoints tested and working
- `/api/products?inStock=true` → 16 in-stock products
- `/api/products/related/[id]` → 6 scored related products
