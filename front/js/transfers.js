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

const divsArray = [freeDriversDiv, f2DriversDiv, f3DriversDiv]


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

let team_dict = { 1: "fe", 2: "mc", 3: "rb", 4: "me", 5: "al", 6: "wi", 7: "ha", 8: "at", 9: "af", 10: "as" }
let inverted_dict = { 'ferrari': 1, 'mclaren': 2, 'redbull': 3, 'merc': 4, 'alpine': 5, 'williams': 6, 'haas': 7, 'alphatauri': 8, 'alfaromeo': 9, 'astonmartin': 10 }
let name_dict = { 'ferrari': "Ferrari", 'mclaren': "McLaren", 'redbull': "Red Bull", 'merc': "Mercedes", 'alpine': "Alpine", 'williams': "Williams", 'haas': "Haas", 'alphatauri': "Alpha Tauri", 'alfaromeo': "Alfa Romeo", 'astonmartin': "Aston Martin", "F2": "F2", "F3": "F3" }

/**
 * Removes all the drivers from teams and categories
 */
function remove_drivers() {
    document.querySelectorAll('.driver-space').forEach(item => {
        item.innerHTML = ""
    });
    freeDriversDiv.innerHTML = ""
    f2DriversDiv.innerHTML = ""
    f3DriversDiv.innerHTML = ""
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
        spanName.textContent = name[0] + " "
        spanLastName.textContent = " " + name[1].toUpperCase()
        spanLastName.classList.add("bold-font")
        newDiv.appendChild(spanName)
        newDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        if(driver[4] === 1){
            addUnRetireIcon(newDiv)
        }

        //newDiv.innerHTML = driver[0];
        divPosition = "free-drivers"
        if (driver[2] > 0 && driver[2] <= 10) {
            addIcon(newDiv)
            divPosition = team_dict[driver[2]] + driver[3];

        }

        else if (driver[2] > 10 && driver[2] <= 21) divPosition = "f2-drivers";
        else if (driver[2] > 21 && driver[2] <= 31) divPosition = "f3-drivers";

        document.getElementById(divPosition).appendChild(newDiv)

    })
}

/**
 * Updates the color from the div depending on the team, both in contract and stats view
 * @param {div} div div from the driver
 */
function updateColor(div) {
    let surnameDiv = div.querySelector(".bold-font")
    surnameDiv.className = "bold-font"
    manageColor(div, surnameDiv)
    let statsDiv = document.querySelector("#fulldriverlist").querySelector('[data-driverid="' + div.dataset.driverid + '"]')
    statsDiv.dataset.teamid = div.dataset.teamid
    surnameDiv = statsDiv.querySelector(".surname")
    surnameDiv.className = "bold-font surname"
    manageColor(statsDiv, surnameDiv)

}

/**
 * Manages the color depending on the team
 * @param {div} div div from the driver
 * @param {span} lastName the lastname span from the driver
 */
function manageColor(div, lastName) {
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
        a.addEventListener("click", function () {
            document.getElementById("numberButton").textContent = a.textContent
        })
    })


}

function loadRetirementyear(ages){
    document.getElementById("driverAge").innerText = "Age " + ages[1]
    document.getElementById("retirementInput").value = ages[0]
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
    iconDiv.className = "custom-unretire"
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
    icon.addEventListener("click", function () {
        modalType = "edit"
        document.querySelector(".number-and-retirement").classList.remove("d-none")
        document.getElementById("contractModalTitle").innerText = icon.parentNode.parentNode.innerText + "'s details";
        queryContract(icon.parentNode.parentNode)
        myModal.show()
    })
}

function unretireListener(icon){
    icon.addEventListener("click", function(){
        let driverReq = {
            command: "unretireDriver",
            driverID: icon.parentNode.dataset.driverid,
            driver: icon.parentNode.innerText,
        }
        icon.classList.add("d-none")
        icon.parentNode.querySelector(".custom-unretire").classList.add("d-none")
        socket.send(JSON.stringify(driverReq))
    })
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
 * Pills from the 3 categories
 */
freeDriversPill.addEventListener("click", function () {
    manageDrivers("show", "hide", "hide")
})

f2DriversPill.addEventListener("click", function () {
    manageDrivers("hide", "show", "hide")
})

f3DriversPill.addEventListener("click", function () {
    manageDrivers("hide", "hide", "show")
})

/**
 * Manages the state of the categorias
 * @param  {...string} divs the state of each div
 */
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

/**
 * Event listener for the confirm button from the modal
 */
document.getElementById("confirmButton").addEventListener('click', function () {
    if (modalType === "hire") {
        if (originalParent.id === "f2-drivers" | originalParent.id === "f3-drivers" | originalParent.className === "col driver-space") {
            signDriver("fireandhire")
        }
        signDriver("regular")
        modalType = "";
    }
    else if (modalType === "edit") {
        editContract()
        modalType = "";
    }
    setTimeout(clearModal, 500);
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
    document.querySelector(".contract-options").querySelectorAll(".rounded-input").forEach(function (elem) {
        values.push(elem.value)
    })
    let number = document.querySelector("#numberButton").textContent
    let age = document.querySelector("#retirementInput").value
    let wants1;
    if(document.querySelector("#driverNumber1").checked){
        wants1 = 1;
    }
    else{
        wants1 = 0;
    }

    let data = {
        command: "editContract",
        driverID: driverEditingID,
        salary: values[0],
        year: values[1],
        signBonus: values[2],
        raceBonus: values[3],
        raceBonusPos: values[4],
        driverNumber: number,
        wantsN1: wants1,
        driver: driverEditingName,
        retirementAge: age
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
        let extra = {
            command: "fire",
            driverID: draggable.dataset.driverid,
            driver: driverName,
            team: name_dict[teamOrigin.dataset.team]
        }

        socket.send(JSON.stringify(extra))

    }
    if (type === "regular") {
        let salaryData = document.getElementById("salaryInput").value;
        let yearData = document.getElementById("yearInput").value;
        let signBonusData = document.getElementById("signBonusInput").value;
        let raceBonusData;
        let raceBonusPosData;

        if (signBonusData === "")
            signBonusData = "0"

        if (raceBonusAmt.value === "")
            raceBonusData = "0";
        else
            raceBonusData = raceBonusAmt.value;

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
            command: "autocontract",
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
document.getElementById("cancelButton").addEventListener('click', function () {
    if (modalType === "hire") {
        originalParent.appendChild(draggable);
        draggable.dataset.teamid = inverted_dict[teamOrigin.dataset.team]
        updateColor(draggable)
    }
    setTimeout(clearModal, 500);
})

/**
 * Listeners for the buttons on the retirement age selector
 */
document.querySelector(".retirement-options").querySelector(".bi-plus-lg").addEventListener("click", function(){
    document.querySelector(".retirement-options").querySelector("input").value = Number(document.querySelector(".retirement-options").querySelector("input").value) + 1
})

document.querySelector(".retirement-options").querySelector(".bi-dash-lg").addEventListener("click", function(){
    document.querySelector(".retirement-options").querySelector("input").value -= 1
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
                        target.dataset.teamid = inverted_dict[teamDestiniy]
                        updateColor(target)
                        posInTeam = element.id.charAt(2)
                        document.getElementById("contractModalTitle").innerText = target.innerText + "'s contract with " + name_dict[teamDestiniy];
                        document.getElementById("driverAge").innerText = ""
                        if (autoContractToggle.checked) {
                            if (originalParent.id === "f2-drivers" | originalParent.id === "f3-drivers" | originalParent.className === "col driver-space") {
                                signDriver("fireandhire")
                            }
                            signDriver("autocontract")
                        }
                        else {
                            modalType = "hire"
                            document.querySelector(".number-and-retirement").classList.add("d-none")
                            myModal.show()

                        }
                        if (target.querySelector(".custom-icon") === null) {
                            addIcon(target)
                        }

                    }
                    else if (element.childElementCount == 1) {
                        if (originalParent.className === "col driver-space") {
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
            });


            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            if (event.clientX >= freeRect.left && event.clientX <= freeRect.right &&
                event.clientY >= freeRect.top && event.clientY <= freeRect.bottom) {
                if (target.querySelector(".custom-icon") !== null) {
                    draggable.removeChild(draggable.querySelector(".custom-icon"))
                }
                if (originalParent.id !== "free-drivers") {
                    originalParent.removeChild(draggable);
                    draggable.dataset.teamid = 0
                    updateColor(draggable)
                    freeDrivers.appendChild(target);
                    let data = {
                        command: "fire",
                        driverID: draggable.dataset.driverid,
                        driver: draggable.innerText,
                        team: name_dict[teamOrigin.dataset.team]
                    }
                    socket.send(JSON.stringify(data))
                }
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