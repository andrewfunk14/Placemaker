// home/time.ts
export const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function combineDateTime(day: Date, hm: { h: number; m: number }) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hm.h, hm.m);
}

export function isFutureLocal(day: Date | null, hm: { h: number; m: number } | null, graceMs = 30_000) {
  if (!day || !hm) return false;
  const candidate = combineDateTime(day, hm);
  return candidate.getTime() > Date.now() + graceMs;
}

export function formatEventDate(iso: string, locale = "en-US") {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export function formatEventTime(iso: string, locale = "en-US") {
  const d = new Date(iso);
  return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

export function startsInLabel(iso: string) {
    const start = new Date(iso);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
  
    // Happening now → within 2 hours window
    if (diffMs <= 0 && Math.abs(diffMs) < TWO_HOURS_MS) {
      return { label: "In Progress", status: "now" as const };
    }
  
    // In the future
    if (diffMs > 0) {
      const mins = Math.max(0, Math.round(diffMs / 60000));
      if (mins < 60) return { label: `Starts in ${mins} min`, status: "future" as const };
      const hours = Math.round(mins / 60);
      if (hours < 24) return { label: `Starts in ${hours} hour${hours === 1 ? "" : "s"}`, status: "future" as const };
      const days = Math.round(hours / 24);
      return { label: `Starts in ${days} day${days === 1 ? "" : "s"}`, status: "future" as const };
    }
  
    // Event ended
    return { label: "Ended", status: "past" as const };
  }