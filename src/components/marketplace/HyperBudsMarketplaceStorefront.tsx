'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Coins,
  ExternalLink,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react';

interface GearProduct {
  _id: string;
  id?: string;
  sku?: string;
  title: string;
  description: string;
  category: string;
  priceCents?: number;
  priceMinor?: number;
  currency: string;
  stock?: number;
  stockQty?: number;
  shippingCountries?: string[];
  images?: string[];
  providerType?: string;
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
  quantity: number;
  totalCents?: number;
  totalPriceMinor?: number;
  currency: string;
  shippingCountry?: string;
  shippingAddress?: { country?: string };
  fulfillmentStatus?: string;
  status?: string;
  createdAt?: string;
}

interface DisputeItem {
  _id: string;
  orderId: string;
  orderType: string;
  reason: string;
  status: string;
  resolutionNote?: string;
}

interface JurisdictionCheck {
  allowed: boolean;
  countryCode: string;
  capability: string;
  policyVersion: number;
  reason: string | null;
}

const CATEGORY_PILLS = [
  { key: 'all', label: 'All Categories' },
  { key: 'deals', label: 'Deals' },
  { key: 'microphones', label: 'Microphones' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'cameras', label: 'Cameras' },
  { key: 'tripods', label: 'Tripods' },
  { key: 'audio', label: 'Audio' },
  { key: 'accessories', label: 'Creator Merch' },
];

const BRAND_LIST = [
  { key: 'Shure', badge: 'SH' },
  { key: 'Rode', badge: 'RD' },
  { key: 'Sony', badge: 'SN' },
  { key: 'Elgato', badge: 'EL' },
  { key: 'DJI', badge: 'DJ' },
  { key: 'Aputure', badge: 'AP' },
  { key: 'Neewer', badge: 'NW' },
  { key: 'HyperBuds', badge: 'HB' },
];

const SHIPPING_COUNTRIES = [
  { code: 'US', label: 'United States (US)' },
  { code: 'CA', label: 'Canada (CA)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
  { code: 'DE', label: 'Germany (DE)' },
  { code: 'FR', label: 'France (FR)' },
  { code: 'AU', label: 'Australia (AU)' },
  { code: 'NG', label: 'Nigeria (NG)' },
];

const TOP_ITEM_IDS = new Set([
  'hb-gear-shure-mv7',
  'hb-gear-rode-caster-duo',
  'hb-gear-rode-wireless-pro',
]);

const DEAL_COMPARE_PRICES: Record<string, number> = {
  'hb-gear-elgato-keylight': 27557,
  'hb-gear-shure-mv7': 32900,
  'hb-gear-neewer-tripod': 15999,
};

const PRODUCT_RATINGS: Record<string, number> = {
  'hb-gear-shure-mv7': 4.9,
  'hb-gear-sony-zv-e10': 4.8,
  'hb-gear-elgato-keylight': 4.7,
  'hb-gear-dji-osmo-mobile': 4.6,
  'hb-gear-hb-hoodie': 5.0,
  'hb-gear-rode-caster-duo': 4.9,
  'hb-gear-aputure-amaran': 4.8,
  'hb-gear-neewer-tripod': 4.5,
  'hb-gear-rode-wireless-pro': 4.9,
};

function formatPrice(minor: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
  }).format((minor || 0) / 100);
}

function inferBrand(title: string): string {
  const lower = title.toLowerCase();
  for (const b of BRAND_LIST) {
    if (lower.includes(b.key.toLowerCase())) return b.key;
  }
  return 'HyperBuds';
}

export default function HyperBudsMarketplaceStorefront() {
  const [products, setProducts] = useState<GearProduct[]>([]);
  const [orders, setOrders] = useState<GearOrder[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
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
  const [view, setView] = useState<'store' | 'orders'>('store');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters matching reference design
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [minPriceUsd, setMinPriceUsd] = useState(20);
  const [maxPriceUsd, setMaxPriceUsd] = useState(1130);
  const [minStars, setMinStars] = useState(4);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');

  // Checkout & cart state
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creditsToApply, setCreditsToApply] = useState(0);
  const [shipCountry, setShipCountry] = useState('US');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [jurisdictionCheck, setJurisdictionCheck] = useState<JurisdictionCheck | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Return / Dispute state
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'return' | 'dispute' | null>(null);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('hb_marketplace_favs');
      if (saved) setFavourites(JSON.parse(saved));
    } catch {
      // Ignore storage error
    }
  }, []);

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem('hb_marketplace_favs', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const loadStoreData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, cartRes, ordRes, dispRes] = await Promise.all([
        apiClient.get('/marketplace/gear/products?limit=50'),
        apiClient.get('/marketplace/cart').catch(() => null),
        apiClient.get('/marketplace/gear/orders').catch(() => ({ data: { orders: [] } })),
        apiClient.get('/marketplace/disputes').catch(() => ({ data: { disputes: [] } })),
      ]);
      setProducts(Array.isArray(prodRes.data?.products) ? prodRes.data.products : []);
      if (cartRes?.data) setCart(cartRes.data);
      setOrders(Array.isArray(ordRes.data?.orders) ? ordRes.data.orders : []);
      setDisputes(Array.isArray(dispRes.data?.disputes) ? dispRes.data.disputes : []);
    } catch {
      toast.error('Unable to load marketplace catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStoreData();
  }, [loadStoreData]);

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

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const avgPriceUsd = useMemo(() => {
    if (products.length === 0) return 300;
    const total = products.reduce(
      (sum, p) => sum + Number(p.priceMinor ?? p.priceCents ?? 0) / 100,
      0,
    );
    return Math.round(total / products.length);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const id = p._id || p.id || '';
      const priceUsd = Number(p.priceMinor ?? p.priceCents ?? 0) / 100;
      const brand = inferBrand(p.title);
      const rating = PRODUCT_RATINGS[id] ?? 4.7;

      if (onlyFavourites && !favourites.includes(id)) return false;
      if (activeCategory === 'deals' && !(id in DEAL_COMPARE_PRICES)) return false;
      if (
        activeCategory !== 'all' &&
        activeCategory !== 'deals' &&
        p.category.toLowerCase() !== activeCategory
      ) {
        return false;
      }
      if (priceUsd < minPriceUsd || priceUsd > maxPriceUsd) return false;
      if (rating < minStars) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !brand.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    products,
    onlyFavourites,
    favourites,
    activeCategory,
    minPriceUsd,
    maxPriceUsd,
    minStars,
    selectedBrands,
    search,
  ]);

  const cartItemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  );

  const appliedCredits = Math.min(
    Math.max(0, Math.trunc(creditsToApply)),
    cart.maxApplicableCredits,
  );
  const creditDiscountMinor = appliedCredits * cart.creditValueMinor;
  const netTotalMinor = Math.max(0, cart.subtotalMinor - creditDiscountMinor);

  const handleAddToCart = async (product: GearProduct) => {
    const id = product._id || product.id || '';
    if (product.providerType === 'affiliate' && product.externalCheckoutUrl) {
      window.open(product.externalCheckoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setBusyId(id);
    try {
      const res = await apiClient.post('/marketplace/cart/items', { productId: id, quantity: 1 });
      setCart(res.data);
      toast.success(`Added "${product.title}" to cart`);
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Sign in to add items to your cart.');
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
      toast.success(
        `Order placed (${formatPrice(res.data?.summary?.netTotalMinor ?? netTotalMinor, cart.currency)}).`,
      );
      setCartOpen(false);
      setCreditsToApply(0);
      setLine1('');
      setCity('');
      setPostalCode('');
      setView('orders');
      await loadStoreData();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleOrderAction = async (e: React.FormEvent) => {
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
      await loadStoreData();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to submit request.');
    } finally {
      setBusyId(null);
    }
  };

  const minPercent = Math.min(100, Math.max(0, (minPriceUsd / 1200) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPriceUsd / 1200) * 100));
  const visibleBrands = showAllBrands ? BRAND_LIST : BRAND_LIST.slice(0, 7);

  const FilterPanel = (
    <div className="space-y-3.5">
      {/* Price Range Card */}
      <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[#111318] dark:text-white">Price Range</h3>
          <button
            type="button"
            onClick={() => {
              setMinPriceUsd(20);
              setMaxPriceUsd(1130);
            }}
            className="text-[11px] font-medium text-slate-400 transition hover:text-[#6C5CE7]"
          >
            Reset
          </button>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-400">
          The average price is ${avgPriceUsd}
        </p>

        {/* Distribution Area Histogram + Floating Black Price Bubbles */}
        <div className="relative mt-4 pt-3">
          <svg
            viewBox="0 0 220 56"
            className="h-14 w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="hbPriceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A594F9" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#E5E0FF" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path
              d="M 0 56 L 14 48 L 32 51 L 52 38 L 72 44 L 96 14 L 116 32 L 138 6 L 158 38 L 178 26 L 198 46 L 220 56 Z"
              fill="url(#hbPriceArea)"
            />
          </svg>

          {/* Black pill value callouts */}
          <div className="pointer-events-none relative -mt-6 mb-2 flex items-center justify-between">
            <span className="rounded-full bg-[#111318] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-sm dark:bg-white dark:text-slate-900">
              ${minPriceUsd}
            </span>
            <span className="rounded-full bg-[#111318] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-sm dark:bg-white dark:text-slate-900">
              ${maxPriceUsd}
            </span>
          </div>

          {/* Dual-range interactive track */}
          <div className="relative h-5 flex items-center">
            <div className="h-1.5 w-full rounded-full bg-[#E8E9F0] dark:bg-slate-800" />
            <div
              className="absolute h-1.5 rounded-full bg-[#6C5CE7]"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(2, maxPercent - minPercent)}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={1200}
              step={10}
              value={minPriceUsd}
              aria-label="Minimum price"
              onChange={(e) => setMinPriceUsd(Math.min(Number(e.target.value), maxPriceUsd - 20))}
              className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6C5CE7] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
            />
            <input
              type="range"
              min={0}
              max={1200}
              step={10}
              value={maxPriceUsd}
              aria-label="Maximum price"
              onChange={(e) => setMaxPriceUsd(Math.max(Number(e.target.value), minPriceUsd + 20))}
              className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6C5CE7] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
            />
          </div>
        </div>
      </div>

      {/* Star Rating Card */}
      <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-[13px] font-bold text-[#111318] dark:text-white">Star Rating</h3>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setMinStars(star === minStars ? 0 : star)}
                aria-label={`${star} stars and up`}
                className="transition hover:scale-110"
              >
                <Star
                  className={`h-4 w-4 ${
                    star <= minStars
                      ? 'fill-[#FACC15] text-[#FACC15]'
                      : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {minStars > 0 ? `${minStars} Stars & up` : 'All ratings'}
          </span>
        </div>
      </div>

      {/* Brand Filter Card */}
      <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[#111318] dark:text-white">Brand</h3>
          <button
            type="button"
            onClick={() => setSelectedBrands([])}
            className="text-[11px] font-medium text-slate-400 transition hover:text-[#6C5CE7]"
          >
            Reset
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          {visibleBrands.map((brand) => {
            const checked = selectedBrands.includes(brand.key);
            return (
              <button
                key={brand.key}
                type="button"
                onClick={() => toggleBrand(brand.key)}
                className="flex w-full items-center justify-between text-left transition hover:opacity-85"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F2F3F7] text-[9px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {brand.badge}
                  </span>
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                    {brand.key}
                  </span>
                </span>
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition ${
                    checked
                      ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white'
                      : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950'
                  }`}
                >
                  {checked && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAllBrands((v) => !v)}
          className="mt-3 text-[11px] font-semibold text-[#6C5CE7] hover:underline"
        >
          {showAllBrands ? 'Show Less' : 'More Brand'}
        </button>
      </div>

      {/* Delivery Options Card */}
      <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-[13px] font-bold text-[#111318] dark:text-white">Delivery Options</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDeliveryOption('standard')}
            className={`rounded-full py-2 text-xs font-semibold transition ${
              deliveryOption === 'standard'
                ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.28)]'
                : 'bg-[#F2F3F7] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setDeliveryOption('express')}
            className={`rounded-full py-2 text-xs font-semibold transition ${
              deliveryOption === 'express'
                ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.28)]'
                : 'bg-[#F2F3F7] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Express
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-[#F4F5FA] dark:bg-[#0d0f14]">
      <div className="mx-auto max-w-[1280px] px-3 py-4 pb-24 sm:px-6 sm:py-6">
        {/* Top White Storefront Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white px-4 py-3 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:border dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex flex-1 items-center gap-4 min-w-[220px]">
            <button
              type="button"
              onClick={() => {
                setView('store');
                setOnlyFavourites(false);
              }}
              className="flex items-center gap-2 shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/android-chrome-192x192.png"
                alt="HyperBuds"
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-base font-black tracking-tight text-[#111318] dark:text-white">
                HB STORE
              </span>
            </button>

            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (view !== 'store') setView('store');
                }}
                placeholder="Search creator mics, cameras, lighting..."
                className="h-10 w-full rounded-full bg-[#F2F3F7] pr-4 pl-10 text-xs text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#6C5CE7]/40 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            <button
              type="button"
              onClick={() => setView(view === 'orders' ? 'store' : 'orders')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                view === 'orders'
                  ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Orders</span>
              {orders.length > 0 && (
                <span className="text-[10px] text-slate-400">({orders.length})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setView('store');
                setOnlyFavourites((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                onlyFavourites && view === 'store'
                  ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  onlyFavourites ? 'fill-[#6C5CE7] text-[#6C5CE7]' : ''
                }`}
              />
              <span className="hidden sm:inline">Favourites</span>
              {favourites.length > 0 && (
                <span className="text-[10px] text-[#6C5CE7]">({favourites.length})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="relative">
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5757] px-1 text-[9px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </span>
              <span>Cart</span>
            </button>
          </div>
        </header>

        {view === 'orders' ? (
          /* ORDERS, RETURNS & DISPUTES VIEW */
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => setView('store')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C5CE7] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Marketplace
            </button>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Orders ({orders.length})
                </h2>
                {orders.length === 0 ? (
                  <div className="rounded-[20px] bg-white p-10 text-center text-xs text-slate-500 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
                    You haven&apos;t placed any gear orders yet.
                  </div>
                ) : (
                  orders.map((ord) => {
                    const oid = ord._id || ord.id || '';
                    const st = ord.fulfillmentStatus || ord.status || 'pending_payment';
                    const amt = Number(ord.totalPriceMinor ?? ord.totalCents ?? 0);
                    return (
                      <div
                        key={oid}
                        className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              Order #{oid.slice(-8)} · Qty {ord.quantity}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatPrice(amt, ord.currency)} ·{' '}
                              {ord.shippingCountry || ord.shippingAddress?.country || 'US'}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-[11px] font-semibold text-[#6C5CE7]">
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
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
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
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Open Dispute
                          </button>
                        </div>

                        {actionOrderId === oid && actionMode && (
                          <form onSubmit={handleOrderAction} className="mt-3 flex gap-2">
                            <input
                              required
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder={
                                actionMode === 'return'
                                  ? 'Reason for return...'
                                  : 'Describe issue for dispute review...'
                              }
                              className="flex-1 rounded-full border border-slate-200 bg-[#F4F5FA] px-3.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <button
                              type="submit"
                              disabled={busyId === oid}
                              className="rounded-full bg-[#6C5CE7] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#5b4bd6]"
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
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Disputes ({disputes.length})
                </h2>
                {disputes.length === 0 ? (
                  <div className="rounded-[20px] bg-white p-8 text-center text-xs text-slate-500 shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900">
                    No active disputes.
                  </div>
                ) : (
                  disputes.map((d) => (
                    <div
                      key={d._id}
                      className="rounded-[20px] bg-white p-4 text-xs shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Order #{d.orderId.slice(-8)}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          {d.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{d.reason}</p>
                      {d.resolutionNote && (
                        <p className="mt-1.5 text-[11px] font-medium text-emerald-600">
                          Resolution: {d.resolutionNote}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* PIXEL-PERFECT STOREFRONT VIEW */
          <>
            {/* Horizontal Category Pills Row */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.05)] dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#6C5CE7]" />
                Filters
              </button>

              {CATEGORY_PILLS.map((pill) => {
                const active = activeCategory === pill.key && !onlyFavourites;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => {
                      setOnlyFavourites(false);
                      setActiveCategory(pill.key);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-[#6C5CE7] text-white shadow-[0_6px_16px_rgba(108,92,231,0.32)]'
                        : 'bg-white text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,0.04)] hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {mobileFiltersOpen && (
              <div className="mt-4 lg:hidden">{FilterPanel}</div>
            )}

            {/* Main Two-Column Store Layout */}
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
              {/* Left Sidebar Filters (Desktop) */}
              <aside className="hidden w-[258px] shrink-0 lg:block">{FilterPanel}</aside>

              {/* Right 3-Column Product Grid */}
              <main className="min-w-0 flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className="h-[310px] animate-pulse rounded-[22px] bg-white dark:bg-slate-900"
                      />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-[22px] bg-white p-12 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border dark:border-slate-800 dark:bg-slate-900">
                    <ShoppingBag className="mx-auto h-9 w-9 text-[#6C5CE7]/60" />
                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                      No products match your filters
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try adjusting the price range, rating, or brand filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setActiveCategory('all');
                        setOnlyFavourites(false);
                        setMinPriceUsd(20);
                        setMaxPriceUsd(1130);
                        setMinStars(0);
                        setSelectedBrands([]);
                      }}
                      className="mt-4 rounded-full bg-[#6C5CE7] px-5 py-2 text-xs font-semibold text-white"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product, idx) => {
                      const id = product._id || product.id || '';
                      const priceMinor = Number(product.priceMinor ?? product.priceCents ?? 0);
                      const compareMinor = DEAL_COMPARE_PRICES[id];
                      const isTopItem = TOP_ITEM_IDS.has(id);
                      const isFav = favourites.includes(id);
                      const imgUrl = product.images?.[0];
                      const isAffiliate = product.providerType === 'affiliate';
                      const isFeaturedViolet =
                        id === 'hb-gear-hb-hoodie' || (idx === 4 && filteredProducts.length >= 5);

                      if (isFeaturedViolet) {
                        return (
                          <article
                            key={id}
                            className="group relative flex min-h-[322px] flex-col justify-end overflow-hidden rounded-[22px] bg-linear-to-br from-[#8B5CF6] via-[#6C5CE7] to-[#4338CA] p-5 text-white shadow-[0_12px_32px_rgba(108,92,231,0.28)]"
                          >
                            {imgUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imgUrl}
                                alt={product.title}
                                className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-luminosity transition duration-500 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-[#3B28CC]/95 via-[#6C5CE7]/45 to-transparent" />

                            {/* Favourite button */}
                            <button
                              type="button"
                              onClick={() => toggleFavourite(id)}
                              aria-label="Toggle favourite"
                              className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6C5CE7] shadow-sm transition hover:scale-105"
                            >
                              <Heart className={`h-4 w-4 ${isFav ? 'fill-[#6C5CE7]' : ''}`} />
                            </button>

                            {/* Floating frosted review badges (reference spotlight motif) */}
                            <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow backdrop-blur-md">
                              <span className="h-4 w-4 rounded-full bg-[#6C5CE7] text-center text-[9px] leading-4 text-white">
                                A
                              </span>
                              <span>4.9/5</span>
                              <Star className="h-3 w-3 fill-[#FACC15] text-[#FACC15]" />
                            </div>
                            <div className="pointer-events-none absolute top-16 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow backdrop-blur-md">
                              <span className="h-4 w-4 rounded-full bg-emerald-500 text-center text-[9px] leading-4 text-white">
                                K
                              </span>
                              <span>4.8/5</span>
                              <Star className="h-3 w-3 fill-[#FACC15] text-[#FACC15]" />
                            </div>
                            <div className="pointer-events-none absolute top-28 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow backdrop-blur-md">
                              <span className="h-4 w-4 rounded-full bg-slate-900 text-center text-[9px] leading-4 text-white">
                                M
                              </span>
                              <span>5/5</span>
                              <Star className="h-3 w-3 fill-[#FACC15] text-[#FACC15]" />
                            </div>

                            <div className="relative z-20 mt-auto text-center">
                              <h2 className="line-clamp-2 text-[14px] font-bold leading-snug text-white">
                                {product.title}
                              </h2>
                              <div className="mt-3 flex justify-center">
                                <button
                                  type="button"
                                  disabled={busyId === id}
                                  onClick={() => handleAddToCart(product)}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/75 bg-white/15 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-[#6C5CE7] disabled:opacity-50"
                                >
                                  <ShoppingBag className="h-3.5 w-3.5" />
                                  {formatPrice(priceMinor, product.currency)}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      }

                      return (
                        <article
                          key={id}
                          className="group flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(108,92,231,0.10)] dark:border dark:border-slate-800 dark:bg-slate-900"
                        >
                          {/* Top Studio Gray Image Stage */}
                          <div className="relative aspect-[4/3.1] w-full overflow-hidden bg-linear-to-b from-[#EAECEF] via-[#F2F3F6] to-[#F8F9FB] dark:from-slate-800 dark:to-slate-900">
                            {imgUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imgUrl}
                                alt={product.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package className="h-10 w-10" />
                              </div>
                            )}

                            {/* Top-right circular white Favourite button */}
                            <button
                              type="button"
                              onClick={() => toggleFavourite(id)}
                              aria-label="Toggle favourite"
                              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6C5CE7] shadow-sm transition hover:scale-105 dark:bg-slate-900"
                            >
                              <Heart className={`h-4 w-4 ${isFav ? 'fill-[#6C5CE7]' : ''}`} />
                            </button>
                          </div>

                          {/* Optional Yellow "Top item" Pill straddling seam */}
                          {isTopItem && (
                            <span className="relative z-10 mx-auto -mt-3 rounded-full bg-[#FFE44D] px-3 py-0.5 text-[11px] font-bold text-[#111318] shadow-xs">
                              Top item
                            </span>
                          )}

                          {/* Centered White Body */}
                          <div className={`flex flex-1 flex-col items-center px-4 pb-4 text-center ${isTopItem ? 'pt-2' : 'pt-3.5'}`}>
                            <h2 className="w-full truncate text-[13px] font-bold text-[#14171F] dark:text-white">
                              {product.title}
                            </h2>

                            <div className="mt-3 flex items-center justify-center gap-2.5">
                              {compareMinor && compareMinor > priceMinor && (
                                <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                                  {formatPrice(compareMinor, product.currency)}
                                </span>
                              )}
                              <button
                                type="button"
                                disabled={busyId === id}
                                onClick={() => handleAddToCart(product)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#6C5CE7]/60 bg-white px-4 py-1.5 text-[12px] font-bold tabular-nums text-[#6C5CE7] transition hover:bg-[#6C5CE7] hover:text-white disabled:opacity-50 dark:bg-slate-900 dark:hover:bg-[#6C5CE7]"
                              >
                                {isAffiliate ? (
                                  <ExternalLink className="h-3.5 w-3.5" />
                                ) : (
                                  <ShoppingBag className="h-3.5 w-3.5" />
                                )}
                                {formatPrice(priceMinor, product.currency)}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>

      {/* SLIDE-OVER CART & CREDIT-DISCOUNT CHECKOUT DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#6C5CE7]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your Cart ({cartItemCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.items.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  Your cart is empty. Click any price pill to add creator gear.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatPrice(item.unitPriceMinor, item.currency)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={busyId === item.productId}
                            onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                            className="rounded-full border border-slate-200 p-1 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={busyId === item.productId || item.quantity >= item.stockQty}
                            onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                            className="rounded-full border border-slate-200 p-1 text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.productId, 0)}
                            className="ml-1 text-slate-400 hover:text-rose-500"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Credit Discount Cap Box */}
                  <div className="rounded-2xl bg-[#F4F5FA] p-3.5 dark:bg-slate-950">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        Credits (max {cart.discountCapPercent}% cap)
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
                        className="w-24 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setCreditsToApply(cart.maxApplicableCredits)}
                        className="rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-[11px] font-semibold text-[#6C5CE7]"
                      >
                        Use max ({cart.maxApplicableCredits} cr)
                      </button>
                    </div>
                  </div>

                  {/* Shipping & Jurisdiction Form */}
                  <form id="hb-cart-checkout-form" onSubmit={handleCheckout} className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Shipping ({deliveryOption === 'express' ? 'Express' : 'Standard'})
                    </p>
                    <select
                      value={shipCountry}
                      onChange={(e) => setShipCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      {SHIPPING_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    {jurisdictionCheck && (
                      <div
                        className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] ${
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <input
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal code"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-slate-200 p-5 dark:border-slate-800">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(cart.subtotalMinor, cart.currency)}</span>
                  </div>
                  {creditDiscountMinor > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Credit Discount ({appliedCredits} cr)</span>
                      <span className="tabular-nums">-{formatPrice(creditDiscountMinor, cart.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(netTotalMinor, cart.currency)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  form="hb-cart-checkout-form"
                  disabled={
                    checkingOut || (jurisdictionCheck !== null && !jurisdictionCheck.allowed)
                  }
                  className="mt-4 w-full rounded-full bg-[#6C5CE7] py-2.5 text-xs font-bold text-white shadow-[0_6px_18px_rgba(108,92,231,0.35)] transition hover:bg-[#5b4bd6] disabled:opacity-40"
                >
                  {checkingOut ? 'Placing order...' : `Checkout · ${formatPrice(netTotalMinor, cart.currency)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
