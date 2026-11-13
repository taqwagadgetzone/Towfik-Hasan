import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  LayoutTemplate,
  LogOut,
  Package,
  Palette,
  PhoneOff,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_SITE_CONFIG } from '../../data/seedData';
import { auth, BOOTSTRAP_ADMIN_EMAIL, db, googleAuthProvider } from '../../lib/firebase';
import {
  fetchAdmins,
  fetchDraftSiteConfig,
  fetchIncompleteOrders,
  fetchMediaLibrary,
  fetchOrders,
  fetchPages,
  fetchProducts,
  fetchPublishedSiteConfig,
  fetchRevisions,
  fetchTemplates,
  initializeDatabaseIfEmpty,
  publishSiteConfig,
  saveSiteConfigDraft,
} from '../../services/cmsService';
import {
  AdminUser,
  CmsPage,
  DescriptionTemplate,
  IncompleteOrder,
  MediaAsset,
  Order,
  Product,
  Revision,
  SiteConfig,
} from '../../types/cms';
import { GlobalContactSeoEditor } from './GlobalContactSeoEditor';
import { HomepageBuilder } from './HomepageBuilder';
import { MediaLibraryManager, OrdersManager } from './MediaAndOrdersManagers';
import { PageManager } from './PageManager';
import { IncompleteOrdersManager, PosManager } from './PosAndIncompleteManagers';
import { ProductManager } from './ProductManager';
import { RevisionsAndPermissions } from './RevisionsAndPermissions';
import { ThemeCustomizer } from './ThemeCustomizer';

type AdminTab =
  | 'overview'
  | 'pos'
  | 'products'
  | 'orders'
  | 'incomplete'
  | 'homepage'
  | 'theme'
  | 'global'
  | 'pages'
  | 'media'
  | 'revisions';

interface AdminShellProps {
  onExitToStorefront: () => void;
  onStartPreview: (opts: {
    config: SiteConfig;
    product?: Product;
    page?: CmsPage;
  }) => void;
  onPublishedRefresh: () => Promise<void>;
}

export function AdminShell({
  onExitToStorefront,
  onStartPreview,
  onPublishedRefresh,
}: AdminShellProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [productSort, setProductSort] = useState<'views' | 'orders' | 'name' | 'newest'>('views');

  const [draftConfig, setDraftConfig] = useState<SiteConfig>({
    ...INITIAL_SITE_CONFIG,
    status: 'draft',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [templates, setTemplates] = useState<DescriptionTemplate[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const loadAllAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      await initializeDatabaseIfEmpty();
      const [
        draftCfg,
        pubCfg,
        prods,
        pgs,
        tpls,
        media,
        revs,
        ords,
        incOrds,
        admList,
      ] = await Promise.all([
        fetchDraftSiteConfig(),
        fetchPublishedSiteConfig(),
        fetchProducts(true),
        fetchPages(true),
        fetchTemplates(),
        fetchMediaLibrary(),
        fetchRevisions().catch(() => [] as Revision[]),
        fetchOrders().catch(() => [] as Order[]),
        fetchIncompleteOrders().catch(() => [] as IncompleteOrder[]),
        fetchAdmins().catch(() => [] as AdminUser[]),
      ]);

      setDraftConfig(draftCfg || pubCfg || { ...INITIAL_SITE_CONFIG, status: 'draft' });
      setProducts(prods);
      setPages(pgs);
      setTemplates(tpls);
      setMediaLibrary(media);
      setRevisions(revs);
      setOrders(ords);
      setIncompleteOrders(incOrds);
      setAdmins(admList);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to load CMS data.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthError('');
      if (!u) {
        setIsAuthorizedAdmin(false);
        setAuthReady(true);
        return;
      }

      const isBootstrap =
        u.email === BOOTSTRAP_ADMIN_EMAIL && u.emailVerified === true;
      if (isBootstrap) {
        setIsAuthorizedAdmin(true);
        setAuthReady(true);
        loadAllAdminData();
        return;
      }

      try {
        const admSnap = await getDoc(doc(db, 'admins', u.uid));
        if (admSnap.exists()) {
          setIsAuthorizedAdmin(true);
          loadAllAdminData();
        } else {
          setIsAuthorizedAdmin(false);
        }
      } catch {
        setIsAuthorizedAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, [loadAllAdminData]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in cancelled or failed.');
    }
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleSaveSiteDraft = async () => {
    setSaving(true);
    try {
      await saveSiteConfigDraft(draftConfig, `Saved draft (${activeTab})`);
      await loadAllAdminData();
      notify('Draft saved to database. Click Preview or Publish when ready.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishSite = async () => {
    setSaving(true);
    try {
      await publishSiteConfig(draftConfig, `Published (${activeTab})`);
      await Promise.all([loadAllAdminData(), onPublishedRefresh()]);
      notify('Changes published live to the storefront.');
    } finally {
      setSaving(false);
    }
  };

  // Analytics aggregations for Screenshot 2 Dashboard
  const analytics = useMemo(() => {
    const pipeline = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    const productOrderCount = new Map<string, number>();

    let nonCancelledSales = 0;
    orders.forEach((o) => {
      if (o.status in pipeline) {
        pipeline[o.status as keyof typeof pipeline] += 1;
      }
      if (o.status !== 'cancelled' && o.status !== 'returned') {
        nonCancelledSales += Number(o.totalAmount) || 0;
      }
      (o.items || []).forEach((it) => {
        productOrderCount.set(
          it.productId,
          (productOrderCount.get(it.productId) || 0) + (it.quantity || 1)
        );
      });
    });

    const totalViews = products.reduce((sum, p) => sum + (Number(p.viewsCount) || 0), 0);
    const totalProductOrders = Array.from(productOrderCount.values()).reduce((a, b) => a + b, 0);

    const productRows = products.map((p) => ({
      product: p,
      views: Number(p.viewsCount) || 0,
      ordersCount: productOrderCount.get(p.id) || 0,
    }));

    productRows.sort((a, b) => {
      if (productSort === 'orders') return b.ordersCount - a.ordersCount;
      if (productSort === 'name') return a.product.name.localeCompare(b.product.name);
      if (productSort === 'newest') return a.product.id.localeCompare(b.product.id);
      return b.views - a.views;
    });

    const maxViews = Math.max(1, ...productRows.map((r) => r.views));

    return {
      pipeline,
      totalOrders: orders.length,
      nonCancelledSales,
      needsAction: pipeline.pending,
      processingTotal: pipeline.confirmed + pipeline.processing + pipeline.shipped,
      totalViews,
      totalProductOrders,
      productRows,
      maxViews,
    };
  }, [orders, products, productSort]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#090D0B] flex items-center justify-center text-sm text-slate-400">
        Verifying CMS session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090D0B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111614] border border-white/10 rounded-xl p-8 space-y-6 text-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Taqwa Gadget Zone Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard Sign-In</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in with your authorized Google account ({BOOTSTRAP_ADMIN_EMAIL}) to manage orders, POS, products, visual builders, and site design.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-md bg-red-500/15 border border-red-500/40 text-xs text-red-300">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={onExitToStorefront}
              className="w-full py-2.5 px-4 border border-white/15 text-slate-300 text-xs font-semibold rounded-lg hover:bg-white/5"
            >
              Back to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#090D0B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111614] border border-white/10 rounded-xl p-8 space-y-5 text-slate-100">
          <h1 className="text-xl font-bold">Admin Permission Required</h1>
          <p className="text-sm text-slate-400">
            Signed in as <span className="font-semibold text-white">{user.email}</span>. This account is not currently listed in CMS Admin Permissions.
          </p>
          <div className="p-3 bg-[#090D0B] border border-white/10 rounded text-xs font-mono break-all text-slate-300">
            UID: {user.uid}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 text-white rounded-md"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onExitToStorefront}
              className="flex-1 py-2.5 text-xs font-semibold border border-white/15 rounded-md"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarGroups: {
    group: string;
    items: { id: AdminTab; label: string; icon: typeof BarChart3; badge?: number }[];
  }[] = [
    {
      group: 'Media',
      items: [{ id: 'media', label: 'Media Library', icon: ImageIcon }],
    },
    {
      group: 'Shop',
      items: [
        { id: 'overview', label: 'Analytics', icon: BarChart3 },
        { id: 'pos', label: 'POS', icon: CreditCard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length },
        {
          id: 'incomplete',
          label: 'Incomplete orders',
          icon: PhoneOff,
          badge: incompleteOrders.length,
        },
      ],
    },
    {
      group: 'Design',
      items: [
        { id: 'homepage', label: 'Homepage Builder', icon: LayoutTemplate },
        { id: 'theme', label: 'Themes', icon: Palette },
        { id: 'global', label: 'Navigation & SEO', icon: Globe },
      ],
    },
    {
      group: 'Content',
      items: [
        { id: 'pages', label: 'Pages', icon: FileText },
        { id: 'revisions', label: 'Revisions & Access', icon: History },
      ],
    },
  ];

  const pipelineCards = [
    { label: 'NEW', count: analytics.pipeline.pending, color: 'border-amber-500/40 bg-amber-500/5 text-amber-400', bar: 'bg-amber-500' },
    { label: 'CONFIRMED', count: analytics.pipeline.confirmed, color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400', bar: 'bg-cyan-500' },
    { label: 'PROCESSING', count: analytics.pipeline.processing, color: 'border-violet-500/40 bg-violet-500/5 text-violet-400', bar: 'bg-violet-500' },
    { label: 'SHIPPED', count: analytics.pipeline.shipped, color: 'border-blue-500/40 bg-blue-500/5 text-blue-400', bar: 'bg-blue-500' },
    { label: 'DELIVERED', count: analytics.pipeline.delivered, color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400', bar: 'bg-emerald-500' },
    { label: 'CANCELLED', count: analytics.pipeline.cancelled, color: 'border-rose-500/40 bg-rose-500/5 text-rose-400', bar: 'bg-rose-500' },
    { label: 'RETURNED', count: analytics.pipeline.returned, color: 'border-orange-500/40 bg-orange-500/5 text-orange-400', bar: 'bg-orange-500' },
  ];

  const isLightEditorTab =
    activeTab === 'homepage' ||
    activeTab === 'products' ||
    activeTab === 'pages' ||
    activeTab === 'theme' ||
    activeTab === 'global' ||
    activeTab === 'media' ||
    activeTab === 'orders' ||
    activeTab === 'revisions';

  return (
    <div className="min-h-screen bg-[#090D0B] text-slate-100 flex flex-col lg:flex-row">
      {/* Grouped Left Dark Sidebar matching Screenshot 2 */}
      <aside className="w-full lg:w-60 bg-[#0D1210] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0">
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {draftConfig.siteName.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">My dashboard</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-3 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto flex-1">
          {sidebarGroups.map((grp) => (
            <div key={grp.group} className="space-y-1 shrink-0">
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:block">
                {grp.group}
              </p>
              <div className="flex lg:flex-col gap-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-white/10 hidden lg:block space-y-2">
          <button
            type="button"
            onClick={onExitToStorefront}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold border border-white/15 rounded-md hover:bg-white/5 text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dark Emerald Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-[#0D1210] border-b border-white/10 px-6 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Admin Studio</span>
            <span>/</span>
            <span className="font-semibold text-emerald-400 capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStartPreview({ config: draftConfig })}
              className="px-3 py-1.5 text-xs font-semibold border border-white/15 rounded-md hover:bg-white/5 text-slate-200 whitespace-nowrap"
            >
              Preview Draft
            </button>
            <button
              type="button"
              onClick={onExitToStorefront}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View store</span>
            </button>
          </div>
        </header>

        {toast && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
            {toast}
          </div>
        )}

        <main className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {loadingData ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading CMS &amp; Analytics workspace...
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-5">
              {/* Store Hero Card matching Screenshot 2 */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#0E1A15] via-[#111916] to-[#0D1512] border border-emerald-500/20 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-white text-slate-900 font-bold text-sm flex items-center justify-center shrink-0">
                      {draftConfig.siteName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> LIVE
                      </span>
                      <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                        {draftConfig.siteName}
                      </h1>
                      <p className="text-[11px] text-slate-400">
                        {draftConfig.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onExitToStorefront}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View store
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pos')}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> POS
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" /> Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('global')}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                  </div>
                </div>

                {/* 4 Top Summary Strip Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#090D0B]/70 border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">PRODUCTS</p>
                    <p className="text-xl font-bold font-mono tabular-nums mt-1">{products.length}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#090D0B]/70 border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">INCOMPLETE LEADS</p>
                    <p className="text-xl font-bold font-mono tabular-nums mt-1">
                      {incompleteOrders.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#090D0B]/70 border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">TOTAL ORDERS</p>
                    <p className="text-xl font-bold font-mono tabular-nums mt-1">
                      {analytics.totalOrders}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#090D0B]/70 border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      TOTAL SALES ({draftConfig.currencySymbol})
                    </p>
                    <p className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                      {draftConfig.currencySymbol}
                      {analytics.nonCancelledSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 KPI Row Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#111614] border border-white/10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">TOTAL ORDERS</p>
                    <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                      {analytics.totalOrders}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Active store orders
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#111614] border border-white/10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">TOTAL SALES</p>
                    <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                      {draftConfig.currencySymbol}
                      {analytics.nonCancelledSales.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Confirmed &amp; active volume</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-xl bg-[#111614] border border-white/10 hover:border-amber-500/40 text-left flex items-start justify-between transition-colors"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">NEEDS ACTION</p>
                    <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-amber-400">
                      {analytics.needsAction}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">View orders &rarr;</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                </button>

                <div className="p-4 rounded-xl bg-[#111614] border border-white/10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">PROCESSING</p>
                    <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-violet-400">
                      {analytics.processingTotal}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Total active pipeline</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* 7-Stage Order Pipeline matching Screenshot 2 */}
              <div className="p-5 rounded-xl bg-[#111614] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Order pipeline (last 30 days)</h2>
                    <p className="text-xs text-slate-400 font-mono">Total: {analytics.totalOrders}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    Manage all orders &rarr;
                  </button>
                </div>

                {/* Proportional Multi-Color Bar */}
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                  {pipelineCards.map((pc) => {
                    const pct =
                      analytics.totalOrders > 0 ? (pc.count / analytics.totalOrders) * 100 : 0;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={pc.label}
                        className={`${pc.bar} h-full`}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {pipelineCards.map((pc) => (
                    <button
                      key={pc.label}
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className={`p-3 rounded-lg border text-center transition-opacity hover:opacity-90 ${pc.color}`}
                    >
                      <p className="text-[10px] font-bold tracking-wider">{pc.label}</p>
                      <p className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                        {pc.count}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Storefront Visitors & Top Products by Views (Horizontal Progress Bars) */}
              <div className="p-5 rounded-xl bg-[#111614] border border-white/10 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      STOREFRONT VISITORS
                    </p>
                    <p className="text-xs text-slate-500">
                      Product page views on your storefront
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      TOTAL PRODUCT VIEWS
                    </p>
                    <p className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#090D0B] border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      TOTAL PRODUCT VIEWS
                    </p>
                    <p className="text-lg font-bold font-mono tabular-nums mt-1">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#090D0B] border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      PRODUCTS WITH VIEWS
                    </p>
                    <p className="text-lg font-bold font-mono tabular-nums mt-1">
                      {products.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#090D0B] border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      CATALOG ORDER COUNT
                    </p>
                    <p className="text-lg font-bold font-mono tabular-nums mt-1">
                      {analytics.totalProductOrders}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    TOP PRODUCTS BY VIEWS
                  </p>
                  <div className="space-y-2.5">
                    {analytics.productRows.slice(0, 6).map((row) => {
                      const pct = Math.max(4, Math.round((row.views / analytics.maxViews) * 100));
                      return (
                        <div key={row.product.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-200 truncate pr-4">
                              {row.product.name}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-400 whitespace-nowrap">
                              {row.views.toLocaleString()} Views · {row.ordersCount} Orders
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Products — Views & Orders Table with Shop | Landing | Edit links */}
              <div className="rounded-xl bg-[#111614] border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    PRODUCTS — VIEWS &amp; ORDERS
                  </p>
                  <div className="inline-flex rounded-md border border-white/10 bg-[#090D0B] p-0.5 text-[11px]">
                    {(['views', 'orders', 'name', 'newest'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setProductSort(s)}
                        className={`px-2.5 py-1 rounded capitalize ${
                          productSort === s
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3">Product</th>
                        <th className="px-4 py-3 text-right">Views</th>
                        <th className="px-4 py-3 text-right">Orders</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-right">Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analytics.productRows.map(({ product: p, views, ordersCount }) => {
                        const displayPrice =
                          p.discountPrice && p.discountPrice > 0
                            ? p.discountPrice
                            : p.regularPrice;
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="px-5 py-3">
                              <p className="font-semibold text-slate-100">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-500">
                                ID: {p.modelNumber}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                              {views.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                              {ordersCount}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-200">
                              {draftConfig.currencySymbol}
                              {displayPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  p.status === 'published'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                }`}
                              >
                                {p.status === 'published' ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right whitespace-nowrap space-x-2.5 text-[11px] font-semibold">
                              <button
                                type="button"
                                onClick={onExitToStorefront}
                                className="text-slate-400 hover:text-white"
                              >
                                Shop
                              </button>
                              <button
                                type="button"
                                onClick={() => onStartPreview({ config: draftConfig, product: p })}
                                className="text-emerald-400 hover:underline"
                              >
                                Landing
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('products')}
                                className="text-slate-300 hover:text-white"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'pos' ? (
            <PosManager
              products={products}
              currency={draftConfig.currencySymbol}
              deliveryZones={draftConfig.deliveryZones}
              onRefreshData={loadAllAdminData}
            />
          ) : activeTab === 'incomplete' ? (
            <IncompleteOrdersManager
              leads={incompleteOrders}
              currency={draftConfig.currencySymbol}
              onRefreshData={loadAllAdminData}
            />
          ) : isLightEditorTab ? (
            <div className="bg-slate-50 text-slate-900 p-5 rounded-xl border border-white/10">
              {activeTab === 'homepage' ? (
                <HomepageBuilder
                  draftConfig={draftConfig}
                  products={products}
                  mediaLibrary={mediaLibrary}
                  onMediaAdded={(a) => setMediaLibrary((prev) => [a, ...prev])}
                  onChangeDraft={setDraftConfig}
                  onSaveDraft={handleSaveSiteDraft}
                  onPublish={handlePublishSite}
                  onOpenPreview={() => onStartPreview({ config: draftConfig })}
                  saving={saving}
                />
              ) : activeTab === 'products' ? (
                <ProductManager
                  products={products}
                  currency={draftConfig.currencySymbol}
                  templates={templates}
                  mediaLibrary={mediaLibrary}
                  theme={draftConfig.theme}
                  onMediaAdded={(a) => setMediaLibrary((prev) => [a, ...prev])}
                  onRefreshData={async () => {
                    await Promise.all([loadAllAdminData(), onPublishedRefresh()]);
                  }}
                  onPreviewProduct={(prod) =>
                    onStartPreview({ config: draftConfig, product: prod })
                  }
                />
              ) : activeTab === 'pages' ? (
                <PageManager
                  pages={pages}
                  templates={templates}
                  mediaLibrary={mediaLibrary}
                  theme={draftConfig.theme}
                  onMediaAdded={(a) => setMediaLibrary((prev) => [a, ...prev])}
                  onRefreshData={async () => {
                    await Promise.all([loadAllAdminData(), onPublishedRefresh()]);
                  }}
                  onPreviewPage={(pg) => onStartPreview({ config: draftConfig, page: pg })}
                />
              ) : activeTab === 'theme' ? (
                <ThemeCustomizer
                  draftConfig={draftConfig}
                  products={products}
                  onChangeDraft={setDraftConfig}
                  onSaveDraft={handleSaveSiteDraft}
                  onPublish={handlePublishSite}
                  onOpenPreview={() => onStartPreview({ config: draftConfig })}
                  saving={saving}
                />
              ) : activeTab === 'global' ? (
                <GlobalContactSeoEditor
                  draftConfig={draftConfig}
                  mediaLibrary={mediaLibrary}
                  onMediaAdded={(a) => setMediaLibrary((prev) => [a, ...prev])}
                  onChangeDraft={setDraftConfig}
                  onSaveDraft={handleSaveSiteDraft}
                  onPublish={handlePublishSite}
                  onOpenPreview={() => onStartPreview({ config: draftConfig })}
                  saving={saving}
                />
              ) : activeTab === 'media' ? (
                <MediaLibraryManager
                  mediaLibrary={mediaLibrary}
                  onRefreshData={loadAllAdminData}
                />
              ) : activeTab === 'orders' ? (
                <OrdersManager
                  orders={orders}
                  currency={draftConfig.currencySymbol}
                  onRefreshData={loadAllAdminData}
                />
              ) : (
                <RevisionsAndPermissions
                  revisions={revisions}
                  admins={admins}
                  currentUserEmail={user.email || ''}
                  onRefreshData={async () => {
                    await Promise.all([loadAllAdminData(), onPublishedRefresh()]);
                  }}
                  onRestoreSiteConfig={(cfg) => setDraftConfig(cfg)}
                />
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
