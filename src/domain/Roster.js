/**
 * Roster (domain): The players a team brings to a match, with the rules that go with them. Two kinds of roster:
 *  - coach view: the match roster of a team, a list of {pid, name, num, role}; a rule set can limit it to
 *    12 players plus 2 liberos (Roster.counts, Roster.limitProblem);
 *  - score table: the team's list match[team].pl of {n: shirt number, name, lib, cap}, written on the scoresheet;
 *    a team is ready with at least 6 players (not liberos) and a captain, and is done when it has also signed.
 *    An instance wraps a score table match: match.a.pl, match.b.pl, match.sig {team: {d: drawing}}, match.rule.
 * Nothing here touches the screen or the device.
 *
 * Still in legacy.js: the roster screens and their actions (nrSel, nrStatus, luSet, luDel, luToggle, luGuest, luRow,
 * luHtml, openRoster, syncRx, commitTeam, rxTeam, rxNext, saveRoster): they read the forms, ask, alert and save.
 */
class Roster {
  /** @param {object} match the score table match (plain data, not copied) */
  constructor(match) { this.m = match; }

  /* ---- coach view ---- */

  /** number of liberos and of other players in a roster list ({role} each) */
  static counts(list) { const lib = list.filter(x => x.role === 'Libero').length; return { lib, pl: list.length - lib }; }

  /** the message when a limited roster is too big (more than 12 players or 2 liberos), else '' (limited: the rule set limits the roster) */
  static limitProblem(list, limited) {
    if (!limited) return '';
    const c = Roster.counts(list);
    return c.pl > 12 ? 'The roster limit is 12 players plus liberos.' : c.lib > 2 ? 'The roster limit is 2 liberos.' : '';
  }

  /** sort order of players: by shirt number (no number last), then by name */
  static compare(a, b) { return (parseInt(a.num, 10) || 999) - (parseInt(b.num, 10) || 999) || a.name.localeCompare(b.name); }

  /** takes a player off every position of every set (st: set number to the six positions) */
  static unplace(st, pid) { Object.values(st || {}).forEach(a => a.forEach((x, i) => { if (x === pid) a[i] = null; })); }

  /* ---- score table ---- */

  /** a team list is ready: at least 6 players who are not liberos, and a captain who is not a libero */
  static isReady(team) { return team.pl.filter(p => !p.lib).length >= 6 && team.pl.some(p => p.cap && !p.lib); }

  ready(team) { return Roster.isReady(this.m[team]); }
  /** the team has signed the roster */
  signed(team) { const m = this.m; return !!(m.sig && m.sig[team] && m.sig[team].d); }
  /** the team's roster is ready and signed */
  done(team) { return this.ready(team) && this.signed(team); }
  /** both teams are ready and signed */
  bothDone() { return this.done('a') && this.done('b'); }
  /** both rosters are ready (not necessarily signed) */
  bothReady() { return this.ready('a') && this.ready('b'); }

  /**
   * the rows of the roster editor for a team: the players and the liberos as {n, name}, padded with empty rows up to
   * the limits of the rule set (12 players and 2 liberos when it says nothing), and the index of the captain among
   * the players (-1 for none)
   */
  editorRows(team) {
    const m = this.m, rules = new RuleSet(m.rule), np = rules.rosterPlayers(), nl = rules.rosterLiberos(),
      P = m[team].pl.filter(p => !p.lib), Lb = m[team].pl.filter(p => p.lib),
      pl = P.map(p => ({ n: p.n, name: p.name || '' })), lb = Lb.map(p => ({ n: p.n, name: p.name || '' })), cap = P.findIndex(p => p.cap);
    while (pl.length < np) pl.push({ n: '', name: '' });
    while (lb.length < nl) lb.push({ n: '', name: '' });
    return { pl, lb, cap };
  }

  /**
   * checks the editor rows of a team and builds its list.
   * rows: {pl: [{n, name}], lb: [{n, name}], cap: index of the captain among pl}; teamName is used in the messages.
   * Rows with neither number nor name are skipped; every other row needs a number of 1 to 3 digits, used once in the team.
   * @returns {{error: string}|{list: Array}} the list is sorted by number: {n: number as text without zeros, name, lib, cap}
   */
  static build(rows, teamName) {
    const seen = new Set(), list = [];
    let error = null;
    const add = (p, lib, cap) => {
      const n = p.n.trim(), name = p.name.trim();
      if (!n && !name) return true;
      if (!n) { error = teamName + ': every player needs a shirt number.'; return false; }
      if (!/^\d{1,3}$/.test(n)) { error = teamName + ': shirt numbers must be digits only (' + n + ').'; return false; }
      const k = String(+n);
      if (seen.has(k)) { error = teamName + ': shirt number ' + k + ' is used twice.'; return false; }
      seen.add(k); list.push({ n: k, name, lib, cap });
      return true;
    };
    for (const [i, p] of rows.pl.entries()) if (!add(p, 0, i === rows.cap ? 1 : 0)) return { error };
    for (const p of rows.lb) if (!add(p, 1, 0)) return { error };
    list.sort((q, r) => +q.n - +r.n);
    return { list };
  }

  /**
   * puts a new list into a team. When the list differs from the old one a signature of that team is removed.
   * @returns {boolean} true when a signature was removed
   */
  replace(team, list) {
    const m = this.m, changed = JSON.stringify(m[team].pl) !== JSON.stringify(list), hadSig = this.signed(team);
    m[team].pl = list;
    if (changed && hadSig) { delete m.sig[team]; return true; }
    return false;
  }
}
