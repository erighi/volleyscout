/**
 * Store (infra): The only place that touches localStorage: load and save JSON by key, one key per kind of data.
 *
 * Still in legacy.js, proposed to move here (27 named pieces + 20 start-up statements, 2.5 KB):
 *   K, PK, TK, THK, saveP, saveT, save, SK, SKXK, GRK, RK, saveR, TBK, TBC, tbSave, MDK, ADVK, DMK,
 *   LYK, FXK, APPK, SCK, saveSM, STK, saveStt, ORGK, orgSave
 */
class Store {
  static load(key, fallback) { Pending.method('Store.load'); }
  static save(key, value) { Pending.method('Store.save'); }
  /** all keys used by the app (for backup) */
  static keys() { Pending.method('Store.keys'); }
}
