import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Copy,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { STUDIO_IMAGES } from '../../data/seedData';
import {
  DescriptionBlock,
  DescriptionBlockType,
  DescriptionTemplate,
  MediaAsset,
  ThemeSettings,
} from '../../types/cms';
import { VisualBlockRenderer } from '../shared/VisualBlockRenderer';
import { MediaPickerModal } from './MediaPickerModal';

interface VisualDescriptionBuilderProps {
  blocks: DescriptionBlock[];
  onChange: (nextBlocks: DescriptionBlock[]) => void;
  templates: DescriptionTemplate[];
  onSaveAsTemplate?: (name: string, category: string, description: string, blocks: DescriptionBlock[]) => Promise<void>;
  mediaLibrary: MediaAsset[];
  onMediaAdded: (asset: MediaAsset) => void;
  theme?: ThemeSettings;
  showTemplateTools?: boolean;
}

const BLOCK_CATALOG: { type: DescriptionBlockType; label: string; category: string }[] = [
  { type: 'full_width_image', label: 'Full-Width Image', category: 'Media' },
  { type: 'two_column_image_text', label: 'Two-Column Image & Text', category: 'Layout' },
  { type: 'three_column_cards', label: 'Three-Column Feature Cards', category: 'Layout' },
  { type: 'spec_table', label: 'Product Specification Table', category: 'Technical' },
  { type: 'feature_icon_grid', label: 'Feature Icon Grid', category: 'Highlights' },
  { type: 'promo_banner', label: 'Highlighted Promotional Banner', category: 'Conversion' },
  { type: 'video_section', label: 'Video Section', category: 'Media' },
  { type: 'image_gallery', label: 'Image Gallery', category: 'Media' },
  { type: 'comparison_table', label: 'Comparison Table', category: 'Technical' },
  { type: 'benefits_section', label: 'Benefits Section', category: 'Highlights' },
  { type: 'faq', label: 'Frequently Asked Questions', category: 'Trust' },
  { type: 'testimonials', label: 'Customer Testimonials', category: 'Trust' },
  { type: 'warranty_info', label: 'Warranty Information', category: 'Trust' },
  { type: 'delivery_info', label: 'Delivery Information', category: 'Trust' },
  { type: 'heading_paragraph', label: 'Custom Heading & Paragraph', category: 'Editorial' },
  { type: 'cta_buttons', label: 'Call to Action Buttons', category: 'Conversion' },
];

export function createDefaultBlock(type: DescriptionBlockType): DescriptionBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const meta = BLOCK_CATALOG.find((b) => b.type === type);
  const base: DescriptionBlock = {
    id,
    type,
    label: meta?.label || type,
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
    textAlign: 'left',
    imagePosition: 'left',
    fontSize: 'base',
    paddingY: 'normal',
    data: {},
  };

  switch (type) {
    case 'full_width_image':
      return {
        ...base,
        bgColor: '#0F172A',
        textColor: '#FFFFFF',
        data: {
          imageUrl: STUDIO_IMAGES.heroFlagship,
          caption: 'Precision Hardware Showcase',
          heading: 'Crafted Without Compromise',
          subheading: 'Engineered from solid aerospace materials for long-term endurance.',
        },
      };
    case 'two_column_image_text':
      return {
        ...base,
        data: {
          heading: 'Designed for Daily Precision',
          body: 'High-efficiency architecture pairs clean aesthetics with dependable everyday performance.',
          imageUrl: STUDIO_IMAGES.smartwatchPro,
          bulletPoints: ['Verified authentic components', 'Optimized thermal balance'],
        },
      };
    case 'three_column_cards':
      return {
        ...base,
        data: {
          heading: 'Three Core Pillars',
          cards: [
            { meta: '01', title: 'Material Quality', description: 'CNC machined surfaces built to resist daily wear.' },
            { meta: '02', title: 'Endurance', description: 'Tested across 10,000+ power and motion cycles.' },
            { meta: '03', title: 'Support', description: 'Protected by Taqwa Care warranty coverage.' },
          ],
        },
      };
    case 'spec_table':
      return {
        ...base,
        data: {
          heading: 'Technical Specifications',
          rows: [
            { label: 'Chassis', value: 'Anodized Alloy' },
            { label: 'Connectivity', value: 'Bluetooth 5.3 / USB-C' },
            { label: 'Warranty', value: '24 Months Official' },
          ],
        },
      };
    case 'feature_icon_grid':
      return {
        ...base,
        data: {
          heading: 'Standout Capabilities',
          subheading: 'Every module tuned for real-world reliability.',
          items: [
            { title: 'Fast Charging', description: 'High-wattage power delivery ready.', icon: 'Zap' },
            { title: 'All-Weather Seal', description: 'Protected against dust and splashes.', icon: 'ShieldCheck' },
            { title: 'Smart Telemetry', description: 'Accurate multi-sensor tracking.', icon: 'Activity' },
            { title: 'Global Ready', description: 'Universal compatibility out of the box.', icon: 'Globe' },
          ],
        },
      };
    case 'promo_banner':
      return {
        ...base,
        bgColor: '#0F172A',
        textColor: '#FFFFFF',
        textAlign: 'center',
        data: {
          kicker: 'Special Store Offer',
          heading: 'Limited Batch Savings + Free Express Delivery',
          description: 'Order today for same-day metro dispatch and open-box Cash on Delivery verification.',
          ctaLabel: 'Order Now',
          ctaAction: 'add_to_cart',
        },
      };
    case 'video_section':
      return {
        ...base,
        data: {
          heading: 'Hardware Walkthrough Video',
          videoUrl: '',
        },
      };
    case 'image_gallery':
      return {
        ...base,
        data: {
          heading: 'Studio Image Gallery',
          images: [
            { url: STUDIO_IMAGES.smartwatchPro, caption: 'Front Studio Angle' },
            { url: STUDIO_IMAGES.promoBanner, caption: 'Ecosystem View' },
          ],
        },
      };
    case 'comparison_table':
      return {
        ...base,
        bgColor: '#0F172A',
        textColor: '#F8FAFC',
        data: {
          heading: 'Model Comparison',
          columns: ['Specification', 'This Flagship', 'Standard Edition'],
          rows: [
            ['Build Material', 'Titanium / CNC Alloy', 'Polycarbonate'],
            ['Battery Autonomy', 'Up to 14 Days', '3–5 Days'],
            ['Warranty', '24 Months Replacement', '6 Months'],
          ],
        },
      };
    case 'benefits_section':
      return {
        ...base,
        data: {
          heading: 'Key Customer Benefits',
          items: [
            '100% genuine factory-sealed product',
            'Open-box inspection available before Cash on Delivery payment',
            'Direct replacement support from Taqwa Gadget Zone',
          ],
        },
      };
    case 'faq':
      return {
        ...base,
        data: {
          heading: 'Frequently Asked Questions',
          items: [
            { question: 'Does it include official warranty?', answer: 'Yes, covered by our full replacement and service warranty.' },
            { question: 'Can I inspect the sealed box on delivery?', answer: 'Yes, Cash on Delivery includes outer seal and model verification.' },
          ],
        },
      };
    case 'testimonials':
      return {
        ...base,
        data: {
          heading: 'Verified Customer Reviews',
          reviews: [
            { author: 'Arifuzzaman Khan', role: 'Verified Buyer', quote: 'Exceptional build quality and super fast delivery.', rating: 5 },
            { author: 'Maliha Tasnim', role: 'Verified Buyer', quote: 'Exactly as specified, sealed authentic packaging.', rating: 5 },
          ],
        },
      };
    case 'warranty_info':
      return {
        ...base,
        data: {
          heading: 'Official Hardware Warranty',
          duration: '24 Months Coverage',
          details: 'Full hardware defect replacement coverage through Taqwa Gadget Zone.',
        },
      };
    case 'delivery_info':
      return {
        ...base,
        data: {
          heading: 'Shipping & Delivery Timeline',
          standardWindow: '24 Hours (Metro)',
          nationwideWindow: '2–4 Days (Nationwide)',
          details: 'Shock-protected parcel dispatch with Cash on Delivery support.',
        },
      };
    case 'heading_paragraph':
      return {
        ...base,
        data: {
          heading: 'Crafted for Precision',
          paragraph: 'Add clear editorial copy explaining how this product solves daily workflow or lifestyle needs.',
        },
      };
    case 'cta_buttons':
      return {
        ...base,
        bgColor: '#0F172A',
        textColor: '#FFFFFF',
        textAlign: 'center',
        data: {
          heading: 'Ready to Order?',
          description: 'In stock and ready for immediate dispatch.',
          primaryLabel: 'Add to Cart & Checkout',
          primaryAction: 'add_to_cart',
          secondaryLabel: 'Ask Specialist',
          secondaryLink: 'page:contact',
        },
      };
  }
}

export function VisualDescriptionBuilder({
  blocks,
  onChange,
  templates,
  onSaveAsTemplate,
  mediaLibrary,
  onMediaAdded,
  theme,
  showTemplateTools = true,
}: VisualDescriptionBuilderProps) {
  const [selectedId, setSelectedId] = useState<string>(blocks[0]?.id || '');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'desktop' | 'mobile'>('edit');
  const [mediaTarget, setMediaTarget] = useState<{ blockId: string; field: string; index?: number } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTplModal, setShowTplModal] = useState(false);
  const [showSaveTplModal, setShowSaveTplModal] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState('Custom');
  const [tplDesc, setTplDesc] = useState('');
  const [savingTpl, setSavingTpl] = useState(false);

  const selectedBlock = blocks.find((b) => b.id === selectedId) || blocks[0] || null;

  const updateBlock = (id: string, patch: Partial<DescriptionBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const updateBlockData = (id: string, dataPatch: Record<string, any>) => {
    onChange(
      blocks.map((b) =>
        b.id === id ? { ...b, data: { ...(b.data || {}), ...dataPatch } } : b
      )
    );
  };

  const addBlock = (type: DescriptionBlockType) => {
    const newBlock = createDefaultBlock(type);
    const next = [...blocks, newBlock];
    onChange(next);
    setSelectedId(newBlock.id);
    setShowAddMenu(false);
  };

  const duplicateBlock = (index: number) => {
    const src = blocks[index];
    const clone: DescriptionBlock = {
      ...structuredClone(src),
      id: `${src.type}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label: `${src.label} (Copy)`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, clone);
    onChange(next);
    setSelectedId(clone.id);
  };

  const removeBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    onChange(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || '');
    }
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const applyTemplate = (tpl: DescriptionTemplate) => {
    const cloned = tpl.blocks.map((b, i) => ({
      ...structuredClone(b),
      id: `${b.type}-${Date.now()}-${i}`,
    }));
    onChange(cloned);
    setSelectedId(cloned[0]?.id || '');
    setShowTplModal(false);
  };

  const handleSaveTemplateSubmit = async () => {
    if (!onSaveAsTemplate || !tplName.trim()) return;
    setSavingTpl(true);
    try {
      await onSaveAsTemplate(tplName.trim(), tplCategory.trim() || 'Custom', tplDesc.trim(), blocks);
      setShowSaveTplModal(false);
      setTplName('');
      setTplDesc('');
    } finally {
      setSavingTpl(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Builder Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Content Block</span>
            </button>

            {showAddMenu && (
              <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-xl z-30 p-2 grid grid-cols-1 gap-1">
                {BLOCK_CATALOG.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addBlock(item.type)}
                    className="flex items-center justify-between px-3 py-2 text-left text-xs rounded hover:bg-slate-100"
                  >
                    <span className="font-medium text-slate-900">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {showTemplateTools && (
            <>
              <button
                type="button"
                onClick={() => setShowTplModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-md hover:bg-slate-100 whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Load Design Template ({templates.length})</span>
              </button>

              {onSaveAsTemplate && (
                <button
                  type="button"
                  onClick={() => setShowSaveTplModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-md hover:bg-slate-100 whitespace-nowrap"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save as Template</span>
                </button>
              )}
            </>
          )}
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-md">
          <button
            type="button"
            onClick={() => setPreviewMode('edit')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              previewMode === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Builder</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Preview</span>
          </button>
        </div>
      </div>

      {previewMode !== 'edit' ? (
        <div className="p-6 bg-slate-100 border border-slate-200 rounded-md flex justify-center">
          <div
            className={`bg-white border border-slate-300 rounded-lg p-4 overflow-y-auto shadow-sm transition-all ${
              previewMode === 'mobile' ? 'w-[390px]' : 'w-full max-w-5xl'
            }`}
          >
            <VisualBlockRenderer
              blocks={blocks}
              theme={theme}
              isMobilePreview={previewMode === 'mobile'}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Drag-and-Drop Block Stack */}
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Block Sequence ({blocks.length}) — Drag to Reorder
            </p>
            {blocks.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-md text-center space-y-2">
                <p className="text-sm font-medium text-slate-700">No blocks yet</p>
                <p className="text-xs text-slate-500">
                  Click "Add Content Block" or "Load Design Template" above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => {
                  const isActive = selectedBlock?.id === block.id;
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex !== null) {
                          moveBlock(dragIndex, index);
                          setDragIndex(null);
                        }
                      }}
                      onClick={() => setSelectedId(block.id)}
                      className={`p-3 rounded-md border cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                        isActive
                          ? 'border-slate-900 bg-slate-900/5'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {index + 1}. {block.label}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {block.type.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => moveBlock(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, index + 1)}
                          disabled={index === blocks.length - 1}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateBlock(index)}
                          className="p-1 rounded hover:bg-slate-200"
                          title="Duplicate Block"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Block Visual Inspector */}
          <div className="lg:col-span-7">
            {selectedBlock ? (
              <div className="p-5 bg-white border border-slate-200 rounded-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedBlock.label}</h4>
                    <p className="text-xs text-slate-500">
                      Edit typography, colors, layout, and content without code.
                    </p>
                  </div>
                </div>

                {/* Common Styling Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-md border border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Block Label
                    </label>
                    <input
                      type="text"
                      value={selectedBlock.label}
                      onChange={(e) => updateBlock(selectedBlock.id, { label: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Background
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedBlock.bgColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { bgColor: e.target.value })}
                        className="w-8 h-7 p-0.5 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={selectedBlock.bgColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { bgColor: e.target.value })}
                        className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedBlock.textColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                        className="w-8 h-7 p-0.5 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={selectedBlock.textColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                        className="flex-1 min-w-0 px-2 py-1 text-xs font-mono border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Text Alignment
                    </label>
                    <select
                      value={selectedBlock.textAlign}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          textAlign: e.target.value as DescriptionBlock['textAlign'],
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Font Scale
                    </label>
                    <select
                      value={selectedBlock.fontSize}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          fontSize: e.target.value as DescriptionBlock['fontSize'],
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="sm">Small</option>
                      <option value="base">Standard</option>
                      <option value="lg">Large</option>
                      <option value="xl">Display XL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Image Position
                    </label>
                    <select
                      value={selectedBlock.imagePosition}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          imagePosition: e.target.value as DescriptionBlock['imagePosition'],
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top">Top</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                </div>

                {/* Block-Specific Content Fields */}
                <BlockContentFields
                  block={selectedBlock}
                  onUpdateData={(patch) => updateBlockData(selectedBlock.id, patch)}
                  onOpenMediaPicker={(field, index) =>
                    setMediaTarget({ blockId: selectedBlock.id, field, index })
                  }
                />
              </div>
            ) : (
              <div className="p-8 border border-slate-200 rounded-md text-center text-sm text-slate-500">
                Select a block on the left to edit its properties.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        mediaLibrary={mediaLibrary}
        onMediaAdded={onMediaAdded}
        onSelect={(url) => {
          if (!mediaTarget) return;
          const targetBlock = blocks.find((b) => b.id === mediaTarget.blockId);
          if (!targetBlock) return;
          if (mediaTarget.field === 'gallery' && typeof mediaTarget.index === 'number') {
            const imgs = [...(targetBlock.data.images || [])];
            imgs[mediaTarget.index] = { ...imgs[mediaTarget.index], url };
            updateBlockData(targetBlock.id, { images: imgs });
          } else {
            updateBlockData(targetBlock.id, { [mediaTarget.field]: url });
          }
        }}
      />

      {/* Load Template Modal */}
      {showTplModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg border border-slate-200 shadow-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Choose a Product Description Design Template</h3>
              <button
                type="button"
                onClick={() => setShowTplModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="grid gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 border border-slate-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-400"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-900 text-sm">{tpl.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tpl.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tpl.blocks.length} blocks</span>
                    </div>
                    <p className="text-xs text-slate-600">{tpl.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md whitespace-nowrap shrink-0"
                  >
                    Apply Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save As Reusable Template Modal */}
      {showSaveTplModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold">Save Layout as Reusable Template</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="e.g. Flagship Earbuds Showcase"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveTplModal(false)}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingTpl || !tplName.trim()}
                onClick={handleSaveTemplateSubmit}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md disabled:opacity-50"
              >
                {savingTpl ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockContentFields({
  block,
  onUpdateData,
  onOpenMediaPicker,
}: {
  block: DescriptionBlock;
  onUpdateData: (patch: Record<string, any>) => void;
  onOpenMediaPicker: (field: string, index?: number) => void;
}) {
  const d = block.data || {};

  const inputCls = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white';
  const labelCls = 'block text-xs font-medium text-slate-700 mb-1';

  switch (block.type) {
    case 'full_width_image':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={d.imageUrl || ''}
                onChange={(e) => onUpdateData({ imageUrl: e.target.value })}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => onOpenMediaPicker('imageUrl')}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md whitespace-nowrap"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Pick
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Caption / Kicker</label>
            <input
              type="text"
              value={d.caption || ''}
              onChange={(e) => onUpdateData({ caption: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Subheading</label>
            <textarea
              rows={2}
              value={d.subheading || ''}
              onChange={(e) => onUpdateData({ subheading: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'two_column_image_text':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Paragraph</label>
            <textarea
              rows={3}
              value={d.body || ''}
              onChange={(e) => onUpdateData({ body: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={d.imageUrl || ''}
                onChange={(e) => onUpdateData({ imageUrl: e.target.value })}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => onOpenMediaPicker('imageUrl')}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md whitespace-nowrap"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Pick
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Bullet Points (One per line)</label>
            <textarea
              rows={3}
              value={(d.bulletPoints || []).join('\n')}
              onChange={(e) =>
                onUpdateData({
                  bulletPoints: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                })
              }
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'three_column_cards':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Section Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.cards || []).map((card: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">Card {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...(d.cards || [])];
                    next.splice(idx, 1);
                    onUpdateData({ cards: next });
                  }}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Meta label"
                value={card.meta || ''}
                onChange={(e) => {
                  const next = [...(d.cards || [])];
                  next[idx] = { ...card, meta: e.target.value };
                  onUpdateData({ cards: next });
                }}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Card title"
                value={card.title || ''}
                onChange={(e) => {
                  const next = [...(d.cards || [])];
                  next[idx] = { ...card, title: e.target.value };
                  onUpdateData({ cards: next });
                }}
                className={inputCls}
              />
              <textarea
                rows={2}
                placeholder="Card description"
                value={card.description || ''}
                onChange={(e) => {
                  const next = [...(d.cards || [])];
                  next[idx] = { ...card, description: e.target.value };
                  onUpdateData({ cards: next });
                }}
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdateData({
                cards: [...(d.cards || []), { meta: 'Feature', title: 'New Card', description: '' }],
              })
            }
            className="text-xs font-semibold text-slate-900 underline"
          >
            + Add Card
          </button>
        </div>
      );

    case 'spec_table':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.rows || []).map((row: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                placeholder="Spec Name"
                value={row.label || ''}
                onChange={(e) => {
                  const next = [...(d.rows || [])];
                  next[idx] = { ...row, label: e.target.value };
                  onUpdateData({ rows: next });
                }}
                className={`col-span-4 ${inputCls}`}
              />
              <input
                type="text"
                placeholder="Spec Value"
                value={row.value || ''}
                onChange={(e) => {
                  const next = [...(d.rows || [])];
                  next[idx] = { ...row, value: e.target.value };
                  onUpdateData({ rows: next });
                }}
                className={`col-span-7 ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => {
                  const next = [...(d.rows || [])];
                  next.splice(idx, 1);
                  onUpdateData({ rows: next });
                }}
                className="col-span-1 text-red-600 text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onUpdateData({ rows: [...(d.rows || []), { label: '', value: '' }] })}
            className="text-xs font-semibold underline"
          >
            + Add Spec Row
          </button>
        </div>
      );

    case 'feature_icon_grid':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Subheading</label>
            <input
              type="text"
              value={d.subheading || ''}
              onChange={(e) => onUpdateData({ subheading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.items || []).map((item: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={item.title || ''}
                  onChange={(e) => {
                    const next = [...(d.items || [])];
                    next[idx] = { ...item, title: e.target.value };
                    onUpdateData({ items: next });
                  }}
                  className={inputCls}
                />
                <select
                  value={item.icon || 'ShieldCheck'}
                  onChange={(e) => {
                    const next = [...(d.items || [])];
                    next[idx] = { ...item, icon: e.target.value };
                    onUpdateData({ items: next });
                  }}
                  className={inputCls}
                >
                  <option value="ShieldCheck">Shield</option>
                  <option value="Zap">Power / Fast</option>
                  <option value="BatteryCharging">Battery</option>
                  <option value="Compass">GPS / Compass</option>
                  <option value="Droplets">Waterproof</option>
                  <option value="Activity">Biometrics</option>
                  <option value="Cpu">Chipset</option>
                  <option value="Globe">Universal</option>
                  <option value="Award">Award / Warranty</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Description"
                value={item.description || ''}
                onChange={(e) => {
                  const next = [...(d.items || [])];
                  next[idx] = { ...item, description: e.target.value };
                  onUpdateData({ items: next });
                }}
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdateData({
                items: [...(d.items || []), { title: 'New Feature', description: '', icon: 'Zap' }],
              })
            }
            className="text-xs font-semibold underline"
          >
            + Add Feature Icon
          </button>
        </div>
      );

    case 'promo_banner':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Kicker</label>
            <input
              type="text"
              value={d.kicker || ''}
              onChange={(e) => onUpdateData({ kicker: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Headline</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={2}
              value={d.description || ''}
              onChange={(e) => onUpdateData({ description: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Button Label</label>
            <input
              type="text"
              value={d.ctaLabel || ''}
              onChange={(e) => onUpdateData({ ctaLabel: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'video_section':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Safe Video URL (YouTube, Vimeo, or MP4 HTTPS)</label>
            <input
              type="url"
              value={d.videoUrl || ''}
              onChange={(e) => onUpdateData({ videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'image_gallery':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Gallery Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.images || []).map((img: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={img.url || ''}
                  onChange={(e) => {
                    const next = [...(d.images || [])];
                    next[idx] = { ...img, url: e.target.value };
                    onUpdateData({ images: next });
                  }}
                  placeholder="Image URL"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker('gallery', idx)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md whitespace-nowrap"
                >
                  Pick
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...(d.images || [])];
                    next.splice(idx, 1);
                    onUpdateData({ images: next });
                  }}
                  className="text-xs text-red-600 px-2"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => {
                  const next = [...(d.images || [])];
                  next[idx] = { ...img, caption: e.target.value };
                  onUpdateData({ images: next });
                }}
                placeholder="Image caption"
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdateData({
                images: [...(d.images || []), { url: STUDIO_IMAGES.smartwatchPro, caption: '' }],
              })
            }
            className="text-xs font-semibold underline"
          >
            + Add Gallery Image
          </button>
        </div>
      );

    case 'comparison_table':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Column Headers (comma separated)</label>
            <input
              type="text"
              value={(d.columns || []).join(', ')}
              onChange={(e) =>
                onUpdateData({ columns: e.target.value.split(',').map((s) => s.trim()) })
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Rows (one row per line, columns separated by | )</label>
            <textarea
              rows={4}
              value={(d.rows || []).map((r: string[]) => r.join(' | ')).join('\n')}
              onChange={(e) =>
                onUpdateData({
                  rows: e.target.value
                    .split('\n')
                    .filter((l) => l.trim())
                    .map((l) => l.split('|').map((c) => c.trim())),
                })
              }
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'benefits_section':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Benefits List (One per line)</label>
            <textarea
              rows={4}
              value={(d.items || []).join('\n')}
              onChange={(e) =>
                onUpdateData({
                  items: e.target.value.split('\n').filter((l) => l.trim() !== ''),
                })
              }
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.items || []).map((item: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-md space-y-2">
              <input
                type="text"
                placeholder="Question"
                value={item.question || ''}
                onChange={(e) => {
                  const next = [...(d.items || [])];
                  next[idx] = { ...item, question: e.target.value };
                  onUpdateData({ items: next });
                }}
                className={inputCls}
              />
              <textarea
                rows={2}
                placeholder="Answer"
                value={item.answer || ''}
                onChange={(e) => {
                  const next = [...(d.items || [])];
                  next[idx] = { ...item, answer: e.target.value };
                  onUpdateData({ items: next });
                }}
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdateData({ items: [...(d.items || []), { question: '', answer: '' }] })
            }
            className="text-xs font-semibold underline"
          >
            + Add FAQ Item
          </button>
        </div>
      );

    case 'testimonials':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          {(d.reviews || []).map((rev: any, idx: number) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={rev.author || ''}
                  onChange={(e) => {
                    const next = [...(d.reviews || [])];
                    next[idx] = { ...rev, author: e.target.value };
                    onUpdateData({ reviews: next });
                  }}
                  className={inputCls}
                />
                <input
                  type="text"
                  placeholder="Role / City"
                  value={rev.role || ''}
                  onChange={(e) => {
                    const next = [...(d.reviews || [])];
                    next[idx] = { ...rev, role: e.target.value };
                    onUpdateData({ reviews: next });
                  }}
                  className={inputCls}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Review quote"
                value={rev.quote || ''}
                onChange={(e) => {
                  const next = [...(d.reviews || [])];
                  next[idx] = { ...rev, quote: e.target.value };
                  onUpdateData({ reviews: next });
                }}
                className={inputCls}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onUpdateData({
                reviews: [...(d.reviews || []), { author: '', role: 'Verified Buyer', quote: '', rating: 5 }],
              })
            }
            className="text-xs font-semibold underline"
          >
            + Add Review
          </button>
        </div>
      );

    case 'warranty_info':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Duration / Badge</label>
            <input
              type="text"
              value={d.duration || ''}
              onChange={(e) => onUpdateData({ duration: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Warranty Details</label>
            <textarea
              rows={3}
              value={d.details || ''}
              onChange={(e) => onUpdateData({ details: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'delivery_info':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Metro Window</label>
              <input
                type="text"
                value={d.standardWindow || ''}
                onChange={(e) => onUpdateData({ standardWindow: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nationwide Window</label>
              <input
                type="text"
                value={d.nationwideWindow || ''}
                onChange={(e) => onUpdateData({ nationwideWindow: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Details</label>
            <textarea
              rows={2}
              value={d.details || ''}
              onChange={(e) => onUpdateData({ details: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'heading_paragraph':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Paragraph Text</label>
            <textarea
              rows={5}
              value={d.paragraph || ''}
              onChange={(e) => onUpdateData({ paragraph: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );

    case 'cta_buttons':
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Heading</label>
            <input
              type="text"
              value={d.heading || ''}
              onChange={(e) => onUpdateData({ heading: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input
              type="text"
              value={d.description || ''}
              onChange={(e) => onUpdateData({ description: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Primary Button Text</label>
              <input
                type="text"
                value={d.primaryLabel || ''}
                onChange={(e) => onUpdateData({ primaryLabel: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Primary Action</label>
              <select
                value={d.primaryAction || 'add_to_cart'}
                onChange={(e) => onUpdateData({ primaryAction: e.target.value })}
                className={inputCls}
              >
                <option value="add_to_cart">Add to Cart &amp; Checkout</option>
                <option value="catalog">Go to Catalog</option>
                <option value="page:contact">Go to Contact Page</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Secondary Button Text</label>
              <input
                type="text"
                value={d.secondaryLabel || ''}
                onChange={(e) => onUpdateData({ secondaryLabel: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Secondary Link</label>
              <input
                type="text"
                value={d.secondaryLink || ''}
                onChange={(e) => onUpdateData({ secondaryLink: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      );
  }
}
