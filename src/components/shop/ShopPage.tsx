'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigation';
import { useCartStore } from '@/stores/cart';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/constants';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/common/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Grid3X3,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShopPage() {
  const { selectedCategory, setCategory, navigate, searchQuery, setSearchQuery } = useNavigationStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Sync search query from navigation (e.g. from header search dialog)
  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
      setSearchQuery(null);
    }
  }, [searchQuery, setSearchQuery]);

  // Sync category from navigation
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [selectedCategory]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (sort) params.set('sort', sort);
      if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
      if (inStockOnly) params.set('inStock', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      let filtered = data.products as Product[];

      // Client-side filtering for multiple categories
      if (selectedCategories.length > 1) {
        filtered = filtered.filter((p: Product) => selectedCategories.includes(p.category));
      }

      // Price range filter
      if (priceMin) {
        filtered = filtered.filter((p: Product) => (p.discountPrice || p.price) >= Number(priceMin));
      }
      if (priceMax) {
        filtered = filtered.filter((p: Product) => (p.discountPrice || p.price) <= Number(priceMax));
      }

      // Client-side in-stock fallback for edge cases
      // (API already filters, but this catches any products where variants have stock
      // but the product-level stockQuantity is 0 that might slip through)
      if (inStockOnly) {
        filtered = filtered.filter((p: Product) =>
          p.stockQuantity > 0 || (p.variants && p.variants.some((v) => v.stockQuantity > 0))
        );
      }

      setProducts(filtered);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, selectedCategories, priceMin, priceMax, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Category toggle
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Remove filter chip
  const removeFilter = (type: string, value?: string) => {
    if (type === 'category' && value) {
      setSelectedCategories((prev) => prev.filter((c) => c !== value));
    } else if (type === 'priceMin') {
      setPriceMin('');
    } else if (type === 'priceMax') {
      setPriceMax('');
    } else if (type === 'inStock') {
      setInStockOnly(false);
    } else if (type === 'search') {
      setSearch('');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setInStockOnly(false);
    setSearch('');
    setCategory(null);
    setSearchQuery(null);
  };

  // Active filters
  const activeFilters: { type: string; value: string; label: string }[] = [];
  if (debouncedSearch) activeFilters.push({ type: 'search', value: debouncedSearch, label: `Search: "${debouncedSearch}"` });
  selectedCategories.forEach((cat) => activeFilters.push({ type: 'category', value: cat, label: cat }));
  if (priceMin) activeFilters.push({ type: 'priceMin', value: priceMin, label: `Min: ₦${Number(priceMin).toLocaleString()}` });
  if (priceMax) activeFilters.push({ type: 'priceMax', value: priceMax, label: `Max: ₦${Number(priceMax).toLocaleString()}` });
  if (inStockOnly) activeFilters.push({ type: 'inStock', value: 'true', label: 'In Stock' });

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`filter-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
              />
              <Label htmlFor={`filter-${cat}`} className="cursor-pointer text-sm">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Price Range */}
      <div>
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9 border-border bg-background text-sm"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9 border-border bg-background text-sm"
          />
        </div>
      </div>

      <Separator className="bg-border" />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock-filter"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked === true)}
          className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
        />
        <Label htmlFor="in-stock-filter" className="cursor-pointer text-sm">
          In Stock Only
        </Label>
      </div>

      {/* Clear All */}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          onClick={clearAllFilters}
          className="w-full text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => { setCategory(null); navigate('home'); }} className="hover:text-[#D4AF37] transition-colors">
            Home
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">
            {selectedCategory || 'Shop All'}
          </span>
        </nav>

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
        >
          {selectedCategory || 'Shop All'}
        </motion.h1>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-border bg-background"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter + Sort Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2 border-border">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <Badge className="bg-[#D4AF37] text-primary-foreground ml-1 h-5 w-5 p-0 text-xs justify-center">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-background">
                <SheetHeader>
                  <SheetTitle className="font-serif text-xl">Filters</SheetTitle>
                  <SheetDescription className="sr-only">Filter products by category and price</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] px-4">
                  <FilterContent />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Desktop Filter Count */}
            {activeFilters.length > 0 && (
              <span className="hidden lg:inline text-sm text-muted-foreground">
                {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} applied
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px] h-9 border-border bg-background text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {activeFilters.map((filter) => (
                <motion.div
                  key={`${filter.type}-${filter.value}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1 cursor-pointer hover:bg-[#D4AF37]/10"
                    onClick={() => removeFilter(filter.type, filter.value)}
                  >
                    {filter.label}
                    <X className="h-3 w-3" />
                  </Badge>
                </motion.div>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#D4AF37] hover:underline self-center ml-1"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <Grid3X3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-serif text-xl mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
