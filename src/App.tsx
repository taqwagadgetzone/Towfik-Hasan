import { Eye, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminShell } from './components/admin/AdminShell';
import { CartCheckoutDrawer } from './components/storefront/CartCheckoutDrawer';
import { CatalogView, CmsPageView } from './components/storefront/CatalogAndPageViews';
import { HomepageSectionsRenderer } from './components/storefront/HomepageSectionsRenderer';
import { ProductDetailView } from './components/storefront/ProductDetailView';
import { StorefrontFooter } from './components/storefront/StorefrontFooter';
import { StorefrontHeader } from './components/storefront/StorefrontHeader';
import {
  DEFAULT_DELIVERY_ZONES,
  INITIAL_CMS_PAGES,
  INITIAL_PRODUCTS,
  INITIAL_SITE_CONFIG,
} from './data/seedData';
import { testConnection } from './lib/firebase';
import {
  fetchPages,
  fetchProducts,
  fetchPublishedSiteConfig,
} from './services/cmsService';
import { CartItem, CmsPage, Product, SiteConfig, StoreLanguage } from './types/cms';

type StorefrontRoute =
  | { view: 'home' }
  | { view: 'catalog'; category?: string; search?: string }
  | { view: 'product'; product: Product }
  | { view: 'page'; slug: string; previewPage?: CmsPage };

export default function App() {
  const [mode, setMode] = useState<'storefront' | 'admin'>('storefront');
  const [route, setRoute] = useState<StorefrontRoute>({ view: 'home' });

  const [publishedConfig, setPublishedConfig] = useState<SiteConfig>({
    ...INITIAL_SITE_CONFIG,
    status: 'published',
  });
  const [publishedProducts, setPublishedProducts] = useState<Product[]>(
    INITIAL_PRODUCTS.map((p) => ({ ...p }))
  );
  const [publishedPages, setPublishedPages] = useState<CmsPage[]>(
    INITIAL_CMS_PAGES.map((p) => ({ ...p }))
  );
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<StoreLanguage>('bn');
  const [headerSearch, setHeaderSearch] = useState('');

  // Draft preview state
  const [previewPayload, setPreviewPayload] = useState<{
    config: SiteConfig;
    product?: Product;
    page?: CmsPage;
  } | null>(null);

  // Shopping Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const loadPublishedStorefront = useCallback(async () => {
    try {
      const [cfg, prods, pgs] = await Promise.all([
        fetchPublishedSiteConfig(),
        fetchProducts(false),
        fetchPages(false),
      ]);
      if (cfg) {
        setPublishedConfig({
          ...cfg,
          deliveryZones:
            cfg.deliveryZones && cfg.deliveryZones.length > 0
              ? cfg.deliveryZones
              : DEFAULT_DELIVERY_ZONES,
        });
        if (cfg.defaultLanguage) setLang(cfg.defaultLanguage);
      }
      if (prods.length > 0) setPublishedProducts(prods);
      if (pgs.length > 0) setPublishedPages(pgs);
    } catch {
      // Keep graceful defaults until admin initializes database
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
    loadPublishedStorefront();
  }, [loadPublishedStorefront]);

  const activeConfig = previewPayload?.config || publishedConfig;
  const activeProducts = publishedProducts;
  const activePages = publishedPages;

  // Dynamically sync Document Title, Meta Description, OG Tags, and Favicon from CMS
  useEffect(() => {
    let title = activeConfig.seo?.metaTitle || activeConfig.siteName;
    let desc = activeConfig.seo?.metaDescription || activeConfig.tagline;

    if (route.view === 'product') {
      title = route.product.seoTitle || `${route.product.name} | ${activeConfig.siteName}`;
      desc = route.product.seoDescription || route.product.shortDescription;
    } else if (route.view === 'page') {
      const pg =
        route.previewPage || activePages.find((p) => p.slug === route.slug);
      if (pg) {
        title = pg.seoTitle || `${pg.title} | ${activeConfig.siteName}`;
        desc = pg.seoDescription || desc;
      }
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    if (activeConfig.faviconUrl) {
      let iconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!iconEl) {
        iconEl = document.createElement('link');
        iconEl.rel = 'icon';
        document.head.appendChild(iconEl);
      }
      iconEl.href = activeConfig.faviconUrl;
    }
  }, [activeConfig, activePages, route]);

  const handleNavigate = (target: string, categoryFilter?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!target || target === 'home') {
      setRoute({ view: 'home' });
      return;
    }
    if (target === 'catalog' || target === '#catalog') {
      setRoute({ view: 'catalog', category: categoryFilter || 'All', search: '' });
      return;
    }
    if (target === '#contact') {
      setRoute({ view: 'page', slug: 'contact' });
      return;
    }
    if (target.startsWith('page:')) {
      setRoute({ view: 'page', slug: target.replace('page:', '') });
      return;
    }
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    const matchedPage = activePages.find((p) => p.slug === target);
    if (matchedPage) {
      setRoute({ view: 'page', slug: matchedPage.slug });
      return;
    }
    setRoute({ view: 'home' });
  };

  const addToCart = (
    product: Product,
    opts?: { color?: string; variation?: string; quantity?: number; unitPrice?: number }
  ) => {
    const unitPrice =
      opts?.unitPrice ??
      (product.discountPrice &&
      product.discountPrice > 0 &&
      product.discountPrice < product.regularPrice
        ? product.discountPrice
        : product.regularPrice);
    const color = opts?.color || product.colors?.[0]?.name || '';
    const variation = opts?.variation || product.variations?.[0]?.options?.[0] || '';
    const qty = opts?.quantity || 1;
    const key = `${product.id}__${color}__${variation}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          modelNumber: product.modelNumber,
          image: product.images?.[0]?.url || '',
          unitPrice,
          quantity: qty,
          selectedColor: color,
          selectedVariation: variation,
        },
      ];
    });
    setCartOpen(true);
  };

  if (mode === 'admin' && !previewPayload) {
    return (
      <AdminShell
        onExitToStorefront={() => setMode('storefront')}
        onPublishedRefresh={loadPublishedStorefront}
        onStartPreview={({ config, product, page }) => {
          setPreviewPayload({ config, product, page });
          if (product) {
            setRoute({ view: 'product', product });
          } else if (page) {
            setRoute({ view: 'page', slug: page.slug, previewPage: page });
          } else {
            setRoute({ view: 'home' });
          }
          setMode('storefront');
        }}
      />
    );
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const currentPage =
    route.view === 'page'
      ? route.previewPage ||
        activePages.find((p) => p.slug === route.slug) ||
        activePages[0]
      : null;

  return (
    <div
      style={{
        backgroundColor: activeConfig.theme.backgroundColor,
        color: activeConfig.theme.textColor,
        fontFamily: `"${activeConfig.theme.bodyFont}", sans-serif`,
      }}
      className="min-h-screen flex flex-col"
    >
      {previewPayload && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-4 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0" />
            <span>Previewing Unpublished Draft Changes</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewPayload(null);
              setMode('admin');
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-black/25 hover:bg-black/40 rounded text-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Return to Admin CMS</span>
          </button>
        </div>
      )}

      <StorefrontHeader
        config={activeConfig}
        lang={lang}
        onChangeLang={setLang}
        cartCount={cartCount}
        searchQuery={headerSearch}
        onSearchSubmit={(q) => {
          setHeaderSearch(q);
          setRoute({ view: 'catalog', category: 'All', search: q });
        }}
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setMode('admin')}
        isPreviewMode={Boolean(previewPayload)}
      />

      <main className="flex-1">
        {loading ? (
          <div className="py-24 text-center text-sm opacity-60">
            Loading {activeConfig.siteName}...
          </div>
        ) : route.view === 'home' ? (
          <HomepageSectionsRenderer
            config={activeConfig}
            products={activeProducts}
            lang={lang}
            onSelectProduct={(prod) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setRoute({ view: 'product', product: prod });
            }}
            onQuickAdd={(prod) => addToCart(prod)}
            onNavigate={handleNavigate}
          />
        ) : route.view === 'catalog' ? (
          <CatalogView
            products={activeProducts}
            config={activeConfig}
            lang={lang}
            initialCategory={route.category}
            initialSearchQuery={route.search}
            onSelectProduct={(prod) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setRoute({ view: 'product', product: prod });
            }}
            onQuickAdd={(prod) => addToCart(prod)}
            onBack={() => setRoute({ view: 'home' })}
          />
        ) : route.view === 'product' ? (
          <ProductDetailView
            product={route.product}
            allProducts={activeProducts}
            config={activeConfig}
            lang={lang}
            onBack={() => setRoute({ view: 'home' })}
            onSelectProduct={(prod) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setRoute({ view: 'product', product: prod });
            }}
            onAddToCart={addToCart}
            onNavigate={handleNavigate}
          />
        ) : currentPage ? (
          <CmsPageView
            page={currentPage}
            config={activeConfig}
            onBack={() => setRoute({ view: 'home' })}
            onNavigate={handleNavigate}
          />
        ) : null}
      </main>

      <StorefrontFooter config={activeConfig} onNavigate={handleNavigate} />

      <CartCheckoutDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        currency={activeConfig.currencySymbol}
        theme={activeConfig.theme}
        deliveryZones={activeConfig.deliveryZones}
        lang={lang}
        onUpdateQty={(key, delta) => {
          setCart((prev) =>
            prev
              .map((item) =>
                item.key === key ? { ...item, quantity: item.quantity + delta } : item
              )
              .filter((item) => item.quantity > 0)
          );
        }}
        onRemoveItem={(key) => setCart((prev) => prev.filter((i) => i.key !== key))}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
