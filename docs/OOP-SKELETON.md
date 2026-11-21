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
**SetPlay**: One set: line-ups, the point log, substitutions, timeouts, five-player events, remarks. State is always replayed from the logs.

* `constructor(data, rules)`
* `score()` ({a, b})
* `isWon()` (points to win, two clear points, hard limit)
* `addPoint(team)`
* `undo()`
* `removePoints(n)`
* `state()` (positions, server, ghost rotation: asks Rotation)

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

**Backup**: Export, import and transfer of all data between devices.

* `static build()` (all data as one object)
* `static exportFile()`
* `static parse(text)` (validates a backup)
* `static apply(backup, mode)` (replace or merge)

**Settings**: The user settings of both views: theme, layout, default scout level, feedback, organiser, and which groups each view shows.

* `static get(name)`
* `static set(name, value)`
* `static groups(view)` (ids of the groups visible in a view)

**Theme**: Auto, light and dark theme.

* `static apply()`
* `static set(mode)`

**Feedback**: Flash and sound feedback on taps.

* `static enable(flash, sound)`
* `static tap()`

**Organiser**: Organiser name or logo shown on the scoresheet.

* `static name()`
* `static logo()`
* `static save(name, logo)`


### ui

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

**Crumbs**: The steps at the top of a match (Match, Roster, Toss, Line-up, Scoreboard, sets, Signatures).

* `static html(match, current)`
* `static go(match, step)`
* `static isLocked(match, step)` (editing is blocked once play has started)

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

**SettingsPage**: Builds the Settings page from the groups the current view shows.

* `static html(view)`
* `static group(id)` (one group (appearance, scouting, organiser, rules, grades, backup))


### views

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

**UiState**: Transient screen state (open pop-ups, selections, current tab). Data lives in the domain classes, never here.

* `get(name)`
* `set(name, value)`
* `reset()`

**Router**: Which view, tab and screen are shown.

* `go(tab)`
* `open(screen, params)`
* `current()`

**App**: The only entry point: index.html calls App.start().

* `static start()` (registers the service worker, picks the view, first render)
* `static view()` (the active View)
* `static changeView()` (coach view or score table)

## Decisions to take before the big moves

1. **Two data shapes.** The coach view identifies players by an id and keeps a scouting log; the score table identifies them by shirt number and keeps sets, points and substitutions. `Player`, `Roster`, `Match` and `SetPlay` want one shape. Either the classes read both saved formats (no migration of saved data), or we convert saved data once. This decides how much the domain classes can be shared.
2. **Rotation.** `curLU` (coach) and `scState` (score table) both replay a log into positions and server. One `Rotation` class is the largest single win and the highest risk.
3. **Static or instance.** Pure rules are static classes (`SubstitutionRules`); things with state are instances (`Match`, `SetPlay`, `Roster`). Say if you prefer one style everywhere.
4. **Screens.** `boardView` (19 KB) and `sheetHtml` (11 KB) are single functions. They become `Screen` classes made of smaller methods, not just moved.
5. **State.** The global `S` mixes saved data and screen state. Saved data moves to the domain classes and `Store`; screen state moves to `UiState`.

## Suggested order

1. Leaf classes: `Html`, `Fmt`, `Store`.
2. `RuleSet`, `RuleBook`, then the rules that are already shared and tested: `SubstitutionRules`, `TimeoutRules`, `Captaincy`, `CourtSides`.
3. `PieView`, `SignaturePad`, `Crumbs`, `TacticalBoard`.
4. `Settings`, `Theme`, `Feedback`, `Organiser`, `SettingsPage`, `Backup`.
5. `Player`, `Team`, `Roster`, `Tournament`, `ActionLog`, `ScoutStats`.
6. `Match`, `SetPlay`, `Lineup`, `Rotation`.
7. The screens (`CoachView`, `ScorerView` and their `Screen` classes), then `Scoresheet`.
