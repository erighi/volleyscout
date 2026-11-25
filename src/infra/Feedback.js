/**
 * Feedback (infra): The flash and the click sound when a scouting button is tapped (the buttons that call serve, advGrade
 * or point). The two switches (flash, sound) are remembered on the device through Store; both are on by default.
 * The sound is a short beep made with the Web Audio API (nothing happens where it is missing); the flash is a CSS class
 * put on the button, or on the "Graded" card when the screen was redrawn and the button is gone.
 * The tap itself is noticed before the button's own handler runs; the flash is applied after the next redraw, so the
 * request for it travels through the screen state (S.fx), which the screens own: tap() returns it, flash() uses it.
 */
class Feedback {
  /** reads the saved switches from the device (done once at the start): {flash, sound}, default both on */
  static load() {
    let o = { flash: true, sound: true };
    const r = Store.read(Store.key('fx'), null);
    if (r && typeof r === 'object') o = Object.assign(o, r);
    Feedback._o = o;
    return o;
  }

  /** the switches kept in memory: {flash, sound} */
  static options() { return Feedback._o || Feedback.load(); }

  /** the flash is on */
  static flashOn() { return !!Feedback.options().flash; }

  /** the sound is on */
  static soundOn() { return !!Feedback.options().sound; }

  /** switches the flash or the sound on or off and saves (k is 'flash' or 'sound') */
  static set(k, v) { Feedback.options()[k] = !!v; Store.write(Store.key('fx'), Feedback.options()); }

  /** the buttons that get feedback: their onclick starts with serve(, advGrade( or point( */
  static isScoutCall(onclick) { return /^(serve|advGrade|point)\(/.test(onclick); }

  /** the short click beep (only when the sound is on and the device can play it) */
  static beep() {
    if (!Feedback.soundOn()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      Feedback._ctx = Feedback._ctx || new AC();
      const c = Feedback._ctx;
      if (c.state === 'suspended') c.resume();
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = 'square'; o.frequency.value = 1000;
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.12, t + .004);
      g.gain.exponentialRampToValueAtTime(.0001, t + .05);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + .06);
    } catch (e) { /* no sound: nothing to do */ }
  }

  /**
   * a tap on the page: plays the beep when it is a scouting button that can be pressed. Gives undefined when the tap
   * is not such a button (the pending flash stays as it is), else the new flash request {k, t} or null when the flash is off.
   */
  static tap(e) {
    const b = e.target && e.target.closest ? e.target.closest('button[onclick]') : null;
    if (!b || b.disabled) return undefined;
    const k = b.getAttribute('onclick');
    if (!Feedback.isScoutCall(k)) return undefined;
    Feedback.beep();
    return Feedback.flashOn() ? { k, t: Date.now() } : null;
  }

  /** listens to every tap on the page (before the buttons' own handlers); pending(request) receives what tap() gives */
  static start(pending) {
    document.addEventListener('click', e => { const r = Feedback.tap(e); if (r !== undefined) pending(r); }, true);
  }

  /** the CSS class of the flash for a request: good (++), bad (--), away (a point for the opponents) or the plain one */
  static flashClass(k) {
    const g = /'(--|\+\+)'\)$/.exec(k);
    return g ? (g[1] === '--' ? 'fx-bad' : 'fx-good') : k.startsWith("point('a'") ? 'fx-away' : 'fx';
  }

  /** flashes the button of a request {k, t} (or the "Graded" card when the button is gone); requests older than 1.5 s are dropped */
  static flash(f) {
    if (Date.now() - f.t > 1500) return;
    const b = [...document.querySelectorAll('button[onclick]')].find(x => x.getAttribute('onclick') === f.k);
    if (b) {
      const c = Feedback.flashClass(f.k);
      b.classList.add(c);
      b.addEventListener('animationend', () => b.classList.remove(c), { once: true });
      return;
    }
    const card = [...document.querySelectorAll('.card')].find(x => x.textContent.includes('Graded'));
    if (card) {
      card.classList.add('fx-card');
      card.addEventListener('animationend', () => card.classList.remove('fx-card'), { once: true });
    }
  }
}
