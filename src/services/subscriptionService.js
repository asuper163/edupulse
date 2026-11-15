// CRM / Subscription-request pipeline service (Arabic-only demo product).
// Stages: new → contacted → partial → paid → completed | rejected
import { storageAdapter } from '../storage/storageAdapter';
import { notificationService } from './notificationService';
import { uid } from '../utils/format';

const nowIso = () => new Date().toISOString();
const priceOf = (course) => {
  if (!course) return 0;
  const gross = Number(course.price) || 0;
  const discount = Number(course.discount) || 0;
  return Math.round(gross * (1 - discount / 100));
};

export const STAGES = ['new', 'contacted', 'partial', 'paid', 'completed', 'rejected'];

export const subscriptionService = {
  priceOf,

  create({ studentId, fullName, phone, email, courseId, note = '' }) {
    const course = storageAdapter.getCollection('courses').find((c) => c.id === courseId);
    if (!course) return { ok: false, error: 'not_found' };
    if (course.status !== 'published') return { ok: false, error: 'not_published' };
    const amountDue = priceOf(course);
    const now = nowIso();
    const request = {
      id: uid('req'), studentId, courseId,
      fullName: String(fullName).trim(), phone: String(phone).trim(), email: String(email).trim(),
      amountDue, amountPaid: 0, method: 'cash',
      stage: 'new',
      notes: note ? [{ id: uid('nt'), text: String(note).trim(), by: studentId, at: now }] : [],
      rejectionReason: '', createdAt: now, updatedAt: now, decidedAt: null,
    };
    storageAdapter.insertInCollection('subscriptionRequests', request);
    const sales = storageAdapter.getCollection('users').filter((u) => u.role === 'sales' && u.status === 'active');
    notificationService.create({
      userIds: sales.map((s) => s.id),
      title: { ar: 'طلب اشتراك جديد', en: 'طلب اشتراك جديد' },
      message: { ar: `${request.fullName} طلب الاشتراك في «${course.title?.ar}» بمبلغ ${amountDue} ج.م.`, en: `${request.fullName} طلب الاشتراك في «${course.title?.ar}» بمبلغ ${amountDue} ج.م.` },
      type: 'subscription',
    });
    return { ok: true, request };
  },

  getAll({ stage = '', query = '', courseId = '' } = {}) {
    let list = storageAdapter.getCollection('subscriptionRequests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (stage) list = list.filter((r) => r.stage === stage);
    if (courseId) list = list.filter((r) => r.courseId === courseId);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => [r.fullName, r.phone, r.email].join(' ').toLowerCase().includes(q));
    }
    return list;
  },

  getById(id) {
    return storageAdapter.getCollection('subscriptionRequests').find((r) => r.id === id) || null;
  },

  getByStudent(studentId) {
    return storageAdapter.getCollection('subscriptionRequests').filter((r) => r.studentId === studentId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addNote(id, text, byUserId) {
    if (!String(text || '').trim()) return { ok: false, error: 'empty' };
    const note = { id: uid('nt'), text: String(text).trim(), by: byUserId, at: nowIso() };
    const res = storageAdapter.updateInCollection('subscriptionRequests', id, (r) => ({ ...r, notes: [...(r.notes || []), note], updatedAt: nowIso() }));
    return res.ok ? { ok: true, note, request: res.item } : { ok: false };
  },

  setStage(id, stage) {
    if (!STAGES.includes(stage)) return { ok: false, error: 'invalid_stage' };
    const res = storageAdapter.updateInCollection('subscriptionRequests', id, (r) => ({ ...r, stage, updatedAt: nowIso(), decidedAt: ['paid', 'completed', 'rejected'].includes(stage) ? nowIso() : r.decidedAt }));
    return res.ok ? { ok: true, request: res.item } : { ok: false };
  },

  // Record a cash payment (partial or final). Marks stage paid/partial automatically.
  recordPayment(id, amount, { byUserId, method = 'cash' } = {}) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return { ok: false, error: 'invalid_amount' };
    const req = this.getById(id);
    if (!req) return { ok: false, error: 'not_found' };
    const nextPaid = (Number(req.amountPaid) || 0) + n;
    const nextStage = nextPaid >= req.amountDue ? 'paid' : 'partial';
    const paymentRecord = { id: uid('pay'), amount: n, method, by: byUserId, at: nowIso() };
    const payments = [...(req.payments || []), paymentRecord];
    const notes = [...(req.notes || []), { id: uid('nt'), text: `دفعة كاش بقيمة ${n.toLocaleString('ar-EG')} ج.م`, by: byUserId, at: nowIso() }];
    const res = storageAdapter.updateInCollection('subscriptionRequests', id, (r) => ({ ...r, amountPaid: nextPaid, payments, notes, stage: nextStage, updatedAt: nowIso(), decidedAt: nextStage === 'paid' ? nowIso() : r.decidedAt }));
    notificationService.create({
      userId: req.studentId,
      title: { ar: 'تم تسجيل الدفعة', en: 'تم تسجيل الدفعة' },
      message: { ar: `تم تسجيل دفعة ${n.toLocaleString('ar-EG')} ج.م على اشتراك «${req.fullName}». المتبقي: ${Math.max(0, req.amountDue - nextPaid).toLocaleString('ar-EG')} ج.م.`, en: `تم تسجيل دفعة ${n.toLocaleString('ar-EG')} ج.م على اشتراك «${req.fullName}». المتبقي: ${Math.max(0, req.amountDue - nextPaid).toLocaleString('ar-EG')} ج.م.` },
      type: 'payment',
    });
    return { ok: true, request: res.item, payments };
  },

  // Sales approves a paid request → create enrollment for the student and mark completed.
  completeSubscription(id, { byUserId } = {}) {
    const req = this.getById(id);
    if (!req) return { ok: false, error: 'not_found' };
    const nextPaid = Number(req.amountPaid) || 0;
    if (nextPaid < req.amountDue) return { ok: false, error: 'not_fully_paid' };
    const course = storageAdapter.getCollection('courses').find((c) => c.id === req.courseId);
    const existing = storageAdapter.getCollection('enrollments').find((e) => e.studentId === req.studentId && e.courseId === req.courseId);
    if (!existing) {
      storageAdapter.insertInCollection('enrollments', { id: uid('enr'), studentId: req.studentId, courseId: req.courseId, enrolledAt: nowIso(), status: 'active', completedAt: null });
    }
    const notes = [...(req.notes || []), { id: uid('nt'), text: 'تم اعتماد الاشتراك وتفعيل الدورة للطالب', by: byUserId, at: nowIso() }];
    const res = storageAdapter.updateInCollection('subscriptionRequests', id, (r) => ({ ...r, stage: 'completed', notes, updatedAt: nowIso(), decidedAt: nowIso() }));
    notificationService.create({
      userId: req.studentId,
      title: { ar: 'تم تفعيل اشتراكك', en: 'تم تفعيل اشتراكك' },
      message: { ar: `تم اعتماد دفعتك وتفعيل اشتراكك في «${course?.title?.ar || ''}». بالتوفيق!`, en: `تم اعتماد دفعتك وتفعيل اشتراكك في «${course?.title?.ar || ''}». بالتوفيق!` },
      type: 'approval',
    });
    return { ok: true, request: res.item };
  },

  reject(id, reason, { byUserId } = {}) {
    const req = this.getById(id);
    if (!req) return { ok: false, error: 'not_found' };
    const ar = String(reason || '').trim();
    if (!ar) return { ok: false, error: 'reason_required' };
    const notes = [{ id: uid('nt'), text: `طلب مرفوض: ${ar}`, by: byUserId, at: nowIso() }];
    const res = storageAdapter.updateInCollection('subscriptionRequests', id, (r) => ({ ...r, stage: 'rejected', rejectionReason: ar, notes: [...(r.notes || []), ...notes], updatedAt: nowIso(), decidedAt: nowIso() }));
    notificationService.create({
      userId: req.studentId,
      title: { ar: 'طلب اشتراك مرفوض', en: 'طلب اشتراك مرفوض' },
      message: { ar: `للأسف تم رفض طلب اشتراكك. السبب: ${ar}`, en: `للأسف تم رفض طلب اشتراكك. السبب: ${ar}` },
      type: 'rejection',
    });
    return res.ok ? { ok: true, request: res.item } : { ok: false };
  },

  // Stats for the sales dashboard overview
  stats() {
    const all = storageAdapter.getCollection('subscriptionRequests');
    const paidTotal = all.reduce((s, r) => s + (Number(r.amountPaid) || 0), 0);
    const dueTotal = all.reduce((s, r) => s + (Number(r.amountDue) || 0), 0);
    const byStage = Object.fromEntries(STAGES.map((s) => [s, all.filter((r) => r.stage === s).length]));
    const month = new Date();
    const thisMonth = all.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    }).length;
    return { total: all.length, paidTotal, dueTotal, outstanding: Math.max(0, dueTotal - paidTotal), byStage, thisMonth };
  },

  monthlyRevenue(months = 6) {
    const all = storageAdapter.getCollection('subscriptionRequests');
    const buckets = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = d.getMonth();
      const total = all.filter((r) => { const dec = r.decidedAt ? new Date(r.decidedAt) : null; return dec && dec.getFullYear() === y && dec.getMonth() === m; }).reduce((s, r) => s + (Number(r.amountPaid) || 0), 0);
      buckets.push({ month: d.toLocaleString('ar', { month: 'short' }), total });
    }
    return buckets;
  },
};
