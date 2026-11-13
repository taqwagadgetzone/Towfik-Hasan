import { ShoppingBag, Zap } from 'lucide-react';
import { Product, StoreLanguage, ThemeSettings } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface ProductCardProps {
  product: Product;
  currency: string;
  theme: ThemeSettings;
  lang?: StoreLanguage;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({
  product,
  currency,
  theme,
  lang = 'bn',
  onSelectProduct,
  onQuickAdd,
}: ProductCardProps) {
  const effectivePrice =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.regularPrice
      ? product.discountPrice
      : product.regularPrice;

  const hasDiscount = effectivePrice < product.regularPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.regularPrice - effectivePrice) / product.regularPrice) * 100)
    : 0;
  const savings = hasDiscount ? product.regularPrice - effectivePrice : 0;

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

  const isDarkSurface =
    theme.surfaceColor.toLowerCase().startsWith('#0') ||
    theme.surfaceColor.toLowerCase().startsWith('#1');

  const cardSurfaceClass =
    theme.cardStyle === 'elevated'
      ? 'shadow-sm hover:shadow-md border border-black/10'
      : theme.cardStyle === 'flat'
      ? 'border border-transparent hover:border-current/15'
      : isDarkSurface
      ? 'border border-white/10 hover:border-emerald-500/40'
      : 'border border-slate-200 hover:border-emerald-600/40';

  const buttonStyle =
    theme.buttonStyle === 'outline'
      ? {
          backgroundColor: 'transparent',
          color: theme.buttonBgColor,
          border: `1px solid ${theme.buttonBgColor}`,
        }
      : theme.buttonStyle === 'soft'
      ? {
          backgroundColor: `${theme.buttonBgColor}18`,
          color: theme.buttonBgColor,
        }
      : {
          backgroundColor: theme.buttonBgColor,
          color: theme.buttonTextColor,
        };

  return (
    <article
      style={{ backgroundColor: theme.surfaceColor, color: theme.textColor }}
      className={`group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${radiusClass} ${cardSurfaceClass}`}
    >
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="relative block w-full aspect-[4/3] overflow-hidden bg-slate-100 text-left"
      >
        <SafeImage
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {hasDiscount && discountPct > 0 && (
          <span
            style={{ backgroundColor: theme.secondaryColor }}
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-bold text-white font-mono tabular-nums"
          >
            {discountPct}% OFF
          </span>
        )}
      </button>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] opacity-65">
            <span className="uppercase tracking-wider">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{product.modelNumber}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="text-left block w-full"
          >
            <h3
              className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity"
              style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
            >
              {product.name}
            </h3>
          </button>

          <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-current/10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-lg font-bold" style={{ color: theme.secondaryColor }}>
                {currency}
                {effectivePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through opacity-50">
                  {currency}
                  {product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[11px] font-semibold text-emerald-600">
                {lang === 'bn' ? `সাশ্রয় ${currency}${savings.toLocaleString()}` : `Save ${currency}${savings.toLocaleString()}`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => onSelectProduct(product)}
              style={buttonStyle}
              className={`col-span-3 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 whitespace-nowrap ${radiusClass}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {product.stock > 0
                  ? lang === 'bn'
                    ? 'অর্ডার করুন'
                    : 'Quick Order'
                  : lang === 'bn'
                  ? 'স্টক শেষ'
                  : 'Out of Stock'}
              </span>
            </button>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => onQuickAdd(product)}
              className={`col-span-2 inline-flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold border border-current/20 hover:bg-current/5 disabled:opacity-40 whitespace-nowrap ${radiusClass}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্যাগ' : 'Bag'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
