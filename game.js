// ===== ZOMBIE CLICKER - GAME LOGIC =====

// ===== VERSION SYSTEM =====
const VERSION = {
    major: 2,
    minor: 1,
    patch: 0,
    build: '2026.11.17',
    get string() {
        return `v${this.major}.${this.minor}.${this.patch}`;
    },
    get full() {
        return `v${this.major}.${this.minor}.${this.patch} (Build ${this.build})`;
    }
};

const CHANGELOG = [
    { version: '2.1.0', date: '2026-11-17', changes: ['The petrol station Attendant moves, watches and recoils from strikes.', 'The baseball bat has its own swing and Overdrive takes over the broadcast.', 'Footfalls announce the Rex before it breaks through the canopy.'] },
    { version: '2.0.0', date: '2026-11-17', changes: ['Illustrated combat sectors and a rebuilt armory.', 'Charge Overdrive with 20 strikes, then unleash triple damage for eight seconds.', 'Keyboard and touch combat, a streamlined field guide, and compatible saves.'] },
    {
        version: '1.0.0',
        date: '2026-01-29',
        changes: [
            '🎮 Initial public release',
            '🧟 Core clicker gameplay with upgrades',
            '🗺️ 7 unique locations with themed backgrounds',
            '⛈️ Weather effects (rain, fog, storm, embers, etc.)',
            '🌅 Day/night cycle',
            '👹 Boss battles with health bars',
            '🌊 Zombie wave events',
            '⭐ 6-tier prestige system with 21 upgrades',
            '🏅 65+ achievements',
            '🔥 Combo system for fast clicking',
            '👑 Golden zombies with bonus rewards',
            '🎁 Daily login rewards with streak bonuses',
            '⌨️ Keyboard support (Space/Enter to click)',
            '📱 Mobile and desktop responsive design',
            '💾 Auto-save with localStorage',
            '🩸 Blood splatter and particle effects',
            '🎵 Procedural sound effects'
        ]
    }
];

function logVersion() {
    console.info('Zombie Clicker ' + VERSION.full);
}

function getVersionInfo() {
    return {
        version: VERSION.string,
        fullVersion: VERSION.full,
        changelog: CHANGELOG
    };
}

function showVersionInUI() {
    const button = document.getElementById('release-notes');
    if (!button) return;
    button.textContent = VERSION.string;
    button.addEventListener('click', showChangelogModal);
}

function showChangelogModal() {
    const dialog = document.createElement('dialog');
    dialog.className = 'release-dialog';
    dialog.setAttribute('aria-labelledby', 'release-title');
    const entries = CHANGELOG.map(release =>
        '<section class="changelog-release"><div class="changelog-header">' +
        '<strong>v' + release.version + '</strong><time class="changelog-date">' + release.date +
        '</time></div><ul class="changelog-list">' +
        release.changes.map(change => '<li>' + change + '</li>').join('') + '</ul></section>'
    ).join('');
    dialog.innerHTML = '<div class="release-head"><h2 id="release-title">Release notes</h2>' +
        '<form method="dialog"><button class="modal-close" autofocus>Close</button></form></div>' + entries;
    document.body.appendChild(dialog);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.showModal();
}

// ===== SOUND SYSTEM =====
const SoundManager = {
    enabled: true,
    audioContext: null,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    },

    playTone(frequency, duration, type = 'square', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    playClick() {
        // A short descending strike with a higher attack as the combo grows.
        if (!this.audioContext || !this.enabled) return;
        const now = this.audioContext.currentTime;
        const thump = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        thump.type = 'triangle';
        thump.frequency.setValueAtTime(170 + Math.min(gameState.comboCount, 20) * 3, now);
        thump.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        envelope.gain.setValueAtTime(0.21, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.105);
        thump.connect(envelope).connect(this.audioContext.destination);
        thump.start(now);
        thump.stop(now + 0.11);
    },

    playCritical() {
        this.playTone(400, 0.1, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(600, 0.1, 'sawtooth', 0.3), 50);
        setTimeout(() => this.playTone(800, 0.15, 'sawtooth', 0.4), 100);
    },

    playPurchase() {
        this.playTone(523, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 200);
    },

    playMilestone() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.4), i * 150);
        });
    },

    playAchievement() {
        const notes = [659, 784, 988, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.35), i * 100);
        });
    },

    playBossAppear() {
        this.playTone(150, 0.3, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(100, 0.4, 'sawtooth', 0.5), 200);
        setTimeout(() => this.playTone(80, 0.5, 'sawtooth', 0.4), 500);
    },

    playBossHit() {
        this.playTone(100, 0.15, 'square', 0.3);
        this.playTone(200, 0.1, 'sawtooth', 0.2);
    },

    playBossDefeat() {
        const notes = [262, 330, 392, 523, 659, 784];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.4), i * 100);
        });
    },

    playWaveStart() {
        this.playTone(440, 0.15, 'square', 0.3);
        setTimeout(() => this.playTone(550, 0.15, 'square', 0.3), 150);
        setTimeout(() => this.playTone(660, 0.2, 'square', 0.4), 300);
    },

    playWaveEnd() {
        const notes = [784, 988, 1175, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'triangle', 0.35), i * 80);
        });
    },

    playError() {
        this.playTone(200, 0.2, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.2), 100);
    },

    playCombo() {
        this.playTone(600, 0.08, 'sine', 0.25);
        setTimeout(() => this.playTone(800, 0.08, 'sine', 0.3), 50);
    },

    playGoldenZombie() {
        const notes = [784, 988, 1175, 1319, 1568];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.4), i * 60);
        });
    },

    playDailyReward() {
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.4), i * 120);
        });
    },

    playThunder() {
        this.playTone(60, 0.5, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(40, 0.8, 'sawtooth', 0.4), 100);
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

const sectorTargets = ['The Attendant', 'Patient Zero', 'The Night Clerk', 'The Deserter', 'Specimen Nine', 'The Gatekeeper', 'The Hollow One'];

// ===== LOCATIONS SYSTEM =====
const locations = [
    {
        id: 'suburbs',
        name: '🏘️ Abandoned Suburbs',
        description: 'Where it all began...',
        unlockKills: 0,
        background: 'linear-gradient(180deg, #2d4a3e 0%, #1a2e28 50%, #0f1a15 100%)',
        zombieBonus: 1.0,
        specialZombies: ['🧟', '🧟‍♂️', '🧟‍♀️'],
        ambientColor: '#2e7d32',
        bgElements: ['🏠', '🏚️', '🌳', '🚗', '🗑️', '📬'],
        weather: 'rain'
    },
    {
        id: 'hospital',
        name: '🏥 Overrun Hospital',
        description: 'Patient zero awaits...',
        unlockKills: 1000,
        background: 'linear-gradient(180deg, #1a3a4a 0%, #0f2530 50%, #051015 100%)',
        zombieBonus: 1.25,
        specialZombies: ['🧟', '💀', '👻'],
        ambientColor: '#00838f',
        bgElements: ['💉', '🩺', '💊', '🩹', '🛏️', '🧪'],
        weather: 'fog'
    },
    {
        id: 'mall',
        name: '🏬 Dead Mall',
        description: 'Shop till you drop... dead.',
        unlockKills: 10000,
        background: 'linear-gradient(180deg, #4a3a1a 0%, #302510 50%, #1a1505 100%)',
        zombieBonus: 1.5,
        specialZombies: ['🧟', '🧟‍♀️', '🎃'],
        ambientColor: '#ff8f00',
        bgElements: ['🛒', '👗', '👠', '💄', '🎁', '🛍️'],
        weather: 'dust'
    },
    {
        id: 'military',
        name: '🎖️ Military Base',
        description: 'The last stand failed.',
        unlockKills: 50000,
        background: 'linear-gradient(180deg, #3a3a3a 0%, #252525 50%, #101010 100%)',
        zombieBonus: 2.0,
        specialZombies: ['🧟‍♂️', '💀', '🤖'],
        ambientColor: '#546e7a',
        bgElements: ['🎖️', '🔫', '💣', '🪖', '🚁', '📡'],
        weather: 'storm'
    },
    {
        id: 'lab',
        name: '🔬 Research Lab',
        description: 'Where nightmares are made.',
        unlockKills: 100000,
        background: 'linear-gradient(180deg, #1a4a1a 0%, #0f300f 50%, #051505 100%)',
        zombieBonus: 2.5,
        specialZombies: ['👾', '🧬', '🦠'],
        ambientColor: '#00c853',
        bgElements: ['🔬', '🧫', '🧬', '⚗️', '🔋', '💡'],
        weather: 'toxic'
    },
    {
        id: 'hell',
        name: '🔥 Gates of Hell',
        description: 'The source of all evil.',
        unlockKills: 500000,
        background: 'linear-gradient(180deg, #4a0a0a 0%, #300505 50%, #1a0000 100%)',
        zombieBonus: 3.0,
        specialZombies: ['😈', '👹', '👿'],
        ambientColor: '#d32f2f',
        bgElements: ['🔥', '💀', '⛓️', '🗡️', '🩸', '☠️'],
        weather: 'embers'
    },
    {
        id: 'void',
        name: '🌌 The Void',
        description: 'Beyond death itself.',
        unlockKills: 1000000,
        background: 'linear-gradient(180deg, #0a0a2a 0%, #050515 50%, #000005 100%)',
        zombieBonus: 4.0,
        specialZombies: ['👻', '💀', '☠️'],
        ambientColor: '#7c4dff',
        bgElements: ['⭐', '🌙', '✨', '💫', '🌀', '👁️'],
        weather: 'stars'
    }
];

// ===== BOSS ZOMBIE DEFINITIONS =====
const bossTypes = [
    { emoji: '🦖', name: 'Zombie Rex', tier: 1, baseHealth: 100, reward: 500 },
    { emoji: '🐉', name: 'Undead Dragon', tier: 2, baseHealth: 500, reward: 2500 },
    { emoji: '👾', name: 'Alien Overlord', tier: 3, baseHealth: 2500, reward: 15000 },
    { emoji: '🤖', name: 'Mecha Zombie', tier: 4, baseHealth: 10000, reward: 75000 },
    { emoji: '👿', name: 'Demon Lord', tier: 5, baseHealth: 50000, reward: 400000 },
    { emoji: '💀', name: 'Death Incarnate', tier: 6, baseHealth: 250000, reward: 2000000 }
];

// ===== MILESTONES =====
const milestones = [
    { kills: 100, title: '🩸 First Blood!', message: '100 zombies eliminated!' },
    { kills: 500, title: '⚔️ Zombie Hunter!', message: '500 zombies down!' },
    { kills: 1000, title: '💀 Zombie Slayer!', message: '1,000 zombies crushed!' },
    { kills: 5000, title: '🔥 Zombie Destroyer!', message: '5,000 zombies obliterated!' },
    { kills: 10000, title: '☠️ Death Dealer!', message: '10,000 zombies annihilated!' },
    { kills: 50000, title: '🏆 Zombie Apocalypse Survivor!', message: '50,000 zombies defeated!' },
    { kills: 100000, title: '👑 Zombie King Slayer!', message: '100,000 zombies - Legendary!' },
    { kills: 500000, title: '🌟 Undead Nemesis!', message: '500,000 zombies - Mythical!' },
    { kills: 1000000, title: '💎 Million Kill Club!', message: '1,000,000 zombies - GODLIKE!' }
];

// ===== ACHIEVEMENTS SYSTEM =====
const achievements = [
    // Click achievements
    { id: 'click_10', name: 'Button Masher', description: 'Click 10 times', icon: '👆', check: (s) => s.totalClicks >= 10 },
    { id: 'click_100', name: 'Clicking Spree', description: 'Click 100 times', icon: '👇', check: (s) => s.totalClicks >= 100 },
    { id: 'click_1000', name: 'Click Master', description: 'Click 1,000 times', icon: '🖱️', check: (s) => s.totalClicks >= 1000 },
    { id: 'click_10000', name: 'Click Legend', description: 'Click 10,000 times', icon: '⌨️', check: (s) => s.totalClicks >= 10000 },

    // Critical hit achievements
    { id: 'crit_1', name: 'Lucky Shot', description: 'Land your first critical hit', icon: '🎯', check: (s) => s.criticalHits >= 1 },
    { id: 'crit_10', name: 'Sharpshooter', description: 'Land 10 critical hits', icon: '🎪', check: (s) => s.criticalHits >= 10 },
    { id: 'crit_100', name: 'Critical Master', description: 'Land 100 critical hits', icon: '💥', check: (s) => s.criticalHits >= 100 },
    { id: 'crit_500', name: 'Crit Machine', description: 'Land 500 critical hits', icon: '⚡', check: (s) => s.criticalHits >= 500 },

    // Kill achievements
    { id: 'kills_1000', name: 'Zombie Slayer', description: 'Kill 1,000 zombies', icon: '🗡️', check: (s) => s.totalKills >= 1000 },
    { id: 'kills_10000', name: 'Zombie Crusher', description: 'Kill 10,000 zombies', icon: '⚔️', check: (s) => s.totalKills >= 10000 },
    { id: 'kills_100000', name: 'Zombie Annihilator', description: 'Kill 100,000 zombies', icon: '🔥', check: (s) => s.totalKills >= 100000 },
    { id: 'kills_1000000', name: 'Zombie Apocalypse Ender', description: 'Kill 1,000,000 zombies', icon: '☠️', check: (s) => s.totalKills >= 1000000 },

    // Upgrade achievements
    { id: 'upgrade_1', name: 'First Purchase', description: 'Buy your first upgrade', icon: '🛒', check: (s) => s.totalUpgradesBought >= 1 },
    { id: 'upgrade_10', name: 'Shopping Spree', description: 'Buy 10 upgrades', icon: '🛍️', check: (s) => s.totalUpgradesBought >= 10 },
    { id: 'upgrade_50', name: 'Big Spender', description: 'Buy 50 upgrades', icon: '💰', check: (s) => s.totalUpgradesBought >= 50 },
    { id: 'upgrade_100', name: 'Upgrade Addict', description: 'Buy 100 upgrades', icon: '🏪', check: (s) => s.totalUpgradesBought >= 100 },

    // Power achievements
    { id: 'dps_100', name: 'Auto Killer', description: 'Reach 100 kills per second', icon: '🤖', check: (s) => s.killsPerSecond >= 100 },
    { id: 'dps_1000', name: 'Killing Machine', description: 'Reach 1,000 kills per second', icon: '🦾', check: (s) => s.killsPerSecond >= 1000 },
    { id: 'dps_10000', name: 'Death Factory', description: 'Reach 10,000 kills per second', icon: '🏭', check: (s) => s.killsPerSecond >= 10000 },
    { id: 'click_power_100', name: 'Power Clicker', description: 'Reach 100 kills per click', icon: '💪', check: (s) => s.killsPerClick >= 100 },
    { id: 'click_power_1000', name: 'Super Clicker', description: 'Reach 1,000 kills per click', icon: '🦸', check: (s) => s.killsPerClick >= 1000 },

    // Time achievements
    { id: 'time_10', name: 'Getting Started', description: 'Play for 10 minutes', icon: '⏱️', check: (s) => s.totalPlayTime >= 600 },
    { id: 'time_60', name: 'Dedicated Player', description: 'Play for 1 hour', icon: '🕐', check: (s) => s.totalPlayTime >= 3600 },
    { id: 'time_300', name: 'Zombie Veteran', description: 'Play for 5 hours', icon: '🕰️', check: (s) => s.totalPlayTime >= 18000 },

    // Boss achievements
    { id: 'boss_1', name: 'Boss Slayer', description: 'Defeat your first boss', icon: '🦖', check: (s) => s.bossesDefeated >= 1 },
    { id: 'boss_10', name: 'Boss Hunter', description: 'Defeat 10 bosses', icon: '🐉', check: (s) => s.bossesDefeated >= 10 },
    { id: 'boss_50', name: 'Boss Destroyer', description: 'Defeat 50 bosses', icon: '👾', check: (s) => s.bossesDefeated >= 50 },

    // Wave achievements
    { id: 'wave_1', name: 'Wave Survivor', description: 'Complete your first wave', icon: '🌊', check: (s) => s.wavesCompleted >= 1 },
    { id: 'wave_10', name: 'Wave Master', description: 'Complete 10 waves', icon: '🏄', check: (s) => s.wavesCompleted >= 10 },
    { id: 'wave_25', name: 'Wave Champion', description: 'Complete 25 waves', icon: '🏆', check: (s) => s.wavesCompleted >= 25 },

    // Special achievements
    { id: 'rich', name: 'Hoarder', description: 'Have 100,000 kills saved up', icon: '🏦', check: (s) => s.kills >= 100000 },
    { id: 'millionaire', name: 'Zombie Millionaire', description: 'Have 1,000,000 kills saved up', icon: '💎', check: (s) => s.kills >= 1000000 },

    // Prestige achievements
    { id: 'prestige_1', name: 'New Beginning', description: 'Prestige for the first time', icon: '⭐', check: (s) => s.prestigeCount >= 1 },
    { id: 'prestige_5', name: 'Reborn', description: 'Prestige 5 times', icon: '🌟', check: (s) => s.prestigeCount >= 5 },
    { id: 'prestige_10', name: 'Eternal Warrior', description: 'Prestige 10 times', icon: '✨', check: (s) => s.prestigeCount >= 10 },
    { id: 'prestige_points_10', name: 'Point Collector', description: 'Earn 10 prestige points', icon: '🎖️', check: (s) => s.totalPrestigePoints >= 10 },
    { id: 'prestige_points_50', name: 'Point Hoarder', description: 'Earn 50 prestige points', icon: '🏅', check: (s) => s.totalPrestigePoints >= 50 },
    { id: 'prestige_points_100', name: 'Prestige Legend', description: 'Earn 100 prestige points', icon: '👑', check: (s) => s.totalPrestigePoints >= 100 },
    { id: 'lifetime_1m', name: 'Million Lifetime', description: 'Kill 1 million zombies (lifetime)', icon: '💀', check: (s) => s.lifetimeKills + s.totalKills >= 1000000 },
    { id: 'lifetime_10m', name: 'Ten Million Club', description: 'Kill 10 million zombies (lifetime)', icon: '☠️', check: (s) => s.lifetimeKills + s.totalKills >= 10000000 },

    // Location achievements
    { id: 'location_hospital', name: 'First Responder', description: 'Unlock the Hospital', icon: '🏥', check: (s) => s.unlockedLocations?.includes('hospital') },
    { id: 'location_mall', name: 'Mall Rat', description: 'Unlock the Dead Mall', icon: '🏬', check: (s) => s.unlockedLocations?.includes('mall') },
    { id: 'location_military', name: 'Enlisted', description: 'Unlock the Military Base', icon: '🎖️', check: (s) => s.unlockedLocations?.includes('military') },
    { id: 'location_lab', name: 'Mad Scientist', description: 'Unlock the Research Lab', icon: '🔬', check: (s) => s.unlockedLocations?.includes('lab') },
    { id: 'location_hell', name: 'Hell Walker', description: 'Unlock the Gates of Hell', icon: '🔥', check: (s) => s.unlockedLocations?.includes('hell') },
    { id: 'location_void', name: 'Void Traveler', description: 'Unlock The Void', icon: '🌌', check: (s) => s.unlockedLocations?.includes('void') },
    { id: 'location_all', name: 'World Explorer', description: 'Unlock all locations', icon: '🗺️', check: (s) => s.unlockedLocations?.length >= 7 },

    // Combo achievements
    { id: 'combo_10', name: 'Combo Starter', description: 'Reach a 10x combo', icon: '🔢', check: (s) => s.maxCombo >= 10 },
    { id: 'combo_25', name: 'Combo Master', description: 'Reach a 25x combo', icon: '💢', check: (s) => s.maxCombo >= 25 },
    { id: 'combo_50', name: 'Combo Legend', description: 'Reach a 50x combo', icon: '🔥', check: (s) => s.maxCombo >= 50 },
    { id: 'combo_100', name: 'Combo God', description: 'Reach a 100x combo', icon: '⚡', check: (s) => s.maxCombo >= 100 },

    // Golden zombie achievements
    { id: 'golden_1', name: 'Lucky Find', description: 'Click your first golden zombie', icon: '🌟', check: (s) => s.goldenZombiesClicked >= 1 },
    { id: 'golden_10', name: 'Gold Hunter', description: 'Click 10 golden zombies', icon: '💛', check: (s) => s.goldenZombiesClicked >= 10 },
    { id: 'golden_50', name: 'Gold Digger', description: 'Click 50 golden zombies', icon: '🏆', check: (s) => s.goldenZombiesClicked >= 50 },

    // Daily streak achievements
    { id: 'daily_3', name: 'Regular Player', description: 'Maintain a 3-day streak', icon: '📅', check: (s) => s.dailyStreak >= 3 },
    { id: 'daily_7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '📆', check: (s) => s.dailyStreak >= 7 },
    { id: 'daily_30', name: 'Dedicated Slayer', description: 'Maintain a 30-day streak', icon: '🗓️', check: (s) => s.dailyStreak >= 30 }
];

// ===== PRESTIGE SYSTEM =====
const prestigeUpgrades = [
    // Row 1: Basic Bonuses (costs increased)
    { id: 'p_click_power', name: '💪 Enhanced Strength', description: '+10% click power', row: 1, cost: 2, effect: { type: 'clickMultiplier', value: 0.10 }, maxLevel: 20 },
    { id: 'p_auto_power', name: '🤖 Automation Boost', description: '+10% auto-kill power', row: 1, cost: 2, effect: { type: 'autoMultiplier', value: 0.10 }, maxLevel: 20 },
    { id: 'p_crit_chance', name: '🎯 Critical Training', description: '+1% critical chance', row: 1, cost: 3, effect: { type: 'critChance', value: 0.01 }, maxLevel: 15 },

    // Row 2: Advanced Bonuses (requires 10 points spent)
    { id: 'p_crit_damage', name: '⚡ Critical Mastery', description: '+25% critical damage', row: 2, cost: 5, effect: { type: 'critMultiplier', value: 0.25 }, maxLevel: 10, requires: 10 },
    { id: 'p_cost_reduce', name: '💰 Bargain Hunter', description: '-3% upgrade costs', row: 2, cost: 4, effect: { type: 'costReduction', value: 0.03 }, maxLevel: 10, requires: 10 },
    { id: 'p_offline', name: '💤 Sleepless Army', description: '+10% offline earnings', row: 2, cost: 3, effect: { type: 'offlineMultiplier', value: 0.1 }, maxLevel: 10, requires: 10 },

    // Row 3: Boss & Wave Bonuses (requires 25 points spent)
    { id: 'p_boss_damage', name: '👹 Boss Hunter', description: '+15% damage to bosses', row: 3, cost: 6, effect: { type: 'bossMultiplier', value: 0.15 }, maxLevel: 10, requires: 25 },
    { id: 'p_wave_bonus', name: '🌊 Wave Warrior', description: '+10% wave rewards', row: 3, cost: 6, effect: { type: 'waveMultiplier', value: 0.1 }, maxLevel: 10, requires: 25 },
    { id: 'p_boss_time', name: '⏱️ Extended Time', description: '+3s boss/wave timer', row: 3, cost: 8, effect: { type: 'eventTime', value: 3 }, maxLevel: 5, requires: 25 },

    // Row 4: Power Boosters (requires 50 points spent)
    { id: 'p_starting', name: '🚀 Head Start', description: 'Start with 5K kills after prestige', row: 4, cost: 10, effect: { type: 'startingKills', value: 5000 }, maxLevel: 10, requires: 50 },
    { id: 'p_prestige_bonus', name: '⭐ Prestige Master', description: '+5% prestige points earned', row: 4, cost: 12, effect: { type: 'prestigeBonus', value: 0.05 }, maxLevel: 10, requires: 50 },
    { id: 'p_combo_power', name: '🔥 Combo Enhancer', description: '+5% combo effectiveness', row: 4, cost: 10, effect: { type: 'comboMultiplier', value: 0.05 }, maxLevel: 10, requires: 50 },

    // Row 5: Golden & Special (requires 100 points spent)
    { id: 'p_golden_chance', name: '👑 Lucky Charm', description: '+0.1% golden zombie chance', row: 5, cost: 15, effect: { type: 'goldenChance', value: 0.001 }, maxLevel: 10, requires: 100 },
    { id: 'p_golden_reward', name: '💎 Golden Greed', description: '+50% golden zombie rewards', row: 5, cost: 15, effect: { type: 'goldenMultiplier', value: 0.5 }, maxLevel: 5, requires: 100 },
    { id: 'p_daily_bonus', name: '📅 Daily Dedication', description: '+25% daily reward bonus', row: 5, cost: 12, effect: { type: 'dailyMultiplier', value: 0.25 }, maxLevel: 5, requires: 100 },

    // Row 6: Legendary Powers (requires 200 points spent)
    { id: 'p_golden', name: '✨ Golden Touch', description: '+2% all multipliers', row: 6, cost: 25, effect: { type: 'globalMultiplier', value: 0.02 }, maxLevel: 10, requires: 200 },
    { id: 'p_ascension', name: '🌟 Ascension', description: '+1% to everything per prestige', row: 6, cost: 30, effect: { type: 'ascensionBonus', value: 0.01 }, maxLevel: 10, requires: 200 },
    { id: 'p_infinity', name: '♾️ Infinity Shard', description: 'Massive +50% all power', row: 6, cost: 50, effect: { type: 'infinityBonus', value: 0.5 }, maxLevel: 3, requires: 200 }
];

// ===== GAME STATE =====
const gameState = {
    overdriveCharge: 0,
    overdriveUntil: 0,
    kills: 0,
    totalKills: 0,
    killsPerClick: 1,
    killsPerSecond: 0,
    upgrades: {},
    unlockedMilestones: [],
    unlockedAchievements: [],
    totalClicks: 0,
    criticalHits: 0,
    totalUpgradesBought: 0,
    totalPlayTime: 0,
    sessionStartTime: Date.now(),
    highestKillsPerClick: 1,
    highestKillsPerSecond: 0,
    currentZombie: 0,
    soundEnabled: true,
    criticalChance: 0.05,
    criticalMultiplier: 10,

    // Boss state
    bossActive: false,
    currentBoss: null,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossesDefeated: 0,
    bossTimer: 0,
    bossDuration: 30, // seconds to defeat boss

    // Wave state
    waveActive: false,
    waveKills: 0,
    waveTarget: 0,
    waveTimer: 0,
    waveDuration: 20, // seconds for wave
    waveMultiplier: 2, // bonus multiplier during waves
    wavesCompleted: 0,
    waveNumber: 0,

    // Prestige state
    prestigePoints: 0,
    totalPrestigePoints: 0,
    prestigeCount: 0,

    // Location state
    currentLocation: 'suburbs',
    unlockedLocations: ['suburbs'],
    prestigeUpgrades: {},
    lifetimeKills: 0,

    // Combo system
    comboCount: 0,
    comboTimer: 0,
    lastClickTime: 0,
    maxCombo: 0,
    comboMultiplier: 1,

    // Golden zombie
    goldenZombieActive: false,
    goldenZombiesClicked: 0,

    // Daily rewards
    lastDailyReward: 0,
    dailyStreak: 0,

    // Day/night cycle
    timeOfDay: 0, // 0-100 representing full day cycle

    // Calculated prestige bonuses
    prestigeBonuses: {
        clickMultiplier: 1,
        autoMultiplier: 1,
        critChance: 0,
        critMultiplier: 0,
        costReduction: 0,
        offlineMultiplier: 1,
        bossMultiplier: 1,
        waveMultiplier: 1,
        eventTime: 0,
        startingKills: 0,
        prestigeBonus: 0,
        globalMultiplier: 1
    }
};

// ===== UPGRADE DEFINITIONS =====
const upgrades = {
    weapons: [
        { id: 'fists', name: '👊 Brass Knuckles', baseCost: 10, effect: 1, type: 'click', description: '+1 kill per click' },
        { id: 'baseball_bat', name: '⚾ Baseball Bat', baseCost: 50, effect: 3, type: 'click', description: '+3 kills per click' },
        { id: 'machete', name: '🔪 Machete', baseCost: 200, effect: 10, type: 'click', description: '+10 kills per click' },
        { id: 'chainsaw', name: '⛓️ Chainsaw', baseCost: 750, effect: 35, type: 'click', description: '+35 kills per click' },
        { id: 'shotgun', name: '🔫 Shotgun', baseCost: 2500, effect: 100, type: 'click', description: '+100 kills per click' },
        { id: 'flamethrower', name: '🔥 Flamethrower', baseCost: 10000, effect: 400, type: 'click', description: '+400 kills per click' },
        { id: 'minigun', name: '💥 Minigun', baseCost: 50000, effect: 1500, type: 'click', description: '+1,500 kills per click' },
        { id: 'nuke', name: '☢️ Tactical Nuke', baseCost: 250000, effect: 5000, type: 'click', description: '+5,000 kills per click' }
    ],
    survivors: [
        { id: 'kid', name: '🧒 Brave Kid', baseCost: 25, effect: 1, type: 'auto', description: '+1 kill per second' },
        { id: 'survivor', name: '🧑 Survivor', baseCost: 100, effect: 3, type: 'auto', description: '+3 kills per second' },
        { id: 'militia', name: '👥 Militia Squad', baseCost: 500, effect: 10, type: 'auto', description: '+10 kills per second' },
        { id: 'sniper', name: '🎯 Sniper', baseCost: 2000, effect: 35, type: 'auto', description: '+35 kills per second' },
        { id: 'army', name: '🎖️ Army Unit', baseCost: 8000, effect: 100, type: 'auto', description: '+100 kills per second' },
        { id: 'tank', name: '🛡️ Tank Division', baseCost: 35000, effect: 400, type: 'auto', description: '+400 kills per second' },
        { id: 'airforce', name: '✈️ Air Force', baseCost: 150000, effect: 1500, type: 'auto', description: '+1,500 kills per second' },
        { id: 'satellite', name: '🛰️ Orbital Laser', baseCost: 750000, effect: 5000, type: 'auto', description: '+5,000 kills per second' }
    ]
};

// ===== DOM ELEMENTS =====
const elements = {
    killCount: document.getElementById('kill-count'),
    perClick: document.getElementById('per-click'),
    perSecond: document.getElementById('per-second'),
    totalKilled: document.getElementById('total-killed'),
    zombieTarget: document.getElementById('zombie-target'),
    floatingNumbers: document.getElementById('floating-numbers'),
    weaponUpgrades: document.getElementById('weapon-upgrades'),
    survivorUpgrades: document.getElementById('survivor-upgrades'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
    soundBtn: document.getElementById('sound-btn'),
    togglePanelBtn: document.getElementById('toggle-panel-btn'),
    sidePanel: document.getElementById('side-panel'),
    eventDisplay: document.getElementById('event-display'),
    particleContainer: document.getElementById('particle-container'),
    locationName: document.getElementById('location-name')
};

// ===== UTILITY FUNCTIONS =====
function initUpgrades() {
    [...upgrades.weapons, ...upgrades.survivors].forEach(upgrade => {
        if (!(upgrade.id in gameState.upgrades)) {
            gameState.upgrades[upgrade.id] = 0;
        }
    });
}

function getUpgradeCost(upgrade) {
    const owned = gameState.upgrades[upgrade.id] || 0;
    const baseCost = Math.floor(upgrade.baseCost * Math.pow(1.15, owned));
    const reduction = gameState.prestigeBonuses.costReduction;
    return Math.floor(baseCost * (1 - reduction));
}

function formatNumber(num) {
    if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Q';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function updateTarget() {
    const index = locations.indexOf(getCurrentLocation());
    if (gameState.bossActive) elements.zombieTarget.dataset.bossTier = String(gameState.currentBoss.tier);
    else delete elements.zombieTarget.dataset.bossTier;
    const name = gameState.bossActive ? gameState.currentBoss.name :
        gameState.goldenZombieActive ? 'The Gilded One' : sectorTargets[index];
    const type = gameState.bossActive ? 'Boss infected' : gameState.goldenZombieActive ?
        'Golden infected' : gameState.waveActive ? 'Horde infected' : 'Common infected';
    writeText('target-name', name);
    writeText('target-type', type);
    elements.zombieTarget.setAttribute('aria-label', 'Strike ' + name);
}

function writeText(id, value) {
    const node = document.getElementById(id);
    const text = String(value);
    if (node && node.textContent !== text) node.textContent = text;
}

function locationLabel(location) {
    return location.name.slice(location.name.indexOf(' ') + 1);
}

// ===== LOCATION SYSTEM =====
function getCurrentLocation() {
    return locations.find(loc => loc.id === gameState.currentLocation) || locations[0];
}

function getLocationBonus() {
    const location = getCurrentLocation();
    return location ? location.zombieBonus : 1.0;
}

function checkLocationUnlocks() {
    let newUnlock = false;
    locations.forEach(location => {
        if (!gameState.unlockedLocations.includes(location.id)) {
            if (gameState.totalKills >= location.unlockKills) {
                gameState.unlockedLocations.push(location.id);
                newUnlock = true;
                showLocationUnlock(location);
            }
        }
    });
    if (newUnlock) {
        document.dispatchEvent(new CustomEvent('sectors-changed'));
        checkAchievements();
        saveGame();
    }
}

function showLocationUnlock(location) {
    SoundManager.playMilestone();
    showSideNotification({
        title: '🗺️ NEW LOCATION!',
        icon: location.name.split(' ')[0],
        message: location.name,
        submessage: location.description,
        bonus: `+${Math.round((location.zombieBonus - 1) * 100)}% Kill Bonus!`,
        type: 'location'
    });
}

function switchLocation(locationId) {
    if (!gameState.unlockedLocations.includes(locationId)) {
        SoundManager.playError();
        return;
    }

    if (locationId !== gameState.currentLocation) cancelRexEntrance();
    gameState.currentLocation = locationId;
    applyLocationTheme();
    SoundManager.playPurchase();
    saveGame();
}

function applyLocationTheme() {
    const location = getCurrentLocation();
    document.body.dataset.location = location.id;
    writeText('location-name', locationLabel(location));
    writeText('sector-index', String(locations.indexOf(location) + 1).padStart(2, '0'));
    updateTarget();
    updateDisplay();
    document.dispatchEvent(new CustomEvent('sectors-changed'));
}

function updateSectorProgress() {
    const next = locations.find(location => !gameState.unlockedLocations.includes(location.id));
    const max = next ? next.unlockKills : locations[locations.length - 1].unlockKills;
    const value = next ? Math.min(gameState.totalKills, max) : max;
    writeText('next-sector-name', next ? locationLabel(next) : 'All sectors unlocked');
    writeText('sector-progress-text', next ? value.toLocaleString('en-US') + ' / ' + max.toLocaleString('en-US') + ' kills' : '7 / 7 sectors');
    const bar = document.getElementById('sector-progress');
    if (bar) { bar.max = max; bar.value = value; }
}

// Overdrive runs on elapsed time so background tabs cannot stretch its duration.
const DRIVE_HITS = 20;
const DRIVE_DURATION = 8000;

function overdriveActive() {
    return gameState.overdriveUntil > Date.now();
}

function updateOverdrive() {
    const active = overdriveActive();
    const ready = gameState.overdriveCharge >= DRIVE_HITS;
    const remaining = Math.max(0, gameState.overdriveUntil - Date.now());
    document.body.dataset.overdrive = active ? 'active' : ready ? 'ready' : 'charging';
    const meter = document.getElementById('overdrive-meter');
    if (meter) {
        meter.max = DRIVE_HITS;
        meter.value = active ? remaining / DRIVE_DURATION * DRIVE_HITS : gameState.overdriveCharge;
    }
    writeText('overdrive-label', active ? '3× power · ' + Math.ceil(remaining / 1000) + 's' :
        ready ? 'Ready' : Math.floor(gameState.overdriveCharge / DRIVE_HITS * 100) + '%');
    const button = document.getElementById('overdrive-btn');
    if (button) {
        button.disabled = active || !ready;
        button.title = active ? 'Triple strike power is active' : ready ? 'Activate triple strike power (E)' : 'Land 20 strikes to charge Overdrive';
    }
}

function activateOverdrive() {
    if (overdriveActive() || gameState.overdriveCharge < DRIVE_HITS) return;
    gameState.overdriveCharge = 0;
    gameState.overdriveUntil = Date.now() + DRIVE_DURATION;
    document.dispatchEvent(new CustomEvent('drive-start'));
    SoundManager.playCombo();
    updateDisplay();
    saveGame();
}

// ===== COMBO SYSTEM =====
function updateCombo() {
    const now = Date.now();
    const timeSinceLastClick = now - gameState.lastClickTime;

    // Combo continues if clicked within 400ms (was 500ms - harder to maintain)
    if (timeSinceLastClick < 400) {
        gameState.comboCount++;
        gameState.comboTimer = 400;

        if (gameState.comboCount > gameState.maxCombo) {
            gameState.maxCombo = gameState.comboCount;
        }

        // Play combo sound every 10 combo (was 5)
        if (gameState.comboCount % 10 === 0) {
            SoundManager.playCombo();
        }
    } else {
        gameState.comboCount = 1;
    }

    gameState.lastClickTime = now;

    // Calculate combo multiplier - NERFED: caps at 1.25x at 100 combo (was 2x at 50)
    // Prestige combo enhancer can boost this further
    const baseComboBonus = Math.min(gameState.comboCount / 100, 0.25);
    const prestigeComboMult = gameState.prestigeBonuses.comboMultiplier || 1;
    gameState.comboMultiplier = 1 + (baseComboBonus * prestigeComboMult);

    updateComboDisplay();
}

function decayCombo() {
    const now = Date.now();
    const timeSinceLastClick = now - gameState.lastClickTime;

    if (timeSinceLastClick > 400 && gameState.comboCount > 0) {
        gameState.comboCount = 0;
        gameState.comboMultiplier = 1;
        updateComboDisplay();
    }
}

function updateComboDisplay() {
    let comboDisplay = document.getElementById('combo-display');

    if (gameState.comboCount > 1) {
        if (!comboDisplay) {
            comboDisplay = document.createElement('div');
            comboDisplay.id = 'combo-display';
            comboDisplay.className = 'combo-display';
            document.querySelector('.click-section').appendChild(comboDisplay);
        }

        comboDisplay.innerHTML = `
            <div class="combo-count">${gameState.comboCount}x</div>
            <div class="combo-label">COMBO!</div>
            <div class="combo-multiplier">+${Math.round((gameState.comboMultiplier - 1) * 100)}% DMG</div>
        `;
        comboDisplay.className = `combo-display active combo-tier-${Math.min(Math.floor(gameState.comboCount / 10), 5)}`;
    } else if (comboDisplay) {
        comboDisplay.classList.remove('active');
    }
}

// ===== GOLDEN ZOMBIE SYSTEM =====
function checkGoldenZombieSpawn() {
    // Base 0.5% chance + prestige bonus
    const baseChance = 0.005;
    const goldenChance = baseChance + (gameState.prestigeBonuses.goldenChance || 0);

    if (!rexEntrancePending && !gameState.bossActive && !gameState.waveActive && !gameState.goldenZombieActive) {
        if (Math.random() < goldenChance) {
            spawnGoldenZombie();
        }
    }
}

let goldenExpiry;
function spawnGoldenZombie() {
    clearTimeout(goldenExpiry);
    gameState.goldenZombieActive = true;
    updateTarget();

    elements.zombieTarget.classList.add('golden-zombie');

    SoundManager.playGoldenZombie();
    showSideNotification({
        title: '✨ GOLDEN ZOMBIE!',
        icon: '👑',
        message: 'Quick! Click for 10x rewards!',
        type: 'golden'
    });

    // Golden zombie only lasts 3 seconds
    goldenExpiry = setTimeout(() => {
        if (gameState.goldenZombieActive) {
            gameState.goldenZombieActive = false;
            elements.zombieTarget.classList.remove('golden-zombie');
            updateTarget();
        }
    }, 3000);
}

function clickGoldenZombie() {
    clearTimeout(goldenExpiry);
    gameState.goldenZombieActive = false;
    gameState.goldenZombiesClicked++;

    elements.zombieTarget.classList.remove('golden-zombie');

    // 10x rewards + prestige golden multiplier
    const goldenMult = 10 * (gameState.prestigeBonuses.goldenMultiplier || 1);
    const bonus = Math.floor(getEffectiveClickPower() * goldenMult);
    gameState.kills += bonus;
    gameState.totalKills += bonus;

    showSideNotification({
        title: '💰 JACKPOT!',
        icon: '👑',
        message: 'Golden zombie slain!',
        bonus: `+${formatNumber(bonus)} kills!`,
        type: 'golden'
    });

    SoundManager.playGoldenZombie();
    updateTarget();
    checkAchievements();
    return bonus;
}

// ===== DAILY REWARDS SYSTEM =====
function checkDailyReward() {
    const now = Date.now();
    const lastReward = gameState.lastDailyReward || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const twoDaysMs = 2 * oneDayMs;

    if (!lastReward) {
        gameState.lastDailyReward = now;
        return;
    }

    if (now - lastReward >= oneDayMs) {
        // Check if streak continues or resets
        if (now - lastReward < twoDaysMs) {
            gameState.dailyStreak++;
        } else {
            gameState.dailyStreak = 1;
        }

        gameState.lastDailyReward = now;
        giveDailyReward();
    }
}

function giveDailyReward() {
    // Reward scales with streak + prestige daily multiplier
    const baseReward = 1000;
    const streakBonus = gameState.dailyStreak * 500;
    const dailyMult = gameState.prestigeBonuses.dailyMultiplier || 1;
    const reward = Math.floor((baseReward + streakBonus) * dailyMult);

    gameState.kills += reward;
    gameState.totalKills += reward;

    SoundManager.playDailyReward();

    showSideNotification({
        title: '🎁 DAILY REWARD!',
        icon: '📅',
        message: `Day ${gameState.dailyStreak} streak!`,
        bonus: `+${formatNumber(reward)} kills!`,
        type: 'daily'
    });

    checkAchievements();
    saveGame();
}

// ===== KEYBOARD SUPPORT =====
function setupKeyboardControls() {
    document.addEventListener('keydown', event => {
        if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
            event.target.closest('input, textarea, select, [contenteditable=true]')) return;
        if (event.code === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.querySelector('.modal-close')?.click();
            else if (sidePanelOpen) toggleSidePanel();
            return;
        }
        if (document.querySelector('.modal-overlay, dialog[open]')) return;
        if (event.code === 'KeyM') toggleSidePanel();
        if (event.code === 'KeyS') toggleSound();
        if (sidePanelOpen) {
            if (event.key === 'Tab') {
                const buttons = [...elements.sidePanel.querySelectorAll('button:not(:disabled)')].filter(button => button.offsetWidth);
                const first = buttons[0], last = buttons.at(-1);
                if (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    (event.shiftKey ? last : first)?.focus();
                }
            }
            const tab = ['locations', 'prestige', 'stats', 'achievements'][Number(event.key) - 1];
            if (tab) switchTab(tab);
            return;
        }
        if (event.code === 'KeyE') activateOverdrive();
        if ((event.code === 'Space' || event.code === 'Enter') && !event.target.closest('button,a,[role=button]')) {
            event.preventDefault();
            elements.zombieTarget.click();
        }
    });
}

// ===== CRITICAL HIT SYSTEM =====
function rollCritical() {
    const totalCritChance = gameState.criticalChance + gameState.prestigeBonuses.critChance;
    return Math.random() < totalCritChance;
}

function getCriticalDamage() {
    const totalCritMult = gameState.criticalMultiplier + gameState.prestigeBonuses.critMultiplier;
    return getEffectiveClickPower() * totalCritMult;
}

// ===== PRESTIGE-MODIFIED DAMAGE =====
function getEffectiveClickPower() {
    const locationBonus = getLocationBonus();
    return Math.floor(gameState.killsPerClick * gameState.prestigeBonuses.clickMultiplier * locationBonus * (overdriveActive() ? 3 : 1));
}

function getEffectiveAutoPower() {
    const locationBonus = getLocationBonus();
    return Math.floor(gameState.killsPerSecond * gameState.prestigeBonuses.autoMultiplier * locationBonus);
}

// ===== BOSS ZOMBIE SYSTEM =====
function getBossForLevel() {
    const level = gameState.bossesDefeated;
    const tierIndex = Math.min(Math.floor(level / 5), bossTypes.length - 1);
    const boss = bossTypes[tierIndex];
    const scaling = Math.pow(1.5, level);
    return {
        ...boss,
        health: Math.floor(boss.baseHealth * scaling),
        reward: Math.floor(boss.reward * scaling)
    };
}

let rexEntrancePending = false;
let rexTimers = [];
let introducedRex = false;

function cueRex(phase) {
    document.dispatchEvent(new CustomEvent('rex-cue', { detail: { phase } }));
}

function cancelRexEntrance() {
    rexTimers.forEach(clearTimeout);
    rexTimers = [];
    if (rexEntrancePending) cueRex('clear');
    rexEntrancePending = false;
}

function playRexEntrance(onArrival) {
    rexEntrancePending = true;
    cueRex('footfall');
    rexTimers = [
        setTimeout(() => cueRex('approach'), 850),
        setTimeout(() => cueRex('breach'), 1650),
        setTimeout(() => {
            cancelRexEntrance();
            if (onArrival) onArrival();
        }, 4650)
    ];
}

function spawnBoss() {
    if (rexEntrancePending || gameState.bossActive || gameState.waveActive || gameState.goldenZombieActive) return;
    const boss = getBossForLevel();
    if (boss.tier === 1 && gameState.currentLocation === 'suburbs' && !document.hidden) {
        // The station remains playable during the warning. The boss clock begins on arrival.
        playRexEntrance(() => beginBoss(boss));
    } else {
        beginBoss(boss);
    }
}

function beginBoss(boss) {
    if (boss.tier === 1) introducedRex = true;
    gameState.bossActive = true;
    gameState.currentBoss = boss;
    gameState.bossHealth = boss.health;
    gameState.bossMaxHealth = boss.health;
    gameState.bossTimer = gameState.bossDuration + gameState.prestigeBonuses.eventTime;

    elements.zombieTarget.classList.add('boss-active');
    updateTarget();

    SoundManager.playBossAppear();
    updateEventDisplay();
    showNotification(`⚠️ BOSS: ${boss.name} appeared!`);
}

function damageBoss(damage) {
    if (!gameState.bossActive) return false;

    // Apply boss damage bonus from prestige
    const boostedDamage = Math.floor(damage * gameState.prestigeBonuses.bossMultiplier);
    gameState.bossHealth -= boostedDamage;
    SoundManager.playBossHit();

    if (gameState.bossHealth <= 0) {
        defeatBoss();
        return true;
    }

    updateEventDisplay();
    return false;
}

function defeatBoss() {
    if (gameState.currentBoss.tier === 1 && gameState.currentLocation === 'suburbs') cueRex('wrecked');
    const reward = gameState.currentBoss.reward;
    gameState.kills += reward;
    gameState.totalKills += reward;
    gameState.bossesDefeated++;

    SoundManager.playBossDefeat();
    showBossVictory(gameState.currentBoss, reward);

    // Reset boss state
    gameState.bossActive = false;
    gameState.currentBoss = null;
    gameState.bossHealth = 0;
    gameState.bossMaxHealth = 0;
    gameState.bossTimer = 0;

    elements.zombieTarget.classList.remove('boss-active');
    updateTarget();
    updateEventDisplay();
    checkAchievements();
}

function bossFailed() {
    showNotification(`💀 Boss escaped! Try again...`);

    gameState.bossActive = false;
    gameState.currentBoss = null;
    gameState.bossHealth = 0;
    gameState.bossMaxHealth = 0;
    gameState.bossTimer = 0;

    elements.zombieTarget.classList.remove('boss-active');
    updateTarget();
    updateEventDisplay();
}

function showBossVictory(boss, reward) {
    showSideNotification({
        title: '👹 BOSS DEFEATED!',
        icon: boss.emoji,
        message: `${boss.name} has been slain!`,
        bonus: `+${formatNumber(reward)} kills!`,
        type: 'boss'
    });
}

// ===== ZOMBIE WAVE SYSTEM =====
function startWave(intro = false) {
    if (rexEntrancePending || gameState.waveActive || gameState.bossActive || gameState.goldenZombieActive) return;

    gameState.waveNumber++;
    gameState.waveActive = true;
    gameState.waveKills = 0;
    gameState.waveTarget = intro ? 18 : Math.floor(50 * Math.pow(1.3, gameState.waveNumber - 1));
    gameState.waveTimer = gameState.waveDuration + gameState.prestigeBonuses.eventTime;

    elements.zombieTarget.classList.add('wave-active');
    SoundManager.playWaveStart();
    updateEventDisplay();
    showNotification(`🌊 WAVE ${gameState.waveNumber}! Kill ${gameState.waveTarget} zombies!`);
}

function addWaveKill(kills) {
    if (!gameState.waveActive) return;

    gameState.waveKills += kills;

    if (gameState.waveKills >= gameState.waveTarget) {
        completeWave();
    }

    updateEventDisplay();
}

function completeWave() {
    let bonus = Math.floor(gameState.waveTarget * gameState.waveMultiplier * (gameState.waveTarget === 18 ? 2 : 10));
    // Apply prestige wave bonus
    bonus = Math.floor(bonus * gameState.prestigeBonuses.waveMultiplier);
    gameState.kills += bonus;
    gameState.totalKills += bonus;
    gameState.wavesCompleted++;

    SoundManager.playWaveEnd();
    showWaveComplete(gameState.waveNumber, bonus);

    // Reset wave state
    gameState.waveActive = false;
    gameState.waveKills = 0;
    gameState.waveTarget = 0;
    gameState.waveTimer = 0;

    elements.zombieTarget.classList.remove('wave-active');
    updateEventDisplay();
    checkAchievements();
}

function waveFailed() {
    showNotification(`❌ Wave ${gameState.waveNumber} failed!`);

    gameState.waveActive = false;
    gameState.waveKills = 0;
    gameState.waveTarget = 0;
    gameState.waveTimer = 0;
    gameState.waveNumber = Math.max(0, gameState.waveNumber - 1);

    elements.zombieTarget.classList.remove('wave-active');
    updateEventDisplay();
}

function showWaveComplete(waveNum, bonus) {
    showSideNotification({
        title: `🌊 WAVE ${waveNum} COMPLETE!`,
        icon: '🌊',
        message: 'You survived the horde!',
        bonus: `+${formatNumber(bonus)} bonus kills!`,
        type: 'wave'
    });
}

// ===== EVENT DISPLAY UPDATE =====
function updateEventDisplay() {
    updateTarget();
    if (!elements.eventDisplay) return;

    if (gameState.bossActive) {
        const healthPercent = (gameState.bossHealth / gameState.bossMaxHealth) * 100;
        elements.eventDisplay.innerHTML = `
            <div class="event-boss">
                <div class="event-title">👹 BOSS: ${gameState.currentBoss.name}</div>
                <div class="boss-health-bar">
                    <div class="boss-health-fill" style="width: ${healthPercent}%"></div>
                </div>
                <div class="boss-health-text">${formatNumber(gameState.bossHealth)} / ${formatNumber(gameState.bossMaxHealth)}</div>
                <div class="event-timer">⏱️ ${gameState.bossTimer}s remaining</div>
            </div>
        `;
        elements.eventDisplay.classList.add('active');
    } else if (gameState.waveActive) {
        const progressPercent = (gameState.waveKills / gameState.waveTarget) * 100;
        elements.eventDisplay.innerHTML = `
            <div class="event-wave">
                <div class="event-title">🌊 WAVE ${gameState.waveNumber}</div>
                <div class="wave-progress-bar">
                    <div class="wave-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="wave-progress-text">${gameState.waveKills} / ${gameState.waveTarget} kills</div>
                <div class="event-timer">⏱️ ${gameState.waveTimer}s remaining</div>
                <div class="wave-bonus">🔥 ${gameState.waveMultiplier}x BONUS ACTIVE!</div>
            </div>
        `;
        elements.eventDisplay.classList.add('active');
    } else {
        elements.eventDisplay.innerHTML = '';
        elements.eventDisplay.classList.remove('active');
    }
}

// ===== EVENT TIMER TICK =====
function eventTick() {
    if (gameState.overdriveUntil) {
        if (!overdriveActive()) gameState.overdriveUntil = 0;
        updateDisplay();
    }
    if (gameState.bossActive) {
        gameState.bossTimer--;
        if (gameState.bossTimer <= 0) {
            bossFailed();
        } else {
            // Boss takes auto damage
            if (gameState.killsPerSecond > 0) {
                damageBoss(getEffectiveAutoPower());
                checkLocationUnlocks();
                updateDisplay();
            }
            updateEventDisplay();
        }
    }

    if (gameState.waveActive) {
        gameState.waveTimer--;
        if (gameState.waveTimer <= 0) {
            waveFailed();
        } else {
            updateEventDisplay();
        }
    }

    // Random event spawning
    if (!gameState.bossActive && !gameState.waveActive) {
        // 2% chance per second for boss after 1000 total kills
        if (gameState.totalKills >= 1000 && Math.random() < 0.02) {
            spawnBoss();
        }
        // 3% chance per second for wave after 500 total kills
        else if (gameState.totalKills >= 500 && Math.random() < 0.03) {
            startWave();
        }
    }
}

// ===== PRESTIGE SYSTEM =====
function calculatePrestigePoints() {
    // Earn prestige points based on total kills this run
    // Starts being meaningful around 100K kills
    const killsRequired = 100000;
    if (gameState.totalKills < killsRequired) return 0;

    let basePoints = Math.floor(Math.sqrt(gameState.totalKills / killsRequired));
    const bonus = 1 + gameState.prestigeBonuses.prestigeBonus;
    return Math.floor(basePoints * bonus);
}

function calculatePrestigeBonuses() {
    // Reset all bonuses
    gameState.prestigeBonuses = {
        clickMultiplier: 1,
        autoMultiplier: 1,
        critChance: 0,
        critMultiplier: 0,
        costReduction: 0,
        offlineMultiplier: 1,
        bossMultiplier: 1,
        waveMultiplier: 1,
        eventTime: 0,
        startingKills: 0,
        prestigeBonus: 0,
        globalMultiplier: 1,
        comboMultiplier: 1,
        goldenChance: 0,
        goldenMultiplier: 1,
        dailyMultiplier: 1,
        ascensionBonus: 0,
        infinityBonus: 0
    };

    // Apply prestige upgrades
    prestigeUpgrades.forEach(upgrade => {
        const level = gameState.prestigeUpgrades[upgrade.id] || 0;
        if (level > 0) {
            const effect = upgrade.effect;
            const totalEffect = effect.value * level;

            switch (effect.type) {
                case 'clickMultiplier':
                    gameState.prestigeBonuses.clickMultiplier += totalEffect;
                    break;
                case 'autoMultiplier':
                    gameState.prestigeBonuses.autoMultiplier += totalEffect;
                    break;
                case 'critChance':
                    gameState.prestigeBonuses.critChance += totalEffect;
                    break;
                case 'critMultiplier':
                    gameState.prestigeBonuses.critMultiplier += totalEffect;
                    break;
                case 'costReduction':
                    gameState.prestigeBonuses.costReduction += totalEffect;
                    break;
                case 'offlineMultiplier':
                    gameState.prestigeBonuses.offlineMultiplier += totalEffect;
                    break;
                case 'bossMultiplier':
                    gameState.prestigeBonuses.bossMultiplier += totalEffect;
                    break;
                case 'waveMultiplier':
                    gameState.prestigeBonuses.waveMultiplier += totalEffect;
                    break;
                case 'eventTime':
                    gameState.prestigeBonuses.eventTime += totalEffect;
                    break;
                case 'startingKills':
                    gameState.prestigeBonuses.startingKills += totalEffect;
                    break;
                case 'prestigeBonus':
                    gameState.prestigeBonuses.prestigeBonus += totalEffect;
                    break;
                case 'globalMultiplier':
                    gameState.prestigeBonuses.globalMultiplier += totalEffect;
                    break;
                case 'comboMultiplier':
                    gameState.prestigeBonuses.comboMultiplier += totalEffect;
                    break;
                case 'goldenChance':
                    gameState.prestigeBonuses.goldenChance += totalEffect;
                    break;
                case 'goldenMultiplier':
                    gameState.prestigeBonuses.goldenMultiplier += totalEffect;
                    break;
                case 'dailyMultiplier':
                    gameState.prestigeBonuses.dailyMultiplier += totalEffect;
                    break;
                case 'ascensionBonus':
                    gameState.prestigeBonuses.ascensionBonus += totalEffect;
                    break;
                case 'infinityBonus':
                    gameState.prestigeBonuses.infinityBonus += totalEffect;
                    break;
            }
        }
    });

    // Apply ascension bonus (based on prestige count)
    const ascensionMultiplier = 1 + (gameState.prestigeBonuses.ascensionBonus * gameState.prestigeCount);

    // Apply infinity bonus
    const infinityMultiplier = 1 + gameState.prestigeBonuses.infinityBonus;

    // Apply global multiplier to other multipliers
    const global = gameState.prestigeBonuses.globalMultiplier * ascensionMultiplier * infinityMultiplier;
    gameState.prestigeBonuses.clickMultiplier *= global;
    gameState.prestigeBonuses.autoMultiplier *= global;
    gameState.prestigeBonuses.bossMultiplier *= global;
    gameState.prestigeBonuses.waveMultiplier *= global;
}

function getPrestigeUpgradePointsSpent(row) {
    let spent = 0;
    prestigeUpgrades.forEach(upgrade => {
        if (row === undefined || upgrade.row < row) {
            spent += (gameState.prestigeUpgrades[upgrade.id] || 0) * upgrade.cost;
        }
    });
    return spent;
}

function canBuyPrestigeUpgrade(upgrade) {
    const level = gameState.prestigeUpgrades[upgrade.id] || 0;
    if (level >= upgrade.maxLevel) return false;
    if (gameState.prestigePoints < upgrade.cost) return false;

    if (upgrade.requires) {
        const pointsInPreviousRows = getPrestigeUpgradePointsSpent(upgrade.row);
        if (pointsInPreviousRows < upgrade.requires) return false;
    }

    return true;
}

function buyPrestigeUpgrade(upgrade) {
    if (!canBuyPrestigeUpgrade(upgrade)) {
        SoundManager.playError();
        return;
    }

    gameState.prestigePoints -= upgrade.cost;
    gameState.prestigeUpgrades[upgrade.id] = (gameState.prestigeUpgrades[upgrade.id] || 0) + 1;

    SoundManager.playPurchase();
    calculatePrestigeBonuses();
    saveGame();
}

function doPrestige() {
    const pointsToGain = calculatePrestigePoints();
    if (pointsToGain <= 0) {
        showNotification('Need 100K+ total kills to prestige!');
        SoundManager.playError();
        return;
    }

    if (!confirm(`Prestige for ${pointsToGain} ⭐ Prestige Points?\n\nThis will reset your kills, upgrades, and progress, but you keep:\n• Prestige Points & Upgrades\n• Achievements\n• Statistics\n\nYou'll also gain permanent bonuses!`)) {
        return;
    }

    cancelRexEntrance();
    introducedRex = false;
    // Award prestige points
    gameState.prestigePoints += pointsToGain;
    gameState.totalPrestigePoints += pointsToGain;
    gameState.prestigeCount++;
    gameState.lifetimeKills += gameState.totalKills;

    // Reset run-specific progress
    gameState.kills = gameState.prestigeBonuses.startingKills;
    gameState.totalKills = 0;
    gameState.killsPerClick = 1;
    gameState.killsPerSecond = 0;
    gameState.upgrades = {};
    gameState.unlockedMilestones = [];
    gameState.totalUpgradesBought = 0;
    gameState.bossesDefeated = 0;
    gameState.wavesCompleted = 0;
    gameState.waveNumber = 0;

    gameState.overdriveCharge = 0;
    gameState.overdriveUntil = 0;
    gameState.goldenZombieActive = false;
    elements.zombieTarget.classList.remove('golden-zombie');

    // Reset active events
    gameState.bossActive = false;
    gameState.waveActive = false;
    gameState.currentBoss = null;
    elements.zombieTarget.classList.remove('boss-active', 'wave-active');

    initUpgrades();
    calculatePrestigeBonuses();
    updateDisplay();
    updateEventDisplay();
    saveGame();

    SoundManager.playMilestone();
    showPrestigeComplete(pointsToGain);
}

function showPrestigeComplete(points) {
    showSideNotification({
        title: `⭐ PRESTIGE ${gameState.prestigeCount}!`,
        icon: '🌟',
        message: `You earned ${points} Prestige Points!`,
        submessage: `Total: ${gameState.prestigePoints} ⭐`,
        type: 'prestige'
    });
}

// ===== ACHIEVEMENTS SYSTEM =====
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!gameState.unlockedAchievements.includes(achievement.id) && achievement.check(gameState)) {
            gameState.unlockedAchievements.push(achievement.id);
            showAchievementPopup(achievement);
            SoundManager.playAchievement();
        }
    });
}

function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.setAttribute('role', 'status');
    popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
        </div>
    `;
    displayNotice(popup, 3000);
}

function checkMilestones() {
    milestones.forEach(milestone => {
        if (gameState.totalKills >= milestone.kills &&
            !gameState.unlockedMilestones.includes(milestone.kills)) {
            gameState.unlockedMilestones.push(milestone.kills);
            showMilestone(milestone);
            SoundManager.playMilestone();
        }
    });
}

function showMilestone(milestone) {
    showSideNotification({
        title: '🎉 MILESTONE!',
        icon: milestone.title.split(' ')[0],
        message: milestone.title,
        submessage: milestone.message,
        type: 'milestone'
    });
}

// ===== UI UPDATES =====
function updateDisplay() {
    writeText('strike-verb', gameState.upgrades.baseball_bat > 0 ? 'Swing bat' : 'Strike infected');
    elements.killCount.textContent = formatNumber(gameState.kills);
    elements.perClick.textContent = formatNumber(getEffectiveClickPower());
    elements.perSecond.textContent = formatNumber(getEffectiveAutoPower());
    elements.totalKilled.textContent = formatNumber(gameState.totalKills);

    if (gameState.killsPerClick > gameState.highestKillsPerClick) {
        gameState.highestKillsPerClick = gameState.killsPerClick;
    }
    if (gameState.killsPerSecond > gameState.highestKillsPerSecond) {
        gameState.highestKillsPerSecond = gameState.killsPerSecond;
    }

    updateSectorProgress();
    updateOverdrive();
    renderUpgrades();
}

function showImpact(event, amount, kind) {
    const field = elements.floatingNumbers.getBoundingClientRect();
    const rect = elements.zombieTarget.getBoundingClientRect();
    const keyboard = event.detail === 0;
    const x = (keyboard ? rect.left + rect.width * 0.56 : event.clientX) - field.left;
    const y = (keyboard ? rect.top + rect.height * 0.48 : event.clientY) - field.top;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const number = document.createElement('span');
    number.className = 'floating-number ' + kind;
    number.textContent = (kind === 'critical' ? 'CRIT +' : kind === 'boss-damage' ? '−' : '+') + formatNumber(amount);
    number.style.left = Math.max(25, Math.min(field.width - 32, x)) + 'px';
    number.style.top = Math.max(35, Math.min(field.height - 18, y)) + 'px';
    elements.floatingNumbers.appendChild(number);
    setTimeout(() => number.remove(), 850);
    if (reduced) return;
    const ring = document.createElement('i');
    ring.className = 'impact-ring ' + kind;
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    elements.floatingNumbers.appendChild(ring);
    setTimeout(() => ring.remove(), 400);
}

let releaseHit;
function onZombieClick(event) {
    if (sidePanelOpen || document.querySelector('.modal-overlay, dialog[open]')) return;
    if (SoundManager.enabled && !SoundManager.audioContext) SoundManager.init();
    if (SoundManager.audioContext?.state === 'suspended') SoundManager.audioContext.resume().catch(() => {});
    updateCombo();
    gameState.totalClicks++;
    if (!overdriveActive()) gameState.overdriveCharge = Math.min(DRIVE_HITS, gameState.overdriveCharge + 1);
    const wasGolden = gameState.goldenZombieActive;
    const wasBoss = gameState.bossActive;
    const critical = !wasGolden && rollCritical();
    const weapon = gameState.upgrades.baseball_bat > 0 ? 'bat' : 'fists';
    const drive = overdriveActive();
    const bounds = elements.zombieTarget.getBoundingClientRect();
    const clamp = value => Math.min(1, Math.max(0, value));
    const x = event.detail ? clamp((event.clientX - bounds.left) / bounds.width) : 0.65;
    const y = event.detail ? clamp((event.clientY - bounds.top) / bounds.height) : 0.45;
    document.dispatchEvent(new CustomEvent('combat-strike', {
        detail: { x, y, weapon, critical, overdrive: drive, boss: wasBoss, golden: wasGolden }
    }));
    let amount;
    if (wasGolden) {
        amount = clickGoldenZombie();
    } else {
        const power = critical ? getCriticalDamage() : getEffectiveClickPower();
        const damage = Math.floor(power * gameState.comboMultiplier * (gameState.waveActive ? gameState.waveMultiplier : 1));
        if (critical) {
            gameState.criticalHits++;
            SoundManager.playCritical();
        }
        if (wasBoss) {
            amount = Math.floor(damage * gameState.prestigeBonuses.bossMultiplier);
            damageBoss(damage);
        } else {
            amount = damage;
            if (!critical && weapon === 'fists' && !drive) SoundManager.playClick();
            gameState.kills += damage;
            gameState.totalKills += damage;
            addWaveKill(damage);
        }
    }
    showImpact(event, amount, wasGolden ? 'gold' : critical ? 'critical' : wasBoss ? 'boss-damage' : 'normal');
    elements.zombieTarget.classList.add('clicked');
    elements.zombieTarget.classList.toggle('critical-hit', critical);
    clearTimeout(releaseHit);
    releaseHit = setTimeout(() => elements.zombieTarget.classList.remove('clicked', 'critical-hit'), 140);
    if (gameState.totalClicks === 18 && !gameState.waveNumber) startWave(true);
    else if (gameState.totalClicks >= 65 && !introducedRex && !gameState.bossesDefeated) spawnBoss();
    else if (!wasGolden && !wasBoss) checkGoldenZombieSpawn();

    checkMilestones();
    checkAchievements();
    checkLocationUnlocks();
    updateDisplay();
}

// ===== SHOP SYSTEM =====
function renderUpgrades() {
    renderUpgradeCategory(upgrades.weapons, elements.weaponUpgrades);
    renderUpgradeCategory(upgrades.survivors, elements.survivorUpgrades);
}

const equipmentIcons = {
    fists: 'knuckles', baseball_bat: 'bat', machete: 'machete', chainsaw: 'chainsaw',
    shotgun: 'shotgun', flamethrower: 'flame', minigun: 'minigun', nuke: 'rocket',
    kid: 'civilian', survivor: 'veteran', militia: 'militia', sniper: 'hunter',
    army: 'army', tank: 'tank', airforce: 'plane', satellite: 'satellite'
};

function renderUpgradeCategory(upgradeList, container) {
    upgradeList.forEach((upgrade, index) => {
        let button = container.children[index];
        const name = upgrade.name.slice(upgrade.name.indexOf(' ') + 1);
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'upgrade-btn';
            button.dataset.upgradeId = upgrade.id;
            button.innerHTML = '<span class="item-icon"><svg aria-hidden="true"><use href="#i-' +
                equipmentIcons[upgrade.id] + '"></use></svg></span>' +
                '<span class="item-copy"><span class="item-name">' + name + '</span>' +
                '<span class="item-effect">' + upgrade.description + '</span></span>' +
                '<span class="item-cost"><svg aria-hidden="true"><use href="#i-skull"></use></svg><span></span></span>' +
                '<span class="item-owned" hidden></span>';
            button.addEventListener('click', () => purchaseUpgrade(upgrade));
            container.appendChild(button);
        }
        const cost = getUpgradeCost(upgrade);
        const owned = gameState.upgrades[upgrade.id] || 0;
        const affordable = gameState.kills >= cost;
        button.disabled = !affordable;
        button.classList.toggle('affordable', affordable);
        if (button.dataset.cost === String(cost) && button.dataset.owned === String(owned)) return;
        button.dataset.cost = cost;
        button.dataset.owned = owned;
        button.querySelector('.item-cost span').textContent = formatNumber(cost);
        const badge = button.querySelector('.item-owned');
        badge.hidden = !owned;
        badge.textContent = '×' + owned;
        button.setAttribute('aria-label', name + ', ' + upgrade.description + ', costs ' + cost +
            ' kills, ' + owned + ' owned');
    });
}

function purchaseUpgrade(upgrade) {
    const cost = getUpgradeCost(upgrade);

    if (gameState.kills >= cost) {
        gameState.kills -= cost;
        gameState.upgrades[upgrade.id] = (gameState.upgrades[upgrade.id] || 0) + 1;
        gameState.totalUpgradesBought++;
        document.dispatchEvent(new CustomEvent('combat-purchase', { detail: { id: upgrade.id } }));

        if (upgrade.type === 'click') {
            gameState.killsPerClick += upgrade.effect;
        } else if (upgrade.type === 'auto') {
            gameState.killsPerSecond += upgrade.effect;
        }

        SoundManager.playPurchase();
        checkAchievements();
        updateDisplay();
        saveGame();
    } else {
        SoundManager.playError();
    }
}

// ===== AUTO-KILL SYSTEM =====
function autoKillTick() {
    if (gameState.killsPerSecond > 0 && !gameState.bossActive) {
        let autoKills = getEffectiveAutoPower();
        if (gameState.waveActive) {
            autoKills = Math.floor(autoKills * gameState.waveMultiplier);
            addWaveKill(autoKills);
        }
        gameState.kills += autoKills;
        gameState.totalKills += autoKills;
        checkMilestones();
        checkAchievements();
        checkLocationUnlocks();
        updateDisplay();
    }
}

// ===== SAVE/LOAD SYSTEM =====
function saveGame() {
    const currentSessionTime = Math.floor((Date.now() - gameState.sessionStartTime) / 1000);

    const saveData = {
        overdriveCharge: gameState.overdriveCharge,
        overdriveUntil: gameState.overdriveUntil,
        kills: gameState.kills,
        totalKills: gameState.totalKills,
        killsPerClick: gameState.killsPerClick,
        killsPerSecond: gameState.killsPerSecond,
        upgrades: gameState.upgrades,
        unlockedMilestones: gameState.unlockedMilestones,
        unlockedAchievements: gameState.unlockedAchievements,
        totalClicks: gameState.totalClicks,
        criticalHits: gameState.criticalHits,
        totalUpgradesBought: gameState.totalUpgradesBought,
        totalPlayTime: gameState.totalPlayTime + currentSessionTime,
        highestKillsPerClick: gameState.highestKillsPerClick,
        highestKillsPerSecond: gameState.highestKillsPerSecond,
        bossesDefeated: gameState.bossesDefeated,
        wavesCompleted: gameState.wavesCompleted,
        waveNumber: gameState.waveNumber,
        soundEnabled: gameState.soundEnabled,
        // Prestige data
        prestigePoints: gameState.prestigePoints,
        totalPrestigePoints: gameState.totalPrestigePoints,
        prestigeCount: gameState.prestigeCount,
        prestigeUpgrades: gameState.prestigeUpgrades,
        lifetimeKills: gameState.lifetimeKills,
        // Location data
        currentLocation: gameState.currentLocation,
        unlockedLocations: gameState.unlockedLocations,
        // Combo & golden zombie data
        maxCombo: gameState.maxCombo,
        goldenZombiesClicked: gameState.goldenZombiesClicked,
        // Daily reward data
        lastDailyReward: gameState.lastDailyReward,
        dailyStreak: gameState.dailyStreak,
        savedAt: Date.now()
    };

    try {
        localStorage.setItem('zombieClickerSave', JSON.stringify(saveData));
        return true;
    } catch {
        return false;
    }
}

function loadGame() {
    let saveData;
    try { saveData = localStorage.getItem('zombieClickerSave'); } catch { return false; }

    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            gameState.overdriveCharge = Math.max(0, Math.min(DRIVE_HITS, Number(data.overdriveCharge) || 0));
            gameState.overdriveUntil = Math.min(Date.now() + DRIVE_DURATION, Number(data.overdriveUntil) || 0);
            gameState.kills = data.kills || 0;
            gameState.totalKills = data.totalKills || 0;
            gameState.killsPerClick = data.killsPerClick || 1;
            gameState.killsPerSecond = data.killsPerSecond || 0;
            gameState.upgrades = data.upgrades || {};
            gameState.unlockedMilestones = data.unlockedMilestones || [];
            gameState.unlockedAchievements = data.unlockedAchievements || [];
            gameState.totalClicks = data.totalClicks || 0;
            gameState.criticalHits = data.criticalHits || 0;
            gameState.totalUpgradesBought = data.totalUpgradesBought || 0;
            gameState.totalPlayTime = data.totalPlayTime || 0;
            gameState.highestKillsPerClick = data.highestKillsPerClick || 1;
            gameState.highestKillsPerSecond = data.highestKillsPerSecond || 0;
            gameState.bossesDefeated = data.bossesDefeated || 0;
            gameState.wavesCompleted = data.wavesCompleted || 0;
            gameState.waveNumber = data.waveNumber || 0;
            gameState.soundEnabled = data.soundEnabled !== false;

            // Load prestige data
            gameState.prestigePoints = data.prestigePoints || 0;
            gameState.totalPrestigePoints = data.totalPrestigePoints || 0;
            gameState.prestigeCount = data.prestigeCount || 0;
            gameState.prestigeUpgrades = data.prestigeUpgrades || {};
            gameState.lifetimeKills = data.lifetimeKills || 0;

            // Load location data
            gameState.currentLocation = data.currentLocation || 'suburbs';
            gameState.unlockedLocations = data.unlockedLocations || ['suburbs'];

            // Load combo & golden zombie data
            gameState.maxCombo = data.maxCombo || 0;
            gameState.goldenZombiesClicked = data.goldenZombiesClicked || 0;

            // Load daily reward data
            gameState.lastDailyReward = data.lastDailyReward || 0;
            gameState.dailyStreak = data.dailyStreak || 0;

            // Calculate prestige bonuses
            calculatePrestigeBonuses();

            SoundManager.enabled = gameState.soundEnabled;
            updateSoundButton();

            if (data.savedAt && gameState.killsPerSecond > 0) {
                const offlineSeconds = Math.max(0, Math.min((Date.now() - data.savedAt) / 1000, 7200));
                const offlineMultiplier = gameState.prestigeBonuses.offlineMultiplier;
                const offlineEarnings = Math.floor(offlineSeconds * getEffectiveAutoPower() * offlineMultiplier);
                if (offlineEarnings > 0) {
                    gameState.kills += offlineEarnings;
                    gameState.totalKills += offlineEarnings;
                    showNotification(`Welcome back! You killed ${formatNumber(offlineEarnings)} zombies while away!`);
                }
            }

            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
    return false;
}

const freshGame = JSON.stringify(gameState);

function resetGame() {
    if (!confirm('Reset the game? This erases your kills, upgrades and achievements.')) return;
    cancelRexEntrance();
    introducedRex = false;
    cueRex('restored');
    clearTimeout(goldenExpiry);
    const sound = gameState.soundEnabled;
    Object.assign(gameState, JSON.parse(freshGame), { sessionStartTime: Date.now(), lastDailyReward: Date.now(), soundEnabled: sound });
    elements.zombieTarget.classList.remove('boss-active', 'wave-active', 'golden-zombie', 'clicked', 'critical-hit');
    initUpgrades();
    calculatePrestigeBonuses();
    applyLocationTheme();
    updateEventDisplay();
    updateComboDisplay();
    if (sidePanelOpen) updateTabContent(currentTab);
    saveGame();
    showNotification('Game reset');
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.setAttribute('role', 'status');
    notification.textContent = message;
    displayNotice(notification, 2500);
}

// Non-blocking side notification system
function showSideNotification(options) {
    const { title, icon, message, submessage, bonus, type = 'default' } = options;

    const notification = document.createElement('div');
    notification.className = `side-notification side-notification-${type}`;
    notification.setAttribute('role', 'status');

    let html = `
        <div class="side-notification-icon" aria-hidden="true">${icon}</div>
        <div class="side-notification-content">
            <div class="side-notification-title">${title}</div>
            <div class="side-notification-message">${message}</div>
    `;

    if (submessage) {
        html += `<div class="side-notification-submessage">${submessage}</div>`;
    }

    if (bonus) {
        html += `<div class="side-notification-bonus">${bonus}</div>`;
    }

    html += `</div>`;
    notification.innerHTML = html;

    displayNotice(notification, 4000);
}

function displayNotice(notice, duration) {
    let stack = document.querySelector('.notice-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'notice-stack';
        document.body.appendChild(stack);
    }
    if (stack.childElementCount >= 3) stack.firstElementChild.remove();
    stack.appendChild(notice);
    setTimeout(() => notice.remove(), duration);
}

// ===== SIDE PANEL SYSTEM =====
let sidePanelOpen = false;
let currentTab = 'stats';
let drawerOpener = null;

function toggleSidePanel() {
    sidePanelOpen = !sidePanelOpen;
    const panel = elements.sidePanel;
    if (!panel) return;
    if (sidePanelOpen) drawerOpener = document.activeElement;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', String(sidePanelOpen));
    panel.classList.toggle('open', sidePanelOpen);
    panel.inert = !sidePanelOpen;
    panel.setAttribute('aria-hidden', String(!sidePanelOpen));
    elements.togglePanelBtn?.setAttribute('aria-expanded', String(sidePanelOpen));
    if (sidePanelOpen) {
        switchTab(currentTab);
        (document.getElementById('close-panel') || panel.querySelector('.tab-btn.active'))?.focus();
    } else {
        (drawerOpener?.matches('button, a') ? drawerOpener : elements.togglePanelBtn)?.focus();
    }
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
        btn.setAttribute('aria-pressed', String(btn.dataset.tab === tabName));
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    updateTabContent(tabName);
}

function updateTabContent(tabName) {
    switch(tabName) {
        case 'locations':
            renderLocationsTab();
            break;
        case 'prestige':
            renderPrestigeTab();
            break;
        case 'stats':
            renderStatsTab();
            break;
        case 'achievements':
            renderAchievementsTab();
            break;
    }
}

function renderLocationsTab() {
    const container = document.getElementById('tab-locations');
    if (!container) return;

    const currentLoc = getCurrentLocation();
    let html = `
        <h3>Active sector</h3>
        <div class="panel-current-info">
            <span>Current:</span>
            <span class="highlight">${locationLabel(currentLoc)}</span>
            <span class="bonus">+${Math.round((currentLoc.zombieBonus - 1) * 100)}% Bonus</span>
        </div>
        <div class="panel-locations-grid">
    `;

    locations.forEach(location => {
        const unlocked = gameState.unlockedLocations.includes(location.id);
        const current = location.id === gameState.currentLocation;
        const bonusPercent = Math.round((location.zombieBonus - 1) * 100);

        html += `
            <button type="button" ${unlocked && !current ? '' : 'disabled'} class="panel-location-card ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}"
                 data-location-id="${location.id}">
                <span class="panel-location-icon">${String(locations.indexOf(location) + 1).padStart(2, '0')}</span>
                <span class="panel-location-name">${locationLabel(location)}</span>
                ${unlocked ? `<span class="panel-location-bonus">+${bonusPercent}%</span>` :
                           `<span class="panel-location-locked">${formatNumber(location.unlockKills)} kills</span>`}
                ${current ? '<span class="panel-current-badge">✓</span>' : ''}
            </button>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.panel-location-card.unlocked:not(.current)').forEach(card => {
        card.addEventListener('click', () => {
            switchLocation(card.dataset.locationId);
            renderLocationsTab();
        });
    });
}

function renderPrestigeTab() {
    const container = document.getElementById('tab-prestige');
    if (!container) return;

    const potentialPoints = calculatePrestigePoints();

    let html = `
        <h3>Prestige</h3>
        <div class="panel-prestige-info">
            <div class="prestige-stat-row">
                <span>Points:</span>
                <span class="highlight">${gameState.prestigePoints}</span>
            </div>
            <div class="prestige-stat-row">
                <span>Prestige Count:</span>
                <span class="highlight">${gameState.prestigeCount}</span>
            </div>
            <div class="prestige-stat-row">
                <span>Total Kills:</span>
                <span>${formatNumber(gameState.totalKills)}</span>
            </div>
            <div class="prestige-stat-row potential">
                <span>If prestige now:</span>
                <span class="highlight">${potentialPoints}</span>
            </div>
        </div>
        <button class="panel-prestige-btn ${potentialPoints > 0 ? 'available' : ''}" id="panel-do-prestige" ${potentialPoints > 0 ? '' : 'disabled'}>
            ${potentialPoints > 0 ? `Prestige (${potentialPoints} pts)` : 'Unlock at 100k kills'}
        </button>
        <h4>Bonuses</h4>
        <div class="panel-bonus-grid">
            <div class="panel-bonus">Click +${Math.round((gameState.prestigeBonuses.clickMultiplier - 1) * 100)}%</div>
            <div class="panel-bonus">Auto +${Math.round((gameState.prestigeBonuses.autoMultiplier - 1) * 100)}%</div>
            <div class="panel-bonus">Crit +${Math.round(gameState.prestigeBonuses.critChance * 100)}%</div>
            <div class="panel-bonus">Boss +${Math.round((gameState.prestigeBonuses.bossMultiplier - 1) * 100)}%</div>
        </div>
        <h4>Upgrade Tree</h4>
        <div class="panel-upgrade-tree">
    `;

    for (let row = 1; row <= Math.max(...prestigeUpgrades.map(upgrade => upgrade.row)); row++) {
        const rowUpgrades = prestigeUpgrades.filter(u => u.row === row);
        const rowRequires = rowUpgrades[0]?.requires || 0;
        const pointsSpent = getPrestigeUpgradePointsSpent(row);
        const rowUnlocked = pointsSpent >= rowRequires;

        html += `<div class="panel-upgrade-row ${rowUnlocked ? '' : 'locked'}">`;

        rowUpgrades.forEach(upgrade => {
            const level = gameState.prestigeUpgrades[upgrade.id] || 0;
            const canBuy = canBuyPrestigeUpgrade(upgrade);
            const maxed = level >= upgrade.maxLevel;

            html += `
                <button type="button" ${canBuy ? '' : 'disabled'} class="panel-upgrade ${maxed ? 'maxed' : ''} ${canBuy ? 'affordable' : ''}"
                     data-upgrade-id="${upgrade.id}" title="${upgrade.description}">
                    <span class="panel-upgrade-icon">${upgrade.name.substring(upgrade.name.indexOf(' ') + 1)}</span>
                    <small class="panel-upgrade-level">${level}/${upgrade.maxLevel} · ${upgrade.cost} pt</small>
                </button>
            `;
        });

        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Add click handlers
    container.querySelector('#panel-do-prestige')?.addEventListener('click', () => {
        if (potentialPoints > 0) {
            doPrestige();
            renderPrestigeTab();
        }
    });

    container.querySelectorAll('.panel-upgrade').forEach(el => {
        el.addEventListener('click', () => {
            const upgradeId = el.dataset.upgradeId;
            const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
            if (upgrade && canBuyPrestigeUpgrade(upgrade)) {
                buyPrestigeUpgrade(upgrade);
                renderPrestigeTab();
            }
        });
    });
}

function renderStatsTab() {
    const container = document.getElementById('tab-stats');
    if (!container) return;

    const currentPlayTime = gameState.totalPlayTime + Math.floor((Date.now() - gameState.sessionStartTime) / 1000);
    const critRate = gameState.totalClicks > 0 ? ((gameState.criticalHits / gameState.totalClicks) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <h3>Statistics</h3>
        <div class="panel-stats-grid">
            <div class="panel-stat-section">
                <h4>Kills</h4>
                <div class="panel-stat-row"><span>Current:</span><span>${formatNumber(gameState.kills)}</span></div>
                <div class="panel-stat-row"><span>Total:</span><span>${formatNumber(gameState.totalKills)}</span></div>
                <div class="panel-stat-row"><span>Lifetime:</span><span>${formatNumber(gameState.lifetimeKills + gameState.totalKills)}</span></div>
                <div class="panel-stat-row"><span>Per Click:</span><span>${formatNumber(gameState.killsPerClick)}</span></div>
                <div class="panel-stat-row"><span>Per Second:</span><span>${formatNumber(gameState.killsPerSecond)}</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>Strikes</h4>
                <div class="panel-stat-row"><span>Total:</span><span>${formatNumber(gameState.totalClicks)}</span></div>
                <div class="panel-stat-row"><span>Criticals:</span><span>${formatNumber(gameState.criticalHits)}</span></div>
                <div class="panel-stat-row"><span>Crit Rate:</span><span>${critRate}%</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>Encounters</h4>
                <div class="panel-stat-row"><span>Bosses:</span><span>${gameState.bossesDefeated}</span></div>
                <div class="panel-stat-row"><span>Waves:</span><span>${gameState.wavesCompleted}</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>Time</h4>
                <div class="panel-stat-row"><span>Total:</span><span>${formatTime(currentPlayTime)}</span></div>
            </div>
        </div>
    `;
}

function renderAchievementsTab() {
    const container = document.getElementById('tab-achievements');
    if (!container) return;

    const unlockedCount = gameState.unlockedAchievements.length;
    const totalCount = achievements.length;

    let html = `
        <h3>Achievements</h3>
        <div class="panel-achievements-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(unlockedCount/totalCount)*100}%"></div>
            </div>
            <span>${unlockedCount}/${totalCount}</span>
        </div>
        <div class="panel-achievements-grid">
    `;

    achievements.forEach(ach => {
        const unlocked = gameState.unlockedAchievements.includes(ach.id);
        html += `
            <div class="panel-achievement ${unlocked ? 'unlocked' : 'locked'}" title="${ach.description}" aria-label="${ach.name}, ${unlocked ? 'earned' : 'locked'}">
                <span class="panel-achievement-icon" aria-hidden="true">${unlocked ? '✓' : '◇'}</span>
                <span class="panel-achievement-name">${ach.name}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function onSaveClick() {
    if (!saveGame()) { showNotification('Saving unavailable in this browser'); return; }
    SoundManager.playPurchase();
    showNotification('Game saved!');
}

// ===== SOUND TOGGLE =====
function updateSoundButton() {
    const button = elements.soundBtn;
    if (!button) return;
    const enabled = gameState.soundEnabled;
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
    button.title = enabled ? 'Mute sound (S)' : 'Enable sound (S)';
    const icon = button.querySelector('use');
    if (icon) icon.setAttribute('href', enabled ? '#i-sound' : '#i-muted');
    const label = button.querySelector('[data-sound-label]');
    if (label) label.textContent = enabled ? 'Sound on' : 'Sound off';
}

function toggleSound() {
    gameState.soundEnabled = SoundManager.toggle();
    updateSoundButton();
    saveGame();
}

// ===== INITIALIZATION =====
function init() {
    logVersion();
    loadGame();
    initUpgrades();
    calculatePrestigeBonuses();
    SoundManager.enabled = gameState.soundEnabled;
    updateSoundButton();
    showVersionInUI();
    checkDailyReward();
    checkLocationUnlocks();
    applyLocationTheme();
    setupKeyboardControls();

    elements.zombieTarget.addEventListener('click', onZombieClick);
    elements.saveBtn.addEventListener('click', onSaveClick);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.soundBtn?.addEventListener('click', toggleSound);
    elements.togglePanelBtn?.addEventListener('click', toggleSidePanel);
    document.getElementById('overdrive-btn')?.addEventListener('click', activateOverdrive);
    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    renderLocationsTab();
    setInterval(saveGame, 30000);
    setInterval(autoKillTick, 1000);
    setInterval(eventTick, 1000);
    setInterval(() => { if (sidePanelOpen && currentTab === 'stats') renderStatsTab(); }, 1000);
    setInterval(decayCombo, 100);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
    window.addEventListener('pagehide', saveGame);
}

// Start the game!
init();
