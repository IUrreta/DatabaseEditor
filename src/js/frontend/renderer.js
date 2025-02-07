import { marked } from 'marked';

import { resetTeamEditing, fillLevels, longTermObj, originalCostCap, gather_team_data, gather_pit_crew, teamCod } from './teams';
import {
    resetViewer, generateYearsMenu, resetYearButtons, update_logo, setEngineAllocations, engine_names, new_drivers_table, new_teams_table,
    new_load_drivers_table, new_load_teams_table, addEngineName, deleteEngineName
} from './seasonViewer';
import { combined_dict, abreviations_dict, codes_dict, logos_disc, mentality_to_global_menatality, difficultyConfig, default_dict } from './config';
import {
    freeDriversDiv, insert_space, loadNumbers, place_staff, remove_drivers, add_marquees_transfers, place_drivers, sortList, update_name,
    manage_modal
} from './transfers';
import { load_calendar } from './calendar';
import {
    load_performance, load_performance_graph, load_attributes, manage_engineStats, load_cars, load_custom_engines,
    order_by, load_car_attributes, viewingGraph, engine_allocations, load_parts_stats, load_parts_list, update_max_design, teamsEngine, load_one_part,
    teamSelected
} from './performance';
import { resetPredict, setMidGrid, setMaxRaces, setRelativeGrid, placeRaces, placeRacesInModal } from './predictions';
import {
    removeStatsDrivers, place_drivers_editStats, place_staff_editStats, typeOverall, setStatPanelShown, setTypeOverall,
    typeEdit, setTypeEdit, change_elegibles, getName, calculateOverall, listenersStaffGroups
} from './stats';
import { resetH2H, hideComp, colors_dict, load_drivers_h2h, sprintsListeners, racePaceListener, qualiPaceListener, manage_h2h_bars, load_labels_initialize_graphs } from './head2head';
import { CommandFactory } from '../backend/commandFactory';
import { repack } from '../backend/UESaveHandler';
import { getDatabase, getMetadata } from '../backend/dbManager';


const names_configs = {
    "visarb": "VISA CASHAPP RB", "toyota": "TOYOTA", "hugo": "HUGO BOSS", "alphatauri": "ALPHA TAURI", "brawn": "BRAWN GP", "porsche": "PORSCHE",
    "alpine": "ALPINE", "renault": "RENAULT", "andretti": "ANDRETTI", "lotus": "LOTUS", "alfa": "ALFA ROMEO",
    "audi": "AUDI", "sauber": "SAUBER", "stake": "STAKE SAUBER"
}
const pretty_names = {
    "visarb": "Visa Cashapp RB", "toyota": "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
    "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "alfa": "Alfa Romeo",
    "audi": "Audi", "sauber": "Sauber", "stake": "Stake Sauber"
}
const abreviations_for_replacements = {
    "visarb": "VCARB", "toyota": "TOY", "hugo": "HUGO", "alphatauri": "AT", "brawn": "BGP", "porsche": "POR",
    "alpine": "ALP", "renault": "REN", "andretti": "AND", "lotus": "LOT", "alfa": "ALFA", "audi": "AUDI", "sauber": "SAU", "stake": "STK"
}
const logos_configs = {
    "visarb": "../assets/images/visarb.png", "toyota": "../assets/images/toyota.png", "hugo": "../assets/images/hugoboss.png", "alphatauri": "../assets/images/alphatauri.png",
    "brawn": "../assets/images/brawn.png", "porsche": "../assets/images/porsche.png",
    "alpine": "../assets/images/alpine.png", "renault": "../assets/images/renault.png", "andretti": "../assets/images/andretti.png", "lotus": "../assets/images/lotus.png",
    "alfa": "../assets/images/alfaromeo.png", "audi": "../assets/images/audi.png", "sauber": "../assets/images/sauber.png", "stake": "../assets/images/kick.png"
}
const logos_classes_configs = {
    "visarb": "visarblogo", "toyota": "toyotalogo", "hugo": "hugologo", "alphatauri": "alphataurilogo",
    "porsche": "porschelogo", "brawn": "brawnlogo",
    "alpine": "alpinelogo", "renault": "ferrarilogo", "andretti": "andrettilogo", "lotus": "lotuslogo",
    "alfa": "alfalogo", "audi": "audilogo", "sauber": "sauberlogo", "stake": "alfalogo"
}

const driverTransferPill = document.getElementById("transferpill");
const editStatsPill = document.getElementById("statspill");
const CalendarPill = document.getElementById("calendarpill");
const carPill = document.getElementById("carpill");
const viewPill = document.getElementById("viewerpill");
const h2hPill = document.getElementById("h2hpill");
const constructorsPill = document.getElementById("constructorspill")
const predictPill = document.getElementById("predictpill")

const editorPill = document.getElementById("editorPill")
const gamePill = document.getElementById("gamePill")

const driverTransferDiv = document.getElementById("driver_transfers");
const editStatsDiv = document.getElementById("edit_stats");
const customCalendarDiv = document.getElementById("custom_calendar");
const carPerformanceDiv = document.getElementById("car_performance");
const viewDiv = document.getElementById("season_viewer");
const h2hDiv = document.getElementById("head2head_viewer");
const teamsDiv = document.getElementById("edit_teams");
const predictDiv = document.getElementById("predict_results")

const patchNotesBody = document.getElementById("patchNotesBody")
const selectImageButton = document.getElementById('selectImage');

const scriptsArray = [predictDiv, h2hDiv, viewDiv, driverTransferDiv, editStatsDiv, customCalendarDiv, carPerformanceDiv, teamsDiv]

const dropDownMenu = document.getElementById("dropdownMenu");

const notificationPanel = document.getElementById("notificationPanel");

const logButton = document.getElementById("logFileButton");

const status = document.querySelector(".status-info")
const updateInfo = document.querySelector(".update-info")
const noNotifications = ["Custom Engines fetched", "Cars fetched", "Part values fetched", "Parts stats fetched", "24 Year", "Game Year", "Performance fetched", "Season performance fetched", "Config", "ERROR", "Montecarlo fetched", "TeamData Fetched", "Progress", "JIC", "Calendar fetched", "Contract fetched", "Staff Fetched", "Engines fetched", "Results fetched", "Year fetched", "Numbers fetched", "H2H fetched", "DriversH2H fetched", "H2HDriver fetched", "Retirement fetched", "Prediction Fetched", "Events to Predict Fetched", "Events to Predict Modal Fetched"]
let difficulty_dict = {
    "-2": "Custom",
    0: "default",
    1: "reduced weight",
    2: "extra-hard",
    3: "brutal",
    4: "unfair",
    5: "insane",
    6: "impossible"
}

let inverted_difficulty_dict = {
    "disabled": -1,
    "default": 0,
    "reduced weight": 1,
    "extra-hard": 2,
    "brutal": 3,
    "unfair": 4,
    "insane": 5,
    "impossible": 6
}
let difcultyCustom = "default"

let conn = 0;
export let game_version = 2023;
export let custom_team = false;
let customIconPath = null;
let firstShow = false;
let configCopy;

let latestTag;

let isSaveSelected = 0;
let scriptSelected = 0;
let divBlocking = 1;

let versionNow;
const versionPanel = document.querySelector('.version-panel');
const parchModalTitle = document.getElementById("patchModalTitle")

const repoOwner = 'IUrreta';
const repoName = 'DatabaseEditor';

export const factory = new CommandFactory();


export const socket = new WebSocket('ws://localhost:8765/');
/**
 * When the socket is opened sends a connect message to the backend
 */
socket.onopen = () => {
    //console.log('Conexión establecida.');
    let data = {
        command: "connect"
    }
    socket.send(JSON.stringify(data))

};




/**
 * get the patch notes from the actual version fro the github api
 */
async function getPatchNotes() {
    try {
        if (versionNow.slice(-3) !== "dev") {
            let response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/tags/${versionNow}`);
            let data = await response.json();
            let changes = data.body;
            let changesHTML = marked(changes);
            patchNotesBody.innerHTML = changesHTML
            let h1Elements = patchNotesBody.querySelectorAll("h1");

            h1Elements.forEach(function (h1Element) {
                let h4Element = document.createElement("h4");
                h4Element.textContent = h1Element.textContent;
                h4Element.classList.add("bold-font")
                patchNotesBody.replaceChild(h4Element, h1Element);
            });

            let h2Elements = patchNotesBody.querySelectorAll("h2");
            h2Elements.forEach(function (h1Element) {
                let h4Element = document.createElement("h4");
                h4Element.textContent = h1Element.textContent;
                h4Element.classList.add("bold-font")
                patchNotesBody.replaceChild(h4Element, h1Element);
            });
        }
    } catch {
        console.log("Couldn't find patch notes")
    }


}

/**
 * Places and manages the notifications that appear in the tool
 * @param {string} noti message of the notification
 * @param {bool} error if the notification is an error or not
 */
function update_notifications(noti, code) {
    let newNoti;
    newNoti = document.createElement('div');
    newNoti.className = 'notification';
    newNoti.textContent = noti;
    let toast = createToast(noti, code)
    setTimeout(function () {
        toast.classList.remove("myShow")
    }, 300)
    notificationPanel.appendChild(toast);
    if (code !== "error") {
        setTimeout(function () {
            toast.classList.add("hide")
            setTimeout(function () {
                notificationPanel.removeChild(toast);
            }, 280);
        }, 4000);
    }
}

/**
 * Creates the toast with the message and the error status
 * @param {string} msg string with the notification message
 * @param {boolean} err if it's an error or not
 * @returns 
 */
function createToast(msg, cod) {
    let toastFull = document.createElement('div');
    let toastIcon = document.createElement('div');
    let toastBodyDiv = document.createElement('div');
    let generalDiv = document.createElement('div');
    let icon = document.createElement('i');
    let cross = document.createElement('i');


    generalDiv.classList.add('d-flex', "align-items-center")
    // Asignar clases y atributos
    toastFull.classList.add('toast', "d-flex", "myShow", "d-block", "custom-toast")
    toastFull.style.flexDirection = "column"
    toastFull.setAttribute('role', 'alert');
    toastFull.setAttribute('aria-live', 'assertive');
    toastFull.setAttribute('aria-atomic', 'true');

    toastIcon.classList.add("toast-icon")
    if (cod === "ok") {
        icon.className = "bi bi-check-circle"
        toastIcon.classList.add("success")
    }
    else if (cod === "error" || cod === "lighterror") {
        icon.className = "bi bi-x-circle"
        toastIcon.classList.add("error")
    }
    else if (cod === "monaco") {
        icon.className = "bi bi-heartbreak"
        toastIcon.classList.add("error")
    }
    toastIcon.appendChild(icon)

    toastBodyDiv.classList.add('d-flex', 'toast-body', "custom-toast-body");
    toastBodyDiv.textContent = msg;
    toastBodyDiv.style.opacity = "1"
    toastBodyDiv.style.color = "white"
    toastBodyDiv.style.zIndex = "6"

    generalDiv.appendChild(toastIcon)
    generalDiv.appendChild(toastBodyDiv)
    toastFull.appendChild(generalDiv)
    toastFull.appendChild(cross)
    cross.className = "bi bi-x custom-toast-cross"
    cross.addEventListener("click", function () {
        toastFull.classList.add("hide")
        setTimeout(function () {
            notificationPanel.removeChild(toastFull);
        }, 280);
    })

    return toastFull;
}


function editModeHandler() {
    let stats = "";
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " ";
    });
    stats = stats.slice(0, -1);

    let id;
    if (document.querySelector(".clicked").dataset.driverid) {
        id = document.querySelector(".clicked").dataset.driverid;
    }
    let driverName = getName(document.querySelector(".clicked .name-div-edit-stats"));
    document.querySelector(".clicked").dataset.stats = stats;
    let globalMentality = 2
    let mentality = -1
    if (document.querySelector(".clicked").dataset.mentality0) {
        mentality = ""
        document.querySelectorAll(".mentality-level-indicator").forEach(function (elem, index) {
            mentality += elem.dataset.value + " "
            document.querySelector(".clicked").dataset["mentality" + index] = elem.dataset.value
            globalMentality += parseInt(elem.dataset.value)
        })
        globalMentality = Math.floor(globalMentality / 3)
    }
    document.querySelector(".clicked").dataset.globalMentality = globalMentality
    let new_ovr = calculateOverall(stats, typeOverall, mentality_to_global_menatality[globalMentality]);
    document.querySelector(".clicked").childNodes[1].childNodes[0].textContent = ""
    if (new_ovr[1] !== new_ovr[0]) {
        document.querySelector(".clicked").childNodes[1].childNodes[0].textContent = new_ovr[1];
    }
    document.querySelector(".clicked").childNodes[1].childNodes[1].textContent = new_ovr[0];

    let retirement = document.querySelector(".actual-retirement").textContent.split(" ")[1];
    let age = document.querySelector(".actual-age").textContent.split(" ")[1];
    document.querySelector(".clicked").dataset.retirement = retirement;
    let ageGap = parseInt(document.querySelector(".clicked").dataset.age - age);
    document.querySelector(".clicked").dataset.age = age;
    let newName = document.querySelector("#driverStatsTitle").value
    if (newName === document.querySelector(".clicked").dataset.name) {
        newName = "-1"
    }
    else {
        update_name(id, newName)
    }
    let newCode = document.querySelector("#driverCode").value
    if (newCode === document.querySelector(".clicked").dataset.code) {
        newCode = "-1"
    }
    else {
        document.querySelector(".clicked").dataset.driverCode = newCode
    }
    let driverNum = document.querySelector("#numberButton .front-gradient").textContent;
    let wants1, superLicense, isRetired;
    document.querySelector(".clicked").dataset.number = driverNum;
    if (document.querySelector("#driverNumber1").checked) {
        wants1 = 1;
        document.querySelector(".clicked").dataset.numWC = 1;
    }
    else {
        wants1 = 0;
        document.querySelector(".clicked").dataset.numWC = 0;
    }
    if (document.querySelector("#retiredInput").checked) {
        isRetired = 1;
        document.querySelector(".clicked").dataset.isRetired = 1;
    }
    else {
        isRetired = 0;
        document.querySelector(".clicked").dataset.isRetired = 0;
    }
    document.querySelector(".clicked").dataset.numWC = wants1;
    if (document.getElementById("superLicense").checked) {
        superLicense = 1;
        document.querySelector(".clicked").dataset.superLicense = 1;
    }
    else {
        superLicense = 0;
        document.querySelector(".clicked").dataset.superLicense = 0;
    }
    let marketability = document.getElementById("marketabilityInput").value;
    let dataStats = {
        driverID: id,
        driver: driverName,
        statsArray: stats,
        typeStaff: typeEdit,
        retirement: retirement,
        age: ageGap,
        isRetired: isRetired,
        driverNum: driverNum,
        wants1: wants1,
        mentality: mentality,
        superLicense: superLicense,
        marketability: marketability,
        newName: newName,
        newCode: newCode,
    };

    const message = { command: 'editStats', data: dataStats };
    const command = factory.createCommand(message);
    command.execute();
}

function calendarModeHandler() {
    let dataCodesString = '';

    document.querySelectorAll(".race-calendar").forEach((race) => {
        dataCodesString += race.dataset.trackid.toString() + race.dataset.rainP.toString() + race.dataset.rainQ.toString() + race.dataset.rainR.toString() + race.dataset.type.toString() + race.dataset.state.toString() + ' ';
    });

    dataCodesString = dataCodesString.trim();
    let dataCalendar = {
        calendarCodes: dataCodesString
    };

    const message = { command: 'editCalendar', data: dataCalendar };
    const command = factory.createCommand(message);
    command.execute();
}

function teamsModeHandler() {

    let seasonObjData = document.querySelector("#seasonObjectiveInput").value;
    let longTermData = longTermObj;
    let longTermYearData = document.querySelector("#longTermInput").value;
    let teamBudgetData = document.querySelector("#teamBudgetInput").value.replace(/[$,]/g, "");
    let costCapTransactionData = originalCostCap - document.querySelector("#costCapInput").value.replace(/[$,]/g, "");
    let confidenceData = document.querySelector("#confidenceInput").value;
    let facilitiesData = gather_team_data()
    let pitCrew = gather_pit_crew()
    let engine = document.querySelector("#engineButton").dataset.value
    let data = {
        teamID: teamCod,
        facilities: facilitiesData,
        seasonObj: seasonObjData,
        longTermObj: longTermData,
        longTermYear: longTermYearData,
        teamBudget: teamBudgetData,
        costCapEdit: costCapTransactionData,
        confidence: confidenceData,
        pitCrew: pitCrew,
        engine: engine,
        teamName: default_dict[teamCod],
    }
    const message = { command: 'editTeam', data: data };
    const command = factory.createCommand(message);
    command.execute();
}

function performanceModeHandler() {
    let data;
    if (teamsEngine === "teams") {
        let parts = {};
        let n_parts_designs = {};
        let loadouts = {}
        document.querySelectorAll(".part-performance").forEach(function (elem) {
            let part = elem.dataset.part;
            let partID = elem.dataset.partid;
            let loadout1 = elem.dataset.loadout1;
            let loadout2 = elem.dataset.loadout2;
            let stats = {};
            elem.querySelectorAll(".part-performance-stat").forEach(function (stat) {
                if (stat.dataset.attribute !== "-1") {
                    let statNum = stat.dataset.attribute;
                    let value = stat.querySelector("input").value.split(" ")[0];
                    stats[statNum] = value;
                }
            });
            stats["designEditing"] = elem.querySelector(".part-subtitle").dataset.editing
            parts[part] = stats;
            loadouts[partID] = [loadout1, loadout2]
        })
        document.querySelectorAll(".one-part").forEach(function (elem) {
            let designID = elem.querySelector(".one-part-name").dataset.designId
            let number = elem.querySelector(".n-parts").innerText.split("x")[1]
            n_parts_designs[designID] = number
        })
        data = {
            teamID: teamSelected,
            parts: parts,
            n_parts_designs: n_parts_designs,
            loadouts: loadouts,
            teamName: document.querySelector(".selected").dataset.teamname
        }
        const message = { command: 'editPerformance', data: data };
        const command = factory.createCommand(message);
        command.execute();
    }
    else if (teamsEngine === "engines") {
        let engineData = gather_engines_data()
        data = {
            command: "editEngine",
            engines: engineData,
        }
    }

}

export function first_show_animation() {
    let button = document.querySelector(".save-button")
    if (!firstShow) {
        firstShow = true;
        button.classList.add("first-show")
        setTimeout(function () {
            button.classList.remove('first-show');
        }, 3000);
    }
}

export function manageSaveButton(show, mode) {
    let button = document.querySelector(".save-button")
    button.removeEventListener("click", editModeHandler);
    button.removeEventListener("click", calendarModeHandler);
    button.removeEventListener("click", teamsModeHandler);
    button.removeEventListener("click", performanceModeHandler);

    if (!show) {
        button.classList.add("d-none")
    }
    else {
        button.classList.remove("d-none")
        first_show_animation()
    }
    if (mode === "stats") {
        button.addEventListener("click", editModeHandler);
    }
    else if (mode === "calendar") {
        button.addEventListener("click", calendarModeHandler);
    }
    else if (mode === "teams") {
        button.addEventListener("click", teamsModeHandler);
    }
    else if (mode === "performance") {
        button.addEventListener("click", performanceModeHandler);
    }
}

export function updateFront(data) {
    console.log("UPDATING FRONT")
    console.log(data)
    let responseTyppe = data.responseMessage
    let message = data.content
    let handler = messageHandlers[responseTyppe];
    if (handler) {
        handler(message);
    }
}


const messageHandlers = {
    "ERROR": (message) => {
        update_notifications(message[1], "error");
    },
    "Save loaded succesfully": (message) => {
        isSaveSelected = 1;
        remove_drivers();
        removeStatsDrivers();
        listenersStaffGroups();
        place_drivers(message);
        sortList("free-drivers");
        place_drivers_editStats(message);
    },
    "Staff fetched": (message) => {
        place_staff(message);
        sortList("free-staff")
        place_staff_editStats(message);
    },
    "Calendar fetched": (message) => {
        load_calendar(message)
    },
    "Engines fetched": (message) => {
        manage_engineStats(message[0]);
        update_engine_allocations(message);
    },
    "Contract fetched": (message) => {
        manage_modal(message);
    },
    "Year fetched": (message) => {
        generateYearsMenu(message);
    },
    "Numbers fetched": (message) => {
        loadNumbers(message);
    },
    "H2H fetched": (message) => {
        sprintsListeners();
        racePaceListener();
        qualiPaceListener()
        manage_h2h_bars(message);
    },
    "DriversH2H fetched": (message) => {
        load_drivers_h2h(message);
    },
    "H2HDriver fetched": (message) => {
        load_labels_initialize_graphs(message);
    },
    "Results fetched": (message) => {
        new_drivers_table(message[0]);
        new_load_drivers_table(message.slice(1));
        new_teams_table(message[0]);
        new_load_teams_table(message.slice(1));
    },
    "TeamData fetched": (message) => {
        fillLevels(message)

    },
    "Events to Predict Fetched": (message) => {
        placeRaces(message.slice(1))
    },
    "Events to Predict Modal Fetched": (message) => {
        placeRacesInModal(message.slice(1))
    },
    "Prediction Fetched": (message) => {
        predictDrivers(message.slice(1))
    },
    "Montecarlo Fetched": (message) => {
        loadMontecarlo(message.slice(1))
    },
    "Progress": (message) => {
        manageProgress(message.slice(1))
    },
    "Config": (message) => {
        manage_config(message.slice(1))
    },
    "24 Year": (message) => {
        manage_config(message, true)
    },
    "Performance fetched": (message) => {
        load_performance(message[0])
        load_attributes(message[1])
        //wait 100 ms
        setTimeout(function () {
            order_by("overall")
        }, 100)

    },
    "Season performance fetched": (message) => {
        load_performance_graph(message)
    },
    "Parts stats fetched": (message) => {
        load_parts_stats(message[0])
        load_parts_list(message[1])
        update_max_design(message[2])
    },
    "Game Year": (message) => {
        manage_game_year(message)
    },
    "Part values fetched": (message) => {
        load_one_part(message)
    },
    "Cars fetched": (message) => {
        load_cars(message[0])
        load_car_attributes(message[1])
        order_by("overall")
    },
    "Custom Engines fetched": (message) => {
        load_custom_engines(message.slice(1))
    }
};


function update_engine_allocations(message) {
    let engine_map = {}
    message[1].forEach(function (team) {
        engine_map[team[0]] = team[1]
    })
    setEngineAllocations(engine_map)

    for (let key in engine_names) {
        if (key > 10) {
            deleteEngineName(key)
        }
    }

    message[0].forEach(function (engine) {
        if (engine[0] > 10) {
            addEngineName(engine[0], engine[2])
        }
    })

}



/**
 * Handles the receiving end from the messages sent from backend
 * @param {string} event the message tha tcomes fro the backend
 */
socket.onmessage = (event) => {
    let message = JSON.parse(event.data);
    let handler = messageHandlers[message[0]];

    if (handler) {
        handler(message);
    }
    if (!noNotifications.includes(message[0])) {
        update_notifications(message[0], "ok");
    }
};

/**
 * Opens the log file
 */
logButton.addEventListener("click", function () {
    window.location.href = '../log.txt';
})


function resizeWindowToHeight(mode) {
    if (mode === "11teams") {
        document.querySelectorAll(".main-resizable").forEach(function (elem) {
            elem.style.height = "720.5px"
            if (elem.id === "enginesPerformance") {
                elem.style.maxHeight = "720px"
            }
        })
        document.querySelectorAll(".staff-list").forEach(function (elem) {
            elem.style.height = "672px"
        })
        document.querySelectorAll(".parts-list").forEach(function (elem) {
            elem.classList.remove("noCustom")
        })
        document.getElementById("free-drivers").style.height = "672px"
        document.getElementById("free-staff").style.height = "672px"
        document.getElementById("raceMenu").style.height = "686px"
    }
    else if (mode === "10teams") {
        document.querySelectorAll(".main-resizable").forEach(function (elem) {
            elem.style.height = "660px"
            if (elem.id === "enginesPerformance") {
                elem.style.maxHeight = "660px"
            }
        })
        document.querySelectorAll(".parts-list").forEach(function (elem) {
            elem.classList.add("noCustom")
        })
        document.querySelectorAll(".staff-list").forEach(function (elem) {
            elem.style.height = "612px"
        })
        document.getElementById("free-drivers").style.height = "612px"
        document.getElementById("free-staff").style.height = "612px"
        document.getElementById("raceMenu").style.height = "660px"
    }
}

function manage_game_year(info) {
    let year = info[0]
    if (year === "24") {
        document.getElementById("year23").classList.remove("activated")
        document.getElementById("year24").classList.add("activated")
        document.getElementById("drs24").classList.remove("d-none")
        document.getElementById("drs24").dataset.attribute = "3"
        game_version = 2024
        setMaxRaces(24)
        manage_custom_team(info)
        document.querySelectorAll(".brake-cooling-replace").forEach(function (elem) {
            elem.textContent = "Tyre preservation"
        })
        document.querySelectorAll(".engine24").forEach(function (elem) {
            elem.classList.add("d-none")
        })
        document.querySelector(".only-mentality").classList.remove("d-none")

    }
    else if (year === "23") {
        resizeWindowToHeight("10teams")
        document.getElementById("year24").classList.remove("activated")
        document.getElementById("year23").classList.add("activated")
        document.getElementById("drs24").classList.add("d-none")
        document.getElementById("drs24").dataset.attribute = "-1"
        if (32 in combined_dict) {
            delete combined_dict[32]
        }
        game_version = 2023
        setMidGrid(10)
        setMaxRaces(23)
        setRelativeGrid(5)
        manage_custom_team([null, null])
        document.querySelectorAll(".brake-cooling-replace").forEach(function (elem) {
            elem.textContent = "Brake cooling"
        })
        document.querySelectorAll(".engine24").forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        document.querySelector(".only-mentality").classList.add("d-none")
    }
    replace_modal_teams(game_version)
}

function manage_custom_team(nameColor) {
    if (nameColor[1] !== null) {
        resizeWindowToHeight("11teams")
        custom_team = true
        combined_dict[32] = nameColor[1]
        abreviations_dict[32] = nameColor[1].slice(0, 3).toUpperCase()
        document.querySelectorAll(".ct-teamname").forEach(function (elem) {
            elem.dataset.teamshow = nameColor[1]
        })
        document.getElementById("customTeamTransfers").classList.remove("d-none")
        document.getElementById("customTeamPerformance").classList.remove("d-none")
        document.getElementById("customTeamDropdown").classList.remove("d-none")
        document.getElementById("customTeamComparison").classList.remove("d-none")
        document.getElementById("customTeamContract").classList.remove("d-none")
        document.getElementById("customizeTeam").classList.remove("d-none")
        document.querySelectorAll(".ct-replace").forEach(function (elem) {
            elem.textContent = nameColor[1].toUpperCase()
        })
        document.querySelectorAll(".custom-car-performance").forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        replace_custom_team_color(nameColor[2], nameColor[3])
        setMidGrid(11)
        setRelativeGrid(4.54)
    }
    else {
        resizeWindowToHeight("10teams")
        custom_team = false
        document.getElementById("customTeamTransfers").classList.add("d-none")
        document.getElementById("customTeamPerformance").classList.add("d-none")
        document.getElementById("customTeamDropdown").classList.add("d-none")
        document.getElementById("customTeamComparison").classList.add("d-none")
        document.getElementById("customTeamContract").classList.add("d-none")
        document.getElementById("customizeTeam").classList.add("d-none")
        document.querySelectorAll(".custom-car-performance").forEach(function (elem) {
            elem.classList.add("d-none")
        })
        setMidGrid(10)
        setRelativeGrid(5)
        if (32 in combined_dict) {
            delete combined_dict[32]
        }
    }
}

function replace_custom_team_color(primary, secondary) {
    let root = document.documentElement;
    root.style.setProperty('--custom-team-primary', primary);
    root.style.setProperty('--custom-team-secondary', secondary);
    root.style.setProperty('--custom-team-primary-transparent', primary + "30");
    root.style.setProperty('--custom-team-secondary-transparent', secondary + "30");
    colors_dict["320"] = primary
    colors_dict["321"] = secondary
    document.getElementById("primarySelector").value = primary
    document.getElementById("secondarySelector").value = secondary
    document.getElementById("primaryReader").value = primary.toUpperCase()
    document.getElementById("secondaryReader").value = secondary.toUpperCase()
}


selectImageButton.addEventListener('click', () => {
    fileInput.click();
});

// Función para manejar la selección de archivo
fileInput.addEventListener('change', (event) => {
    let file = event.target.files[0];
    if (file) {
        customIconPath = `../assets/custom/${file.name}`;
    }
    document.querySelector(".logo-preview").src = customIconPath
});

function replace_custom_team_logo(path) {
    logos_disc[32] = path;
    document.querySelectorAll(".custom-replace").forEach(function (elem) {
        elem.src = path
    })
    document.querySelector(".logo-preview").src = path
    document.getElementById("selectImage").innerText = path.split("/").pop()
}




function ajustScrollWrapper() {
    var windowHeight = window.innerHeight - 80;
    document.querySelector('.scroll-wrapper').style.height = windowHeight + 'px';
}

window.addEventListener('resize', ajustScrollWrapper);
window.addEventListener('load', ajustScrollWrapper);







document.querySelector(".gear-container").addEventListener("click", function () {
    let configDetailModal = new bootstrap.Modal(document.getElementById('configDetailModal'), {
        keyboard: false
    })
    configDetailModal.show()
})

function manage_config(info, year_config = false) {
    document.querySelector(".bi-gear").classList.remove("hidden")
    configCopy = info
    manage_config_content(info, year_config)
}

function replace_all_teams(info) {
    let teams = info["teams"]
    alphaTauriReplace(teams["alphatauri"])
    alpineReplace(teams["alpine"])
    alfaReplace(teams["alfa"])
    update_logo("alpine", logos_configs[teams["alpine"]], teams["alpine"])
    update_logo("alfa", logos_configs[teams["alfa"]], teams["alfa"])
    update_logo("alphatauri", logos_configs[teams["alphatauri"]], teams["alphatauri"])
}

function manage_config_content(info, year_config = false) {
    replace_all_teams(info)
    if (!year_config) {
        if (info["icon"]) {
            replace_custom_team_logo(info["icon"])
            customIconPath = info["icon"]
        }
        if (info["primaryColor"]) {
            replace_custom_team_color(info["primaryColor"], info["secondaryColor"])
        }
        if (info["mentalityFrozen"] === 1) {
            document.getElementById("freezeMentalityToggle").checked = true
        }
        else {
            document.getElementById("freezeMentalityToggle").checked = false
        }
        if (info["refurbish"] === 1) {
            document.getElementById("refurbishingToggle").checked = true
        }
        else {
            document.getElementById("refurbishingToggle").checked = false
        }

        update_mentality_span(info["mentalityFrozen"])
        let difficultySlider = document.getElementById("difficultySlider")
        difficultySlider.value = info["difficulty"]
        update_difficulty_span(info["difficulty"])
        if (info["difficulty"] === -2) { //custom difficulty
            load_difficulty_warnings(info["triggerList"])
        }
        else {
            manage_difficulty_warnings(difficulty_dict[parseInt(info["difficulty"])])
        }
        update_refurbish_span(info["refurbish"])
    }
}

document.querySelectorAll(".color-picker").forEach(function (elem) {
    let reader = elem.parentNode.querySelector(".color-reader")
    elem.addEventListener("input", function () {
        reader.value = elem.value.toUpperCase()
    })
    reader.value = elem.value.toUpperCase();
})

document.querySelectorAll(".color-reader").forEach(function (elem) {
    elem.addEventListener("input", function () {
        let picker = elem.parentNode.querySelector(".color-picker")
        picker.value = elem.value.toLowerCase()
    })
})


function alphaTauriReplace(info) {
    document.querySelector("#alphaTauriReplaceButton").querySelector("button").textContent = names_configs[info]
    document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value = info
    combined_dict[8] = pretty_names[info]
    abreviations_dict[8] = abreviations_for_replacements[info]
    document.querySelectorAll(".at-teamname").forEach(function (elem) {
        elem.dataset.teamshow = pretty_names[info]
    })
    document.querySelectorAll(".at-name").forEach(function (elem) {
        //if it has the class complete, put names_configs[info], else out VCARB
        if (info === "visarb" && !elem.classList.contains("complete")) {
            elem.textContent = "VCARB"
        }
        else {
            elem.textContent = names_configs[info]
        }
    })
    if (info !== "alphatauri") {
        document.querySelectorAll(".atlogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.classList.remove("alphataurilogo")
                elem.classList.remove("toyotalogo")
                elem.classList.remove("hugologo")
                elem.classList.remove("visarblogo")
                elem.classList.remove("ferrarilogo")
                elem.classList.remove("brawnlogo")
                elem.classList.add(logos_classes_configs[info])
            }
            if (elem.classList.contains("secondary")) {
                if (info !== "toyota") {
                    elem.src = elem.src.slice(0, -4) + "2.png"
                }
            }

        })
        let alphaVarName = "--alphatauri-primary"
        let newVarName = "--" + info + "-primary"
        change_css_variables(alphaVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["80"] = value
        alphaVarName = "--alphatauri-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alphaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["81"] = value
        alphaVarName = "--alphatauri-primary-transparent"
        newVarName = "--" + info + "-primary-transparent"
        change_css_variables(alphaVarName, newVarName)
        alphaVarName = "--alphatauri-secondary-transparent"
        newVarName = "--" + info + "-secondary-transparent"
        change_css_variables(alphaVarName, newVarName)
    }
    else {
        document.querySelectorAll(".atlogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.classList.remove("alphataurilogo")
                elem.classList.remove("toyotalogo")
                elem.classList.remove("hugologo")
                elem.classList.remove("visarblogo")
                elem.classList.remove("ferrarilogo")
                elem.classList.remove("brawnlogo")
                elem.classList.add("alphataurilogo")
            }
            if (elem.classList.contains("secondary")) {
                elem.src = elem.src.slice(0, -4) + "2.png"
            }
        })
        let alphaVarName = "--alphatauri-primary"
        let newVarName = "--alphatauri-original"
        change_css_variables(alphaVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue("--alphatauri-original").trim();
        colors_dict["80"] = value
        alphaVarName = "--alphatauri-secondary"
        newVarName = "--alphatauri-secondary-original"
        change_css_variables(alphaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alphatauri-secondary-original").trim();
        colors_dict["81"] = value
        alphaVarName = "--alphatauri-primary-transparent"
        newVarName = "--alphatauri-primary-transparent-original"
        change_css_variables(alphaVarName, newVarName)
        alphaVarName = "--alphatauri-secondary-transparent"
        newVarName = "--alphatauri-secondary-transparent-original"
        change_css_variables(alphaVarName, newVarName)
    }
    document.querySelectorAll(".team-menu-alphatauri-replace").forEach(function (elem) {
        let classes = elem.className.split(" ")
        classes.forEach(function (cl) {
            if (cl.includes("changable")) {
                elem.classList.remove(cl)
                elem.classList.add("changable-team-menu-" + info)
            }
        })
    })
}

function alpineReplace(info) {
    document.querySelector("#alpineReplaceButton").querySelector("button").textContent = names_configs[info]
    document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value = info
    combined_dict[5] = pretty_names[info]
    abreviations_dict[5] = abreviations_for_replacements[info]
    document.querySelectorAll(".al-teamname").forEach(function (elem) {
        elem.dataset.teamshow = pretty_names[info]
    })
    document.querySelectorAll(".alpine-name").forEach(function (elem) {
        elem.textContent = names_configs[info]
    })
    if (info !== "alpine") {
        document.querySelectorAll(".alpinelogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.classList.remove("alpinelogo")
                elem.classList.remove("ferrarilogo")
                elem.classList.remove("lotuslogo")
                elem.classList.add(logos_classes_configs[info])
            }
            if (elem.classList.contains("secondary")) {
                elem.src = elem.src.slice(0, -4) + "2.png"
            }
        })
        let alpineVarName = "--alpine-primary"
        let newVarName = "--" + info + "-primary"
        change_css_variables(alpineVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["50"] = value
        alpineVarName = "--alpine-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alpineVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["51"] = value
        alpineVarName = "--alpine-primary-transparent"
        newVarName = "--" + info + "-primary-transparent"
        change_css_variables(alpineVarName, newVarName)
        alpineVarName = "--alpine-secondary-transparent"
        newVarName = "--" + info + "-secondary-transparent"
        change_css_variables(alpineVarName, newVarName)
    }
    else {
        document.querySelectorAll(".alpinelogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.classList.remove("alpinelogo")
                elem.classList.remove("ferrarilogo")
                elem.classList.remove("lotuslogo")
                elem.classList.add("alpinelogo")
            }
            if (elem.classList.contains("secondary")) {
                elem.src = elem.src.slice(0, -4) + "2.png"
            }
        })
        let alpineVarName = "--alpine-primary"
        let newVarName = "--alpine-original"
        change_css_variables(alpineVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue("--alpine-original").trim();
        colors_dict["50"] = value
        alpineVarName = "--alpine-secondary"
        newVarName = "--alpine-secondary-original"
        change_css_variables(alpineVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alpine-secondary-original").trim();
        colors_dict["51"] = value
        alpineVarName = "--alpine-primary-transparent"
        newVarName = "--alpine-primary-transparent-original"
        change_css_variables(alpineVarName, newVarName)
        alpineVarName = "--alpine-secondary-transparent"
        newVarName = "--alpine-secondary-transparent-original"
        change_css_variables(alpineVarName, newVarName)
    }
    document.querySelectorAll(".team-menu-alpine-replace").forEach(function (elem) {
        let classes = elem.className.split(" ")
        classes.forEach(function (cl) {
            if (cl.includes("changable")) {
                elem.classList.remove(cl)
                elem.classList.add("changable-team-menu-" + info)
            }
        })
    })
}

function alfaReplace(info) {
    document.querySelector("#alfaReplaceButton").querySelector("button").textContent = names_configs[info]
    document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value = info
    combined_dict[9] = pretty_names[info]
    abreviations_dict[9] = abreviations_for_replacements[info]
    document.querySelectorAll(".af-teamname").forEach(function (elem) {
        elem.dataset.teamshow = pretty_names[info]
    })
    document.querySelectorAll(".alfa-name").forEach(function (elem) {
        elem.textContent = names_configs[info]
    })
    if (info !== "alfa") {
        document.querySelectorAll(".alfalogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.classList.remove("alfaromeologo")
                elem.classList.remove("audilogo")
                elem.classList.remove("sauberlogo")
                elem.classList.add(logos_classes_configs[info])
            }
        })
        let alfaVarName = "--alfa-primary"
        let newVarName = "--" + info + "-primary"
        change_css_variables(alfaVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["90"] = value
        alfaVarName = "--alfa-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alfaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        colors_dict["91"] = value
        alfaVarName = "--alfa-primary-transparent"
        newVarName = "--" + info + "-primary-transparent"
        change_css_variables(alfaVarName, newVarName)
        alfaVarName = "--alfa-secondary-transparent"
        newVarName = "--" + info + "-secondary-transparent"
        change_css_variables(alfaVarName, newVarName)
    }
    else {
        document.querySelectorAll(".alfalogo-replace").forEach(function (elem) {
            if (!elem.classList.contains("non-changable")) {
                elem.src = logos_configs[info]
                elem.className = "alfalogo-replace alfalogo"
            }
        })
        let alfaVarName = "--alfa-primary"
        let newVarName = "--alfa-original"
        change_css_variables(alfaVarName, newVarName)
        let value = getComputedStyle(document.documentElement).getPropertyValue("--alfa-original").trim();
        colors_dict["90"] = value
        alfaVarName = "--alfa-secondary"
        newVarName = "--alfa-secondary-original"
        change_css_variables(alfaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alfa-secondary-original").trim();
        colors_dict["91"] = value
        alfaVarName = "--alfa-primary-transparent"
        newVarName = "--alfa-primary-transparent-original"
        change_css_variables(alfaVarName, newVarName)
        alfaVarName = "--alfa-secondary-transparent"
        newVarName = "--alfa-secondary-transparent-original"
        change_css_variables(alfaVarName, newVarName)
    }
    document.querySelectorAll(".team-menu-alfa-replace").forEach(function (elem) {
        let classes = elem.className.split(" ")
        classes.forEach(function (cl) {
            if (cl.includes("changable")) {
                elem.classList.remove(cl)
                elem.classList.add("changable-team-menu-" + info)
            }
        })
    })
}

function change_css_variables(oldVar, newVar) {
    let root = document.documentElement;
    let newVal = getComputedStyle(root).getPropertyValue(newVar).trim();
    root.style.setProperty(oldVar, newVal);
}

function replace_modal_teams(version) {
    if (version === 2024) {
        document.getElementById("alphaModalLogo").src = logos_configs["visarb"]
        document.getElementById("alphaModalLogo").className = "visarblogo non-changable"
        document.getElementById("alphaModalName").textContent = pretty_names["visarb"]
        document.getElementById("alfaModalLogo").src = logos_configs["stake"]
        document.getElementById("alfaModalName").textContent = pretty_names["stake"]
    }
    else if (version === 2023) {
        document.getElementById("alphaModalLogo").src = logos_configs["alphatauri"]
        document.getElementById("alphaModalLogo").className = "alphataurilogo non-changable"
        document.getElementById("alphaModalName").textContent = pretty_names["alphatauri"]
        document.getElementById("alfaModalLogo").src = logos_configs["alfa"]
        document.getElementById("alfaModalName").textContent = pretty_names["alfa"]
    }
}

//select all team-change-button
document.querySelectorAll(".team-change-button").forEach(function (elem) {
    elem.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
            elem.querySelector("button").textContent = a.textContent
            elem.querySelector("button").dataset.value = a.dataset.value
        })
    })
})

document.querySelector("#configDetailsButton").addEventListener("click", function () {
    save = document.querySelector("#saveSelector").textContent
    save = save.slice(0, -4)
    alphatauri = document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value
    alpine = document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value
    alfa = document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value
    let mentalityFrozen = 0;
    if (document.getElementById("freezeMentalityToggle").checked) {
        mentalityFrozen = 1;
    }
    let refurbish = 0;
    if (document.getElementById("refurbishingToggle").checked) {
        refurbish = 1;
    }
    let difficulty = 0;
    let difficultySlider = document.getElementById("difficultySlider")
    let difficultyValue = document.getElementById("difficultySpan").textContent === "Custom" ? -2 : parseInt(difficultySlider.value)
    let disabledList = {}
    let triggerList = {}
    document.querySelectorAll(".dif-warning:not(.default)").forEach(function (elem) {
        let id = elem.id
        if (elem.classList.contains("disabled") || elem.classList.contains("d-none")) {
            disabledList[id] = 1
        }
        else {
            disabledList[id] = 0
        }
        triggerList[id] = elem.classList && (elem.classList.contains("d-none") || elem.classList.contains("disabled")) ? -1 : inverted_difficulty_dict[elem.className.split(" ")[1]];
    })
    let data = {
        command: "configUpdate",
        save: save,
        alphatauri: alphatauri,
        alpine: alpine,
        alfa: alfa,
        mentalityFrozen: mentalityFrozen,
        difficulty: difficultyValue,
        refurbish: refurbish,
        disabled: disabledList,
        triggerList: triggerList
    }
    if (customIconPath !== null) {
        data["icon"] = customIconPath
        replace_custom_team_logo(customIconPath);
    }
    if (custom_team) {
        data["primaryColor"] = document.getElementById("primarySelector").value
        data["secondaryColor"] = document.getElementById("secondarySelector").value
        replace_custom_team_color(data["primaryColor"], data["secondaryColor"])
    }
    socket.send(JSON.stringify(data))
    info = { teams: { alphatauri: alphatauri, alpine: alpine, alfa: alfa } }
    replace_all_teams(info)
    reloadTables()
})

document.querySelector(".bi-file-earmark-arrow-down").addEventListener("click", function () {
    const db = getDatabase();
    const metadata = getMetadata();
    repack(db, metadata);
})



/**
 * checks if a save and a script have been selected to unlock the tool
 */
function check_selected() {
    if (scriptSelected === 1) {
        document.getElementById("scriptSelected").classList.add("completed")
    }
    setTimeout(function () {
        if (isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1) {
            document.getElementById("blockDiv").classList.add("disappear")
            divBlocking = 0;
        }
    }, 300)

}

h2hPill.addEventListener("click", function () {

    manageScripts("hide", "show", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

viewPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "show", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

driverTransferPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "show", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

editStatsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "show", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "stats")
})

constructorsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "show")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "teams")
})


CalendarPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "show", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "calendar")
})

carPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "show", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(!viewingGraph, "performance")
})

gamePill.addEventListener("click", function () {
    document.querySelector("#editorChanges").classList.add("d-none")
    document.querySelector("#gameChanges").classList.remove("d-none")
})

editorPill.addEventListener("click", function () {
    document.querySelector("#editorChanges").classList.remove("d-none")
    document.querySelector("#gameChanges").classList.add("d-none")
})

document.getElementById("difficultySlider").addEventListener("input", function () {
    let value = this.value;
    update_difficulty_span(value)
    manage_difficulty_warnings(difficulty_dict[parseInt(value)])
    difcultyCustom = "default"
    document.getElementById("customGearButton").classList.remove("custom")
});

function update_difficulty_span(value) {
    let span = document.querySelector("#difficultySpan")
    let difficulty = difficulty_dict[parseInt(value)]
    if (difficulty === "reduced weight") {
        span.className = "option-state reduced-weight"
    }
    else if (difficulty === "Custom") {
        span.className = "option-state custom"
        document.getElementById("customGearButton").classList.remove("custom")
        document.getElementById("customGearButton").click()
    }
    else {
        span.className = "option-state " + difficulty
    }
    span.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

document.getElementById("freezeMentalityToggle").addEventListener("change", function () {
    let value = this.checked;
    update_mentality_span(value)
});

function update_mentality_span(value) {
    let span = document.querySelector("#mentalitySpan")
    if (value) {
        span.className = "option-state frozen"
        span.textContent = "Frozen"
    } else {
        span.className = "option-state default"
        span.textContent = "Unfrozen"
    }
}

document.getElementById("refurbishingToggle").addEventListener("change", function () {
    let value = this.checked;
    update_refurbish_span(value)
});

function update_refurbish_span(value) {
    let span = document.querySelector("#refurbishSpan")
    if (value) {
        span.className = "option-state fixed"
        span.textContent = "Fixed"
    } else {
        span.className = "option-state default"
        span.textContent = "Default"
    }
}

function manage_difficulty_warnings(level) {
    const elements = [
        "defaultDif", "lightDif", "researchDif", "statDif", "designTimeDif", "factoryDif", "buildDif"
    ];
    const selectedConfig = difficultyConfig[level] || difficultyConfig["default"];

    elements.forEach(id => {
        document.getElementById(id).classList.add("d-none");
    });

    selectedConfig.visible.forEach(id => {
        document.getElementById(id).classList.remove("d-none");
    });

    elements.forEach(id => {
        if (selectedConfig[id]) {
            const elementConfig = selectedConfig[id];
            const element = document.getElementById(id);
            element.className = elementConfig.className;
            element.textContent = elementConfig.text;
        }
    });

}

function load_difficulty_warnings(triggerList) {
    for (let id in triggerList) {
        let warn = document.getElementById(id)
        let difName = difficulty_dict[triggerList[id]]
        if (triggerList[id] !== -1) {
            warn.className = difficultyConfig[difName][id].className
            warn.textContent = difficultyConfig[difName][id].text
        }
        else {
            warn.classList.add("disabled")
        }
    }
}

document.getElementById("customGearButton").addEventListener("click", function () {
    this.classList.toggle("custom")
    if (this.classList.contains("custom")) {
        difcultyCustom = "custom"
        document.querySelector("#difficultySpan").textContent = "Custom"
        document.querySelector("#difficultySpan").className = "option-state custom"
        document.querySelector(".custom-description").textContent = "cycle through its states"
        let warnigs = document.querySelectorAll(".dif-warning")
        warnigs.forEach(function (elem) {
            if (elem.id !== "defaultDif") {
                for (let level in difficultyConfig) {
                    if (difficultyConfig[level].visible.includes(elem.id)) {
                        elem.className = difficultyConfig[level][elem.id]?.className || "dif-warning";
                        elem.textContent = difficultyConfig[level][elem.id]?.text || "";
                        break;
                    }
                }
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
    else {
        difcultyCustom = "default"
        document.querySelector(".custom-description").textContent = "remove/add it"
        actualDifficulty = document.getElementById("difficultySlider").value
        manage_difficulty_warnings(difficulty_dict[parseInt(actualDifficulty)])
        update_difficulty_span(actualDifficulty)
    }
})

function rotateDifficultyLevel(elementId) {
    const levels = ["extra-hard", "brutal", "unfair", "insane", "impossible"];
    const element = document.getElementById(elementId);

    // Detectar si el elemento está en estado "disabled" actualmente
    if (element.classList.contains("disabled")) {
        let nextConfig;
        for (let level in difficultyConfig) {
            if (difficultyConfig[level].visible.includes(elementId)) {
                nextConfig = difficultyConfig[level][elementId]
                break
            }
        }
        if (nextConfig) {
            element.className = nextConfig.className;
            element.textContent = nextConfig.text;
        }
        return;
    }

    let currentLevelIndex = levels.findIndex(level => {
        return difficultyConfig[level][elementId] &&
            element.classList.contains(difficultyConfig[level][elementId].className.split(" ")[1]);
    });

    if (currentLevelIndex === levels.length - 1) {
        element.className = "dif-warning disabled";
        return;
    }

    let nextLevelIndex = (currentLevelIndex + 1) % levels.length;
    let nextConfig = difficultyConfig[levels[nextLevelIndex]][elementId];


    while (
        (!nextConfig ||
            (nextConfig.className === element.className && nextConfig.text === element.textContent) ||
            !difficultyConfig[levels[nextLevelIndex]].visible.includes(elementId)) &&
        nextLevelIndex !== currentLevelIndex
    ) {
        nextLevelIndex = (nextLevelIndex + 1) % levels.length;
        nextConfig = difficultyConfig[levels[nextLevelIndex]][elementId];
    }

    if (nextConfig) {
        element.className = nextConfig.className;
        element.textContent = nextConfig.text;
    }
}

document.querySelectorAll(".dif-warning:not(.default)").forEach(function (elem) {
    elem.addEventListener("click", function () {
        if (difcultyCustom === "custom") {
            rotateDifficultyLevel(elem.id);
        } else {
            elem.classList.toggle("disabled");
        }
    });
});

/**
 * Manages the stats of the divs associated with the pills
 * @param  {Array} divs array of state of the divs
 */
function manageScripts(...divs) {
    scriptsArray.forEach(function (div, index) {
        if (divs[index] === "show") {
            div.className = "script-view"
        }
        else {
            div.className = "script-view d-none"
        }
    })
}

document.querySelector("#cancelDetailsButton").addEventListener("click", function () {
    manage_config_content(configCopy[0], false)
})
