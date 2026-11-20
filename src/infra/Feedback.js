/**
 * Feedback (infra): Flash and sound feedback on taps.
 *
 * Still in legacy.js, proposed to move here (5 named pieces + 2 start-up statements, 1.6 KB):
 *   fx, setFx, actx, clickSound, applyFx
 */
class Feedback {
  static enable(flash, sound) { Pending.method('Feedback.enable'); }
  static tap() { Pending.method('Feedback.tap'); }
}
