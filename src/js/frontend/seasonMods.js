import { Command } from "../backend/command.js";
import { setRenaultEnginePresentation } from "./renderer.js";

let calendarEditMode = null, calendarEditMode2026 = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function replaceTextLetterByLetter(elem, nextText, { deleteDelay = 30, typeDelay = 42 } = {}) {
  if (!elem) return;

  const currentText = (elem.textContent || "").trim();
  if (currentText === nextText) return;

  for (let i = currentText.length; i >= 0; i--) {
    elem.textContent = currentText.slice(0, i);
    await sleep(deleteDelay);
  }

  for (let i = 0; i < nextText.length; i++) {
    elem.textContent = nextText.slice(0, i + 1);
    await sleep(typeDelay);
  }
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
  });

  setModsSeason(2025);
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
    });
  }

  const add2025Results = mods2026View.querySelector(".add-results-2026");
  if (add2025Results) {
    add2025Results.addEventListener("click", function () {
      const command = new Command("changeCfd", {mod: "2026"});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";
    });
  }

  const changeRegulationsButton = mods2026View.querySelector(".change-regulations-2026");
  if (changeRegulationsButton) {
    changeRegulationsButton.addEventListener("click", async function () {
      if (this.classList.contains("completed") || this.dataset.running === "1") return;
      this.dataset.running = "1";
      this.classList.add("disabled");

      const command = new Command("changeRegulations", {mod: "2026"});
      try {
        command.execute();
        const command2 = new Command("add2026Engines", {mod: "2026"});
        command2.execute();
        setRenaultEnginePresentation("honda");

        const engineRenamed = mods2026View.querySelector(".engine-renamed");
        if (engineRenamed) {
          await replaceTextLetterByLetter(engineRenamed, "Honda");
          engineRenamed.classList.add("bold-font", "engine-renamed-honda");
        }

        const engineAppear = mods2026View.querySelector(".engine-appear");
        if (engineAppear) {
          // Force a layout pass so the transition reliably runs even if the view just became visible.
          void engineAppear.offsetHeight;
          engineAppear.classList.add("engine-appear-visible");
        }

        this.classList.add("completed");
        this.querySelector("span").textContent = "Applied";
      }
      finally {
        this.dataset.running = "0";
        this.classList.remove("disabled");
      }
    });
  }

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
      const command = new Command("changeLineUps", {});
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
      const command = new Command("changeStats", {});
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
      const command = new Command("extraDrivers", {});
      command.execute();
      this.classList.add("completed");
      this.querySelector("span").textContent = "Applied";

      const lineUps = mods2025View.querySelector(".change-line-ups");
      if (lineUps) {
        lineUps.classList.remove("disabled");
        const lineUpsText = lineUps.querySelector("span");
        if (lineUpsText) lineUpsText.textContent = "Apply";
      }
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
      const command = new Command("changePerformance", {});
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
}

export function updateMod2026Blocking(data) {
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;

  const timeTravelButton = mods2026View.querySelector(".time-travel-2026");
  const timeTravelText = timeTravelButton ? timeTravelButton.querySelector("span") : null;
  const changeCalendarButton = mods2026View.querySelector(".change-calendar-2026");
  const changeCalendarText = changeCalendarButton ? changeCalendarButton.querySelector("span") : null;

  calendarEditMode2026 = null;

  const allowTimeTravel = data === "Start2024" || data === "Start2025";
  if (timeTravelButton && !timeTravelButton.classList.contains("completed")) {
    timeTravelButton.classList.toggle("disabled", !allowTimeTravel);
    if (timeTravelText) timeTravelText.textContent = allowTimeTravel ? "Apply" : "Disabled";
  }

  const allowCalendarEdit = data === "Start2024" || data === "Start2025" || data === "End2025" || data === "Direct2026" || data === "AlreadyEdited";
  if (allowCalendarEdit) {
    calendarEditMode2026 = data;
  }

  if (changeCalendarButton && !changeCalendarButton.classList.contains("completed")) {
    changeCalendarButton.classList.toggle("disabled", !allowCalendarEdit);
    if (changeCalendarText) changeCalendarText.textContent = allowCalendarEdit ? "Apply" : "Disabled";
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

