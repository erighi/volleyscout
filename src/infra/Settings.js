/**
 * Settings (infra): The user settings of both views: theme, layout, default scout level, feedback, organiser, and which groups each view shows.
 *
 * Still in legacy.js, proposed to move here (10 named pieces + 3 start-up statements, 1.7 KB):
 *   defMode, scoutMode, setMode, setDefMode, LVL, COG, layoutMode, applyLayout, setLayout, LAYOUTS
 */
class Settings {
  static get(name) { Pending.method('Settings.get'); }
  static set(name, value) { Pending.method('Settings.set'); }
  /** ids of the groups visible in a view */
  static groups(view) { Pending.method('Settings.groups'); }
}
