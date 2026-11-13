import { Eye, Image as ImageIcon, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_DELIVERY_ZONES } from '../../data/seedData';
import { ContactSettings, DeliveryZone, MediaAsset, NavItem, SiteConfig, StoreLanguage } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';
import { MediaPickerModal } from './MediaPickerModal';

interface GlobalContactSeoEditorProps {
  draftConfig: SiteConfig;
  mediaLibrary: MediaAsset[];
  onMediaAdded: (asset: MediaAsset) => void;
  onChangeDraft: (next: SiteConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onOpenPreview: () => void;
  saving: boolean;
}

export function GlobalContactSeoEditor({
  draftConfig,
  mediaLibrary,
  onMediaAdded,
  onChangeDraft,
  onSaveDraft,
  onPublish,
  onOpenPreview,
  saving,
}: GlobalContactSeoEditorProps) {
  const [subTab, setSubTab] = useState<'brand' | 'nav_footer' | 'contact' | 'seo'>('brand');
  const [mediaTarget, setMediaTarget] = useState<'logoUrl' | 'faviconUrl' | 'ogImage' | null>(null);

  const contactKeys: { key: keyof ContactSettings; title: string; placeholder: string }[] = [
    { key: 'phone', title: 'Phone Number', placeholder: '+880 1700-000000' },
    { key: 'whatsapp', title: 'WhatsApp Number', placeholder: '+8801700000000' },
    { key: 'messenger', title: 'Messenger Link', placeholder: 'https://m.me/taqwagadgetzone' },
    { key: 'facebook', title: 'Facebook Page URL', placeholder: 'https://facebook.com/taqwagadgetzone' },
    { key: 'instagram', title: 'Instagram URL', placeholder: 'https://instagram.com/taqwagadgetzone' },
    { key: 'tiktok', title: 'TikTok URL', placeholder: 'https://tiktok.com/@taqwagadgetzone' },
    { key: 'youtube', title: 'YouTube Channel URL', placeholder: 'https://youtube.com/@taqwagadgetzone' },
    { key: 'email', title: 'Email Address', placeholder: 'taqwagadgetzone@gmail.com' },
    { key: 'address', title: 'Business Address', placeholder: 'Level 4, Suite 412, Multiplan Tech Plaza' },
  ];

  const updateNavItem = (idx: number, patch: Partial<NavItem>) => {
    const next = [...draftConfig.navigation];
    next[idx] = { ...next[idx], ...patch };
    onChangeDraft({ ...draftConfig, navigation: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Global Settings, Navigation, Contact &amp; SEO
          </h2>
          <p className="text-xs text-slate-500">
            Control site identity, logo, favicon, announcement bar, menu links, footer, social channels, and SEO metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-md hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Live
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Publish Settings
          </button>
        </div>
      </div>

      <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-md gap-1">
        {[
          { id: 'brand', label: 'Brand, Logo, Favicon & Announcement' },
          { id: 'nav_footer', label: 'Header Menu & Footer' },
          { id: 'contact', label: 'Contact & Social Buttons' },
          { id: 'seo', label: 'Global SEO & OpenGraph' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded ${
              subTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Website Identity</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Website Name</label>
              <input
                type="text"
                value={draftConfig.siteName}
                onChange={(e) => onChangeDraft({ ...draftConfig, siteName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={draftConfig.tagline}
                onChange={(e) => onChangeDraft({ ...draftConfig, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <select
                  value={draftConfig.currencySymbol}
                  onChange={(e) => onChangeDraft({ ...draftConfig, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                >
                  <option value="৳">৳ (BDT)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="AED ">AED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default Storefront Language
                </label>
                <select
                  value={draftConfig.defaultLanguage || 'bn'}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      defaultLanguage: e.target.value as StoreLanguage,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Logo Image (Optional — wordmark renders if blank)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draftConfig.logoUrl}
                  onChange={(e) => onChangeDraft({ ...draftConfig, logoUrl: e.target.value })}
                  placeholder="Logo image URL"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('logoUrl')}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Pick
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Favicon URL (Updates Browser Tab Icon)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draftConfig.faviconUrl}
                  onChange={(e) => onChangeDraft({ ...draftConfig, faviconUrl: e.target.value })}
                  placeholder="Favicon image URL"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setMediaTarget('faviconUrl')}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Pick
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Promotional Announcement Bar</h3>
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={draftConfig.announcement.enabled}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      announcement: { ...draftConfig.announcement, enabled: e.target.checked },
                    })
                  }
                />
                <span>Enabled</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={draftConfig.announcement.text}
                onChange={(e) =>
                  onChangeDraft({
                    ...draftConfig,
                    announcement: { ...draftConfig.announcement, text: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Link Label</label>
                <input
                  type="text"
                  value={draftConfig.announcement.linkLabel}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      announcement: { ...draftConfig.announcement, linkLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Link Target</label>
                <input
                  type="text"
                  value={draftConfig.announcement.linkTarget}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      announcement: { ...draftConfig.announcement, linkTarget: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bar Color</label>
                <input
                  type="color"
                  value={draftConfig.announcement.bgColor}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      announcement: { ...draftConfig.announcement, bgColor: e.target.value },
                    })
                  }
                  className="w-full h-9 p-1 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Text Color</label>
                <input
                  type="color"
                  value={draftConfig.announcement.textColor}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      announcement: { ...draftConfig.announcement, textColor: e.target.value },
                    })
                  }
                  className="w-full h-9 p-1 border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Delivery Zones Editor */}
          <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Zones &amp; Shipping Charges
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed on every product COD checkout form and shopping bag drawer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current =
                    draftConfig.deliveryZones && draftConfig.deliveryZones.length > 0
                      ? draftConfig.deliveryZones
                      : DEFAULT_DELIVERY_ZONES;
                  const nextZone: DeliveryZone = {
                    id: `zone-${Date.now()}`,
                    labelBn: 'নতুন ডেলিভারি এলাকা',
                    labelEn: 'New Delivery Zone',
                    fee: 100,
                  };
                  onChangeDraft({ ...draftConfig, deliveryZones: [...current, nextZone] });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add Zone
              </button>
            </div>

            <div className="space-y-2.5">
              {(draftConfig.deliveryZones && draftConfig.deliveryZones.length > 0
                ? draftConfig.deliveryZones
                : DEFAULT_DELIVERY_ZONES
              ).map((zone, idx, arr) => (
                <div
                  key={zone.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 border border-slate-200 rounded-md"
                >
                  <input
                    type="text"
                    value={zone.labelBn}
                    onChange={(e) => {
                      const next = [...arr];
                      next[idx] = { ...zone, labelBn: e.target.value };
                      onChangeDraft({ ...draftConfig, deliveryZones: next });
                    }}
                    placeholder="বাংলা নাম (যেমন: ঢাকা সিটির ভিতরে)"
                    className="col-span-5 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    value={zone.labelEn}
                    onChange={(e) => {
                      const next = [...arr];
                      next[idx] = { ...zone, labelEn: e.target.value };
                      onChangeDraft({ ...draftConfig, deliveryZones: next });
                    }}
                    placeholder="English Label"
                    className="col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                  <input
                    type="number"
                    min={0}
                    value={zone.fee}
                    onChange={(e) => {
                      const next = [...arr];
                      next[idx] = { ...zone, fee: Math.max(0, Number(e.target.value) || 0) };
                      onChangeDraft({ ...draftConfig, deliveryZones: next });
                    }}
                    placeholder="Fee"
                    className="col-span-2 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded"
                  />
                  <button
                    type="button"
                    disabled={arr.length <= 1}
                    onClick={() => {
                      const next = [...arr];
                      next.splice(idx, 1);
                      onChangeDraft({ ...draftConfig, deliveryZones: next });
                    }}
                    className="col-span-1 text-red-600 disabled:opacity-30 flex justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'nav_footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Header Navigation Menu</h3>
              <button
                type="button"
                onClick={() =>
                  onChangeDraft({
                    ...draftConfig,
                    navigation: [
                      ...draftConfig.navigation,
                      {
                        id: `nav-${Date.now()}`,
                        label: 'New Link',
                        linkType: 'page',
                        target: 'about-us',
                        visible: true,
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>
            <div className="space-y-2.5">
              {draftConfig.navigation.map((item, idx) => (
                <div key={item.id} className="p-3 border border-slate-200 rounded-md space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateNavItem(idx, { label: e.target.value })}
                      placeholder="Label"
                      className="col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <select
                      value={item.linkType}
                      onChange={(e) =>
                        updateNavItem(idx, { linkType: e.target.value as NavItem['linkType'] })
                      }
                      className="col-span-3 px-2 py-1.5 text-xs border border-slate-300 rounded"
                    >
                      <option value="home">Home</option>
                      <option value="catalog">Catalog</option>
                      <option value="page">CMS Page</option>
                      <option value="section">Section</option>
                      <option value="external">External URL</option>
                    </select>
                    <input
                      type="text"
                      value={item.target}
                      onChange={(e) => updateNavItem(idx, { target: e.target.value })}
                      placeholder="Target slug or URL"
                      className="col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...draftConfig.navigation];
                        next.splice(idx, 1);
                        onChangeDraft({ ...draftConfig, navigation: next });
                      }}
                      className="col-span-1 text-red-600 flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) => updateNavItem(idx, { visible: e.target.checked })}
                    />
                    <span>Show in top navigation</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Footer Configuration</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Footer About Summary
              </label>
              <textarea
                rows={3}
                value={draftConfig.footer.aboutText}
                onChange={(e) =>
                  onChangeDraft({
                    ...draftConfig,
                    footer: { ...draftConfig.footer, aboutText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                value={draftConfig.footer.copyrightText}
                onChange={(e) =>
                  onChangeDraft({
                    ...draftConfig,
                    footer: { ...draftConfig.footer, copyrightText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
              />
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={draftConfig.footer.showNewsletter}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      footer: { ...draftConfig.footer, showNewsletter: e.target.checked },
                    })
                  }
                />
                <span>Show Newsletter Box</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={draftConfig.footer.showSocialLinks}
                  onChange={(e) =>
                    onChangeDraft({
                      ...draftConfig,
                      footer: { ...draftConfig.footer, showSocialLinks: e.target.checked },
                    })
                  }
                />
                <span>Show Social Buttons</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {subTab === 'contact' && (
        <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Contact &amp; Social Media Channels
            </h3>
            <p className="text-xs text-slate-500">
              Edit each number or link and toggle individual buttons on or off across the storefront.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactKeys.map(({ key, title, placeholder }) => {
              const ch = draftConfig.contact[key];
              return (
                <div
                  key={key}
                  className={`p-4 border rounded-md space-y-2.5 ${
                    ch.enabled ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{title}</span>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={ch.enabled}
                        onChange={(e) =>
                          onChangeDraft({
                            ...draftConfig,
                            contact: {
                              ...draftConfig.contact,
                              [key]: { ...ch, enabled: e.target.checked },
                            },
                          })
                        }
                      />
                      <span>{ch.enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={ch.label}
                    onChange={(e) =>
                      onChangeDraft({
                        ...draftConfig,
                        contact: {
                          ...draftConfig.contact,
                          [key]: { ...ch, label: e.target.value },
                        },
                      })
                    }
                    placeholder="Button Label"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    value={ch.value}
                    onChange={(e) =>
                      onChangeDraft({
                        ...draftConfig,
                        contact: {
                          ...draftConfig.contact,
                          [key]: { ...ch, value: e.target.value },
                        },
                      })
                    }
                    placeholder={placeholder}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'seo' && (
        <div className="p-5 bg-white border border-slate-200 rounded-md space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900">Global Search Engine &amp; Social Meta</h3>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Default Meta Title
            </label>
            <input
              type="text"
              value={draftConfig.seo.metaTitle}
              onChange={(e) =>
                onChangeDraft({
                  ...draftConfig,
                  seo: { ...draftConfig.seo, metaTitle: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Default Meta Description
            </label>
            <textarea
              rows={3}
              value={draftConfig.seo.metaDescription}
              onChange={(e) =>
                onChangeDraft({
                  ...draftConfig,
                  seo: { ...draftConfig.seo, metaDescription: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">OpenGraph Title</label>
            <input
              type="text"
              value={draftConfig.seo.ogTitle}
              onChange={(e) =>
                onChangeDraft({
                  ...draftConfig,
                  seo: { ...draftConfig.seo, ogTitle: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              OpenGraph Description
            </label>
            <textarea
              rows={2}
              value={draftConfig.seo.ogDescription}
              onChange={(e) =>
                onChangeDraft({
                  ...draftConfig,
                  seo: { ...draftConfig.seo, ogDescription: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Social Share OG Image
            </label>
            <div className="flex items-center gap-3">
              {draftConfig.seo.ogImage && (
                <SafeImage
                  src={draftConfig.seo.ogImage}
                  alt="OG Share Preview"
                  className="w-24 h-14 object-cover rounded border border-slate-200"
                />
              )}
              <input
                type="text"
                value={draftConfig.seo.ogImage}
                onChange={(e) =>
                  onChangeDraft({
                    ...draftConfig,
                    seo: { ...draftConfig.seo, ogImage: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => setMediaTarget('ogImage')}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md"
              >
                Pick
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        mediaLibrary={mediaLibrary}
        onMediaAdded={onMediaAdded}
        onSelect={(url) => {
          if (mediaTarget === 'logoUrl') {
            onChangeDraft({ ...draftConfig, logoUrl: url });
          } else if (mediaTarget === 'faviconUrl') {
            onChangeDraft({ ...draftConfig, faviconUrl: url });
          } else if (mediaTarget === 'ogImage') {
            onChangeDraft({
              ...draftConfig,
              seo: { ...draftConfig.seo, ogImage: url },
            });
          }
        }}
      />
    </div>
  );
}
