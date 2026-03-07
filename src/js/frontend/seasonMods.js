import { set } from "idb-keyval";
import { Command } from "../backend/command.js";
import { applyConfigFromEditorUI, custom_team, replace_custom_team_logo, setRenaultEnginePresentation, updateJenzerToDams } from "./renderer.js";

let calendarEditMode = null, calendarEditMode2026 = null;
let mods2026IlluminationTimeout = null;

function normalizeToggleEnabled(value) {
  return value === true || value === 1 || value === "1";
}

function clearMods2026Illumination() {
  if (mods2026IlluminationTimeout) {
    clearTimeout(mods2026IlluminationTimeout);
    mods2026IlluminationTimeout = null;
  }

  const mods2026View = document.getElementById("mods2026View");
  if (mods2026View) mods2026View.classList.remove("illuminated");
}

function seasonModsIsVisible() {
  const seasonModsDiv = document.getElementById("season_mods");
  if (!seasonModsDiv) return false;
  return !seasonModsDiv.classList.contains("hide") && !seasonModsDiv.classList.contains("unloaded");
}

function scheduleMods2026Illumination() {
  clearMods2026Illumination();

  mods2026IlluminationTimeout = setTimeout(() => {
    mods2026IlluminationTimeout = null;

    if (!seasonModsIsVisible()) return;

    const mods2026Pill = document.getElementById("mods2026Pill");
    if (mods2026Pill && !mods2026Pill.classList.contains("active")) return;

    const mods2026View = document.getElementById("mods2026View");
    if (mods2026View && !mods2026View.classList.contains("d-none")) {
      mods2026View.classList.add("illuminated");
    }
  }, 2200);
}

function setAduoTpTogglesChecked(enabled) {
  const aduoButton = document.querySelector("#mods2026View .change-aduo-tps-2026");
  if (aduoButton) aduoButton.classList.toggle("completed", enabled);

  const settingsToggle = document.getElementById("aduoTPSToggleSettings");
  if (settingsToggle) settingsToggle.checked = enabled;
}

function updateAduoTpEnabled(enabled) {
  setAduoTpTogglesChecked(enabled);
  const command = new Command("updateAduoTPEnabled", { enabled });
  command.execute();
  syncMods2026ApplyAllButtonState();
}

function getCustomTeamName() {
  const teamNode = document.querySelector(".ct-teamname");
  return String(teamNode?.dataset.teamshow || teamNode?.dataset.teamname || "");
}

function shouldAutoApplyCadillacLogo() {
  if (!custom_team) return false;
  return getCustomTeamName().toLowerCase().includes("cadillac");
}

let cadillacLogoDataUrlPromise = null;

function getCadillacLogoDataUrl() {
  if (cadillacLogoDataUrlPromise) return cadillacLogoDataUrlPromise;

  cadillacLogoDataUrlPromise = fetch("../assets/images/logos/cadillac.png")
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error("Cadillac logo not found"))))
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Failed to read Cadillac logo"));
      reader.readAsDataURL(blob);
    }))
    .catch(() => null);

  return cadillacLogoDataUrlPromise;
}

function tryApplyCadillacCustomLogo() {
  if (!shouldAutoApplyCadillacLogo()) return;

  getCadillacLogoDataUrl().then((dataUrl) => {
    if (!dataUrl) return;
    replace_custom_team_logo(String(dataUrl));
  });
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animatePointsValue(element, targetValue, durationMs = 1000) {
  if (!element) return;

  const startValueRaw = Number.parseInt(String(element.textContent).replace(/[^\d-]/g, ""), 10);
  const startValue = startValueRaw
  const endValue = Number(targetValue);

  if (prefersReducedMotion() || durationMs <= 0) {
    element.textContent = String(endValue);
    return;
  }

  const token = String((Number(element.dataset.animToken || "0") || 0) + 1);
  element.dataset.animToken = token;

  const startTs = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const tick = (now) => {
    if (element.dataset.animToken !== token) return;

    const t = Math.min(1, (now - startTs) / durationMs);
    const eased = easeOutCubic(t);
    const current = Math.round(startValue + (endValue - startValue) * eased);
    element.textContent = String(current);

    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function setModsSeason(seasonYear) {
  const mods2025Pill = document.getElementById("mods2025Pill");
  const mods2026Pill = document.getElementById("mods2026Pill");
  const mods2025View = document.getElementById("mods2025View");
  const mods2026View = document.getElementById("mods2026View");

  if (!mods2025Pill || !mods2026Pill || !mods2025View || !mods2026View) return;

  const is2026 = String(seasonYear) === "2026";
  mods2025Pill.classList.toggle("active", !is2026);
  mods2026Pill.classList.toggle("active", is2026);

  mods2025View.classList.toggle("d-none", is2026);
  mods2026View.classList.toggle("d-none", !is2026);

  if (!is2026) clearMods2026Illumination();
}

function initModsSeasonPills() {
  const mods2025Pill = document.getElementById("mods2025Pill");
  const mods2026Pill = document.getElementById("mods2026Pill");

  if (!mods2025Pill || !mods2026Pill) return;
  if (mods2025Pill.dataset.modsInit === "1") return;
  mods2025Pill.dataset.modsInit = "1";

  mods2025Pill.addEventListener("click", function (e) {
    e.preventDefault();
    setModsSeason(2025);
  });

  mods2026Pill.addEventListener("click", function (e) {
    e.preventDefault();
    setModsSeason(2026);
    scheduleMods2026Illumination();
  });

  setModsSeason(2026);
}

function initMods2026Actions(){
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;
  if (mods2026View.dataset.modsActionsInit === "1") return;
  mods2026View.dataset.modsActionsInit = "1";

  const timeTravelButton = mods2026View.querySelector(".time-travel-2026");
  if (timeTravelButton) {
    timeTravelButton.addEventListener("click", function () {
      const command = new Command("timeTravel", { dayNumber: 46019, mod: "2026" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
    });
  }

  const changeCalendarButton = mods2026View.querySelector(".change-calendar-2026");
  if (changeCalendarButton) {
    changeCalendarButton.addEventListener("click", function () {
      if (!calendarEditMode2026) return;
      const command = new Command("changeCalendar", { type: calendarEditMode2026, mod: "2026" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
    });
  }

  const add2025Results = mods2026View.querySelector(".add-results-2026");
  const add2025ResultsPoints = Array.from(mods2026View.querySelectorAll(".add-results-points[data-target]"));

  const setAdd2025ResultsPoints = (animate = false) => {
    add2025ResultsPoints.forEach((el) => {
      el.classList.add("activated")
      const target = Number(el.dataset.target);
      if (animate) animatePointsValue(el, target, 1000);
      else el.textContent = String(target);
    });
  };

  if (add2025Results) {
    if (add2025Results.classList.contains("completed")) {
      setAdd2025ResultsPoints(false);
    }

    const mo = new MutationObserver(() => {
      if (add2025Results.classList.contains("completed")) {
        setAdd2025ResultsPoints(false);
      }
    });
    mo.observe(add2025Results, { attributes: true, attributeFilter: ["class"] });

    add2025Results.addEventListener("click", function () {
      setAdd2025ResultsPoints(true);
      const command = new Command("changeCfd", {mod: "2026"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
    });
  }

  const changeRegulationsButton = mods2026View.querySelector(".change-regulations-2026");
  if (changeRegulationsButton) {
    changeRegulationsButton.addEventListener("click", function () {
      if (this.classList.contains("completed") || this.dataset.running === "1") return;
      this.dataset.running = "1";
      this.classList.add("disabled");

      const command = new Command("changeRegulations", {mod: "2026"});
      try {
        command.execute();

        this.classList.add("completed");
        this.querySelector("span").textContent = "Applied";
        syncMods2026ApplyAllButtonState();
      }
      finally {
        this.dataset.running = "0";
        this.classList.remove("disabled");

        const command2 = new Command("regulationsRefresh", {});
        command2.execute();
      }
    });
  }

  const changePerformanceButton2026 = mods2026View.querySelector(".change-performance-2026");
  if (changePerformanceButton2026) {
    const syncJenzerDamsState = () => {
      updateJenzerToDams(changePerformanceButton2026.classList.contains("completed") ? "dams" : "jenzer");
    };

    // Ensure the UI-dependent state is correct when the mod was already applied
    // (e.g. after "Mod data fetched" marks the button as completed).
    syncJenzerDamsState();

    const mo = new MutationObserver(() => syncJenzerDamsState());
    mo.observe(changePerformanceButton2026, { attributes: true, attributeFilter: ["class"] });

    changePerformanceButton2026.addEventListener("click", function () {
      tryApplyCadillacCustomLogo();

      const alfaReplaceButton = document.querySelector("#alfaReplaceButton button");
      if (alfaReplaceButton && alfaReplaceButton.dataset.value === "stake") {
        applyConfigFromEditorUI({ alfa: "audi" });
      }

      const command = new Command("add2026Engines", {mod: "2026"});
      command.execute();
      setRenaultEnginePresentation("honda");
      updateJenzerToDams("dams");
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
      const command2 = new Command("changePerformance", {mod: "2026"});
      command2.execute();
    });
  }

  const changeStatsButton = mods2026View.querySelector(".change-stats-2026");
  if (changeStatsButton) {
    changeStatsButton.addEventListener("click", function () {
      const command = new Command("changeStats", {mod: "2026"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
    });
  }

  const extraDriversButton = mods2026View.querySelector(".extra-drivers-2026");
  if (extraDriversButton) {
    extraDriversButton.addEventListener("click", function () {
      const command = new Command("extraDrivers", {mod: "2026"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026Dependencies();
      syncMods2026ApplyAllButtonState();
    });
  }

  const driverLineUpsButton = mods2026View.querySelector(".change-line-ups-2026");
  if (driverLineUpsButton) {
    driverLineUpsButton.addEventListener("click", function () {
      const command = new Command("changeLineUps", {mod: "2026"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2026ApplyAllButtonState();
      document.querySelector("#mods2026View .had-ovr").classList.remove("atfont");
      document.querySelector("#mods2026View .had-ovr").classList.add("rbfont");
      document.querySelector("#mods2026View .ant-ovr").classList.add("mefont");
    });

  }

  const aduoToggle = mods2026View.querySelector(".change-aduo-tps-2026");
  if (aduoToggle) {
    aduoToggle.addEventListener("click", function () {
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      updateAduoTpEnabled(this.classList.contains("completed"));
    });
  }

  const settingsToggle = document.getElementById("aduoTPSToggleSettings");
  if (settingsToggle && settingsToggle.dataset.aduoInit !== "1") {
    settingsToggle.dataset.aduoInit = "1";
    settingsToggle.addEventListener("change", function () {
      updateAduoTpEnabled(this.checked);
    });
  }

  const applyAllButton = mods2026View.querySelector(".apply-all-2026");

  if (applyAllButton) {
    applyAllButton.addEventListener("click", function () {
      if (applyAllButton.dataset.running === "1") return; // anti-bucle
      applyAllButton.dataset.running = "1";

      const clickNext = () => {
        syncMods2026Dependencies();

        const btn = mods2026View.querySelector(".one-change-button:not(.completed):not(.disabled)");
        if (!btn) {
          if (aduoToggle && !aduoToggle.classList.contains("completed")) {
            aduoToggle.click();
          }
          applyAllButton.dataset.running = "0";
          syncMods2026ApplyAllButtonState();
          return;
        }

        btn.click();
        setTimeout(clickNext, 300);
      };

      clickNext();
    }, { once: true }); // evita listeners duplicados
  }

  syncMods2026Dependencies();
  syncMods2026ApplyAllButtonState();
}

function initMods2025Actions() {
  const mods2025View = document.getElementById("mods2025View");
  if (!mods2025View) return;
  if (mods2025View.dataset.modsActionsInit === "1") return;
  mods2025View.dataset.modsActionsInit = "1";

  const timeTravelButton = mods2025View.querySelector(".time-travel");
  if (timeTravelButton) {
    timeTravelButton.addEventListener("click", function () {
      const command = new Command("timeTravel", { dayNumber: 45657, mod: "2025" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeLineUpsButton = mods2025View.querySelector(".change-line-ups");
  if (changeLineUpsButton) {
    changeLineUpsButton.addEventListener("click", function () {
      const command = new Command("changeLineUps", { mod: "2025" });
      command.execute();

      const hamTransfer = mods2025View.querySelector(".ham-transfer");
      const saiTransfer = mods2025View.querySelector(".sai-transfer");
      const antTransfer = mods2025View.querySelector(".ant-transfer");
      const antOvr = mods2025View.querySelector(".ant-ovr");
      const borOvr = mods2025View.querySelector(".bor-ovr");

      if (hamTransfer) hamTransfer.classList.remove("mefont");
      if (saiTransfer) saiTransfer.classList.remove("fefont");
      if (hamTransfer) hamTransfer.classList.add("fefont");
      if (saiTransfer) saiTransfer.classList.add("wifont");
      if (antTransfer) antTransfer.classList.add("mefont");
      if (antOvr) antOvr.classList.add("mefont");
      if (borOvr) borOvr.classList.remove("mcfont");
      if (borOvr) borOvr.classList.add("affont");

      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeStatsButton = mods2025View.querySelector(".change-stats");
  if (changeStatsButton) {
    changeStatsButton.addEventListener("click", function () {
      const command = new Command("changeStats", { mod: "2025" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeCfdButton = mods2025View.querySelector(".change-cfd");
  if (changeCfdButton) {
    changeCfdButton.addEventListener("click", function () {
      const command = new Command("changeCfd", {mod : "2025"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeRegulationsButton = mods2025View.querySelector(".change-regulations");
  if (changeRegulationsButton) {
    changeRegulationsButton.addEventListener("click", function () {
      const command = new Command("changeRegulations", { mod: "2025" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const extraDriversButton = mods2025View.querySelector(".extra-drivers");
  if (extraDriversButton) {
    extraDriversButton.addEventListener("click", function () {
      const command = new Command("extraDrivers", { mod: "2025" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2025Dependencies();
    });
  }

  const changeCalendarButton = mods2025View.querySelector(".change-calendar");
  if (changeCalendarButton) {
    changeCalendarButton.addEventListener("click", function () {
      if (!calendarEditMode) return;
      const command = new Command("changeCalendar", { type: calendarEditMode, mod: "2025" });
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changePerformanceButton = mods2025View.querySelector(".change-performance");
  if (changePerformanceButton) {
    changePerformanceButton.addEventListener("click", function () {
      const command = new Command("changePerformance", { mod: "2025" });
      command.execute();

      const mclaren = mods2025View.querySelector(".mclaren-performance");
      const redbull = mods2025View.querySelector(".redbull-performance");
      const williams = mods2025View.querySelector(".williams-performance");
      if (mclaren) mclaren.innerText = "63.7%";
      if (redbull) redbull.innerText = "59.4%";
      if (williams) williams.innerText = "56.8%";

      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }
}

export function initSeasonMods() {
  const seasonModsDiv = document.getElementById("season_mods");
  if (!seasonModsDiv) return;

  initModsSeasonPills();
  initMods2025Actions();
  initMods2026Actions();

  if (seasonModsDiv.dataset.modsIllumInit !== "1") {
    seasonModsDiv.dataset.modsIllumInit = "1";
    let wasVisible = seasonModsIsVisible();

    const syncVisibility = () => {
      const visible = seasonModsIsVisible();
      if (visible === wasVisible) return;
      wasVisible = visible;

      if (!visible) {
        clearMods2026Illumination();
        return;
      }

      const mods2026Pill = document.getElementById("mods2026Pill");
      if (mods2026Pill && mods2026Pill.classList.contains("active")) {
        scheduleMods2026Illumination();
      }
    };

    const mo = new MutationObserver(syncVisibility);
    mo.observe(seasonModsDiv, { attributes: true, attributeFilter: ["class"] });

    if (wasVisible) {
      const mods2026Pill = document.getElementById("mods2026Pill");
      if (mods2026Pill && mods2026Pill.classList.contains("active")) {
        scheduleMods2026Illumination();
      }
    }
  }
}

export function syncAduoTpToggles(enabledRaw) {
  const enabled = normalizeToggleEnabled(enabledRaw);
  setAduoTpTogglesChecked(enabled);
  syncMods2026ApplyAllButtonState();
}

export function syncMods2026ApplyAllButtonState() {
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;

  const applyAllButton = mods2026View.querySelector(".apply-all-2026");
  if (!applyAllButton) return;

  const applyAllText = applyAllButton.querySelector("span");
  const aduoToggle = mods2026View.querySelector(".change-aduo-tps-2026");

  const remaining = mods2026View.querySelectorAll(
    ".one-change-button:not(.completed):not(.disabled)"
  ).length;

  const allApplied = remaining === 0 && (!aduoToggle || aduoToggle.classList.contains("completed"));

  applyAllButton.classList.toggle("applied", allApplied);
  if (applyAllText) applyAllText.textContent = allApplied ? "Applied" : "Apply all";
}

export function syncMods2025Dependencies() {
  const mods2025View = document.getElementById("mods2025View");
  if (!mods2025View) return;

  const extraDriversButton = mods2025View.querySelector(".extra-drivers");
  const lineUpsButton = mods2025View.querySelector(".change-line-ups");
  if (!lineUpsButton) return;

  if (lineUpsButton.classList.contains("completed")) {
    lineUpsButton.classList.remove("disabled");
    return;
  }

  const hasExtraDrivers = !!(extraDriversButton && extraDriversButton.classList.contains("completed"));
  const lineUpsText = lineUpsButton.querySelector("span");

  lineUpsButton.classList.toggle("disabled", !hasExtraDrivers);
  if (lineUpsText) {
    lineUpsText.textContent = hasExtraDrivers ? "Apply" : "Requires extra drivers";
  }
}

export function syncMods2026Dependencies() {
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;

  const extraDriversButton = mods2026View.querySelector(".extra-drivers-2026");
  const lineUpsButton = mods2026View.querySelector(".change-line-ups-2026");
  if (!lineUpsButton) return;

  if (lineUpsButton.classList.contains("completed")) {
    lineUpsButton.classList.remove("disabled");
    return;
  }

  const hasExtraDrivers = !!(extraDriversButton && extraDriversButton.classList.contains("completed"));
  const lineUpsText = lineUpsButton.querySelector("span");

  lineUpsButton.classList.toggle("disabled", !hasExtraDrivers);
  if (lineUpsText) {
    lineUpsText.textContent = hasExtraDrivers ? "Apply" : "Requires extra drivers";
  }
}

export function updateMod2026Blocking(data) {
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;

  const timeTravelButton = mods2026View.querySelector(".time-travel-2026");
  const timeTravelText = timeTravelButton ? timeTravelButton.querySelector("span") : null;
  const changeCalendarButton = mods2026View.querySelector(".change-calendar-2026");
  const changeCalendarText = changeCalendarButton ? changeCalendarButton.querySelector("span") : null;

  const modBlocking = mods2026View.querySelector(".mod-blocking.mods-2026-blocking");
  const changesGrid = mods2026View.querySelector(".grid-and-downloads");
  const recommendedDownloads = mods2026View.querySelector(".recommended-downloads");

  calendarEditMode2026 = null;

  const allowTimeTravel = data === "Start2024" || data === "AlreadyEdited";
  if (timeTravelButton && !timeTravelButton.classList.contains("completed")) {
    timeTravelButton.classList.toggle("disabled", !allowTimeTravel);
    if (timeTravelText) timeTravelText.textContent = allowTimeTravel ? "Apply" : "Disabled";
  }

  const allowCalendarEdit = data === "Start2024" || data === "AlreadyEdited";
  if (allowCalendarEdit) {
    calendarEditMode2026 = data;
  }

  if (changeCalendarButton && !changeCalendarButton.classList.contains("completed")) {
    changeCalendarButton.classList.toggle("disabled", !allowCalendarEdit);
    if (changeCalendarText) changeCalendarText.textContent = allowCalendarEdit ? "Apply" : "Disabled";
  }

  if (!modBlocking) return;
  if (data === "AlreadyEdited" || data === "Start2024" ) {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");
    recommendedDownloads.classList.remove("d-none");
  } else {
    modBlocking.classList.remove("d-none");
    changesGrid.classList.add("d-none");
    recommendedDownloads.classList.add("d-none");
  }
}

export function updateMod2025Blocking(data) {
  const mods2025View = document.getElementById("mods2025View");
  if (!mods2025View) return;

  const modBlocking = mods2025View.querySelector(".mod-blocking");
  const changesGrid = mods2025View.querySelector(".changes-grid");
  const timeTravelButton = mods2025View.querySelector(".time-travel");
  const timeTravelText = timeTravelButton ? timeTravelButton.querySelector("span") : null;

  if (!modBlocking || !changesGrid) return;

  if (data === "AlreadyEdited") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");
  } else if (data === "Start2024") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");

    if (timeTravelButton) timeTravelButton.classList.remove("disabled");
    if (timeTravelText) timeTravelText.textContent = "Apply";
    calendarEditMode = data;
  } else if (data === "Direct2025" || data === "End2024") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");

    if (timeTravelButton) timeTravelButton.classList.add("disabled");
    if (timeTravelText) timeTravelText.textContent = "Disabled";
    calendarEditMode = data;
  } else {
    modBlocking.classList.remove("d-none");
    changesGrid.classList.add("d-none");
  }
}

