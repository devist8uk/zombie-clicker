/* Presentation controls share the engine's sector list and save state. */
(() => {
  const byId = (id) => document.getElementById(id);
  const weaponList = byId("weapon-upgrades");
  const survivorList = byId("survivor-upgrades");
  const tabButtons = [...document.querySelectorAll("[data-shop]")];
  tabButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const weapons = button.dataset.shop === "weapon";
      weaponList.hidden = !weapons;
      survivorList.hidden = weapons;
      byId("shelf-label").textContent = weapons
        ? "Strike upgrades"
        : "Automatic kills";
      for (const tab of tabButtons) {
        const selected = tab === button;
        tab.classList.toggle("selected", selected);
        tab.setAttribute("aria-pressed", String(selected));
      }
    }),
  );

  document
    .querySelectorAll("#weapon-upgrades .upgrade-btn")
    .forEach((button) => {
      const thumb = document.createElement("img");
      thumb.src = "assets/patch-" + button.dataset.upgradeId + ".jpg";
      thumb.alt = "";
      thumb.width = thumb.height = 48;
      button.querySelector(".item-icon").replaceChildren(thumb);
    });

  const settings = byId("settings");
  const shake = byId("camera-shake");
  try {
    shake.checked = localStorage.getItem("deadFrequencyCameraShake") !== "off";
  } catch { /* Browser storage may be unavailable. */ }
  const setShake = () => {
    document.documentElement.dataset.shake = shake.checked ? "on" : "off";
  };
  setShake();
  shake.addEventListener("change", () => {
    setShake();
    try { localStorage.setItem("deadFrequencyCameraShake", document.documentElement.dataset.shake); } catch {}
  });
  byId("settings-btn").addEventListener("click", () => settings.showModal());
  byId("save-btn").addEventListener("click", () => settings.close());
  byId("close-panel").addEventListener("click", toggleSidePanel);
  byId("drawer-backdrop").addEventListener("click", toggleSidePanel);

  const detail = byId("sector-detail");
  let selectedSector;
  const scenePath = (index) =>
    index === 0
      ? "assets/sector-01.jpg"
      : "assets/sector-" + String(index + 1).padStart(2, "0") + ".webp";
  const reports = [
    "The pumps went dry three nights ago. The attendant is still on shift.",
    "Someone on Ward Seven keeps pressing the call button.",
    "The last song on the food court PA has been playing for eleven days.",
    "The perimeter held. The infection came from inside.",
    "A cracked visor. An empty containment chamber. One open channel.",
    "The evacuation road ends at a gate that opens from the other side.",
    "The final transmission has your voice. You haven’t sent it yet.",
  ];
  const routeIcons = {
    lock: '<svg class="icon" aria-hidden="true"><use href="#i-lock"></use></svg>',
    active:
      '<svg class="icon" aria-hidden="true"><use href="#i-signal"></use></svg>',
  };
  function showSector(index) {
    selectedSector = locations[index];
    const unlocked = gameState.unlockedLocations.includes(selectedSector.id);
    const current = getCurrentLocation().id === selectedSector.id;
    byId("detail-number").textContent =
      "SECTOR " + String(index + 1).padStart(2, "0") + " / 07";
    byId("detail-name").textContent = locationLabel(selectedSector);
    byId("detail-note").textContent =
      reports[index] +
      "\n\n" +
      (unlocked
        ? "Sector multiplier: " + selectedSector.zombieBonus + "×"
        : "Unlock at " +
          selectedSector.unlockKills.toLocaleString("en-US") +
          " total kills.");
    detail.style.setProperty("--thumb", 'url("' + scenePath(index) + '")');
    const sighting = byId("watch-rex");
    sighting.hidden = index !== 0 || !current;
    sighting.disabled = gameState.bossActive || gameState.waveActive || gameState.goldenZombieActive || rexEntrancePending;
    const travel = byId("travel-btn");
    travel.textContent = current
      ? "Return to combat"
      : unlocked
        ? "Enter sector"
        : "Close map entry";
    detail.showModal();
  }
  byId("watch-rex").addEventListener("click", () => {
    detail.close();
    byId("zombie-target").focus();
    if (rexEntrancePending || gameState.bossActive || gameState.waveActive || gameState.goldenZombieActive) return;
    if (SoundManager.enabled && !SoundManager.audioContext) SoundManager.init();
    playRexEntrance();
  });
  byId("travel-btn").addEventListener("click", () => {
    if (gameState.unlockedLocations.includes(selectedSector.id)) {
      if (getCurrentLocation().id !== selectedSector.id)
        switchLocation(selectedSector.id);
      detail.close();
      byId("zombie-target").focus();
    } else detail.close();
  });
  const routeCards = locations.map((location, index) => {
    const card = document.createElement("button");
    card.className = "route-card";
    card.style.setProperty("--thumb", 'url("' + scenePath(index) + '")');
    card.innerHTML =
      '<span class="route-id"><span>' +
      String(index + 1).padStart(2, "0") +
      '</span><span class="route-status"></span></span><span class="route-name"></span>';
    card.querySelector(".route-name").textContent = locationLabel(location);
    card.addEventListener("click", () => showSector(index));
    byId("sector-cards").appendChild(card);
    return card;
  });
  function updateRoute() {
    routeCards.forEach((card, index) => {
      const location = locations[index];
      const current = getCurrentLocation().id === location.id;
      const unlocked = gameState.unlockedLocations.includes(location.id);
      card.classList.toggle("unlocked", unlocked);
      card.setAttribute("aria-current", String(current));
      card.setAttribute(
        "aria-label",
        locationLabel(location) +
          (current
            ? ", current sector"
            : unlocked
              ? ", available"
              : ", locked"),
      );
      card.querySelector(".route-status").innerHTML = unlocked
        ? routeIcons.active
        : routeIcons.lock;
    });
    byId("route-count").textContent =
      gameState.unlockedLocations.length +
      " / " +
      locations.length +
      " unlocked";
  }
  updateRoute();
  document.addEventListener("sectors-changed", updateRoute);

  // The sight follows the player's aim on a mouse. Touch hits use their own impact ring.
  const battlefield = byId("zombie-target");
  const sight = battlefield.querySelector(".scope");
  battlefield.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = battlefield.getBoundingClientRect();
    sight.style.left = event.clientX - bounds.left + "px";
    sight.style.top = event.clientY - bounds.top + "px";
  });
  battlefield.addEventListener("pointerleave", () => {
    sight.style.removeProperty("left");
    sight.style.removeProperty("top");
  });
  for (const panel of [settings, detail]) {
    panel.addEventListener("click", (event) => {
      if (event.target !== panel) return;
      const bounds = panel.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        panel.close();
    });
  }
  const updateNav = () => {
    document.querySelectorAll(".mast nav a").forEach((link) => {
      link.classList.toggle(
        "nav-current",
        link.hash === (location.hash || "#combat"),
      );
    });
  };
  window.addEventListener("hashchange", updateNav);
  updateNav();
})();
