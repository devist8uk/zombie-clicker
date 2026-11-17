/* Patient Zero is painted into a 680 × 382 plate. The articulated portrait
   uses the plate's own ink as its texture, including both sides of its outline. */
(() => {
  const W = 680, H = 382;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mounts = new WeakMap();
  let painting;

  function loadPainting() {
    if (!painting) {
      painting = new Image();
      painting.src = "assets/sector-02.webp";
    }
    return painting;
  }

  // Smooth joint envelopes keep the door, beds and section of wall behind the cap still.
  function mask(x, y, cx, cy, rx, ry, inner = .46) {
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    const a = clamp((1 - d) / (1 - inner), 0, 1);
    return a * a * (3 - 2 * a);
  }
  function joint(x, y) {
    const edge = clamp(Math.min(y / 18, (H - y) / 24, (W - x) / 12, (x - 282) / 24), 0, 1);
    return {
      x, y, edge,
      head: mask(x, y, 518, 110, 149, 140, .70),
      jaw: mask(x, y, 532, 162, 54, 34, .48),
      throat: mask(x, y, 507, 216, 53, 57),
      mirror: mask(x, y, 570, 34, 52, 53, .68),
      locks: Math.max(mask(x, y, 417, 169, 56, 77), mask(x, y, 615, 167, 45, 98)),
      chest: mask(x, y, 504, 300, 211, 108),
      shoulder: mask(x, y, 384, 296, 86, 76)
    };
  }
  function place(v, s, output, index) {
    const hx = s.headX - (v.y - 202) * s.tilt;
    const hy = s.headY + (v.x - 504) * s.tilt;
    output[index] = v.x + v.edge * (
      v.head * hx + v.jaw * (s.jaw * .22 + s.recoil * 3) +
      v.throat * (s.swallow * 2.2 + s.headX * .38) +
      v.mirror * s.lag + v.locks * s.hair +
      v.chest * (s.breath * 1.2 + s.recoil * 3.2) - v.shoulder * s.reach * 2.5
    );
    output[index + 1] = v.y + v.edge * (
      v.head * hy + v.jaw * s.jaw - v.throat * s.swallow * 3.8 +
      v.mirror * s.lag * .45 + v.locks * s.hair * .42 -
      v.chest * s.breath * 2.8 - v.shoulder * s.reach * 3
    );
  }

  // Every tile has two affine faces. Redraw only the portrait, at the native
  // print resolution; high-DPI screens need no larger intermediate texture.
  const columns = 19, rows = 19, startX = 282;
  const dx = (W - startX) / columns, dy = H / rows;
  const vertices = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      vertices.push(joint(startX + col * dx, row * dy));
    }
  }

  function triangle(ctx, image, p, a, b, c, x, y, sx, sy) {
    const ax = p[a], ay = p[a + 1], bx = p[b], by = p[b + 1], cx = p[c], cy = p[c + 1];
    const xx = (bx - ax) / sx, yx = (by - ay) / sx;
    const xy = (cx - ax) / sy, yy = (cy - ay) / sy;
    const mx = (ax + bx + cx) / 3, my = (ay + by + cy) / 3;
    // Fractionally overlap neighbouring pieces to prevent anti-aliased seams.
    const outset = 1.055;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(mx + (ax - mx) * outset, my + (ay - my) * outset);
    ctx.lineTo(mx + (bx - mx) * outset, my + (by - my) * outset);
    ctx.lineTo(mx + (cx - mx) * outset, my + (cy - my) * outset);
    ctx.closePath();
    ctx.clip();
    ctx.transform(xx, yx, xy, yy, ax - xx * x - xy * y, ay - yx * x - yy * y);
    const left = Math.max(0, Math.min(x, x + sx) - 2);
    const top = Math.max(0, Math.min(y, y + sy) - 2);
    const w = Math.min(W - left, Math.abs(sx) + 4), h = Math.min(H - top, Math.abs(sy) + 4);
    ctx.drawImage(image, left, top, w, h, left, top, w, h);
    ctx.restore();
  }
  const eyes = [joint(502, 91), joint(557, 99)];
  const eyePoint = new Float32Array(2);
  function render(ctx, image, positions, s) {
    ctx.drawImage(image, 0, 0, W, H);
    for (let i = 0; i < vertices.length; i++) place(vertices[i], s, positions, i * 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const a = (row * (columns + 1) + col) * 2, b = a + 2;
        const c = a + (columns + 1) * 2, d = c + 2;
        const x = startX + col * dx, y = row * dy;
        triangle(ctx, image, positions, a, b, c, x, y, dx, dy);
        triangle(ctx, image, positions, d, c, b, x + dx, y + dy, -dx, -dy);
      }
    }

    for (const eye of eyes) {
      place(eye, s, eyePoint, 0);
      const ex = eyePoint[0] + s.gaze * 1.7, ey = eyePoint[1] + s.gazeY * 1.4;
      ctx.fillStyle = 'rgba(246,227,143,.36)';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 4.6, 2.7, -.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(44,43,28,.85)';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 1.45, 2.35, -.15, 0, Math.PI * 2);
      ctx.fill();
    }
    // The fluorescent tube dims gradually between breath cycles. No strobe.
    ctx.fillStyle = 'rgba(7,24,41,' + s.dimmer.toFixed(3) + ')';
    ctx.beginPath();ctx.moveTo(217,22);ctx.lineTo(252,20);ctx.lineTo(257,77);ctx.lineTo(232,78);ctx.closePath();ctx.fill();
  }

  window.mountPatientZero = function mountPatientZero(target, art = target?.querySelector('.scene-art')) {
    if (!target || !art) return null;
    if (mounts.has(target)) return mounts.get(target);
    const preview = target.hasAttribute('data-preview-sector');
    const coveringDialog = preview ? null : document.getElementById('ward-preview');
    const canvas = document.createElement('canvas');
    canvas.className = 'patient-zero-rig';
    canvas.width = W; canvas.height = H; canvas.hidden = true;
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) return null;
    const abort = new AbortController();
    const listen = {signal: abort.signal};
    const positions = new Float32Array(vertices.length * 2);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, running = false, timer, raf, image, last = 0, elapsed = 0;
    let heading = 0, lookY = 0, goalX = 0, goalY = 0, aimedAt = -10000;
    let recoil = 0, velocity = 0, jawKick = 0, shoulderKick = 0, capLag = 0;
    let listening = 0, phase = 'clear';
    art.appendChild(canvas);

    function frame(now) {
      if (!running) return;
      const dt = clamp((now - last) / 1000, 0, .075);
      last = now; elapsed += dt;
      const t = elapsed, freshAim = now - aimedAt < 2300;
      const listenGoal = phase === 'answer' || phase === 'reveal' ? 1 : phase === 'ring' ? .3 : 0;
      listening += (listenGoal - listening) * (1 - Math.exp(-dt * 4));
      const gx = freshAim ? goalX : Math.sin(t * .65) * .32;
      const gy = freshAim ? goalY : Math.cos(t * .71) * .16;
      heading += ((1 - listening) * gx - listening - heading) * (1 - Math.exp(-dt * 5));
      lookY += (gy - lookY) * (1 - Math.exp(-dt * 6));
      velocity += (-155 * recoil - 15 * velocity) * dt;
      recoil = clamp(recoil + velocity * dt, -1.1, 1.1);
      capLag += (recoil - capLag) * (1 - Math.exp(-dt * 6));
      jawKick *= Math.exp(-dt * 8); shoulderKick *= Math.exp(-dt * 5.5);
      const breath = Math.sin(t * 1.64) + .2 * Math.sin(t * 3.28 - .8);
      const jerk = Math.pow(Math.max(0, Math.sin(t * .88 - .4)), 22);
      const tilt = .035 * Math.sin(t * .97) + heading * .045 - listening * .118 + recoil * .125;
      render(ctx, image, positions, {
        breath, gaze: heading, gazeY: lookY, recoil, tilt,
        headX: 2.7 * Math.sin(t * .84) + heading * 3.6 - listening * 6 + recoil * 8,
        headY: -2.2 * breath + lookY * 2 + listening * 3 - Math.abs(recoil) * 5,
        jaw: 1.7 + 2.1 * Math.sin(t * 1.64 - .65) + 3.7 * jerk + jawKick * 5,
        lag: (capLag - recoil) * 7 - .75 * Math.sin(t * 1.64),
        hair: 1.75 * Math.sin(t * 1.1 - .5) + (capLag - recoil) * 4 + listening * 2.5,
        reach: Math.sin(t * .83 - .9) + shoulderKick * 1.8,
        swallow: Math.pow(Math.max(0, Math.cos(t * .86)), 7),
        dimmer: .12 + .28 * Math.pow(Math.max(0, Math.cos(t * .79 + .5)), 5) + .16 * listening
      });
      timer = setTimeout(() => { raf = requestAnimationFrame(frame); }, 38);
    }

    function sync() {
      const inWard = preview ? target.dataset.previewSector === 'hospital' : document.body.dataset.location === 'hospital';
      const wanted = inWard && visible && !coveringDialog?.open && !document.hidden && !reduced.matches &&
        !target.matches('.boss-active,.golden-zombie');
      if (wanted && !image) {
        image = loadPainting();
        image.addEventListener('load', sync, {once: true, signal: abort.signal});
      }
      const active = Boolean(wanted && image?.complete && image.naturalWidth);
      if (active === running) return;
      running = active; canvas.hidden = !running;
      target.toggleAttribute('data-patient-live', running);
      clearTimeout(timer);cancelAnimationFrame(raf);
      if (running) {
        canvas.style.objectPosition = getComputedStyle(art).backgroundPosition;
        last = performance.now();frame(last);
      } else {
        recoil = velocity = shoulderKick = jawKick = capLag = 0;
      }
    }

    function strike(detail = {}) {
      if (!running || detail.boss || detail.golden) return;
      const size = art.getBoundingClientRect();
      if (!size.width || !size.height) return;
      const style = getComputedStyle(art);
      const scale = Math.max(size.width / W, size.height / H);
      const ox = (size.width - W * scale) * (parseFloat(style.backgroundPositionX) || 0) / 100;
      const oy = (size.height - H * scale) * (parseFloat(style.backgroundPositionY) || 0) / 100;
      const x = ((detail.x ?? .66) * size.width - ox) / scale;
      const y = ((detail.y ?? .39) * size.height - oy) / scale;
      const force = (detail.weapon === 'bat' ? 1.55 : 1) * (detail.critical ? 1.28 : 1) * (detail.overdrive ? 1.16 : 1);
      velocity = clamp(velocity + (x < 520 ? 1 : -1) * force * (y < 204 ? 12 : 8), -20, 20);
      jawKick = Math.min(1.8, jawKick + force * (y < 204 ? .95 : .32));
      shoulderKick = Math.min(1.8, shoulderKick + force * (y > 198 ? 1.05 : .42));
    }
    function cue(nextPhase) { phase = nextPhase || 'clear'; }
    target.addEventListener('pointermove', e => {
      if (!running) return;
      const r = target.getBoundingClientRect();
      goalX = clamp(((e.clientX - r.left) / r.width - .69) * 2.2, -1, 1);
      goalY = clamp(((e.clientY - r.top) / r.height - .33) * 2.4, -1, 1);
      aimedAt = performance.now();
    }, {passive:true, signal:abort.signal});
    if (!preview) {
      document.addEventListener('combat-strike', e => strike(e.detail), listen);
      document.addEventListener('ward-cue', e => {
        if (e.detail?.field === target) cue(e.detail.phase);
      }, listen);
    }
    const intersect = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    intersect.observe(target);
    const state = new MutationObserver(sync);
    state.observe(target, {attributes:true,attributeFilter:['class','data-preview-sector']});
    state.observe(document.body, {attributes:true,attributeFilter:['data-location']});
    if (coveringDialog) state.observe(coveringDialog, {attributes:true,attributeFilter:['open']});
    const resize = new ResizeObserver(() => {
      canvas.style.objectPosition = getComputedStyle(art).backgroundPosition;
    });
    resize.observe(art);
    reduced.addEventListener('change', sync, listen);
    document.addEventListener('visibilitychange', sync, listen);
    const handle = {strike, cue, destroy() {
      abort.abort();intersect.disconnect();state.disconnect();resize.disconnect();
      running = false;clearTimeout(timer);cancelAnimationFrame(raf);canvas.remove();
      target.removeAttribute('data-patient-live');mounts.delete(target);
    }};
    mounts.set(target, handle);
    return handle;
  };
  window.mountPatientZero(document.getElementById('zombie-target'));
})();
