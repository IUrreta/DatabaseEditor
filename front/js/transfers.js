const myModal = new bootstrap.Modal(document.getElementById('contractModal'));
const raceBonusAmt = document.getElementById("raceBonusAmt");
const raceBonusPos = document.getElementById("raceBonusPos");

const freeDriversPill = document.getElementById("freepill");
const f2DriversPill = document.getElementById("F2pill");
const f3DriversPill = document.getElementById("F3pill");

const freeDriversDiv = document.getElementById("free-drivers");
const f2DriversDiv = document.getElementById("f2-drivers");
const f3DriversDiv = document.getElementById("f3-drivers");

const autoContractToggle = document.getElementById("autoContractToggle")

const divsArray = [freeDriversDiv,f2DriversDiv,f3DriversDiv]

const selectImageButton = document.getElementById('selectImage');
const fileInput = document.getElementById('fileInput');

const f2_teams = [11,12,13,14,15,16,17,18,19,20,21]
const f3_teams = [22,23,24,25,26,27,28,29,30,31]


let originalParent;
let destinationParent;
let draggable;
let teamDestiniy;
let teamOrigin;
let posInTeam;
let modalType;
let driverEditingID;
let driverEditingName;
let driver1;
let driver2;
let originalTeamId

let team_dict = { 1: "fe",2: "mc",3: "rb",4: "me",5: "al",6: "wi",7: "ha",8: "at",9: "af",10: "as",32: "ct" }
let inverted_dict = {'ferrari': 1,'mclaren': 2,'redbull': 3,'merc': 4,'alpine': 5,'williams': 6,'haas': 7,'alphatauri': 8,'alfaromeo': 9,'astonmartin': 10, 'custom': 32 }
let name_dict = { 'ferrari': "Ferrari",'mclaren': "McLaren",'redbull': "Red Bull",'merc': "Mercedes",'alpine': "Alpine",'williams': "Williams",'haas': "Haas",'alphatauri': "Alpha Tauri",'alfaromeo': "Alfa Romeo",'astonmartin': "Aston Martin","F2": "F2","F3": "F3", "custom": "Custom Team" }

/**
 * Removes all the drivers from teams and categories
 */
function remove_drivers() {
    document.querySelectorAll('.driver-space').forEach(item => {
        item.innerHTML = ""
    });
    document.querySelectorAll('.affiliates-space').forEach(item => {
        item.innerHTML = ""
    });
    freeDriversDiv.innerHTML = ""
    f2DriversDiv.innerHTML = ""
    f3DriversDiv.innerHTML = ""
}

function insert_space(str) {
    return str.replace(/([A-Z])/g, ' $1').trim();
}


/**
 * Places all drivers in their respective team, category etc
 * @param {Object} driversArray List of drivers
 */
function place_drivers(driversArray) {
    let divPosition;
    driversArray.forEach((driver) => {
        let newDiv = document.createElement("div");
        newDiv.className = "col free-driver";
        newDiv.dataset.driverid = driver[1];
        newDiv.dataset.teamid = driver[2];
        let name = driver[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = insert_space(name[0]) + " "
        spanLastName.textContent = " " + name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        newDiv.appendChild(spanName)
        newDiv.appendChild(spanLastName)
        newDiv.classList.add(team_dict[driver[2]] + "-transparent")
        manageColor(newDiv,spanLastName)
        if (driver[4] === 1) {
            addUnRetireIcon(newDiv)
        }

        //newDiv.innerHTML = driver[0];
        divPosition = "free-drivers"
        let position = driver[3]
        if (position >= 3) {
            position = 3
        }
        if (driver[2] > 0 && driver[2] <= 10 || driver[2] === 32) {
            addIcon(newDiv)
            divPosition = team_dict[driver[2]] + position;
        }
        document.getElementById(divPosition).appendChild(newDiv)

    })
}

document.querySelectorAll(".affiliates-and-arrows").forEach(function (elem) {
    elem.querySelector(".bi-chevron-right").addEventListener("click",function () {
        let parent = elem.parentNode.parentNode
        let affiliatesDiv = parent.querySelector(".affiliates-space")
        affiliatesDiv.scrollBy({ left: 100,behavior: 'smooth' });
    })

    elem.querySelector(".bi-chevron-left").addEventListener("click",function () {
        let parent = elem.parentNode.parentNode
        let affiliatesDiv = parent.querySelector(".affiliates-space")
        affiliatesDiv.scrollBy({ left: -100,behavior: 'smooth' });
    })
})


/**
 * Updates the color from the div depending on the team, both in contract and stats view
 * @param {div} div div from the driver
 */
function updateColor(div) {
    let surnameDiv = div.querySelector(".bold-font")
    surnameDiv.className = "bold-font"
    manageColor(div,surnameDiv)
    let statsDiv = document.querySelector("#fulldriverlist").querySelector('[data-driverid="' + div.dataset.driverid + '"]')
    statsDiv.dataset.teamid = div.dataset.teamid
    surnameDiv = statsDiv.querySelector(".surname")
    surnameDiv.className = "bold-font surname"
    manageColor(statsDiv,surnameDiv)
    div.className = "colr free-driver " + team_dict[div.dataset.teamid] + "-transparent"
}

/**
 * Manages the color depending on the team
 * @param {div} div div from the driver
 * @param {span} lastName the lastname span from the driver
 */
function manageColor(div,lastName) {
    if (div.dataset.teamid != 0) {
        let colorClass = team_dict[div.dataset.teamid] + "font"
        lastName.classList.add(colorClass)
    }
}

/**
 * Loads all the numbers into the number menu
 * @param {Object} nums all numbers array
 */
function loadNumbers(nums) {
    let numsMenu = document.getElementById("numberMenu")
    numsMenu.innerHTML = ""
    nums.forEach(function (elem) {
        let a = document.createElement("a");
        a.textContent = elem.toString();
        a.classList = "dropdown-item"
        a.style.cursor = "pointer"
        numsMenu.appendChild(a);
        a.addEventListener("click",function () {
            document.getElementById("numberButton").querySelector(".front-gradient").textContent = a.textContent
        })
    })


}


/**
 * Adds the edit icon
 * @param {div} div div from the driver that is going to add the icon into
 */
function addIcon(div) {
    let iconDiv = document.createElement("div");
    iconDiv.className = "custom-icon"
    let iconElement = document.createElement("i");
    iconElement.className = "bi bi-pencil-square";
    iconListener(iconElement)
    iconDiv.appendChild(iconElement)
    div.appendChild(iconDiv)
}

function addUnRetireIcon(div) {
    let iconDiv = document.createElement("div");
    let iconElement = document.createElement("i");
    iconElement.className = "bi bi-ban";
    unretireListener(iconElement)
    div.appendChild(iconElement)
    div.appendChild(iconDiv)
}

/**
 * Adds the eventlistener for one icon
 * @param {div} icon div from the icon
 */
function iconListener(icon) {
    icon.addEventListener("click",function () {
        modalType = "edit"
        document.getElementById("contractModalTitle").innerText = icon.parentNode.parentNode.innerText.replace(/\n/g, ' ') + "'s contract";
        queryContract(icon.parentNode.parentNode)
        myModal.show()
    })
}

function unretireListener(icon) {
    icon.addEventListener("click",function () {
        let driverReq = {
            command: "unretireDriver",
            driverID: icon.parentNode.dataset.driverid,
            driver: icon.parentNode.innerText,
        }
        icon.classList.add("d-none")
        socket.send(JSON.stringify(driverReq))
    })
}

/**
 * Places all the values for the modal that just openend
 * @param {Object} info values for the contract modal that just opened
 */
function manage_modal(info) {
    document.getElementById("currentContract").innerText = combined_dict[info[0][5]].toUpperCase()
    document.getElementById("currentContract").classList.add("engine-" + team_dict[info[0][5]])
    document.querySelector("#currentContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem,index) {
        if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
            elem.value = info[0][index].toLocaleString("en-US") + " $"
        }
        else {
            elem.value = info[0][index]
        }

    })
    if (info[1] === null) {
        document.querySelector(".add-contract").classList.remove("d-none")
        document.querySelector("#futureContractTitle").classList.add("d-none")
        document.querySelector("#futureContractOptions").classList.add("d-none")
    }
    else{
        document.querySelector(".add-contract").classList.add("d-none")
        document.querySelector("#futureContractTitle").classList.remove("d-none")
        document.querySelector("#futureContractOptions").classList.remove("d-none")
        document.getElementById("futureYear").innerText = "Contract for " + parseInt(info[2]+1)
        document.getElementById("futureContract").innerText = combined_dict[info[1][5]].toUpperCase()
        document.getElementById("futureContract").classList.add("engine-" + team_dict[info[1][5]])
        document.querySelector("#futureContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem,index) {
            if (elem.id === "salaryInputFuture" || elem.id === "signBonusInputFuture" || elem.id === "raceBonusAmtFuture") {
                elem.value = info[1][index].toLocaleString("en-US") + " $"
            }
            else {
                elem.value = info[1][index]
            }
        })
    }

}

document.querySelector(".contract-details").querySelectorAll('.bi-plus-lg').forEach(button => {
    let intervalId;
    let increment = 10000;
    button.addEventListener('mousedown',function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id === "salaryInput") {
            increment = 100000;
        }
        updateContractMoneyValue(input,increment);
        intervalId = setInterval(() => {
            updateContractMoneyValue(input,increment);
        },100);
    });

    button.addEventListener('mouseup',function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave',function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-details").querySelectorAll('.bi-dash-lg').forEach(button => {
    let intervalId;
    let increment = -10000;
    button.addEventListener('mousedown',function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id === "salaryInput") {
            increment = -100000;
        }
        updateContractMoneyValue(input,increment);
        intervalId = setInterval(() => {
            updateContractMoneyValue(input,increment);
        },100);
    });

    button.addEventListener('mouseup',function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave',function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-details").querySelectorAll('.bi-chevron-up').forEach(button => {
    let intervalId;
    let increment = 1;
    button.addEventListener('mousedown',function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id == "raceBonusPos"){
            increment = -1
        }
        updateContractValue(input,increment);
        intervalId = setInterval(() => {
            updateContractValue(input,increment);
        },100);
    });

    button.addEventListener('mouseup',function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave',function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-details").querySelectorAll('.bi-chevron-down').forEach(button => {
    let intervalId;
    let increment = -1;
    button.addEventListener('mousedown',function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id == "raceBonusPos"){
            increment = 1
        }
        updateContractValue(input,increment);
        intervalId = setInterval(() => {
            updateContractValue(input,increment);
        },100);
    });

    button.addEventListener('mouseup',function () {
        clearInterval(intervalId);
    }
    );

    button.addEventListener('mouseleave',function () {
        clearInterval(intervalId);
    }
    );
});



function updateContractMoneyValue(input,increment) {
    let valorActual = input.value.replace(/[$,]/g,"");
    let nuevoValor = Number(valorActual) + increment;
    let valorFormateado = nuevoValor.toLocaleString('en-US') + '$';
    input.value = valorFormateado;
}

function updateContractValue(input,increment) {
    let valorActual = input.value;
    let nuevoValor = Number(valorActual) + increment;
    input.value = nuevoValor;
}

/**
 * Sends the message that requests the details from the driver
 * @param {div} elem div from the driver its requesting its details
 */
function queryContract(elem) {
    driverEditingID = elem.dataset.driverid
    driverEditingName = elem.innerText
    let driverReq = {
        command: "requestDriver",
        driverID: driverEditingID,
        driver: elem.innerText,
    }

    socket.send(JSON.stringify(driverReq))

}


/**
 * Manages the state of the categorias
 * @param  {...string} divs the state of each div
 */
function manageDrivers(...divs) {
    divsArray.forEach(function (div,index) {
        if (divs[index] === "show") {
            div.className = "main-columns-drag-section"
        }
        else {
            div.className = "main-columns-drag-section d-none"
        }
    })
}

/**
 * Event listener for the confirm button from the modal
 */
document.getElementById("confirmButton").addEventListener('click',function () {
    if (modalType === "hire") {
        if (originalParent.id === "f2-drivers" | originalParent.id === "f3-drivers" | originalParent.className === "driver-space" | originalParent.className === "affiliates-space") {
            signDriver("fireandhire")
        }
        signDriver("regular")
        modalType = "";
    }
    else if (modalType === "edit") {
        editContract()
        modalType = "";
    }
    setTimeout(clearModal,500);
})

/**
 * Clears the modal's inputs
 */
function clearModal() {
    document.querySelectorAll(".rounded-input").forEach(function (elem) {
        elem.value = ""
    })
}

/**
 * Sends the message to the backend to edit the contract
 */
function editContract() {
    let values = []
    document.querySelector(".contract-options").querySelectorAll(".old-custom-input-number").forEach(function (elem) {
        if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
            values.push(elem.value.replace(/[$,]/g,""))
        }
        else {
            values.push(elem.value)
        }
    })

    let data = {
        command: "editContract",
        driverID: driverEditingID,
        salary: values[0],
        year: values[1],
        signBonus: values[2],
        raceBonus: values[3],
        raceBonusPos: values[4],
        driver: driverEditingName,
    }
    socket.send(JSON.stringify(data))
}

/**
 * Changes the positions of 2 drivers involved in a swap
 */
function manage_swap() {
    let parent1 = driver1.parentNode;
    let parent2 = driver2.parentNode;
    parent1.removeChild(driver1);
    parent2.removeChild(driver2);
    parent1.appendChild(driver2);
    parent2.appendChild(driver1);

}

/**
 * Sends the necessary messages to hire a driver
 * @param {string} type type of the hiring of the driver, depending if he needs to be fired before or not
 */
function signDriver(type) {
    let driverName = draggable.innerText
    if (type === "fireandhire") {
        let data = {
            command: "fire",
            driverID: draggable.dataset.driverid,
            driver: driverName,
            team: name_dict[teamOrigin.dataset.team],
            teamID: originalTeamId
        }
        if (!data["team"]){
            if (f2_teams.includes(originalTeamId)){
                data["team"] = "F2"
            }
            else if (f3_teams.includes(originalTeamId)){
                data["team"] = "F3"
            }
        }
        socket.send(JSON.stringify(data))

    }
    if (type === "regular") {
        let salaryData = document.getElementById("salaryInput").value.replace(/[$,]/g,"");
        let yearData = document.getElementById("yearInput").value;
        let signBonusData = document.getElementById("signBonusInput").value.replace(/[$,]/g,"");
        let raceBonusData;
        let raceBonusPosData;

        if (signBonusData === "")
            signBonusData = "0"

        if (raceBonusAmt.value === "")
            raceBonusData = "0";
        else
            raceBonusData = raceBonusAmt.value.replace(/[$,]/g,"");

        if (raceBonusPos.value === "")
            raceBonusPosData = "10";
        else
            raceBonusPosData = raceBonusPos.value;

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

    }
    else if (type === "autocontract") {
        let dataAuto = {
            command: "autoContract",
            driverID: draggable.dataset.driverid,
            teamID: inverted_dict[teamDestiniy],
            position: posInTeam,
            driver: driverName,
            team: name_dict[teamDestiniy]
        }
        destinationParent.appendChild(draggable);
        socket.send(JSON.stringify(dataAuto))

    }
}


/**
 * Event listener for the cancel button on the modal
 */
document.getElementById("cancelButton").addEventListener('click',function () {
    if (modalType === "hire") {
        originalParent.appendChild(draggable);
        draggable.dataset.teamid = inverted_dict[teamOrigin.dataset.team]
        updateColor(draggable)
    }
    setTimeout(clearModal,500);
})

document.querySelector("#nameFilterTransfer").addEventListener("input",function (event) {
    let text = event.target.value
    if (text !== "") {
        document.querySelector("#filterTransfersContainer").querySelector(".bi-x").classList.remove("d-none")
    }
    else {
        document.querySelector("#filterTransfersContainer").querySelector(".bi-x").classList.add("d-none")
    }
    let elements = document.querySelectorAll("#free-drivers .free-driver")
    elements.forEach(function (elem) {
        let first_name = elem.children[0].innerText
        let last_name = elem.children[1].innerText
        let full_name = first_name + " " + last_name
        let minus = full_name.toLowerCase()
        let name = text.toLowerCase()
        if (minus.includes(name)) {
            elem.classList.remove("d-none")
        }
        else {
            elem.classList.add("d-none")
        }
    })
})

document.querySelector("#filterIconTransfers").addEventListener("click", function(){
    document.querySelector(".category-filters").classList.toggle("show")
    document.querySelector(".filter-container").classList.toggle("focused")
})

document.getElementById("driver_transfers").querySelectorAll(".filter-pills").forEach(function(elem){
    elem.addEventListener("click", function(event){
        let isActive = elem.classList.contains('active');

        document.getElementById("driver_transfers").querySelectorAll('.filter-pills').forEach(function(el) {
            el.classList.remove('active');
        });

        if (!isActive) {
            elem.classList.add('active');
        }
    })
})

document.querySelector("#F2filterTransfers").addEventListener("click", function(event){
    if (!event.target.classList.contains("active")){
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            elem.classList.remove("d-none")
        })
    }
    else{
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            if(parseInt(elem.dataset.teamid) <= 21 && parseInt(elem.dataset.teamid) > 10){
                elem.classList.remove("d-none")
            }
            else{
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F3filterTransfers").addEventListener("click", function(event){
    if (!event.target.classList.contains("active")){
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            elem.classList.remove("d-none")
        })
    }
    else{
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            if(parseInt(elem.dataset.teamid) <= 31 && parseInt(elem.dataset.teamid) > 21){
                elem.classList.remove("d-none")
            }
            else{
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#freefilterTransfers").addEventListener("click", function(event){
    if (!event.target.classList.contains("active")){
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            elem.classList.remove("d-none")
        })
    }
    else{
        let elements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        elements.forEach(function(elem){
            if(parseInt(elem.dataset.teamid) == 0){
                elem.classList.remove("d-none")
            }
            else{
                elem.classList.add("d-none")
            }
        })
    }
})


/**
 * Manages the interaction to drag drivers
 */
interact('.free-driver').draggable({
    inertia: true,
    listeners: {
        start(event) {
            originalParent = event.target.parentNode;
            if (originalParent.className != "main-columns-drag-section") {
                if (originalParent.classList.contains("affiliates-space")) {
                    teamOrigin = originalParent.parentNode.parentNode
                }
                else {
                    teamOrigin = originalParent.parentNode
                }
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
            target.style.left = position.left + "px"; // Añadir esta línea para manejar la posición izquierda
        },
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.style.opacity = 1;
            target.style.zIndex = 10;

            target.setAttribute('data-x',x);
            target.setAttribute('data-y',y);
        },
        end(event) {
            let target = event.target;
            target.style.position = "relative";
            target.style.top = "auto";
            target.style.left = "auto"; // Resetear la posición izquierda
            target.style.width = "auto";
            target.style.transform = 'none';
            target.style.zIndex = 1;
            target.setAttribute('data-x',0);
            target.setAttribute('data-y',0);

            const freeDrivers = document.getElementById('free-drivers');
            const freeRect = freeDrivers.getBoundingClientRect();

            const driverSpaceElements = document.querySelectorAll('.driver-space');
            driverSpaceElements.forEach(function (element) {
                const rect = element.getBoundingClientRect();
                if (event.clientX >= rect.left && event.clientX <= rect.right &&
                    event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    if (element.classList.contains("affiliates-space") && game_version === 2024) {
                        posInTeam = 3 + element.childElementCount
                        teamDestiniy = element.parentNode.parentNode.dataset.team
                        destinationParent = element;
                        element.appendChild(target)
                        originalTeamId = parseInt(target.dataset.teamid)
                        target.dataset.teamid = inverted_dict[teamDestiniy]
                        updateColor(target)
                        document.getElementById("contractModalTitle").innerText = target.innerText + "'s contract with " + name_dict[teamDestiniy];
                        if ((game_version === 2024) && (originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) {
                            signDriver("fireandhire")
                        }
                        if (autoContractToggle.checked) {
                            signDriver("autocontract")
                        }
                        else {
                            modalType = "hire"
                            myModal.show()
                        }
                        if (target.querySelector(".custom-icon") === null) {
                            addIcon(target)
                        }
                    }
                    else {
                        if (element.childElementCount < 1) {
                            posInTeam = element.id.charAt(2)
                            teamDestiniy = element.parentNode.dataset.team
                            destinationParent = element;
                            element.appendChild(target);
                            originalTeamId = parseInt(target.dataset.teamid)
                            target.dataset.teamid = inverted_dict[teamDestiniy]
                            updateColor(target)
                            document.getElementById("contractModalTitle").innerText = target.innerText + "'s contract with " + name_dict[teamDestiniy];
                            if ((game_version === 2023 && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) ||
                            (game_version === 2024) && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) {
                                signDriver("fireandhire")
                            }
                            if (autoContractToggle.checked) {
                                signDriver("autocontract")
                            }
                            else {
                                modalType = "hire"
                                myModal.show()
                            }
                            if (target.querySelector(".custom-icon") === null) {
                                addIcon(target)
                            }

                        }
                        else if (element.childElementCount == 1) {
                            if (originalParent.classList.contains("driver-space")) {
                                driver1 = target;
                                driver2 = element.firstChild;
                                let team1 = driver1.parentNode.parentNode
                                let team2 = driver2.parentNode.parentNode
                                driver1.dataset.teamid = inverted_dict[team2.dataset.team]
                                updateColor(driver1)
                                driver2.dataset.teamid = inverted_dict[team1.dataset.team]
                                updateColor(driver2)
                                if (driver1 !== driver2) {
                                    let data = {
                                        command: "swap",
                                        driver1ID: target.dataset.driverid,
                                        driver2ID: element.firstChild.dataset.driverid,
                                        driver1: target.innerText,
                                        driver2: element.firstChild.innerText,
                                    }

                                    socket.send(JSON.stringify(data))
                                    manage_swap()
                                }

                            }

                        }
                    }
                }
            });

            if (event.clientX >= freeRect.left && event.clientX <= freeRect.right &&
                event.clientY >= freeRect.top && event.clientY <= freeRect.bottom) {
                if (target.querySelector(".custom-icon") !== null) {
                    draggable.removeChild(draggable.querySelector(".custom-icon"))
                }
                if (originalParent.id !== "free-drivers") {
                    originalParent.removeChild(draggable);
                    originalTeamId = parseInt(target.dataset.teamid)
                    draggable.dataset.teamid = 0
                    updateColor(draggable)
                    freeDrivers.appendChild(target);
                    let data = {
                        command: "fire",
                        driverID: draggable.dataset.driverid,
                        driver: draggable.innerText,
                        team: name_dict[teamOrigin.dataset.team],
                        teamID: originalTeamId
                    }
                    if (!data["team"]){
                        if (f2_teams.includes(originalTeamId)){
                            data["team"] = "F2"
                        }
                        else if (f3_teams.includes(originalTeamId)){
                            data["team"] = "F3"
                        }
                    }
                    socket.send(JSON.stringify(data))
                }
            }
        }
    }
});