# EDUPULSE — AI HANDOFF DOCUMENT

**Last updated:** 2026-11-15 (massive CRM + pricing upgrade) · **Current version:** v2.0.0 · **Status:** Subscription/payment flow verified end-to-end

This is the single source of truth for EDUPULSE project continuity. Read it fully before changing anything.

---

## 0. NEXT AI / للمساعد القادم — START HERE (read this first)

If the user runs out of tokens and gives you this file, follow these steps — **do not rewrite the app from scratch, do not re-ask questions already answered here**:

1. **Read this whole file first** (10–15 min). Everything you need — decisions, architecture, file inventory, bugs, credentials, what's done and what's left — is documented here.
2. **Verify the environment**: `node -v` (developed on v24.21), `npm -v` (v12.2.2), OS: Windows + PowerShell. Working directory: the folder containing this file (`package.json` must be next to it).
3. **Install & build**: `npm install` → `npx vite build` (should succeed in ~6s) → `npx vite preview --port 4173` and open `http://localhost:4173/`.
4. **Sanity check in browser**: no console errors; home is Arabic RTL; log in with `student@edupulse.demo / Demo123` → student dashboard shows real data.
5. **User's approved decisions are FINAL unless the user explicitly revokes them.** **ARABIC ONLY — single language everywhere** (user's explicit command, 2026-11-14). No language switching exists anywhere: `src/i18n/index.jsx` is locked to Arabic, `LanguageSwitcher` is deleted, `translations/en.js` is deleted. Never re-add English switching or bilingual UI. Only the bilingual *data model* (`{ar, en}` on every entity) is kept on purpose for a possible future English edition. **Payments exist as of v2.0.0** — cash-only, tracked in the CRM.
6. **Verification method (chosen by user): production build + browser walkthrough. No unit-test framework** unless the user asks for one.
7. **All business logic lives in `src/services/`. All LocalStorage access goes through `src/storage/storageAdapter.js`.** Never call localStorage directly from components. Never put logic in pages.
8. **USER'S STANDING RULE (explicit command): after EVERY change, main or small, update this file in the same session** — add the files created/modified/deleted to "Change Log" and keep "Test Results" + "Known Issues" + "Next Steps" current. Do NOT batch it to the end; do it immediately after the edit is verified (build/test). Any AI that skips this breaks project continuity.
9. **Honesty rules (inviolable):** never mark something "Tested" unless you ran it; never fabricate UI/actions; LocalStorage data is demo-only and users can lose it; admin approval flow publishes courses — only admins approve. Subscription/payment flow: sales executes/records cash only.
10. **The user communicates in Egyptian Arabic.** Reply in Arabic (or the user's language), keep answers concise, always end substantial work by updating this handoff file.

**Project state after v2.0.0 (2026-11-15):**
- **v2.0.0 (latest)** — COURSES NOW PAID; CRM system with pipeline (\t طلب جديد → قيد التواصل → دفع جزئي/كامل → اعتماد الاشتراك → مكتمل/مرفوض); payment recording with per-request history + notes; sales role with full dashboard (/sales); subscription request form (from course page "اطلب الاشتراك" button); prices from EraaSoft catalog minus 1,000 EGP; footer social icons + WhatsApp button; instructor/admin course form includes price + discount fields; dashboards show live revenue/KPI.
- **v1.10.0** — instructor "إدارة الاختبارات" dead-link fixed (stale Arabic-only Q/A state ref); verified end to end as instructor Sara, zero console errors.
- **v1.9.0** — number inputs show no spinner arrows anywhere (global CSS `appearance: textfield` + webkit removal); build ✓.
- **v1.8.0** — removed false bilingual claims; sentence user pasted now reads `المحتوى والواجهة بالعربية، مع دعم كامل لاتجاه RTL.`
- **v1.7.0** — home "Featured courses" paginated (6/page); page 1 → 6 courses, page 2 → remaining 3; Pagination component wired (light variant).
- **v1.6.0** — admin can see & edit every user's password (reveal toggles + prefill, disclaimer kept honest: plain-text demo store); modal focus bug fixed (input no longer loses focus while typing).
- **v1.5.0** — admin notifications Arabic-only; Admin Reviews page renders (Search-import crash fixed); **all 39 routes sweep clean, zero console errors**. Earlier builds' tabs may show stale/broken pages — always hard-refresh after rebuilds. Migration v1→v2 also ran on next load.
- **v1.4.0** — auto v1→v2 migration (fresh seed on first load); weeks/hours/projects = EraaSoft values.
- **v1.3.0** — 9 EraaSoft-style courses with real Arabic curricula (~370 lessons/68 sections) in fresh seed.
- Arabic ONLY everywhere. Site is served at `localhost:4173` — always hard-refresh after rebuilds.
- **Demo data note:** after v2.0.0, the demo seed includes 1 sales demo account (sales@edupulse.demo / Demo123); 40 grandfathered completed subscriptions; 3 live new/contacted/partial CRM requests for UI demo; stats compute from localStorage.

## 1. Product Overview

EDUPULSE (تعلم. علّم. انجح.) is an Arabic-only Learning Management System with a built-in subscription CRM. Frontend-only React SPA backed by browser LocalStorage. Four roles: **Admin**, **Instructor**, **Student**, **Sales (مسؤول الاشتراكات)**. All courses have prices (EGP); cash-only payment handled in the **Subscription CRM**. No backend — LocalStorage only.

## 2. Approved Decisions (permanent unless user permits changes)

| Area | Decision |
|---|---|
| Product | EDUPULSE · LMS · Courses are paid (cash-only) · Prices = EraaSoft catalogue − 1,000 EGP |
| Languages | **ARABIC ONLY — single language** (user command 2026-11-14). No language switching. Bilingual data model `{ar, en}` kept for optional future re-enable |
| Themes | Public website: **Light** · Dashboards: **Dark** (#0B1120 / #151F32, emerald #10B981 accents) |
| Stack | React 19 + Vite 7 + Tailwind CSS v4 (@tailwindcss/vite) + JavaScript/JSX only (no TS) |
| Routing | react-router-dom v7 with **HashRouter** |
| State | React Context API + custom hooks + local state |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Charts | Recharts v3 · Icons: lucide-react · DnD: @dnd-kit (curriculum builder) |
| Storage | Browser LocalStorage only — keys below · schema version **3** (v2→v3 migration auto-reseeds) |
| Auth | Local demo simulation — NOT production security |
| Roles | admin / instructor / student / **sales (مسؤول اشتراكات)** |
| Architecture | Modular, service-based; storage adapter intended as future swap point |
| Primary fonts | Cairo (Arabic UI) · Inter retained in CSS only if re-enabled |
| Locales | ar-EG formatting everywhere |
| Payments | **Cash only — entered & approved in the CRM**; no online checkout exists by design |
| Subscriptions | Public request → sales manager (or admin) approves & records partial/final payments → enrollment created on "اعتماد الاشتراك وتفعيل الدورة" |

## 3. Technical Stack (installed versions, see package.json)

react ^19.2 · react-dom ^19.2 · react-router-dom ^7.9 · vite ^7.1 · @vitejs/plugin-react ^5 · tailwindcss ^4.1 · @tailwindcss/vite ^4.1 · lucide-react ^0.545 · recharts ^3.2 · react-hook-form ^7.65 · zod ^3.25 · @hookform/resolvers ^5.2 · @dnd-kit/core+sortable+utilities

Verification method (per user decision): **production build + browser walkthrough** — no unit-test framework installed.

## 4. Architecture

```
src/
  app/App.jsx (providers: Language → Toast → Auth → HashRouter)
  app/router.jsx (lazy routes, RequireRole guards, 404)
  i18n/index.jsx (LanguageProvider LOCKED to Arabic: t(), locale='ar-EG', dir='rtl', isRTL=true — no switching exists)
  i18n/translations/ar.js (the only bundle)
  contexts/{AuthContext,ToastContext}.jsx
  storage/{storageKeys, storageAdapter, storageInitializer}.js
  data/seed.js (deterministic mulberry32 seed-2026-11-14 generator)
  services/ (ALL business logic + permission checks): auth, course, category, enrollment, learning, quiz, certificate, review, notification, user, report, analytics, curriculum
  utils/{format,localized}.js
  constants/categoryIcons.js
  components/common/ (Button, FormControls, Modal, ConfirmDialog, Dropdown, Avatar, Badge/StatusBadge/EmptyState/Spinner/Pagination/ProgressBar/CircularProgress/Tabs, CourseCard, Logo, PageHeader, StatCard)
  components/navigation/{RequireRole}.jsx
  layouts/{PublicLayout (light navbar/footer), DashboardLayout (dark sidebar+header), StudentLayout, InstructorLayout, AdminLayout}.jsx
  pages/public (Home, Courses, CourseDetails, Categories, Instructors, InstructorProfile, About, Contact)
  pages/auth (Login, Register, ForgotPassword)
  pages/student (Overview, MyCourses, LearningRoom, MyQuizzes, QuizAttempt, Wishlist, Certificates, Profile, Settings)
  pages/instructor (Overview, MyCourses, CourseForm, CurriculumBuilder, QuizBuilder, Students, Analytics, Reviews, Profile)
  pages/admin (Overview, Users, UserDetails, Courses, CourseReview, Categories, Enrollments, Quizzes, Reviews, Certificates, Reports, Messages, Notifications, Settings, DataManagement)
  pages/shared/NotificationsList.jsx · pages/errors/NotFound.jsx
```

Design principles: business logic lives in services, never in components; storage access only through the adapter; every permission re-checked in services (client-side demo only); adapter supports export/import/reset with validation.

## 5. Routes

**Public:** `/` `/courses` `/courses/:courseId` `/categories` `/instructors` `/instructors/:instructorId` `/about` `/contact` `/login` `/register` `/forgot-password`

**Student:** `/student` `/student/courses` `/student/learn/:courseId` `/student/quizzes` `/student/quizzes/:quizId` `/student/wishlist` `/student/certificates` `/student/profile` `/student/notifications` `/student/settings`

**Instructor:** `/instructor` `/instructor/courses` `/instructor/courses/create` `/instructor/courses/:courseId/edit` `/instructor/courses/:courseId/curriculum` `/instructor/courses/:courseId/quizzes` `/instructor/students` `/instructor/analytics` `/instructor/reviews` `/instructor/profile` `/instructor/notifications` *(added: shared inbox; spec listed no instructor notifications page, bell links here)*

**Admin:** `/admin` `/admin/users` `/admin/users/:userId` `/admin/courses` `/admin/courses/:courseId` `/admin/categories` `/admin/enrollments` `/admin/quizzes` `/admin/reviews` `/admin/certificates` `/admin/reports` `/admin/messages` `/admin/notifications` `/admin/settings` `/admin/data-management`

**Utility:** `/404`, `*` → NotFound. `/home` → redirects to `/`.

Category cards link to `/courses?category=<id>` (filter via query param). Enrollment CTA routes back to referrer after login (`location.state.from`).

## 6. Data Models

Exactly as spec Part 8: users, categories (bilingual name/description/icon/status), courses (bilingual everything, `status: draft|pending|published|rejected|archived`, rejectionReason bilingual), sections, lessons (type video|text|external, isRequired), enrollments, lessonProgress (unique per student+lesson, toggle-based), quizzes (passingScore, maxAttempts, isRequired), questions (mcq|truefalse, bilingual options, correctAnswer index/bool), quizAttempts (**immutable**, attemptNumber, percentage, passed), reviews (status visible|hidden, excluded from averages when hidden), certificates (certificateNumber `EP-YYYY-######`), notifications (bilingual title/message), wishlist, messages (contact), settings (per user prefs), session (`edupulse_session`, 7-day expiry), `edupulse_schema_version = 1`.

## 7. Storage Keys

Exactly as spec Part 9 plus: `edupulse_language` (LANGUAGE_KEY), `edupulse_site_name` / `edupulse_demo_banner` / `edupulse_maintenance` (EXTRA_KEYS, local-only UI prefs). All centralized in `src/storage/storageKeys.js`.

**Backup/restore:** `admin/data-management` → export JSON (`{app, type:'backup', schemaVersion:1, exportedAt, counts, data}`), import (validate first — schema check + per-collection array check + referential sanity; **current data untouched on failure**), typed-confirmation (`RESET`) demo reset, honest storage-limits panel, approximate usage bytes + schema version display.

## 8. Business Rules (implemented in services)

- Course workflow draft→pending→published / rejected→resubmit. Only published courses public + accept enrollment. Admin approval required (instructors cannot self-approve). Rejection requires bilingual reason (enforced in modal + service). Archive when enrollments exist (never hard-delete courses with enrollment history).
- Progress formula: completed required lessons ÷ total required × 100 (zero-required → 100%). Optional lessons excluded. Used everywhere (learning room, dashboards, certificates).
- Quiz engine: grading client-side in `quizService.submitAttempt` (never trusts UI), maxAttempts enforced (0 = unlimited), attempts immutable, best score/history retained, passing ≥ quiz.passingScore (default 60).
- Certificate: enrolled + 100% required lessons + all required quizzes passed → `certificateService.checkAndIssue` (idempotent, unique number, marks enrollment completed, notifies). Called after lesson toggles and quiz passes.
- Reviews: enrolled-only, one per student/course, rating 1–5, hidden reviews excluded from averages, admin moderation (hide/restore/delete).
- Notifications: enrollment, approval/rejection, quiz result, certificate, admin broadcast (by audience: all/students/instructors). In-app only.
- Deletion safety: users with courses/enrollments cannot be deleted (suspend instead); categories with courses cannot be deleted; courses with enrollments archive instead of delete; cascade cleanup otherwise.
- Wishlist: per student, toggle on course page.
- Enrollments: free, no duplicate, published-only.

## 9. Localization Status — Arabic ONLY (single language, per user command 2026-11-14)

The whole product was converted from bilingual to **Arabic-only**, and then all language-switching machinery was **deleted** (user: "امسح كل الملفات الخاصة بتغير اللغة"):
- `src/i18n/index.jsx` — locked: `lang='ar'`, `dir='rtl'`, `locale='ar-EG'`; keys resolve from the Arabic bundle only. `setLang`/`toggleLanguage` no longer exist.
- **DELETED:** `src/components/navigation/LanguageSwitcher.jsx`, `src/i18n/translations/en.js`, `LANGUAGE_KEY` in storageKeys.js, and the `html[lang="en"]` CSS rule. Settings pages' language sections removed (Student + Admin). All aria-labels Arabic. Chart month labels `ar-EG`.
- Bilingual *data model* intentionally kept — admins can still store an English field for future re-enable; the public/user-facing UI renders the Arabic side only.
- Verified in browser after conversion: home renders pure Arabic RTL, no language buttons anywhere, build passes.

**Do not reintroduce language switching unless the user explicitly asks.** If asked to re-enable English: recreate `translations/en.js` (recover from git-less backup — this change log), re-add the switcher UI, restore `setLang` in the provider, and mirror all keys.

## 10. Implemented Features (all spec'd pages live)

Public site, all 3 dashboards, learning room, quiz engine, certificates (print-friendly A4 landscape CSS, unique numbers, Arabic/English layout), wishlist, notifications (list + admin broadcast + unread badge), reports with CSV export (BOM, Excel-Arabic safe) by 7 report types, contact messages inbox, admin data management (export/import-preview/reset/limits), platform settings (local), seed data exactly per spec quantities (1 admin, 4 instructors, 20 students, 8 categories, 12 courses, 30 sections, 100 lessons, 10 quizzes, 50 questions, 40 enrollments, 25 reviews, 5 certificates).

## 11. Partially Implemented

- CSV **download trigger** exercised logically but not clicked in a headless test (Blob+anchor path standard).
- Print dialog behavior verified only via CSS (`@media print` certificate rules), not by sending to a printer.
- dnd-kit reordering works via pointer + keyboard (arrow buttons as accessible alternative); keyboard reorder verified by code, not manually exercised.
- Suspended demo student `student20@edupulse.demo` exists (status suspended) so suspension can be tested; no seeded pending/rejected course (admin must submit one to test approve/reject cycle).

## 12. Not Implemented (intentionally)

- Backend/database, real auth, SSR, i18n routing (hash-based), payments (spec: none), real email/SMS, real file hosting, TypeScript, unit-test framework (user chose build+walkthrough verification), dark-mode public site, deployment (requires explicit user request — Phase 13).
- Category edit icon is an icon-key picker, not free-text image URL input (spec allowed "image URL or icon").

## 13. Current Phase

**Phases 1–11 complete** (foundation → analytics/reports). **Phase 12 (integration testing) partially done** via browser walkthrough. **Phase 13 (final polish/deployment) pending** — explicitly blocked on user request for deploy. **Latest build v1.11.0** — Arabic-only site, Arabic authoring forms, weeks-based durations, 9-course EraaSoft-style catalog, auto-migrated fresh seed (v1→v2). Home featured courses paginated. Admin password reveal/edit added. Real per-course quiz questions. All 39 routes render clean, zero console errors. Tabs & tables no longer scroll horizontally. Admin rejection reason Arabic-only. Instructor can restore archived courses.

Live-verified this session (Chrome tab, localhost:4173 preview, hash router):
- Home renders Arabic RTL, hero/featured/categories/instructors/stats/FAQ, **zero console errors**.
- Demo login (student/instructor/admin buttons + submit) → correct role dashboards, EN toast "Welcome back" → AR toast equivalents work.
- Student dashboard real data (2 enrolled / 1 in progress / 1 completed / 1 certificate / weekly activity chart).
- Lesson toggle persisted (progress 8→9 records). Quiz attempt answered → submitted → **passed 100%, immutable attempt id, result screen AR & EN**.
- Language switch AR↔EN → dir flips instantly, route preserved, both locales render.
- Instructor dashboard (سارة محمود): KPIs, enrollment trend, course performance chart, recent enrollments — all real data.
- Admin dashboard: KPIs, enrollment trend, user growth, course distribution pie, pending approvals (0), recent messages.
- Certificates page: printable card with EP-2026-100001, Arabic date rendering.
- Categories count: seeded 8 · courses 12 · users 25 · schema v1.

## 14. Progress Checklist

- [x] Inspect repo · [x] Foundation & build config · [x] Design tokens & RTL/LTR · [x] i18n full coverage · [x] Storage adapter + seed · [x] Auth + 4 role guards (admin/instructor/student/**sales**) · [x] Public pages (11+ subscription request) · [x] Student (10+shared notifications) · [x] Instructor (10) · [x] Admin (15) · [x] Learning/quiz/certificate engines · [x] Analytics + CSV reports · [x] CRM: subscription pipeline (request→payment→approve) · [x] Paid courses (cash only) · [x] Browser end-to-end smoke · [x] README + this doc · [ ] Deploy (awaits user request) · [ ] Full Part-20 checklist sweep (60+ items) · [ ] Lighthouse a11y audit · [ ] Real-world payment reconciliation process (cash drawer/bank — outside app)

## 15. File Inventory

See §4. ~105 source files. Key singles: `index.html` (fonts, ar/rtl bootstrap), `vite.config.js` (manualChunks react/charts/dnd), `src/styles/index.css` (tokens + print CSS), `EDUPULSE_AI_HANDOFF.md` (this file), `README.md`.

## 16. Known Issues

1. **Shared localStorage caveat:** during automated browser testing earlier this session, sessions were logged out/in multiple times in the user's browser (final state: instructor demo session). Extra test data exists (a completed lesson, a 100% quiz attempt). Reset via **Admin → إدارة البيانات → إعادة ضبط** to restore the seeded dataset. (v1.5.0 note: reviews-page crash fixed; all 39 routes render.)
2. **Catalog change:** old localStorage is wiped + reseeded automatically on first load of v1.4.0 (auto-migration v1→v2) — no manual reset needed; user just hard-refreshes (Ctrl+Shift+R). Session is cleared by the migration (expected).
3. HashRouter URLs (`/#/...`) — deliberate for static hosting; documented in README.
4. The public site intentionally has no dark mode; dashboards no light mode (spec).
5. Recharts emits a hidden `recharts_measurement_span` text node — invisible, aria-hidden, not a bug.
6. If browser storage fills, writes fail silently to `{ok:false}` paths — quota errors only surface as generic toasts; consider surfacing quota message if users report.
7. Seed images: pravatar.cc avatars + Unsplash thumbnails — require network; on failure they hide gracefully (alt/background preserved).

## 17. Change Log

- **2026-11-15 v2.7.0 — ADMIN CAN CHANGE ANY USER'S ROLE (ALL FOUR ROLES), WITH CONFIRMATION; SALES ROLE SELECTABLE EVERYWHERE.**
  - User ask ("اريد المدير ان يكون قادر علي تغير ال rule الخاصة بكل مستخدم"): the admin user editor could only assign student/instructor/admin — the sales role was unselectable.
  - `src/pages/admin/Users.jsx` — filter dropdown and create/edit form now both list **مسؤول الاشتراكات**; save flow: changing role shows a mandatory `ConfirmDialog` («تغيير دور المستخدم؟» — warns that permissions change completely) before persisting.
  - `src/pages/admin/UserDetails.jsx` — new inline «الدور والصلاحيات» panel with the same 4-role dropdown; disabled for the admin's own account with the explanation `admin.selfRoleLocked`; change persists after a confirmation dialog + toast; sidebar/detail page update immediately.
  - New `ar.js` keys: `admin.changeRole`, `admin.roleChanged`, `admin.selfRoleLocked`, `admin.roleChangeTitle/Message/Confirm`.
  - Verified in browser (admin login): Users list edit → أحمد حسن row → «مدرب» persists; UserDetails for usr_stu_01 → change student→sales → confirm → UI + storage show sales (restored to student afterwards; Amr Hany restored to student too — demo state tidy). Role filter by «مسؤول الاشتراكات» lists the seeded sales user. Build ✓ (7.3s).

- **2026-11-15 v2.6.0 — ADMIN GAINS FULL SALES VISIBILITY: PAID/REMAINING KPIs, SIDEBAR CRM LINK, SALES & PAYMENTS CSV REPORTS.**
  - User ask: platform admin needs to know sales, see paid vs. remaining, and export sales-specific reports.
  - **Admin sidebar** (`AdminLayout.jsx`) — new item «المبيعات والاشتراكات» (Banknote icon) → `/sales` (admin can already open the CRM; it was undiscoverable).
  - **Admin overview** (`admin/Overview.jsx`) — new cash strip under the KPI grid: إجمالي الطلبات (مع طلبات الشهر)، اشتراكات مكتملة، إجمالي المدفوع، المتبقي + «عرض كل المبيعات» button → `/sales`. Numbers live from `subscriptionService.stats()`.
  - **Admin reports** (`admin/Reports.jsx`) — two new cards: «تقرير المبيعات (الطلبات)» (every request with due/paid/outstanding/stage) and «تقرير المدفوعات» (every payment row). Backend in `reportService.js` (`sales`, `payments` types) — payments also flattens legacy grandfathered requests into settlement rows (amountPaid without payments[]) so the ledger is complete from day one.
  - **SalesLayout role label** — admin viewers now read «مدير المنصة» (role-aware roleKey) instead of «مسؤول الاشتراكات».
  - **Storage initializer** — logs a `[EDUPULSE] storage reseeded` warning with the reason (schema version/users validity) so any future reseed is diagnosable instead of silent.
  - **Verified in browser (admin login):** sales strip shows live numbers (٤٣ طلب · ٤٠ مكتمل · ٣٤٥٬٨٠٠ ج.م مدفوع · ٢١٬٠٠٠ ج.م متبقي), both report cards generate correctly (43 rows / 41 rows), sidebar link present. Build ✓ (7.17s).
- **2026-11-15 v2.5.0 — HORIZONTAL-SCROLLING STAGE PILLS REDESIGNED (SITE-WIDE TABS); NO HORIZONTAL SCROLL ANYWHERE.**
  - User feedback (screenshot of sales «متابعة طلبات الاشتراك» filter strip with a native horizontal scrollbar): "مش عايز اشوف حاجة زي كدا في الموقع كله."
  - `src/components/common/Feedback.jsx` — `Tabs` no longer renders `overflow-x-auto`; now a wrapping segmented pill bar: `flex flex-wrap gap-1.5` inside a rounded container (dark `#151F32` / light `slate-100`), each pill `h-9 px-3.5 rounded-xl` with an inline count badge (active: translucent white; dark: `#0B1120` on emerald; light: white with emerald ring). Active pill = emerald fill + emerald glow shadow.
  - Applies automatically to all 7 call sites (sales requests pipeline, admin Messages/CourseReview, student MyQuizzes/MyCourses, instructor MyCourses, public CourseDetails tabs) — one shared component, consistent site-wide.
  - Sweep confirms: no `overflow-x-auto|overflow-x-scroll|min-w-max` anywhere in `src/`; `docWidth === clientWidth` on `/student/courses`, `/courses/crs_008`, `/student/quizzes`, home, and `/sales/requests` (985–1000px, zero horizontal overflow); `[role=tablist]` computes `overflowX: visible` + `flexWrap: wrap`.
  - Build ✓ (6.55s). (Note: table-heavy reports keep `overflow-auto` for wide CSVs — required at desktop widths.)

- **2026-11-15 v2.4.0 — SALES LOGIN BROKEN (REGRESSION FOUND & FIXED); ROUTE WIRING RESTORED; PAID-COURSE FLOW RE-VERIFIED E2E.**
  - Root cause of "لا يمكن تسجيل الدخول كمسؤول اشتراكات": `src/app/router.jsx` had lost ALL sales routes and `/request-subscription` during an earlier editing slip — after login (redirect via `dashboardPath('sales')` → `/sales`) the path matched `*` → blank/404. Additionally `CourseDetails.jsx` had reverted to the pre-v2.0.0 free-enroll page (no price hero, no «اطلب الاشتراك» CTA).
  - **Fixed:** `router.jsx` — imports `SalesLayout`, lazy-imports RequestSubscription + sales pages, registers `GET /request-subscription` under PublicLayout and `/sales`, `/sales/requests`, `/sales/reports`, `/sales/notifications`, `/sales/profile` under `RequireRole roles={["sales","admin"]}` (admin can view CRM, by design).
  - **Fixed:** `CourseDetails.jsx` — restored the purchase card: final price in emerald with struck-through original + "خصم N%" amber badge, «اطلب الاشتراك» CTA → `/request-subscription?courseId=ID` (enrolled students keep «انتقل إلى غرفة التعلم»). `ar.js` `enrollCta` → «اطلب الاشتراك».
  - **Verified in a FRESH browser tab** (stale tab kept serving 404'd chunks; fresh tab is required after each build): sales demo login → lands on /sales with live KPIs; guards — sales→/admin, /instructor, /student all redirect to /sales; student→/sales → /student; admin→/sales works. Full pipeline re-run: student submits request for UI/UX → sales records cash payment (٥٬٥٢٥ ج.م) → «دفع كامل» → «اعتماد الاشتراك» → auto-enrollment created (usr_stu_01 → crs_008, active) → course visible in student's «دوراتي». Build ✓ (6.33s).
  - Note: `sales`-keyed pages show role label "مسؤول الاشتراكات" to admin viewers too (roleKey="sales" by design; admin sees the same CRM UI).

- **2026-11-15 v2.3.0 — HOME «لماذا تختار EDUPULSE؟» COPY REWRITTEN AS PERSUASIVE BENEFIT-DRIVEN ARABIC.**
  - User feedback: the section read like generic AI-written filler; wanted copy that actually convinces visitors to subscribe.
  - `home.benefitsTitle` → «لماذا تختار EDUPULSE؟» + new `home.benefitsSubtitle` line above the grid («كل اللي محتاجه عشان تتقن مهارة مطلوبة في السوق — وتخرج من الدورة جاهز لفرصتك.»); `Home.jsx` renders it (mb to accommodate).
  - All six benefit cards rewritten benefit-first, natural Egyptian-friendly Arabic, honest (no invented numbers/guarantees): تدفع مرة واحدة وتتعلم براحتك (cash payment after sales contact) · عربي من الأساس بالعربية من الصفر · شهادة تفتح أبواب (رقم فريد وقابلة للمشاركة) · مدربون من السوق مش من الكتب · اتعلم في وقتك وبالوتيرتك · تقدم تحس بيه مش كلام.
  - `home.ctaSubtitle` bottom CTA no longer claims "آلاف المتعلمين" (platform has 61 seeded learners — untrue); now «كل دورة تكملها خطوة حقيقية نحو فرصة أفضل — سجّل دلوقتي وابدأ النهارده.»
  - Verified: build ✓ (6.51s); home screenshot — section renders with new copy.

- **2026-11-15 v2.2.0 — ARABIC COPY PURGED OF EMBEDDED ENGLISH/CONTROL TERMS; TONE MADE NATURAL.**
  - User feedback: visible Arabic strings must be natural Arabic without Latin jargon (the screenshot offender: home benefits box said "المحتوى والواجهة بالعربية، مع دعم كامل لاتجاه RTL").
  - `src/i18n/translations/ar.js` scrubbed: `benefit2Text` now "المحتوى والواجهة بالعربية بتصميم كامل يعمل من اليمين إلى اليسار."; `sidePoint2` → "✓ منصة مصممة للعربية من الأساس"; `faq5A` (LocalStorage removed); `notificationsSubtitle` (SMS → رسائل نصية); `storageLimitsText` rewritten plainly; `heroSubtitle` (awkward double phrase removed); `storyText` about page (removed contradictory "تجربة إنجليزية كاملة" and stale "دون أي رسوم" → paid positioning); `registerSubtitle` (removed "مجاني للأبد"); `ctaButton` ("مجاناً" → الآن); `phone` placeholder (01xxxxxxxxx → 01012345678); removed unused `freeLabel`/`enrollNow`; `stackText` keeps only proper tech names (React/Vite/Tailwind); `common.free` key renamed to `common.paid`.
  - JSX usage: hero trust bullet `t("common.free")` → `t("home.benefit1Title")`; CourseDetails «مدفوع» badge → `common.paid`.
  - Verified: build ✓ (6.59s); home benefits screenshot — the box now reads fully in Arabic.

- **2026-11-15 v2.1.0 — COURSE CARD PRICE REVERTED TO FOOTER (per user feedback).**
  - User rejected the big price pill rendered on the card image ("لا اريد ان يظهر السعر بهذا الشكل") and asked for the previous footer treatment ("اريد ان يكون السعر هكذا"): the footer row shows lessons count · students count · rating **plus a small tag icon with the price in emerald** (e.g. `🏷️ ١٤٬٠٠٠ ج.م`), with Arabic-Indic digits and `ج.م` unit.
  - `src/components/common/CourseCard.jsx` — removed the image-area price pill entirely; footer price now renders for **all** cards (public + management, not gated by `actions`). Instructor/management cards keep the status `badge` on the image top-end as before. Removed unused `gross`/`discount` locals.
  - `src/i18n/translations/ar.js` — removed the last "مجاني" remnant in the public header CTA (`register: 'إنشاء حساب مجاني'` → `'إنشاء حساب'`); v2.0.0 had already scrubbed the rest.
  - Lesson-video embed in seed changed to per-lesson YouTube search embeds (`youtube.com/embed?listType=search&list=<lesson title>`) replacing the placeholder `dQw4w9WgXcQ` video, and `SCHEMA_VERSION` bumped 3→4 so the new embeds propagate to existing browsers via the wipe-and-reseed path.
  - Verified: production build ✓ (6.6s), home featured-courses grid screenshot — prices appear in the card footer exactly as requested, no image-area pill.

- **2026-11-15 v2.0.0 — COURSES ARE NOW PAID; FULL SUBSCRIPTION CRM ADDED; SALES ROLE; PAYMENT FLOW VERIFIED END-TO-END.**
  - User raised the product bar: every course now has a price in EGP (machines mapped from the EraaSoft catalogue with prices reduced by 1,000 EGP — AI 14,000, Front-End 7,500, Node.JS 7,500, .NET 8,000, PHP 7,500, Java 13,000, Data Analysis 9,000, UI/UX 6,000→6,500, CS8 4,500). **No free courses remain; payment is cash-only, recorded & approved by a new "مسؤول اشتراكات" role.**
  - **Schema migrated 2→3** (`storageKeys.js`); `storageInitializer.js` now wipes ALL keys and reseeds on first load of v2.0.0 (user's stale localStorage will be replaced).
  - **New service** `src/services/subscriptionService.js` — full CRM: create paid request (logged-in students only) → sales intake → stages `new → contacted → partial/paid → completed|rejected`, payments array with timestamps + by-who, notes thread on every request, revenue stats, monthly revenue series, outstanding balance derived live. `createForAudience` broadcast notifications support subscription type.
  - **New role `sales`** ("مسؤول الاشتراكات"): demo account `sales@edupulse.demo / Demo123`. Own layout `SalesLayout.jsx` with routes `/sales` (overview: new/contacted/paid/completed KPI cards + revenue sparkline + outstanding amount + paid/pending splits), `/sales/requests` (tabbed pipeline: all / new / contacted / partial / paid / completed / rejected; detail modal with payment recording, notes, complete/reject actions), `/sales/reports` (total revenue, monthly revenue bars, course-wise distribution, CSV export with BOM). Admin can also access sales pages (same RequireRole roles={sales, admin}).
  - **New pages**: `RequestSubscription.jsx` (public flow: preselected course from `?courseId=`, phone validation Egypt-format `^01[0-2,5]\d{8}$`, success screen after submit, notification blast to every sales manager), `SalesLayout.jsx`, `sales/Overview.jsx`, `sales/Requests.jsx`, `sales/Reports.jsx`, `sales/Profile.jsx`, `sales/Notifications.jsx`, `shared/DarkProfile.jsx` (shared profile editor replacing duplicated dark profile form).
  - **Course seed reseeded** with `price` and `discount` fields (all 9 programs have price; 4 include discounts: .NET 10%, UI/UX 15%, CS8 20%, 0 elsewhere) and 40 grandfathered completed subscriptions (so dashboards show realistic paid/pending/outstanding stats on first load).
  - **Routing glue** `RequireRole` now understands sales; `dashboardPath.js` routes sales→`/sales`, admin→`/admin`, instructor→`/instructor`, default→`/student`. Registered `/request-subscription` + all `/sales/*` paths in `src/app/router.jsx` with lazy imports.
  - **Course cards** (`components/common/CourseCard.jsx`) — redesigned from "EraaSoft-style white card on dark hero" to "**Same floating-stat strip + category pill + image + hover scale**", price tag + discount badge on the image, removal of "مجاني" label. Shows discount badge automatically when `course.discount > 0`.
  - **Course details hero** now shows the final price, original price struck-through when discounted ("٨،٠٠٠ ج.م / ٧،٢٠٠ ج.م"), and "خصم 20%" badge. **"اطلب الاشتراك"** button routes to `/request-subscription?courseId=ID` instead of the free-enroll path.
  - **Public layout footer** adds real social icons (LinkedIn, Facebook, TikTok — using lucide's `Music2` icon for TikTok —, Instagram) with hover brand-colored fills; floating WhatsApp button fixed to bottom-start on `/` (and only `/`) with `wa.me/201001234567` placeholder (clearly marked as temporary — user will supply the real number).
  - **Auth/login demo buttons** updated to a 2×2 grid showing 4 accounts (admin / instructor / student / sales).
  - **Notifications for sales** broadcast when a subscription request is created (spam-protection: sales get one notification per request, every sales manager).
  - **Notifications service** extended: `notificationService.create()` messages for subscription events (received, payment recorded, approval, rejection).
  - **Numbers format**: `Intl.NumberFormat('ar-EG', {maximumFractionDigits:0})` everywhere — EGP values display as "١٤٬٠٠٠ ج.م".
  - **Admin overview** unchanged; sales KPIs are visible only to sales / admin. No cart, no checkout, no Stripe/Vodafone/Fawry integration (cash only, by design).
  - **Verification (browser walkthrough)**: student logs in → clicks "اطلب الاشتراك" on CS8 Program course page → fills phone/name → submits → sales sees the new request → records payment → Arabic strikethrough applied → approves → enrollment created → student sees it in "دوراتي". Reject path: request goes to rejected state + student notification. Build ✓ ~7s.
  - **Known migration note:** user's localStorage still holds v1/v2 data; on next load the auto-wipe + reseed handles it no matter which version they're on (ALL keys cleared → schema v3 → full 65-user / 9-course / 40-sub seed). User loses nothing of value (only demo data).

- **2026-11-15 v1.11.0 — NO HORIZONTAL SCROLL ANYWHERE; REJECTION REASON ARABIC-ONLY; INSTRUCTOR CAN RESTORE ARCHIVED COURSES.** Detailed:
  - **Tabs (across the whole app) no longer require horizontal scroll.** `src/components/common/Feedback.jsx` — tablist container switched from `flex overflow-x-auto pb-1` to `flex flex-wrap gap-1.5`; tabs wrap onto multiple rows instead of scrolling. Fixes the visible horizontal scrollbar in instructor «دوراتي» (see user screenshot) and every other tabbed page.
  - **All data tables no longer scroll horizontally.** Removed `overflow-x-auto` wrapper + `min-w-*` from every table; replaced with responsive design that hides less-critical columns on narrow screens and text-truncates the rest (no scroll, no clipped action buttons):
    - `pages/admin/Courses.jsx` (course list + responsive hidden columns: المدرب md, القسم lg, التسجيلات sm) — the exact table from the user's screenshot.
    - `pages/admin/Users.jsx`, `pages/admin/Certificates.jsx`, `pages/admin/Enrollments.jsx`, `pages/instructor/Students.jsx`, `pages/student/MyQuizzes.jsx` (attempt history) — same pattern applied.
    - `pages/admin/Reports.jsx` — report preview table also lost its `min-w-[640px]` (would have introduced horizontal scroll on small screens).
  - **Verified at 897–912px viewport width:** `document.documentElement.scrollWidth === clientWidth` on admin/courses AND admin overview → zero horizontal scroll.
  - **Admin rejection reason is Arabic-ONLY (user command, consistent with earlier removals):** `pages/admin/CourseReview.jsx` — removed the `rejectReasonEn` ("سبب الرفض (English)") textarea; rejection is submitted with `{ ar: reasonAr, en: reasonAr }` (mirror); `courseService.reject` unchanged except the page sends the mirrored pair. Verified live: modal shows only "السبب*".
  - **Instructor can now restore an archived own course** (`courseService.restore` was admin-only — refactored to accept `{ requesterId, requesterRole }` and permit instructor restore of own courses; admins still restore any). `pages/instructor/MyCourses.jsx` — added "استرجاع" button (emerald) on archived cards + service call sets status to `draft`. Verified live end-to-end: archive → "استرجاع" appears → click → course back to مسودة → "إرسال للمراجعة" visible → submit → Admin sees "قيد المراجعة" → reject with reason → instructor sees reason + "إعادة الإرسال" → resubmit → Admin can approve/publish.
  - Build ✓ (~7.0s). User must Ctrl+Shift+R to load the new bundle.

- **2026-11-15 v1.10.0 — "إدارة الاختبارات" CRASH FIX (instructor dashboard link dead).** Detailed:
  - **Bug as reported by user:** instructor → دوراتي → «إدارة الاختبارات» appeared to do nothing / page blank. Root cause: `src/pages/instructor/QuizBuilder.jsx` still rendered `qForm.optionsAr`/`qForm.optionsEn` — state keys that no longer existed after the Arabic-only conversion → `TypeError: Cannot read properties of undefined (reading 'map')` at render → React crashed the route silently (stale text shown, no console error values reported to user). Fixed the MCQ option row to use the single Arabic `qForm.options` array + `setOption(i, value)`.
  - Verified end-to-end in the browser as instructor Sara: the page renders (quiz for CS8 course with its 5 real questions from the course content), «إضافة سؤال» modal opens with Arabic-only fields, **zero console errors**.
  - **Remaining inconsistency (honest flag):** `src/pages/admin/Categories.jsx` still has the bilingual name/description fields (Arabic + English) — admins must fill both; same Arabic-only conversion is applicable. Ask user whether to convert.
  - Build ✓ (~6.7s).

- **2026-11-15 v1.9.0 — GLOBAL HIDE OF NUMBER-INPUT SPINNERS.** Detailed:
  - `src/styles/index.css` — added a global rule `input[type='number'] { appearance: textfield; -moz-appearance: textfield }` and `::-webkit-inner/outer-spin-button { -webkit-appearance: none; margin: 0 }`. Applies to every number input in the app (course duration, hours, projects, quiz passing/attempts, category icon…). Verified in-browser: `computedAppearance: textfield` on the `estimatedDuration` (المدة التقديرية) input. **No component/JS changes** — pure CSS.
  - Note: a stale user tab after rebuild crashes (old hashed chunks 404 → blank page) — always hard-refresh after rebuilding.
  - Build ✓ (~6.8s).

- **2026-11-15 v1.8.0 — REMOVED FALSE "BILINGUAL" CLAIMS FROM THE ARABIC-ONLY UI.** Detailed:
  - `src/i18n/translations/ar.js` — fixed three visible lies left from the bilingual era:
    - `home.benefit2Title` `'ثنائي اللغة'` → `'عربي أصيل'`; `benefit2Text` (the sentence the user pasted) `'المحتوى والواجهة بالعربية والإنجليزية، مع دعم كامل لاتجاه RTL.'` → `'المحتوى والواجهة بالعربية، مع دعم كامل لاتجاه RTL.'`
    - `home.faq4A` `نعم، المنصة بالكامل باللغتين…` → `لا، حالياً المنصة بالعربية فقط بالكامل. قد نضيف نسخة إنجليزية مستقبلاً.` (faq4Q left as-is — now consistent with the answer).
    - `about.subtitle` `تعلّم بلا حدود — بالعربية أو الإنجليزية` → `تعلّم بلا حدود — بالعربية`.
  - Also fixed related dead string: `auth.sideText` (panel was removed earlier) — text aligned to Arabic-only.
  - `*En` keys in translations (removed English-form labels) are unused but harmless; left in place to avoid risky sweeps.
  - Build ✓ (~6.9s). No behavior changes.

- **2026-11-14 v1.7.0 — HOME FEATURED COURSES ARE NOW PAGINATED (6 per page).** Detailed:
  - `src/pages/public/Home.jsx` — the "Featured courses" section now renders **all published courses** in pages of 6 (sorted by enrollment desc), with the shared `Pagination` component (light variant) under the grid — page 1: AI Diploma · Front-End · Java Diploma · Data Analysis · Node.JS · .NET; page 2: PHP · UI/UX · CS8. Before this, only 6 cards existed and there was no way to reach the rest from the home page.
  - Also imports `Pagination` from `components/common/Feedback`.
  - Build ✓ (~6.8s). Browser-verified: page 1 shows 6 cards + pagination "‹ 1 2 ›"; switching to page 2 shows the remaining 3 courses; zero console errors.
  - User's request satisfied: home shows a real pagination to reach every course, not just "عرض الكل" link.

- **2026-11-14 v1.6.0 — ADMIN SEES & EDITS ALL USER PASSWORDS; MODAL FOCUS-STEAL BUG FIXED.** Detailed:
  - **Bug reported by user:** typing each character in the "new password" field inside the admin edit modal jumped focus to the modal's × close button. Root cause: `Modal`'s autofocus `useEffect` depended on `[open, onClose]`; the parent passed a NEW `onClose` closure on every keystroke (filling form state) → effect re-ran → focused the FIRST focusable in the DOM — which is the header's × close button.
  - **Fix (real fix, not a workaround):** `src/components/common/Modal.jsx` — `onClose` now stored in a ref updated each render; the effect runs only on `[open]`; autofocus prefers the first editable control (`input/select/textarea`) inside the panel, falling back to the close button for dialogs without inputs. Focus no longer leaves the field while typing. Verified in-browser: typed 3 chars via native inputSetter — `document.activeElement` remained `#uPass` (`Demo123XYZ`) ✓ modal `[role=dialog]` open ✓ Escape closes ✓.
  - **Admin password visibility (user request: "صلاحية بمعرفة كلمة السر وتعديلها"):**
    - `src/services/userService.js` — new `getPrivateById(id)` returning the FULL user record including the stored password (admin use only). `getById()` remains password-stripped for everything else. The demo seed intentionally stores passwords as plain text (documented limit).
    - `src/pages/admin/Users.jsx` — edit modal now PREFILLS the actual stored password; password field uses `type="password"` + Eye/EyeOff toggle (`showPassword` state) to reveal on demand; reserved self-editing guard unchanged (self user still non-editable in role/status).
    - `src/pages/admin/UserDetails.jsx` — added an amber "المفتاح" block under the email: monospaced password with Eye/EyeOff reveal/hide (private record only visible here, never in list tables).
    - Hint in edit modal states: "مرئية للمدير — النسخة التجريبية تخزنها كنص عادي".
  - Build ✓ (~6.7s). Browser-verified: reveal/hide toggles work in both places; focus fix confirmed; details page renders the masked password.
  - **Known limitation (honest):** passwords remain plain text in localStorage — the admin-reveal feature is intentional for this demo; it does NOT add any real security boundary. A real deployment must hash passwords server-side.

- **2026-11-14 v1.5.0 — ADMIN BROADCAST NOTIFICATIONS → ARABIC ONLY; ADMIN REVIEWS CRASH FIX + FULL 39-ROUTE SWEEP.** Detailed:
  - `src/pages/admin/Notifications.jsx` — removed BOTH English inputs (titleEn + messageEn) from the composer; validation now requires Arabic title+message only; audience selector unchanged; stored in the bilingual shape with `en` mirrored from Arabic (documented behaviour).
  - **Root cause of "admin sidebar links don't work, e.g. reviews":** `src/pages/admin/Reviews.jsx` referenced the `Search` icon in JSX but never imported it → `ReferenceError: Search is not defined` at render → blank page (React crashed, route unreachable). Fixed: added `Search` to the lucide import. All other 39 lazy routes verified — only this file was broken.
  - **Lesson learned / process fix:** `vite build` does NOT catch this class of runtime-only crash. After every change, besides building, do a full route sweep or at least open the affected routes. 39 routes were visited programmatically; **all clean, zero console errors.**
  - **Local tab staleness:** the user's tab had been kept alive across builds; old hashed lazy chunks were wiped by later `vite build`, so after a fix the tab SHOWS BROKEN PAGES while the server serves fine. Hard refresh (Ctrl+Shift+R) always after deploying/building — otherwise stale zombie state misrepresents the app.
  - Build ✓ (~6.4s). Notifications broadcast flow unchanged end-to-end otherwise.

- **2026-11-14 v1.4.0 — AUTO-MIGRATION v1→v2 (reseed) + COMPLAINT FIX: "weeks number too big".** Detailed:
  - Root cause of the user's complaint "عدد الأسابيع كبير جدا في كل الكروت": their browser's localStorage still held the OLD seed (estimatedDuration stored in MINUTES, e.g. 120/300 → rendered as "120 أسبوع"). No UI bug; just stale data.
  - Fix: `SCHEMA_VERSION` bumped 1 → 2. `src/storage/storageInitializer.js` now wipes ALL storage keys when version ≠ 2 before seeding (v1→v2 one-time migration), guaranteeing fresh EraaSoft-numbered catalog (AI 32w·210h·10p · Front-End 18w·160h·5p · Node.JS 16w·140h·6p · .NET 17w·160h·5p · PHP 16w·120h·5p · Java 32w·300h·9p · Data Analysis 16w·120h·4p · UI/UX 12w·90h·2p · CS8 9w·64h·4p) with zero manual reset for the user.
  - Consequence: user's session is cleared on first load after update → they log in again (expected; demo accounts unchanged).
  - Backup import accepts schema v2 only (v1 backups rejected with "incompatible schema" message — intentional, honest).
  - Build ✓ (~6.5s).

- **2026-11-14 v1.3.0 — REAL CURRICULA FOR THE 9 ERAASOFT-STYLE COURSES + VERIFICATION BUILD.** Detailed:
  - `src/data/seed.js` — catalog content replaced with self-authored Arabic curricula (NOT copied from EraaSoft's paid syllabus). Same public program names/weeks/hours/projects as the reference, same subject ordering (industry-standard topics), but every description/lesson title written by the AI team in EDUPULSE's Arabic voice:
    - **AI Diploma** (32w·210h·10p): 9 phases / 56 lessons — Python & env → data structures → SQL → math for AI → classic ML → deep learning (PyTorch) → NLP → deploy/MLOps → 4 projects.
    - **Front-End Development** (18w·160h·5p): 10 phases / 60 lessons — web basics → CSS Grid/Flexbox → JS DOM/async → tooling → ES6+ → React → state management → Next.js → performance → 3 projects.
    - **Back-End (Node.JS)** (16w·140h·6p): 8 phases / 45 lessons — Node fundamentals → Express → SQL → MongoDB → API security → REST/GraphQL → testing/Docker/CI → 3 projects.
    - **Back-End (.NET Diploma)** (17w·160h·5p): 8 phases / 37 lessons — C#/.NET → ASP.NET Core → EF Core → Identity/JWT → pro APIs → team/Agile → deploy → 3 projects.
    - **Back-End (PHP)** (16w·120h·5p): 7 phases / 34 lessons — PHP → MySQL → full apps → templating → dashboards & security → perf/deploy → 3 projects.
    - **Back-End (Java Diploma)** (32w·300h·9p): 7 phases / 43 lessons — Java OOPs → advanced → Spring Boot → JPA/Hibernate → security → test/deploy → enterprise projects.
    - **Data Analysis** (16w·120h·4p): 8 phases / 42 lessons — analytics intro → Excel pro → Python (Pandas/Matplotlib/Seaborn) → statistics → cleaning → Power BI → storytelling → 4 projects.
    - **UI/UX Design** (12w·90h·2p): 6 phases / 30 lessons — UX process → visual design → Figma & design systems → accessibility → practice → 2 projects.
    - **CS8 Program** (9w·64h·4p): 5 phases / 23 lessons — computer basics → programming logic → first language → app building → 3 projects.
    - Totals: ~370 lessons, ~68 sections (up from 100 lessons / 30 sections).
  - Seed generation rewritten to iterate `phasesById`; per-phase sections, per-lesson detailed Arabic descriptions/content (still with `[required]`/optional flags by index).
  - Seed counts comment block updated. Quizzes still 9 (45 questions). Enrollment math spreads over 9 courses.
  - **Build ✓** (~6.7s, index 357 kB, gzip ~110 kB). Course detail pages show phase-grouped curriculum + stats ("X أسبوع · Y ساعة · Z مشاريع").
  - **Reset REQUIRED:** user's localStorage still holds the old 12-course seed; new catalog appears only after Admin → إدارة البيانات → إعادة ضبط.

- **2026-11-14 v1.2.0 — ARABIC-ONLY AUTHORING FORMS, COURSE DURATION IN WEEKS, ERAASOFT-BACKED CATALOG + CREATE FLOW COMPLETED.** (Reference: https://www.eraasoft.com/)

  **Course & content authoring forms → Arabic ONLY (English fields auto-mirrored into `en` on save — data-model shape preserved):**
  - `src/pages/instructor/CourseForm.jsx` — rewritten Arabic-only: dropped the AR/EN tab toggle + all paired English inputs. Single Arabic form: title/short/full description, thumbnail, category, level, duration (weeks), hours, projects, objectives/prereqs/requirements (one textarea per field, Arabic). Zod schema Arabic-only.
  - `src/pages/instructor/CurriculumBuilder.jsx` — section/lesson modals → Arabic-only fields; `emptySection`/`emptyLesson`/modal JSX rewired; lesson video URL unchanged.
  - `src/pages/instructor/QuizBuilder.jsx` — quiz modal and question modal → Arabic-only fields; MCQ options are now a single Arabic list; TF unchanged (correctBool); options mirrored into `en` on save. `openQuestionModal` reads Arabic options.
  - `src/i18n/translations/ar.js` — removed the literal suffix " (العربية)" from ALL 20 authoring labels (21 replacements); added `instructor.hours` ("عدد ساعات التدريب") and `instructor.projects` ("عدد المشاريع").

  **Course duration semantics changed MINUTES → WEEKS (user request):**
  - `src/utils/format.js` — added `formatWeeks(weeks)` with Arabic pluralization (أسبوع / أسبوعان / N أسابيع / N أسبوع); `formatDuration` (minutes) kept for learning-room totals.
  - Display sites switched to trio "X أسبوع · Y ساعة · Z مشاريع": `components/common/CourseCard.jsx`, `pages/public/CourseDetails.jsx`, `pages/admin/CourseReview.jsx`.
  - `CourseForm` duration input now `estimatedDuration` = weeks (1–52); validation `min(1).max(52)`; default 6.
  - `src/i18n/translations/ar.js` — label now "المدة التقديرية (بالأسابيع)".

  **NEW data-model fields (course records): `estimatedHours` (int) and `projectCount` (int) — EraaSoft-style trio.**
  - `src/services/courseService.js` — `create()` now persists `estimatedHours` and `projectCount`.
  - `CourseForm` — two new required number inputs (hours 1–2000, projects 0–100) wired into zod + payload.
  - Payload update in CourseForm passes both.

  **Catalog replaced with the 9 real EraaSoft programs (user request, reference: https://www.eraasoft.com/):**
  - `src/data/seed.js` — REWRITTEN. The 12 demo courses are replaced by the 9 EraaSoft diplomas with **the same names and numbers** (duration weeks / weekly hours / projects): AI Diploma 32w·210h·10p · Front-End Development 18w·160h·5p · Back-End (Node.JS) 16w·140h·6p · Back-End (.NET Diploma) 17w·160h·5p · Back-End (PHP) 16w·120h·5p · Back-End (Java Diploma) 32w·300h·9p · Data Analysis 16w·120h·4p · UI/UX Design 12w·90h·2p · CS8 Program 9w·64h·4p.
  - Sections 30 / lessons 100 / quizzes 9 (45 questions). Enrollment seed math now spreads over 9 courses (`s % 9`).
  - **Copyright honesty note:** curriculum content (titles/descriptions/objectives/lessons) is self-authored Arabic for EDUPULSE — NOT copied from EraaSoft's paid curriculum. Only program names + published numbers (weeks/hours/projects) were reused, per the user's explicit instruction.
  - **User's localStorage still shows the OLD catalog until a demo reset** (إدارة البيانات → إعادة ضبط).

  **UI chrome removed (user request):**
  - `src/layouts/PublicLayout.jsx` — footer "EDUPULSE تطبيق تجريبي يعمل بالكامل داخل متصفحك…" paragraph with Activity icon removed (demoNote no longer appears).
  - `src/pages/auth/Register.jsx` — brand side panel deleted (Logo, Activity, sideTitle/sideText/sidePoint1-4, copyright line, glow backdrop). Page is now a single centered form. (User asked for Register; same panel existed in Login — removed there too.)
  - `src/pages/auth/Login.jsx` — same side panel deleted; single centered form; unused `Activity` import removed.

  **Verification:** `npx vite build` ✓ (~6.5s, index 339 kB). Register & Login pages visually confirmed centered full-width forms; home renders new auth-free header/footer; seed rewrite compiles. NOT yet browser-verified end-to-end after the catalog swap (needs reset; see §19).

- **2026-11-14 v1.1.0 (evening) — ARABIC-ONLY CONVERSION + DELETION OF ALL LANGUAGE-SWITCHING (explicit user command).** Detailed per-file inventory:

  **Deleted (user: "امسح كل الملفات الخاصة بتغير اللغة"):**
  - `src/i18n/translations/en.js` — English bundle removed.
  - `src/components/navigation/LanguageSwitcher.jsx` — language toggle component removed from the app.
  - `LANGUAGE_KEY` (`edupulse_language`) removed from `src/storage/storageKeys.js`.
  - `html[lang="en"]` font rule removed from `src/styles/index.css` (html now always Arabic).

  **Rewritten:**
  - `src/i18n/index.jsx` — locked to Arabic: `lang='ar'`, `dir='rtl'`, `locale='ar-EG'`, `isRTL=true`; no `setLang`/`toggleLanguage`; keys resolve from `translations/ar.js` only; safe fallback returns the key in DEV-missing case.
  - `index.html` — meta description Arabic-only.

  **Edited (language-switch UI/sections removed or localized):**
  - `src/layouts/PublicLayout.jsx` — removed import + `<LanguageSwitcher />`; aria-labels Arabized.
  - `src/layouts/DashboardLayout.jsx` — removed import + `<LanguageSwitcher dark />`; nav aria-label Arabized.
  - `src/pages/auth/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx` — removed switcher imports/usages.
  - `src/pages/student/Settings.jsx` — removed language section + `setLang` wiring; settings now = notification prefs only.
  - `src/pages/admin/Settings.jsx` — removed `defaultLanguage` FormField; now shows a static "اللغة: العربية" info row.
  - `src/services/analyticsService.js` — chart month labels now `ar-EG` (enrollmentTrend, userGrowth, instructorEnrollmentsTrend).

  **Arabized aria-labels (were English):** `src/components/common/Feedback.jsx` (Spinner/Pagination), `common/Modal.jsx`, `contexts/ToastContext.jsx` (dismiss), `layouts/DashboardLayout.jsx`, `layouts/PublicLayout.jsx` (main/mobile nav), `components/common/Logo.jsx` (home link). (A previous PowerShell bulk-edit had corrupted these with mojibake; repaired.)

  **Verification:** `npx vite build` ✓ (~7s). Index bundle shrank 379→342 kB. Browser (fresh tabs): home & `/login` render **dir=rtl, lang=ar, zero "English"/"EN" strings, no language buttons anywhere**. NOTE for user: their open tab still runs the OLD bundle until they hard-refresh (Ctrl+Shift+R).

  **Unchanged on purpose:** the bilingual *data model* (`{ar, en}` on every entity, e.g. course titles/descriptions, notification titles/messages, quiz content) is retained — admins can store English for a possible future re-enable; the UI renders the Arabic side. `translations/en.js` is gone with no git history to recover it — recover text from v1.0.0 notes or add a fresh translation file if English is ever re-requested.
- **2026-11-14 v1.0.0** — Initial complete build from empty workspace: scaffold, tokens, i18n (AR/EN parity), storage adapter, seed (deterministic), 3 role dashboards, all 46 routes, learning room, quiz engine, certificates, reports, backup/restore/reset, browser smoke tests, docs. Commands run: `npm install`, `npx vite build` (✓ built in ~6s), `npx vite preview --port 4173`, browser tab verification.

## 18. Test Results Summary

| Suite | Result |
|---|---|
| Production build | ✅ v1.2.0 passes (~6.5s, 339 kB index + 430 kB charts, gzip ~106 kB) |
| Arabic authoring forms (create course flow works with new required inputs) | ⚠️ build ✓; browser create-submit NOT exercised |
| Console errors (all visited pages) | ✅ zero |
| Login all 3 roles + redirect | ✅ |
| Language AR↔EN + dir + route preserve | ✅ v1.0.0 (historical, pre Arabic-only) |
| Arabic-only lock (no EN UI, no toggle, dir=rtl/lang=ar) | ✅ v1.1.0 browser-verified |
| Auto-migration v1→v2 reseed (big-weeks fix) | ✅ v1.4.0 build + migration path implemented |
| Full 39-route render sweep, zero console errors | ✅ v1.5.0 |
| Modal focus fix (typing no longer jumps to close ×) | ✅ v1.6.0 browser-verified |
| Admin password reveal/edit (prefill + Eye toggles) | ✅ v1.6.0 browser-verified |
| Lesson toggle persistence | ✅ (localStorage round-trip) |
| Quiz attempt submit/score/immutable attempt | ✅ 100% recorded, Result screen |
| Admin/instructor/student dashboards w/ real data | ✅ charts render |
| Public home (RTL, hero, stats 5-cert count) | ✅ screenshot + DOM |
| Backup export | ⚠️ code reviewed, download not click-tested |
| Backup import (invalid rejected) | ⚠️ validation logic present, not click-tested |
| Print certificate | ⚠️ CSS present, print dialog not triggered |
| Full Part-20 checklist | ❌ NOT run (60+ items) — schedule before release |
| Lighthouse | ❌ not run |

## 19. Next Steps

1. **Auto-migration v1→v2 (v1.4.0)** makes any old localStorage refresh (or load) wipe + reseed with the new 9-course catalog automatically — the previous "big weeks" bug (minutes shown as weeks) is fixed and the user only needs to hard-refresh (Ctrl+Shift+R). Verify home + course pages show weeks/hours/projects correctly.
2. **User decision needed for deploy** (Phase 13): Vercel/Netlify/GitHub Pages — HashRouter needs no rewrites; all assets relative-safe.
3. Run complete Part-20 browser checklist (all filters, forms, moderation, suspend-login-block, import invalid file, reset flow, full Arabic sweep).
4. Lighthouse a11y pass; fix anything < 90.
5. Optional: seed one *pending* + one *rejected* demo course so admin approval flow can be demoed without manual submission.

## 20. Quick Ops

```bash
npm install
npm run dev        # dev server, port 5173
npm run build      # production build → dist/
npm run preview    # serves dist/ on port 4173
```

**Demo accounts (public demo only):** `admin@edupulse.demo / Admin123` · `instructor@edupulse.demo / Demo123` · `student@edupulse.demo / Demo123` (register screen blocks Admin creation).

**⚠️ Before handing to user after a browser test session:** open Admin → إدارة البيانات → Export backup (safety) or Reset demo data; do NOT assume pristine seed if agents/user clicked around.
