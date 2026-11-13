import { Eye, Save, Send, Sparkles } from 'lucide-react';
import { THEME_PRESETS } from '../../data/seedData';
import { FontChoice, Product, SiteConfig, ThemeSettings } from '../../types/cms';
import { ProductCard } from '../storefront/ProductCard';

interface ThemeCustomizerProps {
  draftConfig: SiteConfig;
  products: Product[];
  onChangeDraft: (next: SiteConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onOpenPreview: () => void;
  saving: boolean;
}

const FONT_OPTIONS: FontChoice[] = [
  'Hind Siliguri',
  'Plus Jakarta Sans',
  'DM Sans',
  'Outfit',
  'Manrope',
  'Bricolage Grotesque',
  'Playfair Display',
  'Public Sans',
  'Lora',
];

export function ThemeCustomizer({
  draftConfig,
  products,
  onChangeDraft,
  onSaveDraft,
  onPublish,
  onOpenPreview,
  saving,
}: ThemeCustomizerProps) {
  const t = draftConfig.theme;

  const updateTheme = (patch: Partial<ThemeSettings>) => {
    onChangeDraft({
      ...draftConfig,
      theme: { ...t, ...patch },
    });
  };

  const applyPreset = (presetTheme: ThemeSettings) => {
    onChangeDraft({
      ...draftConfig,
      theme: { ...presetTheme },
    });
  };

  const sampleProduct = products[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Website Theme Customizer</h2>
          <p className="text-xs text-slate-500">
            Switch between GhorerBazar Clean Light, Taqwa Dark Emerald, or customize every color, font, radius, and layout live.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-md hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" /> Full Site Preview
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-500 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Publish Theme
          </button>
        </div>
      </div>

      {/* 1-Click Theme Presets */}
      <div className="p-4 bg-white border border-slate-200 rounded-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>1-Click Storefront Theme Presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.theme)}
              className="p-3 rounded-md border border-slate-200 hover:border-emerald-600 text-left space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: preset.theme.backgroundColor }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: preset.theme.secondaryColor }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Font: {preset.theme.headingFont} · Button: {preset.theme.buttonBgColor}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Brand &amp; Surface Colors</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'secondaryColor', label: 'Secondary / Accent' },
                { key: 'buttonBgColor', label: 'Button Background' },
                { key: 'buttonTextColor', label: 'Button Text' },
                { key: 'backgroundColor', label: 'Page Background' },
                { key: 'surfaceColor', label: 'Card Surface' },
                { key: 'textColor', label: 'Primary Text' },
                { key: 'mutedTextColor', label: 'Muted Text' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {item.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(t as any)[item.key]}
                      onChange={(e) => updateTheme({ [item.key]: e.target.value })}
                      className="w-9 h-8 p-0.5 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      value={(t as any)[item.key]}
                      onChange={(e) => updateTheme({ [item.key]: e.target.value })}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Typography &amp; Geometry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Heading Font
                </label>
                <select
                  value={t.headingFont}
                  onChange={(e) => updateTheme({ headingFont: e.target.value as FontChoice })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Body Font
                </label>
                <select
                  value={t.bodyFont}
                  onChange={(e) => updateTheme({ bodyFont: e.target.value as FontChoice })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Border Radius
                </label>
                <select
                  value={t.borderRadius}
                  onChange={(e) =>
                    updateTheme({ borderRadius: e.target.value as ThemeSettings['borderRadius'] })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="none">Sharp (0px)</option>
                  <option value="sm">Subtle (2px)</option>
                  <option value="md">Standard (6px)</option>
                  <option value="lg">Rounded (8px)</option>
                  <option value="xl">Soft (12px)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Button Style
                </label>
                <select
                  value={t.buttonStyle}
                  onChange={(e) =>
                    updateTheme({ buttonStyle: e.target.value as ThemeSettings['buttonStyle'] })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="solid">Solid Fill</option>
                  <option value="outline">Outline</option>
                  <option value="soft">Soft Tint</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Card Style
                </label>
                <select
                  value={t.cardStyle}
                  onChange={(e) =>
                    updateTheme({ cardStyle: e.target.value as ThemeSettings['cardStyle'] })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="bordered">Hairline Bordered</option>
                  <option value="elevated">Soft Shadow Elevated</option>
                  <option value="flat">Flat Surface</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Header Layout
                </label>
                <select
                  value={t.headerLayout}
                  onChange={(e) =>
                    updateTheme({ headerLayout: e.target.value as ThemeSettings['headerLayout'] })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="classic">Classic Left Brand</option>
                  <option value="centered">Centered Brand</option>
                  <option value="minimal">Minimal Compact</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Footer Layout
                </label>
                <select
                  value={t.footerLayout}
                  onChange={(e) =>
                    updateTheme({ footerLayout: e.target.value as ThemeSettings['footerLayout'] })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="columns">Multi-Column Structured</option>
                  <option value="editorial">Dark Contrast Editorial</option>
                  <option value="minimal">Minimal Single Row</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Theme Preview Panel */}
        <div className="lg:col-span-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Live Theme Specimen Preview
          </p>
          <div
            style={{
              backgroundColor: t.backgroundColor,
              color: t.textColor,
              fontFamily: `"${t.bodyFont}", sans-serif`,
            }}
            className="p-6 rounded-lg border border-slate-300 space-y-6"
          >
            <div
              style={{ backgroundColor: t.surfaceColor }}
              className="px-4 py-3 rounded border border-current/10 flex items-center justify-between"
            >
              <span
                className="font-bold text-sm"
                style={{ fontFamily: `"${t.headingFont}", sans-serif` }}
              >
                {draftConfig.siteName}
              </span>
              <span className="text-xs opacity-65">
                Header: {t.headerLayout} · Footer: {t.footerLayout}
              </span>
            </div>

            <div className="space-y-3">
              <p
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: t.secondaryColor }}
              >
                Accent &amp; Typography Preview
              </p>
              <h3
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: `"${t.headingFont}", sans-serif` }}
              >
                অরিজিনাল স্মার্টওয়াচ ও প্রিমিয়াম গ্যাজেট শপ
              </h3>
              <p className="text-sm opacity-80 leading-relaxed">
                This live specimen updates immediately as you switch theme presets or adjust palette and fonts.
              </p>
            </div>

            {sampleProduct && (
              <div className="max-w-sm">
                <ProductCard
                  product={sampleProduct}
                  currency={draftConfig.currencySymbol}
                  theme={t}
                  lang={draftConfig.defaultLanguage || 'bn'}
                  onSelectProduct={() => {}}
                  onQuickAdd={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
