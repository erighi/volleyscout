/**
 * TeamBook (domain): The list of teams: the coach's own teams and the opponents. Like RuleBook it reads the live
 * list through a function and never touches the device: saving the list stays with the caller (through Store).
 * Removing a team does not touch its players (the caller moves or removes them).
 */
class TeamBook {
  /** @param {function} list gives the live list of team data, e.g. () => S.t */
  constructor(list) { this._list = list; }

  /** the plain data of every team, in the order they were made */
  all() { return this._list(); }
  /** the plain data of a team by id, or undefined */
  find(id) { return this._list().find(t => t.id === id); }
  /** a Team by id, or null */
  get(id) { const d = this.find(id); return d ? new Team(d) : null; }
  /** the first of the coach's own teams (plain data), or undefined */
  mine() { return this._list().find(t => t.mine); }
  /** all of the coach's own teams */
  mineAll() { return this._list().filter(t => t.mine); }
  /** the opponents: every team that is not the coach's own */
  opponents() { return this._list().filter(t => !t.mine); }
  /** a team by name, ignoring case (plain data), or undefined */
  byName(name) { return this._list().find(t => t.name.toLowerCase() === name.toLowerCase()); }

  /** the team with this name; a new opponent when there is none (check the list length to know whether to save) */
  ensure(name) {
    let t = this.byName(name);
    if (!t) { t = { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, mine: false }; this._list().push(t); }
    return t;
  }

  /** adds a team, one of the coach's own or an opponent; the caller checks that the name is free */
  add(name, mine) {
    const t = { id: 't' + Date.now().toString(36), name, mine };
    this._list().push(t);
    return t;
  }

  /** renames a team */
  rename(id, name) { const t = this.find(id); if (t) t.name = name; }

  /** switches a team between the coach's own and an opponent; returns whether it is now his own (throws for an unknown id) */
  toggleMine(id) { const t = this.find(id), on = !t.mine; t.mine = on; return on; }

  /** removes a team in place */
  remove(id) {
    const list = this._list();
    for (let i = list.length - 1; i >= 0; i--) if (list[i].id === id) list.splice(i, 1);
  }
}
