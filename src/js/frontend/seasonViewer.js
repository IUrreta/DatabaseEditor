import { races_names, names_full, team_dict, codes_dict, combined_dict, logos_disc, races_map, driversTableLogosDict, f1_teams } from "./config";
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
let alphaReplace = "alphatauri"
let alpineReplace = "alpine"
let alfaReplace = "alfa"
let driverOrTeams = "drivers"
let isYearSelected = false
let racesLeftCount = 0, sprintsLeft = 0;
export let engine_allocations;
let driverCells;
let teamCells;


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
        document.querySelector("#tableTypeButton").textContent = elem.textContent
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

function change_points_pos_teams() {
    teamCells.forEach(function (cell) {
        if (cell.dataset[pointsOrPos] !== undefined) {
            cell.innerText = cell.dataset[pointsOrPos]
        }
        else {
            cell.innerText = "-"
        }
    })

}

export function new_drivers_table(data) {
    calendarData = data
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
    header.appendChild(driverDiv)
    data.forEach(function (elem) {
        races_ids.push(elem[0])
        let headerPos = document.createElement("div")
        headerPos.className = "drivers-table-normal bold-font flag-header"
        let headerPosFlag = document.createElement("img")
        let race = races_map[elem[1]]
        let flag_src = codes_dict[race]
        headerPosFlag.src = flag_src
        let headerPosDiv = document.createElement("div")
        headerPosDiv.classList.add("text-in-front")
        headerPosDiv.classList.add("bold-font")
        headerPosDiv.innerText = races_names[elem[1]]
        headerPos.appendChild(headerPosFlag)
        headerPos.appendChild(headerPosDiv)
        header.appendChild(headerPos)
    })
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
    header.appendChild(driverDiv)
    data.forEach(function (elem) {
        races_ids.push(elem[0])
        let headerPos = document.createElement("div")
        headerPos.className = "teams-table-normal bold-font flag-header"
        let headerPosFlag = document.createElement("img")
        let race = races_map[elem[1]]
        let flag_src = codes_dict[race]
        headerPosFlag.src = flag_src
        let headerPosDiv = document.createElement("div")
        headerPosDiv.classList.add("text-in-front")
        headerPosDiv.classList.add("bold-font")
        headerPosDiv.innerText = races_names[elem[1]]
        headerPos.appendChild(headerPosFlag)
        headerPos.appendChild(headerPosDiv)
        header.appendChild(headerPos)
    })
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
            // logo.className = "teams-table-logo-inner mclaren-team-table-logo"
            logo.src = "../assets/images/mclaren2.png"
        }
        else if (logo.dataset.teamid === "3") {
            logo.className = "teams-table-logo-inner redbull-team-table-logo"
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
            else if (alpineReplace === "lotus") {
                logo.src = "../assets/images/lotus2.png"
            }
        }
        else if (logo.dataset.teamid === "6") {
            logo.className = "teams-table-logo-inner williams-team-table-logo"
            logo.src = "../assets/images/williams2.png"
        }
        else if (logo.dataset.teamid === "7") {
            logo.className = "teams-table-logo-inner haas-team-table-logo"
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
                logo.className = "teams-table-logo-inner toyota-team-table-logo"
                logo.src = "../assets/images/toyota2.png"
            }
            else if (alphaReplace === "porsche") {
                logo.className = "teams-table-logo-inner porsche-team-table-logo"
            }
            else if (alphaReplace === "brawn") {
                logo.className = "teams-table-logo-inner brawn-team-table-logo"
                logo.src = "../assets/images/brawn2.png"
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
                logo.src = "../assets/images/sauber2.png"
            }
        }
        else if (logo.dataset.teamid === "10") {
            logo.className = "teams-table-logo-inner aston-team-table-logo"
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
            values.sort((a, b) => {
                function parseValue(val) {
                    if (typeof val === "number") return val;

                    const match = val.match(/^(\d+)(?:\((\d+)\))?$/);
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
    data.forEach(function (driver, index) {
        let odd = index % 2 === 0
        let races_done = driver.slice(3).map(x => x[0])
        let points = new_addDriver(driver, races_done, odd)
        if (index === 0) {
            driver1Poitns = points
        }
        else if (index === 1) {
            driver2Points = points
        }
    })
    checkIfDriverIsChampion(data[0], driver1Poitns, driver2Points, pointsInfo)
    hoverListeners()
    checkscroll()
    new_color_drivers_table()
    driverCells = document.querySelectorAll(".drivers-table-data .drivers-table-normal")
}

function checkIfDriverIsChampion(driver1, driver1Points, driver2Points, pointsInfo) {
    if (driver1 !== undefined) {
        const lastRaceDone = driver1[driver1.length - 1][0]
        const lastRaceIndex = calendarData.findIndex(x => x[0] === lastRaceDone);
        racesLeftCount = calendarData.length - (lastRaceIndex + 1);
        sprintsLeft = calendarData.filter(x => x[2] === 1 && x[0] >= lastRaceDone).length

        const pointsDif = driver1Points - driver2Points
        let pointsRemaining = racesLeftCount * pointsInfo.twoBiggestPoints[0] + sprintsLeft * 8 +
            (pointsInfo.isLastRaceDouble ? pointsInfo.twoBiggestPoints[0] : 0) +
            (pointsInfo.fastestLapBonusPoint === 1 ? racesLeftCount : 0) +
            (pointsInfo.poleBonusPoint === 1 ? racesLeftCount : 0)

        const firstDriverPos = document.querySelector(".drivers-table-data .drivers-table-position")
        const firstDriverPoints = document.querySelector(".drivers-table-data .drivers-table-points")
        if (pointsDif > pointsRemaining) {
            firstDriverPos.classList.add("champion")
            firstDriverPoints.classList.add("champion")
        }
        else {
            firstDriverPos.classList.remove("champion")
            firstDriverPoints.classList.remove("champion")
        }
    }
}

function new_order_drivers(array) {
    return array.sort((a, b) => a[2] - b[2]);
}

export function update_logo(team, logo, newTeam) {
    if (team === "alpine") {
        alpineReplace = newTeam
        logos_disc[5] = logo
    }
    else if (team === "williams") {
        logos_disc[6] = logo
    }
    else if (team === "haas") {
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
    let pairTeamPos = data[data.length - 2]
    let pointsInfo = data[data.length - 1]
    //create dict with dirst element of pair as key and second as value
    let pairTeamPosDict = {}
    pairTeamPos.forEach(function (pair) {
        pairTeamPosDict[pair[0]] = pair[1]
    })
    data = data[0]
    let datazone = document.querySelector(".teams-table-data")
    datazone.innerHTML = ""
    let teamData = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] }
    if (game_version === 2024 && custom_team) {
        teamData[32] = []
    }
    data.forEach(function (driver) {
        let races = driver.slice(3)
        races.forEach(function (race) {
            let team = race[race.length - 1]
            teamData[team].push(race)
        })
    })
    for (let team in teamData) {
        //order the rray by the firit element of each elmeent
        teamData[team].sort((a, b) => a[0] - b[0])
        let seasonLong = races_ids.length * 2
        let racesDone = teamData.length
        //push [] until the length is the same as the
        while (teamData[team].length < seasonLong) {
            teamData[team].push([])
        }
    }
    let team1Points = 0, team2Points = 0, firstTeamId = 0;
    for (let team in combined_dict) {
        if (f1_teams.includes(parseInt(team))) {
            let pos = pairTeamPosDict[team]
            let points = new_addTeam(teamData[team], combined_dict[team], pos, team)
            if (pairTeamPosDict[team] === 1) {
                team1Points = points
                firstTeamId = team
            }
            else if (pairTeamPosDict[team] === 2) {
                team2Points = points
            }
        }
    }
    new_color_teams_table()
    order_teams_table()
    checkIfTeamIsChamp(team1Points, team2Points, pointsInfo)
    manage_teams_table_logos()
    manage_teams_table_names()
    teamCells = document.querySelectorAll(".teams-table-data .teams-table-normal")
}

function checkIfTeamIsChamp(team1Points, team2Points, pointsInfo) {
    const pointsDif = team1Points - team2Points
    let pointsRemaining = racesLeftCount * (parseInt(pointsInfo.twoBiggestPoints[0]) + parseInt(pointsInfo.twoBiggestPoints[1])) + sprintsLeft * 15 +
        (pointsInfo.isLastRaceDouble ? pointsInfo.twoBiggestPoints[0] : 0) +
        (pointsInfo.fastestLapBonusPoint === 1 ? racesLeftCount : 0) +
        (pointsInfo.poleBonusPoint === 1 ? racesLeftCount : 0)


    const firstTeamPos = document.querySelector(".teams-table-data .teams-table-position")
    const firstTeamPoints = document.querySelector(".teams-table-data .teams-table-points")

    if (pointsDif > pointsRemaining) {
        firstTeamPos.classList.add("champion")
        firstTeamPoints.classList.add("champion")
    }
    else {
        firstTeamPos.classList.remove("champion")
        firstTeamPoints.classList.remove("champion")
    }
}

function new_addTeam(teamData, name, pos, id) {
    let data = document.querySelector(".teams-table-data")
    let row = document.createElement("div")
    row.classList = "teams-table-row"
    let nameDiv = document.createElement("div");
    let teamName = document.createElement("span")
    let engineName = document.createElement("span")
    engineName.classList = "teams-table-engine-name bold-font"
    engineName.textContent = engine_names[engine_allocations[id]]
    nameDiv.dataset.teamid = id
    nameDiv.classList = "teams-table-team bold-font"
    teamName.innerText = name.toUpperCase()
    nameDiv.appendChild(teamName)
    nameDiv.appendChild(engineName)
    row.appendChild(nameDiv)
    let posDiv = document.createElement("div")
    posDiv.classList = "teams-table-position bold-font"
    posDiv.innerText = pos
    row.appendChild(posDiv)
    let logoDiv = document.createElement("div")
    logoDiv.classList = "teams-table-logo"
    let logo = document.createElement("img")
    logo.classList = "teams-table-logo-inner"
    logo.dataset.teamid = id
    logoDiv.classList.add(team_dict[id] + "iconback")
    logo.setAttribute("src", logos_disc[id])
    logoDiv.appendChild(logo)
    row.appendChild(logoDiv)
    row.appendChild(nameDiv)
    let driverCounted = 0
    let teampoints = 0
    //only take pair indexes
    if (teamData !== undefined) {
        teamData.forEach(function (race, index) {
            if (index % 2 === 0) {
                let raceDiv = document.createElement("div")
                raceDiv.classList = "teams-table-normal"
                if (race.length > 0) {
                    let driver1 = teamData[index]
                    let driver2 = teamData[index + 1]
                    raceDiv.dataset.raceid = driver1[0]
                    let driver1Points = 0
                    let driver2Points = 0
                    let driver1Pos = 0
                    let driver2Pos = 0
                    if (driver1[2] === -1) {
                        driver1Points = 0
                        driver1Pos = "DNF"
                    }
                    else {
                        driver1Points = driver1[2]
                        driver1Pos = driver1[1]
                    }
                    if (driver2[2] === -1) {
                        driver2Points = 0
                        driver2Pos = "DNF"
                    }
                    else {
                        driver2Points = driver2[2]
                        driver2Pos = driver2[1]
                    }
                    raceDiv.dataset.pointsCount = parseInt(driver1Points) + parseInt(driver2Points)
                    raceDiv.dataset.points = manage_dataset_info_team([driver1[2], driver2[2]], (race.length > 8 ? [driver1[7], driver2[7]] : undefined), "points")
                    raceDiv.dataset.pos = manage_dataset_info_team([driver1[1], driver2[1]], (race.length > 8 ? [driver1[8], driver2[8]] : undefined), "pos")
                    raceDiv.dataset.quali = manage_dataset_info_team([driver1[4], driver2[4]], undefined, "quali")
                    raceDiv.dataset.quali1 = driver1[4]
                    raceDiv.dataset.quali2 = driver2[4]
                    raceDiv.dataset.fastlap1 = driver1[3]
                    raceDiv.dataset.fastlap2 = driver2[3]
                    teampoints += parseInt(raceDiv.dataset.pointsCount)
                    if (race.length > 8) {
                        let d1SprintPoints = 0
                        let d2SprintPoints = 0
                        let d1SprintPos = 0
                        let d2SprintPos = 0
                        if (driver1[5] === -1) {
                            d1SprintPoints = 0
                            d1SprintPos = "DNF"
                        }
                        else {
                            d1SprintPoints = driver1[7]
                            d1SprintPos = driver1[8]
                        }
                        if (driver2[5] === -1) {
                            d2SprintPoints = 0
                            d2SprintPos = "DNF"
                        }
                        else {
                            d2SprintPoints = driver2[7]
                            d2SprintPos = driver2[8]
                        }
                        raceDiv.dataset.sprintpoints = parseInt(d1SprintPoints) + parseInt(d2SprintPoints)
                        raceDiv.dataset.sprintpos1 = d1SprintPos
                        teampoints += parseInt(raceDiv.dataset.sprintpoints)
                        raceDiv.dataset.sprintpos2 = d2SprintPos

                    }
                }
                else {
                    raceDiv.innerText = "-"
                }
                raceDiv.textContent = raceDiv.dataset[pointsOrPos]
                row.appendChild(raceDiv)
            }

        })
    }
    let pointsDiv = document.createElement("div")
    pointsDiv.classList = "teams-table-points bold-font"
    pointsDiv.innerText = teampoints
    row.appendChild(pointsDiv)
    data.appendChild(row)

    return teampoints
}


function new_addDriver(driver, races_done, odd) {
    let data = document.querySelector(".drivers-table-data")
    let row = document.createElement("div")
    row.classList = "drivers-table-row"
    if (odd) {
        row.classList.add("odd")
    }
    let nameDiv = document.createElement("div");
    nameDiv.classList = "drivers-table-driver"
    let name = driver[0].split(" ")
    let nameContainer = document.createElement("div")
    nameContainer.className = "name-container"
    let spanName = document.createElement("span")
    let spanLastName = document.createElement("span")
    format_name(driver[0], name, spanName, spanLastName)
    spanLastName.classList.add("bold-font")
    spanLastName.dataset.teamid = driver[1]
    row.dataset.teamid = driver[1]
    nameContainer.appendChild(spanName)
    nameContainer.appendChild(spanLastName)
    nameDiv.appendChild(nameContainer)
    // manageColor(spanLastName, spanLastName)
    let posDiv = document.createElement("div")
    posDiv.classList = "drivers-table-position bold-font"
    posDiv.innerText = driver[2]
    row.appendChild(posDiv)
    let logoDiv = document.createElement("div")
    logoDiv.classList = "drivers-table-logo-div"
    let logo = document.createElement("img")
    logo.classList = "drivers-table-logo"
    logo.dataset.teamid = driver[1]
    if (driver[1] === 1) { //ferrari
        logo.classList.add("logo-ferrari-table")
    }
    if (driver[1] === 2) { //mclaren
        logo.classList.add("logo-reduce")
    }
    if (driver[1] === 3) { //redbull
        logo.classList.add("logo-up-down-mid")
    }
    if (driver[1] === 6) {
        logo.classList.add("logo-williams-table")
    }
    if (driver[1] === 4 || driver[1] === 7) { //mercedes  haas
        logo.classList.add("logo-merc-table")
    }
    if (driver[1] === 5) { //alpine
        logo = document.createElement("div")
        logo.classList.add(driversTableLogosDict[alpineReplace])
    }
    if (driver[1] === 8) { //alphatauri
        if (alphaReplace === "alphatauri" || alphaReplace === "visarb" || alphaReplace === "brawn" || alphaReplace === "hugo") {
            logo = document.createElement("div")
        }
        logo.classList.add(driversTableLogosDict[alphaReplace])
    }
    if (driver[1] === 9) { //alfa
        logo.classList.add(driversTableLogosDict[alfaReplace])
    }
    if (driver[1] === 10 || driver[1] === 32) {
        logo.classList.add("logo-up-down-little")
    }
    if (driver[1] === 32) {
        logo.classList.add("custom-replace")
    }
    logoDiv.classList.add(team_dict[driver[1]] + "hoverback")
    //check if logo is a div or an img
    if (logo.tagName === "IMG") {
        logo.src = logos_disc[driver[1]]
    }
    logoDiv.appendChild(logo)
    row.appendChild(logoDiv)
    row.appendChild(nameDiv)
    let driverpoints = 0
    races_ids.forEach(function (raceid) {
        let raceDiv = document.createElement("div")
        raceDiv.classList = "drivers-table-normal"
        if (races_done.includes(raceid)) {
            let index = races_done.indexOf(raceid)
            let race = driver[index + 3]
            raceDiv.dataset.pos = manage_dataset_info_driver(race[1], (race.length > 8 ? race[8] : undefined), "pos")
            raceDiv.dataset.points = manage_dataset_info_driver(race[2], (race.length > 8 ? race[7] : undefined), "points")
            raceDiv.dataset.fastlap = race[3]
            raceDiv.dataset.quali = manage_dataset_info_driver(race[4], undefined, "quali")
            raceDiv.dataset.gapToWinner = race[5]
            raceDiv.dataset.gapToPole = race[6]
            if (race.length > 8) { //sprint 
                raceDiv.dataset.sprintpos = race[8]
                raceDiv.dataset.sprintpoints = race[7]
                if (raceDiv.dataset.sprintpoints !== "-1") {
                    driverpoints += parseInt(raceDiv.dataset.sprintpoints)
                }
            }
            driverpoints += (parseInt(race[2]) >= 0 ? parseInt(race[2]) : 0)
            raceDiv.textContent = raceDiv.dataset[pointsOrPos]
            row.appendChild(raceDiv)
        }
        else {
            raceDiv.innerText = "-"
            row.appendChild(raceDiv)
        }
    })
    let pointsDiv = document.createElement("div")
    pointsDiv.classList = "drivers-table-points bold-font"
    pointsDiv.innerText = driverpoints
    row.appendChild(pointsDiv)
    row.addEventListener("hover", function (elem) {
        if (elem.dataset.teamid === 2) {
            let logo = this.querySelector(".drivers-table-logo")
            logo.style.opacity = "0"
            let logo2 = this.querySelector(".drivers-table-logo").nextElementSibling
            logo2.style.opacity = "1"
        }
    })
    data.appendChild(row)

    return driverpoints;
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

function hoverListeners() {
    document.querySelectorAll(".drivers-table-row").forEach(function (row) {
        row.addEventListener("mouseenter", function () {
            if (this.dataset.teamid === "2" || this.dataset.teamid === "6" || (this.dataset.teamid === "5" && alpineReplace !== "alpine")
                || (this.dataset.teamid === "9" && alfaReplace === "sauber") || (this.dataset.teamid === "8" && (alphaReplace === "brawn" || alphaReplace === "hugo" || alphaReplace === "toyota"))) {

                let logo = this.querySelector(".drivers-table-logo");
                let new_src = logos_disc[this.dataset.teamid].slice(0, -4) + "2" + logo.src.slice(-4);
                logo.src = new_src
            }
        });
        row.addEventListener("mouseleave", function () {
            if (this.dataset.teamid === "2" || this.dataset.teamid === "6" || (this.dataset.teamid === "5" && alpineReplace !== "alpine")
                || (this.dataset.teamid === "9" && alfaReplace === "sauber") || (this.dataset.teamid === "8" && (alphaReplace === "brawn" || alphaReplace === "hugo" || alphaReplace === "toyota"))) {
                let logo = this.querySelector(".drivers-table-logo");
                let new_src = logos_disc[this.dataset.teamid].slice(0, -4) + logo.src.slice(-4);
                logo.src = new_src
            }
        });
    });
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
        a.className = "dropdown-item";
        a.style.cursor = "pointer";
        a.dataset.year = String(year);                 // <- aquí
        yearMenu.appendChild(a);
        a.addEventListener("click", () => manageRecordsSelected(a));

        const a2 = document.createElement("a");
        a2.textContent = String(year);
        a2.className = "dropdown-item";
        a2.style.cursor = "pointer";
        a2.dataset.year = String(year);
        yearH2H.appendChild(a2);
        a2.addEventListener("click", () => {
            resetH2H();
            document.querySelectorAll(".modal-team").forEach(el => el.classList.remove("d-none"));
            const yearBtnH2H = document.getElementById("yearButtonH2H");
            yearBtnH2H.textContent = a2.textContent;
            yearBtnH2H.dataset.year = a2.dataset.year;  // <- también lo guardo
            new Command("yearSelectedH2H", { year: a2.dataset.year }).execute();
        });
    }

    // All Time al principio (con data-year="all")
    const allTime = document.createElement("a");
    allTime.textContent = "All Time";
    allTime.className = "dropdown-item";
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
    if (typeVal === "standings" && isAllTime(selectedEl)) {
        const firstReal = yearItems.find(i => !isAllTime(i));
        if (firstReal) selectedEl = firstReal;
    }

    // reflejar en el botón
    setYearButton(selectedEl);

    const selectedYear = selectedEl.dataset.year;
    const isCurrentYear = selectedYear === yearItems[1].dataset.year;

    if (typeVal === "standings") {
        isYearSelected = true
        manage_show_tables();
        new Command("yearSelected", { year: selectedYear, isCurrentYear }).execute();
    } else {
        new Command("recordSelected", { type: typeVal, year: selectedYear }).execute();
        manageShowRecords();
    }
}

function manageShowRecords() {
    const driversTable = document.querySelector(".drivers-table")
    const teamsTable = document.querySelector(".teams-table")
    driversTable.classList.add("d-none")
    teamsTable.classList.add("d-none")

    const recordsList = document.querySelector(".records-list")
    recordsList.classList.remove("d-none")
    recordsList.innerHTML = ""
}

function setYearButton(el) {
    const yearBtn = document.getElementById("yearButton");
    yearBtn.textContent = el.textContent.trim();
    yearBtn.dataset.year = el.dataset.year;           // <- guardamos el valor
}

export function loadRecordsList(data) {
    const recordsList = document.querySelector(".records-list")
    recordsList.innerHTML = ""
    let visibleIndex = 0;
    const hideHistoric = document.querySelector(".hide-historic-drivers").classList.contains("active");

    data.forEach(function (record, index) {
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
        recordName.textContent = news_insert_space(record.name)

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
        percentageRate.classList = "extra-stat"
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
        extraStatsSection.appendChild(percentageRate)

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


        let wins = document.createElement("div")
        wins.classList = "extra-stat"
        wins.textContent = `Wins: ${record.totalWins}`

        let champs = document.createElement("div")
        champs.classList = "extra-stat"
        champs.textContent = `WDCs: ${record.totalChampionshipWins}`

        if (document.querySelector("#yearButton").dataset.year === "all") {
            extraStatsSection.appendChild(totalStarts)
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
        document.querySelector("#recordsTypeButton").textContent = elem.textContent
        document.querySelector("#recordsTypeButton").dataset.value = elem.dataset.value
        if (elem.dataset.value === "standings") {
            const allTime = document.getElementById("allTimeRecords")
            if (allTime)
                allTime.classList.add("d-none")
            document.getElementById("standingsSettings").classList.remove("d-none")
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