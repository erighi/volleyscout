/**
 * Crumbs (ui): The steps at the top of a match (Match, Roster, Toss, Line-up, Scoreboard, sets, Signatures).
 *
 * Still in legacy.js, proposed to move here (17 named pieces, 5.1 KB):
 *   STEPS, boardStarted, stepsDone, editLocked, crumbs, showStep, goStep, stepHead, stepSoon, roLine,
 *   roNote, matchRO, rosterRO, tossRO, lockedM, startedTxt, fitCrumbs
 */
class Crumbs {
  static html(match, current) { Pending.method('Crumbs.html'); }
  static go(match, step) { Pending.method('Crumbs.go'); }
  /** editing is blocked once play has started */
  static isLocked(match, step) { Pending.method('Crumbs.isLocked'); }
}
