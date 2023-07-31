
document.addEventListener('DOMContentLoaded', function () {

    const socket = new WebSocket('ws://localhost:8765/');

    const driverTransferPill = document.getElementById("transferpill");
    const editStatsPill = document.getElementById("statspill");

    const driverTransferDiv = document.getElementById("driver_transfers");
    const editStatsDiv = document.getElementById("edit_stats");

    const scriptsArray = [driverTransferDiv, editStatsDiv]

    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const raceBonusCheck = document.getElementById("raceBonusCheck");
    const raceBonusAmt = document.getElementById("raceBonusAmt");
    const raceBonusPos = document.getElementById("raceBonusPos");

    const freeDriversPill = document.getElementById("freepill");
    const f2DriversPill = document.getElementById("F2pill");
    const f3DriversPill = document.getElementById("F3pill");

    const freeDriversDiv = document.getElementById("free-drivers");
    const f2DriversDiv = document.getElementById("f2-drivers");
    const f3DriversDiv = document.getElementById("f3-drivers");

    const dropDownMenu = document.getElementById("dropdownMenu");

    const notificationPanel = document.getElementById("notificationPanel");

    const divsArray = [freeDriversDiv, f2DriversDiv, f3DriversDiv]

    let isSaveSelected = 0;
    let scriptSelected = 0;
    let divBlocking = 1;
    let statPanelShown = 0;

    let originalParent;
    let destinationParent;
    let draggable;
    let teamDestiniy;
    let teamOrigin;
    let posInTeam;

    let team_dict = { 1: "fe", 2: "mc", 3: "rb", 4: "me", 5: "al", 6: "wi", 7: "ha", 8: "at", 9: "af", 10: "as" }
    let inverted_dict = { 'ferrari': 1, 'mclaren': 2, 'redbull': 3, 'merc': 4, 'alpine': 5, 'williams': 6, 'haas': 7, 'alphatauri': 8, 'alfaromeo': 9, 'astonmartin': 10 }
    let name_dict = { 'ferrari': "Ferrari", 'mclaren': "McLaren", 'redbull': "Red Bull", 'merc': "Mercedes", 'alpine': "Alpine", 'williams': "Williams", 'haas': "Haas", 'alphatauri': "Alpha Tauri", 'alfaromeo': "Alfa Romeo", 'astonmartin': "Aston Martin", "F2": "F2", "F3": "F3" }

    socket.onopen = () => {
        //console.log('Conexión establecida.');
        let data = {
            command: "connect"
        }
        socket.send(JSON.stringify(data))
    };

    socket.onmessage = (event) => {
        // const mensaje = event.data;
        // console.log('Mensaje recibido: ' + event.data);
        let message = JSON.parse(event.data)
        if (message[0] === "Connected Succesfully") {
            load_saves(message)

        }
        else if (message[0] === "Save Loaded Succesfully") {
            remove_drivers()
            removeStatsDrivers()
            place_drivers(message.slice(1))
            place_drivers_editStats(message.slice(1))
        }
        update_notifications(message[0])
    };

    function update_notifications(noti) {
        let newNoti;

        newNoti = document.createElement('div');
        newNoti.className = 'notification';
        newNoti.textContent = noti;

        notificationPanel.appendChild(newNoti);

        setTimeout(function () {
            newNoti.className = 'notification hide';

            // Después de otros 2 segundos, eliminar el nuevo div
            setTimeout(function () {
                notificationPanel.removeChild(newNoti);
            }, 980);
        }, 3000);


    }


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
    }

    function listenersSaves() {
        document.querySelectorAll('#dropdownMenu a').forEach(item => {
            item.addEventListener("click", function () {
                const dropdownButton = document.getElementById('dropdownButton');
                let saveSelected = item.innerHTML
                dropdownButton.innerHTML = saveSelected;
                let dataSaves = {
                    command: "saveSelected",
                    save: saveSelected
                }
                socket.send(JSON.stringify(dataSaves))
                isSaveSelected = 1;
                check_selected()
            });
        });
    }

    function check_selected(){
        if(isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1){
            document.getElementById("blockDiv").className = "d-none"
            divBlocking = 0;

        }
    }

    driverTransferPill.addEventListener("click", function () {
        manageScripts("show", "hide")
        scriptSelected = 1
        check_selected()
        
    })

    editStatsPill.addEventListener("click", function () {
        manageScripts("hide", "show")
        scriptSelected = 1
        check_selected()
    })


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

    //-------------------------------------ESPECIFICO DE EDITSTATS SCRIPT-----------------------------------------------------------

    let driverStatTitle = document.getElementById("driverStatsTitle")

    function removeStatsDrivers(){
        document.getElementById("fulldriverlist").innerHTML = ""
    }

    function place_drivers_editStats(driversArray) {
        let divPosition;
        driversArray.forEach((driver) => {
            divPosition = "fulldriverlist"

            let newDiv = document.createElement("div");
            let ovrDiv = document.createElement("div");
            
            newDiv.className = "col normal-driver";
            newDiv.dataset.driverid = driver[1];
            newDiv.innerHTML = driver[0];
            let statsString = '';

            for (let i = 4; i <= 12; i++) {
                statsString += driver[i] + ' ';
            }
            newDiv.dataset.stats = statsString;
            newDiv.addEventListener('click', () => {
                let elementosClicked = document.querySelectorAll('.clicked');
                elementosClicked.forEach(item => item.classList.remove('clicked'));
                newDiv.classList.toggle('clicked');
                driverStatTitle.innerHTML = manage_stats_title(newDiv.textContent);
                load_stats(newDiv)
                if(statPanelShown == 0){
                    document.getElementById("editStatsPanel").className = "left-panel-stats"
                    statPanelShown = 1
                }
                
                document.getElementById("confirmbtn").className = "btn custom-confirm disabled"
                recalculateOverall()
                
            });
            ovr = calculateOverall(statsString)
            ovrDiv.innerHTML = ovr
            newDiv.appendChild(ovrDiv)
            document.getElementById(divPosition).appendChild(newDiv)

            
        })

        document.querySelectorAll(".custom-input-number").forEach(function(elem) {
            elem.addEventListener("change", function(){
                document.getElementById("confirmbtn").className = "btn custom-confirm"
                if(elem.value > 99){
                    elem.value = 99;
                }
                recalculateOverall()
            });
        });
    }

    function recalculateOverall(){
        let stats = ""
        document.querySelectorAll(".custom-input-number").forEach(function(elem){
            stats += elem.value + " "
        })
        stats = stats.slice(0, -1);
        let oldovr = document.getElementById("ovrholder").innerHTML;
        let ovr = calculateOverall(stats);
        if (oldovr != ovr){
            document.getElementById("ovrholder").innerHTML = ovr;
            document.getElementById("ovrholder").className = "overall-holder bold-font alert";
            setTimeout(() =>{
                document.getElementById("ovrholder").className = "overall-holder bold-font"
            }, 500);
        
        }
        


    }

    document.getElementById("confirmbtn").addEventListener("click", function(){
        let stats = ""
        document.querySelectorAll(".custom-input-number").forEach(function(elem){
            stats += elem.value + " "
        })

        let id = document.querySelector(".clicked").dataset.driverid
        let driverName = manage_stats_title(document.querySelector(".clicked").textContent)
        document.querySelector(".clicked").dataset.stats = stats
        let new_ovr = calculateOverall(stats)
        document.querySelector(".clicked").childNodes[1].innerHTML = new_ovr

        let dataStats = {
            command: "editStats",
            driverID: id,
            driver: driverName,
            statsArray: stats
        }

        socket.send(JSON.stringify(dataStats))

    })

    function calculateOverall(stats) {
        let statsArray = stats.split(" ").map(Number);

        let cornering = statsArray[0];
        let braking = statsArray[1];
        let control = statsArray[2];
        let smoothness = statsArray[3];
        let adaptability = statsArray[4];
        let overtaking = statsArray[5];
        let defence = statsArray[6];
        let reactions = statsArray[7];
        let accuracy = statsArray[8];

        let rating = (cornering + braking * 0.75 + reactions * 0.5 + control * 0.5 + smoothness * 0.5 + accuracy * 0.75 + adaptability * 0.25 + overtaking * 0.25 + defence * 0.25) / 4.75;

        return Math.round(rating)
    }

    function load_stats(div){
        let statsArray = div.dataset.stats.split(" ").map(Number);

        let inputArray = document.querySelectorAll(".custom-input-number")
        inputArray.forEach(function (input, index) {
            inputArray[index].value = statsArray[index]
        });
    }


    function manage_stats_title(html){
        let name = html.substring(0, html.length - 2).trim();

        return name;

    }


    //-------------------------------------ESPECIFICO DE TRANSFER SCRIPT-----------------------------------------------------------


    function remove_drivers() {

        document.querySelectorAll('.driver-space').forEach(item => {
            item.innerHTML = ""
        });
        freeDriversDiv.innerHTML = ""
        f2DriversDiv.innerHTML = ""
        f3DriversDiv.innerHTML = ""
    }

    function place_drivers(driversArray) {
        let divPosition;
        driversArray.forEach((driver) => {
            divPosition = "free-drivers"
            if (driver[2] > 0 && driver[2] <= 10) divPosition = team_dict[driver[2]] + driver[3];
            else if (driver[2] > 10 && driver[2] <= 20) divPosition = "f2-drivers";
            else if (driver[2] > 20 && driver[2] <= 30) divPosition = "f3-drivers";

            let newDiv = document.createElement("div");
            newDiv.className = "col free-driver";
            newDiv.dataset.driverid = driver[1];
            newDiv.innerHTML = driver[0];
            document.getElementById(divPosition).appendChild(newDiv)



        })
    }

    freeDriversPill.addEventListener("click", function () {
        manageDrivers("show", "hide", "hide")
    })

    f2DriversPill.addEventListener("click", function () {
        manageDrivers("hide", "show", "hide")
    })

    f3DriversPill.addEventListener("click", function () {
        manageDrivers("hide", "hide", "show")
    })

    function manageDrivers(...divs) {
        divsArray.forEach(function (div, index) {
            if (divs[index] === "show") {
                div.className = "main-columns-drag-section"
            }
            else {
                div.className = "main-columns-drag-section d-none"
            }
        })
    }

    raceBonusCheck.addEventListener("click", function () {
        if (raceBonusCheck.checked) {
            raceBonusPos.disabled = false;
            raceBonusAmt.disabled = false;
            raceBonusAmt.value = "";
            raceBonusPos.value = "";
        }
        else {
            raceBonusPos.disabled = true;
            raceBonusAmt.disabled = true;
            raceBonusAmt.value = "0";
            raceBonusPos.value = "10";
        }
    })

    document.getElementById("confirmButton").addEventListener('click', function () {
        let salaryData = document.getElementById("salaryInput").value;
        let yearData = document.getElementById("yearInput").value;
        let signBonusData = document.getElementById("signBonusInput").value;
        let raceBonusData;
        let raceBonusPosData;
        let driverName = draggable.innerHTML

        if (raceBonusAmt.value === "")
            raceBonusData = "0";
        else

            raceBonusData = raceBonusAmt.value;
        if (raceBonusPos.value === "")
            raceBonusPosData = "10";
        else
            raceBonusPosData = raceBonusPos.value;

        if (originalParent.id === "f2-drivers" | originalParent.id === "f3-drivers" | originalParent.className === "col driver-space") {
            let extra = {
                command: "fire",
                driverID: draggable.dataset.driverid,
                driver: driverName,
                team: name_dict[teamOrigin.dataset.team]
            }
            socket.send(JSON.stringify(extra))
        }
        let data = {
            command: "hire",
            driverID: draggable.dataset.driverid,
            teamID: inverted_dict[teamDestiniy],
            position: posInTeam,
            salary: salaryData,
            signBonus: signBonusData,
            raceBonus: raceBonusData,
            raceBonusPos: raceBonusPosData,
            year: yearData,
            driver: driverName,
            team: name_dict[teamDestiniy]
        }
        destinationParent.appendChild(draggable);
        socket.send(JSON.stringify(data))
    })

    document.getElementById("cancelButton").addEventListener('click', function () {
        originalParent.appendChild(draggable);

        div0.style.transform = 'translate(0px, 0px)';
        div0.setAttribute('data-x', 0);
        div0.setAttribute('data-y', 0);


    })

    interact('.free-driver').draggable({
        inertia: true,
        listeners: {
            start(event) {
                originalParent = event.target.parentNode;
                if (originalParent.className != "main-columns-drag-section") {
                    teamOrigin = originalParent.parentNode
                }
                else {
                    teamOrigin = originalParent
                }
                draggable = event.target;
                let target = event.target;
                let position = target.getBoundingClientRect();
                let width = target.getBoundingClientRect().width
                target.style.width = width + "px";
                target.style.position = "fixed";
                target.style.top = position.top + "px";
            },
            move(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;
                target.style.opacity = 1;
                target.style.zIndex = 10;

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end(event) {
                let target = event.target;
                target.style.position = "relative";
                target.style.top = "auto";
                target.style.width = "auto";
                const freeDrivers = document.getElementById('free-drivers');
                const freeRect = freeDrivers.getBoundingClientRect();

                const driverSpaceElements = document.querySelectorAll('.driver-space');
                driverSpaceElements.forEach(function (element) {
                    const rect = element.getBoundingClientRect();
                    if (event.clientX >= rect.left && event.clientX <= rect.right &&
                        event.clientY >= rect.top && event.clientY <= rect.bottom) {
                        if (element.childElementCount < 1) {
                            destinationParent = element;
                            element.appendChild(target);
                            teamDestiniy = element.parentNode.dataset.team
                            posInTeam = element.id.charAt(2)
                            document.getElementById("contractModalTitle").innerHTML = target.innerHTML + "'s contract with " + name_dict[teamDestiniy];
                            myModal.show();
                        }
                    }
                });


                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                if (event.clientX >= freeRect.left && event.clientX <= freeRect.right &&
                    event.clientY >= freeRect.top && event.clientY <= freeRect.bottom) {
                    originalParent.removeChild(draggable);
                    freeDrivers.appendChild(target);
                    let data = {
                        command: "fire",
                        driverID: draggable.dataset.driverid,
                        driver: draggable.innerHTML,
                        team: name_dict[teamOrigin.dataset.team]
                    }
                    socket.send(JSON.stringify(data))
                }

                target.style.transform = 'none';
                target.setAttribute('data-x', 0);
                target.setAttribute('data-y', 0);
                // originalParent = undefined;
                // destinationParent = undefined;
                // draggable = undefined;
            }
        }
    });
});
