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


const batFilePath = path.join(__dirname, '../back/startBack.bat');
console.log(batFilePath)

// exec(`"${batFilePath}"`, (error, stdout, stderr) => {
//     if (error) {
//         console.log("Error launching backend")
//         console.log(`Error: ${error}`)
//         return;
//     }
//     console.log(`Resultado: ${stdout}`);
// });


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

window.addEventListener('beforeunload', () => {
    let data = {
        command: "disconnect"
    }
    socket.send(JSON.stringify(data));
    socket.close();
});

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
        parchModalTitle.textContent = "Version: " + version + " patch notes"
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
    let driverName = getName(document.querySelector(".clicked"));
    document.querySelector(".clicked").dataset.stats = stats;
    let new_ovr = calculateOverall(stats, typeOverall);
    document.querySelector(".clicked").childNodes[1].innerHTML = new_ovr;
    let retirement = document.querySelector(".actual-retirement").textContent.split(" ")[1];
    document.querySelector(".clicked").dataset.retirement = retirement;
    let driverNum = document.getElementById("numberButton").textContent;
    let wants1;
    if(document.querySelector("#driverNumber1").checked){
        wants1 = 1;
    }
    else{
        wants1 = 0;
    }
    let mentality = -1
    if (document.querySelector(".clicked").dataset.mentality0){
        mentality = ""
        document.querySelectorAll(".mentality-level-indicator").forEach(function(elem, index){
            mentality += elem.dataset.value + " "
            document.querySelector(".clicked").dataset["mentality" + index] = elem.dataset.value
        })
    }
    let dataStats = {
        command: "editStats",
        driverID: id,
        driver: driverName,
        statsArray: stats,
        typeStaff: typeEdit,
        retirement: retirement,
        driverNum: driverNum,
        wants1: wants1,
        mentality: mentality
    };

    socket.send(JSON.stringify(dataStats));
}

function calendarModeHandler() {
    console.log("CALENDARIO")
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
    let teamBudgetData =  document.querySelector("#teamBudgetInput").value.replace(/[$,]/g, "");
    let costCapTransactionData = originalCostCap - document.querySelector("#costCapInput").value.replace(/[$,]/g, "");
    let confidenceData = document.querySelector("#confidenceInput").value;
    let facilitiesData = gather_team_data()
    let pitCrew = gather_pit_crew()
    let data = {
        command: "editTeam",
        teamID: teamCod,
        facilities: facilitiesData,
        seasonObj: seasonObjData,
        longTermObj : longTermData,
        longTermYear: longTermYearData,
        teamBudget: teamBudgetData,
        costCapEdit: costCapTransactionData,
        confidence : confidenceData,
        pitCrew: pitCrew,
        teamName : combined_dict[teamCod]
    }
    socket.send(JSON.stringify(data))
}

function performanceModeHandler() {
    let parts = {};
    document.querySelectorAll(".part-performance").forEach(function (elem) {
        let part = elem.dataset.part;
        let stats = {};
        elem.querySelectorAll(".part-performance-stat").forEach(function (stat) {
           let statNum = stat.dataset.attribute;
           let value = stat.querySelector("input").value.split(" ")[0];
           stats[statNum] = value;
        });
        parts[part] = stats;
    })
    let data = {
        command: "editPerformance",
        teamID: teamSelected,
        parts: parts,
        teamName: document.querySelector(".selected").dataset.teamname
    }
    socket.send(JSON.stringify(data))

}

function manageSaveButton(show, mode){
    console.log(mode)
    let button = document.querySelector(".save-button")
    button.removeEventListener("click", editModeHandler);
    button.removeEventListener("click", calendarModeHandler);
    button.removeEventListener("click", teamsModeHandler);
    button.removeEventListener("click", performanceModeHandler);
    if (!show){
        button.classList.add("d-none")
    }
    else{
        button.classList.remove("d-none")
    }

    if (mode === "stats"){
        button.addEventListener("click", editModeHandler);
    }
    else if (mode === "calendar"){
        button.addEventListener("click", calendarModeHandler);
    }
    else if (mode === "teams"){
        button.addEventListener("click", teamsModeHandler);
    }
    else if (mode === "performance"){
        button.addEventListener("click", performanceModeHandler);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const names_configs = {"visarb": "VISA CASHAPP RB", "toyota" : "TOYOTA", "hugo": "HUGO BOSS", "alphatauri": "ALPHA TAURI", "brawn": "BRAWN GP", "porsche": "PORSCHE",
                            "alpine": "ALPINE", "renault": "RENAULT", "andretti": "ANDRETTI", "lotus": "LOTUS", "alfa" : "ALFA ROMEO",
                        "audi" : "AUDI", "sauber" : "SAUBER", "stake" : "STAKE SAUBER"}
    const pretty_names = {"visarb": "Visa Cashapp RB", "toyota" : "Toyota", "hugo": "Hugo Boss", "alphatauri": "Alpha Tauri", "brawn": "Brawn GP", "porsche": "Porsche",
                            "alpine": "Alpine", "renault": "Renault", "andretti": "Andretti", "lotus": "Lotus", "alfa" : "Alfa Romeo",
                        "audi" : "Audi", "sauber" : "Sauber", "stake" : "Stake Sauber"}
    const logos_configs = {"visarb": "../assets/images/visarb.png", "toyota" : "../assets/images/toyota.png", "hugo": "../assets/images/hugoboss.png", "alphatauri": "../assets/images/alphatauri.png",
                            "brawn": "../assets/images/brawn.png", "porsche": "../assets/images/porsche.png",
                            "alpine": "../assets/images/alpine.png", "renault": "../assets/images/renault.png", "andretti": "../assets/images/andretti.png", "lotus": "../assets/images/lotus.png",
                            "alfa" : "../assets/images/alfaromeo.png", "audi" : "../assets/images/audi.png", "sauber" : "../assets/images/sauber.png", "stake" : "../assets/images/kick.png"}
    const logos_classes_configs = {"visarb": "hugologo", "toyota" : "toyotalogo", "hugo": "hugologo", "alphatauri": "alphataurilogo",
                            "porsche": "ferrarilogo", "brawn": "brawnlogo",
                            "alpine": "alpinelogo", "renault": "ferrarilogo", "andretti": "andrettilogo", "lotus": "lotuslogo",
                            "alfa" : "alfalogo", "audi" : "audilogo", "sauber" : "sauberlogo", "stake" : "alfalogo"}

    const driverTransferPill = document.getElementById("transferpill");
    const editStatsPill = document.getElementById("statspill");
    const CalendarPill = document.getElementById("calendarpill");
    const carPill = document.getElementById("carpill");
    const viewPill = document.getElementById("viewerpill");
    const h2hPill = document.getElementById("h2hpill");
    const constructorsPill = document.getElementById("constructorspill")
    const predictPill = document.getElementById("predictpill")

    const driverTransferDiv = document.getElementById("driver_transfers");
    const editStatsDiv = document.getElementById("edit_stats");
    const customCalendarDiv = document.getElementById("custom_calendar");
    const carPerformanceDiv = document.getElementById("car_performance");
    const viewDiv = document.getElementById("season_viewer");
    const h2hDiv = document.getElementById("head2head_viewer");
    const teamsDiv = document.getElementById("edit_teams");
    const predictDiv = document.getElementById("predict_results")

    const patchNotesBody = document.getElementById("patchNotesBody")

    const scriptsArray = [predictDiv, h2hDiv, viewDiv, driverTransferDiv, editStatsDiv, customCalendarDiv, carPerformanceDiv, teamsDiv]

    const dropDownMenu = document.getElementById("dropdownMenu");

    const notificationPanel = document.getElementById("notificationPanel");

    const logButton = document.getElementById("logFileButton");

    const status = document.querySelector(".status-info")
    const updateInfo = document.querySelector(".update-info")
    const noNotifications = ["Parts stats fetched", "24 Year" ,"Game Year","Performance fetched","Season performance fetched","Config", "ERROR", "Montecarlo fetched","TeamData Fetched", "Progress", "JIC", "Calendar fetched", "Contract fetched", "Staff Fetched", "Engines fetched", "Results fetched", "Year fetched", "Numbers fetched", "H2H fetched", "DriversH2H fetched", "H2HDriver fetched", "Retirement fetched", "Prediction Fetched", "Events to Predict Fetched", "Events to Predict Modal Fetched"]

    const messageHandlers = {
        "ERROR": (message) => {
            update_notifications(message[1], true);
            manage_status(0);
        },
        "JIC": (message) => {
            if(conn === 0){
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
            place_drivers_editStats(message.slice(1));
        },
        "Staff Fetched": (message) => {
            place_staff(message.slice(1));
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
        "TeamData Fetched": (message)=>{
            fillLevels(message.slice(1))

        },
        "Events to Predict Fetched": (message)=>{
            placeRaces(message.slice(1))
        },
        "Events to Predict Modal Fetched": (message)=>{
            placeRacesInModal(message.slice(1))
        },
        "Prediction Fetched": (message)=>{
            predictDrivers(message.slice(1))
        },
        "Montecarlo Fetched": (message)=>{
            loadMontecarlo(message.slice(1))
        },
        "Progress": (message)=>{
            manageProgress(message.slice(1))
        },
        "Config": (message)=>{
            manage_config(message.slice(1))
        },
        "24 Year": (message)=>{
            manage_config(message.slice(1))
        },
        "Performance fetched": (message)=>{
            load_performance(message[1])
            load_attributes(message[2])
            order_by("overall")
        },
        "Season performance fetched": (message)=>{
            load_performance_graph(message.slice(1))
        },
        "Parts stats fetched": (message)=>{
            load_parts_stats(message.slice(1)[0])
        },
        "Game Year": (message)=>{
            manage_game_year(message.slice(1)[0])
        }
    };

    let latestTag;

    let isSaveSelected = 0;
    let scriptSelected = 0;
    let divBlocking = 1;

    adjust_containter()

    document.querySelectorAll(".modal").forEach(function (elem) {
        elem.addEventListener('show.bs.modal', function () {
            setTimeout(function () {
                var modalBackdrop = document.querySelector('.modal-backdrop');
                var cetContainer = document.querySelector('.cet-container');
                cetContainer.appendChild(modalBackdrop);
            }, 0);

        });
    })

    let connectionTimeout = setTimeout(() => {
        update_notifications("Could not connect with backend", true)
        manage_status(0)
    }, 8000);



    /**
     * Handles the receiving end from the messages sent from backend
     * @param {string} event the message tha tcomes fro the backend
     */
    socket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log(message)
        let handler = messageHandlers[message[0]];

        if (handler) {
            handler(message);
        }
        if (!noNotifications.includes(message[0])) {
            update_notifications(message[0], false);
        }
    };

    /**
     * Opens the log file
     */
    logButton.addEventListener("click", function () {
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
    
    function resizeWindowToHeight(height) {
        ipcRenderer.send('resize-window', height);
    }

    function manage_game_year(year){
        console.log(year)
        if (year[0] === "24"){
            document.getElementById("year23").classList.remove("activated")
            document.getElementById("year24").classList.add("activated")
            document.getElementById("drs24").classList.remove("d-none")
            document.getElementById("teamChanges").classList.add("d-none")
            document.getElementById("drs24").dataset.attribute = "3"
            game_version = 2024
            manage_custom_team(year)
            document.querySelectorAll(".brake-cooling-replace").forEach(function(elem){
                elem.textContent = "Tyre preservation"
            })
        }
        else if (year[0] === "23"){
            resizeWindowToHeight(875)
            document.getElementById("year24").classList.remove("activated")
            document.getElementById("year23").classList.add("activated")
            document.getElementById("drs24").classList.add("d-none")
            document.getElementById("drs24").dataset.attribute = "-1"
            document.getElementById("teamChanges").classList.remove("d-none")
            if (32 in combined_dict){
                delete combined_dict[32]
            }
            game_version = 2023
            manage_custom_team([null, null])
            document.querySelectorAll(".brake-cooling-replace").forEach(function(elem){
                elem.textContent = "Brake cooling"
            })
        }
    }

    function manage_custom_team(nameColor){
        if (nameColor[1] !== null){
            resizeWindowToHeight(920)
            custom_team = true
            combined_dict[32] = nameColor[1]
            document.getElementById("customTeamTransfers").classList.remove("d-none")
            document.getElementById("customTeamPerformance").classList.remove("d-none")
            document.getElementById("customTeamDropdown").classList.remove("d-none")
            document.getElementById("customTeamComparison").classList.remove("d-none")
            document.getElementById("customizeTeam").classList.remove("d-none")
            document.getElementById("customTeamPerformance").dataset.teamName = nameColor[1]
            document.querySelectorAll(".ct-replace").forEach(function(elem){
                elem.textContent = nameColor[1].toUpperCase()
            })
            replace_custom_team_color(nameColor[2], nameColor[3])
        }
        else{
            resizeWindowToHeight(875)
            custom_team = false
            document.getElementById("customTeamTransfers").classList.add("d-none")
            document.getElementById("customTeamPerformance").classList.add("d-none")
            document.getElementById("customTeamDropdown").classList.add("d-none")
            document.getElementById("customTeamComparison").classList.add("d-none")
            document.getElementById("customizeTeam").classList.add("d-none")
        }
    }

    function replace_custom_team_color(primary, secondary){
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
    });

    function replace_custom_team_logo(path){
        logos_disc[32] = path;
        document.querySelectorAll(".custom-replace").forEach(function(elem){
            console.log(elem)
            elem.src = path
        })
        document.getElementById("selectImage").innerText = path.split("/").pop()
    }
    

    /**
     * Manages the height of the main container
     */
    function adjust_containter(){
        setTimeout(function(){
            document.querySelector(".cet-container").style.position = "relative"
            document.querySelector(".cet-container").style.overflowX = "hidden"
        }, 0)
    }

    function ajustScrollWrapper() {
        var windowHeight = window.innerHeight - 120;
        document.querySelector('.scroll-wrapper').style.height = windowHeight + 'px';
      }

    window.addEventListener('resize', ajustScrollWrapper);
    window.addEventListener('load', ajustScrollWrapper);


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
                        }, 4000);

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
                            }, 4000);
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
                                updateInfo.setAttribute('href', 'https://www.github.com/IUrreta/DatabaseEditor/releases/tag/' + latestTag);
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
        statusDiv.insertBefore(outsideDiv, statusDiv.children[2]);
    }

    /**
     * Manages the actions of the update button
     */
    function updateButton() {
        let repoPath = './';
        let git = simpleGit(repoPath);

        document.querySelector(".bi-cloud-download").addEventListener("click", function () {

            git.pull("origin", "release", (error, update) => {
                addSpinner()
                if (error) {
                    update_notifications("Update automatically failed, please update manually", true)
                    updateInfo.classList.remove("bi-cloud-download")
                    updateInfo.classList.add("bi-exclamation-lg")
                    updateInfo.setAttribute('href', 'https://www.github.com/IUrreta/DatabaseEditor/releases/tag/' + latestTag);
                    document.querySelector(".status").removeChild(document.querySelector(".outside-div"))
                    updateInfo.removeEventListener("click", arguments.callee)
                } else {
                    //console.log('Git pull exitoso:',update);
                    setTimeout(() => {
                        exec('restart.vbs', (error, stdout, stderr) => {
                            if (error) {
                                //console.error(`Error: ${error}`);
                                return;
                            }
                            //console.log(`Resultado: ${stdout}`);
                        });
                    }, 500);
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
     * Places and manages the notifications that appear in the tool
     * @param {string} noti message of the notification
     * @param {bool} error if the notification is an error or not
     */
    function update_notifications(noti, error) {
        let newNoti;
        newNoti = document.createElement('div');
        newNoti.className = 'notification';
        newNoti.textContent = noti;
        let toast = createToast(noti, error)
        setTimeout(function () {
            toast.classList.remove("myShow")
        }, 300)
        notificationPanel.appendChild(toast);
        if (!error) {
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
    function createToast(msg, err) {
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
        if (!err) {
            icon.className = "bi bi-check-circle"
            toastIcon.classList.add("success")
        }
        else{
            icon.className = "bi bi-x-circle"
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
            item.addEventListener("click", function () {
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
                document.querySelectorAll(".config-content").forEach(function(elem){
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

    document.querySelector(".gear-container").addEventListener("click", function () {
        let configDetailModal = new bootstrap.Modal(document.getElementById('configDetailModal'), {
            keyboard: false
        })
        configDetailModal.show()
    })

    function manage_config(info){
        if (info[0] === "ERROR"){ //No file detected -> show modal
            document.querySelector(".bi-gear").classList.add("hidden")
            let configModal = new bootstrap.Modal(document.getElementById('configModal'), {
                keyboard: false
            })
            configModal.show()
        }
        else { //File detected -> check if ask to show modal or not
            if (info[0]["state"] === "ask"){
                document.querySelector(".bi-gear").classList.add("hidden")
                let configModal = new bootstrap.Modal(document.getElementById('configModal'), {
                    keyboard: false
                })
                configModal.show()
            }
            else{
                document.querySelector(".bi-gear").classList.remove("hidden")
                manage_config_content(info[0])
                if (info[0]["state"] === "changed"){
                    setTimeout(function(){
                        update_notifications("Config file loaded", false)
                    }, 500)
                }
            }

        }
    }

    function manage_config_content(info){
        console.log(info)
        let teams = info["teams"]
        alphaTauriReplace(teams["alphatauri"])
        alpineReplace(teams["alpine"])
        alfaReplace(teams["alfa"])
        update_logo("alpine", logos_configs[teams["alpine"]], teams["alpine"])
        update_logo("alfa", logos_configs[teams["alfa"]], teams["alfa"])
        update_logo("alphatauri", logos_configs[teams["alphatauri"]], teams["alphatauri"])
        if (info["icon"]){
            console.log(info["icon"])
            replace_custom_team_logo(info["icon"])
            customIconPath = info["icon"]
        }
        if (info["primaryColor"]){
            replace_custom_team_color(info["primaryColor"], info["secondaryColor"])
        }
    }

    document.querySelectorAll(".color-picker").forEach(function(elem){
        let reader = elem.parentNode.querySelector(".color-reader")
        elem.addEventListener("input", function(){
            reader.value = elem.value.toUpperCase()
        })
        reader.value = elem.value.toUpperCase();
    })


    function alphaTauriReplace(info){
        document.querySelector("#alphaTauriReplaceButton").querySelector("button").textContent = names_configs[info]
        document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value = info
        combined_dict[8] = pretty_names[info]
        document.querySelectorAll(".at-name").forEach(function(elem){
            //if it has the class complete, put names_configs[info], else out VCARB
            if (info === "visarb" && !elem.classList.contains("complete")){
                elem.textContent = "VCARB"
            }
            else{
                elem.textContent = names_configs[info]
            }
        })
        if (info !== "alphatauri"){
            document.querySelectorAll(".atlogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
                    elem.src = logos_configs[info]
                    elem.classList.remove("alphataurilogo")
                    elem.classList.remove("toyotalogo")
                    elem.classList.remove("hugologo")
                    elem.classList.remove("ferrarilogo")
                    elem.classList.remove("brawnlogo")
                    elem.classList.add(logos_classes_configs[info])
                }
                if (elem.classList.contains("secondary")){
                    if (info !== "toyota"){
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
        else{
            document.querySelectorAll(".atlogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
                    elem.src = logos_configs[info]
                    elem.classList.remove("alphataurilogo")
                    elem.classList.remove("toyotalogo")
                    elem.classList.remove("hugologo")
                    elem.classList.remove("ferrarilogo")
                    elem.classList.remove("brawnlogo")
                    elem.classList.add("alphataurilogo")
                }
                if (elem.classList.contains("secondary")){
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
        document.querySelectorAll(".team-menu-alphatauri-replace").forEach(function(elem){
            let classes = elem.className.split(" ")
            classes.forEach(function(cl){
                if (cl.includes("changable")){
                    elem.classList.remove(cl)
                    elem.classList.add("changable-team-menu-" + info)
                }
            })
        })
    }

    function alpineReplace(info){
        document.querySelector("#alpineReplaceButton").querySelector("button").textContent = names_configs[info]
        document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value = info
        combined_dict[5] = pretty_names[info]
        document.querySelectorAll(".alpine-name").forEach(function(elem){
            elem.textContent = names_configs[info]
        })
        if (info !== "alpine"){
            document.querySelectorAll(".alpinelogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
                    elem.src = logos_configs[info]
                    elem.classList.remove("alpinelogo")
                    elem.classList.remove("ferrarilogo")
                    elem.classList.remove("lotuslogo")
                    elem.classList.add(logos_classes_configs[info])
                }
                if (elem.classList.contains("secondary")){
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
        else{
            document.querySelectorAll(".alpinelogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
                    elem.src = logos_configs[info]
                    elem.classList.remove("alpinelogo")
                    elem.classList.remove("ferrarilogo")
                    elem.classList.remove("lotuslogo")
                    elem.classList.add("alpinelogo")
                }
                if (elem.classList.contains("secondary")){
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
        document.querySelectorAll(".team-menu-alpine-replace").forEach(function(elem){
            let classes = elem.className.split(" ")
            classes.forEach(function(cl){
                if (cl.includes("changable")){
                    elem.classList.remove(cl)
                    elem.classList.add("changable-team-menu-" + info)
                }
            })
        })
    }
    
    function alfaReplace(info){
        document.querySelector("#alfaReplaceButton").querySelector("button").textContent = names_configs[info]
        document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value = info
        combined_dict[9] = pretty_names[info]
        document.querySelectorAll(".alfa-name").forEach(function(elem){
            elem.textContent = names_configs[info]
        })
        if (info !== "alfa"){
            document.querySelectorAll(".alfalogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
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
        else{
            document.querySelectorAll(".alfalogo-replace").forEach(function(elem){
                if (!elem.classList.contains("non-changable")){
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
        document.querySelectorAll(".team-menu-alfa-replace").forEach(function(elem){
            let classes = elem.className.split(" ")
            classes.forEach(function(cl){
                if (cl.includes("changable")){
                    elem.classList.remove(cl)
                    elem.classList.add("changable-team-menu-" + info)
                }
            })
        })
    }

    function change_css_variables(oldVar, newVar){
        let root = document.documentElement;  
        let newVal = getComputedStyle(root).getPropertyValue(newVar).trim();
        root.style.setProperty(oldVar, newVal);
    }

    document.querySelector("#configButton").addEventListener("click", function(){
        //wait 0.1 seconds to show the modal
        setTimeout(function(){
            let configDetailModal = new bootstrap.Modal(document.getElementById('configDetailModal'), {
                keyboard: false
            })
            configDetailModal.show()
        }, 320)


    })

    //select all team-change-button
    document.querySelectorAll(".team-change-button").forEach(function(elem){
        elem.querySelectorAll("a").forEach(function(a){
            a.addEventListener("click", function(){
                elem.querySelector("button").textContent = a.textContent
                elem.querySelector("button").dataset.value = a.dataset.value
            })
        })
    })

    document.querySelector("#configDetailsButton").addEventListener("click", function(){
        save = document.querySelector("#saveSelector").textContent
        save = save.slice(0, -4)
        alphatauri = document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value
        alpine = document.querySelector("#alpineReplaceButton").querySelector("button").dataset.value
        alfa = document.querySelector("#alfaReplaceButton").querySelector("button").dataset.value
        let data = {
            command: "configUpdate",
            save: save,
            alphatauri: alphatauri,
            alpine: alpine,
            alfa: alfa,
            state: "changed"
        }
        if (customIconPath !== null){
            data["icon"] = customIconPath
            replace_custom_team_logo(customIconPath);
        }
        if (custom_team){
            data["primaryColor"] = document.getElementById("primarySelector").value
            data["secondaryColor"] = document.getElementById("secondarySelector").value
            replace_custom_team_color(data["primaryColor"], data["secondaryColor"])
        }
        socket.send(JSON.stringify(data))
        info = {teams: {alphatauri: alphatauri, alpine: alpine, alfa: alfa}}
        manage_config_content(info)
        reloadTables()
        document.querySelector(".bi-gear").classList.remove("hidden")
    })

    document.querySelector("#cancelConfigButton").addEventListener("click", function(){
        save = document.querySelector("#saveSelector").textContent
        save = save.slice(0, -4)
        let state;
        let checked = document.querySelector("#ask").checked
        if (checked){
            state = "neverask"
        }
        else{
            state = "ask"
        }
        let alpha;
        let alpine;
        let alfa;
        if (game_version === 2024){
            alpha = "visarb"
            alpine = "alpine"
            alfa = "stake"
        }
        else if (game_version === 2023){
            alpha = "alphatauri"
            alpine = "alpine"
            alfa = "alfa"
        }
        let data = {
            command: "configUpdate",
            save: save,
            alphatauri: alpha,
            alpine: alpine,
            alfa: alfa,
            state: state
        }
        socket.send(JSON.stringify(data))
        document.querySelector(".bi-gear").classList.remove("hidden")
    })

    /**
     * Adds eventListeners to all the elements of the staff dropdown
     */
    function listenersStaffGroups() {
        document.querySelectorAll('#staffMenu a').forEach(item => {
            item.addEventListener("click", function () {
                const staffButton = document.getElementById('staffDropdown');
                let staffSelected = item.innerHTML
                let staffCode = item.dataset.spacestats
                if (staffCode === "driverStats") {
                    typeOverall = "driver"
                    typeEdit = "0"
                    document.getElementById("driverSpecialAttributes").classList.remove("d-none")
                }
                else {
                    typeOverall = "staff"
                    document.getElementById("driverSpecialAttributes").classList.add("d-none")
                    if (staffCode === "chiefStats") {
                        typeEdit = "1"
                    }
                    if (staffCode === "engineerStats") {
                        typeEdit = "2"
                    }
                    if (staffCode === "aeroStats") {
                        typeEdit = "3"
                    }
                    if (staffCode === "directorStats") {
                        typeEdit = "4"
                    }

                }
                staffButton.innerHTML = staffSelected;
                change_elegibles(item.dataset.spacestats)
                document.querySelectorAll(".staff-list").forEach(function (elem) {
                    elem.classList.add("d-none")
                    if (item.dataset.list == elem.id) {
                        elem.classList.remove("d-none")
                    }
                })
                document.querySelector(".left-panel-stats").classList.add("d-none")
                statPanelShown = 0;
            });

        });
    }

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
    predictPill.addEventListener("click", function () {
        manageScripts("show", "hide", "hide", "hide", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })

    h2hPill.addEventListener("click", function () {
        manageScripts("hide","show", "hide", "hide", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })

    viewPill.addEventListener("click", function () {
        manageScripts("hide","hide", "show", "hide", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })  

    driverTransferPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "show", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(false)
    })

    editStatsPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "show", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true, "stats")
    })

    constructorsPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "hide", "hide", "show")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true, "teams")
    })
    

    CalendarPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "show", "hide", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true, "calendar")
    })

    carPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "hide", "show", "hide")
        scriptSelected = 1
        check_selected()
        manageSaveButton(true, "performance")
    })


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

});
