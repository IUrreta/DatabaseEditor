const fs = require('fs');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const path = require('path');
const { marked } = require('marked');
const { ipcRenderer } = require('electron');
let conn = 0;
let game_version = 2023;
let custom_team = false;
let customIconPath = null;
let firstShow = false;
let configCopy;


const batFilePath = path.join(__dirname,'../back/startBack.bat');



const socket = new WebSocket('ws://localhost:8765/');
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


let versionNow;
const versionPanel = document.querySelector('.version-panel');
const parchModalTitle = document.getElementById("patchModalTitle")

const repoOwner = 'IUrreta';
const repoName = 'DatabaseEditor';

/**
 * Fetches the version from the version.conf file
 */
fetch('./../launcher/version.conf')
    .then(response => response.text())
    .then(version => {
        versionPanel.textContent = `${version}`;
        versionNow = version
        parchModalTitle.textContent = "Version " + version + " patch notes"
        getPatchNotes()
    });

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
                patchNotesBody.replaceChild(h4Element,h1Element);
            });

            let h2Elements = patchNotesBody.querySelectorAll("h2");
            h2Elements.forEach(function (h1Element) {
                let h4Element = document.createElement("h4");
                h4Element.textContent = h1Element.textContent;
                h4Element.classList.add("bold-font")
                patchNotesBody.replaceChild(h4Element,h1Element);
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
function update_notifications(noti,code) {
    let newNoti;
    newNoti = document.createElement('div');
    newNoti.className = 'notification';
    newNoti.textContent = noti;
    let toast = createToast(noti,code)
    setTimeout(function () {
        toast.classList.remove("myShow")
    },300)
    notificationPanel.appendChild(toast);
    if (code !== "error") {
        setTimeout(function () {
            toast.classList.add("hide")
            setTimeout(function () {
                notificationPanel.removeChild(toast);
            },280);
        },4000);
    }
}

/**
 * Creates the toast with the message and the error status
 * @param {string} msg string with the notification message
 * @param {boolean} err if it's an error or not
 * @returns 
 */
function createToast(msg,cod) {
    let toastFull = document.createElement('div');
    let toastIcon = document.createElement('div');
    let toastBodyDiv = document.createElement('div');
    let generalDiv = document.createElement('div');
    let icon = document.createElement('i');
    let cross = document.createElement('i');


    generalDiv.classList.add('d-flex',"align-items-center")
    // Asignar clases y atributos
    toastFull.classList.add('toast',"d-flex","myShow","d-block","custom-toast")
    toastFull.style.flexDirection = "column"
    toastFull.setAttribute('role','alert');
    toastFull.setAttribute('aria-live','assertive');
    toastFull.setAttribute('aria-atomic','true');

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

    toastBodyDiv.classList.add('d-flex','toast-body',"custom-toast-body");
    toastBodyDiv.textContent = msg;
    toastBodyDiv.style.opacity = "1"
    toastBodyDiv.style.color = "white"
    toastBodyDiv.style.zIndex = "6"

    generalDiv.appendChild(toastIcon)
    generalDiv.appendChild(toastBodyDiv)
    toastFull.appendChild(generalDiv)
    toastFull.appendChild(cross)
    cross.className = "bi bi-x custom-toast-cross"
    cross.addEventListener("click",function () {
        toastFull.classList.add("hide")
        setTimeout(function () {
            notificationPanel.removeChild(toastFull);
        },280);
    })

    return toastFull;
}


function editModeHandler() {
    let stats = "";
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " ";
    });
    stats = stats.slice(0,-1);

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
        document.querySelectorAll(".mentality-level-indicator").forEach(function (elem,index) {
            mentality += elem.dataset.value + " "
            document.querySelector(".clicked").dataset["mentality" + index] = elem.dataset.value
            globalMentality += parseInt(elem.dataset.value)
        })
        globalMentality = Math.floor(globalMentality / 3)
    }
    document.querySelector(".clicked").dataset.globalMentality = globalMentality
    let new_ovr = calculateOverall(stats,typeOverall, globalMentality);
    document.querySelector(".clicked").childNodes[1].childNodes[0].textContent = ""
    if (new_ovr[1] !== new_ovr[0]) {
        document.querySelector(".clicked").childNodes[1].childNodes[0].textContent = new_ovr[1];
    }
    document.querySelector(".clicked").childNodes[1].childNodes[1].textContent = new_ovr[0];
    if (globalMentality < 2){
        document.querySelector(".clicked").childNodes[1].childNodes[0].className = "mentality-small-ovr-positive"
    }
    else if (globalMentality > 2){
        document.querySelector(".clicked").childNodes[1].childNodes[0].className = "mentality-small-ovr-negative"
    }
    let inputArray = document.querySelectorAll(".elegible")
    inputArray.forEach(function (input, index) {
        manage_mentality_modifiers(input, globalMentality)
    })
    let diff = parseInt(new_ovr[1]) - parseInt(new_ovr[0])
    let mentalitydiff = document.querySelector(".mentality-change-ovr")
    if (diff > 0) {
        mentalitydiff.textContent = "+" + diff
        mentalitydiff.className = "mentality-change-ovr positive"
    }
    else if (diff < 0) {
        mentalitydiff.textContent = diff
        mentalitydiff.className = "mentality-change-ovr negative"
    }
    else{
        mentalitydiff.textContent = ""
        mentalitydiff.className = "mentality-change-ovr"
    }
    let retirement = document.querySelector(".actual-retirement").textContent.split(" ")[1];
    let age = document.querySelector(".actual-age").textContent.split(" ")[1];
    document.querySelector(".clicked").dataset.retirement = retirement;
    let ageGap = parseInt(document.querySelector(".clicked").dataset.age - age);
    document.querySelector(".clicked").dataset.age = age;
    let newName = document.querySelector("#driverStatsTitle").value
    if (newName === document.querySelector(".clicked").dataset.name) {
        newName = "-1"
    }
    else{
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
    let wants1,superLicense, isRetired;
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
        command: "editStats",
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

    socket.send(JSON.stringify(dataStats));
}

function calendarModeHandler() {
    let dataCodesString = '';

    document.querySelectorAll(".race-calendar").forEach((race) => {
        dataCodesString += race.dataset.trackid.toString() + race.dataset.rainP.toString() + race.dataset.rainQ.toString() + race.dataset.rainR.toString() + race.dataset.type.toString() + race.dataset.state.toString() + ' ';
    });

    dataCodesString = dataCodesString.trim();
    let dataCalendar = {
        command: "calendar",
        calendarCodes: dataCodesString
    };

    socket.send(JSON.stringify(dataCalendar));
}

function teamsModeHandler() {

    let seasonObjData = document.querySelector("#seasonObjectiveInput").value;
    let longTermData = longTermObj;
    let longTermYearData = document.querySelector("#longTermInput").value;
    let teamBudgetData = document.querySelector("#teamBudgetInput").value.replace(/[$,]/g,"");
    let costCapTransactionData = originalCostCap - document.querySelector("#costCapInput").value.replace(/[$,]/g,"");
    let confidenceData = document.querySelector("#confidenceInput").value;
    let facilitiesData = gather_team_data()
    let pitCrew = gather_pit_crew()
    let engine = document.querySelector("#engineButton").dataset.value
    let saveSelected = document.getElementById('saveSelector').innerHTML
    let data = {
        command: "editTeam",
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
        saveSelected: saveSelected
    }
    socket.send(JSON.stringify(data))
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
            loadouts[partID] = [loadout1,loadout2]
        })
        document.querySelectorAll(".one-part").forEach(function (elem) {
            let designID = elem.querySelector(".one-part-name").dataset.designId
            let number = elem.querySelector(".n-parts").innerText.split("x")[1]
            n_parts_designs[designID] = number
        })
        data = {
            command: "editPerformance",
            teamID: teamSelected,
            parts: parts,
            n_parts_designs: n_parts_designs,
            loadouts: loadouts,
            teamName: document.querySelector(".selected").dataset.teamname
        }
    }
    else if (teamsEngine === "engines") {
        let engineData = gather_engines_data()
        data = {
            command: "editEngine",
            engines: engineData,
        }
    }
    socket.send(JSON.stringify(data))

}

function first_show_animation() {
    let button = document.querySelector(".save-button")
    if (!firstShow) {
        firstShow = true;
        button.classList.add("first-show")
        setTimeout(function() {
            button.classList.remove('first-show');
          }, 3000);
    }
}

function manageSaveButton(show,mode) {
    let button = document.querySelector(".save-button")
    button.removeEventListener("click",editModeHandler);
    button.removeEventListener("click",calendarModeHandler);
    button.removeEventListener("click",teamsModeHandler);
    button.removeEventListener("click",performanceModeHandler);

    if (!show) {
        button.classList.add("d-none")
    }
    else {
        button.classList.remove("d-none")
        first_show_animation()
    }
    if (mode === "stats") {
        button.addEventListener("click",editModeHandler);
    }
    else if (mode === "calendar") {
        button.addEventListener("click",calendarModeHandler);
    }
    else if (mode === "teams") {
        button.addEventListener("click",teamsModeHandler);
    }
    else if (mode === "performance") {
        button.addEventListener("click",performanceModeHandler);
    }
}

document.addEventListener('DOMContentLoaded',function () {

    const names_configs = {
        "visarb": "VISA CASHAPP RB","toyota": "TOYOTA","hugo": "HUGO BOSS","alphatauri": "ALPHA TAURI","brawn": "BRAWN GP","porsche": "PORSCHE",
        "alpine": "ALPINE","renault": "RENAULT","andretti": "ANDRETTI","lotus": "LOTUS","alfa": "ALFA ROMEO",
        "audi": "AUDI","sauber": "SAUBER","stake": "STAKE SAUBER"
    }
    const pretty_names = {
        "visarb": "Visa Cashapp RB","toyota": "Toyota","hugo": "Hugo Boss","alphatauri": "Alpha Tauri","brawn": "Brawn GP","porsche": "Porsche",
        "alpine": "Alpine","renault": "Renault","andretti": "Andretti","lotus": "Lotus","alfa": "Alfa Romeo",
        "audi": "Audi","sauber": "Sauber","stake": "Stake Sauber"
    }
    const abreviations_for_replacements = {"visarb": "VCARB", "toyota": "TOY", "hugo": "HUGO", "alphatauri": "AT", "brawn": "BGP", "porsche": "POR",
        "alpine": "ALP", "renault": "REN", "andretti": "AND", "lotus": "LOT", "alfa": "ALFA", "audi": "AUDI", "sauber": "SAU", "stake": "STK"
    }
    const logos_configs = {
        "visarb": "../assets/images/visarb.png","toyota": "../assets/images/toyota.png","hugo": "../assets/images/hugoboss.png","alphatauri": "../assets/images/alphatauri.png",
        "brawn": "../assets/images/brawn.png","porsche": "../assets/images/porsche.png",
        "alpine": "../assets/images/alpine.png","renault": "../assets/images/renault.png","andretti": "../assets/images/andretti.png","lotus": "../assets/images/lotus.png",
        "alfa": "../assets/images/alfaromeo.png","audi": "../assets/images/audi.png","sauber": "../assets/images/sauber.png","stake": "../assets/images/kick.png"
    }
    const logos_classes_configs = {
        "visarb": "visarblogo","toyota": "toyotalogo","hugo": "hugologo","alphatauri": "alphataurilogo",
        "porsche": "porschelogo","brawn": "brawnlogo",
        "alpine": "alpinelogo","renault": "ferrarilogo","andretti": "andrettilogo","lotus": "lotuslogo",
        "alfa": "alfalogo","audi": "audilogo","sauber": "sauberlogo","stake": "alfalogo"
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

    const scriptsArray = [predictDiv,h2hDiv,viewDiv,driverTransferDiv,editStatsDiv,customCalendarDiv,carPerformanceDiv,teamsDiv]

    const dropDownMenu = document.getElementById("dropdownMenu");

    const notificationPanel = document.getElementById("notificationPanel");

    const logButton = document.getElementById("logFileButton");

    const status = document.querySelector(".status-info")
    const updateInfo = document.querySelector(".update-info")
    const noNotifications = ["Custom Engines fetched","Cars fetched","Part values fetched", "Parts stats fetched","24 Year","Game Year","Performance fetched","Season performance fetched","Config","ERROR","Montecarlo fetched","TeamData Fetched","Progress","JIC","Calendar fetched","Contract fetched","Staff Fetched","Engines fetched","Results fetched","Year fetched","Numbers fetched","H2H fetched","DriversH2H fetched","H2HDriver fetched","Retirement fetched","Prediction Fetched","Events to Predict Fetched","Events to Predict Modal Fetched"]
    let difficulty_dict = {
        0: "default",
        1: "reduced weight",
        2: "extra-hard",
        3: "brutal",
        4: "unfair",
        5: "insane",
        6: "impossible"
    }

    const messageHandlers = {
        "ERROR": (message) => {
            update_notifications(message[1],"error");
            manage_status(0);
        },
        "JIC": (message) => {
            if (conn === 0) {
                console.log("JIC DOES ITS THING")
                let data = {
                    command: "connect"
                }
                socket.send(JSON.stringify(data))
            }
        },
        "Connected Succesfully": (message) => {
            conn = 1;
            load_saves(message);
            clearTimeout(connectionTimeout);
            manage_status(1);
            check_version();
            listeners_plusLess();
        },
        "Save Loaded Succesfully": (message) => {
            remove_drivers();
            removeStatsDrivers();
            place_drivers(message.slice(1));
            sortList("free-drivers")
            place_drivers_editStats(message.slice(1));
        },
        "Staff Fetched": (message) => {
            place_staff(message.slice(1));
            sortList("free-staff")
            place_staff_editStats(message.slice(1));
        },
        "Calendar fetched": (message) => {
            load_calendar(message.slice(1))
        },
        "Engines fetched": (message) => {
            manage_engineStats(message.slice(1));
        },
        "Contract fetched": (message) => {
            manage_modal(message.slice(1));
        },
        "Year fetched": (message) => {
            generateYearsMenu(message.slice(1));
        },
        "Numbers fetched": (message) => {
            loadNumbers(message.slice(1));
        },
        "H2H fetched": (message) => {
            sprintsListeners();
            racePaceListener();
            qualiPaceListener()
            manage_h2h_bars(message.slice(1)[0]);
        },
        "DriversH2H fetched": (message) => {
            load_drivers_h2h(message.slice(1));
        },
        "H2HDriver fetched": (message) => {
            load_labels_initialize_graphs(message.slice(1));
        },
        "Results fetched": (message) => {
            new_drivers_table(message[1]);
            new_load_drivers_table(message.slice(2));
            new_teams_table(message[1]);
            new_load_teams_table(message.slice(2));
        },
        "TeamData Fetched": (message) => {
            fillLevels(message.slice(1))

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
            manage_config(message.slice(1), true)
        },
        "Performance fetched": (message) => {
            load_performance(message[1])
            load_attributes(message[2])
            //wait 100 ms
            setTimeout(function () {
                order_by("overall")
            },100)

        },
        "Season performance fetched": (message) => {
            load_performance_graph(message.slice(1))
        },
        "Parts stats fetched": (message) => {
            load_parts_stats(message.slice(1)[0])
            load_parts_list(message.slice(1)[1])
            update_max_design(message.slice(1)[2])
        },
        "Game Year": (message) => {
            manage_game_year(message.slice(1)[0])
        },
        "Part values fetched": (message) => {
            load_one_part(message.slice(1))
        },
        "Cars fetched": (message) => {
            load_cars(message.slice(1)[0])
            load_car_attributes(message.slice(1)[1])
            order_by("overall")
        },
        "Custom Engines fetched": (message) => {
            load_custom_engines(message.slice(1))
        }
    };

    let latestTag;

    let isSaveSelected = 0;
    let scriptSelected = 0;
    let divBlocking = 1;

    adjust_containter()

    document.querySelectorAll(".modal").forEach(function (elem) {
        elem.addEventListener('show.bs.modal',function () {
            setTimeout(function () {
                var modalBackdrop = document.querySelector('.modal-backdrop');
                var cetContainer = document.querySelector('.cet-container');
                cetContainer.appendChild(modalBackdrop);
            },0);

        });
    })

    let connectionTimeout = setTimeout(() => {
        update_notifications("Could not connect with backend","error")
        manage_status(0)
    },8000);



    /**
     * Handles the receiving end from the messages sent from backend
     * @param {string} event the message tha tcomes fro the backend
     */
    socket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log(message) //DEBUG
        let handler = messageHandlers[message[0]];

        if (handler) {
            handler(message);
        }
        if (!noNotifications.includes(message[0])) {
            update_notifications(message[0],"ok");
        }
    };

    /**
     * Opens the log file
     */
    logButton.addEventListener("click",function () {
        window.location.href = '../log.txt';
    })

    /** 
     * Manages the look of the status icon in the footer
     * @param {int} state state of the connection with backend
     */
    function manage_status(state) {
        if (state == 1) {
            status.classList.remove("awaiting")
            status.classList.add("positive")
            status.textContent = '\xa0' + "Connected"
        }
        else if (state == 0) {
            status.classList.remove("awaiting")
            status.classList.remove("positive")
            status.classList.add("negative")
            status.textContent = '\xa0' + "Disconnected"
        }
    }

    function resizeWindowToHeight(mode) {
        if (mode === "11teams") {
            ipcRenderer.send('resize-window',930);
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
            ipcRenderer.send('resize-window',875);
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

    ipcRenderer.on('dev-mode',(event,message) => {
        let devConsole = document.querySelector('.dev-console');
        document.addEventListener('keydown',(event) => {
            if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                if (devConsole) {
                    devConsole.classList.toggle('d-none');
                    if (!devConsole.classList.contains('d-none')) {
                        devConsole.focus(); // Enfocar el textarea cuando se hace visible
                    }
                }
            }
        });

        if (devConsole) {
            devConsole.addEventListener('keyup',(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    data = {
                        command: "dev",
                        type: devConsole.value
                    }
                    socket.send(JSON.stringify(data));
                }
            });
        }
    });

    function manage_game_year(year) {
        if (year[0] === "24") {
            document.getElementById("year23").classList.remove("activated")
            document.getElementById("year24").classList.add("activated")
            document.getElementById("drs24").classList.remove("d-none")
            document.getElementById("drs24").dataset.attribute = "3"
            game_version = 2024
            max_races = 24;
            manage_custom_team(year)
            document.querySelectorAll(".brake-cooling-replace").forEach(function (elem) {
                elem.textContent = "Tyre preservation"
            })
            document.querySelectorAll(".engine24").forEach(function (elem) {
                elem.classList.add("d-none")
            })
            document.querySelector(".only-mentality").classList.remove("d-none")

        }
        else if (year[0] === "23") {
            resizeWindowToHeight("10teams")
            document.getElementById("year24").classList.remove("activated")
            document.getElementById("year23").classList.add("activated")
            document.getElementById("drs24").classList.add("d-none")
            document.getElementById("drs24").dataset.attribute = "-1"
            if (32 in combined_dict) {
                delete combined_dict[32]
            }
            game_version = 2023
            mid_grid = 10;
            max_races = 23;
            relative_grid = 5;
            manage_custom_team([null,null])
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
            replace_custom_team_color(nameColor[2],nameColor[3])
            mid_grid = 11;
            relative_grid= 4.54;
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
            mid_grid = 10;
            relative_grid= 5;
            if (32 in combined_dict) {
                delete combined_dict[32]
            }
        }
    }

    function replace_custom_team_color(primary,secondary) {
        let root = document.documentElement;
        root.style.setProperty('--custom-team-primary',primary);
        root.style.setProperty('--custom-team-secondary',secondary);
        root.style.setProperty('--custom-team-primary-transparent',primary + "30");
        root.style.setProperty('--custom-team-secondary-transparent',secondary + "30");
        colors_dict["320"] = primary
        colors_dict["321"] = secondary
        document.getElementById("primarySelector").value = primary
        document.getElementById("secondarySelector").value = secondary
        document.getElementById("primaryReader").value = primary.toUpperCase()
        document.getElementById("secondaryReader").value = secondary.toUpperCase()
    }


    selectImageButton.addEventListener('click',() => {
        fileInput.click();
    });

    // Función para manejar la selección de archivo
    fileInput.addEventListener('change',(event) => {
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


    /**
     * Manages the height of the main container
     */
    function adjust_containter() {
        setTimeout(function () {
            document.querySelector(".cet-container").style.position = "relative"
            document.querySelector(".cet-container").style.overflowX = "hidden"
        },0)
    }

    function ajustScrollWrapper() {
        var windowHeight = window.innerHeight - 120;
        document.querySelector('.scroll-wrapper').style.height = windowHeight + 'px';
    }

    window.addEventListener('resize',ajustScrollWrapper);
    window.addEventListener('load',ajustScrollWrapper);


    /**
     * Checks with the github api if there is a newer version of the tool
     */
    function check_version() {
        fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/tags`)
            .then(response => response.json())
            .then(tags => {
                if (tags.length > 0) {
                    latestTag = tags[0].name;
                    let actualVersion = versionPanel.textContent.trim()

                    if (actualVersion.slice(-3) === "dev") {
                        updateInfo.textContent = '\xa0' + "Development branch"
                        updateInfo.classList.remove("bi-cloud")
                        updateInfo.classList.add("bi-code-slash")
                        setTimeout(() => {
                            updateInfo.classList.add("hide")
                            versionPanel.classList.add("show")
                        },4000);

                    }
                    else {
                        let latestVer = latestTag.split(".").map(Number);
                        let actualVer = actualVersion.split(".").map(Number);
                        let isSame = true;
                        if (latestVer.length > actualVer.length) {
                            isSame = false;
                        }
                        else {
                            for (let i = 0; i < latestVer.length; i++) {
                                if (latestVer[i] > actualVer[i]) {
                                    isSame = false;
                                    break;
                                }
                                else if (latestVer[i] < actualVer[i]) {
                                    break;
                                }
                            }
                        }

                        if (isSame) {
                            updateInfo.textContent = '\xa0' + "Up to date"
                            updateInfo.classList.remove("bi-cloud")
                            updateInfo.classList.add("bi-check2")
                            setTimeout(() => {
                                updateInfo.classList.add("hide")
                                versionPanel.classList.add("show")
                            },4000);
                        }
                        else {
                            updateInfo.textContent = '\xa0' + "New update available"
                            updateInfo.classList.remove("bi-cloud")
                            if (checkGit()) {
                                updateInfo.classList.add("bi-cloud-download")
                                updateButton()
                            }
                            else {
                                updateInfo.classList.add("bi-exclamation-lg")
                                updateInfo.setAttribute('href','https://www.github.com/IUrreta/DatabaseEditor/releases/tag/' + latestTag);
                            }

                        }

                    }
                }
            })
            .catch(error => {
                updateInfo.textContent = '\xa0' + "Failed to fetch updates"
                updateInfo.classList.remove("bi-cloud")
                updateInfo.classList.add("bi-exclamation-diamond")
            });
    }

    /**
     * Check if the tool was installed through git or not
     * @returns {bool} If the tool was installed through git or zip
     */
    function checkGit() {
        let dir = './'; // Cambia esto a la ruta de tu herramienta
        let res = false;
        try {
            const files = fs.readdirSync(dir);
            return files.includes('.git');
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Adds the spinner informing of updating state
     */
    function addSpinner() {

        let statusDiv = document.querySelector('.status');
        let spinnerDiv = document.createElement('div');
        let outsideDiv = document.createElement('div');
        spinnerDiv.className = ' spinner-border spinner-border-sm';
        spinnerDiv.role = 'status';
        outsideDiv.textContent = "Updating..."
        outsideDiv.style.paddingRight = "10px"
        outsideDiv.className = "outside-div"
        outsideDiv.appendChild(spinnerDiv)
        statusDiv.insertBefore(outsideDiv,statusDiv.children[2]);
    }

    /**
     * Manages the actions of the update button
     */
    function updateButton() {
        let repoPath = './';
        let git = simpleGit(repoPath);

        document.querySelector(".bi-cloud-download").addEventListener("click",function () {

            git.pull("origin","release",(error,update) => {
                addSpinner()
                if (error) {
                    update_notifications("Update automatically failed, please update manually","error")
                    updateInfo.classList.remove("bi-cloud-download")
                    updateInfo.classList.add("bi-exclamation-lg")
                    updateInfo.setAttribute('href','https://www.github.com/IUrreta/DatabaseEditor/releases/tag/' + latestTag);
                    document.querySelector(".status").removeChild(document.querySelector(".outside-div"))
                    updateInfo.removeEventListener("click",arguments.callee)
                } else {
                    //console.log('Git pull exitoso:',update);
                    setTimeout(() => {
                        exec('restart.bat',(error,stdout,stderr) => {
                            if (error) {
                                //console.error(`Error: ${error}`);
                                return;
                            }
                            //console.log(`Resultado: ${stdout}`);
                        });
                    },500);
                }
            });
        })
    }


    /**
     * Manages the state of the calendar blocking div in case it cannot be modified
     * @param {string} info If the calendar has had major changes or not
     */
    function manage_calendarDiv(info) {
        if (info[0] === "1") {
            document.getElementById("calendarBlockDiv").className = "blocking-div d-none"
        }
        else if (info[0] === "0") {
            document.getElementById("calendarBlockDiv").className = "blocking-div"
        }
    }



    /**
     * Adds the saves that the backend detected to the dropdown of saves
     * @param {Object} savesArray contains the list of saves that the backend was able to find
     */
    function load_saves(savesArray) {
        for (let i = 1; i < savesArray.length; i++) {
            let elem = savesArray[i]
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.href = '#';
            a.textContent = elem;

            li.appendChild(a);
            dropDownMenu.appendChild(li);

        }
        listenersSaves()
        listenersStaffGroups()
    }

    /**
     * Adds the eventListeners to each element of the save dropdown
     */
    function listenersSaves() {
        document.querySelectorAll('#dropdownMenu a').forEach(item => {
            item.addEventListener("click",function () {
                const saveSelector = document.getElementById('saveSelector');
                let saveSelected = item.innerHTML
                saveSelector.innerHTML = saveSelected;
                let dataSaves = {
                    command: "saveSelected",
                    save: saveSelected
                }
                socket.send(JSON.stringify(dataSaves))
                isSaveSelected = 1;
                document.getElementById("editStatsPanel").className = "left-panel-stats d-none";
                document.querySelector(".gear-container").classList.add("shown")
                resetTeamEditing()
                resetViewer()
                resetYearButtons()
                resetH2H()
                hideComp()
                resetPredict()
                removeStatsDrivers()
                document.querySelectorAll(".config-content").forEach(function (elem) {
                    elem.textContent = ""
                })
                statPanelShown = 0;
                document.querySelectorAll(".performance-show").forEach(function (elem) {
                    elem.classList.add("d-none")
                })
                check_selected()
            });
        });
    }

    document.querySelector(".gear-container").addEventListener("click",function () {
        let configDetailModal = new bootstrap.Modal(document.getElementById('configDetailModal'),{
            keyboard: false
        })
        configDetailModal.show()
    })

    function manage_config(info, year_config=false) {
        document.querySelector(".bi-gear").classList.remove("hidden")
        configCopy = info
        manage_config_content(info[0], year_config)
    }

    function replace_all_teams(info) {
        let teams = info["teams"]
        alphaTauriReplace(teams["alphatauri"])
        alpineReplace(teams["alpine"])
        alfaReplace(teams["alfa"])
        update_logo("alpine",logos_configs[teams["alpine"]],teams["alpine"])
        update_logo("alfa",logos_configs[teams["alfa"]],teams["alfa"])
        update_logo("alphatauri",logos_configs[teams["alphatauri"]],teams["alphatauri"])
    }

    function manage_config_content(info, year_config=false) {
        replace_all_teams(info)
        if (!year_config) {
            if (info["icon"]) {
                replace_custom_team_logo(info["icon"])
                customIconPath = info["icon"]
            }
            if (info["primaryColor"]) {
                replace_custom_team_color(info["primaryColor"],info["secondaryColor"])
            }
            if (info["mentalityFrozen"] === 1){
                document.getElementById("freezeMentalityToggle").checked = true
            }
            else{
                document.getElementById("freezeMentalityToggle").checked = false
            }
            if (info["refurbish"] === 1){
                document.getElementById("refurbishingToggle").checked = true
            }
            else{
                document.getElementById("refurbishingToggle").checked = false
            }
            engine_allocations = info["engine_allocations"]
            //remove all engines from engines_names with key > 10
            for (let key in engine_names) {
                if (key > 10) {
                    delete engine_names[key]
                }
            }
            for (let key in info["engines"]) {
                engine_names[key] = info["engines"][key]["name"]
            }
            update_mentality_span(info["mentalityFrozen"])
            let difficultySlider = document.getElementById("difficultySlider")
            difficultySlider.value = info["difficulty"]
            update_difficulty_span(info["difficulty"])
            manage_difficulty_warnings(difficulty_dict[parseInt(info["difficulty"])])
            update_refurbish_span(info["refurbish"])
            manage_disabled_list(info["disabled"])
    }
    }

    function manage_disabled_list(disabled_list){
        for (key in disabled_list){
            let elem = document.getElementById(key)
            if (disabled_list[key] === 1){
                elem.classList.add("disabled")
            }
        }
    }

    document.querySelectorAll(".color-picker").forEach(function (elem) {
        let reader = elem.parentNode.querySelector(".color-reader")
        elem.addEventListener("input",function () {
            reader.value = elem.value.toUpperCase()
        })
        reader.value = elem.value.toUpperCase();
    })

    document.querySelectorAll(".color-reader").forEach(function (elem) {
        elem.addEventListener("input",function () {
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
                        elem.src = elem.src.slice(0,-4) + "2.png"
                    }
                }

            })
            let alphaVarName = "--alphatauri-primary"
            let newVarName = "--" + info + "-primary"
            change_css_variables(alphaVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["80"] = value
            alphaVarName = "--alphatauri-secondary"
            newVarName = "--" + info + "-secondary"
            change_css_variables(alphaVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["81"] = value
            alphaVarName = "--alphatauri-primary-transparent"
            newVarName = "--" + info + "-primary-transparent"
            change_css_variables(alphaVarName,newVarName)
            alphaVarName = "--alphatauri-secondary-transparent"
            newVarName = "--" + info + "-secondary-transparent"
            change_css_variables(alphaVarName,newVarName)
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
                    elem.src = elem.src.slice(0,-4) + "2.png"
                }
            })
            let alphaVarName = "--alphatauri-primary"
            let newVarName = "--alphatauri-original"
            change_css_variables(alphaVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue("--alphatauri-original").trim();
            colors_dict["80"] = value
            alphaVarName = "--alphatauri-secondary"
            newVarName = "--alphatauri-secondary-original"
            change_css_variables(alphaVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue("--alphatauri-secondary-original").trim();
            colors_dict["81"] = value
            alphaVarName = "--alphatauri-primary-transparent"
            newVarName = "--alphatauri-primary-transparent-original"
            change_css_variables(alphaVarName,newVarName)
            alphaVarName = "--alphatauri-secondary-transparent"
            newVarName = "--alphatauri-secondary-transparent-original"
            change_css_variables(alphaVarName,newVarName)
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
                    elem.src = elem.src.slice(0,-4) + "2.png"
                }
            })
            let alpineVarName = "--alpine-primary"
            let newVarName = "--" + info + "-primary"
            change_css_variables(alpineVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["50"] = value
            alpineVarName = "--alpine-secondary"
            newVarName = "--" + info + "-secondary"
            change_css_variables(alpineVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["51"] = value
            alpineVarName = "--alpine-primary-transparent"
            newVarName = "--" + info + "-primary-transparent"
            change_css_variables(alpineVarName,newVarName)
            alpineVarName = "--alpine-secondary-transparent"
            newVarName = "--" + info + "-secondary-transparent"
            change_css_variables(alpineVarName,newVarName)
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
                    elem.src = elem.src.slice(0,-4) + "2.png"
                }
            })
            let alpineVarName = "--alpine-primary"
            let newVarName = "--alpine-original"
            change_css_variables(alpineVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue("--alpine-original").trim();
            colors_dict["50"] = value
            alpineVarName = "--alpine-secondary"
            newVarName = "--alpine-secondary-original"
            change_css_variables(alpineVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue("--alpine-secondary-original").trim();
            colors_dict["51"] = value
            alpineVarName = "--alpine-primary-transparent"
            newVarName = "--alpine-primary-transparent-original"
            change_css_variables(alpineVarName,newVarName)
            alpineVarName = "--alpine-secondary-transparent"
            newVarName = "--alpine-secondary-transparent-original"
            change_css_variables(alpineVarName,newVarName)
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
            change_css_variables(alfaVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["90"] = value
            alfaVarName = "--alfa-secondary"
            newVarName = "--" + info + "-secondary"
            change_css_variables(alfaVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue(newVarName).trim();
            colors_dict["91"] = value
            alfaVarName = "--alfa-primary-transparent"
            newVarName = "--" + info + "-primary-transparent"
            change_css_variables(alfaVarName,newVarName)
            alfaVarName = "--alfa-secondary-transparent"
            newVarName = "--" + info + "-secondary-transparent"
            change_css_variables(alfaVarName,newVarName)
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
            change_css_variables(alfaVarName,newVarName)
            let value = getComputedStyle(document.documentElement).getPropertyValue("--alfa-original").trim();
            colors_dict["90"] = value
            alfaVarName = "--alfa-secondary"
            newVarName = "--alfa-secondary-original"
            change_css_variables(alfaVarName,newVarName)
            value = getComputedStyle(document.documentElement).getPropertyValue("--alfa-secondary-original").trim();
            colors_dict["91"] = value
            alfaVarName = "--alfa-primary-transparent"
            newVarName = "--alfa-primary-transparent-original"
            change_css_variables(alfaVarName,newVarName)
            alfaVarName = "--alfa-secondary-transparent"
            newVarName = "--alfa-secondary-transparent-original"
            change_css_variables(alfaVarName,newVarName)
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

    function change_css_variables(oldVar,newVar) {
        let root = document.documentElement;
        let newVal = getComputedStyle(root).getPropertyValue(newVar).trim();
        root.style.setProperty(oldVar,newVal);
    }

    function replace_modal_teams(version){
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
            a.addEventListener("click",function () {
                elem.querySelector("button").textContent = a.textContent
                elem.querySelector("button").dataset.value = a.dataset.value
            })
        })
    })

    document.querySelector("#configDetailsButton").addEventListener("click",function () {
        save = document.querySelector("#saveSelector").textContent
        save = save.slice(0,-4)
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
        let difficultyValue = parseInt(difficultySlider.value)
        let disabledList = {}
        document.querySelectorAll(".dif-warning:not(.default)").forEach(function (elem) {
            let id = elem.id
            if (elem.classList.contains("disabled")) {
                disabledList[id] = 1
            }
            else{
                disabledList[id] = 0
            }
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
        }
        if (customIconPath !== null) {
            data["icon"] = customIconPath
            replace_custom_team_logo(customIconPath);
        }
        if (custom_team) {
            data["primaryColor"] = document.getElementById("primarySelector").value
            data["secondaryColor"] = document.getElementById("secondarySelector").value
            replace_custom_team_color(data["primaryColor"],data["secondaryColor"])
        }
        socket.send(JSON.stringify(data))
        info = { teams: { alphatauri: alphatauri,alpine: alpine,alfa: alfa } }
        replace_all_teams(info)
        reloadTables()
    })



    /**
     * checks if a save and a script have been selected to unlock the tool
     */
    function check_selected() {
        if (isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1) {
            document.getElementById("blockDiv").className = "d-none"
            divBlocking = 0;

        }
    }

    /**
     * Pills and their eventListeners
     */
    predictPill.addEventListener("click",function () {
        manageScripts("show","hide","hide","hide","hide","hide","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })

    h2hPill.addEventListener("click",function () {

        manageScripts("hide","show","hide","hide","hide","hide","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })

    viewPill.addEventListener("click",function () {
        manageScripts("hide","hide","show","hide","hide","hide","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
        add_marquees_viewer()
    })

    driverTransferPill.addEventListener("click",function () {

        manageScripts("hide","hide","hide","show","hide","hide","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
        //wait 0.3s and then add the marquee
        add_marquees_transfers()
    })

    editStatsPill.addEventListener("click",function () {
        manageScripts("hide","hide","hide","hide","show","hide","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true,"stats")
    })

    constructorsPill.addEventListener("click",function () {
        manageScripts("hide","hide","hide","hide","hide","hide","hide","show")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true,"teams")
    })


    CalendarPill.addEventListener("click",function () {
        manageScripts("hide","hide","hide","hide","hide","show","hide","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true,"calendar")
    })

    carPill.addEventListener("click",function () {
        manageScripts("hide","hide","hide","hide","hide","hide","show","hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(!viewingGraph,"performance")
    })
    
    gamePill.addEventListener("click",function () {
        document.querySelector("#editorChanges").classList.add("d-none")
        document.querySelector("#gameChanges").classList.remove("d-none")
    })
    
    editorPill.addEventListener("click",function () {
        document.querySelector("#editorChanges").classList.remove("d-none")
        document.querySelector("#gameChanges").classList.add("d-none")
    })

    document.getElementById("difficultySlider").addEventListener("input", function() {
        let value = this.value;
        update_difficulty_span(value)
        manage_difficulty_warnings(difficulty_dict[parseInt(value)])
    });

    function update_difficulty_span(value){
        let span = document.querySelector("#difficultySpan")
        let difficulty = difficulty_dict[parseInt(value)]
        if (difficulty === "reduced weight") {
            span.className = "option-state reduced-weight"
        }
        else{
            span.className = "option-state " + difficulty
        }
        span.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    }

    document.getElementById("freezeMentalityToggle").addEventListener("change", function() {
        let value = this.checked;
        update_mentality_span(value)
    });
    
    function update_mentality_span(value){
        let span = document.querySelector("#mentalitySpan")
        if (value) {
            span.className = "option-state frozen"
            span.textContent = "Frozen"
        } else {
            span.className = "option-state default"
            span.textContent = "Unfrozen"
        }
    }

    document.getElementById("refurbishingToggle").addEventListener("change", function() {
        let value = this.checked;
        update_refurbish_span(value)
    });

    function update_refurbish_span(value){
        let span = document.querySelector("#refurbishSpan")
        if (value) {
            span.className = "option-state fixed"
            span.textContent = "Fixed"
        } else {
            span.className = "option-state default"
            span.textContent = "Default"
        }
    }

    function manage_difficulty_warnings(level){
        if (level === "default") {
            document.getElementById("defaultDif").classList.remove("d-none")
            document.getElementById("lightDif").classList.add("d-none")
            document.getElementById("researchDif").classList.add("d-none")
            document.getElementById("statDif").classList.add("d-none")
            document.getElementById("designTimeDif").classList.add("d-none")
            document.getElementById("factoryDif").classList.add("d-none")
            document.getElementById("buildDif").classList.add("d-none")
        }
        else if (level === "reduced weight") {
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning extra-hard"
            document.getElementById("lightDif").textContent = "Lightweight parts"
            document.getElementById("researchDif").classList.add("d-none")
            document.getElementById("statDif").classList.add("d-none")
            document.getElementById("designTimeDif").classList.add("d-none")
            document.getElementById("factoryDif").classList.add("d-none")
            document.getElementById("buildDif").classList.add("d-none")
        }
        else if (level === "extra-hard"){
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning extra-hard"
            document.getElementById("lightDif").textContent = "Lightweight parts"
            document.getElementById("researchDif").classList.remove("d-none")
            document.getElementById("researchDif").className = "dif-warning extra-hard"
            document.getElementById("researchDif").textContent = "Small research boost"
            document.getElementById("statDif").classList.remove("d-none")
            document.getElementById("statDif").className = "dif-warning extra-hard"
            document.getElementById("statDif").textContent = "Stats boost +0.5%"
            document.getElementById("designTimeDif").classList.add("d-none")
            document.getElementById("factoryDif").classList.add("d-none")
            document.getElementById("buildDif").classList.add("d-none")
        }
        else if (level === "brutal"){
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning extra-hard"
            document.getElementById("lightDif").textContent = "Lightweight parts"
            document.getElementById("researchDif").classList.remove("d-none")
            document.getElementById("researchDif").className = "dif-warning brutal"
            document.getElementById("researchDif").textContent = "Moderate research boost"
            document.getElementById("statDif").classList.remove("d-none")
            document.getElementById("statDif").className = "dif-warning brutal"
            document.getElementById("statDif").textContent = "Stats boost +0.8%"
            document.getElementById("designTimeDif").classList.remove("d-none")
            document.getElementById("designTimeDif").className = "dif-warning brutal"
            document.getElementById("designTimeDif").textContent = "Design times reduced 5%"
            document.getElementById("factoryDif").classList.add("d-none")
            document.getElementById("buildDif").classList.add("d-none")
        }
        else if (level === "unfair"){
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning extra-hard"
            document.getElementById("lightDif").textContent = "Lightweight parts"
            document.getElementById("researchDif").classList.remove("d-none")
            document.getElementById("researchDif").className = "dif-warning unfair"
            document.getElementById("researchDif").textContent = "Large research boost"
            document.getElementById("statDif").classList.remove("d-none")
            document.getElementById("statDif").className = "dif-warning unfair"
            document.getElementById("statDif").textContent = "Stats boost +1.3%"
            document.getElementById("designTimeDif").classList.remove("d-none")
            document.getElementById("designTimeDif").className = "dif-warning unfair"
            document.getElementById("designTimeDif").textContent = "Design times reduced 11%"
            document.getElementById("factoryDif").classList.remove("d-none")
            document.getElementById("factoryDif").className = "dif-warning unfair"
            document.getElementById("factoryDif").textContent = "Factory level 4"
            document.getElementById("buildDif").classList.add("d-none")
        }
        else if(level === "insane"){
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning extra-hard"
            document.getElementById("lightDif").textContent = "Lightweight parts"
            document.getElementById("researchDif").classList.remove("d-none")
            document.getElementById("researchDif").className = "dif-warning insane"
            document.getElementById("researchDif").textContent = "Huge research boost"
            document.getElementById("statDif").classList.remove("d-none")
            document.getElementById("statDif").className = "dif-warning insane"
            document.getElementById("statDif").textContent = "Stats boost +1.7%"
            document.getElementById("designTimeDif").classList.remove("d-none")
            document.getElementById("designTimeDif").className = "dif-warning insane"
            document.getElementById("designTimeDif").textContent = "Design times reduced 16%"
            document.getElementById("factoryDif").classList.remove("d-none")
            document.getElementById("factoryDif").className = "dif-warning unfair"
            document.getElementById("factoryDif").textContent = "Factory level 4"
            document.getElementById("buildDif").classList.remove("d-none")
            document.getElementById("buildDif").textContent = "+1 part when design completed"
            document.getElementById("buildDif").className = "dif-warning insane"
        }
        else if (level === "impossible"){
            document.getElementById("defaultDif").classList.add("d-none")
            document.getElementById("lightDif").classList.remove("d-none")
            document.getElementById("lightDif").className = "dif-warning fixed"
            document.getElementById("lightDif").textContent = "ULTRA-lightweight parts"
            document.getElementById("researchDif").classList.remove("d-none")
            document.getElementById("researchDif").className = "dif-warning impossible"
            document.getElementById("researchDif").textContent = "Massive research boost"
            document.getElementById("statDif").classList.remove("d-none")
            document.getElementById("statDif").className = "dif-warning impossible"
            document.getElementById("statDif").textContent = "Stats boost +2.1%"
            document.getElementById("designTimeDif").classList.remove("d-none")
            document.getElementById("designTimeDif").className = "dif-warning impossible"
            document.getElementById("designTimeDif").textContent = "Design times reduced 20%"
            document.getElementById("factoryDif").classList.remove("d-none")
            document.getElementById("factoryDif").className = "dif-warning impossible"
            document.getElementById("factoryDif").textContent = "Factory level 5"
            document.getElementById("buildDif").classList.remove("d-none")
            document.getElementById("buildDif").textContent = "+2 parts when design completed"
            document.getElementById("buildDif").className = "dif-warning impossible"
        }
    }

    document.querySelectorAll(".dif-warning:not(.default)").forEach(function (elem) {
        elem.addEventListener("click",function () {
            elem.classList.toggle("disabled")
        })
    })

    /**
     * Manages the stats of the divs associated with the pills
     * @param  {Array} divs array of state of the divs
     */
    function manageScripts(...divs) {
        scriptsArray.forEach(function (div,index) {
            if (divs[index] === "show") {
                div.className = "script-view"
            }
            else {
                div.className = "script-view d-none"
            }
        })
    }

    document.querySelector("#cancelDetailsButton").addEventListener("click",function () {
        manage_config_content(configCopy[0], false)
    })

});
