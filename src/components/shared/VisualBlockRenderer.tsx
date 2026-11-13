import {
  Activity,
  Award,
  BatteryCharging,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  Droplets,
  Globe,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { DescriptionBlock, ThemeSettings } from '../../types/cms';
import { SafeImage } from './SafeImage';

interface VisualBlockRendererProps {
  blocks: DescriptionBlock[];
  theme?: ThemeSettings;
  onAddToCart?: () => void;
  onNavigate?: (target: string) => void;
  isMobilePreview?: boolean;
}

const ICON_MAP: Record<string, typeof ShieldCheck> = {
  BatteryCharging,
  Compass,
  Droplets,
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Globe,
  Award,
  PackageCheck,
  Headphones,
  Truck,
};

function getSafeVideoEmbed(url: string): { type: 'iframe' | 'mp4'; src: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{6,20}$/.test(v)) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${v}` };
      }
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      if (/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` };
      }
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop() || '';
      if (/^\d+$/.test(id)) {
        return { type: 'iframe', src: `https://player.vimeo.com/video/${id}` };
      }
    }
    if (parsed.pathname.endsWith('.mp4') || parsed.pathname.endsWith('.webm')) {
      return { type: 'mp4', src: parsed.toString() };
    }
  } catch {
    return null;
  }
  return null;
}

const PADDING_CLASS: Record<DescriptionBlock['paddingY'], string> = {
  compact: 'py-8 px-5 md:px-10',
  normal: 'py-12 px-6 md:px-12',
  spacious: 'py-16 px-6 md:px-14',
};

const FONT_SIZE_CLASS: Record<DescriptionBlock['fontSize'], { h: string; p: string }> = {
  sm: { h: 'text-xl md:text-2xl', p: 'text-sm' },
  base: { h: 'text-2xl md:text-3xl', p: 'text-base' },
  lg: { h: 'text-2xl md:text-4xl', p: 'text-base md:text-lg' },
  xl: { h: 'text-3xl md:text-4xl', p: 'text-lg' },
};

const ALIGN_CLASS: Record<DescriptionBlock['textAlign'], string> = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
};

export function VisualBlockRenderer({
  blocks,
  theme,
  onAddToCart,
  onNavigate,
  isMobilePreview = false,
}: VisualBlockRendererProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<string | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<Record<string, number>>({});

  if (!blocks || blocks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
        No visual content blocks added yet.
      </div>
    );
  }

  const headingFont = theme?.headingFont || 'Plus Jakarta Sans';
  const bodyFont = theme?.bodyFont || 'DM Sans';
  const btnBg = theme?.buttonBgColor || '#0F172A';
  const btnText = theme?.buttonTextColor || '#FFFFFF';

  const handleLink = (link?: string) => {
    if (!link) return;
    if (link === 'add_to_cart' && onAddToCart) {
      onAddToCart();
      return;
    }
    if (onNavigate) {
      onNavigate(link);
    }
  };

  return (
    <div className="space-y-4" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
      {blocks.map((block) => {
        const pad = PADDING_CLASS[block.paddingY || 'normal'];
        const sizes = FONT_SIZE_CLASS[block.fontSize || 'base'];
        const align = ALIGN_CLASS[block.textAlign || 'left'];
        const d = block.data || {};
        const blockStyle = {
          backgroundColor: block.bgColor || '#FFFFFF',
          color: block.textColor || '#0F172A',
        };

        return (
          <section
            key={block.id}
            style={blockStyle}
            className={`${pad} rounded-lg border border-black/5 overflow-hidden`}
          >
            {block.type === 'full_width_image' && (
              <div className="space-y-6">
                {(d.heading || d.subheading) && (
                  <div className={`max-w-3xl space-y-2 ${align}`}>
                    {d.caption && (
                      <p className="text-xs font-medium tracking-wider opacity-70">{d.caption}</p>
                    )}
                    {d.heading && (
                      <h3
                        className={`${sizes.h} font-bold tracking-tight`}
                        style={{ fontFamily: `"${headingFont}", sans-serif` }}
                      >
                        {d.heading}
                      </h3>
                    )}
                    {d.subheading && (
                      <p className={`${sizes.p} opacity-80 leading-relaxed`}>{d.subheading}</p>
                    )}
                  </div>
                )}
                {d.imageUrl && (
                  <div className="w-full overflow-hidden rounded-md">
                    <SafeImage
                      src={d.imageUrl}
                      alt={d.heading || d.caption || block.label}
                      className="w-full max-h-[520px] object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {block.type === 'two_column_image_text' && (
              <div
                className={`grid gap-8 items-center ${
                  isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                <div className={block.imagePosition === 'right' && !isMobilePreview ? 'md:order-2' : ''}>
                  <SafeImage
                    src={d.imageUrl}
                    alt={d.heading || block.label}
                    className="w-full aspect-[4/3] object-cover rounded-md"
                  />
                </div>
                <div className={`space-y-4 ${align}`}>
                  {d.heading && (
                    <h3
                      className={`${sizes.h} font-bold tracking-tight`}
                      style={{ fontFamily: `"${headingFont}", sans-serif` }}
                    >
                      {d.heading}
                    </h3>
                  )}
                  {d.body && <p className={`${sizes.p} opacity-85 leading-relaxed`}>{d.body}</p>}
                  {Array.isArray(d.bulletPoints) && d.bulletPoints.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {d.bulletPoints.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm opacity-90">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {block.type === 'three_column_cards' && (
              <div className="space-y-6">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div
                  className={`grid gap-5 ${
                    isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                  }`}
                >
                  {(d.cards || []).map((card: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-md border border-current/15 bg-current/[0.02] space-y-2"
                    >
                      {card.meta && (
                        <p className="text-xs font-mono opacity-65">{card.meta}</p>
                      )}
                      <h4
                        className="text-base font-semibold"
                        style={{ fontFamily: `"${headingFont}", sans-serif` }}
                      >
                        {card.title}
                      </h4>
                      <p className="text-sm opacity-80 leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {block.type === 'spec_table' && (
              <div className="space-y-5">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div className="divide-y divide-current/10 border border-current/15 rounded-md overflow-hidden">
                  {(d.rows || []).map((row: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-3 px-4 py-3 text-sm gap-2"
                    >
                      <span className="font-medium opacity-70">{row.label}</span>
                      <span className="sm:col-span-2 font-mono tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {block.type === 'feature_icon_grid' && (
              <div className="space-y-6">
                <div className={`max-w-2xl space-y-2 ${align}`}>
                  {d.heading && (
                    <h3
                      className={`${sizes.h} font-bold tracking-tight`}
                      style={{ fontFamily: `"${headingFont}", sans-serif` }}
                    >
                      {d.heading}
                    </h3>
                  )}
                  {d.subheading && <p className={`${sizes.p} opacity-80`}>{d.subheading}</p>}
                </div>
                <div
                  className={`grid gap-5 ${
                    isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  }`}
                >
                  {(d.items || []).map((item: any, idx: number) => {
                    const IconComp = ICON_MAP[item.icon] || ShieldCheck;
                    return (
                      <div key={idx} className="p-4 rounded-md border border-current/12 space-y-2.5">
                        <IconComp className="w-5 h-5 opacity-80" />
                        <h4
                          className="text-base font-semibold"
                          style={{ fontFamily: `"${headingFont}", sans-serif` }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm opacity-75 leading-relaxed">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {block.type === 'promo_banner' && (
              <div className={`space-y-4 max-w-3xl ${align}`}>
                {d.kicker && (
                  <p className="text-xs font-mono tracking-wide opacity-75">{d.kicker}</p>
                )}
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                {d.description && <p className={`${sizes.p} opacity-85`}>{d.description}</p>}
                {d.ctaLabel && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLink(d.ctaAction || 'add_to_cart')}
                      style={{ backgroundColor: btnBg, color: btnText }}
                      className="px-6 py-2.5 text-sm font-semibold rounded-md transition-opacity hover:opacity-90 whitespace-nowrap"
                    >
                      {d.ctaLabel}
                    </button>
                  </div>
                )}
              </div>
            )}

            {block.type === 'video_section' && (
              <div className="space-y-4">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                {(() => {
                  const embed = getSafeVideoEmbed(d.videoUrl || '');
                  if (!embed) {
                    return (
                      <div className="p-8 border border-dashed border-current/20 rounded-md text-center text-sm opacity-75">
                        Enter a valid YouTube, Vimeo, or MP4 HTTPS video URL in the block settings.
                      </div>
                    );
                  }
                  if (embed.type === 'mp4') {
                    return (
                      <video
                        controls
                        src={embed.src}
                        className="w-full rounded-md max-h-[480px] bg-black"
                      />
                    );
                  }
                  return (
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                      <iframe
                        src={embed.src}
                        title={d.heading || 'Product Video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {block.type === 'image_gallery' && (
              <div className="space-y-5">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                {Array.isArray(d.images) && d.images.length > 0 && (
                  <div className="space-y-3">
                    {(() => {
                      const activeIdx = activeGalleryImage[block.id] ?? 0;
                      const current = d.images[activeIdx] || d.images[0];
                      return (
                        <>
                          <div className="overflow-hidden rounded-md border border-current/10">
                            <SafeImage
                              src={current.url}
                              alt={current.caption || d.heading || 'Gallery image'}
                              className="w-full aspect-[16/9] object-cover"
                            />
                            {current.caption && (
                              <p className="px-4 py-2 text-xs opacity-75 border-t border-current/10">
                                {current.caption}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {d.images.map((img: any, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setActiveGalleryImage((prev) => ({ ...prev, [block.id]: idx }))
                                }
                                className={`overflow-hidden rounded-md border transition-all ${
                                  idx === activeIdx
                                    ? 'border-current ring-1 ring-current'
                                    : 'border-current/15 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <SafeImage
                                  src={img.url}
                                  alt={img.caption || `Thumbnail ${idx + 1}`}
                                  className="w-full aspect-[4/3] object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {block.type === 'comparison_table' && (
              <div className="space-y-5">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div className="overflow-x-auto border border-current/15 rounded-md">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-current/15 bg-current/[0.04]">
                        {(d.columns || ['Feature', 'This Model', 'Standard']).map(
                          (col: string, idx: number) => (
                            <th key={idx} className="px-4 py-3 font-semibold">
                              {col}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-current/10">
                      {(d.rows || []).map((row: string[], rIdx: number) => (
                        <tr key={rIdx}>
                          {row.map((cell: string, cIdx: number) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-3 ${cIdx === 0 ? 'font-medium opacity-80' : 'font-mono tabular-nums'}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {block.type === 'benefits_section' && (
              <div className="space-y-4">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div className="grid gap-3">
                  {(d.items || []).map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-md border border-current/12"
                    >
                      <Check className="w-4 h-4 mt-0.5 shrink-0 opacity-85" />
                      <span className={sizes.p}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {block.type === 'faq' && (
              <div className="space-y-4">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div className="divide-y divide-current/12 border border-current/15 rounded-md">
                  {(d.items || []).map((item: any, idx: number) => {
                    const key = `${block.id}-${idx}`;
                    const isOpen = openFaqIdx === key;
                    return (
                      <div key={idx}>
                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? null : key)}
                          className="w-full flex items-center justify-between px-4 py-3.5 text-left font-medium text-sm md:text-base"
                        >
                          <span>{item.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-sm opacity-80 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {block.type === 'testimonials' && (
              <div className="space-y-5">
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight ${align}`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                <div
                  className={`grid gap-5 ${
                    isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                  }`}
                >
                  {(d.reviews || []).map((rev: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-md border border-current/12 space-y-3"
                    >
                      <div className="flex items-center gap-1 opacity-85">
                        {Array.from({ length: Number(rev.rating) || 5 }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed opacity-90">"{rev.quote}"</p>
                      <div className="text-xs opacity-70">
                        <span className="font-semibold">{rev.author}</span>
                        {rev.role ? ` · ${rev.role}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {block.type === 'warranty_info' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-md border border-current/15">
                <ShieldCheck className="w-9 h-9 shrink-0 opacity-85" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono opacity-70">
                    <span>OFFICIAL WARRANTY</span>
                    {d.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{d.duration}</span>
                      </>
                    )}
                  </div>
                  <h4
                    className="text-lg font-bold"
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h4>
                  <p className="text-sm opacity-80 leading-relaxed">{d.details}</p>
                </div>
              </div>
            )}

            {block.type === 'delivery_info' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 opacity-85" />
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                </div>
                <div
                  className={`grid gap-4 ${
                    isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {d.standardWindow && (
                    <div className="p-4 rounded-md border border-current/15">
                      <p className="text-xs opacity-70">Metro Express</p>
                      <p className="text-sm font-semibold mt-1">{d.standardWindow}</p>
                    </div>
                  )}
                  {d.nationwideWindow && (
                    <div className="p-4 rounded-md border border-current/15">
                      <p className="text-xs opacity-70">Nationwide Dispatch</p>
                      <p className="text-sm font-semibold mt-1">{d.nationwideWindow}</p>
                    </div>
                  )}
                </div>
                {d.details && <p className="text-sm opacity-80">{d.details}</p>}
              </div>
            )}

            {block.type === 'heading_paragraph' && (
              <div className={`max-w-3xl space-y-3 ${align}`}>
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                {d.paragraph && (
                  <p className={`${sizes.p} opacity-85 leading-relaxed whitespace-pre-line`}>
                    {d.paragraph}
                  </p>
                )}
              </div>
            )}

            {block.type === 'cta_buttons' && (
              <div className={`max-w-2xl space-y-4 ${align}`}>
                {d.heading && (
                  <h3
                    className={`${sizes.h} font-bold tracking-tight`}
                    style={{ fontFamily: `"${headingFont}", sans-serif` }}
                  >
                    {d.heading}
                  </h3>
                )}
                {d.description && <p className={`${sizes.p} opacity-80`}>{d.description}</p>}
                <div
                  className={`flex flex-wrap gap-3 pt-1 ${
                    block.textAlign === 'center'
                      ? 'justify-center'
                      : block.textAlign === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {d.primaryLabel && (
                    <button
                      type="button"
                      onClick={() => handleLink(d.primaryAction || 'add_to_cart')}
                      style={{ backgroundColor: btnBg, color: btnText }}
                      className="px-6 py-2.5 text-sm font-semibold rounded-md transition-opacity hover:opacity-90 whitespace-nowrap"
                    >
                      {d.primaryLabel}
                    </button>
                  )}
                  {d.secondaryLabel && (
                    <button
                      type="button"
                      onClick={() => handleLink(d.secondaryLink || '#contact')}
                      className="px-6 py-2.5 text-sm font-semibold rounded-md border border-current/30 hover:bg-current/5 transition-colors whitespace-nowrap"
                    >
                      {d.secondaryLabel}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
