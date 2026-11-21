/**
 * RuleBook (domain): All rule sets, the built-in ones and the custom ones. One book for both views.
 * It never touches the browser: the custom rules are read through a function that gives the live list (the
 * list the app saves), and saving that list to the device stays with the caller (through Store).
 * Rules are handed out as RuleSet objects; data() gives the plain object that is saved or copied into a match.
 */
class RuleBook {
  /** @param {function} custom gives the current list of custom rule data, e.g. () => S.r */
  constructor(custom) {
    this._custom = custom || (() => []);
    this._built = [
      { id: 'local', name: 'Local tournament', roster: false, sets: [{ win: 25 }, { win: 25 }, { win: 25 }, { win: 25 }, { win: 15 }] },
      { id: 'fivb', name: 'Official FIVB', roster: true, sets: [{ win: 25 }, { win: 25 }, { win: 25 }, { win: 25 }, { win: 15 }] },
      /* HVA: best of 3, 25 points, tie break 15, no hard limit, no match time. Timeouts and substitutions are not set, so they follow the same defaults as Official FIVB. */
      { id: 'hva', name: 'HVA', roster: false, sets: [{ win: 25 }, { win: 25 }, { win: 15 }] },
      /* SADVA: best of 3, 21 points with a hard limit of 23, tie break 15 (hard and soft), one hour match time, teams may play with five players. Timeouts and substitutions as Official FIVB. */
      { id: 'sadva', name: 'SADVA', roster: false, five: true, min: 60, sets: [{ win: 21, hard: 23 }, { win: 21, hard: 23 }, { win: 15, hard: 15 }] }
    ];
  }

  /** the plain data of the built-in rule sets (Local tournament, Official FIVB, HVA, SADVA); always the same objects */
  builtIn() { return this._built; }

  /** the plain data of every rule set: built-in first, then custom */
  all() { return this._built.concat(this._custom()); }

  /** the rule set with this id; Local tournament when there is none */
  get(id) { return new RuleSet(this.all().find(r => r.id === id) || this._built[0]); }

  /** true when a rule set with this id exists (built-in or custom) */
  has(id) { return this.all().some(r => r.id === id); }

  /** the rule set of a match: its own copy (match.rule), else the one named by match.fmt, else Local tournament */
  forMatch(match) { return new RuleSet(match.rule || this._built.find(r => r.id === match.fmt) || this._built[0]); }

  /** true when another rule set (not the one with exceptId) already has this name, ignoring case */
  nameTaken(name, exceptId) { return this.all().some(r => r.id !== exceptId && r.name.toLowerCase() === name.toLowerCase()); }

  /** the first thing wrong with a rule set before saving it, as a message, or null */
  problem(ruleSet) { return ruleSet.problem((n, id) => this.nameTaken(n, id)); }

  /** saves a custom rule set: a known id replaces it, no id gives it a new one. Returns the plain data. */
  save(ruleSet) {
    const d = ruleSet.data(), list = this._custom();
    if (d.id) list[list.findIndex(r => r.id === d.id)] = d;
    else { d.id = 'r' + Date.now().toString(36); list.push(d); }
    return d;
  }

  /** removes a custom rule set (the built-in ones cannot be removed); matches keep their own copy */
  remove(id) {
    const list = this._custom();
    for (let i = list.length - 1; i >= 0; i--) if (list[i].id === id) list.splice(i, 1);
  }
}
