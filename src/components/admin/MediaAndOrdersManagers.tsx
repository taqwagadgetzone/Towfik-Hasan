import { Check, Copy, ImagePlus, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import {
  addMediaAsset,
  compressImageFile,
  deleteMediaAsset,
  updateOrderStatus,
} from '../../services/cmsService';
import { MediaAsset, Order } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface MediaLibraryManagerProps {
  mediaLibrary: MediaAsset[];
  onRefreshData: () => Promise<void>;
}

export function MediaLibraryManager({ mediaLibrary, onRefreshData }: MediaLibraryManagerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [folderInput, setFolderInput] = useState('uploads');
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const dataUrl = await compressImageFile(file, 1280);
      if (dataUrl.length > 780000) {
        setError('Compressed image exceeds size cap. Choose a smaller file.');
        setBusy(false);
        return;
      }
      await addMediaAsset({
        title: file.name.replace(/\.[^.]+$/, ''),
        url: dataUrl,
        folder: folderInput || 'uploads',
        altText: file.name,
        isPublic: true,
      });
      await onRefreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setError('');
    setBusy(true);
    try {
      await addMediaAsset({
        title: titleInput.trim() || 'External Asset',
        url: urlInput.trim(),
        folder: folderInput || 'external',
        altText: titleInput.trim() || 'Storefront image',
        isPublic: true,
      });
      setUrlInput('');
      setTitleInput('');
      await onRefreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save URL.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMediaAsset(id);
    await onRefreshData();
  };

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Media Library &amp; Image Uploads</h2>
        <p className="text-xs text-slate-500">
          Upload images directly or register image URLs for use across banners, products, and visual blocks.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="p-5 bg-white border border-slate-200 rounded-md grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="flex items-center justify-center gap-2.5 px-4 py-4 border border-dashed border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer text-sm font-semibold text-slate-800">
          <Upload className="w-4 h-4" />
          <span>{busy ? 'Uploading...' : 'Upload Image File (Auto-Optimized)'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <form onSubmit={handleAddUrl} className="grid grid-cols-12 gap-2 items-center">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://... Image URL"
            className="col-span-6 px-3 py-2 text-xs border border-slate-300 rounded-md"
          />
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Title"
            className="col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-md"
          />
          <select
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            className="col-span-3 px-2 py-2 text-xs border border-slate-300 rounded-md"
          >
            <option value="uploads">uploads</option>
            <option value="banners">banners</option>
            <option value="products">products</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="col-span-12 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md"
          >
            <ImagePlus className="w-3.5 h-3.5" /> Add Image URL to Library
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaLibrary.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-slate-100">
              <SafeImage
                src={asset.url}
                alt={asset.altText || asset.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 truncate">{asset.title}</p>
                <p className="text-[11px] text-slate-500 capitalize">{asset.folder}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(asset.url);
                    setCopiedId(asset.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy URL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OrdersManagerProps {
  orders: Order[];
  currency: string;
  onRefreshData: () => Promise<void>;
}

export function OrdersManager({ orders, currency, onRefreshData }: OrdersManagerProps) {
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => filter === 'all' || o.status === filter);

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      await onRefreshData();
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses: Order['status'][] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Customer Orders (7-Stage Pipeline)</h2>
          <p className="text-xs text-slate-500">
            Manage Cash on Delivery, POS, and online orders across all fulfillment stages.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['all', ...statuses].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize ${
                filter === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {s === 'pending' ? 'New / Pending' : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-md text-sm text-slate-500">
          No orders in this status yet. Orders placed via the storefront or POS appear here immediately.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-white border border-slate-200 rounded-md space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase">{order.paymentMethod}</span>
                    {order.deliveryZone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">{order.deliveryZone}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {order.customerName} · {order.customerPhone}
                  </p>
                  <p className="text-xs text-slate-500">{order.shippingAddress}</p>
                  {order.notes && (
                    <p className="text-[11px] text-amber-700 italic">Note: {order.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-700">
                    {currency}
                    {order.totalAmount.toLocaleString()}
                  </span>
                  <select
                    disabled={updatingId === order.id}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as Order['status'])
                    }
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md bg-white capitalize"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        {st === 'pending' ? 'new / pending' : st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.productName} ({item.modelNumber})
                      {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                    </span>
                    <span className="font-mono tabular-nums">
                      {currency}
                      {(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                {typeof order.deliveryFee === 'number' && order.deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Delivery Charge</span>
                    <span className="font-mono tabular-nums">
                      {currency}
                      {order.deliveryFee}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
