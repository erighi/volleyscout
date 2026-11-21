/**
 * CourtSides (domain): Toss, first serve, court sides per set, the deciding set toss and the change of courts at 8 points.
 * Teams are 'a' and 'b', sides are 'L' and 'R'. An instance wraps one score table match (plain data):
 *   match.rule (sets), match.toss {serve, sides}, match.toss2 (the deciding set toss), match.sets[i] {on, pts}
 * where pts is the point log of the set: 'a' or 'b' per point. Nothing here touches the screen.
 *
 * Still in legacy.js (screen state): openToss, tsLk, tsWin, tsPick, tsOther, tsBack, tsClear, tsSave, tossLine,
 * sideInfo (needs the current set of the screen), tcol (a colour).
 */
class CourtSides {
  /** @param {object} match the score table match (plain data) */
  constructor(match) { this.m = match; }

  /** the other team */
  static other(team) { return team === 'a' ? 'b' : 'a'; }
  /** the other side */
  static otherSide(side) { return side === 'L' ? 'R' : 'L'; }
  /** 'left' or 'right' */
  static sideName(side) { return { L: 'left', R: 'right' }[side]; }

  /**
   * the result of the toss steps: {serve, sides} or null while the steps are not complete.
   * toss: {w: the winner, c: first choice, o: the other team's choice}. The winner chooses serve or receive
   * (then the other team picks a side) or a side (then the other team picks serve or receive).
   */
  static tossResult(toss) {
    if (!toss || !toss.w || !toss.c || !toss.o) return null;
    const w = toss.w, o = CourtSides.other(w);
    let serve; const sides = {};
    if (toss.c === 'serve' || toss.c === 'receive') {
      if (toss.o !== 'L' && toss.o !== 'R') return null;
      serve = toss.c === 'serve' ? w : o;
      sides[o] = toss.o; sides[w] = CourtSides.otherSide(toss.o);
    } else {
      if (toss.o !== 'serve' && toss.o !== 'receive') return null;
      sides[w] = toss.c; sides[o] = CourtSides.otherSide(toss.c);
      serve = toss.o === 'serve' ? o : w;
    }
    return { serve, sides };
  }

  /** "Alpha serve first, on the left side. Beta receive, on the right side." names: {a, b} */
  static tossText(names, result) {
    const f = result.serve, g = CourtSides.other(f);
    return names[f] + ' serve first, on the ' + CourtSides.sideName(result.sides[f]) + ' side. ' + names[g] + ' receive, on the ' + CourtSides.sideName(result.sides[g]) + ' side.';
  }

  /** number of sets of the rule (3 when the match has none) */
  _sets() { return new RuleSet(this.m.rule).setCount() || 3; }

  /** the deciding set (the last set of a rule with 3 or more sets) */
  isDecidingSet(setIndex) { const n = this._sets(); return n >= 3 && setIndex === n - 1; }

  /** the deciding set has started, so its toss can no longer be changed */
  decidingSetStarted() { const n = this._sets(), s = this.m.sets; return !!(s && s[n - 1] && s[n - 1].on); }

  /** the deciding set toss is recorded */
  decidingTossDone() { return !!(this.m.toss2 && this.m.toss2.serve); }

  /** point count at which the first team reached 8 points in this set (the courts change), or 0 */
  swapPoint(setIndex) {
    const z = this.m.sets && this.m.sets[setIndex];
    if (!z) return 0;
    let a = 0, b = 0;
    const p = z.pts || [];
    for (let k = 0; k < p.length; k++) {
      if (p[k] === 'a') a++; else b++;
      if (Math.max(a, b) === 8) return k + 1;
    }
    return 0;
  }

  /** the teams have changed courts in this set: the deciding set, the rule has the change at 8, and 8 points were reached */
  swapped(setIndex) { return this.isDecidingSet(setIndex) && new RuleSet(this.m.rule).swapAtEight() && this.swapPoint(setIndex) > 0; }

  /** the side of a team at the start of a set: the toss sides, swapped every set; the deciding set has its own toss */
  sideAtStart(team, setIndex) {
    const m = this.m;
    if (this.isDecidingSet(setIndex) && m.toss2 && m.toss2.sides) return m.toss2.sides[team];
    const x = m.toss.sides[team];
    return setIndex % 2 ? CourtSides.otherSide(x) : x;
  }

  /** "L" or "R": the side of a team now, with the change of courts at 8 in the deciding set */
  sideOf(team, setIndex) {
    const x = this.sideAtStart(team, setIndex);
    return this.swapped(setIndex) ? CourtSides.otherSide(x) : x;
  }

  /** the team that serves first in a set: the toss serve, alternating every set; the deciding set has its own toss */
  firstServer(setIndex) {
    const m = this.m;
    if (this.isDecidingSet(setIndex) && this.decidingTossDone()) return m.toss2.serve;
    return setIndex % 2 ? CourtSides.other(m.toss.serve) : m.toss.serve;
  }
}
