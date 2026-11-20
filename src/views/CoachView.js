/**
 * CoachView (views): The coach view: teams, matches, scouting, statistics. Uses the same domain classes as the score table.
 *
 * Still in legacy.js, proposed to move here (45 named pieces + 2 start-up statements, 46.8 KB):
 *   G, S, pnum, libCard, togglePM, panelBox, subLog, subCard, homePts, lockBtns, serveGate, gateBtns,
 *   serveCard, compactTop, toReport, toBoxes, elapsed, timeLeft, toggleTimer, byNum, snap, get, sc,
 *   target, go, open_, endPopup, cnt, over, setDate, setFmt, rosterView, reAuto, setSetView, f5Card,
 *   pastSetView, listPick, sideList, setView, tabsHtml, listView, toggleLM, matchView, teamsView,
 *   statsView
 */
class CoachView extends View {
  /** the sections shown at the bottom of the screen */
  tabs() { return [['teams', 'Teams'], ['matches', 'Matches'], ['stats', 'Stats'], ['settings', 'Settings']]; }
  /** the Settings groups this view shows (the groups themselves are shared, see SettingsPage) */
  settingsGroups() { return ['app', 'sct', 'rul', 'grd', 'bak']; }
}
