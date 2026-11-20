/**
 * Player (domain): A player: id, shirt number, name, preferred roles in order, libero flag, captain flag.
 *
 * Still in legacy.js, proposed to move here (19 named pieces, 4.7 KB):
 *   ROLES, pTm, pNum, pRole, tv, prefsOf, freezeTm, syncPrimary, prefSlots, pfChg, roleOptsHtml,
 *   savePlayer, shareIn, editPlayer, archivePlayer, delPlayer, RC, RN, canRoleEdit
 */
class Player {
  constructor(data) { Pending.method('Player.constructor'); }
  /** "#12 Name" for messages and buttons */
  label() { Pending.method('Player.label'); }
  isLibero() { Pending.method('Player.isLibero'); }
  /** role in a given team (roles and numbers are team level) */
  roleIn(team) { Pending.method('Player.roleIn'); }
}
