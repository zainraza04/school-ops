export type SubscriptionPlan = 'basic' | 'professional' | 'premium';
export type SchoolStatus = 'active' | 'trial' | 'inactive';

export interface School {
  id: string;
  name: string;
  logo: string | null;
  address: string;
  phone: string;
  email: string;
  website: string;
  plan: SubscriptionPlan;
  status: SchoolStatus;
  planStartDate: string;
  planRenewalDate: string;
  totalStudents: number;
  totalStaff: number;
  ownerEmail?: string;
  ownerName?: string;
  registeredDate?: string;
}
