/**
 * TimeoutRules (domain): Timeouts: the limit comes from the rule set, both views count what a team used in the set.
 *
 * Still in legacy.js, proposed to move here (7 named pieces, 0.6 KB):
 *   toLimit, toUsed, toLeft, ruleTO, callTO, scToMax, scToLeft
 */
class TimeoutRules {
  /** @param {object} rule the rule set (or its data); the limit is rule.to, 2 when it is not set */
  constructor(rule) { this.rule = rule || {}; }
  /** timeouts per team per set */
  limit() { const t = this.rule.to; return t != null && !isNaN(+t) ? +t : 2; }
  /** how many timeouts a team has used in a list of timeouts (the list of one set) */
  used(list, team) { return (list || []).filter(e => e.t === team).length; }
  /** how many timeouts a team has left */
  left(list, team) { return Math.max(0, this.limit() - this.used(list, team)); }
}
