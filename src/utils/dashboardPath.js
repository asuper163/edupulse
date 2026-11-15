// Route to role-home used by RequireRole, PublicLayout, Login/Register/Home
export default function dashboardPath(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'instructor': return '/instructor';
    case 'sales': return '/sales';
    default: return '/student';
  }
}
