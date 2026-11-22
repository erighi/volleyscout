/**
 * Library (app): The data the app works with, as lists: the coach's matches, players, teams, rule sets and tournaments,
 * and the score table's matches and tournaments. Only data: the screen state is in UiState. The lists are plain
 * arrays of plain data; the classes that know the rules (TeamBook, RuleBook, TournamentBook, Match ...) read them through
 * functions that give the live list. Saving and loading stay with the caller (through Store).
 */
class Library {
  constructor() {
    this.matches = []; this.players = []; this.teams = []; this.rules = [];
    this.scoreMatches = []; this.tournaments = []; this.scoreTournaments = [];
  }

  /** the short names the old code used for the lists, mapped to the names above: {m: 'matches', ...} */
  static aliases() {
    const a = Object.create(null);
    a.m = 'matches'; a.p = 'players'; a.t = 'teams'; a.r = 'rules'; a.sm = 'scoreMatches'; a.tn = 'tournaments'; a.stt = 'scoreTournaments';
    return a;
  }

  /** the names of the lists */
  static names() { return Object.values(Library.aliases()); }
}
