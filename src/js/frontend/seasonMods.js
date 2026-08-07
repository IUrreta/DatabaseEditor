import { Command } from "../backend/command.js";

let calendarEditMode = null;

function normalizeToggleEnabled(value) {
  return value === true || value === 1 || value === "1";
}

function updateAduoTpEnabled(enabled) {
  const command = new Command("updateAduoTPEnabled", { enabled });
  command.execute();
}

function initAduoTpSetting() {
  const settingsToggle = document.getElementById("aduoTPSToggleSettings");
  if (!settingsToggle || settingsToggle.dataset.aduoInit === "1") return;

  settingsToggle.dataset.aduoInit = "1";
  settingsToggle.addEventListener("change", function () {
    updateAduoTpEnabled(this.checked);
  });
}

function initMods2025Actions() {
  const mods2025View = document.getElementById("mods2025View");
  if (!mods2025View || mods2025View.dataset.modsActionsInit === "1") return;
  mods2025View.dataset.modsActionsInit = "1";

  const timeTravelButton = mods2025View.querySelector(".time-travel");
  if (timeTravelButton) {
    timeTravelButton.addEventListener("click", function () {
      new Command("timeTravel", { dayNumber: 45657, mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeLineUpsButton = mods2025View.querySelector(".change-line-ups");
  if (changeLineUpsButton) {
    changeLineUpsButton.addEventListener("click", function () {
      new Command("changeLineUps", { mod: "2025" }).execute();

      const hamTransfer = mods2025View.querySelector(".ham-transfer");
      const saiTransfer = mods2025View.querySelector(".sai-transfer");
      const antTransfer = mods2025View.querySelector(".ant-transfer");
      const antOvr = mods2025View.querySelector(".ant-ovr");
      const borOvr = mods2025View.querySelector(".bor-ovr");

      hamTransfer?.classList.remove("mefont");
      saiTransfer?.classList.remove("fefont");
      hamTransfer?.classList.add("fefont");
      saiTransfer?.classList.add("wifont");
      antTransfer?.classList.add("mefont");
      antOvr?.classList.add("mefont");
      borOvr?.classList.remove("mcfont");
      borOvr?.classList.add("affont");

      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeStatsButton = mods2025View.querySelector(".change-stats");
  if (changeStatsButton) {
    changeStatsButton.addEventListener("click", function () {
      new Command("changeStats", { mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeCfdButton = mods2025View.querySelector(".change-cfd");
  if (changeCfdButton) {
    changeCfdButton.addEventListener("click", function () {
      new Command("changeCfd", { mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeRegulationsButton = mods2025View.querySelector(".change-regulations");
  if (changeRegulationsButton) {
    changeRegulationsButton.addEventListener("click", function () {
      new Command("changeRegulations", { mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const extraDriversButton = mods2025View.querySelector(".extra-drivers");
  if (extraDriversButton) {
    extraDriversButton.addEventListener("click", function () {
      new Command("extraDrivers", { mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
      syncMods2025Dependencies();
    });
  }

  const changeCalendarButton = mods2025View.querySelector(".change-calendar");
  if (changeCalendarButton) {
    changeCalendarButton.addEventListener("click", function () {
      if (!calendarEditMode) return;
      new Command("changeCalendar", { type: calendarEditMode, mod: "2025" }).execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changePerformanceButton = mods2025View.querySelector(".change-performance");
  if (changePerformanceButton) {
    changePerformanceButton.addEventListener("click", function () {
      new Command("changePerformance", { mod: "2025" }).execute();

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
  if (!document.getElementById("season_mods")) return;
  initMods2025Actions();
  initAduoTpSetting();
}

export function syncAduoTpToggles(enabledRaw) {
  const settingsToggle = document.getElementById("aduoTPSToggleSettings");
  if (settingsToggle) settingsToggle.checked = normalizeToggleEnabled(enabledRaw);
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

  const hasExtraDrivers = Boolean(extraDriversButton?.classList.contains("completed"));
  const lineUpsText = lineUpsButton.querySelector("span");
  lineUpsButton.classList.toggle("disabled", !hasExtraDrivers);
  if (lineUpsText) lineUpsText.textContent = hasExtraDrivers ? "Apply" : "Requires extra drivers";
}

export function updateMod2025Blocking(data) {
  const mods2025View = document.getElementById("mods2025View");
  if (!mods2025View) return;

  const modBlocking = mods2025View.querySelector(".mod-blocking");
  const changesGrid = mods2025View.querySelector(".changes-grid");
  const timeTravelButton = mods2025View.querySelector(".time-travel");
  const timeTravelText = timeTravelButton?.querySelector("span");
  if (!modBlocking || !changesGrid) return;

  if (data === "AlreadyEdited") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");
  } else if (data === "Start2024") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");
    timeTravelButton?.classList.remove("disabled");
    if (timeTravelText) timeTravelText.textContent = "Apply";
    calendarEditMode = data;
  } else if (data === "Direct2025" || data === "End2024") {
    modBlocking.classList.add("d-none");
    changesGrid.classList.remove("d-none");
    timeTravelButton?.classList.add("disabled");
    if (timeTravelText) timeTravelText.textContent = "Disabled";
    calendarEditMode = data;
  } else {
    modBlocking.classList.remove("d-none");
    changesGrid.classList.add("d-none");
  }
}
