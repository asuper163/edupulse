import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, UserCheck, PhoneCall, BadgeCheck, Banknote, Wallet, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../i18n/index.jsx';
import { subscriptionService } from '../../services/subscriptionService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Avatar from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/Feedback';
import { formatNumber, formatDate } from '../../utils/format';
import { localized } from '../../utils/localized';

export default function SalesOverview() {
  const { t, lang, locale, isRTL } = useLanguage();
  const navigate = useNavigate();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const [tick] = useState(0);

  const data = useMemo(() => {
    const s = subscriptionService.stats();
    const revenue = subscriptionService.monthlyRevenue(6);
    const requests = subscriptionService.getAll();
    const recent = requests.slice(0, 5).map((r) => ({ ...r, course: courseService.getById(r.courseId), student: userService.getById(r.studentId) }));
    return { s, revenue, recent };
  }, [tick]);

  const num = (n) => new Intl.NumberFormat(locale).format(n || 0);
  const egp = (n) => `${num(n)} ج.م`;

  return (
    <div>
      <PageHeader title={t('sales.welcomeTitle')} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Inbox} label={t('sales.kpiNew')} value={data.s.byStage.new || 0} tone="amber" />
        <StatCard icon={PhoneCall} label={t('sales.kpiContacted')} value={data.s.byStage.contacted || 0} tone="sky" />
        <StatCard icon={BadgeCheck} label={t('sales.kpiCompleted')} value={data.s.byStage.completed || 0} tone="emerald" />
        <StatCard icon={Wallet} label={t('sales.kpiOutstanding')} value={egp(data.s.outstanding)} tone="red" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Banknote} label={t('sales.kpiRevenue')} value={egp(data.s.paidTotal)} tone="emerald" hint={`${t('sales.kpiThisMonth')}: ${data.s.thisMonth}`} />
        <StatCard icon={TrendingUp} label={t('sales.kpiTotal')} value={data.s.total} tone="violet" />
        <StatCard icon={Inbox} label={t('sales.stagePartial')} value={data.s.byStage.partial || 0} tone="amber" />
        <StatCard icon={UserCheck} label={t('sales.stagePaid')} value={data.s.byStage.paid || 0} tone="sky" />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="xl:col-span-2 rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm inline-flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-400" aria-hidden="true" />{t('sales.monthlyRevenue')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue} margin={{ top: 5, right: 5, left: -8, bottom: 0 }}>
                <defs><linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.5} /><stop offset="100%" stopColor="#10B981" stopOpacity={0.03} /></linearGradient></defs>
                <CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: '#F1F5F9' }} />
                <Area type="monotone" dataKey="total" name={t('sales.totalRevenue')} stroke="#10B981" strokeWidth={2.5} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent requests */}
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-200 text-sm">{t('sales.requests')}</h2>
            <button onClick={() => navigate('/sales/requests')} className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-0.5">{t('home.viewAll')}<Chevron size={11} aria-hidden="true" /></button>
          </div>
          {data.recent.length === 0 ? <EmptyState icon={Inbox} title={t('sales.noRequests')} dark /> : (
            <ul className="divide-y divide-[#1c2941]">
              {data.recent.map((r) => (
                <li key={r.id} className="py-2.5 flex items-center gap-2">
                  <Avatar name={r.fullName} src={r.student?.avatar} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-100 truncate">{r.fullName}</p>
                    <p className="text-[9px] text-slate-500 truncate">{localized(r.course?.title, lang)} · {formatDate(r.createdAt, locale, { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 tnum shrink-0">{egp(r.amountPaid)} / {egp(r.amountDue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
