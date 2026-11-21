# Migration map (generated)
> **Done in 1.60.1:** Html, Fmt and Store. `legacy.js` keeps one line aliases for them (`esc`, `ordn`, `fmtT`, `todayS`, `hm`, `hms`, `IC_L`, `IC_S`, `IC_V`, `DOCIC`, the key constants `K`, `PK` ... `ORGK` and the `saveP`/`saveT`/`save`/`saveR`/`saveSM`/`saveStt`/`saveTn`/`saveSkx`/`orgSave`/`tbSave` writers). They are removed when their callers are updated to call the classes directly.
>
> **Done in 1.60.2:** RuleSet and RuleBook. `legacy.js` keeps one-line aliases (`BOOK`, `BUILT`, `allRules`, `getRule`, `ruleOf`, `setRule`, `ruleText`, `ruleSub`, `ruleMin`, `rulePl`, `ruleLib`, `ruleFive`, `ruleRoster`, `swapRule`, `scSetRule`, `mvpRule`, `RD0`). The rule form screens (`ruleForm`, `syncRule`, `editRule`, `saveRule`, `delRule`, `ruleCount`) stay in legacy until `RuleEditor` is built; they now call the classes for the rules. The two views still read a set's rule differently (`setRule` clamps to the last set, `setLimits` does not); behaviour kept as it was.
>
> **Done in 1.62.2:** SubstitutionRules (the pure rules). `legacy.js` keeps one-line aliases `subRep`, `subWhy`, `libWhy`, `emWhy`, `subsUsed`, `injured`, `libSwap` and `scSubOpts`. The pieces that need the match or the screen (`subState`, `subCheck`, `libCheck`, `emCheck`, `subIn`, `subPickPid`, `pushSub`, `autoLib`, `libOut`, `libSetup`, ...) stay until the Match, Lineup and view classes exist.
>
> **Changed in 1.63.0:** an exceptional substitution (injury) is only allowed when no regular substitution is possible for the injured player (coach view; the score table has no exceptional substitution). New `regularPossible` in legacy.
>
> **Done in 1.63.1:** CourtSides. `legacy.js` keeps one-line aliases `SIDE`, `oppT`, `oppS`, `tossRes`, `tossText`, `isTB`, `tbSwapAt`, `tbSwapped`, `tbTossOk`, `tbLocked`, `sideOfT`, `sideNow` and `serveOfT`. The toss screen (`openToss`, `tsLk`, `tsWin`, `tsPick`, `tsOther`, `tsBack`, `tsClear`, `tsSave`, `tossLine`), `sideInfo` and `tcol` stay with the screens.
>
> **Done in 1.63.2:** Tournament and the new TournamentBook (coach list `TNB`, score table list `STB`). `legacy.js` keeps one-line aliases `newTn`, `tnTeams`, `tnTeamIds`, `setTnTeam`, `tnFmt`, `setTnFmt`, `renameTn`, `delTn`, `sttOf`, `sttRule` and the list sorting; the forms and lists (`tnPick`, `addTn`, `tnAddMatch`, `setTn`, `tnOpts`, `newStt`, `editStt`, `syncStt`, `sttRulePick`, `saveSttForm`, `delStt`, `sttForm`, `sttList`, `bySt`) stay with the screens. `matchBusy` is a rule about a match and waits for the Match class. Future: the organiser's tournaments should be importable by the coach; the two shapes (`fmt` and `rule`) are merged then.
>
> **Done in 1.63.3:** ActionLog (the score table's audit log in `match.alog`). `legacy.js` keeps one-line aliases `scLog`, `scLogTxt`, `scLogText` and a helper `scLogger(m)` that gives the class its three labels; the log screen and its buttons (`openLog`, `logView`, `lgCopy`, `lgDownload`) stay with the screens.
>
> **Done in 1.63.4:** Match, score table side (the pure rules). `legacy.js` keeps one-line aliases `scSetsWon`, `scMatchWinner`, `scFinWinner`, `scFinSets`, `scFinTxt`, `mvpNeeded`, `mvpDone`, `FINREQ` and a helper `scM(m)` that gives the class the running set points. Still in legacy: the coach match pieces (`tally`, `setsWon`, `matchBusy`, `finish`, `addMatch`, `del`), the match form (`HDF`, `HD0`, `SX0`, `newSM`, `editSM`, `syncSx`, `smTnPick`, `newSMT`, `sxCancel`, `saveSMatch`, `delSMatch`, `smForm`) and the dialogs (`scRem*`, `scFinAsk`, `scFinPick`, `scFinCancel`, `scFinConfirm`, `scFinReopen`, `scFinish`, `scMvp`, `mvpTxt`).
>
> **Done in 1.63.5:** Lineup (the pure rules). `legacy.js` keeps one-line aliases `SYSP`, `RC`, `RN`, `slotOk`, `lineupOf`, `sysSlots`, `sysFit`, `autoFill`, `sysEval`, `f5s`, `f5Mid`, `f5`, `lineupDone`; `setPos`, `copyPrev` and `bpPlace` call the class for their calculations. Still in legacy: `sysCheck` (the check card), `setSys`, `setServe`, `pickPos`, `setPos`, `copyPrev`, `setFive`, `declF5`, `openLineup`, `bpPick`, `bpFive`, `bpPlace`, `bpClear` (they change the match or the screen).
>
> **Done in 1.63.6:** Captaincy. `legacy.js` keeps one-line aliases `rcapOf`, `capNum` and `scCapNeed`; `bpCap` (it records the declared captain and moves on in the line-up screen) stays.
>
> **Done in 1.63.7:** Team and the new TeamBook (`TMB`, over `S.t`). `legacy.js` keeps one-line aliases `myTeam`, `myTeams`, `inTeam`, `teamByName`, `ensureTeam`; `addTeam`, `toggleMine`, `renameTeam` and `delTeam` call the class for the list changes (`delTeam` still moves or removes the team's players in legacy until Roster and Player exist). `openTeam` stays with the screens. `tmOf` was listed under Team but is about a match's `tm` data, not about teams; it stays in legacy. Note: `ensureTeam` and `addTeam` make ids in two slightly different formats (with and without a random part); kept as it was.
>
> **Done in 1.63.8:** Player. `legacy.js` keeps one-line aliases `ROLES`, `pTm`, `pNum`, `pRole`, `tv`, `prefsOf`, `freezeTm`, `syncPrimary`; `savePlayer`, `shareIn`, `archivePlayer`, `delPlayer` and `delTeam` call the class for the changes to the player data. Still in legacy: `prefSlots`, `pfChg`, `roleOptsHtml`, `editPlayer` (screens and form), `canRoleEdit` (a match rule), `RC` and `RN` (these belong to Lineup and are already aliases). Note: deleting a team leaves an empty list of other teams on the players who stay (`also: []`), while removing one player from a team deletes the list; kept as it was.
>
> **Done in 1.63.9:** Roster. `legacy.js` keeps one-line aliases `cnt`, `over`, `unplace`, `teamSigned`, `teamDone`, `rosterDone`, `teamReady`, `rosterReady`, `rxSide`; `commitTeam` uses `Roster.build` and `replace`, and the player lists use `Roster.compare` for the sort. The roster screens and their actions stay in legacy (they read forms, ask, alert and save). Note: the coach view's roster limit is fixed at 12 players and 2 liberos (`Roster.limitProblem`), while the score table takes the limits from the rule set (`RuleSet.rosterPlayers`, `rosterLiberos`); kept as it was.
>
> **Done in 1.63.10:** Rotation (the two replay engines). `curLU`, `scState` and `rotLU` stay in `legacy.js` as short functions that collect the values from the match and call the class; the engines' code was moved as it was. `SetPlay` and `ScoutStats` are what is left.
>
> **Done in 1.63.11:** ScoutStats. `legacy.js` keeps one-line aliases `T`, `TH`, `TA`, `SCDEF`, `SKN`, `SKXDEF`, `setSkx`, `gScale`, `actCount`, `fOk`; the grade scales load through `normalizeServeGrades`, and `serveStats`, `attendStats` and `serveTable` take their numbers from the class and keep only the html. Still in legacy: the grade settings (`saveScale`, `resetScale`, `saveSkx`), the scouting actions (`serve`, `advGrade`, `undo`: they change the match log, so they go with SetPlay), `actRow`, `lostTable`, `statsFilter`. Only `SetPlay` is left.

Where every piece of the current code (`src/legacy/legacy.js`) would go. This is a **proposal**: edit the lists in `classify.js` (or tell me) and it is regenerated.

* 552 pieces, 238 KB in total. 481 are placed by name, 71 are screens or actions placed only by position and need a decision (marked **decide**).
* Layers, top to bottom: base, domain, infra, ui, views, app. A class only uses classes of its own layer or the layers above it.

| Class | Layer | Pieces | KB | Decide |
|---|---|---:|---:|---:|
| Pending | base | 0 | 0.0 | 0 |
| Html | base | 5 | 1.1 | 0 |
| Fmt | base | 5 | 0.6 | 0 |
| Player | domain | 19 | 4.7 | 0 |
| Team | domain | 11 | 1.5 | 0 |
| Roster | domain | 21 | 7.6 | 0 |
| RuleSet | domain | 10 | 0.6 | 0 |
| RuleBook | domain | 7 | 1.3 | 0 |
| Tournament | domain | 28 | 7.5 | 0 |
| Match | domain | 37 | 10.1 | 0 |
| SetPlay | domain | 48 | 12.3 | 0 |
| Lineup | domain | 23 | 6.1 | 0 |
| Rotation | domain | 3 | 5.8 | 0 |
| SubstitutionRules | domain | 27 | 8.2 | 0 |
| TimeoutRules | domain | 7 | 0.6 | 0 |
| Captaincy | domain | 4 | 0.9 | 0 |
| CourtSides | domain | 24 | 3.3 | 0 |
| ActionLog | domain | 7 | 4.4 | 0 |
| ScoutStats | domain | 24 | 12.9 | 0 |
| Store | infra | 47 | 2.5 | 0 |
| Backup | infra | 7 | 4.0 | 0 |
| Settings | infra | 13 | 1.7 | 0 |
| Theme | infra | 4 | 0.6 | 0 |
| Feedback | infra | 7 | 1.6 | 0 |
| Organiser | infra | 6 | 1.6 | 0 |
| PieView | ui | 15 | 8.7 | 0 |
| SignaturePad | ui | 13 | 4.9 | 0 |
| Crumbs | ui | 17 | 5.1 | 0 |
| TacticalBoard | ui | 19 | 6.8 | 0 |
| Scoresheet | ui | 7 | 12.5 | 0 |
| RuleEditor | ui | 6 | 6.3 | 0 |
| SettingsPage | ui | 14 | 6.5 | 0 |
| Screen | views | 0 | 0.0 | 0 |
| View | views | 0 | 0.0 | 0 |
| CoachView | views | 47 | 46.8 | 45 |
| ScorerView | views | 25 | 35.6 | 24 |
| UiState | app | 0 | 0.0 | 0 |
| Router | app | 0 | 0.0 | 0 |
| App | app | 15 | 3.1 | 0 |

## By class

### Html (base, 1.1 KB)
Small helpers that build html strings: escaping, attributes, icons.

IC_L, IC_S, IC_V, esc, DOCIC


### Fmt (base, 0.6 KB)
Formats numbers, times and scores for display (same text in both views).

ordn, fmtT, todayS, hm, hms


### Player (domain, 4.7 KB)
A player: id, shirt number, name, preferred roles in order, libero flag, captain flag.

ROLES, pTm, pNum, pRole, tv, prefsOf, freezeTm, syncPrimary, prefSlots, pfChg, roleOptsHtml, savePlayer, shareIn, editPlayer, archivePlayer, delPlayer, RC, RN, canRoleEdit


### Team (domain, 1.5 KB)
A team: name, players, which one is "my team". Players can belong to several teams with a different number and role in each.

myTeam, myTeams, inTeam, tmOf, teamByName, ensureTeam, addTeam, openTeam, toggleMine, renameTeam, delTeam


### Roster (domain, 7.6 KB)
The players of one team for one match, with the libero and captain, and whether it is complete enough to start.

nrSel, nrStatus, luSet, unplace, luDel, luToggle, luGuest, luRow, luHtml, teamSigned, teamDone, rosterDone, rxNext, rxSide, openRoster, syncRx, commitTeam, rxTeam, saveRoster, teamReady, rosterReady


### RuleSet (domain, 0.6 KB)
One rule set as a value object. Every rule is a method, so no view reads rule fields directly.

getRule, ruleOf, ruleText, ruleSub, ruleMin, rulePl, ruleLib, swapRule, scSetRule, mvpRule


### RuleBook (domain, 1.3 KB)
All rule sets: built in and custom. Same book for both views.

BUILT, allRules, copy, setRule, ruleCount, saveRule, delRule


### Tournament (domain, 7.5 KB)
A group of matches with the participating teams and a default rule set.

TNK, saveTn, newTn, tnTeams, tnTeamIds, setTnTeam, matchBusy, tnFmt, tnPick, setTnFmt, addTn, tnAddMatch, renameTn, delTn, setTn, tnOpts, sttOf, sttRule, STD0, newStt, editStt, syncStt, sttRulePick, saveSttForm, delStt, sttForm, sttList, bySt


### Match (domain, 10.1 KB)
A match between two teams under a rule set: header data, roster per team, toss, sets, signatures, result.

addMatch, finish, del, tally, setsWon, HDF, HD0, SX0, newSM, editSM, syncSx, smTnPick, newSMT, sxCancel, saveSMatch, delSMatch, smForm, scSetsWon, scMatchWinner, scRemAsk, scRemWho, scRemCancel, scRemConfirm, FINREQ, mvpNeeded, mvpDone, mvpTxt, scMvp, scFinTxt, scFinWinner, scFinSets, scFinAsk, scFinPick, scFinCancel, scFinConfirm, scFinReopen, scFinish


### SetPlay (domain, 12.3 KB)
One set: line-ups, the point log, substitutions, timeouts, five-player events, remarks. State is always replayed from the logs.

rallyDone, setWin, point, autoServe, setPd, endSet, note, curSet, setReady, startSet, setStarted, clearSet, setBusy, canResetSet, resetSet, resetBtn, reopenSet, reopenBtn, bset, startSetS, scSc, scWinner, scCnt, scEKey, scEndAsk, scFfResult, scSetEndAsk, scSetFfPick, scSetFfCancel, scSetFfMatch, scSetFfConfirm, scEndCancel, scEndConfirm, scReopen, scNextSet, scQ, scSub, scRemoveAsk, scRemoveN, scRemoveCancel, scRemoveConfirm, scRemove, scTo, scLeave, scPt, scCanUndo, scSwapOk, scUndo


### Lineup (domain, 6.1 KB)
The six court positions and the roles: placing players, the team system (5-1, 6-2, 4-2), auto fill, the five-player layout.

f5s, f5Mid, setSys, setServe, pickPos, setPos, copyPrev, setFive, declF5, SYSP, slotOk, sysSlots, sysFit, autoFill, sysEval, sysCheck, f5, lineupDone, openLineup, bpPick, bpFive, bpPlace, bpClear


### Rotation (domain, 5.8 KB)
Replays the point log into positions, who serves and ghost rotations. One engine for the coach and the score table.

curLU, rotLU, scState


### SubstitutionRules (domain, 8.2 KB)
Who can replace whom: pairs, return once, substitute once, libero, injury, injured players. Already shared (subRep, subWhy, libWhy, emWhy).

subsUsed, subOpen, subPickPid, sbRole, subOut, pnp, subRep, subWhy, libWhy, emWhy, subState, roleIn, injured, emCheck, subCheck, libCheck, subIn, libsOf, alOf, setAL, libSwap, pushSub, autoLib, libOut, libSetup, scSubMax, scSubOpts


### TimeoutRules (domain, 0.6 KB)
Timeouts: the limit comes from the rule set, both views count what a team used in the set.

toLimit, toUsed, toLeft, ruleTO, callTO, scToMax, scToLeft


### Captaincy (domain, 0.9 KB)
The game captain: the team captain whenever on court, otherwise the declared one; who must be declared after a substitution or a player who cannot continue.

rcapOf, capNum, scCapNeed, bpCap


### CourtSides (domain, 3.3 KB)
Toss, first serve, court sides per set, the deciding set toss and the change of courts at 8 points.

SIDE, oppT, oppS, tossRes, tossText, tossLine, openToss, tsLk, tsWin, tsPick, tsOther, tsBack, tsClear, tsSave, isTB, tbSwapAt, tbSwapped, tbTossOk, tbLocked, sideOfT, sideNow, serveOfT, tcol, sideInfo


### ActionLog (domain, 4.4 KB)
Append-only log kept with the match: what happened, when, at which score.

scLog, scLogTxt, scLogText, openLog, logView, lgCopy, lgDownload


### ScoutStats (domain, 12.9 KB)
Scouting: serve and skill grades, lost points, per player statistics with filters.

T, TH, TA, SCDEF, SC, SKN, SKXDEF, SKX, setSkx, saveSkx, gScale, saveScale, resetScale, serve, undo, serveTable, advGrade, actRow, actCount, lostTable, serveStats, statsFilter, fOk, attendStats


### Store (infra, 2.5 KB)
The only place that touches localStorage: load and save JSON by key, one key per kind of data.

K, PK, TK, THK, saveP, saveT, save, SK, SKXK, GRK, RK, saveR, TBK, TBC, tbSave, MDK, ADVK, DMK, LYK, FXK, APPK, SCK, saveSM, STK, saveStt, ORGK, orgSave

20 start-up statement(s) (loading saved data, event listeners).


### Backup (infra, 4.0 KB)
Export, import and transfer of all data between devices.

buildBackup, exportData, parseBackup, applyBackup, impMode, pickImport, importFile


### Settings (infra, 1.7 KB)
The user settings of both views: theme, layout, default scout level, feedback, organiser, and which groups each view shows.

defMode, scoutMode, setMode, setDefMode, LVL, COG, layoutMode, applyLayout, setLayout, LAYOUTS

3 start-up statement(s) (loading saved data, event listeners).


### Theme (infra, 0.6 KB)
Auto, light and dark theme.

themeMode, applyTheme, setTheme, SET_THEMES


### Feedback (infra, 1.6 KB)
Flash and sound feedback on taps.

fx, setFx, actx, clickSound, applyFx

2 start-up statement(s) (loading saved data, event listeners).


### Organiser (infra, 1.6 KB)
Organiser name or logo shown on the scoresheet.

ORG, orgLogoOk, orgSetName, orgClearLogo, orgPickLogo, orgBody


### PieView (ui, 8.7 KB)
The line-up pie: geometry, slice, number, lock, replaced numbers. Already shared (pieGeom, pieSlice, pieCorner, pieSvg) with two adapters (coach, score table).

pieBox, ANG, RL, scoutPie, lockIcon, PIE_R, PIE_C, PIE_F, pieGeom, pieCorner, pieSlice, pieSvg, pie, spie, scSubMarks


### SignaturePad (ui, 4.9 KB)
Drawing a signature and keeping it as a vector path.

SGW, SGH, sigSvg, sgPad, sgBind, sgClear, sgRedo, sgSave, scSignName, sgStartE, sgCancelE, sgSaveE, signPad


### Crumbs (ui, 5.1 KB)
The steps at the top of a match (Match, Roster, Toss, Line-up, Scoreboard, sets, Signatures).

STEPS, boardStarted, stepsDone, editLocked, crumbs, showStep, goStep, stepHead, stepSoon, roLine, roNote, matchRO, rosterRO, tossRO, lockedM, startedTxt, fitCrumbs


### TacticalBoard (ui, 6.8 KB)
The white court tactical board with drawing tools.

TB, tbEl, tbDark, tbIc, tbHome, tbDefault, tbLoad, tbKey, openTB, closeTB, tbInk, tbTok, tbDraw, tbBind, tbTool, tbCol, tbUndo, tbClear, tbReset


### Scoresheet (ui, 12.5 KB)
The A5 landscape scoresheet built from the match data.

sheetHtml, openSheet, sheetView, fitPt, fitNames, fitRight, fitSheet


### RuleEditor (ui, 6.3 KB)
The form to create and edit a rule set; same form in both views.

rulesHtml, RD0, newRule, editRule, syncRule, ruleForm


### SettingsPage (ui, 6.5 KB)
Builds the Settings page from the groups the current view shows.

layoutPick, lvlHead, lvlMenu, backupHtml, settingsNm, settingsThemeHtml, settingsLayoutHtml, settingsScoutHtml, settingsGradesHtml, SETTINGS, settingsBox, settingsPage, settingsView, scorerSettings


### CoachView (views, 46.8 KB)
The coach view: teams, matches, scouting, statistics. Uses the same domain classes as the score table.

**decide** (screens and actions placed by position): G, S, pnum, libCard, togglePM, panelBox, subLog, subCard, homePts, lockBtns, serveGate, gateBtns, serveCard, compactTop, toReport, toBoxes, elapsed, timeLeft, toggleTimer, byNum, snap, get, sc, target, go, open_, endPopup, cnt, over, setDate, setFmt, rosterView, reAuto, setSetView, f5Card, pastSetView, listPick, sideList, setView, tabsHtml, listView, toggleLM, matchView, teamsView, statsView

2 start-up statement(s) (loading saved data, event listeners).


### ScorerView (views, 35.6 KB)
The score table view: matches, tournaments, rules, settings, scoreboard and scoresheet.

**decide** (screens and actions placed by position): rosterViewS, scorerMatches, tossView, openMatch, libLine, openBoard, lineupView, openSign, signView, openSetView, scSetView, scPn, scSubAsk, scSubPick, scSubCancel, scSubConfirm, scToAsk, scToCancel, scToConfirm, scLvOpen, scLvWho, scLvBack, scLvReason, boardView

1 start-up statement(s) (loading saved data, event listeners).


### App (app, 3.1 KB)
The only entry point: index.html calls App.start().

VER, renderCoach, appMode, NAV_COACH, NAV_SCORER, setApp, changeView, goS, pickView, renderScorer, render

4 start-up statement(s) (loading saved data, event listeners).

