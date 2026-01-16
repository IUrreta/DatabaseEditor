import { races_names, names_full, team_dict, codes_dict, combined_dict, logos_disc, races_map, driversTableLogosDict, f1_teams, f2_teams, f3_teams } from "./config";
import { resetH2H } from './head2head';
import { game_version, custom_team } from "./renderer";
import { insert_space, manageColor, setCurrentSeason, format_name } from "./transfers";
import { news_insert_space } from "../backend/scriptUtils/newsUtils.js";
import { Command } from "../backend/command.js";




let seasonTable;
let teamsTable;
let races_ids = []
let seasonResults;
let calendarData;
let pointsOrPos = "points"
let currentFormula = 1
let alphaReplace = "alphatauri"
let alpineReplace = "alpine"
let alfaReplace = "alfa"
let redbullReplace = "redbull"
let astonReplace = "aston"
let williamsReplace = "williams"
let haasReplace = "haas"
let driverOrTeams = "drivers"
let isYearSelected = false
let racesLeftCount = 0, sprintsLeft = 0;
export let engine_allocations;
let driverCells;
let teamCells;
let standingsDetailsEnabled = false;
let qualifyingHeightListenerAttached = false;

function applyStandingsDetailsState() {
    const seasonViewer = document.getElementById("season_viewer");
    const button = document.getElementById("standingsDetailsButton");
    const label = button?.querySelector("span");
    const eyeIcon = button?.querySelector("i.bi-eye");
    const eyeSlashIcon = button?.querySelector("i.bi-eye-slash");

    if (seasonViewer) {
        seasonViewer.classList.toggle("standings-details-enabled", standingsDetailsEnabled);
    }

    if (label) {
        label.textContent = standingsDetailsEnabled ? "Hide details" : "Show details";
    }

    if (eyeIcon && eyeSlashIcon) {
        eyeIcon.style.display = standingsDetailsEnabled ? "inline" : "none";
        eyeSlashIcon.style.display = standingsDetailsEnabled ? "none" : "inline";
    }
}

function setStandingsPositionChange(changeDiv, lastPositionChange) {
    if (!changeDiv) return;
    const numberEl = changeDiv.querySelector(".standings-pos-change-number");
    const iconEl = changeDiv.querySelector("i");
    // In DB: negative = gained positions, positive = lost positions.
    // UI: positive = gained, negative = lost.
    const dbChange = Number(lastPositionChange) || 0;
    const change = -dbChange;

    changeDiv.classList.remove("up", "down", "neutral");

    if (numberEl) {
        numberEl.textContent = change > 0 ? `+${change}` : String(change);
    }

    if (iconEl) {
        if (change > 0) {
            iconEl.className = "bi bi-caret-up-fill";
            changeDiv.classList.add("up");
        }
        else if (change < 0) {
            iconEl.className = "bi bi-caret-down-fill";
            changeDiv.classList.add("down");
        }
        else {
            iconEl.className = "bi bi-dash";
            changeDiv.classList.add("neutral");
        }
    }
}

function setStandingsPointsGap(gapDiv, gapToLeader) {
    if (!gapDiv) return;
    const gap = Number(gapToLeader);
    if (!Number.isFinite(gap)) {
        gapDiv.textContent = "";
        return;
    }
    gapDiv.textContent = gap === 0 ? "0" : `+${Math.max(0, gap)}`;
}

function updateStandingsPointsGaps(rows, leaderPoints) {
    rows.forEach((row) => {
        const gap = Number(leaderPoints) - Number(row.points);
        setStandingsPointsGap(row.pointsGapDiv, gap);
    });
}

document.getElementById("standingsDetailsButton").addEventListener("click", function () {
    standingsDetailsEnabled = !standingsDetailsEnabled;
    applyStandingsDetailsState();
});
applyStandingsDetailsState();


export let engine_names = { //this one is changed as the user adds engines, so it will stayhere
    1: "Ferrari",
    4: "Rbpt",
    7: "Mercedes",
    10: "Renault"
}

export function addEngineName(id, name) {
    engine_names[id] = name
}

export function deleteEngineName(id) {
    delete engine_names[id]
}

export function setEngineAllocations(allocations) {
    engine_allocations = allocations
}


export function resetViewer() {
    if (seasonTable) {
        seasonTable.destroy()
    }
    pointsOrPos = "points"
    if (teamsTable) {
        teamsTable.destroy()
    }
}

export function resetYearButtons() {
    document.getElementById("yearButton").textContent = "Year"
    isYearSelected = false
    manage_show_tables()
    document.getElementById("yearButtonH2H").textContent = "Year"
    document.getElementById("yearPredictionButton").textContent = "Year"
    document.getElementById("yearPredictionModalButton").textContent = "Year"
}



/**
 * Pills for the drivers and teams tables
 */
document.getElementById("driverspill").addEventListener("click", function () {
    driverOrTeams = "drivers"
    manage_show_tables()
})

document.getElementById("teamspill").addEventListener("click", function () {
    driverOrTeams = "teams"
    manage_show_tables()
})


function manage_show_tables() {
    const recordsList = document.querySelector(".records-list")
    recordsList.innerHTML = ""
    recordsList.classList.add("d-none")
    const seasonReviewBento = document.querySelector(".season-review-bento")
    seasonReviewBento.classList.add("d-none")
    if (isYearSelected) {
        if (driverOrTeams === "drivers") {
            document.querySelector(".teams-table").classList.add("d-none")
            document.querySelector(".drivers-table").classList.remove("d-none")
        }
        else {
            document.querySelector(".teams-table").classList.remove("d-none")
            document.querySelector(".drivers-table").classList.add("d-none")
        }
    }
    else {
        document.querySelector(".teams-table").classList.add("d-none")
        document.querySelector(".drivers-table").classList.add("d-none")
    }
}

document.querySelectorAll("#tableTypeDropdown a").forEach(function (elem) {     
    elem.addEventListener("click", function () {
        pointsOrPos = elem.dataset.value
        //count time to execute the function
        let start = performance.now()
        change_points_pos_drivers()
        let end = performance.now()
        start = performance.now()
        change_points_pos_teams()
        end = performance.now()
        document.querySelector("#tableTypeButton span").textContent = elem.textContent
    })
})

function forceStandingsCurrentSeason() {
    const recordsButton = document.getElementById("recordsTypeButton")
    const standingsItem = document.querySelector("#recordsTypeDropdown a[data-value='standings']")
    if (recordsButton) {
        recordsButton.dataset.value = "standings"
        const label = recordsButton.querySelector("span.dropdown-label")
        if (label) {
            label.textContent = standingsItem ? standingsItem.textContent : "Standings"
        }
    }
    const standingsSettings = document.getElementById("standingsSettings")
    const recordsSettings = document.getElementById("recordsSettings")
    if (standingsSettings) {
        standingsSettings.classList.remove("d-none")
    }
    if (recordsSettings) {
        recordsSettings.classList.add("d-none")
    }

    const yearMenu = document.querySelector("#yearMenu")
    const yearItems = yearMenu ? Array.from(yearMenu.querySelectorAll("a")) : []
    if (yearItems.length > 1) {
        const currentYearEl = yearItems.find(item => item.dataset.year !== "all")
        if (currentYearEl) {
            manageRecordsSelected(currentYearEl)
        }
    }
}

function updateSeriesControls() {
    const showRecordsControls = currentFormula === 1
    const recordsWrapper = document.getElementById("recordsTypeButton")?.closest(".dropdown-global")
    const yearWrapper = document.getElementById("yearButton")?.closest(".dropdown-global")
    if (recordsWrapper) {
        recordsWrapper.classList.toggle("d-none", !showRecordsControls)
    }
    if (yearWrapper) {
        yearWrapper.classList.toggle("d-none", !showRecordsControls)
    }
}

document.querySelectorAll("#seriesTypeDropdown a").forEach(function (elem) {    
    elem.addEventListener("click", function () {
        const value = parseInt(elem.dataset.value, 10)
        currentFormula = Number.isFinite(value) ? value : 1
        const seriesButton = document.getElementById("seriesTypeButton")        
        seriesButton.querySelector("span.dropdown-label").textContent = elem.textContent
        seriesButton.dataset.value = elem.dataset.value
        updateSeriesControls()
        if (currentFormula !== 1) {
            forceStandingsCurrentSeason()
        }
        else if (document.querySelector("#recordsTypeButton").dataset.value === "standings") {
            manageRecordsSelected(null)
        }
    })
})




function change_points_pos_drivers() {
    driverCells.forEach(function (cell) {
        if (cell.dataset[pointsOrPos] !== undefined) {
            cell.innerText = cell.dataset[pointsOrPos]
        }
        else {
            cell.innerText = "-"
        }
    })
}

function renderTeamCellList(cell, values) {
    cell.innerHTML = ""
    if (!Array.isArray(values) || values.length === 0) {
        cell.innerText = "-"
        return
    }
    const container = document.createElement("div")
    container.className = "teams-table-multi"
    values.forEach((value) => {
        const item = document.createElement("div")
        item.className = "teams-table-multi-item"
        item.textContent = value
        container.appendChild(item)
    })
    cell.appendChild(container)
}

function change_points_pos_teams() {
    teamCells.forEach(function (cell) {
        if (currentFormula === 3 && (pointsOrPos === "pos" || pointsOrPos === "quali")) {
            const listKey = pointsOrPos === "pos" ? "poslist" : "qualilist"
            if (cell.dataset[listKey]) {
                try {
                    const values = JSON.parse(cell.dataset[listKey])
                    renderTeamCellList(cell, values)
                    return
                } catch (err) {
                    // fall back to text if data is malformed
                }
            }
        }
        if (cell.dataset[pointsOrPos] !== undefined) {
            cell.innerText = cell.dataset[pointsOrPos]
        }
        else {
            cell.innerText = "-"
        }
    })

}

function getTeamAbbr(teamId) {
    const abbr = team_dict[teamId]
    return abbr ? abbr.toUpperCase() : ""
}

function buildTeamAbbrElement(teamId, sizeClass) {
    const abbr = getTeamAbbr(teamId)
    const abbrDiv = document.createElement("div")
    abbrDiv.classList = "team-logo-abbr"
    if (sizeClass) {
        abbrDiv.classList.add(sizeClass)
    }
    //get team logo from logos_disc if exists
    let logo_src = logos_disc[teamId]
    if (logo_src) {
        let logo = document.createElement("img")
        logo.classList = sizeClass
        logo.dataset.teamid = teamId
        logo.setAttribute("src", logo_src)
        abbrDiv.appendChild(logo)
    }
    else{
        abbrDiv.textContent = abbr
    }
    return abbrDiv
}

function createHeaderCell(trackId, labelSuffix = "", baseClass = "drivers-table-normal") {
    let headerPos = document.createElement("div")
    headerPos.className = `${baseClass} bold-font flag-header`
    let headerPosFlag = document.createElement("img")
    let race = races_map[trackId]
    let flag_src = codes_dict[race]
    headerPosFlag.src = flag_src
    let headerPosDiv = document.createElement("div")
    headerPosDiv.classList.add("text-in-front")
    headerPosDiv.classList.add("bold-font")
    headerPosDiv.innerText = labelSuffix ? `${labelSuffix}` : races_names[trackId]
    if (labelSuffix === "SPR") {
        headerPosDiv.classList.add("sprint-label")
        headerPosDiv.classList.add("sprint-result-cell")
    }
    headerPos.appendChild(headerPosFlag)
    headerPos.appendChild(headerPosDiv)
    return headerPos
}

function formatDriverCellValue(value, type) {
    if (value === null || value === undefined) {
        return "-"
    }
    return manage_dataset_info_driver(value, undefined, type)
}

function syncFormulaFromCalendar(formula) {
    const seriesButton = document.getElementById("seriesTypeButton")        
    if (seriesButton) {
        const label = formula === 2 ? "F2" : (formula === 3 ? "F3" : "F1")
        seriesButton.querySelector("span.dropdown-label").textContent = label
        seriesButton.dataset.value = String(formula)
    }
    
    updateSeriesControls()
}

export function new_drivers_table(data) {
    calendarData = data
    syncFormulaFromCalendar(currentFormula)
    races_ids = []
    let header = document.querySelector(".drivers-table-header")
    header.innerHTML = ""
    let driverDiv = document.createElement("div")
    driverDiv.classList = "drivers-table-driver bold-font"
    driverDiv.innerText = "DRIVER"
    let PositionDiv = document.createElement("div")
    PositionDiv.classList = "drivers-table-position bold-font"
    PositionDiv.innerText = "#"
    header.appendChild(PositionDiv)
    let posChangeHeader = document.createElement("div")
    posChangeHeader.classList = "standings-pos-change bold-font"
    posChangeHeader.innerText = "G/L"
    header.appendChild(posChangeHeader)
    header.appendChild(driverDiv)
    const isF1 = currentFormula === 1
    const driversData = document.querySelector(".drivers-table-data")
    driversData.className = "drivers-table-data"
    if (currentFormula === 2) {
        driversData.classList.add("f2-table-data")
    }
    else if (currentFormula === 3) {
        driversData.classList.add("f3-table-data")
    }
    data.forEach(function (elem) {
        const raceId = elem[0]
        const trackId = elem[1]
        races_ids.push(raceId)
        if (isF1) {
            header.appendChild(createHeaderCell(trackId))
        }
        else {
            header.appendChild(createHeaderCell(trackId, "SPR"))
            header.appendChild(createHeaderCell(trackId))
        }
    })
    let GapDiv = document.createElement("div")
    GapDiv.classList = "standings-points-gap bold-font"
    GapDiv.innerText = "GAP"
    header.appendChild(GapDiv)
    let PointsDiv = document.createElement("div")
    PointsDiv.classList = "drivers-table-points bold-font"
    PointsDiv.innerText = "PTS"
    header.appendChild(PointsDiv)

}

export function new_teams_table(data) {
    calendarData = data
    races_ids = []
    let header = document.querySelector(".teams-table-header")
    header.innerHTML = ""
    let driverDiv = document.createElement("div")
    driverDiv.classList = "teams-table-team bold-font"
    driverDiv.innerText = "TEAM"
    let PositionDiv = document.createElement("div")
    PositionDiv.classList = "teams-table-position bold-font"
    PositionDiv.innerText = "#"
    header.appendChild(PositionDiv)
    let posChangeHeader = document.createElement("div")
    posChangeHeader.classList = "standings-pos-change bold-font"
    posChangeHeader.innerText = "G/L"
    header.appendChild(posChangeHeader)
    header.appendChild(driverDiv)
    const isF1 = currentFormula === 1
    const teamsData = document.querySelector(".teams-table-data")
    teamsData.className = "teams-table-data"
    if (currentFormula === 2) {
        teamsData.classList.add("f2-table-data")
    }
    else if (currentFormula === 3) {
        teamsData.classList.add("f3-table-data")
    }
    data.forEach(function (elem) {
        const raceId = elem[0]
        const trackId = elem[1]
        races_ids.push(raceId)
        if (isF1) {
            header.appendChild(createHeaderCell(trackId, "", "teams-table-normal"))
        }
        else {
            header.appendChild(createHeaderCell(trackId, "SPR", "teams-table-normal"))
            header.appendChild(createHeaderCell(trackId, "", "teams-table-normal"))
        }
    })
    let GapDiv = document.createElement("div")
    GapDiv.classList = "standings-points-gap bold-font"
    GapDiv.innerText = "GAP"
    header.appendChild(GapDiv)
    let PointsDiv = document.createElement("div")
    PointsDiv.classList = "teams-table-points bold-font"
    PointsDiv.innerText = "PTS"
    header.appendChild(PointsDiv)
}

function checkscroll() {
    let datazone = document.querySelector(".drivers-table-data")
    let pointscol = document.querySelector(".drivers-table-header").querySelector(".drivers-table-points")
    if (datazone.scrollHeight > datazone.clientHeight) {
        pointscol.style.width = "84px"
    }
    else {
        pointscol.style.width = "80px"
    }
}

function new_color_drivers_table() {
    let datazone = document.querySelector(".drivers-table-data");
    let rows = datazone.querySelectorAll(".drivers-table-row");

    rows.forEach(function (row) {
        let cells = row.querySelectorAll(".drivers-table-normal");

        cells.forEach(function (cell) {
            let pos = cell.dataset.pos;

            if (pos) {
                let match = pos.match(/^(\d)(?:\s*\(.*\))?$/);
                if (match) {
                    let number = match[1];
                    if (number === "1") {
                        cell.classList.add("first");
                    } else if (number === "2") {
                        cell.classList.add("second");
                    } else if (number === "3") {
                        cell.classList.add("third");
                    }
                }
            }

            if (cell.dataset.fastlap === "1") {
                cell.classList.add("fastest");
            }
            if (cell.dataset.dotd === "true") {
                cell.classList.add("dotd");
            }
            if (cell.dataset.quali === "1") {
                cell.style.fontFamily = "Formula1Bold";
            }
        });
    });
}


function manage_teams_table_logos() {
    let logos = document.querySelectorAll(".teams-table-logo-inner")
    logos.forEach(function (logo) {
        if (logo.dataset.teamid === "1") {
            logo.className = "teams-table-logo-inner ferrari-team-table-logo"
        }
        else if (logo.dataset.teamid === "2") {
            if (logo.tagName === "IMG") {
                const newElem = document.createElement("div");
                newElem.className = "teams-table-logo-inner mclaren-team-table-logo";
                newElem.dataset.teamid = logo.dataset.teamid;
                logo.replaceWith(newElem);
                logo = newElem;
            }
            else {
                logo.className = "teams-table-logo-inner mclaren-team-table-logo";
            }
        }
        else if (logo.dataset.teamid === "3") {
            if (redbullReplace === "redbull") {
                logo.className = "teams-table-logo-inner redbull-team-table-logo"
            }
            else if (redbullReplace === "ford") {
                logo.className = "teams-table-logo-inner ford-team-table-logo"
            }
            logo.src = logos_disc[3]
        }
        else if (logo.dataset.teamid === "4") {
            logo.className = "teams-table-logo-inner merc-team-table-logo"
        }
        else if (logo.dataset.teamid === "5") {
            if (alpineReplace === "alpine") {
                logo.className = "teams-table-logo-inner alpine-team-table-logo"
            }
            else if (alpineReplace === "andretti") {
                logo.className = "teams-table-logo-inner ferrari-team-table-logo"
                logo.src = "../assets/images/andretti2.png"
            }
            else if (alpineReplace === "renault") {
                logo.className = "teams-table-logo-inner ferrari-team-table-logo"
                logo.src = "../assets/images/renault2.png"
            }
            else if (alpineReplace === "cadillac") {
                logo.className = "teams-table-logo-inner cadillac-team-table-logo"
                logo.src = logos_disc[5]
            }
            else if (alpineReplace === "lotus") {
                logo.src = "../assets/images/lotus2.png"
            }
        }
        else if (logo.dataset.teamid === "6") {
            if (williamsReplace === "williams") {
            logo.className = "teams-table-logo-inner williams-team-table-logo" 
            }
            else if (williamsReplace === "bmw") {
                logo.className = "teams-table-logo-inner bmw-team-table-logo"
            } 
            logo.src = logos_disc[6]
        }
        else if (logo.dataset.teamid === "7") {
            if (haasReplace === "toyota") {
                if (logo.tagName === "IMG") {
                    const newElem = document.createElement("div");
                    newElem.className = "teams-table-logo-inner toyota-team-table-logo";
                    newElem.dataset.teamid = logo.dataset.teamid;
                    logo.replaceWith(newElem);
                    logo = newElem;
                }
                else {
                    logo.className = "teams-table-logo-inner toyota-team-table-logo";
                }
            }
            else {
                if (logo.tagName !== "IMG") {
                    const newElem = document.createElement("img");
                    newElem.className = "teams-table-logo-inner haas-team-table-logo";
                    newElem.dataset.teamid = logo.dataset.teamid;
                    newElem.src = logos_disc[7];
                    logo.replaceWith(newElem);
                    logo = newElem;
                }
                else {
                    logo.className = "teams-table-logo-inner haas-team-table-logo";
                    logo.src = logos_disc[7];
                }
            }
        }
        else if (logo.dataset.teamid === "8") {
            if (alphaReplace === "alphatauri") {
                logo.className = "teams-table-logo-inner alphatauri-team-table-logo"
            }
            else if (alphaReplace === "visarb") {
                logo.className = "teams-table-logo-inner merc-team-table-logo"
            }
            else if (alphaReplace === "hugo") {
                logo.className = "teams-table-logo-inner hugo-team-table-logo"
            }
            else if (alphaReplace === "toyota") {
                if (logo.tagName === "IMG") {
                    const newElem = document.createElement("div");
                    newElem.className = "teams-table-logo-inner toyota-team-table-logo";
                    newElem.dataset.teamid = logo.dataset.teamid;
                    logo.replaceWith(newElem);
                    logo = newElem;
                }
                else {
                    logo.className = "teams-table-logo-inner toyota-team-table-logo";
                }
            }
            else if (alphaReplace === "porsche") {
                logo.className = "teams-table-logo-inner porsche-team-table-logo"
            }
            else if (alphaReplace === "brawn") {
                logo.className = "teams-table-logo-inner brawn-team-table-logo"
                logo.src = "../assets/images/brawn2.png"
            }

            if (alphaReplace !== "toyota" && logo.tagName !== "IMG") {
                const newElem = document.createElement("img");
                newElem.className = logo.className;
                newElem.dataset.teamid = logo.dataset.teamid;
                newElem.src = logos_disc[8];
                logo.replaceWith(newElem);
                logo = newElem;
            }

            if (alphaReplace !== "brawn" && logo.tagName === "IMG") {
                logo.src = logos_disc[8];
            }
        }
        else if (logo.dataset.teamid === "9") {
            if (alfaReplace === "alfa") {
                logo.className = "teams-table-logo-inner merc-team-table-logo"
            }
            else if (alfaReplace === "audi") {
                logo.className = "teams-table-logo-inner audi-team-table-logo"
            }
            else if (alfaReplace === "stake") {
                logo.className = "teams-table-logo-inner stake-team-table-logo"
            }
            else if (alfaReplace === "sauber") {
                logo.className = "teams-table-logo-inner ferrari-team-table-logo"
            }
        }
        else if (logo.dataset.teamid === "10") {
            if (astonReplace === "aston") {
                logo.className = "teams-table-logo-inner aston-team-table-logo"
            }
            else if (astonReplace === "racingpoint") {
                logo.className = "teams-table-logo-inner racingpoint-team-table-logo"
            }
            else if (astonReplace === "jordan") {
                logo.className = "teams-table-logo-inner jordan-team-table-logo"
            }
            logo.src = logos_disc[10]
        }
        else if (logo.dataset.teamid === "32") {
            logo.className = "teams-table-logo-inner custom-team-table-logo custom-replace"
        }
    })
}

function manage_teams_table_names() {
    let names = document.querySelectorAll(".teams-table-team")
    names.forEach(function (name) {
        if (name.dataset.teamid === "5") {
            if (alpineReplace === "alpine") {
                name.firstChild.innerText = "ALPINE"
            }
            else if (alpineReplace === "andretti") {
                name.firstChild.innerText = "ANDRETTI"
            }
            else if (alpineReplace === "renault") {
                name.firstChild.innerText = "RENAULT"
            }
            else if (alpineReplace === "cadillac") {
                name.firstChild.innerText = "CADILLAC"
            }
            else if (alpineReplace === "lotus") {
                name.firstChild.innerText = "LOTUS"
            }
        }
        else if (name.dataset.teamid === "8") {
            if (alphaReplace === "alphatauri") {
                name.firstChild.innerText = "ALPHA TAURI"
            }
            else if (alphaReplace === "visarb") {
                name.firstChild.innerText = "VISA CASHAPP RB"
            }
            else if (alphaReplace === "hugo") {
                name.firstChild.innerText = "HUGO"
            }
            else if (alphaReplace === "toyota") {
                name.firstChild.innerText = "TOYOTA"
            }
            else if (alphaReplace === "porsche") {
                name.firstChild.innerText = "PORSCHE"
            }
            else if (alphaReplace === "brawn") {
                name.firstChild.innerText = "BRAWN GP"
            }
        }
        else if (name.dataset.teamid === "9") {
            if (alfaReplace === "alfa") {
                name.firstChild.innerText = "ALFA ROMEO"
            }
            else if (alfaReplace === "audi") {
                name.firstChild.innerText = "AUDI"
            }
            else if (alfaReplace === "stake") {
                name.firstChild.innerText = "STAKE SAUBER"
            }
            else if (alfaReplace === "sauber") {
                name.firstChild.innerText = "SAUBER"
            }
        }
        else if (name.dataset.teamid === "3") {
            if (redbullReplace === "redbull") {
                name.firstChild.innerText = "RED BULL"
            }
            else if (redbullReplace === "ford") {
                name.firstChild.innerText = "FORD"
            }
        }
        else if (name.dataset.teamid === "10") {
            if (astonReplace === "aston") {
                name.firstChild.innerText = "ASTON MARTIN"
            }
            else if (astonReplace === "racingpoint") {
                name.firstChild.innerText = "RACING POINT"
            }
            else if (astonReplace === "jordan") {
                name.firstChild.innerText = "JORDAN"
            }
        }
    })
}

function new_color_teams_table() {
    let datazone = document.querySelector(".teams-table-data")
    calendarData.forEach(function (race) {
        let id = race[0]
        let colCells = datazone.querySelectorAll(".teams-table-normal[data-raceid='" + id + "']");
        if (colCells.length > 0) {
            let values = [];
            colCells.forEach(function (cell, index) {
                let value = cell.dataset.points;
                values.push([value, index]);
                if (cell.dataset.quali1 === "1" || cell.dataset.quali2 === "1") {
                    cell.style.fontFamily = "Formula1Bold"
                }
                if (cell.dataset.fastlap1 === "1" || cell.dataset.fastlap2 === "1") {
                    cell.classList.add("fastest")
                }
            });
            const hasResults = values.some(([value], idx) => {
                const text = colCells[idx].textContent?.trim();
                return value !== undefined && value !== null && String(value) !== "" && text !== "-";
            });
            if (!hasResults) {
                return;
            }
            values.sort((a, b) => {
                function parseValue(val) {
                    if (val === null || val === undefined || val === "") return 0;
                    if (typeof val === "number") return val;

                    const match = String(val).match(/^(\d+)(?:\((\d+)\))?$/);
                    if (match) {
                        const base = parseInt(match[1], 10);
                        const extra = match[2] ? parseInt(match[2], 10) : 0;
                        return base + extra;
                    }
                    return 0;
                }

                const totalA = parseValue(a[0]);
                const totalB = parseValue(b[0]);

                return totalB - totalA;
            });
            let topThree = values.slice(0, 3);
            colCells[topThree[0][1]].classList.add("first");
            colCells[topThree[1][1]].classList.add("second");
            colCells[topThree[2][1]].classList.add("third");


        }
    })
}

function order_teams_table() {
    let datazone = document.querySelector(".teams-table-data")
    let rows = datazone.querySelectorAll(".teams-table-row")
    let ordered = Array.from(rows).sort((a, b) => parseInt(a.querySelector(".teams-table-position").innerText) - parseInt(b.querySelector(".teams-table-position").innerText))
    datazone.innerHTML = ""
    ordered.forEach(function (row, index) {
        let odd = index % 2 === 0
        if (odd) {
            row.classList.add("odd")
        }
        datazone.appendChild(row)
    })

}

export function new_load_drivers_table(data) {
    seasonResults = data
    let datazone = document.querySelector(".drivers-table-data")
    let pointsInfo = data[2]
    datazone.innerHTML = ""
    data = data[0]
    data = new_order_drivers(data)
    let driver1Poitns = 0, driver2Points = 0;
    const driverRows = [];
    data.forEach(function (driver, index) {
        let odd = index % 2 === 0
        let races_done = driver["races"].map(x => x.raceId)
        let result = new_addDriver(driver, races_done, odd)
        driverRows.push(result)
        const points = result.points
        if (index === 0) {
            driver1Poitns = points
        }
        else if (index === 1) {
            driver2Points = points
        }
    })

    const leaderPoints = driverRows[0]?.points ?? 0;
    updateStandingsPointsGaps(driverRows, leaderPoints);

    if (currentFormula === 1) {
        checkIfDriverIsChampion(data[0], driver1Poitns, driver2Points, pointsInfo, driverRows)
    }
    else {
        const firstDriverPos = document.querySelector(".drivers-table-data .drivers-table-position")
        const firstDriverPoints = document.querySelector(".drivers-table-data .drivers-table-points")
        if (firstDriverPos) firstDriverPos.classList.remove("champion")
        if (firstDriverPoints) firstDriverPoints.classList.remove("champion")
    }
    checkscroll()
    new_color_drivers_table()
    driverCells = document.querySelectorAll(".drivers-table-data .drivers-table-normal")
}

function checkIfDriverIsChampion(driver1, driver1Points, driver2Points, pointsInfo, driverRows = []) {
    if (driver1 !== undefined) {
        const lastRaceDone = driver1["races"][driver1["races"].length - 1]["raceId"];
        const lastRaceIndex = calendarData.findIndex(x => x[0] === lastRaceDone);
        racesLeftCount = calendarData.length - (lastRaceIndex + 1);
        sprintsLeft = calendarData.filter(x => x[2] === 1 && x[0] >= lastRaceDone).length

        const maxRacePoints = Number(pointsInfo?.twoBiggestPoints?.[0]?.[0] ?? pointsInfo?.twoBiggestPoints?.[0] ?? 0);
        const isDoublePoints = Number(pointsInfo?.isLastRaceDouble) === 1;
        const fastestLapBonus = Number(pointsInfo?.fastestLapBonusPoint) === 1;
        const poleBonus = Number(pointsInfo?.poleBonusPoint) === 1;

        const pointsDif = driver1Points - driver2Points
        let pointsRemaining = racesLeftCount * maxRacePoints + sprintsLeft * 8 +
            (isDoublePoints ? maxRacePoints : 0) +
            (fastestLapBonus ? racesLeftCount : 0) +
            (poleBonus ? racesLeftCount : 0)

        const firstDriverPos = document.querySelector(".drivers-table-data .drivers-table-position")
        const firstDriverPoints = document.querySelector(".drivers-table-data .drivers-table-points")
        const championClinched = pointsDif > pointsRemaining;
        if (championClinched) {
            firstDriverPos.classList.add("champion")
            firstDriverPoints.classList.add("champion")
        }
        else {
            firstDriverPos.classList.remove("champion")
            firstDriverPoints.classList.remove("champion")
        }

        driverRows.forEach((row) => {
            row?.row?.classList.remove("last-title-contender");
        });

        driverRows.forEach((row, index) => {
            if (!row?.pointsDiv) return;
            if (index === 0) {
                row.pointsDiv.classList.remove("eliminated");
                return;
            }
            const eliminated = (Number(row.points) + Number(pointsRemaining)) < Number(driver1Points);
            row.pointsDiv.classList.toggle("eliminated", eliminated);
        });

        if (!championClinched) {
            for (let i = driverRows.length - 1; i >= 0; i--) {
                const row = driverRows[i];
                if (!row?.row) continue;
                const hasChance = (Number(row.points) + Number(pointsRemaining)) >= Number(driver1Points);
                if (hasChance) {
                    row.row.classList.add("last-title-contender");
                    break;
                }
            }
        }
    }
}

function new_order_drivers(array) {
    return array.sort((a, b) => a["championshipPosition"] - b["championshipPosition"]);
}

export function update_logo(team, logo, newTeam) {
    if (team === "alpine") {
        alpineReplace = newTeam
        logos_disc[5] = logo
    }
    else if (team === "williams") {
        williamsReplace = newTeam
        logos_disc[6] = logo
    }
    else if (team === "haas") {
        haasReplace = newTeam || "haas"
        logos_disc[7] = logo
    }
    else if (team === "alphatauri") {
        alphaReplace = newTeam
        logos_disc[8] = logo
    }
    else if (team === "alfa") {
        alfaReplace = newTeam
        logos_disc[9] = logo
    }
    else if (team === "redbull") {
        redbullReplace = newTeam
        logos_disc[3] = logo
    }
    else if (team === "aston") {
        astonReplace = newTeam
        logos_disc[10] = logo
    }
}

export function reloadTables() {
    let datazone = document.querySelector(".drivers-table-data")
    //if not empty
    if (datazone.innerHTML !== "") {
        new_drivers_table(calendarData)
        new_load_drivers_table(seasonResults)
        new_teams_table(calendarData)
        new_load_teams_table(seasonResults)
    }
}

export function new_load_teams_table(data) {
    // Mantenemos el mismo "shape" de entrada:
    // data = [driversArray, pairTeamPos, pointsInfo]
    const pairTeamPos = data[data.length - 2];
    const pointsInfo = data[data.length - 1];

    // Mapa posEquipo -> posición (1..10)
    const pairTeamPosDict = {};
    pairTeamPos.forEach(function (pair) {
        pairTeamPosDict[pair[0]] = {
            pos: Number(pair[1]),
            lastPositionChange: Number(pair[2] ?? 0)
        };
    });

    // Ahora data[0] es el array de pilotos con formato-objeto
    const drivers = data[0];

    const datazone = document.querySelector(".teams-table-data");
    datazone.innerHTML = "";

    // Estructura: teamData[teamId] = Map<raceId, RaceObj[] de ese equipo en esa carrera>
    let teamIds = currentFormula === 1 ? f1_teams : (currentFormula === 2 ? f2_teams : f3_teams)
    const teamData = {};
    teamIds.forEach((id) => {
        teamData[id] = new Map();
    });

    if (currentFormula === 1 && game_version === 2024 && custom_team) {
        teamData[32] = new Map();
    }
    else{
        delete teamData[32];
        //remove 32 from teamIds
        teamIds = teamIds.filter(id => id !== 32);
    }

    // Construimos el map por equipo/carrera
    drivers.forEach(function (driver) {
        // driver.latestTeamId sigue existiendo, pero para cada carrera usamos race.teamId
        driver.races?.forEach(function (raceObj) {
            const team = raceObj.teamId;
            if (!teamData[team]) return;
            const bucket = teamData[team];
            const arr = bucket.get(raceObj.raceId) || [];
            arr.push(raceObj);
            bucket.set(raceObj.raceId, arr);
        });
    });

    // Normalizamos: aseguramos que cada equipo tenga entradas (vacías) para todas las carreras
    for (let team in teamData) {
        const bucket = teamData[team];
        races_ids.forEach(rid => {
            if (!bucket.has(rid)) bucket.set(rid, []); // aún no llegaron los 2 pilotos o no corrieron
        });
    }

    // Pintamos filas por equipo, usando tu orden/posiciones
    let team1Points = 0, team2Points = 0, firstTeamId = 0;
    const teamRows = [];
    teamIds.forEach((teamId) => {
        const teamInfo = pairTeamPosDict[teamId] || {};
        const pos = teamInfo.pos;
        const lastPositionChange = teamInfo.lastPositionChange;
        let teamName = combined_dict[teamId] //remove the final (F2) or (F3) that may exist
        if (teamName && (teamName.endsWith(" (F2)") || teamName.endsWith(" (F3)"))) {
            teamName = teamName.slice(0, -5)
        }
        const result = new_addTeam(teamData[teamId], teamName, pos, teamId, lastPositionChange);
        const points = result.points;
        teamRows.push({ teamId, pos, points, row: result.row, posDiv: result.posDiv, pointsDiv: result.pointsDiv, pointsGapDiv: result.pointsGapDiv });
        if (pos === 1) {
            team1Points = points;
            firstTeamId = teamId;
        } else if (pos === 2) {
            team2Points = points;
        }
    });

    const needsFallbackPositions = teamRows.some(team => !Number.isFinite(Number(team.pos)));
    const sortByPoints = currentFormula !== 1 || needsFallbackPositions;
    if (sortByPoints) {
        const sorted = [...teamRows].sort((a, b) => b.points - a.points);
        sorted.forEach((team, index) => {
            const position = index + 1;
            team.pos = position;
            if (team.posDiv) {
                team.posDiv.innerText = String(position);
                team.posDiv.dataset.position = String(position);
            }
        });
    }

    const leaderTeamPoints = teamRows.find(team => Number(team.pos) === 1)?.points ?? 0;
    updateStandingsPointsGaps(teamRows, leaderTeamPoints);

    new_color_teams_table();
    if (currentFormula === 1) {
        checkIfTeamIsChamp(team1Points, team2Points, pointsInfo, teamRows);
        manage_teams_table_logos();
        manage_teams_table_names();
    }
    else {
        const firstTeamPos = document.querySelector(".teams-table-data .teams-table-position")
        const firstTeamPoints = document.querySelector(".teams-table-data .teams-table-points")
        if (firstTeamPos) firstTeamPos.classList.remove("champion")
        if (firstTeamPoints) firstTeamPoints.classList.remove("champion")
    }
    order_teams_table();
    teamCells = document.querySelectorAll(".teams-table-data .teams-table-normal");
}

function checkIfTeamIsChamp(team1Points, team2Points, pointsInfo, teamRows = []) {
    const sortedTeams = [...teamRows]
        .filter(team => team && Number.isFinite(Number(team.pos)))
        .sort((a, b) => Number(a.pos) - Number(b.pos));

    const leaderTeam = sortedTeams.find(team => Number(team.pos) === 1) || sortedTeams[0];
    const runnerUpTeam = sortedTeams.find(team => Number(team.pos) === 2) || sortedTeams[1];

    const leaderPoints = Number(leaderTeam?.points ?? team1Points) || 0;
    const runnerUpPoints = Number(runnerUpTeam?.points ?? team2Points) || 0;

    const pointsDif = leaderPoints - runnerUpPoints

    const maxFirstPoints = Number(pointsInfo?.twoBiggestPoints?.[0]?.[0] ?? pointsInfo?.twoBiggestPoints?.[0] ?? 0);
    const maxSecondPoints = Number(pointsInfo?.twoBiggestPoints?.[1]?.[0] ?? pointsInfo?.twoBiggestPoints?.[1] ?? 0);
    const maxTeamRacePoints = maxFirstPoints + maxSecondPoints;
    const isDoublePoints = Number(pointsInfo?.isLastRaceDouble) === 1;
    const fastestLapBonus = Number(pointsInfo?.fastestLapBonusPoint) === 1;
    const poleBonus = Number(pointsInfo?.poleBonusPoint) === 1;

    let pointsRemaining = racesLeftCount * maxTeamRacePoints + sprintsLeft * 15 +
        (isDoublePoints ? maxTeamRacePoints : 0) +
        (fastestLapBonus ? racesLeftCount : 0) +
        (poleBonus ? racesLeftCount : 0)


    const firstTeamRow = document.querySelector(
    ".teams-table-position[data-position='1']"
    )?.closest(".teams-table-row");
    const firstTeamPos = firstTeamRow?.querySelector(".teams-table-position");
    const firstTeamPoints = firstTeamRow?.querySelector(".teams-table-points");

    const championClinched = pointsDif > pointsRemaining;
    if (championClinched) {
        firstTeamPos.classList.add("champion")
        firstTeamPoints.classList.add("champion")
    }
    else {
        firstTeamPos.classList.remove("champion")
        firstTeamPoints.classList.remove("champion")
    }

    teamRows.forEach((team) => {
        team?.row?.classList.remove("last-title-contender");
    });

    teamRows.forEach((team) => {
        if (!team?.pointsDiv) return;
        if (Number(team.pos) === 1) {
            team.pointsDiv.classList.remove("eliminated");
            return;
        }
        const eliminated = (Number(team.points) + Number(pointsRemaining)) < Number(leaderPoints);
        team.pointsDiv.classList.toggle("eliminated", eliminated);
    });

    if (!championClinched) {
        for (let i = sortedTeams.length - 1; i >= 0; i--) {
            const team = sortedTeams[i];
            if (!team?.row) continue;
            const hasChance = (Number(team.points) + Number(pointsRemaining)) >= Number(leaderPoints);
            if (hasChance) {
                team.row.classList.add("last-title-contender");
                break;
            }
        }
    }
}

function new_addTeam(teamRaceMap, name, pos, id, lastPositionChange = 0) {
    // teamRaceMap: Map<raceId, RaceObj[]>
    let data = document.querySelector(".teams-table-data");
    let row = document.createElement("div");
    row.classList = "teams-table-row";

    let nameDiv = document.createElement("div");
    let teamName = document.createElement("span");
    nameDiv.dataset.teamid = id;
    nameDiv.classList = "teams-table-team bold-font";
    teamName.innerText = name.toUpperCase();
    nameDiv.appendChild(teamName);
    if (currentFormula === 1) {
        let engineName = document.createElement("span");
        engineName.classList = "teams-table-engine-name bold-font";
        engineName.textContent = engine_names[engine_allocations[id]];
        nameDiv.appendChild(engineName);
    }
    row.appendChild(nameDiv);

    let posDiv = document.createElement("div");
    posDiv.classList = "teams-table-position bold-font";
    posDiv.dataset.position = pos;
    posDiv.innerText = pos;
    row.appendChild(posDiv);

    const posChangeDiv = document.createElement("div");
    posChangeDiv.className = "standings-pos-change";
    const posChangeNumber = document.createElement("span");
    posChangeNumber.className = "standings-pos-change-number";
    const posChangeIcon = document.createElement("i");
    posChangeDiv.appendChild(posChangeNumber);
    posChangeDiv.appendChild(posChangeIcon);
    setStandingsPositionChange(posChangeDiv, lastPositionChange);
    row.appendChild(posChangeDiv);

    let logoDiv = document.createElement("div");
    logoDiv.classList = "teams-table-logo";
    logoDiv.classList.add(team_dict[id] + "iconback");
    if (currentFormula === 1 && logos_disc[id]) {
        let logo = document.createElement("img");
        logo.classList = "teams-table-logo-inner";
        logo.dataset.teamid = id;
        logo.setAttribute("src", logos_disc[id]);
        logoDiv.appendChild(logo);
    }
    else {
        logoDiv.appendChild(buildTeamAbbrElement(id, "junior-team-logo-team"));
    }
    row.appendChild(logoDiv);
    row.appendChild(nameDiv);

    let teampoints = 0;

    const safePoints = (v) => {
        if (v === -1) return 0; // DNF → 0 puntos
        const n = parseInt(v);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    };

    const pickTopEntries = (pair) => {
        if (!pair || pair.length <= 2) {
            return [pair[0] || null, pair[1] || null];
        }

        const scoring = pair
            .map((entry, index) => ({
                entry,
                index,
                total: safePoints(entry?.points) + safePoints(entry?.qualifyingPoints) + safePoints(entry?.sprintPoints)
            }))
            .sort((a, b) => b.total - a.total || a.index - b.index);

        return [scoring[0]?.entry || null, scoring[1]?.entry || null];
    };

    const formatTeamPosValue = (entry, useSprint) => {
        if (!entry) return "-"
        const points = useSprint ? entry.sprintPoints : entry.points
        const pos = useSprint ? entry.sprintPos : entry.finishingPos
        if (points === -1 || pos === -1) return "DNF"
        if (pos === null || pos === undefined) return "-"
        return String(pos)
    };

    const formatTeamQualiValue = (entry, useSprint) => {
        if (!entry) return "-"
        if (useSprint) {
            return entry.sprintQualiPos !== undefined && entry.sprintQualiPos !== null
                ? String(entry.sprintQualiPos)
                : "-"
        }
        const quali = entry.qualifyingPos ?? 99
        return String(quali)
    };

    const buildTeamResultList = (entries, type, useSprint) => {
        if (!Array.isArray(entries) || entries.length === 0) return []
        if (type === "pos") {
            return entries.map((entry) => formatTeamPosValue(entry, useSprint))
        }
        if (type === "quali") {
            return entries.map((entry) => formatTeamQualiValue(entry, useSprint))
        }
        return []
    };

    // Iteramos las carreras en orden por races_ids (como antes)
    races_ids.forEach((raceId) => {
        const pair = (teamRaceMap && teamRaceMap.get(raceId)) || [];
        const isF1 = currentFormula === 1;

        if (isF1) {
            const raceDiv = document.createElement("div");
            raceDiv.classList = "teams-table-normal";

            if (pair.length > 0) {
                // Aseguramos 2 elementos (puede faltar uno) y priorizamos los que más puntúan
                const [d1, d2] = pickTopEntries(pair);

                const d1Points = d1 ? (safePoints(d1.points) + safePoints(d1.qualifyingPoints)) : 0;
                const d2Points = d2 ? (safePoints(d2.points) + safePoints(d2.qualifyingPoints)) : 0;
                const d1Pos = d1 ? (d1.points === -1 || d1.finishingPos === -1 ? "DNF" : d1.finishingPos) : "-";
                const d2Pos = d2 ? (d2.points === -1 || d2.finishingPos === -1 ? "DNF" : d2.finishingPos) : "-";

                // datasets base
                raceDiv.dataset.raceid = raceId;
                raceDiv.dataset.pointsCount = d1Points + d2Points;

                const s1pts = d1?.sprintPoints;
                const s2pts = d2?.sprintPoints;
                const s1pos = d1?.sprintPos;
                const s2pos = d2?.sprintPos;

                raceDiv.dataset.points = manage_dataset_info_team(
                    [d1Points, d2Points],
                    (typeof s1pts !== "undefined" || typeof s2pts !== "undefined") ? [s1pts ?? 0, s2pts ?? 0] : undefined,
                    "points"
                );

                raceDiv.dataset.pos = manage_dataset_info_team(
                    [d1Pos, d2Pos],
                    (s1pos == null || s2pos == null) ? undefined : [s1pos, s2pos],
                    "pos"
                );

                raceDiv.dataset.quali = manage_dataset_info_team(
                    [d1 ? d1.qualifyingPos ?? 99 : 99, d2 ? d2.qualifyingPos ?? 99 : 99],
                    undefined,
                    "quali"
                );

                raceDiv.dataset.quali1 = d1 ? d1.qualifyingPos ?? 99 : 99;
                raceDiv.dataset.quali2 = d2 ? d2.qualifyingPos ?? 99 : 99;

                raceDiv.dataset.fastlap1 = d1 && d1.fastestLap ? 1 : 0;
                raceDiv.dataset.fastlap2 = d2 && d2.fastestLap ? 1 : 0;

                // Suma de puntos de carrera
                teampoints += parseInt(raceDiv.dataset.pointsCount);

                // Sprint
                let d1SprintPoints = 0, d2SprintPoints = 0;
                let d1SprintPos = "-", d2SprintPos = "-";

                if (typeof s1pts !== "undefined") {
                    if (s1pts === -1) { d1SprintPoints = 0; d1SprintPos = "DNF"; }
                    else { d1SprintPoints = parseInt(s1pts) || 0; d1SprintPos = (typeof s1pos === "number" ? s1pos : (s1pos ?? "-")); }
                }
                if (typeof s2pts !== "undefined") {
                    if (s2pts === -1) { d2SprintPoints = 0; d2SprintPos = "DNF"; }
                    else { d2SprintPoints = parseInt(s2pts) || 0; d2SprintPos = (typeof s2pos === "number" ? s2pos : (s2pos ?? "-")); }
                }

                raceDiv.dataset.sprintpoints = d1SprintPoints + d2SprintPoints;
                raceDiv.dataset.sprintpos1 = d1SprintPos;
                raceDiv.dataset.sprintpos2 = d2SprintPos;

                teampoints += parseInt(raceDiv.dataset.sprintpoints);

                raceDiv.textContent = raceDiv.dataset[pointsOrPos];
            } else {
                raceDiv.innerText = "-";
            }

            row.appendChild(raceDiv);
        }
        else {
            const sprintDiv = document.createElement("div");
            const featureDiv = document.createElement("div");
            sprintDiv.classList = "teams-table-normal";
            featureDiv.classList = "teams-table-normal";
            sprintDiv.classList.add("sprint-result-cell");
            featureDiv.classList.add("feature-result-cell");
            sprintDiv.dataset.raceid = raceId;
            featureDiv.dataset.raceid = raceId;

            if (pair.length > 0) {
                const [d1, d2] = pickTopEntries(pair);
                const allEntries = pair;
                const wantsList = currentFormula === 3 && (pointsOrPos === "pos" || pointsOrPos === "quali");

                const sprintPoints = [d1?.sprintPoints ?? null, d2?.sprintPoints ?? null];
                const sprintPos = [d1?.sprintPos ?? null, d2?.sprintPos ?? null];
                const hasSprint = sprintPos.some(v => v !== null && v !== undefined);

                const sprintQuali = [d1?.sprintQualiPos ?? "-", d2?.sprintQualiPos ?? "-"];
                sprintDiv.dataset.quali = manage_dataset_info_team(
                    sprintQuali,
                    undefined,
                    "quali"
                );
                if (currentFormula === 3) {
                    const sprintPosList = hasSprint ? buildTeamResultList(allEntries, "pos", true) : [];
                    const sprintQualiList = buildTeamResultList(allEntries, "quali", true);
                    sprintDiv.dataset.poslist = JSON.stringify(sprintPosList);
                    sprintDiv.dataset.qualilist = JSON.stringify(sprintQualiList);
                    if (pointsOrPos === "pos") {
                        renderTeamCellList(sprintDiv, sprintPosList);
                    }
                    else if (pointsOrPos === "quali") {
                        renderTeamCellList(sprintDiv, sprintQualiList);
                    }
                }
                if (hasSprint) {
                    if (currentFormula === 3) {
                        const sprintPointsTotal = allEntries.reduce(
                            (sum, entry) => sum + safePoints(entry?.sprintPoints),
                            0
                        );
                        sprintDiv.dataset.points = sprintPointsTotal === 0 ? "" : String(sprintPointsTotal);
                    }
                    else {
                        sprintDiv.dataset.points = manage_dataset_info_team(
                            [sprintPoints[0] ?? 0, sprintPoints[1] ?? 0],
                            undefined,
                            "points"
                        );
                    }
                    sprintDiv.dataset.pos = manage_dataset_info_team(
                        [sprintPos[0] ?? "-", sprintPos[1] ?? "-"],
                        undefined,
                        "pos"
                    );
                    if (!wantsList) {
                        sprintDiv.textContent = sprintDiv.dataset[pointsOrPos];
                    }
                } else {
                    sprintDiv.textContent = "-";
                }

                const d1Points = d1 ? safePoints(d1.points) : 0;
                const d2Points = d2 ? safePoints(d2.points) : 0;
                const d1Pos = d1 ? (d1.points === -1 || d1.finishingPos === -1 ? "DNF" : d1.finishingPos) : "-";
                const d2Pos = d2 ? (d2.points === -1 || d2.finishingPos === -1 ? "DNF" : d2.finishingPos) : "-";

                const d1PointsTotal = (d1 ? d1.points : 0) + (d1?.qualifyingPoints ?? 0);
                const d2PointsTotal = (d2 ? d2.points : 0) + (d2?.qualifyingPoints ?? 0);
                if (currentFormula === 3) {
                    const featurePointsTotal = allEntries.reduce(
                        (sum, entry) =>
                            sum + safePoints(entry?.points) + safePoints(entry?.qualifyingPoints),
                        0
                    );
                    featureDiv.dataset.points = featurePointsTotal === 0 ? "" : String(featurePointsTotal);
                }
                else {
                    featureDiv.dataset.points = manage_dataset_info_team(
                        [d1PointsTotal, d2PointsTotal],
                        undefined,
                        "points"
                    );
                }
                featureDiv.dataset.pos = manage_dataset_info_team(
                    [d1Pos, d2Pos],
                    undefined,
                    "pos"
                );
                featureDiv.dataset.quali = manage_dataset_info_team(
                    [d1 ? d1.qualifyingPos ?? 99 : 99, d2 ? d2.qualifyingPos ?? 99 : 99],
                    undefined,
                    "quali"
                );
                if (currentFormula === 3) {
                    const featurePosList = buildTeamResultList(allEntries, "pos", false);
                    const featureQualiList = buildTeamResultList(allEntries, "quali", false);
                    featureDiv.dataset.poslist = JSON.stringify(featurePosList);
                    featureDiv.dataset.qualilist = JSON.stringify(featureQualiList);
                    if (pointsOrPos === "pos") {
                        renderTeamCellList(featureDiv, featurePosList);
                    }
                    else if (pointsOrPos === "quali") {
                        renderTeamCellList(featureDiv, featureQualiList);
                    }
                }
                if (!wantsList) {
                    featureDiv.textContent = featureDiv.dataset[pointsOrPos];   
                }

                const sprintTeamPoints = hasSprint
                    ? (currentFormula === 3
                        ? allEntries.reduce(
                            (sum, entry) => sum + safePoints(entry?.sprintPoints),
                            0
                        )
                        : (safePoints(sprintPoints[0]) + safePoints(sprintPoints[1])))
                    : 0;
                const featureTeamPoints = currentFormula === 3
                    ? allEntries.reduce(
                        (sum, entry) =>
                            sum + safePoints(entry?.points) + safePoints(entry?.qualifyingPoints),
                        0
                    )
                    : (d1Points + d2Points + safePoints(d1?.qualifyingPoints) + safePoints(d2?.qualifyingPoints));
                teampoints += featureTeamPoints + sprintTeamPoints;
            } else {
                sprintDiv.textContent = "-";
                featureDiv.textContent = "-";
            }

            row.appendChild(sprintDiv);
            row.appendChild(featureDiv);
        }
    });

    const pointsGapDiv = document.createElement("div");
    pointsGapDiv.className = "standings-points-gap";
    row.appendChild(pointsGapDiv);

    let pointsDiv = document.createElement("div");
    pointsDiv.classList = "teams-table-points bold-font";
    pointsDiv.innerText = (currentFormula === 3 && teampoints === 0) ? "" : teampoints;
    row.appendChild(pointsDiv);

    data.appendChild(row);
    return { points: teampoints, row, posDiv, pointsDiv, pointsGapDiv };
}



function buildF1DriverLogoElement(teamId) {
    let logo = document.createElement("img");
    logo.classList = "drivers-table-logo";
    logo.dataset.teamid = teamId;

    if (teamId === 1) logo.classList.add("logo-ferrari-table");
    if (teamId === 2) {
        logo = document.createElement("div");
        logo.classList = "drivers-table-logo logo-mclaren-table logo-reduce";
        logo.dataset.teamid = teamId;
    }
    if (teamId === 3) {
        logo.classList.add("logo-up-down-mid");
        if (redbullReplace !== "redbull") {
            logo.classList.add(driversTableLogosDict[redbullReplace]);
        }
    }
    if (teamId === 6) {
        if (williamsReplace === "williams") {
            logo = document.createElement("div");
            logo.classList.add("logo-williams-2026-table");
            logo.dataset.teamid = teamId;
        }
        else {
            logo = document.createElement("img");
            logo.classList = "drivers-table-logo logo-bmw-table";
            logo.dataset.teamid = teamId;
            logo.src = logos_disc[6];
        }
    }
    if (teamId === 7 && haasReplace === "toyota") {
        logo = document.createElement("div");
        logo.classList = "drivers-table-logo logo-toyota-table";
        logo.dataset.teamid = teamId;
    }
    if (teamId === 4) logo.classList.add("logo-merc-table");
    if (teamId === 7 && haasReplace !== "toyota") logo.classList.add("logo-merc-table");
    if (teamId === 5) {
        if (alpineReplace === "cadillac") {
            logo = document.createElement("img");
            logo.classList = "drivers-table-logo";
            logo.dataset.teamid = teamId;
        }
        else {
            logo = document.createElement("div");
            logo.dataset.teamid = teamId;
        }
        logo.classList.add(driversTableLogosDict[alpineReplace]);
    }
    if (teamId === 8) {
        if (["alphatauri", "visarb", "brawn", "hugo"].includes(alphaReplace)) {
            logo = document.createElement("div");
            logo.dataset.teamid = teamId;
        }
        else if (alphaReplace === "toyota") {
            logo = document.createElement("div");
            logo.classList = "drivers-table-logo";
            logo.dataset.teamid = teamId;
        }
        logo.classList.add(driversTableLogosDict[alphaReplace]);
    }
    if (teamId === 9) {
        if (alfaReplace === "sauber") {
            logo = document.createElement("div");
            logo.classList = "drivers-table-logo";
            logo.dataset.teamid = teamId;
        }
        logo.classList.add(driversTableLogosDict[alfaReplace]);
    }
    if (teamId === 10 || teamId === 32) {
        logo.classList.add("logo-up-down-little");
        if (teamId === 10 && astonReplace !== "aston") {
            logo.classList.add(driversTableLogosDict[astonReplace]);
        }
    }
    if (teamId === 32) logo.classList.add("custom-replace");

    if (logo.tagName === "IMG") logo.src = logos_disc[teamId];
    return logo;
}

function buildDriverLogoDiv(teamId, opts = {}) {
    const {
        isF1 = currentFormula === 1,
        wrapperClass = "drivers-table-logo-div",
        juniorSizeClass = "junior-team-logo-driver",
    } = opts;

    const logoDiv = document.createElement("div");
    logoDiv.className = wrapperClass;

    if (isF1) {
        const logo = buildF1DriverLogoElement(teamId);
        logoDiv.appendChild(logo);
    }
    else {
        logoDiv.appendChild(buildTeamAbbrElement(teamId, juniorSizeClass));
    }

    if (team_dict[teamId]) {
        logoDiv.classList.add(team_dict[teamId] + "hoverback");
    }

    return logoDiv;
}

function new_addDriver(driver, races_done, odd) {
    let data = document.querySelector(".drivers-table-data");
    let row = document.createElement("div");
    row.classList = "drivers-table-row";
    if (odd) row.classList.add("odd");
    const isF1 = currentFormula === 1;

    let nameDiv = document.createElement("div");
    nameDiv.classList = "drivers-table-driver";
    let name = driver["driverName"].split(" ");
    let nameContainer = document.createElement("div");
    nameContainer.className = "name-container";
    let spanName = document.createElement("span");
    let spanLastName = document.createElement("span");
    format_name(driver["driverName"], name, spanName, spanLastName);
    spanLastName.classList.add("bold-font");
    spanLastName.dataset.teamid = driver["latestTeamId"];
    row.dataset.teamid = driver["latestTeamId"];
    nameContainer.appendChild(spanName);
    nameContainer.appendChild(spanLastName);
    nameDiv.appendChild(nameContainer);

    let posDiv = document.createElement("div");
    posDiv.classList = "drivers-table-position bold-font";
    posDiv.innerText = driver["championshipPosition"];
    row.appendChild(posDiv);

    const posChangeDiv = document.createElement("div");
    posChangeDiv.className = "standings-pos-change";
    const posChangeNumber = document.createElement("span");
    posChangeNumber.className = "standings-pos-change-number";
    const posChangeIcon = document.createElement("i");
    posChangeDiv.appendChild(posChangeNumber);
    posChangeDiv.appendChild(posChangeIcon);
    setStandingsPositionChange(posChangeDiv, driver["lastPositionChange"]);
    row.appendChild(posChangeDiv);

    const logoDiv = buildDriverLogoDiv(driver["latestTeamId"], { isF1 });
    row.appendChild(logoDiv);
    row.appendChild(nameDiv);

    let driverpoints = 0;

    races_ids.forEach(function (raceid) {
        const race = driver.races?.find(r => r.raceId === raceid);

        if (isF1) {
            let raceDiv = document.createElement("div");
            raceDiv.classList = "drivers-table-normal";

            if (races_done.includes(raceid) && race) {
                const qualiPoints = parseInt(race.qualifyingPoints) || 0;
                const racePointsRaw = parseInt(race.points);
                const featurePoints = racePointsRaw === -1
                    ? -1
                    : (Number.isFinite(racePointsRaw) ? racePointsRaw : 0) + Math.max(0, qualiPoints);
                const hasSprintPoints = typeof race.sprintPoints !== "undefined" && race.sprintPoints !== null;
                const hasSprintPos = typeof race.sprintPos !== "undefined" && race.sprintPos !== null;

                raceDiv.dataset.pos = manage_dataset_info_driver(
                    race.finishingPos,
                    hasSprintPos ? race.sprintPos : undefined,
                    "pos"
                );
                raceDiv.dataset.points = manage_dataset_info_driver(     
                    featurePoints,
                    hasSprintPoints ? race.sprintPoints : undefined,     
                    "points"
                );
                raceDiv.dataset.fastlap = race.fastestLap ? 1 : 0; // normaliza a 0/1
                raceDiv.dataset.quali = manage_dataset_info_driver(
                    race.qualifyingPos === 99 ? race.startingPos : race.qualifyingPos,
                    undefined,
                    "quali"
                );
                raceDiv.dataset.gapToWinner = race.gapToWinner;
                raceDiv.dataset.gapToPole = race.gapToPole;
                raceDiv.dataset.dotd = race.driverOfTheDay //if its true or false

                // Sprint
                if (hasSprintPos) raceDiv.dataset.sprintpos = race.sprintPos;
                if (hasSprintPoints) {
                    raceDiv.dataset.sprintpoints = race.sprintPoints;
                    if (race.sprintPoints !== -1) {
                        driverpoints += Math.max(0, parseInt(race.sprintPoints) || 0);
                    }
                }

                // Puntos carrera (ignora -1)
                driverpoints += Math.max(0, parseInt(race.points) || 0);
                driverpoints += Math.max(0, parseInt(race.qualifyingPoints) || 0);

                raceDiv.textContent = raceDiv.dataset[pointsOrPos];      
            } else {
                raceDiv.innerText = "-";
            }
            row.appendChild(raceDiv);
        }
        else {
            const sprintDiv = document.createElement("div");
            const featureDiv = document.createElement("div");
            sprintDiv.classList = "drivers-table-normal";
            featureDiv.classList = "drivers-table-normal";
            sprintDiv.classList.add("sprint-result-cell");
            featureDiv.classList.add("feature-result-cell");

            if (races_done.includes(raceid) && race) {
                const hasSprintPos = typeof race.sprintPos !== "undefined" && race.sprintPos !== null;
                const hasSprintPoints = typeof race.sprintPoints !== "undefined" && race.sprintPoints !== null;

                sprintDiv.dataset.quali = formatDriverCellValue(race.sprintQualiPos, "quali");
                if (hasSprintPos) {
                    sprintDiv.dataset.points = formatDriverCellValue(race.sprintPoints, "points");
                    sprintDiv.dataset.pos = formatDriverCellValue(race.sprintPos, "pos");
                    sprintDiv.dataset.gapToWinner = "-";
                    sprintDiv.dataset.gapToPole = "-";
                    sprintDiv.textContent = sprintDiv.dataset[pointsOrPos];
                }
                else {
                    sprintDiv.textContent = "-";
                }

                featureDiv.dataset.pos = formatDriverCellValue(race.finishingPos, "pos");
                const qualiPoints = parseInt(race.qualifyingPoints) || 0;
                const featurePoints = (parseInt(race.points) || 0) + Math.max(0, qualiPoints);
                featureDiv.dataset.points = formatDriverCellValue(featurePoints, "points");
                featureDiv.dataset.fastlap = race.fastestLap ? 1 : 0;
                featureDiv.dataset.quali = formatDriverCellValue(
                    race.qualifyingPos === 99 ? race.startingPos : race.qualifyingPos,
                    "quali"
                );
                featureDiv.dataset.gapToWinner = race.gapToWinner ?? "-";
                featureDiv.dataset.gapToPole = race.gapToPole ?? "-";
                featureDiv.dataset.dotd = race.driverOfTheDay;
                featureDiv.textContent = featureDiv.dataset[pointsOrPos];       

                driverpoints += Math.max(0, parseInt(race.points) || 0);        
                driverpoints += Math.max(0, parseInt(race.qualifyingPoints) || 0);
                if (hasSprintPos && hasSprintPoints) {
                    driverpoints += Math.max(0, parseInt(race.sprintPoints) || 0);
                }
            } else {
                sprintDiv.textContent = "-";
                featureDiv.textContent = "-";
            }

            row.appendChild(sprintDiv);
            row.appendChild(featureDiv);
        }
    });

    const pointsGapDiv = document.createElement("div");
    pointsGapDiv.className = "standings-points-gap";
    row.appendChild(pointsGapDiv);

    let pointsDiv = document.createElement("div");
    pointsDiv.classList = "drivers-table-points bold-font";
    pointsDiv.innerText = driverpoints;
    row.appendChild(pointsDiv);

    data.appendChild(row);
    return { points: driverpoints, row, pointsDiv, pointsGapDiv };
}


function manage_dataset_info_driver(info, sprintInfo, type) {
    let race, sprint;
    if (type === "points") {
        if (parseInt(info) === 0) {
            race = ""
        }
        else if (parseInt(info) === -1) {
            race = "DNF"
        }
        else {
            race = info
        }

        if (sprintInfo === undefined) {
            sprint = ""
        }
        else if (parseInt(sprintInfo) === 0 || parseInt(sprintInfo) === -1) {
            sprint = ""
        }
        else {
            sprint = sprintInfo
        }
        let res = `${race}${(sprint !== "") ? "(" + sprint + ")" : ""}`
        return res

    }
    else if (type === "pos") {
        if (parseInt(info) === -1) {
            race = "DNF"
        }
        else {
            race = info;
        }

        if (sprintInfo === undefined || parseInt(sprintInfo) > 8 || parseInt(sprintInfo) === -1) {
            sprint = ""
        }
        else {
            sprint = sprintInfo
        }

        let res = `${race}${(sprint !== "") ? "(" + sprint + ")" : ""}`
        return res

    }
    else if (type === "quali") {
        race = info;
        return race;
    }
}

function manage_dataset_info_team(info, sprintInfo, type) {
    let race, sprint;
    if (type === "points") {
        let d1Points = (info[0] !== -1 ? info[0] : 0)
        let d2Points = (info[1] !== -1 ? info[1] : 0)
        let combinedRace = parseInt(d1Points) + parseInt(d2Points)
        let combinedSprint;
        if (sprintInfo !== undefined) {
            combinedSprint = parseInt(sprintInfo[0]) + parseInt(sprintInfo[1])
        }
        if (combinedRace === 0) {
            race = ""
        }
        else {
            race = combinedRace
        }
        if (sprintInfo === undefined || combinedSprint === 0) {
            sprint = ""
        }
        else if (combinedSprint !== 0) {
            sprint = combinedSprint
        }

        let res = `${race}${(sprint !== "") ? "(" + sprint + ")" : ""}`
        return res;
    }
    else if (type === "pos") {
        if (parseInt(info[0]) === -1) {
            info[0] = "DNF"
        }
        if (parseInt(info[1]) === -1) {
            info[1] = "DNF"
        }

        if (sprintInfo !== undefined) {
            if (parseInt(sprintInfo[0]) === -1 || parseInt(sprintInfo[0]) > 8) {
                sprintInfo[0] = ""
            }
            if (parseInt(sprintInfo[1]) === -1 || parseInt(sprintInfo[1]) > 8) {
                sprintInfo[1] = ""
            }
        }

        let res = `${info[0]}${(sprintInfo !== undefined && sprintInfo[0] !== "") ? "(" + sprintInfo[0] + ")" : ""}\n${info[1]}${(sprintInfo !== undefined && sprintInfo[1] !== "") ? "(" + sprintInfo[1] + ")" : ""}`
        return res;
    }
    else if (type === "quali") {
        let res = `${info[0]}\n${info[1]}`
        return res;
    }
}


function manageText(raceDiv) {
    if (raceDiv.innerText === "-") {
        return raceDiv
    }
    if (pointsOrPos === "points" || pointsOrPos === "pos") {
        let racePart = ""
        let sprintPart = ""
        if (raceDiv.dataset.points !== "-1") {
            if (pointsOrPos === "points") {
                racePart = raceDiv.dataset.points
            }
            else {
                racePart = raceDiv.dataset.pos
            }
        }
        else {
            racePart = "DNF"
        }
        if (raceDiv.dataset.points === "0" && pointsOrPos === "points") {
            racePart = ""
        }
        if (raceDiv.dataset.sprintpoints !== undefined) {
            if (raceDiv.dataset.sprintpoints !== "-1") {
                if (pointsOrPos === "points") {
                    sprintPart = raceDiv.dataset.sprintpoints
                }
                else {
                    sprintPart = raceDiv.dataset.sprintpos
                }
            }
            else {
                sprintPart = "DNF"
            }
        }
        if (raceDiv.dataset.sprintpoints === undefined || raceDiv.dataset.sprintpoints === "0") {
            raceDiv.innerText = racePart
        }
        else {
            raceDiv.innerText = racePart + "(" + sprintPart + ")"
        }
    }
    else if (pointsOrPos === "quali") {
        raceDiv.innerText = raceDiv.dataset.quali
    }
    else if (pointsOrPos === "gapWinner") {
        if (raceDiv.dataset.pos === "-1") {
            raceDiv.innerText = "DNF"
        }
        else {
            raceDiv.innerText = raceDiv.dataset.gapToWinner
        }
    }
    else if (pointsOrPos === "gapPole") {
        raceDiv.innerText = raceDiv.dataset.gapToPole
    }


    return raceDiv

}

function manageTeamsText(raceDiv) {
    if (raceDiv.innerText === "-") {
        return raceDiv
    }
    if (pointsOrPos === "points") {
        if (raceDiv.dataset.sprintpoints !== undefined) {
            let racePart = raceDiv.dataset.points
            let sprintPart = "(" + raceDiv.dataset.sprintpoints + ")"
            if (racePart === "0") {
                racePart = ""
            }
            if (sprintPart === "0") {
                sprintPart = ""
            }
            raceDiv.innerText = racePart + sprintPart
        }
        else {
            let racePart = raceDiv.dataset.points
            if (racePart === "0") {
                racePart = ""
            }
            raceDiv.innerText = racePart
        }
    }
    else if (pointsOrPos === "pos") {
        let d1Pos = "DNF"
        let d2Pos = "DNF"
        let d1SprPos = ""
        let d2SprPos = ""
        if (raceDiv.dataset.pos1 !== "DNF") {
            d1Pos = raceDiv.dataset.pos1
        }
        if (raceDiv.dataset.pos2 !== "DNF") {
            d2Pos = raceDiv.dataset.pos2
        }
        if (raceDiv.dataset.sprintpos1 !== undefined) {
            d1SprPos = raceDiv.dataset.sprintpos1
        }
        if (raceDiv.dataset.sprintpos2 !== undefined) {
            d2SprPos = raceDiv.dataset.sprintpos2
        }

        let text = d1Pos + "<br>" + d2Pos
        if (d1SprPos !== "" && d2SprPos !== "") {
            text = d1Pos + "(" + d1SprPos + ")" + "<br>" + d2Pos + "(" + d2SprPos + ")"
        }
        raceDiv.innerHTML = text
    }
    else if (pointsOrPos === "quali") {
        raceDiv.innerHTML = raceDiv.dataset.quali1 + "<br>" + raceDiv.dataset.quali2
    }
    else if (pointsOrPos === "gapWinner") {
        let d1, d2;
        if (raceDiv.dataset.pos1 === "DNF") {
            d1 = "DNF"
        }
        else {
            d1 = raceDiv.dataset.gapToWinner1
        }
        if (raceDiv.dataset.pos2 === "DNF") {
            d2 = "DNF"
        }
        else {
            d2 = raceDiv.dataset.gapToWinner2
        }

        raceDiv.innerHTML = d1 + "<br>" + d2
    }
    else if (pointsOrPos === "gapPole") {
        raceDiv.innerHTML = raceDiv.dataset.gapToPole1 + "<br>" + raceDiv.dataset.gapToPole2
    }
    return raceDiv
}






/**
 * Creates the year selector menu
 * @param {String} actualYear current year of the save
 */
export function generateYearsMenu(actualYear) {
    document.querySelector("#yearInput").min = actualYear;
    setCurrentSeason(actualYear);

    const yearMenu = document.querySelector("#yearMenu");
    const yearH2H = document.querySelector("#yearMenuH2H");
    yearMenu.innerHTML = "";
    yearH2H.innerHTML = "";

    // años (con data-year)
    for (let year = actualYear; year >= game_version; year--) {
        const a = document.createElement("a");
        a.textContent = String(year);
        a.className = "redesigned-dropdown-item";
        a.style.cursor = "pointer";
        a.dataset.year = String(year);                 // <- aquí
        yearMenu.appendChild(a);
        a.addEventListener("click", () => manageRecordsSelected(a));

        const a2 = document.createElement("a");
        a2.textContent = String(year);
        a2.className = "redesigned-dropdown-item";
        a2.style.cursor = "pointer";
        a2.dataset.year = String(year);
        yearH2H.appendChild(a2);
        a2.addEventListener("click", () => {
            resetH2H();
            document.querySelectorAll(".modal-team").forEach(el => el.classList.remove("d-none"));
            const yearBtnH2H = document.getElementById("yearButtonH2H");
            yearBtnH2H.querySelector("span.dropdown-label").textContent = a2.textContent;
            yearBtnH2H.dataset.year = a2.dataset.year;  // <- también lo guardo
            new Command("yearSelectedH2H", { year: a2.dataset.year }).execute();
        });
    }

    // All Time al principio (con data-year="all")
    const allTime = document.createElement("a");
    allTime.textContent = "All Time";
    allTime.className = "redesigned-dropdown-item";
    allTime.id = "allTimeRecords";
    allTime.dataset.year = "all";                   // <- clave
    yearMenu.insertBefore(allTime, yearMenu.firstChild);
    allTime.addEventListener("click", () => {
        setYearButton(allTime);
        const value = document.querySelector("#recordsTypeButton").dataset.value;
        new Command("recordSelected", { type: value, year: "all" }).execute();
    });

    document.getElementById("standingspill").click();
}



function manageRecordsSelected(forcedYearEl = null) {
    const yearMenu = document.querySelector("#yearMenu");
    const yearItems = Array.from(yearMenu.querySelectorAll("a"));
    const yearBtn = document.getElementById("yearButton");
    const typeVal = document.querySelector("#recordsTypeButton").dataset.value; 

    // resolve seleccionado actual
    let selectedEl = forcedYearEl
        || yearItems.find(i => i.dataset.year === yearBtn.dataset.year)
        || yearItems[0];

    const isAllTime = el => el.dataset.year === "all";

    // si es standings y estaba en All Time, forzar primer año real
    if ((typeVal === "standings" || typeVal === "seasonreview") && isAllTime(selectedEl)) {
        const firstReal = yearItems.find(i => !isAllTime(i));
        if (firstReal) selectedEl = firstReal;
    }

    // reflejar en el botón
    setYearButton(selectedEl);

    const selectedYear = selectedEl.dataset.year;
    const isCurrentYear = selectedYear === yearItems[1].dataset.year;

    console.log("Selected year:", selectedYear, "Type:", typeVal);

    if (typeVal === "standings") {
        isYearSelected = true
        manage_show_tables();
        new Command("yearSelected", { year: selectedYear, isCurrentYear, formula: currentFormula }).execute();
    }
    else if (typeVal === "seasonreview") {
        manageSeasonReview();
    }
    else {
        new Command("recordSelected", { type: typeVal, year: selectedYear }).execute();
        manageShowRecords();
    }
}

function manageSeasonReview(){
    const driversTable = document.querySelector(".drivers-table")
    const teamsTable = document.querySelector(".teams-table")
    driversTable.classList.add("d-none")
    teamsTable.classList.add("d-none")
    const recordsList = document.querySelector(".records-list")
    recordsList.classList.add("d-none")

    const seasonReviewBento = document.querySelector(".season-review-bento")    
    seasonReviewBento.classList.remove("d-none")

    const selectedYear = document.getElementById("yearButton")?.dataset?.year;
    if (selectedYear) {
        const yearMenu = document.querySelector("#yearMenu");
        const yearItems = yearMenu ? Array.from(yearMenu.querySelectorAll("a")) : [];
        const currentYear = yearItems[1]?.dataset?.year;
        const isCurrentYear = currentYear ? (selectedYear === currentYear) : true;
        new Command("seasonReviewSelected", { year: selectedYear, isCurrentYear, formula: currentFormula }).execute();
    }
}

export function populateSeasonReview(data) {
    populateDriversStandingsSeasonReview(data.driversStandings)
    populateTeamsStandingsSeasonReview(data.teamsStandings)
    populateComparisonsSeasonReview(data.teamMateHeadToHead, data.teamsStandings)
    populateQualifyingAnalysisSeasonReview(data.qualifyingStageCounts)
}

function populateComparisonsSeasonReview(comparisons, teamsStandings) {
    const raceComparisons = document.querySelector(".race-comparison");
    const qualiComparisons = document.querySelector(".quali-comparison");
    if (!raceComparisons || !qualiComparisons) return;

    raceComparisons.innerHTML = "";
    qualiComparisons.innerHTML = "";
    if (!Array.isArray(comparisons) || comparisons.length === 0) return;

    const parseHeadToHead = (value) => {
        if (typeof value === "string") {
            const parts = value.split("-").map(x => parseInt(x, 10));
            if (parts.length === 2 && parts.every(n => Number.isFinite(n))) {
                return parts;
            }
        }
        return [0, 0];
    };

    const getSurname = (name) => {
        const words = (name || "").trim().split(/\s+/).filter(Boolean);
        return words.length ? words[words.length - 1] : "";
    };

    const teamPositionById = new Map();
    if (Array.isArray(teamsStandings)) {
        teamsStandings.forEach((row) => {
            const teamId = Number(Array.isArray(row) ? row[0] : (row?.TeamID ?? row?.teamId));
            const pos = Number(Array.isArray(row) ? row[1] : (row?.Position ?? row?.position));
            if (Number.isFinite(teamId) && Number.isFinite(pos)) {
                teamPositionById.set(teamId, pos);
            }
        });
    }

    const ordered = [...comparisons].sort((a, b) => {
        const teamA = Number(a?.teamId ?? a?.TeamID ?? a?.teamID ?? -1);
        const teamB = Number(b?.teamId ?? b?.TeamID ?? b?.teamID ?? -1);
        const posA = teamPositionById.get(teamA) ?? 999;
        const posB = teamPositionById.get(teamB) ?? 999;
        return Number(posA) - Number(posB);
    });

    const buildRow = (item, score1, score2) => {
        const teamId = Number(item?.teamId ?? item?.TeamID ?? item?.teamID ?? -1);
        const driver1Name = news_insert_space(item?.driver1Name ?? item?.Driver1Name ?? "");
        const driver2Name = news_insert_space(item?.driver2Name ?? item?.Driver2Name ?? "");
        const driver1Surname = getSurname(driver1Name);
        const driver2Surname = getSurname(driver2Name);

        const row = document.createElement("div");
        row.className = "season-review-comparison-row";

        const name1Div = document.createElement("div");
        name1Div.className = "season-review-comparison-name left";
        const surname1Span = document.createElement("span");
        surname1Span.className = "bold-font";
        surname1Span.textContent = driver1Surname;
        name1Div.appendChild(surname1Span);
        row.appendChild(name1Div);

        const score1Div = document.createElement("div");
        score1Div.className = "season-review-comparison-score";
        score1Div.textContent = String(score1);
        row.appendChild(score1Div);

        if (Number.isFinite(teamId) && teamId !== -1) {
            const logoDiv = buildDriverLogoDiv(teamId, {
                isF1: true,
                wrapperClass: "drivers-table-logo-div season-review-team-logo-div"
            });
            row.appendChild(logoDiv);
        }

        const score2Div = document.createElement("div");
        score2Div.className = "season-review-comparison-score";
        score2Div.textContent = String(score2);
        row.appendChild(score2Div);

        const name2Div = document.createElement("div");
        name2Div.className = "season-review-comparison-name right";
        const surname2Span = document.createElement("span");
        surname2Span.className = "bold-font";
        surname2Span.textContent = driver2Surname;
        name2Div.appendChild(surname2Span);
        row.appendChild(name2Div);

        return row;
    };

    ordered.forEach((item) => {
        let race1 = Number(item?.raceAhead1);
        let race2 = Number(item?.raceAhead2);
        if (!Number.isFinite(race1) || !Number.isFinite(race2)) {
            [race1, race2] = parseHeadToHead(item?.raceHeadToHead);
        }

        let quali1 = Number(item?.qualiAhead1);
        let quali2 = Number(item?.qualiAhead2);
        if (!Number.isFinite(quali1) || !Number.isFinite(quali2)) {
            [quali1, quali2] = parseHeadToHead(item?.qualiHeadToHead);
        }

        raceComparisons.appendChild(buildRow(item, race1, race2));
        qualiComparisons.appendChild(buildRow(item, quali1, quali2));
    });
}

function populateDriversStandingsSeasonReview(data) {
    const isF1 = currentFormula === 1;
    const standings = document.querySelector(".bento-driver-standings");
    standings.innerHTML = "";

    data.forEach((driver, index) => {
        const driverDiv = document.createElement("div");
        driverDiv.className = "season-review-driver";

        const posDiv = document.createElement("div");
        posDiv.className = "season-review-driver-position";
        posDiv.textContent = driver.Position;
        driverDiv.appendChild(posDiv);

        const teamId = Number(driver.TeamID ?? driver.teamId ?? driver.teamID ?? driver.TeamId ?? -1);
        if (Number.isFinite(teamId) && teamId !== -1) {
            const logoDiv = buildDriverLogoDiv(teamId, {
                isF1,
                wrapperClass: "drivers-table-logo-div season-review-driver-logo-div"
            });
            driverDiv.appendChild(logoDiv);
        }

        const nameDiv = document.createElement("div");
        nameDiv.className = "season-review-driver-name";
        const fullName = news_insert_space(driver.DriverName);
        const surname = fullName.split(" ").pop();
        const nameSpan = document.createElement("span");
        nameSpan.textContent = fullName.replace(surname, "");
        const surnameSpan = document.createElement("span");
        surnameSpan.textContent = surname;
        surnameSpan.className = "bold-font";
        nameDiv.appendChild(nameSpan);
        nameDiv.appendChild(surnameSpan);
        driverDiv.appendChild(nameDiv);

        const pointsDiv = document.createElement("div");
        pointsDiv.className = "season-review-driver-points";
        pointsDiv.textContent = driver.Points;
        driverDiv.appendChild(pointsDiv);

        const position = Number(posDiv.textContent);
        if (position === 1) {
            posDiv.classList.add("champion");
            pointsDiv.classList.add("champion");
        }

        standings.appendChild(driverDiv);
    });
}

function populateTeamsStandingsSeasonReview(data) {
    if (!Array.isArray(data)) return;

    const container = document.querySelector(".bento-team-standings");
    if (!container) return;

    container.innerHTML = "";

    data.forEach((team, index) => {
        const teamObj = Array.isArray(team) ? {
            TeamID: team[0],
            Position: team[1],
            Points: team[2]
        } : team;

        const teamDiv = document.createElement("div");
        teamDiv.className = "season-review-team";

        const posDiv = document.createElement("div");
        posDiv.className = "season-review-team-position";
        posDiv.textContent = teamObj.Position ?? teamObj.position ?? "";
        teamDiv.appendChild(posDiv);

        const teamId = Number(teamObj.TeamID ?? teamObj.teamId ?? teamObj.teamID ?? teamObj.TeamId ?? -1);
        if (Number.isFinite(teamId) && teamId !== -1) {
            const logoDiv = buildDriverLogoDiv(teamId, {
                isF1: true,
                wrapperClass: "drivers-table-logo-div season-review-team-logo-div"
            });
            teamDiv.appendChild(logoDiv);
        }

        const nameDiv = document.createElement("div");
        nameDiv.className = "season-review-team-name";
        nameDiv.textContent = combined_dict[teamId] || "";
        teamDiv.appendChild(nameDiv);

        const pointsDiv = document.createElement("div");
        pointsDiv.className = "season-review-team-points";
        pointsDiv.textContent = teamObj.Points ?? teamObj.points ?? "";
        teamDiv.appendChild(pointsDiv);

        const position = Number(posDiv.textContent);
        if (position === 1) {
            posDiv.classList.add("champion");
            pointsDiv.classList.add("champion");
        }

        container.appendChild(teamDiv);
    });
}

function populateQualifyingAnalysisSeasonReview(data) {
    const polesContainer = document.querySelector(".poles-comparison");
    const q3Container = document.querySelector(".q3-comparison");
    const q2Container = document.querySelector(".q2-comparison");
    if (!polesContainer || !q3Container || !q2Container) return;

    polesContainer.innerHTML = "";
    q3Container.innerHTML = "";
    q2Container.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) return;

    const getSurname = (name) => {
        const words = (name || "").trim().split(/\s+/).filter(Boolean);
        return words.length ? words[words.length - 1] : "";
    };

    const buildRow = (entry, position, count) => {
        const teamId = Number(entry?.teamId ?? entry?.TeamID ?? entry?.teamID ?? -1);
        const fullName = news_insert_space(entry?.name ?? entry?.DriverName ?? "");
        const surname = getSurname(fullName);

        const row = document.createElement("div");
        row.className = "season-review-qualifying-row";

        const posDiv = document.createElement("div");
        posDiv.className = "season-review-qualifying-position";
        posDiv.textContent = String(position);
        row.appendChild(posDiv);

        if (Number.isFinite(teamId) && teamId !== -1) {
            const logoDiv = buildDriverLogoDiv(teamId, {
                isF1: true,
                wrapperClass: "drivers-table-logo-div season-review-driver-logo-div"
            });
            row.appendChild(logoDiv);
        }

        const nameDiv = document.createElement("div");
        nameDiv.className = "season-review-qualifying-name";
        const surnameSpan = document.createElement("span");
        surnameSpan.className = "bold-font";
        surnameSpan.textContent = surname;
        nameDiv.appendChild(surnameSpan);
        row.appendChild(nameDiv);

        const countDiv = document.createElement("div");
        countDiv.className = "season-review-qualifying-count";
        countDiv.textContent = String(count);
        row.appendChild(countDiv);

        return row;
    };

    const byKey = (key) => {
        return [...data].filter((d) => (Number(d?.[key]) || 0) > 0).sort((a, b) => {
            const av = Number(a?.[key]) || 0;
            const bv = Number(b?.[key]) || 0;
            if (bv !== av) return bv - av;
            return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
        });
    };

    const poles = byKey("poleCount");
    const q3s = byKey("q3Count");
    const q2s = byKey("q2Count");

    poles.forEach((d, idx) => polesContainer.appendChild(buildRow(d, idx + 1, Number(d?.poleCount) || 0)));
    q3s.forEach((d, idx) => q3Container.appendChild(buildRow(d, idx + 1, Number(d?.q3Count) || 0)));
    q2s.forEach((d, idx) => q2Container.appendChild(buildRow(d, idx + 1, Number(d?.q2Count) || 0)));

    updateQualifyingListsMaxHeight();
    ensureQualifyingListsHeightListener();
}

function updateQualifyingListsMaxHeight() {
    const item = document.querySelector(".bento-item.item-3");
    if (!item) return;

    const height = item.getBoundingClientRect().height;
    const maxHeight = Math.max(0, Math.floor(height - 60));

    document.querySelectorAll(".poles-comparison, .q3-comparison, .q2-comparison").forEach((el) => {
        el.style.maxHeight = `${maxHeight}px`;
        el.style.overflowX = "hidden";
        el.style.overflowY = "hidden";
        el.classList.remove("with-scrollbar");
        console.log("Checking scroll for", el, el.scrollHeight, el.clientHeight);
        const needsScroll = el.scrollHeight > (el.clientHeight + 2);
        if (needsScroll) {
            el.style.overflowY = "auto";
            el.classList.add("with-scrollbar");
        }
    });
}

function ensureQualifyingListsHeightListener() {
    if (qualifyingHeightListenerAttached) return;
    qualifyingHeightListenerAttached = true;

    let rafId = null;
    window.addEventListener("resize", () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            updateQualifyingListsMaxHeight();
        });
    });
}


function manageShowRecords() {
    const driversTable = document.querySelector(".drivers-table")
    const teamsTable = document.querySelector(".teams-table")
    driversTable.classList.add("d-none")
    teamsTable.classList.add("d-none")
    const seasonReviewBento = document.querySelector(".season-review-bento")
    seasonReviewBento.classList.add("d-none")

    const recordsList = document.querySelector(".records-list")
    recordsList.classList.remove("d-none")
    recordsList.innerHTML = ""
}

function setYearButton(el) {
    const yearBtn = document.getElementById("yearButton");
    yearBtn.querySelector("span.dropdown-label").textContent = el.textContent.trim();
    yearBtn.dataset.year = el.dataset.year;           // <- guardamos el valor
}

export function loadRecordsList(data) {
    const recordsList = document.querySelector(".records-list")
    recordsList.innerHTML = ""
    let visibleIndex = 0;
    const hideHistoric = document.querySelector(".hide-historic-drivers").classList.contains("active");

    data.forEach(function (record, index) {
        if (record.value <= 0) return;
        let recordDiv = document.createElement("div")
        recordDiv.classList = "record-item"

        if (record.teamId !== -1) {
            recordDiv.classList.add(`${team_dict[record.teamId]}-record`)
        }
        else {
            recordDiv.classList.add("generic-record")
        }

        const isHistoric = record.id === -1;
        if (isHistoric) recordDiv.classList.add("historic-driver");

        const shouldHide = isHistoric && hideHistoric;
        if (shouldHide) recordDiv.classList.add("d-none");

        const number = document.createElement("div");
        number.className = "record-number";
        if (!shouldHide) {
            number.textContent = `${++visibleIndex}.`;
        } else {
            number.textContent = "";
        }

        let recordName = document.createElement("div")
        recordName.classList = "record-name"
        let fullName = news_insert_space(record.name)
        let surname = fullName.split(" ").pop()
        let nameSpan = document.createElement("span")
        nameSpan.textContent = fullName.replace(surname, "")
        let surnameSpan = document.createElement("span")
        surnameSpan.textContent = surname
        surnameSpan.classList = "bold-font record-surname"

        recordName.appendChild(nameSpan)
        recordName.appendChild(surnameSpan)

        let numberAndName = document.createElement("div")
        numberAndName.classList = "number-and-name"

        let nameAndTeam = document.createElement("div")
        nameAndTeam.classList = "name-and-team"

        let teamDiv = document.createElement("div")
        teamDiv.classList = "record-team"
        teamDiv.textContent = record.teamId !== -1 ? combined_dict[record.teamId] : record.retired === 1 ? "Retired" : "N/A";

        nameAndTeam.appendChild(recordName)
        nameAndTeam.appendChild(teamDiv)

        numberAndName.appendChild(number)
        numberAndName.appendChild(nameAndTeam)

        let extraStatsSection = document.createElement("div")
        extraStatsSection.classList = "extra-stats-section"

        let totalStarts = document.createElement("div")
        totalStarts.classList = "extra-stat"
        totalStarts.textContent = `Races: ${record.totalStarts}`

        let percentageRate = document.createElement("div")
        percentageRate.classList = "extra-stat perecentage-rate"
        if (record.record === "wins" || record.record === "champs") {
            percentageRate.textContent = `Win Rate: ${(record.totalWins / record.totalStarts * 100).toFixed(2)}%`
        }
        else if (record.record === "podiums") {
            percentageRate.textContent = `Podium Rate: ${(record.totalPodiums / record.totalStarts * 100).toFixed(2)}%`
        }
        else if (record.record === "poles") {
            percentageRate.textContent = `Pole Rate: ${(record.totalPoles / record.totalStarts * 100).toFixed(2)}%`
        }
        else if (record.record === "fastestlaps") {
            percentageRate.textContent = `Fastest Lap Rate: ${(record.totalFastestLaps / record.totalStarts * 100).toFixed(2)}%`
        }
        if (record.record !== "races" && record.record !== "points") {
            extraStatsSection.appendChild(percentageRate)
        }

        let firstRace = document.createElement("div")
        firstRace.classList = "extra-stat"
        let trackName = record.firstRace.trackName ? record.firstRace.trackName : (record.firstRace.trackId ? names_full[races_names[record.firstRace.trackId]] : "")
        firstRace.textContent = `First Race: ${trackName} ${record.firstRace.season}`

        let firstPodium = document.createElement("div")
        firstPodium.classList = "extra-stat"
        let podiumTrackName = record.firstPodium.trackName ? record.firstPodium.trackName : (record.firstPodium.trackId ? names_full[races_names[record.firstPodium.trackId]] : "")
        firstPodium.textContent = `First Podium: ${podiumTrackName} ${record.firstPodium.season}`

        let firstWin = document.createElement("div")
        firstWin.classList = "extra-stat"
        let winTrackName = record.firstWin.trackName ? record.firstWin.trackName : (record.firstWin.trackId ? names_full[races_names[record.firstWin.trackId]] : "")
        firstWin.textContent = `First Win: ${winTrackName} ${record.firstWin.season}`

        let lastWin = document.createElement("div")
        lastWin.classList = "extra-stat"
        let lastWinTrackName = record.lastWin.trackName ? record.lastWin.trackName : (record.lastWin.trackId ? names_full[races_names[record.lastWin.trackId]] : "")
        lastWin.textContent = `Last Win: ${lastWinTrackName} ${record.lastWin.season}`

        let fastestLaps = document.createElement("div")
        fastestLaps.classList = "extra-stat"
        fastestLaps.textContent = `Fastest Laps: ${record.totalFastestLaps}`

        let sprintWins = document.createElement("div")
        sprintWins.classList = "extra-stat"
        sprintWins.textContent = `Sprint Wins: ${record.totalSprintWins}`

        let poles = document.createElement("div")
        poles.classList = "extra-stat"
        poles.textContent = `Poles: ${record.totalPoles}`

        let podiums = document.createElement("div")
        podiums.classList = "extra-stat"
        podiums.textContent = `Podiums: ${record.totalPodiums}`

        let points = document.createElement("div")
        points.classList = "extra-stat"
        points.textContent = `Points: ${record.totalPointsScored}`

        let wins = document.createElement("div")
        wins.classList = "extra-stat"
        wins.textContent = `Wins: ${record.totalWins}`

        let champs = document.createElement("div")
        champs.classList = "extra-stat"
        champs.textContent = `WDCs: ${record.totalChampionshipWins}`

        if (document.querySelector("#yearButton").dataset.year === "all" && record.record !== "races") {
            extraStatsSection.appendChild(totalStarts)
        }
        if (record.record !== "points") {
            extraStatsSection.appendChild(points)
        }

        if (record.firstRace.season !== 0) {
            extraStatsSection.appendChild(firstRace)
        }
        if (record.firstPodium.season !== 0) {
            extraStatsSection.appendChild(firstPodium)
        }
        if (record.firstWin.season !== 0) {
            extraStatsSection.appendChild(firstWin)
        }
        if (record.lastWin.season !== 0) {
            extraStatsSection.appendChild(lastWin)
        }

        if (record.record !== "fastestlaps" && record.totalFastestLaps > 0) {
            extraStatsSection.appendChild(fastestLaps)
        }

        if (record.totalSprintWins > 0) {
            extraStatsSection.appendChild(sprintWins)
        }

        if (record.record !== "wins" && record.totalWins > 0) {
            extraStatsSection.appendChild(wins)
        }
        if (record.record !== "podiums" && record.totalPodiums > 0) {
            extraStatsSection.appendChild(podiums)
        }
        if (record.record !== "poles" && record.totalPoles > 0) {
            extraStatsSection.appendChild(poles)
        }
        if (record.record !== "champs" && record.totalChampionshipWins > 0) {
            extraStatsSection.appendChild(champs)
        }

        let totalPoints = document.createElement("div")
        totalPoints.classList = "extra-stat"
        totalPoints.textContent = `Points: ${record.totalPointsScored}`

        numberAndName.appendChild(extraStatsSection)

        let recordValue = document.createElement("div")
        recordValue.classList = "record-value"
        recordValue.textContent = record.value


        recordDiv.appendChild(numberAndName)
        recordDiv.appendChild(recordValue)
        recordsList.appendChild(recordDiv)
    });
}

document.querySelectorAll("#recordsTypeDropdown a").forEach(function (elem) {   
    elem.addEventListener("click", function () {
        document.querySelector("#recordsTypeButton span").textContent = elem.textContent
        document.querySelector("#recordsTypeButton").dataset.value = elem.dataset.value
        if (elem.dataset.value === "standings") {
            const allTime = document.getElementById("allTimeRecords")
            if (allTime)
                allTime.classList.add("d-none")
            document.getElementById("standingsSettings").classList.remove("d-none")
            document.getElementById("recordsSettings").classList.add("d-none")  
        }
        else if (elem.dataset.value === "seasonreview") {
            const allTime = document.getElementById("allTimeRecords")
            if (allTime)
                allTime.classList.add("d-none")
            document.getElementById("standingsSettings").classList.add("d-none")
            document.getElementById("recordsSettings").classList.add("d-none")
        }
        else {
            const allTime = document.getElementById("allTimeRecords")
            if (allTime)
                allTime.classList.remove("d-none")
            document.getElementById("standingsSettings").classList.add("d-none")
            document.getElementById("recordsSettings").classList.remove("d-none")
        }

        manageRecordsSelected(null)
    })
})

document.querySelector(".hide-historic-drivers").addEventListener("click", function () {
    this.classList.toggle("active");
    this.querySelector("span").textContent = this.classList.contains("active") ? "Show Historic Drivers" : "Hide Historic Drivers"

    const recordsList = document.querySelectorAll(".record-item");

    // Ocultar/mostrar históricos
    recordsList.forEach(function (record) {
        if (record.classList.contains("historic-driver")) {
            record.classList.toggle("d-none");
        }
    });

    // Renumerar solo los visibles
    let visibleIndex = 1;
    recordsList.forEach(function (record) {
        if (!record.classList.contains("d-none")) {
            const numberEl = record.querySelector(".record-number");
            if (numberEl) {
                numberEl.textContent = `${visibleIndex}.`;
            }
            visibleIndex++;
        }
    });
});
