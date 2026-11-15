// EDUPULSE demo dataset generator — realistic, Arabic, referentially valid.
// Deterministic (seeded RNG) so reseeding produces the same dataset.
// Catalog modeled on EraaSoft (https://www.eraasoft.com/) — the 9 diploma programs are
// listed with the same names / durations / hours / projects as the reference site:
// AI Diploma (32w,210h,10p) · Front-End (18w,160h,5p) · Back-End Node.JS (16w,140h,6p)
// Back-End .NET (17w,160h,5p) · Back-End PHP (16w,120h,5p) · Back-End Java (32w,300h,9p)
// Data Analysis (16w,120h,4p) · UI/UX Design (12w,90h,2p) · CS8 Program (9w,64h,4p)
// NOTE: curriculum content is self-authored for EDUPULSE (not copied from the reference).

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261114);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const daysAgo = (d, h = 12) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, Math.floor(rnd() * 60), 0, 0);
  return dt.toISOString();
};
const iso = () => new Date().toISOString();

// ── Categories (8) ───────────────────────────────────────────────────
const categories = [
  { id: 'cat_prog', slug: 'programming-web', icon: 'Code2', name: { ar: 'البرمجة وتطوير الويب', en: 'Programming & Web Development' }, description: { ar: 'تعلّم بناء مواقع وتطبيقات الويب من الصفر حتى الاحتراف', en: 'Learn to build websites and web apps from zero to pro' }, status: 'active', createdAt: daysAgo(400), updatedAt: daysAgo(30) },
  { id: 'cat_design', slug: 'design-graphics', icon: 'Palette', name: { ar: 'التصميم والجرافيك', en: 'Design & Graphics' }, description: { ar: 'واجهات المستخدم، الهوية البصرية والتصميم الجرافيكي', en: 'UI design, visual identity and graphic design' }, status: 'active', createdAt: daysAgo(400), updatedAt: daysAgo(28) },
  { id: 'cat_marketing', slug: 'digital-marketing', icon: 'Megaphone', name: { ar: 'التسويق الرقمي', en: 'Digital Marketing' }, description: { ar: 'استراتيجيات التسويق الحديث عبر المنصات الرقمية', en: 'Modern marketing strategies across digital channels' }, status: 'active', createdAt: daysAgo(390), updatedAt: daysAgo(26) },
  { id: 'cat_business', slug: 'business-management', icon: 'Briefcase', name: { ar: 'إدارة الأعمال', en: 'Business Management' }, description: { ar: 'ريادة الأعمال، الإدارة والاستراتيجية', en: 'Entrepreneurship, management and strategy' }, status: 'active', createdAt: daysAgo(380), updatedAt: daysAgo(22) },
  { id: 'cat_data', slug: 'data-analysis', icon: 'BarChart3', name: { ar: 'تحليل البيانات', en: 'Data Analysis' }, description: { ar: 'تحليل البيانات واتخاذ قرارات مبنية على الأرقام', en: 'Data analysis and data-driven decision making' }, status: 'active', createdAt: daysAgo(370), updatedAt: daysAgo(20) },
  { id: 'cat_ai', slug: 'artificial-intelligence', icon: 'BrainCircuit', name: { ar: 'الذكاء الاصطناعي', en: 'Artificial Intelligence' }, description: { ar: 'تعلم الآلة، الشبكات العصبية وتطبيقات الذكاء الاصطناعي', en: 'Machine learning, neural networks and AI applications' }, status: 'active', createdAt: daysAgo(360), updatedAt: daysAgo(18) },
  { id: 'cat_personal', slug: 'personal-development', icon: 'Sparkles', name: { ar: 'المهارات الشخصية', en: 'Personal Development' }, description: { ar: 'التواصل، القيادة وتطوير الذات', en: 'Communication, leadership and self-growth' }, status: 'active', createdAt: daysAgo(350), updatedAt: daysAgo(15) },
  { id: 'cat_tech', slug: 'technology', icon: 'Cpu', name: { ar: 'التكنولوجيا', en: 'Technology' }, description: { ar: 'أمن المعلومات، الحوسبة السحابية وأحدث التقنيات', en: 'Infosec, cloud computing and emerging tech' }, status: 'active', createdAt: daysAgo(340), updatedAt: daysAgo(12) },
];

// ── Users (1 admin + 4 instructors + 20 students) ────────────────────
const users = [
  { id: 'usr_admin', name: 'Admin EDUPULSE', email: 'admin@edupulse.demo', password: 'Admin123', role: 'admin', avatar: '', bio: 'مدير منصة EDUPULSE — مسؤول عن مراجعة المحتوى وإدارة المنصة.', phone: '', status: 'active', createdAt: daysAgo(400), updatedAt: daysAgo(400) },
  { id: 'usr_ins_1', name: 'سارة محمود', email: 'instructor@edupulse.demo', password: 'Demo123', role: 'instructor', avatar: 'https://i.pravatar.cc/300?img=47', bio: 'مهندسة برمجيات أولى بخبرة 9 سنوات في تطوير الويب والجافاسكريبت. هدفي تبسيط البرمجة للناطقين بالعربية.', phone: '01012345678', status: 'active', createdAt: daysAgo(400), updatedAt: daysAgo(60) },
  { id: 'usr_ins_2', name: 'Omar Fathi', email: 'omar@edupulse.demo', password: 'Demo123', role: 'instructor', avatar: 'https://i.pravatar.cc/300?img=12', bio: 'UI/UX designer & front-end enthusiast. أؤمن بأن التصميم الجيد يبدأ من فهم المستخدم.', phone: '', status: 'active', createdAt: daysAgo(390), updatedAt: daysAgo(55) },
  { id: 'usr_ins_3', name: 'ليان القحطاني', email: 'layan@edupulse.demo', password: 'Demo123', role: 'instructor', avatar: 'https://i.pravatar.cc/300?img=45', bio: 'مستشارة تسويق رقمي وتحليل بيانات. أساعد العلامات التجارية العربية على النمو رقمياً.', phone: '01198765432', status: 'active', createdAt: daysAgo(380), updatedAt: daysAgo(40) },
  { id: 'usr_ins_4', name: 'Karim Adel', email: 'karim@edupulse.demo', password: 'Demo123', role: 'instructor', avatar: 'https://i.pravatar.cc/300?img=59', bio: 'مهندس ذكاء اصطناعي وأمن سيبراني. أحب تبسيط الخوارزميات المعقدة للجميع.', phone: '', status: 'active', createdAt: daysAgo(370), updatedAt: daysAgo(33) },
  { id: 'usr_sales', name: 'محمود شوقي', email: 'sales@edupulse.demo', password: 'Demo123', role: 'sales', avatar: 'https://i.pravatar.cc/300?img=68', bio: 'مسؤول الاشتراكات — يتابع طلبات الاشتراك الواردة، يدير التواصل مع العملاء، ويسجل المدفوعات.', phone: '01055551234', status: 'active', createdAt: daysAgo(350), updatedAt: daysAgo(10) },
];

const studentNames = ['أحمد حسن', 'Mariam Youssef', 'يوسف إبراهيم', 'Hana Tarek', 'محمود عادل', 'Sara Gamal', 'عمر خالد', 'Nour El-Din', 'جنى محمد', 'Ziad Mahmoud', 'ريم فؤاد', 'Youssef Nabil', 'سلمى طارق', 'Ahmed Ramy', 'ملك أيمن', 'Farah Adel', 'زياد سامي', 'Karim Mostafa', 'دانا وليد', 'Amr Hany'];
for (let i = 0; i < 20; i++) {
  const isDemo = i === 0;
  users.push({
    id: `usr_stu_${String(i + 1).padStart(2, '0')}`,
    name: studentNames[i],
    email: isDemo ? 'student@edupulse.demo' : `student${i + 1}@edupulse.demo`,
    password: 'Demo123',
    role: 'student',
    avatar: `https://i.pravatar.cc/300?img=${i + 3}`,
    bio: '',
    phone: '',
    status: i === 19 ? 'suspended' : 'active',
    createdAt: daysAgo(360 - i * 14),
    updatedAt: daysAgo(360 - i * 14),
  });
}

// ── Course catalog — 9 EraaSoft programs (same names/durations/hours/projects) ──
const THUMB = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const arEn = (ar) => ({ ar, en: ar });

const courseBlueprints = [
  { id: 'crs_001', cat: 'cat_ai', ins: 'usr_ins_4', diff: 'advanced', weeks: 32, hours: 210, projects: 10, featured: true, price: 14000, discount: 0, thumb: THUMB('1677442136019-21780ecad995'),
    title: arEn('دبلومة الذكاء الاصطناعي (AI Diploma)'),
    short: arEn('من الصفر لحد ما تبقى AI Engineer جاهز لسوق العمل'),
    desc: arEn('رحلة تدريبية عملية تركز على التطبيق المباشر وتعلمك بناء تطبيقات الذكاء الاصطناعي من الصفر حتى بناء نماذج Machine Learning وDeep Learning وNLP، مع متابعة متخصصة ومشاريع حقيقية تحاكي متطلبات السوق.'),
    objectives: { ar: ['التفكير والتطبيق البرمجي للذكاء الاصطناعي', 'بناء نماذج Machine Learning وDeep Learning وNLP', 'نشر النماذج على Docker والسحابة وMLOps', 'بناء محفظة 10 مشاريع احترافية'], en: ['التفكير والتطبيق البرمجي للذكاء الاصطناعي', 'بناء نماذج Machine Learning وDeep Learning وNLP', 'نشر النماذج على Docker والسحابة وMLOps', 'بناء محفظة 10 مشاريع احترافية'] },
    prereqs: { ar: ['شغف التعلم والالتزام بالممارسة اليومية'], en: ['شغف التعلم والالتزام بالممارسة اليومية'] },
    lessons: [[12, 'الذكاء الاصطناعي', 'AI Diploma']] },
  { id: 'crs_002', cat: 'cat_prog', ins: 'usr_ins_1', diff: 'intermediate', weeks: 18, hours: 160, projects: 5, featured: true, price: 7500, discount: 0, thumb: THUMB('1498050108023-c5249f4df085'),
    title: arEn('تطوير الواجهة الأمامية (Front-End Development)'),
    short: arEn('من الصفر حتى بناء مشاريع كاملة بـ HTML/CSS/JS وReact'),
    desc: arEn('تعلم رحلة الـ Front-End من الصفر: HTML وCSS وجافاسكريبت، ثم تقنيات متقدمة مثل React وNext.js مع تطبيق عملي على كل مرحلة ومشاريع حقيقية تبني بيها معرض أعمال يفتح لك فرص شغل حقيقية.'),
    objectives: { ar: ['بناء صفحات احترافية بـ HTML/CSS', 'إتقان جافاسكريبت وأساسيات التفكير البرمجي', 'إتقان React وNext.js وأدوات الحل', 'بناء Portfolio يفتح فرص شغل حقيقية'], en: ['بناء صفحات احترافية بـ HTML/CSS', 'إتقان جافاسكريبت وأساسيات التفكير البرمجي', 'إتقان React وNext.js وأدوات الحل', 'بناء Portfolio يفتح فرص شغل حقيقية'] },
    prereqs: { ar: ['لا توجد متطلبات'], en: ['لا توجد متطلبات'] },
    lessons: [[11, 'الواجهة الأمامية', 'Front-End']] },
  { id: 'crs_003', cat: 'cat_prog', ins: 'usr_ins_1', diff: 'intermediate', weeks: 16, hours: 140, projects: 6, featured: true, price: 7500, discount: 0, thumb: THUMB('1555066931-4365d14bab8c'),
    title: arEn('باك إند (Node.JS)'),
    short: arEn('بناء سيرفرات وقواعد بيانات و APIs مؤمنة بالكامل'),
    desc: arEn('رحلة متكاملة تبني فيها سيرفرات قوية، وتصمم قواعد بيانات SQL وNoSQL، وتؤمن وتعمل Deploy للـ APIs من الصفر حتى الاحتراف بأدوات Node.js الحديثة.'),
    objectives: { ar: ['تصميم وبناء REST APIs احترافية', 'إتقان قواعد البيانات SQL وNoSQL', 'تأمين الـ APIs من الاختراقات الشائعة', 'نشر وإدارة التطبيقات في الإنتاج'], en: ['تصميم وبناء REST APIs احترافية', 'إتقان قواعد البيانات SQL وNoSQL', 'تأمين الـ APIs من الاختراقات الشائعة', 'نشر وإدارة التطبيقات في الإنتاج'] },
    prereqs: { ar: ['أساسيات جافاسكريبت'], en: ['أساسيات جافاسكريبت'] },
    lessons: [[11, 'باك إند', 'Back-End']] },
  { id: 'crs_004', cat: 'cat_prog', ins: 'usr_ins_4', diff: 'advanced', weeks: 17, hours: 160, projects: 5, featured: false, price: 8000, discount: 10, thumb: THUMB('1550751827-4bd374c3f58b'),
    title: arEn('دبلومة باك إند دوت نت (.NET Diploma)'),
    short: arEn('أنظمة ويب احترافية وفق أعلى معايير سوق العمل'),
    desc: arEn('برنامج تدريبي عملي يركز على تطوير أنظمة ويب احترافية باستخدام .NET وتقنيات الـ Back-End الحديثة، من خلال مشاريع تطبيقية تحاكي بيئة العمل وتجعلك مطوراً قادراً على بناء حلول قابلة للتوسع.'),
    objectives: { ar: ['بناء أنظمة ويب احترافية بـ ASP.NET Core', 'التعامل مع قواعد البيانات عبر Entity Framework', 'تطبيق معايير الجودة وقابلية التوسع', 'العمل ضمن فريق بمنهجية Agile'], en: ['بناء أنظمة ويب احترافية بـ ASP.NET Core', 'التعامل مع قواعد البيانات عبر Entity Framework', 'تطبيق معايير الجودة وقابلية التوسع', 'العمل ضمن فريق بمنهجية Agile'] },
    prereqs: { ar: ['أساسيات البرمجة', 'أساسيات قواعد البيانات مفيدة'], en: ['أساسيات البرمجة', 'أساسيات قواعد البيانات مفيدة'] },
    lessons: [[11, 'دوت نت', '.NET']] },
  { id: 'crs_005', cat: 'cat_prog', ins: 'usr_ins_1', diff: 'intermediate', weeks: 16, hours: 120, projects: 5, featured: false, price: 7500, discount: 0, thumb: THUMB('1571171637578-41bc2f41cd2e'),
    title: arEn('باك إند PHP'),
    short: arEn('بناء أنظمة ومواقع كاملة بـ PHP وقواعد البيانات'),
    desc: arEn('برنامج عملي يركز على بناء أنظمة ومواقع ويب باستخدام PHP وقواعد البيانات، من خلال تطبيق مباشر على مشاريع حقيقية وخطة خطوة بخطوة مع متابعة مستمرة.'),
    objectives: { ar: ['بناء تطبيقات ويب كاملة بـ PHP', 'التعامل مع قواعد البيانات MySQL', 'تطوير لوحات تحكم متكاملة', 'نشر التطبيقات في بيئة إنتاج'], en: ['بناء تطبيقات ويب كاملة بـ PHP', 'التعامل مع قواعد البيانات MySQL', 'تطوير لوحات تحكم متكاملة', 'نشر التطبيقات في بيئة إنتاج'] },
    prereqs: { ar: ['أساسيات البرمجة مفيدة'], en: ['أساسيات البرمجة مفيدة'] },
    lessons: [[11, 'PHP', 'PHP']] },
  { id: 'crs_006', cat: 'cat_prog', ins: 'usr_ins_4', diff: 'advanced', weeks: 32, hours: 300, projects: 9, featured: false, price: 13000, discount: 0, thumb: THUMB('1451187580459-43490279c0fa'),
    title: arEn('دبلومة باك إند جافا (Java Diploma)'),
    short: arEn('أنظمة وسيرفرات احترافية بـ Java من الصفر للاحتراف'),
    desc: arEn('اتعلم Java من الصفر مع تجربة تدريبية قوية تؤهلك لبناء أنظمة وسيرفرات احترافية باستخدام Java من خلال تطبيق عملي على مشاريع حقيقية، من التأسيس وحتى بناء تطبيقات مؤسسية كاملة.'),
    objectives: { ar: ['إتقان Java وOOP بعمق', 'بناء تطبيقات مؤسسية احترافية', 'التعامل مع قواعد البيانات والـ APIs', 'تطوير حلول بمعايير المؤسسات'], en: ['إتقان Java وOOP بعمق', 'بناء تطبيقات مؤسسية احترافية', 'التعامل مع قواعد البيانات والـ APIs', 'تطوير حلول بمعايير المؤسسات'] },
    prereqs: { ar: ['أساسيات البرمجة', 'مستوى متوسط في Java ميزة'], en: ['أساسيات البرمجة', 'مستوى متوسط في Java ميزة'] },
    lessons: [[12, 'جافا', 'Java']] },
  { id: 'crs_007', cat: 'cat_data', ins: 'usr_ins_3', diff: 'intermediate', weeks: 16, hours: 120, projects: 4, featured: true, price: 9000, discount: 0, thumb: THUMB('1551288049-bebda4e38f71'),
    title: arEn('تحليل البيانات (Data Analysis)'),
    short: arEn('من تنظيف البيانات إلى قرارات مبنية على الأرقام'),
    desc: arEn('برنامج تدريبي عملي يساعدك على اكتساب مهارات تحليل البيانات بشكل احترافي: التنظيف والتصورات والإحصاء التطبيقي ولوحات Power BI التفاعلية، مع متابعة متخصصة ومشاريع حقيقية.'),
    objectives: { ar: ['تنظيف وتحويل البيانات بـ Python وExcel', 'بناء تصورات تفاعلية معبّرة', 'إعداد تقارير ولوحات معلومات Power BI', 'اتخاذ قرارات مبنية على البيانات'], en: ['تنظيف وتحويل البيانات بـ Python وExcel', 'بناء تصورات تفاعلية معبّرة', 'إعداد تقارير ولوحات معلومات Power BI', 'اتخاذ قرارات مبنية على البيانات'] },
    prereqs: { ar: ['أساسيات استخدام الكمبيوتر والإكسل'], en: ['أساسيات استخدام الكمبيوتر والإكسل'] },
    lessons: [[11, 'تحليل البيانات', 'Data Analysis']] },
  { id: 'crs_008', cat: 'cat_design', ins: 'usr_ins_2', diff: 'beginner', weeks: 12, hours: 90, projects: 2, featured: true, price: 6500, discount: 15, thumb: THUMB('1561070791-2526d30994b5'),
    title: arEn('تصميم واجهات المستخدم (UI/UX Design)'),
    short: arEn('تعلم UI/UX عملياً من الصفر وبناء تجارب حقيقية'),
    desc: arEn('اتعلم UI/UX Design عملياً من الصفر، وافهم تجربة المستخدم من خلال تصميم تجارب وواجهات تطبيقات ومواقع احترافية، واشتغل على مشاريع حقيقية مع متابعة Mentor بيوجهك خطوة بخطوة.'),
    objectives: { ar: ['فهم مبادئ UX الأساسية', 'تصميم wireframes وprototypes بـ Figma', 'بناء design systems كاملة', 'تجهيز مشاريع جاهزة لسوق العمل'], en: ['فهم مبادئ UX الأساسية', 'تصميم wireframes وprototypes بـ Figma', 'بناء design systems كاملة', 'تجهيز مشاريع جاهزة لسوق العمل'] },
    prereqs: { ar: ['لا توجد متطلبات سوا رغبة صادقة في التعلم'], en: ['لا توجد متطلبات سوا رغبة صادقة في التعلم'] },
    lessons: [[9, 'التصميم', 'UI/UX Design']] },
  { id: 'crs_009', cat: 'cat_prog', ins: 'usr_ins_1', diff: 'beginner', weeks: 9, hours: 64, projects: 4, featured: false, price: 4500, discount: 20, thumb: THUMB('1626785774625-6b799315345d'),
    title: arEn('برنامج أساسيات البرمجة (CS8 Program)'),
    short: arEn('من التفكير المنطقي إلى أول سطر كود بثقة'),
    desc: arEn('برنامج يُعرّفك على أساسيات البرمجة من مبادئ كتابة الأكواد والتفكير المنطقي خطوة بخطوة، يناسب المبتدئين بالكامل ويساعدك على فهم الأساسيات اللازمة لاختيار تخصصك التقني.'),
    objectives: { ar: ['فهم مبادئ كتابة الكود وحل المشكلات', 'أساسيات البرمجة (متغير–شرط–حلقة) بأي لغة', 'التفكير المنطقي والتحليلي', 'اختيار التخصص البرمجي المناسب لك'], en: ['فهم مبادئ كتابة الكود وحل المشكلات', 'أساسيات البرمجة (متغير–شرط–حلقة) بأي لغة', 'التفكير المنطقي والتحليلي', 'اختيار التخصص البرمجي المناسب لك'] },
    prereqs: { ar: ['لا توجد متطلبات'], en: ['لا توجد متطلبات'] },
    lessons: [[12, 'أساسيات البرمجة', 'CS8']] },
];

// ── Real curricula (self-authored Arabic; same structure/coverage as reference diplomas) ──
const phasesById = {
  crs_001: [
    { title: 'تهيئة البيئة وأساسيات البرمجة', lessons: ['ما هو الذكاء الاصطناعي وتطبيقاته', 'Python و Jupyter Notebook', 'المتغيرات وأنواع البيانات', 'الشروط والحلقات', 'الدوال وتقسيم الكود', 'إدارة المكتبات باستخدام pip'] },
    { title: 'هياكل البيانات', lessons: ['القوائم Lists', 'التوابل Tuples', 'المجموعات Sets', 'القواميس Dictionaries', 'الخوارزميات الأساسية', 'تعقيد الوقت والمساحة'] },
    { title: 'قواعد البيانات وSQL', lessons: ['مفاهيم قواعد البيانات العلائقية', 'أوامر SELECT وWHERE', 'ربط الجداول JOIN', 'التجميع والترتيب GROUP BY', 'التعامل مع Python و SQLite', 'نمذجة البيانات'] },
    { title: 'الرياضيات للذكاء الاصطناعي', lessons: ['الجبر الخطي للمصفوفات', 'النهايات والدوال', 'المشتقات والتدرجات', 'اللوغاريتمات والأُسس', 'الاحتمالات والتوزيع الطبيعي', 'الإحصاء الوصفي'] },
    { title: 'تعلم الآلة التقليدي', lessons: ['أنواع التعلم: إشراف وغير إشراف', 'الانحدار الخطي واللوجستي', 'مقاييس التقييم: الدقة والاستدعاء', 'خوارزمية KNN', 'أشجار القرار وRandom Forest', 'SVM وNaive Bayes', 'تنظيم النماذج والـ Regularization', 'التحقق المتقاطع Cross-validation'] },
    { title: 'التعلم العميق', lessons: ['الشبكات العصبية: الطبقات ودوال التفعيل', 'الانتشار الأمامي والخلفي', 'دوال التفعيل الشائعة', 'PyTorch: بناء أول نموذج', 'تنظيم البيانات DataLoaders', 'التحسين بـ Adam و SGD', 'BatchNorm و Dropout', 'حفظ ونشر النماذج'] },
    { title: 'معالجة اللغة الطبيعية NLP', lessons: ['تمثيل النصوص: Tokenization وEmbeddings', 'Word2Vec وفهم المعاني', 'نماذج التسلسل RNN وLSTM', 'Attention ومعمارية Transformer', 'بناء Chatbot بسيط', 'تقييم نماذج NLP'] },
    { title: 'النشر وMLOps', lessons: ['Docker لتطبيقات الذكاء الاصطناعي', 'FastAPI: تحويل النموذج إلى API', 'النشر على السحابة', 'مراقبة النماذج و MLflow', 'أخلاقيات الذكاء الاصطناعي'] },
    { title: 'المشاريع', lessons: ['مشروع 1: نموذج تصنيف صور', 'مشروع 2: مساعد ذكي للنصوص', 'مشروع 3: نظام توصية للمنتجات', 'مشروع التخرج: تطبيق AI متكامل'] },
  ],
  crs_002: [
    { title: 'أساسيات الويب', lessons: ['كيف يعمل الويب: المتصفح والخادم', 'بنية HTML5 الحديثة', 'العناصر والقوائم والجداول', 'النماذج والروابط', 'إمكانية الوصول الأساسية'] },
    { title: 'CSS والتخطيط', lessons: ['المحددات والمواصفات', 'التخطيط بـ Flexbox', 'التخطيط بـ Grid', 'التجاوب بـ Media Queries', 'المتغيرات والألوان والخطوط', 'الانتقالات والرسوم المتحركة'] },
    { title: 'جافاسكريبت الأساسية', lessons: ['المتغيرات والأنواع والعمليات', 'الشروط والحلقات', 'الدوال والنطاق Scopes', 'المصفوفات والكائنات', 'التعامل مع DOM', 'الأحداث Event Listeners', 'البرمجة غير المتزامنة Promises/async', 'جلب البيانات بـ fetch'] },
    { title: 'أدوات العمل الاحترافية', lessons: ['Git وGitHub للمبتدئين', 'العمل الجماعي وPull Requests', 'npm وإدارة الحزم', 'إعداد بيئة VS Code'] },
    { title: 'جافاسكريبت الحديثة (ES6+)', lessons: ['Destructuring وSpread', 'الوحدات ES Modules', 'Classes والوراثة', 'Template Literals', 'أساليب المصفوفات الحديثة'] },
    { title: 'React من الصفر', lessons: ['ما هي React ولماذا', 'JSX والعناصر', 'المكونات والخواص Props', 'الحالة useState', 'التأثيرات useEffect', 'القوائم والـ Keys', 'التعامل مع الأحداث', 'النماذج المتحكمة', 'React Router للتنقل', 'هوكوكس مخصصة'] },
    { title: 'إدارة الحالة', lessons: ['Context API', 'شكل الحالة العامة', 'مقدمة إلى Redux', 'أفضل ممارسات إدارة الحالة'] },
    { title: 'Next.js وSSR', lessons: ['ما هو Next.js وأنواع الـ Rendering', 'تخطيط الملفات App Router', 'ضخ البيانات على الخادم', 'تحسين الصور والـ SEO', 'النشر على Vercel'] },
    { title: 'الأداء والجودة', lessons: ['قياس الأداء بـ Lighthouse', 'تقسيم الكود والتحميل الكسول', 'أفضل ممارسات الكاش والتخزين', 'مراجعة الكود وإعادة الهيكلة'] },
    { title: 'المشاريع', lessons: ['مشروع 1: متجر إلكتروني متكامل', 'مشروع 2: لوحة تحكم تفاعلية', 'مشروع التخرج: تطبيق ويب للمؤسسة'] },
  ],
  crs_003: [
    { title: 'أساسيات الخادم وNode.js', lessons: ['ما هو Node.js ولماذا يهم', 'npm وpackage.json وإدارة الحزم', 'نظام الملفات fs', 'وحدة HTTP ومسارات الخادم', 'متغيرات البيئة والإعدادات'] },
    { title: 'Express.js', lessons: ['إعداد أول خادم Express', 'المسارات والمقابس Routes', 'الـ Middleware وأدواره', 'التعامل مع JSON والمدخلات', 'المصادقة وإدارة الجلسات', 'معالجة الأخطاء والتسجيل'] },
    { title: 'قواعد البيانات العلائقية', lessons: ['تصميم الجداول والعلاقات', 'عمليات CRUD كاملة عبر SQL', 'الفهرسة وتحسين الأداء', 'الترحيل والمخططات Migrations', 'التعامل مع المعاملات Transactions'] },
    { title: 'MongoDB وNoSQL', lessons: ['MongoDB والمجموعات والوثائق', 'عمليات CRUD في MongoDB', 'المفهرسة وعلاقات الوثائق', 'Moongoose ODM', 'Aggregation Pipelines'] },
    { title: 'أمان واجهات البرمجة', lessons: ['JWT والمصادقة بين الطرفين', 'تشفير كلمات المرور bcrypt', 'معايير OWASP العشرة', 'معدل الطلبات Rate Limiting', 'التحقق القوي من المدخلات'] },
    { title: 'REST وGraphQL', lessons: ['مبادئ تصميم REST نظيف', 'إصدار الـ API وX-headers', 'الاستجابة الموحدة والتقسيم', 'مقدمة عملية إلى GraphQL', 'توثيق الـ API بـ OpenAPI/Swagger'] },
    { title: 'الاختبار والنشر', lessons: ['اختبارات التكامل بـ Postman', 'اختبارات الوحدة بـ Jest', 'بيئة الإنتاج والمراقبة', 'الحاويات Docker للنشر', 'CI/CD مع GitHub Actions'] },
    { title: 'المشاريع', lessons: ['مشروع 1: بوابة خلفية كاملة', 'مشروع 2: خدمة مصغرة Microservices', 'مشروع التخرج: API توصيل طلبات لشركة'] },
  ],
  crs_004: [
    { title: 'أساسيات .NET وC#', lessons: ['ما هو .NET وفلسفة Microsoft', 'المتغيرات وأنواع C#', 'الشروط والحلقات والدوال', 'البرمجة بالكائنات في C#', 'الوراثة والواجهات Interfaces', 'Generics وLINQ'] },
    { title: 'ASP.NET Core', lessons: ['إعداد أول مشروع ASP.NET Core', 'Controllers والتوجيه', 'الـ Middleware وPipeline الطلب', 'حقن الاعتماديات Dependency Injection', 'الـ Filters والأمان', 'التعامل مع JSON والتحويل'] },
    { title: 'Entity Framework Core', lessons: ['ما هو EF Core ولماذا', 'DbContext و DbSet', 'الترحيل Migrations', 'العلاقات والفهرسة', 'LINQ-to-SQL للمبتدئين', 'Code First مقابل Database First'] },
    { title: 'المصادقة والأمان', lessons: ['نظام Identity في ASP.NET Core', 'JWT والرموز Tokens', 'الأدوار والصلاحيات', 'حماية CSRF وXSS', 'إعدادات CORS'] },
    { title: 'APIs احترافية', lessons: ['تصميم REST نظيف بـ .NET', 'الاستجابة الموحدة', 'DTO والتسلسل', 'معالجة الأخطاء الموحدة', 'التحقق FluentValidation'] },
    { title: 'العمل ضمن فريق', lessons: ['ترحيل المشاريع بين الفروع Git', 'منهجية Agile وScrum', 'مراجعة الكود Code Review', 'إدارة المهام بـ Jira'] },
    { title: 'النشر والمراقبة', lessons: ['النشر على IIS وAzure App Service', 'التسجيل بـ Serilog', 'المراقبة بـ Application Insights'] },
    { title: 'المشاريع', lessons: ['مشروع 1: نظام إدارة مكتبات', 'مشروع 2: تطبيق متاجر إلكتروني', 'مشروع التخرج: نظام مؤسسي كامل'] },
  ],
  crs_005: [
    { title: 'أساسيات PHP', lessons: ['PHP وطريقة التشغيل على الخادم', 'المتغيرات وأنواع البيانات', 'الشروط والحلقات والدوال', 'المصفوفات والكائنات', 'التعامل مع النماذج $_POST', 'الحماية من SQL Injection الأساسية'] },
    { title: 'MySQL مع PHP', lessons: ['ربط PHP مع MySQL', 'عمليات CRUD كاملة', 'الاستعلامات الآمنة Prepared Statements', 'العلاقات والفهارس وتحسين الأداء', 'تقسيم الجداول وتجنب التكرار', 'النسخ الاحتياطي للبيانات'] },
    { title: 'بناء تطبيقات ويب كاملة', lessons: ['نمط MVC للمبتدئين', 'المصادقة وتسجيل الدخول', 'إدارة الجلسات والصلاحيات', 'رفع الملفات والصور', 'إرسال البريد والتنبيهات', 'توليد PDF والفواتير'] },
    { title: 'واجهات المستخدم مع PHP', lessons: ['دمج HTML/CSS مع PHP', 'قوالب ديناميكية', 'نظام مكونات بسيط', 'الرسومات البيانية من البيانات', 'لوحات تحكم للمستخدمين'] },
    { title: 'لوحات التحكم والأمان', lessons: ['لوحة CRUD كاملة', 'إحصاءات ورسوم تفاعلية', 'إدارة المستخدمين والأدوار', 'الحماية من XSS وCSRF', 'التشفير password_hash والجلسات الآمنة'] },
    { title: 'الأداء والنشر', lessons: ['تحسين الأداء والتخزين المؤقت', 'البيئات الإنتاجية وإعدادات الخادم', 'النشر على استضافة حقيقية'] },
    { title: 'المشاريع', lessons: ['مشروع 1: متجر إلكتروني متكامل', 'مشروع 2: نظام حجز مواعيد', 'مشروع التخرج: تطبيق متكامل للجهة'] },
  ],
  crs_006: [
    { title: 'أساسيات Java', lessons: ['JVM ولماذا Java عصية على الزمن', 'المتغيرات وأنواع البيانات', 'الشروط والحلقات والدوال', 'المصفوفات والكائنات', 'OOP: التغليف والوراثة والتجريد', 'الواجهات Generics'] },
    { title: 'Java المتقدم', lessons: ['مجموعة Collections', 'الخيوط Threads والبرمجة المتزامنة', 'معالجة الاستثناءات', 'الملفات والتدفقات I/O', 'الشبكات والاتصال عبر Sockets', 'أنماط التصميم الاحترافية'] },
    { title: 'Spring Boot', lessons: ['إعداد أول مشروع Spring Boot', 'حقن الاعتماديات Dependency Injection', 'Controllers والتوجيه', 'Spring Data JPA', 'Spring Security والمصادقة', 'بناء REST APIs', 'التحقق ومعالجة الأخطاء', 'توثيق الـ API بـ Swagger'] },
    { title: 'قواعد البيانات والتعامل معها', lessons: ['MySQL وقواعد البيانات العلائقية', 'تصميم العلاقات والمخططات', 'Hibernate ORM', 'الاستعلامات المعقدة والأداء', 'النسخ الاحتياطي والترحيل'] },
    { title: 'المصادقة والأمان', lessons: ['JWT مع Spring Security', 'الأدوار والصلاحيات', 'حماية التطبيق على مستوى OWASP', 'تسجيل الدخول والأمان المتقدم'] },
    { title: 'الاختبار والنشر', lessons: ['اختبارات الوحدة بـ JUnit', 'اختبارات التكامل', 'الحاويات Docker للنشر', 'CI/CD بـ GitHub Actions'] },
    { title: 'تطبيقات المؤسسات', lessons: ['Git وأساليب العمل الجماعي', 'مشروع 1: نظام إدارة موردين', 'مشروع 2: تطبيق طلبات متكامل', 'مشروع 3: بوابة داخلية للمؤسسة', 'مشروع التخرج: نظام مؤسسي معماري'] },
  ],
  crs_007: [
    { title: 'أساسيات التحليل والبيانات', lessons: ['ما هو تحليل البيانات وأين يستخدم', 'دور محلّل البيانات في المؤسسة', 'دورة حياة المشروع التحليلي', 'أخلاقيات وخصوصية البيانات', 'أدوات العمل: Python وJupyter'] },
    { title: 'Excel الاحترافي', lessons: ['البيئة والأدوات الأساسية', 'الصيغ والتنسيق الشرطي', 'الجداول المحورية Pivot Tables', 'Power Query لتنظيف البيانات', 'لوحات Excel التفاعلية', 'الأتمتة بـ VBA'] },
    { title: 'Python للبيانات', lessons: ['المتغيرات والأنواع', 'مكتبة Pandas', 'التعامل مع الملفات CSV وExcel', 'معالجة القيم المفقودة', 'دمج الجداول والفرز والتجميع', 'مكتبة Matplotlib للرسم', 'Seaborn للمخططات الإحصائية'] },
    { title: 'الإحصاء العملي للأعمال', lessons: ['المقاييس الوصفية', 'الاحتمالات والتوزيع الطبيعي', 'اختبار الفرضيات', 'الانحدار الخطي', 'قراءة النتائج بطريقة صحيحة', 'عرض البيانات بقصص ناجحة'] },
    { title: 'تنظيف البيانات', lessons: ['مصادر البيانات القذرة', 'معالجة الأخطاء والاتجاهات', 'التحقق من سلامة البيانات', 'أتمتة تنظيف البيانات بالسكربتات'] },
    { title: 'Power BI ولوحات المعلومات', lessons: ['إعداد وتركيب Power BI', 'استيراد البيانات والعلاقات', 'مقاييس DAX', 'تصميم أنواع المخططات', 'لوحات تفاعلية احترافية', 'النشر والمشاركة والصلاحيات'] },
    { title: 'التقديم والعرض بثقة', lessons: ['كيف تتحدث أمام الإدارة ببياناتك', 'تصميم تقارير يحتاجها المدير فعلًا', 'تجنب الأخطاء الشائعة في العرض', 'بناء محفظة محلل بيانات'] },
    { title: 'المشاريع', lessons: ['مشروع 1: تحليل بيانات مبيعات', 'مشروع 2: لوحة Power BI تفاعلية', 'مشروع 3: نموذج تنبؤ مبسط', 'مشروع التخرج: تقرير متكامل لشركة'] },
  ],
  crs_008: [
    { title: 'تجربة المستخدم UX', lessons: ['ما هو UX ولماذا يهم', 'عملية التصميم الموجهة بالمستخدم', 'البحث: مقابلات واستبيانات', 'اختبارات A/B والتجريب', 'خرائط رحلة المستخدم', 'شخصيات المستخدم Personas'] },
    { title: 'أساسيات التصميم المرئي', lessons: ['التخطيط والشبكات Grid System', 'الألوان ونظرياتها وتطبيقاتها', 'الطباعة والخطوط المناسبة', 'التوازن والتناغم والمساحة البيضاء', 'الإيقاع والحركة في التصميم'] },
    { title: 'التصميم بـ Figma', lessons: ['الواجهة والأدوات الأساسية لـ Figma', 'الطبقات والمجموعات', 'الأساليب والمتغيرات Styles/Variables', 'المكونات و Auto Layout', 'النماذج التفاعلية Prototypes', 'أنظمة التصميم Design Systems', 'التسليم للمطور Developer Handoff', 'التعاون والتزامن مع الفريق'] },
    { title: 'إمكانية الوصول والشمول', lessons: ['معايير WCAG الأساسية', 'دعم ذوي الاحتياجات الخاصة', 'التباين والأحجام المناسبة', 'التنقل بلوحة المفاتيح'] },
    { title: 'التطبيق والممارسة', lessons: ['من الفكرة إلى التطبيق', 'Wireframes ونماذج أولية', 'إعادة تصميم موقع حقيقي', 'عرض المشروع أمام العملاء والإدارة'] },
    { title: 'المشاريع', lessons: ['مشروع 1: تطبيق جوال متكامل', 'مشروع التخرج: إعادة تصميم تجربة تطبيق مصرفي'] },
  ],
  crs_009: [
    { title: 'أساسيات الكمبيوتر', lessons: ['مكونات الكمبيوتر والأنظمة', 'أنظمة التشغيل الأساسية', 'استخدام الإنترنت بشكل سليم', 'الأمن السيبراني للمبتدئين'] },
    { title: 'التفكير البرمجي', lessons: ['ما هي البرمجة ولماذا نحتاجها', 'التسلسل الخوارزمي للخطوات', 'الشروط وكيف يفكر الكمبيوتر', 'الحلقات والتكرار المنظم', 'حل المشكلات بالخطوات', 'الدوال وتقسيم المشكلات'] },
    { title: 'أول لغة برمجة', lessons: ['اختيار لغة البداية (JavaScript)', 'المتغيرات والعمليات الأساسية', 'المصفوفات والمجموعات', 'الكائنات وتنظيم البيانات', 'التعامل مع الإدخالات والأزرار', 'مشروع: آلة حاسبة تفاعلية'] },
    { title: 'التطبيق والبناء', lessons: ['مراجعة الأخطاء وتصحيحها', 'بناء تطبيق ويب بسيط', 'توسيع المهارات نحو تخصصك القادم'] },
    { title: 'المشاريع', lessons: ['مشروع 1: لعبة بسيطة على المتصفح', 'مشروع 2: صفحة شخصية متكاملة', 'مشروع التخرج: موقع كامل من الصفر'] },
  ],
};



// ── Real quiz questions, written from each course's actual curriculum ──
// Stored in Arabic (mirrored into `en` on write to keep the data-model shape).
// Each item: { q, options[4], correct (0–3) }.
const questionsByCourseId = {
  crs_001: [
    { q: 'ما الوظيفة الأساسية لمكتبة Pandas في Python؟', options: ['تحليل ومعالجة البيانات الجدولية', 'طباعة صفحات الويب', 'تشغيل الأوامر على الخادم', 'كتابة ملفات PDF'], correct: 0 },
    { q: 'أي من التالي يصف التعلم الخاضع للإشراف بشكل صحيح؟', options: ['يستخدم بيانات مُصنّفة للتدريب', 'لا يستخدم بيانات إطلاقاً', 'يعتمد على التصنيف العشوائي', 'أسرع من كل الخوارزميات'], correct: 0 },
    { q: 'ما وظيفة الـ Dropout في الشبكات العصبية؟', options: ['منع الإفراط في التخصيص Overfitting', 'تسريع التدريب دائماً', 'زيادة عدد الطبقات', 'تحسين ضغط الصور'], correct: 0 },
    { q: 'أي من التالي يمثل دالة تفعيل في الشبكات العصبية؟', options: ['ReLU', 'GET', 'XOR', 'HTTP'], correct: 0 },
    { q: 'ما المقصود بمعالجة اللغة الطبيعية NLP؟', options: ['فهم وتوليد وتشغيل اللغة البشرية بواسطة الحاسوب', 'التعلم الآلي المتقدم', 'رؤية الحاسوب', 'تحليل البيانات التسريالية'], correct: 0 },
  ],
  crs_002: [
    { q: 'ما الوظيفة الأساسية للغة HTML؟', options: ['تحديد بنية ومحتوى صفحات الويب', 'تلوين الصفحات', 'برمجة الخادم', 'تخزين البيانات'], correct: 0 },
    { q: 'أي تقنية تُستخدم للتخطيط ثنائي الأبعاد في CSS؟', options: ['CSS Grid', 'Sticky positioning', 'Inline styles', 'Visibility'], correct: 0 },
    { q: 'ما المقصود بـ الحالة State في React؟', options: ['قيمة متغيرة تتحكم في إعادة التصيير UI', 'إعداد ثابت للتطبيق', 'ملف إعدادات البيئة', 'طريقة للتنقل بين الصفحات'], correct: 0 },
    { q: 'ما وظيفة الـ Hook useEffect في React؟', options: ['تنفيذ تأثيرات جانبية بعد التصيير', 'إضافة تخطيط Grid', 'إنشاء جدول بيانات', 'رفع الملفات'], correct: 0 },
    { q: 'ما الفائدة من تقسيم الكود Code Splitting؟', options: ['تحميل الصفحة بسرعة بتحميل الموارد عند الحاجة فقط', 'زيادة حجم التطبيق', 'تعطيل التقسيم التلقائي', 'تسريع البحث المباشر'], correct: 0 },
  ],
  crs_003: [
    { q: 'ما الوظيفة الأساسية لـ Node.js؟', options: ['تشغيل جافاسكريبت على الخادم خارج المتصفح', 'ترجمة CSS', 'تصميم الواجهات', 'تشغيل قواعد البيانات'], correct: 0 },
    { q: 'أي من التالي يمثل إطار عمل Backend جافاسكريبت مشهور؟', options: ['Express.js', 'Bootstrap', 'React', 'jQuery'], correct: 0 },
    { q: 'ما وظيفة الـ Middleware في Express؟', options: ['معالجة الطلب قبل وصوله للمعالج النهائي', 'تلوين الصفحات', 'إنشاء قاعدة بيانات', 'التحقق من الهوية فقط'], correct: 0 },
    { q: 'أي من التالي يسمح بمشاركة الموارد بين النطاقات المختلفة؟', options: ['CORS', 'XSS', 'CSRF', 'SQL Injection'], correct: 0 },
    { q: 'أي قاعدة بيانات تناسب بيانات الوثائق Documents؟', options: ['MongoDB', 'MySQL', 'SQLite', 'Oracle'], correct: 0 },
  ],
  crs_004: [
    { q: 'ما هو ASP.NET Core؟', options: ['إطار عمل متعدد المنصات لتطوير تطبيقات وخوادم الويب', 'منتقي ألوان UI', 'مترجم JavaScript', 'قاعدة بيانات نصية'], correct: 0 },
    { q: 'ما وظيفة الـ DbContext في Entity Framework؟', options: ['يمثل اتصال قاعدة البيانات والجلسات', 'ينفذ صفحة HTML فقط', 'يرفع الملفات للتخزين', 'يشفّر كلمات المرور'], correct: 0 },
    { q: 'ما وظيفة حقن الاعتماديات Dependency Injection في ASP.NET Core؟', options: ['إدارة التبعيات بين الكلاسات بشكل مرن', 'تصحيح الأخطاء', 'تلوين الصفحة', 'إنشاء جداول'], correct: 0 },
    { q: 'أي من التالي يُستخدم لكتابة الاستعلامات مع EF Core؟', options: ['LINQ', 'WAMP', 'XAMPP', 'LAMP'], correct: 0 },
    { q: 'ما وظيفة خط أنابيب المعالجة Pipeline في ASP.NET Core؟', options: ['معالجة الطلبات عبر الـ Middleware بالتتابع', 'تطوير تطبيقات الموبايل', 'تشغيل قواعد البيانات', 'إنشاء صفحة الخطأ فقط'], correct: 0 },
  ],
  crs_005: [
    { q: 'ما هي لغة PHP؟', options: ['لغة برمجة للعمل على الخادم وتوليد HTML ديناميكي', 'لغة قواعد بيانات', 'نظام تشغيل', 'إطار عمل واجهة'], correct: 0 },
    { q: 'ما هو MySQL؟', options: ['نظام إدارة قواعد بيانات علائقية مفتوح المصدر', 'مكتبة JavaScript', 'محرر نصوص', 'أداة ضغط CSS'], correct: 0 },
    { q: 'ما الفرق الرئيسي بين طريقتي GET و POST؟', options: ['GET ترسل البيانات عبر الرابط، POST ترسلها في متن الطلب', 'كلاهما متماثل', 'GET أسرع دائمًا', 'POST لا تُستخدم في النماذج'], correct: 0 },
    { q: 'ما وظيفة الـ PDO في PHP؟', options: ['طبقة موحدة للتعامل مع قواعد البيانات المختلفة', 'مكتبة عرض HTML', 'محرر صور', 'إدارة الجلسات فقط'], correct: 0 },
    { q: 'ما الحل الصحيح لتجنب حقن SQL؟', options: ['استخدام استعلامات مُعدّة Prepared Statements', 'إيقاف تشغيل PHP', 'استخدام GET بدل POST', 'تشفير HTML فقط'], correct: 0 },
  ],
  crs_006: [
    { q: 'ما وظيفة JVM؟', options: ['تشغيل بايت كود Java على أي منصة', 'ترجمة HTML إلى JavaScript', 'تشغيل قواعد البيانات', 'إدارة الذاكرة فقط'], correct: 0 },
    { q: 'ما الكلمة المستخدمة للتوريث في Java؟', options: ['extends', 'implements', 'inherit', 'extends()'], correct: 0 },
    { q: 'ما وظيفة Spring Boot؟', options: ['تسريع تطوير تطبيقات Java بتقليل الإعداد والتهيئة', 'تحويل Java إلى .NET', 'تشغيل JavaScript في المتصفح', 'إدارة قواعد البيانات فقط'], correct: 0 },
    { q: 'أي من التالي يمثل ORM مشهور في Java؟', options: ['Hibernate', 'Laravel', 'Express', 'Django'], correct: 0 },
    { q: 'ما الفرق بين Interface و Class في Java؟', options: ['الواجهة تعرّف تواقيعاً ينفذها الأصناف، والكلاس يحتوي تنفيذاً كاملاً', 'لا فرق', 'الواجهة أسرع', 'الكلاس يمنع الوراثة'], correct: 0 },
  ],
  crs_007: [
    { q: 'ما وظيفة مكتبة Pandas في Python؟', options: ['تحليل ومعالجة البيانات الجدولية DataFrames', 'طباعة صفحات الويب', 'بناء نماذج AI مباشرة', 'تشغيل خادم'], correct: 0 },
    { q: 'ما المقصود بالجدول المحوري Pivot Table؟', options: ['تجميع البيانات حسب فئات حسابية', 'عرض البيانات بمخطط', 'تصدير البيانات إلى Excel', 'تنظيف البيانات تلقائياً'], correct: 0 },
    { q: 'ما الفرق بين المتوسط Mean والوسيط Median؟', options: ['المتوسط مجموع القيم ÷ عددها، والوسيط القيمة الوسطى', 'لا فرق', 'المتوسط أسرع', 'الوسيط نسخة من المتوسط'], correct: 0 },
    { q: 'ما اختصار DAX في Power BI؟', options: ['Data Analysis Expressions', 'Database Access Logic', 'Digital Analytics XML', 'Device Access Extension'], correct: 0 },
    { q: 'ما الوظيفة الأساسية لـ Power Query؟', options: ['تنظيف وتحويل البيانات قبل التحليل', 'تطوير التطبيقات', 'تشغيل النماذج', 'النسخ الاحتياطي'], correct: 0 },
  ],
  crs_008: [
    { q: 'ما الفرق بين UX و UI؟', options: ['UX تجربة المستخدم الشاملة، UI الواجهة المرئية والتفاعل', 'لا فرق بينهما', 'UI هي تجربة المستخدم', 'UX الألوان والخطوط فقط'], correct: 0 },
    { q: 'ما وظيفة الـ Wireframe؟', options: ['تخطيط أولي بالخطوط لهيكلية الصفحة/الشاشة', 'تصميم الألوان النهائية', 'ترميز الصفحة', 'النشر على الويب'], correct: 0 },
    { q: 'أي أداة تصميم واجهات مشهورة تدعم التعاون الفوري؟', options: ['Figma', 'Excel', 'Postman', 'Docker'], correct: 0 },
    { q: 'ما معنى اختصار WCAG؟', options: ['معايير الوصول لمحتوى الويب', 'واجهة رسوميات حاسوب', 'بروتوكول شبكة', 'إطار عمل خلفي'], correct: 0 },
    { q: 'ما وظيفة الـ Prototype؟', options: ['نموذج تفاعلي يحاكي التطبيق قبل التطوير', 'مستند المتطلبات', 'كود نهائي', 'قاعدة بيانات'], correct: 0 },
  ],
  crs_009: [
    { q: 'ما المقصود بـ المتغير Variable؟', options: ['مخزن مؤقت لقيمة قابلة لإعادة الاستخدام والمعالجة', 'أمر طباعة', 'أداة اختبار', 'نوع بيانات فقط'], correct: 0 },
    { q: 'ما وظيفة الحلقة التكرارية Loop؟', options: ['تنفيذ نفس الكود مراراً حسب شرط معين', 'حفظ البيانات', 'إظهار رسالة للمستخدم', 'إلغاء العمليات'], correct: 0 },
    { q: 'أي مما يلي يمثل لغة برمجة؟', options: ['JavaScript', 'HTML', 'HTTP', 'USB'], correct: 0 },
    { q: 'ما وظيفة الدالة Function؟', options: ['كتلة كود قابلة لإعادة الاستخدام عند الطلب', 'تلوين النص', 'حفظ المشروع', 'تشغيل الخادم'], correct: 0 },
    { q: 'ما معنى كلمة Debugging؟', options: ['اكتشاف الأخطاء وإصلاحها في البرنامج', 'رفع المشروع على Git', 'كتابة التوثيق', 'تحسين الأداء'], correct: 0 },
  ],
};

const courses = [];
const sections = [];
const lessons = [];
const quizzes = [];
const questions = [];
let lessonCounter = 0;

for (let ci = 0; ci < courseBlueprints.length; ci++) {
  const bp = courseBlueprints[ci];
  const publishedAt = daysAgo(200 - ci * 14);
  courses.push({
    id: bp.id,
    title: bp.title, slug: bp.id.replace('crs_', 'course-'),
    shortDescription: bp.short, description: bp.desc,
    thumbnail: bp.thumb, instructorId: bp.ins, categoryId: bp.cat,
    difficulty: bp.diff,
    learningObjectives: bp.objectives, prerequisites: bp.prereqs,
    estimatedDuration: bp.weeks,
    estimatedHours: bp.hours,
    projectCount: bp.projects,
    price: bp.price,
    discount: bp.discount,
    requirements: { ar: ['جهاز كمبيوتر واتصال بالإنترنت'], en: ['جهاز كمبيوتر واتصال بالإنترنت'] },
    status: 'published',
    rejectionReason: null,
    featured: bp.featured,
    createdAt: daysAgo(260 - ci * 12), updatedAt: publishedAt,
    submittedAt: daysAgo(230 - ci * 12), publishedAt,
  });

  const coursePhases = phasesById[bp.id] || [];
  let lessonNo = 0;
  for (let si = 0; si < coursePhases.length; si++) {
    const phase = coursePhases[si];
    const sid = `sec_${bp.id.slice(4)}_${si + 1}`;
    sections.push({ id: sid, courseId: bp.id, title: arEn(phase.title), description: { ar: '', en: '' }, order: si + 1, createdAt: daysAgo(250 - ci * 12), updatedAt: daysAgo(250 - ci * 12) });
    for (let li = 0; li < phase.lessons.length; li++) {
      lessonNo++;
      lessonCounter++;
      const lessonTitle = phase.lessons[li];
      const type = li % 4 === 2 ? 'text' : li % 4 === 3 ? 'external' : 'video';
      lessons.push({
        id: `lsn_${String(lessonCounter).padStart(3, '0')}`,
        sectionId: sid,
        title: arEn(lessonTitle),
        description: arEn(`${lessonTitle} — شرح عملي مع أمثلة ومشاريع تطبيقية وتمارين محلولة خطوة بخطوة.`),
        content: arEn(`في هذا الدرس سنغطي «${lessonTitle}» بعمق: مفاهيم أساسية، أمثلة خطوة بخطوة، وأخطاء شائعة يجب تجنبها. طبّق بنفسك أثناء المشاهدة، ودوّن ملاحظاتك — الممارسة هي الطريق الوحيد للإتقان.`),
        videoUrl: type === 'video' ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(lessonTitle + ' ' + (bp.title.en || ''))}` : '',
        duration: pick([15, 25, 40, 50, 60, 75, 90]),
        type, isRequired: li % 5 !== 4,
        order: li + 1, createdAt: daysAgo(248 - ci * 12), updatedAt: daysAgo(248 - ci * 12),
      });
    }
  }

  const qid = `qz_${String(ci + 1).padStart(3, '0')}`;
  quizzes.push({ id: qid, courseId: bp.id, title: { ar: `اختبار ${bp.title.ar}`, en: `اختبار ${bp.title.ar}` }, description: { ar: 'قيّم فهمك للمادة — درجة النجاح 60٪', en: 'قيّم فهمك للمادة — درجة النجاح 60٪' }, passingScore: 60, maxAttempts: 3, isRequired: true, status: 'published', createdAt: daysAgo(240 - ci * 12), updatedAt: daysAgo(240 - ci * 12) });
  const qzBank = questionsByCourseId[bp.id] || [];
  for (let qi = 0; qi < qzBank.length; qi++) {
    const item = qzBank[qi];
    // Deterministically rotate options so correct answers distribute across A–D
    // (keeps the seeded bank readable while avoiding an "always pick A" pattern).
    const opts = [...item.options];
    const shift = (ci * 2 + qi) % 4;
    const rotated = [...opts.slice(shift), ...opts.slice(0, shift)];
    const correct = ((item.correct - shift) % 4 + 4) % 4;
    questions.push({
      id: `qst_${String(ci * 5 + qi + 1).padStart(3, '0')}`,
      quizId: qid,
      question: arEn(item.q),
      type: 'mcq',
      options: { ar: rotated, en: [...rotated] },
      correctAnswer: correct,
      points: 10, order: qi + 1,
    });
  }
}

// ── Enrollments (40) with consistent progress ────────────────────────
const enrollments = [];
const lessonProgress = [];
const quizAttempts = [];
const certificates = [];
const reviews = [];
let progressCount = 0;
let attemptCount = 0;
let certCount = 0;
let reviewCount = 0;

const reviewPool = [
  'دورة ممتازة، الشرح مبسط ومنظم. أنصح بها بشدة!',
  'أفضل دورة عربية في هذا المجال — شكراً EDUPULSE!',
  'Great course, very practical and well structured.',
  'المحتوى عملي ومباشر، تعلمت أكثر مما توقعت.',
  'Good pace and clear explanations. Loved the projects.',
  'المدرب يشرح بأسلوب واضح وأمثلة واقعية.',
  'Excellent for beginners — highly recommended.',
  'دورة قوية، أنصح بمشاهدة الدروس أكثر من مرة.',
];

const courseLessonsCache = {};
for (const c of courses) {
  const sids = sections.filter((s) => s.courseId === c.id).map((s) => s.id);
  courseLessonsCache[c.id] = lessons.filter((l) => sids.includes(l.sectionId));
}
const courseQuizzes = {};
for (const q of quizzes) courseQuizzes[q.courseId] = q;

let enrIdx = 0;
const pairs = [];
for (let s = 0; s < 20; s++) {
  pairs.push([s, s % 9]);
  pairs.push([s, (s + 5) % 9]);
}
for (const [studentIdx, courseIdx] of pairs) {
  enrIdx++;
  const studentId = `usr_stu_${String(studentIdx + 1).padStart(2, '0')}`;
  const courseId = courses[courseIdx].id;
  const enrolledAt = daysAgo(Math.floor(rnd() * 150) + 5);
  const ratioRoll = rnd();
  const ratio = ratioRoll < 0.15 ? 0 : ratioRoll < 0.62 ? 0.25 + rnd() * 0.55 : 1;
  const courseLessons = courseLessonsCache[courseId];
  const required = courseLessons.filter((l) => l.isRequired);
  const totalReq = required.length;
  const completedReq = Math.round(ratio * totalReq);
  const enrollmentId = `enr_${String(enrIdx).padStart(3, '0')}`;
  const requiredQuiz = courseQuizzes[courseId];
  for (let i = 0; i < completedReq; i++) {
    progressCount++;
    lessonProgress.push({ id: `prg_${String(progressCount).padStart(4, '0')}`, studentId, courseId, lessonId: required[i].id, isCompleted: true, completedAt: daysAgo(Math.floor(rnd() * 120) + 1), updatedAt: daysAgo(Math.floor(rnd() * 120) + 1) });
  }
  for (const l of courseLessons.filter((l) => !l.isRequired)) {
    if (rnd() < ratio * 0.6) {
      progressCount++;
      lessonProgress.push({ id: `prg_${String(progressCount).padStart(4, '0')}`, studentId, courseId, lessonId: l.id, isCompleted: true, completedAt: daysAgo(Math.floor(rnd() * 120) + 1), updatedAt: daysAgo(Math.floor(rnd() * 120) + 1) });
    }
  }
  let quizPassed = !requiredQuiz;
  if (requiredQuiz) {
    if (ratio >= 1) {
      attemptCount++;
      const totalPoints = 50;
      const score = 30 + Math.floor(rnd() * 21);
      quizAttempts.push({ id: `att_${String(attemptCount).padStart(3, '0')}`, quizId: requiredQuiz.id, studentId, answers: [0, 0, 0, 0, 0], score, totalPoints, percentage: Math.round((score / totalPoints) * 100), passed: true, attemptNumber: 1, startedAt: enrolledAt, submittedAt: daysAgo(Math.floor(rnd() * 100) + 2) });
      quizPassed = true;
    } else if (ratio > 0.4 && rnd() < 0.5) {
      attemptCount++;
      const totalPoints = 50;
      const score = 10 + Math.floor(rnd() * 41);
      const pct = Math.round((score / totalPoints) * 100);
      quizAttempts.push({ id: `att_${String(attemptCount).padStart(3, '0')}`, quizId: requiredQuiz.id, studentId, answers: [2, 1, 3, 0, 2], score, totalPoints, percentage: pct, passed: pct >= 60, attemptNumber: 1, startedAt: enrolledAt, submittedAt: daysAgo(Math.floor(rnd() * 100) + 2) });
      quizPassed = pct >= 60;
    }
  }
  const isComplete = ratio >= 1 && quizPassed;
  enrollments.push({ id: enrollmentId, studentId, courseId, enrolledAt, status: isComplete ? 'completed' : 'active', completedAt: isComplete ? daysAgo(Math.floor(rnd() * 90) + 1) : null });
  if (isComplete && certCount < 5) {
    certCount++;
    certificates.push({ id: `crt_${String(certCount).padStart(3, '0')}`, certificateNumber: `EP-${new Date().getFullYear()}-${String(100000 + certCount)}`, studentId, courseId, instructorId: courses[courseIdx].instructorId, issuedAt: daysAgo(Math.floor(rnd() * 60) + 2) });
  }
  if (reviewCount < 25 && rnd() < 0.75) {
    reviewCount++;
    reviews.push({ id: `rev_${String(reviewCount).padStart(3, '0')}`, studentId, courseId, rating: pick([5, 5, 5, 4, 4, 3]), comment: pick(reviewPool), status: 'visible', createdAt: daysAgo(Math.floor(rnd() * 120) + 1), updatedAt: daysAgo(Math.floor(rnd() * 120) + 1) });
  }
}
const reviewed = new Set(reviews.map((r) => `${r.studentId}|${r.courseId}`));
for (const e of enrollments) {
  if (reviewCount >= 25) break;
  const key = `${e.studentId}|${e.courseId}`;
  if (reviewed.has(key)) continue;
  reviewCount++;
  reviewed.add(key);
  reviews.push({ id: `rev_${String(reviewCount).padStart(3, '0')}`, studentId: e.studentId, courseId: e.courseId, rating: pick([5, 4, 4, 5]), comment: pick(reviewPool), status: 'visible', createdAt: daysAgo(Math.floor(rnd() * 120) + 1), updatedAt: daysAgo(Math.floor(rnd() * 120) + 1) });
}

// ── Subscription requests (existing students = grandfathered as fully paid) ───
const subscriptionRequests = [];
{
  let reqIdx = 0;
  const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
  for (const e of enrollments) {
    reqIdx++;
    const course = courses.find((c) => c.id === e.courseId);
    const gross = course?.price || 0;
    const finalPrice = Math.round(gross * (1 - (course?.discount || 0) / 100));
    subscriptionRequests.push({
      id: `req_${String(reqIdx).padStart(3, '0')}`,
      studentId: e.studentId,
      courseId: e.courseId,
      fullName: usersById[e.studentId]?.name || '',
      phone: '010' + String(10000000 + reqIdx * 137).slice(0, 8),
      email: usersById[e.studentId]?.email || '',
      amountDue: finalPrice,
      amountPaid: finalPrice,
      method: 'cash',
      stage: 'completed',
      notes: [{ id: `nt_${reqIdx}`, text: 'دفعة كاملة (تسوية طلاب الديمو الحاليين)', by: 'النظام', at: e.enrolledAt }],
      rejectionReason: '',
      createdAt: e.enrolledAt,
      updatedAt: e.enrolledAt,
      decidedAt: e.enrolledAt,
    });
  }
}

// ── Seed a few live-looking CRM requests (new / contacted / partial) for demo ───
{
  const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
  const demoReqs = [
    { studentId: 'usr_stu_06', courseId: 'crs_002', stage: 'new', paid: 0, note: 'عايز أعرف التفاصيل قبل الدفع' },
    { studentId: 'usr_stu_01', courseId: 'crs_003', stage: 'partial', paid: 3000, note: 'هدفع الباقي بعد رواتب الشهر' },
    { studentId: 'usr_stu_04', courseId: 'crs_007', stage: 'contacted', paid: 0, note: 'تحوّل من ads — تم التواصل وهو مهتم' },
  ];
  let demoIdx = subscriptionRequests.length;
  for (const r of demoReqs) {
    demoIdx++;
    const course = courses.find((c) => c.id === r.courseId);
    const gross = course?.price || 0;
    const finalPrice = Math.round(gross * (1 - (course?.discount || 0) / 100));
    subscriptionRequests.push({
      id: `req_${String(demoIdx).padStart(3, '0')}`,
      studentId: r.studentId,
      courseId: r.courseId,
      fullName: usersById[r.studentId]?.name || '',
      phone: '010' + String(10000000 + demoIdx * 211).slice(0, 8),
      email: usersById[r.studentId]?.email || '',
      amountDue: finalPrice,
      amountPaid: r.paid,
      method: 'cash',
      stage: r.stage,
      notes: [{ id: `nt_${demoIdx}`, text: r.note, by: 'النظام', at: daysAgo(3) }],
      rejectionReason: '',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(3),
      decidedAt: null,
    });
  }
}

// ── Notifications ────────────────────────────────────────────────────
const notifications = [
  { id: 'ntf_001', userId: 'usr_stu_01', title: { ar: 'أهلاً بك في EDUPULSE!', en: 'أهلاً بك في EDUPULSE!' }, message: { ar: 'ابدأ رحلتك بالتسجيل في إحدى دوراتنا المميزة.', en: 'ابدأ رحلتك بالتسجيل في إحدى دوراتنا المميزة.' }, type: 'system', isRead: false, createdAt: daysAgo(2) },
  { id: 'ntf_002', userId: 'usr_stu_01', title: { ar: 'شهادة جديدة باسمك', en: 'شهادة جديدة باسمك' }, message: { ar: 'أتممت دورة بنجاح — شهادتك جاهزة للطباعة من صفحة الشهادات.', en: 'أتممت دورة بنجاح — شهادتك جاهزة للطباعة من صفحة الشهادات.' }, type: 'certificate', isRead: false, createdAt: daysAgo(5) },
  { id: 'ntf_003', userId: 'usr_stu_01', title: { ar: 'نتيجة الاختبار', en: 'نتيجة الاختبار' }, message: { ar: 'اجتزت الاختبار بنسبة 80٪. عمل رائع!', en: 'اجتزت الاختبار بنسبة 80٪. عمل رائع!' }, type: 'quiz', isRead: true, createdAt: daysAgo(8) },
  { id: 'ntf_004', userId: 'usr_stu_01', title: { ar: 'تنبيه دورة', en: 'تنبيه دورة' }, message: { ar: 'أنت في منتصف دورة الذكاء الاصطناعي — واصل التعلم!', en: 'أنت في منتصف دورة الذكاء الاصطناعي — واصل التعلم!' }, type: 'course', isRead: true, createdAt: daysAgo(12) },
  { id: 'ntf_005', userId: 'usr_ins_1', title: { ar: 'طالب جديد سجّل في دورتك', en: 'طالب جديد سجّل في دورتك' }, message: { ar: 'انضم طالب جديد إلى دورتك.', en: 'انضم طالب جديد إلى دورتك.' }, type: 'enrollment', isRead: false, createdAt: daysAgo(1) },
  { id: 'ntf_006', userId: 'usr_ins_1', title: { ar: 'دورة معتمدة ومنشورة', en: 'دورة معتمدة ومنشورة' }, message: { ar: 'تمت الموافقة على دورتك وأصبحت متاحة للجميع.', en: 'تمت الموافقة على دورتك وأصبحت متاحة للجميع.' }, type: 'approval', isRead: true, createdAt: daysAgo(200) },
  { id: 'ntf_007', userId: 'usr_ins_1', title: { ar: 'تقييم جديد', en: 'تقييم جديد' }, message: { ar: 'قيّم طالب دورتك بخمس نجوم.', en: 'قيّم طالب دورتك بخمس نجوم.' }, type: 'review', isRead: false, createdAt: daysAgo(3) },
  { id: 'ntf_008', userId: 'usr_admin', title: { ar: 'رسائل جديدة', en: 'رسائل جديدة' }, message: { ar: 'وصلتك رسائل تواصل جديدة تنتظر المراجعة.', en: 'وصلتك رسائل تواصل جديدة تنتظر المراجعة.' }, type: 'system', isRead: false, createdAt: daysAgo(1) },
  { id: 'ntf_009', userId: 'usr_admin', title: { ar: 'إحصائيات الأسبوع', en: 'إحصائيات الأسبوع' }, message: { ar: 'انضم 12 طالباً جديداً هذا الأسبوع واجتاز 9 اختبارات.', en: 'انضم 12 طالباً جديداً هذا الأسبوع واجتاز 9 اختبارات.' }, type: 'system', isRead: true, createdAt: daysAgo(6) },
];

// ── Contact messages (6) ─────────────────────────────────────────────
const messages = [
  { id: 'msg_001', name: 'هبة سعيد', email: 'heba@example.com', subject: 'اقتراح دورة جديدة', message: 'أقترح إضافة دورة عن أمن المعلومات للمسؤولين بجهة عربية.', status: 'open', createdAt: daysAgo(2) },
  { id: 'msg_002', name: 'Tamer Ali', email: 'tamer@example.com', subject: 'التحقق من الشهادات', message: 'How can employers verify an EDUPULSE certificate number?', status: 'open', createdAt: daysAgo(4) },
  { id: 'msg_003', name: 'رنا مجدي', email: 'rana@example.com', subject: 'مشكلة في تشغيل الفيديو', message: 'فيديو الدرس الثالث في الدورة لا يعمل على متصفح سفاري.', status: 'read', createdAt: daysAgo(7) },
  { id: 'msg_004', name: 'Ali Mansour', email: 'ali@example.com', subject: 'شراكة', message: 'We would like to discuss bringing EDUPULSE to our university.', status: 'read', createdAt: daysAgo(10) },
  { id: 'msg_005', name: 'جومانة خالد', email: 'jumana@example.com', subject: 'شكراً للفريق', message: 'أتممت دورة تحليل البيانات ووجدت الشهادة جاهزة — رائع جداً!', status: 'archived', createdAt: daysAgo(15) },
  { id: 'msg_006', name: 'Samir Fathy', email: 'samir@example.com', subject: 'اقتراح تحسين', message: 'Please add a dark mode for the public website too.', status: 'archived', createdAt: daysAgo(20) },
];

// ── Wishlist / settings ──────────────────────────────────────────────
const wishlist = [
  { id: 'wsh_001', studentId: 'usr_stu_01', courseId: 'crs_007', createdAt: daysAgo(9) },
  { id: 'wsh_002', studentId: 'usr_stu_01', courseId: 'crs_001', createdAt: daysAgo(7) },
  { id: 'wsh_003', studentId: 'usr_stu_01', courseId: 'crs_002', createdAt: daysAgo(4) },
  { id: 'wsh_004', studentId: 'usr_stu_02', courseId: 'crs_008', createdAt: daysAgo(6) },
];
const settings = users.map((u) => ({ id: `set_${u.id}`, userId: u.id, language: 'ar', notificationPreferences: { course: true, quiz: true, certificate: true, announcements: true }, preferences: {}, updatedAt: daysAgo(30) }));

// ── Exports ──────────────────────────────────────────────────────────
export function generateSeedData() {
  return {
    users, categories, courses, sections, lessons, quizzes, questions,
    enrollments, lessonProgress, quizAttempts, reviews, certificates,
    notifications, wishlist, messages, settings,
    subscriptionRequests,
  };
}

export const DEMO_ACCOUNTS = [
  { role: 'admin', email: 'admin@edupulse.demo', password: 'Admin123', key: 'demoAdmin' },
  { role: 'instructor', email: 'instructor@edupulse.demo', password: 'Demo123', key: 'demoInstructor' },
  { role: 'student', email: 'student@edupulse.demo', password: 'Demo123', key: 'demoStudent' },
  { role: 'sales', email: 'sales@edupulse.demo', password: 'Demo123', key: 'demoSales' },
];
