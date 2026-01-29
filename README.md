# Zombie Apocalypse Survivor 🧟

A zombie-themed clicker/idle game built with HTML, CSS, and JavaScript.

## How to Play

1. **Open the game**: Double-click `index.html` to open in your web browser
2. **Click the zombie** to kill zombies and earn points
3. **Buy upgrades** in the shop to increase your killing power
4. **Watch your empire grow** as survivors automatically kill zombies for you

## Game Features

### Core Mechanics
- **Click to Kill**: Each click eliminates zombies based on your click power
- **Idle Earnings**: Survivors automatically kill zombies every second
- **Upgrade System**: Purchase weapons and recruit survivors to boost your power
- **Auto-Save**: Progress saves automatically every 30 seconds
- **Offline Progress**: Earn kills while away (up to 1 hour)

### Upgrades

#### Weapons (Increase Click Power)
| Weapon | Base Cost | Effect |
|--------|-----------|--------|
| Baseball Bat | 15 | +1 per click |
| Machete | 75 | +5 per click |
| Shotgun | 300 | +25 per click |
| Flamethrower | 1500 | +100 per click |

#### Survivors (Automatic Kills)
| Unit | Base Cost | Effect |
|------|-----------|--------|
| Survivor | 50 | +1 per second |
| Militia Squad | 250 | +5 per second |
| Army Unit | 1000 | +20 per second |
| Tank Division | 5000 | +100 per second |

*Note: Upgrade costs increase by 15% with each purchase*

## Technical Details

### File Structure
```
zombie-clicker/
├── index.html    # Main game page
├── style.css     # Styling and animations
├── game.js       # Game logic and state management
└── README.md     # This file
```

### Technologies Used
- **HTML5**: Game structure and layout
- **CSS3**: Styling, animations, and responsive design
- **JavaScript (ES6)**: Game logic, state management, localStorage

### Key Programming Concepts
- DOM manipulation
- Event handling (click events)
- setInterval for game loops
- localStorage for persistent data
- CSS animations and transitions
- Responsive grid layout

## Browser Compatibility
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Credits
Created as a college project demonstrating web development fundamentals.

---
*Survive the apocalypse, one click at a time!* 🧟‍♂️
