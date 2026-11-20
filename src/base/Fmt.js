/**
 * Fmt (base): Formats numbers, times and scores for display (same text in both views).
 *
 * Still in legacy.js, proposed to move here (5 named pieces, 0.6 KB):
 *   ordn, fmtT, todayS, hm, hms
 */
class Fmt {
  /** hh:mm from a timestamp */
  static clock(ms) { Pending.method('Fmt.clock'); }
  /** mm:ss */
  static minutes(ms) { Pending.method('Fmt.minutes'); }
  /** "12 : 10" */
  static score(a, b) { Pending.method('Fmt.score'); }
  /** 1st, 2nd ... */
  static ordinal(n) { Pending.method('Fmt.ordinal'); }
  /** today as yyyy-mm-dd */
  static today() { Pending.method('Fmt.today'); }
}
