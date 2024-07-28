const myModal = new bootstrap.Modal(document.getElementById('contractModal'));
const raceBonusAmt = document.getElementById("raceBonusAmt");
const raceBonusPos = document.getElementById("raceBonusPos");

const freeDriversPill = document.getElementById("freepill");
const f2DriversPill = document.getElementById("F2pill");
const f3DriversPill = document.getElementById("F3pill");

const freeDriversDiv = document.getElementById("free-drivers");
const freeStaffDiv = document.getElementById("free-staff");
const f2DriversDiv = document.getElementById("f2-drivers");
const f3DriversDiv = document.getElementById("f3-drivers");

const autoContractToggle = document.getElementById("autoContractToggle")

const divsArray = [freeDriversDiv, f2DriversDiv, f3DriversDiv]

const selectImageButton = document.getElementById('selectImage');
const fileInput = document.getElementById('fileInput');

const f1_teams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 32]
const f2_teams = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
const f3_teams = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]

const staff_positions = { 1: "technical-chief", 2: "race-engineer", 3: "head-aero", 4: "sporting-director" }
const staff_pics = { 1: "../assets/images/technicalChief.png", 2: "../assets/images/raceEngineer.png", 3: "../assets/images/headAero.png", 4: "../assets/images/sportingDirector.png" }


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
let currentSeason;

let team_dict = { 1: "fe", 2: "mc", 3: "rb", 4: "me", 5: "al", 6: "wi", 7: "ha", 8: "at", 9: "af", 10: "as", 32: "ct", 33: "f2", 34: "f3" }
let inverted_dict = { 'ferrari': 1, 'mclaren': 2, 'redbull': 3, 'merc': 4, 'alpine': 5, 'williams': 6, 'haas': 7, 'alphatauri': 8, 'alfaromeo': 9, 'astonmartin': 10, 'custom': 32 }
let name_dict = { 'ferrari': "Ferrari", 'mclaren': "McLaren", 'redbull': "Red Bull", 'merc': "Mercedes", 'alpine': "Alpine", 'williams': "Williams", 'haas': "Haas", 'alphatauri': "Alpha Tauri", 'alfaromeo': "Alfa Romeo", 'astonmartin': "Aston Martin", "F2": "F2", "F3": "F3", "custom": "Custom Team" }

/**
 * Removes all the drivers from teams and categories
 */
function remove_drivers() {
    document.querySelectorAll('.driver-space').forEach(item => {
        item.innerHTML = ""
    });
    document.querySelectorAll('.staff-space').forEach(item => {
        item.innerHTML = ""
    });
    document.querySelectorAll('.affiliates-space').forEach(item => {
        item.innerHTML = ""
    });
    freeDriversDiv.innerHTML = ""
    freeStaffDiv.innerHTML = ""
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
        let nameContainer = document.createElement("div")
        let marqueeContainer = document.createElement("div")
        marqueeContainer.className = "marquee-wrapper"
        nameContainer.className = "name-container"
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        spanName.textContent = insert_space(name[0]) + " "
        spanLastName.textContent = name.slice(1).join(" ").toUpperCase()
        spanLastName.classList.add("bold-font")
        nameContainer.appendChild(spanName)
        nameContainer.appendChild(spanLastName)
        marqueeContainer.appendChild(nameContainer)
        newDiv.appendChild(marqueeContainer)
        newDiv.classList.add(team_dict[driver[2]] + "-transparent")
        if (driver["team_future"] !== -1) {
            add_future_team_noti(newDiv, driver["team_future"])
        }
        newDiv.dataset.futureteam = driver["team_future"]
        manageColor(newDiv, spanLastName)
        // if (driver[4] === 1) {
        //     addUnRetireIcon(newDiv)
        // }
        //newDiv.innerHTML = driver[0];
        divPosition = "free-drivers"
        let position = driver[3]
        if (position >= 3) {
            position = 3
        }
        addIcon(newDiv)
        if (driver[2] > 0 && driver[2] <= 10 || driver[2] === 32) {
            divPosition = team_dict[driver[2]] + position;
        }
        document.getElementById(divPosition).appendChild(newDiv)

    })
    
}

function add_marquees(){
    setTimeout(function () {
        document.querySelectorAll('.drivers-section .name-container').forEach(container => {
            let parentWidth = container.parentNode.clientWidth
            let containerWidth = container.scrollWidth
            if (containerWidth > parentWidth) {
                let scrollAmount = (containerWidth - parentWidth) + 5;
                container.style.setProperty('--scroll-amount', `${scrollAmount}px`);
                container.classList.add('overflow');
              }
        });
        document.querySelectorAll('.staff-section .name-container').forEach(container => {
            let parentWidth = container.parentNode.parentNode.clientWidth - 5
            let containerWidth = container.scrollWidth
            if (containerWidth > parentWidth) {
                let scrollAmount = (containerWidth - parentWidth) + 40;
                container.style.setProperty('--scroll-amount', `${scrollAmount}px`);
                container.classList.add('overflow');
              }
            else {
                container.classList.remove("overflow")
            }
        });
    }, 100);
}



function sortList(divID) {
    let container = document.getElementById(divID);

    let divs = Array.from(container.querySelectorAll('.free-driver'));

    let compareFunction = (a, b) => {
        let futureTeamA = parseInt(a.dataset.futureteam);
        let futureTeamB = parseInt(b.dataset.futureteam);

        if (futureTeamA > futureTeamB) return -1;
        if (futureTeamA < futureTeamB) return 1;

        let textA = a.firstElementChild.textContent.toLowerCase();
        let textB = b.firstElementChild.textContent.toLowerCase();

        return textA.localeCompare(textB);
    };

    divs.sort(compareFunction);

    container.innerHTML = '';

    divs.forEach(div => container.appendChild(div));
}

function place_staff(staffArray) {
    let divPosition;
    staffArray.forEach((staff) => {
        let newDiv = document.createElement("div");
        newDiv.className = "col free-driver";
        newDiv.dataset.driverid = staff[1];
        newDiv.dataset.teamid = staff[2];
        let name = staff[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        let marqueeContainer = document.createElement("div")
        marqueeContainer.className = "marquee-wrapper"
        let nameContainer = document.createElement("div")
        nameContainer.className = "name-container"
        spanName.textContent = insert_space(name[0]) + " "
        spanLastName.textContent = name.slice(1).join(" ").toUpperCase()
        spanLastName.classList.add("bold-font")
        let staffLogo = document.createElement("img")
        let position = staff[3]
        staffLogo.src = staff_pics[position]
        staffLogo.className = "staff-logo"
        newDiv.appendChild(staffLogo)
        nameContainer.appendChild(spanName)
        nameContainer.appendChild(spanLastName)
        marqueeContainer.appendChild(nameContainer)
        newDiv.appendChild(marqueeContainer)
        newDiv.classList.add(team_dict[staff[2]] + "-transparent")
        if (staff["team_future"] !== -1) {
            add_future_team_noti(newDiv, staff["team_future"])
        }
        newDiv.dataset.futureteam = staff["team_future"]
        manageColor(newDiv, spanLastName)
        // if (staff[4] === 1) {
        //     addUnRetireIcon(newDiv)
        // }
        divPosition = "free-staff"
        let staff_position = staff_positions[position]
        newDiv.dataset.type = staff_position
        staffLogo.classList.add(staff_position + "-border")
        addIcon(newDiv)
        if (staff[2] > 0 && staff[2] <= 10 || staff[2] === 32) {
            let teamDiv = document.querySelector(`.staff-section[data-teamid='${staff[2]}']`)
            if (position !== 2) {
                teamDiv.querySelector(`[data-type='${staff_position}']`).appendChild(newDiv)
            }
            else {
                let engineer_1_has_child = teamDiv.querySelector(`[data-type='${staff_position}'][data-pos='1']`).childElementCount
                if (engineer_1_has_child === 0) {
                    teamDiv.querySelector(`[data-type='${staff_position}'][data-pos='1']`).appendChild(newDiv)
                }
                else {
                    teamDiv.querySelector(`[data-type='${staff_position}'][data-pos='2']`).appendChild(newDiv)
                }
            }
        }
        else {
            document.getElementById(divPosition).appendChild(newDiv)
        }


    })
}

document.querySelectorAll("#stafftransfersMenu a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#staffTransfersDropdown").innerText = elem.innerText;
        let value = elem.dataset.value;
        document.querySelector("#staffTransfersDropdown").dataset.value = value;
        manage_staff_drivers(value)
        add_marquees()
    })
})

function manage_staff_drivers(value) {
    if (value === "drivers") {
        document.getElementById("free-drivers").classList.remove("d-none")
        document.getElementById("free-staff").classList.add("d-none")
        document.querySelectorAll(".drivers-section").forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        document.querySelectorAll(".staff-section").forEach(function (elem) {
            elem.classList.add("d-none")
        })
    }
    else {
        document.getElementById("free-drivers").classList.add("d-none")
        document.getElementById("free-staff").classList.remove("d-none")
        document.querySelectorAll(".drivers-section").forEach(function (elem) {
            elem.classList.add("d-none")
        })
        document.querySelectorAll(".staff-section").forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
}

function add_future_team_noti(driverDiv, teamID) {
    let notiDiv = document.createElement("div")
    notiDiv.className = "future-contract-noti noti-" + team_dict[teamID]
    driverDiv.appendChild(notiDiv)
}

document.querySelectorAll(".affiliates-and-arrows").forEach(function (elem) {
    elem.querySelector(".bi-chevron-right").addEventListener("click", function () {
        let parent = elem.parentNode.parentNode
        let affiliatesDiv = parent.querySelector(".affiliates-space")
        affiliatesDiv.scrollBy({ left: 100, behavior: 'smooth' });
    })

    elem.querySelector(".bi-chevron-left").addEventListener("click", function () {
        let parent = elem.parentNode.parentNode
        let affiliatesDiv = parent.querySelector(".affiliates-space")
        affiliatesDiv.scrollBy({ left: -100, behavior: 'smooth' });
    })
})


/**
 * Updates the color from the div depending on the team, both in contract and stats view
 * @param {div} div div from the driver
 */
function updateColor(div) {
    let surnameDiv = div.querySelector(".bold-font")
    surnameDiv.className = "bold-font"
    manageColor(div, surnameDiv)
    let statsDiv = document.querySelector('.normal-driver[data-driverid="' + div.dataset.driverid + '"]')
    statsDiv.dataset.teamid = div.dataset.teamid
    surnameDiv = statsDiv.querySelector(".surname")
    surnameDiv.className = "bold-font surname"
    manageColor(statsDiv, surnameDiv)
    div.className = "colr free-driver " + team_dict[div.dataset.teamid] + "-transparent"
    statsDiv.className = "colr normal-driver " + team_dict[div.dataset.teamid] + "-transparent"
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
    icon.addEventListener("click", function () {
        modalType = "edit"
        document.getElementById("contractModalTitle").innerText = icon.parentNode.parentNode.innerText.replace(/\n/g, ' ') + "'s contract";
        queryContract(icon.parentNode.parentNode)
        let space = icon.parentNode.parentNode.parentNode
        if (space.classList.contains("driver-space") || space.classList.contains("affiliates-space") || (space.id === "free-drivers" && (f2_teams.includes(parseInt(icon.parentNode.parentNode.dataset.teamid)) || f3_teams.includes(parseInt(icon.parentNode.parentNode.dataset.teamid))))) {
            manage_modal_driver_staff("driver")
        }
        else if (space.classList.contains("staff-space") || (space.id === "free-staff" && (f2_teams.includes(parseInt(icon.parentNode.parentNode.dataset.teamid)) || f3_teams.includes(parseInt(icon.parentNode.parentNode.dataset.teamid))))) {
            if (event.target.parentNode.parentNode.dataset.type === "race-engineer") {
                manage_modal_driver_staff("race-engineer")
            }
            else {
                manage_modal_driver_staff("staff")
            }
        }
        else if (space.id === "free-drivers") {
            manage_modal_driver_staff("free-driver")
        }
        else if (space.id === "free-staff") {
            if (event.target.parentNode.parentNode.dataset.type === "race-engineer") {
                manage_modal_driver_staff("free-race-engineer")
            }
            else {
                manage_modal_driver_staff("free-staff")
            }
        }
        myModal.show()
    })
}

function manage_modal_driver_staff(type) {
    if (type === "staff" || type === "race-engineer") {
        document.getElementById("currentContractTitle").classList.remove("d-none")
        document.getElementById("currentContractOptions").classList.remove("d-none")
        document.querySelectorAll(".driver-only").forEach(function (elem) {
            let input = elem.querySelector("input")
            input.disabled = true
            input.classList.add("disabled")
            let buttons = elem.querySelectorAll("i")
            buttons.forEach(function (button) {
                button.classList.add("disabled")
            })
        })
    }
    else if (type === "driver") {
        document.getElementById("currentContractTitle").classList.remove("d-none")
        document.getElementById("currentContractOptions").classList.remove("d-none")
        document.querySelectorAll(".driver-only").forEach(function (elem) {
            let input = elem.querySelector("input")
            input.disabled = false
            input.classList.remove("disabled")
            let buttons = elem.querySelectorAll("i")
            buttons.forEach(function (button) {
                button.classList.remove("disabled")
            })
        })
        let positionInput = document.querySelector("#positionInput input")
        positionInput.max = 999

    }
    else if (type === "free-driver") {
        document.querySelectorAll(".driver-only").forEach(function (elem) {
            let input = elem.querySelector("input")
            input.disabled = false
            input.classList.remove("disabled")
            let buttons = elem.querySelectorAll("i")
            buttons.forEach(function (button) {
                button.classList.remove("disabled")
            })
        })
        let positionInput = document.querySelector("#positionInput input")
        positionInput.max = 999
        document.getElementById("currentContractOptions").classList.add("d-none")
        document.getElementById("futureContractOptions").classList.add("d-none")
        document.getElementById("futureContractTitle").classList.add("d-none")
        document.getElementById("currentContractTitle").classList.add("d-none")
        document.querySelector(".add-contract").classList.remove("d-none")
    }
    else if (type === "free-staff") {
        document.querySelectorAll(".driver-only").forEach(function (elem) {
            let input = elem.querySelector("input")
            input.disabled = true
            input.classList.add("disabled")
            let buttons = elem.querySelectorAll("i")
            buttons.forEach(function (button) {
                button.classList.add("disabled")
            })
        })
        let positionInput = document.querySelector("#positionInput input")
        positionInput.disabled = true
        let buttons = document.querySelectorAll("#positionInput i")
        buttons.forEach(function (button) {
            button.classList.add("disabled")
        })
        document.getElementById("currentContractOptions").classList.add("d-none")
        document.getElementById("futureContractOptions").classList.add("d-none")
        document.getElementById("futureContractTitle").classList.add("d-none")
        document.getElementById("currentContractTitle").classList.add("d-none")
        document.querySelector(".add-contract").classList.remove("d-none")
    }
    else if (type === "free-race-engineer") {
        document.querySelectorAll(".driver-only").forEach(function (elem) {
            let input = elem.querySelector("input")
            input.disabled = true
            input.classList.add("disabled")
            let buttons = elem.querySelectorAll("i")
            buttons.forEach(function (button) {
                button.classList.add("disabled")
            })
        })
        let input = document.querySelector("#positionInput input")
        let buttons = document.querySelectorAll("#positionInput i")
        input.disabled = false
        input.max = 2
        input.classList.remove("disabled")
        buttons.forEach(function (button) {
            button.classList.remove("disabled")
        })
        document.getElementById("currentContractOptions").classList.add("d-none")
        document.getElementById("futureContractOptions").classList.add("d-none")
        document.getElementById("futureContractTitle").classList.add("d-none")
        document.getElementById("currentContractTitle").classList.add("d-none")
        document.querySelector(".add-contract").classList.remove("d-none")
    }
    if (type === "race-engineer") {
        let input = document.querySelector("#positionInput input")
        let buttons = document.querySelectorAll("#positionInput i")
        input.disabled = false
        input.max = 2
        input.classList.remove("disabled")
        buttons.forEach(function (button) {
            button.classList.remove("disabled")
        })
    }

}

function unretireListener(icon) {
    icon.addEventListener("click", function () {
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
    if (info[0] !== null) {
        let teamID;
        if (info[0][5] <= 10 || info[0][5] === 32) {
            teamID = info[0][5]
        }
        else if (f2_teams.includes(info[0][5])) {
            teamID = 33
        }
        else if (f3_teams.includes(info[0][5])) {
            teamID = 34
        }
        document.getElementById("currentContract").innerText = combined_dict[info[0][5]].toUpperCase()
        document.getElementById("currentContract").className = "team-contract engine-" + team_dict[teamID]
        document.getElementById("yearInput").dataset.maxYear = info[2]
        document.getElementById("yearInput").min = info[2]
        document.getElementById("yearInputFuture").min = info[2] + 1
        document.querySelector("#currentContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem, index) {
            if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
                elem.value = info[0][index].toLocaleString("en-US") + " $"
            }
            else {
                elem.value = info[0][index]
            }

        })
    }
    if (info[1] === null) {
        document.querySelector(".add-contract").classList.remove("d-none")
        document.querySelector("#futureContractTitle").classList.add("d-none")
        document.querySelector("#futureContractOptions").classList.add("d-none")
        document.querySelector("#teamContractButton").innerText = "Team"
        document.querySelector("#teamContractButton").dataset.teamid = "-1"
    }
    else {
        document.querySelector(".add-contract").classList.add("d-none")
        document.querySelector("#futureContractTitle").classList.remove("d-none")
        document.querySelector("#futureContractOptions").classList.remove("d-none")
        document.getElementById("futureYear").innerText = "Contract for " + parseInt(info[2] + 1)
        document.getElementById("futureContract").innerText = combined_dict[info[1][6]].toUpperCase()
        document.querySelector("#teamContractButton").dataset.teamid = info[1][6]
        document.getElementById("futureContract").className = "team-contract engine-" + team_dict[info[1][6]]
        document.querySelector("#futureContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem, index) {
            if (elem.id === "salaryInputFuture" || elem.id === "signBonusInputFuture" || elem.id === "raceBonusAmtFuture") {
                elem.value = info[1][index].toLocaleString("en-US") + " $"
            }
            else {
                elem.value = info[1][index]
            }
        })
    }

}

/**
 * Listener for the team menu buttons
 */
document.querySelector("#teamContractMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#teamContractButton").innerText = elem.querySelector(".team-menu-name").innerText;
        document.querySelector("#teamContractButton").dataset.teamid = elem.dataset.teamid;
        document.querySelector(".add-contract").classList.add("enabled")
    })
})

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.querySelector(".add-contract i").addEventListener("click", function () {
    if (event.target.parentNode.classList.contains("enabled")) {
        document.getElementById("yearInput").value = document.getElementById("yearInput").dataset.maxYear
        document.querySelector("#futureYear").innerText = "Next year's contract"
        document.querySelector("#futureContract").className = "team-contract engine-" + team_dict[document.querySelector("#teamContractButton").dataset.teamid]
        document.querySelector("#futureContract").innerText = document.querySelector("#teamContractButton").innerText
        document.querySelector(".add-contract").classList.add("d-none")
        document.querySelector("#futureContractTitle").classList.remove("d-none")
        document.querySelector("#futureContractOptions").classList.remove("d-none")
        if (document.querySelector("#salaryInput").value !== "") {
            document.querySelector("#salaryInputFuture").value = formatNumber((parseFloat(document.querySelector("#salaryInput").value.replace(/,/g, '').split(" ")[0]) * 1.3).toFixed(0)) + " $";
            document.querySelector("#signBonusInputFuture").value = formatNumber((parseFloat(document.querySelector("#signBonusInput").value.replace(/,/g, '').split(" ")[0]) * 1.15).toFixed(0)) + " $";
            document.querySelector("#raceBonusAmtFuture").value = formatNumber((parseFloat(document.querySelector("#raceBonusAmt").value.replace(/,/g, '').split(" ")[0]) * 1.15).toFixed(0)) + " $";
            document.querySelector("#raceBonusPosFuture").value = parseInt(document.querySelector("#raceBonusPos").value)
            document.querySelector("#yearInputFuture").value = parseInt(document.querySelector("#yearInput").value) + 2
        }
        else {
            document.querySelector("#salaryInputFuture").value = "1,000,000 $"
            document.querySelector("#signBonusInputFuture").value = "100,000 $"
            document.querySelector("#raceBonusAmtFuture").value = "0 $"
            document.querySelector("#raceBonusPosFuture").value = "1"
            document.querySelector("#yearInputFuture").value = parseInt(currentSeason) + 1
        }

        document.querySelector("#posInTeamFuture").value = 1;
    }
})


document.querySelector(".break-contract").addEventListener("click", function () {
    document.querySelector(".add-contract").classList.remove("d-none")
    document.querySelector("#futureContractTitle").classList.add("d-none")
    document.querySelector("#futureContractOptions").classList.add("d-none")
    document.querySelector("#teamContractButton").innerText = "Team"
    document.querySelector("#teamContractButton").dataset.teamid = "-1"
    document.querySelector(".add-contract").classList.remove("enabled")
})

document.querySelector(".contract-options").querySelectorAll('.bi-plus-lg').forEach(button => {
    let intervalId;
    let increment = 10000;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id === "salaryInput") {
            increment = 100000;
        }
        updateContractMoneyValue(input, increment);
        intervalId = setInterval(() => {
            updateContractMoneyValue(input, increment);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-options").querySelectorAll('.bi-dash-lg').forEach(button => {
    let intervalId;
    let increment = -10000;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id === "salaryInput") {
            increment = -100000;
        }
        updateContractMoneyValue(input, increment);
        intervalId = setInterval(() => {
            updateContractMoneyValue(input, increment);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-options").querySelectorAll('.bi-chevron-up').forEach(button => {
    let intervalId;
    let increment = 1;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id == "raceBonusPos") {
            increment = -1
        }
        updateContractValue(input, increment);
        intervalId = setInterval(() => {
            updateContractValue(input, increment);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    });
});

document.querySelector(".contract-options").querySelectorAll('.bi-chevron-down').forEach(button => {
    let intervalId;
    let increment = -1;
    button.addEventListener('mousedown', function () {
        let input = this.parentNode.parentNode.querySelector(".old-custom-input-number");
        if (input.id == "raceBonusPos") {
            increment = 1
        }
        updateContractValue(input, increment);
        intervalId = setInterval(() => {
            updateContractValue(input, increment);
        }, 100);
    });

    button.addEventListener('mouseup', function () {
        clearInterval(intervalId);
    }
    );

    button.addEventListener('mouseleave', function () {
        clearInterval(intervalId);
    }
    );
});



function updateContractMoneyValue(input, increment) {
    let val = input.value.replace(/[$,]/g, "");
    let new_val = Number(val) + increment;
    if (new_val < parseInt(input.min)) {
        new_val = input.min;
    }
    let formatted = new_val.toLocaleString('en-US') + '$';
    input.value = formatted;
}

function updateContractValue(input, increment) {
    let val = input.value;
    let new_val = Number(val) + increment;
    if (new_val < parseInt(input.min)) {
        new_val = input.min;
    }
    if (new_val > parseInt(input.max)) {
        new_val = input.max;
    }
    input.value = new_val;
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
    setTimeout(clearModal, 500);
    sortList("free-drivers")
    sortList("free-staff")
})

/**
 * Clears the modal's inputs
 */
function clearModal() {
    document.querySelectorAll(".old-custom-input-number").forEach(function (elem) {
        elem.value = ""
    })
}

/**
 * Sends the message to the backend to edit the contract
 */
function editContract() {
    let values = []
    document.querySelector("#currentContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem) {
        if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
            values.push(elem.value.replace(/[$,]/g, ""))
        }
        else {
            values.push(elem.value)
        }
    })
    let futureValues = []
    document.querySelector("#futureContractOptions").querySelectorAll(".old-custom-input-number").forEach(function (elem) {
        if (elem.id === "salaryInputFuture" || elem.id === "signBonusInputFuture" || elem.id === "raceBonusAmtFuture") {
            futureValues.push(elem.value.replace(/[$,]/g, ""))
        }
        else {
            futureValues.push(elem.value)
        }
    })
    let future_team = document.querySelector("#teamContractButton").dataset.teamid

    let data = {
        command: "editContract",
        driverID: driverEditingID,
        salary: values[0],
        year: values[1],
        signBonus: values[2],
        raceBonus: values[3],
        raceBonusPos: values[4],
        driver: driverEditingName,
        futureTeam: future_team,
        futureSalary: futureValues[0],
        futureYear: futureValues[1],
        futureSignBonus: futureValues[2],
        futureRaceBonus: futureValues[3],
        futureRaceBonusPos: futureValues[4],
        futurePosition: futureValues[5]
    }
    socket.send(JSON.stringify(data))
    if (future_team !== "-1") {
        let driverDiv = document.querySelector('.free-driver[data-driverid="' + driverEditingID + '"]')
        add_future_team_noti(driverDiv, future_team)
        driverDiv.dataset.futureteam = future_team
    }
    else {
        let driverDiv = document.querySelector('.free-driver[data-driverid="' + driverEditingID + '"]')
        driverDiv.querySelector(".future-contract-noti").remove()
        driverDiv.dataset.futureteam = -1
    }
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
        if (!data["team"]) {
            if (f2_teams.includes(originalTeamId)) {
                data["team"] = "F2"
            }
            else if (f3_teams.includes(originalTeamId)) {
                data["team"] = "F3"
            }
        }
        socket.send(JSON.stringify(data))

    }
    if (type === "regular") {
        let salaryData = document.getElementById("salaryInput").value.replace(/[$,]/g, "");
        let yearData = document.getElementById("yearInput").value;
        let signBonusData = document.getElementById("signBonusInput").value.replace(/[$,]/g, "");
        let raceBonusData;
        let raceBonusPosData;

        if (signBonusData === "")
            signBonusData = "0"

        if (raceBonusAmt.value === "")
            raceBonusData = "0";
        else
            raceBonusData = raceBonusAmt.value.replace(/[$,]/g, "");

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
document.getElementById("cancelButton").addEventListener('click', function () {
    document.querySelector(".add-contract").classList.remove("enabled")
    if (modalType === "hire") {
        originalParent.appendChild(draggable);
        draggable.dataset.teamid = inverted_dict[teamOrigin.dataset.team]
        updateColor(draggable)
    }
    setTimeout(clearModal, 500);
})

document.querySelector("#nameFilterTransfer").addEventListener("input", function (event) {
    let text = event.target.value
    if (text !== "") {
        document.querySelector("#filterTransfersContainer").querySelector(".bi-x").classList.remove("d-none")
    }
    else {
        document.querySelector("#filterTransfersContainer").querySelector(".bi-x").classList.add("d-none")
    }
    let driverElements = document.querySelectorAll("#free-drivers .free-driver")
    driverElements.forEach(function (elem) {
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
    let staffElements = document.querySelectorAll("#free-staff .free-driver")
    staffElements.forEach(function (elem) {
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

document.querySelector("#filterIconTransfers").addEventListener("click", function () {
    document.querySelector(".category-filters").classList.toggle("show")
    document.querySelector(".filter-container").classList.toggle("focused")
})

document.getElementById("driver_transfers").querySelectorAll(".filter-pills").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let isActive = elem.classList.contains('active');

        document.getElementById("driver_transfers").querySelectorAll('.filter-pills').forEach(function (el) {
            el.classList.remove('active');
        });

        if (!isActive) {
            elem.classList.add('active');
        }
    })
})

document.querySelector("#F2filterTransfers").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) <= 21 && parseInt(elem.dataset.teamid) > 10) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) <= 21 && parseInt(elem.dataset.teamid) > 10) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F3filterTransfers").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) <= 31 && parseInt(elem.dataset.teamid) > 21) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) <= 31 && parseInt(elem.dataset.teamid) > 21) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#freefilterTransfers").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let driverElements = document.getElementById("free-drivers").querySelectorAll(".free-driver")
        driverElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) == 0) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
        let staffElements = document.getElementById("free-staff").querySelectorAll(".free-driver")
        staffElements.forEach(function (elem) {
            if (parseInt(elem.dataset.teamid) == 0) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

function hire_modal_standars() {
    document.querySelector(".add-contract").classList.add("d-none")
    document.querySelector("#futureContractTitle").classList.add("d-none")
    document.querySelector("#futureContractOptions").classList.add("d-none")
    document.getElementById("currentContract").innerText = combined_dict[inverted_dict[teamDestiniy]].toUpperCase()
    document.getElementById("currentContract").className = "team-contract engine-" + team_dict[inverted_dict[teamDestiniy]]
}


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

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        },
        end(event) {
            let target = event.target;
            target.style.position = "relative";
            target.style.top = "auto";
            target.style.left = "auto"; // Resetear la posición izquierda
            target.style.width = "auto";
            target.style.transform = 'none';
            target.style.zIndex = 1;
            target.setAttribute('data-x', 0);
            target.setAttribute('data-y', 0);
            //is driver
            if (event.target.parentNode.classList.contains("driver-space") | event.target.parentNode.classList.contains("affiliates-space") | event.target.parentNode.id === "free-drivers") {
                let freeDrivers = document.getElementById('free-drivers');
                let freeRect = freeDrivers.getBoundingClientRect();

                let driverSpaceElements = document.querySelectorAll('.driver-space');
                driverSpaceElements.forEach(function (element) {
                    let rect = element.getBoundingClientRect();
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
                                hire_modal_standars()
                                manage_modal_driver_staff("driver")
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
                                    hire_modal_standars()
                                    manage_modal_driver_staff("driver")
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
                        if (!data["team"]) {
                            if (f2_teams.includes(originalTeamId)) {
                                data["team"] = "F2"
                            }
                            else if (f3_teams.includes(originalTeamId)) {
                                data["team"] = "F3"
                            }
                        }
                        socket.send(JSON.stringify(data))
                    }
                }
            }
            //is staff
            else if (event.target.parentNode.classList.contains("staff-space") | event.target.parentNode.id === "free-staff") {
                let tfreeStaff = document.getElementById('free-staff');
                let staffRect = tfreeStaff.getBoundingClientRect();
                let staffSpaceElements = document.querySelectorAll('.staff-space');
                staffSpaceElements.forEach(function (element) {
                    let rect = element.getBoundingClientRect();
                    if (event.clientX >= rect.left && event.clientX <= rect.right &&
                        event.clientY >= rect.top && event.clientY <= rect.bottom) {
                        if (element.dataset.type === event.target.dataset.type) {
                            if (element.childElementCount < 1) {
                                posInTeam = element.dataset.pos
                                teamDestiniy = element.parentNode.dataset.team
                                destinationParent = element;
                                element.appendChild(target);
                                originalTeamId = parseInt(target.dataset.teamid)
                                target.dataset.teamid = inverted_dict[teamDestiniy]
                                updateColor(target)
                                document.getElementById("contractModalTitle").innerText = target.innerText + "'s contract with " + name_dict[teamDestiniy];
                                if ((game_version === 2023 && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "staff-space")) ||
                                    (game_version === 2024) && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "staff-space")) {
                                    signDriver("fireandhire")
                                }
                                if (autoContractToggle.checked) {
                                    signDriver("autocontract")
                                }
                                else {
                                    modalType = "hire"
                                    hire_modal_standars()
                                    if (event.target.dataset.type === "race-engineer") {
                                        manage_modal_driver_staff("race-engineer")
                                    }
                                    else {
                                        manage_modal_driver_staff("staff")
                                    }
                                    myModal.show()
                                }
                                if (target.querySelector(".custom-icon") === null) {
                                    addIcon(target)
                                }
                            }
                            else if (element.childElementCount == 1) {
                                if (originalParent.classList.contains("staff-space")) {
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
                        else {
                            update_notifications("You can't change staff from different positions", "lighterror")
                        }

                    }
                });

                if (event.clientX >= staffRect.left && event.clientX <= staffRect.right &&
                    event.clientY >= staffRect.top && event.clientY <= staffRect.bottom) {
                    if (target.querySelector(".custom-icon") !== null) {
                        draggable.removeChild(draggable.querySelector(".custom-icon"))
                    }
                    if (originalParent.id !== "free-staff") {
                        originalParent.removeChild(draggable);
                        originalTeamId = parseInt(target.dataset.teamid)
                        draggable.dataset.teamid = 0
                        updateColor(draggable)
                        tfreeStaff.appendChild(target);
                        let data = {
                            command: "fire",
                            driverID: draggable.dataset.driverid,
                            driver: draggable.innerText,
                            team: name_dict[teamOrigin.dataset.team],
                            teamID: originalTeamId
                        }
                        if (!data["team"]) {
                            if (f2_teams.includes(originalTeamId)) {
                                data["team"] = "F2"
                            }
                            else if (f3_teams.includes(originalTeamId)) {
                                data["team"] = "F3"
                            }
                        }
                        socket.send(JSON.stringify(data))
                    }
                }
            }

        }
    }
});