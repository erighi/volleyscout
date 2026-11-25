/**
 * SettingsPage (ui): Builds the Settings page, and the small scouting level menu on the Scout page. The page is a list of
 * groups (Appearance, Scouting, Organiser, Tournament rules, Grades, Backup and transfer); every group says in which
 * views it is shown ('coach' or 'scorer'). To show a group in another view, add that view to its list; nothing is rebuilt.
 * The groups that were moved into classes read them directly (Theme, Settings, Feedback, Organiser, Backup's buttons are
 * plain handlers). What the old code still owns comes in as `parts`: {sopen, gopen, org(), rules(), ruleCount(), skills,
 * scale(skill), glyph(grade)}: which groups and grade lists are open (screen state), the organiser and rule set groups,
 * the skill names, the grades of a skill and the grade symbol. The strings call the old handlers (setTheme, setLayout,
 * setDefMode, setFx, setMode, toggleLM, exportData, pickImport, importFile, saveScale, resetScale, changeView).
 */
class SettingsPage {
  /** the cog icon (svg) of the scouting level button */
  static cog() { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'; }

  /** the Layout choice shown under the scouting level menu */
  static layoutPick() { return `<div role="group" aria-label="Scout layout" style="margin:8px 0 0"><div class="mut" style="font-size:13px;margin-bottom:4px">Layout</div><div class="seg">${Settings.layouts().map(([k,l])=>`<button aria-pressed="${Settings.layout()===k}" onclick="setLayout('${k}')">${l}</button>`).join('')}</div></div>`; }

  /** the title line of a scouting card with the current level and the cog; open: the level menu is shown */
  static lvlHead(title, open) {
    open = !!open;
    const cur=(Settings.levels().find(x=>x[0]===Settings.level())||Settings.levels()[0])[1];
    return `<div class="row sp" style="align-items:center"><b>${title}</b><div class="row" style="gap:6px;align-items:center"><span class="mut" style="font-size:13px">${cur}</span><button aria-label="Scouting level, now ${cur}" aria-haspopup="menu" aria-expanded="${open}" onclick="toggleLM()" style="min-height:40px;min-width:40px;padding:0 8px">${SettingsPage.cog()}</button></div></div>${open?SettingsPage.lvlMenu()+SettingsPage.layoutPick():''}`;
  }

  /** the scouting level menu (Basic, Enhanced, and Expert which is not there yet) */
  static lvlMenu() {
    const it='display:block;width:100%;text-align:left;border:0;border-radius:0;min-height:44px';
    return `<div role="menu" aria-label="Scouting level" style="margin:8px 0;border:1px solid var(--line);border-radius:10px;overflow:hidden">${Settings.levels().map(([k,l],i)=>`<button role="menuitemradio" aria-checked="${Settings.level()===k}" onclick="setMode('${k}')" style="${it}${i?';border-top:1px solid var(--line)':''}${Settings.level()===k?';background:var(--home);color:var(--onc);font-weight:600':''}">${l}${Settings.level()===k?' ✓':''}</button>`).join('')}<button role="menuitemradio" aria-checked="false" disabled style="${it};border-top:1px solid var(--line)">Expert <span class="mut">(coming later)</span></button></div>`;
  }

  /** the Backup and transfer group */
  static backup() {
    return `<div class="mut">Data lives only on this device. Export a file, send it to your other device (AirDrop, email, messages, cloud drive) and import it there. Export also works as a backup.</div><div class="row" style="margin-top:12px"><button class="pri" onclick="exportData()">Export data</button></div><div class="row" style="margin-top:10px"><button onclick="pickImport('replace')">Import and replace</button><button onclick="pickImport('merge')">Import and add</button></div><div class="mut" style="margin-top:8px"><b>Replace</b> makes this device match the file. <b>Add</b> keeps what is here and adds the matches, teams and players that are missing.</div><input id="imp" type="file" accept=".json,application/json" style="display:none" onchange="importFile(this)">`
  }

  /** the label of the item with key k in a list of [key, label] ('' when there is none) */
  static nameOf(L, k) { return ((L.find(x => x[0] === k) || [])[1]) || ''; }

  /** the Theme choice */
  static theme() { return `<h2 style="margin-top:0">Theme</h2><div class="seg" role="group" aria-label="Theme">${[['auto','Auto'],['light','Light'],['dark','Dark']].map(([k,l])=>`<button aria-pressed="${Theme.mode()===k}" onclick="setTheme('${k}')">${l}</button>`).join('')}</div><div class="mut" style="margin-top:6px">Auto follows your device setting.</div>`; }

  /** the Scout layout choice */
  static layout() { return `<h2>Scout layout</h2><div class="seg" role="group" aria-label="Scout layout in settings">${Settings.layouts().map(([k,l])=>`<button aria-pressed="${Settings.layout()===k}" onclick="setLayout('${k}')">${l}</button>`).join('')}</div><div class="mut" style="margin-top:6px"><b>Extended:</b> everything in one column, for phones and small screens. <b>Compact:</b> for larger screens, to fit more without scrolling. The pie is on the left, with the scores and the timeouts in a column on its right.</div>`; }

  /** the default scouting level and the tap feedback switches */
  static scout() { return `<h2 style="margin-top:0">Default scouting level</h2><div class="seg" role="group" aria-label="Default scouting level">${Settings.levels().map(([k,l])=>`<button aria-pressed="${Settings.defLevel()===k}" onclick="setDefMode('${k}')">${l}</button>`).join('')}</div><div class="mut" style="margin-top:6px">The level the Scout page starts at each time the app is opened. The cog on the Scout page still switches level, until the app is closed and reopened.</div><h2>Tap feedback</h2><div>${[['flash','Colour flash on scouting buttons'],['sound','Click sound on scouting buttons']].map(([k,l])=>`<div class="row sp" style="margin:6px 0"><span>${l}</span><div class="seg" role="group" aria-label="${l}">${[[true,'On'],[false,'Off']].map(([v,t])=>`<button aria-pressed="${Feedback.options()[k]===v}" onclick="setFx('${k}',${v})">${t}</button>`).join('')}</div></div>`).join('')}</div>`; }

  /** the grades of every skill (parts.skills: names by skill, parts.scale(skill): its grades, parts.glyph(grade), parts.gopen: open lists) */
  static grades(parts) { return `<div class="mut">The same five symbols are used for every skill. The symbols are fixed; you can rename each one and change its description. Open a skill to edit it. For serves, a ${parts.glyph('--')} gives the opponents the point and a ${parts.glyph('++')} gives your team the point. Only serves are graded on the Scout page for now.</div>${Object.keys(parts.skills).map(sk=>`<details class="card" ${parts.gopen&&parts.gopen[sk]?'open':''} ontoggle="(S.gopen=S.gopen||{})['${sk}']=this.open"><summary><b>${parts.skills[sk]} grades</b></summary>${parts.scale(sk).map((x,i)=>`<div style="margin-top:10px"><b>${parts.glyph(x.k)}</b><label for="g-${sk}-n${i}">Short label</label><input id="g-${sk}-n${i}" maxlength="12" value="${Html.esc(x.n)}"><label for="g-${sk}-d${i}">Description</label><input id="g-${sk}-d${i}" value="${Html.esc(x.d)}"></div>`).join('')}<div class="row" style="margin-top:12px"><button class="pri" onclick="saveScale('${sk}')">Save</button><button onclick="resetScale('${sk}')">Reset to defaults</button></div></details>`).join('')}`; }

  /** the groups: {id, title, views, hint(view, parts), body(view, parts)} */
  static groups() {
    return [
  {id:'app',title:'Appearance',views:['coach','scorer'],hint:v=>SettingsPage.nameOf(Theme.modes(),Theme.mode())+(v==='coach'?' \u00b7 '+SettingsPage.nameOf(Settings.layouts(),Settings.layout()):''),body:v=>SettingsPage.theme()+(v==='coach'?SettingsPage.layout():'')},
  {id:'sct',title:'Scouting',views:['coach'],hint:()=>SettingsPage.nameOf(Settings.levels(),Settings.defLevel()),body:()=>SettingsPage.scout()},
  {id:'org',title:'Organiser',views:['scorer'],hint:()=>Organiser.name()||'',body:(v,p)=>p.org()},
  {id:'rul',title:'Tournament rules',views:['coach'],hint:(v,p)=>p.ruleCount()+' rule sets',body:(v,p)=>p.rules()},
  {id:'grd',title:'Grades',views:['coach'],hint:()=>'',body:(v,p)=>SettingsPage.grades(p)},
  {id:'bak',title:'Backup and transfer',views:['coach','scorer'],hint:()=>'',body:()=>SettingsPage.backup()}
    ];
  }

  /** one group as a card that opens and closes (sopen: the screen state of the open groups) */
  static box(id, title, hint, body, sopen) { return `<details class="card" ${sopen&&sopen[id]?'open':''} ontoggle="(S.sopen=S.sopen||{})['${id}']=this.open"><summary style="cursor:pointer"><b>${title}</b>${hint?` <span class="mut">\u00b7 ${Html.esc(hint)}</span>`:''}</summary><div style="margin-top:10px">${body}</div></details>`; }

  /** the whole page for a view ('coach' or 'scorer'): the groups of that view, and the card to change view */
  static page(view, parts) {
    return `<h1>Settings</h1>${SettingsPage.groups().filter(g=>g.views.includes(view)).map(g=>SettingsPage.box(g.id,g.title,g.hint(view,parts),g.body(view,parts),parts.sopen)).join('')}<div class="card"><div class="row sp"><div><b>View</b><div class="mut">${view==='coach'?'Coach view':'Score table'}</div></div><button onclick="changeView()">Change view</button></div></div>`
  }
}
