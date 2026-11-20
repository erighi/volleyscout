/**
 * Match (domain): A match between two teams under a rule set: header data, roster per team, toss, sets, signatures, result.
 *
 * Still in legacy.js, proposed to move here (37 named pieces, 10.1 KB):
 *   addMatch, finish, del, tally, setsWon, HDF, HD0, SX0, newSM, editSM, syncSx, smTnPick, newSMT,
 *   sxCancel, saveSMatch, delSMatch, smForm, scSetsWon, scMatchWinner, scRemAsk, scRemWho,
 *   scRemCancel, scRemConfirm, FINREQ, mvpNeeded, mvpDone, mvpTxt, scMvp, scFinTxt, scFinWinner,
 *   scFinSets, scFinAsk, scFinPick, scFinCancel, scFinConfirm, scFinReopen, scFinish
 */
class Match {
  constructor(data) { Pending.method('Match.constructor'); }
  setsWon(team) { Pending.method('Match.setsWon'); }
  /** null until won, forfeited or ended */
  winner() { Pending.method('Match.winner'); }
  currentSet() { Pending.method('Match.currentSet'); }
  /** starts the next set (or the tie break with its own toss) */
  nextSet() { Pending.method('Match.nextSet'); }
  /** won, time, forfeit, cancelled, suspended */
  end(reason) { Pending.method('Match.end'); }
  isFinished() { Pending.method('Match.isFinished'); }
  resultText() { Pending.method('Match.resultText'); }
}
