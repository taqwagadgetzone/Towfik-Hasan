import { Menu, PhoneCall, Search, Shield, ShoppingBag, X } from 'lucide-react';
import React, { useState } from 'react';
import { SiteConfig, StoreLanguage } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface StorefrontHeaderProps {
  config: SiteConfig;
  lang: StoreLanguage;
  onChangeLang: (lang: StoreLanguage) => void;
  cartCount: number;
  searchQuery: string;
  onSearchSubmit: (q: string) => void;
  onNavigate: (target: string, categoryFilter?: string) => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isPreviewMode?: boolean;
}

export function StorefrontHeader({
  config,
  lang,
  onChangeLang,
  cartCount,
  searchQuery,
  onSearchSubmit,
  onNavigate,
  onOpenCart,
  onOpenAdmin,
  isPreviewMode = false,
}: StorefrontHeaderProps) {
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const { announcement, navigation, theme, contact } = config;
  const visibleNav = (navigation || []).filter((n) => n.visible).slice(0, 6);

  const radiusClass =
    theme.borderRadius === 'none'
      ? 'rounded-none'
      : theme.borderRadius === 'sm'
      ? 'rounded-sm'
      : theme.borderRadius === 'lg'
      ? 'rounded-lg'
      : theme.borderRadius === 'xl'
      ? 'rounded-xl'
      : 'rounded-md';

  const handleNavClick = (target: string, linkType?: string) => {
    setMobileMenuOpen(false);
    if (linkType === 'external') {
      window.open(target, '_blank', 'noopener,noreferrer');
      return;
    }
    if (linkType === 'page') {
      onNavigate(`page:${target}`);
      return;
    }
    onNavigate(target);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localSearch);
  };

  const isDarkSurface =
    theme.surfaceColor.toLowerCase().startsWith('#0') ||
    theme.surfaceColor.toLowerCase().startsWith('#1');

  return (
    <div className="sticky top-0 z-40">
      {/* Top Green / Brand Utility Announcement Bar (GhorerBazar Style) */}
      {announcement?.enabled && !dismissedBanner && (
        <div
          style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
          className="min-h-9 px-4 py-1.5 flex items-center justify-between text-xs font-medium"
        >
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {contact.phone?.enabled && contact.phone.value && (
              <a
                href={`tel:${contact.phone.value.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 hover:opacity-80 whitespace-nowrap"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{contact.phone.value}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 truncate mx-auto">
            <span className="truncate">{announcement.text}</span>
            {announcement.linkLabel && (
              <button
                type="button"
                onClick={() => onNavigate(announcement.linkTarget || 'catalog')}
                className="underline underline-offset-2 font-semibold whitespace-nowrap shrink-0 hover:opacity-80"
              >
                {announcement.linkLabel}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissedBanner(true)}
            aria-label="Dismiss announcement"
            className="p-1 opacity-75 hover:opacity-100 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header
        style={{
          backgroundColor: theme.surfaceColor,
          color: theme.textColor,
          fontFamily: `"${theme.headingFont}", sans-serif`,
        }}
        className={`border-b backdrop-blur-sm ${
          isDarkSurface ? 'border-white/10' : 'border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            {config.logoUrl ? (
              <SafeImage
                src={config.logoUrl}
                alt={config.siteName}
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span
                style={{ backgroundColor: theme.secondaryColor }}
                className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
              >
                {config.siteName.slice(0, 1)}
              </span>
            )}
            <div className="leading-tight">
              <span className="text-base sm:text-lg font-bold tracking-tight block whitespace-nowrap">
                {config.siteName}
              </span>
            </div>
          </button>

          {/* GhorerBazar Style Live Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-2 relative"
          >
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'স্মার্টওয়াচ, হেডফোন বা মডেল লিখে খুঁজুন...'
                  : 'Search smartwatch, headphones, model...'
              }
              className={`w-full pl-3.5 pr-10 py-2 text-xs border focus:outline-none ${radiusClass} ${
                isDarkSurface
                  ? 'bg-white/5 border-white/15 text-white placeholder:text-slate-400 focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600'
              }`}
              style={{ fontFamily: `"${theme.bodyFont}", sans-serif` }}
            />
            <button
              type="submit"
              aria-label="Search products"
              style={{ color: theme.secondaryColor }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation + Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {theme.headerLayout !== 'minimal' && (
              <nav
                className="hidden xl:flex items-center gap-5 text-xs font-semibold mr-2"
                style={{ fontFamily: `"${theme.bodyFont}", sans-serif` }}
              >
                {visibleNav.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.target, item.linkType)}
                    className="hover:opacity-70 transition-opacity whitespace-nowrap shrink-0"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* BN | EN Language Toggle */}
            <div
              className={`inline-flex items-center p-0.5 border text-[11px] font-bold ${radiusClass} ${
                isDarkSurface ? 'border-white/15 bg-white/5' : 'border-slate-300 bg-slate-100'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeLang('bn')}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === 'bn'
                    ? 'bg-emerald-600 text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                BN
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                EN
              </button>
            </div>

            {!isPreviewMode && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${radiusClass} ${
                  isDarkSurface
                    ? 'border-white/20 hover:bg-white/10'
                    : 'border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              style={{
                backgroundColor: theme.buttonBgColor,
                color: theme.buttonTextColor,
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 ${radiusClass}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'ব্যাগ' : 'Bag'}</span>
              <span className="font-mono tabular-nums">({cartCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className={`xl:hidden p-2 border rounded-md ${
                isDarkSurface ? 'border-white/15' : 'border-slate-300'
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* GhorerBazar Style Category Quick Strip */}
        <div
          className={`border-t text-xs font-medium ${
            isDarkSurface
              ? 'border-white/10 bg-black/25'
              : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onNavigate('catalog', 'All')}
              className="font-semibold hover:opacity-75 whitespace-nowrap shrink-0"
              style={{ color: theme.secondaryColor }}
            >
              {lang === 'bn' ? 'সব পণ্য (All Products)' : 'All Products'}
            </button>
            {['Smartwatches', 'Audio', 'Power & Charging', 'Workspace'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onNavigate('catalog', cat)}
                className="opacity-80 hover:opacity-100 whitespace-nowrap shrink-0"
              >
                {cat}
              </button>
            ))}
            {visibleNav.map((item) => (
              <button
                key={`strip-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.target, item.linkType)}
                className="opacity-75 hover:opacity-100 whitespace-nowrap shrink-0 xl:hidden"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-current/10 px-4 py-3 space-y-3 bg-inherit">
            <form onSubmit={handleSearch} className="md:hidden relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={lang === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'}
                className="w-full pl-3 pr-9 py-2 text-xs border border-current/20 rounded-md bg-transparent"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <Search className="w-4 h-4 opacity-70" />
              </button>
            </form>

            {visibleNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.target, item.linkType)}
                className="block w-full text-left py-2 text-sm font-medium border-b border-current/10 last:border-0"
              >
                {item.label}
              </button>
            ))}
            {!isPreviewMode && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-2 w-full py-2 text-sm font-semibold"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin CMS</span>
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
