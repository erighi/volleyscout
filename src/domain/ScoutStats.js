/**
 * ScoutStats (domain): Scouting: serve and skill grades, lost points, per player statistics with filters.
 *
 * Still in legacy.js, proposed to move here (24 named pieces, 12.9 KB):
 *   T, TH, TA, SCDEF, SC, SKN, SKXDEF, SKX, setSkx, saveSkx, gScale, saveScale, resetScale, serve,
 *   undo, serveTable, advGrade, actRow, actCount, lostTable, serveStats, statsFilter, fOk,
 *   attendStats
 */
class ScoutStats {
  static grades(skill) { Pending.method('ScoutStats.grades'); }
  static serveStats(matches, filter) { Pending.method('ScoutStats.serveStats'); }
  static attendance(matches, filter) { Pending.method('ScoutStats.attendance'); }
  static lostPoints(match) { Pending.method('ScoutStats.lostPoints'); }
}
