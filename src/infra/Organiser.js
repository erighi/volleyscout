/**
 * Organiser (infra): The organiser of the tournament, shown in the first cell at the top of the scoresheet: the logo
 * if there is one, otherwise the name. Name and logo are remembered on the device (through Store). The logo is a small
 * PNG kept as a data URL; a picked image is scaled down to fit 400 by 160 pixels. Showing the settings group and
 * telling the person about a problem is up to the screens: pickLogo reports through the functions it is given.
 */
class Organiser {
  /** the longest name kept */
  static maxName() { return 60; }

  /** the largest logo kept, in pixels: [width, height] */
  static maxLogo() { return [400, 160]; }

  /** reads the saved organiser from the device (done once at the start; a damaged value gives an empty organiser) */
  static load() {
    let o = { name: '', logo: '' };
    const r = Store.read(Store.key('organiser'), null);
    if (r && typeof r === 'object') o = { name: String(r.name || ''), logo: String(r.logo || '') };
    Organiser._o = o;
    return o;
  }

  /** the organiser kept in memory: {name, logo} */
  static data() { return Organiser._o || Organiser.load(); }

  /** the organiser name ('' when none) */
  static name() { return Organiser.data().name; }

  /** the logo as a data URL ('' when none; use logoOk before showing it) */
  static logo() { return Organiser.data().logo; }

  /** the logo is a usable image: a base64 data URL of a png, jpeg, webp or gif */
  static logoOk() { return /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(Organiser.data().logo); }

  /** saves the organiser on the device */
  static save() { Store.write(Store.key('organiser'), Organiser.data()); }

  /** sets the name (cut to 60 characters) and saves it */
  static setName(v) { Organiser.data().name = String(v).slice(0, Organiser.maxName()); Organiser.save(); }

  /** sets the logo from a data URL and saves it */
  static setLogo(dataUrl) { Organiser.data().logo = dataUrl; Organiser.save(); }

  /** removes the logo and saves */
  static clearLogo() { Organiser.data().logo = ''; Organiser.save(); }

  /** the scale that brings an image of w by h pixels inside the largest logo size (never above 1) */
  static scale(w, h) { const m = Organiser.maxLogo(); return Math.min(1, m[0] / w, m[1] / h); }

  /** the size an image of w by h pixels is drawn at: [width, height], at least 1 pixel each */
  static size(w, h) { const k = Organiser.scale(w, h); return [Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))]; }

  /**
   * takes the logo from a file input: checks it is an image, scales it, keeps it as png and saves it.
   * done() is called after the logo was saved; fail(message) when the file cannot be used (nothing is changed then).
   */
  static pickLogo(input, done, fail) {
    const f = input.files && input.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { fail('Choose an image file.'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Organiser.size(img.width, img.height), c = document.createElement('canvas');
        c.width = s[0]; c.height = s[1];
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        let url;
        try { url = c.toDataURL('image/png'); } catch (e) { fail('This image cannot be used.'); return; }
        Organiser.setLogo(url);
        done();
      };
      img.onerror = () => fail('This image cannot be read.');
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  }
}
