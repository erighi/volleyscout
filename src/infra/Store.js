/**
 * Store (infra): The only place that touches localStorage. Every read and write is guarded: a blocked or full
 * storage never stops the app (reads give the fallback, writes return false).
 * Values are saved as JSON under one key per kind of data; a few settings are plain text.
 */
class Store {
  /** all keys used by the app, by name (also the list a backup has to cover) */
  static keys() { return Object.assign({}, Store.KEYS); }

  /** the storage key of one kind of data, for example Store.key('matches') */
  static key(name) {
    const k = Store.KEYS[name];
    if (k === undefined) throw new Error('Store.key: unknown name ' + name);
    return k;
  }

  /** reads JSON; gives the fallback when the key is missing, empty, null or not valid JSON */
  static read(key, fallback) {
    try {
      const r = localStorage.getItem(key);
      if (!r) return fallback;
      const v = JSON.parse(r);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }

  /** saves a value as JSON; returns false when the storage refused it */
  static write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  /** reads a plain text value, or null */
  static text(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /** saves a plain text value; returns false when the storage refused it */
  static setText(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  /** removes a key */
  static remove(key) {
    try { localStorage.removeItem(key); return true; } catch (e) { return false; }
  }

  /** the key table: name to storage key */
  static get KEYS() {
    return {
      matches: 'vb-scout-v1',
      players: 'vb-scout-players-v1',
      teams: 'vb-scout-teams-v1',
      theme: 'vb-scout-theme-v1',
      scale: 'vb-scout-scale-v1',
      skills: 'vb-scout-skills-v1',
      rules: 'vb-scout-rules-v1',
      board: 'vb-scout-board-v1',
      tournaments: 'vb-scout-tournaments-v1',
      oldMode: 'vb-scout-mode-v1',
      defMode: 'vb-scout-defmode-v1',
      layout: 'vb-scout-layout-v1',
      fx: 'vb-scout-fx-v1',
      appMode: 'vb-scout-appmode-v1',
      scoreMatches: 'vb-scout-score-v1',
      scoreTournaments: 'vb-scout-stour-v1',
      organiser: 'vb-scout-org-v1'
    };
  }
}
