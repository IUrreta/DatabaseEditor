const socket = new WebSocket('ws://localhost:8765/');

document.addEventListener('DOMContentLoaded',function () {



    const driverTransferPill = document.getElementById("transferpill");
    const editStatsPill = document.getElementById("statspill");
    const CalendarPill = document.getElementById("calendarpill");
    const carPill = document.getElementById("carpill");

    const driverTransferDiv = document.getElementById("driver_transfers");
    const editStatsDiv = document.getElementById("edit_stats");
    const customCalendarDiv = document.getElementById("custom_calendar");
    const carPerformanceDiv = document.getElementById("car_performance");


    const scriptsArray = [driverTransferDiv,editStatsDiv,customCalendarDiv, carPerformanceDiv]

    const dropDownMenu = document.getElementById("dropdownMenu");

    const notificationPanel = document.getElementById("notificationPanel");



    let isSaveSelected = 0;
    let scriptSelected = 0;
    let divBlocking = 1;



    let connectionTimeout = setTimeout(() => {
        update_notifications("Could not connect with backend",true)
    },4000);



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
        if (message[0] === "ERROR") {
            update_notifications(message[1],true)
        }
        else {
            if (message[0] === "Connected Succesfully") {
                load_saves(message)
                clearTimeout(connectionTimeout);
            }
            else if (message[0] === "Save Loaded Succesfully") {
                remove_drivers()
                removeStatsDrivers()
                place_drivers(message.slice(1))
                place_drivers_editStats(message.slice(1))
                create_races()
            }
            else if (message[0] === "Staff Fetched") {
                place_staff(message.slice(1))
            }
            else if (message[0] === "Calendar fetched") {
                manage_calendarDiv(message.slice(1)[0])
            }
            else if (message[0] === "Contract fetched") {
                manage_modal(message.slice(1)[0])
            }
            if (message[0] !== "Calendar fetched" && message[0] !== "Contract fetched" && message[0] != "Staff Fetched") update_notifications(message[0],false)

        }

    };


    function manage_calendarDiv(info) {
        if (info[0] === "1") {
            document.getElementById("calendarBlockDiv").className = "blocking-div d-none"

        }
        else if (info[0] === "0") {
            document.getElementById("calendarBlockDiv").className = "blocking-div"
        }
    }

    function manage_modal(info) {
        document.querySelectorAll(".rounded-input").forEach(function (elem,index) {
            elem.value = info[index]
        })

    }

    function update_notifications(noti,error) {
        let newNoti;
        newNoti = document.createElement('div');
        newNoti.className = 'notification';
        newNoti.textContent = noti;
        if (error) newNoti.style.color = "red";

        notificationPanel.appendChild(newNoti);
        if (!error) {
            setTimeout(function () {
                newNoti.className = 'notification hide';

                // Después de otros 2 segundos, eliminar el nuevo div
                setTimeout(function () {
                    notificationPanel.removeChild(newNoti);
                },980);
            },3000);
        }
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
        listenersStaffGroups()
    }

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
                statPanelShown = 0;
                check_selected()
            });
        });
    }

    function listenersStaffGroups() {
        document.querySelectorAll('#staffMenu a').forEach(item => {
            item.addEventListener("click",function () {
                const staffButton = document.getElementById('staffButton');
                let staffSelected = item.innerHTML
                if (staffSelected === "Drivers") {
                    typeOverall = "driver"
                    typeEdit = "0"
                    document.getElementById("specialStatsPanel").classList.remove("d-none")
                }
                else {
                    typeOverall = "staff"
                    document.getElementById("specialStatsPanel").classList.add("d-none")
                    if (staffSelected === "Technical Chiefs") {
                        typeEdit = "1"
                    }
                    if (staffSelected === "Race Engineers") {
                        typeEdit = "2"
                    }
                    if (staffSelected === "Head of Aerodynamics") {
                        typeEdit = "3"
                    }
                    if (staffSelected === "Sporting Directors") {
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

    function change_elegibles(divID) {
        document.querySelectorAll(".elegible").forEach(function (elem) {
            elem.classList.remove("elegible")

        })
        let divStats = document.getElementById(divID)
        divStats.querySelectorAll(".custom-input-number").forEach(function (elem) {
            elem.classList.add("elegible")
        })
        if (divID === "driverStats") {
            document.getElementById("growthInput").classList.add("elegible")
            document.getElementById("agressionInput").classList.add("elegible")

        }
        document.querySelectorAll(".main-panel-stats").forEach(function (elem) {
            elem.className = "main-panel-stats d-none"
        })
        divStats.classList.remove("d-none")

    }

    function check_selected() {
        if (isSaveSelected == 1 && scriptSelected == 1 && divBlocking == 1) {
            document.getElementById("blockDiv").className = "d-none"
            divBlocking = 0;

        }
    }

    driverTransferPill.addEventListener("click",function () {
        manageScripts("show","hide","hide", "hide")
        scriptSelected = 1
        check_selected()

    })

    editStatsPill.addEventListener("click",function () {
        manageScripts("hide","show","hide", "hide")
        scriptSelected = 1
        check_selected()
    })

    CalendarPill.addEventListener("click",function () {
        manageScripts("hide","hide","show", "hide")
        scriptSelected = 1
        check_selected()
    })

    carPill.addEventListener("click",function () {
        manageScripts("hide","hide", "hide","show")
        scriptSelected = 1
        check_selected()
    })


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

});
