import { attachHold } from "./renderer";

let regulationsState = null;

const root = document.getElementById("regulations");

const spendingCapInput = document.getElementById("regSpendingCap");
const engineLimitInput = document.getElementById("regEngineLimit");
const ersLimitInput = document.getElementById("regErsLimit");
const gearboxLimitInput = document.getElementById("regGearboxLimit");

const doubleLastRacePointsToggle = document.getElementById("regDoubleLastRacePoints");
const fastestLapBonusPointToggle = document.getElementById("regFastestLapBonusPoint");
const polePositionBonusPointToggle = document.getElementById("regPolePositionBonusPoint");

const createPointSchemeButton = document.getElementById("regCreatePointScheme");
const createResourcePackageButton = document.getElementById("regCreateResourcePackage");

const pointSchemeDropdownButton = document.getElementById("regPointSchemeButton");
const pointSchemeMenu = document.getElementById("regPointSchemeMenu");
const pointSchemeBody = document.getElementById("regPointSchemeBody");

const resourcePackageDropdownButton = document.getElementById("regResourcePackageButton");
const resourcePackageMenu = document.getElementById("regResourcePackageMenu");
const resourcePackageBody = document.getElementById("regResourcePackageBody");

function getEnumChange(id) {
  return regulationsState?.enumChanges?.[id] ?? null;
}

function parseIntSafe(val, fallback = 0) {
  const n = Number.parseInt(String(val).replace(/[^\d-]/g, ""), 10);
  return n;
}

function formatMoney(val) {
  const n = Number(val);
  return n.toLocaleString("en-US");
}

function getSchemeName(id) {
  const n = Number(id);
  if (n === 1) return "2010–Present";
  if (n === 2) return "2003–2009";
  if (n === 3) return "1991–2002";
  return `Custom Scheme ${n}`;
}

function getPackageName(id) {
  return `Custom Package ${Number(id)}`;
}

function getSelectedPointScheme() {
  const row = getEnumChange("PointScheme");
  const current = row?.CurrentValue ?? 1;
  return Number(current) || 1;
}

function getSelectedResourcePackage() {
  const row = getEnumChange("PartDevResourceLimit");
  const current = row?.CurrentValue ?? 1;
  return Number(current) || 1;
}

function setDropdownLabel(btn, label) {
  const labelEl = btn?.querySelector(".dropdown-label");
  if (labelEl) labelEl.textContent = label;
}

function updateMenus() {
  if (!regulationsState || !pointSchemeMenu || !resourcePackageMenu) return;

  const selectedScheme = getSelectedPointScheme();
  const selectedPackage = getSelectedResourcePackage();

  pointSchemeMenu.innerHTML = "";
  Object.keys(regulationsState.pointSchemes || {})
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((id) => {
      const item = document.createElement("a");
      item.className = "redesigned-dropdown-item";
      item.dataset.value = String(id);
      item.style.cursor = "pointer";
      item.textContent = getSchemeName(id);
      if (id === selectedScheme) {
        const check = document.createElement("i");
        check.className = "bi bi-check";
        item.appendChild(document.createTextNode(" "));
        item.appendChild(check);
      }
      item.addEventListener(
        "click",
        () => {
          regulationsState.enumChanges.PointScheme.CurrentValue = id;
          setDropdownLabel(pointSchemeDropdownButton, getSchemeName(id));
          updateMenus();
          renderPointSchemeTable();
        },
        { once: true }
      );
      pointSchemeMenu.appendChild(item);
    });

  resourcePackageMenu.innerHTML = "";
  Object.keys(regulationsState.partResources || {})
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((id) => {
      const item = document.createElement("a");
      item.className = "redesigned-dropdown-item";
      item.dataset.value = String(id);
      item.style.cursor = "pointer";
      item.textContent = getPackageName(id);
      if (id === selectedPackage) {
        const check = document.createElement("i");
        check.className = "bi bi-check";
        item.appendChild(document.createTextNode(" "));
        item.appendChild(check);
      }
      item.addEventListener(
        "click",
        () => {
          regulationsState.enumChanges.PartDevResourceLimit.CurrentValue = id;
          setDropdownLabel(resourcePackageDropdownButton, getPackageName(id));
          updateMenus();
          renderResourcePackageTable();
        },
        { once: true }
      );
      resourcePackageMenu.appendChild(item);
    });
}

// Bars are relative to the highest value of their column in the current table
function refreshBars(body) {
  const cells = [...body.querySelectorAll(".regulations-bar-cell")];
  const maxByCol = {};
  for (const cell of cells) {
    const value = Number(cell.querySelector("input").value) || 0;
    maxByCol[cell.dataset.col] = Math.max(maxByCol[cell.dataset.col] || 0, value);
  }
  for (const cell of cells) {
    const value = Number(cell.querySelector("input").value) || 0;
    const max = maxByCol[cell.dataset.col];
    cell.querySelector(".one-stat-progress").style.width = max ? `${(value / max) * 100}%` : "0%";
  }
}

function createBarCell(body, col, value, onChange) {
  const cell = document.createElement("div");
  cell.className = "regulations-bar-cell";
  cell.dataset.col = col;

  const bar = document.createElement("div");
  bar.className = "one-stat-bar";
  const progress = document.createElement("div");
  progress.className = "one-stat-progress";
  bar.appendChild(progress);

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.step = "1";
  input.value = String(value ?? 0);
  input.className = "custom-input-number";
  input.addEventListener("input", () => {
    onChange(parseIntSafe(input.value, 0));
    refreshBars(body);
  });

  cell.appendChild(bar);
  cell.appendChild(input);
  return cell;
}

function createPosCell(pos) {
  const cell = document.createElement("div");
  cell.className = "regulations-pos bold-font";
  cell.textContent = String(pos);
  return cell;
}

function renderPointSchemeTable() {
  if (!regulationsState || !pointSchemeBody) return;
  const schemeId = getSelectedPointScheme();
  const rows = regulationsState.pointSchemes?.[schemeId] || [];

  pointSchemeBody.innerHTML = "";
  for (const row of rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "regulations-table-row";
    wrapper.appendChild(createPosCell(row.RacePos));
    wrapper.appendChild(createBarCell(pointSchemeBody, "points", row.Points, (value) => {
      row.Points = value;
    }));
    pointSchemeBody.appendChild(wrapper);
  }
  refreshBars(pointSchemeBody);
}

function renderResourcePackageTable() {
  if (!regulationsState || !resourcePackageBody) return;
  const packageId = getSelectedResourcePackage();
  const rows = regulationsState.partResources?.[packageId] || [];

  resourcePackageBody.innerHTML = "";
  for (const row of rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "regulations-table-row";
    wrapper.appendChild(createPosCell(row.StandingPos));
    wrapper.appendChild(createBarCell(resourcePackageBody, "wind", row.WindTunnelBlocks, (value) => {
      row.WindTunnelBlocks = value;
    }));
    wrapper.appendChild(createBarCell(resourcePackageBody, "cfd", row.CfdBlocks, (value) => {
      row.CfdBlocks = value;
    }));
    resourcePackageBody.appendChild(wrapper);
  }
  refreshBars(resourcePackageBody);
}

function initHoldControlsOnce() {
  if (!root || root.dataset.holdInit === "1") return;
  root.dataset.holdInit = "1";

  const controls = [
    { input: spendingCapInput, id: "SpendingCap", step: 1_000_000, format: (val) => formatMoney(val) },
    { input: engineLimitInput, id: "EngineLimit", step: 1 },
    { input: ersLimitInput, id: "ErsLimit", step: 1 },
    { input: gearboxLimitInput, id: "GearboxLimit", step: 1 },
  ];

  if (spendingCapInput && spendingCapInput.dataset.moneyInit !== "1") {
    spendingCapInput.dataset.moneyInit = "1";
    spendingCapInput.addEventListener("blur", () => {
      spendingCapInput.value = formatMoney(parseIntSafe(spendingCapInput.value, 0));
    });
  }

  for (const c of controls) {
    const container = c.input?.closest(".stat-number");
    if (!container) continue;

    const minus = container.querySelector(".bi-dash.new-augment-button");
    const plus = container.querySelector(".bi-plus.new-augment-button");

    const change = getEnumChange(c.id);
    const min = change?.MinValue ?? 0;
    const max = change?.MaxValue ?? Number.POSITIVE_INFINITY;

    const holdOpts = { min, max };
    if (c.format) holdOpts.format = c.format;

    if (plus) {
      attachHold(plus, c.input, c.step, holdOpts);
    }
    if (minus) {
      attachHold(minus, c.input, -c.step, holdOpts);
    }
  }
}

function createNewPointScheme() {
  if (!regulationsState) return;
  const ids = Object.keys(regulationsState.pointSchemes || {}).map(Number);
  const nextId = (ids.length ? Math.max(...ids) : 0) + 1;
  const baseLen = (regulationsState.pointSchemes?.[1] || []).length || 10;

  regulationsState.pointSchemes[nextId] = Array.from({ length: baseLen }, (_, i) => ({
    RacePos: i + 1,
    Points: baseLen - i,
  }));
  regulationsState.enumChanges.PointScheme.CurrentValue = nextId;
  setDropdownLabel(pointSchemeDropdownButton, getSchemeName(nextId));
  updateMenus();
  renderPointSchemeTable();
}

function createNewResourcePackage() {
  if (!regulationsState) return;
  const ids = Object.keys(regulationsState.partResources || {}).map(Number);
  const nextId = (ids.length ? Math.max(...ids) : 0) + 1;
  const baseLen = (regulationsState.partResources?.[1] || []).length || 10;

  regulationsState.partResources[nextId] = Array.from({ length: baseLen }, (_, i) => ({
    StandingPos: i + 1,
    WindTunnelBlocks: 72,
    CfdBlocks: 72,
  }));
  regulationsState.enumChanges.PartDevResourceLimit.CurrentValue = nextId;
  setDropdownLabel(resourcePackageDropdownButton, getPackageName(nextId));
  updateMenus();
  renderResourcePackageTable();
}

export function load_regulations(data) {
  if (!root) return;
  regulationsState = JSON.parse(JSON.stringify(data || {}));

  const required = [
    "SpendingCap",
    "EngineLimit",
    "ErsLimit",
    "GearboxLimit",
    "DoubleLastRacePoints",
    "FastestLapBonusPoint",
    "PolePositionBonusPoint",
    "PointScheme",
    "PartDevResourceLimit",
  ];

  for (const k of required) {
    if (!regulationsState.enumChanges?.[k]) {
      regulationsState.enumChanges = regulationsState.enumChanges || {};
      regulationsState.enumChanges[k] = { CurrentValue: 0, MinValue: 0, MaxValue: 0 };
    }
  }

  spendingCapInput.value = formatMoney(regulationsState.enumChanges.SpendingCap.CurrentValue ?? 0);
  engineLimitInput.value = String(regulationsState.enumChanges.EngineLimit.CurrentValue ?? 0);
  ersLimitInput.value = String(regulationsState.enumChanges.ErsLimit.CurrentValue ?? 0);
  gearboxLimitInput.value = String(regulationsState.enumChanges.GearboxLimit.CurrentValue ?? 0);

  doubleLastRacePointsToggle.checked = regulationsState.enumChanges.DoubleLastRacePoints.CurrentValue === 1;
  fastestLapBonusPointToggle.checked = regulationsState.enumChanges.FastestLapBonusPoint.CurrentValue === 1;
  polePositionBonusPointToggle.checked = regulationsState.enumChanges.PolePositionBonusPoint.CurrentValue === 1;

  setDropdownLabel(pointSchemeDropdownButton, getSchemeName(getSelectedPointScheme()));
  setDropdownLabel(resourcePackageDropdownButton, getPackageName(getSelectedResourcePackage()));

  initHoldControlsOnce();
  updateMenus();
  renderPointSchemeTable();
  renderResourcePackageTable();
}

export function gather_regulations_data() {
  if (!regulationsState) return null;

  regulationsState.enumChanges.SpendingCap.CurrentValue = parseIntSafe(spendingCapInput.value, 0);
  regulationsState.enumChanges.EngineLimit.CurrentValue = parseIntSafe(engineLimitInput.value, 0);
  regulationsState.enumChanges.ErsLimit.CurrentValue = parseIntSafe(ersLimitInput.value, 0);
  regulationsState.enumChanges.GearboxLimit.CurrentValue = parseIntSafe(gearboxLimitInput.value, 0);

  regulationsState.enumChanges.DoubleLastRacePoints.CurrentValue = doubleLastRacePointsToggle.checked ? 1 : 0;
  regulationsState.enumChanges.FastestLapBonusPoint.CurrentValue = fastestLapBonusPointToggle.checked ? 1 : 0;
  regulationsState.enumChanges.PolePositionBonusPoint.CurrentValue = polePositionBonusPointToggle.checked ? 1 : 0;

  return {
    enumChanges: regulationsState.enumChanges,
    pointSchemes: regulationsState.pointSchemes,
    partResources: regulationsState.partResources,
  };
}

if (createPointSchemeButton) {
  createPointSchemeButton.addEventListener("click", () => {
    createNewPointScheme();
  });
}

if (createResourcePackageButton) {
  createResourcePackageButton.addEventListener("click", () => {
    createNewResourcePackage();
  });
}
