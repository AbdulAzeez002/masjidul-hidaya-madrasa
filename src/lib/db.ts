import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';
import {
  Member,
  Payment,
  Announcement,
  MemberSummary,
  DashboardStats,
  FeeScheduleItem,
  FeeSettings,
} from './types';
import { getCurrentYearMonth, getMonthsCount, getNextYearMonth } from './utils';

const DB_NAME = 'nasruthul_islam';

interface DatabaseSchema {
  madrasaName: string;
  branchName: string;
  members: Member[];
  payments: Payment[];
  announcements: Announcement[];
  paymentSeq: number;
  feeSchedule?: FeeScheduleItem[];
  lastUpdated: string;
}

// Generate realistic seed data
function getInitialSeedData(): DatabaseSchema {
  const adminHash = bcrypt.hashSync('masjidulhidaya@admin9747', 10);

  const initialMembers: Member[] = [
    {
      id: 'mem_admin',
      memberCode: 'ADM-001',
      name: 'Administrator',
      phone: '9745781373',
      address: 'Pullancheri Kizhakkethala Masjid and Madrasa, 35V3+9H8, Pullancheri - Nellikkuth - Pandikkad Rd, Pullancheri, Keralam 676122',
      monthlyFee: 0,
      joiningDate: '2026-01',
      username: 'admin',
      passwordHash: adminHash,
      plainPasswordHint: 'masjidulhidaya@admin9747',
      role: 'admin',
      status: 'active',
      notes: 'Main system administrator',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const initialPayments: Payment[] = [];

  const initialAnnouncements: Announcement[] = [
    {
      id: 'ann_1',
      title: 'നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ പോർട്ടലിലേക്ക് സ്വാഗതം',
      content:
        'കിഴക്കേത്തല ശാഖ മദ്റസ പ്രതിമാസ വരിസംഖ്യ ട്രാക്കർ പോർട്ടൽ പ്രവർത്തനസജ്ജമായി.',
      priority: 'important',
      isPinned: true,
      author: 'Administrator',
      date: '2026-01-01',
      createdAt: '2026-01-01T08:00:00.000Z',
    },
  ];

  const initialFeeSchedule: FeeScheduleItem[] = [
    {
      amount: 50,
      effectiveFrom: '2026-01',
      createdAt: '2026-01-01T00:00:00.000Z',
      notes: 'Standard fixed monthly subscription',
    },
  ];

  return {
    madrasaName: 'Nasruthul Islam',
    branchName: 'Kiyakethala Branch',
    members: initialMembers,
    payments: initialPayments,
    announcements: initialAnnouncements,
    paymentSeq: 1,
    feeSchedule: initialFeeSchedule,
    lastUpdated: new Date().toISOString(),
  };
}

// In-memory read/write fallback
let dbCache: DatabaseSchema | null = null;

function ensureLocalDataFile(): DatabaseSchema {
  if (!dbCache) {
    dbCache = getInitialSeedData();
  }
  return dbCache;
}

function saveLocalDatabase(data: DatabaseSchema) {
  data.lastUpdated = new Date().toISOString();
  dbCache = data;
}

// MongoDB helper: get DB
async function getMongoDb() {
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// ===================== FEE SETTINGS OPERATIONS =====================

export async function getFeeSchedule(): Promise<FeeScheduleItem[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    const metaDoc = await mongo.collection('meta').findOne({ key: 'settings' });
    if (metaDoc?.feeSchedule && Array.isArray(metaDoc.feeSchedule)) {
      return metaDoc.feeSchedule;
    }
    return [{ amount: 50, effectiveFrom: '2026-01', createdAt: '2026-01-01T00:00:00.000Z' }];
  }

  const db = ensureLocalDataFile();
  return db.feeSchedule || [{ amount: 50, effectiveFrom: '2026-01', createdAt: '2026-01-01T00:00:00.000Z' }];
}

export function getCurrentFixedFee(forMonthKey?: string): number {
  const targetKey = forMonthKey || getCurrentYearMonth().key;
  const db = ensureLocalDataFile();
  const schedule = (db.feeSchedule || []).slice().sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  let currentFee = 50;
  for (const item of schedule) {
    if (item.effectiveFrom <= targetKey) {
      currentFee = item.amount;
    }
  }
  return currentFee;
}

export async function getFeeSettings(): Promise<FeeSettings> {
  const currentKey = getCurrentYearMonth().key;
  const schedule = (await getFeeSchedule()).slice().sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  let currentMonthlyFee = 50;
  let effectiveMonth = '2026-01';
  let upcomingFee: { amount: number; effectiveFrom: string } | undefined = undefined;

  for (const item of schedule) {
    if (item.effectiveFrom <= currentKey) {
      currentMonthlyFee = item.amount;
      effectiveMonth = item.effectiveFrom;
    } else if (!upcomingFee || item.effectiveFrom < upcomingFee.effectiveFrom) {
      upcomingFee = { amount: item.amount, effectiveFrom: item.effectiveFrom };
    }
  }

  return {
    currentMonthlyFee,
    effectiveMonth,
    upcomingFee,
    feeSchedule: schedule,
  };
}

export async function updateFixedMonthlyFee(
  amount: number,
  effectiveFrom?: string,
  updatedBy?: string
): Promise<FeeSettings> {
  const currentKey = getCurrentYearMonth().key;
  const targetEffective = effectiveFrom || currentKey;

  const newItem: FeeScheduleItem = {
    amount,
    effectiveFrom: targetEffective,
    createdAt: new Date().toISOString(),
    createdBy: updatedBy,
  };

  const mongo = await getMongoDb();
  if (mongo) {
    const metaDoc = await mongo.collection('meta').findOne({ key: 'settings' });
    let schedule: FeeScheduleItem[] = metaDoc?.feeSchedule || [];
    schedule = schedule.filter((s) => s.effectiveFrom !== targetEffective);
    schedule.push(newItem);
    schedule.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

    await mongo.collection('meta').updateOne(
      { key: 'settings' },
      { $set: { feeSchedule: schedule } },
      { upsert: true }
    );

    // If effective immediately, update members' monthlyFee
    if (targetEffective <= currentKey) {
      await mongo.collection('members').updateMany({ role: 'member' }, { $set: { monthlyFee: amount } });
    }
  } else {
    const db = ensureLocalDataFile();
    if (!db.feeSchedule) db.feeSchedule = [];
    db.feeSchedule = db.feeSchedule.filter((s) => s.effectiveFrom !== targetEffective);
    db.feeSchedule.push(newItem);
    db.feeSchedule.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

    if (targetEffective <= currentKey) {
      db.members.forEach((m) => {
        if (m.role === 'member') m.monthlyFee = amount;
      });
    }
    saveLocalDatabase(db);
  }

  return getFeeSettings();
}

// ===================== MEMBER OPERATIONS =====================

export async function getAllMembers(): Promise<Member[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    const docs = await mongo.collection('members').find({}).toArray();
    return docs.map(({ _id, ...rest }) => rest as unknown as Member);
  }
  const db = ensureLocalDataFile();
  return [...db.members];
}

export async function getMemberById(id: string): Promise<Member | null> {
  const mongo = await getMongoDb();
  if (mongo) {
    const doc = await mongo.collection('members').findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as unknown as Member;
  }
  const db = ensureLocalDataFile();
  return db.members.find((m) => m.id === id) || null;
}

export async function getMemberByUsername(username: string): Promise<Member | null> {
  const clean = username.trim().toLowerCase();
  const mongo = await getMongoDb();
  if (mongo) {
    const doc = await mongo.collection('members').findOne({
      username: { $regex: new RegExp(`^${clean}$`, 'i') },
    });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as unknown as Member;
  }
  const db = ensureLocalDataFile();
  return db.members.find((m) => m.username.toLowerCase() === clean) || null;
}

export async function createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
  const existing = await getMemberByUsername(memberData.username);
  if (existing) {
    throw new Error(`Username "${memberData.username}" is already taken.`);
  }

  const now = new Date().toISOString();
  const newMember: Member = {
    ...memberData,
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    username: memberData.username.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('members').insertOne({ ...newMember } as any);
    return newMember;
  }

  const db = ensureLocalDataFile();
  db.members.push(newMember);
  saveLocalDatabase(db);
  return newMember;
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  const existing = await getMemberById(id);
  if (!existing) {
    throw new Error('Member not found');
  }

  if (updates.username && updates.username.toLowerCase() !== existing.username.toLowerCase()) {
    const userConflict = await getMemberByUsername(updates.username);
    if (userConflict && userConflict.id !== id) {
      throw new Error(`Username "${updates.username}" is already taken.`);
    }
  }

  const updated: Member = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('members').updateOne({ id }, { $set: updated });
    if (updates.name && updates.name !== existing.name) {
      await mongo.collection('payments').updateMany({ memberId: id }, { $set: { memberName: updates.name } });
    }
    return updated;
  }

  const db = ensureLocalDataFile();
  const index = db.members.findIndex((m) => m.id === id);
  db.members[index] = updated;
  if (updates.name && updates.name !== existing.name) {
    db.payments.forEach((p) => {
      if (p.memberId === id) p.memberName = updates.name!;
    });
  }
  saveLocalDatabase(db);
  return updated;
}

export async function deleteMember(id: string): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const res = await mongo.collection('members').deleteOne({ id });
    await mongo.collection('payments').deleteMany({ memberId: id });
    return res.deletedCount > 0;
  }

  const db = ensureLocalDataFile();
  const index = db.members.findIndex((m) => m.id === id);
  if (index === -1) return false;
  db.members.splice(index, 1);
  db.payments = db.payments.filter((p) => p.memberId !== id);
  saveLocalDatabase(db);
  return true;
}

// ===================== PAYMENT OPERATIONS =====================

export async function getAllPayments(): Promise<Payment[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    const docs = await mongo.collection('payments').find({}).sort({ paymentDate: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as unknown as Payment);
  }

  const db = ensureLocalDataFile();
  return [...db.payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
}

export async function getPaymentsByMember(memberId: string): Promise<Payment[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    const docs = await mongo.collection('payments').find({ memberId }).sort({ paymentDate: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as unknown as Payment);
  }

  const db = ensureLocalDataFile();
  return db.payments
    .filter((p) => p.memberId === memberId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export async function createPayment(
  paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>
): Promise<Payment> {
  const year = new Date(paymentData.paymentDate).getFullYear() || 2026;

  const mongo = await getMongoDb();
  if (mongo) {
    const metaDoc = await mongo.collection('meta').findOneAndUpdate(
      { key: 'settings' },
      { $inc: { paymentSeq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    const seq = metaDoc?.paymentSeq || Math.floor(1000 + Math.random() * 9000);
    const seqPadded = String(seq).padStart(4, '0');
    const receiptNumber = `RCP-${year}-${seqPadded}`;

    const newPayment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    await mongo.collection('payments').insertOne({ ...newPayment } as any);
    return newPayment;
  }

  const db = ensureLocalDataFile();
  db.paymentSeq += 1;
  const seqPadded = String(db.paymentSeq).padStart(4, '0');
  const receiptNumber = `RCP-${year}-${seqPadded}`;

  const newPayment: Payment = {
    ...paymentData,
    id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    receiptNumber,
    createdAt: new Date().toISOString(),
  };

  db.payments.push(newPayment);
  saveLocalDatabase(db);
  return newPayment;
}

export async function deletePayment(id: string): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const res = await mongo.collection('payments').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const db = ensureLocalDataFile();
  const index = db.payments.findIndex((p) => p.id === id);
  if (index === -1) return false;
  db.payments.splice(index, 1);
  saveLocalDatabase(db);
  return true;
}

// ===================== ANNOUNCEMENT OPERATIONS =====================

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    const docs = await mongo.collection('announcements').find({}).sort({ isPinned: -1, date: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as unknown as Announcement);
  }

  const db = ensureLocalDataFile();
  return [...db.announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function createAnnouncement(
  data: Omit<Announcement, 'id' | 'createdAt'>
): Promise<Announcement> {
  const newAnn: Announcement = {
    ...data,
    id: `ann_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };

  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('announcements').insertOne({ ...newAnn } as any);
    return newAnn;
  }

  const db = ensureLocalDataFile();
  db.announcements.push(newAnn);
  saveLocalDatabase(db);
  return newAnn;
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Announcement>
): Promise<Announcement> {
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('announcements').updateOne({ id }, { $set: updates });
    const updated = await mongo.collection('announcements').findOne({ id });
    const { _id, ...rest } = updated!;
    return rest as unknown as Announcement;
  }

  const db = ensureLocalDataFile();
  const index = db.announcements.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Announcement not found');
  db.announcements[index] = { ...db.announcements[index], ...updates };
  saveLocalDatabase(db);
  return db.announcements[index];
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const res = await mongo.collection('announcements').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const db = ensureLocalDataFile();
  const index = db.announcements.findIndex((a) => a.id === id);
  if (index === -1) return false;
  db.announcements.splice(index, 1);
  saveLocalDatabase(db);
  return true;
}

// ===================== CALCULATIONS & SUMMARIES =====================

export async function getMemberSummaries(
  preloaded?: { members?: Member[]; payments?: Payment[]; feeSettings?: FeeSettings }
): Promise<MemberSummary[]> {
  const [members, payments, feeSettings] = await Promise.all([
    preloaded?.members ? Promise.resolve(preloaded.members) : getAllMembers(),
    preloaded?.payments ? Promise.resolve(preloaded.payments) : getAllPayments(),
    preloaded?.feeSettings ? Promise.resolve(preloaded.feeSettings) : getFeeSettings(),
  ]);
  const { year: currentYear, month: currentMonth, key: currentKey } = getCurrentYearMonth();
  const nextMonthPeriod = getNextYearMonth();

  const currentFee = feeSettings.currentMonthlyFee;
  const nextFee = feeSettings.upcomingFee && feeSettings.upcomingFee.effectiveFrom === nextMonthPeriod.key
    ? feeSettings.upcomingFee.amount
    : currentFee;

  return members
    .filter((m) => m.role === 'member')
    .map((member) => {
      const memberPayments = payments.filter((p) => p.memberId === member.id);
      const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

      const memberMonthlyFee = member.monthlyFee || currentFee;
      const joinKey = member.joiningDate.length === 7 ? member.joiningDate : member.joiningDate.slice(0, 7);

      // Accurately compute expected dues month-by-month according to the fee schedule in effect for each month
      let expectedTotal = 0;
      if (joinKey <= currentKey) {
        const [sYear, sMonth] = joinKey.split('-').map(Number);
        const [eYear, eMonth] = currentKey.split('-').map(Number);
        if (!isNaN(sYear) && !isNaN(sMonth) && !isNaN(eYear) && !isNaN(eMonth)) {
          const sortedSchedule = feeSettings.feeSchedule.slice().sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
          let y = sYear;
          let m = sMonth;
          while (y < eYear || (y === eYear && m <= eMonth)) {
            const mKey = `${y}-${m < 10 ? '0' + m : m}`;
            let feeForMonth = memberMonthlyFee;
            for (const item of sortedSchedule) {
              if (item.effectiveFrom <= mKey) {
                feeForMonth = item.amount;
              }
            }
            expectedTotal += feeForMonth;
            m++;
            if (m > 12) {
              m = 1;
              y++;
            }
          }
        } else {
          const activeMonths = getMonthsCount(joinKey, currentKey);
          expectedTotal = activeMonths * memberMonthlyFee;
        }
      }

      const pendingBalance = Math.max(0, expectedTotal - totalPaid);

      const currentMonthPayments = memberPayments.filter(
        (p) => p.forYear === currentYear && p.forMonth === currentMonth
      );
      const currentMonthPaidAmount = currentMonthPayments.reduce((s, p) => s + p.amount, 0);

      const currentMonthPaid =
        currentMonthPaidAmount >= memberMonthlyFee || totalPaid >= expectedTotal;

      const lastPayment = memberPayments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];

      const unpaidMonthsCount =
        memberMonthlyFee > 0 ? Math.ceil(pendingBalance / memberMonthlyFee) : 0;

      return {
        ...member,
        monthlyFee: memberMonthlyFee,
        totalPaid,
        expectedTotal,
        pendingBalance,
        currentMonthPaid,
        currentMonthPaidAmount,
        lastPaymentDate: lastPayment?.paymentDate,
        unpaidMonthsCount,
        currentMonthFee: currentFee,
        nextMonthFee: nextFee,
      };
    });
}

export async function getMemberSummaryById(memberId: string): Promise<MemberSummary | null> {
  const summaries = await getMemberSummaries();
  return summaries.find((s) => s.id === memberId) || null;
}

export async function getAdminDashboardData(): Promise<{ stats: DashboardStats; members: MemberSummary[] }> {
  const [members, payments, announcements, feeSettings] = await Promise.all([
    getAllMembers(),
    getAllPayments(),
    getAllAnnouncements(),
    getFeeSettings(),
  ]);

  const summaries = await getMemberSummaries({ members, payments, feeSettings });
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

  const activeMembers = summaries.filter((m) => m.status === 'active');
  const totalMembers = activeMembers.length;
  const totalExpectedThisMonth = activeMembers.reduce((sum, m) => sum + m.monthlyFee, 0);

  const currentMonthPayments = payments.filter(
    (p) => p.forYear === currentYear && p.forMonth === currentMonth
  );
  const totalCollectedThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const membersPaidThisMonth = activeMembers.filter((m) => m.currentMonthPaid).length;
  const membersPendingThisMonth = totalMembers - membersPaidThisMonth;

  const totalOverallPending = activeMembers.reduce((sum, m) => sum + m.pendingBalance, 0);
  const totalOverallCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const recentPayments = payments.slice(0, 8);
  const recentAnnouncements = announcements.slice(0, 5);

  const stats: DashboardStats = {
    totalMembers,
    activeMembers: totalMembers,
    totalCollectedThisMonth,
    totalExpectedThisMonth,
    membersPaidThisMonth,
    membersPendingThisMonth,
    totalOverallPending,
    totalOverallCollected,
    fixedMonthlyFee: feeSettings.currentMonthlyFee,
    upcomingFee: feeSettings.upcomingFee,
    recentPayments,
    recentAnnouncements,
  };

  return { stats, members: summaries };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await getAdminDashboardData();
  return data.stats;
}
