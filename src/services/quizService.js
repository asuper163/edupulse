// Quiz engine: authoring, attempts, scoring, limits. Submitted attempts are immutable.
import { storageAdapter } from '../storage/storageAdapter';
import { notificationService } from './notificationService';
import { uid } from '../utils/format';

const nowIso = () => new Date().toISOString();

export const quizService = {
  getByCourse(courseId) {
    return storageAdapter.getCollection('quizzes').filter((q) => q.courseId === courseId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  getById(id) {
    return storageAdapter.getCollection('quizzes').find((q) => q.id === id) || null;
  },
  getAll() {
    return storageAdapter.getCollection('quizzes');
  },
  getQuestions(quizId) {
    return storageAdapter.getCollection('questions').filter((q) => q.quizId === quizId).sort((a, b) => a.order - b.order);
  },

  create(data) {
    const now = nowIso();
    const quiz = { id: uid('qz'), courseId: data.courseId, title: data.title, description: data.description || { ar: '', en: '' }, passingScore: Number(data.passingScore) || 60, maxAttempts: Number(data.maxAttempts) || 0, isRequired: Boolean(data.isRequired), status: 'published', createdAt: now, updatedAt: now };
    storageAdapter.insertInCollection('quizzes', quiz);
    return { ok: true, quiz };
  },
  update(id, patch) {
    const clean = { ...patch, updatedAt: nowIso() };
    delete clean.id; delete clean.courseId; delete clean.createdAt;
    const res = storageAdapter.updateInCollection('quizzes', id, (q) => ({ ...q, ...clean }));
    return res.ok ? { ok: true, quiz: res.item } : { ok: false, error: 'not_found' };
  },
  remove(id) {
    storageAdapter.removeFromCollection('questions', (q) => q.quizId === id);
    storageAdapter.removeFromCollection('quizAttempts', (a) => a.quizId === id);
    storageAdapter.removeFromCollection('quizzes', (q) => q.id === id);
    return { ok: true };
  },

  addQuestion(quizId, data) {
    const existing = this.getQuestions(quizId);
    const question = { id: uid('qst'), quizId, question: data.question, type: data.type || 'mcq', options: data.options || { ar: [], en: [] }, correctAnswer: data.correctAnswer, points: Number(data.points) || 10, order: existing.length + 1 };
    storageAdapter.insertInCollection('questions', question);
    return { ok: true, question };
  },
  updateQuestion(id, patch) {
    const clean = { ...patch };
    delete clean.id; delete clean.quizId; delete clean.order;
    const res = storageAdapter.updateInCollection('questions', id, (q) => ({ ...q, ...clean }));
    return res.ok ? { ok: true, question: res.item } : { ok: false, error: 'not_found' };
  },
  deleteQuestion(id) {
    const q = storageAdapter.getCollection('questions').find((x) => x.id === id);
    if (!q) return { ok: false };
    storageAdapter.removeFromCollection('questions', (x) => x.id === id);
    // Re-order remaining
    const remaining = this.getQuestions(q.quizId);
    const all = storageAdapter.getCollection('questions');
    const reordered = all.map((x) => {
      const idx = remaining.findIndex((r) => r.id === x.id);
      return idx >= 0 ? { ...x, order: idx + 1 } : x;
    });
    storageAdapter.setCollection('questions', reordered);
    return { ok: true };
  },
  reorderQuestions(quizId, orderedIds) {
    const all = storageAdapter.getCollection('questions');
    const next = all.map((q) => {
      if (q.quizId !== quizId) return q;
      const idx = orderedIds.indexOf(q.id);
      return idx >= 0 ? { ...q, order: idx + 1 } : q;
    });
    storageAdapter.setCollection('questions', next);
    return { ok: true };
  },

  // ── Attempts ────────────────────────────────────────────────────────
  getAttempts(quizId, studentId = null) {
    let list = storageAdapter.getCollection('quizAttempts').filter((a) => a.quizId === quizId);
    if (studentId) list = list.filter((a) => a.studentId === studentId);
    return list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  },

  getAttemptsForStudent(studentId) {
    return storageAdapter.getCollection('quizAttempts').filter((a) => a.studentId === studentId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  attemptsUsed(quizId, studentId) {
    return this.getAttempts(quizId, studentId).length;
  },

  canAttempt(quizId, studentId) {
    const quiz = this.getById(quizId);
    if (!quiz) return { ok: false, error: 'not_found' };
    const used = this.attemptsUsed(quizId, studentId);
    if (quiz.maxAttempts > 0 && used >= quiz.maxAttempts) return { ok: false, error: 'max_attempts', used };
    return { ok: true, used, remaining: quiz.maxAttempts === 0 ? Infinity : quiz.maxAttempts - used };
  },

  bestPercentage(quizId, studentId) {
    const attempts = this.getAttempts(quizId, studentId);
    return attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : null;
  },

  hasPassed(quizId, studentId) {
    return this.getAttempts(quizId, studentId).some((a) => a.passed);
  },

  submitAttempt({ quizId, studentId, answers }) {
    const quiz = this.getById(quizId);
    if (!quiz) return { ok: false, error: 'not_found' };
    const gate = this.canAttempt(quizId, studentId);
    if (!gate.ok) return gate;
    const questions = this.getQuestions(quizId);
    if (!questions.length) return { ok: false, error: 'no_questions' };
    let score = 0;
    const totalPoints = questions.reduce((s, q) => s + Number(q.points || 0), 0);
    const detail = questions.map((q, i) => {
      const given = answers?.[q.id];
      const correct = given !== undefined && given === q.correctAnswer;
      if (correct) score += Number(q.points || 0);
      return { questionId: q.id, given, correct };
    });
    const percentage = totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100);
    const passed = percentage >= Number(quiz.passingScore || 60);
    const attempt = {
      id: uid('att'), quizId, studentId,
      answers: detail, // answers snapshot (questionId → given); attempts are immutable
      score, totalPoints, percentage, passed,
      attemptNumber: gate.used + 1,
      startedAt: nowIso(), submittedAt: nowIso(),
    };
    storageAdapter.insertInCollection('quizAttempts', attempt);
    notificationService.create({
      userId: studentId,
      title: passed ? { ar: 'اجتزت الاختبار!', en: 'You passed the quiz!' } : { ar: 'نتيجة الاختبار', en: 'Quiz result' },
      message: passed
        ? { ar: `حصلت على ${percentage}٪ في «${quiz.title?.ar}».`, en: `You scored ${percentage}% in “${quiz.title?.en}”.` }
        : { ar: `حصلت على ${percentage}٪ — درجة النجاح ${quiz.passingScore}٪.`, en: `You scored ${percentage}% — passing is ${quiz.passingScore}%.` },
      type: 'quiz',
    });
    return { ok: true, attempt, detail };
  },
};
