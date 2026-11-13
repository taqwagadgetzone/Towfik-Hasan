import {
  CheckSquare,
  Edit3,
  Eye,
  Image as ImageIcon,
  Layers,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { STUDIO_IMAGES } from '../../data/seedData';
import {
  applyTemplateToMultipleProducts,
  deleteProductById,
  saveDescriptionTemplate,
  saveProduct,
  slugify,
} from '../../services/cmsService';
import {
  DescriptionBlock,
  DescriptionTemplate,
  MediaAsset,
  Product,
  ProductPayload,
  ThemeSettings,
} from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';
import { MediaPickerModal } from './MediaPickerModal';
import { VisualDescriptionBuilder } from './VisualDescriptionBuilder';

interface ProductManagerProps {
  products: Product[];
  currency: string;
  templates: DescriptionTemplate[];
  mediaLibrary: MediaAsset[];
  theme: ThemeSettings;
  onMediaAdded: (asset: MediaAsset) => void;
  onRefreshData: () => Promise<void>;
  onPreviewProduct: (product: Product) => void;
}

function toPayload(p: Product): ProductPayload {
  const source = p.draftPayload || p;
  return {
    name: source.name || '',
    modelNumber: source.modelNumber || '',
    slug: source.slug || '',
    category: source.category || 'Smartwatches',
    regularPrice: Number(source.regularPrice) || 0,
    discountPrice:
      source.discountPrice === null || source.discountPrice === undefined
        ? null
        : Number(source.discountPrice),
    images: source.images?.length ? source.images : [{ url: STUDIO_IMAGES.smartwatchPro, caption: '' }],
    videoUrl: source.videoUrl || '',
    shortDescription: source.shortDescription || '',
    fullDescription: source.fullDescription || '',
    specifications: source.specifications || [],
    features: source.features || [],
    warranty: source.warranty || '',
    deliveryInfo: source.deliveryInfo || '',
    stock: Number(source.stock) || 0,
    colors: source.colors || [],
    variations: source.variations || [],
    seoTitle: source.seoTitle || '',
    seoDescription: source.seoDescription || '',
    badges: source.badges || [],
    relatedProductIds: source.relatedProductIds || [],
    descriptionBlocks: source.descriptionBlocks || [],
    isFeatured: Boolean(source.isFeatured),
    isBestSeller: Boolean(source.isBestSeller),
    isNewArrival: Boolean(source.isNewArrival),
  };
}

export function ProductManager({
  products,
  currency,
  templates,
  mediaLibrary,
  theme,
  onMediaAdded,
  onRefreshData,
  onPreviewProduct,
}: ProductManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPayload | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'builder'>('info');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [mediaPickIdx, setMediaPickIdx] = useState<number | null>(null);

  // Bulk template modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTplId, setBulkTplId] = useState(templates[0]?.id || '');
  const [bulkProductIds, setBulkProductIds] = useState<string[]>([]);

  const startNewProduct = () => {
    const newId = `prod-${Date.now()}`;
    setEditingId(newId);
    setPurchasePrice(0);
    setForm({
      name: 'New Tech Product',
      modelNumber: `TGZ-${Math.floor(100 + Math.random() * 900)}`,
      slug: `new-tech-product-${Date.now().toString().slice(-4)}`,
      category: 'Smartwatches',
      regularPrice: 149,
      discountPrice: 129,
      images: [{ url: STUDIO_IMAGES.smartwatchPro, caption: 'Primary Studio Angle' }],
      videoUrl: '',
      shortDescription: 'Precision-engineered consumer hardware with official warranty.',
      fullDescription: '',
      specifications: [{ group: 'General', label: 'Warranty', value: '24 Months' }],
      features: ['Factory sealed authentic unit', 'Cash on Delivery supported'],
      warranty: '24 Months Official Taqwa Care Warranty',
      deliveryInfo: 'Express 24-48h Delivery',
      stock: 20,
      colors: [{ name: 'Obsidian', hex: '#0F172A' }],
      variations: [{ name: 'Edition', options: ['Standard'], priceDelta: 0 }],
      seoTitle: '',
      seoDescription: '',
      badges: ['New'],
      relatedProductIds: [],
      descriptionBlocks: templates[0]?.blocks ? structuredClone(templates[0].blocks) : [],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
    });
    setActiveSubTab('info');
    setStatusMsg('');
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(toPayload(p));
    setPurchasePrice(Number(p.purchasePrice) || 0);
    setActiveSubTab('info');
    setStatusMsg('');
  };

  const handleSave = async (mode: 'draft' | 'publish') => {
    if (!editingId || !form) return;
    setSaving(true);
    setStatusMsg('');
    try {
      const existing = products.find((p) => p.id === editingId);
      await saveProduct(editingId, form, purchasePrice, mode, existing?.createdAt);
      await onRefreshData();
      setStatusMsg(mode === 'publish' ? 'Product published live to storefront.' : 'Product draft saved.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProductById(id);
    await onRefreshData();
    if (editingId === id) {
      setEditingId(null);
      setForm(null);
    }
  };

  const handleSaveAsTemplate = async (
    name: string,
    category: string,
    description: string,
    blocks: DescriptionBlock[]
  ) => {
    const id = `tpl-${slugify(name)}-${Date.now().toString().slice(-4)}`;
    await saveDescriptionTemplate(id, {
      name,
      category,
      description,
      blocks,
      isBuiltIn: false,
      isPublic: true,
    });
    await onRefreshData();
  };

  const handleBulkApply = async () => {
    const tpl = templates.find((t) => t.id === bulkTplId);
    if (!tpl || bulkProductIds.length === 0) return;
    setSaving(true);
    try {
      await applyTemplateToMultipleProducts(bulkProductIds, tpl.blocks, products);
      await onRefreshData();
      setShowBulkModal(false);
      setBulkProductIds([]);
    } finally {
      setSaving(false);
    }
  };

  if (editingId && form) {
    const selling =
      form.discountPrice && form.discountPrice > 0 ? form.discountPrice : form.regularPrice;
    const profit = selling - purchasePrice;
    const marginPct = selling > 0 ? ((profit / selling) * 100).toFixed(1) : '0.0';

    return (
      <div className="space-y-5">
        {/* Top Editor Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Back to Products
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900">{form.name || 'Untitled Product'}</h2>
              <p className="text-xs text-slate-500 font-mono">
                {form.modelNumber} · /{form.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onPreviewProduct({
                  ...form,
                  id: editingId,
                  status: 'draft',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md bg-white hover:bg-slate-50"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Product
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-900 text-slate-900 bg-white rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publish')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Publish Product
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            {statusMsg}
          </div>
        )}

        {/* Sub-Tabs: Product Details vs Visual Description Builder */}
        <div className="inline-flex p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeSubTab === 'info' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            1. Product Information &amp; Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('builder')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeSubTab === 'builder' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            2. Visual Description Builder ({form.descriptionBlocks.length} blocks)
          </button>
        </div>

        {activeSubTab === 'builder' ? (
          <VisualDescriptionBuilder
            blocks={form.descriptionBlocks}
            onChange={(nextBlocks) => setForm({ ...form, descriptionBlocks: nextBlocks })}
            templates={templates}
            onSaveAsTemplate={handleSaveAsTemplate}
            mediaLibrary={mediaLibrary}
            onMediaAdded={onMediaAdded}
            theme={theme}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Form */}
            <div className="lg:col-span-8 space-y-5">
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Core Identity &amp; Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Model Number *
                    </label>
                    <input
                      type="text"
                      value={form.modelNumber}
                      onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Regular Price ({currency})
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.regularPrice}
                      onChange={(e) =>
                        setForm({ ...form, regularPrice: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Discount Price ({currency})
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.discountPrice ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discountPrice: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Purchase Cost (Admin Only)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md bg-amber-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-200 font-mono tabular-nums">
                  Unit Profit: {currency}
                  {profit.toFixed(2)} ({marginPct}% margin) — Purchase cost is stored privately in admin-only rules.
                </div>
              </div>

              {/* Images & Captions + Video */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Product Images, Captions &amp; Video
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        images: [...form.images, { url: STUDIO_IMAGES.smartwatchPro, caption: '' }],
                      })
                    }
                    className="text-xs font-semibold underline"
                  >
                    + Add Image
                  </button>
                </div>

                <div className="space-y-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-md flex flex-col sm:flex-row gap-3 items-start">
                      <SafeImage
                        src={img.url}
                        alt={img.caption || form.name}
                        className="w-20 h-16 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => {
                              const next = [...form.images];
                              next[idx] = { ...img, url: e.target.value };
                              setForm({ ...form, images: next });
                            }}
                            placeholder="Image URL"
                            className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setMediaPickIdx(idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Library
                          </button>
                          {form.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...form.images];
                                next.splice(idx, 1);
                                setForm({ ...form, images: next });
                              }}
                              className="text-xs text-red-600 px-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const next = [...form.images];
                            next[idx] = { ...img, caption: e.target.value };
                            setForm({ ...form, images: next });
                          }}
                          placeholder="Image caption"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Product Video URL (YouTube / Vimeo / MP4)
                  </label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Descriptions & Features */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Descriptions, Warranty &amp; Delivery
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Description Summary
                  </label>
                  <textarea
                    rows={3}
                    value={form.fullDescription}
                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Key Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={form.features.join('\n')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        features: e.target.value.split('\n').filter((l) => l.trim() !== ''),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Warranty Information
                    </label>
                    <input
                      type="text"
                      value={form.warranty}
                      onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Information
                    </label>
                    <input
                      type="text"
                      value={form.deliveryInfo}
                      onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications Editor */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Technical Specifications</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        specifications: [
                          ...form.specifications,
                          { group: 'Hardware', label: '', value: '' },
                        ],
                      })
                    }
                    className="text-xs font-semibold underline"
                  >
                    + Add Spec
                  </button>
                </div>
                {form.specifications.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Group"
                      value={spec.group}
                      onChange={(e) => {
                        const next = [...form.specifications];
                        next[idx] = { ...spec, group: e.target.value };
                        setForm({ ...form, specifications: next });
                      }}
                      className="col-span-3 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={spec.label}
                      onChange={(e) => {
                        const next = [...form.specifications];
                        next[idx] = { ...spec, label: e.target.value };
                        setForm({ ...form, specifications: next });
                      }}
                      className="col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => {
                        const next = [...form.specifications];
                        next[idx] = { ...spec, value: e.target.value };
                        setForm({ ...form, specifications: next });
                      }}
                      className="col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...form.specifications];
                        next.splice(idx, 1);
                        setForm({ ...form, specifications: next });
                      }}
                      className="col-span-1 text-red-600 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: Colors, Variations, Badges, Visibility, SEO, Related */}
            <div className="lg:col-span-4 space-y-5">
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Homepage Placement &amp; Badges</h3>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Product Badges (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.badges.join(', ')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        badges: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Colors</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        colors: [...form.colors, { name: 'Graphite', hex: '#334155' }],
                      })
                    }
                    className="text-xs font-semibold underline"
                  >
                    + Add Color
                  </button>
                </div>
                {form.colors.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => {
                        const next = [...form.colors];
                        next[idx] = { ...c, hex: e.target.value };
                        setForm({ ...form, colors: next });
                      }}
                      className="w-8 h-8 p-0.5 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const next = [...form.colors];
                        next[idx] = { ...c, name: e.target.value };
                        setForm({ ...form, colors: next });
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...form.colors];
                        next.splice(idx, 1);
                        setForm({ ...form, colors: next });
                      }}
                      className="text-xs text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Variations */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Variations</h3>
                <input
                  type="text"
                  placeholder="Variation group name (e.g. Storage / Strap)"
                  value={form.variations[0]?.name || ''}
                  onChange={(e) => {
                    const cur = form.variations[0] || { name: '', options: [], priceDelta: 0 };
                    setForm({ ...form, variations: [{ ...cur, name: e.target.value }] });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Options (comma separated)"
                  value={(form.variations[0]?.options || []).join(', ')}
                  onChange={(e) => {
                    const cur = form.variations[0] || { name: 'Edition', options: [], priceDelta: 0 };
                    setForm({
                      ...form,
                      variations: [
                        {
                          ...cur,
                          options: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      ],
                    });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                />
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Upgrade Price Delta ({currency})
                  </label>
                  <input
                    type="number"
                    value={form.variations[0]?.priceDelta || 0}
                    onChange={(e) => {
                      const cur = form.variations[0] || { name: 'Edition', options: [], priceDelta: 0 };
                      setForm({
                        ...form,
                        variations: [{ ...cur, priceDelta: Number(e.target.value) || 0 }],
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Related Products */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Related Products</h3>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {products
                    .filter((p) => p.id !== editingId)
                    .map((other) => {
                      const checked = form.relatedProductIds.includes(other.id);
                      return (
                        <label key={other.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...form.relatedProductIds, other.id]
                                : form.relatedProductIds.filter((id) => id !== other.id);
                              setForm({ ...form, relatedProductIds: next });
                            }}
                          />
                          <span className="truncate">{other.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* SEO */}
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Product SEO</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <MediaPickerModal
          isOpen={mediaPickIdx !== null}
          onClose={() => setMediaPickIdx(null)}
          mediaLibrary={mediaLibrary}
          onMediaAdded={onMediaAdded}
          onSelect={(url) => {
            if (mediaPickIdx === null || !form) return;
            const next = [...form.images];
            next[mediaPickIdx] = { ...next[mediaPickIdx], url };
            setForm({ ...form, images: next });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Products &amp; Visual Description Builder
          </h2>
          <p className="text-xs text-slate-500">
            Manage every product field, cost margin, visual description layout, and reusable design templates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-md hover:bg-slate-50"
          >
            <Layers className="w-3.5 h-3.5" /> Apply Template to Products
          </button>
          <button
            type="button"
            onClick={startNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Visual Blocks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={p.images?.[0]?.url}
                      alt={p.name}
                      className="w-11 h-9 rounded object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">{p.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.modelNumber}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-xs">
                  {currency}
                  {(p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.regularPrice).toFixed(2)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-xs">{p.stock}</td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {p.descriptionBlocks?.length || 0} blocks
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="font-medium text-slate-700 capitalize">
                    {p.status}
                    {p.draftPayload ? ' · Unsaved Draft' : ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <Edit3 className="w-3 h-3" /> Edit &amp; Design
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Apply Template Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold">Apply Description Template to Multiple Products</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Select Template
              </label>
              <select
                value={bulkTplId}
                onChange={(e) => setBulkTplId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.blocks.length} blocks)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700">Select Target Products</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1.5">
                {products.map((p) => {
                  const checked = bulkProductIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setBulkProductIds(
                            e.target.checked
                              ? [...bulkProductIds, p.id]
                              : bulkProductIds.filter((id) => id !== p.id)
                          )
                        }
                      />
                      <span className="font-medium">{p.name}</span>
                      <span className="text-slate-400 font-mono">{p.modelNumber}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || bulkProductIds.length === 0}
                onClick={handleBulkApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md disabled:opacity-50"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Apply to {bulkProductIds.length} Product(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
