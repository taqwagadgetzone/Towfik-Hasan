import { CheckCircle2, PhoneCall, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { DEFAULT_DELIVERY_ZONES } from '../../data/seedData';
import { createOrder, deleteIncompleteOrder } from '../../services/cmsService';
import { DeliveryZone, IncompleteOrder, Order, Product } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface PosManagerProps {
  products: Product[];
  currency: string;
  deliveryZones?: DeliveryZone[];
  onRefreshData: () => Promise<void>;
}

export function PosManager({
  products,
  currency,
  deliveryZones = DEFAULT_DELIVERY_ZONES,
  onRefreshData,
}: PosManagerProps) {
  const zones = deliveryZones.length > 0 ? deliveryZones : DEFAULT_DELIVERY_ZONES;
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('POS / Phone Order');
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = selectedProduct
    ? selectedProduct.discountPrice &&
      selectedProduct.discountPrice > 0 &&
      selectedProduct.discountPrice < selectedProduct.regularPrice
      ? selectedProduct.discountPrice
      : selectedProduct.regularPrice
    : 0;
  const activeZone = zones.find((z) => z.id === zoneId) || zones[0];
  const deliveryFee = activeZone ? activeZone.fee : 0;
  const subtotal = unitPrice * qty;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: '',
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        deliveryZone: activeZone?.labelBn || 'POS',
        deliveryFee,
        subtotal,
        paymentMethod: 'cod',
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            modelNumber: selectedProduct.modelNumber,
            image: selectedProduct.images?.[0]?.url || '',
            unitPrice,
            quantity: qty,
            selectedColor: selectedProduct.colors?.[0]?.name || '',
            selectedVariation: selectedProduct.variations?.[0]?.options?.[0] || '',
          },
        ],
        totalAmount,
      });
      setCreatedOrder(order);
      setCustomerName('');
      setCustomerPhone('');
      setShippingAddress('');
      setQty(1);
      await onRefreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create POS order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-slate-100">POS — Quick Phone &amp; Walk-in Order Entry</h2>
        <p className="text-xs text-slate-400">
          Create manual orders from phone calls, Facebook Messenger, WhatsApp, or showroom walk-ins.
        </p>
      </div>

      {createdOrder && (
        <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Order <strong className="font-mono">{createdOrder.orderNumber}</strong> created for{' '}
              <strong>{createdOrder.customerName}</strong> ({currency}
              {createdOrder.totalAmount.toLocaleString()}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCreatedOrder(null)}
            className="underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 p-5 rounded-xl bg-[#111614] border border-white/10 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Product</label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({currency}
                    {(p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.regularPrice).toLocaleString()}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                minLength={2}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer full name"
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                minLength={6}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Address *</label>
            <textarea
              rows={2}
              required
              minLength={5}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="House, Road, Area, District"
              className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Zone</label>
              <select
                value={activeZone?.id || ''}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.labelBn} ({currency}
                    {z.fee})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Note</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#090D0B] border border-white/15 rounded-md text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedProduct}
            className="w-full py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>
              {submitting
                ? 'Creating Order...'
                : `Create POS Order · ${currency}${totalAmount.toLocaleString()}`}
            </span>
          </button>
        </form>

        {/* POS Ticket Preview */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#111614] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShoppingCart className="w-4 h-4" />
            <span>Order Ticket Summary</span>
          </div>
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#090D0B] border border-white/10">
              <SafeImage
                src={selectedProduct.images?.[0]?.url}
                alt={selectedProduct.name}
                className="w-14 h-14 rounded object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-100 truncate">{selectedProduct.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {qty} × {currency}
                  {unitPrice.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <span>Product Subtotal</span>
              <span className="font-mono tabular-nums">
                {currency}
                {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({activeZone?.labelBn})</span>
              <span className="font-mono tabular-nums">
                {currency}
                {deliveryFee}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-emerald-400">
              <span>Total Receivable (COD)</span>
              <span className="font-mono tabular-nums">
                {currency}
                {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IncompleteOrdersManagerProps {
  leads: IncompleteOrder[];
  currency: string;
  onRefreshData: () => Promise<void>;
}

export function IncompleteOrdersManager({
  leads,
  currency,
  onRefreshData,
}: IncompleteOrdersManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteIncompleteOrder(id);
      await onRefreshData();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-slate-100">Incomplete Orders (Abandoned Leads)</h2>
        <p className="text-xs text-slate-400">
          Customers who started filling their phone number on the instant COD checkout form without clicking Confirm Order.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111614] border border-white/10 text-sm text-slate-400">
          No incomplete order leads captured yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-[#111614] border border-white/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Est. Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold">{lead.customerName || 'Guest'}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{lead.customerPhone}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                    {lead.shippingAddress || '—'}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{lead.productName}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">
                    {currency}
                    {(Number(lead.totalAmount) || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <a
                      href={`tel:${lead.customerPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-semibold"
                    >
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                    <button
                      type="button"
                      disabled={busyId === lead.id}
                      onClick={() => handleDelete(lead.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-400 hover:bg-red-500/15"
                      title="Remove lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
