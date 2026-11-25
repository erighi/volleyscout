/**
 * Crumbs (ui): The steps at the top of a match in the score table view, in this order: Match, Roster, Toss, Line-up,
 * then the tie-break toss, one entry per played set and the signatures when there are any, then the Scoreboard (always
 * the last step before the Scoresheet), the Scoresheet button and the Log button; and the rule about when the first
 * steps can no longer be edited. Going to a step (showStep, goStep, openMatch) changes the screen
 * state and opens screens, so it stays with the old code until the ScorerView exists.
 * Which steps are done depends on the roster and line-up checks, which the old code still owns, so the caller works
 * them out and passes `done`: the list of six flags from done(), one for each of the steps in steps().
 */
class Crumbs {
  /** the steps in order: [key, label] (the Scoresheet is the last, shown apart from the others) */
  static steps() { return [['match','Match'],['roster','Roster'],['toss','Toss'],['lineup','Line-up'],['board','Scoreboard'],['sheet','Sheet']]; }

  /** the first set has started */
  static boardStarted(m) { return !!(m.sets && m.sets.some(x => x.on)); }

  /** the six step flags of a match: Match is always done; rosterOk and lineupOk come from the roster and line-up checks; Toss when the serve is chosen; Scoreboard and Scoresheet never */
  static done(m, rosterOk, lineupOk) { return [true, rosterOk, !!(m.toss && m.toss.serve), lineupOk, false, false]; }

  /** editing the Match, Roster and Toss steps is blocked once the scoreboard was started (doneFn gives the step flags, asked only when needed) */
  static locked(m, k, doneFn) {
    if (k !== 'match' && k !== 'roster' && k !== 'toss') return false;
    return Crumbs.boardStarted(m) || doneFn().slice(4).some(Boolean);
  }

  /** the bar at the top of a match, in this order: Match, Roster, Toss, Line-up, then the tie-break toss, the sets and the signatures when there are any, then the Scoreboard (always the last step before the Scoresheet), the Scoresheet and the Log; m is null before a match exists; cur is the current step ('tbtoss', 'set0', 'sign', 'log', ...); done as from done() */
  static html(m, cur, done) {
  const steps = Crumbs.steps(), DOCIC = Html.icon('doc'), d = m ? done : steps.map(() => false), main = steps.filter(x => x[0] !== 'sheet');
  const items=main.map(([k,l],i)=>{const on=m?(i===0||d[i-1]):i===0,mark=d[i]&&m?'\u2713 ':'',lab=`<span class="cn">${i+1}</span> ${mark}${l}`;
    return`<li>${k===cur?`<span class="cr cur" aria-current="step">${lab}</span>`:on?`<button class="cr${d[i]?'':' rdy'}" onclick="goStep('${k}')">${lab}</button>`:`<span class="cr off" aria-disabled="true">${lab}</span>`}</li>`}),
    li=items.slice(0, -1).join(''), bd=items[items.length - 1];
  const sh=!m?`<span class="cr off sheetb" aria-disabled="true">${DOCIC} Scoresheet</span>`:cur==='sheet'?`<span class="cr cur sheetb" aria-current="step">${DOCIC} Scoresheet</span>`:`<button class="cr sheetb" onclick="goStep('sheet')">${DOCIC} Scoresheet</button>`;
  const ls=m&&m.sets?m.sets.map((z,i)=>(new CourtSides(m).isDecidingSet(i)?`<li>${cur==='tbtoss'?`<span class="cr cur" aria-current="step">${new CourtSides(m).decidingTossDone()?'\u2713 ':''}Tie-break toss</span>`:`<button class="cr${new CourtSides(m).decidingTossDone()?'':' rdy'}" onclick="goStep('tbtoss')">${new CourtSides(m).decidingTossDone()?'\u2713 ':''}Tie-break toss</button>`}</li>`:'')+(z&&(z.on||z.end)?`<li>${cur==='set'+i?`<span class="cr cur" aria-current="step">Set ${i+1}${z.end?' \u2713':''}</span>`:`<button class="cr" onclick="openSetView('${m.id}',${i})">Set ${i+1}${z.end?' \u2713':''}</button>`}</li>`:'')).join(''):'',
    sg=m&&m.fin?`<li>${cur==='sign'?`<span class="cr cur" aria-current="step">Signatures${m.fin.signed?' \u2713':''}</span>`:`<button class="cr${m.fin.signed?'':' rdy'}" onclick="openSign('${m.id}')">Signatures${m.fin.signed?' \u2713':''}</button>`}</li>`:'';
  return `<div class="crumbs" role="navigation" aria-label="Match steps"><ol><li><button class="cr back" onclick="tsBack()">\u2039 Matches</button></li>${li}${ls}${sg}${bd}<li class="sheetli">${sh}</li><li>${m?(cur==='log'?`<span class="cr cur" aria-current="step">Log</span>`:`<button class="cr" onclick="goStep('log')">Log</button>`):`<span class="cr off" aria-disabled="true">Log</span>`}</li></ol></div>`;
  }

  /** a step's page head: the bar, the step's title and the two team names */
  static head(m, k, done) { return `${Crumbs.html(m,k,done)}<h1 style="margin-top:10px">${Crumbs.steps().find(x=>x[0]===k)[1]}</h1><div class="mut">${Html.esc(m.a.name)} v ${Html.esc(m.b.name)}</div>`; }

  /** the page of a step that is not built */
  static soon(m, k, done) { return Crumbs.head(m,k,done)+`<div class="card"><b>Not built yet.</b><div class="mut">This step comes in a later version.</div></div>`; }

  /** a team's roster as one line: #number name (captain) (libero), or No roster. */
  static roLine(t) { return t.pl.length?t.pl.map(p=>'#'+Html.esc(p.n)+(p.name?' '+Html.esc(p.name):'')+(p.cap?' (captain)':'')+(p.lib?' (libero)':'')).join(', '):'No roster.'; }

  /** the note on a read-only page */
  static roNote(k) { return `<div class="mut">Read-only: the first set has started, so the ${k} can no longer be changed.</div>`; }

  /** "Started hh:mm" for a set that has started */
  static startedTxt(set) { return set&&set.on&&set.t0?`<small>Started ${Fmt.clock(set.t0)}</small>`:''; }

  /** scrolls the bar so that the current step is in view */
  static fit() { const ol=document.querySelector('.crumbs ol'),c=ol&&ol.querySelector('.cur');if(c)ol.scrollLeft=Math.max(0,c.offsetLeft-ol.offsetLeft-70) }
}
