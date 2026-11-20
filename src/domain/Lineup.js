/**
 * Lineup (domain): The six court positions and the roles: placing players, the team system (5-1, 6-2, 4-2), auto fill, the five-player layout.
 *
 * Still in legacy.js, proposed to move here (23 named pieces, 6.1 KB):
 *   f5s, f5Mid, setSys, setServe, pickPos, setPos, copyPrev, setFive, declF5, SYSP, slotOk, sysSlots,
 *   sysFit, autoFill, sysEval, sysCheck, f5, lineupDone, openLineup, bpPick, bpFive, bpPlace,
 *   bpClear
 */
class Lineup {
  constructor(positions, system) { Pending.method('Lineup.constructor'); }
  place(position, player) { Pending.method('Lineup.place'); }
  /** middles opposite each other ... */
  isValidFor(system) { Pending.method('Lineup.isValidFor'); }
  /** who fits the active slice */
  suggest(position) { Pending.method('Lineup.suggest'); }
  isFivePlayer() { Pending.method('Lineup.isFivePlayer'); }
}
