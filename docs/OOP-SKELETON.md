# VolleyScout: object oriented structure

Status: **skeleton**. The app behaves exactly as before. All current code lives in `src/legacy/legacy.js`; the classes below exist with their responsibilities and method signatures, and code moves into them one piece at a time.

## Principles

* One class per file, the file is named after the class: `src/<layer>/<Class>.js`.
* The classes are shared. The coach view and the score table are two thin views (`CoachView`, `ScorerView`) that use the same domain classes, the same pies, the same settings groups and the same rules.
* `index.html` only loads the files and makes one call: `App.start();`.
* Plain script files and plain classes: no build step, no modules. Files load in layer order, so a class can only use classes loaded before it or the layers above it.

## Layers (top to bottom)

| Layer | Folder | What it holds |
|---|---|---|
| base | src/base/ | no dependencies, no browser |
| domain | src/domain/ | rules and data; never touches document or localStorage |
| infra | src/infra/ | browser services: storage, backup, settings, theme, feedback |
| ui | src/ui/ | builds html that both views share |
| views | src/views/ | thin: compose the classes for the coach view and the score table |
| app | src/app/ | start-up, routing, transient screen state |

A class may use classes of its own layer and of the layers above it, never of a layer below. `base` and `domain` never use `document`, `window`, `localStorage`, `alert` and similar.

## How code moves (one piece at a time)

1. Write the method in its class (see the proposed home of every piece in `docs/migration-map.md`).
2. In `legacy.js` replace the old function body by a one line call to the class (as already done for timeouts: `toLimit` calls `TimeoutRules`), or update its callers and delete it.
3. Run the tests: `node run-all.js` (feature checks, structure check, golden master). For rules also `OLD=<previous index.html> node fuzz_subs.js`.
4. When a piece has no callers left in `legacy.js` it is removed. When `legacy.js` is empty the file is deleted.

The first piece is already moved as a pilot: `TimeoutRules`.

## What the checks enforce (`tests/check-structure.js`)

* `index.html` has exactly one inline script, `App.start();`.
* Every file in `src/<layer>/` holds exactly one class named like the file.
* Layer order (above), the load order of the files, and `extends` targets loaded first.
* Base and domain classes never touch the browser.
* Classes never use pieces that still live in `legacy.js` (only `App` starts it); `legacy.js` may use the classes.
* No name is defined twice; every file is loaded by `index.html` and precached by `sw.js`.

## Class catalogue

### base

**Pending**: Marks a method that is designed but not moved yet; calling it fails loudly so nothing half-migrated runs silently.

* `static method(name)` (throws "<name> is not migrated yet")

**Html** (migrated in 1.60.1): Small helpers that build html strings: escaping, attributes, icons.

* `static esc(text)` (escapes text for html)
* `static attrs(map)` (builds an attribute string; false and null are left out)
* `static icon(name)` (svg icons: libero, swap, view, doc)

**Fmt** (migrated in 1.60.1): Formats numbers, times and dates for display (same text in both views).

* `static ordinal(index)` (zero based: 0 gives 1st)
* `static minutes(ms)` (countdown m:ss)
* `static today()` (yyyy-mm-dd)
* `static clock(ms)` (hh:mm)
* `static clockSeconds(ms)` (hh:mm:ss)

**Player** (migrated in 1.63.8): A player of the coach's roster as a wrapper over plain data `{id, name, prefs, teamId, also, tm: {teamId: {num, role}}, num, role, arch}`. A player can be in several teams with a different number and role in each; `num` and `role` mirror the main team's. The methods that change the player change the plain data in place.

* `static roles()`, `static numberTaken(players, teamId, num, exceptId)`, `static create(fields)`
* `data()`, `id()`, `name()`, `teamData(teamId)`, `number(teamId)`, `role(teamId)`, `view(teamId)`, `preferences()`, `isIn(teamId)`
* `freeze()`, `syncPrimary()`, `applyEdit(fields)`, `shareWith(teamId)`, `leaveTeam(teamId, tidy)` (false when it was his only team), `archive(on)`

Not part of it: the player form and role pickers, the confirmations, `canRoleEdit` (a rule about the match). The skeleton's `label()` and `isLibero()` were dropped: nothing used them (a libero is a role in a team, and the label of a player in a match is built from the line-up).
**Team** (migrated in 1.63.7): A team as a value object over plain data `{id, name, mine}` (`mine` is true for the coach's own teams, false or missing for opponents). Players belong to a team through their own data (`teamId` and `also`).

* `data()`, `id()`, `name()`, `isMine()`, `static hasMember(player, teamId)`, `hasPlayer(player)`

**TeamBook** (new in 1.63.7): The list of teams (`S.t`). Reads the live list through a function; saving stays with the caller. Removing a team does not touch its players.

* `all()`, `find(id)`, `get(id)`, `mine()`, `mineAll()`, `opponents()`, `byName(name)`
* `ensure(name)` (existing, or a new opponent), `add(name, mine)`, `rename(id, name)`, `toggleMine(id)` (returns the new state), `remove(id)`
**Roster** (migrated in 1.63.9): The players a team brings to a match and the rules that go with them. Coach view: the match roster list `{pid, name, num, role}` (a rule set can limit it to 12 players plus 2 liberos). Score table: the team list `match[team].pl` of `{n, name, lib, cap}`; a team is ready with at least 6 players (not liberos) and a captain who is not a libero, and done when it has also signed. An instance wraps a score table match.

* static: `counts(list)`, `limitProblem(list, limited)`, `compare(a, b)` (sort by shirt number, then name), `unplace(st, pid)`, `isReady(team)`, `build(rows, teamName)` (checks the editor rows: `{error}` or `{list}`)
* instance: `ready(team)`, `signed(team)`, `done(team)`, `bothReady()`, `bothDone()`, `editorRows(team)`, `replace(team, list)` (true when a signature was removed because the list changed)

Not part of it: the roster screens and their actions (`nrSel`, `nrStatus`, `luSet`, `luDel`, `luToggle`, `luGuest`, `luRow`, `luHtml`, `openRoster`, `syncRx`, `commitTeam`, `rxTeam`, `rxNext`, `saveRoster`): they read forms, ask, alert and save.
**RuleSet** (migrated in 1.60.2): One rule set as a value object over its plain data (the same plain object that is saved and copied into each match). A missing rule set behaves like an empty one.

* `data()`, `id()`, `name()`, `static blank()` (defaults of the New rule set form)
* `sets()`, `setCount()`, `setRule(index)` (coach view: sets after the last use the last set), `setLimits(index)` (score table: `{win, hard}` as numbers, 25 and 0 when not set, no clamping)
* `timeoutsPerSet()`, `substitutionsPerSet()`, `timeLimit()`, `rosterPlayers()`, `rosterLiberos()`, `rosterLimited()`
* `fivePlayerAllowed()`, `swapAtEight()`, `mvpRequired()`
* `text()` (one line summary), `editable()` (copy with defaults written in), `resizeSets(n)`, `problem(nameTaken)` (first thing wrong, as a message)

**RuleBook** (migrated in 1.60.2): All rule sets, built-in (Local tournament, Official FIVB, HVA and SADVA since 1.61.0) and custom, for both views. An instance, created with a function that gives the live list of custom rules (`new RuleBook(() => S.r)`), because a domain class cannot use `Store`; saving the list to the device stays with the caller.

* `builtIn()`, `all()` (plain data), `get(id)`, `forMatch(match)` (RuleSet)
* `nameTaken(name, exceptId)`, `problem(ruleSet)`, `save(ruleSet)`, `remove(id)`

**Tournament** (migrated in 1.63.2): A group of matches with a default rule set and, in the coach view, the teams taking part. A value object over plain data `{id, name, <ruleField>, teams?}`; the rule set id is kept in `fmt` (coach view) or `rule` (score table), so the field name is a constructor argument until the two shapes are merged. Ids are kept as they are, so a tournament made by the organiser can later be handed to a coach under the same id.

* `data()`, `id()`, `name()`, `ruleId(rules)` (the id when the rule set still exists, else ''), `rules(rules)` (RuleSet or null)
* `teams(knownTeamIds)`, `teamsWithMatches(knownTeamIds, homeTeamIds)`, `teamsAfter(teamId, on, knownTeamIds, homeTeamIds)`

**TournamentBook** (new in 1.63.2): The list of tournaments of one view (the coach list `S.tn` and the score table list `S.stt` each have one). Reads the live list through a function; saving stays with the caller.

* `all()`, `find(id)`, `get(id)`, `wrap(data)`, `sortedByName()`, `nameTaken(name, exceptId)`, `ruleId(id)`
* `create(name, ruleId, teams)`, `rename(id, name)`, `setRule(id, ruleId)` (returns the previous valid rule set id), `setTeams(id, teamIds)`, `remove(id)`
**Match** (migrated in 1.63.4, score table side): The rules of a score table match: sets won, the winner, how the match can end and who wins in each case, the MVP nominations and the signatures needed. A wrapper over the plain match data. The points of a running set are replayed from the point log elsewhere, so the caller passes `pointsOf(setIndex) -> {a, b}`.

* `static signaturesRequired()`
* `setsNeeded()`, `setsWon(team)`, `winner()`
* `finishWinner(reason)` (win, ffa, ffb, time, else none), `finishSets()`, `finishText(reason)`
* `mvpNeeded()`, `mvpDone()`

Not part of it yet: the coach view's match (its sets come from the scouted log: `tally`, `setsWon`, `matchBusy`), the match form and the ask/confirm dialogs. The coach side waits for SetPlay.
**SetPlay** (rules migrated in 1.63.12): The rules and calculations of one set, for both views, as static functions of plain match data. Coach teams are `h` and `a`; score table teams are `a` and `b`. The state of a set (positions, server) is replayed by `Rotation`. The actions that change the screen or ask the user are not part of it yet (they go with the view classes).

* coach view: `coachWinner(rule, x, y, timeLeft)`, `firstServerOf(servers, si, setCount)`, `isBusy(m, si)`, `isStarted(m, si)`, `canReset(m, si)`, `isReady(m, si)`, `viewedSet(m, viewed)`, `discard(m, si, hasTimeLimit)` (what resetting a set removes, in place)
* score table: `current(m)`, `isOpen(m, set)`, `winner(pts, win, hard)`, `forfeit(win, hard, pts, f)`, `count(set, kind, team)`, `endKey(m, i)`, `order(set)`, `canUndo(set)`, `undo(set)` (in place, returns what was undone), `removePoints(set, team, n)` (in place, returns how many)

The skeleton's `score()`, `isWon()`, `addPoint()` and `state()` were dropped: the score and state come from `Rotation.scoreState` and `Rotation.replay`, and adding a point is one line in the action.

**Lineup** (migrated in 1.63.5): The six court positions and the roles: the team system (5-1, 6-2, 4-2), which roles fit which position, auto fill, copying the previous set, the next empty position, the five-player layout. Positions are numbered 1 to 6; a list of positions is an array of 6 player ids (index 0 is P1). Constructed with the system and the roster (`new Lineup(m.sys, m.lu.h)`).

* `static patterns()`, `roleCodes()`, `roleNames()`, `slotOk(slot, code)`
* `hasSystem()`, `slots(positions)`, `static fits(slots, i, role)`, `autoFill(positions, injured)` (fills in place), `evaluate(pids)` (`off`, `incomplete`, `ok`, `bad`)
* `static fiveFromStart(f5, si)`, `fiveMidSet(f5, si)` (coach view), `fiveInSet(set, team)` (score table)
* `static complete(positions, five)`, `copyPrevious(previous, injured, five)`, `nextEmpty(positions, five)` (coach), `nextEmptyAfter(positions, p, five)` (score table)
**Rotation** (migrated in 1.63.10): The two engines that replay what happened in a set into court positions, who serves and the five-player (ghost) rotations, plus the rotation of the starting positions by hand. Pure functions of plain values (no match object); the code of the two engines is the code that was in `curLU` and `scState`, moved as it was.

* `static replay({positions, serve, roles, declarations, subs, points})` -> `{pos, serving, dots, was, rl, init, f5, gh}` (coach view; teams are `h` and `a`)
* `static scoreState({set, five, server, captain, teamCaptain})` -> `{pts, pos, srv, gh, slot, five, marks, tos, subm, starts, col, cap}` (score table: the state of the scoresheet)
* `static rotatePositions(positions, direction, five)` (by hand, a new array)

`legacy.js` keeps `curLU`, `scState` and `rotLU` as short calls that collect the values from the match (`curLU(m, si)`, `scState(m, i)`, `rotLU(d)`). The skeleton's `ghost()` was dropped: the ghost rotation is part of the replay.
**SubstitutionRules** (migrated in 1.62.2): Who can replace whom in one team in one set. Players are opaque ids; events are the team's replacements in the set: `{out, in, lib, em}`. Pure rules, no match data.

* `static replay(events)` (who replaced whom; starters who returned; substitutes who are spent; libero swaps)
* `static whyNot(state, out, inn, label, injured)`, `whyNotLibero(...)`, `whyNotInjury(...)` ("" when allowed, else the message)
* `static whyNotInjuryOut(out, label, flags)` (the part that depends on the player going out), `static canSubstitute(events, injured, out, bench, max)` (a regular substitution is possible; an exceptional substitution is only allowed when it is not, since 1.63.0)
* `static used(events)`, `static injured(events)`, `static isLiberoSwap(roleOut, roleIn)`
* `static options(events, injured, onCourt, pool, max, canLeave)` (score table: who can leave and who can enter)

**TimeoutRules**: Timeouts: the limit comes from the rule set, both views count what a team used in the set.

* `constructor(rule)`
* `limit()`
* `used(list, team)`
* `left(list, team)`

**Captaincy** (migrated in 1.63.6): The game captain in the score table: the team captain whenever he is on court, otherwise the captain declared for the set; and who must be declared when the captain leaves the court. Plain values only (roster, court numbers, declared number); numbers are compared as text.

* `static teamCaptain(players)` (number as text of the captain who is not a libero, or null)
* `static onCourt(players, court, declared)` (the game captain's number or null)
* `static mustDeclare(players, court, current, out, inn)` -> `{need, opts}`
**CourtSides** (migrated in 1.63.1): Toss, first serve, court sides per set, the deciding set toss and the change of courts at 8 points, for the score table. An instance wraps one score table match (plain data); teams are `a` and `b`, sides `L` and `R`.

* `static other(team)`, `static otherSide(side)`, `static sideName(side)`
* `static tossResult(toss)` (`{serve, sides}` or null while the steps are incomplete), `static tossText(names, result)`
* `isDecidingSet(i)`, `decidingSetStarted()`, `decidingTossDone()`
* `swapPoint(i)` (point count when a team reached 8, or 0), `swapped(i)` (courts have changed)
* `sideAtStart(team, i)`, `sideOf(team, i)` (now, with the change at 8), `firstServer(i)`

**ActionLog** (migrated in 1.63.3): The audit log of a score table match, kept in `match.alog` and never edited; undone and removed points stay in it. An entry is a plain object `{ts, set, k, ...}`; kinds: start, point, undo, remove, timeout, sub, mvp, swap, five, end, remark, fin, finreopen, sign, signed, reopen. The caller gives three labels (player, finish reason, signer name) for the text.

* `add(setIndex, fields)` (adds time and set), `all()` (live list, does not create it)
* `text(entry)`, `toText()` (whole log), `fileName()` (download name)

The coach view's own match log (`match.log`, the scouted actions) is a different thing and is not part of this class.
**ScoutStats** (migrated in 1.63.11): What scouting records and the statistics made from it, for the coach view. Pure functions of plain values; the current grade scales (`SC`, `SKX`) are state and stay in `legacy.js`.

* grades and kinds: `static grades()`, `pointTypes()`, `pointTypesHome()`, `pointTypesAway()`, `skillNames()`
* grade scales: `defaultServeGrades()`, `defaultSkillGrades()`, `normalizeServeGrades(saved)`, `applySkillGrades(skills, saved)` (in place), `scale(skill, serve, skills, keys)`
* counting and filter: `count(match, skill, grade)`, `filterMatch(match, filter, tournaments)`
* statistics: `serveCounts(sl)` (per match), `serveByPlayer(matches, players, filter, tournaments, keys)` -> `{matches, rows, all}`, `attendance(matches, players, filter, tournaments)` -> `{matches, sets, rows}`

Not part of it: the grade settings screen and its saving (`saveScale`, `resetScale`, `saveSkx`), the scouting actions that change the match log (`serve`, `advGrade`, `undo`; these belong with SetPlay), and the tables and filter form (`serveTable`, `actRow`, `lostTable`, `statsFilter`, and the html of `serveStats` and `attendStats`). The skeleton's `lostPoints(match)` was dropped: counting lost points is `count()`.

**Store** (migrated in 1.60.1): The only place that touches localStorage. Every access is guarded, so a blocked or full storage never stops the app.

* `static key(name)` and `static keys()` (the 17 storage keys by name)
* `static read(key, fallback)` / `static write(key, value)` (JSON)
* `static text(key)` / `static setText(key, value)` / `static remove(key)` (plain text values)

**Backup** (migrated in 1.64.6): Export, import and transfer of all data between devices. The backup is one JSON file (`{app:'volleyscout', v:22, exported, data}`) with the coach's matches, players, teams, rule sets and tournaments, the score table's matches and tournaments, the serve scale and the skill grades. Export shares the file where the device can, else downloads it. Import either replaces everything on the device or adds what is missing (nothing is deleted). Infra: it uses the page (file input, file reader, share sheet, download link). It works on `Library`; the serve scale and the skill grades are still kept by the old code, so they come in as parameters, and saving is done through the functions it is given (`io`).

* `static version()` (22), `build(lib, scale, skills)`, `fileName()`, `exportFile(lib, scale, skills)`, `send(text, name)`
* `static parse(text)` (the data, or `null` when the file is not a VolleyScout backup)
* `static apply(lib, data, mode, io)` (`'replace'` makes the lists match the file, any other mode adds what is missing; `io` = `{saveScorer, saveTours, setScale, setSkills, saveLists}`, called in that order), `merge(lib, data)` (teams and tournaments matched by name without case, everything else by id; players, matches and the teams of tournaments are pointed at what was already here)
* `static mode()` (the import mode chosen last, kept as given; `'replace'` at the start), `pick(mode)` (chooses it and opens the file picker), `importFile(input, apply, say, ask)` (reads the file, checks it, asks to confirm, applies, tells the result)

`legacy.js` keeps `exportData` (passes `LIB`, `SC`, `SKX`), `applyBackup` (gives `Backup.apply` the saving functions and the scale and skills code, then resets the screen state and redraws), `pickImport` and `importFile` (pass `alert`, `confirm` and `applyBackup`), (the settings group is `SettingsPage.backup`). `buildBackup`, `parseBackup` and `impMode` are gone.

**Settings** (migrated in 1.64.4): Two choices of the coach view that are remembered on the device: the scouting level (Basic or Enhanced) and the scout layout (Extended or Compact). The scouting level has a default (saved) and a level in use (the default at the start, changed from the Scout page without saving). The layout is put on the page through the `data-layout` attribute of the document. Infra: `applyLayout` touches the page. Which groups each view shows stays with the screens (`SettingsPage`, `CoachView.settingsGroups`), so the skeleton's `get`, `set` and `groups` were dropped.

* `static levels()` (`[key, label]`), `layouts()`
* `static load()` (reads the saved choices once at the start, forgets the old scouting mode key of earlier versions), `ensure()`
* `static defLevel()`, `level()`, `layout()`
* `static setLevel(k)` (in use only), `setDefLevel(k)` (saved, and in use), `setLayout(k)` (saved and applied), `applyLayout()`; anything but `'adv'` or `'compact'` gives Basic or Extended

`legacy.js` keeps `Settings.load()` at the old place, `setMode` and `setDefMode` (call, close the level menu, `render()`), `applyLayout`, `setLayout`, and `lvlHead` (see `SettingsPage`). `scoutMode`, `defMode`, `layoutMode`, `LVL` and `LAYOUTS` are gone: the code calls `Settings.level()`, `defLevel()`, `layout()`, `levels()`, `layouts()`.

**Theme** (migrated in 1.64.2): The colour theme of the device: auto (follows the device), light or dark. The choice is remembered on the device; the theme is put on the page through the `data-theme` attribute of the document and the colour of the browser bar (the `theme-color` meta tag). Infra: it may touch the document, the window and `Store`.

* `static modes()` (`[key, label]` for the choice), `mode()` (read from the device once, then in memory), `isDark()`, `apply()`, `set(mode)` (remembers, auto forgets, then applies), `start()` (applies now and follows the device's light/dark changes)

`legacy.js` keeps `applyTheme` and `setTheme` (set, then `render()`), `SET_THEMES` and `tbDark` as short calls. A device without light/dark support is treated as light.

**Feedback** (migrated in 1.64.5): The flash and the click sound when a scouting button is tapped (the buttons that call `serve(`, `advGrade(` or `point(`). The two switches (flash, sound) are remembered on the device through `Store`; both are on by default. The sound is a short beep from the Web Audio API (nothing happens where it is missing or fails); the flash is a CSS class on the button, or on the "Graded" card when the screen was redrawn and the button is gone. Infra: it listens to taps on the document and plays sound. The request for the flash travels through the screen state `S.fx`, which the screens own, so the skeleton's `enable` and `tap` were replaced by the methods below.

* `static load()` (reads the saved switches once at the start), `options()` (`{flash, sound}`), `flashOn()`, `soundOn()`, `set(k, v)` (saves)
* `static isScoutCall(onclick)`, `beep()`, `tap(e)` (beeps; gives the flash request `{k, t}`, `null` when the flash is off, or `undefined` when the tap is not a scouting button), `start(pending)` (listens to every tap before the buttons' own handlers and passes `tap`'s result on)
* `static flashClass(k)` (`fx-bad` for `--`, `fx-good` for `++`, `fx-away` for a point for the opponents, else `fx`), `flash(request)` (requests older than 1.5 s are dropped)

`legacy.js` keeps `Feedback.load()` and `Feedback.start(r=>{S.fx=r})` at the old place, `setFx` (set, then `render()`) and `applyFx` (takes `S.fx`, clears it, calls `Feedback.flash`). `fx`, `FXK`, `actx` and `clickSound` are gone; the Scouting settings group reads `Feedback.options()`.

**Organiser** (migrated in 1.64.3): The organiser of the tournament, shown in the first cell at the top of the scoresheet: the logo if there is one, otherwise the name. Name and logo are remembered on the device through `Store`. Infra: `pickLogo` uses the page (file reader, image, canvas); it reports problems through functions it is given.

* `static maxName()` (60), `maxLogo()` (`[400, 160]`), `load()` (reads the saved value once at the start; a damaged value gives an empty organiser), `data()`
* `static name()`, `logo()`, `logoOk()` (base64 data URL of a png, jpeg, webp or gif), `save()`
* `static setName(v)` (cut to 60 characters), `setLogo(dataUrl)`, `clearLogo()`
* `static scale(w, h)`, `size(w, h)` (the size an image is drawn at, at least 1 by 1), `pickLogo(input, done, fail)` (image check, scaling, png, save; `fail(message)` leaves everything unchanged)

`legacy.js` keeps `Organiser.load()` at the old place, `orgLogoOk`, `orgSetName`, `orgClearLogo` (clear, then `render()`), `orgPickLogo` (`render` and `alert` as the two functions) and `orgBody` (the settings group html, called through `settingsParts`). `ORG`, `ORGK` and `orgSave` are gone.

**PieView**: The line-up pie: geometry, slice, number, lock, replaced numbers. Already shared (pieGeom, pieSlice, pieCorner, pieSvg) with two adapters (coach, score table).

* `static svg(slices, label)`
* `static slice(geometry, options)`
* `static forCoach(match, set, options)`
* `static forScorer(team, set, options)`

**SignaturePad**: Drawing a signature and keeping it as a vector path.

* `static html(id, label)`
* `static bind()` (attach the drawing events)
* `static clear(id)`
* `static save(id)`

**Crumbs** (migrated in 1.65.0, ui): The steps at the top of a match in the score table view, in this order: Match, Roster, Toss, Line-up, then the tie-break toss, one entry per played set and the signatures when there are any, then the Scoreboard (**always the last step before the Scoresheet**, a change of 1.65.0: it used to come right after the Line-up), the Scoresheet button and the Log button; and the rule about when the first steps can no longer be edited. Which steps are done depends on the roster and line-up checks, which the old code still owns, so the caller works them out and passes `done`: the six flags from `done()`. Going to a step (`showStep`, `goStep`, `openMatch`) changes the screen state and opens screens, so it stays with the old code until `ScorerView` exists. The skeleton's `html`, `go` and `isLocked` became the methods below.

* `static steps()` (`[key, label]`), `boardStarted(m)`, `done(m, rosterOk, lineupOk)`, `locked(m, k, doneFn)` (Match, Roster and Toss are locked once the board started; `doneFn` is asked only when needed)
* `static html(m, cur, done)` (the bar; `m` is null before a match exists), `head(m, k, done)`, `soon(m, k, done)`
* `static roLine(team)`, `roNote(k)`, `startedTxt(set)`, `fit()` (scrolls the bar to the current step)

`legacy.js` keeps short calls with the old names (`STEPS`, `boardStarted`, `stepsDone`, `editLocked`, `crumbs`, `stepHead`, `stepSoon`, `roLine`, `roNote`, `startedTxt`, `fitCrumbs`, `lockedM`), the navigation (`showStep`, `goStep`, `openMatch`) and the read-only pages (`matchRO`, `rosterRO`, `tossRO`), which go with `ScorerView`. `DOCIC` is gone.

**TacticalBoard**: The white court tactical board with drawing tools.

* `static open()`
* `static close()`
* `static draw(tool)`

**Scoresheet**: The A5 landscape scoresheet built from the match data.

* `constructor(match, organiser)`
* `html()` (the whole sheet)
* `fit()` (scale to the screen and the printer)

**RuleEditor**: The form to create and edit a rule set; same form in both views.

* `static form(ruleSet)`
* `static list()` (rule sets as cards)

**SettingsPage** (migrated in 1.64.7, the first ui class): Builds the Settings page, and the small scouting level menu on the Scout page. The page is a list of groups (Appearance, Scouting, Organiser, Tournament rules, Grades, Backup and transfer); every group says in which views it is shown (`'coach'` or `'scorer'`). To show a group in another view, add that view to its list; nothing is rebuilt. The groups that live in classes read them directly (`Theme`, `Settings`, `Feedback`, `Organiser`). What the old code still owns comes in as `parts`: `{sopen, gopen, org(), rules(), ruleCount(), skills, scale(skill), glyph(grade)}`: which groups and grade lists are open (screen state), the organiser and rule set groups, the skill names, the grades of a skill and the grade symbol. The strings call the old handlers (`setTheme`, `setLayout`, `setDefMode`, `setFx`, `setMode`, `toggleLM`, `exportData`, `pickImport`, `importFile`, `saveScale`, `resetScale`, `changeView`). The skeleton's `html` and `group` became `page` and `groups`.

* `static cog()`, `layoutPick()`, `lvlHead(title, open)` (title line with the level and the cog; `open` shows the menu), `lvlMenu()`
* `static nameOf(list, key)`, `theme()`, `layout()`, `scout()`, `grades(parts)`, `backup()`
* `static groups()` (`{id, title, views, hint(view, parts), body(view, parts)}`), `box(id, title, hint, body, sopen)`, `page(view, parts)`

`legacy.js` keeps `lvlHead` (passes `!!S.lm`), `toggleLM` (changes the screen state), `settingsParts` (gives the class the screen state and the old pieces), `settingsPage`, `settingsView` (the rule form when `S.rd` is set, else the coach page) and `scorerSettings`. `COG`, `layoutPick`, `lvlMenu`, `backupHtml`, `settingsNm`, `settingsThemeHtml`, `settingsLayoutHtml`, `settingsScoutHtml`, `settingsGradesHtml`, `SETTINGS` and `settingsBox` are gone. `rulesHtml` (RuleEditor) and `orgBody` (Organiser) stay until their classes exist.

**Screen**: Base class of a screen: builds html and binds its events.

* `html()`
* `bind()`

**View**: Base class of a view (coach, score table): its tabs, its screens, the settings groups it shows.

* `tabs()`
* `screen(name)`
* `settingsGroups()`
* `render()`

**CoachView**: The coach view: teams, matches, scouting, statistics. Uses the same domain classes as the score table.

* `tabs()` (Teams, Matches, Stats, Settings)
* `settingsGroups()` (['app','sct','rul','grd','bak'])

**ScorerView**: The score table view: matches, tournaments, rules, settings, scoreboard and scoresheet.

* `tabs()` (Matches, Tournaments, Rules, Settings)
* `settingsGroups()` (['app','org','bak'])


### app

**UiState** (migrated in 1.64.0): Transient screen state: the open screen and tab, selections, open dialogs and forms, the pick in progress. Nothing here is saved and nothing here is data. Plain fields, with these methods for code that works with names.

* `static fields()` (the 46 screen state names in use, sorted), `get(name)`, `set(name, value)`, `has(name)`, `clear(name)`, `reset(names)`

**Library** (new in 1.64.0): The data the app works with, as lists: `matches`, `players`, `teams`, `rules`, `scoreMatches`, `tournaments`, `scoreTournaments`. Only data. Saving and loading stay with the caller (through `Store`).

* `static aliases()` (the old short names `m`, `p`, `t`, `r`, `sm`, `tn`, `stt` mapped to the names above), `static names()`

`legacy.js` keeps `S` as a thin alias (a Proxy) over both: `S.m`, `S.p`, `S.t`, `S.r`, `S.sm`, `S.tn` and `S.stt` read and write the Library, every other `S.x` reads and writes the UiState. It goes when the screens are classes that receive the two parts. A test (`t162.js`) fails when the code uses an `S.x` that is neither a data list nor in `UiState.fields()`.


**App** (migrated in 1.64.1): The entry point and the root of the app: it makes the two parts of the app state, the router, and knows which view the device uses and the version. `index.html` calls `App.start()`; while the screens still live in `legacy.js`, `start` hands over to them.

* `static version()` (the version shown on every screen; bump it here, in `index.html` and in `sw.js`), `versionHtml()`
* `static ui()`, `library()`, `router()` (made once; `legacy.js` takes `UI`, `LIB` and `ROUTER` from here)
* `static mode()` ('coach', 'scorer' or null; read from the device once, kept in memory), `setMode(mode)` (null forgets)
* `static navHtml(mode)` (the buttons of the navigation bar: the coach bar is the one in `index.html`, the score table's come from `ScorerView.tabs()`)

**Router** (migrated in 1.64.1): Which view, tab and screen are shown: the changes to the screen state when the user moves around. It only changes the state; `render()` and scrolling stay with the caller. Constructed with the `UiState`.

* `goCoach(tab)`, `openCoachMatch(id, hasLog)`, `goScorer(tab)`, `chooseMode(mode)`, `changeMode()`

Not part of it: `render`, `renderCoach`, `renderScorer` and `pickView` (they build the screens, which are not classes yet).
