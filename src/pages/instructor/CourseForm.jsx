import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../i18n/index.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { Input, Textarea, Select, FormField } from '../../components/common/FormControls';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { localized } from '../../utils/localized';

const linesToArray = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

// Course authoring form — ARABIC ONLY (single-language product decision).
// The storage data model keeps {ar, en}; the Arabic text is mirrored into `en` automatically.
export default function CourseForm() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const { t, lang, isRTL } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const categories = useMemo(() => categoryService.getActive(), []);
  const existing = useMemo(() => (isEdit ? courseService.getById(courseId) : null), [courseId, isEdit]);
  const ownershipError = existing && existing.instructorId !== user.id;

  const schema = z.object({
    title: z.string().trim().min(4, t('validation.minLength', { min: 4 })),
    shortDescription: z.string().trim().min(10, t('validation.minLength', { min: 10 })),
    description: z.string().trim().min(20, t('validation.minLength', { min: 20 })),
    thumbnail: z.string().trim().url(t('validation.invalidUrl')).or(z.literal('')).optional(),
    categoryId: z.string().min(1, t('validation.selectRequired')),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedDuration: z.coerce.number().int().min(1, t('validation.minValue', { min: 1 })).max(52, t('validation.maxValue', { max: 52 })),
    estimatedHours: z.coerce.number().int().min(1, t('validation.minValue', { min: 1 })).max(2000),
    projectCount: z.coerce.number().int().min(0).max(100),
    price: z.coerce.number().int().min(0, t('validation.minValue', { min: 0 })).max(1000000, t('validation.maxValue', { max: 1000000 })),
    discount: z.coerce.number().int().min(0, t('validation.minValue', { min: 0 })).max(100, t('validation.maxValue', { max: 100 })),
    objectives: z.string(),
    prereqs: z.string(),
    requirements: z.string(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { difficulty: 'beginner', categoryId: '' } });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title?.ar || '',
        shortDescription: existing.shortDescription?.ar || '',
        description: existing.description?.ar || '',
        thumbnail: existing.thumbnail || '', categoryId: existing.categoryId || '',
        difficulty: existing.difficulty || 'beginner', estimatedDuration: existing.estimatedDuration || 6, estimatedHours: existing.estimatedHours || 40, projectCount: existing.projectCount ?? 2, price: existing.price ?? 4500, discount: existing.discount ?? 0,
        objectives: arrayToLines(existing.learningObjectives?.ar),
        prereqs: arrayToLines(existing.prerequisites?.ar),
        requirements: arrayToLines(existing.requirements?.ar),
      });
    }
  }, [existing, reset]);

  if (isEdit && !existing) return <div className="text-center py-20 text-slate-400">{t('errors.generic')}</div>;
  if (ownershipError) return <div className="text-center py-20 text-red-400 font-bold">{t('errors.generic')}</div>;

  const onSubmit = (values) => {
    const ar = { title: values.title, shortDescription: values.shortDescription, description: values.description };
    const payload = {
      title: { ar: ar.title, en: ar.title },
      shortDescription: { ar: ar.shortDescription, en: ar.shortDescription },
      description: { ar: ar.description, en: ar.description },
      thumbnail: values.thumbnail || '',
      categoryId: values.categoryId, difficulty: values.difficulty,
      estimatedDuration: Number(values.estimatedDuration),
      estimatedHours: Number(values.estimatedHours),
      projectCount: Number(values.projectCount),
      price: Number(values.price),
      discount: Number(values.discount),
      learningObjectives: { ar: linesToArray(values.objectives), en: linesToArray(values.objectives) },
      prerequisites: { ar: linesToArray(values.prereqs), en: linesToArray(values.prereqs) },
      requirements: { ar: linesToArray(values.requirements), en: linesToArray(values.requirements) },
    };
    if (isEdit) {
      const res = courseService.update(courseId, payload, { requesterId: user.id, requesterRole: user.role });
      if (res.ok) toast.success(t('instructor.courseSaved')); else toast.error(t('errors.generic'));
    } else {
      const res = courseService.create(payload, { requesterId: user.id, requesterRole: user.role });
      if (res.ok) {
        toast.success(t('instructor.courseCreated'));
        navigate(`/instructor/courses/${res.course.id}/curriculum`);
      } else toast.error(t('errors.generic'));
    }
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={isEdit ? t('instructor.editCourse') : t('instructor.createCourse')}
        subtitle={isEdit ? localized(existing?.title, lang) : t('instructor.coursesSubtitle')}
        actions={<Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-100"><BackIcon size={14} aria-hidden="true" />{t('instructor.backToCourses')}</Link>}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-[#1c2941] bg-[#151F32] p-5 sm:p-7 grid gap-5" dir="rtl">
        {/* Arabic-only fields */}
        <div className="grid gap-4">
          <FormField dark label={t('instructor.titleAr')} htmlFor="title" required error={errors.title?.message}><Input dark id="title" invalid={!!errors.title} {...register('title')} /></FormField>
          <FormField dark label={t('instructor.shortDescAr')} htmlFor="shortDescription" required error={errors.shortDescription?.message}><Input dark id="shortDescription" invalid={!!errors.shortDescription} {...register('shortDescription')} /></FormField>
          <FormField dark label={t('instructor.descAr')} htmlFor="description" required error={errors.description?.message}><Textarea dark id="description" rows={4} invalid={!!errors.description} {...register('description')} /></FormField>
        </div>

        {/* Shared settings */}
        <div className="grid sm:grid-cols-2 gap-4 border-t border-[#1c2941] pt-5">
          <div className="sm:col-span-2">
            <FormField dark label={t('instructor.thumbnail')} htmlFor="thumbnail" hint={t('instructor.thumbnailHint')} error={errors.thumbnail?.message}><Input dark id="thumbnail" type="url" placeholder="https://…" invalid={!!errors.thumbnail} {...register('thumbnail')} /></FormField>
          </div>
          <FormField dark label={t('instructor.category')} htmlFor="categoryId" required error={errors.categoryId?.message}>
            <Select dark id="categoryId" invalid={!!errors.categoryId} {...register('categoryId')}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.ar}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField dark label={t('instructor.difficulty')} htmlFor="difficulty">
              <Select dark id="difficulty" {...register('difficulty')}>
                <option value="beginner">{t('courses.levels.beginner')}</option>
                <option value="intermediate">{t('courses.levels.intermediate')}</option>
                <option value="advanced">{t('courses.levels.advanced')}</option>
              </Select>
            </FormField>
            <FormField dark label={t('instructor.duration')} htmlFor="estimatedDuration" required error={errors.estimatedDuration?.message}>
              <Input dark id="estimatedDuration" type="number" min={1} max={52} dir="ltr" className="text-start" invalid={!!errors.estimatedDuration} {...register('estimatedDuration')} />
            </FormField>
            <FormField dark label={t('instructor.hours')} htmlFor="estimatedHours" required error={errors.estimatedHours?.message}>
              <Input dark id="estimatedHours" type="number" min={1} max={2000} dir="ltr" className="text-start" invalid={!!errors.estimatedHours} {...register('estimatedHours')} />
            </FormField>
          </div>
          <FormField dark label={t('instructor.projects')} htmlFor="projectCount" required error={errors.projectCount?.message}>
            <Input dark id="projectCount" type="number" min={0} max={100} dir="ltr" className="text-start" {...register('projectCount')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField dark label="السعر (ج.م)" htmlFor="price" required error={errors.price?.message}>
              <Input dark id="price" type="number" min={0} max={1000000} dir="ltr" className="text-start tnum" {...register('price')} />
            </FormField>
            <FormField dark label="نسبة الخصم % (اختياري)" htmlFor="discount" hint="اكتب 0 لو مفيش خصم" error={errors.discount?.message}>
              <Input dark id="discount" type="number" min={0} max={100} dir="ltr" className="text-start tnum" {...register('discount')} />
            </FormField>
          </div>
        </div>

        {/* Objectives / prerequisites / requirements */}
        <div className="grid gap-4 border-t border-[#1c2941] pt-5">
          <FormField dark label={t('instructor.objectivesAr')} htmlFor="objectives"><Textarea dark id="objectives" rows={4} dir="rtl" {...register('objectives')} /></FormField>
          <FormField dark label={t('instructor.prereqsAr')} htmlFor="prereqs"><Textarea dark id="prereqs" rows={3} dir="rtl" {...register('prereqs')} /></FormField>
          <FormField dark label={t('instructor.requirementsAr')} htmlFor="requirements"><Textarea dark id="requirements" rows={3} dir="rtl" {...register('requirements')} /></FormField>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#1c2941] pt-5">
          <Link to="/instructor/courses"><Button variant="secondary-dark">{t('common.cancel')}</Button></Link>
          <Button type="submit" loading={isSubmitting} icon={isEdit ? Save : GraduationCap} size="lg">{isEdit ? t('common.save') : t('instructor.createCourse')}</Button>
        </div>
      </form>
    </div>
  );
}
