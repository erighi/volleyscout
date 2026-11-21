/**
 * SubstitutionRules (domain): Who can replace whom in one team in one set. Used by the coach view and the score table.
 * Players are opaque ids (a pid in the coach view, a shirt number in the score table). The events are the
 * replacements of one team in one set, in order: {out, in, lib, em}. lib marks a libero swap, em an
 * exceptional substitution (injury). No browser objects and no match data: the callers pass plain values.
 *
 * Rules: a substitute can only be replaced by the player he replaced; a replaced starter returns once, for the
 * same player; a player who came in as a substitute and was replaced cannot enter again; a player replaced by the
 * libero can only return for the libero; an injured player cannot return; the libero cannot be replaced or enter
 * by an exceptional substitution; an exceptional substitution is only allowed when no regular substitution is possible
 * for the injured player. The limit per set comes from RuleSet.substitutionsPerSet().
 *
 * Still in legacy.js (they need the match or the screen): subState, subCheck, libCheck, emCheck, subPickPid, subIn,
 * subOut, subOpen, sbRole, roleIn, pnp, pushSub, autoLib, libOut, libSetup, libsOf, alOf, setAL, scSubOpts (a
 * one-line call to options) and the substitution screens.
 */
class SubstitutionRules {
  /**
   * state of replacements for one team and one set
   * @returns {{rep: object, repBy: object, done: Set, spent: Set, lrep: object, lrepBy: object}}
   * rep[x] is the player x replaced; repBy[x] is who replaced x; done: starters who returned to the court;
   * spent: substitutes who played and were replaced; lrep/lrepBy: the same for libero swaps.
   */
  static replay(events) {
    const rep = {}, repBy = {}, done = new Set(), spent = new Set(), lrep = {}, lrepBy = {};
    events.forEach(x => {
      if (x.em) {
        if (rep[x.out] !== undefined) { delete repBy[rep[x.out]]; delete rep[x.out]; }
        if (repBy[x.out] !== undefined) { delete rep[repBy[x.out]]; delete repBy[x.out]; }
        if (repBy[x.in] !== undefined) { delete rep[repBy[x.in]]; delete repBy[x.in]; }
        if (rep[x.in] !== undefined) { delete repBy[rep[x.in]]; delete rep[x.in]; }
      } else if (x.lib) {
        if (lrep[x.out] !== undefined && x.in === lrep[x.out]) { delete lrepBy[x.in]; delete lrep[x.out]; }
        else { lrepBy[x.out] = x.in; lrep[x.in] = x.out; }
      } else if (rep[x.out] !== undefined && x.in === rep[x.out]) {
        delete repBy[x.in]; delete rep[x.out]; done.add(x.in); spent.add(x.out);
      } else { repBy[x.out] = x.in; rep[x.in] = x.out; }
    });
    return { rep, repBy, done, spent, lrep, lrepBy };
  }

  /**
   * regular substitution: "" when out can be replaced by inn, else the message.
   * label(id) names a player; injured is the set of players who cannot come back
   */
  static whyNot(state, out, inn, label, injured) {
    if (injured.has(inn)) return label(inn) + ' was injured and cannot return to the match.';
    if (state.done.has(out)) return label(out) + ' has already returned to the court and cannot be substituted again in this set.';
    if (state.rep[out] !== undefined && inn !== state.rep[out]) return label(out) + ' can only be replaced by ' + label(state.rep[out]) + ', the player they replaced.';
    if (state.repBy[inn] !== undefined && state.repBy[inn] !== out) return label(inn) + ' was substituted and can only return for ' + label(state.repBy[inn]) + '.';
    if (state.spent.has(inn)) return label(inn) + ' has already played as a substitute and cannot enter again in this set.';
    if (state.lrepBy[inn] !== undefined) return label(inn) + ' was replaced by the libero and can only return for the libero, ' + label(state.lrepBy[inn]) + '.';
    return '';
  }

  /** libero replacement (one of the two is the libero): "" when allowed, else the message */
  static whyNotLibero(state, out, inn, label, injured, innIsLibero) {
    if (injured.has(inn)) return label(inn) + ' was injured and cannot return to the match.';
    if (state.lrep[out] !== undefined && inn !== state.lrep[out]) return label(out) + ' can only be replaced by ' + label(state.lrep[out]) + ', the player they replaced.';
    if (!innIsLibero && state.lrepBy[inn] !== undefined && state.lrepBy[inn] !== out) return label(inn) + ' was replaced by the libero and can only return for ' + label(state.lrepBy[inn]) + '.';
    return '';
  }

  /**
   * exceptional substitution (injury), the part that depends on the player going out only: "" when allowed.
   * flags.aLib: the player is a libero; flags.regular: a regular substitution is still possible for the player
   * (an exceptional substitution is only allowed when a regular one is not possible, see canSubstitute)
   */
  static whyNotInjuryOut(out, label, flags) {
    if (flags.aLib) return 'A libero cannot be replaced by an exceptional substitution.';
    if (flags.regular) return label(out) + ' can still be replaced by a regular substitution. An exceptional substitution is only allowed when a regular substitution is not possible.';
    return '';
  }

  /** exceptional substitution (injury): flags.aLib / flags.bLib say whether the player going out / coming in is a libero, flags.regular whether a regular substitution is still possible */
  static whyNotInjury(state, out, inn, label, injured, flags) {
    const why = SubstitutionRules.whyNotInjuryOut(out, label, flags);
    if (why) return why;
    if (flags.bLib) return 'The libero cannot come in as an exceptional substitute.';
    if (injured.has(inn)) return label(inn) + ' was injured and cannot return to the match.';
    if (state.lrepBy[inn] !== undefined) return label(inn) + ' was replaced by the libero and cannot be used for an exceptional substitution.';
    return '';
  }

  /**
   * true when a regular substitution is possible for the player going out: substitutions are left in the set and
   * at least one bench player may come in for him under the rules above
   * @param {Array} events the team's replacements in this set
   * @param {Set} injured players who cannot return
   * @param {string} out the player going out
   * @param {Array} bench ids of the players who could come in (not on court, no liberos)
   * @param {number} max substitutions allowed in the set
   */
  static canSubstitute(events, injured, out, bench, max) {
    if (SubstitutionRules.used(events) >= max) return false;
    const state = SubstitutionRules.replay(events);
    return bench.some(inn => !SubstitutionRules.whyNot(state, out, inn, String, injured));
  }

  /** regular substitutions used: not libero swaps, not exceptional substitutions (events of one team in one set) */
  static used(events) { return events.filter(x => !x.lib && !x.em).length; }

  /** the players who left through an exceptional substitution (injured) and cannot return */
  static injured(events) { return new Set(events.filter(x => x.em).map(x => x.out)); }

  /** a swap involves the libero when the player going out or coming in is a libero (roles as text) */
  static isLiberoSwap(roleOut, roleIn) { return roleOut === 'Libero' || roleIn === 'Libero'; }

  /**
   * allowed outs and ins (score table): who can leave and who can enter.
   * @param {Array} events the team's replacements in this set, ids as text: {out, in}
   * @param {Set} injured players who cannot return
   * @param {Array} onCourt ids of the players on court
   * @param {Array} pool ids of the bench players (no liberos)
   * @param {number} max substitutions allowed in the set
   * @param {function} canLeave id => true when this player may be asked to leave (the score table's court position check)
   * @returns {{max: number, left: number, outs: Array, ins: object}} ins[out] lists who can replace out
   */
  static options(events, injured, onCourt, pool, max, canLeave) {
    const state = SubstitutionRules.replay(events), left = Math.max(0, max - events.length), outs = [], ins = {};
    if (left > 0) {
      onCourt.forEach(out => {
        if (!canLeave(out)) return;
        const ok = pool.filter(inn => !SubstitutionRules.whyNot(state, out, inn, String, injured));
        if (ok.length) { outs.push(out); ins[out] = ok; }
      });
    }
    return { max, left, outs, ins };
  }
}
