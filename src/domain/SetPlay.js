/**
 * SetPlay (domain): The rules and calculations of one set, for both views, as functions of plain match data.
 * Coach view: who wins a set (points or time), who serves first in the next set, whether a set is ready, started,
 * busy or can be reset, and what resetting a set removes. Score table: who has won the set, the result of a forfeit,
 * the undo of the last action, removing points, and the order in which events are recorded.
 * Coach teams are 'h' (the coach's) and 'a'; score table teams are 'a' and 'b'.
 * The point log, the substitutions and the other events are plain lists kept in the match; nothing here touches the
 * screen or the device. The state of a set (positions, server) is replayed by Rotation.
 *
 * Still in legacy.js (they change the screen or ask the user, so they go with the views): point, rallyDone, endSet,
 * startSet, clearSet, resetSet, reopenSet, the buttons, startSetS and the end, forfeit, reopen, remove, timeout,
 * substitution and five-player dialogs and actions of the score table (scPt, scTo, scSub, scLeave, scUndo, scRemove ...).
 */
class SetPlay {
  /* ---- coach view ---- */

  /**
   * who has won a set of the coach view, or null: ['h'|'a', 'points'|'time'].
   * rule: {win, hard}: points to win (two clear points) and the hard limit (0 or undefined for none).
   * x, y: points of 'h' and 'a'. timeLeft: a function giving the time left in ms, or null when the rule has no time limit
   * (when time has run out the team ahead wins).
   */
  static coachWinner(rule, x, y, timeLeft) {
    const W = rule.win, H = rule.hard;
    if (H) { if (x >= H && x > y) return ['h', 'points']; if (y >= H && y > x) return ['a', 'points']; }
    if (x >= W && x - y >= 2) return ['h', 'points'];
    if (y >= W && y - x >= 2) return ['a', 'points'];
    if (timeLeft && timeLeft() <= 0 && x !== y) return [x > y ? 'h' : 'a', 'time'];
    return null;
  }

  /**
   * who serves first in set si when it is not decided yet, or undefined: the team that did not serve first in the
   * set before, for the sets between the first and the deciding one (the deciding set has its own toss).
   * servers: {setIndex: 'h'|'a'}; setCount: a function giving the number of sets of the rule
   */
  static firstServerOf(servers, si, setCount) {
    if (si > 0 && si < setCount() - 1 && !servers[si] && servers[si - 1]) return servers[si - 1] === 'h' ? 'a' : 'h';
    return undefined;
  }

  /** something has been scouted in set si: a point, a substitution (not an automatic libero swap), a serve grade, an action grade, a timeout or a five-player event */
  static isBusy(m, si) {
    return m.log.some(e => e.s === si) || (m.sb || []).some(e => e.s === si && !e.au) || (m.sl || []).some(e => e.s === si) || (m.ag || []).some(e => e.s === si)
      || (m.to || []).some(e => e.s === si) || Lineup.fiveMidSet(m.f5, si);
  }

  /** the set has started (it is behind the current set, or something has been scouted in it) */
  static isStarted(m, si) { return si < m.n || SetPlay.isBusy(m, si); }

  /** the set can be reset: the current set, or the one before it when nothing has been scouted in the current one */
  static canReset(m, si) { return si === m.n || (si === m.n - 1 && !SetPlay.isBusy(m, m.n)); }

  /** the starting line-up of set si is complete (6 players of the roster, or 5 in a five-player layout) and the first serve is chosen */
  static isReady(m, si) {
    return (m.st[si] || []).filter(id => id && m.lu.h.some(x => x.pid === id)).length === (Lineup.fiveFromStart(m.f5, si) ? 5 : 6) && !!(m.sv || {})[si];
  }

  /** the set shown on the screen: the one picked (viewed) unless it is beyond the current set */
  static viewedSet(m, viewed) { return viewed == null || viewed > m.n ? m.n : viewed; }

  /**
   * removes everything scouted in set si and makes it the current set again (the starting line-up and the first
   * serve are kept): points, substitutions, serve and action grades, timeouts, five-player events, the start mark and
   * the roles of that set (they go back to what they were), the match clock when the rule has a time limit, and the
   * match is no longer done. Changes the match in place.
   */
  static discard(m, si, hasTimeLimit) {
    m.log = m.log.filter(e => e.s !== si); m.sb = (m.sb || []).filter(e => e.s !== si); m.sl = (m.sl || []).filter(e => e.s !== si);
    m.ag = (m.ag || []).filter(e => e.s !== si); m.to = (m.to || []).filter(e => e.s !== si);
    if (m.f5 && m.f5[si]) { const f = m.f5[si]; if (f.h && f.h.lost) delete f.h; delete f.a; }
    if (m.ss) delete m.ss[si];
    if (hasTimeLimit) delete m.tm;
    if (m.rs && m.rs[si]) { const sn = m.rs[si]; m.lu.h.forEach(x => { x.role = sn[x.pid] || ''; }); delete m.rs[si]; }
    m.n = si; m.done = false;
  }

  /* ---- score table ---- */

  /** the set that is being played in a score table match; a match without sets gets its first one (line-ups empty, not started) */
  static current(m) {
    if (!m.sets) m.sets = [{ lu: { a: [null, null, null, null, null, null], b: [null, null, null, null, null, null] }, on: false }];
    if (m.cur == null) m.cur = 0;
    return m.sets[m.cur];
  }

  /** points can be recorded: the set has started and has not ended, and the match is not finished */
  static isOpen(m, set) { return !(!set.on || set.end || m.fin); }

  /** the team that has won the running set, or null: win points and two clear (or the hard limit); pts: {a, b} */
  static winner(pts, win, hard) {
    for (const t of ['a', 'b']) { const q = pts[t], o = pts[t === 'a' ? 'b' : 'a']; if (q >= win && (q - o >= 2 || (hard > 0 && q >= hard))) return t; }
    return null;
  }

  /**
   * the score of a set that ends by forfeit of team f: the other team wins with the points it needs (the points to
   * win, two clear of the forfeiting team, at most the hard limit), or keeps the points it has when that is more.
   * @returns {{a: number, b: number, w: string, f: string}} the final score, the winner and the team that forfeited
   */
  static forfeit(win, hard, pts, f) {
    const w = f === 'a' ? 'b' : 'a';
    let need = Math.max(win, pts[f] + 2);
    if (hard && need > hard) need = hard;
    const wp = Math.max(pts[w], need);
    return { a: f === 'a' ? pts.a : wp, b: f === 'b' ? pts.b : wp, w, f };
  }

  /** how many events of a kind (set.f5m, set.tos, set.subs) a team has in the set */
  static count(set, kind, team) { return (set[kind] || []).filter(e => e.t === team).length; }

  /** key of the end of a set dialog: changes when the points change */
  static endKey(m, i) { return m.id + ':' + i + ':' + ((m.sets[i].pts || []).length); }

  /** the order number of a new event: the time, or one more than the highest of the set (so undo takes the latest first even when the clock goes back) */
  static order(set) { return Math.max(Date.now(), Math.max(0, ...[...(set.f5m || []), ...(set.tos || []), ...(set.subs || [])].map(e => e.q || 0)) + 1); }

  /** something can be undone in the running set: a point, a five-player event, a timeout or a substitution */
  static canUndo(set) { return !!(set && set.on && !set.end && ((set.pts && set.pts.length) || (set.f5m && set.f5m.length) || (set.tos && set.tos.length) || (set.subs && set.subs.length))); }

  /**
   * undoes the last action of the running set, in place: an event recorded after the last point (five-player entry,
   * timeout or substitution; the latest of them first), else the last point.
   * @returns {object} what was undone: {what: 'five', t, lost} | {what: 'sub', t, out, inn} | {what: 'timeout', t} | {what: 'point', t}
   */
  static undo(set) {
    const K = (set.pts || []).length, c = [];
    let u = null;
    (set.f5m || []).forEach((e, j) => { if (e.at === K) c.push({ k: 'f', j, q: e.q || 0 }); });
    (set.tos || []).forEach((e, j) => { if (e.at === K) c.push({ k: 't', j, q: e.q || 0 }); });
    (set.subs || []).forEach((e, j) => { if (e.at === K) c.push({ k: 's', j, q: e.q || 0 }); });
    if (c.length) {
      c.sort((x, y) => y.q - x.q);
      const t = c[0];
      if (t.k === 'f') { const e = set.f5m[t.j]; u = { what: 'five', t: e.t, lost: e.lost }; set.f5m.splice(t.j, 1); if (!set.f5m.length) delete set.f5m; }
      else if (t.k === 's') { const e = set.subs[t.j]; u = { what: 'sub', t: e.t, out: e.out, inn: e.inn }; set.subs.splice(t.j, 1); if (!set.subs.length) delete set.subs; }
      else { const e = set.tos[t.j]; u = { what: 'timeout', t: e.t }; set.tos.splice(t.j, 1); if (!set.tos.length) delete set.tos; }
    } else { u = { what: 'point', t: set.pts[set.pts.length - 1] }; set.pts.pop(); }
    return u;
  }

  /**
   * removes the last n points won by a team from the running set, in place (the events recorded after them move back
   * with the points before them).
   * @returns {number} how many points were removed (0 when the team has none)
   */
  static removePoints(set, team, n) {
    const pts = set.pts || [], idx = [];
    for (let j = pts.length - 1; j >= 0 && idx.length < (+n || 1); j--) if (pts[j] === team) idx.push(j);
    if (!idx.length) return 0;
    const gone = new Set(idx);
    ['f5m', 'tos', 'subs'].forEach(k => (set[k] || []).forEach(e => { e.at = e.at - idx.filter(j => j < e.at).length; }));
    set.pts = pts.filter((_, j) => !gone.has(j));
    return idx.length;
  }
}
