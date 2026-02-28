import { set } from "idb-keyval";
import { Command } from "../backend/command.js";
import { applyConfigFromEditorUI, setRenaultEnginePresentation } from "./renderer.js";

let calendarEditMode = null, calendarEditMode2026 = null;
let modsParticlesAnimator = null;
let modsParticlesObserverInit = false;

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

function hexToRgb(color) {
  if (!color) return null;
  const trimmed = String(color).trim();
  if (!trimmed.startsWith("#")) return null;

  let hex = trimmed.slice(1);
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) return null;

  const num = Number.parseInt(hex, 16);
  if (Number.isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function readCssVar(varName, fallback = "") {
  const root = getComputedStyle(document.documentElement);
  const value = root.getPropertyValue(varName).trim();
  return value || fallback;
}

function ensureModsParticlesCanvas() {
  let canvas = document.getElementById("modsParticlesCanvas");
  if (canvas) return canvas;

  canvas = document.createElement("canvas");
  canvas.id = "modsParticlesCanvas";
  canvas.className = "mods-particles";
  canvas.setAttribute("aria-hidden", "true");

  document.body.insertBefore(canvas, document.body.firstChild);
  return canvas;
}

function isMods2026ScreenActive() {
  const modPill = document.getElementById("modpill");
  const seasonModsDiv = document.getElementById("season_mods");
  const mods2026View = document.getElementById("mods2026View");

  if (!modPill || !seasonModsDiv || !mods2026View) return false;
  if (!modPill.classList.contains("active")) return false;
  if (seasonModsDiv.classList.contains("hide") || seasonModsDiv.classList.contains("unloaded")) return false;
  if (mods2026View.classList.contains("d-none")) return false;

  return true;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

class ModsParticlesAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.running = false;
    this.raf = 0;
    this.lastTs = 0;
    this.dpr = 1;
    this.w = 0;
    this.h = 0;

    this.particles = [];
    this.palette = [
      { r: 7, g: 151, b: 123 },   // fallback aston-ish
      { r: 245, g: 51, b: 17 },   // fallback ferrari-ish
      { r: 49, g: 114, b: 191 }   // fallback redbull-ish
    ];

    this.onResize = this.onResize.bind(this);
    this.tick = this.tick.bind(this);
  }

  refreshPaletteFromCss() {
    const aston = hexToRgb(readCssVar("--aston-primary", "#07977b"));
    const ferrari = hexToRgb(readCssVar("--ferrari-primary", "#f53311"));
    const redbull = hexToRgb(readCssVar("--redbull-primary", "#3172bf"));
    if (aston) this.palette[0] = aston;
    if (ferrari) this.palette[1] = ferrari;
    if (redbull) this.palette[2] = redbull;
  }

  start() {
    if (this.running) return;
    this.running = true;

    this.refreshPaletteFromCss();
    this.onResize();
    this.seedParticles();

    window.addEventListener("resize", this.onResize, { passive: true });
    this.lastTs = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;

    cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener("resize", this.onResize);

    this.particles = [];
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onResize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.dpr = dpr;

    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);
    this.w = w;
    this.h = h;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  seedParticles() {
    const area = this.w * this.h;
    const target = Math.max(60, Math.min(220, Math.floor(area / 12000)));
    this.particles = [];

    for (let i = 0; i < target; i++) {
      this.particles.push(this.createParticle({ y: rand(0, this.h) }));
    }
  }

  createParticle({ y = null } = {}) {
    const band = Math.random() < 0.34 ? 0 : Math.random() < 0.67 ? 1 : 2;

    const bandMin = (this.w / 3) * band;
    const bandMax = (this.w / 3) * (band + 1);

    const layerRoll = Math.random();
    const layer = layerRoll < 0.62 ? 0 : layerRoll < 0.9 ? 1 : 2; // 0 = far, 2 = near

    const size = layer === 0 ? rand(1.0, 2.0) : layer === 1 ? rand(1.6, 3.2) : rand(2.2, 4.5);
    const alpha = layer === 0 ? rand(0.08, 0.14) : layer === 1 ? rand(0.12, 0.2) : rand(0.14, 0.24);

    const baseVy = layer === 0 ? rand(18, 34) : layer === 1 ? rand(26, 48) : rand(34, 64);
    const vy = -baseVy;
    const vx = rand(6, 16) * (band === 0 ? 0.65 : band === 1 ? 1 : 1.25);

    return {
      band,
      layer,
      x: rand(bandMin - this.w * 0.05, bandMax + this.w * 0.05),
      y: y === null ? this.h + rand(0, this.h * 0.25) : y,
      vx,
      vy,
      r: size,
      a: alpha,
      phase: rand(0, Math.PI * 2),
      twinkle: layer === 0 ? rand(0.35, 0.55) : layer === 1 ? rand(0.4, 0.65) : rand(0.45, 0.75)
    };
  }

  tick(ts) {
    if (!this.running) return;

    const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;

    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.x += Math.sin(ts / 900 + p.phase) * (p.layer === 0 ? 0.25 : p.layer === 1 ? 0.45 : 0.7);

      if (p.y < -20) {
        this.particles[i] = this.createParticle();
        continue;
      }

      const bandMin = (this.w / 3) * p.band;
      const bandMax = (this.w / 3) * (p.band + 1);
      const pad = this.w * 0.06;
      if (p.x < bandMin - pad) p.x = bandMax + pad;
      if (p.x > bandMax + pad) p.x = bandMin - pad;

      const c = this.palette[p.band];
      const tw = 0.65 + 0.35 * Math.sin(ts / (900 / p.twinkle) + p.phase);
      const alpha = p.a * tw;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.shadowBlur = p.layer === 0 ? 0 : p.layer === 1 ? 2 : 5;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";

    this.raf = requestAnimationFrame(this.tick);
  }
}

function updateModsParticlesState() {
  if (prefersReducedMotion()) {
    if (modsParticlesAnimator) modsParticlesAnimator.stop();
    return;
  }

  const shouldRun = isMods2026ScreenActive();
  if (shouldRun) {
    if (!modsParticlesAnimator) {
      modsParticlesAnimator = new ModsParticlesAnimator(ensureModsParticlesCanvas());
    }
    modsParticlesAnimator.start();
  } else if (modsParticlesAnimator) {
    modsParticlesAnimator.stop();
  }
}

function initModsParticlesObserver() {
  if (modsParticlesObserverInit) return;
  modsParticlesObserverInit = true;

  const modPill = document.getElementById("modpill");
  const seasonModsDiv = document.getElementById("season_mods");
  const mods2026View = document.getElementById("mods2026View");

  const observerTargets = [modPill, seasonModsDiv, mods2026View].filter(Boolean);
  if (!observerTargets.length) return;

  const mo = new MutationObserver(() => updateModsParticlesState());
  observerTargets.forEach((el) => {
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  document.addEventListener("visibilitychange", () => updateModsParticlesState());
  updateModsParticlesState();
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
  updateModsParticlesState();
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
      }
    });
  }

  const changePerformanceButton2026 = mods2026View.querySelector(".change-performance-2026");
  if (changePerformanceButton2026) {
    changePerformanceButton2026.addEventListener("click", function () {
      const alfaReplaceButton = document.querySelector("#alfaReplaceButton button");
      if (alfaReplaceButton && alfaReplaceButton.dataset.value === "stake") {
        applyConfigFromEditorUI({ alfa: "audi" });
      }

      const command = new Command("add2026Engines", {mod: "2026"});
      command.execute();
      setRenaultEnginePresentation("honda");
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

  const aduoToggle = mods2026View.querySelector("#aduoTPSToggle");
  if (aduoToggle) {
    aduoToggle.addEventListener("change", function () {
      const enabled = this.checked;
      const command = new Command("updateAduoTPEnabled", { enabled });
      command.execute();
      syncMods2026ApplyAllButtonState();
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
          if (aduoToggle && !aduoToggle.checked) {
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
  initModsParticlesObserver();
}

export function syncMods2026ApplyAllButtonState() {
  const mods2026View = document.getElementById("mods2026View");
  if (!mods2026View) return;

  const applyAllButton = mods2026View.querySelector(".apply-all-2026");
  if (!applyAllButton) return;

  const applyAllText = applyAllButton.querySelector("span");
  const aduoToggle = mods2026View.querySelector("#aduoTPSToggle");

  const remaining = mods2026View.querySelectorAll(
    ".one-change-button:not(.completed):not(.disabled)"
  ).length;

  const allApplied = remaining === 0 && (!aduoToggle || aduoToggle.checked);

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
  const changesGrid = mods2026View.querySelector(".changes-grid");
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

  // if (!modBlocking) return;
  // if (data === "AlreadyEdited" || data === "Start2024" ) {
  //   modBlocking.classList.add("d-none");
  //   changesGrid.classList.remove("d-none");
  //   recommendedDownloads.classList.remove("d-none");
  // } else {
  //   modBlocking.classList.remove("d-none");
  //   changesGrid.classList.add("d-none");
  //   recommendedDownloads.classList.add("d-none");
  // }
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

