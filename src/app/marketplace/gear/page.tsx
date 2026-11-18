'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft, Package, RotateCcw, Truck } from 'lucide-react';

type GearCategory =
  | 'all'
  | 'microphones'
  | 'lighting'
  | 'cameras'
  | 'tripods'
  | 'audio'
  | 'accessories';

interface GearProduct {
  _id: string;
  sku: string;
  title: string;
  description: string;
  brand?: string;
  category: Exclude<GearCategory, 'all'>;
  priceCents: number;
  currency: string;
  stock: number;
  shippingCountries: string[];
  specs?: Array<{ label: string; value: string }>;
}

interface GearOrder {
  _id: string;
  productId?: { _id?: string; title?: string; sku?: string } | string;
  quantity: number;
  totalCents: number;
  currency: string;
  shippingAddress: {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  fulfillmentStatus: string;
  trackingNumber?: string;
  createdAt?: string;
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
  { code: '', label: 'All regions' },
  { code: 'US', label: 'United States (US)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'DE', label: 'Germany (DE)' },
];

function formatCents(cents: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format((cents || 0) / 100);
}

export default function GearMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [category, setCategory] = useState<GearCategory>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<GearProduct[]>([]);
  const [orders, setOrders] = useState<GearOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Order form state
  const [quantity, setQuantity] = useState(1);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shipCountry, setShipCountry] = useState('US');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (countryFilter) params.set('country', countryFilter);
      if (search.trim()) params.set('q', search.trim());

      const [prodRes, ordRes] = await Promise.all([
        apiClient.get(`/marketplace/gear/products?${params.toString()}`),
        apiClient.get('/marketplace/gear/orders').catch(() => ({ data: { orders: [] } })),
      ]);

      const list: GearProduct[] = Array.isArray(prodRes.data?.products)
        ? prodRes.data.products
        : [];
      setProducts(list);
      setSelectedId((prev) =>
        prev && list.some((p) => p._id === prev) ? prev : (list[0]?._id ?? null),
      );
      setOrders(Array.isArray(ordRes.data?.orders) ? ordRes.data.orders : []);
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to load creator gear catalog.',
      });
    } finally {
      setLoading(false);
    }
  }, [category, countryFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedId) ?? products[0] ?? null,
    [products, selectedId],
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setBanner(null);

    if (!line1.trim() || !city.trim() || !postalCode.trim() || !shipCountry.trim()) {
      setBanner({
        type: 'error',
        text: 'Enter street address, city, postal code, and destination country.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/marketplace/gear/orders', {
        productId: selectedProduct._id,
        quantity,
        shippingAddress: {
          line1: line1.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: shipCountry.trim().toUpperCase(),
        },
        idempotencyKey: `gear-${selectedProduct._id}-${Date.now()}`,
      });

      const created: GearOrder | undefined = res.data?.order;
      if (created) {
        setOrders((prev) => [created, ...prev]);
      }
      setLine1('');
      setCity('');
      setPostalCode('');
      setQuantity(1);
      setBanner({
        type: 'success',
        text: 'Provisional gear order recorded (pending payment provider underwriting).',
      });
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to place gear order.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    setBanner(null);
    try {
      const res = await apiClient.put(`/marketplace/gear/orders/${orderId}/status`, {
        status: 'return_requested',
        returnReason: 'Requested via Gear Orders panel',
      });
      const updated: GearOrder | undefined = res.data?.order;
      if (updated) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      }
      setBanner({ type: 'success', text: 'Return request submitted.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to request return.',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Services Marketplace
              </Link>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Creator Gear & Gadgets
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Studio microphones, lighting, cameras, and rigging with jurisdiction-checked shipping.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'catalog'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                Catalog ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                Orders & Returns ({orders.length})
              </button>
            </div>
          </div>

          {banner && (
            <div
              role="status"
              className={`mt-5 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-4 text-xs font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'catalog' ? (
            <>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        category === cat.key
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search gear or brand..."
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <select
                    aria-label="Shipping region"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {SHIPPING_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                        />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      No gear listings match the selected category or shipping region.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {products.map((product) => {
                        const selected = selectedProduct?._id === product._id;
                        return (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => setSelectedId(product._id)}
                            className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-colors ${
                              selected
                                ? 'border-slate-900 bg-white ring-1 ring-slate-900 dark:border-white dark:bg-slate-900 dark:ring-white'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="w-full">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  {product.brand || product.category}
                                </span>
                                <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                              <h2 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                                {product.title}
                              </h2>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                                {product.description}
                              </p>
                            </div>

                            <div className="mt-4 flex w-full items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                              <span className="text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                                {formatCents(product.priceCents, product.currency)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <Truck className="h-3.5 w-3.5" />
                                {product.shippingCountries.join(', ')}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <aside className="lg:col-span-4">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Order & Shipping
                      </p>
                      <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedProduct ? selectedProduct.title : 'Select an item'}
                      </h2>
                    </div>

                    {selectedProduct ? (
                      <form onSubmit={handlePlaceOrder} className="mt-4 space-y-3.5">
                        {Array.isArray(selectedProduct.specs) &&
                          selectedProduct.specs.length > 0 && (
                            <dl className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                              {selectedProduct.specs.map((spec) => (
                                <div key={spec.label} className="flex justify-between gap-2">
                                  <dt className="text-slate-500 dark:text-slate-400">
                                    {spec.label}
                                  </dt>
                                  <dd className="font-medium text-slate-900 dark:text-white">
                                    {spec.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="gear-qty"
                              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              Quantity
                            </label>
                            <input
                              id="gear-qty"
                              type="number"
                              min={1}
                              max={Math.max(1, selectedProduct.stock)}
                              value={quantity}
                              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="gear-country"
                              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              Country (ISO)
                            </label>
                            <input
                              id="gear-country"
                              type="text"
                              maxLength={2}
                              value={shipCountry}
                              onChange={(e) => setShipCountry(e.target.value.toUpperCase())}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="gear-line1"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                          >
                            Street Address
                          </label>
                          <input
                            id="gear-line1"
                            type="text"
                            value={line1}
                            onChange={(e) => setLine1(e.target.value)}
                            placeholder="742 Evergreen Terrace"
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="gear-city"
                              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              City
                            </label>
                            <input
                              id="gear-city"
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="gear-postal"
                              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              Postal Code
                            </label>
                            <input
                              id="gear-postal"
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400">Total</span>
                          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                            {formatCents(selectedProduct.priceCents * quantity, selectedProduct.currency)}
                          </span>
                        </div>

                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          Orders are recorded as provisional (`pending_payment`) until merchant fulfillment and payment provider underwriting are enabled.
                        </p>

                        <button
                          type="submit"
                          disabled={submitting || selectedProduct.stock < 1}
                          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                        >
                          {submitting ? 'Submitting...' : 'Place provisional order'}
                        </button>
                      </form>
                    ) : (
                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        Select a product from the catalog to view specs and shipping options.
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            </>
          ) : (
            <section className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {orders.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Package className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                    No gear orders yet
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {orders.map((order) => {
                    const productTitle =
                      typeof order.productId === 'object' && order.productId?.title
                        ? order.productId.title
                        : 'Creator Gear Item';
                    return (
                      <li
                        key={order._id}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {productTitle}
                            </span>
                            <span className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700 dark:border-slate-700 dark:text-slate-300">
                              {order.fulfillmentStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="mt-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                            Qty {order.quantity} · {formatCents(order.totalCents, order.currency)} · Ship to{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.country}
                            {order.trackingNumber ? ` · Tracking ${order.trackingNumber}` : ''}
                          </p>
                        </div>

                        {order.fulfillmentStatus === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => handleRequestReturn(order._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Request return
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
