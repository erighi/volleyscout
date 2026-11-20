/**
 * Team (domain): A team: name, players, which one is "my team". Players can belong to several teams with a different number and role in each.
 *
 * Still in legacy.js, proposed to move here (11 named pieces, 1.5 KB):
 *   myTeam, myTeams, inTeam, tmOf, teamByName, ensureTeam, addTeam, openTeam, toggleMine, renameTeam,
 *   delTeam
 */
class Team {
  constructor(data) { Pending.method('Team.constructor'); }
  /** find by shirt number */
  player(number) { Pending.method('Team.player'); }
  add(player) { Pending.method('Team.add'); }
  remove(id) { Pending.method('Team.remove'); }
  isMine() { Pending.method('Team.isMine'); }
}
