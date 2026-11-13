import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  INITIAL_CMS_PAGES,
  INITIAL_MEDIA_ASSETS,
  INITIAL_PRODUCTS,
  INITIAL_SITE_CONFIG,
  INITIAL_TEMPLATES,
} from '../data/seedData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AdminUser,
  CmsPage,
  CmsPagePayload,
  DescriptionBlock,
  DescriptionTemplate,
  IncompleteOrder,
  MediaAsset,
  Order,
  OrderStatus,
  Product,
  ProductPayload,
  Revision,
  SiteConfig,
} from '../types/cms';

export function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || `item-${Date.now()}`;
}

export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

export async function initializeDatabaseIfEmpty(): Promise<boolean> {
  const publishedRef = doc(db, 'siteConfig', 'published');
  let snap;
  try {
    snap = await getDoc(publishedRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'siteConfig/published');
  }

  if (snap.exists()) {
    return false;
  }

  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();

    batch.set(
      doc(db, 'siteConfig', 'published'),
      stripUndefined({
        ...INITIAL_SITE_CONFIG,
        status: 'published',
        updatedAt: now,
      })
    );
    batch.set(
      doc(db, 'siteConfig', 'draft'),
      stripUndefined({
        ...INITIAL_SITE_CONFIG,
        status: 'draft',
        updatedAt: now,
      })
    );

    for (const product of INITIAL_PRODUCTS) {
      const { id, purchasePrice, ...rest } = product;
      batch.set(
        doc(db, 'products', id),
        stripUndefined({
          ...rest,
          createdAt: now,
          updatedAt: now,
        })
      );
      if (typeof purchasePrice === 'number') {
        batch.set(doc(db, 'productSecrets', id), {
          productId: id,
          purchasePrice,
          updatedAt: now,
        });
      }
    }

    for (const page of INITIAL_CMS_PAGES) {
      const { id, ...rest } = page;
      batch.set(
        doc(db, 'pages', id),
        stripUndefined({
          ...rest,
          createdAt: now,
          updatedAt: now,
        })
      );
    }

    for (const tpl of INITIAL_TEMPLATES) {
      const { id, ...rest } = tpl;
      batch.set(
        doc(db, 'descriptionTemplates', id),
        stripUndefined({
          ...rest,
          createdAt: now,
          updatedAt: now,
        })
      );
    }

    for (const media of INITIAL_MEDIA_ASSETS) {
      const { id, ...rest } = media;
      batch.set(
        doc(db, 'mediaLibrary', id),
        stripUndefined({
          ...rest,
          createdAt: now,
        })
      );
    }

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch-seed');
  }
}

export async function fetchPublishedSiteConfig(): Promise<SiteConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'published'));
    return snap.exists() ? (snap.data() as SiteConfig) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'siteConfig/published');
  }
}

export async function fetchDraftSiteConfig(): Promise<SiteConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'draft'));
    return snap.exists() ? (snap.data() as SiteConfig) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'siteConfig/draft');
  }
}

export async function saveSiteConfigDraft(config: SiteConfig, label = 'Saved site draft'): Promise<void> {
  const payload = stripUndefined({
    ...config,
    status: 'draft' as const,
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'siteConfig', 'draft'), payload);
    await recordRevision('siteConfig', 'siteConfig', label, 'save_draft', stripUndefined({ ...config, status: 'draft' }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteConfig/draft');
  }
}

export async function publishSiteConfig(config: SiteConfig, label = 'Published site updates'): Promise<void> {
  const now = serverTimestamp();
  try {
    const batch = writeBatch(db);
    batch.set(
      doc(db, 'siteConfig', 'published'),
      stripUndefined({
        ...config,
        status: 'published',
        updatedAt: now,
      })
    );
    batch.set(
      doc(db, 'siteConfig', 'draft'),
      stripUndefined({
        ...config,
        status: 'draft',
        updatedAt: now,
      })
    );
    await batch.commit();
    await recordRevision('siteConfig', 'siteConfig', label, 'publish', stripUndefined({ ...config, status: 'published' }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteConfig/published');
  }
}

export async function fetchProducts(includeDrafts: boolean): Promise<Product[]> {
  try {
    const colRef = collection(db, 'products');
    const q = includeDrafts ? query(colRef) : query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
    if (includeDrafts) {
      try {
        const secretsSnap = await getDocs(collection(db, 'productSecrets'));
        const costMap = new Map<string, number>();
        secretsSnap.docs.forEach((s) => {
          const data = s.data() as { productId?: string; purchasePrice?: number };
          if (typeof data.purchasePrice === 'number') {
            costMap.set(s.id, data.purchasePrice);
          }
        });
        return list.map((p) => ({
          ...p,
          purchasePrice: costMap.get(p.id) ?? 0,
        }));
      } catch {
        return list;
      }
    }
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
}

export async function saveProduct(
  productId: string,
  payload: ProductPayload,
  purchasePrice: number,
  mode: 'draft' | 'publish',
  existingCreatedAt?: unknown
): Promise<void> {
  const cleanSlug = slugify(payload.slug || payload.name);
  const cleanPayload: ProductPayload = stripUndefined({
    ...payload,
    slug: cleanSlug,
  });

  try {
    const docRef = doc(db, 'products', productId);
    const existingSnap = await getDoc(docRef);
    const now = serverTimestamp();

    if (mode === 'publish') {
      const docData = stripUndefined({
        ...cleanPayload,
        draftPayload: null,
        status: 'published',
        createdAt: existingSnap.exists() ? existingCreatedAt || existingSnap.data().createdAt : now,
        updatedAt: now,
      });
      await setDoc(docRef, docData);
    } else {
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        const docData = stripUndefined({
          ...existingData,
          draftPayload: cleanPayload,
          updatedAt: now,
        });
        await setDoc(docRef, docData);
      } else {
        const docData = stripUndefined({
          ...cleanPayload,
          draftPayload: cleanPayload,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        });
        await setDoc(docRef, docData);
      }
    }

    await setDoc(doc(db, 'productSecrets', productId), {
      productId,
      purchasePrice: Number(purchasePrice) || 0,
      updatedAt: now,
    });

    await recordRevision(
      'product',
      productId,
      `${mode === 'publish' ? 'Published' : 'Saved draft'}: ${cleanPayload.name}`,
      mode === 'publish' ? 'publish' : 'save_draft',
      { ...cleanPayload, purchasePrice: Number(purchasePrice) || 0 }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
  }
}

export async function deleteProductById(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
    try {
      await deleteDoc(doc(db, 'productSecrets', productId));
    } catch {
      // Ignore if secret doc did not exist
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

export async function applyTemplateToMultipleProducts(
  productIds: string[],
  blocks: DescriptionBlock[],
  allProducts: Product[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();
    for (const pid of productIds) {
      const target = allProducts.find((p) => p.id === pid);
      if (!target) continue;
      const clonedBlocks = blocks.map((b, idx) => ({
        ...structuredClone(b),
        id: `${b.type}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      }));
      batch.update(doc(db, 'products', pid), {
        descriptionBlocks: stripUndefined(clonedBlocks),
        updatedAt: now,
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'products/bulk-template');
  }
}

export async function fetchPages(includeDrafts: boolean): Promise<CmsPage[]> {
  try {
    const colRef = collection(db, 'pages');
    const q = includeDrafts ? query(colRef) : query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CmsPage, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'pages');
  }
}

export async function saveCmsPage(
  pageId: string,
  payload: CmsPagePayload,
  mode: 'draft' | 'publish',
  isSystemPage = false
): Promise<void> {
  const cleanSlug = slugify(payload.slug || payload.title);
  const cleanPayload: CmsPagePayload = stripUndefined({
    ...payload,
    slug: cleanSlug,
  });

  try {
    const docRef = doc(db, 'pages', pageId);
    const existingSnap = await getDoc(docRef);
    const now = serverTimestamp();

    if (mode === 'publish') {
      await setDoc(
        docRef,
        stripUndefined({
          ...cleanPayload,
          draftPayload: null,
          isSystemPage: existingSnap.exists() ? Boolean(existingSnap.data().isSystemPage) : isSystemPage,
          status: 'published',
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : now,
          updatedAt: now,
        })
      );
    } else if (existingSnap.exists()) {
      await setDoc(
        docRef,
        stripUndefined({
          ...existingSnap.data(),
          draftPayload: cleanPayload,
          updatedAt: now,
        })
      );
    } else {
      await setDoc(
        docRef,
        stripUndefined({
          ...cleanPayload,
          draftPayload: cleanPayload,
          isSystemPage,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        })
      );
    }

    await recordRevision(
      'page',
      pageId,
      `${mode === 'publish' ? 'Published' : 'Saved draft'}: ${cleanPayload.title}`,
      mode === 'publish' ? 'publish' : 'save_draft',
      cleanPayload
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pages/${pageId}`);
  }
}

export async function deleteCmsPage(pageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pages', pageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pages/${pageId}`);
  }
}

export async function fetchTemplates(): Promise<DescriptionTemplate[]> {
  try {
    const q = query(collection(db, 'descriptionTemplates'), where('isPublic', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DescriptionTemplate, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'descriptionTemplates');
  }
}

export async function saveDescriptionTemplate(
  templateId: string,
  template: Omit<DescriptionTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const docRef = doc(db, 'descriptionTemplates', templateId);
    const existingSnap = await getDoc(docRef);
    const now = serverTimestamp();
    await setDoc(
      docRef,
      stripUndefined({
        ...template,
        isPublic: true,
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : now,
        updatedAt: now,
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `descriptionTemplates/${templateId}`);
  }
}

export async function deleteDescriptionTemplate(templateId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'descriptionTemplates', templateId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `descriptionTemplates/${templateId}`);
  }
}

export async function fetchMediaLibrary(): Promise<MediaAsset[]> {
  try {
    const q = query(collection(db, 'mediaLibrary'), where('isPublic', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'mediaLibrary');
  }
}

export async function addMediaAsset(asset: Omit<MediaAsset, 'id' | 'createdAt'>): Promise<MediaAsset> {
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const docData = stripUndefined({
      ...asset,
      isPublic: true,
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'mediaLibrary', id), docData);
    return { id, ...asset, isPublic: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `mediaLibrary/${id}`);
  }
}

export async function deleteMediaAsset(mediaId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'mediaLibrary', mediaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `mediaLibrary/${mediaId}`);
  }
}

export async function recordRevision(
  entityType: Revision['entityType'],
  entityId: string,
  label: string,
  action: Revision['action'],
  snapshot: Record<string, any>
): Promise<void> {
  const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const authorEmail = auth.currentUser?.email || 'admin@taqwagadgetzone.com';
  try {
    await setDoc(
      doc(db, 'revisions', id),
      stripUndefined({
        entityType,
        entityId,
        label: label.slice(0, 195),
        action,
        snapshot,
        authorEmail,
        createdAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `revisions/${id}`);
  }
}

export async function fetchRevisions(): Promise<Revision[]> {
  try {
    const q = query(collection(db, 'revisions'), orderBy('createdAt', 'desc'), limit(60));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Revision, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'revisions');
  }
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `TGZ-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = serverTimestamp();
  const payload = stripUndefined({
    ...orderInput,
    customerUid: auth.currentUser?.uid || null,
    orderNumber,
    status: 'pending' as const,
    createdAt: now,
    updatedAt: now,
  });

  try {
    await setDoc(doc(db, 'orders', id), payload);
    return {
      id,
      ...orderInput,
      customerUid: auth.currentUser?.uid || null,
      orderNumber,
      status: 'pending',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${id}`);
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(120));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function saveIncompleteOrder(
  leadId: string,
  data: Omit<IncompleteOrder, 'id' | 'updatedAt'>
): Promise<void> {
  if (!data.customerPhone || data.customerPhone.trim().length < 6) return;
  try {
    await setDoc(
      doc(db, 'incompleteOrders', leadId),
      stripUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      })
    );
  } catch {
    // Non-blocking lead capture
  }
}

export async function fetchIncompleteOrders(): Promise<IncompleteOrder[]> {
  try {
    const q = query(collection(db, 'incompleteOrders'), orderBy('updatedAt', 'desc'), limit(60));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<IncompleteOrder, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'incompleteOrders');
  }
}

export async function deleteIncompleteOrder(leadId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'incompleteOrders', leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `incompleteOrders/${leadId}`);
  }
}

export async function fetchAdmins(): Promise<AdminUser[]> {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    return snap.docs.map((d) => d.data() as AdminUser);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admins');
  }
}

export async function upsertAdminUser(adminData: Omit<AdminUser, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const docRef = doc(db, 'admins', adminData.uid);
    const existingSnap = await getDoc(docRef);
    const now = serverTimestamp();
    await setDoc(docRef, {
      ...adminData,
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : now,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admins/${adminData.uid}`);
  }
}

export async function deleteAdminUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
  }
}

export async function compressImageFile(file: File, maxDimension = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
