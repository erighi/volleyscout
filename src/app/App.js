/**
 * App (app): The only entry point: index.html calls App.start().
 *
 * Still in legacy.js, proposed to move here (11 named pieces + 4 start-up statements, 3.1 KB):
 *   VER, renderCoach, appMode, NAV_COACH, NAV_SCORER, setApp, changeView, goS, pickView,
 *   renderScorer, render
 */
class App {
  /** The only call index.html makes. While the screens still live in legacy.js it hands over to them. */
  static start() {
    if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    legacyStart();
  }
}
