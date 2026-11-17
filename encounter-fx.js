// Ambient layers live in the frame of the illustrated feed.
(() => {
    const target = document.getElementById('zombie-target');
    const art = target?.querySelector('.scene-art');
    if (!art) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'encounter-fx';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    art.after(canvas);

    const climate = {
        suburbs:  { tint: '#b6d8d4', fall: 330, drift: -64, length: 9, opacity: 0.25 },
        hospital: { tint: '#c2f6d7', fall: -10, drift: 13, length: 0, opacity: 0.38 },
        mall:     { tint: '#f2d9ae', fall: 15, drift: 17, length: 0, opacity: 0.40 },
        military: { tint: '#bad8ea', fall: 455, drift: -112, length: 15, opacity: 0.32 },
        lab:      { tint: '#8cffbd', fall: -21, drift: -8, length: 0, opacity: 0.53 },
        hell:     { tint: '#ff8b50', fall: -52, drift: 21, length: 3, opacity: 0.72 },
        void:     { tint: '#c1b8ff', fall: -16, drift: -28, length: 3, opacity: 0.47 }
    };
    const currentClimate = () => climate[document.body.dataset.location] || climate.suburbs;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, width = 1, height = 1, frame = 0, timer = 0, lastTime = 0;
    let motes = [], sparks = [];

    function resize() {
        width = Math.max(1, target.clientWidth);
        height = Math.max(1, target.clientHeight);
        const density = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
        ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
        motes = Array.from({ length: Math.min(42, Math.ceil(width / 21)) }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            depth: 0.4 + Math.random() * 0.65, phase: Math.random() * 6.283
        }));
    }
    function draw(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.08);
        lastTime = time;
        const air = currentClimate();
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = ctx.fillStyle = air.tint;
        ctx.lineWidth = 1;
        for (const p of motes) {
            const sway = air.length < 5 ? Math.sin(time / 1300 + p.phase) * 8 : 0;
            p.x = (p.x + (air.drift + sway) * dt * p.depth + width) % width;
            p.y = (p.y + air.fall * dt * p.depth + height) % height;
            ctx.globalAlpha = air.opacity * p.depth;
            if (air.length) {
                const trail = air.length * p.depth;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - trail * air.drift / Math.abs(air.fall), p.y - Math.sign(air.fall) * trail);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.depth * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        for (const p of sparks) {
            p.life -= dt;
            if (p.life <= 0) continue;
            const x = p.x, y = p.y;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += dt * 135;
            ctx.globalAlpha = Math.min(1, p.life * 5);
            ctx.strokeStyle = p.tint;
            ctx.lineWidth = p.thickness;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }
        sparks = sparks.filter(p => p.life > 0);
        ctx.globalAlpha = 1;
        timer = setTimeout(() => { frame = requestAnimationFrame(draw); }, 1000 / 28);
    }
    function playback() {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
        if (document.hidden || !visible || motion.matches) {
            sparks = [];
            ctx.clearRect(0, 0, width, height);
            return;
        }
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
    }
    target.addEventListener('click', event => {
        if (motion.matches || !visible || document.hidden) return;
        const rect = target.getBoundingClientRect();
        const x = event.detail ? event.clientX - rect.left : width * 0.56;
        const y = event.detail ? event.clientY - rect.top : height * 0.48;
        const drive = document.body.dataset.overdrive === 'active';
        const strong = drive || target.classList.contains('critical-hit');
        const count = strong ? 12 : 5;
        sparks = sparks.slice(-60);
        for (let i = 0; i < count; i++) {
            const angle = (i + Math.random() * 0.6) * Math.PI * 2 / count;
            const speed = (strong ? 185 : 85) + Math.random() * 100;
            sparks.push({
                x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 0.13 + Math.random() * (strong ? 0.23 : 0.12),
                thickness: strong ? 2 : 1.5,
                tint: drive ? '#e4ff84' : i % 3 ? '#ff985c' : '#ffe9b2'
            });
        }
    });
    resize();
    new ResizeObserver(resize).observe(target);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        playback();
    }).observe(target);
    motion.addEventListener('change', playback);
    document.addEventListener('visibilitychange', playback);
})();
