import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Users, GraduationCap, BookOpen, CheckCircle2, Clock3, ClipboardList, Award, Star, Inbox, ChevronRight, ChevronLeft, TrendingUp, Banknote, BadgeCheck, Wallet } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useLanguage } from '../../i18n/index.jsx';
import { analyticsService } from '../../services/analyticsService';
import { subscriptionService } from '../../services/subscriptionService';
import { courseService } from '../../services/courseService';
import { storageAdapter } from '../../storage/storageAdapter';
import { userService } from '../../services/userService';
import { reviewService } from '../../services/reviewService';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { localized } from '../../utils/localized';
import { timeAgo, formatNumber } from '../../utils/format';

const tooltipStyle = { background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 };
const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#64748B'];

export default function AdminOverview() {
  const { t, lang, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const data = useMemo(() => {
    const kpis = analyticsService.adminKpis();
    const enrollmentTrend = analyticsService.enrollmentTrend(6);
    const userGrowth = analyticsService.userGrowth(6);
    const distribution = analyticsService.courseDistribution();
    const pending = courseService.getAll().filter((c) => c.status === 'pending').slice(0, 4);
    const messages = storageAdapter.getCollection('messages').filter((m) => m.status === 'open').slice(0, 4);
    const recentActivity = storageAdapter.getCollection('enrollments').sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)).slice(0, 5).map((e) => ({ ...e, student: userService.getById(e.studentId), course: courseService.getById(e.courseId) }));
    const sales = subscriptionService.stats();
    return { kpis, enrollmentTrend, userGrowth, distribution, pending, messages, recentActivity, sales };
  }, []);

  return (
    <div>
      <PageHeader title={t('admin.welcomeTitle')} />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label={t('admin.kpiUsers')} value={data.kpis.totalUsers} tone="emerald" hint={`${data.kpis.students} ${t('admin.kpiStudents')} · ${data.kpis.instructors} ${t('admin.kpiInstructors')}`} />
        <StatCard icon={BookOpen} label={t('admin.kpiCourses')} value={data.kpis.totalCourses} tone="sky" hint={`${data.kpis.published} ${t('admin.kpiPublished')}`} />
        <StatCard icon={Clock3} label={t('admin.kpiPending')} value={data.kpis.pending} tone="amber" />
        <StatCard icon={ClipboardList} label={t('admin.kpiEnrollments')} value={data.kpis.enrollments} tone="violet" />
        <StatCard icon={Award} label={t('admin.kpiCertificates')} value={data.kpis.certificates} tone="amber" />
        <StatCard icon={Star} label={t('admin.overview') + ' ★'} value={data.kpis.avgRating ? data.kpis.avgRating.toFixed(1) : '—'} tone="amber" />
        <StatCard icon={GraduationCap} label={t('admin.kpiStudents')} value={data.kpis.students} tone="emerald" />
        <StatCard icon={CheckCircle2} label={t('admin.kpiPublished')} value={data.kpis.published} tone="sky" />
      </div>

      {/* Sales & subscriptions strip */}
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Banknote size={20} className="text-emerald-400" aria-hidden="true" /></span>
            <span>
              <span className="block text-sm font-black text-slate-100">{t('admin.salesStripTitle')}</span>
              <span className="block text-[10px] text-slate-500">{t('admin.salesStripSubtitle')}</span>
            </span>
          </div>
          <Link to="/sales" className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors">{t('admin.viewSales')}<Chevron size={13} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-500/15 bg-[#151F32] px-4 py-3">
            <span className="block text-[10px] font-bold text-slate-500">{t('sales.kpiTotal')}</span>
            <span className="block text-xl font-black text-slate-100 tnum mt-0.5">{formatNumber(data.sales.total, locale)}</span>
            <span className="block text-[9px] text-slate-600">{data.sales.thisMonth} {t('sales.kpiThisMonth')}</span>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-[#151F32] px-4 py-3">
            <span className="block text-[10px] font-bold text-slate-500">{t('sales.kpiCompleted')}</span>
            <span className="block text-xl font-black text-emerald-400 tnum mt-0.5 inline-flex items-center gap-1.5"><BadgeCheck size={17} aria-hidden="true" />{formatNumber(data.sales.byStage.completed || 0, locale)}</span>
            <span className="block text-[9px] text-slate-600">{formatNumber((data.sales.byStage.new || 0) + (data.sales.byStage.contacted || 0), locale)} {t('sales.kpiNew')}</span>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-[#151F32] px-4 py-3">
            <span className="block text-[10px] font-bold text-slate-500">{t('sales.kpiRevenue')}</span>
            <span className="block text-xl font-black text-emerald-400 tnum mt-0.5">{formatNumber(data.sales.paidTotal, locale)} <span className="text-[10px] font-bold text-slate-500">ج.م</span></span>
            <span className="block text-[9px] text-slate-600">{t('sales.paymentMethodCash')}</span>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-[#151F32] px-4 py-3">
            <span className="block text-[10px] font-bold text-slate-500">{t('sales.kpiOutstanding')}</span>
            <span className="block text-xl font-black text-amber-400 tnum mt-0.5 inline-flex items-center gap-1.5"><Wallet size={17} aria-hidden="true" />{formatNumber(data.sales.outstanding, locale)} <span className="text-[10px] font-bold text-slate-500">ج.م</span></span>
            <span className="block text-[9px] text-slate-600">{formatNumber(data.sales.dueTotal, locale)} ج.م {t('sales.amountDue')}</span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="xl:col-span-2 space-y-5">
          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-400" aria-hidden="true" />{t('admin.enrollmentTrend')}</h2>
            <div className="h-48"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.enrollmentTrend} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="admEnr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.5} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#F1F5F9' }} /><Area type="monotone" dataKey="count" name={t('admin.enrollments')} stroke="#10B981" strokeWidth={2.5} fill="url(#admEnr)" /></AreaChart></ResponsiveContainer></div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
              <h2 className="font-bold text-slate-200 text-sm mb-3">{t('admin.userGrowth')}</h2>
              <div className="h-44"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.userGrowth} margin={{ left: -22 }}><CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#1B2740' }} contentStyle={tooltipStyle} /><Bar dataKey="count" name={t('admin.users')} fill="#3B82F6" radius={[5, 5, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
              <h2 className="font-bold text-slate-200 text-sm mb-3">{t('admin.courseDistribution')}</h2>
              <div className="h-44">{data.distribution.length === 0 ? <p className="text-xs text-slate-500 py-10 text-center">{t('common.noData')}</p> : (
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.distribution} dataKey="value" nameKey={lang === 'ar' ? 'nameAr' : 'name'} innerRadius={38} outerRadius={62} paddingAngle={3}>{data.distribution.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>
              )}</div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <h2 className="font-bold text-slate-200 text-sm mb-2">{t('admin.enrollments')}</h2>
            <ul className="divide-y divide-[#1c2941]">
              {data.recentActivity.map((e) => (
                <li key={e.id} className="flex items-center gap-2.5 py-2.5">
                  <Avatar name={e.student?.name} src={e.student?.avatar} size={30} />
                  <p className="flex-1 min-w-0 text-[11px] text-slate-300"><span className="font-bold text-slate-100">{e.student?.name}</span> ← <span className="truncate">{localized(e.course?.title, lang)}</span></p>
                  <span className="text-[9px] text-slate-600 shrink-0">{timeAgo(e.enrolledAt, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: approvals + messages */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-amber-300 text-sm inline-flex items-center gap-2"><Clock3 size={15} aria-hidden="true" />{t('admin.pendingApprovals')}</h2>
              <Link to="/admin/courses" className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-0.5">{t('admin.viewAll')}<Chevron size={11} aria-hidden="true" /></Link>
            </div>
            {data.pending.length === 0 ? <p className="text-xs text-slate-500 py-3 text-center">{t('admin.noPending')}</p> : (
              <ul className="divide-y divide-amber-500/10">
                {data.pending.map((course) => (
                  <li key={course.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0"><p className="text-[11px] font-bold text-slate-100 truncate">{localized(course.title, lang)}</p><p className="text-[9px] text-slate-500">{userService.getById(course.instructorId)?.name}</p></div>
                    <button onClick={() => navigate(`/admin/courses/${course.id}`)} className="shrink-0 h-8 px-2.5 rounded-lg text-[10px] font-black bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors">{t('admin.reviewCourse')}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
            <div className="flex items-center justify-between mb-2"><h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2"><Inbox size={15} className="text-emerald-400" aria-hidden="true" />{t('admin.recentMessages')}</h2><Link to="/admin/messages" className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-0.5">{t('admin.viewAll')}<Chevron size={11} aria-hidden="true" /></Link></div>
            {data.messages.length === 0 ? <p className="text-xs text-slate-500 py-3 text-center">{t('admin.noMessages')}</p> : (
              <ul className="divide-y divide-[#1c2941]">
                {data.messages.map((m) => (
                  <li key={m.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-slate-100 truncate">{m.subject}</p><span className="text-[9px] text-slate-600 shrink-0">{timeAgo(m.createdAt, locale)}</span></div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{m.name} — {m.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
