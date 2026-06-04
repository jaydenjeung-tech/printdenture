/**
 * Due Date Calculator — PrintCrown
 *
 * Business rules:
 *   Zirconia  → 7 working days
 *   Print Crown → 5 working days
 *   Guards    → 7 working days
 *
 * Working days = Mon–Fri, excluding US Federal Holidays
 */

// ─── Product type → working days ──────────────────────────────────────────────

const PRODUCT_WORKING_DAYS: Record<string, number> = {
  // exact product_name matches (case-insensitive)
  zirconia: 7,
  "print crown": 5,
  printcrown: 5,
  guards: 7,
  "night guard": 7,
  "sports guard": 7,
  retainer: 7,
};

const PRODUCT_ID_PATTERNS: Array<{ pattern: RegExp; days: number }> = [
  { pattern: /zirconia/i, days: 7 },
  { pattern: /print.?crown/i, days: 5 },
  { pattern: /guard/i, days: 7 },
  { pattern: /retainer/i, days: 7 },
];

const DEFAULT_WORKING_DAYS = 7;

export function getWorkingDaysForProduct(
  productName?: string | null,
  productId?: string | null
): number {
  // 1) Try product_name exact match (case-insensitive)
  if (productName) {
    const key = productName.trim().toLowerCase();
    if (key in PRODUCT_WORKING_DAYS) return PRODUCT_WORKING_DAYS[key];

    // 2) Try product_name partial match
    for (const { pattern, days } of PRODUCT_ID_PATTERNS) {
      if (pattern.test(productName)) return days;
    }
  }

  // 3) Try product_id pattern match
  if (productId) {
    for (const { pattern, days } of PRODUCT_ID_PATTERNS) {
      if (pattern.test(productId)) return days;
    }
  }

  return DEFAULT_WORKING_DAYS;
}

// ─── US Federal Holidays ───────────────────────────────────────────────────────

/** Returns the Nth weekday of a given month/year. e.g. 1st Monday of September */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const offset = ((weekday - firstWeekday) + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

/** Returns the last weekday of a given month/year. e.g. last Monday of May */
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0); // last day of month
  const lastDay = last.getDay();
  const offset = ((lastDay - weekday) + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

/** Returns observed holiday date (Sat→Fri, Sun→Mon) */
function observed(date: Date): Date {
  const day = date.getDay();
  if (day === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  if (day === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return date;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns Set of holiday date strings (YYYY-MM-DD) for a given year */
export function getUSFederalHolidays(year: number): Set<string> {
  const holidays: Date[] = [
    observed(new Date(year, 0, 1)),   // New Year's Day
    nthWeekday(year, 0, 1, 3),        // MLK Day — 3rd Monday of January
    nthWeekday(year, 1, 1, 3),        // Presidents' Day — 3rd Monday of February
    lastWeekday(year, 4, 1),          // Memorial Day — last Monday of May
    observed(new Date(year, 5, 19)),  // Juneteenth
    observed(new Date(year, 6, 4)),   // Independence Day
    nthWeekday(year, 8, 1, 1),        // Labor Day — 1st Monday of September
    nthWeekday(year, 9, 1, 2),        // Columbus Day — 2nd Monday of October
    observed(new Date(year, 10, 11)), // Veterans Day
    nthWeekday(year, 10, 4, 4),       // Thanksgiving — 4th Thursday of November
    observed(new Date(year, 11, 25)), // Christmas Day
  ];

  return new Set(holidays.map(toDateString));
}

// Cache holidays by year to avoid re-computing
const holidayCache = new Map<number, Set<string>>();

function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getUSFederalHolidays(year));
  }
  return holidayCache.get(year)!.has(toDateString(date));
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

// ─── Core calculator ────────────────────────────────────────────────────────────

/**
 * Add N working days to a start date.
 * The start date itself is NOT counted — counting begins the next working day.
 */
export function addWorkingDays(startDate: Date, workingDays: number): Date {
  const result = new Date(startDate);
  let remaining = workingDays;

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining--;
  }

  return result;
}

/**
 * Main entry point — calculates due date for an order.
 *
 * @param orderDate   When the order was placed (created_at or paid_at)
 * @param productName product_name column value
 * @param productId   product_id column value (fallback)
 * @returns           Due date as a Date object
 */
export function calculateDueDate(
  orderDate: Date | string,
  productName?: string | null,
  productId?: string | null
): Date {
  const start = typeof orderDate === "string" ? new Date(orderDate) : orderDate;
  const days = getWorkingDaysForProduct(productName, productId);
  return addWorkingDays(start, days);
}

// ─── Display helpers ────────────────────────────────────────────────────────────

export function formatDueDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDueDateFull(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** How many calendar days until due (negative = overdue) */
export function getDaysRemaining(dueDate: Date | string | null | undefined): number | null {
  if (!dueDate) return null;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDueToday(dueDate: Date | string | null | undefined): boolean {
  return getDaysRemaining(dueDate) === 0;
}

export function isOverdue(dueDate: Date | string | null | undefined): boolean {
  const days = getDaysRemaining(dueDate);
  return days !== null && days < 0;
}

export function isDueSoon(
  dueDate: Date | string | null | undefined,
  withinDays = 2
): boolean {
  const days = getDaysRemaining(dueDate);
  return days !== null && days >= 0 && days <= withinDays;
}

/** Returns a human-readable urgency label + color class */
export function getDueDateStatus(dueDate: Date | string | null | undefined): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  const days = getDaysRemaining(dueDate);

  if (days === null) return { label: "No due date", colorClass: "text-gray-400", bgClass: "bg-gray-100" };
  if (days < 0)      return { label: `${Math.abs(days)}d overdue`, colorClass: "text-red-600", bgClass: "bg-red-50" };
  if (days === 0)    return { label: "Due today", colorClass: "text-orange-600", bgClass: "bg-orange-50" };
  if (days === 1)    return { label: "Due tomorrow", colorClass: "text-orange-500", bgClass: "bg-orange-50" };
  if (days <= 2)     return { label: `Due in ${days}d`, colorClass: "text-yellow-600", bgClass: "bg-yellow-50" };
  return               { label: `Due in ${days}d`, colorClass: "text-green-600", bgClass: "bg-green-50" };
}