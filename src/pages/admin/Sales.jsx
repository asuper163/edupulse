import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Banknote, Inbox, Phone, BadgeCheck, Wallet, CircleDollarSign, Receipt, Download, Search, Percent, Files } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { Input, Select } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import { formatPrice, formatNumber, formatDate } from '../../utils/format';
import { localized } from '../../utils/localized';

const tooltipStyle = { background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 };
const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#14B8A6', '#F97316'];
const stageTone = { new: 'text-amber-400', contacted: 'text-sky-400', partial: 'text-amber-400', paid: 'text-sky-400', completed: 'text-emerald-400', rejected: 'text-red-400' };
const stageDot = { new: 'bg-amber-400', contacted: 'bg-sky-400', partial: 'bg-amber-400', paid: 'bg-sky-400', completed: 'bg-emerald-400', rejected: 'bg-red-400' };

export default function AdminSales() {
  const { t, lang, locale } = useLanguage();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');

  const stats = useMemo(() => subscriptionService.stats(), []);
  const monthly = useMemo(() => subscriptionService.monthlyRevenue(6), []);
  const requests = useMemo(() => subscriptionService.getAll({ stage, query }), [stage, query]);
  const courseRows = useMemo(() => {
    const map = new Map();
    for (const r of subscriptionService.getAll()) {
      const c = map.get(r.courseId) || { courseId: r.courseId, requests: 0, completed: 0, due: 0, paid: 0 };
      c.requests += 1;
      if (r.stage === 'completed') c.completed += 1;
      c.due += Number(r.amountDue) || 0;
      c.paid += Number(r.amountPaid) || 0;
      map.set(r.courseId, c);
    }
    return [...map.values()]
      .map((c) => {
        const course = courseService.getById(c.courseId);
        const outstanding = Math.max(0, c.due - c.paid);
        return { ...c, title: localized(course?.title, lang) || c.courseId, outstanding, rate: c.due ? Math.round((c.paid / c.due) * 100) : 0 };
      })
      .sort((a, b) => b.paid - a.paid);
  }, [lang]);
  const payments = useMemo(() => reportService.build('payments'), []);
  const num = (n) => formatNumber(n, locale);
  const money = (n) => formatPrice(n, locale);
  const collectRate = stats.dueTotal > 0 ? Math.round((stats.paidTotal / stats.dueTotal) * 100) : 0;
  const stageKey = (s) => `sales.stage${s[0].toUpperCase()}${s.slice(1)}`;

  const exportAll = () => {
    if (reportService.downloadCsv('sales')) toast.success(t('admin.reportGenerated'));
    else toast.info(t('admin.noReportData'));
  };
  const exportPayments = () => {
    if (reportService.downloadCsv('payments')) toast.success(t('admin.reportGenerated'));
    else toast.info(t('admin.noReportData'));
  };

  return (
    <div>
      <PageHeader
        title={t('admin.salesCrm')}
        subtitle="كل بيانات الاشتراكات والمدفوعات — نسخة الإدارة (كاش فقط)"
        actions={
          <>
            <Button size="sm" variant="secondary-dark" icon={Download} onClick={exportAll}>تصدير الطلبات</Button>
            <Button size="sm" variant="secondary-dark" icon={Receipt} onClick={exportPayments}>تصدير المدفوعات</Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Inbox} label={t('sales.kpiTotal')} value={num(stats.total)} tone="violet" hint={`${num(stats.thisMonth)} ${t('sales.kpiThisMonth')}`} />
        <StatCard icon={Phone} label={t('sales.kpiNew')} value={num(stats.byStage.new || 0)} tone="amber" hint={`${num(stats.byStage.contacted || 0)} ${t('sales.stageContacted')}`} />
        <StatCard icon={BadgeCheck} label={t('sales.kpiCompleted')} value={num(stats.byStage.completed || 0)} tone="emerald" hint={`${num(stats.byStage.rejected || 0)} ${t('sales.stageRejected')}`} />
        <StatCard icon={Percent} label="معدل التحصيل" value={collectRate} suffix="%" tone="sky" hint="المدفوع / المطلوب" />
        <StatCard icon={CircleDollarSign} label={t('sales.amountDue')} value={num(stats.dueTotal)} suffix=" ج.م" tone="amber" />
        <StatCard icon={Banknote} label={t('sales.kpiRevenue')} value={num(stats.paidTotal)} suffix=" ج.م" tone="emerald" />
        <StatCard icon={Wallet} label={t('sales.kpiOutstanding')} value={num(stats.outstanding)} suffix=" ج.م" tone="amber" hint="المطلوب − المدفوع" />
        <StatCard icon={Files} label={t('admin.reportSales')} value={num(courseRows.length)} tone="sky" hint="دورة محسوبة" />
      </div>

      <div className="grid xl:grid-cols-3 gap-5 mb-6">
        {/* Monthly revenue */}
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3 inline-flex items-center gap-2"><Banknote size={15} className="text-emerald-400" aria-hidden="true" />{t('sales.monthlyRevenue')}</h2>
          <div className="h-44"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{ left: -12 }}><CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#1B2740' }} contentStyle={tooltipStyle} /><Bar dataKey="total" name={t('sales.kpiRevenue')} fill="#10B981" radius={[5, 5, 0, 0]} barSize={22} /></BarChart></ResponsiveContainer></div>
        </div>

        {/* Revenue by course */}
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3">{t('sales.courseRevenue')}</h2>
          <div className="h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={courseRows} dataKey="paid" nameKey="title" innerRadius={36} outerRadius={60} paddingAngle={2}>{courseRows.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(v), t('sales.kpiRevenue')]} /></PieChart></ResponsiveContainer></div>
        </div>

        {/* Recent payments */}
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-2">آخر ٨ مدفوعات</h2>
          <ul className="divide-y divide-[#1c2941]">
            {payments.slice(0, 8).map((p, i) => (
              <li key={i} className="flex items-center gap-2 py-2 text-[11px]">
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-slate-100 truncate">{p.student}</span>
                  <span className="block text-[9px] text-slate-500 truncate">{p.course_ar}</span>
                </span>
                <span className="text-emerald-400 font-black tnum shrink-0">{money(p.amount)}</span>
                <span className="text-[8px] text-slate-600 shrink-0 w-14 text-end" dir="ltr">{p.date}</span>
              </li>
            ))}
            {payments.length === 0 && <li className="py-6 text-center text-xs text-slate-500">{t('common.noData')}</li>}
          </ul>
        </div>
      </div>

      {/* Per-course performance */}
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 mb-6">
        <h2 className="font-bold text-slate-200 text-sm mb-3">{t('sales.courseRevenue')} — بالتفصيل</h2>
        <div className="overflow-auto">
          <table className="w-full text-[11px] table-auto">
            <thead className="bg-[#111a2e] text-slate-500"><tr>
              <th className="text-start px-3 py-2 font-bold">الدورة</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.kpiTotal')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.kpiCompleted')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.amountDue')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.amountPaid')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.outstanding')}</th>
              <th className="text-start px-3 py-2 font-bold">التحصيل</th>
            </tr></thead>
            <tbody className="divide-y divide-[#1c2941]">
              {courseRows.map((c) => (
                <tr key={c.courseId} className="hover:bg-[#182238]">
                  <td className="px-3 py-2 font-bold text-slate-100 max-w-72"><span className="line-clamp-1">{c.title}</span></td>
                  <td className="px-3 py-2 text-slate-300 tnum">{num(c.requests)}</td>
                  <td className="px-3 py-2 text-slate-300 tnum">{num(c.completed)}</td>
                  <td className="px-3 py-2 text-slate-300 tnum">{num(c.due)}</td>
                  <td className="px-3 py-2 text-emerald-400 tnum">{num(c.paid)}</td>
                  <td className="px-3 py-2 text-amber-400 tnum">{num(c.outstanding)}</td>
                  <td className="px-3 py-2 text-slate-300 tnum">{c.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full requests ledger */}
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[#1c2941]">
          <div>
            <h2 className="font-bold text-slate-200 text-sm">كل الطلبات</h2>
            <p className="text-[10px] text-slate-500 tnum">{requests.length} نتيجة</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input dark icon={Search} placeholder={t('sales.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} className="sm:w-64" />
            <Select dark value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Filter stage" className="sm:w-44">
              <option value="">{t('common.all')}</option>
              <option value="new">{t('sales.stageNew')}</option>
              <option value="contacted">{t('sales.stageContacted')}</option>
              <option value="partial">{t('sales.stagePartial')}</option>
              <option value="paid">{t('sales.stagePaid')}</option>
              <option value="completed">{t('sales.stageCompleted')}</option>
              <option value="rejected">{t('sales.stageRejected')}</option>
            </Select>
          </div>
        </div>
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full text-[11px] table-auto">
            <thead className="bg-[#111a2e] sticky top-0 text-slate-500"><tr>
              <th className="text-start px-3 py-2 font-bold">الطالب</th>
              <th className="text-start px-3 py-2 font-bold">الدورة</th>
              <th className="text-start px-3 py-2 font-bold">المرحلة</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.amountDue')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.amountPaid')}</th>
              <th className="text-start px-3 py-2 font-bold">{t('sales.outstanding')}</th>
              <th className="text-start px-3 py-2 font-bold">التاريخ</th>
            </tr></thead>
            <tbody className="divide-y divide-[#1c2941]">
              {requests.slice(0, 200).map((r) => {
                const course = courseService.getById(r.courseId);
                const outstanding = Math.max(0, (Number(r.amountDue) || 0) - (Number(r.amountPaid) || 0));
                return (
                  <tr key={r.id} className="hover:bg-[#182238]">
                    <td className="px-3 py-2"><span className="block font-bold text-slate-100">{r.fullName}</span><span className="block text-[9px] text-slate-500" dir="ltr">{r.phone} · {r.email}</span></td>
                    <td className="px-3 py-2 text-slate-300 max-w-56"><span className="line-clamp-1">{localized(course?.title, lang)}</span></td>
                    <td className="px-3 py-2"><span className={`inline-flex items-center gap-1.5 ${stageTone[r.stage] || 'text-slate-400'}`}><span className={`w-1.5 h-1.5 rounded-full ${stageDot[r.stage] || 'bg-slate-500'}`} aria-hidden="true" />{t(stageKey(r.stage))}</span></td>
                    <td className="px-3 py-2 text-slate-300 tnum">{num(r.amountDue)}</td>
                    <td className="px-3 py-2 text-emerald-400 tnum">{num(r.amountPaid)}</td>
                    <td className="px-3 py-2 text-amber-400 tnum">{num(outstanding)}</td>
                    <td className="px-3 py-2 text-slate-500 tnum">{formatDate(r.createdAt, locale)}</td>
                  </tr>
                );
              })}
              {requests.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-xs text-slate-500">{t('common.noData')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
