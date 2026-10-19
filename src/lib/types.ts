export type UserRole = 'admin' | 'member';

export interface Member {
  id: string;
  memberCode: string; // e.g. "NI-001"
  name: string;
  phone: string;
  address?: string;
  monthlyFee: number; // Monthly committed contribution amount in INR
  joiningDate: string; // "YYYY-MM" or "YYYY-MM-DD"
  username: string;
  passwordHash: string;
  plainPasswordHint?: string; // Stored to assist elderly members who forget passwords
  role: UserRole;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMode = 'Cash' | 'GPay / UPI' | 'Bank Transfer' | 'Cheque' | 'Other';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. "RCP-2026-001"
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: string; // "YYYY-MM-DD"
  forMonth: number; // 1 - 12
  forYear: number; // e.g. 2026
  paymentMode: PaymentMode;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  isAdvance?: boolean;
  advanceBatchId?: string;
  advanceTotalAmount?: number;
  advanceTotalMonths?: number;
  advanceMonthIndex?: number;
  advancePeriodLabel?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  isPinned: boolean;
  author: string;
  date: string;
  createdAt: string;
}

export interface FeeScheduleItem {
  amount: number;
  effectiveFrom: string; // "YYYY-MM" format e.g. "2026-01" or "2026-11"
  createdAt: string;
  createdBy?: string;
  notes?: string;
}

export interface FeeSettings {
  currentMonthlyFee: number;
  effectiveMonth: string; // "YYYY-MM"
  upcomingFee?: {
    amount: number;
    effectiveFrom: string; // "YYYY-MM"
  };
  feeSchedule: FeeScheduleItem[];
}

export interface MemberSummary extends Member {
  totalPaid: number;
  expectedTotal: number;
  pendingBalance: number;
  currentMonthPaid: boolean;
  currentMonthPaidAmount: number;
  lastPaymentDate?: string;
  unpaidMonthsCount: number;
  currentMonthFee: number;
  nextMonthFee?: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalCollectedThisMonth: number;
  totalExpectedThisMonth: number;
  membersPaidThisMonth: number;
  membersPendingThisMonth: number;
  totalOverallPending: number;
  totalOverallCollected: number;
  fixedMonthlyFee: number;
  upcomingFee?: {
    amount: number;
    effectiveFrom: string;
  };
  recentPayments: Payment[];
  recentAnnouncements: Announcement[];
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  memberCode?: string;
}

