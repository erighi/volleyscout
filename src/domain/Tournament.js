/**
 * Tournament (domain): A group of matches with the participating teams and a default rule set.
 *
 * Still in legacy.js, proposed to move here (28 named pieces, 7.5 KB):
 *   TNK, saveTn, newTn, tnTeams, tnTeamIds, setTnTeam, matchBusy, tnFmt, tnPick, setTnFmt, addTn,
 *   tnAddMatch, renameTn, delTn, setTn, tnOpts, sttOf, sttRule, STD0, newStt, editStt, syncStt,
 *   sttRulePick, saveSttForm, delStt, sttForm, sttList, bySt
 */
class Tournament {
  constructor(data) { Pending.method('Tournament.constructor'); }
  /** default RuleSet */
  rules() { Pending.method('Tournament.rules'); }
  teams() { Pending.method('Tournament.teams'); }
  matches() { Pending.method('Tournament.matches'); }
  add(match) { Pending.method('Tournament.add'); }
}
