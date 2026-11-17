/* Ward Seven has two independent sets: the playable feed and the map preview. */
(() => {
  const sets = new Map();

  function buildSet(field) {
    const stage = document.createElement("span");
    stage.className = "ward-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML = `
      <span class="ward-projection">
        <span class="ward-plate">
          <img class="ward-orderlies" src="assets/ward-night-round.webp" alt="" draggable="false">
          <span class="ward-lamp far"></span>
          <span class="ward-lamp distant"></span>
          <span class="ward-lamp middle"></span>
          <span class="ward-lamp aisle"></span>
          <span class="ward-lamp near"></span>
          <span class="ward-face-reflection"></span>
        </span>
        <span class="ward-vignette"></span>
      </span>
      <span class="ward-drape">
        <span class="ward-hooks"></span>
        <span class="ward-cloth"><span class="ward-room-number">07</span></span>
      </span>
      <span class="ward-pull">
        <span class="ward-pull-wire"></span>
        <span class="ward-pull-case"><span class="ward-pull-lens"></span></span>
      </span>
      <span class="ward-caption"><i></i><span class="ward-caption-text"></span></span>
    `;
    field.append(stage);
    const set = { stage, pending: [], voices: [] };
    sets.set(field, set);
    return set;
  }

  function stopSound(set) {
    set.pending.forEach(clearTimeout);
    set.pending.length = 0;
    for (const bus of set.voices.splice(0)) {
      const now = bus.context.currentTime;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setTargetAtTime(0.0001, now, .006);
      setTimeout(() => bus.disconnect(), 36);
    }
  }

  function soundBus(set) {
    if (typeof SoundManager === "undefined" || !SoundManager.enabled || document.hidden) return null;
    const ac = SoundManager.audioContext;
    if (!ac || ac.state !== "running") return null;
    const bus = ac.createGain();
    bus.gain.value = .85;
    bus.connect(ac.destination);
    set.voices.push(bus);
    return bus;
  }

  function note(bus, { frequency, end = frequency, level, duration, delay = 0, pan = 0, type = "sine" }) {
    const ac = bus.context;
    const start = ac.currentTime + delay;
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();
    const position = ac.createStereoPanner?.();
    if (position) {
      position.pan.value = pan;
      gain.connect(position).connect(bus);
    } else gain.connect(bus);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      position?.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(start + duration + .012);
  }

  function callBell(set, pan, pitch) {
    const bus = soundBus(set);
    if (!bus) return;
    // An electromechanical call bell: the hammer hits two mismatched metal cups.
    for (const [delay, ratio] of [[0, 1], [.23, .79]]) {
      note(bus, { frequency: pitch * ratio, level: .095, duration: .42, delay, pan });
      note(bus, { frequency: pitch * ratio * 2.68, level: .036, duration: .17, delay, pan });
      note(bus, { frequency: 310, end: 95, type: "triangle", level: .08, duration: .031, delay, pan });
    }
  }

  function drawCurtain(set, forward) {
    const bus = soundBus(set);
    if (!bus) return;
    // Each ring catches the ceiling track a fraction after the preceding ring.
    for (let i = 0; i < 6; i++) {
      const frequency = 980 + (i % 3) * 131;
      note(bus, { frequency, end: frequency * .64, type: "triangle", level: .037,
        duration: .09, delay: .04 + i * .075, pan: (i / 5 - .5) * (forward ? 1.3 : -1.3) });
    }
    if (forward) {
      note(bus, { frequency: 99, end: 96, level: .14, duration: 1.03, type: "triangle" });
    } else {
      for (const [delay, pan] of [[.20, -.42], [.73, .05], [1.18, .38], [1.42, .62]]) {
        note(bus, { frequency: 76, end: 39, type: "sine", duration: .28, level: .21, delay, pan });
        note(bus, { frequency: 122, end: 88, type: "triangle", duration: .075, level: .065, delay, pan });
      }
    }
  }

  document.addEventListener("ward-cue", ({ detail }) => {
    const { field, phase } = detail || {};
    if (!field || !["ring", "answer", "reveal", "clear"].includes(phase)) return;
    if (phase === "clear" && !sets.has(field)) return;
    const set = sets.get(field) || buildSet(field);
    stopSound(set);
    if (phase === "clear") {
      delete field.dataset.wardPhase;
      set.stage.remove();
      sets.delete(field);
      return;
    }
    field.dataset.wardPhase = phase;
    const caption = set.stage.querySelector(".ward-caption-text");
    if (phase === "ring") {
      caption.textContent = "Answer call";
      callBell(set, -.55, 821);
      set.pending.push(setTimeout(() => callBell(set, -.55, 821), 2200));
    } else if (phase === "answer") {
      caption.textContent = "Seven beds. Eight pulses.";
      callBell(set, .68, 465);
      drawCurtain(set, true);
    } else {
      caption.textContent = "The Night Round";
      drawCurtain(set, false);
    }
  });

  function hush() {
    if (document.hidden || !SoundManager.enabled) {
      for (const set of sets.values()) stopSound(set);
    }
  }
  document.addEventListener("visibilitychange", hush);
  const sound = document.getElementById("sound-btn");
  if (sound) new MutationObserver(hush).observe(sound, { attributes: true, attributeFilter: ["aria-pressed"] });
})();
