import { useMemo } from 'react';
import { BarChart3, Download, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../i18n/index.jsx';
import { subscriptionService } from '../../services/subscriptionService';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { localized } from '../../utils/localized';
import { formatNumber } from '../../utils/format';

export default function Reports() {
  const { t, lang, locale } = useLanguage();
  const num = (n) => new Intl.NumberFormat(locale).format(n || 0);

  const data = useMemo(() => {
    const courses = courseService.getAll();
    const all = subscriptionService.getAll();
    const byCourse = courses.map((c) => {
      const reqs = all.filter((r) => r.courseId === c.id);
      const revenue = reqs.reduce((s, r) => s + (Number(r.amountPaid) || 0), 0);
      const pending = reqs.filter((r) => !['completed', 'rejected'].includes(r.stage)).length;
      return { course: localized(c.title, lang).slice(0, 26), revenue, requests: reqs.length, pending };
    }).filter((r) => r.revenue > 0 || r.requests > 0);
    const revenue = subscriptionService.monthlyRevenue(6);
    const paidTotal = all.reduce((s, r) => s + (Number(r.amountPaid) || 0), 0);
    const totalReqs = all.length;
    const paidCount = all.filter((r) => r.stage === 'paid' || r.stage === 'completed').length;
    return { byCourse, revenue, paidTotal, totalReqs, paidCount };
  }, [lang]);

  const exportCsv = () => {
    const rows = [['الدورة', 'عدد الطلبات', 'المدفوع', 'الطلبات المعلقة']];
    for (const r of data.byCourse) rows.push([r.course, String(r.requests), String(r.revenue), String(r.pending)]);
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edupulse-sales-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title={t('sales.reports')}
        subtitle={t('sales.pipelineTitle')}
        actions={<Button size="sm" icon={Download} onClick={exportCsv}>{t('sales.exportCsv')}</Button>}
      />
      <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 mb-5">
        <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2 mb-1"><Banknote size={16} className="text-emerald-400" aria-hidden="true" />{t('sales.totalRevenue')}</h2>
        <p className="text-3xl font-black text-slate-100 tnum">{num(data.paidTotal)} <span className="text-base text-slate-500">ج.م</span></p>
        <p className="text-[11px] text-slate-500 mt-1">{data.totalReqs} طلب · {data.paidCount} مدفوع</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2 mb-3"><Banknote size={16} className="text-emerald-400" aria-hidden="true" />{t('sales.monthlyRevenue')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1B2740' }} contentStyle={{ background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="total" name="الإيرادات" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2 mb-3"><Banknote size={16} className="text-emerald-400" aria-hidden="true" />{t('sales.courseRevenue')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCourse} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1c2941" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="course" width={170} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1B2740' }} contentStyle={{ background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="revenue" name="المدفوع" fill="#10B981" radius={[4, 4, 4, 4]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-2xl border border-[#1c2941] overflow-hidden mt-5">
        <table className="w-full text-xs table-auto">
          <thead className="bg-[#111a2e] text-slate-500"><tr><th className="text-start px-4 py-2.5 font-bold">{t('nav.courses')}</th><th className="text-start px-4 py-2.5 font-bold hidden sm:table-cell">{t('sales.kpiTotal')}</th><th className="text-start px-4 py-2.5 font-bold hidden md:table-cell">{t('sales.stagePartial')}</th><th className="text-start px-4 py-2.5 font-bold text-end">{t('sales.totalRevenue')}</th></tr></thead>
          <tbody className="divide-y divide-[#1c2941] bg-[#151F32]">
            {data.byCourse.map((r) => (
              <tr key={r.course} className="hover:bg-[#182238] transition-colors"><td className="px-4 py-2.5 text-slate-200 line-clamp-1">{r.course}</td><td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell tnum">{r.requests}</td><td className="px-4 py-2.5 text-amber-400 hidden md:table-cell tnum">{r.pending}</td><td className="px-4 py-2.5 text-emerald-400 font-bold tnum text-end">{num(r.revenue)} ج.م</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
