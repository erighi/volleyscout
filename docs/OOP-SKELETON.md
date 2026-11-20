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

**Html**: Small helpers that build html strings: escaping, attributes, icons.

* `static esc(text)` (escapes text for html)
* `static attrs(map)` (builds an attribute string)
* `static icon(name)` (svg icons used in the screens)

**Fmt**: Formats numbers, times and scores for display (same text in both views).

* `static clock(ms)` (hh:mm from a timestamp)
* `static minutes(ms)` (mm:ss)
* `static score(a, b)` ("12 : 10")
* `static ordinal(n)` (1st, 2nd ...)
* `static today()` (today as yyyy-mm-dd)


### domain

**Player**: A player: id, shirt number, name, preferred roles in order, libero flag, captain flag.

* `constructor(data)`
* `label()` ("#12 Name" for messages and buttons)
* `isLibero()`
* `roleIn(team)` (role in a given team (roles and numbers are team level))

**Team**: A team: name, players, which one is "my team". Players can belong to several teams with a different number and role in each.

* `constructor(data)`
* `player(number)` (find by shirt number)
* `add(player)`
* `remove(id)`
* `isMine()`

**Roster**: The players of one team for one match, with the libero and captain, and whether it is complete enough to start.

* `constructor(team, rules)`
* `liberos()`
* `teamCaptain()`
* `isComplete()` (12 + liberos, captain set (limits come from the rule set))
* `sign(drawing)` (the team signs once the roster is complete)
* `isSigned()`

**RuleSet**: One rule set as a value object. Every rule is a method, so no view reads rule fields directly.

* `constructor(data)`
* `setRule(index)` ({win, hard} points for a set; the last set is the tie break)
* `timeoutsPerSet()` (replaces toLimit/ruleTO/scToMax)
* `substitutionsPerSet()`
* `fivePlayerAllowed()`
* `swapAtEight()` (teams change courts at 8 in the deciding set)
* `mvpRequired()` (each team nominates an MVP of the other team)
* `timeLimit()` (minutes, or null)
* `rosterSize()` (players and liberos)

**RuleBook**: All rule sets: built in and custom. Same book for both views.

* `static all()`
* `static get(id)`
* `static save(ruleSet)`
* `static remove(id)`
* `static builtIn()` (Local tournament, Official FIVB)

**Tournament**: A group of matches with the participating teams and a default rule set.

* `constructor(data)`
* `rules()` (default RuleSet)
* `teams()`
* `matches()`
* `add(match)`

**Match**: A match between two teams under a rule set: header data, roster per team, toss, sets, signatures, result.

* `constructor(data)`
* `setsWon(team)`
* `winner()` (null until won, forfeited or ended)
* `currentSet()`
* `nextSet()` (starts the next set (or the tie break with its own toss))
* `end(reason)` (won, time, forfeit, cancelled, suspended)
* `isFinished()`
* `resultText()`

**SetPlay**: One set: line-ups, the point log, substitutions, timeouts, five-player events, remarks. State is always replayed from the logs.

* `constructor(data, rules)`
* `score()` ({a, b})
* `isWon()` (points to win, two clear points, hard limit)
* `addPoint(team)`
* `undo()`
* `removePoints(n)`
* `state()` (positions, server, ghost rotation: asks Rotation)

**Lineup**: The six court positions and the roles: placing players, the team system (5-1, 6-2, 4-2), auto fill, the five-player layout.

* `constructor(positions, system)`
* `place(position, player)`
* `isValidFor(system)` (middles opposite each other ...)
* `suggest(position)` (who fits the active slice)
* `isFivePlayer()`

**Rotation**: Replays the point log into positions, who serves and ghost rotations. One engine for the coach and the score table.

* `static replay(lineup, points, options)` (returns the current positions and server)
* `static rotate(positions)` (clockwise)
* `static ghost(positions)` (five-player ghost rotation)

**SubstitutionRules**: Who can replace whom: pairs, return once, substitute once, libero, injury, injured players. Already shared (subRep, subWhy, libWhy, emWhy).

* `static replay(events)` (state of replacements for one team and one set)
* `static whyNot(state, out, inn, label, injured)` ("" when allowed, else the message)
* `static whyNotLibero(state, out, inn, label, injured, inIsLibero)`
* `static whyNotInjury(state, out, inn, label, injured, flags)`
* `static options(state, onCourt, pool, injured)` (allowed outs and ins (score table))

**TimeoutRules**: Timeouts: the limit comes from the rule set, both views count what a team used in the set.

* `constructor(rule)`
* `limit()`
* `used(list, team)`
* `left(list, team)`

**Captaincy**: The game captain: the team captain whenever on court, otherwise the declared one; who must be declared after a substitution or a player who cannot continue.

* `static onCourt(team, lineup, declared)` (the captain now, or null)
* `static mustDeclare(team, state, leaving, coming)` ({need, options})

**CourtSides**: Toss, first serve, court sides per set, the deciding set toss and the change of courts at 8 points.

* `constructor(match)`
* `sideOf(team, setIndex)` ("L" or "R", changes at 8 in the deciding set)
* `firstServer(setIndex)`
* `isDecidingSet(setIndex)`
* `swapPoint(setIndex)` (point count when the teams swap, or 0)

**ActionLog**: Append-only log kept with the match: what happened, when, at which score.

* `constructor(match)`
* `add(entry)`
* `text(entry)` (one line of text)
* `all()`

**ScoutStats**: Scouting: serve and skill grades, lost points, per player statistics with filters.

* `static grades(skill)`
* `static serveStats(matches, filter)`
* `static attendance(matches, filter)`
* `static lostPoints(match)`


### infra

**Store**: The only place that touches localStorage: load and save JSON by key, one key per kind of data.

* `static load(key, fallback)`
* `static save(key, value)`
* `static keys()` (all keys used by the app (for backup))

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
