/**
 * Due Date — standalone test (Jest 불필요, Node.js로 바로 실행)
 *
 * 실행 방법:
 *   npx tsx lib/utils/due-date.test.ts
 *   (tsx 없으면: npx ts-node lib/utils/due-date.test.ts)
 *
 * 또는 Jest 사용 시 먼저 설치:
 *   npm i -D jest @types/jest ts-jest
 */

import {
  calculateDueDate,
  addWorkingDays,
  getWorkingDaysForProduct,
  getUSFederalHolidays,
  getDueDateStatus,
} from "./due-date";

// ─── Minimal test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e: unknown) {
    console.log(`  ❌ ${name}`);
    console.log(`     → ${e instanceof Error ? e.message : e}`);
    failed++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toContain(sub: string) {
      if (typeof actual !== "string" || !actual.includes(sub))
        throw new Error(`Expected "${actual}" to contain "${sub}"`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
  };
}

function section(title: string) {
  console.log(`\n▸ ${title}`);
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

section("getWorkingDaysForProduct");

test("Zirconia → 7 days", () => {
  expect(getWorkingDaysForProduct("Zirconia", null)).toBe(7);
  expect(getWorkingDaysForProduct("ZIRCONIA Crown", null)).toBe(7);
  expect(getWorkingDaysForProduct(null, "zirconia-3unit")).toBe(7);
});

test("Print Crown → 5 days", () => {
  expect(getWorkingDaysForProduct("Print Crown", null)).toBe(5);
  expect(getWorkingDaysForProduct("print crown", null)).toBe(5);
  expect(getWorkingDaysForProduct("PrintCrown", null)).toBe(5);
  expect(getWorkingDaysForProduct(null, "print-crown-single")).toBe(5);
});

test("Guards → 7 days", () => {
  expect(getWorkingDaysForProduct("Guards", null)).toBe(7);
  expect(getWorkingDaysForProduct("Night Guard", null)).toBe(7);
  expect(getWorkingDaysForProduct("Sports Guard", null)).toBe(7);
  expect(getWorkingDaysForProduct("Retainer", null)).toBe(7);
});

test("Unknown product → 7 days (default)", () => {
  expect(getWorkingDaysForProduct("Unknown", null)).toBe(7);
  expect(getWorkingDaysForProduct(null, null)).toBe(7);
});

// ─────────────────────────────────────────────────────────────────────────────────

section("getUSFederalHolidays — 2025");

test("11개 공휴일 포함", () => {
  const h = getUSFederalHolidays(2025);
  const check = (d: string) => { if (!h.has(d)) throw new Error(`Missing holiday: ${d}`); };
  check("2025-01-01"); // New Year's
  check("2025-01-20"); // MLK Day
  check("2025-02-17"); // Presidents' Day
  check("2025-05-26"); // Memorial Day
  check("2025-06-19"); // Juneteenth
  check("2025-07-04"); // Independence Day
  check("2025-09-01"); // Labor Day
  check("2025-10-13"); // Columbus Day
  check("2025-11-11"); // Veterans Day
  check("2025-11-27"); // Thanksgiving
  check("2025-12-25"); // Christmas
  expect(h.size).toBe(11);
});

test("2026 July 4 (Saturday) → observed Friday July 3", () => {
  const h = getUSFederalHolidays(2026);
  expect(h.has("2026-07-03")).toBe(true);
  expect(h.has("2026-07-04")).toBe(false);
});

// ─────────────────────────────────────────────────────────────────────────────────

section("addWorkingDays");

test("Mon + 5 working days = next Monday (no holidays)", () => {
  // Apr 7 2025 (Mon) + 5 = Apr 14 2025 (Mon)
  const result = addWorkingDays(new Date("2025-04-07"), 5);
  expect(result.toISOString().split("T")[0]).toBe("2025-04-14");
});

test("Friday + 1 = Monday (skips weekend)", () => {
  const result = addWorkingDays(new Date("2025-04-04"), 1);
  expect(result.toISOString().split("T")[0]).toBe("2025-04-07");
});

test("Fri before Labor Day + 1 = Tue (skips Mon holiday)", () => {
  // Aug 29 (Fri) + 1 → Sep 2 (Tue), skipping Sep 1 Labor Day
  const result = addWorkingDays(new Date("2025-08-29"), 1);
  expect(result.toISOString().split("T")[0]).toBe("2025-09-02");
});

test("7 days across Thanksgiving week", () => {
  // Nov 24 Mon + 7, skip Thu Nov 27 (Thanksgiving)
  const result = addWorkingDays(new Date("2025-11-24"), 7);
  expect(result.toISOString().split("T")[0]).toBe("2025-12-03");
});

// ─────────────────────────────────────────────────────────────────────────────────

section("calculateDueDate");

test("Print Crown: 5 working days from Monday", () => {
  const result = calculateDueDate(new Date("2025-04-07"), "Print Crown", null);
  expect(result.toISOString().split("T")[0]).toBe("2025-04-14");
});

test("Zirconia: 7 working days from Monday", () => {
  const result = calculateDueDate(new Date("2025-04-07"), "Zirconia", null);
  expect(result.toISOString().split("T")[0]).toBe("2025-04-16");
});

test("Guards: 7 working days from Monday", () => {
  const result = calculateDueDate(new Date("2025-04-07"), "Guards", null);
  expect(result.toISOString().split("T")[0]).toBe("2025-04-16");
});

test("accepts string date", () => {
  const result = calculateDueDate("2025-04-07", "Print Crown");
  expect(result.toISOString().split("T")[0]).toBe("2025-04-14");
});

test("falls back to product_id when product_name is null", () => {
  const result = calculateDueDate("2025-04-07", null, "print-crown-3unit");
  expect(result.toISOString().split("T")[0]).toBe("2025-04-14");
});

// ─────────────────────────────────────────────────────────────────────────────────

section("getDueDateStatus");

test("overdue → label contains 'overdue', red color", () => {
  const past = new Date();
  past.setDate(past.getDate() - 3);
  const s = getDueDateStatus(past);
  expect(s.label).toContain("overdue");
  expect(s.colorClass).toContain("red");
});

test("due today → 'Due today', orange color", () => {
  const today = new Date();
  const s = getDueDateStatus(today);
  expect(s.label).toBe("Due today");
  expect(s.colorClass).toContain("orange");
});

test("null → 'No due date', gray", () => {
  const s = getDueDateStatus(null);
  expect(s.label).toBe("No due date");
  expect(s.colorClass).toContain("gray");
});

// ─── Summary ─────────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);