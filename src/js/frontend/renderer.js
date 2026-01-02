import { marked } from 'marked';
import DOMPurify from 'dompurify';

import { resetTeamEditing, fillLevels, longTermObj, originalCostCap, gather_team_data, gather_pit_crew, teamCod } from './teams';
import {
    resetViewer, generateYearsMenu, resetYearButtons, update_logo, setEngineAllocations, engine_names, new_drivers_table, new_teams_table,
    new_load_drivers_table, new_load_teams_table, addEngineName, deleteEngineName, reloadTables
} from './seasonViewer';
import { combined_dict, abreviations_dict, codes_dict, logos_disc, mentality_to_global_menatality, difficultyConfig, default_dict, weightDifConfig, defaultDifficultiesConfig, turningPointsFrequencyLevels, defaultTurningPointsFrequencyPreset, normalizeTurningPointsFrequencyPreset, getTurningPointsFrequencyLabel } from './config';
import {
    freeDriversDiv, insert_space, place_staff, remove_drivers, add_marquees_transfers, place_drivers, sortList, update_name,
    manage_modal,
    loadJuniorTeamDrivers,
    initFreeDriversElems
} from './transfers';
import { load_calendar } from './calendar';
import {
    load_performance, load_performance_graph, load_attributes, manage_engineStats, load_cars, load_custom_engines,
    order_by, load_car_attributes, viewingGraph, engine_allocations, load_parts_stats, load_parts_list, update_max_design, teamsEngine, load_one_part,
    teamSelected, gather_engines_data, reload_performance_graph
} from './performance';
import {
    removeStatsDrivers, place_drivers_editStats, place_staff_editStats, typeOverall, setStatPanelShown, setTypeOverall,
    typeEdit, setTypeEdit, change_elegibles, getName, calculateOverall, listenersStaffGroups,
    initStatsDrivers, loadNumbers
} from './stats';
import {
    resetH2H, hideComp, colors_dict, load_drivers_h2h, sprintsListeners, racePaceListener, qualiPaceListener, manage_h2h_bars, load_labels_initialize_graphs,
    reload_h2h_graphs, init_colors_dict, edit_colors_dict, setMidGrid, setMaxRaces, setRelativeGrid
} from './head2head';
import { place_news, updateNewsYearsButton } from './news.js';
import { load_regulations, gather_regulations_data } from './regulations.js';
import { loadRecordsList } from './seasonViewer';
import { updateEditsWithModData } from '../backend/scriptUtils/modUtils.js';
import { dbWorker, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, processSaveFile } from './dragFile';
import { Command } from "../backend/command.js";
import { saveAs } from "file-saver";
import members from "../../data/members.json"

import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { getRecentHandles, saveHandleToRecents, removeRecentHandle } from './recentsManager.js';


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
const regulationsPill = document.getElementById("regulationspill");
const carPill = document.getElementById("carpill");
const viewPill = document.getElementById("viewerpill");
const h2hPill = document.getElementById("h2hpill");
const constructorsPill = document.getElementById("constructorspill")      
const newsPill = document.getElementById("newspill")
const modPill = document.getElementById("modpill")

export const editorPill = document.getElementById("editorPill")
export const gamePill = document.getElementById("gamePill")
const patreonPill = document.getElementById("patreonPill")

const driverTransferDiv = document.getElementById("driver_transfers");
const editStatsDiv = document.getElementById("edit_stats");
const customCalendarDiv = document.getElementById("custom_calendar");
const regulationsDiv = document.getElementById("regulations");
const carPerformanceDiv = document.getElementById("car_performance");
const viewDiv = document.getElementById("season_viewer");
const h2hDiv = document.getElementById("head2head_viewer");
const teamsDiv = document.getElementById("edit_teams");
const mod25Div = document.getElementById("mod_25")
const newsDiv = document.getElementById("news")

const patchNotesBody = document.getElementById("patchNotesBody")
const selectImageButton = document.getElementById('selectImage');
const patreonLoginButton = document.getElementById('patreonLoginButton');
const patreonLogoutButton = document.getElementById('patreonLogoutButton');
const patreonToolLoginButton = document.getElementById('patreonToolLoginButton');
const userToolButton = document.getElementById('userToolButton');
const saveFileButton = document.getElementById('saveFileButton');

const scriptsArray = [newsDiv, h2hDiv, viewDiv, driverTransferDiv, editStatsDiv, teamsDiv, customCalendarDiv, regulationsDiv, carPerformanceDiv, mod25Div]

const dropDownMenu = document.getElementById("dropdownMenu");

const notificationPanel = document.getElementById("notificationPanel");

const logButton = document.getElementById("logFileButton");
const patreonLogo = document.querySelector(".footer .bi-custom-patreon");
const patreonSlideUp = document.querySelector(".patreon-slide-up");
const slideUpClose = document.getElementById("patreonSlideUpClose")
const patreonUnlockables = document.querySelector(".patreon-unlockables")
const downloadSaveButton = document.querySelector(".download-save-button")

const patreonThemes = document.querySelector(".patreon-themes");

const status = document.querySelector(".status-info")
const updateInfo = document.querySelector(".update-info")

const turningPointsFrequencyConfig = document.getElementById("turningPointsFrequencyConfig");
const turningPointsFrequencySlider = document.getElementById("turningPointsFrequencySlider");
const turningPointsFrequencyLabel = document.getElementById("turningPointsFrequencyLabel");

function normalizeTurningPointsPresetIndex(rawIndex) {
    const idx = normalizeTurningPointsFrequencyPreset(rawIndex);
    const maxIndex = Math.max(0, (turningPointsFrequencyLevels?.length || 1) - 1);
    return Math.max(0, Math.min(maxIndex, idx));
}

function updateTurningPointsFrequencyUI() {
    if (!turningPointsFrequencySlider || !turningPointsFrequencyLabel) return;
    const idx = normalizeTurningPointsPresetIndex(turningPointsFrequencySlider.value);
    turningPointsFrequencySlider.value = String(idx);
    turningPointsFrequencyLabel.textContent = getTurningPointsFrequencyLabel(idx);
    const directionClass =
        idx === defaultTurningPointsFrequencyPreset
            ? "tp-default"
            : idx > defaultTurningPointsFrequencyPreset
                ? "tp-more"
                : "tp-less";
    turningPointsFrequencyLabel.className = `option-state ${directionClass}`;
}
const fileInput = document.getElementById('fileInput');
const saveFileInput = document.getElementById('saveFileInput');
const noNotifications = ["Custom Engines fetched", "Cars fetched", "Part values fetched", "Parts stats fetched", "24 Year", "Game Year", "Performance fetched", "Season performance fetched", "Config", "ERROR", "Montecarlo fetched", "TeamData Fetched", "Progress", "JIC", "Calendar fetched", "Contract fetched", "Staff Fetched", "Engines fetched", "Results fetched", "Year fetched", "Numbers fetched", "H2H fetched", "DriversH2H fetched", "H2HDriver fetched", "Retirement fetched", "Prediction Fetched", "Events to Predict Fetched", "Events to Predict Modal Fetched"]
const glowSpot = document.querySelector('.glow-spot');
const blockDiv = document.getElementById('blockDiv');

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
export let nightlyBlock = false;
let firstShow = false;
let configCopy;

let managingTeamChanged = false;
let isSaveSelected = 0;
let scriptSelected = 0;
let divBlocking = 1;
let saveName;
let tempImageData = null;
let lastVisibleIndex = 0;

let calendarEditMode = "Start2024"

export let selectedTheme = "default-theme";

let newsAvailable = {
    "normal": false,
    "turning": false,
}

let versionNow;
const versionPanel = document.querySelector('.version-panel');
const versionBadge = document.querySelector('.badge-version');
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

export function getSaveName() {
    return saveName;
}

export function setIsShowingNotification(value) {
    isShowingNotification = value;
}



/**
 * get the patch notes from the actual version fro the github api
 */
async function getPatchNotes() {
    try {
        if (versionNow.slice(-3) !== "dev" && !versionNow.includes("nightly")) {
            let response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/tags/${versionNow}`);
            let data = await response.json();
            let changes = data.body;
            let changesHTML = DOMPurify.sanitize(marked(changes));
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
        else if (versionNow.includes("nightly")) {
            let response = await fetch('/data/nightly_patch_notes.md');
            let changes = await response.text();
            let changesHTML = DOMPurify.sanitize(marked(changes));
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

// Patreon OAuth Logic
if (patreonLoginButton) {
    patreonLoginButton.addEventListener('click', () => {
        window.location.href = '/api/auth/patreon/login';
    });
}

if (patreonToolLoginButton) {
    patreonToolLoginButton.addEventListener('click', () => {
        window.location.href = '/api/auth/patreon/login';
    });
}

if (patreonLogoutButton) {
    patreonLogoutButton.addEventListener('click', () => {
        handleLogout();
    });
}

if (userToolButton) {
    userToolButton.addEventListener('click', () => {
        const userToolMenu = document.querySelector('.userToolMenu');
        if (userToolMenu) {
            userToolMenu.classList.toggle('hidden');
        }
    });
}

if (saveFileButton && saveFileInput) {
    saveFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            await processSaveFile(file);
        }
        saveFileInput.value = '';
    });

    saveFileButton.addEventListener('click', async () => {
        const ok = await confirmModal({
            title: "Warning about selecting your save file",
            body: "Selecting your save file this way (in stead of drag and drop) will not save your save in the Recents section. Are you sure you want to continue?",
            confirmText: "Continue",
            cancelText: "Cancel"
        })
        if (ok) {
            saveFileInput.click();
        }
    });
}



async function handleLogout() {
    try {
        const response = await fetch('/api/auth/patreon/logout');

        if (response.ok) {
            console.log("Logout successful");

            updatePatreonUI({ isLoggedIn: false, tier: 'Free' });

            window.location.reload();
        }
    } catch (error) {
        console.error("Logout failed", error);
    }
}

/**
 * Retrieves the user's Patreon tier from the cookie.
 * @returns {Promise<{paidMember: boolean, tier: string, isLoggedIn: boolean, user: {fullName: string}}>} An object containing the user's tier information.
 */
export async function getUserTier() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();

        // The structure matches what api/me.js returns
        return {
            paidMember: data.paidMember, // true/false
            tier: data.tier, // "Backer", "Insider", "Free", etc
            isLoggedIn: data.isLoggedIn,
            user: { fullName: data.user?.fullName || '' }
        };
    } catch (error) {
        console.error("Failed to check auth status", error);
        return { paidMember: false, tier: 'Free', isLoggedIn: false };
    }
}

async function validateSession() {
    try {
        const res = await fetch("/api/check-cookie");
        const data = await res.json();

        // Only force an OAuth refresh when an existing cookie is detected but invalid/legacy.
        // Not having a cookie simply means "not logged in" and should not redirect.
        if (data.valid === false && data.hasCookie === true) {
            console.log("Old Patreon cookie → redirecting to login");
            window.location.href = "/api/auth/patreon/login";
            return false;
        }

        return true;

    } catch (err) {
        console.error("Error checking Patreon session:", err);
        return false;
    }
}

// Check for OAuth code
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    console.log("There is code")
    // Clear the code from URL to prevent re-submission on refresh
    window.history.replaceState({}, document.title, window.location.pathname);

    fetch(`/api/auth/patreon/verify?code=${code}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                new_update_notifications(`Welcome ${data.user.fullName}! Tier: ${data.tier}`, "success");

                // Update UI
                updatePatreonUI(data);
                maybeReloadForNightlyAccess(data);
            } else {
                new_update_notifications(`Login failed: ${data.error}`, "error");
                updatePatreonUI(data);
            }
        })
        .catch(err => {
            console.error('Patreon verification error:', err);
            new_update_notifications("Error verifying Patreon status", "error");
        });
} else {
    validateSession().then(() => {
        getUserTier().then(updatePatreonUI);
    });
}

function maybeReloadForNightlyAccess(tierInfo) {
    const isNightly = window.location.hostname.includes("nightly");
    if (!isNightly) return;

    const insiderOrFounder = tierInfo?.tier === "Insider" || tierInfo?.tier === "Founder";
    if (nightlyBlock && tierInfo?.isLoggedIn && insiderOrFounder) {
        setTimeout(() => window.location.reload(), 50);
    }
}

function updatePatreonUI(tier) {
    init_colors_dict(selectedTheme)

    if (tier.paidMember) {
        patreonUnlockables.classList.remove("d-none");
        patreonThemes.classList.remove("d-none");
        document.getElementById("patreonStatusText").textContent = tier.tier
        loadTheme();
    }
    else {
        patreonUnlockables.classList.add("d-none");
        patreonThemes.classList.add("d-none");
        document.getElementById("patreonStatusText").textContent = tier.isLoggedIn ? tier.tier : "Not logged in"
    }

    if (tier.isLoggedIn) {
        document.querySelector(".user-name-and-logout-tool").classList.remove("d-none");
        document.getElementById("userToolName").textContent = tier.user.fullName;
        patreonToolLoginButton.classList.add("d-none");
    }
    else {
        document.querySelector(".user-name-and-logout-tool").classList.add("d-none");
        patreonToolLoginButton.classList.remove("d-none");
    }

    manageNewsStatus(tier);

    if (turningPointsFrequencyConfig) {
        const insiderOrFounder = tier?.tier === "Insider" || tier?.tier === "Founder";
        if (tier?.isLoggedIn && insiderOrFounder) {
            turningPointsFrequencyConfig.classList.remove("d-none");
        } else {
            turningPointsFrequencyConfig.classList.add("d-none");
        }
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

    let retirement = document.querySelector(".actual-retirement").textContent
    let age = document.querySelector(".actual-age").textContent
    document.querySelector(".clicked").dataset.retirement = retirement;
    let ageGap = parseInt(document.querySelector(".clicked").dataset.age - age);
    document.querySelector(".clicked").dataset.age = age;
    let newName = document.querySelector("#driverStatsTitle textarea")?.value ?? document.querySelector("#driverStatsTitle").textContent;
    if (newName === document.querySelector(".clicked").dataset.name) {
        newName = "-1"
    }
    else {
        update_name(id, newName)
    }
    let newCode = document.querySelector("#driverCode textarea")?.value ?? document.querySelector("#driverCode").textContent;
    if (newCode === document.querySelector(".clicked").dataset.code) {
        newCode = "-1"
    }
    else {
        document.querySelector(".clicked").dataset.driverCode = newCode
    }
    let driverNum = document.querySelector(".number-holder").textContent;
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
    const raceArray = [];

    document.querySelectorAll(".race-calendar").forEach((race) => {
        let raceData = {
            trackId: race.dataset.trackid.toString(),
            rainPractice: race.dataset.rainP.toString(),
            rainQuali: race.dataset.rainQ.toString(),
            rainRace: race.dataset.rainR.toString(),
            type: race.dataset.type.toString(),
            state: race.dataset.state.toString(),
            isF2Race: race.dataset.isf2 ? Number(race.dataset.isf2) : 0,
            isF3Race: race.dataset.isf3 ? Number(race.dataset.isf3) : 0,
        };
        raceArray.push(raceData);
    });

    let dataCalendar = {
        racesData: raceArray
    };

    const command = new Command("editCalendar", dataCalendar);
    command.execute();
}

function regulationsModeHandler() {
    const data = gather_regulations_data();
    if (!data) {
        new_update_notifications("Regulations not loaded", "error");
        return;
    }
    const command = new Command("editRegulations", data);
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
    button.removeEventListener("click", regulationsModeHandler);
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
    else if (mode === "regulations") {
        button.addEventListener("click", regulationsModeHandler);
    }
    else if (mode === "teams") {
        button.addEventListener("click", teamsModeHandler);
    }
    else if (mode === "performance") {
        button.addEventListener("click", performanceModeHandler);
    }
}

export async function updateFront(data) {
    console.log("UPDATING FRONT")
    console.log(data)
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
    footerNotification.innerHTML = nextMessage;
    if (type === "error") {
        footerNotification.classList.add('error');
    }
    else {
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

function orderTeamTemplatesByStandings(standingsRows) {
    const parent = document.querySelector(".main-columns-drag-section.teams-columns");
    if (!parent) return;

    const templates = Array.from(parent.querySelectorAll(":scope > .team-template"));
    if (templates.length === 0) return;

    const positionByTeamId = new Map();
    if (Array.isArray(standingsRows)) {
        standingsRows.forEach((row) => {
            if (!Array.isArray(row) || row.length < 2) return;
            const teamId = Number(row[0]);
            const position = Number(row[1]);
            if (!Number.isFinite(teamId) || !Number.isFinite(position) || position <= 0) return;
            const prev = positionByTeamId.get(teamId);
            if (!Number.isFinite(prev) || position < prev) {
                positionByTeamId.set(teamId, position);
            }
        });
    }

    const decorated = templates.map((el, index) => {
        const staffSection = el.querySelector(".staff-section[data-teamid]");
        const teamId = staffSection ? Number(staffSection.dataset.teamid) : NaN;
        const position = Number.isFinite(teamId) ? positionByTeamId.get(teamId) : undefined;
        return { el, index, teamId, position };
    });

    decorated.sort((a, b) => {
        const aHas = Number.isFinite(a.position);
        const bHas = Number.isFinite(b.position);
        if (aHas && bHas) return a.position - b.position;
        if (aHas) return -1;
        if (bHas) return 1;
        return a.index - b.index;
    });

    const frag = document.createDocumentFragment();
    decorated.forEach(({ el }) => frag.appendChild(el));
    parent.appendChild(frag);
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
        initFreeDriversElems();
        initStatsDrivers();
    },
    "Staff fetched": (message) => {
        remove_drivers(true);
        removeStatsDrivers(true);
        place_staff(message);
        sortList("free-staff")
        place_staff_editStats(message);
        initFreeDriversElems();
        initStatsDrivers();
    },
    "Calendar fetched": (message) => {
        load_calendar(message)
    },
    "Regulations fetched": (message) => {
        load_regulations(message)
    },
    "Engines fetched": (message) => {
        manage_engineStats(message[0]);
        update_engine_allocations(message);
    },
    "Contract fetched": (message) => {
        manage_modal(message);
    },
    "Junior team drivers fetched": (message) => {
        loadJuniorTeamDrivers(message);
    },
    "Year fetched": (message) => {
        generateYearsMenu(message);
    },
    "Previous year teams standings fetched": (message) => {
        const standings = message?.standings || message;
        orderTeamTemplatesByStandings(standings);
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
        document.querySelector("#transferpill").click();
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
    },
    "News fetched": (message) => {
        place_news(message, newsAvailable)
        updateNewsYearsButton(message)
        askFixDoublePointsBug(message)
    },
    "News from season fetched": (message) => {
        place_news(message, newsAvailable)
    },
    "Save selected finished": async (message) => {
        await migrateLegacyNewsOnce();
        generateNews();
    },
    "Record fetched": (message) => {
        loadRecordsList(message)
    },
    "Double points bug fixed": (message) => {
        //TODO CLICK ON THE FIRST EYAR OF yearMenu
    }
};

function removeLegacyKeys(base) {
    const lsNewsKey = `${base}_news`;
    const lsTPKey = `${base}_tps`;
    try {
        console.log("[migrate] Deleting legacy localStorage keys:", lsNewsKey, lsTPKey);
        localStorage.removeItem(lsNewsKey);
        localStorage.removeItem(lsTPKey);
    } catch (e) {
        console.warn("[migrate] Failed to remove legacy keys:", e);
    }
}

async function migrateLegacyNewsOnce() {
    const base = getSaveName().split('.')[0];
    const lsFlagKey = `${base}_migration_v1_done`;
    const lsNewsKey = `${base}_news`;
    const lsTPKey = `${base}_tps`;

    // 1) Si ya está migrado, BORRAR SIEMPRE y salir
    if (localStorage.getItem(lsFlagKey) === "1") {
        removeLegacyKeys(base);
        return;
    }

    // 2) Leer posibles datos legacy
    const lsNewsTxt = localStorage.getItem(lsNewsKey);
    const lsTPTxt = localStorage.getItem(lsTPKey);

    // 3) Si no hay nada que migrar, marca flag y BORRA igual por si quedaron restos
    if (!lsNewsTxt && !lsTPTxt) {
        localStorage.setItem(lsFlagKey, "1");
        removeLegacyKeys(base);
        return;
    }

    // 4) Hay algo que migrar → pide al worker
    try {
        const resp = await new Command("migrateFromLocalStorage", {
            base,
            lsNewsTxt, // pueden ser null; el worker ya valida
            lsTPTxt
        }).promiseExecute();

        // Considera como éxito "Migration done" o "Already migrated" por si reintentas
        if (resp?.responseMessage === "Migration done" || resp?.responseMessage === "Already migrated") {
            localStorage.setItem(lsFlagKey, "1");
            removeLegacyKeys(base); // BORRA tras éxito
        } else {
            console.warn("[migrate] Unexpected response:", resp);
            // Si quieres ser agresivo igualmente:
            localStorage.setItem(lsFlagKey, "1");
            removeLegacyKeys(base);
        }
    } catch (e) {
        console.error("[migrate] Migration error (front):", e);
        // No marcamos flag en error para poder reintentar después.
        // Pero si quieres limpiar sí o sí, podrías optar por:
        // removeLegacyKeys(base);
    }
}


if (glowSpot && blockDiv) {
    const defaultPosition = {
        left: '50%',
        top: '0',
        transform: 'translateX(-50%)',
    };

    let restoreTimeout;

    const isLandingVisible = () => !blockDiv.classList.contains('disappear');

    const resetGlowSpotPosition = () => {
        glowSpot.style.left = defaultPosition.left;
        glowSpot.style.top = defaultPosition.top;
        glowSpot.style.transform = defaultPosition.transform;
    };

    const updateGlowSpotPosition = (event) => {
        if (!isLandingVisible()) {
            return;
        }

        glowSpot.classList.remove('glow-spot--off');
        glowSpot.style.left = `${event.clientX}px`;
        glowSpot.style.top = `${event.clientY}px`;
        glowSpot.style.transform = 'translate(-50%, -50%)';
    };

    const fadeToDefaultPosition = () => {
        glowSpot.classList.add('glow-spot--off');

        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(() => {
            resetGlowSpotPosition();
            glowSpot.classList.remove('glow-spot--off');
        }, 200);
    };

    const observer = new MutationObserver(() => {
        if (isLandingVisible()) {
            glowSpot.classList.remove('glow-spot--off');
        } else {
            fadeToDefaultPosition();
        }
    });

    observer.observe(blockDiv, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('mousemove', updateGlowSpotPosition);
}

export async function generateNews() {
    const patreonTier = await getUserTier();
    const canGenerate = checkGenerableNews(patreonTier);
    if (canGenerate === "no") return;

    // lanzar sin payload, el worker lee de DB
    new Command("generateNews", {}).execute();

    // loader UI (igual que antes si quieres)
    const newsView = document.getElementById("news");
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('loader-div', 'general-news-loader');

    const loadingSpan = document.createElement('span');
    loadingSpan.textContent = "Updating news";
    const loadingDots = document.createElement('span');
    loadingDots.textContent = ".";
    loadingDots.classList.add('loading-dots');
    loadingSpan.textContent = "Updating news";
    loadingSpan.appendChild(loadingDots);


    setInterval(() => {
        if (loadingDots.textContent.length >= 3) loadingDots.textContent = ".";
        else loadingDots.textContent += ".";
    }, 500);

    const progressBar = document.createElement('div');
    progressBar.classList.add('ai-progress-bar');
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('progress-div', 'general-news-progress-div');

    loaderDiv.appendChild(loadingSpan);
    progressBar.appendChild(progressDiv);
    loaderDiv.appendChild(progressBar);

    startGeneralNewsProgress(progressDiv);
    newsView.appendChild(loaderDiv);
}


export function startGeneralNewsProgress(progressDiv) {
    let width = 0;
    const id = setInterval(() => {
        if (!progressDiv?.isConnected) { clearInterval(id); return; }

        if (width >= 100) {
            clearInterval(id);
            return;
        }
        width++;
        progressDiv.style.width = width + '%';
    }, 150);

    progressDiv._progressIntervalId = id;
}

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
        const command = new Command("updateCombinedDict", { teamID: 32, newName: nameColor[1] });
        command.execute();

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
    //if not image selected, return
    if (!path) {
        return;
    }
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
    document.querySelector(".bi-gear-fill#settingsIcon").classList.remove("hidden")
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
        update_difficulty_info(info["triggerList"])
        update_mentality_span(info["frozenMentality"])
        update_refurbish_span(info["refurbish"])

        if (turningPointsFrequencySlider) {
            const presetIndex = normalizeTurningPointsPresetIndex(info?.turningPointsFrequencyPreset);
            turningPointsFrequencySlider.value = String(presetIndex);
            updateTurningPointsFrequencyUI();
        }
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

function update_difficulty_info(triggerList) {
    console.log("TRIGGER LIST", triggerList)
    //iterate through the objetc
    for (let key in triggerList) {
        let value = triggerList[key];
        let nameSpan = document.getElementById(key)
        if (!nameSpan) continue;
        let status = nameSpan.parentNode.querySelector(".dif-status")
        let options;
        if (key === "lightDif"){
            options = weightDifConfig
        }
        else{
            options = defaultDifficultiesConfig
        }
        if (value < 0) {
            value = 0;
        }
        status.dataset.value = value;
        status.textContent = options[value].text;
        status.className = `dif-status ${options[value].className}`;
    }
}


function alphaTauriReplace(info) {
    document.querySelector("#alphaTauriReplaceButton").querySelector("button span").textContent = names_configs[info]
    document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value = info
    combined_dict[8] = pretty_names[info]
    abreviations_dict[8] = abreviations_for_replacements[info]
    const command = new Command("updateCombinedDict", { teamID: 8, newName: pretty_names[info] });
    command.execute();
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
    document.querySelector("#alpineReplaceButton").querySelector("button span").textContent = names_configs[info]
    document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value = info
    combined_dict[5] = pretty_names[info]
    abreviations_dict[5] = abreviations_for_replacements[info]
    const command = new Command("updateCombinedDict", { teamID: 5, newName: pretty_names[info] });
    command.execute();
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
    document.querySelector("#alfaReplaceButton").querySelector("button span").textContent = names_configs[info]
    document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value = info
    combined_dict[9] = pretty_names[info]
    abreviations_dict[9] = abreviations_for_replacements[info]
    const command = new Command("updateCombinedDict", { teamID: 9, newName: pretty_names[info] });
    command.execute();
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
            elem.querySelector("button span").textContent = a.textContent
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
    let disabledList = {}
    let triggerList = {}
    let playerTeam = managingTeamChanged ? document.querySelector(".team-logo-container.active").dataset.teamid : -1
    document.querySelectorAll(".dif-status").forEach(function (elem) {
        let id = elem.parentNode.querySelector(".dif-name").id
        triggerList[id] = elem.dataset.value
    })
    let data = {
        alphatauri: alphatauri,
        alpine: alpine,
        alfa: alfa,
        frozenMentality: mentalityFrozen,
        refurbish: refurbish,
        disabled: disabledList,
        triggerList: triggerList,
        playerTeam: playerTeam
    }

    const tpPresetIndex = normalizeTurningPointsPresetIndex(turningPointsFrequencySlider?.value);
    data.turningPointsFrequencyPreset = tpPresetIndex;

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

async function askFixDoublePointsBug(message){
    const bugInfo = message.doublePointsBug;
    if (!bugInfo.result) return;
    if (localStorage.getItem(`${saveName}_doublePointsBugIgnored_${bugInfo.raceId}`) === 'true') {
        return;
    }
    const ok = await confirmModal({
        title: 'Fix Double Points Bug',
        body: 'The current save has a known issue with double points being awarded in certain races where a double DSQ Turning point happened. Do you want to fix this issue now?',
        confirmText: 'Yes, fix it',
        cancelText: 'No, ignore',
    })
    if (ok) {
        const command = new Command("fixDoublePointsBug", { raceId: bugInfo.raceId });
        command.execute();
    }
    else{
        //save in lcoalstorage a flag that he didn't want to fix the bug with raceid bugInfo.raceId
        localStorage.setItem(`${saveName}_doublePointsBugIgnored_${bugInfo.raceId}`, 'true');
    }
}

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
    if (isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1) {
        document.getElementById("blockDiv").classList.add("disappear")
        divBlocking = 0;
    }

}

h2hPill.addEventListener("click", function () {

    manageScripts("hide", "show", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

viewPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "show", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

driverTransferPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "show", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

editStatsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "show", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "stats")
})

constructorsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "show", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "teams")
})


CalendarPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "show", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "calendar")
})

regulationsPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "show", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(true, "regulations")
})

carPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "show", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(!viewingGraph, "performance")
})

modPill.addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "show")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

newsPill.addEventListener("click", function () {
    manageScripts("show", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
    scriptSelected = 1
    check_selected()
    manageSaveButton(false)
})

document.querySelector(".toolbar-logo-and-title").addEventListener("click", function () {
    manageScripts("hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
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

if (turningPointsFrequencySlider) {
    updateTurningPointsFrequencyUI();
    turningPointsFrequencySlider.addEventListener("input", updateTurningPointsFrequencyUI);
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



document.querySelectorAll(".one-difficulty .bi-plus").forEach(function (elem) {
    const title = elem.parentNode.parentNode
    const status = title.querySelector(".dif-status")
    const name = title.querySelector(".dif-name")
    let options;
    if (name.id === "lightDif") {
        options = weightDifConfig
    }
    else{
        options = defaultDifficultiesConfig
    }
    const maxOptions = Object.keys(options).length;
    elem.addEventListener("click", function () {
        let actualValue = parseInt(status.dataset.value);
        let newValue = (actualValue + 1) % maxOptions;
        status.dataset.value = newValue;
        status.textContent = options[newValue].text;
        status.className = `dif-status ${options[newValue].className}`;
    });
});

document.querySelectorAll(".one-difficulty .bi-dash").forEach(function (elem) {
    const title = elem.parentNode.parentNode
    const status = title.querySelector(".dif-status")
    const name = title.querySelector(".dif-name")
    let options;
    if (name.id === "lightDif"){
        options = weightDifConfig
    }
    else{
        options = defaultDifficultiesConfig
    }
    const maxOptions = Object.keys(options).length;
    elem.addEventListener("click", function () {
        let actualValue = parseInt(status.dataset.value);
        let newValue = (actualValue - 1 + maxOptions) % maxOptions;
        status.dataset.value = newValue;
        status.textContent = options[newValue].text;
        status.className = `dif-status ${options[newValue].className}`;
    });
});


/**
 * Manages the stats of the divs associated with the pills
 * @param  {Array} divs array of state of the divs
 */
function manageScripts(...divs) {
    const newIndex = divs.findIndex(s => s === "show");
    const prevIndex = lastVisibleIndex;


    scriptsArray.forEach((div, i) => {

        div.ontransitionend = null;
        div.onanimationend = null;
        div.classList.remove("enter-from-right", "enter-from-left");

        if (i === newIndex) {
            div.classList.remove("unloaded");

            requestAnimationFrame(() => {
                div.classList.remove("hide");

                const enterClass = newIndex > prevIndex
                    ? "enter-from-right"
                    : "enter-from-left";


                div.classList.add(enterClass);

                div.onanimationend = () => {
                    div.classList.remove(enterClass);
                    div.onanimationend = null;
                };
            });

        } else {

            requestAnimationFrame(() => {
                div.classList.add("hide");
            });

            div.ontransitionend = (e) => {
                if (e.propertyName === "opacity" && div.classList.contains("hide")) {
                    div.classList.add("unloaded");
                    div.ontransitionend = null;
                }
            };
        }
    });

    lastVisibleIndex = newIndex >= 0 ? newIndex : lastVisibleIndex;
}

document.querySelector("#cancelDetailsButton").addEventListener("click", function () {
    manage_config_content(configCopy, false)
})






function manageNewsStatus(patreonTier) {
    const generateNews = checkGenerableNews(patreonTier);
    if (generateNews === "yes") {
        const newsgenerationEnded = document.querySelector('.news-generation-ended');
        if (newsgenerationEnded) {
            newsgenerationEnded.remove();
            const newsGrid = document.createElement('div');
            newsGrid.className = 'news-grid';
            document.querySelector('#news').appendChild(newsGrid);
            generateNews();
        }
    }

}

function checkGenerableNews(patreonTier) {
    let canGenerate = "no";
    if (patreonTier.paidMember) {
        canGenerate = "yes";
        if (patreonTier.tier === "Insider" || patreonTier.tier === "Founder") {
            newsAvailable.normal = true;
            newsAvailable.turning = true;
        }
        else if (patreonTier.tier === "Backer") {
            newsAvailable.normal = true;
            newsAvailable.turning = false;
        }
    }
    return canGenerate;
}


async function checkOpenSlideUp() {
    const tier = await getUserTier();
    if (tier.paidMember) return;

    const lastShownStr = localStorage.getItem('patreonModalLastShown');
    if (!canShowPatreonModal(lastShownStr)) {
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


document.addEventListener('DOMContentLoaded', async () => {
    const hostname = window.location.hostname;
    const isNightly = hostname.includes("nightly");
    versionNow = APP_VERSION;

    if (isNightly) {
        const favicon = document.querySelector('link[rel="icon"]'); //testing
        if (favicon) favicon.href = "../assets/images/logoNightly.png";

        const logoImg = document.querySelector(".toolbar-logo");
        if (logoImg) logoImg.src = "../assets/images/logoNightly.svg";
        document.querySelector(".toolbar-title").classList.add("nightly");

        const moonIcon = document.createElement("i");
        moonIcon.className = "bi bi-moon-fill nightly-icon";
        document.querySelector(".toolbar-title").appendChild(moonIcon);

        const tierInfo = await getUserTier();
        let restrictionMessage = null;
        const insiderOrFounder = tierInfo.tier === "Insider" || tierInfo.tier === "Founder";

        if (tierInfo.isLoggedIn && !insiderOrFounder) {
            restrictionMessage = "Please upgrade to the Insider or Founder tier on Patreon to access the nightly version.";
        } else if (!tierInfo.isLoggedIn) {
            restrictionMessage = "Please log in with your Patreon account to access the nightly version.";
        }

        if (restrictionMessage !== null) {
            nightlyBlock = true;
            const dropDiv = document.querySelector(".drop-div");
            dropDiv.removeEventListener("dragover", handleDragOver);
            dropDiv.removeEventListener("dragenter", handleDragEnter);
            dropDiv.removeEventListener("dragleave", handleDragLeave);
            dropDiv.removeEventListener("drop", handleDrop);
            document.getElementById("statusIcon").className = "bi bi-lock";
            document.getElementById("statusTitle").textContent = "Nightly version is only available for patrons.";
            document.getElementById("statusDesc").textContent = restrictionMessage;

            const recentsContainer = document.querySelector(".recents-container");
            if (recentsContainer) recentsContainer.remove();

            document.querySelectorAll(".script-view").forEach(div => {
                div.remove();
            });
        }

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear());
        const shortBuildId = BUILD_ID.startsWith("dpl_")

            ? BUILD_ID.replace("dpl_", "").slice(0, 7)
            : BUILD_ID.slice(0, 7);
        versionNow = `${APP_VERSION.replace("-dev", "")}.nightly.${day}-${month}-${year}.${shortBuildId}`;
        //remove -dev from APP_VERSION

        versionPanel.classList.add("nightly");
    }

    updateRateLimitsDisplay();

    const storedVersion = localStorage.getItem('lastVersion'); // Última versión guardada
    versionPanel.textContent = `${versionNow}`;
    versionBadge.textContent = `Version ${versionNow}`;
    parchModalTitle.textContent = "Version " + versionNow + " patch notes"
    getPatchNotes()

    if (shouldShowPatchModal(storedVersion, versionNow)) {
        localStorage.setItem('lastVersion', versionNow); // Guardar nueva versión
        const patchModal = new bootstrap.Modal(document.getElementById('patchModal'));
        patchModal.show();
    }

    let recents = await getRecentHandles();
    populateRecentHandles(recents);


    let phrases = [
        "Change the contract of every staff available in game",
        "Customize your calendar however you want it",
        "Edit the attributes of each driver just how you want them",
        "Create your own custom engines",
        "Get stories from your save using AI",
        "Compare drivers and teams with detailed graphs",
        "Modify car performance to your liking",
        "Fix game-breaking issues with ease",
        "No installation required, works in your browser",
    ];

    //reorder them randomly
    phrases = phrases.sort(() => Math.random() - 0.5);

    const animatedText = document.getElementById('animatedText');
    const fakeText = document.querySelector('.fake-text');
    let phraseIndex = 0;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function animateTextLoop() {
        while (true) {
            const currentPhrase = phrases[phraseIndex];
            fakeText.textContent = currentPhrase;

            // Typing phase
            for (let i = 0; i < currentPhrase.length; i++) {
                const char = currentPhrase[i];
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                animatedText.appendChild(span);
                await sleep(10); // Typing speed
            }

            // Wait phase (read time)
            await sleep(5000);

            // Deleting phase
            while (animatedText.firstChild) {
                if (animatedText.lastChild) {
                    animatedText.removeChild(animatedText.lastChild);
                }
                await sleep(8); // Deleting speed
            }

            // Move to next phrase
            phraseIndex = (phraseIndex + 1) % phrases.length;

            // Small pause before typing next one
            await sleep(200);
        }
    }

    // Clear initial text and start animation loop
    animatedText.innerHTML = '';
    animateTextLoop();
});

export async function updateRateLimitsDisplay() {
  try {
    const res = await fetch("/api/usage-today");
    if (!res.ok) return;

    const { used, limit, percentage } = await res.json();

    const fill = document.getElementById("limitBarFill");
    const text = document.getElementById("limitText");
    const container = document.getElementById("rateLimitContainer");

    //100% corresponds to not using any
    fill.style.width = `${100 - percentage}%`;

    // limpiar estados previos
    container.classList.remove(
      "rate-ok",
      "rate-warning",
      "rate-danger",
      "rate-blocked"
    );

    let message = "";
    let state = "";

    if (percentage === 0) {
        state = "rate-ok";
        message = "All requests available";
    } else if (percentage < 50) {
        state = "rate-ok";
        message = "Plenty of requests available";
    } else if (percentage < 80) {
        state = "rate-warning";
        message = "You're halfway through today's limit";
    } else if (percentage < 100) {
        state = "rate-danger";
        message = "Only a few requests left today";
    } else {
        state = "rate-blocked";
        message = "Daily limit reached";
    }

    container.classList.add(state);
    text.textContent = message;

  } catch (err) {
    console.error("Failed to update rate limits display:", err);
  }
}


const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getRecentsTimeLabel(openedDate, now = new Date()) {
    const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOpened = new Date(openedDate.getFullYear(), openedDate.getMonth(), openedDate.getDate());
    let diffDays = Math.round((startNow - startOpened) / MS_PER_DAY);
    if (diffDays < 0) diffDays = 0;

    if (diffDays === 0) {
        return "Today";
    }
    if (diffDays === 1) {
        return "Yesterday";
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function populateRecentHandles(recents) {
    if (recents.length === 0) {
        const recentsContainer = document.querySelector(".recents-container");
        if (recentsContainer) recentsContainer.classList.add("d-none");
        return;
    }
    const recentList = document.getElementById("recentsList");
    recentList.innerHTML = ""; // Clear existing items

    recents.forEach(handle => {
        const listItem = document.createElement("div");
        listItem.className = "recent-file";

        const fileName = document.createElement("span");
        fileName.classList.add("file-name");
        fileName.textContent = handle.name;
        fileName.addEventListener("click", async () => {
            const fileHandle = handle.handle;
            const hasPermission = await verifyPermission(fileHandle, false);

            if (!hasPermission) {
                console.error("No permission to access the file:", handle.name);
                return;
            }
            const file = await fileHandle.getFile();
            await saveHandleToRecents(fileHandle);
            handle.lastOpened = new Date();
            updateTimeLabel();
            processSaveFile(file);

        });

        const lastOpened = document.createElement("span");
        lastOpened.classList.add("last-opened-time");
        const updateTimeLabel = () => {
            const openedDate = new Date(handle.lastOpened);
            lastOpened.textContent = getRecentsTimeLabel(openedDate);
        };

        updateTimeLabel();

        lastOpened.addEventListener("mouseenter", () => {
            lastOpened.textContent = "Remove";
        });

        lastOpened.addEventListener("mouseleave", () => {
            updateTimeLabel();
        });

        lastOpened.addEventListener("click", async () => {
            await removeRecentHandle(handle.name);
            listItem.remove();
            if (recentList.children.length === 0) {
                const recentsContainer = document.querySelector(".recents-container");
                if (recentsContainer) recentsContainer.classList.add("d-none");
            }
        });

        listItem.appendChild(fileName);
        listItem.appendChild(lastOpened);
        recentList.appendChild(listItem);
    });
}

async function verifyPermission(fileHandle) {
    const options = { mode: 'read' };

    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }

    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }

    return false;
}

function createMarqueeItem(name, tier) {
    const span = document.createElement("span");
    span.textContent = name;
    span.classList.add(tier);
    return span;
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


export async function confirmModal({
    title,
    body,
    confirmText,
    cancelText
}) {
    const modalEl = document.getElementById('confirmModal');
    const bsModal = new bootstrap.Modal(modalEl, { keyboard: false });

    // Elementos
    const confirmTitle = modalEl.querySelector('.modal-title');
    const confirmBody = modalEl.querySelector('.modal-body p');
    const confirmBtn = modalEl.querySelector('.confirm-modal');
    const cancelBtn = modalEl.querySelector('.close-modal');

    if (confirmTitle) confirmTitle.textContent = title;
    if (confirmBody) confirmBody.textContent = body;

    if (confirmBtn) {
        if (confirmText) {
            confirmBtn.textContent = confirmText;
            confirmBtn.classList.remove('d-none');
        } else {
            confirmBtn.classList.add('d-none');
        }
    }

    if (cancelBtn) {
        if (cancelText) {
            cancelBtn.textContent = cancelText;
            cancelBtn.classList.remove('d-none');
        } else {
            cancelBtn.classList.add('d-none');
        }
    }

    return new Promise((resolve) => {
        let clicked = false;
        const controller = new AbortController();
        const { signal } = controller;

        confirmBtn?.addEventListener('click', () => {
            clicked = true;
            resolve(true);
            bsModal.hide();
        }, { once: true, signal });

        cancelBtn?.addEventListener('click', () => {
            clicked = true;
            resolve(false);
            bsModal.hide();
        }, { once: true, signal });

        modalEl.addEventListener('hidden.bs.modal', () => {
            if (!clicked) resolve(false);
            controller.abort();
        }, { once: true });

        bsModal.show();
    });
}

document.querySelectorAll(".redesigned-dropdown").forEach(dropdown => {
    dropdown.addEventListener("click", function (e) {
        e.stopPropagation();

        document.querySelectorAll(".redesigned-dropdown.open").forEach(openDropdown => {
            if (openDropdown !== dropdown) {
                openDropdown.classList.remove("open");
            }
        });

        dropdown.classList.toggle("open");
    });
});

document.addEventListener("click", function () {
    document.querySelectorAll(".redesigned-dropdown.open").forEach(openDropdown => {
        openDropdown.classList.remove("open");
    });
});

export function attachHold(btn, el, step = 1, opts = {}) {
    const min = opts.min ?? -Infinity;
    const max = opts.max ?? Infinity;
    const progressEl = opts.progressEl ?? null;
    const values = Array.isArray(opts.values) && opts.values.length ? opts.values.slice() : null;
    const loop = !!opts.loop;
    const onChange = typeof opts.onChange === 'function' ? opts.onChange : () => { };

    // NUEVO: Permitimos pasar una función de formateo
    const format = opts.format || ((v) => v);

    const initialDelay = opts.initialDelay ?? 400;
    const tiers = opts.tiers ?? [
        [0, 250],
        [750, 150],
        [1500, 80],
        [3000, 40],
    ];

    let timer, start;

    const getText = () => (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? (el.value ?? '') : (el.innerText ?? '');

    const setText = (txt) => {
        // NUEVO: Aplicamos el formato si es un número
        const valToDisplay = (typeof txt === 'number') ? format(txt) : txt;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = String(valToDisplay);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            const current = el.innerText || '';
            if (/-?\d+(\.\d+)?/.test(current) && typeof txt === 'number') {
                // Nota: Aquí el replace es delicado con formatos, 
                // para tu caso de Input suele bastar con la línea de arriba (el.value = ...)
                // pero si usas span, reemplazamos todo para evitar romper el formato parcial.
                el.innerText = String(valToDisplay);
            } else {
                el.innerText = String(valToDisplay);
            }
        }
    };

    const getNum = () => {
        if (values) return NaN;
        let raw = getText();

        // NUEVO: Eliminamos las comas antes de intentar parsear el número
        // Esto permite que "100,000" se convierta en "100000" para el cálculo
        raw = String(raw).replace(/,/g, '');

        const m = raw.match(/-?\d+(\.\d+)?/);
        return m ? parseFloat(m[0]) : 0;
    };

    const setNum = (val) => {
        const clamped = Math.max(min, Math.min(max, val));
        setText(clamped);
        updateProgress(clamped);
        onChange(clamped, currentPercent(clamped)); // Devuelve el valor numérico limpio
    };

    // ... El resto de funciones (findCurrentIndex, setIndex, etc.) se mantienen igual ...
    // Solo asegúrate de copiar el resto de tu lógica original aquí abajo.

    const findCurrentIndex = () => {
        const raw = String(getText()).trim();
        let idx = values.findIndex(v => String(v) === raw);
        if (idx === -1) {
            const numMatch = raw.replace(/,/g, '').match(/-?\d+(\.\d+)?/); // Ajuste aquí también por si acaso
            if (numMatch && values.every(v => !isNaN(parseFloat(v)))) {
                const num = parseFloat(numMatch[0]);
                idx = values.findIndex(v => Number(v) === num);
            }
        }
        return idx === -1 ? 0 : idx;
    };

    const setIndex = (i) => {
        const len = values.length;
        let next = i;
        if (loop) {
            next = ((i % len) + len) % len;
        } else {
            next = Math.max(0, Math.min(len - 1, i));
        }
        const val = values[next];
        setText(val);
        updateProgress(next, true);
        onChange(val, currentPercent(val, true));
        return next;
    };

    const pickInterval = (heldMs) => {
        let ms = tiers[0][1];
        for (const [t, interval] of tiers) {
            if (heldMs >= t) ms = interval; else break;
        }
        return ms;
    };

    const currentPercent = (valOrIdx, isIndex = false) => {
        if (values) {
            const len = values.length;
            if (len <= 1) return 100;
            const idx = isIndex ? valOrIdx : values.findIndex(v => String(v) === String(valOrIdx));
            const i = idx < 0 ? 0 : idx;
            return Math.round((i / (len - 1)) * 100);
        }
        if (isFinite(min) && isFinite(max) && max > min) {
            const v = Number(valOrIdx);
            const p = ((v - min) / (max - min)) * 100;
            return Math.round(Math.max(0, Math.min(100, p)));
        }
        return 0;
    };

    const updateProgress = (valOrIdx, isIndex = false) => {
        if (!progressEl) return;
        const p = currentPercent(valOrIdx, isIndex);
        progressEl.style.width = p + '%';
        progressEl.ariaValueNow = String(p);
    };

    const tick = () => {
        if (values) {
            const cur = findCurrentIndex();
            setIndex(cur + (step >= 0 ? +1 : -1));
        } else {
            const cur = getNum();
            setNum(cur + step);
        }
    };

    const startLoop = () => {
        start = performance.now();
        tick();
        const loopFn = () => {
            const held = performance.now() - start;
            timer = setTimeout(() => {
                tick();
                loopFn();
            }, pickInterval(held));
        };
        timer = setTimeout(loopFn, initialDelay);
    };

    const stopLoop = () => {
        clearTimeout(timer);
        timer = null;
    };

    const downEv = 'onpointerdown' in window ? 'pointerdown' : 'mousedown';
    const upEv = 'onpointerup' in window ? 'pointerup' : 'mouseup';
    const leaveEv = 'onpointerleave' in window ? 'pointerleave' : 'mouseleave';
    const cancelEv = 'pointercancel';

    btn.addEventListener(downEv, (e) => { e.preventDefault(); startLoop(); });
    document.addEventListener(upEv, stopLoop, true);
    document.addEventListener(cancelEv, stopLoop, true);
    btn.addEventListener(leaveEv, stopLoop, true);
}
