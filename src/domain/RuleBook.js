/**
 * RuleBook (domain): All rule sets: built in and custom. Same book for both views.
 *
 * Still in legacy.js, proposed to move here (7 named pieces, 1.3 KB):
 *   BUILT, allRules, copy, setRule, ruleCount, saveRule, delRule
 */
class RuleBook {
  static all() { Pending.method('RuleBook.all'); }
  static get(id) { Pending.method('RuleBook.get'); }
  static save(ruleSet) { Pending.method('RuleBook.save'); }
  static remove(id) { Pending.method('RuleBook.remove'); }
  /** Local tournament, Official FIVB */
  static builtIn() { Pending.method('RuleBook.builtIn'); }
}
