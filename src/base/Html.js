/**
 * Html (base): Small helpers that build html strings: escaping, attributes, icons.
 * No browser objects: it only builds text.
 */
class Html {
  /** escapes text for html; null and undefined give an empty string */
  static esc(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /**
   * builds an attribute string from a map, each attribute with a leading space.
   * false, null and undefined are left out, true gives a bare attribute (disabled), other values are escaped.
   */
  static attrs(map) {
    let out = '';
    Object.keys(map || {}).forEach(k => {
      const v = map[k];
      if (v === false || v == null) return;
      out += v === true ? ' ' + k : ' ' + k + '="' + Html.esc(v) + '"';
    });
    return out;
  }

  /** svg icons used in the screens: 'libero', 'swap', 'view', 'doc' */
  static icon(name) {
    const svg = Html.ICONS[name];
    if (svg === undefined) throw new Error('Html.icon: unknown icon ' + name);
    return svg;
  }

  /** the icon table: name to svg text */
  static get ICONS() {
    return {
      libero: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 7v10h5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      swap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
      view: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      doc: '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/></svg>'
    };
  }
}
