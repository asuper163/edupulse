// Central registry of every LocalStorage key used by EDUPULSE.
// Never scatter raw LocalStorage keys across the app — import from here.
export const SCHEMA_VERSION = 4;

export const STORAGE_KEYS = {
  users: 'edupulse_users',
  categories: 'edupulse_categories',
  courses: 'edupulse_courses',
  sections: 'edupulse_sections',
  lessons: 'edupulse_lessons',
  enrollments: 'edupulse_enrollments',
  lessonProgress: 'edupulse_lesson_progress',
  quizzes: 'edupulse_quizzes',
  questions: 'edupulse_questions',
  quizAttempts: 'edupulse_quiz_attempts',
  reviews: 'edupulse_reviews',
  certificates: 'edupulse_certificates',
  notifications: 'edupulse_notifications',
  wishlist: 'edupulse_wishlist',
  messages: 'edupulse_messages',
  settings: 'edupulse_settings',
  subscriptionRequests: 'edupulse_subscription_requests',
  session: 'edupulse_session',
  schemaVersion: 'edupulse_schema_version',
};

// Local, device-scoped UI/platform preferences (not part of the data backup).
export const EXTRA_KEYS = {
  siteName: 'edupulse_site_name',
  demoBanner: 'edupulse_demo_banner',
  maintenance: 'edupulse_maintenance',
};

// Keys that hold arrays in storage (used for backup validation)
export const ARRAY_KEYS = [
  'users', 'categories', 'courses', 'sections', 'lessons', 'enrollments',
  'lessonProgress', 'quizzes', 'questions', 'quizAttempts', 'reviews',
  'certificates', 'notifications', 'wishlist', 'messages', 'settings',
  'subscriptionRequests',
];

export const ALL_DATA_KEYS = Object.values(STORAGE_KEYS);
