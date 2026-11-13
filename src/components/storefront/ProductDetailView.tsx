import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Minus,
  PhoneCall,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  User,
  X,
  ZoomIn,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DELIVERY_ZONES } from '../../data/seedData';
import { createOrder, saveIncompleteOrder } from '../../services/cmsService';
import { Order, Product, SiteConfig, StoreLanguage } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';
import { VisualBlockRenderer } from '../shared/VisualBlockRenderer';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  config: SiteConfig;
  lang: StoreLanguage;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    opts: { color?: string; variation?: string; quantity: number; unitPrice: number }
  ) => void;
  onNavigate: (target: string) => void;
}

export function ProductDetailView({
  product,
  allProducts,
  config,
  lang,
  onBack,
  onSelectProduct,
  onAddToCart,
  onNavigate,
}: ProductDetailViewProps) {
  const deliveryZones =
    config.deliveryZones && config.deliveryZones.length > 0
      ? config.deliveryZones
      : DEFAULT_DELIVERY_ZONES;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedVarOption, setSelectedVarOption] = useState(
    product.variations?.[0]?.options?.[0] || ''
  );
  const [qty, setQty] = useState(1);
  const [selectedZoneId, setSelectedZoneId] = useState(deliveryZones[0]?.id || 'zone-city');
  const [bottomTab, setBottomTab] = useState<'description' | 'reviews'>('description');

  // Instant COD Checkout Form State (Center Column of Screenshot 1)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Stable session lead ID for incomplete order tracking
  const leadIdRef = useRef(`lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedColorIdx(0);
    setSelectedVarOption(product.variations?.[0]?.options?.[0] || '');
    setQty(1);
    setConfirmedOrder(null);
    setFormError('');
  }, [product]);

  const { theme, currencySymbol, contact } = config;
  const isDarkSurface =
    theme.surfaceColor.toLowerCase().startsWith('#0') ||
    theme.surfaceColor.toLowerCase().startsWith('#1');

  const basePrice =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.regularPrice
      ? product.discountPrice
      : product.regularPrice;

  const firstVar = product.variations?.[0];
  const varDelta =
    firstVar && selectedVarOption && firstVar.options.indexOf(selectedVarOption) > 0
      ? firstVar.priceDelta || 0
      : 0;

  const finalUnitPrice = basePrice + varDelta;
  const regularUnitWithVar = product.regularPrice + varDelta;
  const hasDiscount = basePrice < product.regularPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.regularPrice - basePrice) / product.regularPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.regularPrice - basePrice : 0;

  const activeZone =
    deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  const deliveryFee = activeZone ? activeZone.fee : 0;
  const subtotal = finalUnitPrice * qty;
  const grandTotal = subtotal + deliveryFee;

  const images = product.images && product.images.length > 0 ? product.images : [{ url: '', caption: product.name }];
  const activeImage = images[selectedImageIdx] || images[0];
  const selectedColorName = product.colors?.[selectedColorIdx]?.name || '';

  // Debounced Incomplete Order Lead Capture when phone is typed
  useEffect(() => {
    if (confirmedOrder) return;
    const cleanPhone = customerPhone.trim();
    if (cleanPhone.length < 6) return;

    const timer = setTimeout(() => {
      saveIncompleteOrder(leadIdRef.current, {
        customerName: customerName.trim() || 'Guest Customer',
        customerPhone: cleanPhone,
        shippingAddress: shippingAddress.trim(),
        productName: product.name,
        totalAmount: grandTotal,
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [customerName, customerPhone, shippingAddress, product.name, grandTotal, confirmedOrder]);

  const handleInstantCodSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    if (customerName.trim().length < 2) {
      setFormError(lang === 'bn' ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (customerPhone.trim().length < 8) {
      setFormError(
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের ফোন নম্বর দিন।'
          : 'Please enter a valid phone number.'
      );
      return;
    }
    if (shippingAddress.trim().length < 5) {
      setFormError(
        lang === 'bn'
          ? 'অনুগ্রহ করে বাসা/রোড, এলাকা ও জেলার সম্পূর্ণ ঠিকানা লিখুন।'
          : 'Please enter your full delivery address.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: '',
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        deliveryZone: lang === 'bn' ? activeZone.labelBn : activeZone.labelEn,
        deliveryFee,
        subtotal,
        paymentMethod: 'cod',
        items: [
          {
            productId: product.id,
            productName: product.name,
            modelNumber: product.modelNumber,
            image: activeImage?.url || '',
            unitPrice: finalUnitPrice,
            quantity: qty,
            selectedColor: selectedColorName,
            selectedVariation: selectedVarOption,
          },
        ],
        totalAmount: grandTotal,
      });
      setConfirmedOrder(order);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : lang === 'bn'
          ? 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'
          : 'Unable to submit order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const relatedProducts = useMemo(
    () =>
      allProducts
        .filter(
          (p) =>
            p.id !== product.id &&
            (product.relatedProductIds?.includes(p.id) || p.category === product.category)
        )
        .slice(0, 3),
    [allProducts, product]
  );

  const phoneHref = contact.phone?.value
    ? `tel:${contact.phone.value.replace(/\s+/g, '')}`
    : '#contact';
  const waHref = contact.whatsapp?.value
    ? `https://wa.me/${contact.whatsapp.value.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `আসসালামু আলাইকুম, আমি "${product.name}" পণ্যটি অর্ডার করতে চাচ্ছি।`
      )}`
    : '#contact';

  const cardBg = theme.surfaceColor;
  const cardBorder = isDarkSurface ? 'border-white/10' : 'border-slate-200';
  const inputStyleClass = isDarkSurface
    ? 'bg-[#0B0F0D] border-white/15 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600';

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10"
      style={{ fontFamily: `"${theme.bodyFont}", sans-serif`, color: theme.textColor }}
    >
      {/* Back Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium opacity-75 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Storefront'}</span>
      </button>

      {/* Instant Order Confirmed Receipt Banner */}
      {confirmedOrder && (
        <div className="p-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-semibold">
                  {lang === 'bn' ? 'অর্ডার সফলভাবে গৃহীত হয়েছে' : 'Order Confirmed'}
                </p>
                <h2 className="text-lg sm:text-xl font-bold font-mono tabular-nums">
                  {lang === 'bn' ? 'অর্ডার নম্বর:' : 'Order ID:'} {confirmedOrder.orderNumber}
                </h2>
              </div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <p className="text-xs opacity-70">{lang === 'bn' ? 'সর্বমোট মূল্য' : 'Total Payable'}</p>
              <p className="text-xl font-bold text-emerald-500">
                {currencySymbol}
                {confirmedOrder.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm opacity-90">
            {lang === 'bn'
              ? `ধন্যবাদ, ${confirmedOrder.customerName}! আমাদের প্রতিনিধি শীঘ্রই ${confirmedOrder.customerPhone} নম্বরে কল করে অর্ডারটি কনফার্ম করবেন।`
              : `Thank you, ${confirmedOrder.customerName}! Our team will call ${confirmedOrder.customerPhone} shortly to confirm dispatch.`}
          </p>
        </div>
      )}

      {/* 3-COLUMN SCREENSHOT-ACCURATE INSTANT COD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 cols): Main Gallery + % OFF + Zoom + Thumbnail Carousel */}
        <div className="lg:col-span-4 space-y-3">
          <div
            style={{ backgroundColor: cardBg }}
            className={`relative overflow-hidden rounded-xl border ${cardBorder}`}
          >
            <SafeImage
              src={activeImage?.url}
              alt={activeImage?.caption || product.name}
              className="w-full aspect-square object-cover"
            />
            {hasDiscount && discountPct > 0 && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold font-mono tabular-nums shadow">
                {discountPct}% OFF
              </span>
            )}
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/75 text-white text-xs font-medium hover:bg-black transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'জুম দেখুন' : 'Zoom'}</span>
            </button>
          </div>

          {/* Thumbnail Strip with Circular Prev/Next Buttons */}
          {images.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setSelectedImageIdx((prev) => (prev - 1 + images.length) % images.length)
                }
                className="w-7 h-7 rounded-full border border-emerald-500/50 text-emerald-500 flex items-center justify-center shrink-0 hover:bg-emerald-500/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 transition-all ${
                      idx === selectedImageIdx
                        ? 'border-emerald-500 ring-1 ring-emerald-500'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img.url}
                      alt={img.caption || `${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Next image"
                onClick={() => setSelectedImageIdx((prev) => (prev + 1) % images.length)}
                className="w-7 h-7 rounded-full border border-emerald-500/50 text-emerald-500 flex items-center justify-center shrink-0 hover:bg-emerald-500/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CENTER COLUMN (4 cols): Title + Price/Savings + Inline COD Customer Info Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-1.5">
            <h1
              className="text-xl sm:text-2xl font-bold leading-snug tracking-tight"
              style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
            >
              {product.name}
            </h1>
            <p className="text-xs opacity-75 leading-relaxed">{product.shortDescription}</p>

            <div className="flex flex-wrap items-baseline gap-2.5 pt-2 font-mono tabular-nums">
              <span className="text-2xl font-bold text-emerald-500">
                {currencySymbol}
                {finalUnitPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm line-through opacity-50">
                    {currencySymbol}
                    {regularUnitWithVar.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-xs font-sans font-semibold">
                    {lang === 'bn'
                      ? `সাশ্রয় ${currencySymbol}${savingsAmount.toLocaleString()}`
                      : `Save ${currencySymbol}${savingsAmount.toLocaleString()}`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Inline COD Customer Information Card ("আপনার তথ্য দিন") */}
          <form
            id="cod-checkout-form"
            onSubmit={handleInstantCodSubmit}
            style={{ backgroundColor: cardBg }}
            className={`rounded-xl border ${cardBorder} p-4 sm:p-5 space-y-3.5`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-current/10">
              <span className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold">
                {lang === 'bn' ? 'আপনার তথ্য দিন' : 'Your Delivery Information'}
              </h2>
            </div>

            {formError && (
              <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-medium">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                {lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={lang === 'bn' ? 'আপনার নাম লিখুন...' : 'Enter your full name...'}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none ${inputStyleClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                {lang === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={lang === 'bn' ? '01XXXXXXXXX বা ০১XXXXXXXXX' : '+880 1XXX-XXXXXX'}
                className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none font-mono ${inputStyleClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                {lang === 'bn' ? 'ঠিকানা *' : 'Full Address *'}
              </label>
              <textarea
                rows={2}
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={
                  lang === 'bn' ? 'বাসা/রোড, এলাকা, জেলা' : 'House/Road, Area, District'
                }
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none ${inputStyleClass}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                {lang === 'bn' ? 'অর্ডার নোট (ঐচ্ছিক)' : 'Order Note (Optional)'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'অতিরিক্ত মন্তব্য বা নির্দেশ লিখুন'
                    : 'Any special delivery instruction...'
                }
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none ${inputStyleClass}`}
              />
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN (4 cols): Variant Thumbnails, Qty, Delivery Zones, Summary, Emerald CTA, Call/WhatsApp */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Variant Picker Card */}
          <div
            style={{ backgroundColor: cardBg }}
            className={`rounded-xl border ${cardBorder} p-4 space-y-3`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">
                {lang === 'bn' ? 'ভ্যারিয়েন্ট নির্বাচন করুন *' : 'Select Variant *'}
              </span>
              <span className="opacity-70">{selectedColorName || product.modelNumber}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(product.colors && product.colors.length > 0
                ? product.colors.map((c, idx) => ({
                    idx,
                    label: c.name,
                    thumb: images[idx % images.length]?.url || activeImage?.url,
                  }))
                : images.slice(0, 3).map((img, idx) => ({
                    idx,
                    label: img.caption || `Option ${idx + 1}`,
                    thumb: img.url,
                  }))
              ).map((v) => (
                <button
                  key={v.idx}
                  type="button"
                  onClick={() => {
                    setSelectedColorIdx(v.idx);
                    if (images[v.idx]) setSelectedImageIdx(v.idx);
                  }}
                  title={v.label}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedColorIdx === v.idx
                      ? 'border-emerald-500 ring-1 ring-emerald-500'
                      : 'border-current/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={v.thumb}
                    alt={v.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {firstVar && firstVar.options.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {firstVar.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedVarOption(opt)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                      selectedVarOption === opt
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500 font-semibold'
                        : 'border-current/15 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity Stepper Card */}
          <div
            style={{ backgroundColor: cardBg }}
            className={`rounded-xl border ${cardBorder} px-4 py-3 flex items-center justify-between`}
          >
            <span className="text-xs font-bold">{lang === 'bn' ? 'পরিমাণ' : 'Quantity'}</span>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-md border border-current/20 flex items-center justify-center hover:bg-current/10"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-mono font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(Math.max(1, product.stock), q + 1))}
                className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Delivery Zone Radio Cards */}
          <div
            style={{ backgroundColor: cardBg }}
            className={`rounded-xl border ${cardBorder} p-4 space-y-2.5`}
          >
            <div className="flex items-center gap-2 text-xs font-bold pb-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>
                {lang === 'bn' ? 'আপনার ডেলিভারি এলাকা বেছে নিন' : 'Choose Delivery Zone'}
              </span>
            </div>

            <div className="space-y-2">
              {deliveryZones.map((zone) => {
                const active = zone.id === activeZone?.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/10 font-semibold'
                        : 'border-current/15 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          active ? 'border-emerald-500' : 'border-current/40'
                        }`}
                      >
                        {active && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </span>
                      <span>{lang === 'bn' ? zone.labelBn : zone.labelEn}</span>
                    </span>
                    <span className="font-mono tabular-nums font-bold">
                      {currencySymbol}
                      {zone.fee}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Order Summary Card */}
          <div
            style={{ backgroundColor: cardBg }}
            className={`rounded-xl border ${cardBorder} p-4 space-y-3`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-current/10">
              <SafeImage
                src={activeImage?.url}
                alt={product.name}
                className="w-11 h-11 rounded-md object-cover shrink-0 border border-current/10"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{product.name}</p>
                <p className="text-[11px] opacity-65 font-mono tabular-nums">
                  {qty}x · {currencySymbol}
                  {finalUnitPrice.toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-mono font-bold tabular-nums">
                {currencySymbol}
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between opacity-80">
                <span>{lang === 'bn' ? 'পণ্যের দাম' : 'Product Subtotal'}</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between opacity-80">
                <span>{lang === 'bn' ? 'ডেলিভারি' : 'Delivery Charge'}</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol}
                  {deliveryFee}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-current/10 text-sm font-bold">
                <span>{lang === 'bn' ? 'সর্বমোট মূল্য' : 'Total Payable'}</span>
                <span className="font-mono tabular-nums text-emerald-500 text-base">
                  {currencySymbol}
                  {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Emerald Confirm Order Button */}
          <button
            type="button"
            disabled={submitting || product.stock <= 0}
            onClick={() => handleInstantCodSubmit()}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {submitting
                ? lang === 'bn'
                  ? 'অর্ডার প্রসেস হচ্ছে...'
                  : 'Submitting Order...'
                : lang === 'bn'
                ? `অর্ডার কনফার্ম করুন ${currencySymbol}${grandTotal.toLocaleString()}`
                : `Confirm Order ${currencySymbol}${grandTotal.toLocaleString()}`}
            </span>
          </button>

          {/* Optional Add to Bag for Multi-Item Cart */}
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() =>
              onAddToCart(product, {
                color: selectedColorName,
                variation: selectedVarOption,
                quantity: qty,
                unitPrice: finalUnitPrice,
              })
            }
            className="w-full py-2 px-3 rounded-lg border border-current/20 hover:bg-current/5 text-xs font-semibold"
          >
            {lang === 'bn'
              ? 'একাধিক পণ্য নিতে কার্টে যোগ করুন'
              : 'Add to Bag (Multi-Item Checkout)'}
          </button>

          {/* Call & WhatsApp Strip */}
          <div className="pt-1 space-y-2 text-center">
            <p className="text-[11px] opacity-65">
              {lang === 'bn' ? 'সাহায্য লাগলে যোগাযোগ করুন' : 'Need help? Contact us'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={phoneHref}
                className="py-2.5 px-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/20"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'কল করুন' : 'Call Now'}</span>
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Description & Reviews Tabs + Specs + Visual Blocks + Trust Cards */}
      <div
        style={{ backgroundColor: cardBg }}
        className={`rounded-xl border ${cardBorder} p-5 sm:p-7 space-y-6`}
      >
        <div className="flex items-center gap-6 border-b border-current/10 pb-3 text-sm font-bold">
          <button
            type="button"
            onClick={() => setBottomTab('description')}
            className={`pb-3 -mb-3.5 border-b-2 transition-colors ${
              bottomTab === 'description'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent opacity-65 hover:opacity-100'
            }`}
          >
            {lang === 'bn' ? 'বিবরণ' : 'Description'}
          </button>
          <button
            type="button"
            onClick={() => setBottomTab('reviews')}
            className={`pb-3 -mb-3.5 border-b-2 transition-colors ${
              bottomTab === 'reviews'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent opacity-65 hover:opacity-100'
            }`}
          >
            {lang === 'bn' ? 'রিভিউসমূহ (2)' : 'Reviews (2)'}
          </button>
        </div>

        {bottomTab === 'description' ? (
          <div className="space-y-8">
            <div className="space-y-2.5">
              <h2
                className="text-base sm:text-lg font-bold"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {lang === 'bn' ? 'বিবরণ' : 'Product Overview'}
              </h2>
              <p className="text-sm opacity-85 leading-relaxed whitespace-pre-line">
                {product.fullDescription || product.shortDescription}
              </p>
            </div>

            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-3">
                <h3
                  className="text-base font-bold"
                  style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                >
                  {lang === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}
                </h3>
                <div className="divide-y divide-current/10 border border-current/10 rounded-lg overflow-hidden">
                  {product.specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-2 px-4 py-3 text-xs sm:text-sm gap-2"
                    >
                      <span className="opacity-70 font-medium">{spec.label}</span>
                      <span className="font-mono tabular-nums font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CMS Visual Description Blocks (Includes FAQs, Feature Grid, Videos, etc.) */}
            {product.descriptionBlocks && product.descriptionBlocks.length > 0 && (
              <VisualBlockRenderer
                blocks={product.descriptionBlocks}
                theme={theme}
                onAddToCart={() => {
                  const el = document.getElementById('cod-checkout-form');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onNavigate={onNavigate}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'তারিকুল ইসলাম · ঢাকা',
                text: 'অর্ডার করার ২৪ ঘণ্টার মধ্যে হাতে পেয়েছি। ডিসপ্লে ও ব্লুটুথ কলিং একদম পারফেক্ট কাজ করছে।',
              },
              {
                name: 'সাব্বির আহমেদ · রাজশাহী',
                text: 'প্যাকেজিং খুবই সুন্দর ছিল এবং বক্সের ভেতরে ২টি স্ট্র্যাপই পেয়েছি। ধন্যবাদ তাকওয়া গ্যাজেট জোন।',
              },
            ].map((rev, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-current/10 space-y-2 bg-current/[0.02]"
              >
                <div className="flex items-center gap-1 text-emerald-500">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm opacity-85">"{rev.text}"</p>
                <p className="text-xs font-semibold opacity-70">{rev.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom 2-Column Trust Cards (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          style={{ backgroundColor: cardBg }}
          className={`p-5 rounded-xl border ${cardBorder} flex items-center gap-4`}
        >
          <span className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-bold">
              {lang === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Nationwide Delivery'}
            </p>
            <p className="text-xs opacity-70">
              {product.deliveryInfo ||
                (lang === 'bn' ? '১–৩ দিনের মধ্যে হোম ডেলিভারি' : 'Delivered within 1–3 days')}
            </p>
          </div>
        </div>

        <div
          style={{ backgroundColor: cardBg }}
          className={`p-5 rounded-xl border ${cardBorder} flex items-center gap-4`}
        >
          <span className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-bold">{lang === 'bn' ? 'গ্যারান্টি' : 'Official Guarantee'}</p>
            <p className="text-xs opacity-70">
              {product.warranty ||
                (lang === 'bn' ? '১০০% অরিজিনাল পণ্য' : '100% Authentic Hardware')}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-5 pt-4">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
          >
            {lang === 'bn' ? 'সম্পর্কিত আরও গ্যাজেট' : 'Related Hardware'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                currency={currencySymbol}
                theme={theme}
                lang={lang}
                onSelectProduct={onSelectProduct}
                onQuickAdd={(p) =>
                  onAddToCart(p, {
                    quantity: 1,
                    unitPrice:
                      p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.regularPrice
                        ? p.discountPrice
                        : p.regularPrice,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Image Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-950 rounded-xl overflow-hidden border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close zoom"
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <SafeImage
              src={activeImage?.url}
              alt={activeImage?.caption || product.name}
              className="w-full max-h-[80vh] object-contain"
            />
            {activeImage?.caption && (
              <p className="px-4 py-3 text-xs text-slate-300 border-t border-white/10">
                {activeImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
