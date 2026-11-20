/**
 * Captaincy (domain): The game captain: the team captain whenever on court, otherwise the declared one; who must be declared after a substitution or a player who cannot continue.
 *
 * Still in legacy.js, proposed to move here (4 named pieces, 0.9 KB):
 *   rcapOf, capNum, scCapNeed, bpCap
 */
class Captaincy {
  /** the captain now, or null */
  static onCourt(team, lineup, declared) { Pending.method('Captaincy.onCourt'); }
  /** {need, options} */
  static mustDeclare(team, state, leaving, coming) { Pending.method('Captaincy.mustDeclare'); }
}
