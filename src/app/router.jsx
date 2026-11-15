import {Suspense, lazy} from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import RequireRole from "../components/navigation/RequireRole";
import {Spinner} from "../components/common/Feedback";

import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";
import AdminLayout from "../layouts/AdminLayout";
import SalesLayout from "../layouts/SalesLayout";

// Public pages
const Home = lazy(() => import("../pages/public/Home"));
const Courses = lazy(() => import("../pages/public/Courses"));
const CourseDetails = lazy(() => import("../pages/public/CourseDetails"));
const Categories = lazy(() => import("../pages/public/Categories"));
const Instructors = lazy(() => import("../pages/public/Instructors"));
const InstructorProfile = lazy(
  () => import("../pages/public/InstructorProfile"),
);
const About = lazy(() => import("../pages/public/About"));
const Contact = lazy(() => import("../pages/public/Contact"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const RequestSubscription = lazy(
  () => import("../pages/public/RequestSubscription"),
);

// Student pages
const StudentOverview = lazy(() => import("../pages/student/Overview"));
const StudentCourses = lazy(() => import("../pages/student/MyCourses"));
const LearningRoom = lazy(() => import("../pages/student/LearningRoom"));
const StudentQuizzes = lazy(() => import("../pages/student/MyQuizzes"));
const QuizAttempt = lazy(() => import("../pages/student/QuizAttempt"));
const Wishlist = lazy(() => import("../pages/student/Wishlist"));
const Certificates = lazy(() => import("../pages/student/Certificates"));
const StudentProfile = lazy(() => import("../pages/student/Profile"));
const StudentNotifications = lazy(
  () => import("../pages/shared/NotificationsList"),
);
const StudentSettings = lazy(() => import("../pages/student/Settings"));

// Instructor pages
const InstructorOverview = lazy(() => import("../pages/instructor/Overview"));
const InstructorCourses = lazy(() => import("../pages/instructor/MyCourses"));
const CourseForm = lazy(() => import("../pages/instructor/CourseForm"));
const CurriculumBuilder = lazy(
  () => import("../pages/instructor/CurriculumBuilder"),
);
const QuizBuilder = lazy(() => import("../pages/instructor/QuizBuilder"));
const InstructorStudents = lazy(() => import("../pages/instructor/Students"));
const InstructorAnalytics = lazy(() => import("../pages/instructor/Analytics"));
const InstructorReviews = lazy(() => import("../pages/instructor/Reviews"));
const InstructorDashboardProfile = lazy(
  () => import("../pages/instructor/Profile"),
);
const InstructorNotifications = lazy(
  () => import("../pages/shared/NotificationsList"),
);

// Admin pages
const AdminOverview = lazy(() => import("../pages/admin/Overview"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminUserDetails = lazy(() => import("../pages/admin/UserDetails"));
const AdminCourses = lazy(() => import("../pages/admin/Courses"));
const AdminCourseReview = lazy(() => import("../pages/admin/CourseReview"));
const AdminCategories = lazy(() => import("../pages/admin/Categories"));
const AdminEnrollments = lazy(() => import("../pages/admin/Enrollments"));
const AdminQuizzes = lazy(() => import("../pages/admin/Quizzes"));
const AdminReviews = lazy(() => import("../pages/admin/Reviews"));
const AdminCertificates = lazy(() => import("../pages/admin/Certificates"));
const AdminReports = lazy(() => import("../pages/admin/Reports"));
const AdminMessages = lazy(() => import("../pages/admin/Messages"));
const AdminNotifications = lazy(() => import("../pages/admin/Notifications"));
const AdminSettings = lazy(() => import("../pages/admin/Settings"));
const AdminDataManagement = lazy(() => import("../pages/admin/DataManagement"));

// Sales pages (subscription CRM)
const SalesOverview = lazy(() => import("../pages/sales/Overview"));
const SalesRequests = lazy(() => import("../pages/sales/Requests"));
const SalesReports = lazy(() => import("../pages/sales/Reports"));
const SalesNotifications = lazy(() => import("../pages/sales/Notifications"));
const SalesProfile = lazy(() => import("../pages/sales/Profile"));

const NotFound = lazy(() => import("../pages/errors/NotFound"));

const Fallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-dark-bg">
    <Spinner size={34} />
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route
            path="/instructors/:instructorId"
            element={<InstructorProfile />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/request-subscription"
            element={<RequestSubscription />}
          />
        </Route>

        {/* Student */}
        <Route
          element={
            <RequireRole roles={["student"]}>
              <StudentLayout />
            </RequireRole>
          }
        >
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/learn/:courseId" element={<LearningRoom />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/student/quizzes/:quizId" element={<QuizAttempt />} />
          <Route path="/student/wishlist" element={<Wishlist />} />
          <Route path="/student/certificates" element={<Certificates />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route
            path="/student/notifications"
            element={<StudentNotifications />}
          />
          <Route path="/student/settings" element={<StudentSettings />} />
        </Route>

        {/* Instructor */}
        <Route
          element={
            <RequireRole roles={["instructor"]}>
              <InstructorLayout />
            </RequireRole>
          }
        >
          <Route path="/instructor" element={<InstructorOverview />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/courses/create" element={<CourseForm />} />
          <Route
            path="/instructor/courses/:courseId/edit"
            element={<CourseForm />}
          />
          <Route
            path="/instructor/courses/:courseId/curriculum"
            element={<CurriculumBuilder />}
          />
          <Route
            path="/instructor/courses/:courseId/quizzes"
            element={<QuizBuilder />}
          />
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route
            path="/instructor/analytics"
            element={<InstructorAnalytics />}
          />
          <Route path="/instructor/reviews" element={<InstructorReviews />} />
          <Route
            path="/instructor/profile"
            element={<InstructorDashboardProfile />}
          />
          <Route
            path="/instructor/notifications"
            element={<InstructorNotifications />}
          />
        </Route>

        {/* Admin */}
        <Route
          element={
            <RequireRole roles={["admin"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route
            path="/admin/courses/:courseId"
            element={<AdminCourseReview />}
          />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />
          <Route path="/admin/quizzes" element={<AdminQuizzes />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route
            path="/admin/data-management"
            element={<AdminDataManagement />}
          />
        </Route>

        {/* Sales (subscription CRM) — admin can also open these pages */}
        <Route
          element={
            <RequireRole roles={["sales", "admin"]}>
              <SalesLayout />
            </RequireRole>
          }
        >
          <Route path="/sales" element={<SalesOverview />} />
          <Route path="/sales/requests" element={<SalesRequests />} />
          <Route path="/sales/reports" element={<SalesReports />} />
          <Route path="/sales/notifications" element={<SalesNotifications />} />
          <Route path="/sales/profile" element={<SalesProfile />} />
        </Route>

        {/* Utility */}
        <Route path="/404" element={<NotFound />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
