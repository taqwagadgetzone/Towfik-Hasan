import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CmsPage, Product, SiteConfig, StoreLanguage } from '../../types/cms';
import { VisualBlockRenderer } from '../shared/VisualBlockRenderer';
import { ContactButtonsStrip } from './ContactButtonsStrip';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  config: SiteConfig;
  lang?: StoreLanguage;
  initialCategory?: string;
  initialSearchQuery?: string;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onBack: () => void;
}

export function CatalogView({
  products,
  config,
  lang = 'bn',
  initialCategory = 'All',
  initialSearchQuery = '',
  onSelectProduct,
  onQuickAdd,
  onBack,
}: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = categoryFilter === 'All' || p.category === categoryFilter;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.modelNumber.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8"
      style={{ fontFamily: `"${config.theme.bodyFont}", sans-serif`, color: config.theme.textColor }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-current/10 pb-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
          </button>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: `"${config.theme.headingFont}", sans-serif` }}
          >
            {lang === 'bn' ? 'সব পণ্য (Catalog)' : 'Hardware Catalog'}
          </h1>
          <p className="text-sm opacity-75">
            {lang === 'bn'
              ? `মোট ${filtered.length}টি অরিজিনাল পণ্য পাওয়া গেছে`
              : `Showing ${filtered.length} verified product${filtered.length === 1 ? '' : 's'}.`}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পণ্য বা মডেল খুঁজুন...' : 'Search model, name, specs...'}
            className="w-full pl-9 pr-3 py-2 text-sm border border-black/15 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            style={
              categoryFilter === cat
                ? { backgroundColor: config.theme.secondaryColor, color: '#FFFFFF' }
                : undefined
            }
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              categoryFilter === cat ? '' : 'bg-current/[0.07] hover:bg-current/[0.12]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-current/20 rounded-lg space-y-2">
          <p className="font-semibold">
            {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No matching hardware found'}
          </p>
          <p className="text-sm opacity-70">
            {lang === 'bn'
              ? 'অন্য ক্যাটাগরি বা সার্চ শব্দ ব্যবহার করে দেখুন।'
              : 'Try clearing your search query or switching categories.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={config.currencySymbol}
              theme={config.theme}
              lang={lang}
              onSelectProduct={onSelectProduct}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CmsPageViewProps {
  page: CmsPage;
  config: SiteConfig;
  onBack: () => void;
  onNavigate: (target: string) => void;
}

export function CmsPageView({ page, config, onBack, onNavigate }: CmsPageViewProps) {
  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8"
      style={{ fontFamily: `"${config.theme.bodyFont}", sans-serif`, color: config.theme.textColor }}
    >
      <div className="space-y-3 border-b border-current/10 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium opacity-70 hover:opacity-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: `"${config.theme.headingFont}", sans-serif` }}
        >
          {page.title}
        </h1>
      </div>

      <VisualBlockRenderer
        blocks={page.blocks || []}
        theme={config.theme}
        onNavigate={onNavigate}
      />

      {page.slug === 'contact' && (
        <div className="p-6 sm:p-8 rounded-lg border border-black/10 bg-white text-slate-900 space-y-4">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: `"${config.theme.headingFont}", sans-serif` }}
          >
            Active Support &amp; Social Channels
          </h2>
          <ContactButtonsStrip contact={config.contact} />
        </div>
      )}
    </div>
  );
}
