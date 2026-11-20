/**
 * RuleSet (domain): One rule set as a value object over its plain data (the same plain object that is saved in
 * the rule list and copied into every match as match.rule). Every rule is a method, so a view never has to know
 * which field holds it or what the default is. A missing rule set (null) behaves like an empty one.
 *
 * Fields of the data: id, name, sets [{win, hard, min}], min (match minutes), to (timeouts), sub (substitutions),
 * pl (players on a roster), lib (liberos on a roster), roster (limit the roster), five (five-player rule),
 * swap8 (change courts at 8), mvp (MVP nominations), pts (note on how tournament points are earned).
 */
class RuleSet {
  /** @param {object|null} data the plain rule data; it is not copied, so data() gives the same object back */
  constructor(data) { this._d = data || {}; }

  /** the plain data this rule set wraps */
  data() { return this._d; }
  id() { return this._d.id; }
  name() { return this._d.name; }

  /** a new rule set with the defaults of the "New rule set" form */
  static blank() {
    return new RuleSet({ id: null, name: '', min: null, to: 2, sub: 8, pl: 12, lib: 2, roster: false, five: false, swap8: true, mvp: true, pts: '', sets: [{ win: 21, hard: 23 }, { win: 21, hard: 23 }, { win: 15, hard: 15 }] });
  }

  /** the sets as plain objects ({win, hard}) */
  sets() { return this._d.sets || []; }
  setCount() { return this.sets().length; }

  /** coach view: the rule of set number index (0 based); sets after the last one use the last set's rule (the plain object) */
  setRule(index) { const s = this.sets(); return s[Math.min(index, s.length - 1)]; }

  /** score table: {win, hard} of set number index as numbers; win is 25 and hard is 0 (none) when not set, and a set beyond the list is not clamped */
  setLimits(index) { const r = this.sets()[index] || {}; return { win: +r.win || 25, hard: +r.hard || 0 }; }

  /** timeouts per team per set (2 when not set) */
  timeoutsPerSet() { return new TimeoutRules(this._d).limit(); }

  /** substitutions per team per set (8 when not set; 0 hides the counter) */
  substitutionsPerSet() { return this._d.sub == null ? 8 : this._d.sub; }

  /** match time in minutes, or null (the match's own value, else the first set that has one) */
  timeLimit() { return this._d.min || (this.sets().find(x => x.min) || {}).min || null; }

  /** players allowed on a team roster in the score table (12 when not set) */
  rosterPlayers() { return this._d.pl == null ? 12 : this._d.pl; }

  /** liberos allowed on a team roster in the score table (2 when not set) */
  rosterLiberos() { return this._d.lib == null ? 2 : this._d.lib; }

  /** the coach roster is limited to the players plus liberos */
  rosterLimited() { return !!this._d.roster; }

  /** a team may play with five players */
  fivePlayerAllowed() { return !!this._d.five; }

  /** teams change courts at 8 points in the deciding set (on unless the rule says false) */
  swapAtEight() { return this._d.swap8 !== false; }

  /** each team nominates an MVP of the other team (a rule without the field asks, except the built-in FIVB and Local tournament) */
  mvpRequired() { const r = this._d; return r.mvp != null ? !!r.mvp : !(r.id === 'fivb' || r.id === 'local'); }

  /** one line summary: "25 win by 2 | 15 hard 17 | match time 60 min" */
  text() {
    const t = this.timeLimit();
    return this.sets().map(s => s.win + (s.hard ? ' hard ' + s.hard : ' win by 2')).join(' | ') + (t ? ' | match time ' + t + ' min' : '');
  }

  /** a copy of the data for the rule form: the defaults written in, the per-set match minutes dropped */
  editable() {
    const d = JSON.parse(JSON.stringify(this._d)), r = new RuleSet(d);
    d.min = r.timeLimit(); d.to = r.timeoutsPerSet(); d.sub = r.substitutionsPerSet(); d.pl = r.rosterPlayers(); d.lib = r.rosterLiberos();
    d.sets.forEach(x => { delete x.min; });
    return new RuleSet(d);
  }

  /** changes the number of sets (1 to 5) in place: new sets copy the last one */
  resizeSets(n) {
    const s = this._d.sets;
    n = Math.max(1, Math.min(5, n));
    while (s.length < n) s.push(Object.assign({}, s[s.length - 1]));
    s.length = n;
    return this;
  }

  /** the first thing wrong with this rule set as a message, or null; otherName(name) says whether another rule set already has the name */
  problem(nameTaken) {
    const d = this._d;
    if (!d.name) return 'Give the rule set a name.';
    if (nameTaken && nameTaken(d.name, d.id)) return 'A rule set with that name already exists.';
    for (let i = 0; i < d.sets.length; i++) {
      const x = d.sets[i];
      if (x.win < 1) return 'Set ' + (i + 1) + ': enter the points needed to win.';
      if (x.hard && x.hard < x.win) return 'Set ' + (i + 1) + ': the hard limit cannot be lower than the points to win.';
    }
    return null;
  }
}
