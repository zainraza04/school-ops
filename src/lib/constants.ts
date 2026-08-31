export const ROLES = {
  SAAS_ADMIN: 'saas_admin',
  OWNER: 'owner',
  ADMIN: 'admin',
  TEACHER: 'teacher',
} as const;

export const STUDENT_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  graduated: 'Graduated',
  withdrawn: 'Withdrawn',
} as const;

export const FEE_STATUS_LABELS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  partial: 'Partial',
} as const;

export const PAYMENT_METHODS = ['cash', 'bank', 'other'] as const;

export const EXPENSE_CATEGORIES = [
  'Salary',
  'Rent',
  'Electricity',
  'Stationery',
  'Maintenance',
  'Other',
] as const;

export const SUBSCRIPTION_PLANS = {
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
} as const;

export const CLASSES = [
  { id: 'c6', name: 'Class 6' },
  { id: 'c7', name: 'Class 7' },
  { id: 'c8', name: 'Class 8' },
  { id: 'c9', name: 'Class 9' },
  { id: 'c10', name: 'Class 10' },
] as const;

export const SECTIONS = [
  { id: 's6a', classId: 'c6', name: 'A', teacher: 'Usman Malik', studentCount: 32 },
  { id: 's6b', classId: 'c6', name: 'B', teacher: 'Sana Khan', studentCount: 28 },
  { id: 's7a', classId: 'c7', name: 'A', teacher: 'Bilal Ahmed', studentCount: 30 },
  { id: 's7b', classId: 'c7', name: 'B', teacher: 'Ayesha Malik', studentCount: 29 },
  { id: 's8a', classId: 'c8', name: 'A', teacher: 'Hassan Raza', studentCount: 32 },
  { id: 's8b', classId: 'c8', name: 'B', teacher: 'Fatima Noor', studentCount: 27 },
  { id: 's9a', classId: 'c9', name: 'A', teacher: 'Imran Shah', studentCount: 25 },
  { id: 's9b', classId: 'c9', name: 'B', teacher: 'Nadia Hussain', studentCount: 26 },
  { id: 's10a', classId: 'c10', name: 'A', teacher: 'Zubair Ali', studentCount: 24 },
  { id: 's10b', classId: 'c10', name: 'B', teacher: 'Maryam Siddiqui', studentCount: 22 },
] as const;

export const ACADEMIC_SESSIONS = [
  { id: 'sess-2526', name: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', status: 'inactive' as const },
  { id: 'sess-2627', name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', status: 'active' as const },
] as const;

export const EXAM_TYPES = {
  monthly: 'Monthly Test',
  bi_monthly: 'Bi-Monthly Test',
  mid_term: 'Mid Term',
  mock: 'Mock Exam',
  class_test: 'Class Test',
  final: 'Final Exam',
} as const;

export const AUTH_COOKIE = 'schoolops_auth';
export const ROLE_COOKIE = 'schoolops_role';
