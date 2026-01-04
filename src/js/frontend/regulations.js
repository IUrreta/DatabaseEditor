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
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
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

function renderPointSchemeTable() {
  if (!regulationsState || !pointSchemeBody) return;
  const schemeId = getSelectedPointScheme();
  const rows = regulationsState.pointSchemes?.[schemeId] || [];

  pointSchemeBody.innerHTML = "";
  for (const row of rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "regulations-row";

    const pos = document.createElement("div");
    pos.className = "regulations-cell regulations-keycell";
    pos.textContent = String(row.RacePos);

    const pointsCell = document.createElement("div");
    pointsCell.className = "regulations-cell";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = String(row.Points ?? 0);
    input.className = "custom-input-number";
    input.addEventListener("input", () => {
      row.Points = parseIntSafe(input.value, 0);
      regulationsState.pointSchemes[schemeId] = rows;
    });
    pointsCell.appendChild(input);

    wrapper.appendChild(pos);
    wrapper.appendChild(pointsCell);
    pointSchemeBody.appendChild(wrapper);
  }
}

function renderResourcePackageTable() {
  if (!regulationsState || !resourcePackageBody) return;
  const packageId = getSelectedResourcePackage();
  const rows = regulationsState.partResources?.[packageId] || [];

  resourcePackageBody.innerHTML = "";
  for (const row of rows) {
    const wrapper = document.createElement("div");
    wrapper.className = "regulations-row";

    const pos = document.createElement("div");
    pos.className = "regulations-cell regulations-keycell";
    pos.textContent = String(row.StandingPos);

    const windCell = document.createElement("div");
    windCell.className = "regulations-cell";
    const windInput = document.createElement("input");
    windInput.type = "number";
    windInput.min = "0";
    windInput.step = "1";
    windInput.value = String(row.WindTunnelBlocks ?? 0);
    windInput.className = "custom-input-number";
    windInput.addEventListener("input", () => {
      row.WindTunnelBlocks = parseIntSafe(windInput.value, 0);
      regulationsState.partResources[packageId] = rows;
    });
    windCell.appendChild(windInput);

    const cfdCell = document.createElement("div");
    cfdCell.className = "regulations-cell";
    const cfdInput = document.createElement("input");
    cfdInput.type = "number";
    cfdInput.min = "0";
    cfdInput.step = "1";
    cfdInput.value = String(row.CfdBlocks ?? 0);
    cfdInput.className = "custom-input-number";
    cfdInput.addEventListener("input", () => {
      row.CfdBlocks = parseIntSafe(cfdInput.value, 0);
      regulationsState.partResources[packageId] = rows;
    });
    cfdCell.appendChild(cfdInput);

    wrapper.appendChild(pos);
    wrapper.appendChild(windCell);
    wrapper.appendChild(cfdCell);
    resourcePackageBody.appendChild(wrapper);
  }
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
