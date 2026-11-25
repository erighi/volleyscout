/**
 * Settings (infra): Two choices of the coach view that are remembered on the device: the scouting level (Basic or
 * Enhanced) and the scout layout (Extended or Compact). The scouting level has a default (saved) and a current value
 * (the default at the start, changed from the Scout page without being saved). The layout is put on the page through the
 * data-layout attribute of the document. Which settings groups each view shows is up to the screens (see SettingsPage);
 * the theme is in Theme, the feedback in Feedback, the organiser in Organiser.
 */
class Settings {
  /** the scouting levels that can be chosen: [key, label] */
  static levels() { return [['simple', 'Basic'], ['adv', 'Enhanced']]; }

  /** the scout layouts that can be chosen: [key, label] */
  static layouts() { return [['extended', 'Extended'], ['compact', 'Compact']]; }

  /**
   * reads the saved choices from the device (done once at the start): the default scouting level (Enhanced or else
   * Basic), the layout (Compact or else Extended), and forgets the old scouting mode key of earlier versions.
   * The current scouting level starts as the default.
   */
  static load() {
    Store.remove(Store.key('oldMode'));
    Settings._def = Store.text(Store.key('defMode')) === 'adv' ? 'adv' : 'simple';
    Settings._lvl = Settings._def;
    Settings._lay = Store.text(Store.key('layout')) === 'compact' ? 'compact' : 'extended';
  }

  /** reads the saved choices when nothing has done it yet */
  static ensure() { if (Settings._def === undefined) Settings.load(); }

  /** the default scouting level: 'simple' or 'adv' */
  static defLevel() { Settings.ensure(); return Settings._def; }

  /** the scouting level in use now: 'simple' or 'adv' */
  static level() { Settings.ensure(); return Settings._lvl; }

  /** the scout layout: 'extended' or 'compact' */
  static layout() { Settings.ensure(); return Settings._lay; }

  /** changes the scouting level in use (anything but 'adv' is Basic); not saved */
  static setLevel(k) { Settings.ensure(); Settings._lvl = k === 'adv' ? 'adv' : 'simple'; }

  /** changes the default scouting level (saved); the level in use becomes the default too */
  static setDefLevel(k) {
    Settings.ensure();
    Settings._def = k === 'adv' ? 'adv' : 'simple';
    Settings._lvl = Settings._def;
    Store.setText(Store.key('defMode'), Settings._def);
  }

  /** puts the layout on the page: the data-layout attribute of the document */
  static applyLayout() { document.documentElement.setAttribute('data-layout', Settings.layout()); }

  /** changes the layout (anything but 'compact' is Extended), saves it and puts it on the page */
  static setLayout(k) {
    Settings.ensure();
    Settings._lay = k === 'compact' ? 'compact' : 'extended';
    Store.setText(Store.key('layout'), Settings._lay);
    Settings.applyLayout();
  }
}
