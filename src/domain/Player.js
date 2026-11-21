/**
 * Player (domain): A player of the coach's roster, as a wrapper over the plain data
 *   {id, name, prefs: [preferred roles in order], teamId (main team), also: [other team ids], tm: {teamId: {num, role}},
 *    num, role (a copy of the main team's number and role), arch (archived)}
 * A player can be in several teams with a different shirt number and role in each: tm keeps them per team, and
 * num and role always mirror the main team's (syncPrimary). Old data without tm uses num and role for every team.
 * The methods that change the player change the plain data in place. Nothing here touches the screen or the device.
 *
 * Still in legacy.js: the player form and the role pickers (prefSlots, pfChg, roleOptsHtml, savePlayer reading the
 * form, editPlayer), archive and delete confirmations, canRoleEdit (a rule about the match, not the player).
 */
class Player {
  /** @param {object} data the plain player data (not copied) */
  constructor(data) { this._d = data; }

  /** the roles a player can be given, in the order they are offered */
  static roles() { return ['Setter', 'Outside hitter', 'Opposite', 'Middle blocker', 'Libero', 'Defensive specialist']; }

  data() { return this._d; }
  id() { return this._d.id; }
  name() { return this._d.name; }

  /** shirt number and role in a team: {num, role} as text ('' when none); old data without tm uses the player's own */
  teamData(teamId) {
    const p = this._d, e = p.tm && p.tm[teamId];
    return e ? { num: e.num || '', role: e.role || '' } : { num: p.num || '', role: p.role || '' };
  }
  number(teamId) { return this.teamData(teamId).num; }
  role(teamId) { return this.teamData(teamId).role; }

  /** a copy of the player's data with the number and role of one team */
  view(teamId) { return { ...this._d, num: this.number(teamId), role: this.role(teamId) }; }

  /** the preferred roles in order (an old player with only a role prefers that role) */
  preferences() { const p = this._d; return Array.isArray(p.prefs) ? p.prefs : (p.role ? [p.role] : []); }

  /** the player is in the team: his main team or one of his other teams */
  isIn(teamId) { return Team.hasMember(this._d, teamId); }

  /** a player is in the team, not archived, with this shirt number (another player than exceptId) */
  static numberTaken(players, teamId, num, exceptId) {
    return players.some(p => Team.hasMember(p, teamId) && !p.arch && new Player(p).number(teamId) === num && p.id !== exceptId);
  }

  /** gives every team of the player his own number and role entry (copied from his own values when he has none) */
  freeze() {
    const p = this._d;
    p.tm = p.tm || {};
    [p.teamId, ...(p.also || [])].forEach(t => { if (!p.tm[t]) p.tm[t] = { num: p.num || '', role: p.role || '' }; });
  }

  /** copies the main team's number and role into the player's own num and role */
  syncPrimary() { const t = this.teamData(this._d.teamId); this._d.num = t.num; this._d.role = t.role; }

  /** a new player's data: main team, name, preferred roles, number and role there, and the other teams (number empty, role the first preference) */
  static create(f) {
    const np = { id: Date.now().toString(36), teamId: f.teamId, name: f.name, prefs: f.prefs, tm: { [f.teamId]: { num: f.num, role: f.role } } };
    if (f.also.length) { np.also = f.also; f.also.forEach(t => { np.tm[t] = { num: '', role: f.prefs[0] || '' }; }); }
    new Player(np).syncPrimary();
    return np;
  }

  /**
   * applies the player form to an existing player. teamId is the team being edited; checked are the other teams
   * ticked in the form and candidates all the other teams the form offered (teams not offered are left alone).
   * The main team stays when the player is still in it, else the first team becomes the main one.
   */
  applyEdit(f) {
    const p = this._d;
    this.freeze(); p.name = f.name; p.prefs = f.prefs;
    const prev = [p.teamId, ...(p.also || [])],
      M = [...new Set([f.teamId, ...f.checked, ...prev.filter(i => i !== f.teamId && !f.candidates.includes(i))])];
    p.tm[f.teamId] = { num: f.num, role: f.role };
    M.forEach(t => { if (!prev.includes(t)) p.tm[t] = { num: '', role: f.prefs[0] || '' }; });
    prev.forEach(t => { if (!M.includes(t)) delete p.tm[t]; });
    p.teamId = M.includes(p.teamId) ? p.teamId : M[0];
    p.also = M.filter(i => i !== p.teamId);
    if (!p.also.length) delete p.also;
    this.syncPrimary();
  }

  /** adds the player to another team: no number, the first preferred role there */
  shareWith(teamId) {
    const p = this._d;
    this.freeze();
    p.also = [...(p.also || []), teamId];
    p.tm[teamId] = { num: '', role: this.preferences()[0] || '' };
  }

  /**
   * takes the player out of a team and returns true; the first of his other teams becomes the main one.
   * Returns false, changing nothing, when he has no other team (the caller removes the player).
   * tidy: drop the list of other teams when it becomes empty (the player screen does, deleting a team does not)
   */
  leaveTeam(teamId, tidy) {
    const p = this._d, rest = [p.teamId, ...(p.also || [])].filter(i => i !== teamId);
    if (!rest.length) return false;
    this.freeze(); delete p.tm[teamId];
    p.teamId = rest[0]; p.also = rest.slice(1);
    if (tidy && !p.also.length) delete p.also;
    this.syncPrimary();
    return true;
  }

  /** archives (true) or restores (false) the player */
  archive(on) { if (on) this._d.arch = true; else delete this._d.arch; }
}
