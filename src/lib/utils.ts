export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates number of months between start date (YYYY-MM) and end date (YYYY-MM).
 * Inclusive of both months.
 */
export function getMonthsCount(startYearMonth: string, endYearMonth: string): number {
  const [sYear, sMonth] = startYearMonth.split('-').map(Number);
  const [eYear, eMonth] = endYearMonth.split('-').map(Number);
  
  if (isNaN(sYear) || isNaN(sMonth) || isNaN(eYear) || isNaN(eMonth)) {
    return 1;
  }

  const months = (eYear - sYear) * 12 + (eMonth - sMonth) + 1;
  return Math.max(0, months);
}

export function getCurrentYearMonth(): { year: number; month: number; key: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1 - 12
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  return {
    year,
    month,
    key: `${year}-${monthStr}`,
  };
}

export function getNextYearMonth(fromYear?: number, fromMonth?: number): { year: number; month: number; key: string } {
  let year = fromYear ?? new Date().getFullYear();
  let month = (fromMonth ?? new Date().getMonth() + 1) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  return {
    year,
    month,
    key: `${year}-${monthStr}`,
  };
}

export function formatMonthYear(yearMonthKey: string): string {
  if (!yearMonthKey || !yearMonthKey.includes('-')) return yearMonthKey;
  const [y, m] = yearMonthKey.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return yearMonthKey;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function generateReceiptNumber(seq: number, year: number): string {
  const seqPadded = String(seq).padStart(4, '0');
  return `RCP-${year}-${seqPadded}`;
}

