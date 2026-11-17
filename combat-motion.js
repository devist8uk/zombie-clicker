/* Direct combat feedback. The game engine owns damage, purchases and all timers. */
(() => {
  const field = document.querySelector('.click-section');
  const target = document.getElementById('zombie-target');
  if (!field || !target) return;

  const film = document.createElement('span');
  film.className = 'transmission-film';
  film.setAttribute('aria-hidden', 'true');
  target.querySelector('.scene-text').before(film);

  const canvas = document.createElement('canvas');
  canvas.className = 'strike-art';
  canvas.setAttribute('aria-hidden', 'true');
  field.insertBefore(canvas, document.getElementById('floating-numbers'));
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, frame = 0, strikeCount = 0;
  let hits = [], shakeAnimation, lastShake = 0;

  function resize() {
    width = target.clientWidth;
    height = target.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    ctx?.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resize();
  new ResizeObserver(resize).observe(target);

  // A tapered maple barrel with three grain cuts, a wrapped handle and an ink outline.
  function drawBat(length, alpha, echo) {
    ctx.save();
    ctx.scale(length / 175, length / 175);
    ctx.globalAlpha *= alpha;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#191e18';
    ctx.fillStyle = echo ? '#c8ff48' : '#d59c5f';
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.quadraticCurveTo(-8, 0, -4, 4);
    ctx.lineTo(4, 4);
    ctx.lineTo(6, 2.5);
    ctx.quadraticCurveTo(48, 2, 82, 6);
    ctx.quadraticCurveTo(112, 10, 167, 10);
    ctx.bezierCurveTo(178, 10, 179, -10, 167, -10);
    ctx.quadraticCurveTo(112, -10, 82, -6);
    ctx.quadraticCurveTo(48, -2, 6, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (!echo) {
      ctx.fillStyle = '#302d20';
      ctx.fillRect(6, -3, 35, 6);
      ctx.strokeStyle = '#ddcbaa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 8; x < 38; x += 5) {
        ctx.moveTo(x, -2.8);
        ctx.lineTo(x + 3, 2.8);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fbe1a2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(49, -1);
      ctx.quadraticCurveTo(130, -9, 163, -7);
      ctx.stroke();
      ctx.strokeStyle = '#81552f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(81, 2);
      ctx.quadraticCurveTo(111, 0, 145, 5);
      ctx.moveTo(119, -2);
      ctx.quadraticCurveTo(147, -6, 164, -1);
      ctx.stroke();
      ctx.fillStyle = '#7b2e20';
      ctx.fillRect(132, -8.6, 7, 17.2);
      ctx.fillRect(142, -8.8, 2, 17.6);
    }
    ctx.restore();
  }

  function drawSwing(hit, t) {
    const dir = hit.side;
    const length = Math.min(220, Math.max(94, height * .44));
    const contact = dir === 1 ? -2.14 : -.99;
    const pivotX = hit.x - Math.cos(contact) * length;
    const pivotY = hit.y - Math.sin(contact) * length;
    const angle = contact + dir * (-.42 + 1.05 * (1 - Math.pow(1 - t, 2)));
    ctx.save();
    ctx.translate(pivotX, pivotY);
    const alpha = Math.min(1, (1 - t) * 3);
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 3; i++) {
      const radius = length * (1 - i * .13);
      const tail = angle - dir * (.94 - i * .17) * (1 - t * .45);
      ctx.strokeStyle = hit.drive ? ['#edff92', '#b4e24f', '#6fb76c'][i] :
        ['#fff2bc', '#d4a968', '#c19f79'][i];
      ctx.lineWidth = Math.max(1, (5 - i * 1.7) * (1 - t));
      ctx.beginPath();
      ctx.arc(0, 0, radius, tail, angle, dir < 0);
      ctx.stroke();
    }
    if (hit.drive) {
      ctx.save();
      ctx.rotate(angle - dir * .35);
      drawBat(length, .45, true);
      ctx.restore();
    }
    ctx.rotate(angle);
    drawBat(length, 1, false);
    ctx.restore();
  }

  function drawBurst(hit, t) {
    const big = hit.critical || hit.drive;
    const radius = (big ? 40 : hit.bat ? 30 : 17) * Math.min(1.3, height / 380);
    const ink = hit.drive ? '#dbff55' : hit.critical ? '#ffb458' : '#f7df9b';
    ctx.save();
    ctx.translate(hit.x, hit.y);
    ctx.globalAlpha = Math.min(1, (1 - t) * 2);
    ctx.rotate(hit.twist);
    for (let i = 0; i < (big ? 10 : 6); i++) {
      const ray = i * 2.39996;
      const start = radius * (.24 + t * .93);
      const end = start + radius * (1 - t) * (.35 + (i % 3) * .25);
      ctx.save();
      ctx.rotate(ray);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(start, -1);
      ctx.lineTo(end, (i % 3) - 1);
      ctx.lineTo(start + 2, 2.7);
      ctx.fill();
      ctx.restore();
    }
    if (hit.drive) {
      ctx.strokeStyle = '#94c968';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-hit.side * t * 12, 0, 8 + t * 57, 5 + t * 25, .3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    hits = hits.filter(hit => now - hit.born < hit.life);
    for (const hit of hits) {
      const t = Math.max(0, (now - hit.born) / hit.life);
      if (hit.bat) drawSwing(hit, t);
      drawBurst(hit, t);
    }
    frame = hits.length ? requestAnimationFrame(draw) : 0;
  }

  function shake(amount, side, now) {
    if (reduced.matches || document.documentElement.dataset.shake === 'off' ||
        document.hidden || now - lastShake < 90) return;
    lastShake = now;
    shakeAnimation?.cancel();
    const kick = amount * side;
    shakeAnimation = field.animate([
      { translate: '0px 0px' },
      { translate: kick + 'px ' + (-amount * .45) + 'px', offset: .14 },
      { translate: (-kick * .52) + 'px ' + (amount * .35) + 'px', offset: .44 },
      { translate: (kick * .18) + 'px 0px', offset: .73 },
      { translate: '0px 0px' }
    ], { duration: amount > 4 ? 185 : 118, easing: 'ease-out' });
  }

  // Short, self-terminating voices share a mute gate with the original sound controls.
  let cachedContext, master, noiseBuffer, lastAudio = 0, phraseStep = 0;
  function audioBus() {
    if (typeof SoundManager === 'undefined' || !SoundManager.enabled || document.hidden) return null;
    const ac = SoundManager.audioContext;
    if (!ac || ac.state !== 'running') return null;
    if (cachedContext !== ac) {
      cachedContext = ac;
      master = ac.createGain();
      master.gain.value = .78;
      master.connect(ac.destination);
      noiseBuffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * .2), ac.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    return ac;
  }
  function gateMute() {
    if (master) master.gain.setTargetAtTime(SoundManager.enabled && !document.hidden ? .78 : .0001,
      cachedContext.currentTime, .004);
  }
  const soundButton = document.getElementById('sound-btn');
  if (soundButton) new MutationObserver(gateMute).observe(soundButton, { attributes: true, attributeFilter: ['aria-pressed'] });

  function voice(ac, waveform, from, to, duration, volume, delay = 0) {
    const now = ac.currentTime + delay;
    const env = ac.createGain();
    const source = waveform === 'wood' ? ac.createBufferSource() : ac.createOscillator();
    let filter;
    if (waveform === 'wood') {
      source.buffer = noiseBuffer;
      filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(from, now);
      filter.frequency.exponentialRampToValueAtTime(to, now + duration);
      filter.Q.value = 1.3;
      source.connect(filter).connect(env);
    } else {
      source.type = waveform;
      source.frequency.setValueAtTime(from, now);
      source.frequency.exponentialRampToValueAtTime(to, now + duration);
      source.connect(env);
    }
    env.gain.setValueAtTime(.0001, now);
    env.gain.exponentialRampToValueAtTime(volume, now + .005);
    env.gain.exponentialRampToValueAtTime(.0001, now + duration);
    env.connect(master);
    source.onended = () => { source.disconnect(); filter?.disconnect(); env.disconnect(); };
    source.start(now);
    source.stop(now + duration + .01);
  }

  function strikeSound(hit, now) {
    if (now - lastAudio < 58) return;
    const ac = audioBus();
    if (!ac) return;
    lastAudio = now;
    if (hit.bat) {
      const pitch = .92 + Math.random() * .16;
      voice(ac, 'wood', 1890 * pitch, 580 * pitch, .075, .38);
      voice(ac, 'triangle', 366 * pitch, 230 * pitch, .12, .23);
      voice(ac, 'sine', 128, 50, .145, hit.critical ? .31 : .19);
    }
    if (hit.drive) {
      const notes = [110, 165, 131, 196];
      const f = notes[phraseStep++ % notes.length];
      voice(ac, 'triangle', f * 2, f, .14, .15);
      voice(ac, 'sine', 89, 39, .12, .22);
      if (phraseStep % 4 === 0) voice(ac, 'square', f * 4, f * 3, .055, .038, .045);
    }
  }

  document.addEventListener('combat-strike', ({ detail }) => {
    if (document.hidden || !detail) return;
    const now = performance.now();
    const hit = {
      x: Math.max(0, Math.min(1, detail.x)) * width,
      y: Math.max(0, Math.min(1, detail.y)) * height,
      side: ++strikeCount % 2 ? 1 : -1,
      twist: Math.random() * 1.5,
      bat: detail.weapon === 'bat' || detail.weapon === 'baseball_bat',
      drive: !!detail.overdrive, critical: !!detail.critical, born: now
    };
    hit.life = hit.bat ? 285 : hit.drive || hit.critical ? 240 : 145;
    if (hit.bat || hit.drive) strikeSound(hit, now);
    shake(hit.critical ? 6 : hit.bat ? 3.8 : hit.drive ? 3 : 1.35, hit.side, now);
    if (reduced.matches || !ctx) return;
    hits.push(hit);
    if (hits.length > 5) hits.shift();
    if (!frame) frame = requestAnimationFrame(draw);
  });

  document.addEventListener('combat-purchase', ({ detail }) => {
    if (detail?.id !== 'baseball_bat' || gameState.upgrades.baseball_bat !== 1) return;
    const flare = document.createElement('span');
    flare.className = 'bat-acquired';
    flare.textContent = 'Bat equipped';
    field.append(flare);
    setTimeout(() => flare.remove(), 900);
  });

  let beatTimer = 0;
  let transmission = false;
  const live = document.querySelector('.battle .live');
  const liveText = live && Array.from(live.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
  const ordinaryLabel = liveText?.textContent;
  function syncDrive() {
    const active = document.body.dataset.overdrive === 'active';
    if (liveText) liveText.textContent = active ? 'Pirate signal' : ordinaryLabel;
    live?.toggleAttribute('data-transmitting', active);
    clearInterval(beatTimer);
    if (active && !document.hidden) {
      let beat = 0;
      beatTimer = setInterval(() => {
        const ac = audioBus();
        if (!ac || document.body.dataset.overdrive !== 'active') return;
        beat++;
        voice(ac, 'sine', beat % 2 ? 82 : 103, 43, .11, .085);
        if (!(beat % 4)) voice(ac, 'wood', 1800, 820, .09, .06);
      }, 460);
    }
    if (transmission && !active) {
      const ac = audioBus();
      if (ac) voice(ac, 'triangle', 290, 82, .24, .105);
    }
    transmission = active;
  }
  new MutationObserver(() => {
    if (transmission !== (document.body.dataset.overdrive === 'active')) syncDrive();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-overdrive'] });
  document.addEventListener('drive-start', () => {
    phraseStep = 0;
    const ac = audioBus();
    if (!ac) return;
    voice(ac, 'triangle', 87, 349, .15, .15);
    voice(ac, 'triangle', 174, 523, .15, .11, .075);
    voice(ac, 'wood', 4300, 1400, .13, .08, .1);
  });
  function clearHits() {
    cancelAnimationFrame(frame);
    frame = 0;
    hits = [];
    ctx?.clearRect(0, 0, width, height);
    shakeAnimation?.cancel();
  }
  reduced.addEventListener('change', () => { if (reduced.matches) clearHits(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearHits();
    gateMute();
    syncDrive();
  });
  syncDrive();
})();
