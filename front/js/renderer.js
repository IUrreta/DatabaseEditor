const socket = new WebSocket('ws://localhost:8765/');

document.addEventListener('DOMContentLoaded', function () {



    const driverTransferPill = document.getElementById("transferpill");
    const editStatsPill = document.getElementById("statspill");
    const CalendarPill = document.getElementById("calendarpill");

    const driverTransferDiv = document.getElementById("driver_transfers");
    const editStatsDiv = document.getElementById("edit_stats");
    const customCalendarDiv = document.getElementById("custom_calendar");


    const scriptsArray = [driverTransferDiv, editStatsDiv, customCalendarDiv]

    const dropDownMenu = document.getElementById("dropdownMenu");

    const notificationPanel = document.getElementById("notificationPanel");

    

    let isSaveSelected = 0;
    let scriptSelected = 0;
    let divBlocking = 1;


    let connectionTimeout = setTimeout(() => {
        update_notifications("Could not connect with backend", true) 
    }, 4000); 

    

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
        console.log(message)
        if(message[0] === "ERROR"){
            update_notifications(message[1], true)
        }
        else{
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
            update_notifications(message[0], false)
        }

    };

    function update_notifications(noti, error) {
        let newNoti;
        newNoti = document.createElement('div');
        newNoti.className = 'notification';
        newNoti.textContent = noti;
        console.log(noti)
        console.log(error)
        if(error) newNoti.style.color = "red";

        notificationPanel.appendChild(newNoti);
        if(!error){
            setTimeout(function () {
                newNoti.className = 'notification hide';
    
                // Después de otros 2 segundos, eliminar el nuevo div
                setTimeout(function () {
                    notificationPanel.removeChild(newNoti);
                }, 980);
            }, 3000);
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
                document.getElementById("editStatsPanel").className = "left-panel-stats d-none";
                statPanelShown = 0;
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
        manageScripts("show", "hide", "hide")
        scriptSelected = 1
        check_selected()
        
    })

    editStatsPill.addEventListener("click", function () {
        manageScripts("hide", "show", "hide")
        scriptSelected = 1
        check_selected()
    })

    CalendarPill.addEventListener("click", function () {
        manageScripts("hide", "hide", "show")
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

});
