/**
 * Rotation (domain): Replays the point log into positions, who serves and ghost rotations. One engine for the coach and the score table.
 *
 * Still in legacy.js, proposed to move here (3 named pieces, 5.8 KB):
 *   curLU, rotLU, scState
 */
class Rotation {
  /** returns the current positions and server */
  static replay(lineup, points, options) { Pending.method('Rotation.replay'); }
  /** clockwise */
  static rotate(positions) { Pending.method('Rotation.rotate'); }
  /** five-player ghost rotation */
  static ghost(positions) { Pending.method('Rotation.ghost'); }
}
