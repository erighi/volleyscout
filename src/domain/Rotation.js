/**
 * Rotation (domain): The two engines that replay what happened in a set into court positions, who serves and the
 * five-player (ghost) rotations. One for the coach view (replay) and one for the score table (scoreState), plus the
 * rotation of the starting positions by hand. Pure functions of plain values: no match object, no screen, no device.
 *
 * Positions are arrays of 6 player ids (null when empty), index 0 is P1 (the server), then going round P2 to P6.
 * When the team that receives wins the rally it rotates one place and serves; the server's team keeps its positions.
 * Five-player rule: zone 6 stays empty; a declaration starts a cycle of 6 side-outs, 5 real rotations and 1 ghost
 * rotation (no rotation: the serve is lost automatically, no point to the other team).
 */
class Rotation {
  /**
   * coach view: replays a set from its starting positions. Teams are 'h' (the coach's) and 'a'.
   * @param {object} inp
   *   positions: starting positions of 'h' (array of 6 or undefined)
   *   serve: 'h' or 'a' for who serves first, undefined when the set has not been started
   *   roles: {pid: role} the roles at the start (m.rs[set])
   *   declarations: five-player declarations {h: {at, lost}, a: {at}} (m.f5[set]); at is the number of rallies played
   *   subs: the substitutions of 'h' in this set: {k: rally count, out, in, r: role}
   *   points: the rallies of this set in order, 'h' when 'h' won it, else 'a'
   * @returns {{pos, serving, dots, was, rl, init, f5, gh}} pos the positions now, serving whether 'h' serves, dots the
   *   service marks per player ('g' got the serve, 'r' started serving), was who each player replaced, rl the roles now,
   *   init the positions at the start in rotation order, f5 the five-player cycle state, gh the team whose last
   *   rally was a ghost rotation (or null)
   */
  static replay(inp){let pos=[0,1,2,3,4,5].map(i=>(inp.positions||[])[i]||null),sl=[0,1,2,3,4,5],sv=inp.serve==='h',base=inp.roles||{},dots={},was={},rl={...base},pend=false,k=0,fv=inp.declarations||{},h5=false,a5=false,sH=0,sA=0,gh=null,snap=null;
    const sbs=inp.subs,add=(id,c)=>{if(id)(dots[id]=dots[id]||[]).push(c)};
    const ap=n=>sbs.filter(x=>x.k===n).forEach(x=>{const j=pos.indexOf(x.out);if(j<0)return;pos[j]=x.in;was[x.in]=(was[x.out]&&was[x.out].slice(-1)[0]===x.in)?was[x.out].slice(0,-1):[...(was[x.out]||[]),x.out];if(x.r)rl[x.in]=x.r;else if(base[x.in])rl[x.in]=base[x.in];else delete rl[x.in];if(base[x.out])rl[x.out]=base[x.out];else delete rl[x.out];
      if(j===0&&pend&&dots[x.out]&&dots[x.out].length)add(x.in,dots[x.out].pop())});
    /* Five-player rule: zone 6 stays empty. A declaration (m.f5[set].h / .a) starts a cycle of 6 side-outs: 5 real rotations and 1 ghost rotation (no rotation, the serve is lost automatically, no point to the other team). */
    const dec=n=>{
      if(fv.h&&fv.h.at===n&&!h5){const L=fv.h.lost;
        if(!L){h5=true;sH=0}
        else if(pos.includes(L)){const ini=[null,null,null,null,null,null];pos.forEach((id,j)=>{ini[sl[j]]=id});snap=ini;
          const ring=[0,5,4,3,2,1].map(i=>pos[i]).filter(id=>id&&id!==L),np=[null,null,null,null,null,null];[0,4,3,2,1].forEach((zi,j)=>{np[zi]=ring[j]||null});pos=np;h5=true;sH=0}}
      if(fv.a&&fv.a.at===n&&!a5){a5=true;sA=0}};
    ap(0);dec(0);
    if(inp.serve)add(pos[0],sv?'g':'r');
    inp.points.forEach(e=>{pend=false;gh=null;
      if(e==='h'){if(!sv){
        if(h5){sH=(sH+1)%6;if(sH===5){gh='h'}else{pos=[pos[1],pos[2],pos[3],pos[4],pos[0],null];sl=[sl[1],sl[2],sl[3],sl[4],sl[0],sl[5]];sv=true;add(pos[0],'g');pend=true}}
        else{pos=[pos[1],pos[2],pos[3],pos[4],pos[5],pos[0]];sl=[sl[1],sl[2],sl[3],sl[4],sl[5],sl[0]];sv=true;add(pos[0],'g');pend=true}}}
      else{if(sv&&a5){sA=(sA+1)%6;if(sA===5)gh='a';else sv=false}else sv=false}
      k++;ap(k);dec(k)});
    const init=[null,null,null,null,null,null];pos.forEach((id,j)=>{init[sl[j]]=id});
    return{pos,serving:sv,dots,was,rl,init:snap||init,f5:{h:h5,a:a5,sh:sH,sa:sA},gh}}

  /**
   * turns the starting positions by one rotation by hand. direction > 0 turns forward (P2 becomes P1), otherwise back.
   * five: the team plays with five players, zone 6 stays empty. A new array is returned; the list is padded to 6.
   */
  static rotatePositions(positions, direction, five) {
    const a = (positions || []).slice(0, 6);
    while (a.length < 6) a.push(null);
    return five ? (direction > 0 ? [a[1], a[2], a[3], a[4], a[0], null] : [a[4], a[0], a[1], a[2], a[3], null])
      : direction > 0 ? [a[1], a[2], a[3], a[4], a[5], a[0]] : [a[5], a[0], a[1], a[2], a[3], a[4]];
  }

  /**
   * score table: replays a set into the state of the scoresheet.
   * @param {object} inp
   *   set: the set {lu: {a, b} starting line-ups, pts: rallies won ('a' or 'b') in order, f5m: players lost, subs, tos}
   *   five: {a, b} whether each team starts with five players
   *   server: the team that serves first
   *   captain: {a, b} the game captain's number at the start (or null)
   *   teamCaptain: {a, b} the team captain's number (or null)
   * @returns {{pts, pos, srv, gh, slot, five, marks, tos, subm, starts, col, cap}} the score, the positions now,
   *   who serves, the ghost rally team, the cycle slot of each team, five-player flags, the marks of the service
   *   turns per column, the timeouts as scores, the substitution marks, the starting line-ups, the column of
   *   each player and the game captain now
   */
  static scoreState(inp){const set=inp.set,lu={a:set.lu.a.slice(),b:set.lu.b.slice()},sl={a:0,b:0},n={a:0,b:0},five={a:inp.five.a,b:inp.five.b},ev=[...(set.f5m||[]).map(e=>Object.assign({k:'f'},e)),...(set.subs||[]).map(e=>Object.assign({k:'s'},e))].sort((x,y)=>(x.q||0)-(y.q||0)),same=(x,y)=>x!=null&&String(x)===String(y);const capC={a:inp.captain.a,b:inp.captain.b},rcapS=t=>inp.teamCaptain[t],capFix=(t,p,e)=>{const on=p.filter(x=>x!=null).map(String),rc=rcapS(t);if(rc&&on.includes(rc))capC[t]=rc;else if(e&&e.cap!=null&&on.includes(String(e.cap)))capC[t]=String(e.cap);else if(!(capC[t]!=null&&on.includes(capC[t])))capC[t]=null};
    let srv=inp.server,gh=null;
    /* sheet marks: every service turn takes the first free numbered cell in the column of its server (column = the server's starting position). A turn is opened with a dot, and closed by writing the team's score in it when the serve is lost. The receiving team's first cell in column I is crossed out at the start. */
    const orig={a:set.lu.a.slice(),b:set.lu.b.slice()},used={a:{},b:{}},marks={a:{},b:{}},open={a:null,b:null},colMap={a:{},b:{}},subm={a:{},b:{}},colOf=(t,x)=>colMap[t][String(x)]||0,
      mk=(t,c,k)=>{if(!c)return{};const o=(marks[t][c]=marks[t][c]||{});return o[k]=o[k]||{}},take=(t,c)=>{used[t][c]=(used[t][c]||0)+1;return used[t][c]};
    /* substitutions: the substitute takes the column (starting position) of the player he replaces. A new substitute is written in the Player No row with the score at the change; the starter coming back only adds the second score. */
    ['a','b'].forEach(t=>orig[t].forEach((x,j)=>{if(x!=null)colMap[t][String(x)]=j+1}));
    const applySub=e=>{const p=lu[e.t],j=p.findIndex(x=>same(x,e.out));if(j<0)return;p[j]=e.inn;capFix(e.t,p,e);const c=colMap[e.t][String(e.out)];if(c)colMap[e.t][String(e.inn)]=c;
      const o=e.t==='a'?'b':'a',txt=n[e.t]+':'+n[o],rec=(subm[e.t][c]=subm[e.t][c]||{});if(orig[e.t].some(x=>same(x,e.inn)))rec.b=txt;else{rec.no=e.inn;rec.a=txt}};
    /* a team that loses a player (injury, emergency leave, red card) goes on with five: the others keep their order and fill zones 1, 5, 4, 3, 2; the cycle restarts there */
    const dec=k=>ev.forEach(e=>{if(e.at!==k)return;if(e.k==='s'){applySub(e);return}if(five[e.t])return;const p=lu[e.t];if(!p.some(x=>same(x,e.lost)))return;
      const ring=[0,5,4,3,2,1].map(j=>p[j]).filter(x=>x!=null&&!same(x,e.lost)),np=[null,null,null,null,null,null];[0,4,3,2,1].forEach((z,j)=>{np[z]=ring[j]==null?null:ring[j]});lu[e.t]=np;five[e.t]=true;sl[e.t]=0;capFix(e.t,np,e)});
    dec(0);
    {const r0=srv==='a'?'b':'a',c0=colOf(srv,lu[srv][0]),k0=take(srv,c0);mk(srv,c0,k0).dot=true;open[srv]={c:c0,k:k0};used[r0][1]=1;mk(r0,1,1).x=true}
    (set.pts||[]).forEach((w,idx)=>{gh=null;n[w]++;
      if(w!==srv){
        if(five[w]){sl[w]=(sl[w]+1)%6;if(sl[w]===5){gh=w;dec(idx+1);return}}
        {const o=open[srv];if(o)mk(srv,o.c,o.k).score=n[srv];open[srv]=null}
        const q=lu[w];lu[w]=five[w]?[q[1],q[2],q[3],q[4],q[0],null]:[q[1],q[2],q[3],q[4],q[5],q[0]];srv=w;
        {const c=colOf(w,lu[w][0]),k=take(w,c);mk(w,c,k).dot=true;open[w]={c,k}}}
      dec(idx+1)});
    const tos={a:[],b:[]};(set.tos||[]).forEach(e=>{let x=0,y=0;(set.pts||[]).slice(0,e.at).forEach(w=>{if(w==='a')x++;else y++});tos[e.t].push(e.t==='a'?x+':'+y:y+':'+x)});
    return{pts:n,pos:lu,srv,gh,slot:sl,five,marks,tos,subm,starts:orig,col:colMap,cap:capC}}
}
