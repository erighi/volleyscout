/**
 * Match (domain): The rules of a score table match: sets won, the winner, how the match can end and who wins in
 * each case, the MVP nominations and the signatures needed at the end. A wrapper over the plain match data:
 *   match.rule (sets), match.sets[i] {on, end {w, a, b}}, match.fin {reason}, match.mvp {a, b}, match.a / match.b {name}
 * The points of a set that is still running are not in the match data (they are replayed from the point log), so
 * the caller gives a function pointsOf(setIndex) -> {a, b}.
 * Teams are 'a' and 'b'. Nothing here touches the screen or the device.
 *
 * Still in legacy.js: the coach view's match (its sets come from the scouted log: tally, setsWon, matchBusy),
 * the match form and the ask/confirm dialogs (addMatch, newSM, editSM, smForm, scFinAsk, scFinConfirm, scRemAsk ...).
 */
class Match {
  /**
   * @param {object} data the score table match (plain data, not copied)
   * @param {function} pointsOf optional: setIndex -> {a, b} points of a set (needed by finishWinner and finishSets)
   */
  constructor(data, pointsOf) { this.m = data; this._points = pointsOf; }

  /** signatures needed at the end of the match: captain a, captain b, 1st referee, scorer */
  static signaturesRequired() { return ['ca', 'cb', 'r1', 'sc']; }

  /** sets a team must win to win the match (half of the sets of the rule plus one; 3 sets when the match has no rule) */
  setsNeeded() { return Math.floor((new RuleSet(this.m.rule).setCount() || 3) / 2) + 1; }

  /** sets won by a team */
  setsWon(team) { return (this.m.sets || []).filter(x => x.end && x.end.w === team).length; }

  /** the team that has won enough sets, or null */
  winner() { return ['a', 'b'].find(t => this.setsWon(t) >= this.setsNeeded()) || null; }

  /**
   * the winner of the match for a way of ending it, or null (no winner):
   * win: the team with enough sets; ffa / ffb: team a / b forfeits so the other wins; time: more sets, then more points;
   * anything else (both forfeit, cancelled, suspended): no winner
   */
  finishWinner(reason) {
    if (reason === 'win') return this.winner();
    if (reason === 'ffa') return 'b';
    if (reason === 'ffb') return 'a';
    if (reason === 'time') {
      const a = this.setsWon('a'), b = this.setsWon('b');
      if (a !== b) return a > b ? 'a' : 'b';
      let pa = 0, pb = 0;
      (this.m.sets || []).forEach((z, i) => { if (z.on) { const x = this._points(i); pa += x.a; pb += x.b; } });
      return pa === pb ? null : pa > pb ? 'a' : 'b';
    }
    return null;
  }

  /** the sets that were played: [{i, a, b, done}] with the final score of a finished set and the running score of the others */
  finishSets() {
    const o = [];
    (this.m.sets || []).forEach((z, i) => {
      if (z && z.on) {
        const x = z.end ? { a: z.end.a, b: z.end.b } : this._points(i);
        o.push({ i, a: x.a, b: x.b, done: !!z.end });
      }
    });
    return o;
  }

  /** text of a way of ending the match, e.g. "Won on sets by Alpha" */
  finishText(reason) {
    const m = this.m, w = this.finishWinner(reason);
    return reason === 'win' ? 'Won on sets' + (w ? ' by ' + m[w].name : '')
      : reason === 'time' ? 'Time limit reached'
      : reason === 'ffa' ? m.a.name + ' forfeits'
      : reason === 'ffb' ? m.b.name + ' forfeits'
      : reason === 'ffboth' ? 'Both teams forfeit'
      : reason === 'cancel' ? 'Match cancelled (emergency)'
      : reason === 'susp' ? 'Match suspended: court unavailable. To be replayed another day'
      : 'Match ended';
  }

  /** each team nominates an MVP of the other team: needed when the match ended on sets or on time and the rule asks for it */
  mvpNeeded() { const m = this.m; return !!(m.fin && (m.fin.reason === 'win' || m.fin.reason === 'time') && new RuleSet(m.rule).mvpRequired()); }

  /** the MVP nominations are complete (or not needed) */
  mvpDone() { const m = this.m; return !this.mvpNeeded() || ['a', 'b'].every(t => m.mvp && m.mvp[t] != null); }
}
