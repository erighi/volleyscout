/**
 * ActionLog (domain): The audit log of a score table match: every action with its time and set, kept in
 * match.alog and never edited. Points that were undone or removed stay in the log (the scoresheet is separate).
 * An entry is a plain object {ts, set, k, ...fields of its kind}:
 *   start; point {t, sc, sv, gh}; undo {what, t, sc, out, inn, lost}; remove {t, n, sc0, sc}; timeout {t, sc, left};
 *   sub {t, out, inn, sc, left, cap}; mvp {t, n}; swap {t, sc}; five {t, lost, reason, sc, cap}; end {w, sc, mw, ff};
 *   remark {t, sc, text}; fin {reason, w, sets}; finreopen; sign {who}; signed; reopen {sc}
 * where t, w, mw, ff, sv, gh are teams ('a' or 'b') and sc is [points of a, points of b].
 * The class builds the text of every entry; the few names it cannot know are given by the caller as labels.
 */
class ActionLog {
  /**
   * @param {object} match the score table match (plain data: a.name, b.name, rule, date, alog)
   * @param {object} labels optional, only needed for text(): player(team, number) gives "#7 Name" (plain text),
   *   finish(reason) gives the text of a match end reason, signer(who) gives the name of a signer
   */
  constructor(match, labels) { this.m = match; this.labels = labels || {}; }

  /** appends an entry for a set (0 based) with the current time; fields override nothing but ts and set may be given */
  add(setIndex, fields) {
    (this.m.alog = this.m.alog || []).push(Object.assign({ ts: Date.now(), set: setIndex }, fields));
  }

  /** every entry in the order it was made (the live list; empty when nothing was logged) */
  all() { return this.m.alog || []; }

  /** one line of text for an entry */
  text(e) {
    const m = this.m, L = this.labels, n = t => m[t].name, sc = q => m.a.name + ' ' + q[0] + ' : ' + q[1] + ' ' + m.b.name;
    switch (e.k) {
      case 'start': return 'Set ' + (e.set + 1) + ' started';
      case 'point': return 'Point to ' + n(e.t) + '. Score ' + sc(e.sc) + (e.gh ? '. Ghost rotation: ' + n(e.gh) + ' has no server' : (e.sv ? '. ' + n(e.sv) + ' serving' : ''));
      case 'undo': {
        const w = e.what === 'point' ? 'point to ' + n(e.t) : e.what === 'timeout' ? 'timeout for ' + n(e.t) : e.what === 'sub' ? 'substitution for ' + n(e.t) + ' (#' + e.out + ' out, #' + e.inn + ' in)' : 'five-player entry for ' + n(e.t) + ' (#' + e.lost + ' left)';
        return 'Undo: ' + w + ' cancelled. Score ' + sc(e.sc);
      }
      case 'remove': return 'Removed ' + e.n + ' point' + (e.n === 1 ? '' : 's') + ' from ' + n(e.t) + '. Score ' + sc(e.sc0) + ' became ' + sc(e.sc);
      case 'timeout': return 'Timeout ' + n(e.t) + ' at ' + sc(e.sc) + ' (' + e.left + ' left)';
      case 'sub': return 'Substitution ' + n(e.t) + ': #' + e.out + ' out, #' + e.inn + ' in at ' + sc(e.sc) + ' (' + e.left + ' left)' + (e.cap ? '. Game captain: #' + e.cap : '');
      case 'mvp': return n(e.t) + ' nominates ' + (e.n === '-' ? 'no player' : L.player(CourtSides.other(e.t), e.n)) + ' of ' + n(CourtSides.other(e.t)) + ' as MVP';
      case 'swap': return 'Teams swap courts after ' + n(e.t) + ' reached 8 points, at ' + sc(e.sc);
      case 'five': return n(e.t) + ' continues with 5 players: #' + e.lost + ' left (' + e.reason + ') at ' + sc(e.sc) + (e.cap ? '. Game captain: #' + e.cap : '');
      case 'end': return 'Set ' + (e.set + 1) + ' ended: ' + n(e.w) + ' won ' + sc(e.sc) + (e.ff ? ' (' + n(e.ff) + ' forfeited the set)' : '') + (e.mw ? '. Match won by ' + n(e.mw) : '');
      case 'remark': return 'Remark' + (e.t ? ' about ' + n(e.t) : '') + ': ' + e.text + '. Score ' + sc(e.sc);
      case 'fin': return 'Match ended: ' + L.finish(e.reason) + '. ' + e.sets.map((x, i) => 'Set ' + (i + 1) + ' ' + m.a.name + ' ' + x[0] + ' : ' + x[1] + ' ' + m.b.name + (x[2] ? '' : ' (unfinished)')).join('; ') + '. ' + (e.w ? 'Winner: ' + n(e.w) : 'No winner');
      case 'finreopen': return 'Match end cancelled, scoring reopened';
      case 'sign': return L.signer(e.who) + ' signed';
      case 'signed': return 'Signatures completed, match closed';
      case 'reopen': return 'Set ' + (e.set + 1) + ' reopened at ' + sc(e.sc);
      default: return String(e.k);
    }
  }

  /** the whole log as plain text: a heading, then one line per entry with time, set and text */
  toText() {
    const m = this.m;
    let out = 'Action log: ' + m.a.name + ' v ' + m.b.name + '\n' + (m.rule && m.rule.name ? m.rule.name + ', ' : '') + (m.date || '') + '\n';
    this.all().forEach(e => { out += '\n' + Fmt.clockSeconds(e.ts) + '  Set ' + (e.set + 1) + '  ' + this.text(e); });
    return out + '\n';
  }

  /** file name for the text download: action-log-Alpha-v-Beta-2026-11-01.txt */
  fileName() {
    const m = this.m;
    return 'action-log-' + String(m.a.name + '-v-' + m.b.name + '-' + (m.date || '')).replace(/[^A-Za-z0-9_-]+/g, '-') + '.txt';
  }
}
