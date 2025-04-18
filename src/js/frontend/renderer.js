import { marked } from 'marked';

import { resetTeamEditing, fillLevels, longTermObj, originalCostCap, gather_team_data, gather_pit_crew, teamCod } from './teams';
import {
    resetViewer, generateYearsMenu, resetYearButtons, update_logo, setEngineAllocations, engine_names, new_drivers_table, new_teams_table,
    new_load_drivers_table, new_load_teams_table, addEngineName, deleteEngineName, reloadTables
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
    teamSelected, gather_engines_data, reload_performance_graph
} from './performance';
import { resetPredict, setMidGrid, setMaxRaces, setRelativeGrid, placeRaces, placeRacesInModal } from './predictions';
import {
    removeStatsDrivers, place_drivers_editStats, place_staff_editStats, typeOverall, setStatPanelShown, setTypeOverall,
    typeEdit, setTypeEdit, change_elegibles, getName, calculateOverall, listenersStaffGroups
} from './stats';
import { resetH2H, hideComp, colors_dict, load_drivers_h2h, sprintsListeners, racePaceListener, qualiPaceListener, manage_h2h_bars, load_labels_initialize_graphs, reload_h2h_graphs, init_colors_dict, edit_colors_dict } from './head2head';
import { updateEditsWithModData } from '../backend/scriptUtils/modUtils.js';
import { dbWorker } from './dragFile';
import { Command } from "../backend/command.js";
import { PUBLIC_KEY } from './public_key.js';
import members from "../../data/members.json"

import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";


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
    "alpine": "alpinelogo", "renault": "renaultlogo", "andretti": "andrettilogo", "lotus": "lotuslogo",
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
const modPill = document.getElementById("modpill")

export const editorPill = document.getElementById("editorPill")
export const gamePill = document.getElementById("gamePill")
const patreonPill = document.getElementById("patreonPill")

const driverTransferDiv = document.getElementById("driver_transfers");
const editStatsDiv = document.getElementById("edit_stats");
const customCalendarDiv = document.getElementById("custom_calendar");
const carPerformanceDiv = document.getElementById("car_performance");
const viewDiv = document.getElementById("season_viewer");
const h2hDiv = document.getElementById("head2head_viewer");
const teamsDiv = document.getElementById("edit_teams");
const predictDiv = document.getElementById("predict_results")
const mod25Div = document.getElementById("mod_25")

const patchNotesBody = document.getElementById("patchNotesBody")
const selectImageButton = document.getElementById('selectImage');
const patreonKeyButton = document.getElementById('patreonKeyButton');

const scriptsArray = [predictDiv, h2hDiv, viewDiv, driverTransferDiv, editStatsDiv, customCalendarDiv, carPerformanceDiv, teamsDiv, mod25Div]

const dropDownMenu = document.getElementById("dropdownMenu");

const notificationPanel = document.getElementById("notificationPanel");

const logButton = document.getElementById("logFileButton");
const patreonLogo = document.querySelector(".footer .bi-custom-patreon");
const patreonSlideUp = document.querySelector(".patreon-slide-up");
const slideUpClose = document.getElementById("patreonSlideUpClose")
const patreonThemes = document.querySelector(".patreon-themes")
const downloadSaveButton = document.querySelector(".download-save-button")


const status = document.querySelector(".status-info")
const updateInfo = document.querySelector(".update-info")
const fileInput = document.getElementById('fileInput');
const patreonInput = document.getElementById('patreonInput');
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

export let game_version = 2023;
export let custom_team = false;
let firstShow = false;
let configCopy;

let managingTeamChanged = false;
let isSaveSelected = 0;
let scriptSelected = 0;
let divBlocking = 1;
let saveName;
let tempImageData = null;

let calendarEditMode = "Start2024"

export let selectedTheme = "default-theme";

let versionNow;
const versionPanel = document.querySelector('.version-panel');
const parchModalTitle = document.getElementById("patchModalTitle")

let notificationsQueue = [];
let isShowingNotification = false;

const repoOwner = 'IUrreta';
const repoName = 'DatabaseEditor';



(function () {
    const originalLog = console.log;
    const originalError = console.error;

    const logArray = [];

    console.log = function (...args) {
        logArray.push({
            type: 'log',
            message: args,
            timestamp: new Date()
        });
        originalLog.apply(console, args);
    };

    console.error = function (...args) {
        logArray.push({
            type: 'error',
            message: args,
            timestamp: new Date()
        });
        originalError.apply(console, args);
    };

    window.getLogEntries = () => logArray;
})();


export function setSaveName(name) {
    saveName = name;
}

export function setIsShowingNotification(value) {
    isShowingNotification = value;
}



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
    }, 150)
    notificationPanel.appendChild(toast);
    if (code !== "error") {
        setTimeout(function () {
            toast.classList.add("hide")
            setTimeout(function () {
                notificationPanel.removeChild(toast);
            }, 130);
        }, 4000);
    }
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
    driverName = make_name_prettier(driverName);
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
        mentality = mentality.slice(0, -1)
        globalMentality = Math.floor(globalMentality / 3)
    }
    document.querySelector(".clicked").dataset.globalMentality = globalMentality
    let new_ovr = calculateOverall(stats, typeOverall);
    document.querySelector(".clicked").childNodes[1].childNodes[0].textContent = new_ovr

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


    const command = new Command("editStats", dataStats);
    command.execute();
}

function calendarModeHandler() {
    let dataCodesString = '';
    let raceArray = [];

    document.querySelectorAll(".race-calendar").forEach((race) => {
        let raceData = {
            trackId: race.dataset.trackid.toString(),
            rainPractice: race.dataset.rainP.toString(),
            rainQuali: race.dataset.rainQ.toString(),
            rainRace: race.dataset.rainR.toString(),
            type: race.dataset.type.toString(),
            state: race.dataset.state.toString()
        };
        raceArray.push(raceData);
        dataCodesString += race.dataset.trackid.toString() + race.dataset.rainP.toString() + race.dataset.rainQ.toString() + race.dataset.rainR.toString() + race.dataset.type.toString() + race.dataset.state.toString() + ' ';
    });

    dataCodesString = dataCodesString.trim();
    let dataCalendar = {
        calendarCodes: dataCodesString,
        racesData: raceArray
    };

    const command = new Command("editCalendar", dataCalendar);
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

    const command = new Command("editTeam", data);
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

        const command = new Command("editPerformance", data);
        command.execute();
    }
    else if (teamsEngine === "engines") {
        let engineData = gather_engines_data()
        data = {
            engines: engineData,
        }

        const command = new Command("editEngine", data);
        command.execute();
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
    // console.log("UPDATING FRONT")
    // console.log(data)
    let responseTyppe = data.responseMessage
    let message = data.content
    let handler = messageHandlers[responseTyppe];
    if (handler) {
        handler(message);
    }
    if (data.noti_msg !== undefined) {
        new_update_notifications(data.noti_msg, "success");
    }
    if (data.isEditCommand !== undefined) {
        checkOpenSlideUp()
    }
    if (data.unlocksDownload !== undefined) {
        downloadSaveButton.classList.remove("hidden")
    }
}

export function new_update_notifications(message, type = "success") {
    notificationsQueue.push(message);
    showNextNotification(type);
}

function showNextNotification(type) {
    if (isShowingNotification || notificationsQueue.length === 0) {
        return;
    }

    isShowingNotification = true;

    const nextMessage = notificationsQueue.shift();

    const footerNotification = document.querySelector('.footer-notification');
    footerNotification.innerHTML  = nextMessage;
    if (type === "error") {
        footerNotification.classList.add('error');
    }
    else{
        footerNotification.classList.remove('error');
    }

    footerNotification.classList.add('show');

    if (type !== "error") {
        setTimeout(() => {
            footerNotification.classList.remove('show');
    
            isShowingNotification = false;
            //wait another 250ms
            setTimeout(() => {
                showNextNotification();
            }, 550);
        }, 4000);
    }

}

export function make_name_prettier(text) {
    const words = text.trim().split(/\s+/);

    if (words.length < 2) {
        return "";
    }

    const lastWord = words.pop();

    return lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
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
    "Drivers fetched": (message) => {
        remove_drivers();
        removeStatsDrivers();
        listenersStaffGroups();
        place_drivers(message);
        sortList("free-drivers");
        place_drivers_editStats(message);
    },
    "Staff fetched": (message) => {
        remove_drivers(true);
        removeStatsDrivers(true);
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
        manage_config(message)
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
    },
    "Mod data fetched": (message) => {
        updateEditsWithModData(message)
    },
    "Mod compatibility": (message) => {
        updateModBlocking(message)
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
    edit_colors_dict("320", primary)
    edit_colors_dict("321", secondary)
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
    const reader = new FileReader();
    reader.onload = function () {
        tempImageData = reader.result;

        document.querySelector(".logo-preview").src = reader.result;
    };
    reader.readAsDataURL(file);
});

function replace_custom_team_logo(path) {
    // Si el string base64 no tiene el prefijo, se lo agregamos.
    if (!path.startsWith("data:image/")) {
        // Ajusta el tipo de imagen ("png", "jpeg", etc.) según corresponda.
        path = "data:image/png;base64," + path;
    }

    logos_disc[32] = path;
    document.querySelectorAll(".custom-replace").forEach(function (elem) {
        elem.src = path;
    });
    document.querySelector(".logo-preview").src = path;
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
        let image = localStorage.getItem(`${saveName}_image`);
        if (image) {
            replace_custom_team_logo(image);
        }
        if (info["primaryColor"]) {
            replace_custom_team_color(info["primaryColor"], info["secondaryColor"])
        }
        if (info["frozenMentality"] === 1) {
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

        document.querySelector(`.team-logo-container[data-teamid="${info["playerTeam"]}"]`).classList.add("active")

        update_mentality_span(info["mentalityFrozen"])
        let difficultySlider = document.getElementById("difficultySlider")
        difficultySlider.value = info["difficulty"]
        update_difficulty_span(info["difficulty"])
        if (info["difficulty"] === "-2") {
            load_difficulty_warnings(info["triggerList"])
        }
        else {
            manage_difficulty_warnings(difficulty_dict[parseInt(info["difficulty"])], info["triggerList"])
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
                let newElem;
                if (info === "porsche" || info === "toyota") {
                    newElem = document.createElement("img");
                    newElem.src = logos_configs[info];
                } else {
                    newElem = document.createElement("div");
                }
                newElem.className = elem.className;
                newElem.classList.remove("alphataurilogo", "toyotalogo", "hugologo", "porschelogo", "visarblogo", "ferrarilogo", "brawnlogo");
                newElem.classList.add(logos_classes_configs[info])
                elem.replaceWith(newElem);
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
        edit_colors_dict("80", value)
        alphaVarName = "--alphatauri-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alphaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        edit_colors_dict("81", value)
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
                elem.classList.remove("porschelogo")
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
        edit_colors_dict("80", value)
        alphaVarName = "--alphatauri-secondary"
        newVarName = "--alphatauri-secondary-original"
        change_css_variables(alphaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alphatauri-secondary-original").trim();
        edit_colors_dict("81", value)
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
                elem.classList.remove("alpinelogo")
                elem.classList.remove("andrettilogo")
                elem.classList.remove("renaultlogo")
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
        edit_colors_dict("50", value)
        alpineVarName = "--alpine-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alpineVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        edit_colors_dict("51", value)
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
                elem.classList.remove("andrettilogo")
                elem.classList.remove("renaultlogo")
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
        edit_colors_dict("50", value)
        alpineVarName = "--alpine-secondary"
        newVarName = "--alpine-secondary-original"
        change_css_variables(alpineVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alpine-secondary-original").trim();
        edit_colors_dict("51", value)
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
        edit_colors_dict("90", value)
        alfaVarName = "--alfa-secondary"
        newVarName = "--" + info + "-secondary"
        change_css_variables(alfaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
        edit_colors_dict("91", value)
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
        edit_colors_dict("90", value)
        alfaVarName = "--alfa-secondary"
        newVarName = "--alfa-secondary-original"
        change_css_variables(alfaVarName, newVarName)
        value = getComputedStyle(document.documentElement).getPropertyValue("--alfa-secondary-original").trim();
        edit_colors_dict("91", value)
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
    let alphatauri = document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value
    let alpine = document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value
    let alfa = document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value
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
    let playerTeam = managingTeamChanged ? document.querySelector(".team-logo-container.active").dataset.teamid : -1
    document.querySelectorAll(".dif-warning:not(.default)").forEach(function (elem) {
        let id = elem.id
        if (elem.classList.contains("disabled") || elem.classList.contains("d-none")) {
            disabledList[id] = 1
        }
        else {
            disabledList[id] = 0
        }
        if (elem.className === "dif-warning") {
            triggerList[id] = 0;
        }
        else {
            triggerList[id] = elem.classList && (elem.classList.contains("d-none") || elem.classList.contains("disabled")) ? -1 : inverted_difficulty_dict[elem.className.split(" ")[1]];
        }
    })
    let data = {
        alphatauri: alphatauri,
        alpine: alpine,
        alfa: alfa,
        frozenMentality: mentalityFrozen,
        difficulty: difficultyValue,
        refurbish: refurbish,
        disabled: disabledList,
        triggerList: triggerList,
        playerTeam: playerTeam
    }
    changeTheme()
    if (custom_team) {
        data["primaryColor"] = document.getElementById("primarySelector").value
        data["secondaryColor"] = document.getElementById("secondarySelector").value
        replace_custom_team_color(data["primaryColor"], data["secondaryColor"])
    }
    reload_performance_graph()
    reload_h2h_graphs()

    if (isSaveSelected === 1) {
        const command = new Command("configUpdate", data);
        command.execute();
        let info = { teams: { alphatauri: alphatauri, alpine: alpine, alfa: alfa } }
        replace_all_teams(info)
        reloadTables()
        if (tempImageData) {
            localStorage.setItem(`${saveName}_image`, tempImageData);
        }

        replace_custom_team_logo(document.querySelector(".logo-preview").src)
    }


})

document.querySelector(".bi-file-earmark-arrow-down").addEventListener("click", function () {
    dbWorker.postMessage({
        command: 'exportSave',
        data: {}
    });

    dbWorker.onmessage = (msg) => {
        const finalData = msg.data.content.finalData;
        const metadata = msg.data.content.metadata;

        saveAs(new Blob([finalData], { type: "application/binary" }), metadata.filename);
    };
})



/**
 * checks if a save and a script have been selected to unlock the tool
 */
function check_selected() {
    if (scriptSelected === 1) {
        document.getElementById("scriptSelected").classList.add("completed")
    }
    else {
        document.getElementById("scriptSelected").classList.remove("completed")
    }
    setTimeout(function () {
        if (isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1) {
            document.getElementById("blockDiv").classList.add("disappear")
            divBlocking = 0;
        }
    }, 150)

}

h2hPill.addEventListener("click", function () {

    manageScripts("hide", "show", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

viewPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "show", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

driverTransferPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "show", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

editStatsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "show", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "stats")
})

constructorsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "show", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "teams")
})


CalendarPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "show", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "calendar")
})

carPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "show", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(!viewingGraph, "performance")
})

modPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "show")
    scriptSelected = 1
    check_selected()
})

document.querySelector(".toolbar-logo-and-title").addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 0
    document.getElementById("blockDiv").classList.remove("disappear")
    if (document.querySelector(".scriptPills.active")) {
        document.querySelector(".scriptPills.active").classList.remove("active")
    }
    divBlocking = 1;
    check_selected()
})

gamePill.addEventListener("click", function () {
    document.querySelector("#editorChanges").classList.add("d-none")
    document.querySelector("#gameChanges").classList.remove("d-none")
    document.querySelector("#patreonChanges").classList.add("d-none")
})

editorPill.addEventListener("click", function () {
    document.querySelector("#editorChanges").classList.remove("d-none")
    document.querySelector("#gameChanges").classList.add("d-none")
    document.querySelector("#patreonChanges").classList.add("d-none")
})

patreonPill.addEventListener("click", function () {
    document.querySelector("#patreonChanges").classList.remove("d-none")
    document.querySelector("#editorChanges").classList.add("d-none")
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

function manage_difficulty_warnings(level, triggerList) {
    const elements = [
        "defaultDif", "lightDif", "researchDif", "statDif", "designTimeDif", "buildDif"
    ];
    const selectedConfig = difficultyConfig[level] || difficultyConfig["default"];

    elements.forEach(id => {
        document.getElementById(id).classList.add("d-none");
    });

    selectedConfig.visible.forEach(id => {
        document.getElementById(id).classList.remove("d-none");
    });

    elements.forEach(id => {
        if (selectedConfig[id] && triggerList[id] !== -1) {
            const elementConfig = selectedConfig[id];
            const element = document.getElementById(id);
            element.className = elementConfig.className;
            element.textContent = elementConfig.text;
        }
        else if (triggerList[id] === -1) {
            document.getElementById(id).classList.add("disabled")
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
            div.className = "script-view hide"
        }
    })
}

document.querySelector("#cancelDetailsButton").addEventListener("click", function () {
    manage_config_content(configCopy[0], false)
})

patreonKeyButton.addEventListener('click', () => {
    patreonInput.click();
});

patreonInput.addEventListener('change', async (e) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const text = await file.text();
    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch (err) {
        alert('Invalid file');
        return;
    }

    const { dateData, signature } = parsed;
    if (!dateData || !signature) {
        alert('Error');
        return;
    }

    const isValid = await verifySignature(dateData, signature, PUBLIC_KEY);
    if (isValid) {
        const dataObj = JSON.parse(dateData);

        localStorage.setItem('patreonKey', JSON.stringify({ dateData, signature }));
        checkPatreonStatus();
    } else {
        alert('Invalid file');
    }
});


async function isPatronSignatureValid() {
    const stored = localStorage.getItem('patreonKey');
    if (!stored) return false;

    try {
        const { dateData, signature } = JSON.parse(stored);

        const dataObj = JSON.parse(dateData);

        const valid = await verifySignature(dateData, signature, PUBLIC_KEY);
        return valid;
    } catch (err) {
        return false;
    }
}

async function checkPatreonStatus() {

    init_colors_dict(selectedTheme)
    const validSignature = await isPatronSignatureValid();

    if (validSignature) {
        patreonThemes.classList.remove("d-none");
        document.getElementById("patreonKeyText").textContent = "Patreon key loaded";
        loadTheme();
    }
}


async function checkOpenSlideUp() {
    const validSignature = await isPatronSignatureValid();


    const lastShownStr = localStorage.getItem('patreonModalLastShown');
    if (!canShowPatreonModal(lastShownStr) || validSignature) {
        return;
    }

    const delaySec = 5;
    setTimeout(() => {
        showPatreonModal();
        localStorage.setItem('patreonModalLastShown', new Date().toISOString());
    }, delaySec * 1000);
}


function showPatreonModal() {
    patreonLogo.classList.add("open-slide-up")
    setTimeout(() => {
        patreonSlideUp.classList.add("open")
    }, 350);
}

slideUpClose.addEventListener('click', () => {
    patreonSlideUp.classList.remove("open");
    patreonLogo.className = "bi-custom-patreon close-slide-up"
});


function canShowPatreonModal(lastShown) {
    if (!lastShown) return true; // Nunca se mostró, podemos mostrarlo
    const last = new Date(lastShown).getTime();
    const now = Date.now();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return diffDays >= 1;
}

/**
 * @param {string} dataString - Cadena JSON que se firmó en Node
 * @param {string} signatureHex - Firma en hex
 * @param {string} spkiPublicKey - Clave pública en formato PEM (SPKI)
 * @returns {Promise<boolean>}
 */
async function verifySignature(dataString, signatureHex, spkiPublicKey) {
    const keyBuffer = pemToArrayBuffer(spkiPublicKey);
    const publicKey = await crypto.subtle.importKey(
        "spki",
        keyBuffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const sigBuffer = hexToArrayBuffer(signatureHex);
    const dataBuffer = new TextEncoder().encode(dataString);

    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, sigBuffer, dataBuffer);
}


function pemToArrayBuffer(pem) {
    const b64 = pem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s+/g, "");
    const raw = atob(b64);
    const buffer = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        buffer[i] = raw.charCodeAt(i);
    }
    return buffer.buffer;
}


function hexToArrayBuffer(hex) {
    const length = hex.length / 2;
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return array.buffer;
}

document.addEventListener('DOMContentLoaded', () => {
    versionNow = APP_VERSION;
    const storedVersion = localStorage.getItem('lastVersion'); // Última versión guardada
    versionPanel.textContent = `${versionNow}`;
    parchModalTitle.textContent = "Version " + versionNow + " patch notes"
    document.querySelector(".splash-box").classList.add("appear")
    document.querySelector(".socials-box").classList.add("appear")
    getPatchNotes()
    checkPatreonStatus();
    populateMarquee();

    if (shouldShowPatchModal(storedVersion, versionNow)) {
        localStorage.setItem('lastVersion', versionNow); // Guardar nueva versión
        const patchModal = new bootstrap.Modal(document.getElementById('patchModal'));
        patchModal.show();
    }

});

function createMarqueeItem(name, tier) {
    const span = document.createElement("span");
    span.textContent = name;
    span.classList.add(tier);
    return span;
}

function populateMarquee() {
    const marqueeInner = document.querySelector(".marquee__inner");

    // Crear dos grupos de nombres para el scroll infinito
    const group1 = document.createElement("div");
    group1.classList.add("marquee__group");

    const group2 = document.createElement("div");
    group2.classList.add("marquee__group", "second-group");

    let randomizedMembers = members.sort(() => Math.random() - 0.5);

    randomizedMembers.forEach(member => {
        const item = createMarqueeItem(member.name, member.tier);
        group1.appendChild(item.cloneNode(true));
        group2.appendChild(item.cloneNode(true));
    });

    marqueeInner.appendChild(group1);
    marqueeInner.appendChild(group2);
}

document.querySelectorAll(".one-theme").forEach(function (elem) {
    elem.addEventListener("click", function () {
        selectedTheme = elem.dataset.theme
        document.querySelector(".one-theme.active").classList.remove("active")
        elem.classList.add("active")
    })
});

function changeTheme() {
    document.querySelector("body").className = `font ${selectedTheme}`
    localStorage.setItem("theme", selectedTheme)
    init_colors_dict(selectedTheme)

}

function loadTheme() {
    let theme = localStorage.getItem("theme")
    selectedTheme = theme || "default-theme"
    if (theme) {
        document.querySelector("body").className = `font ${selectedTheme}`
        document.querySelector(".one-theme.active").classList.remove("active")
        document.querySelector(`.one-theme[data-theme="${selectedTheme}"]`).classList.add("active")
    }
    init_colors_dict(selectedTheme)
    reload_performance_graph()
    reload_h2h_graphs()
}

document.getElementById('logButton').addEventListener('click', function () {
    const logs = window.getLogEntries();

    const logWindow = window.open('', '_blank');
    const doc = logWindow.document;

    const style = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .log { color: green; }
        .error { color: red; }
        pre { white-space: pre-wrap; word-break: break-word; max-width: 600px; }
    `;

    const head = doc.createElement('head');
    const title = doc.createElement('title');
    title.textContent = 'Log Console';

    const styleTag = doc.createElement('style');
    styleTag.textContent = style;

    head.appendChild(title);
    head.appendChild(styleTag);
    doc.head.appendChild(head);

    const body = doc.createElement('body');
    const heading = document.createElement('h2');
    heading.textContent = 'Logs';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Type', 'Message', 'Timestamp'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');

    logs.forEach(log => {
        const row = document.createElement('tr');

        const typeCell = document.createElement('td');
        typeCell.textContent = log.type.toUpperCase();
        typeCell.classList.add(log.type);

        const messageCell = document.createElement('td');
        const pre = document.createElement('pre');

        // Si el mensaje es un objeto, lo formateamos como JSON
        pre.textContent = log.message.map(msg =>
            typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg
        ).join(' ');

        messageCell.appendChild(pre);

        const timestampCell = document.createElement('td');
        timestampCell.textContent = new Date(log.timestamp).toLocaleString();

        row.appendChild(typeCell);
        row.appendChild(messageCell);
        row.appendChild(timestampCell);
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    body.appendChild(heading);
    body.appendChild(table);
    doc.body.appendChild(body);
});

/**
 * Verifies if the patch modal should be shown
 * @param {string|null} storedVersion - Version stored in localStorage
 * @param {string} versionNow - Current version of the app
 * @returns {boolean} - True if the modal should be shown, false otherwise
 */
function shouldShowPatchModal(storedVersion, versionNow) {
    if (!storedVersion) return true; // Si no hay una versión guardada, mostrar el modal

    const storedParts = storedVersion.split('.').map(Number);
    const currentParts = versionNow.split('.').map(Number);

    return storedParts[0] < currentParts[0] || storedParts[1] < currentParts[1];
}

function updateModBlocking(data) {
    if (data === "AlreadyEdited") {
        document.querySelector(".mod-blocking").classList.add("d-none")
        document.querySelector(".changes-grid").classList.remove("d-none")
    }
    else if (data === "Start2024") {
        document.querySelector(".mod-blocking").classList.add("d-none")
        document.querySelector(".changes-grid").classList.remove("d-none")

        document.querySelector(".time-travel").classList.remove("disabled")
        document.querySelector(".time-travel span").textContent = "Apply"
    }
    else if (data === "Direct2025" || data === "End2024") {
        document.querySelector(".mod-blocking").classList.add("d-none")
        document.querySelector(".changes-grid").classList.remove("d-none")

        document.querySelector(".time-travel").classList.add("disabled")
        document.querySelector(".time-travel span").textContent = "Disabled"
        calendarEditMode = data;
    }
    else {
        document.querySelector(".mod-blocking").classList.remove("d-none")
        document.querySelector(".changes-grid").classList.add("d-none")
    }
}

document.querySelector(".time-travel").addEventListener("click", function () {
    const command = new Command("timeTravel", { dayNumber: 45657 });
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelector(".change-line-ups").addEventListener("click", function () {
    const command = new Command("changeLineUps", {});
    command.execute();
    document.querySelector(".ham-transfer").classList.remove("mefont")
    document.querySelector(".sai-transfer").classList.remove("fefont")
    document.querySelector(".ham-transfer").classList.add("fefont")
    document.querySelector(".sai-transfer").classList.add("wifont")
    document.querySelector(".ant-transfer").classList.add("mefont")
    document.querySelector(".ant-ovr").classList.add("mefont")
    document.querySelector(".bor-ovr").classList.remove("mcfont")
    document.querySelector(".bor-ovr").classList.add("affont")
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelector(".change-stats").addEventListener("click", function () {
    const command = new Command("changeStats", {});
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelector(".change-cfd").addEventListener("click", function () {
    const command = new Command("changeCfd", {});
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelector(".change-regulations").addEventListener("click", function () {
    const command = new Command("changeRegulations", {});
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelector(".extra-drivers").addEventListener("click", function () {
    const command = new Command("extraDrivers", {});
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"

    document.querySelector(".change-line-ups").classList.remove("disabled")
    document.querySelector(".change-line-ups span").textContent = "Apply"
})

document.querySelector(".change-calendar").addEventListener("click", function () {
    const command = new Command("changeCalendar", { type: calendarEditMode });
    command.execute();
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})


document.querySelector(".change-performance").addEventListener("click", function () {
    const command = new Command("changePerformance", {});
    command.execute();
    document.querySelector(".mclaren-performance").innerText = "63.7%"
    document.querySelector(".redbull-performance").innerText = "59.4%"
    document.querySelector(".williams-performance").innerText = "56.8%"
    this.classList.add("completed")
    this.querySelector("span").textContent = "Applied"
})

document.querySelectorAll(".team-logo-container").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let active = document.querySelector(".team-logo-container.active")
        managingTeamChanged = true
        if (active) {
            active.classList.remove("active")
        }
        elem.classList.add("active")
    })
});