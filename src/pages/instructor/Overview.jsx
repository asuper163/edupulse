import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { BookOpen, CheckCircle2, Clock3, XCircle, Users, TrendingUp, Star, AlertTriangle, ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { courseService } from '../../services/courseService';
import { storageAdapter } from '../../storage/storageAdapter';
import { reviewService } from '../../services/reviewService';
import { userService } from '../../services/userService';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/Feedback';
import { localized } from '../../utils/localized';
import { timeAgo, formatDate } from '../../utils/format';

export default function InstructorOverview() {
  const { t, lang, locale, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const data = useMemo(() => {
    const kpis = analyticsService.instructorKpis(user.id);
    const trend = analyticsService.instructorEnrollmentsTrend(user.id, 6);
    const courses = courseService.getByInstructor(user.id);
    const coursesById = Object.fromEntries(courses.map((c) => [c.id, c]));
    const courseIds = courses.map((c) => c.id);
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => courseIds.includes(e.courseId)).sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
    const recentEnrollments = enrollments.slice(0, 5).map((e) => ({ ...e, student: userService.getById(e.studentId), course: coursesById[e.courseId] }));
    const recentReviews = storageAdapter.getCollection('reviews').filter((r) => courseIds.includes(r.courseId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map((r) => ({ ...r, student: userService.getById(r.studentId), course: coursesById[r.courseId] }));
    const performance = courses.map((c) => ({ name: (localized(c.title, lang) || '').slice(0, 22), enrollments: c.enrollmentCount })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 6);
    const rejected = courses.filter((c) => c.status === 'rejected');
    return { kpis, trend, performance, recentEnrollments, recentReviews, rejected };
  }, [user.id, lang]);

  return (
    <div>
      <PageHeader title={`${t('instructor.welcomeTitle')} — ${user.name.split(' ')[0]}`} actions={<Link to="/instructor/courses/create" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0B1120] text-xs font-black transition-colors">+ {t('instructor.createCourse')}</Link>} />

      {/* Rejected banner */}
      {data.rejected.length > 0 && (
        <button onClick={() => navigate('/instructor/courses')} className="w-full mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-start hover:bg-red-500/15 transition-colors">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span><span className="block text-xs font-black text-red-300">{t('instructor.rejectedBanner')}</span><span className="block text-[11px] text-red-400/80 mt-0.5">{t('instructor.rejectedBannerHint')}</span></span>
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={BookOpen} label={t('instructor.totalCourses')} value={data.kpis.totalCourses} tone="emerald" />
        <StatCard icon={CheckCircle2} label={t('instructor.publishedCourses')} value={data.kpis.published} tone="sky" />
        <StatCard icon={Clock3} label={t('instructor.pendingCourses')} value={data.kpis.pending} tone="amber" />
        <StatCard icon={Users} label={t('instructor.totalStudents')} value={data.kpis.totalStudents} tone="violet" hint={`${data.kpis.totalEnrollments} ${t('instructor.totalEnrollments')}`} />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Enrollments trend */}
          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-400" aria-hidden="true" />{t('instructor.enrollmentsOverTime')}</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="enrFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.5} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.03} /></linearGradient></defs>
                  <CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: '#F1F5F9' }} />
                  <Area type="monotone" dataKey="count" name={t('admin.enrollments')} stroke="#10B981" strokeWidth={2.5} fill="url(#enrFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course performance */}
          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2 mb-3"><BarChart3 size={16} className="text-emerald-400" aria-hidden="true" />{t('instructor.coursePerformance')}</h2>
            {data.performance.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">{t('instructor.noEnrollments')}</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performance} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#1c2941" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#1B2740' }} contentStyle={{ background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="enrollments" name={t('instructor.totalEnrollments')} fill="#10B981" radius={[4, 4, 4, 4]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Right column — recent activity */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <div className="flex items-center justify-between mb-2"><h2 className="font-bold text-slate-200 text-sm">{t('instructor.recentEnrollments')}</h2><span className="text-[10px] font-black text-amber-400 inline-flex items-center gap-1"><Star size={11} fill="currentColor" aria-hidden="true" />{data.kpis.avgRating ? data.kpis.avgRating.toFixed(1) : '—'}</span></div>
            {data.recentEnrollments.length === 0 ? <p className="text-xs text-slate-500 py-3">{t('instructor.noEnrollments')}</p> : (
              <ul className="divide-y divide-[#1c2941]">
                {data.recentEnrollments.map((e) => (
                  <li key={e.id} className="flex items-center gap-2.5 py-2.5">
                    <Avatar name={e.student?.name} src={e.student?.avatar} size={32} />
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-slate-200 truncate">{e.student?.name}</p><p className="text-[9px] text-slate-500 truncate">{localized(e.course?.title, lang)}</p></div>
                    <span className="text-[9px] text-slate-600 shrink-0">{timeAgo(e.enrolledAt, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <div className="flex items-center justify-between mb-2"><h2 className="font-bold text-slate-200 text-sm">{t('instructor.recentReviews')}</h2><Link to="/instructor/reviews" className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-0.5">{t('home.viewAll')}<Chevron size={11} aria-hidden="true" /></Link></div>
            {data.recentReviews.length === 0 ? <p className="text-xs text-slate-500 py-3">{t('instructor.noReviews')}</p> : (
              <ul className="divide-y divide-[#1c2941]">
                {data.recentReviews.map((r) => (
                  <li key={r.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-slate-200 truncate">{r.student?.name} · <span className="text-amber-400">{'★'.repeat(r.rating)}</span></p><span className="text-[9px] text-slate-600">{formatDate(r.createdAt, locale, { month: 'short', day: 'numeric' })}</span></div>
                    <p className="text-[10px] text-slate-500 leading-5 mt-1 line-clamp-2">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/instructor/courses" className="block rounded-2xl border border-[#1c2941] bg-[#151F32] p-4 hover:border-emerald-500/30 transition-colors">
            <h2 className="text-xs font-bold text-slate-300">{t('instructor.myCourses')}</h2>
            <p className="text-[10px] text-slate-500 mt-1">{t('instructor.coursesSubtitle')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
