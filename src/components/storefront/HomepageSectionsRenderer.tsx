import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import React, { useState } from 'react';
import { HomepageSection, Product, SiteConfig, StoreLanguage } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';
import { ContactButtonsStrip } from './ContactButtonsStrip';
import { ProductCard } from './ProductCard';

interface HomepageSectionsRendererProps {
  config: SiteConfig;
  products: Product[];
  lang?: StoreLanguage;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onNavigate: (target: string, categoryFilter?: string) => void;
  forceMobileView?: boolean;
}

const ICON_LOOKUP: Record<string, typeof ShieldCheck> = {
  ShieldCheck,
  PackageCheck,
  Award,
  Headphones,
  Truck,
};

export function HomepageSectionsRenderer({
  config,
  products,
  lang = 'bn',
  onSelectProduct,
  onQuickAdd,
  onNavigate,
  forceMobileView = false,
}: HomepageSectionsRendererProps) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const { theme, homepageSections, currencySymbol, contact } = config;
  const visibleSections = (homepageSections || []).filter((s) => s.visible);

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

  const getBtnStyle = (inverted = false) => {
    if (inverted) {
      return {
        backgroundColor: theme.secondaryColor,
        color: '#FFFFFF',
      };
    }
    if (theme.buttonStyle === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: theme.buttonBgColor,
        border: `1px solid ${theme.buttonBgColor}`,
      };
    }
    if (theme.buttonStyle === 'soft') {
      return {
        backgroundColor: `${theme.buttonBgColor}18`,
        color: theme.buttonBgColor,
      };
    }
    return {
      backgroundColor: theme.buttonBgColor,
      color: theme.buttonTextColor,
    };
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterDone(true);
    setNewsletterEmail('');
  };

  const renderSection = (section: HomepageSection) => {
    const sectionStyle = {
      backgroundColor: section.bgColor || theme.backgroundColor,
      color: section.textColor || theme.textColor,
      fontFamily: `"${theme.bodyFont}", sans-serif`,
    };

    if (section.type === 'hero_banner') {
      const slides =
        section.slides && section.slides.length > 0
          ? section.slides
          : [
              {
                id: 'default-slide',
                kicker: section.subtitle,
                heading: section.title,
                description: section.description,
                desktopImage: section.desktopBanner,
                mobileImage: section.mobileBanner || section.desktopBanner,
                ctaLabel: section.ctaLabel,
                ctaLink: section.ctaLink,
              },
            ];
      const safeIdx = slideIdx % slides.length;
      const activeSlide = slides[safeIdx];
      const bannerImage = forceMobileView
        ? activeSlide.mobileImage || activeSlide.desktopImage
        : activeSlide.desktopImage || section.desktopBanner;

      return (
        <section
          key={section.id}
          style={sectionStyle}
          className="relative overflow-hidden border-b border-black/10"
        >
          {bannerImage && (
            <div className="absolute inset-0">
              {forceMobileView ? (
                <SafeImage
                  src={activeSlide.mobileImage || activeSlide.desktopImage}
                  alt={activeSlide.heading}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <SafeImage
                    src={activeSlide.desktopImage || section.desktopBanner}
                    alt={activeSlide.heading}
                    className="hidden md:block w-full h-full object-cover"
                  />
                  <SafeImage
                    src={activeSlide.mobileImage || activeSlide.desktopImage || section.mobileBanner}
                    alt={activeSlide.heading}
                    className="md:hidden w-full h-full object-cover"
                  />
                </>
              )}
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25"
                style={{ opacity: Math.min(1, Math.max(0.2, (section.overlayOpacity ?? 55) / 100)) }}
              />
            </div>
          )}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 min-h-[460px] flex flex-col justify-center">
            <div className="max-w-2xl space-y-5">
              {activeSlide.kicker && (
                <p className="text-xs font-mono uppercase tracking-widest opacity-80">
                  {activeSlide.kicker}
                </p>
              )}
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.12]"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {activeSlide.heading}
              </h1>
              <p className="text-base sm:text-lg opacity-85 leading-relaxed max-w-xl">
                {activeSlide.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {activeSlide.ctaLabel && (
                  <button
                    type="button"
                    onClick={() => onNavigate(activeSlide.ctaLink || 'catalog')}
                    style={{ backgroundColor: theme.secondaryColor, color: '#FFFFFF' }}
                    className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap ${radiusClass}`}
                  >
                    <span>{activeSlide.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {activeSlide.secondaryCtaLabel && (
                  <button
                    type="button"
                    onClick={() => onNavigate(activeSlide.secondaryCtaLink || 'page:about-us')}
                    className={`px-6 py-3 text-sm font-semibold border border-white/35 text-white hover:bg-white/10 transition-colors whitespace-nowrap ${radiusClass}`}
                  >
                    {activeSlide.secondaryCtaLabel}
                  </button>
                )}
              </div>
            </div>

            {slides.length > 1 && (
              <div className="mt-10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)}
                  aria-label="Previous slide"
                  className="p-2 rounded-full border border-white/30 text-white hover:bg-white/15"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((sl, i) => (
                    <button
                      key={sl.id}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 transition-all rounded-full ${
                        i === safeIdx ? 'w-7 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % slides.length)}
                  aria-label="Next slide"
                  className="p-2 rounded-full border border-white/30 text-white hover:bg-white/15"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (section.type === 'featured_categories') {
      return (
        <section key={section.id} style={sectionStyle} className="py-16 px-4 sm:px-6 border-b border-black/5">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                {section.subtitle && (
                  <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                    {section.subtitle}
                  </p>
                )}
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                >
                  {section.title}
                </h2>
                {section.description && <p className="text-sm opacity-75">{section.description}</p>}
              </div>
              {section.ctaLabel && (
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="text-sm font-semibold underline underline-offset-4 whitespace-nowrap self-start sm:self-auto"
                >
                  {section.ctaLabel}
                </button>
              )}
            </div>

            <div
              className={`grid gap-5 ${
                forceMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {(section.items || []).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate('catalog', cat.link || cat.title)}
                  style={{ backgroundColor: theme.surfaceColor }}
                  className={`group text-left overflow-hidden border border-black/10 hover:border-black/25 transition-all ${radiusClass}`}
                >
                  {cat.image && (
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <SafeImage
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-1">
                    {cat.subtitle && <p className="text-xs opacity-60">{cat.subtitle}</p>}
                    <h3
                      className="text-base font-semibold"
                      style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                    >
                      {cat.title}
                    </h3>
                    <p className="text-xs opacity-75 line-clamp-2">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (
      section.type === 'featured_products' ||
      section.type === 'best_selling' ||
      section.type === 'new_arrivals'
    ) {
      let filtered = products;
      if (section.type === 'featured_products') {
        const f = products.filter((p) => p.isFeatured);
        if (f.length > 0) filtered = f;
      } else if (section.type === 'best_selling') {
        const f = products.filter((p) => p.isBestSeller);
        if (f.length > 0) filtered = f;
      } else if (section.type === 'new_arrivals') {
        const f = products.filter((p) => p.isNewArrival);
        if (f.length > 0) filtered = f;
      }
      const list = filtered.slice(0, section.maxProducts || 4);

      return (
        <section
          key={section.id}
          id={section.type === 'featured_products' ? 'catalog' : undefined}
          style={sectionStyle}
          className="py-16 px-4 sm:px-6 border-b border-black/5"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                {section.subtitle && (
                  <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                    {section.subtitle}
                  </p>
                )}
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                >
                  {section.title}
                </h2>
                {section.description && <p className="text-sm opacity-75">{section.description}</p>}
              </div>
              {section.ctaLabel && (
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-75 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>{section.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div
              className={`grid gap-6 ${
                forceMobileView
                  ? 'grid-cols-1'
                  : list.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {list.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currencySymbol}
                  theme={theme}
                  lang={lang}
                  onSelectProduct={onSelectProduct}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === 'promotional_offers') {
      const desktopImg = section.desktopBanner;
      const mobileImg = section.mobileBanner || section.desktopBanner;
      return (
        <section key={section.id} style={sectionStyle} className="relative overflow-hidden border-b border-black/10">
          {(desktopImg || mobileImg) && (
            <div className="absolute inset-0">
              {forceMobileView ? (
                <SafeImage src={mobileImg} alt={section.title} className="w-full h-full object-cover" />
              ) : (
                <>
                  <SafeImage
                    src={desktopImg}
                    alt={section.title}
                    className="hidden md:block w-full h-full object-cover"
                  />
                  <SafeImage
                    src={mobileImg}
                    alt={section.title}
                    className="md:hidden w-full h-full object-cover"
                  />
                </>
              )}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: Math.min(0.9, Math.max(0.25, (section.overlayOpacity ?? 60) / 100)) }}
              />
            </div>
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
            <div className="max-w-2xl space-y-4">
              {section.subtitle && (
                <p className="text-xs font-mono uppercase tracking-widest opacity-80">
                  {section.subtitle}
                </p>
              )}
              <h2
                className="text-2xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {section.title}
              </h2>
              <p className="text-base opacity-85 leading-relaxed">{section.description}</p>
              {section.ctaLabel && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(section.ctaLink || 'catalog')}
                    style={getBtnStyle(true)}
                    className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold hover:opacity-90 ${radiusClass}`}
                  >
                    <span>{section.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === 'why_choose_us' || section.type === 'delivery_info') {
      return (
        <section key={section.id} style={sectionStyle} className="py-16 px-4 sm:px-6 border-b border-black/5">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                {section.subtitle && (
                  <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                    {section.subtitle}
                  </p>
                )}
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                >
                  {section.title}
                </h2>
                {section.description && <p className="text-sm opacity-75">{section.description}</p>}
              </div>
              {section.ctaLabel && (
                <button
                  type="button"
                  onClick={() => onNavigate(section.ctaLink || 'page:warranty-policy')}
                  className="text-sm font-semibold underline underline-offset-4 whitespace-nowrap self-start sm:self-auto"
                >
                  {section.ctaLabel}
                </button>
              )}
            </div>

            <div
              className={`grid gap-5 ${
                forceMobileView
                  ? 'grid-cols-1'
                  : (section.items || []).length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {(section.items || []).map((item) => {
                const IconComp = ICON_LOOKUP[item.iconName || 'ShieldCheck'] || ShieldCheck;
                return (
                  <div
                    key={item.id}
                    className={`p-5 border border-black/10 space-y-2.5 ${radiusClass}`}
                    style={{ backgroundColor: theme.surfaceColor }}
                  >
                    <div className="flex items-center justify-between">
                      <IconComp className="w-5 h-5 opacity-80" />
                      {item.meta && <span className="text-xs font-mono opacity-60">{item.meta}</span>}
                    </div>
                    <h3
                      className="text-base font-semibold"
                      style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm opacity-75 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === 'customer_reviews') {
      return (
        <section key={section.id} style={sectionStyle} className="py-16 px-4 sm:px-6 border-b border-black/5">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-1.5 max-w-2xl">
              {section.subtitle && (
                <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                  {section.subtitle}
                </p>
              )}
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {section.title}
              </h2>
              {section.description && <p className="text-sm opacity-75">{section.description}</p>}
            </div>

            <div
              className={`grid gap-5 ${
                forceMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {(section.items || []).map((rev) => (
                <div
                  key={rev.id}
                  style={{ backgroundColor: theme.surfaceColor }}
                  className={`p-6 border border-black/10 space-y-3 ${radiusClass}`}
                >
                  <div className="flex items-center gap-1" style={{ color: theme.secondaryColor }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed opacity-85">"{rev.description}"</p>
                  <div className="pt-1 border-t border-black/5">
                    <p className="text-sm font-semibold">{rev.title}</p>
                    {rev.subtitle && <p className="text-xs opacity-65">{rev.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.type === 'contact_section') {
      return (
        <section
          key={section.id}
          id="contact"
          style={sectionStyle}
          className="py-16 px-4 sm:px-6 border-b border-black/5"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-2">
              {section.subtitle && (
                <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                  {section.subtitle}
                </p>
              )}
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {section.title}
              </h2>
              <p className="text-sm opacity-75 leading-relaxed">{section.description}</p>
              {section.ctaLabel && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(section.ctaLink || 'page:contact')}
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    {section.ctaLabel}
                  </button>
                </div>
              )}
            </div>
            <div className="lg:col-span-7">
              <ContactButtonsStrip contact={contact} />
            </div>
          </div>
        </section>
      );
    }

    if (section.type === 'newsletter') {
      return (
        <section key={section.id} style={sectionStyle} className="py-14 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-lg">
              {section.subtitle && (
                <p className="text-xs font-mono uppercase tracking-wider opacity-70">
                  {section.subtitle}
                </p>
              )}
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
              >
                {section.title}
              </h2>
              <p className="text-sm opacity-80">{section.description}</p>
            </div>
            <div className="w-full md:w-auto md:min-w-[340px]">
              {newsletterDone ? (
                <div className="flex items-center gap-2 text-sm font-medium py-3 px-4 rounded-md border border-current/25">
                  <Check className="w-4 h-4" />
                  <span>You are subscribed to drop alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={`flex-1 min-w-0 px-4 py-2.5 text-sm border border-current/25 bg-transparent focus:outline-none ${radiusClass}`}
                  />
                  <button
                    type="submit"
                    style={getBtnStyle(true)}
                    className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 hover:opacity-90 ${radiusClass}`}
                  >
                    {section.ctaLabel || 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      );
    }

    // custom_content (HTML-free structured block)
    const bannerUrl = forceMobileView
      ? section.mobileBanner || section.desktopBanner
      : section.desktopBanner || section.mobileBanner;
    return (
      <section key={section.id} style={sectionStyle} className="py-16 px-4 sm:px-6 border-b border-black/5">
        <div
          className={`max-w-7xl mx-auto grid gap-8 items-center ${
            bannerUrl && !forceMobileView ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          <div className="space-y-3">
            {section.subtitle && (
              <p className="text-xs font-mono uppercase tracking-wider opacity-65">
                {section.subtitle}
              </p>
            )}
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
            >
              {section.title}
            </h2>
            <p className="text-base opacity-80 leading-relaxed whitespace-pre-line">
              {section.description}
            </p>
            {section.ctaLabel && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate(section.ctaLink || 'catalog')}
                  style={getBtnStyle()}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold ${radiusClass}`}
                >
                  <span>{section.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {bannerUrl && (
            <div className="overflow-hidden rounded-md border border-black/10">
              <SafeImage src={bannerUrl} alt={section.title} className="w-full aspect-[16/10] object-cover" />
            </div>
          )}
        </div>
      </section>
    );
  };

  return <>{visibleSections.map((section) => renderSection(section))}</>;
}
