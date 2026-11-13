export type PublishStatus = 'published' | 'draft';
export type StoreLanguage = 'bn' | 'en';

export type FontChoice =
  | 'Hind Siliguri'
  | 'Plus Jakarta Sans'
  | 'DM Sans'
  | 'Outfit'
  | 'Manrope'
  | 'Bricolage Grotesque'
  | 'Playfair Display'
  | 'Public Sans'
  | 'Lora';

export interface DeliveryZone {
  id: string;
  labelBn: string;
  labelEn: string;
  fee: number;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFont: FontChoice;
  bodyFont: FontChoice;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle: 'solid' | 'outline' | 'soft';
  cardStyle: 'bordered' | 'elevated' | 'flat';
  headerLayout: 'classic' | 'centered' | 'minimal';
  footerLayout: 'columns' | 'minimal' | 'editorial';
}

export interface ContactChannel {
  value: string;
  enabled: boolean;
  label: string;
}

export interface ContactSettings {
  phone: ContactChannel;
  whatsapp: ContactChannel;
  messenger: ContactChannel;
  facebook: ContactChannel;
  instagram: ContactChannel;
  tiktok: ContactChannel;
  youtube: ContactChannel;
  email: ContactChannel;
  address: ContactChannel;
}

export interface NavItem {
  id: string;
  label: string;
  linkType: 'home' | 'catalog' | 'page' | 'section' | 'external';
  target: string;
  visible: boolean;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  linkLabel: string;
  linkTarget: string;
  bgColor: string;
  textColor: string;
}

export interface FooterLink {
  id: string;
  label: string;
  target: string;
}

export interface FooterSettings {
  aboutText: string;
  copyrightText: string;
  showNewsletter: boolean;
  showSocialLinks: boolean;
  quickLinks: FooterLink[];
  policyLinks: FooterLink[];
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export type HomepageSectionType =
  | 'hero_banner'
  | 'featured_categories'
  | 'best_selling'
  | 'new_arrivals'
  | 'promotional_offers'
  | 'featured_products'
  | 'why_choose_us'
  | 'customer_reviews'
  | 'delivery_info'
  | 'contact_section'
  | 'newsletter'
  | 'custom_content';

export interface HeroSlide {
  id: string;
  kicker: string;
  heading: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  ctaLabel: string;
  ctaLink: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  iconName?: string;
  link?: string;
  meta?: string;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  subtitle: string;
  description: string;
  visible: boolean;
  bgColor: string;
  textColor: string;
  desktopBanner: string;
  mobileBanner: string;
  overlayOpacity: number;
  ctaLabel: string;
  ctaLink: string;
  maxProducts?: number;
  slides?: HeroSlide[];
  items?: SectionItem[];
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  currencySymbol: string;
  defaultLanguage?: StoreLanguage;
  deliveryZones?: DeliveryZone[];
  announcement: AnnouncementSettings;
  navigation: NavItem[];
  footer: FooterSettings;
  seo: SeoSettings;
  contact: ContactSettings;
  theme: ThemeSettings;
  homepageSections: HomepageSection[];
  status: PublishStatus;
  updatedAt?: unknown;
}

export type DescriptionBlockType =
  | 'full_width_image'
  | 'two_column_image_text'
  | 'three_column_cards'
  | 'spec_table'
  | 'feature_icon_grid'
  | 'promo_banner'
  | 'video_section'
  | 'image_gallery'
  | 'comparison_table'
  | 'benefits_section'
  | 'faq'
  | 'testimonials'
  | 'warranty_info'
  | 'delivery_info'
  | 'heading_paragraph'
  | 'cta_buttons';

export interface DescriptionBlock {
  id: string;
  type: DescriptionBlockType;
  label: string;
  bgColor: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  imagePosition: 'left' | 'right' | 'top' | 'full';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  paddingY: 'compact' | 'normal' | 'spacious';
  data: Record<string, any>;
}

export interface ProductImage {
  url: string;
  caption: string;
}

export interface ProductSpec {
  group: string;
  label: string;
  value: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariation {
  name: string;
  options: string[];
  priceDelta: number;
}

export interface ProductPayload {
  name: string;
  modelNumber: string;
  slug: string;
  category: string;
  regularPrice: number;
  discountPrice: number | null;
  images: ProductImage[];
  videoUrl: string;
  shortDescription: string;
  fullDescription: string;
  specifications: ProductSpec[];
  features: string[];
  warranty: string;
  deliveryInfo: string;
  stock: number;
  colors: ProductColor[];
  variations: ProductVariation[];
  seoTitle: string;
  seoDescription: string;
  badges: string[];
  relatedProductIds: string[];
  descriptionBlocks: DescriptionBlock[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  viewsCount?: number;
}

export interface Product extends ProductPayload {
  id: string;
  purchasePrice?: number;
  draftPayload?: ProductPayload | null;
  status: PublishStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsPagePayload {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  blocks: DescriptionBlock[];
}

export interface CmsPage extends CmsPagePayload {
  id: string;
  draftPayload?: CmsPagePayload | null;
  isSystemPage: boolean;
  status: PublishStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DescriptionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  blocks: DescriptionBlock[];
  isBuiltIn: boolean;
  isPublic: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  folder: string;
  altText: string;
  isPublic: boolean;
  createdAt?: unknown;
}

export interface Revision {
  id: string;
  entityType: 'siteConfig' | 'product' | 'page' | 'template';
  entityId: string;
  label: string;
  action: 'save_draft' | 'publish' | 'restore';
  snapshot: Record<string, any>;
  authorEmail: string;
  createdAt?: unknown;
}

export interface OrderItem {
  productId: string;
  productName: string;
  modelNumber: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedColor?: string;
  selectedVariation?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Order {
  id: string;
  orderNumber: string;
  customerUid?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes: string;
  deliveryZone?: string;
  deliveryFee?: number;
  subtotal?: number;
  paymentMethod: 'cod' | 'online';
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface IncompleteOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  productName: string;
  totalAmount: number;
  updatedAt?: unknown;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'editor' | 'catalog_manager';
  permissions: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  modelNumber: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedColor?: string;
  selectedVariation?: string;
}
