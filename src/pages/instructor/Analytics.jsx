import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { courseService } from '../../services/courseService';
import { learningService } from '../../services/learningService';
import { quizService } from '../../services/quizService';
import { storageAdapter } from '../../storage/storageAdapter';
import PageHeader from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/Feedback';
import { BarChart3 } from 'lucide-react';
import { localized } from '../../utils/localized';

const tooltipStyle = { background: '#1B2740', border: '1px solid #2c3a55', borderRadius: 12, fontSize: 12 };
const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#64748B'];

export default function Analytics() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const data = useMemo(() => {
    const trend = analyticsService.instructorEnrollmentsTrend(user.id, 6);
    const courses = courseService.getByInstructor(user.id).filter((c) => c.status === 'published');
    const completion = courses.map((c) => ({ name: (localized(c.title, lang) || '').slice(0, 24), rate: c.enrollmentCount ? Math.round((c.completionCount / c.enrollmentCount) * 100) : 0 }));
    const progressBuckets = [
      { name: '0%', value: 0 }, { name: '1–25%', value: 0 }, { name: '26–50%', value: 0 }, { name: '51–75%', value: 0 }, { name: '76–99%', value: 0 }, { name: '100%', value: 0 },
    ];
    const enrollments = storageAdapter.getCollection('enrollments').filter((e) => courses.some((c) => c.id === e.courseId));
    for (const e of enrollments) {
      const p = learningService.getProgress(e.studentId, e.courseId).percentage;
      if (p === 0) progressBuckets[0].value++;
      else if (p <= 25) progressBuckets[1].value++;
      else if (p <= 50) progressBuckets[2].value++;
      else if (p <= 75) progressBuckets[3].value++;
      else if (p < 100) progressBuckets[4].value++;
      else progressBuckets[5].value++;
    }
    const quizPerf = quizService.getAll().filter((q) => courses.some((c) => c.id === q.courseId)).map((q) => {
      const attempts = quizService.getAttempts(q.id);
      const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
      return { name: (localized(q.title, lang) || '').slice(0, 22), avg };
    });
    return { trend, completion, progressBuckets, quizPerf, hasData: enrollments.length > 0 };
  }, [user.id, lang]);

  if (!data.hasData) {
    return <div><PageHeader title={t('instructor.analyticsTitle')} subtitle={t('instructor.analyticsSubtitle')} /><EmptyState icon={BarChart3} title={t('instructor.noAnalytics')} /></div>;
  }

  return (
    <div>
      <PageHeader title={t('instructor.analyticsTitle')} subtitle={t('instructor.analyticsSubtitle')} />
      <div className="grid xl:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3">{t('instructor.enrollmentsTrend')}</h2>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}><CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#F1F5F9' }} /><Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fill="#10B98133" /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3">{t('instructor.completionRates')}</h2>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.completion} layout="vertical" margin={{ left: 8 }}><CartesianGrid stroke="#1c2941" horizontal={false} /><XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={150} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#1B2740' }} contentStyle={tooltipStyle} /><Bar dataKey="rate" name="%" fill="#3B82F6" radius={[4, 4, 4, 4]} barSize={12} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3">{t('instructor.studentProgressDist')}</h2>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.progressBuckets} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>{data.progressBuckets.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend iconType="circle" iconSize={8} /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5">
          <h2 className="font-bold text-slate-200 text-sm mb-3">{t('instructor.quizPerformanceChart')}</h2>
          {data.quizPerf.length === 0 ? <p className="text-xs text-slate-500 py-10 text-center">{t('common.noData')}</p> : (
            <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.quizPerf} margin={{ left: -12 }}><CartesianGrid stroke="#1c2941" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#1B2740' }} contentStyle={tooltipStyle} /><Bar dataKey="avg" name="%" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={26} /></BarChart></ResponsiveContainer></div>
          )}
        </div>
      </div>
    </div>
  );
}
