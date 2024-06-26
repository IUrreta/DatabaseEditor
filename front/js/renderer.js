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

const fs = require('fs');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const { marked } = require('marked');
const Tabulator = require('tabulator-tables');
let conn = 0;

let versionNow;
const versionPanel = document.querySelector('.versionPanel');
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
    const noNotifications = ["Config", "ERROR", "Montecarlo fetched","TeamData Fetched", "Progress", "JIC", "Calendar fetched", "Contract fetched", "Staff Fetched", "Engines fetched", "Results fetched", "Year fetched", "Numbers fetched", "H2H fetched", "DriversH2H fetched", "H2HDriver fetched", "Retirement fetched", "Prediction Fetched", "Events to Predict Fetched", "Events to Predict Modal Fetched"]

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
        "Retirement fetched": (message) => {
            loadRetirementyear(message.slice(1));
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
        // console.log(message)
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
        var windowHeight = window.innerHeight - 265;
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
     * Places all the values for the modal that just openend
     * @param {Object} info values for the contract modal that just opened
     */
    function manage_modal(info) {
        document.querySelector(".contract-options").querySelectorAll(".rounded-input").forEach(function (elem, index) {
            elem.value = info[0][index]
        })
        document.querySelector("#numberButton").textContent = info[1][0]
        if (info[1][1] === 1) {
            document.querySelector("#driverNumber1").checked = true
        }
        else if (info[1][1] === 0) {
            document.querySelector("#driverNumber1").checked = false
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
        }, 500)
        notificationPanel.appendChild(toast);
        if (!error) {
            setTimeout(function () {
                toast.querySelector(".notification-line").classList.add("start");
            }, 10);
            setTimeout(function () {
                toast.classList.add("hide")

                setTimeout(function () {
                    notificationPanel.removeChild(toast);
                }, 480);
            }, 3000);
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
        let toastDiv = document.createElement('div');
        let toastBodyDiv = document.createElement('div');
        let line = document.createElement('div');

        // Asignar clases y atributos
        toastFull.classList.add('toast', "d-flex", "myShow", "d-block", "custom-toast")
        toastFull.style.flexDirection = "column"
        toastFull.setAttribute('role', 'alert');
        toastFull.setAttribute('aria-live', 'assertive');
        toastFull.setAttribute('aria-atomic', 'true');

        toastDiv.classList.add('align-items-center');
        if (!err){
            line.classList.add("notification-line")
        }

        toastBodyDiv.classList.add('d-flex', 'toast-body');
        toastBodyDiv.textContent = msg;
        toastBodyDiv.style.opacity = "1"
        toastBodyDiv.style.color = "white"
        toastBodyDiv.style.zIndex = "6"

        if (err) {
            toastBodyDiv.classList.add("toast-error")
            line.classList.add("line-error")
        }

        toastDiv.appendChild(toastBodyDiv);
        toastFull.appendChild(toastDiv)
        toastFull.appendChild(line)

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
                document.querySelector(".save-selector-title").classList.add("activeSelected")
                let saveSelected = item.innerHTML
                saveSelector.innerHTML = saveSelected;
                let dataSaves = {
                    command: "saveSelected",
                    save: saveSelected
                }
                socket.send(JSON.stringify(dataSaves))
                isSaveSelected = 1;
                document.getElementById("editStatsPanel").className = "left-panel-stats d-none";
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

    document.querySelector(".bi-file-earmark-binary").addEventListener("click", function () {
        let configDetailModal = new bootstrap.Modal(document.getElementById('configDetailModal'), {
            keyboard: false
        })
        configDetailModal.show()
    })

    function manage_config(info){
        if (info[0] === "ERROR"){ //No file detected -> show modal
            document.querySelector(".bi-file-earmark-binary").classList.add("hidden")
            let configModal = new bootstrap.Modal(document.getElementById('configModal'), {
                keyboard: false
            })
            configModal.show()
        }
        else { //File detected -> check if ask to show modal or not
            if (info[0]["ask"] === 1){
                document.querySelector(".bi-file-earmark-binary").classList.add("hidden")
                let configModal = new bootstrap.Modal(document.getElementById('configModal'), {
                    keyboard: false
                })
                configModal.show()
            }
            else{
                document.querySelector(".bi-file-earmark-binary").classList.remove("hidden")
                manage_config_content(info[0])
                if (info[0]["ask"] === 2){
                    setTimeout(function(){
                        update_notifications("Config file loaded", false)
                    }, 500)
                }
            }

        }
    }

    function manage_config_content(info){
        info = info["teams"]
        alphaTauriReplace(info["alphatauri"])
        alpineReplace(info["alpine"])
        alfaReplace(info["alfa"])
        update_logo("alpine", logos_configs[info["alpine"]], info["alpine"])
        update_logo("alfa", logos_configs[info["alfa"]], info["alfa"])
        update_logo("alphatauri", logos_configs[info["alphatauri"]], info["alphatauri"])
    }


    function alphaTauriReplace(info){
        document.querySelector("#alphaTauriReplaceButton").querySelector("button").textContent = names_configs[info]
        document.querySelector("#alphaTauriReplaceButton").querySelector("button").dataset.value = info
        combined_dict[8] = pretty_names[info]
        document.querySelectorAll(".at-name").forEach(function(elem){
            //if it has the class complete, put names_configs[info], else out VCARB
            if (elem.classList.contains("complete")){
                elem.textContent = names_configs[info]
            }
            else{
                elem.textContent = "VCARB"
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
        }
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
        }
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
        }
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
            ask: 2
        }
        socket.send(JSON.stringify(data))
        info = {teams: {alphatauri: alphatauri, alpine: alpine, alfa: alfa}}
        manage_config_content(info)
        reloadTables()
        document.querySelector(".bi-file-earmark-binary").classList.remove("hidden")
    })

    document.querySelector("#cancelConfigButton").addEventListener("click", function(){
        save = document.querySelector("#saveSelector").textContent
        save = save.slice(0, -4)
        let ask = !document.querySelector("#ask").checked
        if (ask){
            ask = 1
        }
        else{
            ask = 0
        }
        let data = {
            command: "configUpdate",
            save: save,
            alphatauri: "alphatauri",
            alpine: "alpine",
            alfa: "alfa",
            ask: ask
        }
        socket.send(JSON.stringify(data))
        document.querySelector(".bi-file-earmark-binary").classList.remove("hidden")
    })

    /**
     * Adds eventListeners to all the elements of the staff dropdown
     */
    function listenersStaffGroups() {
        document.querySelectorAll('#staffMenu a').forEach(item => {
            item.addEventListener("click", function () {
                const staffButton = document.getElementById('staffButton');
                let staffSelected = item.innerHTML
                let staffCode = item.dataset.spacestats
                if (staffCode === "driverStats") {
                    typeOverall = "driver"
                    typeEdit = "0"
                    document.getElementById("specialStatsPanel").classList.remove("d-none")
                }
                else {
                    typeOverall = "staff"
                    document.getElementById("specialStatsPanel").classList.add("d-none")
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
        managePillsTitle("ia")
    })

    h2hPill.addEventListener("click", function () {
        manageScripts("hide","show", "hide", "hide", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("data")

    })

    viewPill.addEventListener("click", function () {
        manageScripts("hide","hide", "show", "hide", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("data")

    })

    driverTransferPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "show", "hide", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("edit")

    })

    editStatsPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "show", "hide", "hide", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("edit")
    })

    constructorsPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "hide", "hide", "show")
        scriptSelected = 1
        check_selected()
        managePillsTitle("edit")
    })
    

    CalendarPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "show", "hide", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("edit")
    })

    carPill.addEventListener("click", function () {
        manageScripts("hide","hide", "hide", "hide", "hide", "hide", "show", "hide")
        scriptSelected = 1
        check_selected()
        managePillsTitle("edit")
    })

    function managePillsTitle(type) {
        if (type === "data") {
            document.querySelector("#dataPills").classList.add("activeType")
            document.querySelector("#dataPills").querySelector(".pill-line").classList.add("activeType")
            document.querySelector("#editPills").classList.remove("activeType")
            document.querySelector("#editPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector("#iaPills").classList.remove("activeType")
            document.querySelector("#iaPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector(".mode-line").className = "mode-line view"
            document.querySelector(".moving-line").className = "moving-line view"
        }
        else if (type === "edit") {
            document.querySelector("#editPills").classList.add("activeType")
            document.querySelector("#editPills").querySelector(".pill-line").classList.add("activeType")
            document.querySelector("#dataPills").classList.remove("activeType")
            document.querySelector("#dataPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector("#iaPills").classList.remove("activeType")
            document.querySelector("#iaPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector(".mode-line").className = "mode-line edit"
            document.querySelector(".moving-line").className = "moving-line edit"
        }
        else if (type === "ia") {
            document.querySelector("#iaPills").classList.add("activeType")
            document.querySelector("#iaPills").querySelector(".pill-line").classList.add("activeType")
            document.querySelector("#dataPills").classList.remove("activeType")
            document.querySelector("#dataPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector("#editPills").classList.remove("activeType")
            document.querySelector("#editPills").querySelector(".pill-line").classList.remove("activeType")
            document.querySelector(".mode-line").className = "mode-line ai"
            document.querySelector(".moving-line").className = "moving-line ai"
        }
    }

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
