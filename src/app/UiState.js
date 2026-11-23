/**
 * UiState (app): Transient screen state: the open screen and tab, selections, open dialogs and forms, the pick in
 * progress. Nothing here is saved and nothing here is data: the lists of matches, players, teams, rules and
 * tournaments live in Library. The state is plain fields, so a screen can read and write them directly; the methods
 * are for code that works with names.
 *
 * The fields in use are listed in UiState.fields(); what each one means is documented where it is used.
 */
class UiState {
  constructor() {
    this.pv = 'cur'; this.rd = null; this.cur = null; this.tab = 'teams'; this.form = false; this.edit = null; this.team = null; this.tform = false;
    this.stab = 'matches'; this.sx = null; this.ts = null; this.mv = null;
  }

  /** the names of the screen state fields in use, sorted (what each one means is documented where it is used) */
  static fields() {
    return ['aopen', 'bp', 'copen', 'cur', 'edit', 'f5pick', 'f5r', 'form', 'fx', 'gopen', 'lgmsg', 'lm', 'lv', 'mfq', 'mt', 'mteam', 'mv', 'nf', 'nt', 'ntn', 'pd', 'pick', 'pm', 'pv', 'rd', 'rmq', 'rpq', 'rx', 'sb', 'sbq', 'sdis', 'setv', 'sf', 'sfq', 'sg', 'sopen', 'stab', 'sx', 'tab', 'td', 'team', 'tform', 'tnform', 'tnopen', 'toc', 'ts'];
  }

  /** the value of a field (undefined when it was never set) */
  get(name) { return this[name]; }
  /** sets a field */
  set(name, value) { this[name] = value; }
  /** true when the field has been set */
  has(name) { return Object.prototype.hasOwnProperty.call(this, name); }
  /** removes a field (it is undefined again) */
  clear(name) { delete this[name]; }
  /** removes several fields at once, for example when a dialog closes */
  reset(names) { names.forEach(n => delete this[n]); }
}
