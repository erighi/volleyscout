/**
 * TournamentBook (domain): The list of tournaments of one view. The coach view and the score table each have
 * their own list (saved separately); both use this class. Like RuleBook it reads the live list through a function
 * and never touches the device: saving the list stays with the caller (through Store).
 */
class TournamentBook {
  /**
   * @param {function} list gives the live list of tournament data, e.g. () => S.tn
   * @param {object} options ruleField ('rule' or 'fmt'), rules (a RuleBook), idPrefix (first letter of new ids),
   *   teamIds (a function giving the ids of all teams, coach view only)
   */
  constructor(list, options) {
    const o = options || {};
    this._list = list; this._field = o.ruleField || 'rule'; this._rules = o.rules; this._prefix = o.idPrefix || 't'; this._teams = o.teamIds || (() => []);
  }

  /** the plain data of every tournament, in the order they were made */
  all() { return this._list(); }
  /** the plain data of a tournament by id, or undefined */
  find(id) { return this._list().find(t => t.id === id); }
  /** the tournament (as a Tournament) by id, or null */
  get(id) { const d = this.find(id); return d ? new Tournament(d, this._field) : null; }
  /** a Tournament over some plain data */
  wrap(data) { return new Tournament(data, this._field); }
  /** the plain data of every tournament sorted by name */
  sortedByName() { return [...this._list()].sort((a, b) => a.name.localeCompare(b.name)); }
  /** true when another tournament (not exceptId) already has this name, ignoring case */
  nameTaken(name, exceptId) { return this._list().some(t => t.id !== exceptId && t.name.toLowerCase() === name.toLowerCase()); }

  /** the valid rule set id of a tournament by id, or '' */
  ruleId(id) { const t = this.get(id); return t ? t.ruleId(this._rules) : ''; }

  /**
   * adds a tournament and returns its plain data; a tournament with the same name (ignoring case) is returned as it is.
   * The rule set id is kept only when it exists, the team ids only when the teams exist (and not twice).
   */
  create(name, ruleId, teams) {
    let t = this._list().find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!t) {
      t = { id: this._prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name };
      if (ruleId && this._rules.has(ruleId)) t[this._field] = ruleId;
      if (Array.isArray(teams)) {
        const known = this._teams(), ids = [...new Set(teams)].filter(id => known.includes(id));
        if (ids.length) t.teams = ids;
      }
      this._list().push(t);
    }
    return t;
  }

  /** renames a tournament */
  rename(id, name) { const t = this.find(id); if (t) t.name = name; }

  /** sets the default rule set (an empty id removes it); returns the valid rule set id it had before, or '' */
  setRule(id, ruleId) {
    const t = this.find(id);
    if (!t) return '';
    const old = this.ruleId(id);
    if (ruleId) t[this._field] = ruleId; else delete t[this._field];
    return old;
  }

  /** sets the teams taking part */
  setTeams(id, teamIds) { const t = this.find(id); if (t) t.teams = teamIds; }

  /** removes a tournament (the caller detaches its matches) */
  remove(id) {
    const list = this._list();
    for (let i = list.length - 1; i >= 0; i--) if (list[i].id === id) list.splice(i, 1);
  }
}
