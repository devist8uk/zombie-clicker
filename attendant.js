/* The Attendant's joints are authored in pixels of the original station print.
   A continuous textured mesh keeps its ink lines and silhouette connected. */
(() => {
  const target = document.getElementById("zombie-target");
  const art = target?.querySelector(".scene-art");
  if (!art) return;

  const W = 1672,
    H = 941;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const original = new Image();
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  // Flat centre, feathered edge: neighboring background vertices stay anchored.
  function weight(x, y, cx, cy, rx, ry, hardness = 0.5) {
    const r = Math.hypot((x - cx) / rx, (y - cy) / ry);
    const f = clamp((1 - r) / (1 - hardness), 0, 1);
    return f * f * (3 - 2 * f);
  }
  function joint(x, y) {
    const edge = Math.min(1, x / 48, (W - x) / 42, y / 38, (H - y) / 65);
    // The rigid pump beside the reaching hand and the canopy stay fixed.
    const pump = weight(x, y, 566, 553, 77, 133, 0.77);
    const canopy = weight(x, y, 680, 306, 230, 77, 0.7);
    const pin = edge * (1 - Math.max(pump, canopy));
    return {
      x,
      y,
      pin,
      head: weight(x, y, 1120, 224, 295, 290, 0.67),
      brim: weight(x, y, 1085, 132, 212, 147),
      jaw: weight(x, y, 1184, 375, 110, 70),
      chest: weight(x, y, 1048, 622, 455, 440, 0.38),
      arm: weight(x, y, 772, 695, 284, 230, 0.65),
      finger: weight(x, y, 653, 664, 151, 161),
      otherHand: weight(x, y, 1506, 765, 156, 142),
      eyeL: weight(x, y, 1086, 241, 47, 31),
      eyeR: weight(x, y, 1190, 214, 46, 29),
    };
  }

  let lookX = 0,
    lookY = 0,
    aimX = 0,
    aimY = 0,
    lastAim = -10000;
  let recoil = 0,
    recoilSpeed = 0,
    jawKick = 0,
    armKick = 0,
    cap = 0,
    turn = 0;
  let rexApproaching = false;
  let width = 0,
    height = 0,
    zoom = 1,
    left = 0,
    top = 0;
  let canvas,
    mesh,
    renderer,
    visible = false,
    enabled = false;
  let raf = 0,
    timer = 0,
    last = 0,
    elapsed = 0;

  function advance(dt, now) {
    const expired = now - lastAim > 2300;
    const wantedX = rexApproaching
      ? 0.96
      : expired
        ? Math.sin(elapsed * 0.59) * 0.34
        : aimX;
    const wantedY = rexApproaching
      ? -0.44
      : expired
        ? Math.sin(elapsed * 0.41) * 0.16
        : aimY;
    const follow = 1 - Math.exp(-dt * 5);
    lookX += (wantedX - lookX) * follow;
    lookY += (wantedY - lookY) * follow;
    turn += ((rexApproaching ? 1 : 0) - turn) * follow;
    // Damped joint springs. A hit arrives as velocity, so repeated hits add weight.
    recoilSpeed += (-135 * recoil - 13.5 * recoilSpeed) * dt;
    recoil = clamp(recoil + recoilSpeed * dt, -1.2, 1.2);
    jawKick *= Math.exp(-dt * 6);
    armKick *= Math.exp(-dt * 5);
    cap += (recoil - cap) * (1 - Math.exp(-dt * 7));
    const breath =
      Math.sin(elapsed * 1.76) + 0.2 * Math.sin(elapsed * 3.52 - 0.4);
    const reach = Math.sin(elapsed * 1.09 + 0.8);
    const twitch = Math.pow(Math.max(0, Math.cos(elapsed * 0.68 - 1.6)), 18);
    const angle =
      0.047 * Math.sin(elapsed * 0.91) +
      0.075 * lookX +
      0.26 * turn +
      0.24 * recoil;
    return {
      breath,
      reach,
      twitch,
      angle,
      hx: 11 * Math.sin(elapsed * 0.94) + 20 * lookX + 26 * recoil + 25 * turn,
      hy: -5 * breath + 12 * lookY - 12 * Math.abs(recoil) + 9 * turn,
      jaw:
        4 + 5.5 * Math.sin(elapsed * 1.78 - 0.62) + 9 * twitch + 17 * jawKick,
      lamp:
        0.76 +
        0.16 * Math.sin(elapsed * 0.58) -
        0.45 * Math.pow(Math.max(0, Math.cos(elapsed * 1.13)), 42),
    };
  }

  function pose(v, s, out, i) {
    const headX = s.hx - (v.y - 414) * s.angle;
    const headY = s.hy + (v.x - 1131) * s.angle;
    const x =
      v.head * headX +
      v.brim * (13 * (cap - recoil) - s.breath * 2.5) +
      v.jaw * (2.5 * s.reach + s.jaw * 0.1) +
      v.chest * (4 * s.reach + 8 * recoil) +
      v.arm * (-14 * s.reach + 23 * armKick) +
      v.finger * (-11 * s.breath + 11 * s.twitch) +
      v.otherHand * (10 * s.reach - 4 * s.breath) +
      (v.eyeL + v.eyeR) * lookX * 2.5;
    const y =
      v.head * headY -
      v.brim * (5 * cap) +
      v.jaw * s.jaw +
      v.chest * -8.7 * s.breath +
      v.arm * (8.8 * s.reach - 10 * armKick) +
      v.finger * (14 * s.breath - 10 * s.twitch) -
      v.otherHand * 7 * s.reach +
      (v.eyeL + v.eyeR) * lookY * 2;
    out[i] = left + (v.x + v.pin * x) * zoom;
    out[i + 1] = top + (v.y + v.pin * y) * zoom;
  }

  function createMesh(cols, rows) {
    const points = [],
      indices = [];
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const n = row * (cols + 1) + col;
        points.push(joint((W * col) / cols, (H * row) / rows));
        if (row < rows && col < cols) {
          const below = n + cols + 1;
          indices.push(n, n + 1, below, below, n + 1, below + 1);
        }
      }
    }
    return {
      points,
      indices: new Uint16Array(indices),
      coords: new Float32Array(points.length * 2),
    };
  }

  function makeCanvas() {
    const node = document.createElement("canvas");
    node.className = "attendant-rig";
    node.setAttribute("aria-hidden", "true");
    art.appendChild(node);
    return node;
  }

  function createGL() {
    // Local file URLs cannot upload their texture in some browsers.
    if (location.protocol === "file:") return null;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return null;
    const program = gl.createProgram();
    const shaders = [
      [
        gl.VERTEX_SHADER,
        `attribute vec2 pos, uv; uniform vec2 viewport; varying vec2 sampleAt;
        void main(){ gl_Position=vec4(pos/viewport*vec2(2.,-2.)+vec2(-1.,1.),0.,1.); sampleAt=uv; }`,
      ],
      [
        gl.FRAGMENT_SHADER,
        `precision mediump float;
        varying vec2 sampleAt; uniform sampler2D artwork; uniform vec2 gaze; uniform float light;
        float radial(vec2 p){return max(0.,1.-dot(p,p));}
        void main(){
          vec3 rgb=texture2D(artwork,sampleAt).rgb;
          vec2 p=sampleAt*vec2(1672.,941.);
          vec2 l=p-vec2(1086.,242.); vec2 r=p-vec2(1190.,214.);
          float lid=max(radial(l/vec2(15.,10.)),radial(r/vec2(13.,8.)));
          vec2 offset=gaze*vec2(6.,3.);
          float pupils=max(radial((l-offset)/vec2(4.4,6.)),radial((r-offset)/vec2(3.8,5.)));
          rgb=mix(rgb,vec3(.13,.075,.038),.72*pupils*lid);
          rgb+=vec3(.08,.032,.01)*lid*(1.-pupils);
          float lamp=radial((p-vec2(394.,356.))/vec2(79.,30.));
          float spill=radial((p-vec2(387.,466.))/vec2(162.,128.));
          rgb*=1.-(1.-light)*(.65*lamp+.16*spill);
          gl_FragColor=vec4(rgb,1.);
        }`,
      ],
    ];
    for (const [kind, src] of shaders) {
      const shader = gl.createShader(kind);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    mesh = createMesh(66, 44);
    function attribute(name, data, usage) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const attr = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(attr);
      gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
      return buffer;
    }
    const uv = Float32Array.from(
      mesh.points.flatMap((v) => [v.x / W, v.y / H]),
    );
    attribute("uv", uv, gl.STATIC_DRAW);
    const coords = attribute("pos", mesh.coords, gl.DYNAMIC_DRAW);
    const indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, original);
    const viewport = gl.getUniformLocation(program, "viewport");
    const gaze = gl.getUniformLocation(program, "gaze");
    const lamp = gl.getUniformLocation(program, "light");
    return (s) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(viewport, width, height);
      gl.uniform2f(gaze, lookX, lookY);
      gl.uniform1f(lamp, s.lamp);
      gl.bindBuffer(gl.ARRAY_BUFFER, coords);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.coords);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    };
  }

  function create2D() {
    mesh = createMesh(23, 16);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    // Split the painted grid into affine texture triangles in software.
    const facets = [];
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const [a, b, c] = mesh.indices.subarray(i, i + 3);
      const p = mesh.points[a],
        q = mesh.points[b],
        r = mesh.points[c];
      if (Math.max(p.x, q.x, r.x) < 405) continue;
      const u = q.x - p.x,
        v = q.y - p.y,
        w = r.x - p.x,
        z = r.y - p.y;
      const det = u * z - v * w;
      const sx = Math.min(p.x, q.x, r.x),
        sy = Math.min(p.y, q.y, r.y);
      facets.push({
        a: a * 2,
        b: b * 2,
        c: c * 2,
        p,
        u,
        v,
        w,
        z,
        det,
        sx,
        sy,
        sw: Math.min(W - sx, Math.max(p.x, q.x, r.x) - sx + 2),
        sh: Math.min(H - sy, Math.max(p.y, q.y, r.y) - sy + 2),
      });
    }
    return (s) => {
      const kx = canvas.width / width,
        ky = canvas.height / height;
      const pos = mesh.coords;
      ctx.setTransform(kx, 0, 0, ky, 0, 0);
      ctx.drawImage(original, left, top, W * zoom, H * zoom);
      for (const f of facets) {
        const x = pos[f.a],
          y = pos[f.a + 1],
          qx = pos[f.b],
          qy = pos[f.b + 1],
          rx = pos[f.c],
          ry = pos[f.c + 1];
        const ax = ((qx - x) * f.z - (rx - x) * f.v) / f.det,
          bx = ((rx - x) * f.u - (qx - x) * f.w) / f.det;
        const ay = ((qy - y) * f.z - (ry - y) * f.v) / f.det,
          by = ((ry - y) * f.u - (qy - y) * f.w) / f.det;
        const tx = x - ax * f.p.x - bx * f.p.y,
          ty = y - ay * f.p.x - by * f.p.y;
        if (
          Math.max(x, qx, rx) < 0 ||
          Math.min(x, qx, rx) > width ||
          Math.max(y, qy, ry) < 0 ||
          Math.min(y, qy, ry) > height
        )
          continue;
        const cx = (x + qx + rx) / 3,
          cy = (y + qy + ry) / 3;
        ctx.save();
        ctx.beginPath();
        // Extend clips by a fraction of a pixel to avoid antialiasing seams.
        for (const [j, px, py] of [
          [0, x, y],
          [1, qx, qy],
          [2, rx, ry],
        ]) {
          const len = Math.hypot(px - cx, py - cy) || 1;
          ctx[j ? "lineTo" : "moveTo"](
            px + (0.8 * (px - cx)) / len,
            py + (0.8 * (py - cy)) / len,
          );
        }
        ctx.closePath();
        ctx.clip();
        ctx.transform(ax, ay, bx, by, tx, ty);
        ctx.drawImage(original, f.sx, f.sy, f.sw, f.sh, f.sx, f.sy, f.sw, f.sh);
        ctx.restore();
      }
      const eyes = [
          [1086, 242],
          [1190, 214],
        ],
        eyePos = [0, 0];
      ctx.fillStyle = "rgba(40,23,12,.67)";
      for (const [x, y] of eyes) {
        pose(joint(x, y), s, eyePos, 0);
        ctx.beginPath();
        ctx.ellipse(
          eyePos[0] + 6 * lookX * zoom,
          eyePos[1] + 3 * lookY * zoom,
          3.8 * zoom,
          5 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    };
  }

  let fps = 24;
  function setup() {
    canvas = makeCanvas();
    try {
      renderer = createGL();
    } catch {
      renderer = null;
    }
    if (!renderer) {
      canvas.remove();
      canvas = makeCanvas();
      renderer = create2D();
      fps = 16;
    } else {
      canvas.addEventListener(
        "webglcontextlost",
        () => {
          // Reveal the original illustration immediately if the graphics device is lost.
          cancelAnimationFrame(raf);
          clearTimeout(timer);
          canvas.remove();
          canvas = makeCanvas();
          renderer = create2D();
          fps = 16;
          sync();
        },
        { once: true },
      );
    }
    if (!renderer) {
      canvas.remove();
      return;
    }
    sync();
  }

  function resize() {
    if (!renderer) return;
    width = art.clientWidth;
    height = art.clientHeight;
    if (!width || !height) return;
    const density = clamp(devicePixelRatio || 1, 1, fps === 16 ? 1 : 1.5);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    const style = getComputedStyle(art);
    zoom = Math.max(width / W, height / H);
    left = ((width - W * zoom) * parseFloat(style.backgroundPositionX)) / 100;
    top = ((height - H * zoom) * parseFloat(style.backgroundPositionY)) / 100;
  }
  function draw(now) {
    if (!enabled) return;
    const dt = Math.min(0.07, Math.max(0, (now - last) / 1000));
    last = now;
    elapsed += dt;
    const state = advance(dt, now);
    for (let i = 0; i < mesh.points.length; i++)
      pose(mesh.points[i], state, mesh.coords, i * 2);
    renderer(state);
    timer = setTimeout(
      () => {
        raf = requestAnimationFrame(draw);
      },
      1000 / fps - 6,
    );
  }
  function sync() {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    enabled = Boolean(
      renderer &&
      visible &&
      !document.hidden &&
      !reduce.matches &&
      document.body.dataset.location === "suburbs" &&
      !target.matches(".boss-active,.golden-zombie"),
    );
    if (!canvas) return;
    canvas.hidden = !enabled;
    target.toggleAttribute("data-attendant-live", enabled);
    if (enabled) {
      resize();
      last = performance.now();
      raf = requestAnimationFrame(draw);
    } else {
      recoil = recoilSpeed = jawKick = armKick = cap = 0;
    }
  }

  document.addEventListener("combat-strike", (event) => {
    if (!enabled || event.detail?.boss || event.detail?.golden || !width)
      return;
    const { x = 0.57, y = 0.5, weapon, critical, overdrive } = event.detail;
    const hitX = (x * width - left) / zoom,
      hitY = (y * height - top) / zoom;
    const force =
      (weapon === "bat" ? 1.5 : 1) *
      (critical ? 1.28 : 1) *
      (overdrive ? 1.15 : 1);
    const direction = hitX < 1125 ? 1 : -1;
    recoilSpeed = clamp(
      recoilSpeed + direction * force * (hitY < 420 ? 12 : 7),
      -21,
      21,
    );
    armKick = clamp(armKick + force * (hitX < 950 ? 1.3 : 0.5), 0, 2.3);
    jawKick = clamp(jawKick + force * (hitY < 430 ? 0.95 : 0.42), 0, 1.8);
  });
  target.addEventListener(
    "pointermove",
    (event) => {
      if (!enabled) return;
      const rect = target.getBoundingClientRect();
      aimX = clamp(((event.clientX - rect.left) / width - 0.6) * 2.4, -1, 1);
      aimY = clamp(((event.clientY - rect.top) / height - 0.31) * 1.8, -1, 1);
      lastAim = performance.now();
    },
    { passive: true },
  );
  document.addEventListener("rex-cue", (event) => {
    if (event.detail?.phase === "approach") rexApproaching = true;
    if (event.detail?.phase === "clear") {
      rexApproaching = false;
      turn = 0;
    }
  });
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(target);
  const observer = new MutationObserver(() => {
    const shouldRun =
      !target.matches(".boss-active,.golden-zombie") &&
      document.body.dataset.location === "suburbs";
    if (shouldRun !== enabled && visible && !document.hidden && !reduce.matches)
      sync();
  });
  observer.observe(target, { attributes: true, attributeFilter: ["class"] });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-location"],
  });
  reduce.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  original.addEventListener("load", setup, { once: true });
  original.src = "assets/sector-01.jpg";
})();
