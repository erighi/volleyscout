/**
 * Roster (domain): The players of one team for one match, with the libero and captain, and whether it is complete enough to start.
 *
 * Still in legacy.js, proposed to move here (21 named pieces, 7.6 KB):
 *   nrSel, nrStatus, luSet, unplace, luDel, luToggle, luGuest, luRow, luHtml, teamSigned, teamDone,
 *   rosterDone, rxNext, rxSide, openRoster, syncRx, commitTeam, rxTeam, saveRoster, teamReady,
 *   rosterReady
 */
class Roster {
  constructor(team, rules) { Pending.method('Roster.constructor'); }
  liberos() { Pending.method('Roster.liberos'); }
  teamCaptain() { Pending.method('Roster.teamCaptain'); }
  /** 12 + liberos, captain set (limits come from the rule set) */
  isComplete() { Pending.method('Roster.isComplete'); }
  /** the team signs once the roster is complete */
  sign(drawing) { Pending.method('Roster.sign'); }
  isSigned() { Pending.method('Roster.isSigned'); }
}
