/**
 * Router (app): Which view, tab and screen are shown: the changes to the screen state when the user moves between
 * tabs, opens a match or chooses the view. It only changes the screen state; showing the screen (render, scroll to the
 * top) is up to the caller.
 */
class Router {
  /** @param {UiState} ui the screen state */
  constructor(ui) { this.ui = ui; }

  /** coach view: goes to a tab (matches, teams, opps, stats, settings) and closes the match, forms and drafts */
  goCoach(tab) {
    const u = this.ui;
    u.tab = tab; u.cur = null; u.form = false; u.edit = null; u.team = null; u.tform = false; u.rd = null;
  }

  /** coach view: opens a match, on the scout page when something was scouted in it, else on the set page */
  openCoachMatch(id, hasLog) {
    const u = this.ui;
    u.cur = id; u.mt = hasLog ? 'scout' : 'set'; u.pick = null; u.sb = null; u.lm = false; u.pm = null; u.setv = null; u.pv = 'cur';
  }

  /** score table: goes to a tab (matches, tournaments, rules, settings) and closes every dialog, form and open match */
  goScorer(tab) {
    const u = this.ui;
    u.stab = tab; u.td = null; u.lv = null; u.toc = null; u.sbq = null; u.rpq = null; u.sx = null; u.ts = null; u.rx = null; u.mv = null; u.rd = null;
  }

  /** the device uses this view from now on: starts on its first tab with nothing open */
  chooseMode(mode) {
    const u = this.ui;
    u.cur = null; u.tab = mode === 'coach' ? 'teams' : 'matches'; u.stab = 'matches'; u.sx = null; u.mv = null; u.rd = null;
  }

  /** the user goes back to the choice of view */
  changeMode() {
    const u = this.ui;
    u.cur = null; u.sx = null; u.rd = null;
  }
}
