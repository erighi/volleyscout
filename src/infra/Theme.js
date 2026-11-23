/**
 * Theme (infra): The colour theme of the device: auto (follows the device), light or dark. The choice is remembered on
 * the device; the theme is applied to the page through the data-theme attribute of the document and the colour of the
 * browser bar (the theme-color meta tag). Showing the choice on a screen is up to the screens.
 */
class Theme {
  /** the themes that can be chosen: [key, label] */
  static modes() { return [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]; }

  /** the theme chosen: 'auto', 'light' or 'dark' (read from the device once, then kept in memory) */
  static mode() {
    if (Theme._mode === undefined) { const r = Store.text(Store.key('theme')); Theme._mode = r === 'light' || r === 'dark' ? r : 'auto'; }
    return Theme._mode;
  }

  /** the page is dark now: the dark theme, or auto on a device that prefers dark */
  static isDark() {
    const m = Theme.mode();
    return m === 'dark' || (m === 'auto' && !!window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /** puts the theme on the page: the attribute on the document (none for auto) and the colour of the browser bar */
  static apply() {
    const d = document.documentElement, m = Theme.mode();
    if (m === 'auto') d.removeAttribute('data-theme'); else d.setAttribute('data-theme', m);
    const dk = Theme.isDark(), mt = document.querySelector('meta[name=theme-color]');
    if (mt) mt.setAttribute('content', dk ? '#0c1a1d' : '#0e6b73');
  }

  /** chooses a theme: remembers it on the device (auto forgets the choice) and applies it */
  static set(mode) {
    Theme._mode = mode;
    if (mode === 'auto') Store.remove(Store.key('theme')); else Store.setText(Store.key('theme'), mode);
    Theme.apply();
  }

  /** applies the theme now and again whenever the device changes between light and dark (only matters for auto) */
  static start() {
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (Theme.mode() === 'auto') Theme.apply(); }); } catch (e) { /* no media query support: nothing to follow */ }
    Theme.apply();
  }
}
