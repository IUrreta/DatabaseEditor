import { races_names, part_codes_abreviations, codes_dict, combined_dict, races_map, abreviations_dict, pars_abreviations, engine_stats_dict,
    theme_colors
  } from "./config";
import { colors_dict, get_colors_dict } from "./head2head";
import { manageSaveButton, game_version, attachHold, first_show_animation, selectedTheme, confirmModal } from "./renderer";
import { Command } from "../backend/command.js";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { getEngineLogoSrc } from "./seasonViewer.js";

const teamsPill = document.getElementById("teamsPill");
const enginesPill = document.getElementById("enginesPill");

const teamsDiv = document.getElementById("teamsDiv");
const enginesDiv = document.getElementById("enginesDiv");
const engineConditionEditor = document.getElementById("teamEngineConditionEditor");
const engineManufacturerList = document.getElementById("engineManufacturerList");

const divsTeamsArray = [teamsDiv, enginesDiv]


export let teamSelected;
let engineSelected;
let teamEngineSelected;
let performanceGraph;
export let teamsEngine = "teams"
export let viewingGraph = true;
export let performanceDetailsMode = "performance";
let actualMaxDesign = 0;
let customEnginesCopy;
let currentData;
let performanceView = "graph";
let enginesView = "manufacturerList";
let currentPartsStats = null;
let currentTeamExpertise = null;
let currentTeamNextSeasonCar = null;
let performanceDraftStats = null;
let expertiseDraftStats = null;
let nextSeasonCarDraftStats = null;
let performanceAnnotationsToggle = true;
let currentPerformanceCriterion = "overall";
let performanceCurrentSeason = null;

const performanceDetailsModes = ["performance", "expertise", "nextSeasonCar"];
const engineConditionSlots = [
    { car: "1", key: "engine" },
    { car: "1", key: "ers" },
    { car: "1", key: "gearbox" },
    { car: "2", key: "engine" },
    { car: "2", key: "ers" },
    { car: "2", key: "gearbox" }
];

Chart.register(ChartDataLabels);
Chart.register(annotationPlugin);

const overviewAttributes = [
    { key: "top_speed", label: "Top speed" },
    { key: "acceleration", label: "Acceleration" },
    { key: "low_speed", label: "Low speed" },
    { key: "medium_speed", label: "Medium speed" },
    { key: "high_speed", label: "High speed" },
    { key: "drs", label: "DRS Effectiveness" },
    { key: "dirty_air", label: "Dirty air tolerance" },
    { key: "brake_cooling", label: "Brake cooling" },
    { key: "engine_power", label: "Engine power" },
    { key: "engine_cooling", label: "Engine cooling" }
    
];

function clampPercent(value) {
    let numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return 0;
    }
    return Math.max(0, numericValue);
}

function setBarWidth(bar, value) {
    if (!bar) return;
    bar.style.width = clampPercent(value) + "%";
}

function getDatasetKey(mode, criterion) {
    let parts = String(criterion).split("_");
    let key = mode;
    parts.forEach(function (part) {
        key += part.charAt(0).toUpperCase() + part.slice(1);
    });
    return key;
}

function setBarDatasetValue(bar, mode, criterion, value) {
    if (!bar) return;
    bar.dataset[getDatasetKey(mode, criterion)] = Number(value).toFixed(3);
}

function getBarDatasetValue(bar, criterion) {
    if (!bar) return 0;
    const rawValue = bar.dataset[getDatasetKey(performanceDetailsMode, criterion)];
    if (rawValue === undefined) {
        return 0;
    }
    return Number(rawValue);
}

function updateBarModeClass(bar) {
    if (!bar) return;
    bar.classList.toggle("expertise-bar", performanceDetailsMode === "expertise");
    bar.classList.toggle("next-season-car-bar", performanceDetailsMode === "nextSeasonCar");
}

function normalizeData(data) {
    let values = Object.values(data);

    let min = Math.min(...values);
    let max = Math.max(...values);

    let adjustedMin = min - 5;
    let adjustedMax = max + 5;

    let normalizedData = {};
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            normalizedData[key] = ((data[key] - adjustedMin) / (adjustedMax - adjustedMin)) * 100;
        }
    }

    return normalizedData;
}

function readPartsStatsFromDom() {
    let data = {};
    document.querySelectorAll(".part-performance").forEach(function (elem) {
        const partKey = elem.dataset.part;
        data[partKey] = {};
        elem.querySelectorAll(".part-performance-stat").forEach(function (stat) {
            const statNum = stat.dataset.attribute;
            if (statNum === "-1" || statNum === "15") return;
            const input = stat.querySelector(".custom-input-number");
            if (!input) return;
            const value = Number(String(input.value).split(" ")[0]);
            data[partKey][statNum] = Number.isFinite(value) ? value : 0;
        });
    });
    return data;
}

function applyPartsStatsToDom(data) {
    if (!data) return;
    for (let key in data) {
        const part = document.querySelector(`.part-performance[data-part='${key}']`);
        if (!part) continue;
        for (let stat in data[key]) {
            if (stat === "15") continue;
            const statInput = part.querySelector(`.part-performance-stat[data-attribute='${stat}'] .custom-input-number`);
            if (!statInput) continue;
            statInput.value = Number(data[key][stat]).toFixed(2);
        }
    }
}

function getNextSeasonCarLabel() {
    if (performanceCurrentSeason) {
        return (performanceCurrentSeason + 1).toString() + " Car";
    }
    return "Next Season Car";
}

function getPerformanceDetailsModeLabel(mode = performanceDetailsMode) {
    if (mode === "expertise") {
        return "Expertise";
    }
    if (mode === "nextSeasonCar") {
        return getNextSeasonCarLabel();
    }
    return "Performance";
}

export function setPerformanceCurrentSeason(year) {
    performanceCurrentSeason = Number(year) || null;
    updatePerformanceExpertiseButton();
    updateDetailsModeUi();
}

function updateEngineViewModeButton() {
    const button = engineViewModeButton || document.getElementById("engineViewModeButton");
    if (!button) return;

    const icon = button.querySelector("i");
    const text = button.querySelector("span");
    const isEnginesSection = teamsEngine === "engines";
    const isConditionView = enginesView === "condition";

    button.classList.toggle("d-none", !isEnginesSection);
    button.dataset.value = isConditionView ? "durability" : "performance";

    if (icon) icon.className = isConditionView ? "bi bi-activity" : "bi bi-speedometer2";
    if (text) text.textContent = isConditionView ? "Durability" : "Performance";
}

function updateDetailsModeUi() {
    const teamsShow = document.querySelector(".performance-show.teams-show");
    if (!teamsShow) return;

    const isStatsMode = performanceDetailsMode !== "performance";
    teamsShow.classList.toggle("expertise-mode", performanceDetailsMode === "expertise");
    teamsShow.classList.toggle("research-mode", performanceDetailsMode === "nextSeasonCar");

    document.querySelectorAll(".part-performance").forEach(function (part) {
        const arrows = part.querySelector(".part-performance-title .arrows");
        if (arrows) arrows.classList.toggle("d-none", isStatsMode);

        const chevron = part.querySelector(".part-performance-title .redesigned-chevron");
        if (chevron) chevron.classList.toggle("d-none", isStatsMode);

        if (isStatsMode) {
            const statsContainer = part.querySelector(".part-performance-stats");
            if (statsContainer) statsContainer.classList.remove("hidden");

            const partButtons = part.querySelector(".part-performance-title .part-buttons");
            if (partButtons) partButtons.classList.remove("d-none");

            if (chevron) chevron.classList.remove("clicked");
        }

        const list = part.querySelector(".parts-list");
        if (list) list.classList.toggle("d-none", isStatsMode);

        const subtitle = part.querySelector(".part-subtitle");
        if (!subtitle) return;
        if (isStatsMode) {
            if (subtitle.dataset.performanceText === undefined) {
                subtitle.dataset.performanceText = subtitle.innerText;
            }
            subtitle.innerText = getPerformanceDetailsModeLabel();
        }
        else if (subtitle.dataset.performanceText) {
            subtitle.innerText = subtitle.dataset.performanceText;
        }
    });
}

function setPerformanceDetailsMode(mode) {
    if (!performanceDetailsModes.includes(mode)) return;
    if (mode === performanceDetailsMode) return;

    if (performanceDetailsMode === "performance") {
        performanceDraftStats = readPartsStatsFromDom();
    }
    else if (performanceDetailsMode === "expertise") {
        expertiseDraftStats = readPartsStatsFromDom();
    }
    else {
        nextSeasonCarDraftStats = readPartsStatsFromDom();
    }

    performanceDetailsMode = mode;
    updatePerformanceExpertiseButton();
    updateDetailsModeUi();

    if (mode === "performance") {
        applyPartsStatsToDom(performanceDraftStats || currentPartsStats);
    }
    else if (mode === "expertise") {
        applyPartsStatsToDom(expertiseDraftStats || currentTeamExpertise);
    }
    else {
        applyPartsStatsToDom(nextSeasonCarDraftStats || currentTeamNextSeasonCar);
    }

    order_by(currentPerformanceCriterion);
    load_overview();
}

function updatePerformanceExpertiseButton() {
    const button = document.getElementById("performanceExpertiseButton");
    if (!button) return;

    const icon = button.querySelector("i");
    const text = button.querySelector("span");

    button.dataset.value = performanceDetailsMode;
    if (performanceDetailsMode === "expertise") {
        if (icon) icon.className = "bi bi-stars";
        if (text) text.textContent = "Upgrades";
    }
    else if (performanceDetailsMode === "nextSeasonCar") {
        if (icon) icon.className = "bi bi-flask";
        if (text) text.textContent = "Research"
    }
    else {
        if (icon) icon.className = "bi bi-speedometer2";
        if (text) text.textContent = "Performance";
    }
}



export function load_performance(teams) {
    if (!teams) {
        return;
    }
    // let teams = normalizeData(teams);
    for (let key in teams) {
        if (teams.hasOwnProperty(key)) {
            let teamPerformance = document.querySelector(`#teamsDiv .team-performance[data-teamid='${key}']`);
            if (teamPerformance) {
                let performanceBarProgress = teamPerformance.querySelector('.performance-bar-progress');
                let team_value = teamPerformance.querySelector('.team-title-value');
                if (performanceBarProgress) {
                    setBarDatasetValue(performanceBarProgress, "performance", "overall", teams[key]);
                    setBarWidth(performanceBarProgress, teams[key]);
                    team_value.innerText = teams[key].toFixed(2) + ' %';
                    updateBarModeClass(performanceBarProgress);
                }
            }
        }
    }
}

export function load_cars(data) {
    if (!data) {
        return;
    }
    for (let key in data) {
        let cars = document.querySelectorAll(`#carsDiv .car[data-teamid='${key}']`);
        cars.forEach(function (car, index) {
            let carNumber = parseInt(car.dataset.carnumber);
            index = index + 1;
            let bar = car.querySelector('.performance-bar-progress');
            setBarDatasetValue(bar, "performance", "overall", data[key][carNumber][0]);
            setBarWidth(bar, data[key][carNumber][0]);
            updateBarModeClass(bar);
            let name = car.querySelector('.team-title-name');
            name.innerText = car.dataset.teamshow + " " + carNumber.toString() + " -  #" + data[key][carNumber][1];
            let missing_parts = data[key][carNumber][2];
            let missing_copntainer = car.querySelector(".car-missing-parts")
            missing_copntainer.innerHTML = "<span class='value'></span>"
            if (missing_parts.length > 0) {
                let list = document.createElement("span")
                let string = ""
                missing_parts.forEach(function (part) {
                    let partName = part_codes_abreviations[part]
                    string += partName + " "
                })
                list.innerText = string
                missing_copntainer.appendChild(list)
                let icon = document.createElement("i")
                icon.classList.add("bi", "bi-exclamation-triangle-fill")
                missing_copntainer.appendChild(icon)
            }
            else {
                let icon = document.createElement("i")
                icon.classList.add("bi", "bi-check-all")
                missing_copntainer.appendChild(icon)
            }
            let value = car.querySelector(".car-missing-parts .value")
            value.innerText = data[key][carNumber][0].toFixed(2) + " %"
            missing_copntainer.appendChild(value)
        })
    }
}

export function load_attributes(teams, mode = "performance") {
    for (let key in teams) {
        for (let attribute in teams[key]) {
            let team = document.querySelector(`#teamsDiv .team-performance[data-teamid='${key}']`);
            let bar = team.querySelector(`.performance-bar-progress`);
            let attributeValue = teams[key][attribute];
            setBarDatasetValue(bar, mode, attribute, attributeValue);
        }
    }
    load_overview();
}

export function load_car_attributes(teams, mode = "performance") {
    for (let key in teams) {
        for (let car in teams[key]) {
            let carDiv = document.querySelector(`#carsDiv .car[data-teamid='${key}'][data-carnumber='${car}']`);
            for (let attribute in teams[key][car]) {
                let bar = carDiv.querySelector(`.performance-bar-progress`);
                let attributeValue = teams[key][car][attribute];
                setBarDatasetValue(bar, mode, attribute, attributeValue);
            }
        }
    }
}

export function order_by(criterion) {
    currentPerformanceCriterion = criterion;
    let teams = document.querySelectorAll(".team-performance");
    let teamsArray = Array.from(teams);
    teamsArray.sort(function (a, b) {
        return getBarDatasetValue(b.querySelector(".performance-bar-progress"), criterion) - getBarDatasetValue(a.querySelector(".performance-bar-progress"), criterion);
    })
    teamsArray.forEach(function (team, index) {
        document.getElementById("teamsDiv").appendChild(team);
        let bar = team.querySelector(".performance-bar-progress");
        let barValue = getBarDatasetValue(bar, criterion);
        updateBarModeClass(bar);
        setBarWidth(bar, barValue);
        team.querySelector(".team-title-value").innerText = barValue.toFixed(2) + " %";
        let number = team.querySelector(".team-number")
        number.innerText = index + 1
    })

    let cars = document.querySelectorAll(".car-performance");
    let carsArray = Array.from(cars);
    carsArray.sort(function (a, b) {
        return getBarDatasetValue(b.querySelector(".performance-bar-progress"), criterion) - getBarDatasetValue(a.querySelector(".performance-bar-progress"), criterion);
    })
    carsArray.forEach(function (car, index) {
        document.getElementById("carsDiv").appendChild(car);
        let bar = car.querySelector(".performance-bar-progress");
        let barValue = getBarDatasetValue(bar, criterion);
        updateBarModeClass(bar);
        setBarWidth(bar, barValue);
        let number = car.querySelector(".performance-number")
        let value = car.querySelector(".car-missing-parts .value")
        value.innerText = barValue.toFixed(2) + " %";
        number.innerText = index + 1
    })



}

const teamsCarsButton = document.getElementById("teamsCarsButton");
const teamsCarsIcon = teamsCarsButton.querySelector("i");
const teamsCarsText = teamsCarsButton.querySelector("span");

function updateTeamsCarsButton() {
    const mode = teamsCarsButton.dataset.value;
    teamsCarsIcon.className = mode === "cars" ? "bi bi-person-fill" : "bi bi-people-fill";
    teamsCarsText.textContent = mode === "cars" ? "Cars" : "Teams";
}

teamsCarsButton.addEventListener("click", function () {
    if (teamsCarsButton.dataset.value === "teams") {
        teamsCarsButton.dataset.value = "cars";
        document.getElementById("teamsDiv").classList.add("d-none");
        document.getElementById("carsDiv").classList.remove("d-none");
    }
    else {
        teamsCarsButton.dataset.value = "teams";
        document.getElementById("carsDiv").classList.add("d-none");
        document.getElementById("teamsDiv").classList.remove("d-none");
    }
    updateTeamsCarsButton();
    order_by(currentPerformanceCriterion);
    load_overview();
})

updateTeamsCarsButton();


document.querySelector("#attributeMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#attributeButton span").innerText = elem.innerText;
        order_by(elem.dataset.attribute);
    })
})


/**
 * Pills that manage engines and teams screens and lists
 */
teamsPill.addEventListener("click", function () {
    const selectedTeamOrCar = getSelectedTeamOrCar();
    if (!selectedTeamOrCar) {
        removeSelected()
        setPerformanceSubview("teams", performanceView)
        return;
    }

    teamSelected = selectedTeamOrCar.dataset.teamid;
    setPerformanceSubview("teams", "details")
    manageSaveButton(true, "performance")
    const command = new Command("performanceRequest", { teamID: teamSelected });
    command.execute();
})

enginesPill.addEventListener("click", function () {
    const selectedTeamOrCar = getSelectedTeamOrCar();
    if (!selectedTeamOrCar) {
        removeSelected()
        setPerformanceSubview("engines", "manufacturerList")
        manageSaveButton(true, "performance")
        first_show_animation()
        return;
    }

    teamSelected = selectedTeamOrCar.dataset.teamid;
    setPerformanceSubview("engines", "condition")
    manageSaveButton(true, "performance")
    const command = new Command("engineConditionRequest", { teamID: teamSelected });
    command.execute();
})

export function gather_engines_data() {
    let engines = document.querySelectorAll("#enginesPerformance .engine-performance")
    let enginesData = {}
    engines.forEach(function (engine) {
        let engineID = engine.dataset.engineid
        let engineStats = {}
        engine.querySelectorAll(".engine-performance-stat").forEach(function (stat) {
            let attribute = stat.dataset.attribute
            let value = stat.querySelector(".custom-input-number").value.split(" ")[0]
            engineStats[attribute] = value
        })
        enginesData[engineID] = engineStats
    })
    return enginesData

}


export function update_max_design(data) {
    actualMaxDesign = parseInt(data) + 1;
}

/**
 * Manages the engine stats for all manufacturers
 * @param {Object} engineData engine stats for all manufacturers
 */
export function manage_engineStats(engineData) {
    let officialEngines = engineData.filter(function (elem) {
        return elem[0] <= 10
    })
    let customEngines = engineData.filter(function (elem) {
        return elem[0] > 10
    })
    officialEngines.forEach(function (elem) {
        let engineId = elem[0]
        let engineStats = elem[1];
        let engine = document.querySelector(`[data-engineId="${engineId}"]`);
        for (let key in engineStats) {
            let value = engineStats[key];
            let attribute = engine.querySelector(`.engine-performance-stat[data-attribute="${key}"]`);
            let input = attribute.querySelector(".custom-input-number");
            let bar = attribute.querySelector(".engine-performance-progress");
            input.value = value.toFixed(1);
            setBarWidth(bar, value);
        }
    })
    load_custom_engines(customEngines)
}


/**
 * removes the team or engine selected anc changes the icon if necesssary
 */
function removeSelected() {
    let elemsSelected = document.querySelectorAll('.selected');
    elemsSelected.forEach(item => {
        item.classList.remove('selected')
    });
}

function getSelectedTeamOrCar() {
    return document.querySelector(".team.selected, .car.selected");
}

function getFirstVisibleTeamOrCar() {
    const selector = teamsCarsButton.dataset.value === "cars" ? "#carsDiv .car" : "#teamsDiv .team";
    return Array.from(document.querySelectorAll(selector)).find(function (elem) {
        return !elem.classList.contains("d-none");
    }) || null;
}

function selectDefaultTeamOrCarIfNeeded() {
    const selected = getSelectedTeamOrCar();
    if (selected) {
        teamSelected = selected.dataset.teamid;
        return { element: selected, autoSelected: false };
    }

    const firstVisible = getFirstVisibleTeamOrCar();
    if (!firstVisible) {
        return { element: null, autoSelected: false };
    }

    removeSelected();
    firstVisible.classList.add("selected");
    teamSelected = firstVisible.dataset.teamid;
    return { element: firstVisible, autoSelected: true };
}

/**
 * eventListeners for all teams and engines
 */
document.querySelectorAll(".team").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        if (teamsEngine === "engines") {
            setPerformanceSubview("engines", "condition")
            manageSaveButton(true, "performance")
            const command = new Command("engineConditionRequest", { teamID: teamSelected });
            command.execute();
            return;
        }
        setPerformanceSubview("teams", "details")
        manageSaveButton(true, "performance")
        performanceDraftStats = null;
        expertiseDraftStats = null;
        nextSeasonCarDraftStats = null;
        currentPartsStats = null;
        currentTeamExpertise = null;
        currentTeamNextSeasonCar = null;
        const command = new Command("performanceRequest",  { teamID: teamSelected});
        command.execute();
    })
})

document.querySelectorAll(".car").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        elem.classList.toggle('selected');
        teamSelected = elem.dataset.teamid;
        if (teamsEngine === "engines") {
            setPerformanceSubview("engines", "condition")
            manageSaveButton(true, "performance")
            const command = new Command("engineConditionRequest", { teamID: teamSelected });
            command.execute();
            return;
        }
        setPerformanceSubview("teams", "details")
        manageSaveButton(true, "performance")
        performanceDraftStats = null;
        expertiseDraftStats = null;
        nextSeasonCarDraftStats = null;
        currentPartsStats = null;
        currentTeamExpertise = null;
        currentTeamNextSeasonCar = null;
        const command = new Command("performanceRequest",  { teamID: teamSelected});
        command.execute();
    })
})

document.querySelectorAll(".engine").forEach(function (elem) {
    elem.addEventListener("click", function () {
        removeSelected()
        elem.classList.toggle('selected');
        engineSelected = elem.dataset.engineid;
        teamEngineSelected = elem.dataset.teamengine
        setPerformanceSubview("engines", "manufacturerList")
        resetBarsEngines(elem)
    })
})

export function load_parts_stats(data) {
    currentPartsStats = data;
    performanceDraftStats = null;

    if (performanceDetailsMode !== "performance") {
        return;
    }

    applyPartsStatsToDom(data);
}

export function load_team_expertise(data) {
    currentTeamExpertise = data;
    expertiseDraftStats = null;

    updateDetailsModeUi();

    if (performanceDetailsMode !== "expertise") {
        return;
    }

    applyPartsStatsToDom(data);
}

export function load_team_next_season_car(data) {
    currentTeamNextSeasonCar = data;
    nextSeasonCarDraftStats = null;

    updateDetailsModeUi();

    if (performanceDetailsMode !== "nextSeasonCar") {
        return;
    }

    applyPartsStatsToDom(data);
}

export function load_engine_conditions(data) {
    if (!engineConditionEditor) {
        return;
    }

    engineConditionSlots.forEach(function (slot) {
        const part = engineConditionEditor.querySelector(`.engine-condition-part[data-car='${slot.car}'][data-slot='${slot.key}']`);
        if (!part) {
            return;
        }

        const stats = part.querySelector(".engine-performance-stats");
        if (!stats) {
            return;
        }

        stats.innerHTML = "";

        const items = data?.cars?.[slot.car]?.[slot.key]?.items || [];
        if (!items.length) {
            const empty = document.createElement("div");
            empty.classList.add("engine-condition-empty");
            empty.innerText = "No items";
            stats.appendChild(empty);
            return;
        }

        items.forEach(function (item) {
            const stat = document.createElement("div");
            stat.classList.add("engine-performance-stat");
            stat.dataset.itemid = item.itemID;

            const itemTitle = document.createElement("div");
            itemTitle.classList.add("engine-condition-item-title");

            const title = document.createElement("div");
            title.classList.add("part-performance-stat-title");
            title.innerText = getEngineConditionItemLabel(item.name) || `#${item.itemID}`;
            itemTitle.appendChild(title);

            if (item.isFitted) {
                const fitted = document.createElement("span");
                fitted.classList.add("engine-condition-fitted");
                fitted.innerText = "Fitted";
                itemTitle.appendChild(fitted);
            }

            const statNumber = document.createElement("div");
            statNumber.classList.add("stat-number");

            const less = document.createElement("i");
            less.classList.add("bi", "bi-dash", "new-augment-button", "transparent");

            const input = document.createElement("input");
            input.type = "text";
            input.classList.add("custom-input-number");
            input.min = "0";
            input.max = "100";
            input.value = (Number(item.condition || 0) * 100).toFixed(1);

            const plus = document.createElement("i");
            plus.classList.add("bi", "bi-plus", "new-augment-button", "transparent");

            statNumber.appendChild(less);
            statNumber.appendChild(input);
            statNumber.appendChild(plus);

            const bar = document.createElement("div");
            bar.classList.add("engine-performance-bar");

            const progress = document.createElement("div");
            progress.classList.add("engine-performance-progress");
            bar.appendChild(progress);
            setBarWidth(progress, Number(input.value));

            input.addEventListener("input", function () {
                let value = Number(input.value);
                if (Number.isNaN(value)) {
                    value = 0;
                }
                value = Math.max(0, Math.min(100, value));
                input.value = value.toFixed(1);
                setBarWidth(progress, value);
            });

            const holdOptions = buildHoldOptions(input, {
                min: 0,
                max: 100,
                format: function (value) {
                    return value.toFixed(1);
                },
                onChange: function (value) {
                    setBarWidth(progress, value);
                }
            });

            attachHold(less, input, -0.5, holdOptions);
            attachHold(plus, input, 0.5, holdOptions);

            stat.appendChild(itemTitle);
            stat.appendChild(statNumber);
            stat.appendChild(bar);
            stats.appendChild(stat);
        });
    });
}

export function gather_engine_condition_data() {
    const items = [];

    document.querySelectorAll(".engine-condition-part .engine-performance-stat").forEach(function (stat) {
        const input = stat.querySelector(".custom-input-number");
        items.push({
            itemID: Number(stat.dataset.itemid),
            condition: Number(input.value) / 100
        });
    });

    return items;
}

export function gather_team_expertise_data() {
    let expertise = {};
    document.querySelectorAll(".part-performance").forEach(function (elem) {
        const partType = elem.dataset.partid;
        if (!partType) return;
        expertise[partType] = {};
        elem.querySelectorAll(".part-performance-stat").forEach(function (stat) {
            const statNum = stat.dataset.attribute;
            if (statNum === "-1" || statNum === "15") return;
            const input = stat.querySelector(".custom-input-number");
            if (!input) return;
            const value = input.value.split(" ")[0];
            expertise[partType][statNum] = value;
        });
    });
    return expertise;
}

export function load_parts_list(data) {
    for (let key in data) {
        let list = document.querySelector(`.part-performance[data-part='${key}'] .parts-list`)
        let partLoadouts = document.querySelector(`.part-performance[data-part='${key}']`)
        list.innerHTML = ""
        let index = 1;
        for (let part in data[key]) {
            let partElem = document.createElement("div")
            partElem.classList.add("one-part")
            if (index === 1) {
                partElem.classList.add("one-part-default")
            }
            let partTitle = document.createElement("div")
            partTitle.classList.add("one-part-title")
            let partName = document.createElement("div")
            partName.dataset.designId = data[key][part][0]
            partName.classList.add("one-part-name")
            let partNameText = abreviations_dict[teamSelected] + "-" + pars_abreviations[key] + "-" + index
            partName.innerText = partNameText
            let subtitle = document.querySelector(`.part-performance[data-part='${key}'] .part-subtitle`)
            subtitle.innerText = partNameText
            subtitle.dataset.editing = data[key][part][0]
            delete subtitle.dataset.performanceText;
            partTitle.appendChild(partName)
            add_partName_listener(partName, subtitle)
            let loadoutContainer = document.createElement("div")
            loadoutContainer.classList.add("fitted-icons")
            let n_parts = document.createElement("div")
            n_parts.classList.add("n-parts")
            n_parts.innerText = "x" + data[key][part][6]
            loadoutContainer.appendChild(n_parts)
            add_n_parts_buttons(loadoutContainer)
            let loadout1 = document.createElement("i")
            loadout1.classList.add("bi", "bi-check", "loadout-1")
            loadoutContainer.appendChild(loadout1)
            if (data[key][part][4] === 1) {
                loadout1.classList.add("fitted")
                let number = document.createElement("div")
                number.classList.add("number")
                number.innerText = "1"
                loadout1.appendChild(number)
                partLoadouts.dataset.loadout1 = data[key][part][0]
            }
            loadout_listener(loadout1, "1", partLoadouts)
            let loadout2 = document.createElement("i")
            loadout2.classList.add("bi", "bi-check", "loadout-2")
            loadoutContainer.appendChild(loadout2)
            if (data[key][part][5] === 1) {
                loadout2.classList.add("fitted")
                let number = document.createElement("div")
                number.classList.add("number")
                number.innerText = "2"
                loadout2.appendChild(number)
                partLoadouts.dataset.loadout2 = data[key][part][0]
            }
            loadout_listener(loadout2, "2", partLoadouts)
            partTitle.appendChild(loadoutContainer)
            let posRelative = document.createElement("div")
            posRelative.classList.add("one-part-flag-and-text")
            if (data[key][part][1] !== data[key][part][2]) {
                let flag = document.createElement("img")
                flag.classList.add("one-part-flag")
                let code = data[key][part][3]
                let codeFlag = races_map[code]
                let flagSrc = codes_dict[codeFlag]
                flag.src = flagSrc
                flag.setAttribute("loading","lazy");
                let flagName = document.createElement("div")
                flagName.classList.add("one-part-flag-title")
                flagName.innerText = races_names[code]
                posRelative.appendChild(flag)
                posRelative.appendChild(flagName)
            }
            else {
                posRelative.innerText = "BASE"
            }
            partElem.appendChild(partTitle)
            partElem.appendChild(posRelative)
            partElem.dataset.partid = part
            list.appendChild(partElem)
            if (index === data[key].length) {
                partName.classList.add("editing")
            }
            index++;

        }
        add_new_part_button(list)
    }
    updateDetailsModeUi();
}

function add_new_part_button(list) {
    let new_part_div = document.createElement("div")
    new_part_div.classList.add("new-part")
    let icon = document.createElement("i")
    let generalPart = list.parentNode
    icon.classList.add("bi", "bi-plus-circle")
    icon.textContent = "Add new part"
    new_part_div.appendChild(icon)
    list.appendChild(new_part_div)
    icon.addEventListener("click", function () {
        let previousPart = list.childNodes[list.childNodes.length - 2]
        let previous_name = previousPart.querySelector(".one-part-name").innerText
        let new_name = previous_name.split("-")[0] + "-" + previous_name.split("-")[1] + "-" + (parseInt(previous_name.split("-")[2]) + 1)
        let part = document.createElement("div")
        part.classList.add("one-part")
        let partTitle = document.createElement("div")
        partTitle.classList.add("one-part-title")
        let partName = document.createElement("div")
        partName.dataset.designId = actualMaxDesign
        partName.classList.add("one-part-name")
        partName.innerText = new_name
        let subtitle = list.parentNode.querySelector(`.part-subtitle`)
        subtitle.dataset.editing = "-1"
        actualMaxDesign += 1
        subtitle.innerText = new_name
        partTitle.appendChild(partName)
        let parts = list.querySelectorAll(".one-part")
        parts.forEach(function (part) {
            part.querySelector(".one-part-name").classList.remove("editing")
        })
        add_partName_listener(partName, subtitle, "new")
        let loadoutContainer = document.createElement("div")
        loadoutContainer.classList.add("fitted-icons")
        let n_parts = document.createElement("div")
        n_parts.classList.add("n-parts")
        n_parts.innerText = "x0"
        loadoutContainer.appendChild(n_parts)
        add_n_parts_buttons(loadoutContainer)
        let loadout1 = document.createElement("i")
        loadout1.classList.add("bi", "bi-check", "loadout-1")
        loadoutContainer.appendChild(loadout1)
        loadout_listener(loadout1, "1", generalPart)
        let loadout2 = document.createElement("i")
        loadout2.classList.add("bi", "bi-check", "loadout-2")
        loadoutContainer.appendChild(loadout2)
        loadout_listener(loadout2, "2", generalPart)
        partTitle.appendChild(loadoutContainer)
        part.appendChild(partTitle)
        list.insertBefore(part, new_part_div)
        partName.classList.add("editing")
        new_part_div.remove()
    })
}

function add_n_parts_buttons(loadoutContainer) {
    let buttonsContainer = document.createElement("div")
    buttonsContainer.classList.add("n-parts-buttons")
    let up = document.createElement("i")
    up.classList.add("bi", "bi-chevron-up", "new-augment-button")
    let down = document.createElement("i")
    down.classList.add("bi", "bi-chevron-down", "new-augment-button")
    buttonsContainer.appendChild(up)
    buttonsContainer.appendChild(down)
    up.addEventListener("click", function () {
        let n_parts = loadoutContainer.querySelector(".n-parts")
        let n = parseInt(n_parts.innerText.split("x")[1])
        n += 1
        n_parts.innerText = "x" + n
    })
    down.addEventListener("click", function () {
        let fitted_parts = loadoutContainer.parentNode.querySelectorAll(".fitted")
        let fitted_parts_numb = fitted_parts.length
        let n_parts = loadoutContainer.querySelector(".n-parts")
        let n = parseInt(n_parts.innerText.split("x")[1])
        if (n > fitted_parts_numb) {
            n -= 1
            if (n < 0) {
                n = 0
            }
            n_parts.innerText = "x" + n
        }
        else {
            fitted_parts.forEach(function (part) {
                let errorClass = ""
                if (part.classList.contains("loadout-1")) {
                    errorClass = "loadout-1-error";
                }
                else if (part.classList.contains("loadout-2")) {
                    errorClass = "loadout-2-error";
                }
                part.classList.add(errorClass);
                setTimeout(() => {
                    part.classList.remove(errorClass);
                }, 500);
            })
        }
    })
    loadoutContainer.appendChild(buttonsContainer)
}

export function load_one_part(data) {
    let key = Object.keys(data)[0]
    if (!currentPartsStats) {
        currentPartsStats = {};
    }
    currentPartsStats[key] = data[key];
    performanceDraftStats = null;

    if (performanceDetailsMode !== "performance") {
        return;
    }

    applyPartsStatsToDom(data);
}

function add_partName_listener(div, subtitle, type = "old") {
    div.addEventListener("click", function () {
        if (performanceDetailsMode !== "performance") {
            return;
        }
        if (type === "new") {
            subtitle.dataset.editing = -1
        }
        else {
            subtitle.dataset.editing = div.dataset.designId
        }
        subtitle.innerText = div.innerText
        let parts = div.parentNode.parentNode.parentNode.querySelectorAll(".one-part")
        parts.forEach(function (part) {
            part.querySelector(".one-part-name").classList.remove("editing")
        })
        div.classList.add("editing")
        if (type === "old") {
            const command = new Command("partRequest", { designID: div.dataset.designId});
            command.execute();
        }
    })
}

function loadout_listener(icon, loadout_n, partTitle) {
    icon.addEventListener("click", function () {
        let part_design = icon.parentNode.parentNode.querySelector(".one-part-name").dataset.designId;
        let n_parts_elem = icon.parentNode.querySelector(".n-parts");
        let n_parts = n_parts_elem.innerText.split("x")[1];
        let parts_fitted = icon.parentNode.parentNode.querySelectorAll(".fitted").length;

        if (parts_fitted < n_parts) {
            partTitle.dataset[`loadout${loadout_n}`] = part_design;
            if (loadout_n === "1") {
                let oldFitted = partTitle.querySelector(".loadout-1.fitted");
                if (oldFitted) {
                    oldFitted.classList.remove("fitted");
                    oldFitted.querySelector(".number").remove();
                }
                icon.classList.toggle("fitted");
                let number = document.createElement("div");
                number.classList.add("number");
                number.innerText = "1";
                icon.appendChild(number);
            } else {
                let oldFitted = partTitle.querySelector(".loadout-2.fitted");
                if (oldFitted) {
                    oldFitted.classList.remove("fitted");
                    oldFitted.querySelector(".number").remove();
                }
                icon.classList.toggle("fitted");
                let number = document.createElement("div");
                number.classList.add("number");
                number.innerText = "2";
                icon.appendChild(number);
            }
        } else {
            n_parts_elem.classList.add("n-parts-error");
            setTimeout(() => {
                n_parts_elem.classList.remove("n-parts-error");
            }, 500);
        }
    });
}
document.querySelector("#fitButton").addEventListener("click", function () {
    let data = {
        command: "fitParts",
        teamID: teamSelected

    }
    //pending
})

document.querySelectorAll(".part-performance-title .redesigned-chevron").forEach(function (elem) {
    elem.addEventListener("click", function () {
        elem.classList.toggle("clicked")
        let generalPart = elem.parentNode.parentNode
        elem.parentNode.querySelector(".part-buttons").classList.toggle("d-none")
        if (elem.classList.contains("clicked")) {
            generalPart.querySelector(".part-performance-stats").classList.add("hidden")
        }
        else {
            generalPart.querySelector(".part-performance-stats").classList.remove("hidden")
        }
    })
})

function buildHoldOptions(input, extra = {}) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const isEngineStat = !!input.closest(".engine-performance-stat");
    const hasMin = input.min !== "";
    const hasMax = input.max !== "";
    const format = extra.format ?? ((val) => (
        val.toFixed(2)
    ));
    const opts = { ...extra, format };
    if (hasMin) {
        opts.min = min;
    }
    if (hasMax) {
        opts.max = max;
    }
    if (isEngineStat && !hasMin) {
        opts.min = 0;
    }
    if (isEngineStat && !hasMax) {
        opts.max = 100;
    }
    return opts;
}

document.querySelector(".performance-show").querySelectorAll(".part-name-buttons .bi-plus.new-augment-button").forEach(function (elem) {
    const part = elem.closest(".part-performance");
    if (!part) return;
    const inputs = part.querySelectorAll(".custom-input-number");
    inputs.forEach(function (input) {
        const increment = input.max === "100" ? 0.5 : 0.025;
        attachHold(elem, input, increment, buildHoldOptions(input));
    });
});

document.querySelector(".performance-show").querySelectorAll(".part-name-buttons .bi-dash.new-augment-button").forEach(function (elem) {
    const part = elem.closest(".part-performance");
    if (!part) return;
    const inputs = part.querySelectorAll(".custom-input-number");
    inputs.forEach(function (input) {
        const increment = input.max === "100" ? -0.5 : -0.025;
        attachHold(elem, input, increment, buildHoldOptions(input));
    });
});

document.querySelector(".performance-show").querySelectorAll(".stat-number .bi-plus.new-augment-button").forEach(button => {
    const input = button.parentNode.querySelector(".custom-input-number");
    if (!input) return;
    attachHold(button, input, 0.01, buildHoldOptions(input));
});

document.querySelector(".performance-show").querySelectorAll(".stat-number .bi-dash.new-augment-button").forEach(button => {
    const input = button.parentNode.querySelector(".custom-input-number");
    if (!input) return;
    attachHold(button, input, -0.01, buildHoldOptions(input));
});

document.querySelector(".engines-show").querySelectorAll(".stat-number .bi-plus.new-augment-button").forEach(button => {
    const stat = button.closest(".engine-performance-stat");
    const input = button.parentNode.querySelector(".custom-input-number");
    const bar = stat ? stat.querySelector(".engine-performance-progress") : null;
    if (!input) return;
    attachHold(button, input, 0.5, buildHoldOptions(input, {
        onChange: (val) => {
            setBarWidth(bar, val);
        }
    }));
});

document.querySelector(".engines-show").querySelectorAll(".stat-number .bi-dash.new-augment-button").forEach(button => {
    const stat = button.closest(".engine-performance-stat");
    const input = button.parentNode.querySelector(".custom-input-number");
    const bar = stat ? stat.querySelector(".engine-performance-progress") : null;
    if (!input) return;
    attachHold(button, input, -0.5, buildHoldOptions(input, {
        onChange: (val) => {
            setBarWidth(bar, val);
        }
    }));
});
document.querySelector(".performance-show").querySelectorAll(".new-or-existing-part div").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let parent = elem.parentNode;
        let options = parent.querySelectorAll("div");
        options.forEach(function (option) {
            option.classList.remove("active-part");
        })
        elem.classList.add("active-part");
        parent.parentNode.parentNode.dataset.new = elem.dataset.new;
    })
})

const performanceGraphButton = document.getElementById("performanceGraphButton");
const performanceGraphIcon = performanceGraphButton.querySelector("i");
const performanceGraphText = performanceGraphButton.querySelector("span");
const performanceOverview = document.getElementById("performanceOverview");
const performanceExpertiseButton = document.getElementById("performanceExpertiseButton");
const engineViewModeButton = document.getElementById("engineViewModeButton");
const performanceAnnotationsToggleInput = document.getElementById("performanceAnnotationsToggle");
const performanceAnnotationsToggleWrapper = performanceAnnotationsToggleInput ? performanceAnnotationsToggleInput.closest(".annotations") : null;

if (performanceAnnotationsToggleInput) {
    performanceAnnotationsToggle = performanceAnnotationsToggleInput.checked;
    performanceAnnotationsToggleInput.addEventListener("change", function () {
        performanceAnnotationsToggle = performanceAnnotationsToggleInput.checked;
        if (!performanceGraph?.options?.plugins?.annotation) return;
        if (!Array.isArray(performanceGraph?.data?.labels)) return;

        applyAduoUpgradeAnnotations(currentData?.[2], currentData?.[1], performanceGraph.data.labels.length);
        performanceGraph.update();
    });
}

function setPerformanceSubview(section, subview) {
    teamsEngine = section;
    if (section === "teams") {
        performanceView = subview;
    }
    else {
        enginesView = subview;
    }

    let selectionState = { element: null, autoSelected: false };
    if (section === "teams" && subview === "details") {
        selectionState = selectDefaultTeamOrCarIfNeeded();
    }
    else if (section === "engines" && (subview === "manufacturerList" || subview === "condition")) {
        selectionState = selectDefaultTeamOrCarIfNeeded();
    }
    else if (section === "teams" && subview === "overview") {
        removeSelected();
    }

    viewingGraph = teamsEngine === "teams" && performanceView === "graph";

    performanceGraphButton.classList.add("active");
    if (performanceView === "graph") {
        performanceGraphIcon.className = "bi bi-graph-up";
        performanceGraphText.textContent = "Graph";
    }
    else if (performanceView === "details") {
        performanceGraphIcon.className = "bi bi-list-ul";
        performanceGraphText.textContent = "Details";
    }
    else {
        performanceGraphIcon.className = "bi bi-grid-3x2-gap";
        performanceGraphText.textContent = "Overview";
    }

    const isTeamsSection = teamsEngine === "teams";
    const isGraphView = isTeamsSection && performanceView === "graph";
    const isDetailsView = isTeamsSection && performanceView === "details";
    const isOverviewView = isTeamsSection && performanceView === "overview";
    const isManufacturerListView = !isTeamsSection && enginesView === "manufacturerList";
    const isConditionView = !isTeamsSection && enginesView === "condition";

    document.querySelector("#performanceGraph").classList.toggle("d-none", !isGraphView);
    document.querySelector(".teams-show").classList.toggle("d-none", !isDetailsView);
    performanceOverview.classList.toggle("d-none", !isOverviewView);
    document.querySelector("#enginesPerformance").classList.toggle("d-none", isTeamsSection);
    if (engineConditionEditor) {
        engineConditionEditor.classList.toggle("d-none", !isConditionView);
    }
    if (engineManufacturerList) {
        engineManufacturerList.classList.toggle("d-none", !isManufacturerListView);
    }
    document.querySelector("#carAttributeSelector").classList.toggle("d-none", !isTeamsSection);
    document.querySelector("#customEnginesButtonContainer").classList.toggle("d-none", isTeamsSection);
    document.querySelector("#customEngines").classList.toggle("d-none", !isManufacturerListView);
    if (performanceAnnotationsToggleWrapper) {
        performanceAnnotationsToggleWrapper.classList.toggle("d-none", !isGraphView);
    }
    document.querySelector(".save-button").classList.toggle("d-none", isTeamsSection && performanceView !== "details");
    updateEngineViewModeButton();

    if (isDetailsView) {
        first_show_animation();
    }
    if (isOverviewView) {
        load_overview();
    }

    if (section === "teams" && subview === "details" && selectionState.autoSelected) {
        const command = new Command("performanceRequest", { teamID: teamSelected });
        command.execute();
    }
}

function getEngineConditionItemLabel(name) {
    const itemName = String(name || "").trim();
    const replacementAbbreviation = abreviations_dict[teamSelected];

    if (!itemName || !replacementAbbreviation || !itemName.includes("-")) {
        return itemName;
    }

    const parts = itemName.split("-");
    parts[0] = replacementAbbreviation;
    return parts.join("-");
}

function setPerformanceView(view) {
    setPerformanceSubview("teams", view);
}

if (performanceExpertiseButton) {
    performanceExpertiseButton.addEventListener("click", function () {
        const currentIndex = performanceDetailsModes.indexOf(performanceDetailsMode);
        const next = performanceDetailsModes[(currentIndex + 1) % performanceDetailsModes.length];
        setPerformanceDetailsMode(next);
    });
}

if (engineViewModeButton) {
    engineViewModeButton.addEventListener("click", function () {
        if (teamsEngine !== "engines") {
            return;
        }

        if (enginesView === "manufacturerList") {
            const selectedTeamOrCar = getSelectedTeamOrCar();
            if (!selectedTeamOrCar) {
                return;
            }

            teamSelected = selectedTeamOrCar.dataset.teamid;
            setPerformanceSubview("engines", "condition");
            manageSaveButton(true, "performance");
            const command = new Command("engineConditionRequest", { teamID: teamSelected });
            command.execute();
            return;
        }

        setPerformanceSubview("engines", "manufacturerList");
        manageSaveButton(true, "performance");
    });
}

function createOverviewCard(attributeConfig) {
    let card = document.createElement("div");
    card.classList.add("overview-card");

    let title = document.createElement("div");
    title.classList.add("overview-card-title", "bold-font");
    title.textContent = attributeConfig.label;
    if (attributeConfig.key === "brake_cooling" && game_version === 2024) {
        title.textContent = "Tyre preservation";
    }
    card.appendChild(title);

    let teamsContainer = document.createElement("div");
    teamsContainer.classList.add("overview-card-teams");

    let teamsData = [];
    document.querySelectorAll("#teamsDiv .team-performance").forEach(function (teamElem) {
        let teamId = teamElem.dataset.teamid;
        let sourceBar = teamElem.querySelector(".performance-bar-progress");
        if (!sourceBar) {
            return;
        }

        let teamRow = document.createElement("div");
        teamRow.classList.add("overview-team", "bold-font");
        if (teamElem.classList.contains("d-none")) {
            teamRow.classList.add("d-none");
        }

        let carTitle = document.createElement("div");
        carTitle.classList.add("car-title");

        let leftContainer = document.createElement("div");
        leftContainer.classList.add("overview-team-left");

        let rank = document.createElement("span");
        rank.classList.add("overview-team-rank");
        leftContainer.appendChild(rank);

        let teamName = document.createElement("span");
        teamName.className = teamElem.querySelector(".team-title-name").className;
        teamName.textContent = teamElem.querySelector(".team-title-name").textContent;
        leftContainer.appendChild(teamName);
        carTitle.appendChild(leftContainer);

        let teamValue = document.createElement("span");
        teamValue.classList.add("overview-team-value");
        carTitle.appendChild(teamValue);

        let performanceBar = document.createElement("div");
        performanceBar.classList.add("performance-bar");
        let progressBar = document.createElement("div");
        progressBar.className = sourceBar.className;
        performanceBar.appendChild(progressBar);

        teamRow.appendChild(carTitle);
        teamRow.appendChild(performanceBar);

        let sourceKey = attributeConfig.source || attributeConfig.key;
        let value = getBarDatasetValue(sourceBar, sourceKey);
        updateBarModeClass(progressBar);
        setBarWidth(progressBar, value);
        teamValue.textContent = value.toFixed(2) + " %";

        teamRow.dataset.teamid = teamId;
        teamRow.dataset.attribute = attributeConfig.key;

        teamsData.push({
            teamRow: teamRow,
            teamId: teamId,
            value: value,
            isHidden: teamElem.classList.contains("d-none"),
            rank: rank
        });
    });

    let visibleTeams = teamsData.filter(t => !t.isHidden);
    visibleTeams.sort(function (a, b) {
        if (a.value === b.value) {
            return Number(a.teamId) - Number(b.teamId);
        }
        return b.value - a.value;
    });

    const visibleCount = visibleTeams.length;
    visibleTeams.forEach(function (entry, index) {
        entry.rank.textContent = String(index + 1);
        teamsContainer.appendChild(entry.teamRow);
    });

    teamsData.filter(t => t.isHidden).forEach(function (entry) {
        entry.rank.textContent = "";
        teamsContainer.appendChild(entry.teamRow);
    });

    card.appendChild(teamsContainer);
    return card;
}

function load_overview() {
    if (!performanceOverview) {
        return;
    }
    performanceOverview.innerHTML = "";
    overviewAttributes.forEach(function (attributeConfig) {
        performanceOverview.appendChild(createOverviewCard(attributeConfig));
    });
}

document.querySelector("#performanceGraphButton").addEventListener("click", function () {
    if (teamsEngine !== "teams") {
        return;
    }

    if (performanceView === "graph") {
        setPerformanceView("details");
    }
    else if (performanceView === "details") {
        setPerformanceView("overview");
    }
    else {
        removeSelected();
        setPerformanceView("graph");
    }
})

setPerformanceView("graph");
updatePerformanceExpertiseButton();
updateDetailsModeUi();

document.querySelectorAll(".part-performance-title .bi-chevron-up").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let title = elem.parentNode.parentNode
        let list = title.parentNode.querySelector(".parts-list")
        let partEditing = list.querySelector('.one-part-name.editing').parentNode.parentNode
        let newPart = partEditing.previousElementSibling
        if (!newPart) {
            let lastValidPart = list.lastElementChild;
            while (lastValidPart && lastValidPart.classList.contains('new-part')) {
                lastValidPart = lastValidPart.previousElementSibling;
            }
            newPart = lastValidPart;
        }
        newPart.querySelector(".one-part-name").click()
    })
})

document.querySelectorAll(".part-performance-title .bi-chevron-down").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let title = elem.parentNode.parentNode;
        let list = title.parentNode.querySelector(".parts-list");
        let partEditing = list.querySelector('.one-part-name.editing').parentNode.parentNode;
        let newPart = partEditing.nextElementSibling;

        // Si el siguiente es 'new-part', nos movemos al primero
        if (newPart && newPart.classList.contains('new-part')) {
            newPart = list.firstElementChild;
        }

        // Simulamos el click en el nuevo elemento encontrado (si es válido)
        if (newPart) {
            newPart.querySelector(".one-part-name").click();
        }
    });
});

/**
 * Puts the bars of the engine to their appropiate values
 * @param {div} div element of the dom that contains the stats of the engine
 */
function resetBarsEngines(div) {
    let statsString = div.dataset.stats
    var statsArray = statsString.split(' ').map(function (item) {
        return parseFloat(item, 10) / 10;
    });
    document.querySelector(".engines-show").querySelectorAll(".custom-progress").forEach(function (elem, index) {
        elem.dataset.progress = statsArray[index]
        manage_bar(elem, elem.dataset.progress)
    })
}

/**
 * resets all bars to 0
 */
function resetBars() {
    document.querySelectorAll(".custom-progress").forEach(function (elem) {
        elem.dataset.progress = 0
        manage_bar(elem, elem.dataset.progress)
    })
}

function add_custom_engine(name, stats) {
    let generalEngineDiv = document.createElement("div")
    let engineTitle = document.createElement("input")
    engineTitle.type = "text"
    if (name !== "") {
        engineTitle.value = name
    }
    else {
        engineTitle.value = "New Engine"
    }
    let engineCount = document.querySelectorAll(".custom-engines-div > div").length;
    let engineStatsId = `engineStats${engineCount + 1}`;
    let engineStats = document.createElement("div")
    let caret = document.createElement("i")
    let trash = document.createElement("i")
    trash.classList.add("bi", "bi-trash")
    caret.classList.add("redesigned-chevron", "clicked")
    generalEngineDiv.classList.add("engine-performance")
    engineTitle.classList.add("engine-performance-title")
    engineStats.classList.add("engine-performance-stats", "collapse", "show")
    engineStats.id = engineStatsId

    caret.addEventListener("click", function () {
        caret.classList.toggle("clicked")
    })

    trash.addEventListener("click", function () {
        generalEngineDiv.remove()
    })

    caret.setAttribute("data-bs-toggle", "collapse");
    caret.setAttribute("data-bs-target", `#${engineStatsId}`);

    for (let [key, value] of engine_stats_dict) {
        if ((game_version === 2024 && key !== 11 && key !== 12) || game_version === 2023) {
            let stat = document.createElement("div")
            stat.classList.add("engine-performance-stat")
            stat.dataset.attribute = key
            let statTitle = document.createElement("div")
            statTitle.classList.add("part-performance-stat-title")
            statTitle.innerText = value + " ";
            const statUnit = document.createElement("span")
            statUnit.classList.add("text-secondary")
            statUnit.innerText = "%"
            statTitle.appendChild(statUnit)
            let stat_number = document.createElement("div")
            stat_number.classList.add("stat-number")
            stat_number.innerHTML = '<i class="bi bi-dash new-augment-button"></i> <input type="text" class="custom-input-number"> <i class="bi bi-plus new-augment-button"></i>'
            let input = stat_number.querySelector(".custom-input-number");
            let bar = document.createElement("div")
            bar.classList.add("engine-performance-bar")
            let bar_progress = document.createElement("div")
            bar_progress.classList.add("engine-performance-progress")
            if (stats[key.toString()] !== undefined) {
                input.value = Number(stats[key]).toFixed(1);
                setBarWidth(bar_progress, stats[key]);
            }
            else {
                input.value = "50.0";
            }
            stat.appendChild(statTitle)
            stat.appendChild(stat_number)
            bar.appendChild(bar_progress)
            stat.appendChild(bar)
            engineStats.appendChild(stat)

            let less = stat_number.querySelector(".bi-dash.new-augment-button");
            let plus = stat_number.querySelector(".bi-plus.new-augment-button");
            const holdOptions = buildHoldOptions(input, {
                onChange: (val) => {
                    setBarWidth(bar_progress, val);
                }
            });
            attachHold(less, input, -0.5, holdOptions);
            attachHold(plus, input, 0.5, holdOptions);

        }
    }
    const blankSpace = document.createElement("div");
    blankSpace.classList.add("blank-engine-space");
    engineStats.appendChild(blankSpace);
    generalEngineDiv.appendChild(engineTitle)
    generalEngineDiv.appendChild(engineStats)
    generalEngineDiv.appendChild(caret)
    generalEngineDiv.appendChild(trash)
    document.querySelector(".custom-engines-div").appendChild(generalEngineDiv)
}

export function updateEngineLabels() {
    let engine_allocations = window.__ENGINE_ALLOCATIONS__ || {}
    let engine_names = window.__ENGINE_NAMES__ || {}
    for (const teamId in engine_allocations) {
        console.log("Updating engine label for team", teamId, "with engine", engine_allocations[teamId])
        let engine_label = document.querySelector("#teamsPerformance .team-performance[data-teamid='" + teamId + "'] .engine-label")
        console.log("Found engine label element:", engine_label)
        if (!engine_label) continue;
        let engineName = engine_names[engine_allocations[teamId]] || "Default Engine";
        engine_label.innerText = engineName;
    }
}


function wireEngineStatButtons(container) {
    container.querySelectorAll(".engine-performance-stat").forEach(function (stat) {
        const input = stat.querySelector(".custom-input-number")
        const bar = stat.querySelector(".engine-performance-progress")
        if (!input) return

        const holdOptions = buildHoldOptions(input, {
            onChange: (val) => {
                setBarWidth(bar, val)
            }
        })

        const plus = stat.querySelector(".bi-plus.new-augment-button")
        const less = stat.querySelector(".bi-dash.new-augment-button")
        if (plus) {
            attachHold(plus, input, 0.5, holdOptions)
        }
        if (less) {
            attachHold(less, input, -0.5, holdOptions)
        }
    })
}

function createCustomEngineCard(engineId, name, stats) {
    const engineDiv = document.createElement("div")
    engineDiv.classList.add("engine-performance", "custom-engine-card")
    engineDiv.dataset.engineid = engineId
    engineDiv.dataset.customEngine = "true"

    const title = document.createElement("div")
    title.classList.add("engine-performance-title",  "custom-engine-title")

    const logo = document.createElement("img")
    logo.classList.add("engine-performance-logo")
    logo.src = getEngineLogoSrc(name)
    logo.alt = `${name || "Custom engine"} logo`

    const nameInput = document.createElement("input")
    nameInput.type = "text"
    nameInput.classList.add("custom-engine-name")
    nameInput.value = name || "New Engine"
    nameInput.addEventListener("input", function () {
        logo.src = getEngineLogoSrc(nameInput.value)
        const engineDropdownItem = document.querySelector(`#engineMenu a.custom-engine[data-engine="${engineId}"]`)
        if (engineDropdownItem) {
            engineDropdownItem.innerText = nameInput.value
        }
    })

    title.appendChild(logo)
    title.appendChild(nameInput)
    engineDiv.appendChild(title)

    const customFlag = document.createElement("i")
    customFlag.classList.add("bi", "bi-sliders2", "custom-engine-flag")
    customFlag.setAttribute("title", "Delete custom engine")

    customFlag.addEventListener("mouseenter", function () {
        customFlag.classList.remove("bi-sliders2")
        customFlag.classList.add("bi-trash")
    })

    customFlag.addEventListener("mouseleave", function () {
        customFlag.classList.remove("bi-trash")
        customFlag.classList.add("bi-sliders2")
    })

    customFlag.addEventListener("click", async function (e) {
        e.preventDefault()
        e.stopPropagation()

        const ok = await confirmModal({
            title: "Delete custom engine",
            body: "Are you sure you want to delete this custom engine? Any team using it will be assigned a different engine.",
            confirmText: "Delete",
            cancelText: "Cancel"
        })
        if (!ok) return

        const command = new Command("deleteCustomEngine", { engineId: engineId })
        command.execute()
    })
    engineDiv.appendChild(customFlag)

    const engineStats = document.createElement("div")
    engineStats.classList.add("engine-performance-stats")

    for (let [key, value] of engine_stats_dict) {
        const stat = document.createElement("div")
        stat.classList.add("engine-performance-stat")
        if (key === 11 || key === 12) {
            stat.classList.add("engine24", "d-none")
        }
        stat.dataset.attribute = key

        const statTitle = document.createElement("div")
        statTitle.classList.add("part-performance-stat-title")
        statTitle.innerText = value + " "
        const unit = document.createElement("span")
        unit.classList.add("unit-measure", "bold-font")
        unit.innerText = "%"
        statTitle.appendChild(unit)

        const statNumber = document.createElement("div")
        statNumber.classList.add("stat-number")

        const less = document.createElement("i")
        less.classList.add("bi", "bi-dash", "new-augment-button", "transparent")

        const input = document.createElement("input")
        input.type = "text"
        input.classList.add("custom-input-number")

        const plus = document.createElement("i")
        plus.classList.add("bi", "bi-plus", "new-augment-button", "transparent")

        statNumber.appendChild(less)
        statNumber.appendChild(input)
        statNumber.appendChild(plus)

        const bar = document.createElement("div")
        bar.classList.add("engine-performance-bar")
        const barProgress = document.createElement("div")
        barProgress.classList.add("engine-performance-progress")
        bar.appendChild(barProgress)

        const rawValue = stats?.[String(key)] ?? stats?.[key]
        const numericValue = rawValue !== undefined ? Number(rawValue) : 50
        input.value = numericValue.toFixed(1)
        setBarWidth(barProgress, numericValue)

        stat.appendChild(statTitle)
        stat.appendChild(statNumber)
        stat.appendChild(bar)
        engineStats.appendChild(stat)
    }

    engineDiv.appendChild(engineStats)
    wireEngineStatButtons(engineDiv)
    return engineDiv
}

function renderCustomEnginesInList(engines) {
    const enginesContainer = document.getElementById("engineManufacturerList") || document.getElementById("enginesPerformance")
    if (!enginesContainer) return

    enginesContainer.querySelectorAll(".engine-performance.custom-engine-card").forEach(function (elem) {
        elem.remove()
    })

    engines.forEach(function (engine) {
        const engineId = engine[0]
        const engineStats = engine[1] || {}
        const engineName = engine[2] || ""
        enginesContainer.appendChild(createCustomEngineCard(engineId, engineName, engineStats))
    })
}

function getNextCustomEngineId() {
    const ids = Array.from(document.querySelectorAll("#engineManufacturerList .engine-performance[data-custom-engine=\"true\"], #enginesPerformance .engine-performance[data-custom-engine=\"true\"]"))
        .map((elem) => Number(elem.dataset.engineid))

    if (!ids.length) return 14

    let nextId = Math.max(...ids) + 3
    const used = new Set(ids)
    while (used.has(nextId)) {
        nextId += 3
    }
    return nextId
}

const addCustomEngineButton = document.getElementById("customEngines")
if (addCustomEngineButton) {
    addCustomEngineButton.addEventListener("click", function () {
        const enginesContainer = document.getElementById("engineManufacturerList") || document.getElementById("enginesPerformance")
        if (!enginesContainer) return

        enginesContainer.appendChild(createCustomEngineCard(getNextCustomEngineId(), "", {}))
        enginesContainer.scrollTop = enginesContainer.scrollHeight
    })
}

export function gather_custom_engines_data() {
    const engines = document.querySelectorAll("#engineManufacturerList .engine-performance[data-custom-engine=\"true\"], #enginesPerformance .engine-performance[data-custom-engine=\"true\"]")
    let enginesData = {}
    engines.forEach(function (engine) {
        const engineID = engine.dataset.engineid
        const nameInput = engine.querySelector(".custom-engine-name")
        const engineName = String(nameInput?.value || "").trim().toLowerCase()
        let engineStats = {}
        engine.querySelectorAll(".engine-performance-stat").forEach(function (stat) {
            let attribute = stat.dataset.attribute
            let value = stat.querySelector(".custom-input-number").value.split(" ")[0]
            engineStats[attribute] = value
        })
        enginesData[engineID] = {
            stats: engineStats,
            name: engineName || "new engine"
        }
    })
    return enginesData
}

export function load_custom_engines(data) {
    const engines = data || []
    customEnginesCopy = data

    const engineDropdown = document.querySelector("#engineMenu")
    if (engineDropdown) {
        engineDropdown.querySelectorAll("a.custom-engine").forEach(function (elem) {
            elem.remove()
        })

        engines.forEach(function (engine) {
            let engineOption = document.createElement("a")
            engineOption.classList.add("redesigned-dropdown-item", "custom-engine")
            engineOption.innerText = engine[2]
            engineOption.dataset.engine = engine[0]
            engineOption.href = "#"
            engineDropdown.appendChild(engineOption)
            engineOption.addEventListener("click", function () {
                let engineid = engineOption.dataset.engine
                let engineName = engineOption.innerText
                document.querySelector("#engineLabel").innerText = engineName
                document.querySelector("#engineButton").dataset.value = engineid
            })
        })
    }

    renderCustomEnginesInList(engines)
}



/**
 * Manages the progression of the bars 
 * @param {div} bar bar that is about to be edited
 * @param {int} progress number that determines the progress of the bar 
 */
function manage_bar(bar, progress) {
    if (bar.dataset.type === "engine") {
        let whiteDiv = bar.querySelector(".white-part")
        let newProgress = progress * 10
        let newWidth = 0 + newProgress + "%"
        whiteDiv.style.width = newWidth;
    }
    else {
        let grayDiv = bar.querySelector(".gray-part")
        let greenDiv = bar.querySelector(".green-part")
        if (progress == 0) {
            grayDiv.style.width = "100%"
            greenDiv.style.width = "0%"
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font"
        }
        else if (progress > 0) {
            grayDiv.style.width = "100%"
            let newProgress = progress * 10
            let newWidth = 0 + newProgress + "%"
            greenDiv.style.width = newWidth;
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font positive"
        }
        else if (progress < 0) {
            greenDiv.style.width = "0%"
            let newProgress = progress * 10
            let newWidth = 100 + newProgress + "%"
            grayDiv.style.width = newWidth;
            bar.parentNode.querySelector(".performance-data").className = "performance-data bold-font negative"
        }
    }

    bar.parentNode.querySelector(".performance-data").innerHTML = progress * 10 + "%"
}

export function reload_performance_graph() {
    if (typeof performanceGraph !== 'undefined' && performanceGraph !== null) {
        performanceGraph.destroy(); 
        load_performance_graph(currentData);
    }
    
}

export function load_performance_graph(data) {
    currentData = data
    const aduoUpgradeRaceIds = Array.isArray(data?.[2]) ? data[2] : [];
    let labelsArray = []
    data[1].forEach(function (elem) {
        labelsArray.push(races_names[elem[2]])
    })
    labelsArray.unshift("")
    if (typeof performanceGraph !== 'undefined' && performanceGraph !== null) {
        performanceGraph.destroy();
    }
    createPerformanceChart(labelsArray)
    applyAduoUpgradeAnnotations(aduoUpgradeRaceIds, data?.[1], labelsArray.length)
    performanceGraph.update()
    let teamPerformances = {};

    // Inicializar un array vacío para cada equipo
    for (let i = 1; i <= 10; i++) {
        teamPerformances[i] = [];
    }
    teamPerformances[32] = [];
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    let performances = [...data[0]]
    performances.forEach(race => {
        for (let team in race) {
            let value = race[team];
            teamPerformances[team].push(value);
            if (value < minValue) {
                minValue = value;
            }
            if (value > maxValue) {
                maxValue = value;
            }
        }
    });
    let yAxisMin = minValue - 5;
    let yAxisMax = maxValue + 5;
    for (let team in teamPerformances) {
        let color = get_colors_dict()[team + "0"];
        let data = teamPerformances[team];
        performanceGraph.data.datasets.push({
            label: combined_dict[team],
            data: data,
            borderColor: color,
            backgroundColor: color,
            pointRadius: 0,
            fill: false,
            tension: 0.1,
            pointHitRadius: 7
        });
    }
    performanceGraph.options.scales.y.min = yAxisMin;
    performanceGraph.options.scales.y.max = yAxisMax;
    performanceGraph.update();
}

function applyAduoUpgradeAnnotations(raceIds, races, labelCount) {
    if (!performanceGraph?.options?.plugins?.annotation) return;

    const ids = Array.isArray(raceIds)
        ? raceIds.map(r => Number(r)).filter(r => Number.isFinite(r) && r > 0)
        : [];

    const raceIdToLabelIndex = new Map();
    if (Array.isArray(races)) {
        for (let i = 0; i < races.length; i++) {
            const raceId = Number(races[i]?.[0]);
            if (!Number.isFinite(raceId)) continue;
            raceIdToLabelIndex.set(raceId, i + 1); // +1 because labelsArray.unshift("")
        }
    }

    const annotations = {};
    for (const raceId of ids) {
        const labelIndex = raceIdToLabelIndex.get(raceId);
        if (!labelIndex || labelIndex <= 0 || labelIndex >= labelCount) continue;

        const boundaryIndex = labelIndex - 1; // La línea se dibuja antes del índice de la etiqueta correspondiente
        if (boundaryIndex <= 0) continue;

        annotations[`aduo_engine_${raceId}`] = {
            type: 'line',
            xMin: boundaryIndex,
            xMax: boundaryIndex,
            display: performanceAnnotationsToggle,
            borderColor: theme_colors[selectedTheme]?.engine_upgrade_line || 'rgba(253, 224, 107, 0.8)',
            borderWidth: 2,
            borderDash: [6, 6],
            drawTime: 'beforeDatasetsDraw'
        };
    }

    performanceGraph.options.plugins.annotation.annotations = annotations;
}

/**
 * Creates the head to head race chart
 * @param {Array} labelsArray array with all the labels for the races
 */
function createPerformanceChart(labelsArray) {
    const dataD = {
        labels: labelsArray,
    };
    performanceGraph = new Chart(
        document.getElementById('performanceGraph'),
        {
            type: 'line',
            data: dataD,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    mode: 'index'
                },
                layout: {
                    padding: {
                        top: 25,
                        right: 25,
                        boottom: 20,
                        left: 10
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: theme_colors[selectedTheme].grid
                        },
                        ticks: {
                            color: theme_colors[selectedTheme].labels,
                            font: {
                                family: "Formula1Bold"
                            }
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: theme_colors[selectedTheme].grid
                        },
                        ticks: {
                            color: theme_colors[selectedTheme].labels,
                            font: {
                                family: "Formula1Bold"
                            },
                            callback: function (value) {
                                return value.toFixed(1); // Mostrar solo un decimal
                            }
                        }

                    }
                },
                plugins: {
                    datalabels: {
                        display: false
                    },
                    annotation: {
                        annotations: {}
                    },
                    legend: {
                        labels: {
                            boxHeight: 2,
                            boxWidth: 25,
                            color: theme_colors[selectedTheme].labels,
                            font: {
                                family: "Formula1"
                            }
                        },
                        display: false,
                    },
                    tooltip: {
                        titleFont: {
                            family: 'Formula1Bold',
                            size: 16

                        },
                        bodyFont: {
                            family: 'Formula1',
                            size: 14
                        }
                    }

                }


            }
        }
    );
}




