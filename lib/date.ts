/**
 * Parses a date string from HTML form inputs without timezone shifts.
 *
 * - "YYYY-MM-DD" (from <input type="date">) is interpreted at noon UTC to avoid
 *   date-backward shifts in timezones behind UTC.
 * - "MM/DD/YYYY" slash format is also handled.
 * - Returns null for empty/invalid input.
 */
export function parseInputDate(
  value: string | null | undefined
): Date | null {
  if (!value || typeof value !== "string") return null;
  const s = value.trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T12:00:00.000Z`);
  }

  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch;
    const month = parseInt(a!, 10);
    const day = parseInt(b!, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return new Date(`${iso}T12:00:00.000Z`);
    }
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Parses an optional date field — returns undefined when the field is absent
 * from the request body (meaning "don't change this field").
 */
export function parseOptionalInputDate(
  value: string | null | undefined,
  present: boolean
): Date | null | undefined {
  if (!present) return undefined;
  return parseInputDate(value);
}
