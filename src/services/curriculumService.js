// Sections & lessons authoring (instructor-owned)
import { storageAdapter } from '../storage/storageAdapter';
import { uid } from '../utils/format';

const nowIso = () => new Date().toISOString();

export const curriculumService = {
  // ── Sections ─────────────────────────────────────────────
  createSection(courseId, data) {
    const sections = storageAdapter.getCollection('sections').filter((s) => s.courseId === courseId);
    const now = nowIso();
    const section = { id: uid('sec'), courseId, title: { ar: data.title?.ar?.trim() || '', en: data.title?.en?.trim() || '' }, description: { ar: data.description?.ar?.trim() || '', en: data.description?.en?.trim() || '' }, order: sections.length + 1, createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('sections', section);
    return { ok: true, section };
  },
  updateSection(id, data) {
    const res = storageAdapter.updateInCollection('sections', id, (s) => ({ ...s, title: data.title ?? s.title, description: data.description ?? s.description, updatedAt: nowIso() }));
    return res.ok ? { ok: true, section: res.item } : { ok: false, error: 'not_found' };
  },
  deleteSection(id) {
    const section = storageAdapter.getCollection('sections').find((s) => s.id === id);
    const courseId = section?.courseId;
    const lessons = storageAdapter.getCollection('lessons').filter((l) => l.sectionId === id).map((l) => l.id);
    storageAdapter.removeFromCollection('lessonProgress', (p) => lessons.includes(p.lessonId));
    storageAdapter.removeFromCollection('lessons', (l) => l.sectionId === id);
    storageAdapter.removeFromCollection('sections', (s) => s.id === id);
    if (courseId) this.reindexSections(courseId);
    return { ok: true };
  },
  reorderSections(courseId, orderedIds) {
    const all = storageAdapter.getCollection('sections');
    const next = all.map((s) => {
      if (s.courseId !== courseId) return s;
      const idx = orderedIds.indexOf(s.id);
      return idx >= 0 ? { ...s, order: idx + 1, updatedAt: nowIso() } : s;
    });
    storageAdapter.setCollection('sections', next);
    return { ok: true };
  },
  reindexSections(courseId) {
    if (!courseId) return;
    const sections = storageAdapter.getCollection('sections').filter((s) => s.courseId === courseId).sort((a, b) => a.order - b.order);
    const all = storageAdapter.getCollection('sections');
    storageAdapter.setCollection('sections', all.map((s) => {
      const idx = sections.findIndex((x) => x.id === s.id);
      return idx >= 0 ? { ...s, order: idx + 1 } : s;
    }));
  },

  // ── Lessons ──────────────────────────────────────────────
  createLesson(sectionId, courseId, data) {
    const lessons = storageAdapter.getCollection('lessons').filter((l) => l.sectionId === sectionId);
    const now = nowIso();
    const lesson = { id: uid('lsn'), sectionId, title: { ar: data.title?.ar?.trim() || '', en: data.title?.en?.trim() || '' }, description: { ar: data.description?.ar?.trim() || '', en: data.description?.en?.trim() || '' }, content: { ar: data.content?.ar?.trim() || '', en: data.content?.en?.trim() || '' }, videoUrl: data.videoUrl || '', duration: Number(data.duration) || 10, type: data.type || 'video', isRequired: data.isRequired !== false, order: lessons.length + 1, createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('lessons', lesson);
    return { ok: true, lesson };
  },
  updateLesson(id, data) {
    const res = storageAdapter.updateInCollection('lessons', id, (l) => ({ ...l, ...data, duration: Number(data.duration ?? l.duration) || 10, updatedAt: nowIso() }));
    return res.ok ? { ok: true, lesson: res.item } : { ok: false, error: 'not_found' };
  },
  deleteLesson(id) {
    const lesson = storageAdapter.getCollection('lessons').find((l) => l.id === id);
    storageAdapter.removeFromCollection('lessonProgress', (p) => p.lessonId === id);
    storageAdapter.removeFromCollection('lessons', (l) => l.id === id);
    if (lesson) this.reindexLessons(lesson.sectionId);
    return { ok: true };
  },
  reorderLessons(sectionId, orderedIds) {
    const all = storageAdapter.getCollection('lessons');
    const next = all.map((l) => {
      if (l.sectionId !== sectionId) return l;
      const idx = orderedIds.indexOf(l.id);
      return idx >= 0 ? { ...l, order: idx + 1, updatedAt: nowIso() } : l;
    });
    storageAdapter.setCollection('lessons', next);
    return { ok: true };
  },
  reindexLessons(sectionId) {
    const lessons = storageAdapter.getCollection('lessons').filter((l) => l.sectionId === sectionId).sort((a, b) => a.order - b.order);
    const all = storageAdapter.getCollection('lessons');
    storageAdapter.setCollection('lessons', all.map((l) => {
      const idx = lessons.findIndex((x) => x.id === l.id);
      return idx >= 0 ? { ...l, order: idx + 1 } : l;
    }));
  },
};
