/**
 * Team (domain): A team: id, name, and whether it is one of "my teams" (the coach's own teams, as opposed to
 * opponents). A value object over plain data {id, name, mine}. Players belong to a team through their own data
 * (player.teamId and player.also, a player can be in several teams with a different number and role in each).
 * The list of teams is in TeamBook. Nothing here touches the screen or the device.
 */
class Team {
  /** @param {object} data the plain team data (not copied) */
  constructor(data) { this._d = data; }

  data() { return this._d; }
  id() { return this._d.id; }
  name() { return this._d.name; }
  /** one of the coach's own teams (not an opponent) */
  isMine() { return !!this._d.mine; }

  /** this player is in the team with this id: his main team or one of his other teams */
  static hasMember(player, teamId) { return player.teamId === teamId || (player.also || []).includes(teamId); }

  /** the player is in this team */
  hasPlayer(player) { return Team.hasMember(player, this._d.id); }
}
