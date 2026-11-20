/**
 * Pending (base): Marks a method that is designed but not moved yet; calling it fails loudly so nothing half-migrated runs silently.
 */
class Pending {
  /** Call this from a method that is designed but not written: it stops with a clear message. */
  static method(name) { throw new Error('VolleyScout: ' + name + ' is not migrated yet (it still lives in src/legacy/legacy.js)'); }
}
