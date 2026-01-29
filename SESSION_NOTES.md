# Zombie Clicker - Development Session Notes

> **IMPORTANT FOR CLAUDE**: Read this file at the start of each session to understand the project context and continue development seamlessly.

---

## Project Overview

**Project Name**: Zombie Apocalypse Survivor
**Type**: Web-based clicker/idle game
**Purpose**: College project for user's son
**Location**: `C:\Users\david\zombie-clicker\`
**Live URL**: https://devist8uk.github.io/zombie-clicker/
**GitHub Repo**: https://github.com/devist8uk/zombie-clicker
**Owner**: devist8uk (David Ashton)

---

## Tech Stack

- **HTML5** - Single page (`index.html`)
- **CSS3** - All styles in `style.css` (~3000 lines)
- **Vanilla JavaScript** - All logic in `game.js` (~2900 lines)
- **No frameworks/libraries** - Pure HTML/CSS/JS
- **Storage**: localStorage for save/load
- **Audio**: Web Audio API for procedural sounds (no audio files)
- **Hosting**: GitHub Pages

---

## Current Version

**v1.0.0** (Build 2026.01.29)

Version system is implemented in `game.js` with:
- `VERSION` object with major/minor/patch/build
- `CHANGELOG` array for version history
- Version display in bottom-left corner (clickable for changelog modal)
- Console logging on game start

---

## Features Implemented

### Core Gameplay
- [x] Click zombie to earn kills (currency)
- [x] Floating damage numbers on click
- [x] Critical hits (base 5% chance, 10x damage)
- [x] Zombie changes randomly (20% chance per click)
- [x] Auto-save every 30 seconds
- [x] Manual save button
- [x] Reset game button (with confirmation)

### Upgrades System
- [x] **Weapons** (click power): Baseball Bat, Machete, Shotgun, Flamethrower, Minigun, Rocket Launcher
- [x] **Survivors** (auto-kill): Scared Civilian, Militia Member, Army Veteran, Special Forces, Zombie Hunter, One-Man Army
- [x] Exponential cost scaling (base * 1.15^owned)
- [x] Prestige cost reduction bonus applies

### Locations (7 total)
Each location has: unique background gradient, themed emoji decorations, weather effects, zombie bonus multiplier, special zombie types

| Location | Unlock Kills | Bonus | Weather |
|----------|-------------|-------|---------|
| Abandoned Suburbs | 0 | 1.0x | Rain |
| Overrun Hospital | 1K | 1.25x | Fog |
| Dead Mall | 10K | 1.5x | Dust |
| Military Base | 50K | 2.0x | Storm + Lightning |
| Research Lab | 100K | 2.5x | Toxic bubbles |
| Gates of Hell | 500K | 3.0x | Embers |
| The Void | 1M | 4.0x | Shooting stars |

### Weather Effects System
Implemented in `startWeatherEffects()` function with:
- Rain drops (CSS animation)
- Fog layers (drifting)
- Dust particles (floating)
- Storm (heavy rain + lightning flashes + thunder sound)
- Toxic bubbles (rising)
- Embers (rising with glow)
- Shooting stars

### Day/Night Cycle
- `gameState.timeOfDay` cycles 0-100
- Updates every 2 seconds
- Affects screen brightness and color overlay
- Dawn (warm) → Day (bright) → Dusk (orange) → Night (dark blue)

### Boss Battles
- Random spawn chance after kills
- Boss types: Mega Zombie, Zombie Hulk, Infected Giant, Abomination, Necrotic Titan
- Health bar display
- Timer countdown (30 seconds base + prestige bonus)
- Defeat for kill rewards
- Fail = boss escapes, no reward

### Wave Events
- Random spawn chance
- Kill target within time limit
- 2x multiplier during waves
- Bonus rewards on completion

### Prestige System (6 Tiers, 21 Upgrades)
Requires 100K total kills to prestige. Points = sqrt(totalKills / 100,000)

**Tier 1** (no requirement):
- Enhanced Strength (+10% click, max 20)
- Automation Boost (+10% auto, max 20)
- Critical Training (+1% crit chance, max 15)

**Tier 2** (requires 10 points spent):
- Critical Mastery (+25% crit damage, max 10)
- Bargain Hunter (-3% costs, max 10)
- Sleepless Army (+10% offline, max 10)

**Tier 3** (requires 25 points spent):
- Boss Hunter (+15% boss damage, max 10)
- Wave Warrior (+10% wave rewards, max 10)
- Extended Time (+3s timers, max 5)

**Tier 4** (requires 50 points spent):
- Head Start (+5K starting kills, max 10)
- Prestige Master (+5% prestige points, max 10)
- Combo Enhancer (+5% combo effectiveness, max 10)

**Tier 5** (requires 100 points spent):
- Lucky Charm (+0.1% golden zombie chance, max 10)
- Golden Greed (+50% golden rewards, max 5)
- Daily Dedication (+25% daily rewards, max 5)

**Tier 6** (requires 200 points spent):
- Golden Touch (+2% all multipliers, max 10)
- Ascension (+1% per prestige count, max 10)
- Infinity Shard (+50% all power, max 3)

### Combo System
- Click within 400ms to build combo
- Max bonus: +25% at 100 combo (nerfed from original +100% at 50)
- Prestige "Combo Enhancer" can boost further
- Visual combo counter above zombie
- Color tiers based on combo level

### Golden Zombies
- 0.5% base spawn chance (+ prestige bonus)
- Lasts 3 seconds only
- 10x rewards (+ prestige Golden Greed bonus)
- Special golden glow animation
- Crown emoji (👑)

### Daily Rewards
- Checks on game load
- Streak system (consecutive days)
- Reward = (1000 + streak × 500) × prestige daily multiplier
- 24-48 hour window to maintain streak

### Achievements (65+ total)
Categories:
- Kill milestones (100 to 10M)
- Click milestones
- Critical hit milestones
- Upgrade milestones
- Boss/Wave milestones
- Prestige milestones
- Location unlocks
- Combo achievements (10x, 25x, 50x, 100x)
- Golden zombie achievements (1, 10, 50)
- Daily streak achievements (3, 7, 30 days)

### UI Features
- **Side Panel** with 4 tabs (Locations, Prestige, Stats, Achievements)
- Toggle with Menu button or 'M' key
- Non-blocking side notifications (slide in from right, auto-dismiss)
- Milestone popups converted to side notifications
- Moving/morphing zombie target (changes position, size, shape)
- Blood splatter effects on click
- Particle effects system
- Screen shake on critical hits
- Vignette effect (stronger during events)
- Power glow based on kills per click

### Keyboard Support
- **Space/Enter**: Click zombie
- **M**: Toggle side panel
- **S**: Toggle sound
- **1-4**: Switch panel tabs

### Sound System
All procedural using Web Audio API:
- Click sound
- Critical hit sound
- Purchase sound
- Milestone sound
- Achievement sound
- Boss appear/hit/defeat sounds
- Wave start/end sounds
- Combo sound (every 10 combo)
- Golden zombie sound
- Daily reward sound
- Thunder sound (storm weather)

### Responsive Design
Breakpoints:
- Large Desktop: 1400px+
- Desktop: 900px - 1400px
- Tablet: 768px - 900px
- Mobile: 400px - 768px
- Small Mobile: < 400px
- Landscape mobile support

Accessibility:
- `prefers-reduced-motion` support
- Touch device optimizations
- Print stylesheet

---

## File Structure

```
C:\Users\david\zombie-clicker\
├── index.html      # Main HTML structure
├── style.css       # All CSS (~3000 lines)
├── game.js         # All JavaScript (~2900 lines)
├── README.md       # Project documentation
└── SESSION_NOTES.md # This file (for Claude context)
```

---

## Key Code Locations

### game.js Structure
1. **VERSION** & **CHANGELOG** - Lines 1-100
2. **SoundManager** - Sound system object
3. **zombieTypes** - Array of zombie emojis/names
4. **locations** - Array of 7 location objects
5. **upgrades** - Weapons and survivors arrays
6. **milestones** - Kill milestone definitions
7. **achievements** - All achievement definitions
8. **prestigeUpgrades** - 21 prestige upgrade definitions
9. **gameState** - Central state object
10. **DOM elements** - Element references
11. **Location functions** - getCurrentLocation, switchLocation, applyLocationTheme, etc.
12. **Weather functions** - startWeatherEffects, startRain, startFog, etc.
13. **Day/Night functions** - updateDayNightCycle
14. **Screen effects** - updateScreenEffects, createBloodSplatter
15. **Combo functions** - updateCombo, decayCombo, updateComboDisplay
16. **Golden zombie functions** - checkGoldenZombieSpawn, spawnGoldenZombie, clickGoldenZombie
17. **Daily reward functions** - checkDailyReward, giveDailyReward
18. **Keyboard functions** - setupKeyboardControls
19. **Critical hit functions** - rollCritical, getCriticalDamage
20. **Damage functions** - getEffectiveClickPower, getEffectiveAutoPower
21. **Notification functions** - showNotification, showSideNotification
22. **Side panel functions** - toggleSidePanel, switchTab, renderLocationsTab, etc.
23. **Target movement** - startTargetMovement, moveTarget, morphTarget
24. **Prestige functions** - calculatePrestigePoints, doPrestige, calculatePrestigeBonuses
25. **Event functions** - spawnBoss, damageBoss, startWave, etc.
26. **Click handler** - onZombieClick (main game loop)
27. **Shop functions** - renderUpgrades, buyUpgrade, getUpgradeCost
28. **Save/Load** - saveGame, loadGame
29. **Init** - init() function at bottom

### style.css Structure
1. Reset & Base styles
2. Game container grid layout
3. Header styles
4. Click section & zombie target
5. Floating numbers
6. Stats section
7. Shop section
8. Footer
9. Milestone popups
10. Modal overlays
11. Achievement styles
12. Prestige button & modal
13. Boss/Wave event displays
14. Location styles
15. Particle effects
16. Side notifications
17. Side panel & tabs
18. Weather effects
19. Day/night CSS variables
20. Screen effects (vignette, glow)
21. Blood splatter
22. Combo display
23. Golden zombie styles
24. Version display & changelog modal
25. Responsive breakpoints (multiple @media queries)

---

## Known Issues / Future Improvements

### Potential Phase 6 Features (Not Implemented)
- Story mode with narrative progression
- Mini-games (quick-time events, target practice)
- More prestige tiers if needed
- Seasonal events
- More zombie types per location
- Boss rush mode
- Endless wave mode

### Possible Improvements
- Add more sound variety
- Add background music option
- Add more visual feedback for events
- Add statistics graphs
- Add export/import save feature
- Add more achievements
- Add leaderboard (would need backend)

---

## GitHub Deployment

**Repository**: https://github.com/devist8uk/zombie-clicker
**GitHub Pages**: Enabled on `master` branch, root folder
**Live URL**: https://devist8uk.github.io/zombie-clicker/

### To Deploy Updates
```bash
cd "C:\Users\david\zombie-clicker"
git add .
git commit -m "Description of changes"
git push origin master
```

GitHub Pages auto-rebuilds in ~30 seconds.

### GitHub CLI Location
`"C:\Program Files\GitHub CLI\gh.exe"`

User is authenticated as `devist8uk`.

---

## User Preferences Noted

- User prefers Claude to do as much as possible automatically
- User wants non-blocking UI (side notifications, not modal popups)
- User wanted more background emojis with varied sizes
- User wanted side panel instead of modal popups for menus
- User wanted combo system nerfed (was too powerful)
- User wanted expanded prestige system (more tiers, more grinding)
- User's son is the one submitting this for college
- User has the app minimized, may continue tomorrow

---

## Session History Summary

### What We Built (in order)
1. Basic clicker mechanics
2. Upgrades (weapons & survivors)
3. Sound system (Web Audio API)
4. Milestones & achievements
5. Critical hit system
6. Statistics tracking
7. Boss battles
8. Wave events
9. Prestige system with upgrade tree
10. Locations with themed backgrounds
11. Particle effects & screen shake
12. Themed visual backgrounds (emojis per location)
13. Non-blocking side notifications
14. Side panel with tabs (replaced footer buttons)
15. Moving/morphing zombie target
16. Weather effects per location
17. Day/night cycle
18. Blood splatter effects
19. Screen effects (vignette, power glow)
20. Combo system
21. Golden zombies
22. Daily rewards
23. Keyboard support
24. Nerfed combo system (was OP)
25. Expanded prestige (6 tiers now)
26. Mobile/desktop responsive design
27. Version logging system
28. Published to GitHub Pages

---

## Quick Start for Next Session

1. Read this file to understand context
2. Ask user what they want to work on
3. Files are at `C:\Users\david\zombie-clicker\`
4. Live site at https://devist8uk.github.io/zombie-clicker/
5. Use `"C:\Program Files\GitHub CLI\gh.exe"` for GitHub operations
6. User prefers automated solutions
7. Remember to push changes to GitHub after updates

---

*Last updated: 2026-01-29*
*Session with: David (devist8uk)*
