/**
 * Tournament (domain): A group of matches with a default rule set and, in the coach view, the teams taking part.
 * A value object over plain data {id, name, <ruleField>, teams?}: the coach view keeps its rule set id in `fmt`,
 * the score table in `rule`, so the field name is a constructor argument until the two shapes are merged. The ids
 * are kept as they are (a tournament made by the organiser can later be handed to a coach under the same id).
 * Nothing here touches the screen or the device.
 */
class Tournament {
  /**
   * @param {object} data the plain tournament data (not copied)
   * @param {string} ruleField 'rule' (score table, the default) or 'fmt' (coach view): where the rule set id is kept
   */
  constructor(data, ruleField) { this._d = data; this._f = ruleField || 'rule'; }

  data() { return this._d; }
  id() { return this._d.id; }
  name() { return this._d.name; }

  /** the id of the tournament's rule set when it still exists in the rule book, else '' */
  ruleId(rules) { const id = this._d[this._f]; return id && rules.has(id) ? id : ''; }

  /** the tournament's RuleSet (default rules for its matches), or null when it has none or it was deleted */
  rules(rules) { const id = this.ruleId(rules); return id ? rules.get(id) : null; }

  /** the teams taking part that still exist; knownTeamIds lists every team */
  teams(knownTeamIds) { return (this._d.teams || []).filter(id => knownTeamIds.includes(id)); }

  /**
   * the teams taking part plus the teams that have matches here (their home team ids), only teams that exist,
   * in the order of knownTeamIds
   */
  teamsWithMatches(knownTeamIds, homeTeamIds) {
    const ids = this.teams(knownTeamIds);
    homeTeamIds.forEach(h => { if (h && !ids.includes(h) && knownTeamIds.includes(h)) ids.push(h); });
    return ids.sort((a, b) => knownTeamIds.indexOf(a) - knownTeamIds.indexOf(b));
  }

  /** the list of teams after switching one team on or off; a team with matches here cannot be switched off */
  teamsAfter(teamId, on, knownTeamIds, homeTeamIds) {
    const cur = this.teamsWithMatches(knownTeamIds, homeTeamIds);
    return on ? [...new Set([...cur, teamId])] : cur.filter(x => x !== teamId || homeTeamIds.includes(teamId));
  }
}
