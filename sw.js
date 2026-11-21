const V='vb-scout-v1.63.3';
const CORE=['./','index.html','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','css/app.css?v=1.63.3','css/sheet.css?v=1.63.3','src/base/Pending.js?v=1.63.3','src/base/Html.js?v=1.63.3','src/base/Fmt.js?v=1.63.3','src/domain/Player.js?v=1.63.3','src/domain/Team.js?v=1.63.3','src/domain/Roster.js?v=1.63.3','src/domain/RuleSet.js?v=1.63.3','src/domain/RuleBook.js?v=1.63.3','src/domain/Tournament.js?v=1.63.3','src/domain/TournamentBook.js?v=1.63.3','src/domain/Match.js?v=1.63.3','src/domain/SetPlay.js?v=1.63.3','src/domain/Lineup.js?v=1.63.3','src/domain/Rotation.js?v=1.63.3','src/domain/SubstitutionRules.js?v=1.63.3','src/domain/TimeoutRules.js?v=1.63.3','src/domain/Captaincy.js?v=1.63.3','src/domain/CourtSides.js?v=1.63.3','src/domain/ActionLog.js?v=1.63.3','src/domain/ScoutStats.js?v=1.63.3','src/infra/Store.js?v=1.63.3','src/infra/Backup.js?v=1.63.3','src/infra/Settings.js?v=1.63.3','src/infra/Theme.js?v=1.63.3','src/infra/Feedback.js?v=1.63.3','src/infra/Organiser.js?v=1.63.3','src/ui/PieView.js?v=1.63.3','src/ui/SignaturePad.js?v=1.63.3','src/ui/Crumbs.js?v=1.63.3','src/ui/TacticalBoard.js?v=1.63.3','src/ui/Scoresheet.js?v=1.63.3','src/ui/RuleEditor.js?v=1.63.3','src/ui/SettingsPage.js?v=1.63.3','src/views/Screen.js?v=1.63.3','src/views/View.js?v=1.63.3','src/views/CoachView.js?v=1.63.3','src/views/ScorerView.js?v=1.63.3','src/app/UiState.js?v=1.63.3','src/app/Router.js?v=1.63.3','src/app/App.js?v=1.63.3','src/legacy/legacy.js?v=1.63.3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
