import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { STUDIO_IMAGES } from '../../data/seedData';
import {
  HomepageSection,
  HomepageSectionType,
  MediaAsset,
  Product,
  SiteConfig,
} from '../../types/cms';
import { HomepageSectionsRenderer } from '../storefront/HomepageSectionsRenderer';
import { MediaPickerModal } from './MediaPickerModal';

interface HomepageBuilderProps {
  draftConfig: SiteConfig;
  products: Product[];
  mediaLibrary: MediaAsset[];
  onMediaAdded: (asset: MediaAsset) => void;
  onChangeDraft: (next: SiteConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onOpenPreview: () => void;
  saving: boolean;
}

const SECTION_TYPES: { type: HomepageSectionType; label: string }[] = [
  { type: 'hero_banner', label: '1. Hero Banner / Slider' },
  { type: 'featured_categories', label: '2. Featured Categories' },
  { type: 'best_selling', label: '3. Best Selling Products' },
  { type: 'new_arrivals', label: '4. New Arrivals' },
  { type: 'promotional_offers', label: '5. Promotional Offers' },
  { type: 'featured_products', label: '6. Featured Products' },
  { type: 'why_choose_us', label: '7. Why Choose Us' },
  { type: 'customer_reviews', label: '8. Customer Reviews' },
  { type: 'delivery_info', label: '9. Delivery Information' },
  { type: 'contact_section', label: '10. Contact Section' },
  { type: 'newsletter', label: '11. Newsletter' },
  { type: 'custom_content', label: '12. Custom HTML-Free Content Block' },
];

export function HomepageBuilder({
  draftConfig,
  products,
  mediaLibrary,
  onMediaAdded,
  onChangeDraft,
  onSaveDraft,
  onPublish,
  onOpenPreview,
  saving,
}: HomepageBuilderProps) {
  const sections = draftConfig.homepageSections || [];
  const [selectedId, setSelectedId] = useState<string>(sections[0]?.id || '');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'desktop' | 'mobile'>('edit');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{
    sectionId: string;
    field: 'desktopBanner' | 'mobileBanner' | 'slideDesktop' | 'slideMobile' | 'itemImage';
    idx?: number;
  } | null>(null);

  const selected = sections.find((s) => s.id === selectedId) || sections[0] || null;

  const setSections = (next: HomepageSection[]) => {
    onChangeDraft({ ...draftConfig, homepageSections: next });
  };

  const updateSection = (id: string, patch: Partial<HomepageSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSections(next);
  };

  const addSection = (type: HomepageSectionType) => {
    const label = SECTION_TYPES.find((t) => t.type === type)?.label || type;
    const created: HomepageSection = {
      id: `sec-${Date.now()}`,
      type,
      title: label.replace(/^\d+\.\s*/, ''),
      subtitle: 'Storefront Section',
      description: 'Edit this heading, description, banners, and colors in the inspector.',
      visible: true,
      bgColor: type === 'promotional_offers' || type === 'hero_banner' || type === 'newsletter' ? '#0F172A' : '#FFFFFF',
      textColor: type === 'promotional_offers' || type === 'hero_banner' || type === 'newsletter' ? '#FFFFFF' : '#0F172A',
      desktopBanner: type === 'hero_banner' || type === 'promotional_offers' ? STUDIO_IMAGES.promoBanner : '',
      mobileBanner: type === 'hero_banner' || type === 'promotional_offers' ? STUDIO_IMAGES.smartwatchPro : '',
      overlayOpacity: 50,
      ctaLabel: 'Explore Catalog',
      ctaLink: 'catalog',
      maxProducts: 4,
      items: [],
      slides:
        type === 'hero_banner'
          ? [
              {
                id: `slide-${Date.now()}`,
                kicker: 'New Release',
                heading: 'Precision Hardware Collection',
                description: 'Curated devices with verified authenticity and Cash on Delivery.',
                desktopImage: STUDIO_IMAGES.heroFlagship,
                mobileImage: STUDIO_IMAGES.smartwatchPro,
                ctaLabel: 'Shop Now',
                ctaLink: 'catalog',
              },
            ]
          : undefined,
    };
    setSections([...sections, created]);
    setSelectedId(created.id);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Homepage Visual Customizer</h2>
          <p className="text-xs text-slate-500">
            Drag to reorder sections, toggle visibility, set desktop &amp; mobile banners separately, and preview before publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'edit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-md hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Live
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-900 text-slate-900 bg-white rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Publish Homepage
          </button>
        </div>
      </div>

      {viewMode !== 'edit' ? (
        <div className="p-6 bg-slate-100 border border-slate-200 rounded-md flex justify-center">
          <div
            className={`bg-white border border-slate-300 rounded-lg overflow-hidden shadow-md ${
              viewMode === 'mobile' ? 'w-[390px]' : 'w-full'
            }`}
          >
            <HomepageSectionsRenderer
              config={draftConfig}
              products={products}
              onSelectProduct={() => {}}
              onQuickAdd={() => {}}
              onNavigate={() => {}}
              forceMobileView={viewMode === 'mobile'}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Ordered Homepage Sections */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sections ({sections.length})
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-1 w-64 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-xl z-30 p-1.5 space-y-0.5">
                    {SECTION_TYPES.map((st) => (
                      <button
                        key={st.type}
                        type="button"
                        onClick={() => addSection(st.type)}
                        className="w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-slate-100"
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const active = selected?.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx !== null) {
                        moveSection(dragIdx, idx);
                        setDragIdx(null);
                      }
                    }}
                    onClick={() => setSelectedId(sec.id)}
                    className={`p-3 rounded-md border cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                      active
                        ? 'border-slate-900 bg-slate-900/5'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${!sec.visible ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {sec.title || sec.type}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {sec.type.replace(/_/g, ' ')} · {sec.visible ? 'Visible' : 'Hidden'}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => updateSection(sec.id, { visible: !sec.visible })}
                        className="p-1 rounded hover:bg-slate-200"
                        title={sec.visible ? 'Hide Section' : 'Show Section'}
                      >
                        {sec.visible ? (
                          <Eye className="w-3.5 h-3.5 text-slate-700" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, idx + 1)}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = sections.filter((s) => s.id !== sec.id);
                          setSections(next);
                          if (selectedId === sec.id) setSelectedId(next[0]?.id || '');
                        }}
                        className="p-1 rounded hover:bg-red-100 text-red-600"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Section Inspector */}
          <div className="lg:col-span-7">
            {selected ? (
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Editing: {selected.type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customize headings, buttons, colors, and desktop/mobile banners.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={selected.visible}
                      onChange={(e) => updateSection(selected.id, { visible: e.target.checked })}
                    />
                    <span>Visible on Storefront</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={selected.title}
                      onChange={(e) => updateSection(selected.id, { title: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subtitle / Kicker
                    </label>
                    <input
                      type="text"
                      value={selected.subtitle}
                      onChange={(e) => updateSection(selected.id, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Description / Copy
                  </label>
                  <textarea
                    rows={3}
                    value={selected.description}
                    onChange={(e) => updateSection(selected.id, { description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selected.bgColor}
                      onChange={(e) => updateSection(selected.id, { bgColor: e.target.value })}
                      className="w-full h-9 p-1 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selected.textColor}
                      onChange={(e) => updateSection(selected.id, { textColor: e.target.value })}
                      className="w-full h-9 p-1 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={selected.ctaLabel}
                      onChange={(e) => updateSection(selected.id, { ctaLabel: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Button Target
                    </label>
                    <input
                      type="text"
                      value={selected.ctaLink}
                      onChange={(e) => updateSection(selected.id, { ctaLink: e.target.value })}
                      placeholder="catalog or page:about-us"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Desktop & Mobile Banner Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Desktop Banner Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selected.desktopBanner}
                        onChange={(e) =>
                          updateSection(selected.id, { desktopBanner: e.target.value })
                        }
                        placeholder="Desktop image URL"
                        className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMediaTarget({ sectionId: selected.id, field: 'desktopBanner' })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-md"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Pick
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Banner Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selected.mobileBanner}
                        onChange={(e) =>
                          updateSection(selected.id, { mobileBanner: e.target.value })
                        }
                        placeholder="Mobile image URL"
                        className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMediaTarget({ sectionId: selected.id, field: 'mobileBanner' })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-md"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Pick
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Slides Editor */}
                {selected.type === 'hero_banner' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Hero Banner Slides ({selected.slides?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSlides = [
                            ...(selected.slides || []),
                            {
                              id: `slide-${Date.now()}`,
                              kicker: 'Featured Drop',
                              heading: 'New Hardware Release',
                              description: 'Explore precision accessories and wearables.',
                              desktopImage: STUDIO_IMAGES.heroFlagship,
                              mobileImage: STUDIO_IMAGES.smartwatchPro,
                              ctaLabel: 'Shop Now',
                              ctaLink: 'catalog',
                            },
                          ];
                          updateSection(selected.id, { slides: nextSlides });
                        }}
                        className="text-xs font-semibold underline"
                      >
                        + Add Slide
                      </button>
                    </div>

                    {(selected.slides || []).map((slide, sIdx) => (
                      <div key={slide.id} className="p-3 border border-slate-200 rounded-md space-y-2 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold">Slide {sIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(selected.slides || [])];
                              next.splice(sIdx, 1);
                              updateSection(selected.id, { slides: next });
                            }}
                            className="text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Kicker"
                            value={slide.kicker}
                            onChange={(e) => {
                              const next = [...(selected.slides || [])];
                              next[sIdx] = { ...slide, kicker: e.target.value };
                              updateSection(selected.id, { slides: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Heading"
                            value={slide.heading}
                            onChange={(e) => {
                              const next = [...(selected.slides || [])];
                              next[sIdx] = { ...slide, heading: e.target.value };
                              updateSection(selected.id, { slides: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Slide description"
                          value={slide.description}
                          onChange={(e) => {
                            const next = [...(selected.slides || [])];
                            next[sIdx] = { ...slide, description: e.target.value };
                            updateSection(selected.id, { slides: next });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Desktop banner URL"
                              value={slide.desktopImage}
                              onChange={(e) => {
                                const next = [...(selected.slides || [])];
                                next[sIdx] = { ...slide, desktopImage: e.target.value };
                                updateSection(selected.id, { slides: next });
                              }}
                              className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setMediaTarget({
                                  sectionId: selected.id,
                                  field: 'slideDesktop',
                                  idx: sIdx,
                                })
                              }
                              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                            >
                              Pick
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Mobile banner URL"
                              value={slide.mobileImage}
                              onChange={(e) => {
                                const next = [...(selected.slides || [])];
                                next[sIdx] = { ...slide, mobileImage: e.target.value };
                                updateSection(selected.id, { slides: next });
                              }}
                              className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setMediaTarget({
                                  sectionId: selected.id,
                                  field: 'slideMobile',
                                  idx: sIdx,
                                })
                              }
                              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                            >
                              Pick
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="CTA Button Label"
                            value={slide.ctaLabel}
                            onChange={(e) => {
                              const next = [...(selected.slides || [])];
                              next[sIdx] = { ...slide, ctaLabel: e.target.value };
                              updateSection(selected.id, { slides: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            placeholder="CTA Link"
                            value={slide.ctaLink}
                            onChange={(e) => {
                              const next = [...(selected.slides || [])];
                              next[sIdx] = { ...slide, ctaLink: e.target.value };
                              updateSection(selected.id, { slides: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Items Editor for Categories / Why Choose Us / Reviews / Delivery */}
                {(selected.type === 'featured_categories' ||
                  selected.type === 'why_choose_us' ||
                  selected.type === 'customer_reviews' ||
                  selected.type === 'delivery_info') && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Section Cards ({selected.items?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [
                            ...(selected.items || []),
                            {
                              id: `item-${Date.now()}`,
                              title: 'New Item',
                              subtitle: '',
                              description: 'Describe this item.',
                              image: '',
                            },
                          ];
                          updateSection(selected.id, { items: next });
                        }}
                        className="text-xs font-semibold underline"
                      >
                        + Add Card
                      </button>
                    </div>

                    {(selected.items || []).map((item, iIdx) => (
                      <div key={item.id} className="p-3 border border-slate-200 rounded-md space-y-2 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold">Card {iIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(selected.items || [])];
                              next.splice(iIdx, 1);
                              updateSection(selected.id, { items: next });
                            }}
                            className="text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...(selected.items || [])];
                              next[iIdx] = { ...item, title: e.target.value };
                              updateSection(selected.id, { items: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle / Role"
                            value={item.subtitle || ''}
                            onChange={(e) => {
                              const next = [...(selected.items || [])];
                              next[iIdx] = { ...item, subtitle: e.target.value };
                              updateSection(selected.id, { items: next });
                            }}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Description / Review Quote"
                          value={item.description}
                          onChange={(e) => {
                            const next = [...(selected.items || [])];
                            next[iIdx] = { ...item, description: e.target.value };
                            updateSection(selected.id, { items: next });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                        {selected.type === 'featured_categories' && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Category image URL"
                              value={item.image || ''}
                              onChange={(e) => {
                                const next = [...(selected.items || [])];
                                next[iIdx] = { ...item, image: e.target.value };
                                updateSection(selected.id, { items: next });
                              }}
                              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setMediaTarget({
                                  sectionId: selected.id,
                                  field: 'itemImage',
                                  idx: iIdx,
                                })
                              }
                              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            >
                              Pick
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        mediaLibrary={mediaLibrary}
        onMediaAdded={onMediaAdded}
        onSelect={(url) => {
          if (!mediaTarget) return;
          const target = sections.find((s) => s.id === mediaTarget.sectionId);
          if (!target) return;
          if (mediaTarget.field === 'desktopBanner' || mediaTarget.field === 'mobileBanner') {
            updateSection(target.id, { [mediaTarget.field]: url });
          } else if (
            (mediaTarget.field === 'slideDesktop' || mediaTarget.field === 'slideMobile') &&
            typeof mediaTarget.idx === 'number'
          ) {
            const nextSlides = [...(target.slides || [])];
            const slide = nextSlides[mediaTarget.idx];
            if (slide) {
              nextSlides[mediaTarget.idx] = {
                ...slide,
                [mediaTarget.field === 'slideDesktop' ? 'desktopImage' : 'mobileImage']: url,
              };
              updateSection(target.id, { slides: nextSlides });
            }
          } else if (mediaTarget.field === 'itemImage' && typeof mediaTarget.idx === 'number') {
            const nextItems = [...(target.items || [])];
            const item = nextItems[mediaTarget.idx];
            if (item) {
              nextItems[mediaTarget.idx] = { ...item, image: url };
              updateSection(target.id, { items: nextItems });
            }
          }
        }}
      />
    </div>
  );
}
