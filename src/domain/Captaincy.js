/**
 * Captaincy (domain): The game captain in the score table: the team captain whenever he is on court, otherwise the
 * captain declared for the set; and who must be declared when the captain leaves the court.
 * Players are the team's roster entries {n: shirt number, cap: team captain, lib: libero}; numbers are compared as text.
 * Nothing here touches the match, the screen or the device.
 *
 * Still in legacy.js: bpCap (records the declared captain and moves on in the line-up screen).
 */
class Captaincy {
  /** the shirt number (as text) of the team captain: the player marked captain who is not a libero, or null */
  static teamCaptain(players) {
    const r = (players || []).find(p => p.cap && !p.lib);
    return r && r.n != null ? String(r.n) : null;
  }

  /**
   * the game captain's number (as text) or null: the team captain when he is on court, else the declared captain
   * when he is on court
   * @param {Array} players the team's roster
   * @param {Array} court the shirt numbers on court (empty positions may be null)
   * @param {*} declared the number declared for the set, or null/undefined
   */
  static onCourt(players, court, declared) {
    const on = (court || []).filter(Boolean).map(String), rc = Captaincy.teamCaptain(players);
    if (rc && on.includes(rc)) return rc;
    return declared != null && on.includes(String(declared)) ? String(declared) : null;
  }

  /**
   * after a change of players (out leaves, inn comes in; inn null when a player leaves without a replacement): is a
   * new game captain needed, and who could it be?
   * @param {Array} players the team's roster
   * @param {Array} court the shirt numbers on court now (empty positions may be null)
   * @param {*} current the game captain declared now, or null/undefined
   * @param {*} out the number leaving the court
   * @param {*} inn the number coming in, or null
   * @returns {{need: boolean, opts: Array}} opts: the numbers on court after the change who are not liberos
   */
  static mustDeclare(players, court, current, out, inn) {
    const same = (x, y) => x != null && y != null && String(x) === String(y),
      pos = court.map(x => same(x, out) ? (inn == null ? null : inn) : x).filter(x => x != null).map(String),
      rc = Captaincy.teamCaptain(players);
    if (rc && pos.includes(rc)) return { need: false, opts: [] };
    if (current != null && !same(current, out) && pos.includes(String(current))) return { need: false, opts: [] };
    return { need: true, opts: pos.filter(x => !(players || []).some(p => p.lib && String(p.n) === x)) };
  }
}
