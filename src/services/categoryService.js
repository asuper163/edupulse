// Categories CRUD with referential safety.
import { storageAdapter } from '../storage/storageAdapter';
import { uid, slugify } from '../utils/format';

const nowIso = () => new Date().toISOString();

export const categoryService = {
  getAll() {
    const cats = storageAdapter.getCollection('categories');
    const courses = storageAdapter.getCollection('courses');
    return cats.map((c) => ({ ...c, courseCount: courses.filter((x) => x.categoryId === c.id).length })).sort((a, b) => (a.name?.en || '').localeCompare(b.name?.en || ''));
  },
  getActive() {
    return this.getAll().filter((c) => c.status === 'active');
  },
  getById(id) {
    return this.getAll().find((c) => c.id === id) || null;
  },
  create({ name, description, image, status }) {
    if (!name?.ar?.trim() || !name?.en?.trim()) return { ok: false, error: 'name_required' };
    const cat = { id: uid('cat'), name: { ar: name.ar.trim(), en: name.en.trim() }, slug: slugify(name.en), description: { ar: description?.ar?.trim() || '', en: description?.en?.trim() || '' }, image: image || '', status: status || 'active', createdAt: nowIso(), updatedAt: nowIso() };
    storageAdapter.insertInCollection('categories', cat);
    return { ok: true, category: cat };
  },
  update(id, patch) {
    const clean = { ...patch };
    if (patch.name) clean.slug = slugify(patch.name.en || patch.name.ar);
    delete clean.id; delete clean.createdAt;
    clean.updatedAt = nowIso();
    const res = storageAdapter.updateInCollection('categories', id, (c) => ({ ...c, ...clean }));
    return res.ok ? { ok: true, category: res.item } : { ok: false, error: 'not_found' };
  },
  remove(id) {
    const count = storageAdapter.getCollection('courses').filter((c) => c.categoryId === id).length;
    if (count > 0) return { ok: false, error: 'has_courses', count };
    storageAdapter.removeFromCollection('categories', (c) => c.id === id);
    return { ok: true };
  },
};
