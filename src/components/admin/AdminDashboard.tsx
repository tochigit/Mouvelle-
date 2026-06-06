'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SetupRequired from '@/components/common/SetupRequired';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import {
  BarChart3,
  Boxes,
  Copy,
  CreditCard,
  PackagePlus,
  Save,
  Search,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminOrder {
  id: string;
  orderNumber: string;
  guestEmail: string | null;
  guestName: string | null;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingState: string | null;
  createdAt: string;
  items: Array<{ id: string; quantity: number; product?: { title: string } }>;
}

interface AdminOverview {
  metrics: {
    revenue: number;
    orderCount: number;
    paidOrders: number;
    productCount: number;
    customerCount: number;
    conversionSignal: number;
  };
  products: Product[];
  orders: AdminOrder[];
  customers: Array<{ id: string; email: string; fullName: string | null; createdAt: string }>;
  lowStockProducts: Product[];
  bestSellers: Array<{ id: string; title: string; quantity: number }>;
  recentActivity: Array<{ id: string; type: string; createdAt: string; email: string | null }>;
}

const emptyProductForm = {
  id: '',
  title: '',
  slug: '',
  category: '',
  price: '',
  discountPrice: '',
  stockQuantity: '0',
  condition: 'new',
  status: 'draft',
  badge: '',
  tags: '',
  description: '',
  seoTitle: '',
  seoDescription: '',
  images: '',
  variants: '',
  featured: false,
};

function productToForm(product: Product) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category,
    price: String(product.price),
    discountPrice: product.discountPrice ? String(product.discountPrice) : '',
    stockQuantity: String(product.stockQuantity),
    condition: product.condition || 'new',
    status: product.status || 'draft',
    badge: product.badge || '',
    tags: product.tags || '',
    description: product.description,
    seoTitle: product.seoTitle || '',
    seoDescription: product.seoDescription || '',
    images: (product.images || [])
      .map((image) => `${image.imageUrl}|${image.altText || ''}`)
      .join('\n'),
    variants: (product.variants || [])
      .map((variant) => `${variant.variantType}|${variant.variantValue}|${variant.stockQuantity}`)
      .join('\n'),
    featured: product.featured,
  };
}

function parseImages(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, position) => {
      const [imageUrl, altText] = line.split('|');
      return { imageUrl: imageUrl.trim(), altText: altText?.trim() || null, position };
    });
}

function parseVariants(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [variantType, variantValue, stockQuantity] = line.split('|');
      return {
        variantType: variantType?.trim() || 'size',
        variantValue: variantValue?.trim() || '',
        stockQuantity: Number(stockQuantity || 0),
      };
    })
    .filter((variant) => variant.variantValue);
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [configRequired, setConfigRequired] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyProductForm);
  const [saving, setSaving] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 503) {
        setConfigRequired(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to load admin data');
      setOverview(await res.json());
      setConfigRequired(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Admin dashboard failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const filteredProducts = useMemo(() => {
    const products = overview?.products || [];
    if (!query.trim()) return products;
    const needle = query.toLowerCase();
    return products.filter((product) =>
      [product.title, product.category, product.tags, product.status].some((value) =>
        value?.toLowerCase().includes(needle)
      )
    );
  }, [overview, query]);

  const updateForm = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProduct = async () => {
    if (!form.title || !form.description || !form.price || !form.category) {
      toast.error('Title, category, price and description are required');
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title,
        slug: form.slug || form.title,
        category: form.category,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stockQuantity: Number(form.stockQuantity || 0),
        condition: form.condition,
        status: form.status,
        badge: form.badge || null,
        tags: form.tags || null,
        description: form.description,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        featured: form.featured,
        images: parseImages(form.images),
        variants: parseVariants(form.variants),
      };

      const res = await fetch(form.id ? `/api/products/${form.id}` : '/api/products', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      toast.success(form.id ? 'Product updated' : 'Product created');
      setForm(emptyProductForm);
      await loadOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const archiveProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Product archived');
      loadOverview();
    } else {
      toast.error('Failed to archive product');
    }
  };

  const duplicateProduct = async (productId: string) => {
    const res = await fetch(`/api/admin/products/${productId}/duplicate`, { method: 'POST' });
    if (res.ok) {
      toast.success('Product duplicated as draft');
      loadOverview();
    } else {
      toast.error('Failed to duplicate product');
    }
  };

  const updateOrder = async (orderId: string, orderStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus }),
    });
    if (res.ok) {
      toast.success('Order status updated');
      loadOverview();
    } else {
      toast.error('Failed to update order');
    }
  };

  if (configRequired) {
    return (
      <main className="min-h-screen bg-background">
        <SetupRequired
          title="Connect production services"
          message="The admin dashboard is locked until Supabase Postgres and Paystack keys are configured. This prevents products, orders, payments, and analytics from being saved to temporary state."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Owner Console</p>
            <h1 className="mt-2 font-serif text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Development access is open for build-out. Authentication and role enforcement are architected for handoff.
            </p>
          </div>
          <Badge className="w-fit border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
            Supabase backed
          </Badge>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            Loading live commerce data...
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-card p-2 md:grid-cols-5">
              <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
              <TabsTrigger value="products"><Boxes className="mr-2 h-4 w-4" />Products</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="mr-2 h-4 w-4" />Orders</TabsTrigger>
              <TabsTrigger value="promos"><CreditCard className="mr-2 h-4 w-4" />Promos</TabsTrigger>
              <TabsTrigger value="customers"><Users className="mr-2 h-4 w-4" />Customers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['Revenue', formatPrice(overview?.metrics.revenue || 0)],
                  ['Orders', overview?.metrics.orderCount || 0],
                  ['Paid Orders', overview?.metrics.paidOrders || 0],
                  ['Products', overview?.metrics.productCount || 0],
                  ['Conversion Signal', `${overview?.metrics.conversionSignal || 0}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-[#D4AF37]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="font-serif text-xl font-semibold">Low Stock Warnings</h2>
                  <div className="mt-4 space-y-3">
                    {overview?.lowStockProducts.length ? overview.lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between text-sm">
                        <span>{product.title}</span>
                        <Badge variant="outline">{product.stockQuantity} left</Badge>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No low-stock products.</p>}
                  </div>
                </section>
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="font-serif text-xl font-semibold">Best Sellers</h2>
                  <div className="mt-4 space-y-3">
                    {overview?.bestSellers.length ? overview.bestSellers.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.title}</span>
                        <Badge variant="outline">{item.quantity} sold</Badge>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">Sales insights appear after orders are placed.</p>}
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="products" className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <section className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-[#D4AF37]" />
                  <h2 className="font-serif text-xl font-semibold">{form.id ? 'Edit Product' : 'Add Product'}</h2>
                </div>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={form.title} onChange={(e) => updateForm('title', e.target.value)} /></div>
                  <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="Auto-generated from title if blank" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Category</Label><Input value={form.category} onChange={(e) => updateForm('category', e.target.value)} /></div>
                    <div><Label>Stock</Label><Input type="number" value={form.stockQuantity} onChange={(e) => updateForm('stockQuantity', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => updateForm('price', e.target.value)} /></div>
                    <div><Label>Discount Price</Label><Input type="number" value={form.discountPrice} onChange={(e) => updateForm('discountPrice', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Status</Label><Input value={form.status} onChange={(e) => updateForm('status', e.target.value)} placeholder="draft, active, archived" /></div>
                    <div><Label>Condition</Label><Input value={form.condition} onChange={(e) => updateForm('condition', e.target.value)} /></div>
                  </div>
                  <div><Label>Badge</Label><Input value={form.badge} onChange={(e) => updateForm('badge', e.target.value)} /></div>
                  <div><Label>Tags</Label><Input value={form.tags} onChange={(e) => updateForm('tags', e.target.value)} placeholder="comma,separated,tags" /></div>
                  <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => updateForm('description', e.target.value)} /></div>
                  <div><Label>Images</Label><Textarea rows={4} value={form.images} onChange={(e) => updateForm('images', e.target.value)} placeholder="https://image-url.jpg|Alt text" /></div>
                  <div><Label>Variants</Label><Textarea rows={4} value={form.variants} onChange={(e) => updateForm('variants', e.target.value)} placeholder="size|Medium|8&#10;color|Black|4" /></div>
                  <div><Label>SEO Title</Label><Input value={form.seoTitle} onChange={(e) => updateForm('seoTitle', e.target.value)} /></div>
                  <div><Label>SEO Description</Label><Textarea rows={2} value={form.seoDescription} onChange={(e) => updateForm('seoDescription', e.target.value)} /></div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} />
                    Feature on storefront
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={saveProduct} disabled={saving} className="flex-1 bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030]">
                      <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Product'}
                    </Button>
                    {form.id && <Button variant="outline" onClick={() => setForm(emptyProductForm)}>New</Button>}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, status, category..." />
                </div>
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-lg border border-border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-lg font-semibold">{product.title}</h3>
                            <Badge variant={product.status === 'active' ? 'default' : 'outline'}>{product.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{product.category} • {formatPrice(product.discountPrice || product.price)} • Stock {product.stockQuantity}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setForm(productToForm(product))}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => duplicateProduct(product.id)}><Copy className="mr-1 h-3 w-3" />Duplicate</Button>
                          <Button size="sm" variant="outline" onClick={() => archiveProduct(product.id)}>Archive</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!filteredProducts.length && <p className="py-8 text-center text-sm text-muted-foreground">No products yet. Add the first live product from the admin form.</p>}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="orders" className="space-y-3">
              {overview?.orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-[#D4AF37]">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.guestName} • {order.guestEmail} • {order.shippingState}</p>
                      <p className="mt-1 text-sm">{formatPrice(order.totalAmount)} • {order.items.length} item groups</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{order.paymentStatus}</Badge>
                      <Badge>{order.orderStatus}</Badge>
                      {['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'].map((status) => (
                        <Button key={status} size="sm" variant="outline" onClick={() => updateOrder(order.id, status)}>
                          {status === 'shipped' && <Truck className="mr-1 h-3 w-3" />}
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {!overview?.orders.length && <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">No orders yet.</p>}
            </TabsContent>

            <TabsContent value="promos">
              <PromotionCreator />
            </TabsContent>

            <TabsContent value="customers" className="space-y-3">
              {overview?.customers.map((customer) => (
                <div key={customer.id} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-medium">{customer.fullName || 'Customer'}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              ))}
              {!overview?.customers.length && <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">Customer records appear after account activity.</p>}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}

function PromotionCreator() {
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '', campaignType: 'standard', bannerTitle: '', bannerCopy: '' });
  const [saving, setSaving] = useState(false);

  const savePromo = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create promotion');
      toast.success('Promotion created');
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '', campaignType: 'standard', bannerTitle: '', bannerCopy: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="max-w-2xl rounded-lg border border-border bg-card p-5">
      <h2 className="font-serif text-xl font-semibold">Create Promotion</h2>
      <p className="mt-1 text-sm text-muted-foreground">Supports percentage, fixed discount, giveaway, flash sale, and homepage banner campaign data.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><Label>Code</Label><Input value={form.code} onChange={(e) => update('code', e.target.value)} /></div>
        <div><Label>Type</Label><Input value={form.type} onChange={(e) => update('type', e.target.value)} placeholder="percentage or fixed" /></div>
        <div><Label>Value</Label><Input type="number" value={form.value} onChange={(e) => update('value', e.target.value)} /></div>
        <div><Label>Minimum Order</Label><Input type="number" value={form.minOrder} onChange={(e) => update('minOrder', e.target.value)} /></div>
        <div><Label>Max Discount</Label><Input type="number" value={form.maxDiscount} onChange={(e) => update('maxDiscount', e.target.value)} /></div>
        <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={(e) => update('usageLimit', e.target.value)} /></div>
        <div><Label>Expires At</Label><Input type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.target.value)} /></div>
        <div><Label>Campaign Type</Label><Input value={form.campaignType} onChange={(e) => update('campaignType', e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Banner Title</Label><Input value={form.bannerTitle} onChange={(e) => update('bannerTitle', e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Banner Copy</Label><Textarea value={form.bannerCopy} onChange={(e) => update('bannerCopy', e.target.value)} /></div>
      </div>
      <Button onClick={savePromo} disabled={saving} className="mt-5 bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C0A030]">
        {saving ? 'Saving...' : 'Create Promotion'}
      </Button>
    </section>
  );
}
