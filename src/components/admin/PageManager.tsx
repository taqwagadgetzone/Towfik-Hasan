import { Copy, Edit3, Eye, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteCmsPage, saveCmsPage, slugify } from '../../services/cmsService';
import {
  CmsPage,
  CmsPagePayload,
  DescriptionTemplate,
  MediaAsset,
  ThemeSettings,
} from '../../types/cms';
import { createDefaultBlock, VisualDescriptionBuilder } from './VisualDescriptionBuilder';

interface PageManagerProps {
  pages: CmsPage[];
  templates: DescriptionTemplate[];
  mediaLibrary: MediaAsset[];
  theme: ThemeSettings;
  onMediaAdded: (asset: MediaAsset) => void;
  onRefreshData: () => Promise<void>;
  onPreviewPage: (page: CmsPage) => void;
}

export function PageManager({
  pages,
  templates,
  mediaLibrary,
  theme,
  onMediaAdded,
  onRefreshData,
  onPreviewPage,
}: PageManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSystem, setIsSystem] = useState(false);
  const [form, setForm] = useState<CmsPagePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const startNewPage = () => {
    const id = `page-${Date.now()}`;
    setEditingId(id);
    setIsSystem(false);
    setForm({
      title: 'New Custom Page',
      slug: `custom-page-${Date.now().toString().slice(-4)}`,
      seoTitle: '',
      seoDescription: '',
      blocks: [createDefaultBlock('heading_paragraph')],
    });
    setMsg('');
  };

  const openEdit = (page: CmsPage) => {
    const src = page.draftPayload || page;
    setEditingId(page.id);
    setIsSystem(page.isSystemPage);
    setForm({
      title: src.title,
      slug: src.slug,
      seoTitle: src.seoTitle || '',
      seoDescription: src.seoDescription || '',
      blocks: structuredClone(src.blocks || []),
    });
    setMsg('');
  };

  const handleSave = async (mode: 'draft' | 'publish') => {
    if (!editingId || !form) return;
    setSaving(true);
    setMsg('');
    try {
      await saveCmsPage(editingId, form, mode, isSystem);
      await onRefreshData();
      setMsg(mode === 'publish' ? 'Page published live.' : 'Page draft saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (page: CmsPage) => {
    const newId = `page-${Date.now()}`;
    await saveCmsPage(
      newId,
      {
        title: `${page.title} (Copy)`,
        slug: slugify(`${page.slug}-copy-${Date.now().toString().slice(-3)}`),
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        blocks: structuredClone(page.blocks || []),
      },
      'draft',
      false
    );
    await onRefreshData();
  };

  const handleDelete = async (pageId: string) => {
    await deleteCmsPage(pageId);
    await onRefreshData();
    if (editingId === pageId) {
      setEditingId(null);
      setForm(null);
    }
  };

  if (editingId && form) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Back to Pages
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900">{form.title}</h2>
              <p className="text-xs font-mono text-slate-500">/{form.slug}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onPreviewPage({
                  ...form,
                  id: editingId,
                  isSystemPage: isSystem,
                  status: 'draft',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-md"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Page
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-900 text-slate-900 bg-white rounded-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publish')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md"
            >
              <Send className="w-3.5 h-3.5" /> Publish Page
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            {msg}
          </div>
        )}

        <div className="p-5 bg-white border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Page Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">URL Slug *</label>
            <input
              type="text"
              value={form.slug}
              disabled={isSystem}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">SEO Title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              SEO Description
            </label>
            <input
              type="text"
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <VisualDescriptionBuilder
          blocks={form.blocks}
          onChange={(nextBlocks) => setForm({ ...form, blocks: nextBlocks })}
          templates={templates}
          mediaLibrary={mediaLibrary}
          onMediaAdded={onMediaAdded}
          theme={theme}
          showTemplateTools={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pages, Policies &amp; Content CMS</h2>
          <p className="text-xs text-slate-500">
            Create new custom pages, edit About Us, Contact, Warranty &amp; Terms, duplicate, or publish.
          </p>
        </div>
        <button
          type="button"
          onClick={startNewPage}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800"
        >
          <Plus className="w-3.5 h-3.5" /> Create Custom Page
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">Page Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Blocks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {page.title}
                  {page.isSystemPage && (
                    <span className="ml-2 text-[11px] font-normal text-slate-500">· System</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">/{page.slug}</td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {page.blocks?.length || 0} blocks
                </td>
                <td className="px-4 py-3 text-xs capitalize">
                  {page.status}
                  {page.draftPayload ? ' · Unsaved Draft' : ''}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(page)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(page)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                      title="Duplicate Page"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!page.isSystemPage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(page.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
