/**
 * ScoutStats (domain): What scouting records and the statistics made from it, for the coach view:
 * the kinds of points, the grade scales (serve and the four other skills, with their default names and
 * descriptions), counting grades in a match, the match filter of the statistics, serving by player, and
 * appearances by player. Pure functions of plain values: no screen, no device.
 *
 * Match data used: match.sl (graded serves {pid, g}), match.ag (graded actions {k, g}), match.log (rallies {s, t, x}),
 * match.lu.h (the match roster), match.st / match.sb (starting positions and substitutions), match.n (last set).
 * Grades are the keys '--', '-', '0', '+', '++' (GRADES), worst to best.
 *
 * Still in legacy.js: the grade settings screen and its saving (saveScale, resetScale, saveSkx; the current scales SC
 * and SKX are state), the scouting actions (serve, advGrade, undo: they change the match log) and the tables and
 * filter form (serveTable, actRow, lostTable, statsFilter, and the html of serveStats and attendStats).
 */
class ScoutStats {
  /** the grade keys, worst to best */
  static grades() { return ['--', '-', '0', '+', '++']; }

  /** kinds of points scouted: [key, label] */
  static pointTypes() { return [['kill', 'Attack'], ['ace', 'Ace'], ['block', 'Block'], ['err', 'Opp. error']]; }
  /** the kinds of points that can be won by the coach's team without an ace (aces are only served) */
  static pointTypesHome() { return ScoutStats.pointTypes().filter(x => x[0] !== 'ace'); }
  /** the kinds of points the other team wins: the error is the coach team's own */
  static pointTypesAway() { return ScoutStats.pointTypes().map(([k, l]) => k === 'err' ? [k, 'My team error'] : [k, l]); }

  /** names of the skills that are graded */
  static skillNames() { return { serve: 'Serve', pass: 'Pass', set: 'Set', attack: 'Attack', block: 'Block' }; }

  /** default serve grades [{k, n, d}]: key, name, description */
  static defaultServeGrades() {
    return [
      { k: '--', n: 'Error', d: 'Ball out or on the net. Point to the opponents' },
      { k: '-', n: 'Easy', d: 'Easy ball to pass. The opponent setter gets the perfect ball in their hands' },
      { k: '0', n: 'Medium', d: 'Ball received, but the opponent setter must move and some setting options are not available' },
      { k: '+', n: 'Tough', d: 'The service puts the opponent team in trouble and we get a free ball' },
      { k: '++', n: 'Ace', d: 'Ace. Point for us' }
    ];
  }

  /** default grades of pass, set, attack and block: {skill: [5 x {n, d}]} */
  static defaultSkillGrades() {
    return {
      pass: [{ n: 'Ace against', d: 'Service ace for the opponents. Point to them' }, { n: 'Poor', d: 'Ball not playable. The setter cannot set and we send a free ball over' }, { n: 'Medium', d: 'Setter must move and some attack options are not available' }, { n: 'Good', d: 'Setter reaches the ball with most attack options open' }, { n: 'Perfect', d: 'Perfect pass to the setter. All attack options open' }],
      set: [{ n: 'Error', d: 'Double touch, lift or net error. Point to the opponents' }, { n: 'Poor', d: 'Hitter has no real attack and must play an easy ball' }, { n: 'Medium', d: 'Hitter attacks against a ready block with limited options' }, { n: 'Good', d: 'Good set. Hitter attacks with a clear option' }, { n: 'Perfect', d: 'Perfect set. Hitter has full options against a poor block' }],
      attack: [{ n: 'Error', d: 'Ball out, on the net or blocked for a point. Point to the opponents' }, { n: 'Poor', d: 'Easy ball for the opponents to counter-attack' }, { n: 'Medium', d: 'Defended. The opponents attack with limited options' }, { n: 'Good', d: 'Hard to defend. The opponents are out of system' }, { n: 'Kill', d: 'Point for us' }],
      block: [{ n: 'Error', d: 'Net touch, out or block fault. Point to the opponents' }, { n: 'Poor', d: 'Block does not touch the ball or does not help. The opponent scores' }, { n: 'Touch', d: 'Touch that does not stop the attack. The ball is defended or lost' }, { n: 'Soft', d: 'Block slows the ball and we get an easy counter' }, { n: 'Stuff', d: 'Block point for us' }]
    };
  }

  /** saved serve grades made safe: a list of 5 keeps the saved names and descriptions (the defaults fill what is empty); the keys stay */
  static normalizeServeGrades(saved) {
    const d = ScoutStats.defaultServeGrades();
    return saved.map((x, i) => ({ k: d[i].k, n: x.n || d[i].n, d: x.d || d[i].d }));
  }

  /** puts saved skill grades into the current ones (skills: {skill: [5 x {n, d}]}) in place; only lists of 5 are taken, empty names and descriptions become the defaults */
  static applySkillGrades(skills, saved) {
    const d = ScoutStats.defaultSkillGrades();
    Object.keys(d).forEach(k => { if (saved && Array.isArray(saved[k]) && saved[k].length === 5) skills[k] = saved[k].map((x, i) => ({ n: x.n || d[k][i].n, d: x.d || d[k][i].d })); });
  }

  /** the grades of a skill as a list [{k, n, d}] (serve: its own scale; the others get the grade keys) */
  static scale(skill, serve, skills, keys) { return skill === 'serve' ? serve : skills[skill].map((x, i) => ({ k: keys[i], n: x.n, d: x.d })); }

  /**
   * how many times a grade was given for a skill in a match: the worst grade counts the point lost by that action,
   * the best grade of block and attack the point won by it, the others the graded actions that went on
   */
  static count(m, skill, grade) {
    return grade === '--' ? m.log.filter(e => e.x === skill && e.t === 'a').length
      : (grade === '++' && (skill === 'block' || skill === 'attack')) ? m.log.filter(e => e.x === skill && e.t === 'h').length
      : (m.ag || []).filter(e => e.k === skill && e.g === grade).length;
  }

  /**
   * a match passes the statistics filter F ({opp, team, tn, rule, from, to}; empty fields are ignored):
   * opponent name, tournament id ('__none' for matches without a tournament that still exists), home team id,
   * rule set id (match.fmt), date range. tournaments is the list of tournaments.
   */
  static filterMatch(m, F, tournaments) {
    return (!F.opp || m.away === F.opp) && (!F.tn || (F.tn === '__none' ? (!m.tid || !tournaments.some(t => t.id === m.tid)) : m.tid === F.tn))
      && (!F.team || m.hid === F.team) && (!F.rule || m.fmt === F.rule) && (!F.from || m.date >= F.from) && (!F.to || m.date <= F.to);
  }

  /** graded serves per player in one match: {pid: {grade: count}} */
  static serveCounts(sl) {
    const by = {};
    sl.forEach(e => { const r = by[e.pid] = by[e.pid] || {}; r[e.g] = (r[e.g] || 0) + 1; });
    return by;
  }

  /**
   * serving by player over the matches that have graded serves and pass the filter.
   * A player is known by his id; one who is no longer in the roster is known by his name in the match.
   * @param {Array} matches all matches
   * @param {Array} players the players of the roster (for names)
   * @param {object} filter see filterMatch
   * @param {Array} tournaments see filterMatch
   * @param {Array} keys the grade keys that count (the serve scale's keys)
   * @returns {{matches: number, rows: Array, all: object}} rows: [{name, c: {grade: count}, total}] by total, then name;
   *   all: the same for the whole team; matches: how many matches were used
   */
  static serveByPlayer(matches, players, filter, tournaments, keys) {
    const ms = matches.filter(m => (m.sl || []).length && ScoutStats.filterMatch(m, filter, tournaments)), by = {};
    ms.forEach(m => m.sl.forEach(e => {
      const p = players.find(x => x.id === e.pid), le = m.lu.h.find(x => x.pid === e.pid), name = p ? p.name : le ? le.name : 'Player', key = p ? e.pid : 'n:' + name.toLowerCase();
      const r = by[key] = by[key] || { name, c: {} };
      r.c[e.g] = (r.c[e.g] || 0) + 1;
    }));
    const tot = r => keys.reduce((a, k) => a + (r.c[k] || 0), 0), rows = Object.values(by).sort((a, b) => tot(b) - tot(a) || a.name.localeCompare(b.name)), all = { name: 'Whole team', c: {} };
    rows.forEach(r => keys.forEach(k => { all.c[k] = (all.c[k] || 0) + (r.c[k] || 0); }));
    rows.forEach(r => { r.total = tot(r); });
    all.total = tot(all);
    return { matches: ms.length, rows, all };
  }

  /**
   * appearances by player over the matches in which a point was scored and that pass the filter:
   * m: matches attended (in the match roster), st: sets in the starting six, sp: sets on court (starter or substitute).
   * @returns {{matches: number, sets: number, rows: Array}} rows: [{name, m, st, sp}] by sets played, matches, name
   */
  static attendance(matches, players, filter, tournaments) {
    const ms = matches.filter(m => m.log.length && ScoutStats.filterMatch(m, filter, tournaments)), by = {};
    let nsets = 0;
    ms.forEach(m => {
      const mk = new Set(), ids = new Set(m.lu.h.map(x => x.pid));
      const row = pid => { const p = players.find(x => x.id === pid), le = m.lu.h.find(x => x.pid === pid), name = p ? p.name : le ? le.name : 'Player', key = p ? pid : 'n:' + name.toLowerCase(); return [key, by[key] = by[key] || { name, m: 0, st: 0, sp: 0 }]; };
      m.lu.h.forEach(x => { const [k, r] = row(x.pid); if (!mk.has(k)) { mk.add(k); r.m++; } });
      for (let i = 0; i <= m.n; i++) {
        if (!m.log.some(e => e.s === i)) continue;
        nsets++;
        const stt = new Set(), pl = new Set();
        (m.st[i] || []).filter(id => id && ids.has(id)).forEach(id => { const [k] = row(id); stt.add(k); pl.add(k); });
        (m.sb || []).filter(e => e.s === i && ids.has(e.in)).forEach(e => { const [k] = row(e.in); pl.add(k); });
        stt.forEach(k => by[k].st++);
        pl.forEach(k => by[k].sp++);
      }
    });
    const rows = Object.values(by).sort((a, b) => b.sp - a.sp || b.m - a.m || a.name.localeCompare(b.name));
    return { matches: ms.length, sets: nsets, rows };
  }
}
