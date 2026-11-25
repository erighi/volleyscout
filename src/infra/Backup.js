/**
 * Backup (infra): Export, import and transfer of all data between devices. The backup is one JSON file
 * ({app:'volleyscout', v:22, exported, data}) with the coach's matches, players, teams, rule sets and tournaments, the
 * score table's matches and tournaments, the serve scale and the skill grades. Export shares the file (where the device
 * can) or downloads it. Import either replaces everything on the device or adds what is missing (matches, teams,
 * players... that are not there yet; nothing is deleted). Import and export work on the Library (the data lists); the
 * serve scale and the skill grades are still kept by the old code, so they come in as parameters, and the saving of
 * each list is done through the functions it is given. Redrawing and the screen state are up to the caller.
 */
class Backup {
  /** the import mode chosen last (kept as chosen; 'replace' at the start) */
  static _mode = 'replace';

  /** the version of the file format */
  static version() { return 22; }

  /** all data as one object: the backup file's content (scale as {n, d} per grade; skills as kept) */
  static build(lib, scale, skills) {
    return {
      app: 'volleyscout', v: Backup.version(), exported: new Date().toISOString(),
      data: {
        matches: lib.matches, players: lib.players, teams: lib.teams, rules: lib.rules,
        scale: scale.map(x => ({ n: x.n, d: x.d })), skills, tournaments: lib.tournaments,
        scorer: lib.scoreMatches, scorerTours: lib.scoreTournaments
      }
    };
  }

  /** the file name of a backup made today: volleyscout-backup-YYYY-MM-DD.json */
  static fileName() { return 'volleyscout-backup-' + new Date().toISOString().slice(0, 10) + '.json'; }

  /** makes the backup file and hands it over: shared where the device can, else downloaded (a cancelled share does nothing) */
  static async exportFile(lib, scale, skills) {
    const txt = JSON.stringify(Backup.build(lib, scale, skills)), name = Backup.fileName();
    await Backup.send(txt, name);
  }

  /** hands a text file over: through the share sheet when the device can share files, else as a download */
  static async send(txt, name) {
    try {
      const f = new File([txt], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'VolleyScout backup' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  }

  /**
   * checks a backup file's text and gives its data as {matches, players, teams, rules, scale, skills, tournaments,
   * scorer, scorerTours}, or null when it is not a VolleyScout backup (matches, players and teams must be lists; the
   * other parts fall back to empty or null; the scale must have 5 grades; score table tournaments need an id and a name)
   */
  static parse(txt) {
    let o;
    try { o = JSON.parse(txt); } catch (e) { return null; }
    const d = o && o.app === 'volleyscout' && o.data;
    if (!d || !Array.isArray(d.matches) || !Array.isArray(d.players) || !Array.isArray(d.teams)) return null;
    return {
      matches: d.matches, players: d.players, teams: d.teams,
      rules: Array.isArray(d.rules) ? d.rules : [],
      scale: Array.isArray(d.scale) && d.scale.length === 5 ? d.scale : null,
      skills: d.skills && typeof d.skills === 'object' ? d.skills : null,
      tournaments: Array.isArray(d.tournaments) ? d.tournaments : [],
      scorer: Array.isArray(d.scorer) ? d.scorer : [],
      scorerTours: Array.isArray(d.scorerTours) ? d.scorerTours.filter(t => t && t.id && t.name) : []
    };
  }

  /**
   * puts parsed backup data into the Library: mode 'replace' makes the lists match the file, anything else adds what is missing.
   * io tells how to save and how to set what the Library does not hold:
   * {saveScorer(), saveTours(), setScale(scale), setSkills(skills), saveLists()}; they are called at the same points as
   * before (scorer matches saved first, then the tournaments of the score table, then the scale and skills when
   * replacing, and last the coach's lists).
   */
  static apply(lib, d, mode, io) {
    if (mode === 'replace') { lib.scoreMatches = d.scorer || []; }
    else { (d.scorer || []).forEach(x => { if (!lib.scoreMatches.some(y => y.id === x.id)) lib.scoreMatches.push(x); }); }
    io.saveScorer();
    if (mode === 'replace') { lib.scoreTournaments = d.scorerTours || []; }
    else { (d.scorerTours || []).forEach(t => { if (!lib.scoreTournaments.some(y => y.id === t.id)) lib.scoreTournaments.push(t); }); }
    io.saveTours();
    if (mode === 'replace') {
      lib.matches = d.matches; lib.players = d.players; lib.teams = d.teams; lib.rules = d.rules; lib.tournaments = d.tournaments || [];
      if (d.scale) io.setScale(d.scale);
      if (d.skills) io.setSkills(d.skills);
    } else {
      Backup.merge(lib, d);
    }
    io.saveLists();
  }

  /**
   * adds what is missing: teams and tournaments are matched by name (ignoring case), everything else by id; players,
   * matches and the teams of tournaments are pointed at the teams (and tournaments) that were already here
   */
  static merge(lib, d) {
    const map = {}, tmap = {}, fresh = new Set();
    (d.tournaments || []).forEach(t => {
      const l = lib.tournaments.find(x => x.name.toLowerCase() === String(t.name).toLowerCase());
      if (l) tmap[t.id] = l.id;
      else {
        const n = lib.tournaments.some(x => x.id === t.id) ? { ...t, id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) } : { ...t };
        lib.tournaments.push(n); fresh.add(n.id); tmap[t.id] = n.id;
      }
    });
    d.teams.forEach(t => {
      const l = lib.teams.find(x => x.name.toLowerCase() === String(t.name).toLowerCase());
      if (l) map[t.id] = l.id;
      else { const n = { ...t }; lib.teams.push(n); map[t.id] = n.id; }
    });
    (d.tournaments || []).forEach(t => {
      const l = lib.tournaments.find(x => x.id === tmap[t.id]);
      if (!l || !t.teams) return;
      const ids = [...new Set([...(fresh.has(l.id) ? [] : (l.teams || [])), ...t.teams.map(i => map[i] || i)])].filter(i => lib.teams.some(x => x.id === i));
      if (ids.length) l.teams = ids; else delete l.teams;
    });
    d.players.forEach(p => {
      if (lib.players.some(x => x.id === p.id)) return;
      lib.players.push({
        ...p, teamId: map[p.teamId] || p.teamId,
        ...(p.also && p.also.length ? { also: p.also.map(i => map[i] || i) } : {}),
        ...(p.tm ? { tm: Object.fromEntries(Object.entries(p.tm).map(([k, x]) => [map[k] || k, x])) } : {})
      });
    });
    d.rules.forEach(r => { if (!lib.rules.some(x => x.id === r.id)) lib.rules.push(r); });
    d.matches.forEach(m => {
      if (lib.matches.some(x => x.id === m.id)) return;
      lib.matches.push({ ...m, hid: map[m.hid] || m.hid, aid: map[m.aid] || m.aid, ...(m.tid ? { tid: tmap[m.tid] || m.tid } : {}) });
    });
  }

  /** the import mode chosen last: 'replace' or 'add' (the screens use 'replace' and 'merge'; anything but 'replace' adds) */
  static mode() { return Backup._mode; }

  /** chooses the import mode and opens the file picker (the hidden file input with the id imp) */
  static pick(mode) {
    Backup._mode = mode;
    const i = document.getElementById('imp');
    i.value = ''; i.click();
  }

  /**
   * reads the file chosen in the file input and imports it: say(message) tells the person something, ask(message) asks
   * to confirm (true to go on), apply(data) puts the data in (see apply); nothing is changed when the file is not a
   * backup or the person does not confirm
   */
  static importFile(inp, apply, say, ask) {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const d = Backup.parse(String(r.result));
      if (!d) { say('This file is not a VolleyScout backup.'); return; }
      const msg = d.matches.length + ' matches, ' + d.teams.length + ' teams, ' + d.players.length + ' players. ' + (Backup.mode() === 'replace' ? 'This replaces everything on this device. Continue?' : 'Anything missing is added and nothing here is deleted. Continue?');
      if (!ask(msg)) return;
      apply(d);
      say('Import finished.');
    };
    r.readAsText(f);
  }
}
