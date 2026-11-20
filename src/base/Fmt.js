/**
 * Fmt (base): Formats numbers, times and dates for display (same text in both views).
 * Times use the device's local clock.
 */
class Fmt {
  /** 0 gives 1st, 1 gives 2nd, 2 gives 3rd, then 4th, 5th ... (the argument is a zero based index) */
  static ordinal(index) { return ['1st', '2nd', '3rd'][index] || (index + 1) + 'th'; }

  /** countdown text m:ss from milliseconds (rounded up to whole seconds, never negative) */
  static minutes(ms) {
    const t = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }

  /** today as yyyy-mm-dd (local date) */
  static today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** hh:mm from a timestamp */
  static clock(ms) {
    const d = new Date(ms);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /** hh:mm:ss from a timestamp */
  static clockSeconds(ms) {
    const d = new Date(ms), p = n => String(n).padStart(2, '0');
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
}
