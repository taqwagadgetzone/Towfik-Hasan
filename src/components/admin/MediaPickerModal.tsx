import { Check, ImagePlus, Search, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { addMediaAsset, compressImageFile } from '../../services/cmsService';
import { MediaAsset } from '../../types/cms';
import { SafeImage } from '../shared/SafeImage';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaLibrary: MediaAsset[];
  onMediaAdded: (asset: MediaAsset) => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  mediaLibrary,
  onMediaAdded,
  onSelect,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const folders = ['all', ...Array.from(new Set(mediaLibrary.map((m) => m.folder)))];
  const filtered = mediaLibrary.filter((m) => {
    const folderOk = folderFilter === 'all' || m.folder === folderFilter;
    const q = search.trim().toLowerCase();
    const textOk =
      !q || m.title.toLowerCase().includes(q) || (m.altText || '').toLowerCase().includes(q);
    return folderOk && textOk;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file, 1280);
      if (dataUrl.length > 780000) {
        setError('Image is too large even after compression. Try a smaller image.');
        setUploading(false);
        return;
      }
      const created = await addMediaAsset({
        title: file.name.replace(/\.[^.]+$/, ''),
        url: dataUrl,
        folder: 'uploads',
        altText: file.name,
        isPublic: true,
      });
      onMediaAdded(created);
      onSelect(created.url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setError('');
    setUploading(true);
    try {
      const created = await addMediaAsset({
        title: customTitle.trim() || 'External Image',
        url: customUrl.trim(),
        folder: 'external',
        altText: customTitle.trim() || 'Storefront asset',
        isPublic: true,
      });
      onMediaAdded(created);
      onSelect(created.url);
      setCustomUrl('');
      setCustomTitle('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image URL.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[88vh] bg-white text-slate-900 rounded-lg border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Media Library &amp; Image Upload</h3>
            <p className="text-xs text-slate-500">
              Select an existing studio asset, upload from your device, or save an image URL.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Close media picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md bg-slate-50 border border-slate-200">
            <label className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-md border border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-sm font-medium">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>{uploading ? 'Processing & Saving...' : 'Upload Image from Device'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <form onSubmit={handleAddUrl} className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://... image URL"
                className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-300 rounded-md bg-white"
              />
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Label"
                className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-md bg-white"
              />
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md whitespace-nowrap"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setFolderFilter(folder)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize ${
                    folderFilter === folder
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter media..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset.url);
                  onClose();
                }}
                className="group text-left border border-slate-200 rounded-md overflow-hidden hover:border-slate-900 transition-colors bg-white"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <SafeImage
                    src={asset.url}
                    alt={asset.altText || asset.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-900 text-xs font-semibold rounded">
                      <Check className="w-3 h-3" /> Select
                    </span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold truncate">{asset.title}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{asset.folder}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
