/**
 * SubstitutionRules (domain): Who can replace whom: pairs, return once, substitute once, libero, injury, injured players. Already shared (subRep, subWhy, libWhy, emWhy).
 *
 * Still in legacy.js, proposed to move here (27 named pieces, 8.2 KB):
 *   subsUsed, subOpen, subPickPid, sbRole, subOut, pnp, subRep, subWhy, libWhy, emWhy, subState,
 *   roleIn, injured, emCheck, subCheck, libCheck, subIn, libsOf, alOf, setAL, libSwap, pushSub,
 *   autoLib, libOut, libSetup, scSubMax, scSubOpts
 */
class SubstitutionRules {
  /** state of replacements for one team and one set */
  static replay(events) { Pending.method('SubstitutionRules.replay'); }
  /** "" when allowed, else the message */
  static whyNot(state, out, inn, label, injured) { Pending.method('SubstitutionRules.whyNot'); }
  static whyNotLibero(state, out, inn, label, injured, inIsLibero) { Pending.method('SubstitutionRules.whyNotLibero'); }
  static whyNotInjury(state, out, inn, label, injured, flags) { Pending.method('SubstitutionRules.whyNotInjury'); }
  /** allowed outs and ins (score table) */
  static options(state, onCourt, pool, injured) { Pending.method('SubstitutionRules.options'); }
}
