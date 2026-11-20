/**
 * CourtSides (domain): Toss, first serve, court sides per set, the deciding set toss and the change of courts at 8 points.
 *
 * Still in legacy.js, proposed to move here (24 named pieces, 3.3 KB):
 *   SIDE, oppT, oppS, tossRes, tossText, tossLine, openToss, tsLk, tsWin, tsPick, tsOther, tsBack,
 *   tsClear, tsSave, isTB, tbSwapAt, tbSwapped, tbTossOk, tbLocked, sideOfT, sideNow, serveOfT, tcol,
 *   sideInfo
 */
class CourtSides {
  constructor(match) { Pending.method('CourtSides.constructor'); }
  /** "L" or "R", changes at 8 in the deciding set */
  sideOf(team, setIndex) { Pending.method('CourtSides.sideOf'); }
  firstServer(setIndex) { Pending.method('CourtSides.firstServer'); }
  isDecidingSet(setIndex) { Pending.method('CourtSides.isDecidingSet'); }
  /** point count when the teams swap, or 0 */
  swapPoint(setIndex) { Pending.method('CourtSides.swapPoint'); }
}
