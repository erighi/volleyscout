/**
 * ActionLog (domain): Append-only log kept with the match: what happened, when, at which score.
 *
 * Still in legacy.js, proposed to move here (7 named pieces, 4.4 KB):
 *   scLog, scLogTxt, scLogText, openLog, logView, lgCopy, lgDownload
 */
class ActionLog {
  constructor(match) { Pending.method('ActionLog.constructor'); }
  add(entry) { Pending.method('ActionLog.add'); }
  /** one line of text */
  text(entry) { Pending.method('ActionLog.text'); }
  all() { Pending.method('ActionLog.all'); }
}
