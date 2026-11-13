import { History, RotateCcw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { BOOTSTRAP_ADMIN_EMAIL } from '../../lib/firebase';
import {
  deleteAdminUser,
  publishSiteConfig,
  recordRevision,
  saveCmsPage,
  saveProduct,
  upsertAdminUser,
} from '../../services/cmsService';
import { AdminUser, Revision, SiteConfig } from '../../types/cms';

interface RevisionsAndPermissionsProps {
  revisions: Revision[];
  admins: AdminUser[];
  currentUserEmail: string;
  onRefreshData: () => Promise<void>;
  onRestoreSiteConfig: (config: SiteConfig) => void;
}

export function RevisionsAndPermissions({
  revisions,
  admins,
  currentUserEmail,
  onRefreshData,
  onRestoreSiteConfig,
}: RevisionsAndPermissionsProps) {
  const [tab, setTab] = useState<'revisions' | 'permissions'>('revisions');
  const [filterType, setFilterType] = useState('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // New Admin Form
  const [newUid, setNewUid] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('editor');
  const [savingAdmin, setSavingAdmin] = useState(false);

  const filteredRevs = revisions.filter(
    (r) => filterType === 'all' || r.entityType === filterType
  );

  const handleRestore = async (rev: Revision) => {
    setRestoringId(rev.id);
    setStatusMsg('');
    try {
      if (rev.entityType === 'siteConfig') {
        const snapConfig = rev.snapshot as SiteConfig;
        await publishSiteConfig(snapConfig, `Restored: ${rev.label}`);
        onRestoreSiteConfig(snapConfig);
        setStatusMsg(`Restored site configuration from "${rev.label}".`);
      } else if (rev.entityType === 'product') {
        const snap = rev.snapshot as any;
        const purchasePrice = Number(snap.purchasePrice) || 0;
        const { purchasePrice: _omit, ...payload } = snap;
        await saveProduct(rev.entityId, payload, purchasePrice, 'publish');
        await recordRevision('product', rev.entityId, `Restored: ${rev.label}`, 'restore', snap);
        setStatusMsg(`Restored product "${payload.name || rev.entityId}".`);
      } else if (rev.entityType === 'page') {
        const snap = rev.snapshot as any;
        await saveCmsPage(rev.entityId, snap, 'publish');
        await recordRevision('page', rev.entityId, `Restored: ${rev.label}`, 'restore', snap);
        setStatusMsg(`Restored page "${snap.title || rev.entityId}".`);
      }
      await onRefreshData();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Restore failed.');
    } finally {
      setRestoringId(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid.trim() || !newEmail.trim()) return;
    setSavingAdmin(true);
    try {
      const perms =
        newRole === 'super_admin'
          ? ['all']
          : newRole === 'catalog_manager'
          ? ['products', 'media', 'orders']
          : ['homepage', 'pages', 'media'];
      await upsertAdminUser({
        uid: newUid.trim(),
        email: newEmail.trim(),
        role: newRole,
        permissions: perms,
      });
      setNewUid('');
      setNewEmail('');
      await onRefreshData();
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Revision History &amp; Admin Permissions
          </h2>
          <p className="text-xs text-slate-500">
            Restore any previous saved or published version, and manage CMS administrator roles.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setTab('revisions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded ${
              tab === 'revisions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Revision History ({revisions.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('permissions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded ${
              tab === 'permissions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Permissions
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          {statusMsg}
        </div>
      )}

      {tab === 'revisions' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Changes' },
              { id: 'siteConfig', label: 'Site & Theme' },
              { id: 'product', label: 'Products' },
              { id: 'page', label: 'Pages' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                  filterType === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredRevs.length === 0 ? (
            <div className="p-10 text-center bg-white border border-slate-200 rounded-md text-sm text-slate-500">
              Revisions are automatically recorded every time you click Save Draft or Publish.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-200">
              {filteredRevs.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono uppercase font-semibold text-slate-800">
                        {rev.entityType}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{rev.action.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rev.authorEmail}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{rev.label}</p>
                  </div>

                  <button
                    type="button"
                    disabled={restoringId === rev.id}
                    onClick={() => handleRestore(rev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-100 whitespace-nowrap self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{restoringId === rev.id ? 'Restoring...' : 'Restore This Version'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md divide-y divide-slate-200">
            <div className="p-4 flex items-center justify-between bg-slate-50">
              <div>
                <p className="text-xs font-mono text-slate-500">PRIMARY OWNER (BOOTSTRAP)</p>
                <p className="text-sm font-bold text-slate-900">{BOOTSTRAP_ADMIN_EMAIL}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">super_admin</span>
            </div>

            {admins.map((adm) => (
              <div key={adm.uid} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{adm.email}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    UID: {adm.uid} · Role: {adm.role}
                  </p>
                </div>
                {currentUserEmail === BOOTSTRAP_ADMIN_EMAIL && (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteAdminUser(adm.uid);
                      await onRefreshData();
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Revoke admin access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Authorize Additional CMS Admin</h3>
            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Firebase User UID *
                </label>
                <input
                  type="text"
                  required
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="User UID from Firebase Auth"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Google Account Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="editor@domain.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="super_admin">Super Admin (Full Control)</option>
                  <option value="editor">Content Editor (Pages &amp; Homepage)</option>
                  <option value="catalog_manager">Catalog Manager (Products &amp; Orders)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={savingAdmin}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{savingAdmin ? 'Authorizing...' : 'Grant Admin Access'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
