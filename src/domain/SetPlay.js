/**
 * SetPlay (domain): One set: line-ups, the point log, substitutions, timeouts, five-player events, remarks. State is always replayed from the logs.
 *
 * Still in legacy.js, proposed to move here (48 named pieces, 12.3 KB):
 *   rallyDone, setWin, point, autoServe, setPd, endSet, note, curSet, setReady, startSet, setStarted,
 *   clearSet, setBusy, canResetSet, resetSet, resetBtn, reopenSet, reopenBtn, bset, startSetS, scSc,
 *   scWinner, scCnt, scEKey, scEndAsk, scFfResult, scSetEndAsk, scSetFfPick, scSetFfCancel,
 *   scSetFfMatch, scSetFfConfirm, scEndCancel, scEndConfirm, scReopen, scNextSet, scQ, scSub,
 *   scRemoveAsk, scRemoveN, scRemoveCancel, scRemoveConfirm, scRemove, scTo, scLeave, scPt,
 *   scCanUndo, scSwapOk, scUndo
 */
class SetPlay {
  constructor(data, rules) { Pending.method('SetPlay.constructor'); }
  /** {a, b} */
  score() { Pending.method('SetPlay.score'); }
  /** points to win, two clear points, hard limit */
  isWon() { Pending.method('SetPlay.isWon'); }
  addPoint(team) { Pending.method('SetPlay.addPoint'); }
  undo() { Pending.method('SetPlay.undo'); }
  removePoints(n) { Pending.method('SetPlay.removePoints'); }
  /** positions, server, ghost rotation: asks Rotation */
  state() { Pending.method('SetPlay.state'); }
}
