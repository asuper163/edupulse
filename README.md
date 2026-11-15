# EDUPULSE — تعلم. علّم. انجح. | Learn. Teach. Achieve.

A complete **Arabic (RTL) Learning Management System with a built-in subscription CRM** — built with React, Vite, Tailwind CSS and LocalStorage. Four roles, one unified product, **cash-only subscriptions**. All courses have real prices in Egyptian pounds.

> ⚠️ **Honest scope note:** EDUPULSE is a frontend-only demo. Authentication, roles, data and analytics are simulated locally in your browser's LocalStorage. There is **no** server, database, real email delivery, or real payment gateway. LocalStorage data lives on this device/browser only and is lost if browser data is cleared. See `EDUPULSE_AI_HANDOFF.md` for the full architecture and current status.

## Quick start

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the build → http://localhost:4173
```

First launch auto-seeds a complete demo dataset (schema v3) — 26 users (1 admin, 4 instructors, 1 sales manager, 20 students), 9 real-price program courses (EraaSoft catalogue with prices reduced by 1,000 EGP), 40 grandfathered completed subscriptions, and full sections/lessons/quizzes/enrollments/reviews/certificates.

## Demo accounts (public demo only)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@edupulse.demo` | `Admin123` |
| Instructor | `instructor@edupulse.demo` | `Demo123` |
| Student | `student@edupulse.demo` | `Demo123` |
| **Sales (مسؤول اشتراكات)** | `sales@edupulse.demo` | `Demo123` |

Or use the **one-click demo buttons** on the login screen.

## What's inside

- **Public website (light):** home with live platform stats (61 learners / 9 courses / 4 instructors / 5 certificates), course catalog with prices & discounts, category grid, instructors, about, **floating WhatsApp button** (fixed on home only), contact form. **Every course card shows its price** on the home page.
- **Student dashboard:** overview with weekly activity chart, my courses with progress, learning room (sections/lessons, video embeds, lesson completion, certificate auto-issue), quizzes with attempt history and graded immutable attempts, wishlist, printable certificates, notifications, profile, settings.
- **Instructor dashboard:** create & manage own courses (Arabic form; **price + optional discount %** fields), curriculum builder with drag-and-drop, quiz builder (real per-course questions from actual lesson content), students table, analytics, reviews, profile.
- **Admin dashboard:** platform KPIs, dedicated **«المبيعات والاشتراكات» screen** (`/admin/sales` — admin's own sales copy, separate from مسؤول الاشتراكات' `/sales`): KPIs (إجمالى الطلبات/جديدة/مكتملة/معدل التحصيل، المطلوب والمدفوع والمتبقى), monthly revenue chart, revenue share per course, per-course collection table, آخر المدفوعات, full ledger with search & stage filter, CSV exports for requests & payments. Plus sales strip on the overview + sidebar shortcut, user management incl. role changes (any of 4 roles) with confirmation, course approve/reject/archive/restore flow, categories, review moderation, certificates registry, CSV reports (incl. sales & payments), messages inbox, broadcast notifications, settings, data-management.
- **Sales dashboard (CRM, new):** `sales@edupulse.demo` — incoming request queue with stages (جديد → تواصل → دفع جزئي/كامل → مكتمل/مرفوض), each request shows paid/remaining, tap to record a payment, add notes, approve "اعتماد الاشتراك وتفعيل الدورة" (creates enrollment automatically), or reject with a mandatory reason. Revenue sparkline + monthly bar chart + CSV export.
- **Payments & pricing:** every course has a price in EGP. Student clicks a course → clicks **«اطلب الاشتراك»**, fills the request form (name, phone, email, course) → request appears in the sales queue → sales contacts the student by phone → records cash payment → once fully paid, sales taps "اعتماد الاشتراك وتفعيل الدورة" → enrollment active → student sees the course in "دوراتي".
- **Fully Arabic (RTL):** Cairo typography, `ar-EG` formatting, logical CSS properties. Dark theme for dashboards, light for public.
- **Accessible:** focus-visible rings, aria labels, keyboard alternatives to drag-and-drop, Escape to close modal, RTL-aware layout.
- **Footer:** real social icons (LinkedIn, Facebook, TikTok, Instagram).

## Architecture in one line

`Pages → Services (all business logic + permission checks) → storageAdapter (safe JSON, schema-versioned, backup/restore/reset) → LocalStorage`

Replace the adapter with an HTTP client later and the app keeps working.

## Documentation

- **`EDUPULSE_AI_HANDOFF.md`** — architecture map, routes, data models (including the new `subscriptionRequests` model), storage keys (schema v3), business rules, change log with everything added in this session.

## Demo data note

Images load from Unsplash/pravatar (network required). Videos are YouTube embeds. Prices reflect the catalog, not a live payment integration.
