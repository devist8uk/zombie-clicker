# Dead Frequency

Dead Frequency is the second edition of **Zombie Apocalypse Survivor**, a browser clicker set across seven illustrated outbreak zones. Open `index.html` to play locally, or [play the published game on GitHub Pages](https://devist8uk.github.io/zombie-clicker/). The game runs offline from a local copy. Its illustrations, equipment patches and fonts are bundled in `assets/`.

## Playing

Strike the infected to earn kills. Spend your kill balance in the Armory. Weapons increase each strike and survivors earn kills every second. Your total kills continue to count towards unlocking sectors after you spend them.

Land 20 strikes to charge Overdrive. Activate it for eight seconds of triple strike power, or hold the charge for a wave or boss. Rapid strikes build a combo, and the rare golden infected gives a brief opportunity for a bonus. Open the sector map to inspect a location or travel to an unlocked one for a higher multiplier.

After 100,000 total kills in a run, the Field log offers prestige. This starts another run with persistent bonuses. Settings contains the manual save and reset controls.

| Control | Action |
| --- | --- |
| Click or tap the battlefield | Strike |
| Space or Enter | Strike from the battlefield, or activate the focused control |
| E | Activate a charged Overdrive |
| S | Toggle sound |
| M | Open or close the Field log |
| 1–4 | Select a Field log tab while the log is open |
| Escape | Close the open log or dialog |

## Saves and hosting

The game writes to the original `zombieClickerSave` local-storage key and can resume saves from version 1. Returning survivors can earn up to two hours of offline progress. Saves belong to the browser profile and origin that created them, so a local copy and the published game have separate progress.

The site uses HTML, CSS and vanilla JavaScript. No install or build step is required. GitHub Pages serves the repository root on `master`.

## Credits

Based on the original Zombie Apocalypse Survivor college project. The Dead Frequency edition includes original generated illustrations, synthesized audio, and self-hosted Barlow Condensed. The font license is included in [assets/fonts/BarlowCondensed-OFL.txt](assets/fonts/BarlowCondensed-OFL.txt).
