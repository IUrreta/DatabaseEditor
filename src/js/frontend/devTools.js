import { saveAs } from "file-saver";
import { Command } from "../backend/command.js";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

if (isLocalhost) {
  let windowEl = null;
  let isOpen = false;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function createWindow() {
    windowEl = document.createElement("div");
    windowEl.className = "devtools-window";
    windowEl.setAttribute("role", "dialog");
    windowEl.setAttribute("aria-modal", "false");

    const headerEl = document.createElement("div");
    headerEl.className = "devtools-header";

    const chromeEl = document.createElement("div");
    chromeEl.className = "devtools-chrome";

    const chromeDotRed = document.createElement("span");
    chromeDotRed.className = "devtools-dot is-red";

    const chromeDotYellow = document.createElement("span");
    chromeDotYellow.className = "devtools-dot is-yellow";

    const chromeDotGreen = document.createElement("span");
    chromeDotGreen.className = "devtools-dot is-green";

    const titleEl = document.createElement("div");
    titleEl.className = "devtools-title";
    titleEl.textContent = "DEVTOOLS.EXE";

    const statusEl = document.createElement("div");
    statusEl.className = "devtools-status";
    statusEl.textContent = "LOCALHOST SESSION";

    const closeButton = document.createElement("button");
    closeButton.className = "devtools-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "\u00D7";

    const bodyEl = document.createElement("div");
    bodyEl.className = "devtools-body";

    const hintEl = document.createElement("div");
    hintEl.className = "devtools-hint";
    hintEl.textContent = "Ctrl+D to toggle";

    const statsButton = document.createElement("button");
    statsButton.className = "devtools-action";
    statsButton.type = "button";
    statsButton.textContent = "Set all drivers stats to 85";

    const powerUnitConditionButton = document.createElement("button");
    powerUnitConditionButton.className = "devtools-action";
    powerUnitConditionButton.type = "button";
    powerUnitConditionButton.textContent = "Repair all engines/ERS/gearboxes to 75%";

    const downloadButton = document.createElement("button");
    downloadButton.className = "devtools-action";
    downloadButton.type = "button";
    downloadButton.textContent = "Download database (.db)";

    chromeEl.appendChild(chromeDotRed);
    chromeEl.appendChild(chromeDotYellow);
    chromeEl.appendChild(chromeDotGreen);
    headerEl.appendChild(chromeEl);
    headerEl.appendChild(titleEl);
    headerEl.appendChild(statusEl);
    headerEl.appendChild(closeButton);
    bodyEl.appendChild(hintEl);
    bodyEl.appendChild(statsButton);
    bodyEl.appendChild(powerUnitConditionButton);
    bodyEl.appendChild(downloadButton);
    windowEl.appendChild(headerEl);
    windowEl.appendChild(bodyEl);

    document.body.appendChild(windowEl);

    closeButton.addEventListener("click", () => {
      closeWindow();
    });

    closeButton.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });

    statsButton.addEventListener("click", () => {
      statsButton.disabled = true;
      statsButton.textContent = "Working...";

      new Command("devSetAllDriversStats85", {}).execute();

      setTimeout(() => {
        statsButton.disabled = false;
        statsButton.textContent = "Set all drivers stats to 85";
      }, 1200);
    });

    powerUnitConditionButton.addEventListener("click", async () => {
      powerUnitConditionButton.disabled = true;
      powerUnitConditionButton.textContent = "Repairing...";

      try {
        await new Command("devSetMinPowerUnitCondition75", {}).promiseExecute();
        powerUnitConditionButton.textContent = "Repaired";
      } catch (error) {
        console.error(error);
        powerUnitConditionButton.textContent = "Repair failed";
      }

      setTimeout(() => {
        powerUnitConditionButton.disabled = false;
        powerUnitConditionButton.textContent = "Repair all engines/ERS/gearboxes to 75%";
      }, 1200);
    });

    downloadButton.addEventListener("click", async () => {
      downloadButton.disabled = true;
      downloadButton.textContent = "Downloading...";

      try {
        const response = await new Command("devDownloadDatabase", {}).promiseExecute();
        const filename = response?.content?.filename ?? "database.db";
        const fileData = response?.content?.fileData;

        if (!fileData) {
          throw new Error("Missing database data");
        }

        saveAs(new Blob([fileData], { type: "application/vnd.sqlite3" }), filename);
        downloadButton.textContent = "Downloaded";
      } catch (error) {
        console.error(error);
        downloadButton.textContent = "Download failed";
      }

      setTimeout(() => {
        downloadButton.disabled = false;
        downloadButton.textContent = "Download database (.db)";
      }, 1200);
    });

    headerEl.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".devtools-close")) return;
      isDragging = true;

      const rect = windowEl.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;

      windowEl.style.left = `${rect.left}px`;
      windowEl.style.top = `${rect.top}px`;
      windowEl.style.transform = "none";
      windowEl.classList.add("dragging");

      headerEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    headerEl.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      windowEl.style.left = `${x}px`;
      windowEl.style.top = `${y}px`;
    });

    headerEl.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      windowEl.classList.remove("dragging");
      try {
        headerEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
    });
  }

  function openWindow() {
    if (!windowEl) createWindow();
    windowEl.classList.add("show");
    isOpen = true;
  }

  function closeWindow() {
    if (!windowEl) return;
    windowEl.classList.remove("show");
    isOpen = false;
  }

  function toggleWindow() {
    if (isOpen) closeWindow();
    else openWindow();
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat) return;
      if (!e.ctrlKey) return;
      if (e.altKey || e.shiftKey) return;
      if (e.code !== "KeyD") return;
      e.preventDefault();
      toggleWindow();
    },
    true
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWindow();
  });
}
