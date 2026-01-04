import { staff_pics, team_dict, combined_dict, staff_positions, typeStaff_dict, f1_teams, f2_teams, f3_teams, inverted_dict, getUpdatedName, logos_disc } from "./config";
import { attachHold, game_version, make_name_prettier } from "./renderer";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import interact from 'interactjs';
import { Command } from "../backend/command.js";



const myModal = new bootstrap.Modal(document.getElementById('contractModal'));
const raceBonusAmt = document.getElementById("raceBonusAmt");
const raceBonusPos = document.getElementById("raceBonusPos");

const freeDriversPill = document.getElementById("freepill");
const f2DriversPill = document.getElementById("F2pill");
const f3DriversPill = document.getElementById("F3pill");

export const freeDriversDiv = document.getElementById("free-drivers");
const freeStaffDiv = document.getElementById("free-staff");
const f2DriversDiv = document.getElementById("f2-drivers");
const f3DriversDiv = document.getElementById("f3-drivers");

const clearIcon = document.querySelector("#filterTransfersContainer .bi-x");
let freeDriverItems = []
let t;

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
let driverEditingOfficialDriver = false;
let driver1;
let driver2;
let originalTeamId
export let currentSeason;

let juniorTeamIdActive = -1;
let juniorTeamDrivers = [];
let juniorContractDirty = false;

export function setCurrentSeason(season) {
    currentSeason = season
}



let name_dict = { 'ferrari': "Ferrari", 'mclaren': "McLaren", 'redbull': "Red Bull", 'merc': "Mercedes", 'alpine': "Alpine", 'williams': "Williams", 'haas': "Haas", 'alphatauri': "Alpha Tauri", 'alfaromeo': "Alfa Romeo", 'astonmartin': "Aston Martin", "F2": "F2", "F3": "F3", "custom": "Custom Team" }
//custom team name changes so this dict stays here

/**
 * Removes all the drivers from teams and categories
 */
export function remove_drivers(staffOnly = false) {
    if (!staffOnly) {
        document.querySelectorAll('.driver-space').forEach(item => {
            item.innerHTML = ""
        });
        document.querySelectorAll('.affiliates-space').forEach(item => {
            item.innerHTML = ""
        });
        freeDriversDiv.innerHTML = ""
    }
    document.querySelectorAll('.staff-space').forEach(item => {
        item.innerHTML = ""
    });
    freeStaffDiv.innerHTML = ""
}

export function insert_space(str) {
    return str.replace(/([A-Z])/g, ' $1').trim();
}

export function format_name(fullName, nameSplitted, spanName, spanLastName) {
    if (fullName.length > 17) {
        let nameArray = fullName.split(" ");
        let firstName = nameArray[0];
        if (insert_space(firstName).includes(" ")) {
            let splitName = insert_space(firstName).split(" ");
            spanName.textContent = splitName[0][0] + ". " + splitName[1] + " ";
        } else {
            spanName.textContent = firstName[0] + ". ";
        }

        spanLastName.textContent = nameArray.slice(1).join(" ").toUpperCase();
    } else {
        spanName.textContent = insert_space(nameSplitted[0]) + " "
        spanLastName.textContent = nameSplitted.slice(1).join(" ").toUpperCase()
    }

}


/**
 * Places all drivers in their respective team, category etc
 * @param {Object} driversArray List of drivers
 */
export function place_drivers(driversArray) {
    console.log("DRIVERS ARRAY", driversArray)
    let divPosition;
    driversArray.forEach((driver) => {
        let newDiv = document.createElement("div");
        newDiv.className = "col free-driver";
        newDiv.dataset.driverid = driver[1];
        newDiv.dataset.teamid = driver[2];
        let name = driver[0].split(" ")
        let nameContainer = document.createElement("div")
        nameContainer.className = "name-container"
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        format_name(driver[0], name, spanName, spanLastName)
        spanLastName.classList.add("bold-font")
        nameContainer.appendChild(spanName)
        nameContainer.appendChild(spanLastName)
        if (driver["team_junior"] && driver["team_junior"].teamId !== -1) {
            add_junior_formula_logo(newDiv, driver["team_junior"])
        }
        newDiv.appendChild(nameContainer)
        newDiv.classList.add(team_dict[driver[2]] + "-transparent")
        if (driver["team_future"].teamId !== -1) {
            add_future_team_noti(newDiv, driver["team_future"])
        }
        newDiv.dataset.futureteam = driver["team_future"].teamId
        manageColor(newDiv, spanLastName)
        divPosition = "free-drivers"
        let position = driver[3]
        if (position >= 3) {
            position = 3
        }
        addIcon(newDiv)
        add_edit_container(newDiv)
        if (driver[2] > 0 && driver[2] <= 10 || driver[2] === 32) {
            divPosition = team_dict[driver[2]] + position;
        }
        document.getElementById(divPosition).appendChild(newDiv)

    })


    document.querySelectorAll(".affiliates-and-arrows").forEach(updateAffiliateArrows)
}

function add_edit_container(div) {
    let edit_container = document.createElement("div")
    edit_container.className = "edit-container"
    let numbersicon = document.createElement("i")
    numbersicon.className = "bi bi bi-123"
    let pencilicon = document.createElement("i")
    pencilicon.className = "bi bi-pencil-fill"
    edit_container.appendChild(pencilicon)
    edit_container.appendChild(numbersicon)
    div.appendChild(edit_container)
    edit_container.addEventListener("click", function () {
        let id = div.dataset.driverid
        document.getElementById("statspill").click()
        let edit_stats_div = document.querySelector(`.normal-driver[data-driverid="${id}"]`)
        let typeStaff = typeStaff_dict[edit_stats_div.dataset.type]
        let menuClick = document.querySelector(`#staffMenu a[data-list="${typeStaff}"]`)
        menuClick.click()
        edit_stats_div.click()

        edit_stats_div.scrollIntoView({ behavior: "smooth", block: "center" })
    })
}


export function update_name(driverID, name) {
    let freeDiv = document.querySelector(`.free-driver[data-driverid='${driverID}']`)
    let normalDiv = document.querySelector(`.normal-driver[data-driverid='${driverID}']`)
    let nameContainer = freeDiv.querySelector(".name-container")
    let nameArray = name.split(" ")
    let new_name = nameArray[0]
    let new_surname = nameArray.slice(1).join(" ").toUpperCase()
    let firstNameContainer = nameContainer.childNodes[0]
    let lastNameContainer = nameContainer.querySelector(".bold-font")
    firstNameContainer.textContent = new_name
    lastNameContainer.textContent = new_surname
    firstNameContainer = normalDiv.childNodes[0].childNodes[0]
    lastNameContainer = normalDiv.childNodes[0].querySelector(".bold-font")
    firstNameContainer.textContent = new_name + " "
    lastNameContainer.textContent = new_surname
    normalDiv.dataset.name = name
}


export function sortList(divID) {
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

export function place_staff(staffArray) {
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
        if (staff["team_future"].teamId !== -1) {
            add_future_team_noti(newDiv, staff["team_future"])
        }
        newDiv.dataset.futureteam = staff["team_future"].teamId
        manageColor(newDiv, spanLastName)
        // if (staff[4] === 1) {
        //     addUnRetireIcon(newDiv)
        // }
        divPosition = "free-staff"
        let staff_position = staff_positions[position]
        newDiv.dataset.type = staff_position
        staffLogo.classList.add(staff_position + "-border")
        addIcon(newDiv)
        add_edit_container(newDiv)
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

export function initFreeDriversElems() {
    freeDriverItems = [
        ...document.querySelectorAll("#free-drivers .free-driver"),
        ...document.querySelectorAll("#free-staff .free-driver"),
    ].map(el => {
        const first = el.children[0]?.textContent || "";
        const last = el.children[1]?.textContent || "";
        const full = (first +  last).toLowerCase();
        return { el, name: full };
    });
}

document.querySelectorAll("#stafftransfersMenu a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#staffTransfersDropdown span.dropdown-label").innerText = elem.innerText;
        let value = elem.dataset.value;
        document.querySelector("#staffTransfersDropdown").dataset.value = value;
        manage_staff_drivers(value)
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

function add_future_team_noti(driverDiv, teamInfo) {
    let notiDiv = document.createElement("div")
    notiDiv.className = `future-contract-noti noti-${team_dict[teamInfo.teamId]}${teamInfo.posInTeam > 2 ? "-affiliate" : ""}`
    driverDiv.appendChild(notiDiv)
}

function add_junior_formula_logo(driverDiv, juniorInfo) {
    let imgContainer = document.createElement("div")
    imgContainer.className = "junior-formula-logo"
    let img = document.createElement("img")
    img.src = logos_disc[juniorInfo.teamId]
    if (f2_teams.includes(juniorInfo.teamId)) {
        imgContainer.classList.add("f2-team")
    }
    else if (f3_teams.includes(juniorInfo.teamId)) {
        imgContainer.classList.add("f3-team")
    }
    img.dataset.juniorTeamId = juniorInfo.teamId
    imgContainer.appendChild(img)
    driverDiv.appendChild(imgContainer)
}

const affiliatesScrollDisabledClass = "affiliates-scroll-disabled"
const affiliatesScrollEpsilon = 2

function getDirectAffiliateDrivers(affiliatesDiv) {
    return Array.from(affiliatesDiv.children).filter(child => child.classList?.contains("free-driver"))
}

function getAffiliateScrollStep(affiliatesDiv) {
    const items = getDirectAffiliateDrivers(affiliatesDiv)
    if (items.length >= 2) {
        const step = items[1].offsetLeft - items[0].offsetLeft
        return step > 0 ? step : 0
    }
    if (items.length === 1) {
        const style = window.getComputedStyle(items[0])
        const marginLeft = parseFloat(style.marginLeft) || 0
        const marginRight = parseFloat(style.marginRight) || 0
        return items[0].getBoundingClientRect().width + marginLeft + marginRight
    }
    return 0
}

function clamp(number, min, max) {
    return Math.min(max, Math.max(min, number))
}

function updateAffiliateArrows(wrapper) {
    const affiliatesDiv = wrapper.querySelector(".affiliates-space")
    const leftArrow = wrapper.querySelector(".bi-chevron-left")
    const rightArrow = wrapper.querySelector(".bi-chevron-right")

    if (!affiliatesDiv || !leftArrow || !rightArrow) {
        return
    }

    const items = getDirectAffiliateDrivers(affiliatesDiv)
    const shouldShowArrows = items.length > 0

    leftArrow.classList.toggle("d-none", !shouldShowArrows)
    rightArrow.classList.toggle("d-none", !shouldShowArrows)

    if (!shouldShowArrows) {
        leftArrow.classList.remove(affiliatesScrollDisabledClass)
        rightArrow.classList.remove(affiliatesScrollDisabledClass)
        return
    }

    const maxScrollLeft = Math.max(0, affiliatesDiv.scrollWidth - affiliatesDiv.clientWidth)
    if (affiliatesDiv.scrollLeft > maxScrollLeft) {
        affiliatesDiv.scrollLeft = Math.max(0, maxScrollLeft)
    }

    if (affiliatesDiv.clientWidth <= 0) {
        leftArrow.classList.remove(affiliatesScrollDisabledClass)
        rightArrow.classList.remove(affiliatesScrollDisabledClass)
        return
    }

    const hasOverflow = maxScrollLeft > affiliatesScrollEpsilon
    const canScrollLeft = hasOverflow && affiliatesDiv.scrollLeft > affiliatesScrollEpsilon
    const canScrollRight = hasOverflow && affiliatesDiv.scrollLeft < (maxScrollLeft - affiliatesScrollEpsilon)

    leftArrow.classList.toggle(affiliatesScrollDisabledClass, !canScrollLeft)
    rightArrow.classList.toggle(affiliatesScrollDisabledClass, !canScrollRight)
}

function setupAffiliateScroller(wrapper) {
    const affiliatesDiv = wrapper.querySelector(".affiliates-space")
    const leftArrow = wrapper.querySelector(".bi-chevron-left")
    const rightArrow = wrapper.querySelector(".bi-chevron-right")

    if (!affiliatesDiv || !leftArrow || !rightArrow) {
        return
    }

    leftArrow.addEventListener("click", function () {
        const step = getAffiliateScrollStep(affiliatesDiv)
        if (step <= 0) return

        const maxScrollLeft = affiliatesDiv.scrollWidth - affiliatesDiv.clientWidth
        const target = clamp(affiliatesDiv.scrollLeft - step, 0, maxScrollLeft)
        affiliatesDiv.scrollTo({ left: target, behavior: "smooth" })
    })

    rightArrow.addEventListener("click", function () {
        const step = getAffiliateScrollStep(affiliatesDiv)
        if (step <= 0) return

        const maxScrollLeft = affiliatesDiv.scrollWidth - affiliatesDiv.clientWidth
        const target = clamp(affiliatesDiv.scrollLeft + step, 0, maxScrollLeft)
        affiliatesDiv.scrollTo({ left: target, behavior: "smooth" })
    })

    affiliatesDiv.addEventListener("scroll", function () {
        updateAffiliateArrows(wrapper)
    }, { passive: true })

    const observer = new MutationObserver(function () {
        updateAffiliateArrows(wrapper)
    })
    observer.observe(affiliatesDiv, { childList: true })

    updateAffiliateArrows(wrapper)
}

const affiliateScrollers = Array.from(document.querySelectorAll(".affiliates-and-arrows"))
affiliateScrollers.forEach(setupAffiliateScroller)
window.addEventListener("resize", function () {
    affiliateScrollers.forEach(updateAffiliateArrows)
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
export function manageColor(div, lastName) {
    if (div.dataset.teamid != 0) {
        let colorClass = team_dict[div.dataset.teamid] + "font"
        lastName.classList.add(colorClass)
    }
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


/**
 * Adds the eventlistener for one icon
 * @param {div} icon div from the icon
 */
function iconListener(icon) {
    icon.addEventListener("click", function () {
        document.querySelector("#juniorContractDropdown").classList.remove("d-none")
        document.querySelector("#contractPills").classList.remove("d-none")
        modalType = "edit"
        document.getElementById("contractModalTitle").innerText = icon.parentNode.parentNode.innerText.replace(/\n/g, ' ') + "'s";
        fetchContracts(icon.parentNode.parentNode)
        let space = icon.parentNode.parentNode.parentNode
        //officialDriver = space has an id that ends with 1 or 2
        driverEditingOfficialDriver = space.id.endsWith("1") || space.id.endsWith("2")
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



/**
 * Places all the values for the modal that just openend
 * @param {Object} info values for the contract modal that just opened
 */
export function manage_modal(info) {
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
        document.getElementById("currentContract").innerText = getUpdatedName(info[0][5]).toUpperCase()
        document.getElementById("currentContract").className = "team-contract engine-" + team_dict[teamID]
        document.getElementById("yearInput").dataset.maxYear = info[4]
        document.getElementById("yearInput").min = info[4]
        document.getElementById("yearInputFuture").min = info[4] + 1
        document.querySelector("#currentContractOptions").querySelectorAll(".contract-modal-input").forEach(function (elem, index) {
            if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
                elem.value = info[0][index].toLocaleString("en-US")
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
        document.querySelector("#teamContractButton span").innerText = "Team"
        document.querySelector("#teamContractButton").dataset.teamid = "-1"
    }
    else {
        document.querySelector(".add-contract").classList.add("d-none")
        document.querySelector("#futureContractTitle").classList.remove("d-none")
        document.querySelector("#futureContractOptions").classList.remove("d-none")
        document.getElementById("futureYear").innerText = "Contract for " + parseInt(info[2] + 1)
        document.getElementById("futureContract").innerText = getUpdatedName(info[1][6]).toUpperCase()
        document.querySelector("#teamContractButton").dataset.teamid = info[1][6]
        document.getElementById("futureContract").className = "team-contract engine-" + team_dict[info[1][6]]
        document.querySelector("#futureContractOptions").querySelectorAll(".contract-modal-input").forEach(function (elem, index) {
            if (elem.id === "salaryInputFuture" || elem.id === "signBonusInputFuture" || elem.id === "raceBonusAmtFuture") {
                elem.value = info[1][index].toLocaleString("en-US")
            }
            else if (elem.id === "posInTeamFuture") {
                setPosInTeamFutureValue(elem, info[1][index], { dispatch: false });
            }
            else {
                elem.value = info[1][index]
            }
        })
    }

    ensureJuniorTeamDropdownBuilt();

    const juniorPill = document.querySelector(".contract-category.junior-contract");
    if (info[2] !== null) {
        document.getElementById("contractPills").classList.remove("d-none");
        juniorPill?.classList.remove("d-none");

        const juniorTeamId = Number(info[2][6]);
        const juniorButton = document.getElementById("juniorTeamContractButton");
        const posInput = document.getElementById("juniorPosInTeam");
        if (juniorButton && Number.isFinite(juniorTeamId)) {
            juniorTeamIdActive = juniorTeamId;
            juniorContractDirty = false;
            juniorButton.dataset.teamid = String(juniorTeamId);
            const label = juniorButton.querySelector("span");
            if (label) label.innerText = (combined_dict[juniorTeamId] || "Select junior team").toUpperCase();

            setJuniorPosInputLimits(juniorTeamId);
            if (posInput) {
                const pos = Number(info[2][5]);
                posInput.value = Number.isFinite(pos) ? String(pos) : "1";
            }

            const listDiv = document.querySelector(".junior-team-drivers-list");
            if (listDiv) listDiv.innerHTML = "<div class=\"modal-subtitle bold-font\">Loading drivers...</div>";
            const command = new Command("juniorTeamDriversRequest", { teamID: juniorTeamId });
            command.execute();
        }
    }
    else {
        juniorPill?.classList.remove("d-none");
        juniorTeamIdActive = -1;
        juniorTeamDrivers = [];
        juniorContractDirty = false;
        const juniorButton = document.getElementById("juniorTeamContractButton");
        if (juniorButton) {
            juniorButton.dataset.teamid = "-1";
            const label = juniorButton.querySelector("span");
            if (label) label.innerText = "Select junior team";
        }
        const posInput = document.getElementById("juniorPosInTeam");
        if (posInput) {
            posInput.min = "1";
            posInput.max = "3";
            posInput.value = "1";
        }
        const listDiv = document.querySelector(".junior-team-drivers-list");
        if (listDiv) listDiv.innerHTML = "";
    }

    document.querySelectorAll(".contract-category").forEach(function (el) {
        el.classList.remove("active");
    });
    document.querySelector(".contract-category.f1-contract")?.classList.add("active");
    document.querySelector("#juniorContractDropdown")?.classList.add("d-none");
    document.querySelector("#currentContract")?.classList.remove("d-none");
    document.querySelector(".junior-contract-info")?.classList.add("d-none");
    document.querySelector("#currentContractOptions")?.classList.remove("d-none");

    if (info[1] === null) {
        document.querySelector(".add-contract")?.classList.remove("d-none");
        document.querySelector("#futureContractTitle")?.classList.add("d-none");
        document.querySelector("#futureContractOptions")?.classList.add("d-none");
    } else {
        document.querySelector(".add-contract")?.classList.add("d-none");
        document.querySelector("#futureContractTitle")?.classList.remove("d-none");
        document.querySelector("#futureContractOptions")?.classList.remove("d-none");
    }

    if (driverEditingOfficialDriver || !info[3]) { //if its an official driver or is a staff member, hide junior pill
        juniorPill?.classList.add("d-none");
    }
    else{
        juniorPill?.classList.remove("d-none");
    }

}

function getJuniorMaxCars(teamId) {
    if (f2_teams.includes(teamId)) return 2;
    if (f3_teams.includes(teamId)) return 3;
    if (teamId >= 11 && teamId <= 21) return 2;
    if (teamId >= 22 && teamId <= 31) return 3;
    return 2;
}

function setJuniorPosInputLimits(teamId) {
    const input = document.getElementById("juniorPosInTeam");
    if (!input) return;

    const maxCars = getJuniorMaxCars(teamId);
    input.min = "1";
    input.max = String(maxCars);

    const current = Number(input.value || 1);
    if (!Number.isFinite(current)) {
        input.value = "1";
        return;
    }
    input.value = String(Math.min(maxCars, Math.max(1, current)));
}

function renderJuniorDriversList() {
    const listDiv = document.querySelector(".junior-team-drivers-list");
    if (!listDiv) return;

    const maxCars = getJuniorMaxCars(juniorTeamIdActive);
    const input = document.getElementById("juniorPosInTeam");
    const selectedPos = Math.min(maxCars, Math.max(1, Number(input?.value || 1)));

    const driversByPos = new Map();
    (juniorTeamDrivers || []).forEach((d) => {
        const pos = Number(d?.posInTeam);
        if (!Number.isFinite(pos)) return;
        driversByPos.set(pos, d?.name || "Free driver");
    });

    listDiv.innerHTML = "";

    for (let pos = 1; pos <= maxCars; pos++) {
        const row = document.createElement("div");
        row.className = "junior-driver-row";

        const left = document.createElement("div");
        left.className = "junior-driver-left";

        const car = document.createElement("div");
        car.className = "junior-driver-car";
        car.innerText = `CAR ${pos}`;

        const name = document.createElement("div");
        name.className = "junior-driver-name";
        name.innerText = driversByPos.get(pos) || "Free driver";

        left.appendChild(car);
        left.appendChild(name);

        const right = document.createElement("div");
        right.className = "junior-driver-right";
        if (pos === selectedPos) {
            const tag = document.createElement("div");
            tag.className = "junior-replacing-tag";
            tag.innerText = "< Replacing";
            right.appendChild(tag);
        }

        row.appendChild(left);
        row.appendChild(right);
        listDiv.appendChild(row);
    }
}

function ensureJuniorTeamDropdownBuilt() {
    const menu = document.getElementById("juniorTeamContractMenu");
    if (!menu) return;

    menu.innerHTML = "";

    const juniorIds = Object.keys(combined_dict)
        .map((k) => Number(k))
        .filter((id) => id >= 11 && id <= 31)
        .sort((a, b) => a - b);

    juniorIds.forEach((teamId) => {
        const item = document.createElement("a");
        item.className = "redesigned-dropdown-item bold-font";
        item.style.cursor = "pointer";
        item.dataset.teamid = String(teamId);

        const logoWrap = document.createElement("div");
        logoWrap.className = "team-menu-logo";

        const logo = document.createElement("img");
        logo.src = logos_disc[teamId] || "";
        logo.alt = combined_dict[teamId] || `Team ${teamId}`;
        logo.className = "team-menu-junior-generic";
        logoWrap.appendChild(logo);

        const nameWrap = document.createElement("div");
        nameWrap.className = "team-menu-name";
        nameWrap.innerText = (combined_dict[teamId] || `Team ${teamId}`).toUpperCase();

        item.appendChild(logoWrap);
        item.appendChild(nameWrap);
        menu.appendChild(item);
    });

    menu.querySelectorAll("a").forEach(function (elem) {
        elem.addEventListener("click", function () {
            const teamId = Number(elem.dataset.teamid);
            const button = document.getElementById("juniorTeamContractButton");
            const label = button?.querySelector("span");
            if (label) label.innerText = elem.querySelector(".team-menu-name")?.innerText || "Select junior team";
            if (button) button.dataset.teamid = String(teamId);

            juniorTeamIdActive = teamId;
            setJuniorPosInputLimits(teamId);
            juniorTeamDrivers = [];
            juniorContractDirty = true;
            document.querySelector(".junior-contract-info")?.classList.remove("d-none");

            const listDiv = document.querySelector(".junior-team-drivers-list");
            if (listDiv) listDiv.innerHTML = "<div class=\"modal-subtitle bold-font\">Loading drivers...</div>";

            const command = new Command("juniorTeamDriversRequest", { teamID: teamId });
            command.execute();
        });
    });

    const posInput = document.getElementById("juniorPosInTeam");
    if (posInput && posInput.dataset.listenerAttached !== "1") {
        posInput.dataset.listenerAttached = "1";
        posInput.addEventListener("input", function () {
            if (juniorTeamIdActive !== -1) setJuniorPosInputLimits(juniorTeamIdActive);
            juniorContractDirty = true;
            renderJuniorDriversList();
        });

        const wrapper = posInput.closest(".input-and-buttons");
        const plusBtn = wrapper?.querySelector(".bi-chevron-down");
        const minusBtn = wrapper?.querySelector(".bi-chevron-up");

        const wrapStep = (delta) => {
            const max = Number(posInput.max || 1);
            const min = Number(posInput.min || 1);
            const cur = Number(posInput.value || min);
            const normalized = Number.isFinite(cur) ? cur : min;

            let next = normalized + delta;
            if (next > max) next = min;
            if (next < min) next = max;

            posInput.value = String(next);
            posInput.dispatchEvent(new Event("input", { bubbles: true }));
        };

        plusBtn?.addEventListener("click", function () {
            wrapStep(1);
        });
        minusBtn?.addEventListener("click", function () {
            wrapStep(-1);
        });
    }
}

export function loadJuniorTeamDrivers(payload) {
    const listDiv = document.querySelector(".junior-team-drivers-list");
    if (!listDiv) return;

    const teamId = Number(payload?.teamID);
    if (Number.isFinite(teamId)) {
        juniorTeamIdActive = teamId;
        setJuniorPosInputLimits(teamId);
    }

    juniorTeamDrivers = Array.isArray(payload?.driverNames) ? payload.driverNames : [];
    renderJuniorDriversList();
}


document.querySelectorAll(".contract-category").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelectorAll(".contract-category").forEach(function (el) {
            el.classList.remove("active")
        })
        elem.classList.add("active");
        let category = elem.dataset.category;
        if (category === "junior") {
            document.querySelector("#currentContractOptions").classList.add("d-none")
            // document.querySelector("#futureContractTitle").classList.add("d-none")
            // document.querySelector("#futureContractOptions").classList.add("d-none")
            document.querySelector(".add-contract").classList.add("d-none")
            document.querySelector("#juniorContractDropdown").classList.remove("d-none")
            document.querySelector("#currentContract").classList.add("d-none")
            const selectedTeamId = Number(document.getElementById("juniorTeamContractButton")?.dataset.teamid || -1);
            if (selectedTeamId === -1) {
                document.querySelector(".junior-contract-info").classList.add("d-none")
            } else {
                document.querySelector(".junior-contract-info").classList.remove("d-none")
            }
        }
        else{
            document.querySelector("#currentContractOptions").classList.remove("d-none")
            // document.querySelector("#futureContractTitle").classList.remove("d-none")
            // document.querySelector("#futureContractOptions").classList.remove("d-none")
            document.querySelector("#juniorContractDropdown").classList.add("d-none")
            document.querySelector("#currentContract").classList.remove("d-none")
            document.querySelector(".add-contract").classList.remove("d-none")
            document.querySelector(".junior-contract-info").classList.add("d-none")
        }
    })
})

/**
 * Listener for the team menu buttons
 */
document.querySelector("#teamContractMenu").querySelectorAll("a").forEach(function (elem) {
    elem.addEventListener("click", function () {
        document.querySelector("#teamContractButton span").innerText = elem.querySelector(".team-menu-name").innerText;
        document.querySelector("#teamContractButton").dataset.teamid = elem.dataset.teamid;
        document.querySelector(".add-contract").classList.add("enabled")
    })
})

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPosInTeamFutureLabel(pos) {
    const n = Math.trunc(Number(pos));
    if (!Number.isFinite(n)) return "";
    if (n === 1) return "Car 1";
    if (n === 2) return "Car 2";
    return `Reserve ${n}`;
}

function parsePosInTeamFutureValue(raw) {
    if (raw === null || raw === undefined) return NaN;
    const str = String(raw).trim();
    if (!str) return NaN;

    const match = str.match(/(\d+)/);
    if (!match) return NaN;
    return Number(match[1]);
}

function getPosInTeamFutureValue(input) {
    if (!input) return NaN;

    const parsed = parsePosInTeamFutureValue(input.value);
    if (Number.isFinite(parsed)) return parsed;

    const fromDataset = Number(input.dataset.posValue);
    if (Number.isFinite(fromDataset)) return fromDataset;

    return 1;
}

function setPosInTeamFutureValue(input, pos, opts = {}) {
    if (!input) return;

    const min = input.min !== "" ? Number(input.min) : -Infinity;
    const max = input.max !== "" ? Number(input.max) : Infinity;

    let next = Math.trunc(Number(pos));
    if (!Number.isFinite(next)) next = 1;
    if (Number.isFinite(min)) next = Math.max(min, next);
    if (Number.isFinite(max)) next = Math.min(max, next);

    input.dataset.posValue = String(next);
    input.value = formatPosInTeamFutureLabel(next);

    if (opts.dispatch !== false) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

function attachHoldPosInTeamFuture(btn, input, delta) {
    if (!btn || !input) return;
    if (btn.dataset.holdAttached === "1") return;

    btn.dataset.holdAttached = "1";

    let intervalId = null;
    let timeoutId = null;

    const stepOnce = () => {
        const current = getPosInTeamFutureValue(input);
        setPosInTeamFutureValue(input, current + delta);
    };

    const clearTimers = () => {
        if (timeoutId !== null) clearTimeout(timeoutId);
        if (intervalId !== null) clearInterval(intervalId);
        timeoutId = null;
        intervalId = null;
    };

    btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        clearTimers();
        stepOnce();
        timeoutId = setTimeout(() => {
            intervalId = setInterval(stepOnce, 75);
        }, 350);
    });

    ["pointerup", "pointercancel", "pointerleave", "lostpointercapture"].forEach((evt) => {
        btn.addEventListener(evt, clearTimers);
    });
}

function setupPosInTeamFutureControls(input, plusBtn, minusBtn) {
    if (!input || !plusBtn || !minusBtn) return;

    if (input.dataset.posSetup === "1") return;
    input.dataset.posSetup = "1";

    input.type = "text";
    input.placeholder = "ex: Car 1";

    const initial = getPosInTeamFutureValue(input);
    setPosInTeamFutureValue(input, initial, { dispatch: false });

    input.addEventListener("change", () => {
        setPosInTeamFutureValue(input, getPosInTeamFutureValue(input), { dispatch: false });
    });

    attachHoldPosInTeamFuture(plusBtn, input, +1);
    attachHoldPosInTeamFuture(minusBtn, input, -1);
}

document.querySelector(".add-contract .button-with-icon").addEventListener("click", function () {
    document.getElementById("yearInput").value = document.getElementById("yearInput").dataset.maxYear
    document.querySelector("#futureYear").innerText = "Next year's contract"
    document.querySelector("#futureContract").className = "team-contract engine-" + team_dict[document.querySelector("#teamContractButton").dataset.teamid]
    document.querySelector("#futureContract").innerText = document.querySelector("#teamContractButton span").innerText
    document.querySelector(".add-contract").classList.add("d-none")
    document.querySelector("#futureContractTitle").classList.remove("d-none")
    document.querySelector("#futureContractOptions").classList.remove("d-none")
    if (document.querySelector("#salaryInput").value !== "") {
        document.querySelector("#salaryInputFuture").value = formatNumber((parseFloat(document.querySelector("#salaryInput").value.replace(/[$,]/g, '')) * 1.3).toFixed(0));
        document.querySelector("#signBonusInputFuture").value = formatNumber((parseFloat(document.querySelector("#signBonusInput").value.replace(/[$,]/g, '')) * 1.15).toFixed(0));
        document.querySelector("#raceBonusAmtFuture").value = formatNumber((parseFloat(document.querySelector("#raceBonusAmt").value.replace(/[$,]/g, '')) * 1.15).toFixed(0));
        document.querySelector("#raceBonusPosFuture").value = parseInt(document.querySelector("#raceBonusPos").value)
        document.querySelector("#yearInputFuture").value = parseInt(document.querySelector("#yearInput").value) + 2
    }
    else {
        document.querySelector("#salaryInputFuture").value = "1,000,000"
        document.querySelector("#signBonusInputFuture").value = "100,000"
        document.querySelector("#raceBonusAmtFuture").value = "0"
        document.querySelector("#raceBonusPosFuture").value = "1"
        document.querySelector("#yearInputFuture").value = parseInt(currentSeason) + 1
    }

    setPosInTeamFutureValue(document.querySelector("#posInTeamFuture"), 1);

})


document.querySelector(".break-contract").addEventListener("click", function () {
    document.querySelector(".add-contract").classList.remove("d-none")
    document.querySelector("#futureContractTitle").classList.add("d-none")
    document.querySelector("#futureContractOptions").classList.add("d-none")
    document.querySelector("#teamContractButton span").innerText = "Team"
    document.querySelector("#teamContractButton").dataset.teamid = "-1"
    document.querySelector(".add-contract").classList.remove("enabled")
})

function attachHoldWithAttrClamp(btn, input, step, opts = {}) {
    if (!btn || !input) return;
    if (btn.dataset.holdAttached === "1") return;

    btn.dataset.holdAttached = "1";
    const format = typeof opts.format === "function" ? opts.format : undefined;

    attachHold(btn, input, step, {
        min: -Infinity,
        max: Infinity,
        format,
        onChange: (val) => {
            if (typeof val !== "number" || !Number.isFinite(val)) return;

            const min = input.min !== "" ? Number(input.min) : -Infinity;
            const max = input.max !== "" ? Number(input.max) : Infinity;
            let clamped = val;

            if (Number.isFinite(min)) clamped = Math.max(min, clamped);
            if (Number.isFinite(max)) clamped = Math.min(max, clamped);

            if (clamped === val) return;

            input.value = String(format ? format(clamped) : clamped);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        },
    });
}

function setupContractModalButtons() {
    const moneyFormat = (val) => Number(val).toLocaleString("en-US");
    const moneyInputs = new Set([
        "salaryInput",
        "signBonusInput",
        "raceBonusAmt",
        "salaryInputFuture",
        "signBonusInputFuture",
        "raceBonusAmtFuture",
    ]);

    document.querySelectorAll("#contractModal .contract-options .input-and-buttons").forEach((wrapper) => {
        const input = wrapper.querySelector("input");
        const plusBtn = wrapper.querySelector(".bi-plus");
        const minusBtn = wrapper.querySelector(".bi-dash");
        if (!input || !plusBtn || !minusBtn) return;
        if (input.id === "juniorPosInTeam") return;
        if (input.id === "posInTeamFuture") {
            setupPosInTeamFutureControls(input, plusBtn, minusBtn);
            return;
        }

        const isMoney = moneyInputs.has(input.id);
        const isSalary = input.id === "salaryInput" || input.id === "salaryInputFuture";
        const isRacePos = input.id === "raceBonusPos" || input.id === "raceBonusPosFuture";

        const baseStep = isSalary ? 100000 : isMoney ? 10000 : 1;
        const plusStep = isRacePos ? -baseStep : +baseStep;
        const minusStep = isRacePos ? +baseStep : -baseStep;

        attachHoldWithAttrClamp(plusBtn, input, plusStep, { format: isMoney ? moneyFormat : undefined });
        attachHoldWithAttrClamp(minusBtn, input, minusStep, { format: isMoney ? moneyFormat : undefined });
    });
}

setupContractModalButtons();

/**
 * Sends the message that requests the details from the driver
 * @param {div} elem div from the driver its requesting its details
 */
function fetchContracts(elem) {
    driverEditingID = elem.dataset.driverid
    driverEditingName = make_name_prettier(elem.innerText)

    const command = new Command("driverRequest", { driverID: driverEditingID });
    command.execute();

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
    const juniorActive = document.querySelector(".contract-category.junior-contract")?.classList.contains("active");
    if (juniorActive) {
        if (juniorContractDirty) {
            juniorContractDirty = false;
        }
        let data = {
            driverID: driverEditingID,
            driver: driverEditingName,
            team: combined_dict[juniorTeamIdActive] || "",
            teamID: juniorTeamIdActive,
            posInTeam: document.getElementById("juniorPosInTeam").value
        }
        const command = new Command("juniorTransfer", data);
        command.execute();
        modalType = "";
        setTimeout(clearModal, 500);
        return;
    }
    if (modalType === "hire") {
        if (((f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId)) && !destinationParent.classList.contains("affiliates-space")) | originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space") | originalParent.className === "staff-space") {
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
    document.querySelectorAll(".contract-modal-input").forEach(function (elem) {
        if (elem.id === "posInTeamFuture") {
            delete elem.dataset.posValue;
        }
        elem.value = ""
    })
}

/**
 * Sends the message to the backend to edit the contract
 */
function editContract() {
    let values = []
    document.querySelector("#currentContractOptions").querySelectorAll(".contract-modal-input").forEach(function (elem) {
        if (elem.id === "salaryInput" || elem.id === "signBonusInput" || elem.id === "raceBonusAmt") {
            values.push(elem.value.replace(/[$,]/g, ""))
        }
        else {
            values.push(elem.value)
        }
    })
    let futureValues = []
    document.querySelector("#futureContractOptions").querySelectorAll(".contract-modal-input").forEach(function (elem) {
        if (elem.id === "salaryInputFuture" || elem.id === "signBonusInputFuture" || elem.id === "raceBonusAmtFuture") {
            futureValues.push(elem.value.replace(/[$,]/g, ""))
        }
        else if (elem.id === "posInTeamFuture") {
            futureValues.push(String(getPosInTeamFutureValue(elem)))
        }
        else {
            futureValues.push(elem.value)
        }
    })
    let future_team = document.querySelector("#teamContractButton").dataset.teamid

    let data = {
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

    const command = new Command("editContract", data);
    command.execute();

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
    let driverName = make_name_prettier(draggable.innerText)
    if (type === "fireandhire") {
        let data = {
            driverID: draggable.dataset.driverid,
            driver: driverName,
            team: getUpdatedName(inverted_dict[teamOrigin.dataset.team]),
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
        const command = new Command("fireDriver", data);
        command.execute();

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
        const command = new Command("hireDriver", data);
        command.execute();

    }
    else if (type === "autocontract") {
        let dataAuto = {
            driverID: draggable.dataset.driverid,
            teamID: inverted_dict[teamDestiniy],
            position: posInTeam,
            driver: driverName,
            team: name_dict[teamDestiniy]
        }
        destinationParent.appendChild(draggable);
        const command = new Command("autoContract", dataAuto);
        command.execute();

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

document.querySelector("#nameFilterTransfer").addEventListener("input", (e) => {
  const val = e.target.value;
  clearIcon.classList.toggle("d-none", val === "");

  clearTimeout(t);
  t = setTimeout(() => {
    const q = val.trim().toLowerCase();
    if (!q) {
      for (const {el} of freeDriverItems) el.classList.remove("d-none");
      return;
    }
    for (const {el, name} of freeDriverItems) {
      el.classList.toggle("d-none", !name.includes(q));
    }
  }, 150);
});

document.querySelector("#filterIconTransfers").addEventListener("click", function () {
    document.querySelector(".category-filters").classList.toggle("show")
    document.querySelector(".filter-container").classList.toggle("focused")
    if (document.querySelector(".filter-container").classList.contains("focused")) {
        document.querySelector("#filterIconTransfers").className = "bi bi-filter-circle-fill filter-icon"
    }
    else {
        document.querySelector("#filterIconTransfers").className = "bi bi-filter-circle filter-icon"
    }
})

document.getElementById("driver_transfers").querySelectorAll(".new-pills-filters").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let isActive = elem.classList.contains('active');

        document.getElementById("driver_transfers").querySelectorAll('.new-pills-filters').forEach(function (el) {
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
    document.querySelector("#juniorContractDropdown").classList.add("d-none")
    document.querySelector("#contractPills").classList.add("d-none")
    document.getElementById("currentContract").innerText = getUpdatedName(inverted_dict[teamDestiniy]).toUpperCase()
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
                            if (autoContractToggle.checked) {
                                if ((game_version === 2024) && (originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) {
                                    signDriver("fireandhire")
                                }
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
                                if (autoContractToggle.checked) {
                                    if ((game_version === 2023 && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) ||
                                        (game_version === 2024) && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "driver-space" | originalParent.classList.contains("affiliates-space"))) {
                                        signDriver("fireandhire")
                                    }
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
                                            driver1ID: target.dataset.driverid,
                                            driver2ID: element.firstChild.dataset.driverid,
                                            driver1: make_name_prettier(target.innerText),
                                            driver2: make_name_prettier(element.firstChild.innerText),
                                        }

                                        const command = new Command("swapDrivers", data);
                                        command.execute();
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
                            driverID: draggable.dataset.driverid,
                            driver: make_name_prettier(draggable.innerText),
                            team: getUpdatedName(inverted_dict[teamOrigin.dataset.team]),
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
                        const command = new Command("fireDriver", data);
                        command.execute();
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
                                if (autoContractToggle.checked) {
                                    if ((game_version === 2023 && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "staff-space")) ||
                                        (game_version === 2024) && (f2_teams.includes(originalTeamId) | f3_teams.includes(originalTeamId) | originalParent.className === "staff-space")) {
                                        signDriver("fireandhire")
                                    }
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
                                            driver1ID: target.dataset.driverid,
                                            driver2ID: element.firstChild.dataset.driverid,
                                            driver1: target.innerText,
                                            driver2: element.firstChild.innerText,
                                        }

                                        const command = new Command("swapDrivers", data);
                                        command.execute();
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
                            driverID: draggable.dataset.driverid,
                            driver: make_name_prettier(draggable.innerText),
                            team: getUpdatedName(inverted_dict[teamOrigin.dataset.team]),
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
                        const command = new Command("fireDriver", data);
                        command.execute();
                    }
                }
            }

        }
    }
});
