/**
 * ScorerView (views): The score table view: matches, tournaments, rules, settings, scoreboard and scoresheet.
 *
 * Still in legacy.js, proposed to move here (24 named pieces + 1 start-up statements, 35.6 KB):
 *   rosterViewS, scorerMatches, tossView, openMatch, libLine, openBoard, lineupView, openSign,
 *   signView, openSetView, scSetView, scPn, scSubAsk, scSubPick, scSubCancel, scSubConfirm, scToAsk,
 *   scToCancel, scToConfirm, scLvOpen, scLvWho, scLvBack, scLvReason, boardView
 */
class ScorerView extends View {
  tabs() { return [['matches', 'Matches'], ['tournaments', 'Tournaments'], ['rules', 'Rules'], ['settings', 'Settings']]; }
  settingsGroups() { return ['app', 'org', 'bak']; }
}
