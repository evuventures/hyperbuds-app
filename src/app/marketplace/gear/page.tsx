'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Coins,
  ExternalLink,
  Globe,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';

type GearCategory =
  | 'all'
  | 'microphones'
  | 'lighting'
  | 'cameras'
  | 'tripods'
  | 'audio'
  | 'accessories';

type ProviderType = 'merchant' | 'cj_dropshipping' | 'printful' | 'affiliate';

interface GearProduct {
  _id: string;
  sku?: string;
  title: string;
  description: string;
  brand?: string;
  category: string;
  priceCents: number;
  priceMinor?: number;
  currency: string;
  stock: number;
  stockQty?: number;
  shippingCountries: string[];
  images?: string[];
  providerType?: ProviderType;
  externalCheckoutUrl?: string | null;
  affiliateDisclosure?: string | null;
}

interface CartItem {
  cartItemId: string;
  productId: string;
  title: string;
  category: string;
  providerType: string;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: string;
  quantity: number;
  stockQty: number;
  shippingCountries: string[];
}

interface CartState {
  items: CartItem[];
  currency: string;
  subtotalMinor: number;
  availableCredits: number;
  discountCapPercent: number;
  creditValueMinor: number;
  maxDiscountMinor: number;
  maxApplicableCredits: number;
}

interface GearOrder {
  _id: string;
  id?: string;
  productId?: { _id?: string; title?: string; sku?: string } | string;
  quantity: number;
  totalCents?: number;
  totalPriceMinor?: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  shippingCountry?: string;
  fulfillmentStatus?: string;
  status?: string;
  createdAt?: string;
}

interface DisputeItem {
  _id: string;
  orderId: string;
  orderType: string;
  reason: string;
  requestedResolution: string;
  status: string;
  resolutionNote?: string;
  createdAt?: string;
}

interface SupplierProvider {
  provider: ProviderType;
  label: string;
  checkoutMode: 'direct' | 'external_affiliate';
  supportsCreditDiscount: boolean;
  configured: boolean;
  requiredEnvVars: string[];
  description: string;
}

interface JurisdictionCheck {
  allowed: boolean;
  countryCode: string;
  capability: string;
  policyVersion: number;
  reason: string | null;
}

const CATEGORIES: Array<{ key: GearCategory; label: string }> = [
  { key: 'all', label: 'All gear' },
  { key: 'microphones', label: 'Microphones' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'cameras', label: 'Cameras' },
  { key: 'tripods', label: 'Tripods' },
  { key: 'audio', label: 'Audio' },
  { key: 'accessories', label: 'Accessories' },
];

const SHIPPING_COUNTRIES = [
  { code: 'US', label: 'United States (US)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'DE', label: 'Germany (DE)' },
  { code: 'FR', label: 'France (FR)' },
  { code: 'AU', label: 'Australia (AU)' },
  { code: 'NG', label: 'Nigeria (NG)' },
  { code: 'GH', label: 'Ghana (GH)' },
];

const PROVIDER_LABELS: Record<string, string> = {
  merchant: 'Direct Merchant',
  cj_dropshipping: 'CJdropshipping',
  printful: 'Printful POD',
  affiliate: 'Affiliate Partner',
};

function formatMinor(minor: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
  }).format((minor || 0) / 100);
}

export default function GearMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'orders' | 'suppliers'>('catalog');
  const [category, setCategory] = useState<GearCategory>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<GearProduct[]>([]);
  const [orders, setOrders] = useState<GearOrder[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [providers, setProviders] = useState<SupplierProvider[]>([]);
  const [cart, setCart] = useState<CartState>({
    items: [],
    currency: 'USD',
    subtotalMinor: 0,
    availableCredits: 0,
    discountCapPercent: 15,
    creditValueMinor: 2,
    maxDiscountMinor: 0,
    maxApplicableCredits: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cart checkout state
  const [creditsToApply, setCreditsToApply] = useState(0);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shipCountry, setShipCountry] = useState('US');
  const [jurisdictionCheck, setJurisdictionCheck] = useState<JurisdictionCheck | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Return / Dispute inline form
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'return' | 'dispute' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // List new product form
  const [newProvider, setNewProvider] = useState<ProviderType>('merchant');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<GearCategory, 'all'>>('microphones');
  const [newPriceUsd, setNewPriceUsd] = useState('49.99');
  const [newStock, setNewStock] = useState('10');
  const [newCountries, setNewCountries] = useState('US,CA,GB,DE');
  const [newCheckoutUrl, setNewCheckoutUrl] = useState('');
  const [creatingProduct, setCreatingProduct] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (countryFilter) params.set('country', countryFilter);
      if (search.trim()) params.set('q', search.trim());

      const [prodRes, cartRes, ordRes, dispRes, provRes] = await Promise.all([
        apiClient.get(`/marketplace/gear/products?${params.toString()}`),
        apiClient.get('/marketplace/cart').catch(() => null),
        apiClient.get('/marketplace/gear/orders').catch(() => ({ data: { orders: [] } })),
        apiClient.get('/marketplace/disputes').catch(() => ({ data: { disputes: [] } })),
        apiClient.get('/marketplace/suppliers/providers').catch(() => ({ data: { providers: [] } })),
      ]);

      setProducts(Array.isArray(prodRes.data?.products) ? prodRes.data.products : []);
      if (cartRes?.data) {
        setCart(cartRes.data);
      }
      setOrders(Array.isArray(ordRes.data?.orders) ? ordRes.data.orders : []);
      setDisputes(Array.isArray(dispRes.data?.disputes) ? dispRes.data.disputes : []);
      setProviders(Array.isArray(provRes.data?.providers) ? provRes.data.providers : []);
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to load creator gear hub.',
      });
    } finally {
      setLoading(false);
    }
  }, [category, countryFilter, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    let active = true;
    apiClient
      .get<JurisdictionCheck>(`/jurisdictions/${encodeURIComponent(shipCountry)}/check?capability=shipping`)
      .then((res) => {
        if (active) setJurisdictionCheck(res.data);
      })
      .catch(() => {
        if (active) setJurisdictionCheck(null);
      });
    return () => {
      active = false;
    };
  }, [shipCountry]);

  const appliedCredits = Math.min(
    Math.max(0, Math.trunc(creditsToApply)),
    cart.maxApplicableCredits,
  );
  const creditDiscountMinor = appliedCredits * cart.creditValueMinor;
  const netTotalMinor = Math.max(0, cart.subtotalMinor - creditDiscountMinor);

  const cartItemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const handleAddToCart = async (productId: string) => {
    setBusyId(productId);
    try {
      const res = await apiClient.post('/marketplace/cart/items', { productId, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to add item to cart.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateQty = async (productId: string, quantity: number) => {
    setBusyId(productId);
    try {
      const res =
        quantity <= 0
          ? await apiClient.delete(`/marketplace/cart/items/${productId}`)
          : await apiClient.put(`/marketplace/cart/items/${productId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to update cart.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0 || checkingOut) return;
    setCheckingOut(true);
    setBanner(null);
    try {
      const idemKey = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const res = await apiClient.post(
        '/marketplace/cart/checkout',
        {
          creditsToApply: appliedCredits,
          shippingAddress: {
            line1: line1.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: shipCountry,
          },
        },
        { headers: { 'Idempotency-Key': idemKey } },
      );
      setBanner({
        type: 'success',
        text: `Created ${res.data?.orders?.length ?? 1} provisional order(s) (net ${formatMinor(res.data?.summary?.netTotalMinor ?? netTotalMinor, cart.currency)}). ${res.data?.paymentNotice || ''}`,
      });
      setCreditsToApply(0);
      setLine1('');
      setCity('');
      setPostalCode('');
      setActiveTab('orders');
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Checkout failed.',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleOrderActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionOrderId || !actionMode || !actionReason.trim()) return;
    setBusyId(actionOrderId);
    try {
      if (actionMode === 'return') {
        await apiClient.post(`/marketplace/gear/orders/${actionOrderId}/return`, {
          reason: actionReason.trim(),
        });
        toast.success('Return request submitted.');
      } else {
        await apiClient.post('/marketplace/disputes', {
          orderId: actionOrderId,
          orderType: 'gear',
          reason: actionReason.trim(),
          requestedResolution: 'refund',
        });
        toast.success('Dispute opened for review.');
      }
      setActionOrderId(null);
      setActionMode(null);
      setActionReason('');
      await loadData();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to submit request.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceMinor = Math.round(Number(newPriceUsd) * 100);
    if (!newTitle.trim() || !Number.isFinite(priceMinor) || priceMinor <= 0) {
      toast.error('Enter a valid product title and price.');
      return;
    }
    setCreatingProduct(true);
    try {
      await apiClient.post('/marketplace/suppliers/products', {
        providerType: newProvider,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priceMinor,
        currency: 'USD',
        stockQty: Math.max(1, Number(newStock) || 1),
        shippingCountries: newCountries
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
        externalCheckoutUrl: newProvider === 'affiliate' ? newCheckoutUrl.trim() : undefined,
      });
      toast.success('Product listed in Creator Gear Hub.');
      setNewTitle('');
      setNewDescription('');
      setNewCheckoutUrl('');
      setActiveTab('catalog');
      await loadData();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to list product.');
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Marketplace
              </Link>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Creator Gear &amp; Merch Hub
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Pluggable merchant, dropshipping, print-on-demand &amp; affiliate catalog with jurisdiction-checked checkout and capped credit discounts.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'catalog', label: 'Catalog', icon: Package },
                  { id: 'cart', label: `Cart (${cartItemCount})`, icon: ShoppingCart },
                  { id: 'orders', label: `Orders & Disputes (${orders.length})`, icon: Truck },
                  { id: 'suppliers', label: 'Suppliers & List', icon: Store },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {banner && (
            <div
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 text-xs ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button type="button" onClick={() => setBanner(null)} className="ml-4 underline">
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search mics, lights, tripods, merch..."
                  className="flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GearCategory)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">All shipping regions</option>
                  {SHIPPING_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                  <Package className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    No gear listings match your filter
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    List your first creator gear item or affiliate partner recommendation in the Suppliers tab.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('suppliers')}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    List a Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const priceMinor = Number(product.priceMinor ?? product.priceCents ?? 0);
                    const stock = Number(product.stockQty ?? product.stock ?? 0);
                    const provider = product.providerType || 'merchant';
                    const isAffiliate = provider === 'affiliate';

                    return (
                      <article
                        key={product._id}
                        className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {PROVIDER_LABELS[provider] || provider}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {product.category}
                            </span>
                          </div>
                          <h2 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                            {product.title}
                          </h2>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                            {product.description || 'Creator production gear.'}
                          </p>
                          <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatMinor(priceMinor, product.currency)}
                            </span>
                            {!isAffiliate && (
                              <span className="text-[11px] text-slate-500">
                                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                              </span>
                            )}
                          </div>
                          {Array.isArray(product.shippingCountries) && product.shippingCountries.length > 0 && (
                            <p className="mt-2 text-[11px] text-slate-500">
                              Ships to: {product.shippingCountries.join(', ')}
                            </p>
                          )}
                          {isAffiliate && product.affiliateDisclosure && (
                            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                              {product.affiliateDisclosure}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          {isAffiliate && product.externalCheckoutUrl ? (
                            <a
                              href={product.externalCheckoutUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow sponsored"
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                              Open Partner Store
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled={stock <= 0 || busyId === product._id}
                              onClick={() => handleAddToCart(product._id)}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              {busyId === product._id ? 'Adding...' : 'Add to Cart'}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CART & CHECKOUT WITH CREDIT DISCOUNT CAP + JURISDICTION CHECK */}
          {activeTab === 'cart' && (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                {cart.items.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                    <ShoppingCart className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                      Your cart is empty
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                    >
                      Browse Creator Gear
                    </button>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatMinor(item.unitPriceMinor, item.currency)} each · Ships to{' '}
                          {item.shippingCountries.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === item.productId}
                          onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={busyId === item.productId || item.quantity >= item.stockQty}
                          onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                          className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="ml-2 w-20 text-right text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatMinor(item.lineTotalMinor, item.currency)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, 0)}
                          className="ml-1 text-slate-400 hover:text-rose-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleCheckout}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Checkout Summary &amp; Credit Discount
                </h2>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      Apply Credits (max {cart.discountCapPercent}% cap)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Balance: {cart.availableCredits} cr
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={cart.maxApplicableCredits}
                      value={appliedCredits}
                      onChange={(e) => setCreditsToApply(Number(e.target.value) || 0)}
                      className="w-24 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setCreditsToApply(cart.maxApplicableCredits)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Use max ({cart.maxApplicableCredits} cr)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatMinor(cart.subtotalMinor, cart.currency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Credit Discount ({appliedCredits} cr)</span>
                    <span className="tabular-nums">-{formatMinor(creditDiscountMinor, cart.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                    <span>Net Total</span>
                    <span className="tabular-nums">{formatMinor(netTotalMinor, cart.currency)}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Shipping Address</p>
                  <select
                    value={shipCountry}
                    onChange={(e) => setShipCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {SHIPPING_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {jurisdictionCheck && (
                    <div
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                        jurisdictionCheck.allowed
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
                      }`}
                    >
                      {jurisdictionCheck.allowed ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>
                        {jurisdictionCheck.allowed
                          ? `Verified shipping corridor (${jurisdictionCheck.countryCode}, policy v${jurisdictionCheck.policyVersion}).`
                          : jurisdictionCheck.reason}
                      </span>
                    </div>
                  )}

                  <input
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <input
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal code"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    cart.items.length === 0 ||
                    checkingOut ||
                    (jurisdictionCheck !== null && !jurisdictionCheck.allowed)
                  }
                  className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900"
                >
                  {checkingOut ? 'Placing order...' : `Place Provisional Order (${formatMinor(netTotalMinor, cart.currency)})`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ORDERS, RETURNS & DISPUTES */}
          {activeTab === 'orders' && (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Gear Orders ({orders.length})
                </h2>
                {orders.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    No gear orders yet.
                  </p>
                ) : (
                  orders.map((ord) => {
                    const oid = ord._id || ord.id || '';
                    const st = ord.fulfillmentStatus || ord.status || 'pending_payment';
                    const amt = Number(ord.totalPriceMinor ?? ord.totalCents ?? 0);
                    return (
                      <div
                        key={oid}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              Order #{oid.slice(-8)} · Qty {ord.quantity}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatMinor(amt, ord.currency)} · {ord.shippingCountry || ord.shippingAddress?.country || 'US'}
                            </p>
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {st}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActionOrderId(oid);
                              setActionMode('return');
                              setActionReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Request Return
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionOrderId(oid);
                              setActionMode('dispute');
                              setActionReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Open Dispute
                          </button>
                        </div>

                        {actionOrderId === oid && actionMode && (
                          <form onSubmit={handleOrderActionSubmit} className="mt-3 flex gap-2">
                            <input
                              required
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder={
                                actionMode === 'return'
                                  ? 'Reason for return...'
                                  : 'Describe the issue for dispute review...'
                              }
                              className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <button
                              type="submit"
                              disabled={busyId === oid}
                              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                            >
                              Submit
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 lg:col-span-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Active &amp; Past Disputes ({disputes.length})
                </h2>
                {disputes.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    No disputes filed.
                  </p>
                ) : (
                  disputes.map((d) => (
                    <div
                      key={d._id}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Order #{d.orderId.slice(-8)} ({d.orderType})
                        </span>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {d.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{d.reason}</p>
                      {d.resolutionNote && (
                        <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                          Resolution: {d.resolutionNote}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PLUGGABLE SUPPLIERS & LIST PRODUCT */}
          {activeTab === 'suppliers' && (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-6">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Marketplace Supplier Adapters
                </h2>
                {providers.map((p) => (
                  <div
                    key={p.provider}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {p.label}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          p.configured
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {p.configured ? 'Ready' : 'API Key Required'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
                      <span>Mode: {p.checkoutMode}</span>
                      <span>·</span>
                      <span>
                        Credit Discounts: {p.supportsCreditDiscount ? 'Eligible (capped)' : 'Off-platform only'}
                      </span>
                    </div>
                    {!p.configured && p.requiredEnvVars.length > 0 && (
                      <p className="mt-2 font-mono text-[10px] text-slate-500">
                        Required env: {p.requiredEnvVars.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreateProduct}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  List a Gear or Affiliate Product
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as ProviderType)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="merchant">Direct Merchant</option>
                    <option value="affiliate">Affiliate Partner Link</option>
                    <option value="cj_dropshipping">CJdropshipping</option>
                    <option value="printful">Printful Merch</option>
                  </select>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Exclude<GearCategory, 'all'>)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Product title (e.g. Shure MV7+ Podcast Mic)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key specs, compatibility, and creator use case..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.50"
                    value={newPriceUsd}
                    onChange={(e) => setNewPriceUsd(e.target.value)}
                    placeholder="Price (USD)"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="Stock Qty"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={newCountries}
                    onChange={(e) => setNewCountries(e.target.value)}
                    placeholder="Shipping ISO-2 codes (e.g. US,CA,GB,DE)"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {newProvider === 'affiliate' && (
                  <input
                    required
                    type="url"
                    value={newCheckoutUrl}
                    onChange={(e) => setNewCheckoutUrl(e.target.value)}
                    placeholder="https://partner-store.example/product (HTTPS required)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                )}

                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {creatingProduct ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
