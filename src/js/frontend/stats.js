import { inverted_countries_abreviations } from "../backend/scriptUtils/countries";
import { team_dict, mentalityModifiers, teamOrder, mentality_dict, combined_dict, logos_disc } from "./config";
import { colors_dict } from "./head2head";
import { attachHold } from "./renderer";
import { insert_space, manageColor, format_name } from "./transfers";
import Chart from 'chart.js/auto';


let driverStatTitle = document.getElementById("driverStatsTitle")
export let statPanelShown = 0;
export let typeOverall = "driver";
export let typeEdit;
let oldNum;
let editStatsItems = [];
let timer;
let statsRadarChart = null;
const clearIcon2 = document.querySelector("#filterContainer .bi-x");

let isComparisonModeActive = false;
let firstDriverStats = null;
let secondDriverStats = null;
let numbersAvailable = [];

const compareButton = document.getElementById('compareButton');
const plusBtn = document.querySelector('.age-holder .bi-plus');
const minusBtn = document.querySelector('.age-holder .bi-dash');
const ageSpan = document.querySelector('.age-holder .actual-age');
const plusR = document.querySelector('.retirement-age .bi-plus');
const minusR = document.querySelector('.retirement-age .bi-dash');
const inputR = document.querySelector('.retirement-age .actual-retirement');
let plusNumberBtn = document.querySelector('.number-buttons .bi-plus');
let minusNumberBtn = document.querySelector('.number-buttons .bi-dash');
let numberSpan = document.querySelector('.number-holder');

export function setStatPanelShown(value) {
    statPanelShown = value;
}

export function setTypeOverall(value) {
    typeOverall = value;
}

export function setTypeEdit(value) {
    typeEdit = value;
}

/**
 * Removes all the staff from their list
 */
export function removeStatsDrivers(staffOnly = false) {
    document.querySelectorAll(".staff-list").forEach(function (elem) {
        if (elem.id === "fulldriverlist" && staffOnly === false) {
            elem.innerHTML = ""
        }
        else if (elem.id !== "fulldriverlist") {
            elem.innerHTML = ""
        }
    })
}

/**
 * Places the drivers that the backend fetched on the driver list
 * @param {Object} driversArray Object with all the drivers that the backend fetched
 */
export function place_drivers_editStats(driversArray) {
    let divPosition;
    driversArray.forEach((driver) => {
        divPosition = "fulldriverlist"

        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");
        let ovrSpan = document.createElement("span");

        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = driver[1];
        let nameDiv = document.createElement("div");
        nameDiv.className = "name-div-edit-stats"
        newDiv.dataset.teamid = driver[2];
        newDiv.dataset.type = 0;
        let name = driver[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        format_name(driver[0], name, spanName, spanLastName)
        newDiv.dataset.name = insert_space(name[0]) + " " + name.slice(1).join(" ")
        spanLastName.classList.add("bold-font")
        spanLastName.classList.add("surname")
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        newDiv.appendChild(nameDiv)
        newDiv.classList.add(team_dict[driver[2]] + "-transparent")
        let statsString = '';

        for (let i = 5; i <= 15; i++) {
            statsString += driver[i] + ' ';
        }
        newDiv.dataset.stats = statsString;

        newDiv.dataset.superLicense = driver["superlicense"]
        newDiv.dataset.age = driver["age"]
        newDiv.dataset.retirement = driver["retirement_age"]
        newDiv.dataset.numWC = driver["wants1"]
        newDiv.dataset.number = driver["driver_number"]
        newDiv.dataset.raceFormula = driver["race_formula"]
        newDiv.dataset.driverCode = driver["driver_code"]
        newDiv.dataset.isRetired = driver[4]
        if (driver["nationality"] !== "") {
            newDiv.dataset.nationality = driver["nationality"]
        }
        if (driver["mentality0"] >= 0) {
            newDiv.dataset.mentality0 = driver["mentality0"]
            newDiv.dataset.mentality1 = driver["mentality1"]
            newDiv.dataset.mentality2 = driver["mentality2"]
            newDiv.dataset.globalMentality = driver["global_mentality"]
        }
        let mentality = driver["global_mentality"]

        newDiv.dataset.marketability = driver["marketability"]
        let ovr = calculateOverall(statsString, "driver")
        ovrSpan.textContent = ovr
        ovrDiv.appendChild(ovrSpan)
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        newDiv.addEventListener('click', () => {
            if (!isComparisonModeActive) {
                let elementosClicked = document.querySelectorAll('.clicked');
                elementosClicked.forEach(item => item.classList.remove('clicked'));
                newDiv.classList.toggle('clicked');
                driverStatTitle.innerText = newDiv.dataset.name;
                load_stats(newDiv);
                if (statPanelShown == 0) {
                    document.getElementById("editStatsPanel").className = "left-panel-stats";
                    statPanelShown = 1;
                }
                recalculateOverall();
            } else if (isComparisonModeActive && firstDriverStats) {
                //remove clicked class from actual comparing driver
                let comparingDriver = document.querySelector('.comparing-driver');
                if (comparingDriver) {
                    comparingDriver.classList.remove('clicked', 'comparing-driver');

                    let nameDivOld = comparingDriver.children[0];
                    let comparingTagOld = nameDivOld.querySelector(".comparing-tag");
                    if (comparingTagOld) {
                        nameDivOld.removeChild(comparingTagOld);
                    }
                }
                //add clicked class
                newDiv.classList.add('clicked', 'comparing-driver');
                let nameDiv = newDiv.children[0];
                let comparingTag = document.createElement("span");
                let teamClass = team_dict[newDiv.dataset.teamid];
                comparingTag.className = `comparing-tag ${teamClass}`;
                comparingTag.textContent = "Comparing";
                nameDiv.appendChild(comparingTag);
                secondDriverStats = newDiv.dataset.stats;
                updateComparisonUI();
            }
        });
        document.getElementById(divPosition).appendChild(newDiv)


    })

    document.querySelector("#edit_stats").querySelectorAll(".custom-input-number").forEach(function (elem) {
        elem.addEventListener("change", function () {
            if (elem.value > 100) {
                elem.value = 100;
            }
            recalculateOverall()
        });
    });

    manage_order(0)

}

export function initStatsDrivers() {
    editStatsItems = [...document.querySelectorAll(".normal-driver")].map(el => {
        const first = el.children[0]?.children[0]?.textContent || "";
        const last = el.children[0]?.children[1]?.textContent || "";
        return { el, name: (first + last).toLowerCase() };
    });
}



/**
 * Places the staff that the backend fetched on their respective staff list
 * @param {Object} staffArray Object with all the staff that the backend fetched
 */
export function place_staff_editStats(staffArray) {
    let divPosition;

    staffArray.forEach((staff) => {
        let statsString = '';

        if (staff[3] == 1) {
            divPosition = "fullTechnicalList"
            for (let i = 4; i <= 9; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 2) {
            divPosition = "fullEngineerList"
            for (let i = 4; i <= 6; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 3) {
            divPosition = "fullAeroList"
            for (let i = 4; i <= 11; i++) {
                statsString += staff[i] + ' ';
            }
        }
        else if (staff[3] == 4) {
            divPosition = "fullDirectorList"
            for (let i = 4; i <= 7; i++) {
                statsString += staff[i] + ' ';
            }
        }
        statsString = statsString.slice(0, -1);


        let newDiv = document.createElement("div");
        let ovrDiv = document.createElement("div");
        let ovrSpan = document.createElement("span")


        newDiv.className = "col normal-driver";
        newDiv.dataset.driverid = staff[1];
        newDiv.dataset.type = staff[3];
        let nameDiv = document.createElement("div");
        nameDiv.className = "name-div-edit-stats"
        newDiv.dataset.teamid = staff[2];
        let name = staff[0].split(" ")
        let spanName = document.createElement("span")
        let spanLastName = document.createElement("span")
        format_name(staff[0], name, spanName, spanLastName)
        newDiv.dataset.name = insert_space(name[0]) + " " + name.slice(1).join(" ")
        spanLastName.classList.add("bold-font")
        spanLastName.classList.add("surname")
        nameDiv.appendChild(spanName)
        nameDiv.appendChild(spanLastName)
        manageColor(newDiv, spanLastName)
        newDiv.appendChild(nameDiv)
        newDiv.classList.add(team_dict[staff[2]] + "-transparent")
        newDiv.dataset.stats = statsString;

        newDiv.dataset.age = staff["age"]
        newDiv.dataset.retirement = staff["retirement_age"]
        newDiv.dataset.raceFormula = staff["race_formula"]
        newDiv.dataset.isRetired = staff[4]
        if (staff["nationality"] !== "") {
            newDiv.dataset.nationality = staff["nationality"]
        }
        if (staff["mentality0"] >= 0) {
            newDiv.dataset.mentality0 = staff["mentality0"]
            newDiv.dataset.mentality1 = staff["mentality1"]
            newDiv.dataset.mentality2 = staff["mentality2"]
            newDiv.dataset.globalMentality = staff["global_mentality"]
        }
        let mentality = staff["global_mentality"]
        let ovr = calculateOverall(statsString, "staff")
        ovrSpan.textContent = ovr

        ovrDiv.appendChild(ovrSpan)
        ovrDiv.classList.add("bold-font")
        ovrDiv.classList.add("small-ovr")
        newDiv.appendChild(ovrDiv)
        newDiv.addEventListener('click', () => {
            if (!isComparisonModeActive) {
                let elementosClicked = document.querySelectorAll('.clicked');
                elementosClicked.forEach(item => item.classList.remove('clicked'));
                newDiv.classList.toggle('clicked');
                driverStatTitle.innerText = newDiv.dataset.name;
                load_stats(newDiv);
                if (statPanelShown == 0) {
                    document.getElementById("editStatsPanel").className = "left-panel-stats";
                    statPanelShown = 1;
                }
                recalculateOverall();
            } else if (isComparisonModeActive && firstDriverStats) {
                //remove clicked class from actual comparing driver
                let comparingDriver = document.querySelector('.comparing-driver');
                if (comparingDriver) {
                    comparingDriver.classList.remove('clicked', 'comparing-driver');

                    let nameDivOld = comparingDriver.children[0];
                    let comparingTagOld = nameDivOld.querySelector(".comparing-tag");
                    if (comparingTagOld) {
                        nameDivOld.removeChild(comparingTagOld);
                    }
                }
                //add clicked class
                newDiv.classList.add('clicked', 'comparing-driver');
                let nameDiv = newDiv.children[0];
                let comparingTag = document.createElement("span");
                let teamClass = team_dict[newDiv.dataset.teamid];
                comparingTag.className = `comparing-tag ${teamClass}`;
                comparingTag.textContent = "Comparing";
                nameDiv.appendChild(comparingTag);
                secondDriverStats = newDiv.dataset.stats;
                updateComparisonUI();
            }
        });

        document.getElementById(divPosition).appendChild(newDiv)

    })

}

function getMentalityModifier(mentality) {
    let keys = Object.keys(mentalityModifiers).map(Number).sort((a, b) => a - b);

    let nextKey = keys.find(key => key > mentality);

    return nextKey !== undefined ? mentalityModifiers[nextKey] : null;
}

/**
 * changes the overall placed in the overall square
 */
function recalculateOverall() {
    let stats = ""
    document.querySelectorAll(".elegible").forEach(function (elem) {
        stats += elem.value + " "
    })
    stats = stats.slice(0, -1);
    let oldovr = document.getElementById("ovrholder").innerHTML;
    let ovr = calculateOverall(stats, typeOverall);
    if (oldovr > ovr) {
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertNeg";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        }, 300);
    }
    else if (oldovr < ovr) {
        document.getElementById("ovrholder").innerHTML = ovr;
        document.getElementById("ovrholder").className = "overall-holder bold-font alertPos";
        setTimeout(() => {
            document.getElementById("ovrholder").className = "overall-holder bold-font"
        }, 300);
    }

}

/**
 * eventListeenr for the confirm button for the stats
 */


/**
 * Gets the named with a space between name and lastname
 * @param {*} html element with the name bad formatted
 * @returns the name formatted
 */
export function getName(html) {
    let name = ""
    html.querySelectorAll('span').forEach(function (elem) {
        name += elem.innerText + " "
    })

    name = name.slice(0, -1)

    return name;

}

/**
 * Mathematic calculations to get a staff's overall value
 * @param {string} stats all stats spearated by a space between them
 * @param {string} type type of staff
 * @returns the number of his overall value
 */
export function calculateOverall(stats, type) {
    let statsArray = stats.split(" ").map(Number);
    let rating;
    if (type === "driver") {
        let cornering = statsArray[0];
        let braking = statsArray[1];
        let control = statsArray[2];
        let smoothness = statsArray[3];
        let adaptability = statsArray[4];
        let overtaking = statsArray[5];
        let defence = statsArray[6];
        let reactions = statsArray[7];
        let accuracy = statsArray[8];

        rating = (cornering + braking * 0.75 + reactions * 0.5 + control * 0.75 + smoothness * 0.5 + accuracy * 0.75 + adaptability * 0.25 + overtaking * 0.25 + defence * 0.25) / 5;
    }
    else if (type === "staff") {
        let suma = 0;
        for (let i = 0; i < statsArray.length; i++) {
            suma += statsArray[i];
        }
        rating = suma / statsArray.length;
    }
    return Math.round(rating)
}

function updateStat(input, increment) {
    let val = parseInt(input.value) + increment;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    input.value = val;
    recalculateOverall();
    manage_stat_bar(input, val);
}


document.querySelectorAll(".attributes-panel .bi-plus").forEach(button => {
    let bar = button.parentNode.parentNode.parentNode.querySelector(".one-stat-progress");
    let statInput = button.parentNode.parentNode.querySelector("input");
    attachHold(button, statInput, +1, { min: 0, max: 99, progressEl: bar, onChange: recalculateOverall });
    recalculateOverall();
});

document.querySelectorAll(".attributes-panel .bi-dash").forEach(button => {
    let bar = button.parentNode.parentNode.parentNode.querySelector(".one-stat-progress");
    let statInput = button.parentNode.parentNode.querySelector("input");
    attachHold(button, statInput, -1, { min: 0, max: 99, progressEl: bar, onChange: recalculateOverall });
});

attachHold(plusBtn, ageSpan, +1, { min: 0, max: 100 });
attachHold(minusBtn, ageSpan, -1, { min: 0, max: 100 });

attachHold(plusR, inputR, +1, { min: 30, max: 80 });
attachHold(minusR, inputR, -1, { min: 30, max: 80 });

document.querySelector("#nameFilter").addEventListener("input", function (event) {
    const val = event.target.value;
    clearIcon2.classList.toggle("d-none", val === "");

    clearTimeout(timer);
    timer = setTimeout(() => {
        const q = val.trim().toLowerCase();
        console.log("Filtering with query:", q);
        if (!q) { for (const { el } of editStatsItems) el.classList.remove("d-none"); return; }
        for (const { el, name } of editStatsItems) el.classList.toggle("d-none", !name.includes(q));
    }, 150);
})

document.querySelectorAll(".text-filter-container .bi-x").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let input = elem.parentNode.querySelector("input")
        input.value = ""
        elem.classList.add("d-none")
        let event = new Event('input', {
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(event);
    })
})

document.querySelector("#filterIcon").addEventListener("click", function () {
    document.getElementById("edit_stats").querySelector(".category-filters").classList.toggle("show")
    document.getElementById("edit_stats").querySelector(".filter-container").classList.toggle("focused")
})

document.getElementById("edit_stats").querySelectorAll(".filter-pills").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let isActive = elem.classList.contains('active');

        document.getElementById("edit_stats").querySelectorAll('.filter-pills').forEach(function (el) {
            el.classList.remove('active');
        });

        if (!isActive) {
            elem.classList.add('active');
        }
    })
})

document.querySelector("#F1filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 1) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F2filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 2) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#F3filter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 3) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector("#freefilter").addEventListener("click", function (event) {
    if (!event.target.classList.contains("active")) {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            elem.classList.remove("d-none")
        })
    }
    else {
        let elements = document.querySelectorAll(".normal-driver")
        elements.forEach(function (elem) {
            if (parseInt(elem.dataset.raceFormula) === 4) {
                elem.classList.remove("d-none")
            }
            else {
                elem.classList.add("d-none")
            }
        })
    }
})

document.querySelector(".order-space").querySelectorAll("i").forEach(function (elem) {
    elem.addEventListener("click", function (event) {
        let parent = elem.parentNode
        let state = parent.dataset.state
        let orderNumUp = document.querySelector(".bi-sort-numeric-up-alt")
        let orderNumDown = document.querySelector(".bi-sort-numeric-down")
        parent.dataset.state = (parseInt(state) + 1) % 3
        if (parent.dataset.state == 0) {
            orderNumUp.classList.remove("active")
            orderNumUp.classList.remove("hidden")
            orderNumDown.classList.add("hidden")
        }
        else if (parent.dataset.state == 1) {
            orderNumDown.classList.add("hidden")
            orderNumDown.classList.add("active")
            orderNumUp.classList.add("active")
            orderNumUp.classList.remove("hidden")

        }
        else if (parent.dataset.state == 2) {
            orderNumUp.classList.remove("active")
            orderNumUp.classList.add("hidden")
            orderNumDown.classList.add("active")
            orderNumDown.classList.remove("hidden")
        }
        manage_order(parseInt(parent.dataset.state))
    })
})


/**
 * Adds eventListeners to all the elements of the staff dropdown
 */
export function listenersStaffGroups() {
    document.querySelectorAll('#staffMenu a').forEach(item => {
        item.addEventListener("click", function () {
            if (isComparisonModeActive) toggleComparisonMode();
            const staffButton = document.getElementById('staffDropdown');
            let staffSelected = item.innerHTML
            let staffCode = item.dataset.spacestats
            if (staffCode === "driverStats") {
                typeOverall = "driver"
                typeEdit = "0"
                document.getElementById("driverSpecialAttributes").classList.remove("d-none")
                document.querySelector("#superLicenseSwitch").classList.remove("d-none")
                document.querySelector("#driverCode").classList.remove("d-none")

                document.querySelector("#numberDetails").previousElementSibling.classList.remove("d-none")
                document.querySelector("#numberDetails").classList.remove("d-none")
                document.querySelector(".upper-section-stats").classList.add("showing-driver")
            }
            else {
                typeOverall = "staff"
                document.getElementById("driverSpecialAttributes").classList.add("d-none")
                document.querySelector("#superLicenseSwitch").classList.add("d-none")
                document.querySelector("#driverCode").classList.add("d-none")
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

                document.querySelector("#numberDetails").previousElementSibling.classList.add("d-none")
                document.querySelector("#numberDetails").classList.add("d-none")
                document.querySelector(".upper-section-stats").classList.remove("showing-driver")

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
    document.getElementById("driverStatsDrop").click()
}

function manage_order(state) {
    let elements = document.querySelectorAll(".normal-driver");
    let array = Array.from(elements);

    // Crear un objeto para almacenar los padres originales
    let parents = {};
    array.forEach(elem => {
        parents[elem.dataset.driverid] = elem.parentNode; // Asumiendo que cada .normal-driver tiene un data-id único
    });

    let sortedArray = array.sort(function (a, b) {
        let ovrA = parseInt(a.children[1].innerText);
        let ovrB = parseInt(b.children[1].innerText);
        let teamA = parseInt(a.dataset.teamid);
        let teamB = parseInt(b.dataset.teamid);

        if (state == 0) {
            if (teamA === 0) return 1;
            if (teamB === 0) return -1;

            let indexA = teamOrder.indexOf(teamA);
            let indexB = teamOrder.indexOf(teamB);

            if (indexA !== indexB) {
                return indexA - indexB;
            }

            return ovrB - ovrA;
        } else if (state == 1) {
            return ovrB - ovrA;
        } else {
            return ovrA - ovrB;
        }
    });

    // Limpiar los contenedores
    document.querySelectorAll(".staff-list").forEach(function (elem) {
        elem.innerHTML = "";
    });

    // Volver a colocar los elementos ordenados en sus padres originales
    sortedArray.forEach(function (elem) {
        let parent = parents[elem.dataset.driverid];
        parent.appendChild(elem);
    });
}



export function manage_stat_bar(element, value) {
    let container = element.parentNode.parentNode.parentNode
    let bar = container.querySelector(".one-stat-progress")
    let percentage = value + "%"
    bar.style.width = percentage
}


/**
 * Loads the stats into the input numbers
 * @param {div} div div of the staff that is about to be edited
 */
function load_stats(div) {
    let statsArray = div.dataset.stats.split(" ").map(Number);

    let inputArray = document.querySelectorAll(".elegible")
    inputArray.forEach(function (input, index) {
        let value = statsArray[index]
        let label = input.parentNode.parentNode.querySelector("span.bold-font")
        input.value = value
        manage_stat_bar(input, value)
    });

    const graphInputArray = document.querySelectorAll(".elegible");
    const pairs = Array.from(graphInputArray).map((input, index) => {
        const labelEl = input.parentNode?.parentNode?.querySelector("span.bold-font");
        const labelFull = (labelEl?.textContent || '').trim();
        const value = statsArray[index];
        return { labelFull, value };
    });

    // Excluir Growth y Aggression (incluida variante "Aggresion")
    const excluded = new Set(['growth', 'aggression', 'aggresion', 'marketability']);
    const filtered = pairs.filter(p => !excluded.has(p.labelFull.toLowerCase()));

    // Labels = 3 primeras letras en MAYÚSCULAS
    const labelsArray = filtered.map(p => p.labelFull.slice(0, 3).toUpperCase());
    const valuesArray = filtered.map(p => p.value);

    // (Re)crear si cambian etiquetas; si no, solo actualizar datos
    if (!statsRadarChart ||
        statsRadarChart.data.labels.length !== labelsArray.length ||
        statsRadarChart.data.labels.some((l, i) => l !== labelsArray[i])) {
        createStatsRadarChart(labelsArray);
        statsRadarChart.config._fullLabels = filtered.map(p => p.labelFull);

    }
    updateStatsRadarData(valuesArray, 0, cssVar("--new-primary"), div.dataset.name.split(" ").pop());

    let actualAge = document.querySelector(".actual-age")
    let retirementAge = document.querySelector(".actual-retirement")
    let numberHolder = document.querySelector(".number-holder")
    let numberWC = document.querySelector("#driverNumber1")
    let codeInput = document.querySelector("#driverCode")
    codeInput.innerText = div.dataset.driverCode
    oldNum = div.dataset.number
    actualAge.innerText = div.dataset.age
    retirementAge.innerText = div.dataset.retirement
    numberHolder.innerText = div.dataset.number
    if (div.dataset.numWC === "0") {
        numberWC.checked = false
    }
    else {
        numberWC.checked = true
    }
    if (div.dataset.superLicense === "1") {
        document.querySelector("#superLicense").checked = true
    }
    else {
        document.querySelector("#superLicense").checked = false
    }
    if (div.dataset.isRetired === "1") {
        document.querySelector("#retiredInput").checked = true
    }
    else {
        document.querySelector("#retiredInput").checked = false
    }
    if (div.dataset.mentality0) {
        for (let i = 0; i < 3; i++) {
            let mentality = div.dataset["mentality" + i]
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.remove("d-none")
            indicator.dataset.value = mentality
            let inverted_value = 5 - mentality
            let levels = indicator.querySelectorAll('.mentality-level');
            let mentality_class = mentality_dict[mentality]
            for (let j = 0; j < 5; j++) {
                levels[j].className = "mentality-level"
                if (j <= inverted_value - 1) {
                    levels[j].classList.add(mentality_class)
                }
            }
            let nameEmoji = indicator.parentNode.parentNode.querySelector(".mentality-and-emoji")
            nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
            nameEmoji.className = "mentality-and-emoji"
            nameEmoji.classList.add(mentality_class)
        }
    }
    else {
        for (let i = 0; i < 3; i++) {
            let indicator = document.getElementById("mentality" + i)
            indicator.parentNode.parentNode.classList.add("d-none")
        }
    }
    if (div.dataset.marketability) {
        document.querySelector("#marketability").classList.remove("d-none")
        document.getElementById("marketabilityInput").value = div.dataset.marketability
        document.getElementById("marketabilityBar").style.width = div.dataset.marketability + "%"
    }
    else {
        document.querySelector("#marketability").classList.add("d-none")
    }
    if (div.dataset.nationality) {
        document.querySelector(".driver-info-driver-flag").src = `https://flagsapi.com/${div.dataset.nationality}/flat/64.png`
        document.querySelector(".flag-text").textContent = inverted_countries_abreviations[div.dataset.nationality] || div.dataset.nationality
    }
    let logo = undefined;
    logo = logos_disc[div.dataset.teamid];
    if (logo === undefined) {
        document.querySelector(".driver-info-team-logo").classList.add("d-none")
    }
    else {
        document.querySelector(".driver-info-team-logo").classList.remove("d-none")
        document.querySelector(".driver-info-team-logo").src = logo
    }
    let teamName = combined_dict[div.dataset.teamid] || "Free Agent";
    document.querySelector(".team-text").textContent = teamName !== "Visa Cashapp RB" ? teamName : "VCARB";
}

document.querySelectorAll(".bar-container .bi-chevron-right").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".mentality-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) - 1;
        if (value < 0) {
            value = 0
        }
        let inverted_value = 5 - value

        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.mentality-level');
        let mentality_class = mentality_dict[value]
        for (let j = 0; j < 5; j++) {
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1) {
                levels[j].classList.add(mentality_class)
            }
        }
        let nameEmoji = elem.parentNode.parentNode.querySelector(".mentality-and-emoji")
        nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
        nameEmoji.className = "mentality-and-emoji"
        nameEmoji.classList.add(mentality_class)
    })
})

document.querySelectorAll(".bar-container .bi-chevron-left").forEach(function (elem) {
    elem.addEventListener("click", function () {
        let indicator = elem.parentNode.querySelector(".mentality-level-indicator")
        let value = parseInt(indicator.getAttribute('data-value')) + 1;
        if (value > 4) {
            value = 4
        }
        let inverted_value = 5 - value
        indicator.setAttribute('data-value', value);
        let levels = indicator.querySelectorAll('.mentality-level');
        let mentality_class = mentality_dict[value]
        for (let j = 0; j < 5; j++) {
            levels[j].className = "mentality-level"
            if (j <= inverted_value - 1) {
                levels[j].classList.add(mentality_class)
            }
        }
        let nameEmoji = elem.parentNode.parentNode.querySelector(".mentality-and-emoji")
        nameEmoji.innerText = capitalizeFirstLetter(mentality_class)
        nameEmoji.className = "mentality-and-emoji"
        nameEmoji.classList.add(mentality_class)
    })
})

/**
 * Loads all the numbers into the number menu
 * @param {Object} nums all numbers array
 */
export function loadNumbers(nums) {
    numbersAvailable = nums;
}

attachHold(plusNumberBtn, numberSpan, +1, { min: 0, max: 99, });
attachHold(minusNumberBtn, numberSpan, -1, { min: 0, max: 99 });


document.querySelector("#editNameButton").addEventListener("click", function (e) {
    const btn = e.target;
    const nameSpan = document.getElementById("driverStatsTitle");
    const codeSpan = document.getElementById("driverCode");

    if (!btn.classList.contains("editing")) {
        // --- ENTRAMOS EN MODO EDICIÓN ---
        btn.className = "bi bi-check editing";

        // Guardar tamaños originales como dataset
        const nameRect = nameSpan.getBoundingClientRect();
        const codeRect = codeSpan.getBoundingClientRect();
        nameSpan.dataset.originalWidth = nameRect.width;
        nameSpan.dataset.originalHeight = nameRect.height;
        codeSpan.dataset.originalWidth = codeRect.width;
        codeSpan.dataset.originalHeight = codeRect.height;

        // Crear textareas
        const nameInput = document.createElement("textarea");
        const codeInput = document.createElement("textarea");

        // Asignar valores
        nameInput.value = nameSpan.innerText.trim();
        codeInput.value = codeSpan.innerText.trim();

        const newNameWidth = nameRect.width;
        const newCodeWidth = codeRect.width;

        // Asignar tamaño
        nameInput.style.width = newNameWidth + "px";
        nameInput.style.height = nameRect.height + "px";
        nameSpan.style.width = newNameWidth + "px";
        nameSpan.style.height = nameRect.height + "px";

        codeInput.style.width = newCodeWidth + "px";
        codeInput.style.height = codeRect.height + "px";
        codeSpan.style.width = newCodeWidth + "px";
        codeSpan.style.height = codeRect.height + "px";

        // Reemplazar contenido
        nameSpan.innerHTML = "";
        nameSpan.appendChild(nameInput);

        codeSpan.innerHTML = "";
        codeSpan.appendChild(codeInput);
    } 
    else {
        // --- GUARDAMOS CAMBIOS ---
        btn.className = "bi bi-pencil-fill";
        btn.classList.remove("editing");

        const nameInput = nameSpan.querySelector("textarea");
        const codeInput = codeSpan.querySelector("textarea");

        // Restaurar tamaño original
        nameSpan.style.width = "auto"
        nameSpan.style.height = "auto";
        codeSpan.style.width = "auto";
        codeSpan.style.height = "auto";

        // Restaurar texto
        nameSpan.innerText = nameInput.value.trim();
        codeSpan.innerText = codeInput.value.trim();

        // Limpiar los datasets
        delete nameSpan.dataset.originalWidth;
        delete nameSpan.dataset.originalHeight;
        delete codeSpan.dataset.originalWidth;
        delete codeSpan.dataset.originalHeight;
    }
});





function capitalizeFirstLetter(str) {
    if (!str) return str; // Manejo de cadena vacía
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


/**
 * Generates the name title on the main panel of the edit stats
 * @param {div} html div from the staff selected
 * @returns the html necessary to put in the name with correct color
 */
function manage_stats_title(html) {
    let colorClass = ""
    if (html.dataset.teamid != 0) {
        colorClass = team_dict[html.dataset.teamid] + "font"
    }
    let spanName = document.createElement("span")
    let spanLastName = document.createElement("span")
    let name = "<span>" + html.children[0].children[0].innerText + " </span>" + "<span class='" + colorClass + "'>" + html.children[0].children[1].innerText + "</span>"

    //let name = html.substring(0,html.length - 2).trim();

    return name;

}

/**
 * Changes the input number that are taken into account to change stats 
 * @param {div} divID div that contains the correct input numbers  
 */
export function change_elegibles(divID) {
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

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}


function ensureStatsGraphCanvas() {
    const wrap = document.querySelector('.stats-graph');
    let canvas = wrap.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'statsRadar';
        wrap.innerHTML = '';         // por si acaso
        wrap.appendChild(canvas);
    }
    return canvas.getContext('2d');
}

function getThemeColor(fallback = '#4DA3FF') {
    // intenta leer de CSS variables; ajusta nombres si ya las tienes
    const root = getComputedStyle(document.documentElement);
    const c = root.getPropertyValue('--accent')?.trim()
        || root.getPropertyValue('--primary')?.trim()
        || fallback;
    return c;
}

function rgbaFromHex(hex, alpha) {
    // admite #RGB o #RRGGBB
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createStatsRadarChart(labels) {
    const ctx = ensureStatsGraphCanvas();

    if (statsRadarChart) {
        statsRadarChart.destroy();
        statsRadarChart = null;
    }

    const labelColor = cssVar('--text-general', '#e8eaed');
    const primaryColor = cssVar('--new-primary', '#c89efc');
    const secondaryColor = cssVar('--new-secondary', '#9efcc8');


    statsRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{
                label: 'Stats',
                data: [],
                borderColor: primaryColor,
                backgroundColor: `${primaryColor}40`,
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 4,
                pointBackgroundColor: primaryColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Formula1Bold',
                        size: 13
                    },
                    bodyFont: {
                        family: 'Formula1',
                        size: 12
                    },
                    callbacks: {
                        // Mostrar el nombre completo de la stat
                        title: function (tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            // Recupera el nombre completo desde tu array original
                            // (debes tenerlo guardado globalmente o en chart.config._fullLabels)
                            const fullLabel = statsRadarChart?.config?._fullLabels?.[index];
                            return fullLabel || tooltipItems[0].label;
                        },
                        // Línea del dataset
                        label: function (context) {
                            const datasetLabel = context.dataset.label || '';
                            const value = context.formattedValue;
                            return `${datasetLabel}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false, showLabelBackdrop: false, stepSize: 50 },
                    grid: { color: 'rgba(128,128,128,0.25)' },
                    angleLines: { color: 'rgba(128,128,128,0.25)' },
                    pointLabels: {
                        color: labelColor,
                        font: { family: 'Formula1Bold' }
                    }
                }
            },
            layout: {
                padding: { top: 8, bottom: 16, left: -20, right: -20 }
            },
            elements: {
                point: {
                    radius: 2,
                    hoverRadius: 4,
                    hitRadius: 12
                },
                line: { tension: 0 }
            }
        }
    });
}

function removeDatasetFromStatsRadarData(index) {
    if (!statsRadarChart) return;
    if (index < 0 || index >= statsRadarChart.data.datasets.length) return;
    statsRadarChart.data.datasets.splice(index, 1);
    recalculateRadarScale();
    statsRadarChart.update();
}

function updateStatsRadarData(values, index = 0, color, name) {
    if (!statsRadarChart) return;
    statsRadarChart.data.datasets[index].data = values;
    if (color) {
        statsRadarChart.data.datasets[index].borderColor = color;
        statsRadarChart.data.datasets[index].backgroundColor = rgbaFromHex(color, 0.25);
    }
    if (name) {
        statsRadarChart.data.datasets[index].label = name;
    }
    recalculateRadarScale();
    statsRadarChart.update();
}

function addDatasetToStatsRadarData(values, color, name) {
    if (!statsRadarChart) return;
    statsRadarChart.data.datasets.push({
        label: name || `Stats ${statsRadarChart.data.datasets.length + 1}`,
        data: values,
        borderColor: color,
        backgroundColor: rgbaFromHex(color, 0.25),
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: color
    });
    recalculateRadarScale();
    statsRadarChart.update();
}

function recalculateRadarScale() {
    if (!statsRadarChart) return;

    // 1️⃣ Obtenemos todos los valores de todos los datasets
    const allValues = statsRadarChart.data.datasets.flatMap(ds => ds.data);

    // 2️⃣ Calculamos el mínimo y máximo reales
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    // 3️⃣ Creamos un margen dinámico (por ejemplo, 20 por debajo y 5 por encima)
    const lowerMargin = 15;
    const upperMargin = 5;

    // 4️⃣ Ajustamos la escala del radar chart
    statsRadarChart.options.scales.r.min = Math.max(0, minVal - lowerMargin);
    statsRadarChart.options.scales.r.max = Math.min(100, maxVal + upperMargin);
}

function toggleComparisonMode() {
    isComparisonModeActive = !isComparisonModeActive;
    const editStatsPanel = document.getElementById('editStatsPanel');
    const header = document.querySelector('.upper-section-stats');

    if (isComparisonModeActive) {
        compareButton.querySelector("span").textContent = 'Cancel';
        compareButton.classList.add('active');
        editStatsPanel.classList.add('comparison-active');
        header.classList.add('comparison-active');
        document.querySelectorAll(".mentality-and-emoji").forEach(indicator => {
            indicator.classList.add("d-none");
        });

        const clickedDriver = document.querySelector('.normal-driver.clicked');
        if (clickedDriver) {
            firstDriverStats = clickedDriver.dataset.stats;
            let nameDiv = clickedDriver.children[0];
            let comparingTag = document.createElement("span");
            let teamClass = team_dict[clickedDriver.dataset.teamid];
            comparingTag.className = `comparing-tag ${teamClass}`;
            comparingTag.textContent = "Comparing";
            nameDiv.appendChild(comparingTag);
        } else {
            // Handle case where no driver is selected, maybe disable the button?
            console.warn("No driver selected for comparison.");
            // possibly exit comparison mode if no driver is selected to start with
            isComparisonModeActive = false;
            compareButton.querySelector("span").textContent = 'Compare';
            editStatsPanel.classList.remove('comparison-active');
            header.classList.remove('comparison-active');
        }


    } else {
        //remove all comparison tags
        document.querySelectorAll('.normal-driver .comparing-tag').forEach(tag => tag.remove());
        //remove comparing-driver class
        let comparingDriver = document.querySelector('.comparing-driver');
        if (comparingDriver) {
            comparingDriver.classList.remove('comparing-driver', 'clicked');
        }
        compareButton.classList.remove('active');
        compareButton.querySelector("span").textContent = 'Compare';
        editStatsPanel.classList.remove('comparison-active');
        header.classList.remove('comparison-active');
        firstDriverStats = null;
        secondDriverStats = null;
        resetComparisonUI();
        removeDatasetFromStatsRadarData(1);

        document.querySelectorAll(".mentality-and-emoji").forEach(indicator => {
            indicator.classList.remove("d-none");
        });

        document.querySelectorAll(".shorten-ret").forEach(elem => {
            elem.innerText = "Retirement"
        });

        // Remove cloned elements
        const clonedInfo = document.querySelector('.name-and-info.cloned');
        if (clonedInfo) clonedInfo.remove();
        const clonedOvr = document.querySelector('.special-overall.cloned');
        if (clonedOvr) clonedOvr.remove();
        document.querySelectorAll('.cloned-separator').forEach(separator => separator.remove());
        const clonedAgeDetails = document.querySelector('#ageDetails.cloned');
        if (clonedAgeDetails) clonedAgeDetails.remove();

        document.querySelectorAll(".hidable-separator").forEach(separator => {
            separator.classList.remove("d-none");
        });
    }
}

if (compareButton) {
    compareButton.addEventListener('click', toggleComparisonMode);
}

function resetComparisonUI() {
    // Restore UI to single-driver view
    const statPanels = document.querySelectorAll('.one-stat-panel:has(.elegible)');
    statPanels.forEach(panel => {
        const barContainer = panel.querySelector('.bar-container');
        if (barContainer) barContainer.classList.remove('comparing');

        //reset bar colors
        const actualBar = panel.querySelector('.one-stat-progress');
        if (actualBar) actualBar.style.backgroundColor = '';

        const input = panel.querySelector('input.custom-input-number');
        if (input) {
            input.removeAttribute('readonly');
            input.classList.remove('comparing-tag');
            // Also remove any team color classes that might have been added
            for (const key in team_dict) {
                if (team_dict.hasOwnProperty(key)) {
                    input.classList.remove(team_dict[key]);
                }
            }
        }

        const comparisonBar = panel.querySelector('.comparison-bar');
        if (comparisonBar) comparisonBar.remove();

        const comparisonValue = panel.querySelector('.comparison-stat-value');
        if (comparisonValue) comparisonValue.remove();

        const plusButton = panel.querySelector('.bi-plus');
        const minusButton = panel.querySelector('.bi-dash');
        if (plusButton) plusButton.style.display = '';
        if (minusButton) minusButton.style.display = '';

        const header = document.querySelector('.upper-section-stats');
        // header.querySelector("#ageDetails").classList.remove("d-none");
        header.querySelector("#numberDetails").classList.remove("d-none");
        header.querySelector("#availabilityDetails").classList.remove("d-none");
    });

    // Reset Marketability
    const marketabilityPanel = document.getElementById('marketability');
    if (marketabilityPanel) {
        const barContainer = marketabilityPanel.querySelector('.bar-container');
        if (barContainer) barContainer.classList.remove('comparing');

        const actualBar = marketabilityPanel.querySelector('.one-stat-progress');
        if (actualBar) actualBar.style.backgroundColor = '';

        const comparisonBar = marketabilityPanel.querySelector('.comparison-bar');
        if (comparisonBar) comparisonBar.remove();

        const comparisonValue = marketabilityPanel.querySelector('.comparison-stat-value');
        if (comparisonValue) comparisonValue.remove();

        const plusButton = marketabilityPanel.querySelector('.bi-plus');
        const minusButton = marketabilityPanel.querySelector('.bi-dash');
        if (plusButton) plusButton.style.display = '';
        if (minusButton) minusButton.style.display = '';

        const comparisonValueInput = marketabilityPanel.querySelector('.custom-input-number');
        if (comparisonValueInput){
            comparisonValueInput.removeAttribute('readonly');
            comparisonValueInput.className = "custom-input-number elegible";
        } 
    }

    // Reset Mentality
    for (let i = 0; i < 3; i++) {
        const mentalityPanel = document.getElementById(`mentality${i}`).parentNode.parentNode;
        if (mentalityPanel) {
            const comparisonBar = mentalityPanel.querySelector('.comparison-bar');
            if (comparisonBar) comparisonBar.remove();

            const buttons = mentalityPanel.querySelectorAll('.bi-chevron-left, .bi-chevron-right');
            buttons.forEach(btn => btn.style.display = '');
        }
    }
}

function updateComparisonUI() {
    if (!firstDriverStats || !secondDriverStats) return;

    //get team ids from both drivers
    const teamId1 = document.querySelector('.normal-driver.clicked:not(.comparing-driver)').dataset.teamid;
    const teamId2 = document.querySelector('.normal-driver.clicked.comparing-driver').dataset.teamid;
    let secondColorSuffix = teamId1 === teamId2 ? '1' : '0';
    let color2 = cssVar(`--new-secondary`)

    const stats1 = firstDriverStats.split(' ').map(Number);
    const stats2 = secondDriverStats.split(' ').map(Number);

    const statPanels = document.querySelectorAll('.one-stat-panel:has(.elegible)');

    statPanels.forEach((panel, index) => {
        if (index < stats1.length) {
            // Remove previous comparison elements if they exist
            const existingComparisonBar = panel.querySelector('.comparison-stat-progress');
            if (existingComparisonBar) existingComparisonBar.parentElement.remove();

            const existingComparisonValue = panel.querySelector('.comparison-stat-value');
            if (existingComparisonValue) existingComparisonValue.remove();

            // Create and append the second stat bar
            const barContainer = panel.querySelector('.bar-container');
            barContainer.classList.add('comparing');
            let actualBar = barContainer.querySelector('.one-stat-progress');
            const comparisonStatBarContainer = document.createElement('div');
            comparisonStatBarContainer.className = 'one-stat-bar comparison-bar';
            const comparisonProgressBar = document.createElement('div');
            comparisonProgressBar.className = 'one-stat-progress comparison-stat-progress';
            comparisonProgressBar.style.width = `${stats2[index]}%`;
            comparisonProgressBar.style.backgroundColor = color2;
            comparisonStatBarContainer.append(comparisonProgressBar);
            barContainer.appendChild(comparisonStatBarContainer);

            // Create and append the second stat value
            const statNumberDiv = panel.querySelector('.stat-number');
            const comparisonValueInput = document.createElement('input');
            //make the input non-editable
            comparisonValueInput.setAttribute('readonly', 'readonly');
            comparisonValueInput.className = 'custom-input-number comparison-stat-value';
            comparisonValueInput.value = stats2[index];


            const existingValueInput = statNumberDiv.querySelector('input.custom-input-number:not(.comparison-stat-value)');
            existingValueInput.setAttribute('readonly', 'readonly');
            if (stats2[index] > stats1[index]) {
                comparisonValueInput.classList.add(`comparing-tag`, `secondary`);
                existingValueInput.classList.remove("comparing-tag", "primary");
            } else if (stats2[index] < stats1[index]) {
                if (existingValueInput) existingValueInput.classList.add(`comparing-tag`, `primary`);
                comparisonValueInput.classList.remove("comparing-tag", "secondary");
            }
            statNumberDiv.appendChild(comparisonValueInput);


            // Hide plus/minus buttons
            const plusButton = statNumberDiv.querySelector('.bi-plus');
            const minusButton = statNumberDiv.querySelector('.bi-dash');
            if (plusButton) plusButton.style.display = 'none';
            if (minusButton) minusButton.style.display = 'none';
        }
    });

    // Update Marketability
    const marketabilityPanel = document.getElementById('marketability');
    if (marketabilityPanel) {
        const driver1 = document.querySelector('.normal-driver.clicked:not(.comparing-driver)');
        const driver2 = document.querySelector('.normal-driver.clicked.comparing-driver');

        if (driver1.dataset.marketability && driver2.dataset.marketability) {
            const marketability1 = driver1.dataset.marketability;
            const marketability2 = driver2.dataset.marketability;

            //remove previous comparison elements if they exist
            const existingComparisonBar = marketabilityPanel.querySelector('.comparison-stat-progress');
            if (existingComparisonBar) existingComparisonBar.parentElement.remove();

            const existingComparisonValue = marketabilityPanel.querySelector('.comparison-stat-value');
            if (existingComparisonValue) existingComparisonValue.remove();

            const barContainer = marketabilityPanel.querySelector('.bar-container');
            barContainer.classList.add('comparing');

            let actualBar = barContainer.querySelector('.one-stat-progress');

            //remove plus/minus buttons
            const plusButton = marketabilityPanel.querySelector('.bi-plus');
            const minusButton = marketabilityPanel.querySelector('.bi-dash');
            if (plusButton) plusButton.style.display = 'none';
            if (minusButton) minusButton.style.display = 'none';

            const comparisonStatBarContainer = document.createElement('div');
            comparisonStatBarContainer.className = 'one-stat-bar comparison-bar';
            const comparisonProgressBar = document.createElement('div');
            comparisonProgressBar.className = 'one-stat-progress comparison-stat-progress';
            comparisonProgressBar.style.width = `${marketability2}%`;
            comparisonProgressBar.style.backgroundColor = color2;
            comparisonStatBarContainer.append(comparisonProgressBar);
            barContainer.appendChild(comparisonStatBarContainer);

            const statNumberDiv = marketabilityPanel.querySelector('.stat-number');
            const comparisonValueInput = document.createElement('input');
            comparisonValueInput.setAttribute('readonly', 'readonly');
            comparisonValueInput.className = 'custom-input-number comparison-stat-value';
            comparisonValueInput.value = marketability2;

            const existingValueInput = statNumberDiv.querySelector('input.custom-input-number:not(.comparison-stat-value)');
            existingValueInput.setAttribute('readonly', 'readonly');
            if (parseInt(marketability2) > parseInt(marketability1)) {
                comparisonValueInput.classList.add(`comparing-tag`, `secondary`);
                existingValueInput.classList.remove("comparing-tag", "primary");
            } else if (parseInt(marketability2) < parseInt(marketability1)) {
                comparisonValueInput.classList.remove("comparing-tag", "secondary");
                existingValueInput.classList.add("comparing-tag", "primary");
            }

            statNumberDiv.appendChild(comparisonValueInput);
        }
    }

    // Update Radar Chart
    const values1 = stats1.slice(0, 9);
    const values2 = stats2.slice(0, 9);

    //update the first dataset with the first driver color
    if (statsRadarChart) {
        updateStatsRadarData(values1, 0, cssVar(`--new-primary`));
    }

    // Update Mentality
    const driver1 = document.querySelector('.normal-driver.clicked:not(.comparing-driver)');
    const driver2 = document.querySelector('.normal-driver.clicked.comparing-driver');

    //add the second dataset with the second driver color
    if (statsRadarChart) {
        let secondaryColor = color2;
        if (statsRadarChart.data.datasets.length < 2) {
            addDatasetToStatsRadarData(values2, secondaryColor, driver2.dataset.name.split(' ').pop());
        } else {
            updateStatsRadarData(values2, 1, secondaryColor, driver2.dataset.name.split(' ').pop());
        }
    }




    for (let i = 0; i < 3; i++) {
        if (driver1.dataset[`mentality${i}`] && driver2.dataset[`mentality${i}`]) {
            const mentality1 = driver1.dataset[`mentality${i}`];
            const mentality2 = driver2.dataset[`mentality${i}`];

            //remove previous comparison bar if exists
            const existingComparisonBar = document.getElementById(`mentality${i}`).parentNode.parentNode.querySelector('.comparison-bar');
            if (existingComparisonBar) existingComparisonBar.remove();

            const mentalityPanel = document.getElementById(`mentality${i}`).parentNode.parentNode;
            const barContainer = mentalityPanel.querySelector('.bar-container');

            // Hide buttons
            const buttons = mentalityPanel.querySelectorAll('.bi-chevron-left, .bi-chevron-right');
            buttons.forEach(btn => btn.style.display = 'none');

            // Create and prepend the second mentality bar
            const comparisonBar = document.createElement('div');
            comparisonBar.className = 'mentality-level-indicator comparison-bar';
            for (let j = 0; j < 5; j++) {
                const level = document.createElement('div');
                level.className = 'mentality-level';
                if (j <= 4 - mentality2) {
                    level.classList.add(mentality_dict[mentality2]);
                }
                comparisonBar.appendChild(level);
            }
            barContainer.prepend(comparisonBar);
        }
    }

    // Redesign Header
    const header = document.querySelector('.upper-section-stats');
    const originalInfo = header.querySelector('.name-and-info');
    const originalOvr = header.querySelector('.special-overall');
    const originalAgeDetails = header.querySelector('#ageDetails');

    // Clone and populate driver 2 info
    let clonedInfo = header.querySelector('.name-and-info.cloned');
    if (!clonedInfo) {
        clonedInfo = originalInfo.cloneNode(true);
        clonedInfo.classList.add('cloned');
        // header.querySelector("#ageDetails").classList.add("d-none");
        header.querySelector("#numberDetails").classList.add("d-none");
        header.querySelector("#availabilityDetails").classList.add("d-none");
        header.appendChild(clonedInfo);
    }
    document.querySelectorAll(".hidable-separator").forEach(separator => {
        separator.classList.add("d-none");
    });
    //put second driver name
    clonedInfo.querySelector("#driverStatsTitle").innerText = `${driver2.dataset.name}`;
    clonedInfo.querySelector("#driverCode").innerText = `${driver2.dataset.driverCode}`;
    clonedInfo.querySelector('.driver-info-driver-flag').src = `https://flagsapi.com/${driver2.dataset.nationality}/flat/64.png`;
    clonedInfo.querySelector('.flag-text').textContent = inverted_countries_abreviations[driver2.dataset.nationality] || driver2.dataset.nationality;
    clonedInfo.querySelector('.driver-info-team-logo').src = logos_disc[driver2.dataset.teamid] || logos_disc[0];
    let teamName = combined_dict[driver2.dataset.teamid] || "Free Agent";
    clonedInfo.querySelector('.team-text').textContent = teamName !== "Visa Cashapp RB" ? teamName : "VCARB";

    // Clone and populate driver 2 overall
    let clonedOvr = header.querySelector('.special-overall.cloned');
    if (!clonedOvr) {
        clonedOvr = originalOvr.cloneNode(true);
        clonedOvr.classList.add('cloned');
        header.insertBefore(clonedOvr, clonedInfo);
        const separator = document.createElement('div');
        separator.className = 'stats-header-separator cloned-separator';
        header.insertBefore(separator, clonedInfo);
    }
    if (clonedOvr) clonedOvr.querySelector(".overall-holder").innerText = calculateOverall(driver2.dataset.stats, "driver");


    let clonedAgeDetails = header.querySelector('#ageDetails.cloned');
    if (originalAgeDetails && !clonedAgeDetails) {
        clonedAgeDetails = originalAgeDetails.cloneNode(true);
        clonedAgeDetails.classList.add('cloned');
        header.insertBefore(clonedAgeDetails, clonedInfo);
        const separator = document.createElement('div');
        separator.className = 'stats-header-separator cloned-separator';
        header.insertBefore(separator, clonedInfo);

        document.querySelectorAll(".shorten-ret").forEach(elem => {
            elem.innerText = "Ret"
        });
    }
    if (clonedAgeDetails) {
        clonedAgeDetails.querySelector('.actual-age').innerText = driver2.dataset.age;
        clonedAgeDetails.querySelector('.actual-retirement').innerText = driver2.dataset.retirement;
    }
}