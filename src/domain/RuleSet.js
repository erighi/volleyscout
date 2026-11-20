/**
 * RuleSet (domain): One rule set as a value object. Every rule is a method, so no view reads rule fields directly.
 *
 * Still in legacy.js, proposed to move here (10 named pieces, 0.6 KB):
 *   getRule, ruleOf, ruleText, ruleSub, ruleMin, rulePl, ruleLib, swapRule, scSetRule, mvpRule
 */
class RuleSet {
  constructor(data) { Pending.method('RuleSet.constructor'); }
  /** {win, hard} points for a set; the last set is the tie break */
  setRule(index) { Pending.method('RuleSet.setRule'); }
  /** replaces toLimit/ruleTO/scToMax */
  timeoutsPerSet() { Pending.method('RuleSet.timeoutsPerSet'); }
  substitutionsPerSet() { Pending.method('RuleSet.substitutionsPerSet'); }
  fivePlayerAllowed() { Pending.method('RuleSet.fivePlayerAllowed'); }
  /** teams change courts at 8 in the deciding set */
  swapAtEight() { Pending.method('RuleSet.swapAtEight'); }
  /** each team nominates an MVP of the other team */
  mvpRequired() { Pending.method('RuleSet.mvpRequired'); }
  /** minutes, or null */
  timeLimit() { Pending.method('RuleSet.timeLimit'); }
  /** players and liberos */
  rosterSize() { Pending.method('RuleSet.rosterSize'); }
}
