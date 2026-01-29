// ===== ZOMBIE CLICKER - GAME LOGIC =====

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

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    playClick() {
        this.playTone(200, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(150, 0.05, 'square', 0.1), 30);
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

// ===== ZOMBIE TYPES =====
const zombieTypes = [
    { emoji: '🧟', name: 'Zombie' },
    { emoji: '🧟‍♂️', name: 'Male Zombie' },
    { emoji: '🧟‍♀️', name: 'Female Zombie' },
    { emoji: '💀', name: 'Skeleton' },
    { emoji: '👻', name: 'Ghost' },
    { emoji: '🦴', name: 'Bones' },
    { emoji: '😈', name: 'Demon' },
    { emoji: '👹', name: 'Ogre' },
    { emoji: '👺', name: 'Goblin' },
    { emoji: '🎃', name: 'Pumpkin Head' }
];

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
    zombieEmoji: null,
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

function getRandomZombie() {
    const location = getCurrentLocation();
    // 50% chance to use location-specific zombies
    if (location && location.specialZombies && Math.random() < 0.5) {
        const emoji = location.specialZombies[Math.floor(Math.random() * location.specialZombies.length)];
        return { emoji, name: 'Zombie' };
    }
    return zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
}

function changeZombie() {
    if (gameState.bossActive) return; // Don't change during boss
    const zombie = getRandomZombie();
    if (elements.zombieEmoji) {
        elements.zombieEmoji.textContent = zombie.emoji;
    }
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

    gameState.currentLocation = locationId;
    applyLocationTheme();
    SoundManager.playPurchase();
    saveGame();
}

function applyLocationTheme() {
    const location = getCurrentLocation();
    if (!location) return;

    // Apply background gradient
    document.body.style.background = location.background;

    // Update zombie target glow color
    const root = document.documentElement;
    root.style.setProperty('--location-color', location.ambientColor);

    // Update location name display
    if (elements.locationName) {
        elements.locationName.textContent = location.name;
    }

    // Apply themed background elements
    createLocationBackground(location);

    // Start weather effects for this location
    startWeatherEffects();

    // Change zombie to location type
    changeZombie();
}

function createLocationBackground(location) {
    // Remove existing background elements
    const existingBg = document.querySelector('.location-bg-elements');
    if (existingBg) existingBg.remove();

    // Create container for background elements
    const bgContainer = document.createElement('div');
    bgContainer.className = 'location-bg-elements';

    // Create many more floating background emojis with varied sizes
    if (location.bgElements && location.bgElements.length > 0) {
        // Create 40 elements for a fuller background
        for (let i = 0; i < 40; i++) {
            const element = document.createElement('div');
            element.className = 'bg-element';
            element.textContent = location.bgElements[Math.floor(Math.random() * location.bgElements.length)];

            // Random positioning across entire screen
            element.style.left = Math.random() * 100 + '%';
            element.style.top = Math.random() * 100 + '%';
            element.style.animationDelay = (Math.random() * 15) + 's';
            element.style.animationDuration = (10 + Math.random() * 25) + 's';

            // More varied opacity - some more visible
            element.style.opacity = 0.08 + Math.random() * 0.25;

            // Much more varied sizes - from tiny to large
            const sizeCategory = Math.random();
            let fontSize;
            if (sizeCategory < 0.3) {
                fontSize = 1 + Math.random() * 1.5; // Small: 1-2.5rem
            } else if (sizeCategory < 0.7) {
                fontSize = 2.5 + Math.random() * 2; // Medium: 2.5-4.5rem
            } else if (sizeCategory < 0.9) {
                fontSize = 4.5 + Math.random() * 3; // Large: 4.5-7.5rem
            } else {
                fontSize = 7 + Math.random() * 5; // Extra large: 7-12rem
            }
            element.style.fontSize = fontSize + 'rem';

            // Random rotation for variety
            element.style.transform = `rotate(${Math.random() * 360}deg)`;

            bgContainer.appendChild(element);
        }
    }

    document.body.appendChild(bgContainer);
}

function showLocationsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const currentLoc = getCurrentLocation();
    let locationsHTML = locations.map(location => {
        const unlocked = gameState.unlockedLocations.includes(location.id);
        const current = location.id === gameState.currentLocation;
        const bonusPercent = Math.round((location.zombieBonus - 1) * 100);

        return `
            <div class="location-card ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}"
                 data-location-id="${location.id}">
                <div class="location-preview" style="background: ${location.background}">
                    <span class="location-icon">${location.name.split(' ')[0]}</span>
                </div>
                <div class="location-info">
                    <div class="location-card-name">${unlocked ? location.name : '🔒 ???'}</div>
                    <div class="location-card-desc">${unlocked ? location.description : `Unlock at ${formatNumber(location.unlockKills)} kills`}</div>
                    ${unlocked ? `<div class="location-card-bonus">+${bonusPercent}% Kill Bonus</div>` : ''}
                    ${current ? '<div class="location-current-badge">CURRENT</div>' : ''}
                </div>
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="modal-content locations-modal">
            <h2>🗺️ Locations</h2>
            <div class="current-location-info">
                <span>Current Location:</span>
                <span class="current-location-name">${currentLoc.name}</span>
                <span class="current-location-bonus">+${Math.round((currentLoc.zombieBonus - 1) * 100)}% Kill Bonus</span>
            </div>
            <div class="locations-grid">
                ${locationsHTML}
            </div>
            <button class="modal-close">Close</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add click handlers for locations
    overlay.querySelectorAll('.location-card.unlocked:not(.current)').forEach(card => {
        card.addEventListener('click', () => {
            const locationId = card.getAttribute('data-location-id');
            switchLocation(locationId);
            overlay.remove();
            showLocationsModal(); // Refresh
        });
    });

    overlay.querySelector('.modal-close').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

// ===== PARTICLE EFFECTS SYSTEM =====
function createParticle(x, y, type = 'blood') {
    if (!elements.particleContainer) return;

    const particle = document.createElement('div');
    particle.className = `particle particle-${type}`;

    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;

    particle.style.left = (x + offsetX) + 'px';
    particle.style.top = (y + offsetY) + 'px';

    // Random particle properties
    const size = Math.random() * 8 + 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    elements.particleContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function createParticleBurst(x, y, count = 5, type = 'blood') {
    for (let i = 0; i < count; i++) {
        setTimeout(() => createParticle(x, y, type), i * 30);
    }
}

function createScreenShake(intensity = 5) {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;

    gameContainer.style.animation = 'none';
    gameContainer.offsetHeight; // Trigger reflow
    gameContainer.style.animation = `shake ${intensity * 0.05}s ease`;
}

// ===== BLOOD SPLATTER EFFECT =====
function createBloodSplatter(x, y, intensity = 1) {
    const splatterContainer = document.getElementById('particle-container');
    if (!splatterContainer) return;

    const splatCount = Math.floor(5 + intensity * 5);

    for (let i = 0; i < splatCount; i++) {
        const splat = document.createElement('div');
        splat.className = 'blood-splat';

        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 80 * intensity;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        splat.style.left = x + 'px';
        splat.style.top = y + 'px';
        splat.style.setProperty('--end-x', endX + 'px');
        splat.style.setProperty('--end-y', endY + 'px');
        splat.style.setProperty('--size', (5 + Math.random() * 10 * intensity) + 'px');

        splatterContainer.appendChild(splat);
        setTimeout(() => splat.remove(), 1000);
    }
}

// ===== WEATHER EFFECTS SYSTEM =====
let weatherInterval = null;

function startWeatherEffects() {
    const location = getCurrentLocation();
    stopWeatherEffects();

    // Remove existing weather container
    const existingWeather = document.getElementById('weather-container');
    if (existingWeather) existingWeather.remove();

    // Create weather container
    const weatherContainer = document.createElement('div');
    weatherContainer.id = 'weather-container';
    weatherContainer.className = 'weather-container';
    document.body.appendChild(weatherContainer);

    switch(location.weather) {
        case 'rain':
            startRain(weatherContainer);
            break;
        case 'fog':
            startFog(weatherContainer);
            break;
        case 'dust':
            startDust(weatherContainer);
            break;
        case 'storm':
            startStorm(weatherContainer);
            break;
        case 'toxic':
            startToxic(weatherContainer);
            break;
        case 'embers':
            startEmbers(weatherContainer);
            break;
        case 'stars':
            startStars(weatherContainer);
            break;
    }
}

function stopWeatherEffects() {
    if (weatherInterval) {
        clearInterval(weatherInterval);
        weatherInterval = null;
    }
}

function startRain(container) {
    container.classList.add('weather-rain');
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDelay = Math.random() * 2 + 's';
        drop.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
        container.appendChild(drop);
    }
}

function startFog(container) {
    container.classList.add('weather-fog');
    for (let i = 0; i < 5; i++) {
        const fog = document.createElement('div');
        fog.className = 'fog-layer';
        fog.style.animationDelay = (i * 3) + 's';
        fog.style.opacity = 0.1 + Math.random() * 0.1;
        container.appendChild(fog);
    }
}

function startDust(container) {
    container.classList.add('weather-dust');
    for (let i = 0; i < 50; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust-particle';
        dust.style.left = Math.random() * 100 + '%';
        dust.style.top = Math.random() * 100 + '%';
        dust.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(dust);
    }
}

function startStorm(container) {
    container.classList.add('weather-storm');
    // Rain
    for (let i = 0; i < 150; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop heavy';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDelay = Math.random() * 1 + 's';
        drop.style.animationDuration = (0.3 + Math.random() * 0.2) + 's';
        container.appendChild(drop);
    }
    // Lightning
    weatherInterval = setInterval(() => {
        if (Math.random() < 0.3) {
            triggerLightning(container);
        }
    }, 3000);
}

function triggerLightning(container) {
    const flash = document.createElement('div');
    flash.className = 'lightning-flash';
    container.appendChild(flash);
    SoundManager.playThunder();
    setTimeout(() => flash.remove(), 200);
}

function startToxic(container) {
    container.classList.add('weather-toxic');
    for (let i = 0; i < 30; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'toxic-bubble';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDelay = Math.random() * 5 + 's';
        bubble.style.animationDuration = (3 + Math.random() * 4) + 's';
        container.appendChild(bubble);
    }
}

function startEmbers(container) {
    container.classList.add('weather-embers');
    for (let i = 0; i < 60; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember';
        ember.style.left = Math.random() * 100 + '%';
        ember.style.animationDelay = Math.random() * 5 + 's';
        ember.style.animationDuration = (2 + Math.random() * 3) + 's';
        container.appendChild(ember);
    }
}

function startStars(container) {
    container.classList.add('weather-stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 50 + '%';
        star.style.animationDelay = Math.random() * 10 + 's';
        star.style.animationDuration = (1 + Math.random() * 2) + 's';
        container.appendChild(star);
    }
}

// ===== DAY/NIGHT CYCLE =====
function updateDayNightCycle() {
    gameState.timeOfDay = (gameState.timeOfDay + 0.1) % 100;

    const root = document.documentElement;
    let brightness, overlay;

    // 0-25: Dawn, 25-50: Day, 50-75: Dusk, 75-100: Night
    if (gameState.timeOfDay < 25) {
        // Dawn - getting lighter
        brightness = 0.7 + (gameState.timeOfDay / 25) * 0.3;
        overlay = `rgba(255, 200, 150, ${0.1 - (gameState.timeOfDay / 25) * 0.1})`;
    } else if (gameState.timeOfDay < 50) {
        // Day - bright
        brightness = 1;
        overlay = 'rgba(0, 0, 0, 0)';
    } else if (gameState.timeOfDay < 75) {
        // Dusk - getting darker
        brightness = 1 - ((gameState.timeOfDay - 50) / 25) * 0.4;
        overlay = `rgba(255, 100, 50, ${((gameState.timeOfDay - 50) / 25) * 0.15})`;
    } else {
        // Night - dark
        brightness = 0.6;
        overlay = `rgba(0, 0, 50, 0.2)`;
    }

    root.style.setProperty('--day-brightness', brightness);
    root.style.setProperty('--day-overlay', overlay);
}

// ===== SCREEN EFFECTS (VIGNETTE & GLOW) =====
function updateScreenEffects() {
    const root = document.documentElement;

    // Power level glow (based on kills per click)
    const powerLevel = Math.min(gameState.killsPerClick / 1000, 1);
    const glowIntensity = powerLevel * 20;
    root.style.setProperty('--power-glow', `0 0 ${glowIntensity}px rgba(255, 215, 0, ${powerLevel * 0.3})`);

    // Vignette intensity (stronger during bosses/waves)
    let vignetteIntensity = 0.3;
    if (gameState.bossActive) vignetteIntensity = 0.5;
    if (gameState.waveActive) vignetteIntensity = 0.4;
    root.style.setProperty('--vignette-intensity', vignetteIntensity);

    // Combo glow
    if (gameState.comboCount > 5) {
        const comboGlow = Math.min(gameState.comboCount / 50, 1);
        root.style.setProperty('--combo-glow', `0 0 ${comboGlow * 30}px rgba(255, 100, 0, ${comboGlow * 0.5})`);
    } else {
        root.style.setProperty('--combo-glow', 'none');
    }
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

    if (!gameState.bossActive && !gameState.waveActive && !gameState.goldenZombieActive) {
        if (Math.random() < goldenChance) {
            spawnGoldenZombie();
        }
    }
}

function spawnGoldenZombie() {
    gameState.goldenZombieActive = true;

    elements.zombieTarget.classList.add('golden-zombie');
    if (elements.zombieEmoji) {
        elements.zombieEmoji.textContent = '👑';
    }

    SoundManager.playGoldenZombie();
    showSideNotification({
        title: '✨ GOLDEN ZOMBIE!',
        icon: '👑',
        message: 'Quick! Click for 10x rewards!',
        type: 'golden'
    });

    // Golden zombie only lasts 3 seconds
    setTimeout(() => {
        if (gameState.goldenZombieActive) {
            gameState.goldenZombieActive = false;
            elements.zombieTarget.classList.remove('golden-zombie');
            changeZombie();
        }
    }, 3000);
}

function clickGoldenZombie() {
    gameState.goldenZombieActive = false;
    gameState.goldenZombiesClicked++;

    elements.zombieTarget.classList.remove('golden-zombie');

    // 10x rewards + prestige golden multiplier
    const goldenMult = 10 * (gameState.prestigeBonuses.goldenMultiplier || 1);
    const bonus = Math.floor(getEffectiveClickPower() * goldenMult);
    gameState.kills += bonus;
    gameState.totalKills += bonus;

    // Big visual feedback
    const rect = elements.zombieTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    createParticleBurst(x, y, 20, 'gold');
    createScreenShake(15);

    showSideNotification({
        title: '💰 JACKPOT!',
        icon: '👑',
        message: 'Golden zombie slain!',
        bonus: `+${formatNumber(bonus)} kills!`,
        type: 'golden'
    });

    SoundManager.playGoldenZombie();
    changeZombie();
    checkAchievements();
}

// ===== DAILY REWARDS SYSTEM =====
function checkDailyReward() {
    const now = Date.now();
    const lastReward = gameState.lastDailyReward || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const twoDaysMs = 2 * oneDayMs;

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
    document.addEventListener('keydown', (e) => {
        // Spacebar or Enter to click zombie
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            simulateZombieClick();
        }

        // M to toggle menu panel
        if (e.code === 'KeyM') {
            toggleSidePanel();
        }

        // S to toggle sound
        if (e.code === 'KeyS' && !e.ctrlKey) {
            toggleSound();
        }

        // Number keys 1-4 for tabs
        if (e.code === 'Digit1') switchTab('locations');
        if (e.code === 'Digit2') switchTab('prestige');
        if (e.code === 'Digit3') switchTab('stats');
        if (e.code === 'Digit4') switchTab('achievements');
    });
}

function simulateZombieClick() {
    // Create a synthetic click event
    const rect = elements.zombieTarget.getBoundingClientRect();
    const event = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
    };

    onZombieClick(event);
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
    return Math.floor(gameState.killsPerClick * gameState.prestigeBonuses.clickMultiplier * locationBonus);
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

function spawnBoss() {
    if (gameState.bossActive || gameState.waveActive) return;

    const boss = getBossForLevel();
    gameState.bossActive = true;
    gameState.currentBoss = boss;
    gameState.bossHealth = boss.health;
    gameState.bossMaxHealth = boss.health;
    gameState.bossTimer = gameState.bossDuration + gameState.prestigeBonuses.eventTime;

    // Update display
    if (elements.zombieEmoji) {
        elements.zombieEmoji.textContent = boss.emoji;
    }
    elements.zombieTarget.classList.add('boss-active');

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
    changeZombie();
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
    changeZombie();
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
function startWave() {
    if (gameState.waveActive || gameState.bossActive) return;

    gameState.waveNumber++;
    gameState.waveActive = true;
    gameState.waveKills = 0;
    gameState.waveTarget = Math.floor(50 * Math.pow(1.3, gameState.waveNumber - 1));
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
    let bonus = Math.floor(gameState.waveTarget * gameState.waveMultiplier * 10);
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
    if (gameState.bossActive) {
        gameState.bossTimer--;
        if (gameState.bossTimer <= 0) {
            bossFailed();
        } else {
            // Boss takes auto damage
            if (gameState.killsPerSecond > 0) {
                damageBoss(gameState.killsPerSecond);
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

function showPrestigeModal() {
    const potentialPoints = calculatePrestigePoints();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Build upgrade tree HTML
    let upgradeTreeHTML = '';
    for (let row = 1; row <= 4; row++) {
        const rowUpgrades = prestigeUpgrades.filter(u => u.row === row);
        const rowRequires = rowUpgrades[0]?.requires || 0;
        const pointsSpent = getPrestigeUpgradePointsSpent(row);
        const rowUnlocked = pointsSpent >= rowRequires;

        upgradeTreeHTML += `
            <div class="prestige-row ${rowUnlocked ? '' : 'locked'}">
                <div class="prestige-row-header">
                    <span>Tier ${row}</span>
                    ${rowRequires > 0 ? `<span class="prestige-requires">(Requires ${rowRequires} points spent)</span>` : ''}
                </div>
                <div class="prestige-row-upgrades">
        `;

        rowUpgrades.forEach(upgrade => {
            const level = gameState.prestigeUpgrades[upgrade.id] || 0;
            const canBuy = canBuyPrestigeUpgrade(upgrade);
            const maxed = level >= upgrade.maxLevel;

            upgradeTreeHTML += `
                <div class="prestige-upgrade ${maxed ? 'maxed' : ''} ${canBuy ? 'affordable' : ''}"
                     data-upgrade-id="${upgrade.id}">
                    <div class="prestige-upgrade-name">${upgrade.name}</div>
                    <div class="prestige-upgrade-desc">${upgrade.description}</div>
                    <div class="prestige-upgrade-level">${level}/${upgrade.maxLevel}</div>
                    <div class="prestige-upgrade-cost">${maxed ? 'MAXED' : `⭐ ${upgrade.cost}`}</div>
                </div>
            `;
        });

        upgradeTreeHTML += `
                </div>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div class="modal-content prestige-modal">
            <h2>⭐ Prestige System</h2>

            <div class="prestige-info">
                <div class="prestige-stat">
                    <span>Current Points:</span>
                    <span class="prestige-value">⭐ ${gameState.prestigePoints}</span>
                </div>
                <div class="prestige-stat">
                    <span>Prestige Count:</span>
                    <span class="prestige-value">🔄 ${gameState.prestigeCount}</span>
                </div>
                <div class="prestige-stat">
                    <span>Total Kills This Run:</span>
                    <span class="prestige-value">💀 ${formatNumber(gameState.totalKills)}</span>
                </div>
                <div class="prestige-stat potential">
                    <span>Points if you prestige now:</span>
                    <span class="prestige-value">⭐ ${potentialPoints}</span>
                </div>
            </div>

            <button class="prestige-btn ${potentialPoints > 0 ? 'available' : 'unavailable'}" id="do-prestige">
                ${potentialPoints > 0 ? `🌟 Prestige for ${potentialPoints} Points!` : '🔒 Need 100K kills to prestige'}
            </button>

            <div class="prestige-bonuses">
                <h3>🎖️ Current Bonuses</h3>
                <div class="bonus-grid">
                    <div class="bonus-item">Click Power: <span>+${Math.round((gameState.prestigeBonuses.clickMultiplier - 1) * 100)}%</span></div>
                    <div class="bonus-item">Auto Power: <span>+${Math.round((gameState.prestigeBonuses.autoMultiplier - 1) * 100)}%</span></div>
                    <div class="bonus-item">Crit Chance: <span>+${Math.round(gameState.prestigeBonuses.critChance * 100)}%</span></div>
                    <div class="bonus-item">Crit Damage: <span>+${Math.round(gameState.prestigeBonuses.critMultiplier * 100)}%</span></div>
                    <div class="bonus-item">Cost Reduction: <span>-${Math.round(gameState.prestigeBonuses.costReduction * 100)}%</span></div>
                    <div class="bonus-item">Boss Damage: <span>+${Math.round((gameState.prestigeBonuses.bossMultiplier - 1) * 100)}%</span></div>
                </div>
            </div>

            <h3>🌳 Upgrade Tree</h3>
            <div class="prestige-tree">
                ${upgradeTreeHTML}
            </div>

            <button class="modal-close">Close</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add click handlers for prestige upgrades
    overlay.querySelectorAll('.prestige-upgrade').forEach(el => {
        el.addEventListener('click', () => {
            const upgradeId = el.getAttribute('data-upgrade-id');
            const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
            if (upgrade && canBuyPrestigeUpgrade(upgrade)) {
                buyPrestigeUpgrade(upgrade);
                // Refresh the modal
                overlay.remove();
                showPrestigeModal();
            }
        });
    });

    // Prestige button
    overlay.querySelector('#do-prestige').addEventListener('click', () => {
        if (potentialPoints > 0) {
            overlay.remove();
            doPrestige();
        }
    });

    overlay.querySelector('.modal-close').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
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
    popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
        </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

function showAchievementsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const unlockedCount = gameState.unlockedAchievements.length;
    const totalCount = achievements.length;

    let achievementsHTML = achievements.map(ach => {
        const unlocked = gameState.unlockedAchievements.includes(ach.id);
        return `
            <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-item-icon">${unlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-item-details">
                    <div class="achievement-item-name">${unlocked ? ach.name : '???'}</div>
                    <div class="achievement-item-desc">${unlocked ? ach.description : 'Keep playing to unlock!'}</div>
                </div>
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="modal-content achievements-modal">
            <h2>🏅 Achievements (${unlockedCount}/${totalCount})</h2>
            <div class="achievements-progress">
                <div class="achievements-bar" style="width: ${(unlockedCount/totalCount)*100}%"></div>
            </div>
            <div class="achievements-list">
                ${achievementsHTML}
            </div>
            <button class="modal-close">Close</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.modal-close').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

// ===== STATISTICS MODAL =====
function showStatsModal() {
    const currentPlayTime = gameState.totalPlayTime + Math.floor((Date.now() - gameState.sessionStartTime) / 1000);
    const avgKillsPerClick = gameState.totalClicks > 0 ? Math.floor(gameState.totalKills / gameState.totalClicks) : 0;
    const critRate = gameState.totalClicks > 0 ? ((gameState.criticalHits / gameState.totalClicks) * 100).toFixed(1) : 0;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content stats-modal">
            <h2>📊 Statistics</h2>
            <div class="stats-grid">
                <div class="stats-category">
                    <h3>💀 Kills</h3>
                    <div class="stats-row"><span>Current Kills:</span><span>${formatNumber(gameState.kills)}</span></div>
                    <div class="stats-row"><span>Total Kills:</span><span>${formatNumber(gameState.totalKills)}</span></div>
                    <div class="stats-row"><span>Kills Per Click:</span><span>${formatNumber(gameState.killsPerClick)}</span></div>
                    <div class="stats-row"><span>Kills Per Second:</span><span>${formatNumber(gameState.killsPerSecond)}</span></div>
                </div>
                <div class="stats-category">
                    <h3>🖱️ Clicks</h3>
                    <div class="stats-row"><span>Total Clicks:</span><span>${formatNumber(gameState.totalClicks)}</span></div>
                    <div class="stats-row"><span>Critical Hits:</span><span>${formatNumber(gameState.criticalHits)}</span></div>
                    <div class="stats-row"><span>Crit Rate:</span><span>${critRate}%</span></div>
                    <div class="stats-row"><span>Avg Kills/Click:</span><span>${formatNumber(avgKillsPerClick)}</span></div>
                </div>
                <div class="stats-category">
                    <h3>👹 Events</h3>
                    <div class="stats-row"><span>Bosses Defeated:</span><span>${gameState.bossesDefeated}</span></div>
                    <div class="stats-row"><span>Waves Completed:</span><span>${gameState.wavesCompleted}</span></div>
                </div>
                <div class="stats-category">
                    <h3>⏱️ Time</h3>
                    <div class="stats-row"><span>Total Play Time:</span><span>${formatTime(currentPlayTime)}</span></div>
                    <div class="stats-row"><span>This Session:</span><span>${formatTime(Math.floor((Date.now() - gameState.sessionStartTime) / 1000))}</span></div>
                </div>
                <div class="stats-category">
                    <h3>🏆 Records</h3>
                    <div class="stats-row"><span>Best Kills/Click:</span><span>${formatNumber(gameState.highestKillsPerClick)}</span></div>
                    <div class="stats-row"><span>Best Kills/Sec:</span><span>${formatNumber(gameState.highestKillsPerSecond)}</span></div>
                    <div class="stats-row"><span>Achievements:</span><span>${gameState.unlockedAchievements.length}/${achievements.length}</span></div>
                </div>
            </div>
            <button class="modal-close">Close</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.modal-close').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

// ===== MILESTONE SYSTEM =====
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
    elements.killCount.textContent = formatNumber(gameState.kills);
    elements.perClick.textContent = formatNumber(gameState.killsPerClick);
    elements.perSecond.textContent = formatNumber(gameState.killsPerSecond);
    elements.totalKilled.textContent = formatNumber(gameState.totalKills);

    if (gameState.killsPerClick > gameState.highestKillsPerClick) {
        gameState.highestKillsPerClick = gameState.killsPerClick;
    }
    if (gameState.killsPerSecond > gameState.highestKillsPerSecond) {
        gameState.highestKillsPerSecond = gameState.killsPerSecond;
    }

    renderUpgrades();
}

function createFloatingNumber(amount, x, y, isCritical = false, isBoss = false) {
    const floatingNum = document.createElement('div');
    let className = 'floating-number';
    if (isCritical) className += ' critical';
    if (isBoss) className += ' boss-damage';
    floatingNum.className = className;

    let prefix = '+';
    if (isCritical) prefix = 'CRIT! +';
    if (isBoss) prefix = '💥 -';

    floatingNum.textContent = prefix + formatNumber(amount);

    const offsetX = (Math.random() - 0.5) * 100;
    floatingNum.style.left = (x + offsetX) + 'px';
    floatingNum.style.top = y + 'px';

    elements.floatingNumbers.appendChild(floatingNum);
    setTimeout(() => floatingNum.remove(), 1000);
}

// ===== CLICK HANDLER =====
function onZombieClick(event) {
    if (SoundManager.audioContext && SoundManager.audioContext.state === 'suspended') {
        SoundManager.audioContext.resume();
    }

    // Check for golden zombie first
    if (gameState.goldenZombieActive) {
        clickGoldenZombie();
        return;
    }

    // Update combo system
    updateCombo();

    const isCritical = rollCritical();
    let damage = isCritical ? getCriticalDamage() : getEffectiveClickPower();

    // Apply combo multiplier
    damage = Math.floor(damage * gameState.comboMultiplier);

    // Wave multiplier
    if (gameState.waveActive) {
        damage = Math.floor(damage * gameState.waveMultiplier);
    }

    gameState.totalClicks++;

    // Get position for floating numbers
    const rect = elements.zombieTarget.getBoundingClientRect();
    const containerRect = elements.floatingNumbers.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top - containerRect.top + 50;

    if (gameState.bossActive) {
        // Damage boss instead of getting kills
        if (isCritical) {
            gameState.criticalHits++;
            SoundManager.playCritical();
            elements.zombieTarget.classList.add('critical-hit');
            setTimeout(() => elements.zombieTarget.classList.remove('critical-hit'), 300);
        }

        damageBoss(damage);
        createFloatingNumber(damage, x, y, isCritical, true);
        createBloodSplatter(x + containerRect.left, y + containerRect.top, isCritical ? 2 : 1);
    } else {
        // Normal gameplay
        gameState.kills += damage;
        gameState.totalKills += damage;

        if (isCritical) {
            gameState.criticalHits++;
            SoundManager.playCritical();
            elements.zombieTarget.classList.add('critical-hit');
            setTimeout(() => elements.zombieTarget.classList.remove('critical-hit'), 300);
        } else {
            SoundManager.playClick();
        }

        createFloatingNumber(damage, x, y, isCritical);

        // Blood splatter effect
        createBloodSplatter(x + containerRect.left, y + containerRect.top, isCritical ? 2 : 0.5);

        // Particle effects
        if (isCritical) {
            createParticleBurst(x, y, 10, 'blood');
            createScreenShake(10);
        } else {
            createParticleBurst(x, y, 3, 'blood');
        }

        // Wave kills
        if (gameState.waveActive) {
            addWaveKill(damage);
        }

        if (Math.random() < 0.2) {
            changeZombie();
        }

        // Check for golden zombie spawn
        checkGoldenZombieSpawn();
    }

    elements.zombieTarget.classList.add('clicked');
    setTimeout(() => elements.zombieTarget.classList.remove('clicked'), 150);

    // Update screen effects based on power
    updateScreenEffects();

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

function renderUpgradeCategory(upgradeList, container) {
    container.innerHTML = '';

    upgradeList.forEach(upgrade => {
        const cost = getUpgradeCost(upgrade);
        const owned = gameState.upgrades[upgrade.id] || 0;
        const canAfford = gameState.kills >= cost;

        const btn = document.createElement('button');
        btn.className = 'upgrade-btn' + (canAfford ? ' affordable' : '');
        btn.disabled = !canAfford;

        btn.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                ${owned > 0 ? `<span class="upgrade-owned">${owned}</span>` : ''}
            </div>
            <div class="upgrade-effect">${upgrade.description}</div>
            <div class="upgrade-cost">💀 ${formatNumber(cost)}</div>
        `;

        btn.addEventListener('click', () => purchaseUpgrade(upgrade));
        container.appendChild(btn);
    });
}

function purchaseUpgrade(upgrade) {
    const cost = getUpgradeCost(upgrade);

    if (gameState.kills >= cost) {
        gameState.kills -= cost;
        gameState.upgrades[upgrade.id] = (gameState.upgrades[upgrade.id] || 0) + 1;
        gameState.totalUpgradesBought++;

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

    localStorage.setItem('zombieClickerSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('zombieClickerSave');

    if (saveData) {
        try {
            const data = JSON.parse(saveData);
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
                const offlineSeconds = Math.min((Date.now() - data.savedAt) / 1000, 7200);
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

function resetGame() {
    if (confirm('Are you sure you want to reset? All progress will be lost!')) {
        localStorage.removeItem('zombieClickerSave');

        gameState.kills = 0;
        gameState.totalKills = 0;
        gameState.killsPerClick = 1;
        gameState.killsPerSecond = 0;
        gameState.upgrades = {};
        gameState.unlockedMilestones = [];
        gameState.unlockedAchievements = [];
        gameState.totalClicks = 0;
        gameState.criticalHits = 0;
        gameState.totalUpgradesBought = 0;
        gameState.totalPlayTime = 0;
        gameState.sessionStartTime = Date.now();
        gameState.highestKillsPerClick = 1;
        gameState.highestKillsPerSecond = 0;
        gameState.bossesDefeated = 0;
        gameState.wavesCompleted = 0;
        gameState.waveNumber = 0;
        gameState.bossActive = false;
        gameState.waveActive = false;

        elements.zombieTarget.classList.remove('boss-active', 'wave-active');
        initUpgrades();
        updateDisplay();
        updateEventDisplay();
        showNotification('Game reset!');
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
}

// Non-blocking side notification system
function showSideNotification(options) {
    const { title, icon, message, submessage, bonus, type = 'default' } = options;

    const notification = document.createElement('div');
    notification.className = `side-notification side-notification-${type}`;

    let html = `
        <div class="side-notification-icon">${icon}</div>
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

    // Stack notifications - find existing ones and offset
    const existingNotifications = document.querySelectorAll('.side-notification');
    let offset = 20;
    existingNotifications.forEach(existing => {
        offset += existing.offsetHeight + 10;
    });
    notification.style.top = offset + 'px';

    document.body.appendChild(notification);

    // Auto-remove after delay
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => {
            notification.remove();
            // Reposition remaining notifications
            repositionSideNotifications();
        }, 500);
    }, 4000);
}

function repositionSideNotifications() {
    const notifications = document.querySelectorAll('.side-notification');
    let offset = 20;
    notifications.forEach(notification => {
        notification.style.top = offset + 'px';
        offset += notification.offsetHeight + 10;
    });
}

// ===== SIDE PANEL SYSTEM =====
let sidePanelOpen = false;
let currentTab = 'locations';

function toggleSidePanel() {
    sidePanelOpen = !sidePanelOpen;
    if (elements.sidePanel) {
        elements.sidePanel.classList.toggle('open', sidePanelOpen);
    }
    if (sidePanelOpen) {
        updateTabContent(currentTab);
    }
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
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
        <h3>🗺️ Locations</h3>
        <div class="panel-current-info">
            <span>Current:</span>
            <span class="highlight">${currentLoc.name}</span>
            <span class="bonus">+${Math.round((currentLoc.zombieBonus - 1) * 100)}% Bonus</span>
        </div>
        <div class="panel-locations-grid">
    `;

    locations.forEach(location => {
        const unlocked = gameState.unlockedLocations.includes(location.id);
        const current = location.id === gameState.currentLocation;
        const bonusPercent = Math.round((location.zombieBonus - 1) * 100);

        html += `
            <div class="panel-location-card ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}"
                 data-location-id="${location.id}">
                <div class="panel-location-icon">${location.name.split(' ')[0]}</div>
                <div class="panel-location-name">${unlocked ? location.name.replace(/^[^\s]+\s/, '') : '???'}</div>
                ${unlocked ? `<div class="panel-location-bonus">+${bonusPercent}%</div>` :
                           `<div class="panel-location-locked">${formatNumber(location.unlockKills)}</div>`}
                ${current ? '<div class="panel-current-badge">✓</div>' : ''}
            </div>
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
        <h3>⭐ Prestige</h3>
        <div class="panel-prestige-info">
            <div class="prestige-stat-row">
                <span>Points:</span>
                <span class="highlight">⭐ ${gameState.prestigePoints}</span>
            </div>
            <div class="prestige-stat-row">
                <span>Prestige Count:</span>
                <span class="highlight">🔄 ${gameState.prestigeCount}</span>
            </div>
            <div class="prestige-stat-row">
                <span>Total Kills:</span>
                <span>${formatNumber(gameState.totalKills)}</span>
            </div>
            <div class="prestige-stat-row potential">
                <span>If prestige now:</span>
                <span class="highlight">⭐ ${potentialPoints}</span>
            </div>
        </div>
        <button class="panel-prestige-btn ${potentialPoints > 0 ? 'available' : ''}" id="panel-do-prestige">
            ${potentialPoints > 0 ? `🌟 Prestige (${potentialPoints} pts)` : '🔒 Need 100K kills'}
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

    for (let row = 1; row <= 4; row++) {
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
                <div class="panel-upgrade ${maxed ? 'maxed' : ''} ${canBuy ? 'affordable' : ''}"
                     data-upgrade-id="${upgrade.id}" title="${upgrade.description}">
                    <div class="panel-upgrade-icon">${upgrade.name.split(' ')[0]}</div>
                    <div class="panel-upgrade-level">${level}/${upgrade.maxLevel}</div>
                </div>
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
        <h3>📊 Statistics</h3>
        <div class="panel-stats-grid">
            <div class="panel-stat-section">
                <h4>💀 Kills</h4>
                <div class="panel-stat-row"><span>Current:</span><span>${formatNumber(gameState.kills)}</span></div>
                <div class="panel-stat-row"><span>Total:</span><span>${formatNumber(gameState.totalKills)}</span></div>
                <div class="panel-stat-row"><span>Lifetime:</span><span>${formatNumber(gameState.lifetimeKills + gameState.totalKills)}</span></div>
                <div class="panel-stat-row"><span>Per Click:</span><span>${formatNumber(gameState.killsPerClick)}</span></div>
                <div class="panel-stat-row"><span>Per Second:</span><span>${formatNumber(gameState.killsPerSecond)}</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>🖱️ Clicks</h4>
                <div class="panel-stat-row"><span>Total:</span><span>${formatNumber(gameState.totalClicks)}</span></div>
                <div class="panel-stat-row"><span>Criticals:</span><span>${formatNumber(gameState.criticalHits)}</span></div>
                <div class="panel-stat-row"><span>Crit Rate:</span><span>${critRate}%</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>👹 Events</h4>
                <div class="panel-stat-row"><span>Bosses:</span><span>${gameState.bossesDefeated}</span></div>
                <div class="panel-stat-row"><span>Waves:</span><span>${gameState.wavesCompleted}</span></div>
            </div>
            <div class="panel-stat-section">
                <h4>⏱️ Time</h4>
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
        <h3>🏅 Achievements</h3>
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
            <div class="panel-achievement ${unlocked ? 'unlocked' : 'locked'}" title="${unlocked ? ach.description : 'Keep playing!'}">
                <span class="panel-achievement-icon">${unlocked ? ach.icon : '🔒'}</span>
                <span class="panel-achievement-name">${unlocked ? ach.name : '???'}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ===== MOVING TARGET SYSTEM =====
let targetMoveInterval = null;
let targetMorphInterval = null;

function startTargetMovement() {
    // Move target every 8-15 seconds
    targetMoveInterval = setInterval(() => {
        if (!gameState.bossActive && !gameState.waveActive) {
            moveTarget();
        }
    }, 8000 + Math.random() * 7000);

    // Morph target every 12-20 seconds
    targetMorphInterval = setInterval(() => {
        if (!gameState.bossActive && !gameState.waveActive) {
            morphTarget();
        }
    }, 12000 + Math.random() * 8000);
}

function moveTarget() {
    const target = elements.zombieTarget;
    if (!target) return;

    // Random position within click section bounds
    const maxX = 30; // percentage offset
    const maxY = 20;

    const offsetX = (Math.random() - 0.5) * maxX * 2;
    const offsetY = (Math.random() - 0.5) * maxY * 2;

    target.style.transition = 'transform 1s ease-in-out';
    target.style.transform = `translate(${offsetX}%, ${offsetY}%)`;

    // Reset after a while
    setTimeout(() => {
        if (Math.random() < 0.3) {
            target.style.transform = 'translate(0, 0)';
        }
    }, 5000);
}

function morphTarget() {
    const target = elements.zombieTarget;
    if (!target) return;

    // Random size change
    const sizeMultiplier = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x

    // Random shape (border-radius)
    const shapes = [
        '50%', // Circle
        '40%', // Rounded
        '30% 70% 70% 30% / 30% 30% 70% 70%', // Blob 1
        '60% 40% 30% 70% / 60% 30% 70% 40%', // Blob 2
        '40% 60% 60% 40% / 70% 30% 30% 70%', // Blob 3
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    target.style.transition = 'width 1.5s ease, height 1.5s ease, border-radius 1.5s ease';
    target.style.width = `${180 * sizeMultiplier}px`;
    target.style.height = `${180 * sizeMultiplier}px`;
    target.style.borderRadius = shape;

    // Emit a visual pulse when morphing
    target.classList.add('morphing');
    setTimeout(() => target.classList.remove('morphing'), 500);
}

function onSaveClick() {
    saveGame();
    SoundManager.playPurchase();
    showNotification('Game saved!');
}

// ===== SOUND TOGGLE =====
function updateSoundButton() {
    if (elements.soundBtn) {
        elements.soundBtn.textContent = gameState.soundEnabled ? '🔊 Sound' : '🔇 Muted';
    }
}

function toggleSound() {
    gameState.soundEnabled = SoundManager.toggle();
    updateSoundButton();
    saveGame();
}

// ===== INITIALIZATION =====
function init() {
    SoundManager.init();
    elements.zombieEmoji = document.querySelector('.zombie-emoji');
    elements.eventDisplay = document.getElementById('event-display');
    elements.particleContainer = document.getElementById('particle-container');
    elements.locationName = document.getElementById('location-name');

    initUpgrades();
    loadGame();
    applyLocationTheme();
    updateDisplay();
    changeZombie();

    // Start weather effects for current location
    startWeatherEffects();

    // Check daily reward on load
    checkDailyReward();

    // Setup keyboard controls
    setupKeyboardControls();

    // Initialize screen effects
    updateScreenEffects();

    elements.zombieTarget.addEventListener('click', onZombieClick);
    elements.saveBtn.addEventListener('click', onSaveClick);
    elements.resetBtn.addEventListener('click', resetGame);

    if (elements.soundBtn) {
        elements.soundBtn.addEventListener('click', toggleSound);
    }

    // Side panel toggle
    if (elements.togglePanelBtn) {
        elements.togglePanelBtn.addEventListener('click', toggleSidePanel);
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Initialize side panel content
    renderLocationsTab();

    // Start moving target system
    startTargetMovement();

    // Timers
    setInterval(saveGame, 30000);
    setInterval(autoKillTick, 1000);
    setInterval(eventTick, 1000);

    // Update side panel if open (live stats)
    setInterval(() => {
        if (sidePanelOpen) {
            updateTabContent(currentTab);
        }
    }, 1000);

    // Day/night cycle (updates every 2 seconds)
    setInterval(updateDayNightCycle, 2000);

    // Combo decay check
    setInterval(decayCombo, 100);

    // Screen effects update
    setInterval(updateScreenEffects, 500);

    window.addEventListener('beforeunload', saveGame);
}

// Start the game!
init();
