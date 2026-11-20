/**
 * PieView (ui): The line-up pie: geometry, slice, number, lock, replaced numbers. Already shared (pieGeom, pieSlice, pieCorner, pieSvg) with two adapters (coach, score table).
 *
 * Still in legacy.js, proposed to move here (15 named pieces, 8.7 KB):
 *   pieBox, ANG, RL, scoutPie, lockIcon, PIE_R, PIE_C, PIE_F, pieGeom, pieCorner, pieSlice, pieSvg,
 *   pie, spie, scSubMarks
 */
class PieView {
  static svg(slices, label) { Pending.method('PieView.svg'); }
  static slice(geometry, options) { Pending.method('PieView.slice'); }
  static forCoach(match, set, options) { Pending.method('PieView.forCoach'); }
  static forScorer(team, set, options) { Pending.method('PieView.forScorer'); }
}
