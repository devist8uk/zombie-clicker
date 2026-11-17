/* The field remains clickable throughout the warning and breach. */
(() => {
  const field = document.getElementById("zombie-target");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const props = document.createElement("span");
  props.className = "station-props";
  props.setAttribute("aria-hidden", "true");
  props.innerHTML = '<span class="pump-sign">OPEN</span><span class="road-puddle"><i></i><i></i><i></i></span>';
  field.insertBefore(props, field.querySelector(".scene-text"));

  const plate = document.createElement("span");
  plate.className = "rex-plate";
  plate.setAttribute("aria-hidden", "true");
  const film = document.createElement("video");
  film.className = "rex-film";
  film.muted = true;
  film.playsInline = true;
  film.preload = "none";
  film.disablePictureInPicture = true;
  film.addEventListener("playing", () => {
    if (field.dataset.rexPhase === "breach" && !reduced.matches && !document.hidden) {
      film.classList.add("playing");
    } else film.pause();
  });
  function stopFilm() {
    film.pause();
    film.classList.remove("playing");
  }
  reduced.addEventListener("change", () => { if (reduced.matches) stopFilm(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopFilm(); });
  plate.append(film);
  const fragments = document.createElement("span");
  fragments.className = "canopy-debris";
  for (let i = 0; i < 16; i++) {
    const splinter = document.createElement("i");
    const direction = (i + 0.5) / 16;
    splinter.style.setProperty("--launch-x", (direction * 420 - 220) + "px");
    splinter.style.setProperty("--launch-y", (Math.sin(direction * Math.PI) * -100 - 5) + "px");
    splinter.style.setProperty("--spin", (i % 2 ? -1 : 1) * (72 + i * 28) + "deg");
    splinter.style.left = (52 + (i * 7) % 23) + "%";
    splinter.style.width = (5 + (i * 13) % 22) + "px";
    splinter.style.animationDelay = (i % 4) * 30 + "ms";
    fragments.append(splinter);
  }
  plate.append(fragments);
  field.insertBefore(plate, field.querySelector(".transmission-film") || field.querySelector(".scene-text"));
  const warning = document.createElement("span");
  warning.className = "seismic-reading";
  warning.setAttribute("aria-hidden", "true");
  const meter = document.createElement("span");
  meter.className = "seismograph";
  for (const height of [2, 3, 5, 12, 4, 19, 6, 3, 9, 16, 7, 4]) {
    const bar = document.createElement("i");
    bar.style.height = height + "px";
    meter.append(bar);
  }
  const call = document.createElement("span");
  warning.append(meter, call);
  field.append(warning);
  const radio = document.createElement("span");
  radio.className = "station-sr";
  radio.setAttribute("role", "status");
  field.parentElement.append(radio);

  function footstep(near) {
    if (!SoundManager.enabled || document.hidden) return;
    SoundManager.playTone(near ? 46 : 39, near ? 0.42 : 0.32, "sine", near ? 0.63 : 0.43);
    SoundManager.playTone(near ? 111 : 76, 0.14, "triangle", 0.19);
  }

  let lastLocation = document.body.dataset.location;
  document.addEventListener("sectors-changed", () => {
    const current = document.body.dataset.location;
    if (current !== lastLocation) delete field.dataset.canopy;
    lastLocation = current;
  });

  document.addEventListener("rex-cue", ({ detail: { phase } }) => {
    if (phase === "wrecked") {
      field.dataset.canopy = "damaged";
      return;
    }
    if (phase === "restored") {
      delete field.dataset.canopy;
      return;
    }
    if (phase === "clear") {
      stopFilm();
      delete field.dataset.rexPhase;
      radio.textContent = "";
      return;
    }
    field.dataset.rexPhase = phase;
    if (phase === "footfall") {
      if (!reduced.matches && !document.hidden && !film.src && film.canPlayType("video/mp4")) {
        film.preload = "auto";
        film.src = "assets/rex-breach.mp4";
        film.load();
      }
      footstep(false);
      call.textContent = "Seismic contact";
      radio.textContent = "Heavy footsteps outside the station.";
    } else if (phase === "approach") {
      footstep(true);
      call.textContent = "Contact closing";
    } else if (phase === "breach") {
      if (film.src && !reduced.matches && !document.hidden) {
        film.currentTime = 0;
        film.play().catch(stopFilm);
      }
      call.textContent = "Canopy breach";
      radio.textContent = "Zombie Rex is breaking through the canopy.";
      if (!document.hidden) {
        SoundManager.playTone(68, 0.52, "sawtooth", 0.24);
        SoundManager.playTone(43, 0.8, "triangle", 0.5);
      }
    }
  });
})();
