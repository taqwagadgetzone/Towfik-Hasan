import { CheckCircle2, MapPin, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { DEFAULT_DELIVERY_ZONES } from '../../data/seedData';
import { createOrder } from '../../services/cmsService';
import { CartItem, DeliveryZone, Order, StoreLanguage, ThemeSettings } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: string;
  theme: ThemeSettings;
  deliveryZones?: DeliveryZone[];
  lang?: StoreLanguage;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export function CartCheckoutDrawer({
  isOpen,
  onClose,
  items,
  currency,
  theme,
  deliveryZones = DEFAULT_DELIVERY_ZONES,
  lang = 'bn',
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartCheckoutDrawerProps) {
  const zones = deliveryZones.length > 0 ? deliveryZones : DEFAULT_DELIVERY_ZONES;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || 'zone-city');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const deliveryFee = activeZone ? activeZone.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        deliveryZone: lang === 'bn' ? activeZone.labelBn : activeZone.labelEn,
        deliveryFee,
        subtotal,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          modelNumber: i.modelNumber,
          image: i.image,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          selectedColor: i.selectedColor || '',
          selectedVariation: i.selectedVariation || '',
        })),
        totalAmount: grandTotal,
      });
      setConfirmedOrder(order);
      onClearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setShippingAddress('');
      setNotes('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to place order. Please check your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]">
      <div
        className="w-full max-w-lg bg-white text-slate-900 h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ fontFamily: `"${theme.bodyFont}", sans-serif` }}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
            >
              {confirmedOrder
                ? lang === 'bn'
                  ? 'অর্ডার কনফার্ম হয়েছে'
                  : 'Order Confirmed'
                : lang === 'bn'
                ? 'আপনার শপিং ব্যাগ'
                : 'Your Hardware Bag'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            aria-label="Close bag"
            className="p-2 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {confirmedOrder ? (
            <div className="p-6 rounded-lg border border-emerald-200 bg-emerald-50/70 space-y-4">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider">Order Recorded</p>
                  <h3 className="text-lg font-bold font-mono tabular-nums">
                    {confirmedOrder.orderNumber}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {lang === 'bn' ? (
                  <>
                    ধন্যবাদ, <span className="font-semibold">{confirmedOrder.customerName}</span>।
                    আমাদের ডেলিভারি ডেস্ক শীঘ্রই{' '}
                    <span className="font-mono">{confirmedOrder.customerPhone}</span> নম্বরে কল করে
                    কনফার্ম করবে।
                  </>
                ) : (
                  <>
                    Thank you, <span className="font-semibold">{confirmedOrder.customerName}</span>.
                    Our dispatch desk will confirm delivery on{' '}
                    <span className="font-mono">{confirmedOrder.customerPhone}</span>.
                  </>
                )}
              </p>
              <div className="border-t border-emerald-200 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {lang === 'bn' ? 'পেমেন্ট' : 'Payment'}
                  </span>
                  <span className="font-medium">
                    {confirmedOrder.paymentMethod === 'cod'
                      ? lang === 'bn'
                        ? 'ক্যাশ অন ডেলিভারি'
                        : 'Cash on Delivery (Open-Box Check)'
                      : 'Online Payment Verification'}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{lang === 'bn' ? 'সর্বমোট মূল্য' : 'Total Payable'}</span>
                  <span className="font-mono tabular-nums">
                    {currency}
                    {confirmedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}
                className="w-full py-2.5 text-sm font-semibold rounded-md"
              >
                {lang === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-base font-semibold text-slate-800">
                {lang === 'bn' ? 'আপনার ব্যাগটি খালি' : 'Your bag is empty'}
              </p>
              <p className="text-sm text-slate-500">
                {lang === 'bn'
                  ? 'স্মার্টওয়াচ, হেডফোন বা চার্জার থেকে পছন্দের পণ্য যোগ করুন।'
                  : 'Explore smartwatches, studio audio, and GaN chargers to start an order.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                {items.map((item) => (
                  <div key={item.key} className="p-4 flex gap-4">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-md object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-mono text-slate-500">{item.modelNumber}</p>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                      {(item.selectedColor || item.selectedVariation) && (
                        <p className="text-xs text-slate-500">
                          {[item.selectedColor, item.selectedVariation].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center border border-slate-200 rounded-md">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, -1)}
                            className="p-1.5 hover:bg-slate-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, 1)}
                            className="p-1.5 hover:bg-slate-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold font-mono tabular-nums">
                            {currency}
                            {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.key)}
                            aria-label="Remove item"
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Zone Picker */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'ডেলিভারি এলাকা' : 'Delivery Zone'}</span>
                </div>
                <div className="space-y-1.5">
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelectedZoneId(z.id)}
                      className={`w-full px-3 py-2 rounded border text-xs flex items-center justify-between ${
                        z.id === activeZone?.id
                          ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span>{lang === 'bn' ? z.labelBn : z.labelEn}</span>
                      <span className="font-mono tabular-nums">
                        {currency}
                        {z.fee}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {lang === 'bn' ? 'পণ্যের দাম' : 'Subtotal'}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {currency}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {currency}
                    {deliveryFee}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold">
                  <span>{lang === 'bn' ? 'সর্বমোট মূল্য' : 'Total'}</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    {currency}
                    {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <h3
                  className="text-sm font-bold uppercase tracking-wider text-slate-500"
                  style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                >
                  {lang === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery & Verification Details'}
                </h3>

                {errorMsg && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'bn' ? 'আপনার নাম' : 'Tariqul Islam'}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {lang === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      minLength={6}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {lang === 'bn' ? 'পূর্ণ ঠিকানা *' : 'Full Delivery Address *'}
                  </label>
                  <textarea
                    required
                    minLength={5}
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={
                      lang === 'bn' ? 'বাসা/রোড, এলাকা, জেলা' : 'House, Road, Area, City'
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`px-3 py-2 text-xs font-semibold rounded-md border text-left ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`px-3 py-2 text-xs font-semibold rounded-md border text-left ${
                        paymentMethod === 'online'
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lang === 'bn' ? 'অনলাইন পেমেন্ট' : 'Online Transfer'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {lang === 'bn' ? 'অর্ডার নোট (ঐচ্ছিক)' : 'Delivery Note'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      lang === 'bn' ? 'বিশেষ নির্দেশনা লিখুন...' : 'Delivery instructions...'
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}
                  className="w-full py-3 text-sm font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {submitting
                    ? lang === 'bn'
                      ? 'অর্ডার কনফার্ম হচ্ছে...'
                      : 'Confirming Order...'
                    : lang === 'bn'
                    ? `অর্ডার কনফার্ম করুন · ${currency}${grandTotal.toLocaleString()}`
                    : `Place Order · ${currency}${grandTotal.toLocaleString()}`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
