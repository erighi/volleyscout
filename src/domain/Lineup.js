/**
 * Lineup (domain): The six court positions and the roles: the team system (5-1, 6-2, 4-2), which roles fit which
 * position, auto fill, copying the previous set, the next empty position, and the five-player layout.
 * Positions are numbered 1 to 6; a list of positions is an array of 6 player ids (null when empty), index 0 is P1.
 * Player ids are opaque; the roster is a list of {pid, role, ...} (the coach view's lu.h). Roles are
 * 'Setter', 'Outside hitter', 'Middle blocker', 'Opposite' (others, like Libero, have no place in a system).
 * Going anticlockwise round the pie (P1 to P6) the roles of a system repeat from any starting position, so
 * the middle blockers sit opposite each other, and so on; X in a pattern means Setter or Opposite (6-2 and 4-2).
 *
 * Still in legacy.js (they need the match or the screen): sysCheck (the check card), setSys, setServe, pickPos,
 * setPos, copyPrev, setFive, declF5, openLineup, bpPick, bpFive, bpPlace, bpClear, lineupDone.
 */
class Lineup {
  /**
   * @param {string} system '5-1', '6-2' or '4-2'; anything else means no system (nothing is checked or filled)
   * @param {Array} roster the players: {pid, role, num, name}
   */
  constructor(system, roster) { this.system = system; this.roster = roster || []; }

  /** the role pattern of each system, as letters for P1 to P6 */
  static patterns() {
    return { '5-1': ['S', 'H', 'M', 'O', 'H', 'M'], '6-2': ['X', 'H', 'M', 'X', 'H', 'M'], '4-2': ['X', 'H', 'M', 'X', 'H', 'M'] };
  }
  /** role name to pattern letter */
  static roleCodes() { return { 'Setter': 'S', 'Outside hitter': 'H', 'Middle blocker': 'M', 'Opposite': 'O' }; }
  /** pattern letter to the name shown to the user */
  static roleNames() { return { S: 'Setter', H: 'Outside hitter', M: 'Middle blocker', O: 'Opposite', X: 'Setter or Opposite' }; }
  /** a role letter fits a pattern slot (X takes a setter or an opposite) */
  static slotOk(slot, code) { return slot === 'X' ? (code === 'S' || code === 'O') : slot === code; }

  /** the five-player layout of the coach view from the start of set si: team h plays without a sixth player from the first point */
  static fiveFromStart(f5, si) { const f = ((f5 || {})[si] || {}).h; return !!(f && f.at === 0 && !f.lost); }
  /** the coach view has a five-player layout started during set si (a player was lost, or the other team plays with five) */
  static fiveMidSet(f5, si) { const f = (f5 || {})[si] || {}; return !!((f.h && f.h.lost) || f.a); }
  /** score table: team t plays with five players in this set (set.f5 = {a, b}) */
  static fiveInSet(set, team) { return !!(set && set.f5 && set.f5[team]); }

  /** the system has a pattern */
  hasSystem() { return !!Lineup.patterns()[this.system]; }

  /**
   * the ways the players placed in positions fit the system: {pat, rots} where rots lists the rotations (0 to 5) of
   * the pattern that agree with every placed player whose role is known, or null when none does (or there is no system)
   */
  slots(positions) {
    const pat = Lineup.patterns()[this.system], RC = Lineup.roleCodes();
    if (!pat) return null;
    const rs = [0, 1, 2, 3, 4, 5].map(i => { const e = this.roster.find(x => x.pid === positions[i]); return e && RC[e.role] ? RC[e.role] : null; });
    const rots = [];
    for (let r = 0; r < 6; r++) if (rs.every((c, i) => !c || Lineup.slotOk(pat[(i + r) % 6], c))) rots.push(r);
    return rots.length ? { pat, rots } : null;
  }

  /** a player with this role could be placed in position index i (0 to 5) under one of the fitting rotations */
  static fits(slots, i, role) {
    const c = Lineup.roleCodes()[role];
    return !!c && slots.rots.some(r => Lineup.slotOk(slots.pat[(i + r) % 6], c));
  }

  /**
   * fills empty positions in place when only one player of the roster can go there and he can go nowhere else
   * (repeats until nothing more is certain); injured is the set of players who cannot play
   */
  autoFill(positions, injured) {
    if (!positions || !this.hasSystem()) return;
    for (let g = 0; g < 6; g++) {
      const sl = this.slots(positions);
      if (!sl) return;
      const placed = new Set(positions.filter(Boolean)), pool = this.roster.filter(x => !placed.has(x.pid) && !injured.has(x.pid)),
        one = [0, 1, 2, 3, 4, 5].filter(i => !positions[i]).map(i => ({ i, c: pool.filter(x => Lineup.fits(sl, i, x.role)) })).filter(o => o.c.length === 1), cnt = {};
      one.forEach(o => { cnt[o.c[0].pid] = (cnt[o.c[0].pid] || 0) + 1; });
      const pk = one.find(o => cnt[o.c[0].pid] === 1);
      if (!pk) return;
      positions[pk.i] = pk.c[0].pid;
    }
  }

  /**
   * checks six placed players (ids in position order) against the system:
   * {state: 'off'} no system; {state: 'incomplete'} a position is empty or unknown;
   * {state: 'ok'|'bad', bad: [{i, exp}], es: the six roster entries}: bad lists the positions that do not fit
   * under the best rotation (the one with the fewest misfits) and the pattern letter expected there
   */
  evaluate(pids) {
    const pat = Lineup.patterns()[this.system], RC = Lineup.roleCodes();
    if (!pat) return { state: 'off' };
    const es = pids.map(id => this.roster.find(x => x.pid === id) || null);
    if (es.some(e => !e)) return { state: 'incomplete' };
    const rs = es.map(e => RC[e.role] || '?');
    let best = null;
    for (let r = 0; r < 6; r++) {
      const bad = [];
      rs.forEach((c, i) => { if (!Lineup.slotOk(pat[(i + r) % 6], c)) bad.push({ i, exp: pat[(i + r) % 6] }); });
      if (!best || bad.length < best.bad.length) best = { r, bad };
    }
    return { state: best.bad.length ? 'bad' : 'ok', bad: best.bad, es };
  }

  /** all six positions (or the first five when the team plays with five) are filled */
  static complete(positions, five) { return positions.slice(0, five ? 5 : 6).every(Boolean); }

  /** the positions for a new set copied from the previous set's: injured players are dropped, and position 6 stays empty in a five-player layout */
  static copyPrevious(previous, injured, five) {
    const a = (previous || []).map(id => injured.has(id) ? null : id);
    if (five) a[5] = null;
    return a;
  }

  /** coach view: the first empty position (1 to 6), skipping position 6 in a five-player layout, or undefined */
  static nextEmpty(positions, five) { return [1, 2, 3, 4, 5, 6].find(q => !positions[q - 1] && !(q === 6 && five)); }

  /** score table: the next empty position going round from position p (1 to 6), skipping position 6 in a five-player layout, or undefined */
  static nextEmptyAfter(positions, p, five) { return [1, 2, 3, 4, 5, 6].map(k => (p - 1 + k) % 6 + 1).find(q => !positions[q - 1] && !(q === 6 && five)); }
}
