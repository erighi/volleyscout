/**
 * App (app): The entry point and the root of the app: it makes the two parts of the app state (the screen state and
 * the data lists), the router, and knows which view the device uses (coach view or score table) and the version.
 * index.html calls App.start(). While the screens still live in legacy.js, start hands over to them.
 *
 * Still in legacy.js (they build the screens, which are not classes yet): render, renderCoach, renderScorer, pickView.
 */
class App {
  /** the version shown on every screen (the cache name in sw.js and the file versions in index.html carry it too) */
  static version() { return '1.65.0'; }

  /** the version line at the bottom of every screen */
  static versionHtml() { return '<div class="mut" style="text-align:center;margin-top:28px;font-size:12px">Version ' + App.version() + '</div>'; }

  /** the screen state, made once */
  static ui() { return App._ui || (App._ui = new UiState()); }
  /** the data lists, made once */
  static library() { return App._library || (App._library = new Library()); }
  /** the router over the screen state, made once */
  static router() { return App._router || (App._router = new Router(App.ui())); }

  /** the view this device uses: 'coach', 'scorer', or null when it has not been chosen yet (read from the device once) */
  static mode() {
    if (App._mode === undefined) { const r = Store.text(Store.key('appMode')); App._mode = r === 'coach' || r === 'scorer' ? r : null; }
    return App._mode;
  }

  /** chooses the view for this device and remembers it on the device; null forgets the choice */
  static setMode(mode) {
    App._mode = mode;
    if (mode === null) Store.remove(Store.key('appMode')); else Store.setText(Store.key('appMode'), mode);
  }

  /**
   * the buttons of the navigation bar of a view. The coach view's buttons are the ones in index.html (read once,
   * before the bar is first replaced); the score table's come from ScorerView.tabs().
   */
  static navHtml(mode) {
    if (mode === 'scorer') return ScorerView.prototype.tabs().map(([k, label]) => '<button id="t-s' + k + '" onclick="goS(\'' + k + '\')">' + label + '</button>').join('');
    if (App._coachNav === undefined) App._coachNav = document.getElementById('mainnav').innerHTML;
    return App._coachNav;
  }

  /** The only call index.html makes. While the screens still live in legacy.js it hands over to them. */
  static start() {
    if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    legacyStart();
  }
}
